import {
  GameType,
  buildDropdownDiv,
  currentGameData,
  gameController,
  promptForCustomTileDesigns,
  usernameEquals,
} from '../PaiShoMain';

export function GinsengOptions() {
	if (!localStorage.getItem(GinsengOptions.tileDesignTypeKey)
		|| !GinsengOptions.tileDesignTypeValues[localStorage.getItem(GinsengOptions.tileDesignTypeKey)]) {
		GinsengOptions.setTileDesignsPreference("gaoling", true);
	}

	GinsengOptions.viewAsGuest = false || GinsengOptions.viewAsGuest;
	if (currentGameData && currentGameData.gameTypeId === GameType.Ginsengid && usernameEquals(currentGameData.guestUsername)) {
		GinsengOptions.viewAsGuest = true;
	}
	if (currentGameData && currentGameData.gameTypeId === GameType.Ginsengid && usernameEquals(currentGameData.hostUsername)) {
		GinsengOptions.viewAsGuest = false;
	}
}

GinsengOptions.Preferences = {};

GinsengOptions.tileDesignTypeKey = "ginsengTileDesignTypeKey";

GinsengOptions.tileDesignTypeValues = {
	gaoling: "Gaoling",
	gaipan: "Gaipan",
	omashu: "Omashu",
	basingse: "Ba Sing Se",
	zaofu: "Zaofu",
	northern: "Agna Qel'a",
	patola: "Patola Mountain Range",
	hirokucanyon: "Hiroku Canyon",
	spiritworld: "Spirit World",
	shujing: "Shu Jing",
	shujingpiandao: "Shu Jing Piandao",
	xaibausgrove: "Xai Bau's Grove",
	chuji: "Chu Ji Red",
	custom: "Use Custom Designs"
};

GinsengOptions.setTileDesignsPreference = function(tileDesignKey, ignoreActuate) {
	if (tileDesignKey === 'custom') {
		promptForCustomTileDesigns(GameType.Ginseng, GinsengOptions.Preferences.customTilesUrl);
	} else {
		localStorage.setItem(GinsengOptions.tileDesignTypeKey, tileDesignKey);
		if (gameController && gameController.callActuate && !ignoreActuate) {
			gameController.callActuate();
		}
	}
};

GinsengOptions.buildTileDesignDropdownDiv = function(alternateLabelText) {
	var labelText = alternateLabelText ? alternateLabelText : "Tile Designs";
	return buildDropdownDiv("GinsengTileDesignDropdown", labelText + ":", GinsengOptions.tileDesignTypeValues,
							localStorage.getItem(GinsengOptions.tileDesignTypeKey),
							function() {
								GinsengOptions.setTileDesignsPreference(this.value);
							});
};

GinsengOptions.buildToggleViewAsGuestDiv = function() {
	var div = document.createElement("div");
	var message = "Viewing board as Host";
	var linkText = "View as Guest";
	if (GinsengOptions.viewAsGuest) {
		message = "Viewing board as Guest";
		linkText = "View as Host";
	}
	div.innerHTML = message + ": <span class='skipBonus' onclick='gameController.toggleViewAsGuest();'>" + linkText + "</span>";
	return div;
};


