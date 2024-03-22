/* Beyond The Maps AI Help */

import { BeyondTheMapsGameManager, BeyondTheMapsMoveType } from '../BeyondTheMapsGameManager';
import { BtmMoveBuilder } from '../BtmMoveBuilder';
import { EDGES_MOVE_4_2, gameOptionEnabled } from '../../GameOptions';
import { POSSIBLE_MOVE } from '../../skud-pai-sho/SkudPaiShoBoardPoint';
import { TrifleGameNotation } from '../../trifle/TrifleGameNotation';
import { debug } from '../../GameData';

export class BeyondTheMapsAiHelp {
	constructor() {
		this.gameNotation = new TrifleGameNotation();
	}

	/**
	 * 
	 * @param {BeyondTheMapsGameManager} game 
	 * @param {*} player 
	 * @returns 
	 */
	getAllPossibleMoves(game, player) {
		// Will always sail first, then explore by land.
		var possibleSailMoves = this.getPossibleExploreBySeaMoves(game, player);

		var possibleMoves = [];

		possibleSailMoves.forEach(moveBuilder => {
			var gameCopy = game.getCopy();
			var move = moveBuilder.getNotationMove(this.gameNotation);
			
			gameCopy.runNotationMove(move, moveBuilder.getPhaseIndex(), false, true, true, true);
			
			var movesWithSameSailingStep = this.getPossibleExploreByLandMoves(gameCopy, player, moveBuilder);
			
			movesWithSameSailingStep.forEach(fullMoveBuilder => {
				possibleMoves.push(fullMoveBuilder.getNotationMove(this.gameNotation));
			});

			if (movesWithSameSailingStep.length === 0) {
				possibleMoves.push(move);
			}
		});

		if (possibleMoves.length === 0) {
			// game.debugPrintBoard();
			debug("No moves found?");
		}
		return possibleMoves;
	}

	/**
	 * 
	 * @param {BeyondTheMapsGameManager} game 
	 * @param {string} player 
	 */
	getPossibleExploreBySeaMoves(game, player) {
		var shipBoardPoint = game.getShipPointForPlayer(player);
		var shipPointNotation = shipBoardPoint.getNotationPointString();

		game.hidePossibleMovePoints(true);
		game.revealPossibleMovePoints(shipBoardPoint, true, this.getMoveDistance());

		var possibleMovePoints = [];

		var possibleMoves = [];

		// Find possible move points
		game.board.forEachBoardPoint(boardPoint => {
			if (boardPoint.isType(POSSIBLE_MOVE)) {
				possibleMovePoints.push({
					endPoint: boardPoint, 
					possiblePaths: boardPoint.possibleMovementPaths
				});
			}
		});
		game.hidePossibleMovePoints(true);

		// Add possible land points for each possible move
		possibleMovePoints.forEach(p => {
			var gameCopy = game.getCopy();

			var moveBuilder = new BtmMoveBuilder();
			moveBuilder.setPlayer(player);
			moveBuilder.beginNewPhase();
			moveBuilder.getCurrentPhase().moveType = BeyondTheMapsMoveType.EXPLORE_SEA;
			moveBuilder.getCurrentPhase().startPoint = shipPointNotation;
			moveBuilder.getCurrentPhase().endPoint = p.endPoint.getNotationPointString();

			var move = moveBuilder.getNotationMove(this.gameNotation);
			gameCopy.runNotationMove(move, moveBuilder.getPhaseIndex(), false, true, true, true);
			
			p.possibleLandPoints = gameCopy.markPossibleLandPointsForMovement(shipPointNotation, p.endPoint, p.possiblePaths, player);
			p.possibleLandPoints.forEach(landPoint => {
				var moveBuilderCopy = moveBuilder.getCopy();
				moveBuilderCopy.getCurrentPhase().landPoint = landPoint.getNotationPointString();
				possibleMoves.push(moveBuilderCopy);
			});
			if (p.possibleLandPoints.length === 0) {
				var moveBuilder = new BtmMoveBuilder();
				moveBuilder.setPlayer(player);
				moveBuilder.beginNewPhase();
				moveBuilder.getCurrentPhase().moveType = BeyondTheMapsMoveType.EXPLORE_SEA;
				moveBuilder.getCurrentPhase().startPoint = shipPointNotation;
				moveBuilder.getCurrentPhase().endPoint = p.endPoint.getNotationPointString();

				possibleMoves.push(moveBuilder);
			}
		});

		if (possibleMoves.length === 0) {
			game.debugPrintBoard();
			debug("No moves found?");
		}

		game.hidePossibleMovePoints(true);

		return possibleMoves;
	}

	/**
	 * 
	 * @param {BeyondTheMapsGameManager} game 
	 * @param {*} player 
	 * @param {BtmMoveBuilder} baseSailMove 
	 */
	getPossibleExploreByLandMoves(game, player, baseSailMove) {
		var exploreLandNumber = 3;
		if (gameOptionEnabled(EDGES_MOVE_4_2)) {
			exploreLandNumber = 2;
		}

		var possibleMoves = [];

		game.hidePossibleMovePoints(true);
		var landPossible = game.revealPossibleExploreLandPoints(player, true);

		if (landPossible) {
			var possibleFirstLandPoints = [];

			game.board.forEachBoardPoint(boardPoint => {
				if (boardPoint.isType(POSSIBLE_MOVE)) {
					possibleFirstLandPoints.push(boardPoint);
				}
			});
			game.hidePossibleMovePoints(true);

			var gameCopy = game.getCopy();

			if (possibleFirstLandPoints.length > 0) {
				baseSailMove.beginNewPhase();
				baseSailMove.getCurrentPhase().moveType = BeyondTheMapsMoveType.EXPLORE_LAND;
				baseSailMove.getCurrentPhase().landPoints = [];
	
				possibleFirstLandPoints.forEach(firstLandPoint => {
					// For each first land point...
					var moveBuilder = baseSailMove.getCopy();
					moveBuilder.getCurrentPhase().landPoints.push(firstLandPoint.getNotationPointString());
					
					var move = moveBuilder.getNotationMove(this.gameNotation);
					gameCopy = gameCopy.getCopy();
					gameCopy.runNotationMove(move, moveBuilder.getPhaseIndex(), false, true, true, true);

					// Next land point?
					var moreLandPossible = gameCopy.revealPossibleContinueExploreLandPoints(player, firstLandPoint, true);
					if (moreLandPossible) {
						var possibleSecondLandPoints = [];

						gameCopy.board.forEachBoardPoint(boardPoint => {
							if (boardPoint.isType(POSSIBLE_MOVE)) {
								possibleSecondLandPoints.push(boardPoint);
							}
						});
						gameCopy.hidePossibleMovePoints(true);

						possibleSecondLandPoints.forEach(secondLandPoint => {
							var moveBuilder2 = moveBuilder.getCopy();
							moveBuilder2.getCurrentPhase().landPoints.push(secondLandPoint.getNotationPointString());

							possibleMoves.push(moveBuilder2);
						});
					} else {
						possibleMoves.push(moveBuilder);
					}
				});
			}
		}

		if (possibleMoves.length === 0) {
			debug("NO MOVES FOUND :(");
		}

		return possibleMoves;
	}

	getMoveDistance() {
		var moveDistance = 6;
		if (gameOptionEnabled(EDGES_MOVE_4_2)) {
			moveDistance = 4;
		}
		return moveDistance;
	}
}

BeyondTheMapsAiHelp.prototype.getPossibleDeploymentMoves = function(game, player) {
	// var moves = [];

	// var tilePile = this.getTilePile(game, player);

	// for (var i = 0; i < tilePile.length; i++) {
	// 	var tile = tilePile[i];
	// 	game.revealDeployPoints(player, tile.code, true);
	// 	var endPoints = this.getPossibleMovePoints(game);

	// 	for (var j = 0; j < endPoints.length; j++) {
	// 		var notationBuilder = new VagabondNotationBuilder();
	// 		notationBuilder.moveType = DEPLOY;
	// 		notationBuilder.tileType = tile.code;
	// 		notationBuilder.status = WAITING_FOR_ENDPOINT;

	// 		var endPoint = endPoints[j];
	// 		notationBuilder.endPoint = new NotationPoint(this.getNotation(endPoint));
	// 		var move = notationBuilder.getNotationMove(this.moveNum, player);

	// 		game.hidePossibleMovePoints(true);

	// 		var isDuplicate = false;
	// 		for (var x = 0; x < moves.length; x++) {
	// 			if (moves[x].equals(move)) {
	// 				isDuplicate = true;
	// 			}
	// 		}
	// 		if (!isDuplicate) {
	// 			moves.push(move);
	// 		}
	// 	}
	// }

	// return moves;
};

BeyondTheMapsAiHelp.prototype.getPossibleMovementMoves = function(game, player) {
	// var moves = [];

	// var startPoints = this.getMovementStartPoints(game, player);

	// for (var i = 0; i < startPoints.length; i++) {
	// 	var startPoint = startPoints[i];

	// 	game.revealPossibleMovePoints(startPoint, true);

	// 	var endPoints = this.getPossibleMovePoints(game);

	// 	for (var j = 0; j < endPoints.length; j++) {
	// 		var notationBuilder = new VagabondNotationBuilder();
	// 		notationBuilder.moveType = MOVE;
	// 		notationBuilder.startPoint = new NotationPoint(this.getNotation(startPoint));
	// 		notationBuilder.status = WAITING_FOR_ENDPOINT;

	// 		var endPoint = endPoints[j];

	// 		notationBuilder.endPoint = new NotationPoint(this.getNotation(endPoint));
	// 		var move = notationBuilder.getNotationMove(this.moveNum, player);

	// 		game.hidePossibleMovePoints(true);

	// 		var isDuplicate = false;
	// 		for (var x = 0; x < moves.length; x++) {
	// 			if (moves[x].equals(move)) {
	// 				isDuplicate = true;
	// 			}
	// 		}

	// 		if (!isDuplicate) {
	// 			moves.push(move);
	// 		}
	// 	}
	// }

	// return moves;
};

BeyondTheMapsAiHelp.prototype.getTilePile = function(game, player) {
	// var tilePile = game.tileManager.hostTiles;
	// if (player === GUEST) {
	// 	tilePile = game.tileManager.guestTiles;
	// }
	// return tilePile;
};

BeyondTheMapsAiHelp.prototype.getPossibleMovePoints = function(game) {
	// var points = [];
	// for (var row = 0; row < game.board.cells.length; row++) {
	// 	for (var col = 0; col < game.board.cells[row].length; col++) {
	// 		if (game.board.cells[row][col].isType(POSSIBLE_MOVE)) {
	// 			points.push(game.board.cells[row][col]);
	// 		}
	// 	}
	// }
	// return points;
};

BeyondTheMapsAiHelp.prototype.getNotation = function(boardPoint) {
	// return new RowAndColumn(boardPoint.row, boardPoint.col).notationPointString;
};

BeyondTheMapsAiHelp.prototype.getMovementStartPoints = function(game, player) {
	// var points = [];
	// for (var row = 0; row < game.board.cells.length; row++) {
	// 	for (var col = 0; col < game.board.cells[row].length; col++) {
	// 		var startPoint = game.board.cells[row][col];
	// 		if (startPoint.hasTile() && startPoint.tile.ownerName === player) {
	// 			points.push(game.board.cells[row][col]);
	// 		}
	// 	}
	// }
	// return points;
};

