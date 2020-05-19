import React, {useState, useEffect, useRef, useCallback} from "../web_modules/react.js";
import {useSelector, useDispatch} from "../web_modules/react-redux.js";

import {actionCreators as connectionActionCreators} from './store.mjs';
import {actionCreators as gameActionCreators} from '../game/store.mjs';
import {actionCreators as chatActionCreators} from '../chat/store.mjs';

import ConnectionPool from './ConnectionPool.mjs';
import PeerServerConnector from './PeerServerConnector.mjs';
import ConnectionDebugLogger from './ConnectionDebugLogger.mjs';

import {connectionListenerStatus} from './connection-listener-status.mjs';
import {messageTypes} from './message-types.mjs';
import {trialResult} from '../game/trial-result.mjs';
import {getRandomPhrase} from '../data/phrases.mjs';

/**
 * Documentation: https://docs.peerjs.com/
 */

/**
 * @typedef {Object} GameStateToSendToNewPeer
 * @property {boolean} isGameStarted
 * @property {string|null} gameStartedDateTimeString E.g. '2019-12-08T21:49:10.161Z'
 * @property {string|null} gameEndedDateTimeString E.g. '2019-12-08T21:49:10.161Z'
 * @property {string[]} peerIds
 * @property {RoundLog[]} rounds
 */

/**
 * @typedef {Object} PeerConnectorOptions
 * @property {function(error: {message: string, stack: string}, severity: int): void} [onError] Called when an error happens in the underlying socket
 *        and PeerConnections. (Note: Errors on the peer are almost always fatal and will destroy the peer.)
 *        More info: https://docs.peerjs.com/#peeron-error
 * @property {int} [debugLevel] 0 Prints no logs. 1 Prints only errors. 2 Prints errors and warnings. 3 Prints infos. 4 Verbose logging.
 *        Default is 0.
 */

export default function PeerConnector({debugLevel}) {
    const connectionPoolRef = useRef(new ConnectionPool());
    const debugLoggerRef = useRef(new ConnectionDebugLogger(debugLevel));

    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};

    const isGameStarted = useSelector(state => state.game.isGameStarted);
    const gameStartedDateTimeString = useSelector(state => state.game.gameStartedDateTimeString);
    const gameEndedDateTimeString = useSelector(state => state.game.gameEndedDateTimeString);
    const localPeerId = useSelector(state => state.connection.localPeerId);
    const localPeerIdRef = useRef(null);
    localPeerIdRef.current = localPeerId;
    const hostPeerId = useSelector(state => state.connection.hostPeerId);
    const hostPeerIdRef = useRef(null);
    hostPeerIdRef.current = hostPeerId;
    const drawerPeerId = latestRound.drawer ? latestRound.drawer.peerId : undefined;
    const currentConnectionListenerStatus = useSelector(state => state.connection.connectionListenerStatus);
    const connections = useSelector(state => state.connection.connections);
    const localPlayer = useSelector(state => state.game.localPlayer);
    const localPlayerRef = useRef(null);
    localPlayerRef.current = localPlayer;
    const remotePlayers = useSelector(state => state.game.remotePlayers);
    const chatMessages = useSelector(state => state.chat.messages);
    const rounds = useSelector(state => state.game.rounds);
    const drawnLines = latestTrial.lines || [];
    const connectToPeerFunctionRef = useRef(undefined);
    const previousLatestTrialRef = useRef(undefined);
    const previousChatMessagesRef = useRef([]);
    const previousDrawnLinesRef = useRef([]);
    const previousRoundsRef = useRef([]);
    const previousIsGameStartedRef = useRef(false);

    const dispatch = useDispatch();

    /**
     * @param {string} remotePeerId
     * @param {boolean} isIncoming
     * @param {boolean} isThisTheConnectionToTheHost
     */
    function addConnection(remotePeerId, isIncoming, isThisTheConnectionToTheHost) {
        dispatch(connectionActionCreators.createAddNewConnectionRequest(remotePeerId, isIncoming, isThisTheConnectionToTheHost));
    }

    function setConnectionAsConfirmed(remotePeerId) {
        dispatch(connectionActionCreators.createSetConnectionAsConfirmedRequest(remotePeerId));
    }

    function setConnectionIntroSent(remotePeerId) {
        dispatch(connectionActionCreators.createSetConnectionIntroSentRequest(remotePeerId));
    }

    function setMessageSent() {
        dispatch(chatActionCreators.createSendMessageSuccess());
    }

    function removeConnection(remotePeerId) {
        dispatch(connectionActionCreators.createRemoveConnectionRequest(remotePeerId));
        dispatch(gameActionCreators.createRemoveRemotePlayerRequest(remotePeerId));
    }

    function handleStartGameSignalReceived(gameStartedDateTimeString) {
        dispatch(gameActionCreators.createStartGameRequest(gameStartedDateTimeString));
    }

    function handleStartRoundSignalReceived(roundStartingDateTimeString, nextDrawerPeerId, phrase) {
        dispatch(gameActionCreators.createStartRoundRequest(roundStartingDateTimeString, nextDrawerPeerId, phrase));
    }

    function handleEndGameSignalReceived(gameEndedDateTimeString) {
        dispatch(gameActionCreators.createEndGameRequest(gameEndedDateTimeString));
    }

    function handleRoundSolvedSignalReceived(drawerPeerId, solverPeerId, solverPeerName, localPeerId, solutionDateTimeString, phrase) {
        dispatch(gameActionCreators.createMarkRoundEndedRequest(phrase, solverPeerId, solutionDateTimeString));
        dispatch(chatActionCreators.createSendRoundEndedRequest(drawerPeerId, solverPeerId, solverPeerName, localPeerId, phrase));
    }

    function handleClearCanvasCommandReceived() {
        dispatch(gameActionCreators.createClearRequest([]));
        dispatch(chatActionCreators.createNoteCanvasWasClearedRequest(false));
    }

    function handleNewDrawnLinesReceived(newLines) {
        dispatch(gameActionCreators.createSaveNewLinesRequest(newLines));
    }

    function handleChatMessageReceived(remotePeerId, messageText, isACorrectGuess) {
        dispatch(chatActionCreators.createAddReceivedMessageRequest(remotePeerId, messageText));
        dispatch(gameActionCreators.createAddNewGuessRequest({
            guesserPeerId: remotePeerId,
            messageText,
            isCorrect: isACorrectGuess
        }));
    }

    function handleGameStateReceived(gameState) {
        dispatch(gameActionCreators.createSetGameStateRequest(gameState));
    }

    function handlePlayerDataReceived(remotePlayer) {
        dispatch(connectionActionCreators.createSetConnectionIntroReceivedRequest(remotePlayer.peerId));
        dispatch(gameActionCreators.createAddOrUpdateRemotePlayerRequest(remotePlayer));
    }

    /**
     * @param {string} status
     * @param {string} localPeerId
     */
    function setListenerStatus(status, localPeerId) {
        if (status === connectionListenerStatus.notConnectedToPeerServer) {
            dispatch(connectionActionCreators.createDisconnectFromPeerServerSuccess());

        } else if (status === connectionListenerStatus.connectingToPeerServer) {
            dispatch(connectionActionCreators.createUpdateStatusRequest(status));

        } else if (status === connectionListenerStatus.listeningForConnections) {
            dispatch(gameActionCreators.createUpdateLocalPlayerPeerIdRequest(localPeerId));
            dispatch(connectionActionCreators.createStartAcceptingConnectionsSuccess(localPeerId));

        } else if (status === connectionListenerStatus.connectingToHost) {
            dispatch(connectionActionCreators.createUpdateStatusRequest(status));

        } else if (status === connectionListenerStatus.disconnectingFromPeerServer) {
            dispatch(connectionActionCreators.createUpdateStatusRequest(status));
        }
    }

    // noinspection JSUnusedGlobalSymbols
    useEffect(() => {
        /* Connect to host if requested so */
        if (currentConnectionListenerStatus === connectionListenerStatus.shouldConnectToHost) {
            if (hostPeerIdRef.current !== localPeerIdRef.current) {
                console.log('Connecting to ' + hostPeerIdRef.current);
                addConnection(hostPeerIdRef.current, false, true);
                const newConnection = connectToPeerFunctionRef.current(hostPeerIdRef.current, {metadata: {hostPeerId: hostPeerIdRef.current/*, label: undefined, serialization: 'json', reliable: true*/}});
                _setUpConnectionEventHandlers(newConnection);
                setListenerStatus(connectionListenerStatus.connectingToHost, localPeerId);
            } else {
                setListenerStatus(connectionListenerStatus.listeningForConnections, localPeerId);
                console.log('Can\'t connect to self.');
            }
        }

        /* Send "round solved" message */
        if ((drawerPeerId === localPeerId)
            && (!previousLatestTrialRef.current.endedDateTimeString && latestTrial.endedDateTimeString)
            && ([trialResult.solved, trialResult.failed].includes(latestTrial.trialResult))) {
            _sendToAllPeers(messageTypes.roundSolved, {
                phrase: latestRound.phrase,
                solverPeerId: latestRound.solver.peerId,
                solutionDateTimeString: latestTrial.endedDateTimeString
            });
        }

        /* Send out new chat messages */
        if (chatMessages.length > previousChatMessagesRef.current.length) {
            /** @type {ChatMessage[]} messagesToParse */
            const messagesToParse = chatMessages.slice(previousChatMessagesRef.current.length);
            messagesToParse.forEach(message => {
                if (message.senderPeerId === localPeerId) {
                    /* Don't allow the drawer to send the solution */
                    if ((localPeerId !== drawerPeerId) || !_isMessageACorrectGuess(message.text)) {
                        _sendToAllPeers(messageTypes.message, message.text);
                    }
                }
            });
            setMessageSent();
        }

        /* Send new lines and "clear canvas" commands if this is the drawer */
        if (drawerPeerId === localPeerIdRef.current) {
            if (drawnLines.length > previousDrawnLinesRef.current.length) {
                _sendToAllPeers(messageTypes.newLines, drawnLines.slice(previousDrawnLinesRef.current.length));
            } else if (drawnLines.length < previousDrawnLinesRef.current.length) {
                _sendToAllPeers(messageTypes.clearCanvasCommand, null);
            }
        }

        /* Send "start game" signal to everyone if this is the host */
        if ((localPeerIdRef.current === hostPeerIdRef.current) && (!previousIsGameStartedRef.current && isGameStarted)) {
            _sendToAllPeers(messageTypes.startGameSignal, gameStartedDateTimeString);
        }

        /* Send "start round" signal to everyone if this is the host */
        if ((localPeerIdRef.current === hostPeerIdRef.current) && (rounds.length > previousRoundsRef.current.length)) {
            _sendToAllPeers(messageTypes.startRoundSignal, {
                roundStartingDateTimeString: latestRound.trials[0].startingDateTimeString,
                drawerPeerId: latestRound.drawer.peerId
            });
        }

        /* Send "end game" signal to everyone if this is the host */
        if ((localPeerIdRef.current === hostPeerIdRef.current) && (previousIsGameStartedRef.current && !isGameStarted)) {
            _sendToAllPeers(messageTypes.endGameSignal, gameEndedDateTimeString);
        }
        previousLatestTrialRef.current = latestTrial;
        previousChatMessagesRef.current = chatMessages;
        previousDrawnLinesRef.current = drawnLines;
        previousRoundsRef.current = rounds;
        previousIsGameStartedRef.current = isGameStarted;
    }, [latestTrial, chatMessages, drawnLines, rounds, isGameStarted]);

    function onConnection(connection) {
        if ((connections.length === 0 && (connection.metadata.hostPeerId === localPeerIdRef.current))) {
            /* Receiving connection as a host --> become the host */
            console.log('Connection received from ' + connection.peer + ', we became the host.');
            addConnection(connection.peer, true, true);
            _setUpConnectionEventHandlers(connection);
        } else if (connection.metadata.hostPeerId === hostPeerIdRef.current) {
            /* Receiving connection from another client */
            console.log('Connection received from ' + connection.peer + ', another client.');
            addConnection(connection.peer, true, false);
            _setUpConnectionEventHandlers(connection);
        } else {
            console.log('Invalid connection received from ' + connection.peer + '. (localPeerId: ' + localPeerIdRef.current + ', hostPeerId: ' + hostPeerIdRef.current + ', connections: ' + connections.length + ')');
            console.log(connection);
            console.log(localPeerIdRef.current);
            connection.on('open', () => connection.close(), null);
        }
    }

    // noinspection JSUnusedGlobalSymbols – peerCreatedCallback is actually used in PeerServerConnector.
    return React.createElement(PeerServerConnector, {setListenerStatus, peerCreatedCallback});

    function peerCreatedCallback(peer) {
        /* Handle incoming connections */
        peer.on('connection', onConnection, null);

        connectToPeerFunctionRef.current = peer.connect.bind(peer);
    }

    /**
     * @param {DataConnection} connection
     */
    function _setUpConnectionEventHandlers(connection) {
        // noinspection JSUnresolvedFunction
        connection.on('open', () => {
            console.log('Opened connection to ' + connection.peer);
            setConnectionAsConfirmed(connection.peer);
            connectionPoolRef.current.add(connection, hostPeerIdRef.current === connection.peer);
            _sendLocalPlayerDataToClient(connection.peer);
            setConnectionIntroSent(connection.peer);
            /* Send game state if this is the host */
            if (localPeerIdRef.current === hostPeerIdRef.current) {
                _sendGameStateToClient(connection.peer);
            }
        }, null);
        // noinspection JSUnresolvedFunction
        connection.on('data', (data) => _handleConnectionDataReceived(connection.peer, data), null);
        // noinspection JSUnresolvedFunction
        connection.on('close', () => {
            console.log('Connection closed with ' + connection.peer);
            connectionPoolRef.current.remove(connection);
            removeConnection(connection.peer);
        }, null);
        // noinspection JSUnresolvedFunction
        connection.on('error', (error) => {
            if (debugLevel >= 2) {
                console.log(error);
            }
        }, null);
    }

    /**
     * @param {string} recipientPeerId
     */
    function _sendGameStateToClient(recipientPeerId) {
        const peerIds = connectionPoolRef.current.getAllConnectedPeerIds();
        peerIds.splice(peerIds.indexOf(recipientPeerId), 1);

        /** @type {GameStateToSendToNewPeer} */
        const gameState = {
            isGameStarted: isGameStarted,
            gameStartedDateTimeString: gameStartedDateTimeString,
            gameEndedDateTimeString: gameEndedDateTimeString,
            peerIds,
            rounds: rounds,
        };

        debugLoggerRef.current.logOutgoingMessage(recipientPeerId, gameState);

        connectionPoolRef.current.getByPeerId(recipientPeerId).send({type: messageTypes.gameState, payload: gameState});
    }

    function _sendLocalPlayerDataToClient(recipientPeerId) {
        debugLoggerRef.current.logOutgoingMessage(recipientPeerId, messageTypes.localPlayerData, localPlayerRef.current);
        connectionPoolRef.current.getByPeerId(recipientPeerId).send({
            type: messageTypes.localPlayerData,
            payload: localPlayerRef.current
        });
    }

    /**
     * @param {string} remotePeerId
     * @param {{type: string, payload: *}} data
     * @private
     */
    function _handleConnectionDataReceived(remotePeerId, {type, payload}) {
        console.log('Data received from ' + remotePeerId + ': ' + type);
        debugLoggerRef.current.logIncomingMessage(remotePeerId, type, payload);

        if (type === messageTypes.startGameSignal) {
            handleStartGameSignalReceived(payload);

        } else if (type === messageTypes.startRoundSignal) {
            const phrase = (payload.drawerPeerId === localPeerIdRef.current) ? getRandomPhrase().trim() : null;
            handleStartRoundSignalReceived(payload.roundStartingDateTimeString, payload.drawerPeerId, phrase);

        } else if (type === messageTypes.endGameSignal) {
            handleEndGameSignalReceived(payload);

        } else {
            if (type === messageTypes.roundSolved) {
                const {phrase, solverPeerId, solutionDateTimeString} = payload;
                const solverPlayer = solverPeerId && [localPlayerRef.current, ...remotePlayers].find(player => player.peerId === solverPeerId);
                if (solverPeerId && !solverPlayer) {
                    console.log('Problem. Not found solver "' + solverPeerId + '".');
                }
                handleRoundSolvedSignalReceived(remotePeerId, solverPeerId, solverPeerId && solverPlayer.name, localPeerIdRef.current, solutionDateTimeString, phrase);

            } else if (type === messageTypes.clearCanvasCommand) {
                if (latestTrial.lines.length > 0) {
                    handleClearCanvasCommandReceived();
                }

            } else if (type === messageTypes.newLines) {
                handleNewDrawnLinesReceived(payload);

            } else if (type === messageTypes.message) {
                handleChatMessageReceived(remotePeerId, payload, (drawerPeerId === localPeerIdRef.current) && _isMessageACorrectGuess(payload, latestRound.phrase));

            } else if (type === messageTypes.gameState) {
                /** @type {GameStateToSendToNewPeer} */
                const gameState = payload;
                handleGameStateReceived(gameState);
                /* Connect to other clients as client (_connectToOtherClientsAsClient) */
                console.log('Connecting to other clients: ' + gameState.peerIds.join(', '));
                gameState.peerIds.map(peerId => {
                    addConnection(peerId, false, false);
                    const newConnection = connectToPeerFunctionRef.current(peerId, {metadata: {hostPeerId: hostPeerIdRef.current/*, label: undefined, serialization: 'json', reliable: true*/}});
                    _setUpConnectionEventHandlers(newConnection);
                });

            } else if (type === messageTypes.localPlayerData) {
                handlePlayerDataReceived(payload);

            } else if (debugLevel >= 2) {
                console.warn('Invalid data received from peer. Type: ' + type);
                console.warn(payload);
            }
        }
    }

    function _isMessageACorrectGuess(message) {
        return (message.trim().toLowerCase().indexOf(latestRound.phrase.toLowerCase()) > -1);
    }

    /**
     * @param {string} type
     * @param {*} payload
     * @private
     */
    function _sendToAllPeers(type, payload) {
        debugLoggerRef.current.logOutgoingMessage('all', type, payload);

        // noinspection JSUnresolvedFunction
        connectionPoolRef.current.getAllConnections().forEach(connection => connection.send({type, payload}));
    }
}
