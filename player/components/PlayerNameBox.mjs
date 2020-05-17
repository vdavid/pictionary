import React, {useState, useEffect} from "../../web_modules/react.js";
import {useSelector, useDispatch} from "../../web_modules/react-redux.js";
import {Avatar} from './Avatar.mjs';
import {actionCreators as gameActionCreators} from '../../game/store.mjs';
import {savePlayerName, loadPlayerName} from '../../app/localStoragePersistence.mjs';
import RandomNameGenerator from '../../player/RandomNameGenerator.mjs';

export const PlayerNameBox = () => {
    const [randomNameGenerator, setRandomNameGenerator] = useState(null);
    const [playerNameFromLocalStorage, setPlayerNameFromLocalStorage] = useState(undefined);
    const dispatch = useDispatch();

    const playerName = useSelector(state => state.game.localPlayer.name);

    const setPlayerName = name => dispatch(gameActionCreators.createUpdateLocalPlayerNameRequest(name));

    useEffect(() => {
        setRandomNameGenerator(new RandomNameGenerator());
        setPlayerNameFromLocalStorage(loadPlayerName());
    }, []);

    useEffect(() => {
        if (randomNameGenerator) {
            if (playerName === null) {
                setPlayerName(playerNameFromLocalStorage || randomNameGenerator.getRandomName());
            } else {
                savePlayerName(playerName);
            }
        }
    }, [randomNameGenerator, playerName]);

    return React.createElement('div', {className: 'playerNameBox'},
        React.createElement(Avatar, {name: playerName, size: 80}),
        React.createElement('p', {}, 'Set your name:'),
        React.createElement('input', {
            value: playerName || '',
            maxLength: 25,
            autocompletetype: 'nickname',
            onChange: event => setPlayerName(event.target.value),
        }),
        React.createElement('p', {}, 'Then wait until they connect.'),
    );
};