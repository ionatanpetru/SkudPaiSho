
Ginseng.Options = function() {
	if (!localStorage.getItem(Ginseng.Options.tileDesignTypeKey)
		|| !Ginseng.Options.tileDesignTypeValues[localStorage.getItem(Ginseng.Options.tileDesignTypeKey)]) {
		Ginseng.Options.setTileDesignsPreference("gaoling", true);
	}

	Ginseng.Options.viewAsGuest = false || Ginseng.Options.viewAsGuest;
	if (currentGameData && currentGameData.gameTypeId === GameType.Ginseng.id && usernameEquals(currentGameData.guestUsername)) {
		Ginseng.Options.viewAsGuest = true;
	}
	if (currentGameData && currentGameData.gameTypeId === GameType.Ginseng.id && usernameEquals(currentGameData.hostUsername)) {
		Ginseng.Options.viewAsGuest = false;
	}
}

Ginseng.Options.tileDesignTypeKey = "ginsengTileDesignTypeKey";

Ginseng.Options.tileDesignTypeValues = {
	gaoling: "Gaoling",
	taihua: "Taihua",
	gaipan: "Gaipan",
	shujing: "Shu Jing",
	hirokucanyon: "Hiroku Canyon",
	zaofu: "Zaofu",
	agnaqela: "Agna Qel'a",
	westernairtemple: "Western Air Temple",
	patola: "Patola Mountain Range",
	xaibausgrove: "Xai Bau's Grove",
	spiritworld: "Spirit World",
	chuji: "Chu Ji Red",
	custom: "Use Custom Designs"
};

Ginseng.Options.setTileDesignsPreference = function(tileDesignKey, ignoreActuate) {
	if (tileDesignKey === 'custom') {
		promptForCustomTileDesigns(GameType.Ginseng, Ginseng.Preferences.customTilesUrl);
	} else {
		localStorage.setItem(Ginseng.Options.tileDesignTypeKey, tileDesignKey);
		if (gameController && gameController.callActuate && !ignoreActuate) {
			gameController.callActuate();
		}
	}
};

Ginseng.Options.buildTileDesignDropdownDiv = function(alternateLabelText) {
	var labelText = alternateLabelText ? alternateLabelText : "Tile Designs";
	return buildDropdownDiv("GinsengTileDesignDropdown", labelText + ":", Ginseng.Options.tileDesignTypeValues,
							localStorage.getItem(Ginseng.Options.tileDesignTypeKey),
							function() {
								Ginseng.Options.setTileDesignsPreference(this.value);
							});
};

Ginseng.Options.buildToggleViewAsGuestDiv = function() {
	var div = document.createElement("div");
	var message = "Viewing board as Host";
	var linkText = "View as Guest";
	if (Ginseng.Options.viewAsGuest) {
		message = "Viewing board as Guest";
		linkText = "View as Host";
	}
	div.innerHTML = message + ": <span class='skipBonus' onclick='gameController.toggleViewAsGuest();'>" + linkText + "</span>";
	return div;
};


