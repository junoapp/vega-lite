"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAutoSize = exports.normalize = void 0;
const vega_util_1 = require("vega-util");
const config_1 = require("../config");
const log = __importStar(require("../log"));
const spec_1 = require("../spec");
const util_1 = require("../util");
const core_1 = require("./core");
function normalize(spec, config) {
    if (config === undefined) {
        config = config_1.initConfig(spec.config);
    }
    const normalizedSpec = normalizeGenericSpec(spec, config);
    const { width, height } = spec;
    const autosize = normalizeAutoSize(normalizedSpec, { width, height, autosize: spec.autosize }, config);
    return Object.assign(Object.assign({}, normalizedSpec), (autosize ? { autosize } : {}));
}
exports.normalize = normalize;
const normalizer = new core_1.CoreNormalizer();
/**
 * Decompose extended unit specs into composition of pure unit specs.
 */
function normalizeGenericSpec(spec, config = {}) {
    return normalizer.map(spec, { config });
}
function _normalizeAutoSize(autosize) {
    return vega_util_1.isString(autosize) ? { type: autosize } : autosize !== null && autosize !== void 0 ? autosize : {};
}
/**
 * Normalize autosize and deal with width or height == "container".
 */
function normalizeAutoSize(spec, sizeInfo, config) {
    let { width, height } = sizeInfo;
    const isFitCompatible = spec_1.isUnitSpec(spec) || spec_1.isLayerSpec(spec);
    const autosizeDefault = {};
    if (!isFitCompatible) {
        // If spec is not compatible with autosize == "fit", discard width/height == container
        if (width == 'container') {
            log.warn(log.message.containerSizeNonSingle('width'));
            width = undefined;
        }
        if (height == 'container') {
            log.warn(log.message.containerSizeNonSingle('height'));
            height = undefined;
        }
    }
    else {
        // Default autosize parameters to fit when width/height is "container"
        if (width == 'container' && height == 'container') {
            autosizeDefault.type = 'fit';
            autosizeDefault.contains = 'padding';
        }
        else if (width == 'container') {
            autosizeDefault.type = 'fit-x';
            autosizeDefault.contains = 'padding';
        }
        else if (height == 'container') {
            autosizeDefault.type = 'fit-y';
            autosizeDefault.contains = 'padding';
        }
    }
    const autosize = Object.assign(Object.assign(Object.assign({ type: 'pad' }, autosizeDefault), (config ? _normalizeAutoSize(config.autosize) : {})), _normalizeAutoSize(spec.autosize));
    if (autosize.type === 'fit' && !isFitCompatible) {
        log.warn(log.message.FIT_NON_SINGLE);
        autosize.type = 'pad';
    }
    if (width == 'container' && !(autosize.type == 'fit' || autosize.type == 'fit-x')) {
        log.warn(log.message.containerSizeNotCompatibleWithAutosize('width'));
    }
    if (height == 'container' && !(autosize.type == 'fit' || autosize.type == 'fit-y')) {
        log.warn(log.message.containerSizeNotCompatibleWithAutosize('height'));
    }
    // Delete autosize property if it's Vega's default
    if (util_1.deepEqual(autosize, { type: 'pad' })) {
        return undefined;
    }
    return autosize;
}
exports.normalizeAutoSize = normalizeAutoSize;
//# sourceMappingURL=index.js.map