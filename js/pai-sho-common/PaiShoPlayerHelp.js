import { GUEST, HOST } from '../CommonNotationObjects';

export var hostPlayerCode = 'H';
export var guestPlayerCode = 'G';


export function getPlayerCodeFromName(playerName) {
	if (playerName === HOST) {
		return hostPlayerCode;
	} else if (playerName === GUEST) {
		return guestPlayerCode;
	}
}

export function getPlayerNameFromCode(playerCode) {
	if (playerCode === hostPlayerCode) {
		return HOST;
	} else if (playerCode === guestPlayerCode) {
		return GUEST;
	}
}

export function getOpponentName(playerName) {
	if (playerName === HOST) {
		return GUEST;
	} else {
		return HOST;
	}
}
