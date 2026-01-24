// Skud Pai Sho Game Rules Configuration
// These rules control various game mechanics and can be customized per game variant

export const SkudPaiShoRules = {
	// Knotweed Rules
	newKnotweedRules: true,  // Always on - Knotweed drains harmonies

	// Canon/Simplification Rules
	simpleCanonRules: false,  // Simplified tile set
	simplest: false,  // Simple Accents and Special Flowers

	// Special Flower Rules
	newSpecialFlowerRules: false,  // Special Flowers planted next to Growing Flower
	simpleSpecialFlowerRule: false,  // Simplest special flower rule
	specialFlowerBonusRule: false,  // Special Flowers can be moved on Harmony Bonus - not implemented

	// Gate Rules
	newGatesRule: true,  // Always on - Player cannot plant on Bonus if controlling two Gates
	limitedGatesRule: true,  // Cannot Plant Basic Flower on Bonus if controlling any Gates
	specialFlowerLimitedRule: false,  // NOT UI READY - Cannot Plant Special Flower on Bonus if not able to Plant Basic Flower
	lessBonus: false,  // Can only Plant on Bonus if no Growing Flowers

	// Wheel Rules
	newWheelRule: true,  // Always on - Wheel can be played next to Gate

	// Orchid Rules
	newOrchidClashRule: false,  // Orchid clashes with all opponent Flowers
	newOrchidVulnerableRule: false,  // New Orchid vulnerable rules
	newOrchidCaptureRule: false,  // New Orchid capture rules

	// Rock Rules
	rocksUnwheelable: true,  // Always on - Rocks cannot be moved by Wheel but can be removed by Boat
	simpleRocks: false,  // Rocks don't disable Harmonies
	superRocks: false,  // Tiles surrounding Rock cannot be moved by Wheel

	// Lotus Rules
	lotusNoCapture: true,  // Always on - Lotus cannot be captured

	// Harmony Rules
	superHarmonies: false,  // Any number flower harmonies with differently numbered flower
	completeHarmony: false,  // Harmony Ring must contain a 3, 4, and 5

	// Boat Rules
	boatOnlyMoves: false,  // Boat moves all tiles to surrounding space, no removing Accents

	// Game Start Rules
	sameStart: true,  // Host starts with same tile, not clashing tile
	oneGrowingFlower: false,  // Only one growing flower allowed
};

// Named exports for backward compatibility
export const newKnotweedRules = SkudPaiShoRules.newKnotweedRules;
export const simpleCanonRules = SkudPaiShoRules.simpleCanonRules;
export const newSpecialFlowerRules = SkudPaiShoRules.newSpecialFlowerRules;
export const newGatesRule = SkudPaiShoRules.newGatesRule;
export const newWheelRule = SkudPaiShoRules.newWheelRule;
export const newOrchidClashRule = SkudPaiShoRules.newOrchidClashRule;
export const newOrchidVulnerableRule = SkudPaiShoRules.newOrchidVulnerableRule;
export const newOrchidCaptureRule = SkudPaiShoRules.newOrchidCaptureRule;
export const simpleSpecialFlowerRule = SkudPaiShoRules.simpleSpecialFlowerRule;
export const specialFlowerBonusRule = SkudPaiShoRules.specialFlowerBonusRule;
export const rocksUnwheelable = SkudPaiShoRules.rocksUnwheelable;
export const lotusNoCapture = SkudPaiShoRules.lotusNoCapture;
export const simpleRocks = SkudPaiShoRules.simpleRocks;
export const simplest = SkudPaiShoRules.simplest;
export const lessBonus = SkudPaiShoRules.lessBonus;
export const superHarmonies = SkudPaiShoRules.superHarmonies;
export const completeHarmony = SkudPaiShoRules.completeHarmony;
export const superRocks = SkudPaiShoRules.superRocks;
export const boatOnlyMoves = SkudPaiShoRules.boatOnlyMoves;
export const sameStart = SkudPaiShoRules.sameStart;
export const oneGrowingFlower = SkudPaiShoRules.oneGrowingFlower;
export const limitedGatesRule = SkudPaiShoRules.limitedGatesRule;
export const specialFlowerLimitedRule = SkudPaiShoRules.specialFlowerLimitedRule;

// Default export for easy extension by other games
export default SkudPaiShoRules;
