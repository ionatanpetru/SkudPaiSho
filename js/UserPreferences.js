// User Preferences Module
// Handles device preferences, sound, animations, timestamps, and custom background colors

import {
	animationsOnKey,
	showTimestampsKey,
	showMoveLogsInChatKey,
	customBgColorKey,
	confirmMoveKey,
	soundManager,
	gameController,
	clearGameChats,
	showReplayControls,
	callSubmitMove,
	submitMoveData,
	confirmMoveToSubmit,
	showModal
} from './PaiShoMain';
import { OnboardingFunctions } from './OnBoardingVars';
import { GameClock } from './util/GameClock';
import { Ads } from './Ads';

let customBackgroundColor = "";

const isValidColor = (strColor) => {
	const s = new Option().style;
	s.color = strColor;
	return s.color !== '';
};

/* Sound */
export function toggleSoundOn() {
	soundManager.toggleSoundOn();
}

export function toggleAnimationsOn() {
	if (isAnimationsOn()) {
		localStorage.setItem(animationsOnKey, "false");
	} else {
		localStorage.setItem(animationsOnKey, "true");
	}
	if (gameController.setAnimationsOn) {
		gameController.setAnimationsOn(isAnimationsOn());
	}
}

export function isAnimationsOn() {
	return localStorage.getItem(animationsOnKey) !== "false";
}

export function isTimestampsOn() {
	return localStorage.getItem(showTimestampsKey) === "true";
}

export function toggleTimestamps() {
	localStorage.setItem(showTimestampsKey, !isTimestampsOn());
	clearGameChats();
}

export function isMoveLogDisplayOn() {
	return localStorage.getItem(showMoveLogsInChatKey) === "true";
}

export function toggleMoveLogDisplay() {
	localStorage.setItem(showMoveLogsInChatKey, !isMoveLogDisplayOn());
	clearGameChats();
}

export function isMoveConfirmationRequired() {
	return localStorage.getItem(confirmMoveKey) !== "false";
}

export function toggleConfirmMovePreference() {
	localStorage.setItem(confirmMoveKey, !isMoveConfirmationRequired());
}

export function showConfirmMoveButton() {
	showReplayControls();
	document.getElementById('confirmMoveButton').classList.remove('gone');
	OnboardingFunctions.showConfirmMoveButtonHelp();
}

export function hideConfirmMoveButton() {
	document.getElementById('confirmMoveButton').classList.add('gone');
}

export function confirmMoveClicked() {
	callSubmitMove(submitMoveData.moveAnimationBeginStep, true, confirmMoveToSubmit);
	hideConfirmMoveButton();
}

export function setBackgroundColor(colorValueStr) {
	if (isValidColor(colorValueStr)) {
		document.body.style.background = colorValueStr;
	}
}

export function setCustomBgColorFromInput() {
	const customValueInput = document.getElementById("customBgColorInput");

	if (customValueInput) {
		const customValue = customValueInput.value;
		if (isValidColor(customValue)) {
			document.body.style.background = customValue;
			localStorage.setItem(customBgColorKey, customValue);
		} else {
			document.body.style.background = "";
			localStorage.removeItem(customBgColorKey);
		}
	}
}

export function showPreferences() {
	let message = "";

	const checkedValue = isMoveConfirmationRequired() ? "checked='true'" : "";
	message += "<div><input id='confirmMoveBeforeSubmittingCheckbox' type='checkbox' onclick='toggleConfirmMovePreference();' " + checkedValue + "'><label for='confirmMoveBeforeSubmittingCheckbox'> Confirm move before submitting?</label></div>";

	let customBgColorValue = localStorage.getItem(customBgColorKey);
	if (!customBgColorValue) {
		customBgColorValue = "";
	}
	message += '<br /><div>Custom <code>html</code> background color code: <input type="text" id="customBgColorInput" value="' + customBgColorValue + '" oninput="setCustomBgColorFromInput()" maxlength="15"></div>';

	const soundOnCheckedValue = soundManager.isMoveSoundsEnabled() ? "checked='true'" : "";
	message += "<br /><div><input id='soundsOnCheckBox' type='checkbox' onclick='toggleSoundOn();' " + soundOnCheckedValue + "'><label for='soundsOnCheckBox'> Move sounds enabled?</label></div>";

	const animationsOnCheckedValue = isAnimationsOn() ? "checked='true'" : "";
	message += "<div><input id='animationsOnCheckBox' type='checkbox' onclick='toggleAnimationsOn();' " + animationsOnCheckedValue + "'><label for='animationsOnCheckBox'> Move animations enabled?</label></div>";

	const gameClockOnCheckedValue = GameClock.isEnabled() ? "checked='true'" : "";
	message += "<div><input id='gameClockOnCheckBox' type='checkbox' onclick='GameClock.toggleEnabled();' " + gameClockOnCheckedValue + "'><label for='gameClockOnCheckBox'> (Beta) Game Clock enabled?</label></div>";

	if (Ads.Options.showAds) {
		message += "<br /><div class='clickableText' onclick='Ads.minimalAdsEnabled()'>Minimal sponsored messages</div>";
	}

	showModal("Device Preferences", message);
}

export function getBooleanPreference(key, defaultValue) {
	if (defaultValue && defaultValue.toString() === "true") {
		return localStorage.getItem(key) !== "true";
	} else {
		return localStorage.getItem(key) !== "false";
	}
}

export function toggleBooleanPreference(key) {
	localStorage.setItem(key, !getBooleanPreference(key));
}
