/* Wuxing Pai Sho */

import { GameType } from "../PaiShoMain";

export class WuxingController {

    /**
     * NOTE: The parameter's documentation was taken from GameControllerInterfaceReadme.md
     * @param {HTMLDivElement} gameContainer This is the div element that your game needs to be put in
     * @param {boolean} isMobile Boolean flag for if running on mobile device
     */
    constructor(gameContainer, isMobile) {}

    /**
     * Returns the GameType id for your game.
     * Add your game to GameType in PaiShoMain.js.
     */
    getGameTypeId() {
        return GameType.WuxingPaiSho.id
    }

    /**
     * Called when rewinding moves.
     */
    resetGameManager() {}

    /**
     * Called when rewinding moves.
     */
    resetNotationBuilder() {}

    /**
     * Returns new game notation object for your game.
     * 
     * @typedef {{
     *  moves: Array<any>
     *  addMove: function(move: any): void
     * }} GameNotation
     * 
     * @returns {GameNotation}
     */
    getNewGameNotation() {}

    /**
     * Called when the game should re-render.
     */
    callActuate() {}

    /**
     * Called when the user's move needs to be reset, from clicking the Undo Move link.
     */
    resetMove() {}

    /**
     * Should return the default string of the html content to put in the Help tab.
     * @returns {string}
     */
    getDefaultHelpMessageText() {}
}