import { clearObject } from '../GameData';
import {
	TrifleMovementType,
	TrifleMovementDirection,
	TrifleMovementRestriction,
	TrifleTileCategory,
	TrifleTargetType,
	TrifleAbilityName,
	TrifleAbilityTriggerType,
	TrifleRecordTilePointType,
	TrifleTileTeam
} from '../trifle/TrifleTileInfo';

export const NickTileCodes = {
	WhiteLotus: "L",
	Avatar: "AV",
	Air: "A",
	Water: "W",
	Earth: "E",
	Fire: "F"
};

export const NickTileType = {
	siyuan: "siyuan",
	fournations: "fournations",
	siyuangaoling: "siyuangaoling",
	fournationsgaoling: "fournationsgaoling",
	custom: "custom"
};

export const TilePileNames = {
	banish: "banish"
};

export const initializeTrifleData = () => {
	// Call the Trifle initialization directly - note: this would need to be imported
	// For now, we'll keep the global reference since the base Trifle needs to be initialized first
	// Trifle.TileInfo.initializeTrifleData();
	defineNickTiles();
};

export const NickTiles = {};

const defineNickTiles = () => {
	clearObject(NickTiles);

	NickTiles[NickTileCodes.WhiteLotus] = {
		available: true,
		types: [NickTileCodes.WhiteLotus],
		movements: [
    		{
        		type: TrifleMovementType.orthAndDiag,
        		distance: 1,
        		targetTeams: [TrifleTileTeam.friendly, TrifleTileTeam.enemy],
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
                		targetTileCode: NickTileCodes.WhiteLotus,
                		targetTeams: [TrifleTileTeam.enemy]
            		}
        		]
    		}
		],
		abilities: [],
		textLines: [
			"<strong>Movement</strong>",
			"- Can move to one of the 8 surrounding points that is empty.",
			"- Cannot jump over other tiles.",
			"",
			"<strong>Capture</strong>",
			"- Cannot capture.",
			"",
			"<strong>King</strong>",
			"- Move your White Lotus to the center of the board to win.",
			"- Instead of being captured, it is put into check. It must exit check on your turn or you lose."
		]
	};

	NickTiles[NickTileCodes.Avatar] = {
		available: true,
		types: [NickTileCodes.Avatar],
		movements: [
    		{
        		type: TrifleMovementType.orthAndDiag,
        		distance: 1,
        		targetTeams: [TrifleTileTeam.friendly, TrifleTileTeam.enemy],
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
                		targetTileCode: NickTileCodes.WhiteLotus,
                		targetTeams: [TrifleTileTeam.enemy]
            		}
        		]
    			},
    		{
        		type: TrifleMovementType.jumpSurroundingTiles,
        		jumpDirections: [TrifleMovementDirection.orthogonal, TrifleMovementDirection.diagonal],
        		targetTeams: [TrifleTileTeam.friendly],
        		distance: 99,
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
                		targetTileCode: NickTileCodes.WhiteLotus,
                		targetTeams: [TrifleTileTeam.enemy]
            		}
        		]
    		}
		],
		abilities: [
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
			{	// Passive Ability: Capture Surrounding Tiles
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [NickTileCodes.Water,NickTileCodes.Avatar,NickTileCodes.Air,NickTileCodes.Earth,NickTileCodes.Fire],
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
			"<strong>Movement</strong>",
			"- Can move to one of the 8 surrounding points that is empty.",
			"- Can jump over friendly tiles. Can be chained.",
			"",
			"<strong>Capture</strong>",
			"- Can capture any enemy tile.",
			"- Can be captured by any enemy tile.",
			"",
			"<strong>Ability</strong>",
			"- If yours is captured, it returns to its starting point if you capture the enemy Avatar."
		]
	};

	NickTiles[NickTileCodes.Air] = {
		available: true,
		types: [NickTileCodes.Air],
		movements: [
    		{
        		type: TrifleMovementType.orthAndDiag,
        		distance: 1,
        		targetTeams: [TrifleTileTeam.friendly, TrifleTileTeam.enemy],
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
                		targetTileCode: NickTileCodes.WhiteLotus,
                		targetTeams: [TrifleTileTeam.enemy]
            		}
        		]
    			},
    		{
        		type: TrifleMovementType.jumpSurroundingTiles,
        		jumpDirections: [TrifleMovementDirection.orthogonal, TrifleMovementDirection.diagonal],
        		targetTeams: [TrifleTileTeam.friendly],
        		distance: 99,
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
                		targetTileCode: NickTileCodes.WhiteLotus,
                		targetTeams: [TrifleTileTeam.enemy]
            		}
        		]
    		}
		],
		abilities: [
			{	// Passive Ability: Capture Surrounding Tiles
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [NickTileCodes.Water,NickTileCodes.Avatar],
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile
			},
			{// Passive Ability: Capture Tiles That Move Into Its Range
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
					triggerType: TrifleAbilityTriggerType.whenTargetTileLandsSurrounding,
					targetTeams: [TrifleTileTeam.enemy],
					targetTileTypes: [NickTileCodes.Water],
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenTargetTileLandsSurrounding
			}
		],
		textLines: [
			"<strong>Movement</strong>",
			"- Can move to one of the 8 surrounding points that is empty.",
			"- Can jump over friendly tiles. Can be chained.",
			"",
			"<strong>Capture</strong>",
			"- Can capture only enemy Water tiles.",
			"- Can be captured only by enemy Fire tiles."
		]
	};

	NickTiles[NickTileCodes.Water] = {
		available: true,
		types: [NickTileCodes.Water],
		movements: [
    		{
        		type: TrifleMovementType.orthAndDiag,
        		distance: 1,
        		targetTeams: [TrifleTileTeam.friendly, TrifleTileTeam.enemy],
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
                		targetTileCode: NickTileCodes.WhiteLotus,
                		targetTeams: [TrifleTileTeam.enemy]
            		}
        		]
    			},
    		{
        		type: TrifleMovementType.jumpSurroundingTiles,
        		jumpDirections: [TrifleMovementDirection.orthogonal, TrifleMovementDirection.diagonal],
        		targetTeams: [TrifleTileTeam.friendly],
        		distance: 99,
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
                		targetTileCode: NickTileCodes.WhiteLotus,
                		targetTeams: [TrifleTileTeam.enemy]
            		}
        		]
    		}
		],
		abilities: [
			{	// Passive Ability: Capture Surrounding Tiles
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [NickTileCodes.Earth,NickTileCodes.Avatar],
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile
			},
			{// Passive Ability: Capture Tiles That Move Into Its Range
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
					triggerType: TrifleAbilityTriggerType.whenTargetTileLandsSurrounding,
					targetTeams: [TrifleTileTeam.enemy],
					targetTileTypes: [NickTileCodes.Earth],
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenTargetTileLandsSurrounding
			}
		],
		textLines: [
			"<strong>Movement</strong>",
			"- Can move to one of the 8 surrounding points that is empty.",
			"- Can jump over friendly tiles. Can be chained.",
			"",
			"<strong>Capture</strong>",
			"- Can capture only enemy Earth tiles.",
			"- Can be captured only by enemy Air tiles."
		]
	};

	NickTiles[NickTileCodes.Earth] = {
		available: true,
		types: [NickTileCodes.Earth],
		movements: [
    		{
        		type: TrifleMovementType.orthAndDiag,
        		distance: 1,
        		targetTeams: [TrifleTileTeam.friendly, TrifleTileTeam.enemy],
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
                		targetTileCode: NickTileCodes.WhiteLotus,
                		targetTeams: [TrifleTileTeam.enemy]
            		}
        		]
    			},
    		{
        		type: TrifleMovementType.jumpSurroundingTiles,
        		jumpDirections: [TrifleMovementDirection.orthogonal, TrifleMovementDirection.diagonal],
        		targetTeams: [TrifleTileTeam.friendly],
        		distance: 99,
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
				targetTileCode: NickTileCodes.WhiteLotus,
                			targetTeams: [TrifleTileTeam.enemy]
            			}
        			]
    			}
		],
		abilities: [
			{	// Passive Ability: Capture Surrounding Tiles
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [NickTileCodes.Fire,NickTileCodes.Avatar],
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile
			},
			{// Passive Ability: Capture Tiles That Move Into Its Range
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
					triggerType: TrifleAbilityTriggerType.whenTargetTileLandsSurrounding,
					targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [NickTileCodes.Fire],
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenTargetTileLandsSurrounding
			}
		],
		textLines: [
			"<strong>Movement</strong>",
			"- Can move to one of the 8 surrounding points that is empty.",
			"- Can jump over friendly tiles. Can be chained.",
			"",
			"<strong>Capture</strong>",
			"- Can capture only enemy Fire tiles.",
			"- Can be captured only by enemy Water tiles."
		]
	};

	NickTiles[NickTileCodes.Fire] = {
		available: true,
		types: [NickTileCodes.Fire],
		movements: [
    		{
        		type: TrifleMovementType.orthAndDiag,
        		distance: 1,
        		targetTeams: [TrifleTileTeam.friendly, TrifleTileTeam.enemy],
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
                		targetTileCode: NickTileCodes.WhiteLotus,
                		targetTeams: [TrifleTileTeam.enemy]
            		}
        		]
    			},
    		{
        		type: TrifleMovementType.jumpSurroundingTiles,
        		jumpDirections: [TrifleMovementDirection.orthogonal, TrifleMovementDirection.diagonal],
        		targetTeams: [TrifleTileTeam.friendly],
        		distance: 99,
        		restrictions: [
            		{
                		type: TrifleMovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: TrifleRecordTilePointType.startPoint,
                		targetTileCode: NickTileCodes.WhiteLotus,
                		targetTeams: [TrifleTileTeam.enemy]
            		}
        		]
    		}
		],
		abilities: [
			{	// Passive Ability: Capture Surrounding Tiles
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [TrifleTileTeam.enemy],
						targetTileTypes: [NickTileCodes.Air,NickTileCodes.Avatar],
					},
					{
						triggerType: TrifleAbilityTriggerType.whenActiveMovement,
						targetTileTypes: [TrifleTileCategory.thisTile]
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenLandsSurroundingTargetTile
			},
			{// Passive Ability: Capture Tiles That Move Into Its Range
				type: TrifleAbilityName.captureTargetTiles,
				triggers: [
					{
					triggerType: TrifleAbilityTriggerType.whenTargetTileLandsSurrounding,
					targetTeams: [TrifleTileTeam.enemy],
					targetTileTypes: [NickTileCodes.Air],
					}
				],
				targetTypes: [TrifleTargetType.triggerTargetTiles],
				triggerTypeToTarget: TrifleAbilityTriggerType.whenTargetTileLandsSurrounding
			}
		],
		textLines: [
			"<strong>Movement</strong>",
			"- Can move to one of the 8 surrounding points that is empty.",
			"- Can jump over friendly tiles. Can be chained.",
			"",
			"<strong>Capture</strong>",
			"- Can capture only enemy Air tiles.",
			"- Can be captured only by enemy Earth tiles."
		]
	};

	applyCaptureAndAbilityActivationRequirementRules(NickTiles);

	return NickTiles;
};

export const TileInfo = defineNickTiles;

// Initialize and export the tiles
let NickTilesData = {};

export const getNickTiles = () => {
	if (Object.keys(NickTilesData).length === 0) {
		NickTilesData = defineNickTiles();
	}
	return NickTilesData;
};

const applyCaptureAndAbilityActivationRequirementRules = (tiles) => {
	Object.keys(tiles).forEach((key) => {
		const tileInfo = tiles[key];
		if (!tileInfo.abilities) {
			tileInfo.abilities = [];
		}

		const returnFriendlyAvatarOnEnemyAvatarCapturedAbility = {
			title: "Return Friendly Avatar When Enemy Avatar Captured",
			type: TrifleAbilityName.moveTileToRecordedPoint,
			priority: 1,
			triggers: [
				{
					triggerType: TrifleAbilityTriggerType.whenCapturingTargetTile,
					targetTeams: [TrifleTileTeam.enemy],
					targetTileCodes: [NickTileCodes.Avatar]
				}
			],
			targetTypes: [TrifleTargetType.chosenCapturedTile],
			targetTileCodes: [NickTileCodes.Avatar],
			targetTeams: [TrifleTileTeam.friendly],
			recordedPointType: TrifleRecordTilePointType.startPoint
		};

		tileInfo.abilities.push(returnFriendlyAvatarOnEnemyAvatarCapturedAbility);

		// Sort abilities so whenLandsSurroundingTargetTile comes before whenTargetTileLandsSurrounding
		tileInfo.abilities.sort((a, b) => {
			// Helper to find the first triggerType in triggers array
			const getFirstTriggerType = (ability) => {
				if (!ability.triggers || !ability.triggers.length) return '';
				return ability.triggers[0].triggerType;
			};
			const order = [
				TrifleAbilityTriggerType.whenLandsSurroundingTargetTile,
				TrifleAbilityTriggerType.whenTargetTileLandsSurrounding
			];
			const aType = getFirstTriggerType(a);
			const bType = getFirstTriggerType(b);
			const aIdx = order.indexOf(aType);
			const bIdx = order.indexOf(bType);
			// If both are in the order array, sort by their order
			if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
			// If only a is in the order, it comes first
			if (aIdx !== -1) return -1;
			// If only b is in the order, it comes first
			if (bIdx !== -1) return 1;
			// Otherwise, keep original order
			return 0;
		});
	});
};
