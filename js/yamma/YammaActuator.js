/**
 * YammaActuator - Three.js 3D rendering for Yamma pyramid
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PLAYER } from './YammaBoard';
import { createDivWithClass, createDivWithId, removeChildren } from '../ActuatorHelp';

export class YammaActuator {
	constructor(gameContainer, isMobile, onSlotClick, hostTilesContainerDivs, guestTilesContainerDivs) {
		this.gameContainer = gameContainer;
		this.isMobile = isMobile;
		this.onSlotClick = onSlotClick;
		this.hostTilesContainerDivs = hostTilesContainerDivs;
		this.guestTilesContainerDivs = guestTilesContainerDivs;

		// Three.js objects
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.controls = null;

		// Game objects
		this.boardGroup = null;
		this.cubesGroup = null;
		this.slotsGroup = null;
		this.highlightGroup = null;

		// Board configuration
		this.baseGridSize = 5;
		this.maxHeight = 5;
		this.slotSpacing = 1.2;
		this.cubeSize = 0.8;
		this.levelHeight = 0.7; // Height between levels

		// Raycaster for mouse interaction
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		// Track clickable slots (recreated each actuate based on possible moves)
		this.slotMeshes = [];

		// Store current board for reference
		this.currentBoard = null;

		this.initialized = false;

		this.initialize();
	}

	initialize() {
		// Clear the game container
		removeChildren(this.gameContainer);

		// Create board container wrapper
		const bcontainer = createDivWithClass('board-container');

		// Create 3D container div
		const container = document.createElement('div');
		container.id = 'yamma-3d-container';
		container.style.width = '100%';
		container.style.height = '500px';
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
		const width = container.clientWidth || 800;
		const height = container.clientHeight || 500;
		this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
		this.camera.position.set(8, 10, 8);
		this.camera.lookAt(0, 1, 0);

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
		this.controls.maxDistance = 25;
		this.controls.maxPolarAngle = Math.PI / 2.1;
		this.controls.target.set(0, 1, 0);

		// Lighting
		this.setupLighting();

		// Create groups
		this.boardGroup = new THREE.Group();
		this.cubesGroup = new THREE.Group();
		this.slotsGroup = new THREE.Group();
		this.highlightGroup = new THREE.Group();

		this.scene.add(this.boardGroup);
		this.boardGroup.add(this.slotsGroup);
		this.boardGroup.add(this.cubesGroup);
		this.boardGroup.add(this.highlightGroup);

		// Create the board base
		this.createBoardBase();

		// Event listeners
		this.setupEventListeners(container);

		// Animation loop
		this.animate();

		this.initialized = true;
	}

	setupLighting() {
		// Ambient light
		const ambient = new THREE.AmbientLight(0xffffff, 0.5);
		this.scene.add(ambient);

		// Main directional light
		const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
		dirLight.position.set(10, 20, 10);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		dirLight.shadow.camera.near = 0.5;
		dirLight.shadow.camera.far = 50;
		dirLight.shadow.camera.left = -15;
		dirLight.shadow.camera.right = 15;
		dirLight.shadow.camera.top = 15;
		dirLight.shadow.camera.bottom = -15;
		this.scene.add(dirLight);

		// Fill light
		const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
		fillLight.position.set(-5, 10, -5);
		this.scene.add(fillLight);
	}

	createBoardBase() {
		// Create a wooden-looking board base
		const boardSize = this.baseGridSize * this.slotSpacing + 1;
		const baseGeometry = new THREE.BoxGeometry(boardSize, 0.3, boardSize);
		const baseMaterial = new THREE.MeshStandardMaterial({
			color: 0x8B4513,
			roughness: 0.8,
			metalness: 0.1
		});
		const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
		baseMesh.position.y = -0.2;
		baseMesh.receiveShadow = true;
		this.boardGroup.add(baseMesh);

		// Add grid lines for base level
		const gridMaterial = new THREE.LineBasicMaterial({ color: 0x5a3a1a });
		const offset = this.getBaseOffset();

		for (let i = 0; i < this.baseGridSize; i++) {
			// Horizontal lines
			const hPoints = [
				new THREE.Vector3(-offset, 0.01, i * this.slotSpacing - offset),
				new THREE.Vector3((this.baseGridSize - 1) * this.slotSpacing - offset, 0.01, i * this.slotSpacing - offset)
			];
			const hGeometry = new THREE.BufferGeometry().setFromPoints(hPoints);
			const hLine = new THREE.Line(hGeometry, gridMaterial);
			this.boardGroup.add(hLine);

			// Vertical lines
			const vPoints = [
				new THREE.Vector3(i * this.slotSpacing - offset, 0.01, -offset),
				new THREE.Vector3(i * this.slotSpacing - offset, 0.01, (this.baseGridSize - 1) * this.slotSpacing - offset)
			];
			const vGeometry = new THREE.BufferGeometry().setFromPoints(vPoints);
			const vLine = new THREE.Line(vGeometry, gridMaterial);
			this.boardGroup.add(vLine);
		}
	}

	getBaseOffset() {
		return (this.baseGridSize - 1) * this.slotSpacing / 2;
	}

	/**
	 * Get world position for a grid position at a given level
	 * Higher levels are offset by 0.5 spacing units
	 */
	getWorldPosition(x, y, z) {
		const baseOffset = this.getBaseOffset();
		// Each level is offset by 0.5 grid units
		const levelOffset = z * 0.5 * this.slotSpacing;

		return {
			worldX: x * this.slotSpacing - baseOffset + levelOffset,
			worldY: z * this.levelHeight + this.cubeSize * 0.5,
			worldZ: y * this.slotSpacing - baseOffset + levelOffset
		};
	}

	createSlotMesh(x, y, z) {
		// Use different geometries/colors for different levels
		const slotGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 6);
		const levelColors = [0x4a3520, 0x5a4530, 0x6a5540, 0x7a6550, 0x8a7560];
		const slotMaterial = new THREE.MeshStandardMaterial({
			color: levelColors[z] || 0x4a3520,
			roughness: 0.9,
			transparent: true,
			opacity: 0.8
		});

		const slot = new THREE.Mesh(slotGeometry, slotMaterial);
		const pos = this.getWorldPosition(x, y, z);

		// Position slightly above the cube level
		slot.position.set(pos.worldX, pos.worldY - this.cubeSize * 0.4, pos.worldZ);
		slot.userData = { x, y, z, type: 'slot' };

		return slot;
	}

	createCubeMesh(cube) {
		const size = this.cubeSize;

		// Create cube geometry - rotated to sit on corner
		const geometry = new THREE.BoxGeometry(size, size, size);

		// Create materials for each face
		const whiteMat = new THREE.MeshStandardMaterial({
			color: 0xf5f5f5,
			roughness: 0.3,
			metalness: 0.1
		});
		const blueMat = new THREE.MeshStandardMaterial({
			color: 0x1e3a5f,
			roughness: 0.3,
			metalness: 0.1
		});

		// Face order: +X, -X, +Y, -Y, +Z, -Z
		let materials;
		if (cube.owner === PLAYER.WHITE) {
			materials = [whiteMat, whiteMat, blueMat, blueMat, whiteMat, whiteMat];
		} else {
			materials = [blueMat, blueMat, whiteMat, whiteMat, blueMat, blueMat];
		}

		const mesh = new THREE.Mesh(geometry, materials);

		// Rotate to sit on corner
		mesh.rotation.x = Math.atan(1 / Math.sqrt(2));
		mesh.rotation.y = Math.PI / 4;

		mesh.castShadow = true;
		mesh.receiveShadow = true;

		return mesh;
	}

	setupEventListeners(container) {
		// Click/tap handler
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
					if (this.onSlotClick) {
						this.onSlotClick(slot.userData.x, slot.userData.y, slot.userData.z);
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

			// Reset all slot appearances
			for (const slot of this.slotMeshes) {
				if (!slot.userData.highlighted) {
					slot.material.opacity = 0.6;
					slot.scale.set(1, 1, 1);
				}
			}

			if (intersects.length > 0) {
				const slot = intersects[0].object;
				slot.material.opacity = 1.0;
				slot.scale.set(1.3, 1.3, 1.3);
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

		if (this.renderer && this.scene && this.camera) {
			this.renderer.render(this.scene, this.camera);
		}
	}

	actuate(board, winner, winningAngle, lastMove) {
		if (!this.initialized) return;

		this.currentBoard = board;

		// Clear existing cubes
		while (this.cubesGroup.children.length > 0) {
			this.cubesGroup.remove(this.cubesGroup.children[0]);
		}

		// Clear existing slots
		while (this.slotsGroup.children.length > 0) {
			this.slotsGroup.remove(this.slotsGroup.children[0]);
		}
		this.slotMeshes = [];

		// Clear highlights
		while (this.highlightGroup.children.length > 0) {
			this.highlightGroup.remove(this.highlightGroup.children[0]);
		}

		// Add cubes from board state
		const cubes = board.getAllCubes();
		for (const cube of cubes) {
			const mesh = this.createCubeMesh(cube);
			const pos = this.getWorldPosition(cube.x, cube.y, cube.z);

			mesh.position.set(pos.worldX, pos.worldY, pos.worldZ);
			this.cubesGroup.add(mesh);
		}

		// Create slot markers for all possible moves
		const possibleMoves = board.getPossibleMoves();
		for (const move of possibleMoves) {
			const slot = this.createSlotMesh(move.x, move.y, move.z);
			this.slotsGroup.add(slot);
			this.slotMeshes.push(slot);
		}

		// Highlight last move
		if (lastMove) {
			this.highlightPosition(lastMove.x, lastMove.y, lastMove.z, 0x44ff44);
		}

		// Highlight winning line if game is won
		if (winner && winningAngle !== null) {
			this.highlightWinningLine(board, winningAngle);
		}
	}

	highlightPosition(x, y, z, color) {
		const pos = this.getWorldPosition(x, y, z);

		const geometry = new THREE.RingGeometry(0.35, 0.45, 32);
		const material = new THREE.MeshBasicMaterial({
			color: color,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.8
		});
		const ring = new THREE.Mesh(geometry, material);
		ring.rotation.x = -Math.PI / 2;
		ring.position.set(pos.worldX, pos.worldY - this.cubeSize * 0.35, pos.worldZ);
		this.highlightGroup.add(ring);
	}

	highlightWinningLine(board, winningAngle) {
		const projection = board.getProjection(winningAngle);
		const directions = [
			{ dx: 1, dy: 0 },
			{ dx: 0, dy: 1 },
			{ dx: 1, dy: 1 },
			{ dx: 1, dy: -1 }
		];

		for (let x = 0; x < this.baseGridSize; x++) {
			for (let y = 0; y < this.baseGridSize; y++) {
				const color = projection[x][y];
				if (!color) continue;

				for (const dir of directions) {
					const line = this.getWinningLine(projection, x, y, dir.dx, dir.dy, color);
					if (line) {
						for (const pos of line) {
							// Find the actual cube at this position to get its z
							const cube = this.findTopCubeAt(pos.x, pos.y);
							const z = cube ? cube.z : 0;
							this.highlightPosition(pos.x, pos.y, z, 0xffff00);
						}
						return;
					}
				}
			}
		}
	}

	findTopCubeAt(x, y) {
		if (!this.currentBoard) return null;

		// Find the highest cube at this x,y projection
		// Since cubes at higher levels are offset, we need to check differently
		// For now, check if there's a cube at the base level
		for (let z = this.maxHeight - 1; z >= 0; z--) {
			const cube = this.currentBoard.getCubeAt(x, y, z);
			if (cube) return cube;
		}
		return null;
	}

	getWinningLine(projection, startX, startY, dx, dy, color) {
		const line = [];
		let x = startX;
		let y = startY;

		while (x >= 0 && x < this.baseGridSize && y >= 0 && y < this.baseGridSize) {
			if (projection[x][y] === color) {
				line.push({ x, y });
				if (line.length >= 4) {
					return line;
				}
			} else {
				break;
			}
			x += dx;
			y += dy;
		}

		return null;
	}

	showPossibleMoves(moves) {
		for (const slot of this.slotMeshes) {
			const isMatch = moves.some(m =>
				m.x === slot.userData.x &&
				m.y === slot.userData.y &&
				m.z === slot.userData.z
			);
			if (isMatch) {
				slot.userData.highlighted = true;
				slot.material.color.setHex(0x00aa00);
				slot.material.opacity = 1.0;
			}
		}
	}

	clearPossibleMoves() {
		for (const slot of this.slotMeshes) {
			slot.userData.highlighted = false;
			slot.material.opacity = 0.6;
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
}
