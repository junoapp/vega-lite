"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifierNode = void 0;
const selection_1 = require("../../selection");
const dataflow_1 = require("./dataflow");
class IdentifierNode extends dataflow_1.DataFlowNode {
    clone() {
        return new IdentifierNode(null);
    }
    constructor(parent) {
        super(parent);
    }
    dependentFields() {
        return new Set();
    }
    producedFields() {
        return new Set([selection_1.SELECTION_ID]);
    }
    hash() {
        return 'Identifier';
    }
    assemble() {
        return { type: 'identifier', as: selection_1.SELECTION_ID };
    }
}
exports.IdentifierNode = IdentifierNode;
//# sourceMappingURL=identifier.js.map