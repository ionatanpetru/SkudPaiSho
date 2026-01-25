
export class TumbleweedBoardPoint {
	static notationPointStringMap = {};

	static Types = {
		nonPlayable: "Non-Playable",
		normal: "Normal"
	};

	constructor() {
		this.types = [];
		this.row = -1;
		this.col = -1;
		this.notationRowNum = -1;
		this.notationRowString = '';
		this.notationColNum = -1;
		this.notationColString = '';
		this.settlement = null;
	}

	addType(type) {
		if (!this.types.includes(type)) {
			this.types.push(type);
		}
	}

	isType(type) {
		return this.types.includes(type);
	}

	removeType(type) {
		for (var i = 0; i < this.types.length; i++) {
			if (this.types[i] === type) {
				this.types.splice(i, 1);
			}
		}
	}

	getNotationPointString() {
		return this.notationColString + this.notationRowString;
	}

	setNotationRow(rowNum) {
		this.notationRowNum = rowNum;
		this.notationRowString = rowNum.toString();
	}

	setNotationCol(colNum) {
		this.notationColNum = colNum;
		this.notationColString = String.fromCharCode(96 + colNum);
	}

	setSettlement(player, value) {
		this.settlement = {
			ownerName: player,
			value: value
		};
	}

	hasSettlement() {
		return this.settlement != null;
	}

	getSettlementOwner() {
		return this.settlement && this.settlement.ownerName;
	}

	getSettlementValue() {
		return this.hasSettlement() ? this.settlement.value : 0;
	}
}
