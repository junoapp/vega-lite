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
exports.UnitModel = void 0;
const vega_util_1 = require("vega-util");
const axis_1 = require("../axis");
const channel_1 = require("../channel");
const channeldef_1 = require("../channeldef");
const data_1 = require("../data");
const vlEncoding = __importStar(require("../encoding"));
const encoding_1 = require("../encoding");
const expr_1 = require("../expr");
const mark_1 = require("../mark");
const base_1 = require("../spec/base");
const stack_1 = require("../stack");
const util_1 = require("../util");
const assemble_1 = require("./axis/assemble");
const parse_1 = require("./axis/parse");
const common_1 = require("./common");
const parse_2 = require("./data/parse");
const assemble_2 = require("./layoutsize/assemble");
const init_1 = require("./layoutsize/init");
const parse_3 = require("./layoutsize/parse");
const init_2 = require("./mark/init");
const mark_2 = require("./mark/mark");
const model_1 = require("./model");
const assemble_3 = require("./selection/assemble");
const parse_4 = require("./selection/parse");
/**
 * Internal model of Vega-Lite specification for the compiler.
 */
class UnitModel extends model_1.ModelWithField {
    constructor(spec, parent, parentGivenName, parentGivenSize = {}, config) {
        super(spec, 'unit', parent, parentGivenName, config, undefined, base_1.isFrameMixins(spec) ? spec.view : undefined);
        this.specifiedScales = {};
        this.specifiedAxes = {};
        this.specifiedLegends = {};
        this.specifiedProjection = {};
        this.selection = {};
        this.children = [];
        const markDef = mark_1.isMarkDef(spec.mark) ? Object.assign({}, spec.mark) : { type: spec.mark };
        const mark = markDef.type;
        // Need to init filled before other mark properties because encoding depends on filled but other mark properties depend on types inside encoding
        if (markDef.filled === undefined) {
            markDef.filled = init_2.defaultFilled(markDef, config, {
                graticule: spec.data && data_1.isGraticuleGenerator(spec.data)
            });
        }
        const encoding = (this.encoding = encoding_1.initEncoding(spec.encoding || {}, mark, markDef.filled, config));
        this.markDef = init_2.initMarkdef(markDef, encoding, config);
        this.size = init_1.initLayoutSize({
            encoding: encoding,
            size: base_1.isFrameMixins(spec)
                ? Object.assign(Object.assign(Object.assign({}, parentGivenSize), (spec.width ? { width: spec.width } : {})), (spec.height ? { height: spec.height } : {})) : parentGivenSize
        });
        // calculate stack properties
        this.stack = stack_1.stack(mark, encoding);
        this.specifiedScales = this.initScales(mark, encoding);
        this.specifiedAxes = this.initAxes(encoding);
        this.specifiedLegends = this.initLegends(encoding);
        this.specifiedProjection = spec.projection;
        // Selections will be initialized upon parse.
        this.selection = spec.selection;
    }
    get hasProjection() {
        const { encoding } = this;
        const isGeoShapeMark = this.mark === mark_1.GEOSHAPE;
        const hasGeoPosition = encoding && channel_1.GEOPOSITION_CHANNELS.some(channel => channeldef_1.isFieldOrDatumDef(encoding[channel]));
        return isGeoShapeMark || hasGeoPosition;
    }
    /**
     * Return specified Vega-Lite scale domain for a particular channel
     * @param channel
     */
    scaleDomain(channel) {
        const scale = this.specifiedScales[channel];
        return scale ? scale.domain : undefined;
    }
    axis(channel) {
        return this.specifiedAxes[channel];
    }
    legend(channel) {
        return this.specifiedLegends[channel];
    }
    initScales(mark, encoding) {
        return channel_1.SCALE_CHANNELS.reduce((scales, channel) => {
            var _a;
            const fieldOrDatumDef = channeldef_1.getFieldOrDatumDef(encoding[channel]);
            if (fieldOrDatumDef) {
                scales[channel] = this.initScale((_a = fieldOrDatumDef.scale) !== null && _a !== void 0 ? _a : {});
            }
            return scales;
        }, {});
    }
    initScale(scale) {
        const { domain, range } = scale;
        // TODO: we could simplify this function if we had a recursive replace function
        const scaleInternal = expr_1.replaceExprRef(scale);
        if (vega_util_1.isArray(domain)) {
            scaleInternal.domain = domain.map(common_1.signalRefOrValue);
        }
        if (vega_util_1.isArray(range)) {
            scaleInternal.range = range.map(common_1.signalRefOrValue);
        }
        return scaleInternal;
    }
    initAxes(encoding) {
        return channel_1.POSITION_SCALE_CHANNELS.reduce((_axis, channel) => {
            // Position Axis
            // TODO: handle ConditionFieldDef
            const channelDef = encoding[channel];
            if (channeldef_1.isFieldOrDatumDef(channelDef) ||
                (channel === channel_1.X && channeldef_1.isFieldOrDatumDef(encoding.x2)) ||
                (channel === channel_1.Y && channeldef_1.isFieldOrDatumDef(encoding.y2))) {
                const axisSpec = channeldef_1.isFieldOrDatumDef(channelDef) ? channelDef.axis : undefined;
                _axis[channel] = axisSpec
                    ? this.initAxis(Object.assign({}, axisSpec)) // convert truthy value to object
                    : axisSpec;
            }
            return _axis;
        }, {});
    }
    initAxis(axis) {
        const props = util_1.keys(axis);
        const axisInternal = {};
        for (const prop of props) {
            const val = axis[prop];
            axisInternal[prop] = axis_1.isConditionalAxisValue(val)
                ? common_1.signalOrValueRefWithCondition(val)
                : common_1.signalRefOrValue(val);
        }
        return axisInternal;
    }
    initLegends(encoding) {
        return channel_1.NONPOSITION_SCALE_CHANNELS.reduce((_legend, channel) => {
            const fieldOrDatumDef = channeldef_1.getFieldOrDatumDef(encoding[channel]);
            if (fieldOrDatumDef && channel_1.supportLegend(channel)) {
                const legend = fieldOrDatumDef.legend;
                _legend[channel] = legend
                    ? expr_1.replaceExprRef(legend) // convert truthy value to object
                    : legend;
            }
            return _legend;
        }, {});
    }
    parseData() {
        this.component.data = parse_2.parseData(this);
    }
    parseLayoutSize() {
        parse_3.parseUnitLayoutSize(this);
    }
    parseSelections() {
        this.component.selection = parse_4.parseUnitSelection(this, this.selection);
    }
    parseMarkGroup() {
        this.component.mark = mark_2.parseMarkGroups(this);
    }
    parseAxesAndHeaders() {
        this.component.axes = parse_1.parseUnitAxes(this);
    }
    assembleSelectionTopLevelSignals(signals) {
        return assemble_3.assembleTopLevelSignals(this, signals);
    }
    assembleSignals() {
        return [...assemble_1.assembleAxisSignals(this), ...assemble_3.assembleUnitSelectionSignals(this, [])];
    }
    assembleSelectionData(data) {
        return assemble_3.assembleUnitSelectionData(this, data);
    }
    assembleLayout() {
        return null;
    }
    assembleLayoutSignals() {
        return assemble_2.assembleLayoutSignals(this);
    }
    assembleMarks() {
        var _a;
        let marks = (_a = this.component.mark) !== null && _a !== void 0 ? _a : [];
        // If this unit is part of a layer, selections should augment
        // all in concert rather than each unit individually. This
        // ensures correct interleaving of clipping and brushed marks.
        if (!this.parent || !model_1.isLayerModel(this.parent)) {
            marks = assemble_3.assembleUnitSelectionMarks(this, marks);
        }
        return marks.map(this.correctDataNames);
    }
    getMapping() {
        return this.encoding;
    }
    get mark() {
        return this.markDef.type;
    }
    channelHasField(channel) {
        return vlEncoding.channelHasField(this.encoding, channel);
    }
    fieldDef(channel) {
        const channelDef = this.encoding[channel];
        return channeldef_1.getFieldDef(channelDef);
    }
    typedFieldDef(channel) {
        const fieldDef = this.fieldDef(channel);
        if (channeldef_1.isTypedFieldDef(fieldDef)) {
            return fieldDef;
        }
        return null;
    }
}
exports.UnitModel = UnitModel;
//# sourceMappingURL=unit.js.map