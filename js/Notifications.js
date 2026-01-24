// Notifications Module
// Handles browser notification permissions and display

import { debug } from './GameData';

export function requestNotificationPermission() {
	if (Notification.permission !== "denied") {
		Notification.requestPermission().then(function(permission) {
			// If the user accepts, let's create a notification
			if (permission === "granted") {
				debug("Notifications granted");
			}
		});
	}
}

export function notifyMe() {
	notifyThisMessage("It's your turn, bub");
}

export function notifyThisMessage(message) {
	// Let's check if the browser supports notifications
	// if (!("Notification" in window)) {
	//   alert("This browser does not support desktop notification");
	// } else.....

	// Let's check whether notification permissions have already been granted
	if (!document.hasFocus() && Notification.permission === "granted") {
		// If it's okay let's create a notification
		const notification = new Notification(message);
	}

	// Otherwise, we need to ask the user for permission
	// else if (Notification.permission !== "denied") {
	//   Notification.requestPermission().then(function (permission) {
	// 	// If the user accepts, let's create a notification
	// 	if (permission === "granted") {
	// 	  const notification = new Notification(message);
	// 	}
	//   });
	// }

	// At last, if the user has denied notifications, and you
	// want to be respectful there is no need to bother them any more.
}
