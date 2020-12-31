"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortArrayIndexField = exports.CalculateNode = void 0;
const channeldef_1 = require("../../channeldef");
const predicate_1 = require("../../predicate");
const sort_1 = require("../../sort");
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
const expressions_1 = require("./expressions");
class CalculateNode extends dataflow_1.DataFlowNode {
    constructor(parent, transform) {
        super(parent);
        this.transform = transform;
        this._dependentFields = expressions_1.getDependentFields(this.transform.calculate);
    }
    clone() {
        return new CalculateNode(null, util_1.duplicate(this.transform));
    }
    static parseAllForSortIndex(parent, model) {
        // get all the encoding with sort fields from model
        model.forEachFieldDef((fieldDef, channel) => {
            if (!channeldef_1.isScaleFieldDef(fieldDef)) {
                return;
            }
            if (sort_1.isSortArray(fieldDef.sort)) {
                const { field, timeUnit } = fieldDef;
                const sort = fieldDef.sort;
                // generate `datum["a"] === val0 ? 0 : datum["a"] === val1 ? 1 : ... : n` via FieldEqualPredicate
                const calculate = sort
                    .map((sortValue, i) => {
                    return `${predicate_1.fieldFilterExpression({ field, timeUnit, equal: sortValue })} ? ${i} : `;
                })
                    .join('') + sort.length;
                parent = new CalculateNode(parent, {
                    calculate,
                    as: sortArrayIndexField(fieldDef, channel, { forAs: true })
                });
            }
        });
        return parent;
    }
    producedFields() {
        return new Set([this.transform.as]);
    }
    dependentFields() {
        return this._dependentFields;
    }
    assemble() {
        return {
            type: 'formula',
            expr: this.transform.calculate,
            as: this.transform.as
        };
    }
    hash() {
        return `Calculate ${util_1.hash(this.transform)}`;
    }
}
exports.CalculateNode = CalculateNode;
function sortArrayIndexField(fieldDef, channel, opt) {
    return channeldef_1.vgField(fieldDef, Object.assign({ prefix: channel, suffix: 'sort_index' }, (opt !== null && opt !== void 0 ? opt : {})));
}
exports.sortArrayIndexField = sortArrayIndexField;
//# sourceMappingURL=calculate.js.map