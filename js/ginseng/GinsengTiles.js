import {
  DRAGON_CANCELS_ABILITIES,
  GINSENG_1_POINT_0,
  GINSENG_2_POINT_0,
  LION_TURTLE_ABILITY_ANYWHERE,
  gameOptionEnabled,
} from '../GameOptions';
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';
import {
  TrifleAbilityName,
  TrifleAbilityTriggerType,
  TrifleAbilityType,
  TrifleActivationRequirement,
  TrifleCaptureType,
  TrifleMovementDirection,
  TrifleMovementRestriction,
  TrifleMovementType,
  TriflePromptTargetType,
  TrifleRecordTilePointType,
  TrifleTargetPromptId,
  TrifleTargetType,
  TrifleTileCategory,
  TrifleTileInfo,
  TrifleTileTeam
} from '../trifle/TrifleTileInfo';
import { TrifleTileType } from '../trifle/TrifleTiles';
import { clearObject } from '../GameData';
import { defineGinsengTilesV2 } from './GinsengTilesV2';
import { setCurrentTileNames } from '../trifle/PaiShoGamesTileMetadata';

export var GinsengTileCodes = {
	WhiteLotus: "L",
	Koi: "K",
	Badgermole: "B",
	Dragon: "D",
	Bison: "FB",
	LionTurtle: "LT",
	Ginseng: "G",
	Orchid: "O",
	Wheel: "W"
};

export var GinsengTileType = {
	originalBender: "originalBender"
};

export var GinsengTilePileNames = {
	banish: "banish"
};

export var GinsengTiles = {};
export var GinsengTileInfo = {};

GinsengTileInfo.initializeTrifleData = function() {
	GinsengTileInfo.setTileNames();

	TrifleTileInfo.initializeTrifleData();

	if (gameOptionEnabled(GINSENG_2_POINT_0) || !gameOptionEnabled(GINSENG_1_POINT_0)) {
		defineGinsengTilesV2();
	} else {
		GinsengTileInfo.defineGinsengTiles();
	}
};

GinsengTileInfo.setTileNames = function() {
	/* Set tile names that do not match thier keys in TileCodes */
	var tileNames = {};

	tileNames[GinsengTileCodes.WhiteLotus] = "White Lotus";
	tileNames[GinsengTileCodes.Bison] = "Flying Bison";
	tileNames[GinsengTileCodes.LionTurtle] = "Lion Turtle";

	setCurrentTileNames(tileNames);
};

GinsengTileInfo.defineGinsengTiles = function() {
	// var GinsengTiles = {};
	clearObject(GinsengTiles);

	GinsengTiles[GinsengTileCodes.WhiteLotus] = {
		available: true,
		types: [GinsengTileCodes.WhiteLotus],
		movements: [
			{
				type: TrifleMovementType.jumpSurroundingTiles,
				jumpDirections: [TrifleMovementDirection.diagonal],
				targetTeams: [TrifleTileTeam.friendly, TrifleTileTeam.enemy],
				distance: 99,
				restrictions: [
					{
						type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
						recordTilePointType: TrifleRecordTilePointType.startPoint,
						targetTileCode: GinsengTileCodes.WhiteLotus,
						targetTeams: [TrifleTileTeam.enemy]
					}
				]
			}
		],
		abilities: [
			{
				title: "Harmony",
				type: TrifleAbilityName.protectFromCapture,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whileTargetTileIsInLineOfSight,
						targetTeams: [TrifleTileTeam.friendly],
						targetTileCodes: [GinsengTileCodes.Ginseng]
					}
				],
				targetTypes: [TrifleTargetType.thisTile]
			},
			{
				title: "Remember Start Point",
				type: TrifleAbilityName.recordTilePoint,
				priority: 1,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenDeployed,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				recordTilePointType: TrifleRecordTilePointType.startPoint
			},
			{
				type: TrifleAbilityName.moveTileToRecordedPoint,
				priority: 1,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenCapturedByTargetTile,
						targetTileTypes: [TrifleTileCategory.allTileTypes]
					}
				],
				targetTypes: [TrifleTargetType.thisTile],
				recordedPointType: TrifleRecordTilePointType.startPoint
			}
		],
		textLines: [
			"<strong>Movement</strong>",
			"- Moves by jumping over any tiles that are diagonal to it. Can be continued as a chain.",
			"",
			"<strong>Ability</strong>",
			"- White Lotus cannot be captured when Ginseng is in harmony with it.",
			"",
			"<strong>Other</strong>",
			"- Cannot capture.",
			"- When your White Lotus is captured, it is returned to its starting point."
		]
	};

	GinsengTiles[GinsengTileCodes.Koi] = {
		available: true,
		types: [GinsengTileType.originalBender],
		movements: [
			{
				type: TrifleMovementType.standard,
				distance: 5,
				captureTypes: [
					{
						type: TrifleCaptureType.all
					}
				]
			}
		],
		abilities: [
			{
				title: "Trap Enemy Tiles",
				type: TrifleAbilityName.immobilizeTiles,
				priority: 3,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whileTargetTileIsSurrounding,
						targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [TrifleTileCategory.allTileTypes],
						targetTileBoardPointTypes: [RED, WHITE],
						activationRequirements: [
							{
								type: TrifleActivationRequirement.tileIsOnPointOfType,
								targetTileTypes: [TrifleTileCategory.thisTile],
								targetPointTypes: [WHITE]
							}
						]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles]
			},
			{
				title: "Prevent Enemy Pushing Trapped Tiles",
				type: TrifleAbilityName.cancelAbilitiesTargetingTiles,
				priority: 3,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whileTargetTileIsSurrounding,
						targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [TrifleTileCategory.allTileTypes],
						activationRequirements: [
							{
								type: TrifleActivationRequirement.tileIsOnPointOfType,
								targetTileTypes: [TrifleTileCategory.thisTile],
								targetPointTypes: [WHITE]
							}
						]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				cancelAbilitiesFromTeam: TrifleTileTeam.enemy,
				cancelAbilitiesFromTileCodes: [GinsengTileCodes.Bison]
			}
		],
		textLines: [
			"<em>Original Bender</em>",
			"",
			"<strong>Movement</strong>",
			"- Can move 5 spaces",
			"- Can capture any tile by movement.",
			"",
			"<strong>Ability</strong>",
			"- Traps all surrounding enemy tiles when it is touching either White Garden."
		]
	};

	GinsengTiles[GinsengTileCodes.Dragon] = {
		available: true,
		types: [GinsengTileType.originalBender],
		movements: [
			{
				type: TrifleMovementType.standard,
				distance: 5,
				captureTypes: [
					{
						type: TrifleCaptureType.all
					}
				]
			}
		],
		abilities: [
			{
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [TrifleTileCategory.allTileTypes],
						targetTileBoardPointTypes: [RED, WHITE],
						activationRequirements: [
							{
								type: TrifleActivationRequirement.tileIsOnPointOfType,
								targetTileTypes: [TrifleTileCategory.thisTile],
								targetPointTypes: [RED]
							}
						]
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile
			}
		],
		textLines: [
			"<em>Original Bender</em>",
			"",
			"<strong>Movement</strong>",
			"- Can move 5 spaces",
			"- Can capture any tile by movement.",
			"",
			"<strong>Ability</strong>",
			!gameOptionEnabled(DRAGON_CANCELS_ABILITIES) 
				? "- Captures all surrounding tiles when it is touching either Red Garden."
				: "- Cancels abilities of surrounding tiles when it is touching either Red Garden."
		]
	};

	GinsengTiles[GinsengTileCodes.Badgermole] = {
		available: true,
		types: [GinsengTileType.originalBender],
		movements: [
			{
				type: TrifleMovementType.standard,
				distance: 5,
				captureTypes: [
					{
						type: TrifleCaptureType.all
					}
				]
			}
		],
		abilities: [
			{
				type: TrifleAbilityName.protectFromCapture,
				priority: 2,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whileTargetTileIsSurrounding,
						targetTeams: [TrifleTileTeam.friendly],
						targetTileTypes: [TrifleTileCategory.allTileTypes],
						targetTileBoardPointTypes: [RED, WHITE],
						activationRequirements: [
							{
								type: TrifleActivationRequirement.tileIsOnPointOfType,
								targetTileTypes: [TrifleTileCategory.thisTile],
								targetPointTypes: [WHITE]
							}
						]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles]
			}
			/* ,
			!gameOptionEnabled(BADGERMOLE_NOT_PREVENT_TRAP_PUSH) && {
				title: "Protect From Enemy Abilities",
				type: TrifleAbilityName.cancelAbilitiesTargetingTiles,
				priority: 2,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whileTargetTileIsSurrounding,
						targetTeams: [TrifleTileTeam.friendly],
						targetTileTypes: [TrifleTileCategory.allTileTypes],
						targetTileBoardPointTypes: [RED, WHITE],
						activationRequirements: [
							{
								type: TrifleActivationRequirement.tileIsOnPointOfType,
								targetTileTypes: [TrifleTileCategory.thisTile],
								targetPointTypes: [WHITE]
							}
						]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				targetAbilityTypes: [TrifleAbilityType.all],
				cancelAbilitiesFromTeam: TrifleTileTeam.enemy
			} */
		],
		textLines: [
			"<em>Original Bender</em>",
			"",
			"<strong>Movement</strong>",
			"- Can move 5 spaces",
			"- Can capture any tile by movement.",
			"",
			"<strong>Ability</strong>",
			"- Protects all surrounding friendly tiles when it is touching either White Garden"
		]
	};

	GinsengTiles[GinsengTileCodes.Bison] = {
		available: true,
		types: [GinsengTileType.originalBender],
		movements: [
			{
				type: TrifleMovementType.standard,
				distance: 5,
				captureTypes: [
					{
						type: TrifleCaptureType.all
					}
				]
			}
		],
		abilities: [
			{
				title: "Active Bison Push",
				type: TrifleAbilityName.moveTargetTile,
				// priority: ?,
				isPassiveMovement: true,
				optional: true,
				neededPromptTargetsInfo: [
					{
						title: "pushedTile",
						promptId: TrifleTargetPromptId.movedTilePoint,
						targetType: TriflePromptTargetType.boardPoint
					},
					{
						title: "pushLanding",
						promptId: TrifleTargetPromptId.movedTileDestinationPoint,
						targetType: TriflePromptTargetType.boardPoint
					}
				],
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTileTypes: [TrifleTileCategory.allTileTypes],
						targetTileBoardPointTypes: [RED, WHITE],
						activationRequirements: [
							{
								type: TrifleActivationRequirement.tileIsOnPointOfType,
								targetTileTypes: [TrifleTileCategory.thisTile],
								targetPointTypes: [RED]
							}
						]
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile,
				numberOfTargetTiles: 1,
				promptTargetTitle: "pushedTile",
				targetTileMovements: [
					{
						type: TrifleMovementType.awayFromTargetTileOrthogonal,
						distance: 2,
						targetTileTypes: [TrifleTileCategory.tileWithAbility],
						regardlessOfImmobilization: true
					},
					{
						type: TrifleMovementType.awayFromTargetTileDiagonal,
						distance: 1,
						targetTileTypes: [TrifleTileCategory.tileWithAbility],
						regardlessOfImmobilization: true
					}
				]
			}/* ,
			{
				title: "Passive Bison Push",
				type: TrifleAbilityName.moveTargetTile,
				// priority: ?,
				isPassiveMovement: true,
				optional: true,
				promptForTargets: true,
				neededPromptTargetsInfo: [
					{
						title: "pushedTile",
						promptId: TrifleTargetPromptId.movedTilePoint,
						targetType: TriflePromptTargetType.boardPoint
					},
					{
						title: "pushLanding",
						promptId: TrifleTargetPromptId.movedTileDestinationPoint,
						targetType: TriflePromptTargetType.boardPoint
					}
				],
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenTargetTileLandsSurrounding,
						targetTeams: [TrifleTileTeam.friendly],
						activationRequirements: [
							{
								type: TrifleActivationRequirement.tileIsOnPointOfType,
								targetTileTypes: [TrifleTileCategory.thisTile],
								targetPointTypes: [RED]
							}
						]
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.allTileTypes]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenTargetTileLandsSurrounding,
				numberOfTargetTiles: 1,
				promptTargetTitle: "pushedTile",
				targetTileMovements: [
					{
						type: TrifleMovementType.awayFromTargetTileOrthogonal,
						distance: 2,
						targetTileTypes: [TrifleTileCategory.tileWithAbility]
					},
					{
						type: TrifleMovementType.awayFromTargetTileDiagonal,
						distance: 1,
						targetTileTypes: [TrifleTileCategory.tileWithAbility]
					}
				]
			} */
		],
		textLines: [
			"<em>Original Bender</em>",
			"",
			"<strong>Movement</strong>",
			"- Can move 5 spaces",
			"- Can capture any tile by movement.",
			"",
			"<strong>Ability</strong>",
			"- Pushes a single surrounding tile in a straight line away from itself when it is touching either Red Garden.",
			// "- If you move a tile to a point surrounding your Flying Bison, you may push that tile."
		]
	};

	GinsengTiles[GinsengTileCodes.LionTurtle] = {
		available: true,
		types: [GinsengTileCodes.LionTurtle],
		movements: [
			{
				type: TrifleMovementType.standard,
				distance: 6,
				captureTypes: [
					{
						type: TrifleCaptureType.allExcludingCertainTiles,
						excludedTileCodes: [GinsengTileCodes.LionTurtle]
					}
				],
			}
		],
		abilities: [
			{
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenLandsAdjacentToTargetTile,
						targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [GinsengTileType.originalBender],
						targetTileBoardPointTypes: !gameOptionEnabled(LION_TURTLE_ABILITY_ANYWHERE) && [RED, WHITE]
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenLandsAdjacentToTargetTile
			}
		],
		textLines: [
			"<strong>Movement</strong>",
			"- Can move 6 spaces",
			"- Can capture any tile by movement except the opponent's Lion Turtle",
			"",
			"<strong>Ability</strong>",
			gameOptionEnabled(LION_TURTLE_ABILITY_ANYWHERE) ? "- Captures all adjacent Original Benders." : "- Captures all adjacent Original Benders that are touching a red/white garden."
		]
	};

	GinsengTiles[GinsengTileCodes.Wheel] = {
		available: true,
		types: [TrifleTileType.traveler],
		movements: [
			{
				type: TrifleMovementType.standard,
				distance: 99,
				captureTypes: [
					{
						type: TrifleCaptureType.all
					}
				],
				restrictions: [
					{
						type: TrifleMovementRestriction.mustPreserveDirection
					}
				]
			}
		],
		textLines: [
			"<strong>Movement</strong>",
			"- Can move unlimited spaces in one direction on the horizontal or vertical lines.",
			"- Can capture any tile by movement."
		]
	};

	GinsengTiles[GinsengTileCodes.Ginseng] = {
		available: true,
		types: [TrifleTileType.flower],
		movements: [
			{
				type: TrifleMovementType.standard,
				distance: 6
			}
		],
		abilities: [
			{
				title: "Exchange With Captured Tile",
				type: TrifleAbilityName.exchangeWithCapturedTile,
				optional: true,
				neededPromptTargetsInfo: [
					{
						title: "exchangedTile",
						promptId: TrifleTargetPromptId.chosenCapturedTile,
						targetType: TriflePromptTargetType.capturedTile
					}
				],
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenTargetTileLandsInTemple,
						targetTileTypes: [TrifleTileCategory.thisTile]
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.chosenCapturedTile],
				targetTeams: [TrifleTileTeam.friendly],
				promptTargetTitle: "exchangedTile"
			}
		],
		textLines: [
			"<strong>Movement</strong>",
			"- Can move 6 spaces",
			"- Cannot capture.",
			"",
			"<strong>Ability</strong>",
			"- White Lotus cannot be captured when Ginseng is in harmony with it.",
			"- May retrieve a captured tile by being exchanged at either the Eastern or Western Temples."
		]
	};

	GinsengTiles[GinsengTileCodes.Orchid] = {
		available: true,
		types: [TrifleTileType.flower],
		movements: [
			{
				type: TrifleMovementType.standard,
				distance: 6,
				captureTypes: [
					{
						type: TrifleCaptureType.allExcludingCertainTiles,
						excludedTileCodes: [GinsengTileCodes.WhiteLotus]
					}
				]
			}
		],
		abilities: [
			{
				type: TrifleAbilityName.moveTargetTileToPile,
				destinationPile: GinsengTilePileNames.banish,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenCapturingTargetTile,
						targetTeams: [TrifleTileTeam.enemy]
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement
					}
				],
				targetTypes: [
					TrifleTargetType.triggerTargetTiles,
					TrifleTargetType.thisTile
				],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenCapturingTargetTile
			},
			{
				title: "Exchange With Captured Tile",
				type: TrifleAbilityName.exchangeWithCapturedTile,
				optional: true,
				neededPromptTargetsInfo: [
					{
						title: "exchangedTile",
						promptId: TrifleTargetPromptId.chosenCapturedTile,
						targetType: TriflePromptTargetType.capturedTile
					}
				],
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenTargetTileLandsInTemple,
						targetTileTypes: [TrifleTileCategory.thisTile]
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.chosenCapturedTile],
				targetTeams: [TrifleTileTeam.friendly],
				promptTargetTitle: "exchangedTile"
			}
		],
		textLines: [
			"<strong>Movement</strong>",
			"- Can move 6 spaces",
			"- Unique Capture: Orchid banishes the tile it captures and itself. Banished tiles cannot be retrieved.",
			"- Cannot capture/banish the White Lotus.",
			"",
			"<strong>Ability</strong>",
			"- May retrieve a captured tile by being exchanged at either the Eastern or Western Temples."
		]
	};

	/* Apply Capture and Ability Activation Requirements Rules */
	applyCaptureAndAbilityActivationRequirementRules(GinsengTiles);

	/* if (gameOptionEnabled(CAPTURE_ABILITY_TARGET_1)) {
		debug("Change Lion Turtle and Dragon abilities");
		GinsengTiles[GinsengTileCodes.Dragon].abilities = [
			{
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [TrifleTileCategory.allTileTypes],
						activationRequirements: [
							{
								type: TrifleActivationRequirement.tileIsOnPointOfType,
								targetTileTypes: [TrifleTileCategory.thisTile],
								targetPointTypes: [RED]
							}
						]
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile
			}
		];
	} */
};

function applyCaptureAndAbilityActivationRequirementRules(GinsengTiles) {
	Object.keys(GinsengTiles).forEach(function(key, index) {
		var tileInfo = GinsengTiles[key];
		if (tileInfo.movements && tileInfo.movements.length) {
			tileInfo.movements.forEach(function(movementInfo) {
				/* Add Capture-By-Movement Activation Requirement: Both Lotus Tiles Are Not In Temple */
				if (movementInfo.captureTypes && movementInfo.captureTypes.length) {
					movementInfo.captureTypes.forEach(function(captureTypeInfo) {
						var activationRequirement = {
							type: TrifleActivationRequirement.tilesNotInTemple,
							targetTileCodes: [GinsengTileCodes.WhiteLotus],
							targetTeams: [TrifleTileTeam.friendly, TrifleTileTeam.enemy]
						};
						if (captureTypeInfo.activationRequirements) {
							captureTypeInfo.activationRequirements.push(activationRequirement);
						} else {
							captureTypeInfo["activationRequirements"] = [activationRequirement];
						}
					});
				}

				/* Add Movement Restriction For All Tiles Except Lotus: 
				 * Cannot Move Onto Any Lotus Starting Point
				 */
				if (!tileInfo.types.includes(GinsengTileCodes.WhiteLotus)) {
					var movementRestriction = {
						type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
						recordTilePointType: TrifleRecordTilePointType.startPoint,
						targetTileCode: GinsengTileCodes.WhiteLotus,
						targetTeams: [TrifleTileTeam.friendly, TrifleTileTeam.enemy]
					};
					if (movementInfo.restrictions) {
						movementInfo.restrictions.push(movementRestriction);
					} else {
						movementInfo["restrictions"] = [movementRestriction];
					}
				}
			});
		}

		if (tileInfo.abilities && tileInfo.abilities.length) {
			tileInfo.abilities.forEach(function(abilityInfo) {
				/* Add Ability Activation Requirement: Friendly Lotus Not In A Temple */
				if (abilityInfo.type !== TrifleAbilityName.recordTilePoint 
						&& abilityInfo.triggers && abilityInfo.triggers.length) {
					abilityInfo.triggers.forEach(function(triggerInfo) {
						var triggerActivationRequirement = {
							type: TrifleActivationRequirement.tilesNotInTemple,
							targetTileCodes: [GinsengTileCodes.WhiteLotus],
							targetTeams: [TrifleTileTeam.friendly]
						};
						if (triggerInfo.activationRequirements) {
							triggerInfo.activationRequirements.push(triggerActivationRequirement);
						} else {
							triggerInfo["activationRequirements"] = [triggerActivationRequirement];
						}
					});
				}
			});
		}

		/* Add Ability: Protect Tiles While In A Temple */
		if (!tileInfo.abilities) {
			tileInfo.abilities = [];
		}
		var protectFromCaptureWhileInTempleAbility = {
			title: "Protect From Capture While In Temple",
			type: TrifleAbilityName.protectFromCapture,
			triggers: [
				{
					triggerType: TrifleAbilityTriggerType.whileInsideTemple,
					targetTileTypes: [TrifleTileCategory.thisTile]
				}
			],
			targetTypes: [TrifleTargetType.triggerTargetTiles]
		};
		var protectFromEnemyAbilitiesWhileInTempleAbility = {
			title: "Protect From Enemy Abilities While In Temple",
			type: TrifleAbilityName.cancelAbilitiesTargetingTiles,
			triggers: [
				{
					triggerType: TrifleAbilityTriggerType.whileInsideTemple,
					targetTileTypes: [TrifleTileCategory.thisTile]
				}
			],
			targetTypes: [TrifleTargetType.triggerTargetTiles],
			targetAbilityTypes: [TrifleAbilityType.all],
			cancelAbilitiesFromTeam: TrifleTileTeam.enemy
		};
		var protectFromFriendlyPushAbilitiesWhileInTempleAbility = {
			title: "Protect From Friendly Push Abilities While In Temple",
			type: TrifleAbilityName.cancelAbilitiesTargetingTiles,
			triggers: [
				{
					triggerType: TrifleAbilityTriggerType.whileInsideTemple,
					targetTileTypes: [TrifleTileCategory.thisTile]
				}
			],
			targetTypes: [TrifleTargetType.triggerTargetTiles],
			targetAbilityTypes: [TrifleAbilityType.moveTargetTile],
			cancelAbilitiesFromTeam: TrifleTileTeam.friendly
		};
		tileInfo.abilities.push(protectFromCaptureWhileInTempleAbility);
		tileInfo.abilities.push(protectFromEnemyAbilitiesWhileInTempleAbility);
		tileInfo.abilities.push(protectFromFriendlyPushAbilitiesWhileInTempleAbility);
		// ------

	});
}
