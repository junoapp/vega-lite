"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTopLevelProperties = exports.getFitType = exports.isFitType = void 0;
const channel_1 = require("../channel");
const common_1 = require("../compile/common");
function isFitType(autoSizeType) {
    return autoSizeType === 'fit' || autoSizeType === 'fit-x' || autoSizeType === 'fit-y';
}
exports.isFitType = isFitType;
function getFitType(sizeType) {
    return sizeType ? `fit-${channel_1.getPositionScaleChannel(sizeType)}` : 'fit';
}
exports.getFitType = getFitType;
const TOP_LEVEL_PROPERTIES = [
    'background',
    'padding'
    // We do not include "autosize" here as it is supported by only unit and layer specs and thus need to be normalized
];
function extractTopLevelProperties(t, includeParams) {
    const o = {};
    for (const p of TOP_LEVEL_PROPERTIES) {
        if (t && t[p] !== undefined) {
            o[p] = common_1.signalRefOrValue(t[p]);
        }
    }
    if (includeParams) {
        o.params = t.params;
    }
    return o;
}
exports.extractTopLevelProperties = extractTopLevelProperties;
//# sourceMappingURL=toplevel.js.map