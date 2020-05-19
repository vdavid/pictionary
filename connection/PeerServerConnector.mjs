import {useConfig} from "../app/components/ConfigProvider.mjs";
import {useState, useEffect} from "../web_modules/react.js";
import {useSelector, useDispatch} from "../web_modules/react-redux.js";
import {connectionListenerStatus} from './connection-listener-status.mjs';
import {actionCreators as connectionActionCreators} from "./store.mjs";
import {actionCreators as gameActionCreators} from "../game/store.mjs";

/**
 * @param {int} length
 */
function generateRandomId(length) {
    return Math.random().toString(36).substr(2, length);
}

export default function PeerServerConnector({peerCreatedCallback, debugLevel}) {
    const config = useConfig();
    const defaultIdLength = 2;
    const [peer, setPeer] = useState(null);
    const [idLength, setIdLength] = useState(defaultIdLength);
    let lastActivePeerId = null;
    const dispatch = useDispatch();

    const currentListenerStatus = useSelector(state => state.connection.connectionListenerStatus);

    useEffect(() => {
        if (currentListenerStatus === connectionListenerStatus.shouldConnectToPeerServer && (!peer || peer.disconnected)) {
            if (!peer || peer.destroyed) {
                setIdLength(defaultIdLength);
                setPeer(createPeer(lastActivePeerId));
            } else {
                peer.reconnect();
            }
            dispatch(connectionActionCreators.createUpdateStatusRequest(connectionListenerStatus.connectingToPeerServer));

        } else if (currentListenerStatus === connectionListenerStatus.shouldDisconnectFromPeerServer && !peer.disconnected) {
            peer.disconnect();
            dispatch(connectionActionCreators.createUpdateStatusRequest(connectionListenerStatus.disconnectingFromPeerServer));
        }
    }, [currentListenerStatus, peer]);

    return null;

    /**
     * @param {string|null} peerId
     * @returns {Peer}
     * @private
     */
    function createPeer(peerId = null) {
        dispatch(connectionActionCreators.createUpdateStatusRequest(connectionListenerStatus.connectingToPeerServer));
        peerId = peerId || generateRandomId(idLength);
        const peer = new window.peerjs.Peer(peerId, {
            key: config.peerJs.key,
            host: config.peerJs.hostname,
            port: config.peerJs.port,
            pingInterval: config.peerJs.pingIntervalMs,
            path: config.peerJs.path,
            secure: config.peerJs.isSecure,
            debug: config.peerJs.debugLevel,
        });
        peer.on('open', () => {
            dispatch(gameActionCreators.createUpdateLocalPlayerPeerIdRequest(peerId));
            dispatch(connectionActionCreators.createStartAcceptingConnectionsSuccess(peerId));
            }, null);
        peer.on('disconnected', () => {
            dispatch(connectionActionCreators.createDisconnectFromPeerServerSuccess());
        }, null);
        peer.on('error', handlePeerError, null);
        peerCreatedCallback(peer);
        return peer;
    }

    /**
     * @private
     */
    function handlePeerError(error) {
        if (error.type === 'unavailable-id') {
            peer.destroy();
            setPeer(createPeer());
            setIdLength(x => x + 1);
        } else {
            if (debugLevel >= 1) {
                console.log('Peer error.');
                console.log(error);
            }
        }
    }
};
