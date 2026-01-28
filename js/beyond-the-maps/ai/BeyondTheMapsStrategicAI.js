/* Beyond The Maps Strategic AI */

import { GUEST, HOST } from '../../CommonNotationObjects';
import { getOpponentName } from '../../pai-sho-common/PaiShoPlayerHelp';
import { BeyondTheMapsTileType } from '../BeyondTheMapsTile';
import { BeyondTheMapsAiHelp } from './BeyondTheMapsAiHelp';

export class BeyondTheMapsStrategicAI {
	constructor() {
		this.player = null;

		// Evaluation weights
		this.weights = {
			// Territory
			landCount: 15,
			landGain: 25,

			// Ship safety
			shipMobility: 20,
			shipSafety: 50,

			// Strategic
			enclosurePotential: 30,
			opponentPressure: 25,
			peninsulaCount: 10,
			centerControl: 8
		};

		// Performance settings
		this.maxMovesToEvaluate = 30;  // Sample at most this many moves
		this.enableLookAhead = false;   // Disable look-ahead for speed
	}

	getName() {
		return "Strategic AI";
	}

	getMessage() {
		return "A strategic opponent that evaluates territory control, ship safety, and enclosure potential.";
	}

	setPlayer(playerName) {
		this.player = playerName;
	}

	getMove(game, moveNum) {
		var aiHelp = new BeyondTheMapsAiHelp();
		var opponent = getOpponentName(this.player);

		var possibleMoves = aiHelp.getAllPossibleMoves(game, this.player);

		if (!possibleMoves || possibleMoves.length === 0) {
			return null;
		}

		// Sample moves if there are too many
		var movesToEvaluate = possibleMoves.length > this.maxMovesToEvaluate
			? this.sampleMovesRandomly(possibleMoves, this.maxMovesToEvaluate)
			: possibleMoves;

		var bestMove = null;
		var bestScore = -Infinity;

		// Pre-analyze the current board once
		game.board.analyzeSeaAndLandGroups();
		var myLandBefore = game.board.countPlayerLandPieces(this.player);

		for (var i = 0; i < movesToEvaluate.length; i++) {
			var move = movesToEvaluate[i];

			// Simulate the move
			var gameCopy = game.getCopy();
			this.applyMove(gameCopy, move);

			// Check for immediate win
			if (gameCopy.getWinResultTypeCode() > 0 && gameCopy.getWinner() === this.player) {
				return move;
			}

			// Evaluate resulting position
			var score = this.evaluatePositionFast(gameCopy, myLandBefore, this.player, opponent);

			// Small random factor for variety
			score += Math.random() * 5;

			if (score > bestScore) {
				bestScore = score;
				bestMove = move;
			}
		}

		return bestMove;
	}

	applyMove(game, move) {
		for (var phaseIndex = 0; phaseIndex < move.moveData.phases.length; phaseIndex++) {
			game.runNotationMove(move, phaseIndex, false, true, true, true);
		}
	}

	evaluatePositionFast(game, myLandBefore, player, opponent) {
		var score = 0;
		var board = game.board;

		// Analyze board state
		board.analyzeSeaAndLandGroups();

		// === TERRITORY EVALUATION ===
		var myLand = board.countPlayerLandPieces(player);
		var oppLand = board.countPlayerLandPieces(opponent);

		score += myLand * this.weights.landCount;
		score += (myLand - myLandBefore) * this.weights.landGain;
		score -= oppLand * this.weights.landCount * 0.8;

		// === SHIP SAFETY EVALUATION ===
		var myShipPoint = board.shipPoints[player];
		var oppShipPoint = board.shipPoints[opponent];

		if (myShipPoint) {
			var myMobility = this.calculateShipMobility(board, myShipPoint);
			score += myMobility * this.weights.shipMobility;

			var mySafetyScore = this.calculateShipSafetyFast(board, myShipPoint);
			score += mySafetyScore * this.weights.shipSafety;
		} else {
			// Ship captured - very bad
			score -= 10000;
		}

		if (oppShipPoint) {
			var oppMobility = this.calculateShipMobility(board, oppShipPoint);
			// Reducing opponent mobility is good
			score += (4 - oppMobility) * this.weights.opponentPressure * 0.3;
		} else {
			// Opponent ship captured - we win!
			score += 10000;
		}

		// === PENINSULA COUNT (expansion potential) ===
		score += this.countPeninsulasFast(board, player) * this.weights.peninsulaCount;

		return score;
	}

	calculateShipMobility(board, shipPoint) {
		// Count adjacent non-land squares (can move through ships but not land)
		var adjacentPoints = board.getAdjacentPoints(shipPoint);
		var mobility = 0;

		for (var i = 0; i < adjacentPoints.length; i++) {
			var point = adjacentPoints[i];
			if (!point.hasTile() || point.tile.tileType === BeyondTheMapsTileType.SHIP) {
				mobility++;
			}
		}

		return mobility;
	}

	calculateShipSafetyFast(board, shipPoint) {
		var safety = 0;

		// Check sea group size - larger is safer
		var seaGroupId = shipPoint.seaGroupId;
		if (seaGroupId !== null && seaGroupId !== undefined && board.seaGroups[seaGroupId]) {
			var seaGroup = board.seaGroups[seaGroupId];
			safety += Math.min(seaGroup.length, 50);

			// Quick edge check - just check if any point in sea group is on edge
			for (var i = 0; i < Math.min(seaGroup.length, 10); i++) {
				var point = seaGroup[i];
				if (point.row === 0 || point.row === 17 || point.col === 0 || point.col === 17) {
					safety += 30; // Touches edge, can't be enclosed
					break;
				}
			}
		}

		// Mobility factor
		var mobility = this.calculateShipMobility(board, shipPoint);
		if (mobility === 0) {
			safety -= 100; // Trapped!
		} else if (mobility === 1) {
			safety -= 30; // Very limited
		}

		return safety;
	}

	countPeninsulasFast(board, player) {
		var count = 0;

		board.forEachBoardPointWithTile(function(point) {
			if (point.tile.ownerName === player &&
				point.tile.tileType === BeyondTheMapsTileType.LAND) {
				// Quick peninsula check - count adjacent friendly lands
				var adjacentFriendlyLands = 0;
				var adjacentPoints = board.getAdjacentPoints(point);
				for (var i = 0; i < adjacentPoints.length; i++) {
					var adjPoint = adjacentPoints[i];
					if (adjPoint.hasTile() &&
						adjPoint.tile.tileType === BeyondTheMapsTileType.LAND &&
						adjPoint.tile.ownerName === player) {
						adjacentFriendlyLands++;
					}
				}
				if (adjacentFriendlyLands <= 1) {
					count++;
				}
			}
		});

		return count;
	}

	sampleMovesRandomly(moves, count) {
		if (moves.length <= count) {
			return moves;
		}

		// Fisher-Yates shuffle first portion
		var sampled = moves.slice();
		for (var i = 0; i < count; i++) {
			var j = i + Math.floor(Math.random() * (sampled.length - i));
			var temp = sampled[i];
			sampled[i] = sampled[j];
			sampled[j] = temp;
		}

		return sampled.slice(0, count);
	}
}
