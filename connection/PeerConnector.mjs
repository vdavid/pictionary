const {connect} = window.ReactRedux;

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

class PeerConnector extends React.Component {
    constructor(props) {
        super(props);

        this._connectionPool = new ConnectionPool();
        this._debugLogger = new ConnectionDebugLogger(this.props.debugLevel);
    }

    render() {
        return React.createElement(PeerServerConnector, {
            setListenerStatus: this.props.setListenerStatus,
            peerCreatedCallback: peer => {
                /* Handle incoming connections */
                peer.on('connection', connection => {
                    console.log('Connection received from ' + connection.peer);
                    if ((this.props.connections.length === 0 && (connection.metadata.hostPeerId === this.props.localPeerId))) {
                        /* Receiving connection as a host --> become the host */
                        this.props.addConnection(connection.peer, true, true);
                        this._setUpConnectionEventHandlers(connection);
                    } else if (connection.metadata.hostPeerId === this.props.hostPeerId) {
                        /* Receiving connection from another client */
                        this.props.addConnection(connection.peer, true, false);
                        this._setUpConnectionEventHandlers(connection);
                    } else {
                        connection.on('open', () => connection.close(), null);
                    }
                }, null);
                this._connectToPeer = peer.connect.bind(peer);
            }
        });
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate(previousProps) {
        /* Connect to host if requested so */
        if (this.props.connectionListenerStatus === connectionListenerStatus.shouldConnectToHost) {
            if (this.props.hostPeerId !== this.props.localPeerId) {
                console.log('Connecting to ' + this.props.hostPeerId);
                this.props.addConnection(this.props.hostPeerId, false, true);
                const newConnection = this._connectToPeer(this.props.hostPeerId, {metadata: {hostPeerId: this.props.hostPeerId/*, label: undefined, serialization: 'json', reliable: true*/}});
                this._setUpConnectionEventHandlers(newConnection);
                this.props.setListenerStatus(connectionListenerStatus.connectingToHost, this.props.localPeerId);
            } else {
                this.props.setListenerStatus(connectionListenerStatus.listeningForConnections, this.props.localPeerId);
                console.log('Can\'t connect to self.');
            }
        }

        /* Send "round solved" message */
        if ((this.props.drawerPeerId === this.props.localPeerId)
            && (!previousProps.latestTrial.endedDateTimeString && this.props.latestTrial.endedDateTimeString)
            && ([trialResult.solved, trialResult.failed].includes(this.props.latestTrial.trialResult))) {
            this._sendToAllPeers(messageTypes.roundSolved, {
                phrase: this.props.latestRound.phrase,
                solverPeerId: this.props.latestRound.solver.peerId,
                solutionDateTimeString: this.props.latestTrial.endedDateTimeString
            });
        }

        /* Send out new chat messages */
        if (this.props.chatMessages.length > previousProps.chatMessages.length) {
            /** @type {ChatMessage[]} messagesToParse */
            const messagesToParse = this.props.chatMessages.slice(previousProps.chatMessages.length);
            messagesToParse.forEach(message => {
                if (message.senderPeerId === this.props.localPeerId) {
                    /* Don't allow the drawer to send the solution */
                    if ((this.props.localPeerId !== this.props.drawerPeerId) || !this._isMessageACorrectGuess(message.text)) {
                        this._sendToAllPeers(messageTypes.message, message.text);
                    }
                }
            });
            this.props.setMessageSent();
        }

        /* Send new lines and "clear canvas" commands if this is the drawer */
        if (this.props.drawerPeerId === this.props.localPeerId) {
            if (this.props.drawnLines.length > previousProps.drawnLines.length) {
                this._sendToAllPeers(messageTypes.newLines, this.props.drawnLines.slice(previousProps.drawnLines.length));
            } else if (this.props.drawnLines.length < previousProps.drawnLines.length) {
                this._sendToAllPeers(messageTypes.clearCanvasCommand, null);
            }
        }

        /* Send "start game" signal to everyone if this is the host */
        if ((this.props.localPeerId === this.props.hostPeerId) && (!previousProps.isGameStarted && this.props.isGameStarted)) {
            this._sendToAllPeers(messageTypes.startGameSignal, this.props.gameStartedDateTimeString);
        }

        /* Send "start round" signal to everyone if this is the host */
        if ((this.props.localPeerId === this.props.hostPeerId) && (this.props.rounds.length > previousProps.rounds.length)) {
            this._sendToAllPeers(messageTypes.startRoundSignal, {roundStartingDateTimeString: this.props.latestRound.trials[0].startingDateTimeString, drawerPeerId: this.props.latestRound.drawer.peerId});
        }

        /* Send "end game" signal to everyone if this is the host */
        if ((this.props.localPeerId === this.props.hostPeerId) && (previousProps.isGameStarted && !this.props.isGameStarted)) {
            this._sendToAllPeers(messageTypes.endGameSignal, this.props.gameEndedDateTimeString);
        }
    }

    /**
     * @param {DataConnection} connection
     */
    _setUpConnectionEventHandlers(connection) {
        // noinspection JSUnresolvedFunction
        connection.on('open', () => {
            this.props.setConnectionAsConfirmed(connection.peer);
            this._connectionPool.add(connection, this.props.hostPeerId === connection.peer);
            this._sendLocalPlayerDataToClient(connection.peer);
            this.props.setConnectionIntroSent(connection.peer);
            /* Send game state if this is the host */
            if (this.props.localPeerId === this.props.hostPeerId) {
                this._sendGameStateToClient(connection.peer);
            }
        }, null);
        // noinspection JSUnresolvedFunction
        connection.on('data', (data) => this._handleConnectionDataReceived(connection.peer, data), null);
        // noinspection JSUnresolvedFunction
        connection.on('close', () => {
            this._connectionPool.remove(connection);
            this.props.removeConnection(connection.peer);
        }, null);
        // noinspection JSUnresolvedFunction
        connection.on('error', (error) => {
            if (this._debugLevel >= 2) {
                console.log(error);
            }
        }, null);
    }

    /**
     * @param {string} recipientPeerId
     */
    _sendGameStateToClient(recipientPeerId) {
        const peerIds = this._connectionPool.getAllConnectedPeerIds();
        peerIds.splice(peerIds.indexOf(recipientPeerId), 1);

        /** @type {GameStateToSendToNewPeer} */
        const gameState = {
            isGameStarted: this.props.isGameStarted,
            gameStartedDateTimeString: this.props.gameStartedDateTimeString,
            gameEndedDateTimeString: this.props.gameEndedDateTimeString,
            peerIds,
            rounds: this.props.rounds,
        };

        this._debugLogger.logOutgoingMessage(recipientPeerId, gameState);

        this._connectionPool.getByPeerId(recipientPeerId).send({type: messageTypes.gameState, payload: gameState});
    }

    _sendLocalPlayerDataToClient(recipientPeerId) {
        this._debugLogger.logOutgoingMessage(recipientPeerId, messageTypes.localPlayerData, this.props.localPlayer);
        this._connectionPool.getByPeerId(recipientPeerId).send({type: messageTypes.localPlayerData, payload: this.props.localPlayer});
    }

    /**
     * @param {string} remotePeerId
     * @param {{type: string, payload: *}} data
     * @private
     */
    _handleConnectionDataReceived(remotePeerId, {type, payload}) {
        this._debugLogger.logIncomingMessage(remotePeerId, type, payload);

        if (type === messageTypes.startGameSignal) {
            this.props.handleStartGameSignalReceived(payload);

        } else if (type === messageTypes.startRoundSignal) {
            const phrase = (payload.drawerPeerId === this.props.localPeerId) ? getRandomPhrase().trim() : null;
            this.props.handleStartRoundSignalReceived(payload.roundStartingDateTimeString, payload.drawerPeerId, phrase);

        } else if (type === messageTypes.endGameSignal) {
            this.props.handleEndGameSignalReceived(payload);

        } else {
            if (type === messageTypes.roundSolved) {
                const {phrase, solverPeerId, solutionDateTimeString} = payload;
                const solverPlayer = solverPeerId && [this.props.localPlayer, ...this.props.remotePlayers].find(player => player.peerId === solverPeerId);
                if (solverPeerId && !solverPlayer) {
                    console.log('Problem. Not found solver "' + solverPeerId + '".');
                }
                this.props.handleRoundSolvedSignalReceived(remotePeerId, solverPeerId, solverPeerId && solverPlayer.name, this.props.localPeerId, solutionDateTimeString, phrase);

            } else if (type === messageTypes.clearCanvasCommand) {
                if (this.props.latestTrial.lines.length > 0) {
                    this.props.handleClearCanvasCommandReceived();
                }

            } else if (type === messageTypes.newLines) {
                this.props.handleNewDrawnLinesReceived(payload);

            } else if (type === messageTypes.message) {
                this.props.handleChatMessageReceived(remotePeerId, payload, (this.props.drawerPeerId === this.props.localPeerId) && this._isMessageACorrectGuess(payload, this.props.latestRound.phrase));

            } else if (type === messageTypes.gameState) {
                /** @type {GameStateToSendToNewPeer} */
                const gameState = payload;
                this.props.handleGameStateReceived(gameState);
                /* Connect to other clients as client (_connectToOtherClientsAsClient) */
                console.log('Connecting to other clients: ' + gameState.peerIds.join(', '));
                gameState.peerIds.map(peerId => {
                    this.props.addConnection(peerId, false, false);
                    const newConnection = this._connectToPeer(peerId, {metadata: {hostPeerId: this.props.hostPeerId/*, label: undefined, serialization: 'json', reliable: true*/}});
                    this._setUpConnectionEventHandlers(newConnection);
                });

            } else if (type === messageTypes.localPlayerData) {
                this.props.handlePlayerDataReceived(payload);

            } else if (this._debugLevel >= 2) {
                console.warn('Invalid data received from peer. Type: ' + type);
                console.warn(payload);
            }
        }
    }

    _isMessageACorrectGuess(message) {
        return (message.trim().toLowerCase().indexOf(this.props.latestRound.phrase.toLowerCase()) > -1);
    }

    /**
     * @param {string} type
     * @param {*} payload
     * @private
     */
    _sendToAllPeers(type, payload) {
        this._debugLogger.logOutgoingMessage('all', type, payload);

        // noinspection JSUnresolvedFunction
        this._connectionPool.getAllConnections().forEach(connection => connection.send({type, payload}));
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    const latestRound = (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []};
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};

    return {
        isGameStarted: state.game.isGameStarted,
        gameStartedDateTimeString: state.game.gameStartedDateTimeString,
        gameEndedDateTimeString: state.game.gameEndedDateTimeString,
        localPeerId: state.connection.localPeerId,
        hostPeerId: state.connection.hostPeerId,
        drawerPeerId: latestRound.drawer ? latestRound.drawer.peerId : undefined,
        connectionListenerStatus: state.connection.connectionListenerStatus,
        connections: state.connection.connections,
        localPlayer: state.game.localPlayer,
        remotePlayers: state.game.remotePlayers,
        chatMessages: state.chat.messages,
        rounds: state.game.rounds,
        drawnLines: latestTrial.lines || [],
        latestRound,
        latestTrial,
        debugLevel: state.app.debugLevel,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        /**
         * @param {string} remotePeerId
         * @param {boolean} isIncoming
         * @param {boolean} isThisTheConnectionToTheHost
         */
        addConnection(remotePeerId, isIncoming, isThisTheConnectionToTheHost) {
            dispatch(connectionActionCreators.createAddNewConnectionRequest(remotePeerId, isIncoming, isThisTheConnectionToTheHost));
        },
        setConnectionAsConfirmed(remotePeerId) {
            dispatch(connectionActionCreators.createSetConnectionAsConfirmedRequest(remotePeerId));
        },
        setConnectionIntroSent(remotePeerId) {
            dispatch(connectionActionCreators.createSetConnectionIntroSentRequest(remotePeerId));
        },
        setMessageSent() {
            dispatch(chatActionCreators.createSendMessageSuccess());
        },
        removeConnection(remotePeerId) {
            dispatch(connectionActionCreators.createRemoveConnectionRequest(remotePeerId));
            dispatch(gameActionCreators.createRemoveRemotePlayerRequest(remotePeerId));
        },
        handleStartGameSignalReceived(gameStartedDateTimeString) {
            dispatch(gameActionCreators.createStartGameRequest(gameStartedDateTimeString));
        },
        handleStartRoundSignalReceived(roundStartingDateTimeString, nextDrawerPeerId, phrase) {
            dispatch(gameActionCreators.createStartRoundRequest(roundStartingDateTimeString, nextDrawerPeerId, phrase));
        },
        handleEndGameSignalReceived(gameEndedDateTimeString) {
            dispatch(gameActionCreators.createEndGameRequest(gameEndedDateTimeString));
        },
        handleRoundSolvedSignalReceived(drawerPeerId, solverPeerId, solverPeerName, localPeerId, solutionDateTimeString, phrase) {
            dispatch(gameActionCreators.createMarkRoundEndedRequest(phrase, solverPeerId, solutionDateTimeString));
            dispatch(chatActionCreators.createSendRoundEndedRequest(drawerPeerId, solverPeerId, solverPeerName, localPeerId, phrase));
        },
        handleClearCanvasCommandReceived() {
            dispatch(gameActionCreators.createClearRequest([]));
            dispatch(chatActionCreators.createNoteCanvasWasClearedRequest(false));
        },
        handleNewDrawnLinesReceived(newLines) {
            dispatch(gameActionCreators.createSaveNewLinesRequest(newLines));
        },
        handleChatMessageReceived(remotePeerId, messageText, isACorrectGuess) {
            dispatch(chatActionCreators.createAddReceivedMessageRequest(remotePeerId, messageText));
            dispatch(gameActionCreators.createAddNewGuessRequest({guesserPeerId: remotePeerId, messageText, isCorrect: isACorrectGuess}));
        },
        handleGameStateReceived(gameState) {
            dispatch(gameActionCreators.createSetGameStateRequest(gameState));
        },
        handlePlayerDataReceived(remotePlayer) {
            dispatch(connectionActionCreators.createSetConnectionIntroReceivedRequest(remotePlayer.peerId));
            dispatch(gameActionCreators.createAddOrUpdateRemotePlayerRequest(remotePlayer));
        },
        /**
         * @param {string} status
         * @param {string} localPeerId
         */
        setListenerStatus(status, localPeerId) {
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
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PeerConnector);