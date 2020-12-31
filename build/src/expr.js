"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceExprRef = exports.isExprRef = void 0;
const common_1 = require("./compile/common");
const util_1 = require("./util");
function isExprRef(o) {
    return o && !!o['expr'];
}
exports.isExprRef = isExprRef;
function replaceExprRef(index) {
    const props = util_1.keys(index || {});
    const newIndex = {};
    for (const prop of props) {
        newIndex[prop] = common_1.signalRefOrValue(index[prop]);
    }
    return newIndex;
}
exports.replaceExprRef = replaceExprRef;
//# sourceMappingURL=expr.js.map