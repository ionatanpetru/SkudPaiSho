import { DEPLOY, MOVE } from "../CommonNotationObjects"
import { PaiShoMarkingManager } from "../pai-sho-common/PaiShoMarkingManager"
import { setGameLogText } from "../PaiShoMain"
import { WuxingActuator } from "./WuxingActuator"
import { WuxingBoard } from "./WuxingBoard"
import { WuxingNotationMove } from "./WuxingNotation"
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

    /**
     * 
     * @param {WuxingNotationMove} move Move to play
     */
    runNotationMove(move, withActuate) {
        debug("Running Move: " + move.fullMoveText);

        //TODO: DO NOTATION MOVES
        if (move.moveType == MOVE) {
            
        }
        else if (move.moveType == DEPLOY) {
            
        }


        if (withActuate) {
            this.actuate()
        }

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