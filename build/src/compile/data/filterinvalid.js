"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterInvalidNode = void 0;
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const mark_1 = require("../../mark");
const scale_1 = require("../../scale");
const util_1 = require("../../util");
const common_1 = require("../common");
const dataflow_1 = require("./dataflow");
class FilterInvalidNode extends dataflow_1.DataFlowNode {
    constructor(parent, filter) {
        super(parent);
        this.filter = filter;
    }
    clone() {
        return new FilterInvalidNode(null, Object.assign({}, this.filter));
    }
    static make(parent, model) {
        const { config, mark, markDef } = model;
        const invalid = common_1.getMarkPropOrConfig('invalid', markDef, config);
        if (invalid !== 'filter') {
            return null;
        }
        const filter = model.reduceFieldDef((aggregator, fieldDef, channel) => {
            const scaleComponent = channel_1.isScaleChannel(channel) && model.getScaleComponent(channel);
            if (scaleComponent) {
                const scaleType = scaleComponent.get('type');
                // While discrete domain scales can handle invalid values, continuous scales can't.
                // Thus, for non-path marks, we have to filter null for scales with continuous domains.
                // (For path marks, we will use "defined" property and skip these values instead.)
                if (scale_1.hasContinuousDomain(scaleType) && fieldDef.aggregate !== 'count' && !mark_1.isPathMark(mark)) {
                    aggregator[fieldDef.field] = fieldDef; // we know that the fieldDef is a typed field def
                }
            }
            return aggregator;
        }, {});
        if (!util_1.keys(filter).length) {
            return null;
        }
        return new FilterInvalidNode(parent, filter);
    }
    dependentFields() {
        return new Set(util_1.keys(this.filter));
    }
    producedFields() {
        return new Set(); // filter does not produce any new fields
    }
    hash() {
        return `FilterInvalid ${util_1.hash(this.filter)}`;
    }
    /**
     * Create the VgTransforms for each of the filtered fields.
     */
    assemble() {
        const filters = util_1.keys(this.filter).reduce((vegaFilters, field) => {
            const fieldDef = this.filter[field];
            const ref = channeldef_1.vgField(fieldDef, { expr: 'datum' });
            if (fieldDef !== null) {
                if (fieldDef.type === 'temporal') {
                    vegaFilters.push(`(isDate(${ref}) || (isValid(${ref}) && isFinite(+${ref})))`);
                }
                else if (fieldDef.type === 'quantitative') {
                    vegaFilters.push(`isValid(${ref})`);
                    vegaFilters.push(`isFinite(+${ref})`);
                }
                else {
                    // should never get here
                }
            }
            return vegaFilters;
        }, []);
        return filters.length > 0
            ? {
                type: 'filter',
                expr: filters.join(' && ')
            }
            : null;
    }
}
exports.FilterInvalidNode = FilterInvalidNode;
//# sourceMappingURL=filterinvalid.js.map