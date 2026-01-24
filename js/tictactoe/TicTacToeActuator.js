/**
 * TicTacToeActuator - 3D rendered Tic Tac Toe board using Three.js
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MARK } from './TicTacToeBoard';
import { createDivWithClass, createDivWithId, removeChildren } from '../ActuatorHelp';

export class TicTacToeActuator {
	constructor(gameContainer, isMobile, onCellClick, hostTilesContainerDivs, guestTilesContainerDivs) {
		this.gameContainer = gameContainer;
		this.isMobile = isMobile;
		this.onCellClick = onCellClick;
		this.hostTilesContainerDivs = hostTilesContainerDivs;
		this.guestTilesContainerDivs = guestTilesContainerDivs;

		// Three.js objects
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.controls = null;

		// Game objects
		this.boardGroup = null;
		this.piecesGroup = null;
		this.slotsGroup = null;

		// Raycaster for click detection
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		// Clickable slot meshes
		this.slotMeshes = [];

		// Board configuration
		this.cellSize = 1.5;
		this.boardSize = this.cellSize * 3;

		// Fire effect
		this.fireParticles = [];
		this.fireGroup = null;
		this.isFireActive = false;
		this.fireStartTime = 0;

		this.initialized = false;
		this.initialize();
	}

	initialize() {
		removeChildren(this.gameContainer);

		// Create board container wrapper
		const bcontainer = createDivWithClass('board-container');

		// Create 3D container div
		const container = document.createElement('div');
		container.id = 'tictactoe-3d-container';
		container.style.width = '100%';
		container.style.height = '400px';
		container.style.position = 'relative';
		bcontainer.appendChild(container);

		// Create tile pile container with game messages (standard structure)
		const tilePileContainer = createDivWithClass('tilePileContainer');

		const response = createDivWithId('response');
		const gameMessage = createDivWithClass('gameMessage');
		const hostTilesContainer = createDivWithClass('hostTilesContainer');
		const guestTilesContainer = createDivWithClass('guestTilesContainer');
		const gameMessage2 = createDivWithClass('gameMessage2');

		hostTilesContainer.innerHTML = this.hostTilesContainerDivs;
		guestTilesContainer.innerHTML = this.guestTilesContainerDivs;

		tilePileContainer.appendChild(response);
		tilePileContainer.appendChild(gameMessage);
		tilePileContainer.appendChild(hostTilesContainer);
		tilePileContainer.appendChild(guestTilesContainer);
		tilePileContainer.appendChild(gameMessage2);

		this.gameContainer.appendChild(bcontainer);
		this.gameContainer.appendChild(tilePileContainer);

		// Scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x1a1a2e);

		// Camera
		const width = container.clientWidth || 600;
		const height = container.clientHeight || 400;
		this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
		this.camera.position.set(0, 8, 6);
		this.camera.lookAt(0, 0, 0);

		// Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		container.appendChild(this.renderer.domElement);

		// Controls
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.05;
		this.controls.minDistance = 5;
		this.controls.maxDistance = 20;
		this.controls.maxPolarAngle = Math.PI / 2.2;
		this.controls.target.set(0, 0, 0);

		// Lighting
		this.setupLighting();

		// Create groups
		this.boardGroup = new THREE.Group();
		this.piecesGroup = new THREE.Group();
		this.slotsGroup = new THREE.Group();
		this.fireGroup = new THREE.Group();

		this.scene.add(this.boardGroup);
		this.scene.add(this.piecesGroup);
		this.scene.add(this.slotsGroup);
		this.scene.add(this.fireGroup);

		// Create the board
		this.createBoard();

		// Event listeners
		this.setupEventListeners(container);

		// Animation loop
		this.animate();

		this.initialized = true;
	}

	setupLighting() {
		// Ambient light
		const ambient = new THREE.AmbientLight(0xffffff, 0.4);
		this.scene.add(ambient);

		// Main directional light
		const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
		dirLight.position.set(5, 10, 5);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		dirLight.shadow.camera.near = 0.5;
		dirLight.shadow.camera.far = 30;
		dirLight.shadow.camera.left = -10;
		dirLight.shadow.camera.right = 10;
		dirLight.shadow.camera.top = 10;
		dirLight.shadow.camera.bottom = -10;
		this.scene.add(dirLight);

		// Fill light
		const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
		fillLight.position.set(-5, 5, -5);
		this.scene.add(fillLight);

		// Accent light from below for nice rim lighting
		const rimLight = new THREE.PointLight(0x4a90d9, 0.5, 20);
		rimLight.position.set(0, -3, 0);
		this.scene.add(rimLight);
	}

	createBoard() {
		const size = this.boardSize;
		const thickness = 0.2;

		// Board base - nice wood texture color
		const boardGeometry = new THREE.BoxGeometry(size + 0.4, thickness, size + 0.4);
		const boardMaterial = new THREE.MeshStandardMaterial({
			color: 0x8B4513,
			roughness: 0.7,
			metalness: 0.1
		});
		const board = new THREE.Mesh(boardGeometry, boardMaterial);
		board.position.y = -thickness / 2;
		board.receiveShadow = true;
		this.boardGroup.add(board);

		// Grid lines
		const lineMaterial = new THREE.MeshStandardMaterial({
			color: 0x5a3a1a,
			roughness: 0.8
		});

		// Vertical lines
		for (let i = 1; i < 3; i++) {
			const lineGeometry = new THREE.BoxGeometry(0.08, 0.1, size);
			const line = new THREE.Mesh(lineGeometry, lineMaterial);
			line.position.x = (i - 1.5) * this.cellSize;
			line.position.y = 0.05;
			this.boardGroup.add(line);
		}

		// Horizontal lines
		for (let i = 1; i < 3; i++) {
			const lineGeometry = new THREE.BoxGeometry(size, 0.1, 0.08);
			const line = new THREE.Mesh(lineGeometry, lineMaterial);
			line.position.z = (i - 1.5) * this.cellSize;
			line.position.y = 0.05;
			this.boardGroup.add(line);
		}

		// Create invisible slot planes for click detection (created in actuate)
	}

	createXPiece(row, col, isWinning = false, isLastMove = false) {
		const group = new THREE.Group();
		const size = this.cellSize * 0.6;
		const thickness = 0.15;
		const height = 0.4;

		const material = new THREE.MeshStandardMaterial({
			color: isWinning ? 0x44ff44 : 0xe74c3c,
			roughness: 0.3,
			metalness: 0.2,
			emissive: isLastMove ? 0x331111 : 0x000000
		});

		// Two crossed bars
		const barGeometry = new THREE.BoxGeometry(size, height, thickness);

		const bar1 = new THREE.Mesh(barGeometry, material);
		bar1.rotation.y = Math.PI / 4;
		bar1.position.y = height / 2;
		bar1.castShadow = true;
		group.add(bar1);

		const bar2 = new THREE.Mesh(barGeometry, material);
		bar2.rotation.y = -Math.PI / 4;
		bar2.position.y = height / 2;
		bar2.castShadow = true;
		group.add(bar2);

		// Position on board
		group.position.x = (col - 1) * this.cellSize;
		group.position.z = (row - 1) * this.cellSize;

		return group;
	}

	createOPiece(row, col, isWinning = false, isLastMove = false) {
		const radius = this.cellSize * 0.35;
		const tubeRadius = 0.12;
		const height = 0.3;

		const material = new THREE.MeshStandardMaterial({
			color: isWinning ? 0x44ff44 : 0x3498db,
			roughness: 0.3,
			metalness: 0.2,
			emissive: isLastMove ? 0x111133 : 0x000000
		});

		// Torus (ring shape)
		const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 32);
		const piece = new THREE.Mesh(geometry, material);
		piece.rotation.x = Math.PI / 2;
		piece.position.y = height;
		piece.castShadow = true;

		// Position on board
		piece.position.x = (col - 1) * this.cellSize;
		piece.position.z = (row - 1) * this.cellSize;

		return piece;
	}

	createSlotMesh(row, col) {
		// Invisible clickable plane for each cell
		const geometry = new THREE.PlaneGeometry(this.cellSize * 0.9, this.cellSize * 0.9);
		const material = new THREE.MeshBasicMaterial({
			color: 0x44aa44,
			transparent: true,
			opacity: 0.0,
			side: THREE.DoubleSide
		});

		const slot = new THREE.Mesh(geometry, material);
		slot.rotation.x = -Math.PI / 2;
		slot.position.x = (col - 1) * this.cellSize;
		slot.position.y = 0.1;
		slot.position.z = (row - 1) * this.cellSize;
		slot.userData = { row, col, type: 'slot' };

		return slot;
	}

	setupEventListeners(container) {
		const onPointerUp = (event) => {
			event.preventDefault();

			const rect = this.renderer.domElement.getBoundingClientRect();
			let clientX, clientY;

			if (event.changedTouches) {
				clientX = event.changedTouches[0].clientX;
				clientY = event.changedTouches[0].clientY;
			} else {
				clientX = event.clientX;
				clientY = event.clientY;
			}

			this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
			this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

			this.raycaster.setFromCamera(this.mouse, this.camera);
			const intersects = this.raycaster.intersectObjects(this.slotMeshes);

			if (intersects.length > 0) {
				const slot = intersects[0].object;
				if (slot.userData && slot.userData.type === 'slot') {
					if (this.onCellClick) {
						this.onCellClick(slot.userData.row, slot.userData.col);
					}
				}
			}
		};

		container.addEventListener('click', onPointerUp);
		container.addEventListener('touchend', onPointerUp);

		// Hover effect
		const onPointerMove = (event) => {
			if (this.isMobile) return;

			const rect = this.renderer.domElement.getBoundingClientRect();
			this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

			this.raycaster.setFromCamera(this.mouse, this.camera);
			const intersects = this.raycaster.intersectObjects(this.slotMeshes);

			// Reset all slots
			for (const slot of this.slotMeshes) {
				slot.material.opacity = 0.0;
			}

			if (intersects.length > 0) {
				const slot = intersects[0].object;
				slot.material.opacity = 0.3;
			}
		};

		container.addEventListener('mousemove', onPointerMove);

		// Resize handler
		const onResize = () => {
			const width = container.clientWidth;
			const height = container.clientHeight;
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
		};

		window.addEventListener('resize', onResize);
	}

	animate() {
		requestAnimationFrame(() => this.animate());

		if (this.controls) {
			this.controls.update();
		}

		// Update fire particles
		this.updateFireParticles();

		if (this.renderer && this.scene && this.camera) {
			this.renderer.render(this.scene, this.camera);
		}
	}

	actuate(board, winner, winningLine, lastMove) {
		if (!this.initialized) return;

		// Clear existing pieces
		while (this.piecesGroup.children.length > 0) {
			this.piecesGroup.remove(this.piecesGroup.children[0]);
		}

		// Clear existing slots
		while (this.slotsGroup.children.length > 0) {
			this.slotsGroup.remove(this.slotsGroup.children[0]);
		}
		this.slotMeshes = [];

		// Add pieces based on board state
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				const index = row * 3 + col;
				const mark = board.getCellByIndex(index);

				const isWinning = winningLine && winningLine.includes(index);
				const isLastMove = lastMove && lastMove.index === index;

				if (mark === MARK.X) {
					const piece = this.createXPiece(row, col, isWinning, isLastMove);
					this.piecesGroup.add(piece);
				} else if (mark === MARK.O) {
					const piece = this.createOPiece(row, col, isWinning, isLastMove);
					this.piecesGroup.add(piece);
				} else {
					// Empty cell - create clickable slot
					const slot = this.createSlotMesh(row, col);
					this.slotsGroup.add(slot);
					this.slotMeshes.push(slot);
				}
			}
		}

		// Trigger epic fire effect on victory!
		if (winner && !this.isFireActive) {
			this.startFireEffect();
		} else if (!winner && this.isFireActive) {
			this.stopFireEffect();
		}
	}

	showPossibleMoves(moves) {
		for (const slot of this.slotMeshes) {
			const index = slot.userData.row * 3 + slot.userData.col;
			const isMatch = moves.some(m => m.index === index);
			if (isMatch) {
				slot.material.opacity = 0.2;
			}
		}
	}

	clearPossibleMoves() {
		for (const slot of this.slotMeshes) {
			slot.material.opacity = 0.0;
		}
	}

	cleanup() {
		if (this.renderer) {
			this.renderer.dispose();
		}
		if (this.controls) {
			this.controls.dispose();
		}
	}

	/**
	 * Start the epic victory fire effect!
	 */
	startFireEffect() {
		this.isFireActive = true;
		this.fireStartTime = performance.now();
		this.fireParticles = [];

		// Clear any existing fire
		while (this.fireGroup.children.length > 0) {
			this.fireGroup.remove(this.fireGroup.children[0]);
		}
	}

	/**
	 * Create a single fire particle
	 */
	createFireParticle() {
		// Random starting position along the bottom
		const spreadX = this.boardSize * 1.5;
		const spreadZ = this.boardSize * 1.5;

		const x = (Math.random() - 0.5) * spreadX;
		const z = (Math.random() - 0.5) * spreadZ;
		const y = -2 + Math.random() * 0.5; // Start below the board

		// Particle size varies
		const size = 0.15 + Math.random() * 0.25;

		// Create glowing particle
		const geometry = new THREE.SphereGeometry(size, 8, 8);

		// Fire colors: yellow core, orange middle, red edges
		const colorRoll = Math.random();
		let color;
		if (colorRoll < 0.3) {
			color = 0xffff00; // Yellow
		} else if (colorRoll < 0.7) {
			color = 0xff6600; // Orange
		} else {
			color = 0xff2200; // Red
		}

		const material = new THREE.MeshBasicMaterial({
			color: color,
			transparent: true,
			opacity: 0.9
		});

		const particle = new THREE.Mesh(geometry, material);
		particle.position.set(x, y, z);

		// Store velocity and lifetime data
		particle.userData = {
			velocityX: (Math.random() - 0.5) * 0.08,
			velocityY: 0.12 + Math.random() * 0.1, // Upward velocity
			velocityZ: (Math.random() - 0.5) * 0.08,
			life: 1.0,
			decay: 0.008 + Math.random() * 0.012,
			wobble: Math.random() * Math.PI * 2,
			wobbleSpeed: 2 + Math.random() * 3
		};

		this.fireGroup.add(particle);
		this.fireParticles.push(particle);

		return particle;
	}

	/**
	 * Update all fire particles
	 */
	updateFireParticles() {
		if (!this.isFireActive) return;

		const elapsed = (performance.now() - this.fireStartTime) / 1000;

		// Spawn new particles (more at the start, fewer over time)
		const spawnRate = elapsed < 2 ? 8 : (elapsed < 5 ? 4 : 2);
		for (let i = 0; i < spawnRate; i++) {
			if (this.fireParticles.length < 200) {
				this.createFireParticle();
			}
		}

		// Update existing particles
		for (let i = this.fireParticles.length - 1; i >= 0; i--) {
			const particle = this.fireParticles[i];
			const data = particle.userData;

			// Update position with wobble
			data.wobble += data.wobbleSpeed * 0.016;
			particle.position.x += data.velocityX + Math.sin(data.wobble) * 0.02;
			particle.position.y += data.velocityY;
			particle.position.z += data.velocityZ + Math.cos(data.wobble) * 0.02;

			// Slow down upward velocity slightly
			data.velocityY *= 0.995;

			// Decay life and fade out
			data.life -= data.decay;
			particle.material.opacity = data.life * 0.9;

			// Scale down as it dies
			const scale = 0.5 + data.life * 0.5;
			particle.scale.set(scale, scale, scale);

			// Color shift towards red as it rises
			if (data.life < 0.5) {
				particle.material.color.setHex(0xff2200);
			}

			// Remove dead particles
			if (data.life <= 0 || particle.position.y > 8) {
				this.fireGroup.remove(particle);
				particle.geometry.dispose();
				particle.material.dispose();
				this.fireParticles.splice(i, 1);
			}
		}

		// Stop spawning after a while but let existing particles finish
		if (elapsed > 8) {
			this.isFireActive = false;
		}
	}

	/**
	 * Stop the fire effect and clear all particles
	 */
	stopFireEffect() {
		this.isFireActive = false;

		// Clear all particles
		for (const particle of this.fireParticles) {
			this.fireGroup.remove(particle);
			particle.geometry.dispose();
			particle.material.dispose();
		}
		this.fireParticles = [];
	}
}
