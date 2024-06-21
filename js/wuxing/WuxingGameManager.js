import { PaiShoMarkingManager } from "../pai-sho-common/PaiShoMarkingManager"
import { setGameLogText } from "../PaiShoMain"
import { WuxingActuator } from "./WuxingActuator"
import { WuxingBoard } from "./WuxingBoard"
import { WuxingTileManager } from "./WuxingTileManager"

export class WuxingGameManager {

    /** @type {string} */
    gameLogText

    /** @type {boolean} */
    isCopy

    /** @type {WuxingActuator} */
    actuator

    /** @type {WuxingTileManager} */
    tileManager

    /** @type {WuxingBoard} */
    board

    /** @type {WuxingTileManager} */
    tileManager

    /** @type {PaiShoMarkingManager} */
    markingManager

    constructor( actuator, ignoreActuate, isCopy ) {
        this.gameLogText = ''
        this.isCopy = isCopy
        this.actuator = actuator

        this.tileManager = new WuxingTileManager()
        this.markingManager = new PaiShoMarkingManager()

        this.setup(ignoreActuate)
    }

    /** Set up the game */
    setup(ignoreActuate) {
        this.board = new WuxingBoard()

        if (!ignoreActuate) {
            this.actuate()
        }
    }

    /**
     * @param {*} moveToAnimate 
     */
    actuate(moveToAnimate) {
        if (this.isCopy) return

        this.actuator.actuate(this.board, this.tileManager, this.markingManager, moveToAnimate)
        setGameLogText(this.gameLogText)
    }

    revealDeployPoints(player, tileCode, ignoreActuate) {
        this.board.setDeployPointsPossibleMoves(player, tileCode)

        if (!ignoreActuate) {
            this.actuate()
        }
    }

    hidePossibleMovePoints(ignoreActuate) {
        this.board.removePossibleMovePoints()
        this.tileManager.removeSelectedTileFlags()
        if (!ignoreActuate) {
            this.actuate()
        }
    }

    cleanup() {
    }

    hasEnded() {
        return false
    }

    // TODO: Implement winner logic
    getWinner() {
        return ""
    }

    getWinReason() {
        return ""
    }
}