"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PivotTransformNode = void 0;
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
/**
 * A class for pivot transform nodes.
 */
class PivotTransformNode extends dataflow_1.DataFlowNode {
    constructor(parent, transform) {
        super(parent);
        this.transform = transform;
    }
    clone() {
        return new PivotTransformNode(null, util_1.duplicate(this.transform));
    }
    addDimensions(fields) {
        var _a;
        this.transform.groupby = util_1.unique(((_a = this.transform.groupby) !== null && _a !== void 0 ? _a : []).concat(fields), d => d);
    }
    producedFields() {
        return undefined; // return undefined so that potentially everything can depend on the pivot
    }
    dependentFields() {
        var _a;
        return new Set([this.transform.pivot, this.transform.value, ...((_a = this.transform.groupby) !== null && _a !== void 0 ? _a : [])]);
    }
    hash() {
        return `PivotTransform ${util_1.hash(this.transform)}`;
    }
    assemble() {
        const { pivot, value, groupby, limit, op } = this.transform;
        return Object.assign(Object.assign(Object.assign({ type: 'pivot', field: pivot, value }, (limit !== undefined ? { limit } : {})), (op !== undefined ? { op } : {})), (groupby !== undefined ? { groupby } : {}));
    }
}
exports.PivotTransformNode = PivotTransformNode;
//# sourceMappingURL=pivot.js.map