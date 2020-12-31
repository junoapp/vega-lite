"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequenceNode = void 0;
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
class SequenceNode extends dataflow_1.DataFlowNode {
    constructor(parent, params) {
        super(parent);
        this.params = params;
    }
    clone() {
        return new SequenceNode(null, this.params);
    }
    dependentFields() {
        return new Set();
    }
    producedFields() {
        var _a;
        return new Set([(_a = this.params.as) !== null && _a !== void 0 ? _a : 'data']);
    }
    hash() {
        return `Hash ${util_1.hash(this.params)}`;
    }
    assemble() {
        return Object.assign({ type: 'sequence' }, this.params);
    }
}
exports.SequenceNode = SequenceNode;
//# sourceMappingURL=sequence.js.map