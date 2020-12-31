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
exports.initLayoutSize = void 0;
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const log = __importStar(require("../../log"));
const base_1 = require("../../spec/base");
function initLayoutSize({ encoding, size }) {
    for (const channel of channel_1.POSITION_SCALE_CHANNELS) {
        const sizeType = channel_1.getSizeChannel(channel);
        if (base_1.isStep(size[sizeType])) {
            if (channeldef_1.isContinuousFieldOrDatumDef(encoding[channel])) {
                delete size[sizeType];
                log.warn(log.message.stepDropped(sizeType));
            }
        }
    }
    return size;
}
exports.initLayoutSize = initLayoutSize;
//# sourceMappingURL=init.js.map