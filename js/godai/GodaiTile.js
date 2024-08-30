import { GUEST, HOST } from "../CommonNotationObjects"
import { debug } from "../GameData"
import { GATE } from "../skud-pai-sho/SkudPaiShoBoardPoint"
import { tileIdIncrement } from "../skud-pai-sho/SkudPaiShoTile"
import { GodaiBoardPoint } from "./GodaiBoardPoint"

export const GO_WOOD = "WO"
export const GO_EARTH = "EA"
export const GO_WATER = "WA"
export const GO_FIRE = "FI"
export const GO_METAL = "ME"
export const GO_EMPTY = "EM"

const GO_SHENG_CYCLE = "Sheng Cycle"
const GO_XIE_CYCLE = "Xie Cycle"
const GO_KE_CYCLE = "Ke Cycle"
const GO_WU_CYCLE = "Wu Cycle"

/**
 * Util function that determines if a tile's element can capture another
 * @param {GodaiTile} tile Tile to check if it can capture
 * @param {GodaiTile} other Tile we want to know if its capturable
 */
export function canTileCaptureOther(tile, other) {
    if (tile.ownerCode == other.ownerCode) {
        return false
    }

    if (tile.code == GO_EMPTY || other.code == GO_EMPTY) {
        return true
    }
    else if (tile.code == GO_WOOD && other.code == GO_EARTH) {
        return true
    }
    else if (tile.code == GO_EARTH && other.code == GO_WATER) {
        return true
    }
    else if (tile.code == GO_WATER && other.code == GO_FIRE) {
        return true
    }
    else if (tile.code == GO_FIRE && other.code == GO_METAL) {
        return true
    }
    else if (tile.code == GO_METAL && other.code == GO_WOOD) {
        return true
    }
    else return false
}

/**
 * Sheng is a cycle where tiles get helped by other certain tiles.
 * The order of Sheng is: Wood to Fire, Fire to Earth, Earth to Metal, Metal to Water and Water to Wood.
 * [...]
 * For example: A Fire is adjacent to a Wood tile, the Wood is feeding the Fire,
 * so the Fire tile can go five spaces.
 * 
 * @example
 *  // To detect if there is a Sheng relationship, do:
 *  isTileInShengWithOther(fireTile, otherTile)
 * 
 * @param {GodaiTile} tile reciever of the relationship
 * @param {GodaiTile} other tile that causes cycle interaction
 */
export function isTileInShengWithOther(tile, other) {
    if (other.code === GO_WOOD && tile.code === GO_FIRE) {
        return true
    }
    else if (other.code === GO_FIRE && tile.code === GO_EARTH) {
        return true
    }
    else if (other.code === GO_EARTH && tile.code === GO_METAL) {
        return true
    }
    else if (other.code === GO_METAL && tile.code === GO_WATER) {
        return true
    }
    else if (other.code === GO_WATER && tile.code === GO_WOOD) {
        return true
    }
    else return false
}

/**
 * A tile in Xiè is the tile that is helping a tile in Sheng.
 * This action depletes the tile in Xiè, allowing it to only move up to two spaces.
 * 
 * The order of Xiè is the opposite of Sheng: Wood to Water, Water to Metal,
 * Metal to Earth, Earth to Fire and Fire to Wood.
 * 
 * 
 * @example
 *  // To detect if there is a Xie relationship, do:
 *  isTileInXieWithOrder(fireTile, otherTile)
 * 
 * @param {GodaiTile} tile reciever of the relationship
 * @param {GodaiTile} other tile that causes cycle interaction
 */
export function isTileInXieWithOrder(tile, other) {
    if (other.code === GO_WOOD && tile.code === GO_WATER) {
        return true
    }
    else if (other.code === GO_WATER && tile.code === GO_METAL) {
        return true
    }
    else if (other.code === GO_METAL && tile.code === GO_EARTH) {
        return true
    }
    else if (other.code === GO_EARTH && tile.code === GO_FIRE) {
        return true
    }
    else if (other.code === GO_FIRE && tile.code === GO_WOOD) {
        return true
    }
    else return false
}

/**
 * A tile in Kè is helping another tile without using its own resources.
 * A tile in Kè can move up to four spaces.
 * 
 * The order of Kè is the same as the capture cycle.
 * 
 * @example
 *  // To detect if there is a Ke relationship, do:
 *  isTileInKeWithOrder(fireTile, otherTile)
 * 
 * @param {GodaiTile} tile reciever of the relationship
 * @param {GodaiTile} other tile that causes cycle interaction
 */
export function isTileInKeWithOther(tile, other) {
    if (other.code === GO_WOOD && tile.code === GO_EARTH) {
        return true
    }
    else if (other.code === GO_EARTH && tile.code === GO_WATER) {
        return true
    }
    else if (other.code === GO_WATER && tile.code === GO_FIRE) {
        return true
    }
    else if (other.code === GO_FIRE && tile.code === GO_METAL) {
        return true
    }
    else if (other.code === GO_METAL && tile.code === GO_WOOD) {
        return true
    }
    else return false
}

/**
 * A Wǔ cycle is a cycle in which two of the same tiles are adjacent to each other,
 * they both combine their resources and help each other.
 * 
 * A tile in Wǔ can move up to four spaces.
 * 
 * @example
 *  // To detect if there is a Wu relationship, do:
 *  isTileInWuWithOrder(fireTile, otherTile)
 * 
 * @param {GodaiTile} tile reciever of the relationship
 * @param {GodaiTile} other tile that causes cycle interaction
 */

export function isTileInWuWithOther(tile, other) {
    return tile.code === other.code && tile !== GO_EMPTY
}

/**
 * Util function that returns correct the movement based on the cycles given in the set. 
 * @param {Set<string>} cycles Cycles found.
 * @returns {number} Correct movement based on the cycles given
 */
function resolvedMovementFromCycles(cycles) {
    const hasSheng = cycles.has(GO_SHENG_CYCLE)
    const hasXie = cycles.has(GO_XIE_CYCLE)
    const hasKe = cycles.has(GO_KE_CYCLE)
    const hasWu = cycles.has(GO_WU_CYCLE)
    const hasExtremeCycles = hasSheng || hasXie
    const hasNormalCycles = hasKe || hasWu

    if (hasSheng && hasXie) { // Extreme cycles cancel out
        if (hasKe) return GodaiTile.keMovement
        if (hasWu) return GodaiTile.wuMovement
        return GodaiTile.baseMovement
    }
    else if (hasExtremeCycles && hasNormalCycles) {
        if (hasSheng) return GodaiTile.shengMovement
        if (hasWu) return GodaiTile.xieMovement
    }

    return GodaiTile.baseMovement // IDK Man
}

export class GodaiTile {

    static baseMovement = 3
    static shengMovement = 5
    static xieMovement = 2
    static keMovement = 4
    static wuMovement = 4
    static emptyTileMovement = 4

    /** @type {string} */
    code
    /** @type {string} */
    ownerCode

    /** @type {string} */
    ownerName

    /** @type {number} */
    id

    selectedFromPile

    /** @type {boolean} Used for rivers */
    gotMoved = false

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

    /**
     * Calculates the moving distance of a tile based on the sorrounding board points.
     * @param {Array<GodaiBoardPoint>} sorroundingBPs Sorrounding board points around the tile
     * @param {boolean} isInGate If the current tile is in a gate
     * @returns {number} Moving distance based on its sorrounding conditions
     */
    getMoveDistance( sorroundingBPs, isInGate ) {

        if (this.code === GO_EMPTY) {
            return GodaiTile.emptyTileMovement // Not affected by cycles
        }

        if (!sorroundingBPs || isInGate) {
            return GodaiTile.baseMovement
        }

        const sorroundingTiles = sorroundingBPs
            .filter( bp => !bp.isType(GATE) ) // Tiles in gates do not count towards cycles
            .map( bp => bp.tile )
            .filter( tile => tile != null ) // Remove empty spaces

        if (sorroundingTiles.length === 0) {
            return GodaiTile.baseMovement // No cycles to identify lol
        }

        let cycles = new Set([""]) // We're gonna check every tile and see if it causes a cycle interaction
        for (const otherTile of sorroundingTiles) {
            if ( isTileInShengWithOther(this, otherTile) ) {
                cycles.add(GO_SHENG_CYCLE)
            }
            if ( isTileInXieWithOrder(this, otherTile) ) {
                cycles.add(GO_XIE_CYCLE)
            }
            if ( isTileInKeWithOther(this, otherTile) ) {
                cycles.add(GO_KE_CYCLE)
            }
            if ( isTileInWuWithOther(this, otherTile) ) {
                cycles.add(GO_WU_CYCLE)
            }
        }

        cycles.delete("")

        if (cycles.size === 1) {
            if (cycles.has(GO_SHENG_CYCLE)) {
                return GodaiTile.shengMovement
            }
            else if (cycles.has(GO_XIE_CYCLE)) {
                return GodaiTile.xieMovement
            }
            else if (cycles.has(GO_KE_CYCLE)) {
                return GodaiTile.keMovement
            }
            else if (cycles.has(GO_WU_CYCLE)) {
                return GodaiTile.wuMovement
            }
        }
        else {
            // Resolve cycle contridictments
            return resolvedMovementFromCycles(cycles)
        }

        return GodaiTile.baseMovement // IDK what happened here
    }

    getImageName() {
        return this.ownerCode + "" + this.code
    }

    getCopy() {
        return new GodaiTile(this.code, this.ownerCode)
    }

    static getTileName(tileCode) {
        let name = ""

        if (tileCode === GO_WOOD) {
            name = "Wood"
        } else if (tileCode === GO_EARTH) {
            name = "Earth"
        }
        else if (tileCode === GO_WATER) {
            name = "Water"
        }
        else if (tileCode === GO_FIRE) {
            name = "Fire"
        }
        else if (tileCode === GO_METAL) {
            name = "Metal"
        } else if (tileCode === GO_EMPTY) {
            name = "Empty"
        }

        return name
    }
}