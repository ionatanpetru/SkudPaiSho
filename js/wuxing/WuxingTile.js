import { GUEST, HOST } from "../CommonNotationObjects"
import { debug } from "../GameData"
import { GATE } from "../skud-pai-sho/SkudPaiShoBoardPoint"
import { tileIdIncrement } from "../skud-pai-sho/SkudPaiShoTile"
import { WuxingBoardPoint } from "./WuxingPointBoard"

export const WU_WOOD = "WO"
export const WU_EARTH = "EA"
export const WU_WATER = "WA"
export const WU_FIRE = "FI"
export const WU_METAL = "ME"
export const WU_EMPTY = "EM"

const WU_SHENG_CYCLE = "Sheng Cycle"
const WU_XIE_CYCLE = "Xie Cycle"
const WU_KE_CYCLE = "Ke Cycle"
const WU_WU_CYCLE = "Wu Cycle"

/**
 * Util function that determines if a tile's element can capture another
 * @param {WuxingTile} tile Tile to check if it can capture
 * @param {WuxingTile} other Tile we want to know if its capturable
 */
export function canTileCaptureOther(tile, other) {
    if (tile.ownerCode == other.ownerCode) {
        return false
    }

    if (tile.code == WU_EMPTY || other.code == WU_EMPTY) {
        return true
    }
    else if (tile.code == WU_WOOD && other.code == WU_EARTH) {
        return true
    }
    else if (tile.code == WU_EARTH && other.code == WU_WATER) {
        return true
    }
    else if (tile.code == WU_WATER && other.code == WU_FIRE) {
        return true
    }
    else if (tile.code == WU_FIRE && other.code == WU_METAL) {
        return true
    }
    else if (tile.code == WU_METAL && other.code == WU_WOOD) {
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
 * @param {WuxingTile} tile reciever of the relationship
 * @param {WuxingTile} other tile that causes cycle interaction
 */
export function isTileInShengWithOther(tile, other) {
    if (other.code === WU_WOOD && tile.code === WU_FIRE) {
        return true
    }
    else if (other.code === WU_FIRE && tile.code === WU_EARTH) {
        return true
    }
    else if (other.code === WU_EARTH && tile.code === WU_METAL) {
        return true
    }
    else if (other.code === WU_METAL && tile.code === WU_WATER) {
        return true
    }
    else if (other.code === WU_WATER && tile.code === WU_WOOD) {
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
 * @param {WuxingTile} tile reciever of the relationship
 * @param {WuxingTile} other tile that causes cycle interaction
 */
export function isTileInXieWithOrder(tile, other) {
    if (other.code === WU_WOOD && tile.code === WU_WATER) {
        return true
    }
    else if (other.code === WU_WATER && tile.code === WU_METAL) {
        return true
    }
    else if (other.code === WU_METAL && tile.code === WU_EARTH) {
        return true
    }
    else if (other.code === WU_EARTH && tile.code === WU_FIRE) {
        return true
    }
    else if (other.code === WU_FIRE && tile.code === WU_WOOD) {
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
 * @param {WuxingTile} tile reciever of the relationship
 * @param {WuxingTile} other tile that causes cycle interaction
 */
export function isTileInKeWithOther(tile, other) {
    if (other.code === WU_WOOD && tile.code === WU_EARTH) {
        return true
    }
    else if (other.code === WU_EARTH && tile.code === WU_WATER) {
        return true
    }
    else if (other.code === WU_WATER && tile.code === WU_FIRE) {
        return true
    }
    else if (other.code === WU_FIRE && tile.code === WU_METAL) {
        return true
    }
    else if (other.code === WU_METAL && tile.code === WU_WOOD) {
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
 * @param {WuxingTile} tile reciever of the relationship
 * @param {WuxingTile} other tile that causes cycle interaction
 */

export function isTileInWuWithOther(tile, other) {
    return tile.code === other.code && tile !== WU_EMPTY
}

/**
 * Util function that returns correct the movement based on the cycles given in the set. 
 * @param {Set<string>} cycles Cycles found.
 * @returns {number} Correct movement based on the cycles given
 */
function resolvedMovementFromCycles(cycles) {
    const hasSheng = cycles.has(WU_SHENG_CYCLE)
    const hasXie = cycles.has(WU_XIE_CYCLE)
    const hasKe = cycles.has(WU_KE_CYCLE)
    const hasWu = cycles.has(WU_WU_CYCLE)
    const hasExtremeCycles = hasSheng || hasXie
    const hasNormalCycles = hasKe || hasWu

    if (hasSheng && hasXie) { // Extreme cycles cancel out
        if (hasKe) return WuxingTile.keMovement
        if (hasWu) return WuxingTile.wuMovement
        return WuxingTile.baseMovement
    }
    else if (hasExtremeCycles && hasNormalCycles) {
        if (hasSheng) return WuxingTile.shengMovement
        if (hasWu) return WuxingTile.xieMovement
    }

    return WuxingTile.baseMovement // IDK Man
}

export class WuxingTile {

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
     * @param {Array<WuxingBoardPoint>} sorroundingBPs Sorrounding board points around the tile
     * @param {boolean} isInGate If the current tile is in a gate
     * @returns {number} Moving distance based on its sorrounding conditions
     */
    getMoveDistance( sorroundingBPs, isInGate ) {

        if (this.code === WU_EMPTY) {
            return WuxingTile.emptyTileMovement // Not affected by cycles
        }

        if (!sorroundingBPs || isInGate) {
            return WuxingTile.baseMovement
        }

        const sorroundingTiles = sorroundingBPs
            .filter( bp => !bp.isType(GATE) ) // Tiles in gates do not count towards cycles
            .map( bp => bp.tile )
            .filter( tile => tile != null ) // Remove empty spaces

        if (sorroundingTiles.length === 0) {
            return WuxingTile.baseMovement // No cycles to identify lol
        }

        let cycles = new Set([""]) // We're gonna check every tile and see if it causes a cycle interaction
        for (const otherTile of sorroundingTiles) {
            if ( isTileInShengWithOther(this, otherTile) ) {
                cycles.add(WU_SHENG_CYCLE)
            }
            if ( isTileInXieWithOrder(this, otherTile) ) {
                cycles.add(WU_XIE_CYCLE)
            }
            if ( isTileInKeWithOther(this, otherTile) ) {
                cycles.add(WU_KE_CYCLE)
            }
            if ( isTileInWuWithOther(this, otherTile) ) {
                cycles.add(WU_WU_CYCLE)
            }
        }

        cycles.delete("")

        if (cycles.size === 1) {
            if (cycles.has(WU_SHENG_CYCLE)) {
                return WuxingTile.shengMovement
            }
            else if (cycles.has(WU_XIE_CYCLE)) {
                return WuxingTile.xieMovement
            }
            else if (cycles.has(WU_KE_CYCLE)) {
                return WuxingTile.keMovement
            }
            else if (cycles.has(WU_WU_CYCLE)) {
                return WuxingTile.wuMovement
            }
        }
        else {
            // Resolve cycle contridictments
            return resolvedMovementFromCycles(cycles)
        }

        return WuxingTile.baseMovement // IDK what happened here
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