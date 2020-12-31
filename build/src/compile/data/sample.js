"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleTransformNode = void 0;
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
/**
 * A class for the sample transform nodes
 */
class SampleTransformNode extends dataflow_1.DataFlowNode {
    constructor(parent, transform) {
        super(parent);
        this.transform = transform;
    }
    clone() {
        return new SampleTransformNode(null, util_1.duplicate(this.transform));
    }
    dependentFields() {
        return new Set();
    }
    producedFields() {
        return new Set();
    }
    hash() {
        return `SampleTransform ${util_1.hash(this.transform)}`;
    }
    assemble() {
        return {
            type: 'sample',
            size: this.transform.sample
        };
    }
}
exports.SampleTransformNode = SampleTransformNode;
//# sourceMappingURL=sample.js.map