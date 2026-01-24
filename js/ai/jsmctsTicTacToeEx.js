import { Action, Game, Player } from "./jsmcts";


export class TicTacToeAction extends Action {
	constructor(p) {
		super();
		this.pos = p;
	}

	toString() {
		return "" + this.pos;
	}
}

export class TicTacToeGame extends Game {
	constructor(o) {
		if (o instanceof Game) {
			super(o);
			this.board = o.board.slice();
		} else {
			super({ nPlayers: 2 });
			this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		}
	}

	copyGame() {
		return new Game(this);
	}

	toString() {
		let s = "";
		for (let i = 0; i < this.board.length; i++) {
			switch (this.board[i]) {
				case 0:
					s += ".";
					break;
				case 1:
					s += "X";
					break;
				case 2:
					s += "O";
					break;
			}
			if (i % 3 == 2) s += "\n";
		}
		s += "\n" + super.toString();
		return s;
	}

	allActions() {
		const as = [];
		for (let i = 0; i < this.board.length; i++) {
			if (this.board[i] == 0) {
				as.push(new Action(1 + i));
			}
		}
		return as;
	}

	doAction(a) {
		super.doAction(a);
		this.board[a.pos - 1] = this.currentPlayer;
		let e = false;
		const lines = [
			[0, 1, 2], [3, 4, 5], [6, 7, 8],
			[0, 3, 6], [1, 4, 7], [2, 5, 8],
			[0, 4, 8], [2, 4, 6]
		];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			let n1 = 0;
			let n2 = 0;
			for (let j = 0; j < line.length; j++) {
				switch (this.board[line[j]]) {
					case 1:
						n1++;
						break;
					case 2:
						n2++;
						break;
					case 0:
						e = true;
				}
			}
			if (n1 == 3) {
				this.winner = 1;
				break;
			}
			if (n2 == 3) {
				this.winner = 2;
				break;
			}
		}
		if (!this.isGameOver()) {
			if (!e) {
				this.winner = 0;
			} else {
				this.currentTurn++;
				this.currentPlayer = (this.currentPlayer % 2) + 1
			}
		}
	}
}

export class PerfectPlayer extends Player {
	winMoves(g, p) {
		const moves = [];
		const lines = [
			[0, 1, 2], [3, 4, 5], [6, 7, 8],
			[0, 3, 6], [1, 4, 7], [2, 5, 8],
			[0, 4, 8], [2, 4, 6]
		];
		for (const line of lines) {
			let pCount = 0;
			let empty = -1;
			for (const i of line) {
				if (g.board[i] == p) {
					pCount += 1;
				} else if (g.board[i] == 0) {
					empty = i;
				}
			}
			if (pCount == 2 && empty >= 0) moves.push(empty);
		}
		return moves;
	}

	forkMoves(g, p) {
		const moves = [];
		const forks = [
			[0, [1, 2], [3, 6]], [1, [0, 2], [4, 7]], [2, [0, 1], [5, 8]],
			[0, [1, 2], [4, 8]], [2, [0, 1], [4, 6]],
			[3, [4, 5], [0, 6]], [4, [3, 5], [1, 7]], [5, [3, 4], [2, 8]],
			[4, [3, 5], [0, 8]], [4, [3, 5], [2, 6]],
			[6, [7, 8], [0, 3]], [7, [6, 8], [1, 4]], [8, [6, 7], [2, 5]],
			[8, [6, 7], [0, 4]], [6, [7, 8], [2, 4]],
			[0, [3, 6], [4, 8]], [6, [0, 3], [2, 4]],
			[4, [1, 7], [0, 8]], [4, [1, 7], [2, 6]],
			[8, [2, 5], [0, 4]], [2, [5, 8], [4, 6]],
			[4, [0, 8], [2, 6]]
		];
		for (const fork of forks) {
			const [shared, line1, line2] = fork;
			if ((g.board[shared] == 0) &&
				((g.board[line1[0]] == p && g.board[line1[1]] == 0) ||
					(g.board[line1[0]] == 0 && g.board[line1[1]] == p)) &&
				((g.board[line2[0]] == p && g.board[line2[1]] == 0) ||
					(g.board[line2[0]] == 0 && g.board[line2[1]] == p))) {
				moves.push(shared);
			}
		}
		return moves;
	}

	forceBlockMoves(g, p, avoid) {
		const moves = [];
		const lines = [
			[0, 1, 2], [3, 4, 5], [6, 7, 8],
			[0, 3, 6], [1, 4, 7], [2, 5, 8],
			[0, 4, 8], [2, 4, 6]
		];
		for (const line of lines) {
			let pCount = 0;
			let empty = [];
			for (const i of line) {
				if (g.board[i] == p) {
					pCount += 1;
				} else if (g.board[i] == 0) {
					empty.push(i);
				}
			}
			if (pCount == 1 && empty.length == 2) {
				if (avoid.includes(empty[0])) {
					if (!avoid.includes(empty[1])) moves.push(empty[0]);
				} else if (avoid.includes(empty[1])) {
					moves.push(empty[1]);
				} else {
					moves.push(empty[0]);
					moves.push(empty[1]);
				}
			}
		}
		return moves;
	}

	oppositeCornerMoves(g, p) {
		const moves = [];
		if (g.board[0] == p && g.board[8] == 0) moves.push(8);
		if (g.board[2] == p && g.board[6] == 0) moves.push(6);
		if (g.board[8] == p && g.board[0] == 0) moves.push(0);
		if (g.board[6] == p && g.board[2] == 0) moves.push(2);
		return moves;
	}

	emptyCornerMoves(g) {
		const moves = [];
		if (g.board[0] == 0) moves.push(0);
		if (g.board[2] == 0) moves.push(2);
		if (g.board[6] == 0) moves.push(6);
		if (g.board[8] == 0) moves.push(8);
		return moves;
	}

	emptySideMoves(g) {
		const moves = [];
		if (g.board[1] == 0) moves.push(1);
		if (g.board[3] == 0) moves.push(3);
		if (g.board[5] == 0) moves.push(5);
		if (g.board[7] == 0) moves.push(7);
		return moves;
	}

	getAction(g) {
		// Win
		let moves = this.winMoves(g, g.currentPlayer);
		if (moves.length > 0) return new Action(1 + moves[Math.floor(Math.random() * moves.length)]);
		// Block
		moves = this.winMoves(g, 3 - g.currentPlayer);
		if (moves.length > 0) return new Action(1 + moves[Math.floor(Math.random() * moves.length)]);
		// Fork
		moves = this.forkMoves(g, g.currentPlayer);
		if (moves.length > 0) return new Action(1 + moves[Math.floor(Math.random() * moves.length)]);
		// Block Fork
		moves = this.forkMoves(g, 3 - g.currentPlayer);
		if (moves.length > 0) {
			// Deny opponent forks by forcing them to block somewhere else
			// (an essential strategy to avoid double-forks)
			const moves2 = this.forceBlockMoves(g, g.currentPlayer, moves);
			if (moves2.length > 0) {
				return new Action(1 + moves2[Math.floor(Math.random() * moves2.length)]);
			}
			return new Action(1 + moves[Math.floor(Math.random() * moves.length)]);
		}
		// Empty Center
		if (g.board[4] == 0) return new Action(1 + 4);
		// Opposite Corner
		moves = this.oppositeCornerMoves(g, 3 - g.currentPlayer);
		if (moves.length > 0) return new Action(1 + moves[Math.floor(Math.random() * moves.length)]);
		// Empty Corner
		moves = this.emptyCornerMoves(g);
		if (moves.length > 0) return new Action(1 + moves[Math.floor(Math.random() * moves.length)]);
		// Empty Side
		moves = this.emptySideMoves(g);
		if (moves.length > 0) return new Action(1 + moves[Math.floor(Math.random() * moves.length)]);
	}
}
