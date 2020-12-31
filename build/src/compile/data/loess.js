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
exports.LoessTransformNode = void 0;
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
/**
 * A class for loess transform nodes
 */
class LoessTransformNode extends dataflow_1.DataFlowNode {
    constructor(parent, transform) {
        var _a, _b, _c;
        super(parent);
        this.transform = transform;
        this.transform = util_1.duplicate(transform); // duplicate to prevent side effects
        const specifiedAs = (_a = this.transform.as) !== null && _a !== void 0 ? _a : [undefined, undefined];
        this.transform.as = [(_b = specifiedAs[0]) !== null && _b !== void 0 ? _b : transform.on, (_c = specifiedAs[1]) !== null && _c !== void 0 ? _c : transform.loess];
    }
    clone() {
        return new LoessTransformNode(null, util_1.duplicate(this.transform));
    }
    dependentFields() {
        var _a;
        return new Set([this.transform.loess, this.transform.on, ...((_a = this.transform.groupby) !== null && _a !== void 0 ? _a : [])]);
    }
    producedFields() {
        return new Set(this.transform.as);
    }
    hash() {
        return `LoessTransform ${util_1.hash(this.transform)}`;
    }
    assemble() {
        const _a = this.transform, { loess, on } = _a, rest = __rest(_a, ["loess", "on"]);
        const result = Object.assign({ type: 'loess', x: on, y: loess }, rest);
        return result;
    }
}
exports.LoessTransformNode = LoessTransformNode;
//# sourceMappingURL=loess.js.map