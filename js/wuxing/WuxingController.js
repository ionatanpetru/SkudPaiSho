/* Wuxing Pai Sho */

import { GUEST, HOST } from "../CommonNotationObjects.js";
import { BRAND_NEW, currentMoveIndex, gameId, GameType, getGameOptionsMessageHtml, isAnimationsOn, myTurn, onlinePlayEnabled, rerunAll, userIsLoggedIn } from "../PaiShoMain";
import { WuxingActuator } from "./WuxingActuator.js";
import { WuxingGameManager } from "./WuxingGameManager.js";
import { WuxingGameNotation, WuxingNotationBuilder } from "./WuxingNotation.js";
import { WU_EARTH, WU_EMPTY, WU_FIRE, WU_METAL, WU_WATER, WU_WOOD, WuxingTile } from "./WuxingTile.js";

export var WuxingPreferences = {
    tileDesignKey: "TileDesigns",
    tileDesignTypeValues: {
        original: "Original"
    }
}

export class WuxingController {

    /** @type {WuxingActuator} */
    actuator

    /** @type {WuxingGameManager} */
    theGame

    /** @type {WuxingNotationBuilder} */
    notationBuilder

    /** @type {WuxingGameNotation} */
    gameNotation

    isPaiShoGame = true

    /**
     * NOTE: The parameter's documentation was taken from GameControllerInterfaceReadme.md
     * @param {HTMLDivElement} gameContainer This is the div element that your game needs to be put in
     * @param {boolean} isMobile Boolean flag for if running on mobile device
     */
    constructor(gameContainer, isMobile) {
        this.actuator = new WuxingActuator(gameContainer, isMobile, isAnimationsOn())

        this.resetGameManager()
        this.resetNotationBuilder()
        this.resetGameNotation()

        this.hostAccentTiles = []
        this.guestAccentTiles = []
    }

    /**
     * Returns the GameType id for your game.
     * Add your game to GameType in PaiShoMain.js.
     */
    getGameTypeId() {
        return GameType.WuxingPaiSho.id
    }

    completeSetup() {

        rerunAll()
        this.callActuate()
    }

    /**
     * Called when rewinding moves.
     */
    resetGameManager() {
        this.theGame = new WuxingGameManager(this.actuator)
    }

    /**
     * Called when rewinding moves.
     */
    resetNotationBuilder() {
        this.notationBuilder = new WuxingNotationBuilder()
    }

    resetGameNotation() {
        this.gameNotation = this.getNewGameNotation()
    }

    getNewGameNotation() {
        return new WuxingGameNotation()
    }

    /**
     * Called when the game should re-render.
     */
    callActuate() {
        this.theGame.actuate()
    }

    /**
     * Called when the user's move needs to be reset, from clicking the Undo Move link.
     */
    resetMove() {
        if (this.notationBuilder.status === BRAND_NEW) {
            this.gameNotation.removeLastMove()
        }

        rerunAll()
    }

    cleanup() {}

    isSolitaire() {
        return false
    }

    getCurrentPlayer() {
        if (currentMoveIndex % 2 == 0) return GUEST
        return HOST
    }

    /* DISPLAY METHODS */

    /**
     * Should return the default string of the html content to put in the Help tab.
     * @returns {string}
     */
    getDefaultHelpMessageText() {
        return "<h4>Wuxing Pai Sho</h4><p></p><p>The objective of Wuxing Pai Sho is to capture one of each of your opponent's tiles using your own tiles.</p>"
    }

    /**
     * Returns the message found above the players' tileset. Included here are game options, draw offers, etc.
     * @returns {string}
     */
    getAdditionalMessage() {
        let msg = ""

        if (this.gameNotation.moves.length === 0) {
            if (onlinePlayEnabled && gameId < 0 && userIsLoggedIn()) {
                msg += "Click <em>Join Game</em> above to join another player's game. Or, you can start a game that other players can join by making a move. <br />"
            }
            else {
                msg += "Sign in to enable online gameplay. Or, start playing a local game by making a move."
            }

            msg += getGameOptionsMessageHtml(GameType.WuxingPaiSho.gameOptions)
        }

        return msg
    }

    /**
     * Taken from VagabondController.js
     * @param {HTMLDivElement} tileDiv 
     * @returns {{heading: string, message: Array<string>}} Message of the tile, given by `getTheMessage(tile, ownerName)`
     */
    getTileMessage(tileDiv) {
        let divName = tileDiv.getAttribute("name")
        let tile = new WuxingTile(divName.substring(1), divName.charAt(0))
        let ownerName = divName.startsWith('G') ? GUEST : HOST
        return this.getTheMessage(tile, ownerName)
    }

    /**
     * Get the information of a especific tile.
     * @param {WuxingTile} tile 
     * @param {string} ownerName 
     * @returns {{heading: string, message: Array<string>}} Information to display
     */
    getTheMessage(tile, ownerName) {
        let tileCode = tile.code
        let message = []
        let heading = ownerName + "'s " + WuxingTile.getTileName(tileCode) + ' Tile'
        switch (tileCode) {
            case WU_WOOD:
                message.push("Deployed on East or Green Gate")
                message.push("Moves up to 3 spaces")
                message.push("Captures Earth Tiles")
                message.push("If it's <b>Shēng</b> with Water it can move up to 5 spaces")
                message.push("If it's <b>Xiè</b> with Fire it can move up to 2 spaces")
                break
            case WU_EARTH:
                message.push("Deployed on Center or Yellow Gate")
                message.push("Moves up to 3 spaces")
                message.push("Captures Water Tiles")
                message.push("If it's <b>Shēng</b> with Fire it can move up to 5 spaces")
                message.push("If it's <b>Xiè</b> with Metal it can move up to 2 spaces")
                break
            case WU_WATER:
                message.push("Deployed on North or Black Gate")
                message.push("Moves up to 3 spaces")
                message.push("Captures Fire Tiles")
                message.push("If it's <b>Shēng</b> with Metal it can move up to 5 spaces")
                message.push("If it's <b>Xiè</b> with Wood it can move up to 2 spaces")
                break
            case WU_FIRE:
                message.push("Deployed on South or Red Gate")
                message.push("Moves up to 3 spaces")
                message.push("Captures Metal Tiles")
                message.push("If it's <b>Shēng</b> with Wood it can move up to 5 spaces")
                message.push("If it's <b>Xiè</b> with Earth it can move up to 2 spaces")
                break
            case WU_METAL:
                message.push("Deployed on West or White Gate")
                message.push("Moves up to 3 spaces")
                message.push("Captures Wood Tiles")
                message.push("If it's <b>Shēng</b> with Earth it can move up to 5 spaces")
                message.push("If it's <b>Xiè</b> with Water it can move up to 2 spaces")
                break
            case WU_EMPTY:
                message.push("Deployed on any Gate")
                message.push("Moves up to 4 spaces")
                message.push("Can capture and be captured by any tile")
                message.push("Transforms into the first tile it captures")
                message.push("When the Empty Tile is transformed, it acts as the tile it captured")
                message.push("If it is captured before it transforms, it counts towards the objective as if it were any tile")
                break
        }

        return {
            heading: heading,
            message: message
        }
    }

    /* STATIC METHODS */

    /**
     * Returns the html representation of the tile containers for host. Each container may contain the tiles
     * that the host currently has available to deploy or plant. Each cointainer must have a class name with
     * the code of whatever tile it cointains
     * @returns {string}
     * */
    static getHostTilesContainerDivs() {
        return '' +
        '<div class="HWO"></div>' +
        '<div class="HEA"></div>' +
        '<div class="HWA"></div>' +
        '<div class="HFI"></div>' +
        '<div class="HME"></div>' +
        '<br class="clear">' +
        '<div class="HEM"></div>'
    }

    /**
     * Returns the html representation of the tile containers for guest. Each container may contain the tiles
     * that the host currently has available to deploy or plant. Each cointainer must have a class name with
     * the code of whatever tile it cointains
     * @returns {string}
     * */
    /** @returns {string} */
    static getGuestTilesContainerDivs() {
        return '' +
        '<div class="GWO"></div>' +
        '<div class="GEA"></div>' +
        '<div class="GWA"></div>' +
        '<div class="GFI"></div>' +
        '<div class="GME"></div>' +
        '<br class="clear">' +
        '<div class="GEM"></div>'
    }
}