import { DEPLOY, GUEST, HOST, MOVE, NotationPoint } from "../CommonNotationObjects"
import { debug } from "../GameData"
import { BRAND_NEW } from "../PaiShoMain"
import { WU_EARTH, WU_EMPTY, WU_FIRE, WU_METAL, WU_WATER, WU_WOOD } from "./WuxingTile"

/**
 * MOVE NOTATION:
 * ```
 * 1G.(x1-y1)-(x2-y2)
 * ```
 * 
 * PLANT NOTATION: `1H.|WO|EA|WA|FI|ME|EM|-(x-y)`
 * ```
 * 1G.WO-(0,8)
 * 2H.EA-(-8,0)
 * 2G.FI-(0,0)
 * 4H.ME-(8,0)
 * 5G.EM-(0,8)
 * ```
 * 
 */

export class WuxingNotationMove {

    fullMoveText = ""
    isValid = false

    /** @type {number} */
    moveNum = 0
    playerCode = ""
    moveType = ""

    // MOVE information
    /** @type {NotationPoint} */
    startPoint
    /** @type {NotationPoint} */
    endPoint

    // DEPLOY information
    tileType = ""

    constructor(text) {
        this.fullMoveText = text
        this.analyzeMove()
    }

    /**
     * Based on `this.fullMoveText`, decides if its a valid move notation or not
     */
    analyzeMove() {
        this.isValid = true

        // Get move number
        let parts = this.fullMoveText.split(".")

        let moveNumAndPlayer = parts[0]

        this.moveNum = parseInt(moveNumAndPlayer.slice(0, -1))
        this.playerCode = moveNumAndPlayer.charAt(moveNumAndPlayer.length - 1)

        // Guest or host
        if (this.playerCode === "G") {
            this.playerCode = GUEST
        } else if (this.playerCode === "H") {
            this.playerCode = HOST
        }

        let moveText = parts[1]
        if (!moveText) {
            this.isValid = false
            return
        }

        let char0 = moveText.charAt(0)
        if (char0 === '(') {
            this.moveType = MOVE
        } else if ( this._strStartsWithTileID(moveText) ) {
            this.moveType = DEPLOY
        }

        // Parse move
        if (this.moveType === MOVE) {
            // Get the two points from string like: (-8,0)-(-6,3)
		    let parts = moveText.substring(moveText.indexOf('(')+1).split(')-(');
		    this.startPoint = new NotationPoint(parts[0]);
		    this.endPoint = new NotationPoint(parts[1].substring(0, parts[1].indexOf(')')));
        }
        else if (this.moveType === DEPLOY) {
            // Get the tile deployed and its position: EA-(-8,0)
            let parts = moveText.substring(2).split('-(')

            if (parts.length != 2) {
                this.isValid = false
                return
            }

            this.tileType = parts[0]
            let coords = parts[1].substring(0, parts[1].indexOf(')'))
            this.endPoint = new NotationPoint(coords) // -8,0
        }
    }

    /** @param {string} text */
    _strStartsWithTileID(text) {
        let firstTwo = text.slice(0, 2)
        return firstTwo === WU_EARTH || firstTwo === WU_METAL
            || firstTwo === WU_WOOD  || firstTwo === WU_FIRE
            || firstTwo === WU_WATER || firstTwo === WU_EMPTY
    }

    isValidNotation() {
        return this.isValid
    }
}

WuxingNotationMove.prototype.equals = function (other) {
    return this.fullMoveText === other.fullMoveText
}

export class WuxingGameNotation {

    /** @type {string} */
    notationText = ""

    /** @type {Array<WUxingNotationMove>} */
    moves = []

    /** @param {string} text */
    setNotationText(text) {
        this.notationText = text
        this.loadMoves()
    }

    /** @param {string} text */
    addNotationLine(text) {
        this.notationText += ";" + text.trim()
        this.loadMoves()
    }

    /** @param {WuxingNotationMove} move  */
    addMove(move) {
        if (this.notationText) {
            this.notationText += ";" + move.fullMoveText
        }
    }

    removeLastMove() {
        this.notationText = this.notationText.substring(0, this.notationText.lastIndexOf(";"))
        this.loadMoves()
    }

    getPlayerMoveNum() {
        let moveNum = 0
        let lastMove = this.moves[this.moves.length - 1]

        if (lastMove) {
            moveNum = lastMove.moveNum
            if (lastMove.player == GUEST) {
                moveNum++
            }
        }

        return moveNum
    }

    /**
     * @param {WuxingNotationBuilder} builder
     * @returns {WuxingNotationMove}
     */
    getNotationMoveFromBuilder(builder) {
        let moveNum = 0
        let player = HOST
        let lastMove = this.moves[this.moves.length - 1]

        if (lastMove) {
            moveNum = lastMove.moveNum
            if (lastMove.player === GUEST) {
                moveNum++
            } else {
                player = GUEST
            }
        }

        return builder.getNotationMove(moveNum, player)
    }

    /**
     * For each move split from `this.notationText`, analyze each one of them and add them to `this.moves`
     * if they're valid
     */
    loadMoves() {
        this.moves = []
        let lines = []
        if (this.notationText) {
            if (this.notationText.includes(";")) {
                lines = this.notationText.split(";")
            }
            else {
                lines = [this.notationText]
            }
        }

        let lastPlayer = GUEST
        for (const line of lines) {
            let move = new WuxingNotationMove(line)
            if (move.isValidNotation() && move.player !== lastPlayer) {
                this.moves.push(move)
                lastPlayer = move.player
            }
            else {
                debug("the player check is broken?")
            }
        }
    }

    /* GETTERS FOR TEXT */

    getNotationHtml() {
        let lines = []
        if (this.notationText) {
            if (this.notationText.includes(';')) {
                lines = this.notationText.split(';')
            }
            else {
                lines = [this.notationText]
            }
        }

        let notationHTML = lines.reduce( (acc, line) => acc += line + "<br />", "" )
        return notationHTML
    }

    notationTextForUrl() {
        return this.notationText
    }

    getNotationForEmail() {
        let lines = []
        if (this.notationText) {
            if (this.notationText.includes(';')) {
                lines = this.notationText.split(';')
            }
            else {
                lines = [this.notationText]
            }
        }

        let notationHTML = lines.reduce( (acc, line) => acc += line + "[BR]", "" )
        return notationHTML
    }

    getLastMoveText() {
        return this.moves[this.moves.length - 1].fullMoveText
    }

    getLastMoveNumber() {
        return this.moves[this.moves.length - 1].moveNum
    }
}

export class WuxingNotationBuilder {

    status = BRAND_NEW

    moveType = ""
    plantedlowerType = ""

    /**
     * TODO: DECIDE ON A NOTATION
     * 
     * Taken from CaptureGameNotation.js
     * @param {number} moveNum 
     * @param {string} player 
     * @returns {WuxingNotationMove}
     */
    getNotationMove( moveNum, player ) {
        let notationLine = ""

        return new WuxingNotationMove(notationLine)
    }
}