// Actuator

function FirePaiShoActuator(gameContainer, isMobile, enableAnimations) {
	this.gameContainer = gameContainer;
	this.mobile = isMobile;

	this.animationOn = enableAnimations;

var rotateFacingRedGardens = getUserGamePreference(FirePaiShoController.boardRotationKey) !== "true";
var rotateType = rotateFacingRedGardens ? ADEVAR_ROTATE : null;
var containers = setupPaiShoBoard(
        this.gameContainer,
        FirePaiShoController.getHostTilesContainerDivs(),
        FirePaiShoController.getGuestTilesContainerDivs(),
        rotateFacingRedGardens,
        rotateType,
        false
    );


	this.boardContainer = containers.boardContainer;
	this.hostTilesContainer = containers.hostTilesContainer;
	this.guestTilesContainer = containers.guestTilesContainer;
}

FirePaiShoActuator.prototype.setAnimationOn = function(isOn) {
	this.animationOn = isOn;
};

FirePaiShoActuator.prototype.actuate = function(board, tileManager, moveToAnimate, moveAnimationBeginStep) {
	var self = this;
	// debugStackTrace();
	// self.printBoard(board);

	if (!moveAnimationBeginStep) {
		moveAnimationBeginStep = 0;
	}

	window.requestAnimationFrame(function() {
		self.htmlify(board, tileManager, moveToAnimate, moveAnimationBeginStep);
	});
};

FirePaiShoActuator.prototype.htmlify = function(board, tileManager, moveToAnimate, moveAnimationBeginStep) {
	this.clearContainer(this.boardContainer);

	var self = this;

	board.cells.forEach(function(column) {
		column.forEach(function(cell) {
			if (cell) {
				self.addBoardPoint(cell, moveToAnimate, moveAnimationBeginStep);
			}
		});
	});

	var fullTileSet = new FirePaiShoTileManager(true);


	this.clearTileContainer();
/**
	// Go through tile piles and clear containers
	fullTileSet.hostTiles.forEach(function(tile) {
		self.clearTileContainer(tile);
	});
	fullTileSet.guestTiles.forEach(function(tile) {
		self.clearTileContainer(tile);
	});
*/
	// Host Tile Library
	var hostTileLibraryContainer = document.createElement("span");
	hostTileLibraryContainer.classList.add("tileLibrary");
	var hostLibraryLabel = document.createElement("span");
	hostLibraryLabel.innerText = "~Host Tile Library~";
	hostTileLibraryContainer.appendChild(hostLibraryLabel);
	hostTileLibraryContainer.appendChild(document.createElement("br"));
	this.hostTilesContainer.appendChild(hostTileLibraryContainer);

	if (!gameOptionEnabled(HIDE_RESERVE_TILES)){
		// Host Tile Reserve
		var hostTileReserveContainer = document.createElement("span");
		hostTileReserveContainer.classList.add("tileLibrary");
		var hostReserveLabel = document.createElement("span");
		hostReserveLabel.innerText = "~Host Tile Reserve~";
		hostTileReserveContainer.appendChild(hostReserveLabel);
		hostTileReserveContainer.appendChild(document.createElement("br"));
		this.hostTilesContainer.appendChild(hostTileReserveContainer);
	}

	// Guest Tile Library
	var guestTileLibraryContainer = document.createElement("span");
	guestTileLibraryContainer.classList.add("tileLibrary");
	var guestLibraryLabel = document.createElement("span");
	guestLibraryLabel.innerText = "~Guest Tile Library~";
	guestTileLibraryContainer.appendChild(guestLibraryLabel);
	guestTileLibraryContainer.appendChild(document.createElement("br"));
	this.guestTilesContainer.appendChild(guestTileLibraryContainer);


	if (!gameOptionEnabled(HIDE_RESERVE_TILES)){
		// Guest Tile Reserve
		var guestTileReserveContainer = document.createElement("span");
		guestTileReserveContainer.classList.add("tileLibrary");
		var guestReserveLabel = document.createElement("span");
		guestReserveLabel.innerText = "~Guest Tile Reserve~";
		guestTileReserveContainer.appendChild(guestReserveLabel);
		guestTileReserveContainer.appendChild(document.createElement("br"));
		this.guestTilesContainer.appendChild(guestTileReserveContainer);
	}

	if (gameOptionEnabled(HIDE_RESERVE_TILES)){
		// Drawn Tile
		var drawnTileContainer = document.createElement("span");
		drawnTileContainer.classList.add("tileLibrary");
		var drawnTileLabel = document.createElement("span");
		drawnTileLabel.innerText = "~Currently Drawn Reserve Tile~";
		drawnTileContainer.appendChild(drawnTileLabel);
		drawnTileContainer.appendChild(document.createElement("br"));
		this.guestTilesContainer.appendChild(drawnTileContainer);
	}

	tileManager.hostLibraryTiles.forEach(function(tile) {
		self.addTile(tile, hostTileLibraryContainer, true);
	});
	tileManager.guestLibraryTiles.forEach(function(tile) {
		self.addTile(tile, guestTileLibraryContainer, true);
	});

	if (!gameOptionEnabled(HIDE_RESERVE_TILES)){
		tileManager.hostReserveTiles.forEach(function(tile) {
			self.addTile(tile, hostTileReserveContainer, false);
		});
		tileManager.guestReserveTiles.forEach(function(tile) {
			self.addTile(tile, guestTileReserveContainer, false);
		});
	} else {
		if (tileManager.currentlyDrawnReserve !== null)
		self.addTile(tileManager.currentlyDrawnReserve, drawnTileContainer, false)
	}

};

FirePaiShoActuator.prototype.clearContainer = function (container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

FirePaiShoActuator.prototype.clearTileContainer = function () {
	this.clearContainer(hostTilesContainer);
	this.clearContainer(guestTilesContainer);
/**	var container = document.querySelector("." + tile.getImageName());
	if (container) {
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	}
	*/
};

FirePaiShoActuator.prototype.addTile = function(tile, mainContainer, clickable) {
	var self = this;

	var container = document.querySelector("." + tile.getImageName());

	var theDiv = document.createElement("div");

	theDiv.classList.add("point");
	theDiv.classList.add("hasTile");

	if (tile.selectedFromPile) {
		theDiv.classList.add("selectedFromPile");
		theDiv.classList.add("boosted");
	}

	var theImg = document.createElement("img");

	var srcValue = getSkudTilesSrcPath();
	theImg.src = srcValue + tile.getImageName() + ".png";
	theDiv.appendChild(theImg);

	theDiv.setAttribute("name", tile.getImageName());
	theDiv.setAttribute("id", tile.id);

	if (this.mobile) {
		if (clickable) {
			theDiv.setAttribute("onclick", "unplayedTileClicked(this); showTileMessage(this);");
		} else {//not clickable, for reserve tiles
			theDiv.setAttribute("showTileMessage(this);");
		}
	} else { //desktop
		if (clickable) {
			theDiv.setAttribute("onclick", "unplayedTileClicked(this);");
			theDiv.setAttribute("onmouseover", "showTileMessage(this);");
			theDiv.setAttribute("onmouseout", "clearMessage();");
		} else {//not clickable, for reserve tiles
			theDiv.setAttribute("onmouseover", "showTileMessage(this);");
			theDiv.setAttribute("onmouseout", "clearMessage();");
			
		}
	}

	mainContainer.appendChild(theDiv);
};

FirePaiShoActuator.prototype.addBoardPoint = function(boardPoint, moveToAnimate, moveAnimationBeginStep) {
	var self = this;

	var theDiv = createBoardPointDiv(boardPoint);

	var isAnimationPointOfBoatRemovingAccentTile = this.animationOn
					&& !boardPoint.hasTile() 
					&& moveToAnimate && moveToAnimate.bonusTileCode === "B" 
					&& !moveToAnimate.boatBonusPoint 
					&& isSamePoint(moveToAnimate.bonusEndPoint, boardPoint.col, boardPoint.row);

	if (!boardPoint.isType(NON_PLAYABLE)) {
		theDiv.classList.add("activePoint");
		//ADEVAR ROTATE
		if (getUserGamePreference(FirePaiShoController.boardRotationKey) !== "true"){
			theDiv.classList.add("adevarPointRotate");
		}
//	theDiv.classList.add("vagabondPointRotate");

		if (boardPoint.isType(POSSIBLE_MOVE)) {
			theDiv.classList.add("possibleMove");
		} else if (boardPoint.betweenHarmony 
				&& !gameOptionEnabled(NO_HARMONY_VISUAL_AIDS)
				&& getUserGamePreference(FirePaiShoController.hideHarmonyAidsKey) !== "true") {
			var boatRemovingPointClassesToAddAfterAnimation = [];
			if (isAnimationPointOfBoatRemovingAccentTile) {
				boatRemovingPointClassesToAddAfterAnimation.push("betweenHarmony");
				if (boardPoint.betweenHarmonyHost) {
					boatRemovingPointClassesToAddAfterAnimation.push("bhHost");
				}
				if (boardPoint.betweenHarmonyGuest) {
					boatRemovingPointClassesToAddAfterAnimation.push("bhGuest");
				}
				setTimeout(function() {
					boatRemovingPointClassesToAddAfterAnimation.forEach(function(classToAdd) {
						theDiv.classList.add(classToAdd);
					});
				}, pieceAnimationLength * (2 - moveAnimationBeginStep));
			} else {
				theDiv.classList.add("betweenHarmony");
				if (boardPoint.betweenHarmonyHost) {
					theDiv.classList.add("bhHost");
				}
				if (boardPoint.betweenHarmonyGuest) {
					theDiv.classList.add("bhGuest");
				}
			}
		}

		if (this.mobile) {
			theDiv.setAttribute("onclick", "pointClicked(this); showPointMessage(this);");
		} else {
			theDiv.setAttribute("onclick", "pointClicked(this);");
			theDiv.setAttribute("onmouseover", "showPointMessage(this);");
			theDiv.setAttribute("onmouseout", "clearMessage();");
		}
	}

	if (isAnimationPointOfBoatRemovingAccentTile) {
		// No tile here, but can animate the Boat removing the Accent Tile
		var theImg = document.createElement("img");

		if (moveToAnimate) {
			this.doAnimateBoardPoint(boardPoint, moveToAnimate, moveAnimationBeginStep,
				theImg,
				{});
		}
		theDiv.appendChild(theImg);
	} else if (boardPoint.hasTile()) {
		theDiv.classList.add("hasTile");

		var theImg = document.createElement("img");
		var flags = {
			boostedOnThisTurn: false,
			wasArranged: false,
			didBonusMove: false
		};

		if (moveToAnimate) {
			this.doAnimateBoardPoint(boardPoint, moveToAnimate, moveAnimationBeginStep, theImg, flags);
		}

		var srcValue = getSkudTilesSrcPath();
		theImg.src = srcValue + boardPoint.tile.getImageName() + ".png";

		if (boardPoint.tile.harmonyOwners 
				&& !gameOptionEnabled(NO_HARMONY_VISUAL_AIDS)
				&& getUserGamePreference(FirePaiShoController.hideHarmonyAidsKey) !== "true") {
			if (this.animationOn && (flags.didBonusMove || flags.wasArranged)) {
				setTimeout(function() {//Delay harmony outline until after a piece has moved
					for (var i = 0; i < boardPoint.tile.harmonyOwners.length; i++) {
						theDiv.classList.add(boardPoint.tile.harmonyOwners[i] + "harmony");
					}
				}, ((flags.didBonusMove ? 2 : 1) - moveAnimationBeginStep) * pieceAnimationLength);
			} else {
				for (var i = 0; i < boardPoint.tile.harmonyOwners.length; i++) {
					theDiv.classList.add(boardPoint.tile.harmonyOwners[i] + "harmony");
				}
			}
		}

		if (boardPoint.tile.boosted) {
			if (flags.boostedOnThisTurn) {
				setTimeout(function() {
					theDiv.classList.add("boosted");
				}, pieceAnimationLength);
			} else {
				theDiv.classList.add("boosted");
			}
		}

		theDiv.appendChild(theImg);

		/* If capturing, preserve tile being captured on board during animation */
		if (this.animationOn && moveToAnimate && moveToAnimate.capturedTile
				&& isSamePoint(moveToAnimate.endPoint, boardPoint.col, boardPoint.row) && moveAnimationBeginStep === 0) {
			var theImgCaptured = document.createElement("img");
			theImgCaptured.src = srcValue + moveToAnimate.capturedTile.getImageName() + ".png";
			theImgCaptured.classList.add("underneath");
			theDiv.appendChild(theImgCaptured);

			/* After animation, hide captured tile */
			setTimeout(function() {
				requestAnimationFrame(function() {
					theImgCaptured.style.visibility = "hidden";
				});
			}, pieceAnimationLength);
		}
	}

	this.boardContainer.appendChild(theDiv);

	if (boardPoint.betweenHarmony && boardPoint.col === 16) {
		var theBr = document.createElement("div");
		theBr.classList.add("clear");
		this.boardContainer.appendChild(theBr);
	}
};

FirePaiShoActuator.prototype.doAnimateBoardPoint = function(boardPoint, moveToAnimate, moveAnimationBeginStep, theImg, flags) {
	if (!this.animationOn) {
		return;
	}

	var x = boardPoint.col, y = boardPoint.row, ox = x, oy = y, placedOnAccent = false, boatRemovingAccent = false;

	if (moveToAnimate.hasHarmonyBonus()) {
		debug(moveToAnimate.bonusTileCode);
		if (isSamePoint(moveToAnimate.bonusEndPoint, ox, oy)) {// Placed on bonus turn
			placedOnAccent = true;

			if (moveToAnimate.bonusTileCode === "B" && !moveToAnimate.boatBonusPoint && moveToAnimate.tileRemovedWithBoat && isSamePoint(moveToAnimate.bonusEndPoint, ox, oy)) {// Placement of Boat to remove Accent Tile
				var srcValue = getSkudTilesSrcPath();
				theImg.src = srcValue + moveToAnimate.tileRemovedWithBoat.getImageName() + ".png";
				boatRemovingAccent = true;
			} else if (moveToAnimate.bonusTileCode === "B" && moveToAnimate.boatBonusPoint && isSamePoint(moveToAnimate.bonusEndPoint, ox, oy)) {// Placement of Boat to move Flower Tile
				theImg.style.zIndex = 90;	// Make sure Boat shows up above the Flower Tile it moves
			}
		} else if (moveToAnimate.boatBonusPoint && isSamePoint(moveToAnimate.boatBonusPoint, x, y)) {// Moved by boat
			x = moveToAnimate.bonusEndPoint.rowAndColumn.col;
			y = moveToAnimate.bonusEndPoint.rowAndColumn.row;
			flags.didBonusMove = true;
		} else if (moveToAnimate.bonusTileCode === "W") {
			var dx = x - moveToAnimate.bonusEndPoint.rowAndColumn.col;
			var dy = y - moveToAnimate.bonusEndPoint.rowAndColumn.row;
			if (-1 <= dx && 1 >= dx && -1 <= dy && 1 >= dy && (dx + dy) !== (dx * dy)) {// Moved by wheel
				if (dx === 1 && dy > -1) y--;
				else if (dy === -1 && dx > -1) x--;
				else if (dx === -1 && dy < 1) y++;
				else x++;
				flags.didBonusMove = true;
			}
		} else if (moveToAnimate.bonusTileCode === "K") {
			var dx = x - moveToAnimate.bonusEndPoint.rowAndColumn.col;
			var dy = y - moveToAnimate.bonusEndPoint.rowAndColumn.row;
			if (-1 <= dx && 1 >= dx && -1 <= dy && 1 >= dy && (dx + dy) !== (dx * dy)) {// Boosted by knotweed
				flags.boostedOnThisTurn = true;
			}
		}
	}

	var ax = x, ay = y;

	if (moveAnimationBeginStep === 0) {
		if (moveToAnimate.moveType === ARRANGING && boardPoint.tile && boardPoint.tile.type !== ACCENT_TILE) {
			if (isSamePoint(moveToAnimate.endPoint, x, y)) {// Piece moved
				flags.wasArranged = true;
				x = moveToAnimate.startPoint.rowAndColumn.col;
				y = moveToAnimate.startPoint.rowAndColumn.row;
				theImg.style.transform = "scale(1.2)";	// Make the pieces look like they're picked up a little when moving, good idea or no?
				theImg.style.zIndex = 99;	// Make sure "picked up" pieces show up above others
			} else if (moveToAnimate.isOrchidMove) {
				var dx = x - moveToAnimate.endPoint.rowAndColumn.col;
				var dy = y - moveToAnimate.endPoint.rowAndColumn.row;
			}
		} else if (moveToAnimate.moveType === PLANTING) {
			if (isSamePoint(moveToAnimate.endPoint, ox, oy)) {// Piece planted
				if (piecePlaceAnimation === 1) {
					theImg.style.transform = "scale(2)";
					theImg.style.zIndex = 99; // Show new pieces above others
					requestAnimationFrame(function() {
						theImg.style.transform = "scale(1)";
					});
				}
			}
		}
	}

	if ((x !== ox || y !== oy) && boardPoint.tile && (boardPoint.tile.boosted)) {
		flags.boostedOnThisTurn = true;
	}

	var pointSizeMultiplierX = 34;
	var pointSizeMultiplierY = pointSizeMultiplierX;
	var unitString = "px";

	/* For small screen size using dynamic vw units */
	if (window.innerWidth <= 612) {
		pointSizeMultiplierX = 5.5555;
		pointSizeMultiplierY = 5.611;
		unitString = "vw";
	}

	


//console.log("I'm hitting the point in the code where the rotation happens.");
	

	if (getUserGamePreference(FirePaiShoController.boardRotationKey) !== "true") {
		//ADEVAR ROTATION
		var left = (x - ox);
		var top = (y - oy);
		theImg.style.left = ((left * cos135 - top * sin135) * pointSizeMultiplierX) + unitString;
		theImg.style.top = ((top * cos135 + left * sin135) * pointSizeMultiplierY) + unitString;
	} else {
		// SKUD ROTATION
		theImg.style.left = ((x - ox) * pointSizeMultiplierX) + unitString;
		theImg.style.top = ((y - oy) * pointSizeMultiplierY) + unitString;
	}

	//VAGABOND ROTATION
//	var left = (x - ox);
//	var top = (y - oy);
//	theImg.style.left = ((left * cos45 - top * sin45) * pointSizeMultiplierX) + unitString;
//	theImg.style.top = ((top * cos45 + left * sin45) * pointSizeMultiplierY) + unitString;

	
	if (placedOnAccent && !boatRemovingAccent) {
		theImg.style.visibility = "hidden";
		if (piecePlaceAnimation === 1) {
			theImg.style.transform = "scale(2)";
		}
	}

	ax = ((ax - ox) * pointSizeMultiplierX);
	ay = ((ay - oy) * pointSizeMultiplierY);
	requestAnimationFrame(function() {
		theImg.style.left = ax+unitString;
		theImg.style.top = ay+unitString;
		// theImg.style.transform = "scale(1)";	// This will size back to normal while moving after "picked up" scale
	});
	setTimeout(function() {
		requestAnimationFrame(function() {
			theImg.style.left = "0px";
			theImg.style.top = "0px";
			theImg.style.visibility = "visible";
			theImg.style.transform = "scale(1)";	// This will size back to normal after moving

			if (boatRemovingAccent) {
				/* Change image to Boat being played */
				theImg.classList.add("noTransition");
				theImg.src = srcValue + moveToAnimate.accentTileUsed.getImageName() + ".png";
				theImg.style.transform = "scale(2)";

				requestAnimationFrame(function() {
					/* Animate (scale 0 to shrink into disappearing) */
					theImg.classList.remove("noTransition");
					theImg.style.transform = "scale(1)";
					setTimeout(function() {
						theImg.style.visibility = "hidden";
					}, pieceAnimationLength);	// If want to hide the img after transform, perhaps if going with some other animation
				});
			}
		});
	}, moveAnimationBeginStep === 0 ? pieceAnimationLength : 0);
};

FirePaiShoActuator.prototype.printBoard = function(board) {

	debug("");
	var rowNum = 0;
	board.cells.forEach(function (row) {
		var rowStr = rowNum + "\t: ";
		row.forEach(function (boardPoint) {
			var str = boardPoint.getConsoleDisplay();
			if (str.length < 3) {
				rowStr += " ";
			}
			rowStr = rowStr + str;
			if (str.length < 2) {
				rowStr = rowStr + " ";
			}

		});
		debug(rowStr);
		rowNum++;
	});
	debug("");

	
};