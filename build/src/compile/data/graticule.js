"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraticuleNode = void 0;
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
class GraticuleNode extends dataflow_1.DataFlowNode {
    constructor(parent, params) {
        super(parent);
        this.params = params;
    }
    clone() {
        return new GraticuleNode(null, this.params);
    }
    dependentFields() {
        return new Set();
    }
    producedFields() {
        return undefined; // there should never be a node before graticule
    }
    hash() {
        return `Graticule ${util_1.hash(this.params)}`;
    }
    assemble() {
        return Object.assign({ type: 'graticule' }, (this.params === true ? {} : this.params));
    }
}
exports.GraticuleNode = GraticuleNode;
//# sourceMappingURL=graticule.js.map