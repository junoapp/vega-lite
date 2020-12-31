"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackNode = void 0;
const vega_util_1 = require("vega-util");
const channeldef_1 = require("../../channeldef");
const util_1 = require("../../util");
const common_1 = require("../common");
const dataflow_1 = require("./dataflow");
function getStackByFields(model) {
    return model.stack.stackBy.reduce((fields, by) => {
        const fieldDef = by.fieldDef;
        const _field = channeldef_1.vgField(fieldDef);
        if (_field) {
            fields.push(_field);
        }
        return fields;
    }, []);
}
function isValidAsArray(as) {
    return vega_util_1.isArray(as) && as.every(s => vega_util_1.isString(s)) && as.length > 1;
}
class StackNode extends dataflow_1.DataFlowNode {
    constructor(parent, stack) {
        super(parent);
        this._stack = stack;
    }
    clone() {
        return new StackNode(null, util_1.duplicate(this._stack));
    }
    static makeFromTransform(parent, stackTransform) {
        const { stack, groupby, as, offset = 'zero' } = stackTransform;
        const sortFields = [];
        const sortOrder = [];
        if (stackTransform.sort !== undefined) {
            for (const sortField of stackTransform.sort) {
                sortFields.push(sortField.field);
                sortOrder.push(util_1.getFirstDefined(sortField.order, 'ascending'));
            }
        }
        const sort = {
            field: sortFields,
            order: sortOrder
        };
        let normalizedAs;
        if (isValidAsArray(as)) {
            normalizedAs = as;
        }
        else if (vega_util_1.isString(as)) {
            normalizedAs = [as, `${as}_end`];
        }
        else {
            normalizedAs = [`${stackTransform.stack}_start`, `${stackTransform.stack}_end`];
        }
        return new StackNode(parent, {
            stackField: stack,
            groupby,
            offset,
            sort,
            facetby: [],
            as: normalizedAs
        });
    }
    static makeFromEncoding(parent, model) {
        const stackProperties = model.stack;
        const { encoding } = model;
        if (!stackProperties) {
            return null;
        }
        const { groupbyChannel, fieldChannel, offset, impute } = stackProperties;
        let dimensionFieldDef;
        if (groupbyChannel) {
            const cDef = encoding[groupbyChannel];
            dimensionFieldDef = channeldef_1.getFieldDef(cDef); // Fair to cast as groupByChannel is always either x or y
        }
        const stackby = getStackByFields(model);
        const orderDef = model.encoding.order;
        let sort;
        if (vega_util_1.isArray(orderDef) || channeldef_1.isFieldDef(orderDef)) {
            sort = common_1.sortParams(orderDef);
        }
        else {
            // default = descending by stackFields
            // FIXME is the default here correct for binned fields?
            sort = stackby.reduce((s, field) => {
                s.field.push(field);
                s.order.push(fieldChannel === 'y' ? 'descending' : 'ascending');
                return s;
            }, { field: [], order: [] });
        }
        return new StackNode(parent, {
            dimensionFieldDef,
            stackField: model.vgField(fieldChannel),
            facetby: [],
            stackby,
            sort,
            offset,
            impute,
            as: [
                model.vgField(fieldChannel, { suffix: 'start', forAs: true }),
                model.vgField(fieldChannel, { suffix: 'end', forAs: true })
            ]
        });
    }
    get stack() {
        return this._stack;
    }
    addDimensions(fields) {
        this._stack.facetby.push(...fields);
    }
    dependentFields() {
        const out = new Set();
        out.add(this._stack.stackField);
        this.getGroupbyFields().forEach(out.add, out);
        this._stack.facetby.forEach(out.add, out);
        this._stack.sort.field.forEach(out.add, out);
        return out;
    }
    producedFields() {
        return new Set(this._stack.as);
    }
    hash() {
        return `Stack ${util_1.hash(this._stack)}`;
    }
    getGroupbyFields() {
        const { dimensionFieldDef, impute, groupby } = this._stack;
        if (dimensionFieldDef) {
            if (dimensionFieldDef.bin) {
                if (impute) {
                    // For binned group by field with impute, we calculate bin_mid
                    // as we cannot impute two fields simultaneously
                    return [channeldef_1.vgField(dimensionFieldDef, { binSuffix: 'mid' })];
                }
                return [
                    // For binned group by field without impute, we need both bin (start) and bin_end
                    channeldef_1.vgField(dimensionFieldDef, {}),
                    channeldef_1.vgField(dimensionFieldDef, { binSuffix: 'end' })
                ];
            }
            return [channeldef_1.vgField(dimensionFieldDef)];
        }
        return groupby !== null && groupby !== void 0 ? groupby : [];
    }
    assemble() {
        const transform = [];
        const { facetby, dimensionFieldDef, stackField: field, stackby, sort, offset, impute, as } = this._stack;
        // Impute
        if (impute && dimensionFieldDef) {
            const { band = 0.5, bin } = dimensionFieldDef;
            if (bin) {
                // As we can only impute one field at a time, we need to calculate
                // mid point for a binned field
                transform.push({
                    type: 'formula',
                    expr: `${band}*` +
                        channeldef_1.vgField(dimensionFieldDef, { expr: 'datum' }) +
                        `+${1 - band}*` +
                        channeldef_1.vgField(dimensionFieldDef, { expr: 'datum', binSuffix: 'end' }),
                    as: channeldef_1.vgField(dimensionFieldDef, { binSuffix: 'mid', forAs: true })
                });
            }
            transform.push({
                type: 'impute',
                field,
                groupby: [...stackby, ...facetby],
                key: channeldef_1.vgField(dimensionFieldDef, { binSuffix: 'mid' }),
                method: 'value',
                value: 0
            });
        }
        // Stack
        transform.push({
            type: 'stack',
            groupby: [...this.getGroupbyFields(), ...facetby],
            field,
            sort,
            as,
            offset
        });
        return transform;
    }
}
exports.StackNode = StackNode;
//# sourceMappingURL=stack.js.map