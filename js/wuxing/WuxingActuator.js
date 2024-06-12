import { createBoardArrow, createBoardPointDiv, setupPaiShoBoard } from "../ActuatorHelp"
import { PaiShoMarkingManager } from "../pai-sho-common/PaiShoMarkingManager"
import { clearMessage, RmbDown, RmbUp, showTileMessage, unplayedTileClicked } from "../PaiShoMain"
import { MARKED, NON_PLAYABLE, POSSIBLE_MOVE } from "../skud-pai-sho/SkudPaiShoBoardPoint"
import { WuxingBoard } from "./WuxingBoard"
import { WuxingController } from "./WuxingController"
import { WuxingBoardPoint } from "./WuxingPointBoard"
import { WuxingTile } from "./WuxingTile"
import { WuxingTileManager } from "./WuxingTileManager"


export class WuxingActuator {

    /** @type {HTMLDivElement} */
    gameContainer
    /** @type {boolean} */
    isMobile
    /** @type {boolean} */
    animationOn

    /** @type {HTMLDivElement} */
    boardContainer

    /** @type {Element} */
    arrowContainer

    /** @type {HTMLDivElement} */
    hostTilesContainer

    /** @type {HTMLDivElement} */
    guestTilesContainer

    /**
     * @param {HTMLDivElement} gameContainer
     * @param {boolean} isMovile 
     * @param {boolean} enableAnimation 
    */
    constructor( gameContainer, isMovile, enableAnimation ) {
        this.gameContainer = gameContainer
        this.isMobile = isMovile
        this.animationOn = enableAnimation

        let containers = setupPaiShoBoard(
            this.gameContainer,
            WuxingController.getHostTilesContainerDivs(),
            WuxingController.getGuestTilesContainerDivs(),
            false
        )

        this.boardContainer = containers.boardContainer
        this.arrowContainer = containers.arrowContainer
        this.hostTilesContainer = containers.hostTilesContainer
        this.guestTilesContainer = containers.guestTilesContainer
    }

    setAnimationOn(isOn) {
        this.animationOn = isOn
    }

    /**
     * Calls forth `this.htmlify()`
     * @param {WuxingBoard} board 
     * @param {WuxingTileManager} tileManager 
     * @param {PaiShoMarkingManager} markingManager 
     * @param {*} moveToAnimate 
     * @param {number} moveAnimationBeginStep 
     */
    actuate(board, tileManager, markingManager, moveToAnimate, moveAnimationBeginStep) {
        let self = this
        if (!moveAnimationBeginStep) {
            moveAnimationBeginStep = 0
        }

        window.requestAnimationFrame(function () {
            self.htmlify(board, tileManager, markingManager)
        })
    }

    /**
     * Creates the html grid found on the board
     * 
     * @param {WuxingBoard} board 
     * @param {WuxingTileManager} tileManager 
     * @param {PaiShoMarkingManager} markingManager 
     * @param {number} moveToAnimate 
     * @param {number} moveAnimationBeginStep 
     */
    htmlify(board, tileManager, markingManager, moveToAnimate, moveAnimationBeginStep) {
        this.clearContainer(this.boardContainer)
        this.clearContainer(this.arrowContainer)

        for (const column of board.cells) {
            for (const cell of column) {
                if (markingManager.pointIsMarked(cell) && !cell.isType(MARKED)) {
                    cell.addType(MARKED)
                }
                else if (!markingManager.pointIsMarked(cell) && cell.isType(MARKED)) {
                    cell.removeType(MARKED)
                }

                if (cell) {
                    this.addBoardPoint(cell)
                }
            }
        }

        // Draw arrows
        for ( let [_, arrow] of Object.entries(markingManager.arrows) ) {
            this.arrowContainer.appendChild(createBoardArrow(arrow[0], arrow[1]))
        }

        let fullTileSet = new WuxingTileManager()

        // Go through tile piles and clear containers
        for (let i = 0; i < fullTileSet.hostTiles.length; i++) {
            this.clearTileContainer(fullTileSet.hostTiles[i])
        }
        for (const tile of fullTileSet.guestTiles) {
            this.clearTileContainer(tile)
        }

        // Go through tile piles and display
        for (const tile of fullTileSet.hostTiles) {
            this.addTile(tile, this.hostTilesContainer)
        }
        for (const tile of fullTileSet.guestTiles) {
            this.addTile(tile, this.guestTilesContainer)
        }
    }

    /** @param {Element} container */
    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }
    }

    /**
     * Taken from CaptureActuator.js
     * 
     * Remember to add the correct div with its proper tile code in
     * `Controller.getHostTilesContainerDivs()` / `Controller.getGuestTilesContainerDivs()` or else this breaks
     * @param {WuxingTile} tile
     */
    clearTileContainer(tile) {
        let containerClass = "." + tile.getImageName()
        let container = document.querySelector(containerClass)
        while (container.firstChild != null) {
            container.removeChild(container.firstChild)
        }
    }

    /**
     * Taken from CaptureActuator.js
     * @param {WuxingTile} tile 
     * @param {HTMLDivElement} mainContainer Seems to be unused, but I'll keep it just in case :) 
     */
    addTile(tile, mainContainer) {

        let container = document.querySelector("." + tile.getImageName())
        let div = document.createElement("div")

        div.classList.add("point")
        div.classList.add("hasTile")

        if (tile.selectedFromPile) {
            div.classList.add("selectedFromPile")
            div.classList.add("drained")
        }

        let img = document.createElement("img")
        let srcValue = this.getTileImageSourceDir()

        img.src = srcValue + tile.getImageName() + ".png"
        div.appendChild(img)

        div.setAttribute("name", tile.getImageName())
        div.setAttribute("id", tile.id)

        if (this.isMobile) {
            div.addEventListener('click', () => {
                unplayedTileClicked(div)
                showTileMessage(div)
            })
        }
        else {
            div.addEventListener('click', () => unplayedTileClicked(div) )
            div.addEventListener('mouseover', () => showTileMessage(div))
            div.addEventListener('mouseout', clearMessage)
        }

        container.appendChild(div)
    }

    /**
     * Taken from CaptureActuator.js
     * @param {WuxingBoardPoint} bp 
     */
    addBoardPoint(bp) {
        let div = createBoardPointDiv(bp)

        if (!bp.isType(NON_PLAYABLE)) {
            div.classList.add("activePoint")

            if (bp.isType(MARKED)) {
                div.classList.add("markedPoint")
            }

            if (bp.isType(POSSIBLE_MOVE)) {
                div.classList.add("possibleMove")
            }

            if (this.isMobile) {
                div.setAttribute("ontouchstart", "pointClicked(this); showPointMessage(this);");
            }
            else {
                div.setAttribute("onclick", "pointClicked(this);");
			    div.setAttribute("onmouseover", "showPointMessage(this); gameController.showCaptureHelpOnHover(this);");
			    div.addEventListener('mouseout', clearMessage);
			    div.addEventListener('mousedown', e => {
			    	// Right Mouse Button
			    	if (e.button == 2) {
			    		RmbDown(div);
			    	}
			    });
			    div.addEventListener('mouseup', e => {
			    	// Right Mouse Button
			    	if (e.button == 2) {
			    		RmbUp(div);
			    	}
			    });
			    div.addEventListener('contextmenu', e => {
			    	e.preventDefault();
			    });
            }
        }

        if (bp.hasTile()) {
            div.classList.add("hasTile")

            let img = document.createElement("img")
            let srcValue = this.getTileImageSourceDir()
            img.src = srcValue + bp.tile.getImageName() + ".png"

            div.appendChild(img)
        }

        this.boardContainer.appendChild(div)
    }

    getTileImageSourceDir() {
        return ""
    }


}