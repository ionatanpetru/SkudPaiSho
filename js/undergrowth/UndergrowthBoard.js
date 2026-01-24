// Board

import {
  GATE,
  NON_PLAYABLE,
  POSSIBLE_MOVE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { GUEST, HOST, RowAndColumn } from '../CommonNotationObjects';
import { PaiShoBoardHelper } from '../pai-sho-common/PaiShoBoardHelp';
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';
import { UndergrowthBoardPoint } from './UndergrowthBoardPoint';
import {
  UndergrowthHarmony,
  UndergrowthHarmonyManager
} from './UndergrowthHarmony';

export function UndergrowthBoard() {
	this.size = new RowAndColumn(17, 17);

	this.boardHelper = new PaiShoBoardHelper(UndergrowthBoardPoint, this.size);

	this.cells = this.brandNew();

	this.harmonyManager = new UndergrowthHarmonyManager();

	this.rockRowAndCols = [];
	this.playedWhiteLotusTiles = [];
}

UndergrowthBoard.prototype.brandNew = function () {
	return this.boardHelper.generateBoardCells();
};

UndergrowthBoard.prototype.placeTile = function (tile, notationPoint) {
	this.boardHelper.putTileOnPoint(tile, notationPoint, this.cells);
	this.analyzeHarmonies();

	var capturedTilesInfo = [];

	var lastCapturedTilesInfo = this.captureTilesWithAtLeastTwoDisharmonies();
	this.analyzeHarmonies();

	/* Captured tiles may cause addititional disharmonies to form, which can cause other tiles to be captured. */
	while (lastCapturedTilesInfo.length > 0) {
		capturedTilesInfo = capturedTilesInfo.concat(lastCapturedTilesInfo);

		lastCapturedTilesInfo = this.captureTilesWithAtLeastTwoDisharmonies();

		this.analyzeHarmonies();
	}

	return capturedTilesInfo;
};

UndergrowthBoard.prototype.captureTilesWithAtLeastTwoDisharmonies = function() {
	var pointsToCapture = [];

	var capturedTilesInfo = [];

	var self = this;
	this.forEachBoardPointWithTile(function(boardPointWithTile) {
		var tileClashes = self.getTileClashes(boardPointWithTile.tile, boardPointWithTile);
		if (tileClashes.length >= 2) {
			pointsToCapture.push(boardPointWithTile);
		}
	});

	pointsToCapture.forEach(function(pointToCaptureFrom) {
		capturedTilesInfo.push({
			boardPoint: pointToCaptureFrom,
			capturedTile: pointToCaptureFrom.removeTile()
		})
	});

	return capturedTilesInfo;
};

UndergrowthBoard.prototype.forEachBoardPoint = function(forEachFunc) {
	this.cells.forEach(function(row) {
		row.forEach(function(boardPoint) {
			if (!boardPoint.isType(NON_PLAYABLE)) {
				forEachFunc(boardPoint);
			}
		});
	});
};
UndergrowthBoard.prototype.forEachBoardPointWithTile = function(forEachFunc) {
	this.forEachBoardPoint(function(boardPoint) {
		if (boardPoint.hasTile()) {
			forEachFunc(boardPoint);
		}
	});
};

UndergrowthBoard.prototype.markSpacesBetweenHarmonies = function () {
	// And Clashes!

	// Unmark all
	this.cells.forEach(function (row) {
		row.forEach(function (boardPoint) {
			boardPoint.betweenHarmony = false;
			boardPoint.betweenHarmonyHost = false; // Harmony
			boardPoint.betweenHarmonyGuest = false; // Clash
		});
	});

	// Go through harmonies, mark the spaces between them
	var self = this;
	this.harmonyManager.harmonies.forEach(function (harmony) {
		// harmony.tile1Pos.row (for example)
		// Harmony will be in same row or same col
		if (harmony.tile1Pos.row === harmony.tile2Pos.row) {
			// Get smaller of the two
			var row = harmony.tile1Pos.row;
			var firstCol = harmony.tile1Pos.col;
			var lastCol = harmony.tile2Pos.col;
			if (harmony.tile2Pos.col < harmony.tile1Pos.col) {
				firstCol = harmony.tile2Pos.col;
				lastCol = harmony.tile1Pos.col;
			}
			for (var col = firstCol + 1; col < lastCol; col++) {
				self.cells[row][col].betweenHarmony = true;
				// if (harmony.ownerName === GUEST) {
				// 	self.cells[row][col].betweenHarmonyGuest = true;
				// } else if (harmony.ownerName === HOST) {
				self.cells[row][col].betweenHarmonyHost = true;
				// }
			}
		} else if (harmony.tile2Pos.col === harmony.tile2Pos.col) {
			// Get smaller of the two
			var col = harmony.tile1Pos.col;
			var firstRow = harmony.tile1Pos.row;
			var lastRow = harmony.tile2Pos.row;
			if (harmony.tile2Pos.row < harmony.tile1Pos.row) {
				firstRow = harmony.tile2Pos.row;
				lastRow = harmony.tile1Pos.row;
			}
			for (var row = firstRow + 1; row < lastRow; row++) {
				self.cells[row][col].betweenHarmony = true;
				// if (harmony.ownerName === GUEST) {
				// 	self.cells[row][col].betweenHarmonyGuest = true;
				// } else if (harmony.ownerName === HOST) {
				self.cells[row][col].betweenHarmonyHost = true;
				// }
			}
		}
	});

	this.harmonyManager.clashes.forEach(function (harmony) {
		// harmony.tile1Pos.row (for example)
		// Harmony will be in same row or same col
		if (harmony.tile1Pos.row === harmony.tile2Pos.row) {
			// Get smaller of the two
			var row = harmony.tile1Pos.row;
			var firstCol = harmony.tile1Pos.col;
			var lastCol = harmony.tile2Pos.col;
			if (harmony.tile2Pos.col < harmony.tile1Pos.col) {
				firstCol = harmony.tile2Pos.col;
				lastCol = harmony.tile1Pos.col;
			}
			for (var col = firstCol + 1; col < lastCol; col++) {
				self.cells[row][col].betweenHarmony = true;
				self.cells[row][col].betweenHarmonyGuest = true; // Used for clashes
			}
		} else if (harmony.tile2Pos.col === harmony.tile2Pos.col) {
			// Get smaller of the two
			var col = harmony.tile1Pos.col;
			var firstRow = harmony.tile1Pos.row;
			var lastRow = harmony.tile2Pos.row;
			if (harmony.tile2Pos.row < harmony.tile1Pos.row) {
				firstRow = harmony.tile2Pos.row;
				lastRow = harmony.tile1Pos.row;
			}
			for (var row = firstRow + 1; row < lastRow; row++) {
				self.cells[row][col].betweenHarmony = true;
				self.cells[row][col].betweenHarmonyGuest = true;
			}
		}
	});
};

UndergrowthBoard.prototype.analyzeHarmonies = function () {
	// We're going to find all harmonies on the board - And Disharmonies!

	// Check along all rows, then along all columns.. Or just check all tiles?
	this.harmonyManager.clearList();

	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var boardPoint = this.cells[row][col];
			if (boardPoint.hasTile()) {
				var tileHarmonies = this.getTileHarmonies(boardPoint.tile, boardPoint);
				this.harmonyManager.addHarmonies(tileHarmonies);

				var tileClashes = this.getTileClashes(boardPoint.tile, boardPoint);
				this.harmonyManager.addClashes(tileClashes);

				boardPoint.tile.inHarmony = tileHarmonies.length > 0;
				boardPoint.tile.inClash = tileClashes.length > 0;
			}
		}
	}

	this.markSpacesBetweenHarmonies();
};

UndergrowthBoard.prototype.getTileHarmonies = function (tile, boardPoint) {
	var tileHarmonies = [];

	var leftHarmony = this.getHarmonyLeft(tile, boardPoint);
	if (leftHarmony) {
		tileHarmonies.push(leftHarmony);
	}

	var rightHarmony = this.getHarmonyRight(tile, boardPoint);
	if (rightHarmony) {
		tileHarmonies.push(rightHarmony);
	}

	var upHarmony = this.getHarmonyUp(tile, boardPoint);
	if (upHarmony) {
		tileHarmonies.push(upHarmony);
	}

	var downHarmony = this.getHarmonyDown(tile, boardPoint);
	if (downHarmony) {
		tileHarmonies.push(downHarmony);
	}

	return tileHarmonies;
};

UndergrowthBoard.prototype.getHarmonyLeft = function (tile, boardPoint) {
	var colToCheck = boardPoint.col - 1;

	while (colToCheck >= 0 && !this.cells[boardPoint.row][colToCheck].hasTile()
			&& !this.cells[boardPoint.row][colToCheck].isType(GATE)) {
		colToCheck--;
	}

	if (colToCheck >= 0) {
		var checkPoint = this.cells[boardPoint.row][colToCheck];
		if (tile.formsHarmonyWith(checkPoint.tile)
				&& !(checkPoint.isType(GATE) && boardPoint.isType(GATE))) {
			var harmony = new UndergrowthHarmony(tile, boardPoint, checkPoint.tile, new RowAndColumn(boardPoint.row, colToCheck));
			return harmony;
		}
	}
};

UndergrowthBoard.prototype.getHarmonyRight = function (tile, boardPoint) {
	var colToCheck = boardPoint.col + 1;

	while (colToCheck <= 16 && !this.cells[boardPoint.row][colToCheck].hasTile()
			&& !this.cells[boardPoint.row][colToCheck].isType(GATE)) {
		colToCheck++;
	}

	if (colToCheck <= 16) {
		var checkPoint = this.cells[boardPoint.row][colToCheck];
		if (tile.formsHarmonyWith(checkPoint.tile)
				&& !(checkPoint.isType(GATE) && boardPoint.isType(GATE))) {
			var harmony = new UndergrowthHarmony(tile, boardPoint, checkPoint.tile, new RowAndColumn(boardPoint.row, colToCheck));
			return harmony;
		}
	}
};

UndergrowthBoard.prototype.getHarmonyUp = function (tile, boardPoint) {
	var rowToCheck = boardPoint.row - 1;

	while (rowToCheck >= 0 && !this.cells[rowToCheck][boardPoint.col].hasTile()
			&& !this.cells[rowToCheck][boardPoint.col].isType(GATE)) {
		rowToCheck--;
	}

	if (rowToCheck >= 0) {
		var checkPoint = this.cells[rowToCheck][boardPoint.col];
		if (tile.formsHarmonyWith(checkPoint.tile)
				&& !(checkPoint.isType(GATE) && boardPoint.isType(GATE))) {
			var harmony = new UndergrowthHarmony(tile, boardPoint, checkPoint.tile, new RowAndColumn(rowToCheck, boardPoint.col));
			return harmony;
		}
	}
};

UndergrowthBoard.prototype.getHarmonyDown = function (tile, boardPoint) {
	var rowToCheck = boardPoint.row + 1;

	while (rowToCheck <= 16 && !this.cells[rowToCheck][boardPoint.col].hasTile()
			&& !this.cells[rowToCheck][boardPoint.col].isType(GATE)) {
		rowToCheck++;
	}

	if (rowToCheck <= 16) {
		var checkPoint = this.cells[rowToCheck][boardPoint.col];
		if (tile.formsHarmonyWith(checkPoint.tile)
				&& !(checkPoint.isType(GATE) && boardPoint.isType(GATE))) {
			var harmony = new UndergrowthHarmony(tile, boardPoint, checkPoint.tile, new RowAndColumn(rowToCheck, boardPoint.col));
			return harmony;
		}
	}
};

UndergrowthBoard.prototype.getTileClashes = function (tile, boardPoint) {
	var tileHarmonies = [];

	if (!boardPoint.isType(GATE)) {

		var rowAndCol = new RowAndColumn(boardPoint.row, boardPoint.col)

		var leftHarmony = this.getClashLeft(tile, rowAndCol);
		if (leftHarmony) {
			tileHarmonies.push(leftHarmony);
		}

		var rightHarmony = this.getClashRight(tile, rowAndCol);
		if (rightHarmony) {
			tileHarmonies.push(rightHarmony);
		}

		var upHarmony = this.getClashUp(tile, rowAndCol);
		if (upHarmony) {
			tileHarmonies.push(upHarmony);
		}

		var downHarmony = this.getClashDown(tile, rowAndCol);
		if (downHarmony) {
			tileHarmonies.push(downHarmony);
		}

	}

	return tileHarmonies;
};

UndergrowthBoard.prototype.getClashLeft = function (tile, endRowCol) {
	var colToCheck = endRowCol.col - 1;

	while (colToCheck >= 0 && !this.cells[endRowCol.row][colToCheck].hasTile()
			&& !this.cells[endRowCol.row][colToCheck].isType(GATE)) {
		colToCheck--;
	}

	if (colToCheck >= 0) {
		var checkPoint = this.cells[endRowCol.row][colToCheck];
		if (!checkPoint.isType(GATE) && tile.clashesWith(checkPoint.tile)) {
			var harmony = new UndergrowthHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(endRowCol.row, colToCheck));
			return harmony;
		}
	}
};

UndergrowthBoard.prototype.getClashRight = function (tile, endRowCol) {
	var colToCheck = endRowCol.col + 1;

	while (colToCheck <= 16 && !this.cells[endRowCol.row][colToCheck].hasTile()
			&& !this.cells[endRowCol.row][colToCheck].isType(GATE)) {
		colToCheck++;
	}

	if (colToCheck <= 16) {
		var checkPoint = this.cells[endRowCol.row][colToCheck];
		if (!checkPoint.isType(GATE) && tile.clashesWith(checkPoint.tile)) {
			var harmony = new UndergrowthHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(endRowCol.row, colToCheck));
			return harmony;
		}
	}
};

UndergrowthBoard.prototype.getClashUp = function (tile, endRowCol) {
	var rowToCheck = endRowCol.row - 1;

	while (rowToCheck >= 0 && !this.cells[rowToCheck][endRowCol.col].hasTile()
			&& !this.cells[rowToCheck][endRowCol.col].isType(GATE)) {
		rowToCheck--;
	}

	if (rowToCheck >= 0) {
		var checkPoint = this.cells[rowToCheck][endRowCol.col];
		if (!checkPoint.isType(GATE) && tile.clashesWith(checkPoint.tile)) {
			var harmony = new UndergrowthHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(rowToCheck, endRowCol.col));
			return harmony;
		}
	}
};

UndergrowthBoard.prototype.getClashDown = function (tile, endRowCol) {
	var rowToCheck = endRowCol.row + 1;

	while (rowToCheck <= 16 && !this.cells[rowToCheck][endRowCol.col].hasTile()
			&& !this.cells[rowToCheck][endRowCol.col].isType(GATE)) {
		rowToCheck++;
	}

	if (rowToCheck <= 16) {
		var checkPoint = this.cells[rowToCheck][endRowCol.col];
		if (!checkPoint.isType(GATE) && tile.clashesWith(checkPoint.tile)) {
			var harmony = new UndergrowthHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(rowToCheck, endRowCol.col));
			return harmony;
		}
	}
};

UndergrowthBoard.prototype.setPossibleMovePoints = function (boardPointStart) {
	if (!boardPointStart.hasTile()) {
		return;
	}
	// Apply "possible move point" type to applicable boardPoints
	var player = boardPointStart.tile.ownerName;
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			if (this.canMoveTileToPoint(player, boardPointStart, this.cells[row][col])) {
				this.cells[row][col].addType(POSSIBLE_MOVE);
			}
		}
	}
};

UndergrowthBoard.prototype.removePossibleMovePoints = function () {
	this.cells.forEach(function (row) {
		row.forEach(function (boardPoint) {
			boardPoint.removeType(POSSIBLE_MOVE);
		});
	});
};

UndergrowthBoard.prototype.setAllPossiblePointsOpen = function (tile, player) {
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (bp.canHoldTile(tile) && !bp.betweenHarmony) {
				this.cells[row][col].addType(POSSIBLE_MOVE);
			}
		}
	}
};

UndergrowthBoard.prototype.setHarmonyPointsOpen = function(tile) {
	var possibleMovesFound = false;

	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (!bp.betweenHarmony && bp.canHoldTile(tile)) {
				var newBp = bp.getCopy();
				newBp.putTile(tile);
				if (this.getTileHarmonies(newBp.tile, newBp).length > 0) {
					this.cells[row][col].addType(POSSIBLE_MOVE);
					possibleMovesFound = true;
				}
			}
		}
	}

	return possibleMovesFound;
};

UndergrowthBoard.prototype.setOpenGatePossibleMoves = function() {
	this.forEachBoardPoint(function(boardPoint) {
		if (boardPoint.isType(GATE) && !boardPoint.hasTile()) {
			boardPoint.addType(POSSIBLE_MOVE);
		}
	});
};

UndergrowthBoard.prototype.hasOpenGates = function() {
	var openGateFound = false;
	this.forEachBoardPoint(function(boardPoint) {
		if (boardPoint.isType(GATE) && !boardPoint.hasTile()) {
			openGateFound = true;
			return;
		}
	});
	return openGateFound;
};

UndergrowthBoard.prototype.getPlayerWithMostTilesInOrTouchingCentralGardens = function() {
	var hostCount = this.getNumberOfTilesTouchingCentralGardensForPlayer(HOST);
	var guestCount = this.getNumberOfTilesTouchingCentralGardensForPlayer(GUEST);

	if (hostCount > guestCount) {
		return HOST;
	} else if (guestCount > hostCount) {
		return GUEST;
	}
};

UndergrowthBoard.prototype.getNumberOfTilesTouchingCentralGardensForPlayer = function(playerName) {
	var count = 0;

	this.forEachBoardPointWithTile(function(boardPointWithTile) {
		if (boardPointWithTile.isType(RED) || boardPointWithTile.isType(WHITE)) {
			if (boardPointWithTile.tile.ownerName === playerName) {
				count++;
			}
		}
	});

	return count;
};

UndergrowthBoard.prototype.getCopy = function () {
	var copyBoard = new UndergrowthBoard();

	// cells
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			copyBoard.cells[row][col] = this.cells[row][col].getCopy();
		}
	}

	copyBoard.analyzeHarmonies();

	return copyBoard;
};

