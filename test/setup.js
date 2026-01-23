/**
 * Test setup file
 * Mocks DOM and global objects needed by the game
 */

import { vi } from 'vitest';

// Mock localStorage
globalThis.localStorage = {
	data: {},
	getItem(key) {
		return this.data[key] || null;
	},
	setItem(key, value) {
		this.data[key] = value;
	},
	removeItem(key) {
		delete this.data[key];
	},
	clear() {
		this.data = {};
	}
};

// Create a mock DOM element
function createMockElement(tagName) {
	return {
		tagName: tagName ? tagName.toUpperCase() : 'DIV',
		className: '',
		classList: {
			add: vi.fn(),
			remove: vi.fn(),
			contains: vi.fn(() => false),
			toggle: vi.fn()
		},
		style: {},
		appendChild: vi.fn(),
		removeChild: vi.fn(),
		setAttribute: vi.fn(),
		getAttribute: vi.fn(() => null),
		innerHTML: '',
		textContent: '',
		children: [],
		childNodes: [],
		href: '',
		value: '',
		checked: false,
		disabled: false,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		click: vi.fn(),
		focus: vi.fn(),
		blur: vi.fn()
	};
}

// Mock document
globalThis.document = {
	getElementById: vi.fn((id) => {
		// Return null for most elements to avoid side effects
		return null;
	}),
	createElement: vi.fn((tag) => createMockElement(tag)),
	createElementNS: vi.fn((ns, tag) => createMockElement(tag)),
	createTextNode: vi.fn((text) => ({
		nodeType: 3,
		textContent: text,
		data: text
	})),
	querySelectorAll: vi.fn(() => []),
	querySelector: vi.fn(() => null),
	body: createMockElement('BODY'),
	head: createMockElement('HEAD')
};

// Mock window
globalThis.window = {
	localStorage: globalThis.localStorage,
	document: globalThis.document,
	location: {
		href: 'http://localhost',
		search: '',
		pathname: '/',
		reload: vi.fn()
	},
	navigator: {
		userAgent: 'Mozilla/5.0 (Test) AppleWebKit/537.36',
		vendor: 'Test',
		platform: 'Test'
	},
	chrome: {},
	opr: undefined,
	requestAnimationFrame: vi.fn((cb) => {
		// Don't actually call the callback - tests will explicitly initialize what they need
		return 0;
	}),
	cancelAnimationFrame: vi.fn(),
	alert: vi.fn(),
	confirm: vi.fn(() => true),
	prompt: vi.fn()
};

// Mock Option for color validation
globalThis.Option = function() {
	return createMockElement('OPTION');
};

// Mock Notification
globalThis.Notification = {
	permission: 'default',
	requestPermission: vi.fn(() => Promise.resolve('granted'))
};

// Stub console methods to reduce noise in tests
globalThis.console = {
	...console,
	log: vi.fn(),
	debug: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
	error: console.error // Keep errors visible
};
