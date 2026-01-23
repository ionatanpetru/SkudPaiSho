/* Skud Pai Sho Harmony */

import { BASIC_FLOWER, debug } from '../GameData';
import { completeHarmony } from './SkudPaiShoRules';
import {
	GUEST,
	HOST,
	NotationPoint,
	RowAndColumn,
} from '../CommonNotationObjects';

export class SkudPaiShoHarmony {
	constructor(tile1, tile1RowAndColumn, tile2, tile2RowAndColumn, affectingLionTurtleTiles) {
		this.tile1 = tile1;
		this.tile1Pos = new RowAndColumn(tile1RowAndColumn.row, tile1RowAndColumn.col);
		this.tile2 = tile2;
		this.tile2Pos = new RowAndColumn(tile2RowAndColumn.row, tile2RowAndColumn.col);
		this.owners = [];

		const overrideOwner = affectingLionTurtleTiles.length > 0 && tile1.ownerCode !== tile2.ownerCode;

		if (overrideOwner) {
			for (let i = 0; i < affectingLionTurtleTiles.length; i++) {
				this.addOwner(affectingLionTurtleTiles[i].ownerCode,
					affectingLionTurtleTiles[i].ownerName);
			}
		} else {
			if (this.tile1.type === BASIC_FLOWER) {
				this.addOwner(this.tile1.ownerCode, this.tile1.ownerName);
			} else if (this.tile2.type === BASIC_FLOWER) {
				this.addOwner(this.tile2.ownerCode, this.tile2.ownerName);
			} else {
				debug("ERROR: HARMONY REQUIRES A BASIC FLOWER TILE");
			}
		}

		if (overrideOwner) {
			this.overwriteOtherHarmonyEntries = true;
		}
	}

	addOwner(ownerCode, ownerName) {
		if (!this.hasOwner(ownerName)) {
			this.owners.push({
				ownerCode: ownerCode,
				ownerName: ownerName
			});
		}
	}

	hasOwner(ownerName) {
		for (let i = 0; i < this.owners.length; i++) {
			if (this.owners[i].ownerName === ownerName) {
				return true;
			}
		}
	}

	equals(otherHarmony) {
		if (this.tile1 === otherHarmony.tile1 || this.tile1 === otherHarmony.tile2) {
			if (this.tile2 === otherHarmony.tile1 || this.tile2 === otherHarmony.tile2) {
				return true;
			}
		}
		return false;
	}

	notAnyOfThese(harmonies) {
		for (let i = 0; i < harmonies.length; i++) {
			if (this.equals(harmonies[i])) {
				return false;
			}
		}
		return true;
	}

	containsTile(tile) {
		return (this.tile1 === tile || this.tile2 === tile);
	}

	getTileThatIsNotThisOne(tile) {
		if (this.tile1 === tile) {
			return this.tile2;
		} else if (this.tile2 === tile) {
			return this.tile1;
		} else {
			debug("BOTH TILES ARE NOT THAT ONE!");
		}
	}

	containsTilePos(pos) {
		return this.tile1Pos.samesies(pos) || this.tile2Pos.samesies(pos);
	}

	getPosThatIsNotThisOne(pos) {
		if (this.tile1Pos.samesies(pos)) {
			return this.tile2Pos;
		} else if (this.tile2Pos.samesies(pos)) {
			return this.tile1Pos;
		} else {
			debug("	BOTH TILE POS ARE NOT THAT ONE!");
		}
	}

	getString() {
		return this.owners + " (" + this.tile1Pos.notationPointString + ")-(" + this.tile2Pos.notationPointString + ")";
	}

	getDirectionForTile(tile) {
		if (!this.containsTile(tile)) {
			return;
		}

		let thisPos = this.tile1Pos;	// Assume it's tile1
		let otherPos = this.tile2Pos;
		if (this.tile2.id === tile.id) {
			thisPos = this.tile2Pos;	// It's tile2!
			otherPos = this.tile1Pos;
		}

		if (thisPos.row === otherPos.row) {
			// Same row means East or West
			if (thisPos.col < otherPos.col) {
				return "East";
			} else {
				return "West";
			}
		} else if (thisPos.col === otherPos.col) {
			// Same col means North or South
			if (thisPos.row > otherPos.row) {
				return "North";
			} else {
				return "South";
			}
		}
	}

	crossesMidline() {
		let rowHigh = this.tile1Pos.row;
		let rowLow = this.tile2Pos.row;
		if (this.tile1Pos.row < this.tile2Pos.row) {
			rowHigh = this.tile2Pos.row;
			rowLow = this.tile1Pos.row;
		}

		if (rowHigh !== rowLow) {
			return rowHigh > 8 && rowLow < 8 && this.tile1Pos.col !== 8;
		}

		let colHigh = this.tile1Pos.col;
		let colLow = this.tile2Pos.col;
		if (this.tile1Pos.col < this.tile2Pos.col) {
			colHigh = this.tile2Pos.col;
			colLow = this.tile1Pos.col;
		}

		if (colHigh !== colLow) {
			return colHigh > 8 && colLow < 8 && this.tile1Pos.row !== 8;
		}
	}

	crossesCenter() {
		let rowHigh = this.tile1Pos.row;
		let rowLow = this.tile2Pos.row;
		if (this.tile1Pos.row < this.tile2Pos.row) {
			rowHigh = this.tile2Pos.row;
			rowLow = this.tile1Pos.row;
		}

		if (rowHigh !== rowLow) {
			return rowHigh > 8 && rowLow < 8;
		}

		let colHigh = this.tile1Pos.col;
		let colLow = this.tile2Pos.col;
		if (this.tile1Pos.col < this.tile2Pos.col) {
			colHigh = this.tile2Pos.col;
			colLow = this.tile1Pos.col;
		}

		if (colHigh !== colLow) {
			return colHigh > 8 && colLow < 8;
		}
	}
}


// --------------------------------------------- //


// HarmonyManager manages list of harmonies
export class SkudPaiShoHarmonyManager {
	constructor() {
		this.harmonies = [];
	}

	printHarmonies() {
		debug("All Harmonies:");
		for (let i = 0; i < this.harmonies.length; i++) {
			debug(this.harmonies[i].getString());
		}
	}

	getHarmoniesWithThisTile(tile) {
		const results = [];
		this.harmonies.forEach(function(harmony) {
			if (harmony.containsTile(tile)) {
				results.push(harmony);
			}
		});
		return results;
	}

	addHarmony(harmony) {
		// Add harmony if it doesn't already exist

		// Does it exist in old set of harmonies?
		const harmonyIndexesToRemove = [];
		let exists = false;
		for (let j = 0; j < this.harmonies.length; j++) {
			if (harmony.equals(this.harmonies[j])) {
				const existingHarmony = this.harmonies[j];
				exists = true;
				if (harmony.overwriteOtherHarmonyEntries) {
					harmonyIndexesToRemove.push(j);
					exists = false;
				}
			}
		}

		for (let i = 0; i < harmonyIndexesToRemove.length; i++) {
			this.harmonies.splice(harmonyIndexesToRemove[i], 1);
		}

		if (!exists) {
			this.harmonies.push(harmony);
		} else {
			// debug("Harmony exists, ignoring");
		}
	}

	addHarmonies(harmoniesToAdd) {
		if (!harmoniesToAdd) {
			return;
		}

		for (let i = 0; i < harmoniesToAdd.length; i++) {
			this.addHarmony(harmoniesToAdd[i]);
		}
	}

	clearList() {
		this.harmonies = [];
	}

	numHarmoniesForPlayer(player) {
		let count = 0;
		for (let i = 0; i < this.harmonies.length; i++) {
			if (this.harmonies[i].hasOwner(player)) {
				count++;
			}
		}
		return count;
	}

	getPlayerWithMostHarmonies() {
		const hostCount = this.numHarmoniesForPlayer(HOST);
		const guestCount = this.numHarmoniesForPlayer(GUEST);

		if (guestCount > hostCount) {
			return GUEST;
		} else if (hostCount > guestCount) {
			return HOST;
		}
	}

	getPlayerWithMostHarmoniesCrossingMidlines() {
		const hostCount = this.getNumCrossingMidlinesForPlayer(HOST);
		const guestCount = this.getNumCrossingMidlinesForPlayer(GUEST);

		debug("Host harmonies crossing midlines: " + hostCount);
		debug("Guest harmonies crossing midlines: " + guestCount);

		if (guestCount > hostCount) {
			return GUEST;
		} else if (hostCount > guestCount) {
			return HOST;
		}
	}

	getNumCrossingMidlinesForPlayer(player) {
		let count = 0;
		for (let i = 0; i < this.harmonies.length; i++) {
			if (this.harmonies[i].hasOwner(player)) {
				if (this.harmonies[i].crossesMidline()) {
					count++;
				}
			}
		}
		return count;
	}

	getNumCrossingCenterForPlayer(player) {
		let count = 0;
		for (let i = 0; i < this.harmonies.length; i++) {
			if (this.harmonies[i].hasOwner(player)) {
				if (this.harmonies[i].crossesCenter()) {
					count++;
				}
			}
		}
		return count;
	}

	ringLengthForPlayer(player) {
		const rings = this.getHarmonyChains();
		let longest = 0;

		for (let i = 0; i < rings.length; i++) {
			const ring = rings[i];
			const h = ring.pop();	// LOL
			if (h.hasOwner(player)) {
				const veryNice = true;
				if (veryNice && ring.length > longest) {
					longest = ring.length;
				}
			}
		}

		return longest;
	}

	getPlayerWithLongestChain() {
		const hostLength = this.ringLengthForPlayer(HOST);
		const guestLength = this.ringLengthForPlayer(GUEST);

		if (guestLength > hostLength) {
			return GUEST;
		} else if (hostLength > guestLength) {
			return HOST;
		}
	}

	hasNewHarmony(player, oldHarmonies) {
		// There's a new harmony if a player's tile has a harmony with a tile it didn't before

		// If current harmony list has one that oldHarmonies does not
		const newHarmonies = [];

		for (let i = 0; i < this.harmonies.length; i++) {

			// Does it belong to player?
			if (this.harmonies[i].hasOwner(player)) {

				// Does it exist in old set of harmonies?
				let exists = false;
				for (let j = 0; j < oldHarmonies.length; j++) {
					if (this.harmonies[i].equals(oldHarmonies[j])
						&& oldHarmonies[j].hasOwner(player)) {
						// Existing Harmony
						exists = true;
					}
				}

				if (!exists) {
					newHarmonies.push(this.harmonies[i]);
				}
			}
		}

		return newHarmonies.length > 0;
	}

	getHarmonyChains() {
		const self = this;

		const rings = [];

		for (let i = 0; i < this.harmonies.length; i++) {
			const hx = this.harmonies[i];

			const chain = [];
			chain.push(hx);

			const startTile = hx.tile2;
			const startTilePos = hx.tile2Pos;
			const targetTile = hx.tile1;
			const targetTilePos = hx.tile1Pos;

			const foundRings = this.lookForRings(startTile, targetTile, chain);

			if (foundRings && foundRings.length > 0) {
				foundRings.forEach(function(ringThatWasFound) {
					let ringExists = false;
					rings.forEach(function(ring) {
						if (self.ringsMatch(ring, ringThatWasFound)) {
							ringExists = true;
						}
					});
					if (!ringExists) {
						rings.push(ringThatWasFound);
					}
				});
			}
		}

		if (rings.length > 0) {
			debug("Rings Found:");
			debug(rings);
		}

		return rings;

		/* Previously:
		const ringFound = this.lookForRing(startTile, targetTile, chain);
			if (ringFound[0]) {
				const ringExists = false;
				rings.forEach(function(ring) {
					if (self.ringsMatch(ring, ringFound[1])) {
						ringExists = true;
					}
				});
				if (!ringExists) {
					rings.push(ringFound[1]);
				}
			}
		}
		return rings;
		 */
	}

	harmonyRingExists() {
		// Chain of harmonies around the center of the board

		const self = this;

		// var rings = [];
		const rings = this.getHarmonyChains();

		const verifiedHarmonyRingOwners = [];
		rings.forEach(function(ring) {
			debug(ring);
			const playerName = self.verifyHarmonyRing(ring);
			if (playerName) {
				verifiedHarmonyRingOwners.push(playerName);
			}
		});

		// return verifiedHarmonyRings.length > 0;
		return verifiedHarmonyRingOwners;
	}

	ringContains345(ring) {
		//
		let has3 = false;
		let has4 = false;
		let has5 = false;
		for (let i = 0; i < ring.length; i++) {
			const h = ring[i];
			if (h.tile1.basicValue === '3') {
				has3 = true;
			}
			if (h.tile1.basicValue === '4') {
				has4 = true;
			}
			if (h.tile1.basicValue === '5') {
				has5 = true;
			}
			if (h.tile2.basicValue === '3') {
				has3 = true;
			}
			if (h.tile2.basicValue === '4') {
				has4 = true;
			}
			if (h.tile2.basicValue === '5') {
				has5 = true;
			}
		}

		return has3 && has4 && has5;
	}

	// I think this works.
	verifyHarmonyRing(ring) {
		// Verify harmonies in ring go around center of board
		// debug("In verifyHarmonyRing()");

		// If completeHarmony rule, ring must contain harmonies of 3, 4, and 5 flower tiles
		if (completeHarmony && !this.ringContains345(ring)) {
			return false;
		}

		// We have to go through the harmonies and create an array of the points of the 'shape' that the harmony ring makes
		const shapePoints = [];

		// playerName is the player that's an owner on all rings
		let allHaveHost = true;
		let allHaveGuest = true;
		for (let i = 0; i < ring.length; i++) {
			if (!ring[i].hasOwner(HOST)) {
				allHaveHost = false;
			}
			if (!ring[i].hasOwner(GUEST)) {
				allHaveGuest = false;
			}
		}

		let playerNames = "";
		if (allHaveHost && allHaveGuest) {
			playerNames = "Host and Guest";
		} else if (allHaveHost) {
			playerNames = HOST;
		} else if (allHaveGuest) {
			playerNames = GUEST;
		}

		let h = ring.pop();	// LOL

		shapePoints.push(new NotationPoint(h.tile1Pos.notationPointString).toArr());
		shapePoints.push(new NotationPoint(h.tile2Pos.notationPointString).toArr());

		let lastTilePos = h.tile2Pos;

		let count = 0;
		while (ring.length > 0 && count < 400) {
			// Go through ring and find next point in the harmony 'shape'
			for (let i = 0; i < ring.length; i++) {
				h = ring[i];
				if (h.containsTilePos(lastTilePos)) {
					lastTilePos = h.getPosThatIsNotThisOne(lastTilePos);
					const np = new NotationPoint(lastTilePos.notationPointString);
					if (!np.samesies(new NotationPoint(shapePoints[0][0] + "," + shapePoints[0][1]))) {
						shapePoints.push(np.toArr());
					}
					ring.splice(i, 1);
				}
			}
			count++;
			// debug("last tile Pos: " + lastTilePos.notationPointString);
			// ring.forEach(function(h){ debug(h.tile1Pos.notationPointString + " - " + h.tile2Pos.notationPointString); });
			// debug("-----")
		}

		if (count > 390) {
			debug("THERE WAS A PROBLEM CONNECTING THE DOTS");
			return false;
		}

		// shapePoints.forEach(function(np){ debug(np); });

		// // set up a ridiculously crazy test!
		// var targetPoint = new NotationPoint("0,0");
		// var polygon = [[-1,2],[2,2],[2,-2],[-3,-2],[-3,1],[-2,1],[-2,-1],[1,-1],[1,1],[-1,1]];
		// if (this.isPointInsideShape(targetPoint, polygon)) {
		// 	debug("target point was found but I expected it not to be. FAIL.");
		// } else {
		// 	debug("THE TEST HAS PASSED.");
		// }


		if (this.isCenterInsideShape(shapePoints)) {
			// debug("WINNER");
			return playerNames;
		} else {
			return false;
		}
	}


	/** Don't touch this magic... 
	Polygon shape checking based off of https://github.com/substack/point-in-polygon under MIT License:
	
	The MIT License (MIT)
	
	Copyright (c) 2016 James Halliday
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
	**/
	isPointInsideShape(notationPoint, shapePoints) {
		const x = notationPoint.x;
		const y = notationPoint.y;

		let inside = false;
		for (let i = 0, j = shapePoints.length - 1; i < shapePoints.length; j = i++) {
			const xi = shapePoints[i][0], yi = shapePoints[i][1];
			const xj = shapePoints[j][0], yj = shapePoints[j][1];

			// If on the line, doesn't count...
			if ((xi === x && xj === x && xi * xj)) {
				return false;
			}

			const intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) {
				inside = !inside;
			}
		}

		return inside;
	}

	isPointInsideShape_alternate(notationPoint, poly) {
		const pt = [notationPoint.x, notationPoint.y];
		let c = false;
		for (let i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
			((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1]))
				&& (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
				&& (c = !c);
		return c;
	}

	/* Working function */
	isCenterInsideShapeOld(shapePoints) {
		const x = 0;
		const y = 0;
		let inside = false;
		for (let i = 0, j = shapePoints.length - 1; i < shapePoints.length; j = i++) {
			const xi = shapePoints[i][0], yi = shapePoints[i][1];
			const xj = shapePoints[j][0], yj = shapePoints[j][1];

			// If on the line, doesn't count...
			if ((xi === 0 && xj === 0 && yi * yj < 0)
				|| (yi === 0 && yj === 0 && xi * xj < 0)) {
				debug("Crosses center, cannot count");
				return false;
			}

			// If one of the points is 0,0 that won't count...
			if ((xi === 0 && yi === 0) || (xj === 0 && yj === 0)) {
				debug("On center point, cannot count");
				return false;
			}

			const intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) {
				inside = !inside;
			}
		}

		return inside;
	}

	/* Based on Winding Number algorithm https://gist.github.com/thejambi/6ae53b6ab2636c8aff367195efeb4f44 */
	isCenterInsideShape(vs) {
		const x = 0;
		const y = 0;

		let wn = 0;
		// var crossesCenterCount = 0;
		// var crossesCenterAllowed = 0;

		for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
			// if (i === 7) {
			// 	crossesCenterAllowed++;
			// }

			const xi = parseFloat(vs[i][0]), yi = parseFloat(vs[i][1]);
			const xj = parseFloat(vs[j][0]), yj = parseFloat(vs[j][1]);

			// If on the line, doesn't count...
			if ((xi === 0 && xj === 0 && yi * yj < 0)
				|| (yi === 0 && yj === 0 && xi * xj < 0)) {
				debug("Crosses center, cannot count");	// Consider allowing a maximum number of "crossing center" harmonies depending on number of harmonies in chain. 4? None allowed. How many can allow for one?
				return false;
				// crossesCenterCount++;
			}

			// If one of the points is 0,0 that won't count...
			if ((xi === 0 && yi === 0) || (xj === 0 && yj === 0)) {
				debug("On center point, cannot count");
				return false;
			}

			if (yj <= y) {
				if (yi > y) {
					if (this.isLeft([xj, yj], [xi, yi], [x, y]) > 0) {
						wn++;
					}
				}
			} else {
				if (yi <= y) {
					if (this.isLeft([xj, yj], [xi, yi], [x, y]) < 0) {
						wn--;
					}
				}
			}
		}

		// return wn != 0 && crossesCenterCount <= crossesCenterAllowed;
		return wn != 0;
	}
	isLeft(P0, P1, P2) {
		const res = ((P1[0] - P0[0]) * (P2[1] - P0[1])
			- (P2[0] - P0[0]) * (P1[1] - P0[1]));
		return res;
	}


	ringsMatch(ring1, ring2) {
		// Must be same size to qualify as matching
		if (ring1.length !== ring2.length) {
			return false;
		}

		// They're the same length if we're here
		// Now, all harmonies must match 
		let h1Matches = false;
		let definitelyMatches = true;
		ring1.forEach(function(h1) {
			h1Matches = false;
			ring2.forEach(function(h2) {
				if (h1.equals(h2)) {
					h1Matches = true;
				}
			});
			if (!h1Matches) {
				definitelyMatches = false;
				return false;
			}
		});

		return definitelyMatches;
	}

	lookForRings(t1, tx, originalChain) {
		let rings = [];
		const keepLookingAtTheseHarmonies = [];
		for (let i = 0; i < this.harmonies.length; i++) {	// Any complete rings?
			const currentChain = originalChain.slice();
			const hx = this.harmonies[i];
			if (hx.containsTile(t1) && hx.notAnyOfThese(currentChain)) {
				currentChain.push(hx);
				if (hx.containsTile(tx)) {	// Complete ring found
					rings.push(currentChain);
				} else {
					keepLookingAtTheseHarmonies.push(hx);
				}
			}
		}
		for (let i = 0; i < this.harmonies.length; i++) {
			let currentChain = originalChain.slice();
			const hx = this.harmonies[i];
			if (keepLookingAtTheseHarmonies.includes(hx)) {
				currentChain.push(hx);
				const newStartTile = hx.getTileThatIsNotThisOne(t1);
				rings = rings.concat(this.lookForRings(newStartTile, tx, currentChain));
			}
		}
		return rings;
	}

	lookForRing(t1, tx, chain) {
		// Look for different harmony that includes t1
		for (let i = 0; i < this.harmonies.length; i++) {
			const hx = this.harmonies[i];
			if (hx.containsTile(t1) && hx.notAnyOfThese(chain)) {
				chain.push(hx);
				if (hx.containsTile(tx)) {
					return [true, chain];
				} else {
					const newStartTile = hx.getTileThatIsNotThisOne(t1);
					return this.lookForRing(newStartTile, tx, chain);
				}
			}
		}
		return [false];
	}
}






