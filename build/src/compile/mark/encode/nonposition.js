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
exports.nonPosition = void 0;
const common_1 = require("../../common");
const conditional_1 = require("./conditional");
const ref = __importStar(require("./valueref"));
/**
 * Return encode for non-positional channels with scales. (Text doesn't have scale.)
 */
function nonPosition(channel, model, opt = {}) {
    const { markDef, encoding, config } = model;
    const { vgChannel } = opt;
    let { defaultRef, defaultValue } = opt;
    if (defaultRef === undefined) {
        // prettier-ignore
        defaultValue = defaultValue !== null && defaultValue !== void 0 ? defaultValue : common_1.getMarkPropOrConfig(channel, markDef, config, { vgChannel, ignoreVgConfig: true });
        if (defaultValue !== undefined) {
            defaultRef = common_1.signalOrValueRef(defaultValue);
        }
    }
    const channelDef = encoding[channel];
    return conditional_1.wrapCondition(model, channelDef, vgChannel !== null && vgChannel !== void 0 ? vgChannel : channel, cDef => {
        return ref.midPoint({
            channel,
            channelDef: cDef,
            markDef,
            config,
            scaleName: model.scaleName(channel),
            scale: model.getScaleComponent(channel),
            stack: null,
            defaultRef
        });
    });
}
exports.nonPosition = nonPosition;
//# sourceMappingURL=nonposition.js.map