"use strict";
/**
 * Vega-Lite's singleton logger utility.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _level;
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = exports.info = exports.warn = exports.error = exports.reset = exports.set = exports.wrap = exports.LocalLogger = exports.message = void 0;
const vega_util_1 = require("vega-util");
exports.message = __importStar(require("./message"));
/**
 * Main (default) Vega Logger instance for Vega-Lite.
 */
const main = vega_util_1.logger(vega_util_1.Warn);
let current = main;
/**
 * Logger tool for checking if the code throws correct warning.
 */
class LocalLogger {
    constructor() {
        this.warns = [];
        this.infos = [];
        this.debugs = [];
        _level.set(this, vega_util_1.Warn);
    }
    level(_) {
        if (_) {
            __classPrivateFieldSet(this, _level, _);
            return this;
        }
        return __classPrivateFieldGet(this, _level);
    }
    warn(...args) {
        if (__classPrivateFieldGet(this, _level) >= vega_util_1.Warn)
            this.warns.push(...args);
        return this;
    }
    info(...args) {
        if (__classPrivateFieldGet(this, _level) >= vega_util_1.Info)
            this.infos.push(...args);
        return this;
    }
    debug(...args) {
        if (__classPrivateFieldGet(this, _level) >= vega_util_1.Debug)
            this.debugs.push(...args);
        return this;
    }
    error(...args) {
        if (__classPrivateFieldGet(this, _level) >= vega_util_1.Error)
            throw Error(...args);
        return this;
    }
}
exports.LocalLogger = LocalLogger;
_level = new WeakMap();
function wrap(f) {
    return () => {
        current = new LocalLogger();
        f(current);
        reset();
    };
}
exports.wrap = wrap;
/**
 * Set the singleton logger to be a custom logger.
 */
function set(newLogger) {
    current = newLogger;
    return current;
}
exports.set = set;
/**
 * Reset the main logger to use the default Vega Logger.
 */
function reset() {
    current = main;
    return current;
}
exports.reset = reset;
function error(...args) {
    current.error(...args);
}
exports.error = error;
function warn(...args) {
    current.warn(...args);
}
exports.warn = warn;
function info(...args) {
    current.info(...args);
}
exports.info = info;
function debug(...args) {
    current.debug(...args);
}
exports.debug = debug;
//# sourceMappingURL=index.js.map