import { accountHeaderClicked, closeNav, discordLinkClicked, dismissChatAlert, newGameClicked, openNav, openShop, openTab, viewGameSeeksClicked } from '../PaiShoMain';

export function setupUiEvents() {
	/* Sidenav Open/Close */
	var sidenavOpenDiv = document.getElementById('sidenavOpenButton');
	if (sidenavOpenDiv) {
		sidenavOpenDiv.addEventListener('click', openNav);
	}

	var sidenavHeaderDiv = document.getElementById('sidenavHeaderDiv');
	if (sidenavHeaderDiv) {
		sidenavHeaderDiv.addEventListener('click', openNav);
	}

	var sidenavCloseDiv = document.getElementById('sidenavCloseDiv');
	if (sidenavCloseDiv) {
		sidenavCloseDiv.addEventListener('click', closeNav);
	}

	/* Chat Tabs */
	var helpTabHeader = document.getElementById('defaultOpenTab');
	if (helpTabHeader) {
		helpTabHeader.addEventListener('click', (event) => {
			openTab(event, 'helpTextTab');
		});
	}

	var globalChatTabHeader = document.getElementById('globalChatTabHeader');
	if (globalChatTabHeader) {
		globalChatTabHeader.addEventListener('click', (event) => {
			openTab(event, 'globalChatTab');
		});
	}

	var chatTabHeader = document.getElementById('chatTab');
	if (chatTabHeader) {
		chatTabHeader.addEventListener('click', (event) => {
			openTab(event, 'gameChatTab');
			dismissChatAlert();
		});
	}

	/* New Game */
	addElementEvent('menuNewGame', 'click', newGameClicked);
	addElementEvent('sidenavNewGame', 'click', newGameClicked);

	/* Sign In / My Games */
	addElementEvent('accountHeaderSpan', 'click', accountHeaderClicked);
	addElementEvent('sidenavMyGames', 'click', accountHeaderClicked);

	/* Header */
	addElementEvent('headerDiscordLink', 'click', discordLinkClicked);
	addElementEvent('headerShopLink', 'click', openShop);
	addElementEvent('headerJoinLink', 'click', viewGameSeeksClicked);



}

function addElementEvent(elementId, eventName, callback) {
	var element = document.getElementById(elementId);
	if (element) {
		element.addEventListener(eventName, callback);
	}
}
