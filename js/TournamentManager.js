// Tournament Management Module
// Handles all tournament-related functionality including viewing, creating, and managing tournaments

import {
	showModal,
	closeModal,
	getLoginToken,
	getUsername,
	userIsLoggedIn,
	htmlEscape,
	onlinePlayEngine,
	toggleCollapsedContent,
	jumpToGame,
	currentGameData,
	ggOptions,
	getGameTypeEntryFromId,
	showModalElem,
	getLoadingModalElement,
} from './PaiShoMain';
import { debug } from './GameData';

// Module state
let tournamentToManage = 0;
let manageTournamentActionData = {};
let signingUpForTournamentId = 0;

// Tournament List View
export function showPastTournamentsClicked() {
	const completeTournamentElements = document.getElementsByClassName("completeTournament");
	for (let i = 0; i < completeTournamentElements.length; i++) {
		completeTournamentElements[i].classList.remove("gone");
	}
}

const showTournamentsCallback = (results) => {
	const dialogHeading = "Tournaments and Events";
	let message = "No current tournaments.";
	if (results) {
		message = "";

		let tourneyData = {};
		let tourneyList = [];
		let isTournamentManager = false;
		let completedTournamentsExist = false;
		try {
			tourneyData = JSON.parse(results);
			tourneyList = tourneyData.tournamentList;
			isTournamentManager = tourneyData.isTournamentManager;
		} catch (error) {
			debug("Error parsing tournament data");
			closeModal();
			showModal(dialogHeading, "Error getting tournament data.");
		}

		debug(tourneyList);

		let first = true;
		let tourneyHeading = "";
		for (const index in tourneyList) {
			const tourney = tourneyList[index];

			if (tourney.status !== "Canceled") {
				if (tourney.status !== tourneyHeading) {
					tourneyHeading = tourney.status;
					if (tourneyHeading === 'Completed') {
						message += "<div class='completeTournament gone'>";
					}
					if (first) {
						first = false;
					} else {
						message += "<br />";
					}
					message += "<div class='modalContentHeading'>" + tourneyHeading + "</div>";
					if (tourneyHeading === 'Completed') {
						completedTournamentsExist = true;
					}
				} else if (tourneyHeading === 'Completed') {
					message += "<div class='completeTournament gone'>";
				}
				message += "<div class='clickableText' onclick='viewTournamentInfo(" + tourney.id + ");'>" + tourney.name + "</div>";
				if (tourneyHeading === 'Completed') {
					message += "</div>";
				}
			}
		}

		if (completedTournamentsExist) {
			message += "<br /><br /><div class='clickableText' onclick='showPastTournamentsClicked();'>Show completed tournaments</div>";
		}
		if (isTournamentManager) {
			message += "<br /><br /><div class='clickableText' onclick='manageTournamentsClicked();'>Manage Tournaments</div>";
		}

	}

	showModal(dialogHeading, message);
};

export function viewTournamentsClicked() {
	showModalElem("Tournaments and Events", getLoadingModalElement());
	onlinePlayEngine.getCurrentTournaments(getLoginToken(), showTournamentsCallback);
}

// Tournament Signup
export function signUpForTournament(tournamentId, tournamentName) {
	let message = "<div class='modalContentHeading'>Tournament: " + tournamentName + "</div>";
	message += "<br /><div>Sign up to participate in this tournament?</div>";

	message += "<br /><span class='clickableText' onclick='submitTournamentSignup(" + tournamentId + ");'>Yes - Sign up!</span>";
	message += "<br /><br /><span class='clickableText' onclick='viewTournamentInfo(" + tournamentId + ");'>Cancel</span>";

	showModal("Tournament Sign Up", message);
}

const submitTournamentSignupCallback = (results) => {
	viewTournamentInfo(signingUpForTournamentId);
};

export function submitTournamentSignup(tournamentId) {
	showModalElem("Tournament Signup", getLoadingModalElement());
	signingUpForTournamentId = tournamentId;
	onlinePlayEngine.submitTournamentSignup(getLoginToken(), tournamentId, submitTournamentSignupCallback);
}

// Tournament Info View
const showTournamentInfoCallback = (results) => {
	let message = "No tournament info found.";
	let modalTitle = "Tournament Details";
	if (results) {
		message = "";

		let tournamentInfo = {};
		try {
			tournamentInfo = JSON.parse(results);
		} catch (error) {
			debug("Error parsing tournament info");
			closeModal();
			showModal("Tournaments", "Error getting tournament info.");
		}

		debug(tournamentInfo);

		modalTitle = tournamentInfo.name;

		message += "<div class='modalContentHeading'>Event status: " + tournamentInfo.status + "</div>";

		if (tournamentInfo.details) {
			message += "<br />";
			message += tournamentInfo.details;
		}

		if (tournamentInfo.forumUrl) {
			message += "<br /><br />";
			message += "<a href='" + tournamentInfo.forumUrl + "' target='_blank' class='clickableText'>Full details <i class='fa fa-external-link'></i></a>";
		}

		let playerIsSignedUp = false;
		if (tournamentInfo.currentPlayers.length > 0) {
			message += "<br /><br /><div class='modalContentHeading collapsibleHeading' onclick='toggleCollapsedContent(this, this.nextElementSibling)' class='collapsed'>Players currently signed up:<span style='float:right'>+</span></div>";
			message += "<div class='collapsibleContent' style='display:none'>";
			for (let i = 0; i < tournamentInfo.currentPlayers.length; i++) {
				message += tournamentInfo.currentPlayers[i].username + "<br />";
				if (tournamentInfo.currentPlayers[i].username === getUsername()) {
					playerIsSignedUp = true;
				}
			}
			message += "</div>";
		}

		message += "<br />";

		if (tournamentInfo.rounds && tournamentInfo.rounds.length > 0) {
			for (let i = 0; i < tournamentInfo.rounds.length; i++) {
				const round = tournamentInfo.rounds[i];
				const roundName = htmlEscape(round.name);
				message += "<br /><div class='collapsibleHeading' onclick='toggleCollapsedContent(this, this.nextElementSibling)' class='collapsed'>" + roundName + "<span style='float:right'>+</span></div>";
				message += "<div class='collapsibleContent' style='display:none;'>";
				/* Display all games for round */
				let gamesFoundForRound = false;
				for (let j = 0; j < tournamentInfo.games.length; j++) {
					const game = tournamentInfo.games[j];
					if (game.roundId === round.id) {
						message += "<div class='clickableText' onclick='matchGameClicked(" + game.gameId + ")'>" + htmlEscape(game.gameType) + ": ";

						if (!game.gameWinnerUsername
							&& game.lastPlayedUsername
							&& game.lastPlayedUsername !== game.hostUsername) {
							message += "<em>";
						}
						if (game.gameWinnerUsername && game.gameWinnerUsername === game.hostUsername) {
							message += "[";
						}
						message += game.hostUsername;
						if (game.gameWinnerUsername && game.gameWinnerUsername === game.hostUsername) {
							message += "]";
						}
						if (!game.gameWinnerUsername
							&& game.lastPlayedUsername
							&& game.lastPlayedUsername !== game.hostUsername) {
							message += "</em>";
						}

						message += " vs ";

						if (!game.gameWinnerUsername
							&& game.lastPlayedUsername
							&& game.lastPlayedUsername !== game.guestUsername) {
							message += "<em>";
						}
						if (game.gameWinnerUsername && game.gameWinnerUsername === game.guestUsername) {
							message += "[";
						}
						message += game.guestUsername;
						if (game.gameWinnerUsername && game.gameWinnerUsername === game.guestUsername) {
							message += "]";
						}
						if (!game.gameWinnerUsername
							&& game.lastPlayedUsername
							&& game.lastPlayedUsername !== game.guestUsername) {
							message += "</em>";
						}

						if (game.gameResultId && game.gameResultId === 4) {	/* 4 is tie/draw */
							message += " [draw]";
						}

						message += "</div>";

						gamesFoundForRound = true;
					}
				}

				if (!gamesFoundForRound) {
					message += "<div><em>No games</em></div>";
				}
				message += "</div>";
			}

		} else {
			message += "<br /><em>No rounds</em>";
		}

		if (userIsLoggedIn() && tournamentInfo.signupAvailable && !playerIsSignedUp) {
			message += "<br /><br /><div class='clickableText' onclick='signUpForTournament(" + tournamentInfo.id + ",\"" + htmlEscape(tournamentInfo.name) + "\");'>Sign up for tournament</div>";
		} else if (!userIsLoggedIn()) {
			message += "<br /><br />Sign in and start playing to participate in tournaments.";
		}
	}

	showModal(modalTitle, message);
};

export function viewTournamentInfo(tournamentId) {
	showModalElem("Tournament Details", getLoadingModalElement());
	onlinePlayEngine.getTournamentInfo(tournamentId, showTournamentInfoCallback);
}

// Tournament Creation
export function submitCreateTournament() {
	const name = htmlEscape(document.getElementById('createTournamentName').value);
	const forumUrl = htmlEscape(document.getElementById('createTournamentForumUrl').value);
	const details = htmlEscape(document.getElementById('createTournamentDetails').value);

	onlinePlayEngine.createTournament(getLoginToken(), name, forumUrl, details, manageTournamentsClicked);
}

export function createNewTournamentClicked() {
	let message = "<div>Please create a thread in the Tournaments section of the forum with details about your tournament. Put the url of your tournament thread in the Forum URL field. <br /><br />Put a short summary in the Details field that will help players understand what kind of tournament this will be.</div>";
	message += "<br /><div>Name:<br /><input type='text' id='createTournamentName' /></div>";
	message += "<br /><div>Forum URL:<br /><input type='text' id='createTournamentForumUrl' /></div>";
	message += "<br /><div>1-line Summary:<br /><textarea id='createTournamentDetails'></textarea></div>";

	message += "<br /><div class='clickableText' onclick='submitCreateTournament();'>Create Tournament</div>";
	message += "<br /><div class='clickableText' onclick='manageTournamentsClicked();'>Cancel</div>";

	showModal("Create Tournament", message);
}

// Tournament Management
const goToManageTournamentCallback = (results) => {
	manageTournamentClicked(tournamentToManage);
};

export function createNewRound(tournamentId) {
	const roundName = document.getElementById('newRoundName').value;
	onlinePlayEngine.createNewRound(getLoginToken(), tournamentId, roundName, "", goToManageTournamentCallback);
}

export function changeTournamentPlayerStatus(tournamentId, usernameToChange, newTournamentPlayerStatusId) {
	onlinePlayEngine.changeTournamentPlayerStatus(getLoginToken(), tournamentId, usernameToChange, newTournamentPlayerStatusId, goToManageTournamentCallback);
}

export function roundClicked(id, name) {
	manageTournamentActionData.newMatchData.roundId = id;
	manageTournamentActionData.newMatchData.roundName = name;
	const roundDisplay = document.getElementById('newTournamentMatchRound');
	if (roundDisplay) {
		roundDisplay.innerText = name;
	}
}

export function playerNameClicked(id, username) {
	let nameDisplay;
	if (manageTournamentActionData.newMatchData.hostId > 0
		&& (!manageTournamentActionData.newMatchData.guestId
			|| manageTournamentActionData.newMatchData.guestId <= 0)) {
		manageTournamentActionData.newMatchData.guestId = id;
		manageTournamentActionData.newMatchData.guestUsername = username;
		nameDisplay = document.getElementById('newTournamentMatchGuest');
	} else {
		manageTournamentActionData.newMatchData.hostId = id;
		manageTournamentActionData.newMatchData.hostUsername = username;
		nameDisplay = document.getElementById('newTournamentMatchHost');
		manageTournamentActionData.newMatchData.guestId = 0;
		manageTournamentActionData.newMatchData.guestUsername = null;
		document.getElementById('newTournamentMatchGuest').innerText = '';
	}

	if (nameDisplay) {
		nameDisplay.innerText = username;
	}
}

export function createNewTournamentMatch() {
	const roundId = manageTournamentActionData.newMatchData.roundId;
	const gameTypeId = currentGameData.gameTypeId;
	const hostUsername = manageTournamentActionData.newMatchData.hostUsername;
	const guestUsername = manageTournamentActionData.newMatchData.guestUsername;
	const options = JSON.stringify(ggOptions);
	const isRanked = currentGameData.isRankedGame;

	onlinePlayEngine.createTournamentRoundMatch(
		getLoginToken(),
		roundId,
		gameTypeId,
		hostUsername,
		guestUsername,
		options,
		isRanked,
		goToManageTournamentCallback
	);
}

export function matchGameClicked(gameId) {
	jumpToGame(gameId);
	closeModal();
}

export function changeTournamentStatus(tournamentId, newTournamentStatusId) {
	onlinePlayEngine.changeTournamentStatus(
		getLoginToken(),
		tournamentId,
		newTournamentStatusId,
		goToManageTournamentCallback
	);
}

const showManageTournamentCallback = (results) => {
	let message = "No tournment info found.";
	const modalTitle = "Manage Tournament";
	if (results) {
		message = "";

		let resultData = {};
		try {
			resultData = JSON.parse(results);
		} catch (error) {
			debug("Error parsing info");
			closeModal();
			showModal(modalTitle, "Error getting tournament info.");
		}

		manageTournamentActionData.newMatchData = {};

		debug(results);
		debug(resultData);

		message += "<div class='modalContentHeading'>" + resultData.name + "</div>";
		message += "<div>" + resultData.details + "</div>";

		message += "<br /><div>Status: " + resultData.status + "</div>";
		/* Defaults for these if statusId is 1 */
		let nextStatusId = 2;
		let nextStatusActionText = "Begin Tournament";
		if (resultData.statusId === 2) {
			nextStatusId = 3;
			nextStatusActionText = "Complete Tournament";
		} else if (resultData.statusId === 3) {
			nextStatusId = 4;
			nextStatusActionText = "Cancel Tournament";
		} else if (resultData.statusId === 4) {
			nextStatusId = 1;
			nextStatusActionText = "Restore Tournament to Upcoming";
		}
		message += "<div class='clickableText' onclick='changeTournamentStatus(" + resultData.id + "," + nextStatusId + ")'>" + nextStatusActionText + "</div>";

		let mostRecentRound = null;
		if (resultData.rounds && resultData.rounds.length > 0) {
			for (let i = 0; i < resultData.rounds.length; i++) {
				const round = resultData.rounds[i];
				mostRecentRound = round;
				const roundName = htmlEscape(round.name);
				message += "<br /><div class='clickableText' onclick='roundClicked(" + round.id + ",\"" + roundName + "\")'>" + roundName + "</div>";
				/* Display all games for round */
				for (let j = 0; j < resultData.games.length; j++) {
					const game = resultData.games[j];
					if (game.roundId === round.id) {
						message += "<div class='clickableText' onclick='matchGameClicked(" + game.gameId + ")'>" + htmlEscape(game.gameType) + ":" + game.hostUsername + " vs " + game.guestUsername + "</div>";
					}
				}
			}

			/* Automatically select the most recent Round for match creating */
			setTimeout(() => {
				roundClicked(mostRecentRound.id, htmlEscape(mostRecentRound.name));
			}, 200);
		} else {
			message += "<br /><em>No rounds</em>";
		}
		message += "<br /><div class='modalContentHeading'>New Round</div>";
		message += "<div>Name:<br /><input type='text' id='newRoundName' /></div>";
		message += "<div class='clickableText' onclick='createNewRound(" + resultData.id + ");'>Create Round</div>";

		let changeStatusIdTo;
		/* Players */
		if (resultData.players && resultData.players.length > 1) {
			let playerStatusId = 0;
			let statusChangeLinkText = "";
			for (let i = 0; i < resultData.players.length; i++) {
				const player = resultData.players[i];
				if (player.statusId !== playerStatusId) {
					message += "<br /><div>&nbsp;&nbsp;" + player.status + "</div>";
					playerStatusId = player.statusId;
					if (playerStatusId === 1
						|| playerStatusId === 5) {
						statusChangeLinkText = "approve";
						changeStatusIdTo = 2;
					} else if (playerStatusId === 2) {
						statusChangeLinkText = "eliminate";
						changeStatusIdTo = 3;
					} else {
						statusChangeLinkText = "disqualify";
						changeStatusIdTo = 5;
					}
				}
				const playerUsername = htmlEscape(player.username);
				message += "<div><span";
				if (playerStatusId !== 5) {
					message += " class='clickableText' onclick=playerNameClicked(" + player.userId + ",\"" + playerUsername + "\")";
				}
				message += ">" + playerUsername + "</span>&nbsp;(<span class='clickableText' onclick='changeTournamentPlayerStatus(" + resultData.id + ",\"" + playerUsername + "\"," + changeStatusIdTo + ")'>" + statusChangeLinkText + "</span>)</div>";
			}
		}

		/* Create new game section */
		message += "<br /><div class='modalContentHeading'>New Match</div>";
		message += "To create a new match, click the Round and players to apply.<br />Game will share the same type and options as the game you currently have open.";
		message += "<br /><em>Round:</em> <span id='newTournamentMatchRound'></span>";
		message += "<br /><em>Host:</em> <span id='newTournamentMatchHost'></span>";
		message += "<br /><em>Guest:</em> <span id='newTournamentMatchGuest'></span>";
		const currentGameTypeEntry = getGameTypeEntryFromId(currentGameData.gameTypeId);
		message += "<br /><em>Game:</em> " + htmlEscape(currentGameTypeEntry.desc);
		message += "<br /><em>Options:</em> " + JSON.stringify(ggOptions);
		message += "<br /><em>Is Ranked?:</em> " + currentGameData.isRankedGame === 'Y' ? "Yes" : "No";
		message += "<div class='clickableText' onclick='createNewTournamentMatch();'>Create Match</div>";

		message += "<br /><br />";
	}

	showModal(modalTitle, message);
};

export function manageTournamentClicked(tournamentId) {
	showModalElem("Manage Tournament", getLoadingModalElement());
	tournamentToManage = tournamentId;
	onlinePlayEngine.getManageTournamentInfo(getLoginToken(), tournamentId, showManageTournamentCallback);
}

const showManageTournamentsCallback = (results) => {
	let message = "No tournament info found.";
	const modalTitle = "Manage Tournaments";
	if (results) {
		message = "";

		let resultData = {};
		try {
			resultData = JSON.parse(results);
		} catch (error) {
			debug("Error parsing info");
			closeModal();
			showModal(modalTitle, "Error getting tournament info.");
		}

		message += "<div class='modalContentHeading'>Your Tournaments</div>";

		if (resultData.tournaments
			&& resultData.tournaments.length > 0) {
			for (let i = 0; i < resultData.tournaments.length; i++) {
				const tournament = resultData.tournaments[i];
				message += "<div class='clickableText' onclick='manageTournamentClicked(" + tournament.id + ");'>" + tournament.name + "</div>";
			}
		} else {
			message += "<em>None</em>";
		}

		message += "<br /><br />";
		message += "<div class='clickableText' onclick='createNewTournamentClicked();'>Create new tournament</div>";
	}

	showModal(modalTitle, message);
};

export function manageTournamentsClicked() {
	showModalElem("Manage Tournaments", getLoadingModalElement());
	onlinePlayEngine.getManageTournamentsInfo(getLoginToken(), showManageTournamentsCallback);
}
