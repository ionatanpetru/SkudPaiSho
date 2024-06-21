import { RowAndColumn } from "../CommonNotationObjects"
import { NON_PLAYABLE, POSSIBLE_MOVE } from "../skud-pai-sho/SkudPaiShoBoardPoint"
import { BLACK_GATE, GREEN_GATE, RED_GATE, WHITE_GATE, WuxingBoardPoint, YELLOW_GATE } from "./WuxingPointBoard"
import { WU_EARTH, WU_EMPTY, WU_FIRE, WU_METAL, WU_WATER, WU_WOOD } from "./WuxingTile"

export class WuxingBoard {

    /** @type {RowAndColumn} */
    size

    /** @type {Array<Array<WuxingBoardPoint>>} */
    cells

    /** @type {Array<string>} */
    winners

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

    placeTile(tile, notationPoint, extraBoatPoint) {
        //
    }

    putTileOnPoint(tile, notationPoint) {
        let p = notationPoint.rowAndColumn
        let point = this.cells[p.row][p.col]
        point.putTile(tile)
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
}