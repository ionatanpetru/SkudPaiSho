/* Pai Sho Games Tile Metadata */

export var currentTileMetadata = {};
export var currentTileCodes = {};
export var currentTileNames = {};

export function setCurrentTileMetadata(newTileMetadata) {
	currentTileMetadata = newTileMetadata;
}
export function getCurrentTileMetadata() {
	return currentTileMetadata;
}

export function setCurrentTileCodes(newTileCodes) {
	currentTileCodes = newTileCodes;
}
export function getCurrentTileCodes() {
	return currentTileCodes;
}

export function setCurrentTileNames(newTileNames) {
	currentTileNames = newTileNames;
}
export function getCurrentTileNames() {
	return currentTileNames;
}

