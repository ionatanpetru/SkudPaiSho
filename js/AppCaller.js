export function DummyAppCaller() {
	//
}

DummyAppCaller.prototype.setCountOfGamesWhereUserTurn = function() {
	//
};

DummyAppCaller.prototype.alertAppLoaded = function() {
	//
};

/* ------------------------------------------------------------------------ */

export function IOSCaller() {
	// 
}

IOSCaller.prototype.setCountOfGamesWhereUserTurn = function(count) {
	// eslint-disable-next-line no-undef
	webkit.messageHandlers.callbackHandler.postMessage(
		'{"countOfGamesWhereUserTurn":"' + count + '"}'
	);
};

IOSCaller.prototype.alertAppLoaded = function() {
	// eslint-disable-next-line no-undef
	webkit.messageHandlers.callbackHandler.postMessage(
		'{"appLoaded":"true"}'
	);
};

/* ------------------------------------------------------------------------ */
