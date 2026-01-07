
Nick.TileCodes = {
	WhiteLotus: "L",
	Avatar: "AV",
	Air: "A",
	Water: "W",
	Earth: "E",
	Fire: "F"
};

Nick.TileType = {
	standard: "standard"
};

Nick.TilePileNames = {
	banish: "banish"
};

Nick.NickTiles = {};
Nick.TileInfo = {};

Nick.TileInfo.initializeTrifleData = function() {
	Nick.TileInfo.setTileNames();

	Trifle.TileInfo.initializeTrifleData();
		Nick.TileInfo.defineNickTiles();
	
};

Nick.TileInfo.defineNickTiles = function() {
	var NickTiles = {};

	NickTiles[Nick.TileCodes.WhiteLotus] = {
		available: true,
		types: [Nick.TileCodes.WhiteLotus],
		movements: [
    		{
        		type: Trifle.MovementType.standard,
        		distance: 1,
        		targetTeams: [Trifle.TileTeam.friendly, Trifle.TileTeam.enemy],
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
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

	NickTiles[Nick.TileCodes.Avatar] = {
		available: true,
		types: [Nick.TileCodes.Avatar],
		movements: [
    		{
        		type: Trifle.MovementType.standard,
        		distance: 1,
        		targetTeams: [Trifle.TileTeam.friendly, Trifle.TileTeam.enemy],
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
            		}
        		]
    			},
    		{
        		type: Trifle.MovementType.jumpSurroundingTiles,
        		jumpDirections: [Trifle.MovementDirection.orthogonal, Trifle.MovementDirection.diagonal],
        		targetTeams: [Trifle.TileTeam.friendly],
        		distance: 99,
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
            		}
        		]
    		}
		],
		abilities: [
			{
				title: "Remember Start Point",
				type: Trifle.AbilityName.recordTilePoint,
				priority: 1,
				triggers: [
					{
						triggerType: Trifle.AbilityTriggerType.whenDeployed,
						targetTileTypes: [Trifle.TileCategory.thisTile]
					}
				],
				targetTypes: [Trifle.TargetType.triggerTargetTiles],
				recordTilePointType: Trifle.RecordTilePointType.startPoint
			},
			{	// Passive Ability: Capture Surrounding Tiles
				type: Trifle.AbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: Trifle.AbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [Trifle.TileTeam.enemy],
						targetTileTypes: [Trifle.TileCategory.allTileTypes],
					},
					{
						triggerType: Trifle.AbilityTriggerType.whenActiveMovement,
						targetTileTypes: [Trifle.TileCategory.thisTile]
					}
				],
				targetTypes: [Trifle.TargetType.triggerTargetTiles],
				triggerTypeToTarget: Trifle.AbilityTriggerType.whenLandsSurroundingTargetTile
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

	NickTiles[Nick.TileCodes.Air] = {
		available: true,
		types: [Nick.TileCodes.Air],
		movements: [
    		{
        		type: Trifle.MovementType.standard,
        		distance: 1,
        		targetTeams: [Trifle.TileTeam.friendly, Trifle.TileTeam.enemy],
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
            		}
        		]
    			},
    		{
        		type: Trifle.MovementType.jumpSurroundingTiles,
        		jumpDirections: [Trifle.MovementDirection.orthogonal, Trifle.MovementDirection.diagonal],
        		targetTeams: [Trifle.TileTeam.friendly],
        		distance: 99,
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
            		}
        		]
    		}
		],
		abilities: [
			{	// Passive Ability: Capture Surrounding Tiles
				type: Trifle.AbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: Trifle.AbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [Trifle.TileTeam.enemy],
						targetTileTypes: [Nick.TileCodes.Water,Nick.TileCodes.Avatar,Nick.TileCodes.WhiteLotus],
					},
					{
						triggerType: Trifle.AbilityTriggerType.whenActiveMovement,
						targetTileTypes: [Trifle.TileCategory.thisTile]
					}
				],
				targetTypes: [Trifle.TargetType.triggerTargetTiles],
				triggerTypeToTarget: Trifle.AbilityTriggerType.whenLandsSurroundingTargetTile
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

	NickTiles[Nick.TileCodes.Water] = {
		available: true,
		types: [Nick.TileCodes.Water],
		movements: [
    		{
        		type: Trifle.MovementType.standard,
        		distance: 1,
        		targetTeams: [Trifle.TileTeam.friendly, Trifle.TileTeam.enemy],
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
            		}
        		]
    			},
    		{
        		type: Trifle.MovementType.jumpSurroundingTiles,
        		jumpDirections: [Trifle.MovementDirection.orthogonal, Trifle.MovementDirection.diagonal],
        		targetTeams: [Trifle.TileTeam.friendly],
        		distance: 99,
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
            		}
        		]
    		}
		],
		abilities: [
			{	// Passive Ability: Capture Surrounding Tiles
				type: Trifle.AbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: Trifle.AbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [Trifle.TileTeam.enemy],
						targetTileTypes: [Nick.TileCodes.Air,Nick.TileCodes.Avatar,Nick.TileCodes.WhiteLotus],
					},
					{
						triggerType: Trifle.AbilityTriggerType.whenActiveMovement,
						targetTileTypes: [Trifle.TileCategory.thisTile]
					}
				],
				targetTypes: [Trifle.TargetType.triggerTargetTiles],
				triggerTypeToTarget: Trifle.AbilityTriggerType.whenLandsSurroundingTargetTile
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

	NickTiles[Nick.TileCodes.Earth] = {
		available: true,
		types: [Nick.TileCodes.Earth],
		movements: [
    		{
        		type: Trifle.MovementType.standard,
        		distance: 1,
        		targetTeams: [Trifle.TileTeam.friendly, Trifle.TileTeam.enemy],
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
            		}
        		]
    			},
    		{
        		type: Trifle.MovementType.jumpSurroundingTiles,
        		jumpDirections: [Trifle.MovementDirection.orthogonal, Trifle.MovementDirection.diagonal],
        		targetTeams: [Trifle.TileTeam.friendly],
        		distance: 99,
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
            		}
        		]
    		}
		],
		abilities: [
			{	// Passive Ability: Capture Surrounding Tiles
				type: Trifle.AbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: Trifle.AbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [Trifle.TileTeam.enemy],
						targetTileTypes: [Nick.TileCodes.Fire,Nick.TileCodes.Avatar,Nick.TileCodes.WhiteLotus],
					},
					{
						triggerType: Trifle.AbilityTriggerType.whenActiveMovement,
						targetTileTypes: [Trifle.TileCategory.thisTile]
					}
				],
				targetTypes: [Trifle.TargetType.triggerTargetTiles],
				triggerTypeToTarget: Trifle.AbilityTriggerType.whenLandsSurroundingTargetTile
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

	NickTiles[Nick.TileCodes.Fire] = {
		available: true,
		types: [Nick.TileCodes.Fire],
		movements: [
    		{
        		type: Trifle.MovementType.standard,
        		distance: 1,
        		targetTeams: [Trifle.TileTeam.friendly, Trifle.TileTeam.enemy],
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
            		}
        		]
    			},
    		{
        		type: Trifle.MovementType.jumpSurroundingTiles,
        		jumpDirections: [Trifle.MovementDirection.orthogonal, Trifle.MovementDirection.diagonal],
        		targetTeams: [Trifle.TileTeam.friendly],
        		distance: 99,
        		restrictions: [
            		{
                		type: Trifle.MovementRestriction.restrictMovementOntoRecordedTilePoint,
                		recordTilePointType: Trifle.RecordTilePointType.startPoint,
                		targetTileCode: Nick.TileCodes.WhiteLotus,
                		targetTeams: [Trifle.TileTeam.enemy]
            		}
        		]
    		}
		],
		abilities: [
			{	// Passive Ability: Capture Surrounding Tiles
				type: Trifle.AbilityName.captureTargetTiles,
				triggers: [
					{
						triggerType: Trifle.AbilityTriggerType.whenLandsSurroundingTargetTile,
						targetTeams: [Trifle.TileTeam.enemy],
						targetTileTypes: [Nick.TileCodes.Air,Nick.TileCodes.Avatar,Nick.TileCodes.WhiteLotus],
					},
					{
						triggerType: Trifle.AbilityTriggerType.whenActiveMovement,
						targetTileTypes: [Trifle.TileCategory.thisTile]
					}
				],
				targetTypes: [Trifle.TargetType.triggerTargetTiles],
				triggerTypeToTarget: Trifle.AbilityTriggerType.whenLandsSurroundingTargetTile
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

	/* Apply Capture and Ability Activation Requirements Rules */
	Nick.applyCaptureAndAbilityActivationRequirementRules(NickTiles);
	Nick.NickTiles = NickTiles;
};

Nick.applyCaptureAndAbilityActivationRequirementRules = function(NickTiles) {
    Object.keys(NickTiles).forEach(function(key) {
        var tileInfo = NickTiles[key];
        if (!tileInfo.abilities) {
            tileInfo.abilities = [];
        }

        var returnFriendlyAvatarOnEnemyAvatarCapturedAbility = {
            title: "Return Friendly Avatar When Enemy Avatar Captured",
            type: Trifle.AbilityName.moveTileToRecordedPoint,
            priority: 1,
            triggers: [
                {
                    triggerType: Trifle.AbilityTriggerType.whenCapturingTargetTile,
                    targetTeams: [Trifle.TileTeam.enemy],
                    targetTileCodes: [Nick.TileCodes.Avatar],
                    targetTileTypes: [Trifle.TileCategory.thisTile]
                }
            ],
            targetTypes: [Trifle.TargetType.chosenCapturedTile],
            targetTileCodes: [Nick.TileCodes.Avatar],
            targetTeams: [Trifle.TileTeam.friendly]
        };

        tileInfo.abilities.push(returnFriendlyAvatarOnEnemyAvatarCapturedAbility);
    });
};