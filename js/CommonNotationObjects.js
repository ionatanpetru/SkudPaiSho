// Common Notation Objects and Variables

export var GUEST = "GUEST";
export var HOST = "HOST";
export var OTHER_PLAYER = "OTHER";

// Turn actions ----------------
export var PLANTING = "Planting";
export var ARRANGING = "Arranging";

export var DEPLOY = "Deploy";
export var MOVE = "Move";
export var SETUP = "Setup";	// Because it is shorter than the old existing "Initial Setup" string

export var TEAM_SELECTION = "Team Selection";

export var INITIAL_SETUP = "Initial Setup";
// -----------------------------

export var DRAW_OFFER = "~~"; //"≈";
export var DRAW_REFUSE = "=/="; //"≠";
export var DRAW_ACCEPT = "==";
export var PASS_TURN = "--";

// ---------

export function RowAndColumn(row, col) {
	this.row = row;
	this.col = col;

	this.x = col - 8;
	this.y = 8 - row;
	this.notationPointString = this.x + "," + this.y;
}

RowAndColumn.prototype.samesies = function(other) {
	return this.row === other.row && this.col === other.col;
};

RowAndColumn.prototype.getNotationPoint = function() {
	return new NotationPoint(this.notationPointString);
};

// --------------------------------------------- // 

export function NotationPoint(text) {
	this.pointText = text;

	var parts = this.pointText.split(',');

	this.x = parseInt(parts[0]);
	this.y = parseInt(parts[1]);

	var col = this.x + 8;
	var row = Math.abs(this.y - 8);

	this.rowAndColumn = new RowAndColumn(row, col);
}

NotationPoint.prototype.samesies = function(other) {
	return this.x === other.x && this.y === other.y;
};

NotationPoint.prototype.toArr = function() {
	return [this.x, this.y];
};

