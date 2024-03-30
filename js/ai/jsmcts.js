/*
jsmcts - https://github.com/grwhitehead/jsmcts/tree/main - converted to ES6.
*/


/*
 * Seedable PRNG
 *
 * xorshift128+
 *
 * https://xoshiro.di.unimi.it/xorshift.php
 * https://xoshiro.di.unimi.it/xorshift128plus.c
 *
 * Javascript port from Andreas Madsen
 * https://github.com/AndreasMadsen/xorshift
 */

import { debug } from '../GameData';

export class PRNGSeed {
    constructor() {
        // seed must not be zero
        // eslint-disable-next-line no-constant-condition
        while (true) {
            this.seed0U = Math.random() * 2 ** 32 >>> 0;
            this.seed0L = Math.random() * 2 ** 32 >>> 0;
            this.seed1U = Math.random() * 2 ** 32 >>> 0;
            this.seed1L = Math.random() * 2 ** 32 >>> 0;
            if (this.seed0U > 0 || this.seed0L > 0 || this.seed1U > 0 || this.seed1L > 0) break;
        }
    }
}

export class PRNG {
    constructor(seed) {
        if (seed === undefined) seed = new PRNGSeed();
        this._state0U = seed.seed0U;
        this._state0L = seed.seed0L;
        this._state1U = seed.seed1U;
        this._state1L = seed.seed1L;
    }

    random() {
        // uint64_t s1 = s[0]
        let s1U = this._state0U, s1L = this._state0L;
        // uint64_t s0 = s[1]
        let s0U = this._state1U, s0L = this._state1L;

        // result = s0 + s1
        let sumL = (s0L >>> 0) + (s1L >>> 0);
        let resU = (s0U + s1U + (sumL / 2 >>> 31)) >>> 0;
        let resL = sumL >>> 0;

        // s[0] = s0
        this._state0U = s0U;
        this._state0L = s0L;

        // - t1 = [0, 0]
        let t1U = 0, t1L = 0;
        // - t2 = [0, 0]
        let t2U = 0, t2L = 0;

        // s1 ^= s1 << 23;
        // :: t1 = s1 << 23
        const a1 = 23;
        const m1 = 0xFFFFFFFF << (32 - a1);
        t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
        t1L = s1L << a1;
        // :: s1 = s1 ^ t1
        s1U = s1U ^ t1U;
        s1L = s1L ^ t1L;

        // t1 = ( s1 ^ s0 ^ ( s1 >> 17 ) ^ ( s0 >> 26 ) )
        // :: t1 = s1 ^ s0
        t1U = s1U ^ s0U;
        t1L = s1L ^ s0L;
        // :: t2 = s1 >> 18
        const a2 = 18;
        const m2 = 0xFFFFFFFF >>> (32 - a2);
        t2U = s1U >>> a2;
        t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
        // :: t1 = t1 ^ t2
        t1U = t1U ^ t2U;
        t1L = t1L ^ t2L;
        // :: t2 = s0 >> 5
        const a3 = 5;
        const m3 = 0xFFFFFFFF >>> (32 - a3);
        t2U = s0U >>> a3;
        t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
        // :: t1 = t1 ^ t2
        t1U = t1U ^ t2U;
        t1L = t1L ^ t2L;

        // s[1] = t1
        this._state1U = t1U;
        this._state1L = t1L;

        // return result normalized [0,1)
        // Math.pow(2, -32) = 2.3283064365386963e-10
        // Math.pow(2, -52) = 2.220446049250313e-16
        return resU * 2.3283064365386963e-10 + (resL >>> 12) * 2.220446049250313e-16;
    }
}

/*
 * base classes for MCTS games (see example code)
 */

export class Action {
    toString() {
        throw "not implemented";
    }
}

export class Game {
    constructor(o, rng) {
        if (o instanceof Game) {
            // copy game
            this.nondeterministic = o.nondeterministic;
            this.nPlayers = o.nPlayers;
            this.currentTurn = o.currentTurn;
            this.currentPlayer = o.currentPlayer;
            this.winner = o.winner;
        } else {
            // initialize new game
            this.nondeterministic = o.nondeterministic;
            this.nPlayers = o.nPlayers;
            this.currentTurn = 1;
            this.currentPlayer = 1;
            this.winner = -1;
        }
        if (this.nondeterministic) {
            if (rng === undefined) rng = new PRNG();
            this.rng = rng;
        }
    }

    copyGame(rng) {
        return new Game(this, rng);
    }

    toString() {
        if (this.winner === -1) {
            return "currentTurn " + this.currentTurn + " currentPlayer " + this.currentPlayer;
        } else if (this.winner === 0) {
            return "draw";
        } else {
            return "winner " + this.winner;
        }
    }

    isGameOver() {
        return this.winner >= 0;
    }

    allActions() {
        return [];
    }

    doAction(a) {}
}

export class Player {
    getAction(g) {
        throw "not implemented";
    }
}

/*
 * random player
 */

export class RandomPlayer extends Player {
    getAction(g) {
        const as = g.allActions();
        if (as.length > 0) {
            return as[Math.floor(Math.random() * as.length)];
        }
    }
}

/*
 * MCTS player
 */

export class MCTSNode {
    constructor(g, a) {
        this.player = g.currentPlayer;
        this.action = a;
        this.count = 0;
        this.values = new Array(g.nPlayers).fill(0.0);
        this.children = null;

        this.cumSearchDepth = 0;
        this.cumGameDepth = 0;
    }

    toString() {
        return this.action.toString() + " " + (1.0 * this.values[this.player - 1] / this.count).toFixed(2) + " (" + (this.values[this.player - 1]) + "/" + this.count + ")";
    }

    selectChild(c) {
        let sa = null;
        let sv;
        for (let i = 0; i < this.children.length; i++) {
            let a = this.children[i];
            let v = (1.0 * a.values[a.player - 1]) / (1 + a.count) +
                c * Math.sqrt(Math.log(1 + this.count) / (1 + a.count)) +
                Math.random() * 1e-6;
            if (sa === null || v > sv) {
                sa = a;
                sv = v;
            }
        }
        return sa;
    }

    updateValues(rewards) {
        this.count++;
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] += rewards[i];
        }
    }
}

export class MCTSPlayer extends Player {
    constructor(config) {
        super();
        this.nTrials = config.nTrials;

        // determinization for nondeterministic games (use same PRNG seed for nTrialsPerSeed before switching)
        this.nTrialsPerSeed = config.nTrialsPerSeed ? config.nTrialsPerSeed : 1;

        // exploration constant, see MCTSNode selectChild
        this.c = (config.c === undefined) ? 1.0 : config.c;

        // calculate rewards
        this.rewardsFunc = (config.rewardsFunc === undefined) ?
            function(g) {
                if (g.winner > 0) {
                    let rewards = new Array(g.nPlayers).fill(0.0);
                    if (g.winner <= g.nPlayers) {
                        rewards[g.winner - 1] = 1.0;
                    }
                    return rewards;
                } else {
                    return new Array(g.nPlayers).fill(0.5);
                }
            } : config.rewardsFunc;
    }

    startThinking(g) {
        let state = {
            game: g,
            turn: g.currentTurn,
            root: new MCTSNode(g, null),
            best: null,
            time: 0,
            avgSearchDepth: 0,
            avgGameDepth: 0,
            avgBranchingFactor: 0
        };
        let root = state.root;
        root.cumSearchDepth = 0;
        root.cumGameDepth = 0;
        root.parentNodeCount = 0;
        root.totalNodeCount = 1;
        if (!root.children) {
            root.children = g.allActions().map((a) => new MCTSNode(g, a));
            root.parentNodeCount += 1;
            root.totalNodeCount += root.children.length;
        }
        if (this.searchCallback) {
            this.searchCallback(state);
        }
        return state;
    }

    continueThinking(state, nt) {
        let g = state.game;
        let root = state.root;
        if (root.children.length <= 1 || root.count >= this.nTrials) {
            return false;
        }
        let t0 = root.count;
        let t1 = Math.min(this.nTrials, root.count + nt);
        let time0 = Date.now();
        for (let t = t0; t < t1; t++) {
            let tg; // copy current game state for new trial
            if (g.nondeterministic) {
                // use determinization, running nTrialsPerSeed with the same PRNG seed
                if (root.count % this.nTrialsPerSeed === 0) {
                    state.seed = new PRNGSeed();
                    if (root.children) {
                        // subtree node states potentially change with each seed, so we
                        // clear the children of the top-level actions on seed change
                        // (top-level values will be an average over all trials)
                        for (let i = 0; i < root.children.length; i++) {
                            root.children[i].children = null;
                        }
                    }
                }
                tg = g.copyGame(new PRNG(state.seed));
            } else {
                tg = g.copyGame();
            }
            let vns = [root]; // track visited nodes
            // select next child to explore
            let n = root.selectChild(this.c);
            vns.push(n);
            tg.doAction(n.action);
            let depth = 1;
            // repeat to frontier of explored game tree
            while (!tg.isGameOver() && n.children) {
                n = n.selectChild(this.c);
                vns.push(n);
                tg.doAction(n.action);
                depth += 1;
            }
            // if game isn't over, expand frontier node and select a child to explore
            if (!tg.isGameOver()) {
				var allActions = tg.allActions();
                n.children = allActions.map((a) => new MCTSNode(tg, a));
                root.parentNodeCount += 1;
                root.totalNodeCount += n.children.length;
                n = n.selectChild(this.c);
                vns.push(n);
				if (!n) {
					debug("bad news");
				}
                tg.doAction(n.action);
                depth += 1;
            }
            let searchDepth = depth;
            // random playout to end of game
            while (!tg.isGameOver()) {
                let rp_as = tg.allActions();
                root.parentNodeCount += 1;
                root.totalNodeCount += rp_as.length;
                let rp_a = rp_as[Math.floor(Math.random() * rp_as.length)];
                tg.doAction(rp_a);
                depth += 1;
            }
            let gameDepth = depth;
            // apply rewards to visited nodes
            let rewards = this.rewardsFunc(tg);
            for (let i = 0; i < vns.length; i++) {
                vns[i].updateValues(rewards);
            }
            root.cumSearchDepth += searchDepth;
            root.cumGameDepth += gameDepth;
        }
        state.time += Date.now() - time0;
        if (root.count > 0) {
            state.avgSearchDepth = (1.0 * root.cumSearchDepth / root.count);
            state.avgGameDepth = (1.0 * root.cumGameDepth / root.count);
            state.avgBranchingFactor = 1.0 * (root.totalNodeCount - 1) / root.parentNodeCount;
        }
        if (this.searchCallback) {
            this.searchCallback(state);
        }
        return (root.count < this.nTrials);
    }

    stopThinking(state) {
        let g = state.game;
        let root = state.root;
        if (root.children.length > 0) {
            state.best = root.selectChild(0);
        }
        if (this.searchCallback) {
            this.searchCallback(state);
        }
        return (state.best === null) ? null : state.best.action;
    }
}

export function searchCallback(state) {
    if (state.best) {
        console.log("[" + state.root.count + " trials; " + state.time + " msecs]");
        for (let i = 0; i < state.root.children.length; i++) {
            let n = state.root.children[i];
            console.log((n === state.best ? "*" : " ") + " " + n.toString());
        }
        console.log("avgSearchDepth " + state.avgSearchDepth.toFixed(4) +
            "\navgGameDepth " + state.avgGameDepth.toFixed(4) +
            "\navgBranchingFactor " + state.avgBranchingFactor.toFixed(4) +
            "\n");
    }
}

export function playgame(g, ps) {
    console.log(g.toString());
    while (!g.isGameOver()) {
        let a = ps[g.currentPlayer - 1].getAction(g);
        console.log(a.toString());
        g.doAction(a);
        console.log(g.toString());
    }
}

