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
exports.AggregateNode = void 0;
const aggregate_1 = require("../../aggregate");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const log = __importStar(require("../../log"));
const util_1 = require("../../util");
const model_1 = require("../model");
const dataflow_1 = require("./dataflow");
function addDimension(dims, channel, fieldDef, model) {
    const channelDef2 = model_1.isUnitModel(model) ? model.encoding[channel_1.getSecondaryRangeChannel(channel)] : undefined;
    if (channeldef_1.isTypedFieldDef(fieldDef) &&
        model_1.isUnitModel(model) &&
        channeldef_1.hasBand(channel, fieldDef, channelDef2, model.stack, model.markDef, model.config)) {
        dims.add(channeldef_1.vgField(fieldDef, {}));
        dims.add(channeldef_1.vgField(fieldDef, { suffix: 'end' }));
        if (fieldDef.bin && channeldef_1.binRequiresRange(fieldDef, channel)) {
            dims.add(channeldef_1.vgField(fieldDef, { binSuffix: 'range' }));
        }
    }
    else if (channel_1.isGeoPositionChannel(channel)) {
        const posChannel = channel_1.getPositionChannelFromLatLong(channel);
        dims.add(model.getName(posChannel));
    }
    else {
        dims.add(channeldef_1.vgField(fieldDef));
    }
    return dims;
}
function mergeMeasures(parentMeasures, childMeasures) {
    var _a;
    for (const field of util_1.keys(childMeasures)) {
        // when we merge a measure, we either have to add an aggregation operator or even a new field
        const ops = childMeasures[field];
        for (const op of util_1.keys(ops)) {
            if (field in parentMeasures) {
                // add operator to existing measure field
                parentMeasures[field][op] = new Set([...((_a = parentMeasures[field][op]) !== null && _a !== void 0 ? _a : []), ...ops[op]]);
            }
            else {
                parentMeasures[field] = { [op]: ops[op] };
            }
        }
    }
}
class AggregateNode extends dataflow_1.DataFlowNode {
    /**
     * @param dimensions string set for dimensions
     * @param measures dictionary mapping field name => dict of aggregation functions and names to use
     */
    constructor(parent, dimensions, measures) {
        super(parent);
        this.dimensions = dimensions;
        this.measures = measures;
    }
    clone() {
        return new AggregateNode(null, new Set(this.dimensions), util_1.duplicate(this.measures));
    }
    get groupBy() {
        return this.dimensions;
    }
    static makeFromEncoding(parent, model) {
        let isAggregate = false;
        model.forEachFieldDef(fd => {
            if (fd.aggregate) {
                isAggregate = true;
            }
        });
        const meas = {};
        const dims = new Set();
        if (!isAggregate) {
            // no need to create this node if the model has no aggregation
            return null;
        }
        model.forEachFieldDef((fieldDef, channel) => {
            var _a, _b, _c, _d;
            const { aggregate, field } = fieldDef;
            if (aggregate) {
                if (aggregate === 'count') {
                    meas['*'] = (_a = meas['*']) !== null && _a !== void 0 ? _a : {};
                    meas['*']['count'] = new Set([channeldef_1.vgField(fieldDef, { forAs: true })]);
                }
                else {
                    if (aggregate_1.isArgminDef(aggregate) || aggregate_1.isArgmaxDef(aggregate)) {
                        const op = aggregate_1.isArgminDef(aggregate) ? 'argmin' : 'argmax';
                        const argField = aggregate[op];
                        meas[argField] = (_b = meas[argField]) !== null && _b !== void 0 ? _b : {};
                        meas[argField][op] = new Set([channeldef_1.vgField({ op, field: argField }, { forAs: true })]);
                    }
                    else {
                        meas[field] = (_c = meas[field]) !== null && _c !== void 0 ? _c : {};
                        meas[field][aggregate] = new Set([channeldef_1.vgField(fieldDef, { forAs: true })]);
                    }
                    // For scale channel with domain === 'unaggregated', add min/max so we can use their union as unaggregated domain
                    if (channel_1.isScaleChannel(channel) && model.scaleDomain(channel) === 'unaggregated') {
                        meas[field] = (_d = meas[field]) !== null && _d !== void 0 ? _d : {};
                        meas[field]['min'] = new Set([channeldef_1.vgField({ field, aggregate: 'min' }, { forAs: true })]);
                        meas[field]['max'] = new Set([channeldef_1.vgField({ field, aggregate: 'max' }, { forAs: true })]);
                    }
                }
            }
            else {
                addDimension(dims, channel, fieldDef, model);
            }
        });
        if (dims.size + util_1.keys(meas).length === 0) {
            return null;
        }
        return new AggregateNode(parent, dims, meas);
    }
    static makeFromTransform(parent, t) {
        var _a, _b, _c;
        const dims = new Set();
        const meas = {};
        for (const s of t.aggregate) {
            const { op, field, as } = s;
            if (op) {
                if (op === 'count') {
                    meas['*'] = (_a = meas['*']) !== null && _a !== void 0 ? _a : {};
                    meas['*']['count'] = new Set([as ? as : channeldef_1.vgField(s, { forAs: true })]);
                }
                else {
                    meas[field] = (_b = meas[field]) !== null && _b !== void 0 ? _b : {};
                    meas[field][op] = new Set([as ? as : channeldef_1.vgField(s, { forAs: true })]);
                }
            }
        }
        for (const s of (_c = t.groupby) !== null && _c !== void 0 ? _c : []) {
            dims.add(s);
        }
        if (dims.size + util_1.keys(meas).length === 0) {
            return null;
        }
        return new AggregateNode(parent, dims, meas);
    }
    merge(other) {
        if (util_1.setEqual(this.dimensions, other.dimensions)) {
            mergeMeasures(this.measures, other.measures);
            return true;
        }
        else {
            log.debug('different dimensions, cannot merge');
            return false;
        }
    }
    addDimensions(fields) {
        fields.forEach(this.dimensions.add, this.dimensions);
    }
    dependentFields() {
        return new Set([...this.dimensions, ...util_1.keys(this.measures)]);
    }
    producedFields() {
        const out = new Set();
        for (const field of util_1.keys(this.measures)) {
            for (const op of util_1.keys(this.measures[field])) {
                const m = this.measures[field][op];
                if (m.size === 0) {
                    out.add(`${op}_${field}`);
                }
                else {
                    m.forEach(out.add, out);
                }
            }
        }
        return out;
    }
    hash() {
        return `Aggregate ${util_1.hash({ dimensions: this.dimensions, measures: this.measures })}`;
    }
    assemble() {
        const ops = [];
        const fields = [];
        const as = [];
        for (const field of util_1.keys(this.measures)) {
            for (const op of util_1.keys(this.measures[field])) {
                for (const alias of this.measures[field][op]) {
                    as.push(alias);
                    ops.push(op);
                    fields.push(field === '*' ? null : util_1.replacePathInField(field));
                }
            }
        }
        const result = {
            type: 'aggregate',
            groupby: [...this.dimensions].map(util_1.replacePathInField),
            ops,
            fields,
            as
        };
        return result;
    }
}
exports.AggregateNode = AggregateNode;
//# sourceMappingURL=aggregate.js.map