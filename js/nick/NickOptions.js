
Nick.Options = function() {
	if (!localStorage.getItem(Nick.Options.tileDesignTypeKey)
		|| !Nick.Options.tileDesignTypeValues[localStorage.getItem(Nick.Options.tileDesignTypeKey)]) {
		Nick.Options.setTileDesignsPreference("siyuan", true);
	}

	Nick.Options.viewAsGuest = false || Nick.Options.viewAsGuest;
	if (currentGameData && currentGameData.gameTypeId === GameType.Nick.id && usernameEquals(currentGameData.guestUsername)) {
		Nick.Options.viewAsGuest = true;
	}
	if (currentGameData && currentGameData.gameTypeId === GameType.Nick.id && usernameEquals(currentGameData.hostUsername)) {
		Nick.Options.viewAsGuest = false;
	}
}

Nick.Options.tileDesignTypeKey = "nickTileDesignTypeKey";

Nick.Options.tileDesignTypeValues = {
	siyuan: "Sì Yuán",
	fournations: "Four Nations",
	custom: "Custom"
};

Nick.Options.setTileDesignsPreference = function(tileDesignKey, ignoreActuate) {
	if (tileDesignKey === 'custom') {
		promptForCustomTileDesigns(GameType.Nick, Nick.Preferences.customTilesUrl);
	} else {
		localStorage.setItem(Nick.Options.tileDesignTypeKey, tileDesignKey);
		if (gameController && gameController.callActuate && !ignoreActuate) {
			gameController.callActuate();
		}
	}
};

Nick.Options.buildTileDesignDropdownDiv = function(alternateLabelText) {
	var labelText = alternateLabelText ? alternateLabelText : "Tile Designs";
	return buildDropdownDiv("NickTileDesignDropdown", labelText + ":", Nick.Options.tileDesignTypeValues,
							localStorage.getItem(Nick.Options.tileDesignTypeKey),
							function() {
								Nick.Options.setTileDesignsPreference(this.value);
							});
};

Nick.Options.buildToggleViewAsGuestDiv = function() {
	var div = document.createElement("div");
	var message = "Viewing board as Host";
	var linkText = "View as Guest";
	if (Nick.Options.viewAsGuest) {
		message = "Viewing board as Guest";
		linkText = "View as Host";
	}
	div.innerHTML = message + ": <span class='skipBonus' onclick='gameController.toggleViewAsGuest();'>" + linkText + "</span>";
	return div;
};


