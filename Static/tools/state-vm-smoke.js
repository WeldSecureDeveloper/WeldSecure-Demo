#!/usr/bin/env node
/**
 * Lightweight VM smoke test to ensure WeldState.initialState() works without a browser DOM.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");
const scripts = [
  "data.js",
  "data/state/defaults.js",
  "data/state/defaultState.js",
  "state.js"
];

function loadScript(filename, context) {
  const fullPath = path.join(projectRoot, filename);
  const code = fs.readFileSync(fullPath, "utf8");
  vm.runInContext(code, context, { filename });
}

function createLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(String(key)) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    }
  };
}

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Date,
  Math,
  performance: {
    now() {
      return Date.now();
    }
  }
};

sandbox.window = sandbox;
sandbox.document = {
  createElement() {
    return {};
  }
};
sandbox.localStorage = createLocalStorage();
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.WeldUtil = {
  generateId(prefix = "id") {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }
};

vm.createContext(sandbox);

scripts.forEach(script => loadScript(script, sandbox));

if (!sandbox.window.WeldState || typeof sandbox.window.WeldState.initialState !== "function") {
  throw new Error("WeldState.initialState is not defined.");
}

const initialState = sandbox.window.WeldState.initialState();
if (!initialState || typeof initialState !== "object") {
  throw new Error("WeldState.initialState() did not return an object.");
}

process.stdout.write("State VM smoke successful.\n");

