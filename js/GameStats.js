/**
 * GameStats - Game statistics display functionality
 *
 * Handles fetching and displaying completed game statistics for users
 */

import { HonoraryTitleChecker } from './honorary-titles/HonoraryTitleChecker';
import { debug } from './GameData';

// Dependencies injected at runtime
let onlinePlayEngine = null;
let getLoginTokenFn = null;
let getUsernameFn = null;
let showModalElemFn = null;
let closeModalFn = null;

/**
 * Initialize game stats module with dependencies
 * @param {Object} deps - Dependencies object
 * @param {Object} deps.onlinePlayEngine - Online play engine for API calls
 * @param {Function} deps.getLoginToken - Function to get login token
 * @param {Function} deps.getUsername - Function to get username
 * @param {Function} deps.showModalElem - Function to show modal dialogs
 * @param {Function} deps.closeModal - Function to close modal dialogs
 */
export function initGameStats(deps) {
	onlinePlayEngine = deps.onlinePlayEngine;
	getLoginTokenFn = deps.getLoginToken;
	getUsernameFn = deps.getUsername;
	showModalElemFn = deps.showModalElem;
	closeModalFn = deps.closeModal;
}

/**
 * Build stats display element for a single game type
 * @param {Object} stat - Stats object with gameType, totalGamesCompleted, totalWins
 * @param {boolean} showWins - Whether to show win counts
 * @returns {Text} - Text node with formatted stats
 */
function buildStatLine(stat, showWins) {
	const totalWins = stat.totalWins ? stat.totalWins : 0;
	const winPercent = Math.round(totalWins / stat.totalGamesCompleted * 100);

	if (showWins) {
		const winOrWins = totalWins === 1 ? "win" : "wins";
		return document.createTextNode(
			`${stat.gameType}: ${stat.totalGamesCompleted} (${totalWins} ${winOrWins}, ${winPercent}%)`
		);
	} else {
		return document.createTextNode(`${stat.gameType}: ${stat.totalGamesCompleted}`);
	}
}

/**
 * Create the "Show wins" clickable link
 * @param {Function} showStatsCallback - Callback to show stats with wins
 * @returns {HTMLSpanElement} - The clickable span element
 */
function createShowWinsLink(showStatsCallback) {
	const showWinsSpan = document.createElement('span');
	showWinsSpan.classList.add('skipBonus');
	showWinsSpan.textContent = 'Show number of wins for each game';
	showWinsSpan.onclick = showStatsCallback;
	return showWinsSpan;
}

/**
 * Show 2020 completed game statistics
 * @param {boolean} showWins - Whether to show win counts
 */
export function show2020GameStats(showWins) {
	if (!onlinePlayEngine) {
		console.error('GameStats not initialized');
		return;
	}

	onlinePlayEngine.get2020CompletedGameStats(
		getLoginTokenFn(),
		(results) => {
			if (results) {
				let resultData = {};
				try {
					resultData = JSON.parse(results);
				} catch (error) {
					debug("Error parsing info");
					closeModalFn();
					showModalElemFn("Error", document.createTextNode("Error getting stats info."));
					return;
				}

				if (resultData.stats) {
					const container = document.createElement('div');
					container.appendChild(
						document.createTextNode(getUsernameFn() + "'s total completed games against other players:")
					);
					container.appendChild(document.createElement('br'));

					const stats = resultData.stats;

					for (let i = 0; i < stats.length; i++) {
						container.appendChild(document.createElement('br'));
						container.appendChild(buildStatLine(stats[i], showWins));
					}

					if (!showWins) {
						container.appendChild(document.createElement('br'));
						container.appendChild(document.createElement('br'));
						container.appendChild(createShowWinsLink(() => show2020GameStats(true)));
					}

					showModalElemFn("2020 Completed Games Stats", container);
				}
			}
		}
	);
}

/**
 * Show completed game statistics with honorary title
 * @param {boolean} showWins - Whether to show win counts
 */
export function showGameStats(showWins) {
	if (!onlinePlayEngine) {
		console.error('GameStats not initialized');
		return;
	}

	onlinePlayEngine.getCompletedGameStats(
		getLoginTokenFn(),
		(results) => {
			if (results) {
				let resultData = {};
				try {
					resultData = JSON.parse(results);
				} catch (error) {
					debug("Error parsing info");
					closeModalFn();
					showModalElemFn("Error", document.createTextNode("Error getting stats info."));
					return;
				}

				if (resultData.stats) {
					const container = document.createElement('div');
					container.appendChild(
						document.createTextNode(getUsernameFn() + "'s total completed games against other players:")
					);
					container.appendChild(document.createElement('br'));

					const stats = resultData.stats;
					let totalGamesTally = 0;

					for (let i = 0; i < stats.length; i++) {
						if (stats[i].gameType !== 'Pai Sho Playground') {
							totalGamesTally += stats[i].totalGamesCompleted;
						}
						container.appendChild(document.createElement('br'));
						container.appendChild(buildStatLine(stats[i], showWins));
					}

					// Total games count
					container.appendChild(document.createElement('br'));
					container.appendChild(document.createElement('br'));
					container.appendChild(
						document.createTextNode("Total games (excluding Playground): " + totalGamesTally)
					);

					// Honorary title
					container.appendChild(document.createElement('br'));
					container.appendChild(document.createElement('br'));
					const titleSpan = document.createElement('span');
					titleSpan.innerHTML = getHonoraryTitleMessage(stats);
					container.appendChild(titleSpan);

					// Discord info
					container.appendChild(document.createElement('br'));
					container.appendChild(document.createTextNode("You can use this honorary title at "));
					const discordLink = document.createElement('a');
					discordLink.href = 'https://skudpaisho.com/discord';
					discordLink.target = '_blank';
					discordLink.textContent = 'The Garden Gate Discord';
					container.appendChild(discordLink);
					container.appendChild(document.createTextNode(". "));

					const infoLink = document.createElement('a');
					infoLink.href = 'https://discord.com/channels/380904760556912641/1160675521496105143/1160675598813896735';
					infoLink.target = '_blank';
					infoLink.textContent = 'See Honorary Title information here.';
					container.appendChild(infoLink);

					// Show wins option
					if (!showWins) {
						container.appendChild(document.createElement('br'));
						container.appendChild(document.createElement('br'));
						container.appendChild(createShowWinsLink(() => showGameStats(true)));
					}

					showModalElemFn("Completed Games Stats", container);
				}
			}
		}
	);
}

/**
 * Get the honorary title message HTML for given game stats
 * @param {Array} gameStats - Array of game stat objects
 * @returns {string} - HTML string with honorary title message
 */
export function getHonoraryTitleMessage(gameStats) {
	const titleChecker = new HonoraryTitleChecker(gameStats);
	const message = "Honorary Title achieved: <strong>" + titleChecker.getTitleAchieved() + "</strong>";
	return message;
}
