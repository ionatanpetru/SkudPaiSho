import { setupPaiShoBoard } from "../ActuatorHelp"
import { PaiShoMarkingManager } from "../pai-sho-common/PaiShoMarkingManager"
import { WuxingBoard } from "./WuxingBoard"
import { WuxingController } from "./WuxingController"
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

    // TODO: Actually figure what these methods do instead of just copying SkudPaiShoActuator.js

    /**
     * 
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
            self.htmlify(board, tileManager, markingManager, moveToAnimate, moveAnimationBeginStep)
        })
    }

    /**
     * TODO: Copy this form SkudPaiShoActuator or VagavondAcuator and figure if it needs to be modified
     * 
     * @param {WuxingBoard} board 
     * @param {WuxingTileManager} tileManager 
     * @param {PaiShoMarkingManager} markingManager 
     * @param {*} moveToAnimate 
     * @param {number} moveAnimationBeginStep 
     */
    htmlify(board, tileManager, markingManager, moveToAnimate, moveAnimationBeginStep) {}

    /** @param {Element} container */
    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }
    }

    clearTileContainer(tile) {}
}