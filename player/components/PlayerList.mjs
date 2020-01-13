import {Player} from './Player.mjs';

const {useSelector} = window.ReactRedux;

export const PlayerList = () => {
    const localPlayer = useSelector(state => state.game.localPlayer);
    const remotePlayers = useSelector(state => state.game.remotePlayers);
    const hostPeerId = useSelector(state => state.connection.hostPeerId);
    
    return React.createElement('div', {className: 'playerList'},
        React.createElement('ul', {},
            React.createElement(Player, {
                name: localPlayer.name,
                score: localPlayer.score,
                peerId: localPlayer.peerId,
                isHost: (hostPeerId === localPlayer.peerId),
                isLocal: true,
            }),
            remotePlayers.map((player, index) => React.createElement(Player, {
                key: index,
                name: player.name,
                score: player.score,
                peerId: player.peerId,
                isHost: (hostPeerId === player.peerId),
            })),
        ),
    );
};
