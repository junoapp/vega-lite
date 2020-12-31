"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const multi_1 = require("./multi");
const single = {
    signals: multi_1.singleOrMultiSignals,
    modifyExpr: (model, selCmpt) => {
        const tpl = selCmpt.name + _1.TUPLE;
        return `${tpl}, ${selCmpt.resolve === 'global' ? 'true' : `{unit: ${_1.unitName(model)}}`}`;
    }
};
exports.default = single;
//# sourceMappingURL=single.js.map