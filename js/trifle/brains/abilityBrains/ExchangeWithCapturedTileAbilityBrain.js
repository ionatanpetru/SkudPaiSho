/*
Should this ability target the tile on board in addition to the tile it's switching to?
*/

import { TrifleAbilityManager } from '../../TrifleAbilityManager';
import { TrifleTargetPromptId } from '../../TrifleTileInfo';
import { debug } from '../../../GameData';

export function TrifleExchangeWithCapturedTileAbilityBrain(abilityObject) {
	this.abilityObject = abilityObject;
}

TrifleExchangeWithCapturedTileAbilityBrain.prototype.activateAbility = function() {
	var promptTargetInfo = this.abilityObject.promptTargetInfo;

	this.capturedTiles = [];

	var sourceTileKey = JSON.stringify(TrifleAbilityManager.buildSourceTileKeyObject(this.abilityObject.sourceTile));

	if (promptTargetInfo
		&& promptTargetInfo[sourceTileKey]
		&& promptTargetInfo[sourceTileKey][TrifleTargetPromptId.chosenCapturedTile]) {
		var chosenCapturedTileKeyObject = promptTargetInfo[sourceTileKey][TrifleTargetPromptId.chosenCapturedTile];

		var chosenTile = this.abilityObject.board.tileManager.grabCapturedTile(chosenCapturedTileKeyObject.ownerName, chosenCapturedTileKeyObject.code);

		if (chosenTile) {
			// Exchange the tiles!
			var tileFromBoard = this.abilityObject.board.captureTileOnPoint(this.abilityObject.sourceTilePoint);
			this.capturedTiles.push(tileFromBoard);	// Does it count as being captured?
			tileFromBoard.beingCapturedByAbility = true;

			this.abilityObject.board.placeTile(chosenTile, this.abilityObject.sourceTilePoint);

			this.abilityObject.boardChanged = true;
		}
	}

	return {
		capturedTiles: this.capturedTiles
	};
};

TrifleExchangeWithCapturedTileAbilityBrain.prototype.promptForTarget = function(nextNeededPromptTargetInfo, sourceTileKeyStr) {
	var promptTargetsExist = false;

	debug("Need to prompt for target: " + nextNeededPromptTargetInfo.promptId);

	/*
	Exchange With Target Captured Tile requires these targets:
	- TrifleTargetPromptId.chosenCapturedTile
	 */

	if (nextNeededPromptTargetInfo.promptId === TrifleTargetPromptId.chosenCapturedTile
			&& this.abilityObject.abilityInfo.targetTypes && this.abilityObject.abilityInfo.targetTypes.length) {
		this.abilityObject.setAbilityTargetTiles();

		var abilityTargetTiles = this.abilityObject.abilityTargetTiles;

		abilityTargetTiles.forEach(targetTile => {
			promptTargetsExist = true;
			targetTile.tileIsSelectable = true;
		});
	} else {
		debug("Prompting not supported yet for this ability");
	}

	debug("promptTargetsExist for exchange with captured tile ability prompt? : " + promptTargetsExist);
	return promptTargetsExist;
};
