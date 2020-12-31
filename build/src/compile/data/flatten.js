"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlattenTransformNode = void 0;
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
/**
 * A class for flatten transform nodes
 */
class FlattenTransformNode extends dataflow_1.DataFlowNode {
    constructor(parent, transform) {
        super(parent);
        this.transform = transform;
        this.transform = util_1.duplicate(transform); // duplicate to prevent side effects
        const { flatten, as = [] } = this.transform;
        this.transform.as = flatten.map((f, i) => { var _a; return (_a = as[i]) !== null && _a !== void 0 ? _a : f; });
    }
    clone() {
        return new FlattenTransformNode(this.parent, util_1.duplicate(this.transform));
    }
    dependentFields() {
        return new Set(this.transform.flatten);
    }
    producedFields() {
        return new Set(this.transform.as);
    }
    hash() {
        return `FlattenTransform ${util_1.hash(this.transform)}`;
    }
    assemble() {
        const { flatten: fields, as } = this.transform;
        const result = {
            type: 'flatten',
            fields,
            as
        };
        return result;
    }
}
exports.FlattenTransformNode = FlattenTransformNode;
//# sourceMappingURL=flatten.js.map