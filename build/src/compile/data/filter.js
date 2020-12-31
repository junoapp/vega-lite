"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterNode = void 0;
const util_1 = require("../../util");
const predicate_1 = require("../predicate");
const dataflow_1 = require("./dataflow");
const expressions_1 = require("./expressions");
class FilterNode extends dataflow_1.DataFlowNode {
    constructor(parent, model, filter) {
        super(parent);
        this.model = model;
        this.filter = filter;
        // TODO: refactor this to not take a node and
        // then add a static function makeFromOperand and make the constructor take only an expression
        this.expr = predicate_1.expression(this.model, this.filter, this);
        this._dependentFields = expressions_1.getDependentFields(this.expr);
    }
    clone() {
        return new FilterNode(null, this.model, util_1.duplicate(this.filter));
    }
    dependentFields() {
        return this._dependentFields;
    }
    producedFields() {
        return new Set(); // filter does not produce any new fields
    }
    assemble() {
        return {
            type: 'filter',
            expr: this.expr
        };
    }
    hash() {
        return `Filter ${this.expr}`;
    }
}
exports.FilterNode = FilterNode;
//# sourceMappingURL=filter.js.map