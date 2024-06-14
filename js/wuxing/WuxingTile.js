import { GUEST, HOST } from "../CommonNotationObjects"
import { debug } from "../GameData"
import { tileIdIncrement } from "../skud-pai-sho/SkudPaiShoTile"

export const WU_WOOD = "WO"
export const WU_EARTH = "EA"
export const WU_WATER = "WA"
export const WU_FIRE = "FI"
export const WU_METAL = "ME"
export const WU_EMPTY = "EM"

export class WuxingTile {

    static baseMovement = 3
    static shengMovement = 5
    static xieMovement = 2
    static keMovement = 4
    static wuMovement = 1

    /** @type {string} */
    code
    /** @type {string} */
    ownerCode

    /** @type {string} */
    ownerName

    /** @type {number} */
    id

    selectedFromPile

    /**
     * 
     * @param {string} code Identifies the tile
     * @param {'G'|'H'} ownerCode Identifies the player who owns the tile.
     */
    constructor( code, ownerCode ) {
        this.code = code
        this.ownerCode = ownerCode

        if (this.ownerCode === 'G') {
            this.ownerName = GUEST
        }
        else if (this.ownerCode === 'H') {
            this.ownerName = HOST
        }
        else {
            debug("INCORRECT OWNER CODE")
        }

        this.id = tileIdIncrement()
    }

    getMoveDistance() {
        return 3
    }

    getImageName() {
        return this.ownerCode + "" + this.code
    }

    getCopy() {
        return new WuxingTile(this.code, this.ownerCode)
    }

    static getTileName(tileCode) {
        let name = ""

        if (tileCode === WU_WOOD) {
            name = "Wood"
        } else if (tileCode === WU_EARTH) {
            name = "Earth"
        }
        else if (tileCode === WU_WATER) {
            name = "Water"
        }
        else if (tileCode === WU_FIRE) {
            name = "Fire"
        }
        else if (tileCode === WU_METAL) {
            name = "Metal"
        } else if (tileCode === WU_EMPTY) {
            name = "Empty"
        }

        return name
    }
}