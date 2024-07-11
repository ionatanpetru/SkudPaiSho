import { GUEST, HOST, NotationPoint, RowAndColumn } from "../CommonNotationObjects"
import { debug } from "../GameData"
import { GATE, NON_PLAYABLE, POSSIBLE_MOVE } from "../skud-pai-sho/SkudPaiShoBoardPoint"
import { BLACK_GATE, GREEN_GATE, RED_GATE, WHITE_GATE, WuxingBoardPoint, YELLOW_GATE } from "./WuxingPointBoard"
import { canTileCaptureOther, WU_EARTH, WU_EMPTY, WU_FIRE, WU_METAL, WU_WATER, WU_WOOD, WuxingTile } from "./WuxingTile"
import { WuxingTileManager } from "./WuxingTileManager"

/**
 * Util function that gets a set of tile types
 * @param {Array<WuxingTile>} tiles 
 * @returns {Set<string>} Set of tile types
 */
function getSetOfTileTypes(tiles) {
    let set = new Set([""])
    set.delete("")
    tiles.map(tile => tile.code).forEach( type => set.add(type) )
    return set
}

/**
 * The main way a player can win is:
 * 1. The player has captured one of each tile
 * 2. If they have captured an untransformed empty tile,
 * said tile replaces one of the tiles they need to win.
 * 
 * @param {Array<WuxingTile} tiles Array of captured tiles
 * @returns {boolean} Whether the player won or not
 */
function hasPlayerWonFromMainCondition( tiles ) {
    const setOfTileTypes = getSetOfTileTypes( tiles )

    const hasWood = setOfTileTypes.has(WU_WOOD)
    const hasEarth = setOfTileTypes.has(WU_EARTH)
    const hasWater = setOfTileTypes.has(WU_WATER)
    const hasFire = setOfTileTypes.has(WU_FIRE)
    const hasMetal = setOfTileTypes.has(WU_METAL)
    const hasEmpty = setOfTileTypes.has(WU_EMPTY)

    if (hasWood && hasEarth && hasWater && hasFire && hasMetal) {
        return true // Classic win
    } else if (hasEmpty && hasEarth && hasWater && hasFire && hasMetal) {
        return true // Empty tile replaced Wood tile
    }
    else if (hasWood && hasEmpty && hasWater && hasFire && hasMetal) {
        return true // Empty tile replaced Earth tile
    }
    else if (hasWood && hasEarth && hasEmpty && hasFire && hasMetal) {
        return true // Empty tile replaced Water tile
    }
    else if (hasWood && hasEarth && hasWater && hasEmpty && hasMetal) {
        return true // Empty tile replaced Fire tile
    }
    else if (hasWood && hasEarth && hasWater && hasFire && hasEmpty) {
        return true // Empty tile replaced Metal tile
    }

    return false
}

/**
 * Checks if the `player` has won trough the alt condition.
 * 
 * @param {WuxingBoard} board board
 * @param {WuxingTileManager} tileManager 
 * @param {string} player GUEST or HOST - which player to look for the win condition
 * @returns {boolean} Whether the player won or not
 */
function hasPlayerWonFromAltCondition(board, tileManager, player) {

    // Utils refs
    const allTypeTypesSet = new Set([WU_EARTH, WU_FIRE, WU_METAL, WU_WOOD, WU_WATER])
    const opponentLibrary = player == HOST ? tileManager.guestTiles : tileManager.hostTiles
    const opponentCapturedTiles = player == HOST ? tileManager.capturedGuestTiles : tileManager.capturedHostTiles
    const allOpponentTiles = opponentLibrary.concat(
        board.getTilesOnBoard().filter( tile => tile.ownerName != player )
    )

    // Get the tile types the opponent needs to win (normally)
    let opponentCapturedTypes = getSetOfTileTypes( opponentCapturedTiles )

    let typesOpponentNeeds = new Set([""])
    typesOpponentNeeds.delete("")
    for (const type of allTypeTypesSet) {
        if (!opponentCapturedTypes.has(type)) {
            typesOpponentNeeds.add(type)
        }
    }


    // Does the opponent have a playable tile that they can use to capture those types?
    for (const type of typesOpponentNeeds) {
        const utilTile = new WuxingTile(type, player != HOST ? "G" : "H")

        let canCaptureThatType = false

        for (const tile of allOpponentTiles) {
            // This check also includes Empty Tiles, since if tile is Empty Tile,
            // Then it returns true as it can capture it
            if ( canTileCaptureOther(tile, utilTile) ) {
                canCaptureThatType = true
            }
        }

        if (!canCaptureThatType) {
            return true // We locked them out! Player wins!
        }
    }

    return false
}

export class WuxingBoard {

    /** @type {RowAndColumn} */
    size

    /** @type {Array<Array<WuxingBoardPoint>>} */
    cells

    /** @type {Array<string>} */
    winners

    /** @type {string} */
    winnerReason = ""

    constructor() {
        this.size = new RowAndColumn(17, 17)
        this.cells = this.brandNew()
        this.winners = []
    }

    brandNew() {
        let cells = []

        cells[0] = this.newRow(9, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountainEntrance(),
            WuxingBoardPoint.blackGate(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[1] = this.newRow(11, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountainEntrance(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[2] = this.newRow(13, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[3] = this.newRow(15, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[4] = this.newRow(17, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[5] = this.newRow(17, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[6] = this.newRow(17, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[7] = this.newRow(17, [
            WuxingBoardPoint.mountainEntrance(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        // Horizontal midline
        cells[8] = this.newRow(17, [
            WuxingBoardPoint.whiteGate(),
            WuxingBoardPoint.mountainEntranceWithRiverDL(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.yellowGate(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.mountainEntranceWithRiverDR(),
            WuxingBoardPoint.greenGate(),
        ])

        cells[9] = this.newRow(17, [
            WuxingBoardPoint.mountainEntrance(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[10] = this.newRow(17, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[11] = this.newRow(17, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[12] = this.newRow(17, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[13] = this.newRow(15, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[14] = this.newRow(13, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.riverDownRight(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.riverDownLeft(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[15] = this.newRow(11, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.river(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        cells[16] = this.newRow(9, [
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountain(),
            WuxingBoardPoint.mountainEntrance(),
            WuxingBoardPoint.redGate(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
            WuxingBoardPoint.neutral(),
        ])

        for (let row = 0; row < cells.length; row++) {
            for (let col = 0; col < cells[row].length; col++) {
                cells[row][col].row = row;
                cells[row][col].col = col;
            }
        }

        return cells
    }

    /**
     * Taken from SpiritBoard.js
     * @param {number} numColumns Number of Columns to add. They're added from the center
     * @param {Array<WuxingBoardPoint>} points points to add, from left to right
     * @returns {}
     */
    newRow(numColumns, points) {
        let cells = []
        let numBlanksOnSides = (this.size.row - numColumns) / 2

        let nonPoint = new WuxingBoardPoint()
        nonPoint.addType(NON_PLAYABLE)

        for (var i = 0; i < this.size.row; i++) {
            if (i < numBlanksOnSides) {
                cells[i] = nonPoint;
            } else if (i < numBlanksOnSides + numColumns) {
                if (points) {
                    cells[i] = points[i - numBlanksOnSides];
                } else {
                    cells[i] = nonPoint;
                }
            } else {
                cells[i] = nonPoint;
            }
        }

        return cells
    }

    _getGatePoints() {
        return [
            this.cells[0][8],
            this.cells[8][0],
            this.cells[8][8],
            this.cells[8][16],
            this.cells[16][8],
        ]
    }

    /**
     * 
     * @param {string} player GUEST or HOST
     * @param {WuxingBoardPoint} bpStart 
     * @param {WuxingBoardPoint} bpEnd 
     * @returns {boolean}
     */
    _canMoveTileToPoint(player, bpStart, bpEnd) {
        // Start point must have tile
        if (!bpStart.hasTile()) {
            return false
        }

        // Tile must belong to player
        if (bpStart.tile.ownerName !== player) {
            return false
        }

        // Can't move tiles directly to gates
        if (bpEnd.isType(GATE)) {
            return false
        }

        let canCaptureEndTile = bpEnd.hasTile()
            ? this._canTileStartCaptureEnd(bpStart, bpEnd)
            : false

        // Can only move if the endpoint has a capturable tile
        if (bpEnd.hasTile() && !canCaptureEndTile) {
            return false
        }

        // Movement
        let sorroundingBPs = this.getSurroundingBoardPoints(bpStart)
        let numMoves = bpStart.tile.getMoveDistance(sorroundingBPs, bpStart.isType(GATE))

        if (Math.abs(bpStart.row - bpEnd.row) + Math.abs(bpStart.col - bpEnd.col) > numMoves) {
            // That's too far!
            return false
        }
        else {
            // Move may be possible. But there may be tiles in the way
            if (!this._verifyAbleToReach(bpStart, bpEnd, numMoves, bpStart.tile)) {
                return false
            }
        }

        // Suppose he can move
        return true
    }

    /**
     * Taken from VagabondBoard.js
     * @param {WuxingBoardPoint} bpStart 
     * @param {WuxingBoardPoint} bpEnd 
     * @param {number} numMoves 
     * @param {WuxingTile} movingTile 
     */
    _verifyAbleToReach(bpStart, bpEnd, numMoves, movingTile) {
        // Recursion!
        return this._pathFound(bpStart, bpEnd, numMoves, movingTile)
    }

    /**
     * Taken from VagabondBoard.js
     * @param {WuxingBoardPoint} bpStart 
     * @param {WuxingBoardPoint} bpEnd 
     * @param {number} numMoves 
     * @param {WuxingTile} movingTile 
     */
    _pathFound(bpStart, bpEnd, numMoves, movingTile) {
        if (!bpStart || !bpEnd) {
            return false
        }

        if (bpStart.isType(NON_PLAYABLE) || bpEnd.isType(NON_PLAYABLE)) {
            return false // Paths must be through playable points
        }

        if (bpStart.row === bpEnd.row && bpStart.col === bpEnd.col) {
            return false // Moving to the same point, very funny
        }

        if (numMoves <= 0) {
            return false // No more recursiveness
        }

        let minMoves = Math.abs(bpStart.row - bpEnd.row) + Math.abs(bpStart.col - bpEnd.col)
        if (minMoves === 1) {
            return true // Only one space away
        }

        // Check move UP
        let nextRow = bpStart.row - 1
        if (nextRow >= 0) {
            let nextPoint = this.cells[nextRow][bpStart.col]
            if (!nextPoint.hasTile() && this._pathFound(nextPoint, bpEnd, numMoves - 1, movingTile)) {
                return true
            }
        }

        // Check move DOWN
        nextRow = bpStart.row + 1
        if (nextRow < 17) {
            let nextPoint = this.cells[nextRow][bpStart.col]
            if (!nextPoint.hasTile() && this._pathFound(nextPoint, bpEnd, numMoves - 1, movingTile)) {
                return true
            }
        }

        // Check move LEFT
        let nextCol = bpStart.col - 1
        if (nextCol >= 0) {
            let nextPoint = this.cells[bpStart.row][nextCol]
            if (!nextPoint.hasTile() && this._pathFound(nextPoint, bpEnd, numMoves - 1, movingTile)) {
                return true
            }
        }

        // Check move LEFT
        nextCol = bpStart.col + 1
        if (nextCol < 17) {
            let nextPoint = this.cells[bpStart.row][nextCol]
            if (!nextPoint.hasTile() && this._pathFound(nextPoint, bpEnd, numMoves - 1, movingTile)) {
                return true
            }
        }
    }

    /**
     * Can the tile present in `bpStart` capture the one located in `bpEnd`?
     * @param {WuxingBoardPoint} bpStart 
     * @param {WuxingBoardPoint} bpEnd 
     * @returns {boolean}
     */
    _canTileStartCaptureEnd(bpStart, bpEnd) {
        if (bpStart.tile == null || bpEnd.tile == null) {
            return false // Can't capture a tile if there isn't one :)
        }

        let capturerTile = bpStart.tile
        let capturedTile = bpEnd.tile

        return canTileCaptureOther(capturerTile, capturedTile)
    }

    /**
     * 
     * @param {string} playerCode GUEST or HOST
     * @param {NotationPoint} notationPointStart 
     * @param {NotationPoint} notationPointEnd 
     */
    moveTile( playerCode, notationPointStart, notationPointEnd ) {
        let start = notationPointStart.rowAndColumn
        let end = notationPointEnd.rowAndColumn

        // Basic checks
        if (start.row < 0 || start.row > 16 || end.row < 0 || end.row > 16) {
            debug("That point does not exist. So it's not gonna happen.");
			return false
        }

        let bpStart = this.cells[start.row][start.col]
        let bpEnd = this.cells[end.row][end.col]

        if (!this._canMoveTileToPoint(playerCode, bpStart, bpEnd)) {
            debug("Bad move bears");
			showBadMoveModal();
			return false;
        }

        let tile = bpStart.removeTile()

        if (!tile) {
			debug("Error: No tile to move!");
		}

        // Capture the tile (but save it for later)
        let capturedTile = bpEnd.tile
        bpEnd.putTile(tile)

        return {
			movedTile: tile,
			startPoint: notationPointStart,
			endPoint: notationPointEnd,
			capturedTile: capturedTile
		};
    }

    /**
     * Taken from VagabondBoard.js
     * @param {WuxingBoardPoint} boardPointStart 
     */
    setPossibleMovePoints(boardPointStart) {
        if (!boardPointStart.hasTile()) return

        let player = boardPointStart.tile.ownerName

        // POSSIBLE POINTS
        for (const row of this.cells) {
            for (const bp of row) {
                if (!bp.isType(NON_PLAYABLE)) {
                    if (this._canMoveTileToPoint(player, boardPointStart, bp)) {
                        bp.addType(POSSIBLE_MOVE)
                    }
                }
            }
        }
    }

    /**
     * 
     * @param {string} player HOST or GUEST
     * @param {string} tileCode 
     * @returns 
     */
    setDeployPointsPossibleMoves(player, tileCode) {

        const gatePoints = this._getGatePoints()

        // A player can only deploy if they don't have one deployed on a gate already
        let playerHasTileInGate = false
        for (const gate of gatePoints) {
            if (gate.hasTile() && gate.tile.ownerName == player) {
                playerHasTileInGate = true
                break
            }
        }

        if (playerHasTileInGate) return

        for (const gate of gatePoints) {
            if (!gate.hasTile()) {
                if (tileCode == WU_EMPTY) {
                    gate.addType(POSSIBLE_MOVE)
                    continue
                }

                if (gate.isType(BLACK_GATE) && tileCode == WU_WATER) {
                    gate.addType(POSSIBLE_MOVE)
                }
                else if (gate.isType(WHITE_GATE) && tileCode == WU_METAL) {
                    gate.addType(POSSIBLE_MOVE)
                }
                else if (gate.isType(YELLOW_GATE) && tileCode == WU_EARTH) {
                    gate.addType(POSSIBLE_MOVE)
                }
                else if (gate.isType(GREEN_GATE) && tileCode == WU_WOOD) {
                    gate.addType(POSSIBLE_MOVE)
                }
                else if (gate.isType(RED_GATE) && tileCode == WU_FIRE) {
                    gate.addType(POSSIBLE_MOVE)
                }
            }
        }

    }

    removePossibleMovePoints() {
        this.cells.forEach( row => {
            row.forEach( bp => bp.removeType(POSSIBLE_MOVE) )
        } )
    }

    /**
     * 
     * @param {WuxingTile} tile 
     * @param {NotationPoint} notationPoint 
     */
    placeTile(tile, notationPoint) {
        this.putTileOnPoint(tile, notationPoint);

		// Things to do after a tile is placed

        // Nothing :)
    }

    putTileOnPoint(tile, notationPoint) {
        let p = notationPoint.rowAndColumn
        let point = this.cells[p.row][p.col]
        point.putTile(tile)
    }

    /**
     * Checks whether a player has won, and adds it as a winner and the reason why.
     * @param {WuxingTileManager} tileManager Contains all the tiles neccesary to check if a player has won
     */
    checkForEndGame(tileManager) {
        if (this.winners.length > 0) {
            return
        }

        if ( hasPlayerWonFromMainCondition(tileManager.capturedHostTiles) ) {
            this.winners.push(HOST)
            this.winnerReason = " has captured all captured one of each of the opponent's tiles!"
        }
        else if ( hasPlayerWonFromMainCondition(tileManager.capturedGuestTiles) ) {
            this.winners.push(GUEST)
            this.winnerReason = " has captured all captured one of each of the opponent's tiles!"
        }
        else if ( hasPlayerWonFromAltCondition(this, tileManager, HOST) ) {
            this.winners.push(HOST)
            this.winnerReason = " has prevented their opponent from winning!"
        }
        else if ( hasPlayerWonFromAltCondition(this, tileManager, GUEST) ) {
            this.winners.push(GUEST)
            this.winnerReason = " has prevented their opponent from winning!"
        }
    }

    /**
     * 
     * @param {RowAndColumn} rowAndCol 
     * @returns {Array<RowAndColumn>}
     */
    getSorroundingRowAndCols(rowAndCol) {
        let rowAndCols = [];
	    for (let row = rowAndCol.row - 1; row <= rowAndCol.row + 1; row++) {
	    	for (let col = rowAndCol.col - 1; col <= rowAndCol.col + 1; col++) {
	    		if ((row !== rowAndCol.row || col !== rowAndCol.col)	// Not the center given point
	    			&& (row >= 0 && col >= 0) && (row < 17 && col < 17)) {	// Not outside range of the grid
	    			let boardPoint = this.cells[row][col];
	    			if (!boardPoint.isType(NON_PLAYABLE)) {	// Not non-playable
	    				rowAndCols.push(new RowAndColumn(row, col));
	    			}
	    		}
	    	}
	    }
	    return rowAndCols;
    }

    /**
     * 
     * @param {WuxingBoardPoint} initialBoardPoint 
     * @returns {Array<WuxingBoardPoint>}
     */
    getSurroundingBoardPoints(initialBoardPoint) {
		var surroundingPoints = [];
		for (var row = initialBoardPoint.row - 1; row <= initialBoardPoint.row + 1; row++) {
			for (var col = initialBoardPoint.col - 1; col <= initialBoardPoint.col + 1; col++) {
				if ((row !== initialBoardPoint.row || col !== initialBoardPoint.col) // Not the center given point
					&& (row >= 0 && col >= 0) && (row < 17 && col < 17)) { // Not outside range of the grid
					var boardPoint = this.cells[row][col];
					if (!boardPoint.isType(NON_PLAYABLE)) { // Not non-playable
						surroundingPoints.push(boardPoint);
					}
				}
			}
		}
		return surroundingPoints;
	}

    getTilesOnBoard() {
        let tiles = []

        for (const row of this.cells) {
            for (const bp of row) {
                if ( !bp.isType(NON_PLAYABLE) && bp.hasTile()) {
                    tiles.push(bp.tile)
                }
            }
        }

        return tiles
    }
}