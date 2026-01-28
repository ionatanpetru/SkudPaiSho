/* Tumbleweed Strategic AI */

import { TumbleweedNotationBuilder } from '../TumbleweedGameNotation';
import { getOpponentName } from '../../pai-sho-common/PaiShoPlayerHelp';

export class TumbleweedStrategicAI {
	constructor() {
		// Weights for evaluation factors
		this.weights = {
			territoryGain: 10,        // Value of gaining a settlement
			overtakeBonus: 5,         // Extra value for taking opponent's space
			sightCountValue: 2,       // Value per sight line at the position
			blockingValue: 3,         // Value for blocking opponent's strong moves
			controlInfluence: 1,      // Value for increasing control over nearby empty spaces
			centerBonus: 1,           // Bonus for positions closer to center
			stackStrength: 1,         // Value for having a higher stack (harder to retake)
		};
	}

	getName() {
		return "Tumbleweed Strategic AI";
	}

	getMessage() {
		return "This AI evaluates moves based on territory control, position strength, and blocking opponent moves. It should provide a reasonable challenge.";
	}

	setPlayer(playerName) {
		this.player = playerName;
	}

	getMove(game, moveNum) {
		game.revealPossibleSettlePoints(this.player, true);
		var possiblePoints = game.board.getAllPossiblePoints();
		game.hidePossibleSettlePoints(true);

		if (possiblePoints.length === 0) {
			// No valid moves, must pass
			var notationBuilder = new TumbleweedNotationBuilder();
			notationBuilder.passTurn = true;
			return notationBuilder.getNotationMove(moveNum, this.player);
		}

		var opponent = getOpponentName(this.player);
		var bestMove = null;
		var bestScore = -Infinity;

		// Evaluate each possible move
		for (var i = 0; i < possiblePoints.length; i++) {
			var point = possiblePoints[i];
			var score = this.evaluateMove(game, point, opponent);

			if (score > bestScore) {
				bestScore = score;
				bestMove = point;
			}
		}

		// Check if passing might be better (rare, usually near end game)
		var passScore = this.evaluatePass(game, opponent);

		if (passScore > bestScore) {
			var notationBuilder = new TumbleweedNotationBuilder();
			notationBuilder.passTurn = true;
			return notationBuilder.getNotationMove(moveNum, this.player);
		}

		// Build the move notation
		var notationBuilder = new TumbleweedNotationBuilder();
		notationBuilder.setDeployPoint(bestMove.getNotationPointString());
		return notationBuilder.getNotationMove(moveNum, this.player);
	}

	evaluateMove(game, point, opponent) {
		var score = 0;
		var board = game.board;

		// Get sight counts
		var mySightCount = board.getSightCount(point, this.player);
		var opponentSightCount = board.getSightCount(point, opponent);
		var currentOwner = point.getSettlementOwner();
		var currentValue = point.getSettlementValue();

		// 1. Territory gain - always valuable to place a settlement
		score += this.weights.territoryGain;

		// 2. Overtake bonus - extra value for taking opponent's space
		if (currentOwner === opponent) {
			score += this.weights.overtakeBonus;
			// Even more valuable if it was a high-value stack
			score += currentValue * 0.5;
		}

		// 3. Sight count value - positions with more sight lines are stronger
		score += mySightCount * this.weights.sightCountValue;

		// 4. Stack strength - higher stacks are harder to retake
		// The stack we place will have value = mySightCount (or mySightCount+1 for Rumbleweed)
		score += mySightCount * this.weights.stackStrength;

		// 5. Blocking value - if opponent had good sight here, we're blocking them
		if (opponentSightCount >= 2) {
			score += opponentSightCount * this.weights.blockingValue;
		}

		// 6. Control influence - check how this affects nearby empty spaces
		var adjacentPoints = board.getAdjacentPoints(point);
		for (var i = 0; i < adjacentPoints.length; i++) {
			var adj = adjacentPoints[i];
			if (!adj.hasSettlement()) {
				// This settlement will add sight to adjacent empty spaces
				score += this.weights.controlInfluence;
			}
		}

		// 7. Center bonus - positions closer to center are generally more valuable
		// Use notation position to estimate distance from center
		var centerBonus = this.calculateCenterBonus(point, board);
		score += centerBonus * this.weights.centerBonus;

		// 8. Defensive consideration - penalize if this position is easily retaken
		if (opponentSightCount >= mySightCount) {
			// Opponent could potentially retake this
			score -= (opponentSightCount - mySightCount + 1) * 2;
		}

		// 9. Look ahead - simulate opponent's best response
		score += this.evaluateFutureThreat(game, point, opponent) * 0.5;

		return score;
	}

	calculateCenterBonus(point, board) {
		// Estimate how central this position is
		// Higher row/col numbers near the middle of the board range are more central
		var edgeLength = board.edgeLength;
		var centerRow = edgeLength - 1;
		var centerCol = edgeLength;

		var rowDist = Math.abs(point.notationRowNum - centerRow);
		var colDist = Math.abs(point.notationColNum - centerCol);
		var maxDist = edgeLength - 1;

		// Return higher values for positions closer to center
		var distFromCenter = Math.max(rowDist, colDist);
		return Math.max(0, maxDist - distFromCenter);
	}

	evaluateFutureThreat(game, point, opponent) {
		// Estimate how the opponent might respond
		var board = game.board;
		var threatScore = 0;

		// Check if placing here opens up strong moves for us
		var adjacentPoints = board.getAdjacentPoints(point);
		for (var i = 0; i < adjacentPoints.length; i++) {
			var adj = adjacentPoints[i];
			if (!adj.hasSettlement()) {
				// After we place, we'll have sight to this adjacent space
				// This is good if it helps us control or contest it
				var ourNewSight = board.getSightCount(adj, this.player) + 1;
				var theirSight = board.getSightCount(adj, opponent);
				if (ourNewSight > theirSight) {
					threatScore += 1;
				}
			}
		}

		// Check if opponent could immediately retake
		var opponentSight = board.getSightCount(point, opponent);
		var ourSight = board.getSightCount(point, this.player);
		if (opponentSight > ourSight) {
			// They could retake immediately
			threatScore -= 3;
		}

		return threatScore;
	}

	evaluatePass(game, opponent) {
		// Passing is usually bad, but might be okay if:
		// 1. We're clearly ahead and all moves would hurt us
		// 2. There are no good moves left

		var myScore = game.board.countSettlements(this.player);
		var oppScore = game.board.countSettlements(opponent);
		var myControl = game.board.countTotalControlledSpaces(this.player);
		var oppControl = game.board.countTotalControlledSpaces(opponent);

		var totalMyScore = myScore + myControl;
		var totalOppScore = oppScore + oppControl;

		// Only consider passing if we're significantly ahead
		if (totalMyScore > totalOppScore + 10) {
			return 5; // Small positive score for passing when ahead
		}

		return -100; // Generally, passing is bad
	}
}
