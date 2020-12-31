"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacetNode = void 0;
const vega_util_1 = require("vega-util");
const bin_1 = require("../../bin");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const log = __importStar(require("../../log"));
const scale_1 = require("../../scale");
const sort_1 = require("../../sort");
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const component_1 = require("../header/component");
const domain_1 = require("../scale/domain");
const calculate_1 = require("./calculate");
const dataflow_1 = require("./dataflow");
/**
 * A node that helps us track what fields we are faceting by.
 */
class FacetNode extends dataflow_1.DataFlowNode {
    /**
     * @param model The facet model.
     * @param name The name that this facet source will have.
     * @param data The source data for this facet data.
     */
    constructor(parent, model, name, data) {
        super(parent);
        this.model = model;
        this.name = name;
        this.data = data;
        for (const channel of channel_1.FACET_CHANNELS) {
            const fieldDef = model.facet[channel];
            if (fieldDef) {
                const { bin, sort } = fieldDef;
                this[channel] = Object.assign({ name: model.getName(`${channel}_domain`), fields: [channeldef_1.vgField(fieldDef), ...(bin_1.isBinning(bin) ? [channeldef_1.vgField(fieldDef, { binSuffix: 'end' })] : [])] }, (sort_1.isSortField(sort)
                    ? { sortField: sort }
                    : vega_util_1.isArray(sort)
                        ? { sortIndexField: calculate_1.sortArrayIndexField(fieldDef, channel) }
                        : {}));
            }
        }
        this.childModel = model.child;
    }
    hash() {
        let out = `Facet`;
        for (const channel of channel_1.FACET_CHANNELS) {
            if (this[channel]) {
                out += ` ${channel.charAt(0)}:${util_1.hash(this[channel])}`;
            }
        }
        return out;
    }
    get fields() {
        var _a;
        const f = [];
        for (const channel of channel_1.FACET_CHANNELS) {
            if ((_a = this[channel]) === null || _a === void 0 ? void 0 : _a.fields) {
                f.push(...this[channel].fields);
            }
        }
        return f;
    }
    dependentFields() {
        const depFields = new Set(this.fields);
        for (const channel of channel_1.FACET_CHANNELS) {
            if (this[channel]) {
                if (this[channel].sortField) {
                    depFields.add(this[channel].sortField.field);
                }
                if (this[channel].sortIndexField) {
                    depFields.add(this[channel].sortIndexField);
                }
            }
        }
        return depFields;
    }
    producedFields() {
        return new Set(); // facet does not produce any new fields
    }
    /**
     * The name to reference this source is its name.
     */
    getSource() {
        return this.name;
    }
    getChildIndependentFieldsWithStep() {
        const childIndependentFieldsWithStep = {};
        for (const channel of channel_1.POSITION_SCALE_CHANNELS) {
            const childScaleComponent = this.childModel.component.scales[channel];
            if (childScaleComponent && !childScaleComponent.merged) {
                // independent scale
                const type = childScaleComponent.get('type');
                const range = childScaleComponent.get('range');
                if (scale_1.hasDiscreteDomain(type) && vega_schema_1.isVgRangeStep(range)) {
                    const domain = domain_1.assembleDomain(this.childModel, channel);
                    const field = domain_1.getFieldFromDomain(domain);
                    if (field) {
                        childIndependentFieldsWithStep[channel] = field;
                    }
                    else {
                        log.warn(log.message.unknownField(channel));
                    }
                }
            }
        }
        return childIndependentFieldsWithStep;
    }
    assembleRowColumnHeaderData(channel, crossedDataName, childIndependentFieldsWithStep) {
        const childChannel = { row: 'y', column: 'x' }[channel];
        const fields = [];
        const ops = [];
        const as = [];
        if (childIndependentFieldsWithStep && childIndependentFieldsWithStep[childChannel]) {
            if (crossedDataName) {
                // If there is a crossed data, calculate max
                fields.push(`distinct_${childIndependentFieldsWithStep[childChannel]}`);
                ops.push('max');
            }
            else {
                // If there is no crossed data, just calculate distinct
                fields.push(childIndependentFieldsWithStep[childChannel]);
                ops.push('distinct');
            }
            // Although it is technically a max, just name it distinct so it's easier to refer to it
            as.push(`distinct_${childIndependentFieldsWithStep[childChannel]}`);
        }
        const { sortField, sortIndexField } = this[channel];
        if (sortField) {
            const { op = sort_1.DEFAULT_SORT_OP, field } = sortField;
            fields.push(field);
            ops.push(op);
            as.push(channeldef_1.vgField(sortField, { forAs: true }));
        }
        else if (sortIndexField) {
            fields.push(sortIndexField);
            ops.push('max');
            as.push(sortIndexField);
        }
        return {
            name: this[channel].name,
            // Use data from the crossed one if it exist
            source: crossedDataName !== null && crossedDataName !== void 0 ? crossedDataName : this.data,
            transform: [
                Object.assign({ type: 'aggregate', groupby: this[channel].fields }, (fields.length
                    ? {
                        fields,
                        ops,
                        as
                    }
                    : {}))
            ]
        };
    }
    assembleFacetHeaderData(childIndependentFieldsWithStep) {
        var _a, _b;
        const { columns } = this.model.layout;
        const { layoutHeaders } = this.model.component;
        const data = [];
        const hasSharedAxis = {};
        for (const headerChannel of component_1.HEADER_CHANNELS) {
            for (const headerType of component_1.HEADER_TYPES) {
                const headers = (_a = (layoutHeaders[headerChannel] && layoutHeaders[headerChannel][headerType])) !== null && _a !== void 0 ? _a : [];
                for (const header of headers) {
                    if (((_b = header.axes) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                        hasSharedAxis[headerChannel] = true;
                        break;
                    }
                }
            }
            if (hasSharedAxis[headerChannel]) {
                const cardinality = `length(data("${this.facet.name}"))`;
                const stop = headerChannel === 'row'
                    ? columns
                        ? { signal: `ceil(${cardinality} / ${columns})` }
                        : 1
                    : columns
                        ? { signal: `min(${cardinality}, ${columns})` }
                        : { signal: cardinality };
                data.push({
                    name: `${this.facet.name}_${headerChannel}`,
                    transform: [
                        {
                            type: 'sequence',
                            start: 0,
                            stop
                        }
                    ]
                });
            }
        }
        const { row, column } = hasSharedAxis;
        if (row || column) {
            data.unshift(this.assembleRowColumnHeaderData('facet', null, childIndependentFieldsWithStep));
        }
        return data;
    }
    assemble() {
        var _a, _b;
        const data = [];
        let crossedDataName = null;
        const childIndependentFieldsWithStep = this.getChildIndependentFieldsWithStep();
        const { column, row, facet } = this;
        if (column && row && (childIndependentFieldsWithStep.x || childIndependentFieldsWithStep.y)) {
            // Need to create a cross dataset to correctly calculate cardinality
            crossedDataName = `cross_${this.column.name}_${this.row.name}`;
            const fields = [].concat((_a = childIndependentFieldsWithStep.x) !== null && _a !== void 0 ? _a : [], (_b = childIndependentFieldsWithStep.y) !== null && _b !== void 0 ? _b : []);
            const ops = fields.map(() => 'distinct');
            data.push({
                name: crossedDataName,
                source: this.data,
                transform: [
                    {
                        type: 'aggregate',
                        groupby: this.fields,
                        fields,
                        ops
                    }
                ]
            });
        }
        for (const channel of [channel_1.COLUMN, channel_1.ROW]) {
            if (this[channel]) {
                data.push(this.assembleRowColumnHeaderData(channel, crossedDataName, childIndependentFieldsWithStep));
            }
        }
        if (facet) {
            const facetData = this.assembleFacetHeaderData(childIndependentFieldsWithStep);
            if (facetData) {
                data.push(...facetData);
            }
        }
        return data;
    }
}
exports.FacetNode = FacetNode;
//# sourceMappingURL=facet.js.map