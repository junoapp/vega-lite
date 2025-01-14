"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleParameterSignals = void 0;
function assembleParameterSignals(params) {
    const signals = [];
    for (const param of params || []) {
        const { expr, bind } = param, rest = __rest(param, ["expr", "bind"]);
        if (bind && expr) {
            // Vega's InitSignal -- apply expr to "init"
            const signal = Object.assign(Object.assign({}, rest), { bind, init: expr });
            signals.push(signal);
        }
        else {
            const signal = Object.assign(Object.assign(Object.assign({}, rest), (expr ? { update: expr } : {})), (bind ? { bind } : {}));
            signals.push(signal);
        }
    }
    return signals;
}
exports.assembleParameterSignals = assembleParameterSignals;
//# sourceMappingURL=parameter.js.map