
import { EDGES_MOVE_4_2, gameOptionEnabled } from "../GameOptions";
import { GUEST, HOST } from "../CommonNotationObjects";
import { tileIdIncrement } from '../skud-pai-sho/SkudPaiShoTile';

export const BeyondTheMapsTileType = {
	SHIP: "Ship",
	LAND: "Land"
};

class BeyondTheMapsTile {
	constructor(tileType, ownerCode) {
		this.tileType = tileType;
		this.ownerCode = ownerCode;
		if (this.ownerCode === 'G') {
			this.ownerName = GUEST;
		} else if (this.ownerCode === 'H') {
			this.ownerName = HOST;
		}
		this.id = tileIdIncrement();
	}

	getConsoleDisplay() {
		return this.ownerCode + "" + this.tileType;
	}

	getImageName() {
		return this.ownerCode + "" + this.tileType;
	}

	getNotationName() {
		return this.ownerCode + "" + this.tileType;
	}

	getName() {
		return BeyondTheMapsTile.getTileName(this.tileType);
	}

	getMoveDistance() {
		return gameOptionEnabled(EDGES_MOVE_4_2) ? 4 : 6;
	}

	getCopy() {
		return new BeyondTheMapsTile(this.tileType, this.ownerCode);
	}

	static getTileName(tileType) {
		return tileType;
	}

}

export default BeyondTheMapsTile;
