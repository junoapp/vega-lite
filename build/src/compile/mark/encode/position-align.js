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
exports.vgAlignedPositionChannel = void 0;
const channel_1 = require("../../../channel");
const log = __importStar(require("../../../log"));
const vega_schema_1 = require("../../../vega.schema");
const common_1 = require("../../common");
const ALIGNED_X_CHANNEL = {
    left: 'x',
    center: 'xc',
    right: 'x2'
};
const BASELINED_Y_CHANNEL = {
    top: 'y',
    middle: 'yc',
    bottom: 'y2'
};
function vgAlignedPositionChannel(channel, markDef, config, defaultAlign = 'middle') {
    if (channel === 'radius' || channel === 'theta') {
        return channel_1.getVgPositionChannel(channel);
    }
    const alignChannel = channel === 'x' ? 'align' : 'baseline';
    const align = common_1.getMarkPropOrConfig(alignChannel, markDef, config);
    let alignExcludingSignal;
    if (vega_schema_1.isSignalRef(align)) {
        log.warn(log.message.rangeMarkAlignmentCannotBeExpression(alignChannel));
        alignExcludingSignal = undefined;
    }
    else {
        alignExcludingSignal = align;
    }
    if (channel === 'x') {
        return ALIGNED_X_CHANNEL[alignExcludingSignal || (defaultAlign === 'top' ? 'left' : 'center')];
    }
    else {
        return BASELINED_Y_CHANNEL[alignExcludingSignal || defaultAlign];
    }
}
exports.vgAlignedPositionChannel = vgAlignedPositionChannel;
//# sourceMappingURL=position-align.js.map