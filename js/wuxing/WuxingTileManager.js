import { gameOptionEnabled, WUXING_EMPTY_TILE } from "../GameOptions";
import { WU_EARTH, WU_EMPTY, WU_FIRE, WU_METAL, WU_WATER, WU_WOOD, WuxingTile } from "./WuxingTile";

export class WuxingTileManager {

    /** @type {Array<WuxingTile>} */
    hostTiles

    /** @type {Array<WuxingTile>} */
    guestTiles

    constructor() {
        this.hostTiles = this.loadTileSet('H')
        this.guestTiles = this.loadTileSet('G')
    }

    /**
     * 
     * @param {'G' | 'H'} tileCode
     * @returns {Array<WuxingTile>} array of tiles
     */
    loadTileSet(ownerCode) {
        let tiles = []

        tiles.push(
            new WuxingTile(WU_WOOD, ownerCode),
            new WuxingTile(WU_WOOD, ownerCode),
            new WuxingTile(WU_WOOD, ownerCode),
            new WuxingTile(WU_EARTH, ownerCode),
            new WuxingTile(WU_EARTH, ownerCode),
            new WuxingTile(WU_EARTH, ownerCode),
            new WuxingTile(WU_WATER, ownerCode),
            new WuxingTile(WU_WATER, ownerCode),
            new WuxingTile(WU_WATER, ownerCode),
            new WuxingTile(WU_FIRE, ownerCode),
            new WuxingTile(WU_FIRE, ownerCode),
            new WuxingTile(WU_FIRE, ownerCode),
            new WuxingTile(WU_METAL, ownerCode),
            new WuxingTile(WU_METAL, ownerCode),
            new WuxingTile(WU_METAL, ownerCode),
        )

        if (gameOptionEnabled(WUXING_EMPTY_TILE) ) {
            tiles.push( new WuxingTile(WU_EMPTY, ownerCode) )
        }

        return tiles
    }

    grabTile( player, tileCode ) {}
}