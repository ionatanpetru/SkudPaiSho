import { GUEST, HOST } from "../CommonNotationObjects";
import { debug } from "../GameData";
import { gameOptionEnabled, GODAI_EMPTY_TILE } from "../GameOptions";
import { GO_EARTH, GO_EMPTY, GO_FIRE, GO_METAL, GO_WATER, GO_WOOD, GodaiTile } from "./GodaiTile";

export class GodaiTileManager {

    /** @type {Array<GodaiTile>} */
    hostTiles

    /** @type {Array<GodaiTile>} */
    guestTiles

    /** @type {Array<GodaiTile>} */
    capturedHostTiles

    /** @type {Array<GodaiTile} */
    capturedGuestTiles

    constructor() {
        this.hostTiles = this.loadTileSet('H')
        this.guestTiles = this.loadTileSet('G')

        this.capturedHostTiles = []
        this.capturedGuestTiles = []
    }

    /**
     * 
     * @param {'G' | 'H'} tileCode
     * @returns {Array<GodaiTile>} array of tiles
     */
    loadTileSet(ownerCode) {
        let tiles = []

        tiles.push(
            new GodaiTile(GO_WOOD, ownerCode),
            new GodaiTile(GO_WOOD, ownerCode),
            new GodaiTile(GO_WOOD, ownerCode),
            new GodaiTile(GO_EARTH, ownerCode),
            new GodaiTile(GO_EARTH, ownerCode),
            new GodaiTile(GO_EARTH, ownerCode),
            new GodaiTile(GO_WATER, ownerCode),
            new GodaiTile(GO_WATER, ownerCode),
            new GodaiTile(GO_WATER, ownerCode),
            new GodaiTile(GO_FIRE, ownerCode),
            new GodaiTile(GO_FIRE, ownerCode),
            new GodaiTile(GO_FIRE, ownerCode),
            new GodaiTile(GO_METAL, ownerCode),
            new GodaiTile(GO_METAL, ownerCode),
            new GodaiTile(GO_METAL, ownerCode),
        )

        if (gameOptionEnabled(GODAI_EMPTY_TILE) ) {
            tiles.push( new GodaiTile(GO_EMPTY, ownerCode) )
        }

        return tiles
    }

    /**
     * Grabs a tile from the corresponding tile and returns it.
     * @param {string} player HOST or GUEST
     * @param {string} tileCode tilecode
     * @returns {GodaiTile | null}
     */
    grabTile( player, tileCode ) {
        let tilePile = player == HOST ? this.hostTiles : this.guestTiles

        /** @type {GodaiTile} */
        let tile
        for (var i = 0; i < tilePile.length; i++) {
            if (tilePile[i].code === tileCode) {
                var newTileArr = tilePile.splice(i, 1);
                tile = newTileArr[0];
                break;
            }
        }

        if (!tile) {
            debug("And we didn't get any tiles from params: " + player + " " + tileCode)
        }

        return tile
    }

    peekTile(player, tileCode, tileId) {
        let tilePile = player === HOST ? this.hostTiles : this.guestTiles

        if (tileId) {
            for (let i = 0; i < tilePile.length; i++) {
                if (tilePile[i].id === tileId) {
                    return tilePile[i]
                }
            }
        }

        for (let i = 0; i < tilePile.length; i++) {
            if (tilePile[i].code === tileCode) {
                return tilePile[i]
            }
        }
    }

    /**
     * 
     * @param {GodaiTile} tile 
     * @param {string} playerCode GUEST or HOST
     */
    addToCapturedTiles(tile, playerCode) {
        if (playerCode === GUEST) {
            this.capturedGuestTiles.push(tile)
        }
        else if (playerCode === HOST) {
            this.capturedHostTiles.push(tile)
        }
    }

    removeSelectedTileFlags() {
        this.hostTiles.forEach( tile => tile.selectedFromPile = false )
        this.guestTiles.forEach( tile => tile.selectedFromPile = false )
    }
}