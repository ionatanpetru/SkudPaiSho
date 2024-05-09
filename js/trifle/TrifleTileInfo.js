
import { TrifleBoardPoint } from './TrifleBoardPoint';
import { TrifleTileType } from './TrifleTiles';
import { debugOn } from '../GameData';

export var TrifleTileCategory = {
	thisTile: "thisTile",
	allButThisTile: "allButThisTile",
	allTileTypes: "allTileTypes",
	landingTile: "landingTile",
	surroundingTiles: "surroundingTiles",
	tileWithAbility: "tileWithAbility"
};

export var TrifleTargetType = {
	thisTile: "thisTile",			// 
	allTileTypes: "allTileTypes",	//
	landingTile: "landingTile",		//
	allTiles: "allTiles",
	triggerTargetTiles: "triggerTargetTiles",
	surroundingTiles: "surroundingTiles",
	chosenCapturedTile: "chosenCapturedTile"
}

export var TrifleDeployType = {
	anywhere: "anywhere",
	temple: "temple",
	adjacentToTemple: "adjacentToTemple"
};

export var TrifleSpecialDeployType = {
	withinFriendlyTileZone: "withinFriendlyTileZone"
};

export var TrifleMovementType = {
	standard: "standard",
	diagonal: "diagonal",
	orthAndDiag: "orthAndDiag",
	jumpAlongLineOfSight: "jumpAlongLineOfSight",
	withinFriendlyTileZone: "withinFriendlyTileZone",
	anywhere: "anywhere",
	jumpShape: "jumpShape",
	travelShape: "travelShape",
	awayFromTargetTile: "awayFromTargetTile",
	awayFromTargetTileOrthogonal: "awayFromTargetTileOrthogonal",
	awayFromTargetTileDiagonal: "awayFromTargetTileDiagonal",
	jumpTargetTile: "jumpTargetTile",
	jumpSurroundingTiles: "jumpSurroundingTiles"
};

export var TrifleMovementDirection = {
	orthogonal: "orthogonal",
	diagonal: "diagonal"
};

export var TrifleMovementRestriction = {
	// restrictedByOpponentTileZones: "restrictedByOpponentTileZones",
	// immobilizedByAdjacentOpponentTile: "immobilizedByAdjacentOpponentTile", // unused
	// immobilizedByOpponentTileZones: "immobilizedByOpponentTileZones",
	mustPreserveDirection: "mustPreserveDirection",
	restrictMovementOntoPoints: "restrictMovementOntoPoints",
	restrictMovementOntoRecordedTilePoint: "restrictMovementOntoRecordedTilePoint"
};

export var TrifleMovementAbility = {
	// carry: "carry", // For future
	jumpOver: "jumpOver",
	chargeCapture: "chargeCapture"
};

export var TrifleMoveDirection = {
	any: "any",	/* Any direction starts movement */
	straight: "straight",
	turn: "turn",
	left: "left",
	right: "right"
}

export var TrifleCaptureType = {
	none: "none",
	all: "all",
	tilesTargetedByAbility: "tilesTargetedByAbility",
	allExcludingCertainTiles: "allExcludingCertainTiles"
};

export var TrifleActivationRequirement = {
	tilesNotInTemple: "tilesNotInTemple",
	tileIsOnPointOfType: "tileIsOnPointOfType"
};

export var TrifleZoneAbility = {
	canceledWhenInTemple: "canceledWhenInTemple", // Note: Too specific, how to split up to *dynamicize*?
	protectFriendlyTilesFromCapture: "protectFriendlyTilesFromCapture", // Too specific, can be ProtectTilesFromCapture and have a target tiles metadata
	// immobilizesOpponentTiles: "immobilizesOpponentTiles", // Outdated, replaced by ImmobilizesTiles
	immobilizesTiles: "immobilizesTiles",
	removesTileAbilities: "removesTileAbilities",	// TODO // TODO testing, etc
	restrictMovementWithinZone: "restrictMovementWithinZone",
	captureLandingTiles: "captureLandingTiles" // unused?
}

export var TrifleBoardPresenceAbility = {
	increaseFriendlyTileMovementDistance: "increaseFriendlyTileMovementDistance",	// TODO replace with Ability.grantBonusMovement
	// spawnAdditionalCopies: "spawnAdditionalCopies",	// TODO,
	canBeCapturedByFriendlyTiles: "canBeCapturedByFriendlyTiles",
	drawTilesInLineOfSight: "drawTilesInLineOfSight"
	// captureProtection: "captureProtection"
}

export var TrifleSpawnLocation = {
	adjacent: "adjacent"
};

export var TrifleAttributeType = {
	gigantic: "gigantic"
}

export var TrifleAbilityName = {
	captureTargetTiles: "captureTargetTiles",
	removeEffects: "removeEffects",
	protectFromCapture: "protectFromCapture",
	grantBonusMovement: "grantBonusMovement",
	manipulateExistingMovement: "manipulateExistingMovement",
	extendMovement: "extendMovement",
	lureTiles: "lureTiles",
	drawTilesAlongLineOfSight: "drawTilesAlongLineOfSight",
	cancelZone: "cancelZone",
	immobilizeTiles: "immobilizeTiles",
	restrictMovementWithinZone: "restrictMovementWithinZone",
	restrictMovementWithinZoneUnlessCapturing: "restrictMovementWithinZoneUnlessCapturing",
	cancelAbilities: "cancelAbilities",
	cancelAbilitiesTargetingTiles: "cancelAbilitiesTargetingTiles",
	prohibitTileFromCapturing: "prohibitTileFromCapturing",
	changeMovementDistanceByFactor: "changeMovementDistanceByFactor",
	growGigantic: "growGigantic",
	moveTargetTile: "moveTargetTile",
	recordTilePoint: "recordTilePoint",
	moveTileToRecordedPoint: "moveTileToRecordedPoint",
	moveTargetTileToPile: "moveTargetTileToPile",
	exchangeWithCapturedTile: "exchangeWithCapturedTile"
};

export var TrifleAbilityType = {
	all: "all",
	protection: "protection"
};

export var TrifleAbilityCategory = {
	instant: "instant",
	ongoing: "ongoing"
};

export var TrifleAbilitiesByCategory = {};
TrifleAbilitiesByCategory[TrifleAbilityCategory.instant] = [
	TrifleAbilityName.captureTargetTiles,
	TrifleAbilityName.moveTargetTile,
	TrifleAbilityName.recordTilePoint,
	TrifleAbilityName.moveTileToRecordedPoint,
	TrifleAbilityName.moveTargetTileToPile,
	TrifleAbilityName.exchangeWithCapturedTile
];

export var TrifleAbilityPriorityLevel = {
	highest: "highest"
};

export var TrifleAbilityTriggerType = {
	whenCapturedByTargetTile: "whenCapturedByTargetTile",
	whenCapturingTargetTile: "whenCapturingTargetTile",
	whenTargetTileLandsInZone: "whenTargetTileLandsInZone",
	whenTargetTileMovesFromWithinZone: "whenTargetTileMovesFromWithinZone",
	whileTargetTileIsInLineOfSight: "whileTargetTileIsInLineOfSight",
	whileOutsideTemple: "whileOutsideTemple",	// Todo change to whileTargetTileOutsideTemple?
	whileInsideTemple: "whileInsideTemple",		// ^
	whileTargetTileIsOnBoard: "whileTargetTileIsOnBoard",
	whileOnBoard: "whileOnBoard",	// Remove?
	whileTargetTileIsAdjacent: "whileTargetTileIsAdjacent",
	whileTargetTileIsSurrounding: "whileTargetTileIsSurrounding",
	whenLandsAdjacentToTargetTile: "whenLandsAdjacentToTargetTile",
	whenLandsSurroundingTargetTile: "whenLandsSurroundingTargetTile",
	whenTargetTileLandsAdjacent: "whenTargetTileLandsAdjacent",
	whenTargetTileLandsSurrounding: "whenTargetTileLandsSurrounding",
	whileTargetTileIsInZone: "whileTargetTileIsInZone",
	whenDeployed: "whenDeployed",
	whenActiveMovement: "whenActiveMovement",
	whenTargetTileLandsInTemple: "whenTargetTileLandsInTemple"
};

export var TriflePromptTargetType = {
	boardPoint: "boardPoint",
	tilePile: "tilePile",
	capturedTile: "capturedTile"
};

export var TrifleTargetPromptId = {
	movedTilePoint: "movedTilePoint",
	movedTileDestinationPoint: "movedTileDestinationPoint",
	chosenCapturedTile: "chosenCapturedTile"
};

export var TrifleTileTeam = {
	friendly: "friendly",
	enemy: "enemy"
};

export var TrifleRecordTilePointType = {
	startPoint: "startPoint"
};

export var TrifleAbilitiesForType = {};

export var TrifleAbilityTypes = {};

export var TrifleTiles = {};

export var TrifleTileInfo = {};

TrifleTileInfo.tileIsBanner = function(tileInfo) {
	return tileInfo && tileInfo.types && tileInfo.types.includes(TrifleTileType.banner);
};

TrifleTileInfo.tileIsOneOfTheseTypes = function(tileInfo, types) {
	var isTargetType = false;
	if (tileInfo) {
		types.forEach(function(type) {
			if (tileInfo.types.includes(type)) {
				isTargetType = true;
				return;
			}
		});
	}
	return isTargetType;
};

TrifleTileInfo.getTerritorialZone = function(tileInfo) {
	if (tileInfo.territorialZone) {
		return tileInfo.territorialZone;
	}
};

TrifleTileInfo.movementMustPreserveDirection = function(movementInfo) {
	var mustPreserveDirection = false;
	if (movementInfo && movementInfo.restrictions && movementInfo.restrictions.length > 0) {
		movementInfo.restrictions.forEach(function(movementRestriction) {
			if (movementRestriction.type === TrifleMovementRestriction.mustPreserveDirection) {
				mustPreserveDirection = true;
				return;
			}
		});
	}
	return mustPreserveDirection;
};

TrifleTileInfo.tileHasBoardPresenceAbility = function(tileInfo, abilityType) {
	var result = false;
	if (tileInfo && tileInfo.abilities) {
		tileInfo.abilities.forEach(function(ability) {
			if (ability.type === abilityType) {
				result = true;
				return;
			}
		});
	}
	return result;
};

// TrifleTileInfo.tileHasDrawTilesInLineOfSightAbility = function(tileInfo) {
// 	return TrifleTileInfo.tileHasBoardPresenceAbility(tileInfo, TrifleBoardPresenceAbility.drawTilesInLineOfSight);
// };

TrifleTileInfo.tileCanBeCapturedByFriendlyTiles = function(tileInfo) {
	return TrifleTileInfo.tileHasBoardPresenceAbility(tileInfo, TrifleBoardPresenceAbility.canBeCapturedByFriendlyTiles);
};

TrifleTileInfo.tileHasOnlyOneMovement = function(tileInfo) {
	return tileInfo && tileInfo.movements && tileInfo.movements.length === 1;
};

TrifleTileInfo.tileHasMovementAbility = function(tileInfo, targetMovementAbilityType) {
	var tileHasMovementAbility = false;
	if (tileInfo && tileInfo.movements) {
		tileInfo.movements.forEach(function(movementInfo) {
			if (movementInfo.abilities) {
				movementInfo.abilities.forEach(function(movementAbilityInfo) {
					if (movementAbilityInfo.type === targetMovementAbilityType) {
						tileHasMovementAbility = true;
						return;	// Escape .forEach
					}
				});
			}
		});
	}
	return tileHasMovementAbility;
};

TrifleTileInfo.tileHasAbilityTrigger = function(tileInfo, abilityTrigger) {
	var tileHasAbilityTrigger = false;
	if (tileInfo && tileInfo.abilities) {
		tileInfo.abilities.forEach(function(abilityInfo) {
			if (abilityInfo.triggeringAction === abilityTrigger) {
				tileHasAbilityTrigger = true;
				return;	// Escape .forEach
			}
		});
	}
	return tileHasAbilityTrigger;
};

TrifleTileInfo.getAbilitiesWithAbilityTrigger = function(tileInfo, abilityTrigger) {
	var abilitiesWithTrigger = [];
	if (tileInfo && tileInfo.abilities) {
		tileInfo.abilities.forEach(function(abilityInfo) {
			if (abilityInfo.triggeringAction === abilityTrigger) {
				abilitiesWithTrigger.push(abilityInfo);
			}
		});
	}
	return abilitiesWithTrigger;
};

TrifleTileInfo.getZoneAbilitiesWithAbilityTrigger = function(tileInfo, abilityTrigger) {
	var abilitiesWithTrigger = [];
	if (tileInfo && tileInfo.territorialZone && tileInfo.territorialZone.abilities) {
		tileInfo.territorialZone.abilities.forEach(function(abilityInfo) {
			if (abilityInfo.triggeringAction === abilityTrigger) {
				abilitiesWithTrigger.push(abilityInfo);
			}
		});
	}
	return abilitiesWithTrigger;
};

TrifleTileInfo.tileAbilityIsTriggeredWhenCaptured = function(tileAbilityInfo) {
	var isTriggeredWhenCaptured = false;
	if (tileAbilityInfo.triggers) {
		tileAbilityInfo.triggers.forEach(function(triggerInfo) {
			if (triggerInfo.triggerType === TrifleAbilityTriggerType.whenCapturedByTargetTile) {
				isTriggeredWhenCaptured = true;
			}
		});
	}
	return isTriggeredWhenCaptured;
};

/* TODO Does not belong in 'TileInfo' space? */
TrifleTileInfo.abilityIsCategory = function(abilityObject, abilityCategory) {
	return TrifleAbilitiesByCategory[abilityCategory] 
		&& TrifleAbilitiesByCategory[abilityCategory].includes(abilityObject.abilityType);
};

TrifleTileInfo.initializeTrifleData = function() {
	TrifleTileInfo.defineAbilitiesForAbilityTypes();
	TrifleTileInfo.defineAbilityTypes();
};

TrifleTileInfo.defineAbilitiesForAbilityTypes = function () {
	TrifleAbilitiesForType = {};

	TrifleAbilitiesForType[TrifleAbilityType.protection] = [
		TrifleZoneAbility.protectFriendlyTilesFromCapture,
		TrifleAbilityName.protectFromCapture
	];
};

TrifleTileInfo.defineAbilityTypes = function () {
	TrifleAbilityTypes = {};

	TrifleAbilityTypes[TrifleZoneAbility.protectFriendlyTilesFromCapture] = [
		TrifleAbilityType.protection
	];

	TrifleAbilityTypes[TrifleAbilityName.protectFromCapture] = [
		TrifleAbilityType.protection
	];
};


TrifleTileInfo.getReadableDescription = function(tileCode) {
	var tileHtml = "";

	var tileInfo = PaiShoGames.currentTileMetadata[tileCode];

	if (tileInfo.textLines && !debugOn) {
		tileInfo.textLines.forEach(function(textLine) {
			tileHtml += textLine + "<br />";
		});
		return tileHtml + "<br />";
	}

	if (tileInfo) {
		tileHtml = "Type: " + tileInfo.types;

		if (tileInfo.identifiers) tileHtml += "<br />Identifiers: " + tileInfo.identifiers;

		if (tileInfo.deployTypes) {
			tileHtml += "<br />";
			tileHtml += "Deploy: " + tileInfo.deployTypes
		}

		if (tileInfo.specialDeployTypes) {
			tileHtml += "<br />";
			tileInfo.specialDeployTypes.forEach(function(specialDeployInfo) {
				tileHtml += "Deploy: " + specialDeployInfo.type + " of " + specialDeployInfo.targetTileCodes;
			});
		}

		if (tileInfo.movements) {
			tileInfo.movements.forEach(function(movementInfo) {
				tileHtml += "<br />";
				tileHtml += "Movement type: " + movementInfo.type;
				if (movementInfo.shape) tileHtml += "</br />- Shape: " + movementInfo.shape;
				if (movementInfo.distance) tileHtml += "<br />- Distance: " + (movementInfo.distance === 99 ? "unlimited" : movementInfo.distance);
				if (movementInfo.targetTileTypes) tileHtml += "<br />- Of Tiles of Type: " + movementInfo.targetTileTypes;
				if (movementInfo.targetTileCodes) tileHtml += "<br />- Of Tiles: " + movementInfo.targetTileCodes;
				if (movementInfo.abilities) {
					movementInfo.abilities.forEach(function(movementAbilityInfo) {
						tileHtml += "<br />- Movement Ability: " + movementAbilityInfo.type;
					});
				}
				if (movementInfo.restrictions) {
					movementInfo.restrictions.forEach(function(movementRestrictionInfo) {
						tileHtml += "<br />- Movement Restriction: " + movementRestrictionInfo.type;
					});
				}

				if (movementInfo.captureTypes) {
					// tileHtml += "<br />- Can Capture: " + movementInfo.captureTypes;
					// tileHtml += "<br />Capturing Properties:";
					/* movementInfo.captureTypes.forEach((captureTypeInfoList) => {
						Object.keys(captureTypeInfoList).forEach((key, index) => {
							var captureTypeInfoEntry = captureTypeInfoList[key];
							tileHtml += "<br />- " + key + ": " + captureTypeInfoEntry;
						});
					}); */
					tileHtml += TrifleTileInfo.getObjectSummary("Capturing Properties", movementInfo.captureTypes, 0);
				}
			});
		}

		if (tileInfo.territorialZone) {
			tileHtml += "<br />Zone Size: " + tileInfo.territorialZone.size;
			if (tileInfo.territorialZone.abilities) {
				tileInfo.territorialZone.abilities.forEach(function(ZoneAbilityInfo) {
					tileHtml += "<br />Zone Ability: " + ZoneAbilityInfo.type;
					if (ZoneAbilityInfo.targetTeams) tileHtml += "<br />- Target Tiles: " + ZoneAbilityInfo.targetTeams;
					if (ZoneAbilityInfo.targetTileCodes) tileHtml += "<br />- Target Tiles: " + ZoneAbilityInfo.targetTileCodes;
					if (ZoneAbilityInfo.targetTileTypes) tileHtml += "<br />- Target Tiles: " + ZoneAbilityInfo.targetTileTypes;
				});
			}
		}
		
		if (tileInfo.abilities) {
			tileInfo.abilities.forEach(function(abilityInfo) {
				tileHtml += "<br />";
				/* tileHtml += "Ability: " + abilityInfo.type;

				abilityInfo.triggers.forEach(function(triggerInfo) {
					tileHtml += "<br />- Trigger: " + triggerInfo.triggerType;
					if (triggerInfo.targetTeams) tileHtml += "<br />-- Target Tiles: " + triggerInfo.targetTeams;
					if (triggerInfo.targetTileTypes) tileHtml += "<br />-- Target Tiles: " + triggerInfo.targetTileTypes;
					if (triggerInfo.targetTileIdentifiers) tileHtml += "<br />-- Target Tile Identifiers: " + triggerInfo.targetTileIdentifiers;
				});
				tileHtml += "<br />- Ability Target Types: " + abilityInfo.targetTypes;
				if (abilityInfo.targetTeams) tileHtml += "<br />-- Target Tiles: " + abilityInfo.targetTeams;
				if (abilityInfo.targetTileTypes) tileHtml += "<br />-- Target Tiles: " + abilityInfo.targetTileTypes; */

				tileHtml += TrifleTileInfo.getObjectSummary("Ability", abilityInfo, 0);
			});
		}

		tileHtml += "<br />";
	} else {
		tileHtml = tileCode;
	}

	return tileHtml;
};

TrifleTileInfo.getObjectSummary = function(origKey, theObject, indentDepth) {
	if (theObject instanceof TrifleBoardPoint) {
		return "<br />" + origKey + ": (BoardPoint object)";
	}

	var indentDashStr = "";
	for (var i = 0; i < indentDepth; i++) {
		indentDashStr += "-";
	}
	var htmlSummary = "";
	if (theObject instanceof Array && !(theObject[0] instanceof Object)) {
		htmlSummary += "<br />" + indentDashStr + " " + origKey + ": " + theObject;
	} else if (theObject instanceof Object) {
		if (!isNaN(origKey)) {
			indentDepth--;
		} else {
			htmlSummary += "<br />" + indentDashStr + " " + origKey + ": ";
		}
		Object.keys(theObject).forEach((key, index) => {
			var captureTypeInfoEntry = theObject[key];
			htmlSummary += TrifleTileInfo.getObjectSummary(key, captureTypeInfoEntry, indentDepth+1);
		});
	} else {
		htmlSummary += "<br />" + indentDashStr + " " + origKey + ": " + theObject;
	}
	return htmlSummary;
};

