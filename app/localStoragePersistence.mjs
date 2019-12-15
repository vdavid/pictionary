/**
 * @param {string} name
 */
export function savePlayerName(name) {
    try {
        localStorage.setItem('pictionary.playerName', name);
    } catch {
        /* Ignore write errors */
    }
}

/**
 * @returns {string|undefined}
 */
export function loadPlayerName() {
    try {
        return localStorage.getItem('pictionary.playerName');
    } catch {
        /* Ignore read errors */
        return undefined;
    }
}