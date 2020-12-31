"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zindex = void 0;
const channeldef_1 = require("../../../channeldef");
const mark_1 = require("../../../mark");
const common_1 = require("../../common");
const conditional_1 = require("./conditional");
function zindex(model) {
    const { encoding, mark } = model;
    const order = encoding.order;
    if (!mark_1.isPathMark(mark) && channeldef_1.isValueDef(order)) {
        return conditional_1.wrapCondition(model, order, 'zindex', cd => common_1.signalOrValueRef(cd.value));
    }
    return {};
}
exports.zindex = zindex;
//# sourceMappingURL=zindex.js.map