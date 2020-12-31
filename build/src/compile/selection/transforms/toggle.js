"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOGGLE = void 0;
const __1 = require("..");
exports.TOGGLE = '_toggle';
const toggle = {
    has: selCmpt => {
        return selCmpt.type === 'multi' && !!selCmpt.toggle;
    },
    signals: (model, selCmpt, signals) => {
        return signals.concat({
            name: selCmpt.name + exports.TOGGLE,
            value: false,
            on: [{ events: selCmpt.events, update: selCmpt.toggle }]
        });
    },
    modifyExpr: (model, selCmpt) => {
        const tpl = selCmpt.name + __1.TUPLE;
        const signal = selCmpt.name + exports.TOGGLE;
        return (`${signal} ? null : ${tpl}, ` +
            (selCmpt.resolve === 'global' ? `${signal} ? null : true, ` : `${signal} ? null : {unit: ${__1.unitName(model)}}, `) +
            `${signal} ? ${tpl} : null`);
    }
};
exports.default = toggle;
//# sourceMappingURL=toggle.js.map