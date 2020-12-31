"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffset = void 0;
const channel_1 = require("../../../channel");
function getOffset(channel, markDef) {
    const offsetChannel = channel_1.getOffsetChannel(channel);
    // TODO: in the future read from encoding channel too
    const markDefOffsetValue = markDef[offsetChannel];
    if (markDefOffsetValue) {
        return markDefOffsetValue;
    }
    return undefined;
}
exports.getOffset = getOffset;
//# sourceMappingURL=offset.js.map