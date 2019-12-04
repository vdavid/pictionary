/**
 * @param {State} state
 */
export function saveState(state) {
    try {
        localStorage.setItem('pictionary.playerName', state.game.localPlayer.name);
    } catch {
        /* Ignore write errors */
    }
}

export function loadPlayerName() {
    try {
        return localStorage.getItem('pictionary.playerName');
    } catch {
        /* Ignore read errors */
        return undefined;
    }
}