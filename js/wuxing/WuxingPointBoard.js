import { GATE, NEUTRAL } from "../skud-pai-sho/SkudPaiShoBoardPoint"
import { WuxingTile } from "./WuxingTile"

export let BLACK_GATE = "Black Gate"
export let GREEN_GATE = "Green Gate"
export let RED_GATE = "Red Gate"
export let WHITE_GATE = "White Gate"
export let YELLOW_GATE = "Yellow Gate"
export let RIVER_TILE = "River Tile"
export let RIVER_DL_TILE = "River (Down-Left) Tile"
export let RIVER_DR_TILE = "River (Down-Right) Tile"
export let MOUNTAIN_TILE = "Mountain Tile"
export let MOUNTAIN_ENTRANCE = "Mountain Entrance"
export let WESTERN_RIVER = "Western River"
export let EASTERN_RIVER  = "Eastern River"
export let IS_DAMMED_RIVER = "RIVER IS DAMMED"

export class WuxingBoardPoint {

    /** @type {Array<string>} */
    types

    /** @type {number} */
    row

    /** @type {number} */
    col

    /** @type {WuxingTile} */
    tile

    constructor() {
        this.types = []
        this.row = -1
        this.col = -1
    }

    /**
     * Taken from SpiritBoardPoint.js
     * @param {string} type Type of point. Use constants only.
     */
    addType(type) {
        if (!this.types.includes(type)) {
            this.types.push(type)
        }
    }

    /**
     * Taken from SpiritBoardPoint.js
     * @param {string} type Type of point. Use constants only.
     */
    removeType(type) {
        for (let i = 0; i < this.types.length; i++) {
            if (this.types[i] === type) {
                this.types.splice(i, 1)
            }
        }
    }

    /**
     * Taken from SpiritBoardPoint.js
     * @param {WuxingTile} tile 
     */
    putTile(tile) {
        this.tile = tile
    }

    removeTile() {
        let tile = this.tile
        this.tile = null
        return tile
    }

    /**
     * Taken from SpiritBoardPoint.js
     */
    hasTile() {
        if (this.tile) return true
        return false
    }

    isType(type) {
        return this.types.includes(type)
    }

    /* POINT TYPES */
    static neutral() {
        let point = new WuxingBoardPoint()
        point.addType(NEUTRAL)
        return point
    }

    static gate() {
        let point = new WuxingBoardPoint()
        point.addType(GATE)
        return point
    }

    static blackGate() {
        let p = WuxingBoardPoint.gate()
        p.addType(BLACK_GATE)
        return p
    }

    static greenGate() {
        let p = WuxingBoardPoint.gate()
        p.addType(GREEN_GATE)
        return p
    }

    static redGate() {
        let p = WuxingBoardPoint.gate()
        p.addType(RED_GATE)
        return p
    }

    static whiteGate() {
        let p = WuxingBoardPoint.gate()
        p.addType(WHITE_GATE)
        return p
    }

    static yellowGate() {
        let p = WuxingBoardPoint.gate()
        p.addType(YELLOW_GATE)
        return p
    }

    static river() {
        let p = new WuxingBoardPoint()
        p.addType(RIVER_TILE)
        return p
    }

    static riverDownLeft() {
        let p = WuxingBoardPoint.river()
        p.addType(RIVER_DL_TILE)
        return p
    }

    static riverDownRight() {
        let p = WuxingBoardPoint.river()
        p.addType(RIVER_DR_TILE)
        return p
    }

    static mountain() {
        let p = new WuxingBoardPoint()
        p.addType(MOUNTAIN_TILE)
        return p
    }

    static mountainEntrance() {
        let p = new WuxingBoardPoint()
        p.addType(MOUNTAIN_ENTRANCE)
        return p
    }

    static mountainEntranceWithRiver() {
        let p = WuxingBoardPoint.mountainEntrance()
        p.addType(RIVER_TILE)
        return p
    }

    static mountainEntranceWithRiverDL() {
        let p = WuxingBoardPoint.mountainEntranceWithRiver()
        p.addType(RIVER_DL_TILE)
        return p
    }

    static mountainEntranceWithRiverDR() {
        let p = WuxingBoardPoint.mountainEntranceWithRiver()
        p.addType(RIVER_DR_TILE)
        return p
    }

    /**
     * Adds the `WESTERN_RIVER` type to `p`
     * @param {WuxingBoardPoint} p 
     * @returns {WuxingBoardPoint}
     */
    static western(p) {
        p.addType(WESTERN_RIVER)
        return p
    }

    /**
     * Adds the `EASTERN_RIVER` type to `p`
     * @param {WuxingBoardPoint} p 
     * @returns {WuxingBoardPoint}
     */
    static eastern(p) {
        p.addType(EASTERN_RIVER)
        return p
    }
}