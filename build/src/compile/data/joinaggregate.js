"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinAggregateTransformNode = void 0;
const channeldef_1 = require("../../channeldef");
const util_1 = require("../../util");
const util_2 = require("../../util");
const dataflow_1 = require("./dataflow");
/**
 * A class for the join aggregate transform nodes.
 */
class JoinAggregateTransformNode extends dataflow_1.DataFlowNode {
    constructor(parent, transform) {
        super(parent);
        this.transform = transform;
    }
    clone() {
        return new JoinAggregateTransformNode(null, util_1.duplicate(this.transform));
    }
    addDimensions(fields) {
        this.transform.groupby = util_2.unique(this.transform.groupby.concat(fields), d => d);
    }
    dependentFields() {
        const out = new Set();
        if (this.transform.groupby) {
            this.transform.groupby.forEach(out.add, out);
        }
        this.transform.joinaggregate
            .map(w => w.field)
            .filter(f => f !== undefined)
            .forEach(out.add, out);
        return out;
    }
    producedFields() {
        return new Set(this.transform.joinaggregate.map(this.getDefaultName));
    }
    getDefaultName(joinAggregateFieldDef) {
        var _a;
        return (_a = joinAggregateFieldDef.as) !== null && _a !== void 0 ? _a : channeldef_1.vgField(joinAggregateFieldDef);
    }
    hash() {
        return `JoinAggregateTransform ${util_1.hash(this.transform)}`;
    }
    assemble() {
        const fields = [];
        const ops = [];
        const as = [];
        for (const joinaggregate of this.transform.joinaggregate) {
            ops.push(joinaggregate.op);
            as.push(this.getDefaultName(joinaggregate));
            fields.push(joinaggregate.field === undefined ? null : joinaggregate.field);
        }
        const groupby = this.transform.groupby;
        return Object.assign({ type: 'joinaggregate', as,
            ops,
            fields }, (groupby !== undefined ? { groupby } : {}));
    }
}
exports.JoinAggregateTransformNode = JoinAggregateTransformNode;
//# sourceMappingURL=joinaggregate.js.map