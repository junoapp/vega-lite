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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreNormalizer = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../channel");
const channeldef_1 = require("../channeldef");
const boxplot_1 = require("../compositemark/boxplot");
const errorband_1 = require("../compositemark/errorband");
const errorbar_1 = require("../compositemark/errorbar");
const encoding_1 = require("../encoding");
const log = __importStar(require("../log"));
const facet_1 = require("../spec/facet");
const map_1 = require("../spec/map");
const repeat_1 = require("../spec/repeat");
const unit_1 = require("../spec/unit");
const util_1 = require("../util");
const vega_schema_1 = require("../vega.schema");
const pathoverlay_1 = require("./pathoverlay");
const repeater_1 = require("./repeater");
const ruleforrangedline_1 = require("./ruleforrangedline");
class CoreNormalizer extends map_1.SpecMapper {
    constructor() {
        super(...arguments);
        this.nonFacetUnitNormalizers = [
            boxplot_1.boxPlotNormalizer,
            errorbar_1.errorBarNormalizer,
            errorband_1.errorBandNormalizer,
            new pathoverlay_1.PathOverlayNormalizer(),
            new ruleforrangedline_1.RuleForRangedLineNormalizer()
        ];
    }
    map(spec, params) {
        // Special handling for a faceted unit spec as it can return a facet spec, not just a layer or unit spec like a normal unit spec.
        if (unit_1.isUnitSpec(spec)) {
            const hasRow = encoding_1.channelHasField(spec.encoding, channel_1.ROW);
            const hasColumn = encoding_1.channelHasField(spec.encoding, channel_1.COLUMN);
            const hasFacet = encoding_1.channelHasField(spec.encoding, channel_1.FACET);
            if (hasRow || hasColumn || hasFacet) {
                return this.mapFacetedUnit(spec, params);
            }
        }
        return super.map(spec, params);
    }
    // This is for normalizing non-facet unit
    mapUnit(spec, params) {
        const { parentEncoding, parentProjection } = params;
        const encoding = repeater_1.replaceRepeaterInEncoding(spec.encoding, params.repeater);
        const specWithReplacedEncoding = Object.assign(Object.assign({}, spec), (encoding ? { encoding } : {}));
        if (parentEncoding || parentProjection) {
            return this.mapUnitWithParentEncodingOrProjection(specWithReplacedEncoding, params);
        }
        const normalizeLayerOrUnit = this.mapLayerOrUnit.bind(this);
        for (const unitNormalizer of this.nonFacetUnitNormalizers) {
            if (unitNormalizer.hasMatchingType(specWithReplacedEncoding, params.config)) {
                return unitNormalizer.run(specWithReplacedEncoding, params, normalizeLayerOrUnit);
            }
        }
        return specWithReplacedEncoding;
    }
    mapRepeat(spec, params) {
        if (repeat_1.isLayerRepeatSpec(spec)) {
            return this.mapLayerRepeat(spec, params);
        }
        else {
            return this.mapNonLayerRepeat(spec, params);
        }
    }
    mapLayerRepeat(spec, params) {
        const { repeat, spec: childSpec } = spec, rest = __rest(spec, ["repeat", "spec"]);
        const { row, column, layer } = repeat;
        const { repeater = {}, repeaterPrefix = '' } = params;
        if (row || column) {
            return this.mapRepeat(Object.assign(Object.assign({}, spec), { repeat: Object.assign(Object.assign({}, (row ? { row } : {})), (column ? { column } : {})), spec: {
                    repeat: { layer },
                    spec: childSpec
                } }), params);
        }
        else {
            return Object.assign(Object.assign({}, rest), { layer: layer.map(layerValue => {
                    const childRepeater = Object.assign(Object.assign({}, repeater), { layer: layerValue });
                    const childName = `${(childSpec.name || '') + repeaterPrefix}child__layer_${util_1.varName(layerValue)}`;
                    const child = this.mapLayerOrUnit(childSpec, Object.assign(Object.assign({}, params), { repeater: childRepeater, repeaterPrefix: childName }));
                    child.name = childName;
                    return child;
                }) });
        }
    }
    mapNonLayerRepeat(spec, params) {
        var _a;
        const { repeat, spec: childSpec, data } = spec, remainingProperties = __rest(spec, ["repeat", "spec", "data"]);
        if (!vega_util_1.isArray(repeat) && spec.columns) {
            // is repeat with row/column
            spec = util_1.omit(spec, ['columns']);
            log.warn(log.message.columnsNotSupportByRowCol('repeat'));
        }
        const concat = [];
        const { repeater = {}, repeaterPrefix = '' } = params;
        const row = (!vega_util_1.isArray(repeat) && repeat.row) || [repeater ? repeater.row : null];
        const column = (!vega_util_1.isArray(repeat) && repeat.column) || [repeater ? repeater.column : null];
        const repeatValues = (vega_util_1.isArray(repeat) && repeat) || [repeater ? repeater.repeat : null];
        // cross product
        for (const repeatValue of repeatValues) {
            for (const rowValue of row) {
                for (const columnValue of column) {
                    const childRepeater = {
                        repeat: repeatValue,
                        row: rowValue,
                        column: columnValue,
                        layer: repeater.layer
                    };
                    const childName = (childSpec.name || '') +
                        repeaterPrefix +
                        'child__' +
                        (vega_util_1.isArray(repeat)
                            ? `${util_1.varName(repeatValue)}`
                            : (repeat.row ? `row_${util_1.varName(rowValue)}` : '') +
                                (repeat.column ? `column_${util_1.varName(columnValue)}` : ''));
                    const child = this.map(childSpec, Object.assign(Object.assign({}, params), { repeater: childRepeater, repeaterPrefix: childName }));
                    child.name = childName;
                    // we move data up
                    concat.push(util_1.omit(child, ['data']));
                }
            }
        }
        const columns = vega_util_1.isArray(repeat) ? spec.columns : repeat.column ? repeat.column.length : 1;
        return Object.assign(Object.assign({ data: (_a = childSpec.data) !== null && _a !== void 0 ? _a : data, align: 'all' }, remainingProperties), { columns,
            concat });
    }
    mapFacet(spec, params) {
        const { facet } = spec;
        if (facet_1.isFacetMapping(facet) && spec.columns) {
            // is facet with row/column
            spec = util_1.omit(spec, ['columns']);
            log.warn(log.message.columnsNotSupportByRowCol('facet'));
        }
        return super.mapFacet(spec, params);
    }
    mapUnitWithParentEncodingOrProjection(spec, params) {
        const { encoding, projection } = spec;
        const { parentEncoding, parentProjection, config } = params;
        const mergedProjection = mergeProjection({ parentProjection, projection });
        const mergedEncoding = mergeEncoding({
            parentEncoding,
            encoding: repeater_1.replaceRepeaterInEncoding(encoding, params.repeater)
        });
        return this.mapUnit(Object.assign(Object.assign(Object.assign({}, spec), (mergedProjection ? { projection: mergedProjection } : {})), (mergedEncoding ? { encoding: mergedEncoding } : {})), { config });
    }
    mapFacetedUnit(spec, params) {
        // New encoding in the inside spec should not contain row / column
        // as row/column should be moved to facet
        const _a = spec.encoding, { row, column, facet } = _a, encoding = __rest(_a, ["row", "column", "facet"]);
        // Mark and encoding should be moved into the inner spec
        const { mark, width, projection, height, view, selection, encoding: _ } = spec, outerSpec = __rest(spec, ["mark", "width", "projection", "height", "view", "selection", "encoding"]);
        const { facetMapping, layout } = this.getFacetMappingAndLayout({ row, column, facet }, params);
        const newEncoding = repeater_1.replaceRepeaterInEncoding(encoding, params.repeater);
        return this.mapFacet(Object.assign(Object.assign(Object.assign({}, outerSpec), layout), { 
            // row / column has higher precedence than facet
            facet: facetMapping, spec: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (width ? { width } : {})), (height ? { height } : {})), (view ? { view } : {})), (projection ? { projection } : {})), { mark, encoding: newEncoding }), (selection ? { selection } : {})) }), params);
    }
    getFacetMappingAndLayout(facets, params) {
        var _a;
        const { row, column, facet } = facets;
        if (row || column) {
            if (facet) {
                log.warn(log.message.facetChannelDropped([...(row ? [channel_1.ROW] : []), ...(column ? [channel_1.COLUMN] : [])]));
            }
            const facetMapping = {};
            const layout = {};
            for (const channel of [channel_1.ROW, channel_1.COLUMN]) {
                const def = facets[channel];
                if (def) {
                    const { align, center, spacing, columns } = def, defWithoutLayout = __rest(def, ["align", "center", "spacing", "columns"]);
                    facetMapping[channel] = defWithoutLayout;
                    for (const prop of ['align', 'center', 'spacing']) {
                        if (def[prop] !== undefined) {
                            layout[prop] = (_a = layout[prop]) !== null && _a !== void 0 ? _a : {};
                            layout[prop][channel] = def[prop];
                        }
                    }
                }
            }
            return { facetMapping, layout };
        }
        else {
            const { align, center, spacing, columns } = facet, facetMapping = __rest(facet, ["align", "center", "spacing", "columns"]);
            return {
                facetMapping: repeater_1.replaceRepeaterInFacet(facetMapping, params.repeater),
                layout: Object.assign(Object.assign(Object.assign(Object.assign({}, (align ? { align } : {})), (center ? { center } : {})), (spacing ? { spacing } : {})), (columns ? { columns } : {}))
            };
        }
    }
    mapLayer(spec, _a) {
        // Special handling for extended layer spec
        var { parentEncoding, parentProjection } = _a, otherParams = __rest(_a, ["parentEncoding", "parentProjection"]);
        const { encoding, projection } = spec, rest = __rest(spec, ["encoding", "projection"]);
        const params = Object.assign(Object.assign({}, otherParams), { parentEncoding: mergeEncoding({ parentEncoding, encoding, layer: true }), parentProjection: mergeProjection({ parentProjection, projection }) });
        return super.mapLayer(rest, params);
    }
}
exports.CoreNormalizer = CoreNormalizer;
function mergeEncoding({ parentEncoding, encoding = {}, layer }) {
    let merged = {};
    if (parentEncoding) {
        const channels = new Set([...util_1.keys(parentEncoding), ...util_1.keys(encoding)]);
        for (const channel of channels) {
            const channelDef = encoding[channel];
            const parentChannelDef = parentEncoding[channel];
            if (channeldef_1.isFieldOrDatumDef(channelDef)) {
                // Field/Datum Def can inherit properties from its parent
                // Note that parentChannelDef doesn't have to be a field/datum def if the channelDef is already one.
                const mergedChannelDef = Object.assign(Object.assign({}, parentChannelDef), channelDef);
                merged[channel] = mergedChannelDef;
            }
            else if (channeldef_1.hasConditionalFieldOrDatumDef(channelDef)) {
                merged[channel] = Object.assign(Object.assign({}, channelDef), { condition: Object.assign(Object.assign({}, parentChannelDef), channelDef.condition) });
            }
            else if (channelDef || channelDef === null) {
                merged[channel] = channelDef;
            }
            else if (layer ||
                channeldef_1.isValueDef(parentChannelDef) ||
                vega_schema_1.isSignalRef(parentChannelDef) ||
                channeldef_1.isFieldOrDatumDef(parentChannelDef) ||
                vega_util_1.isArray(parentChannelDef)) {
                merged[channel] = parentChannelDef;
            }
        }
    }
    else {
        merged = encoding;
    }
    return !merged || util_1.isEmpty(merged) ? undefined : merged;
}
function mergeProjection(opt) {
    const { parentProjection, projection } = opt;
    if (parentProjection && projection) {
        log.warn(log.message.projectionOverridden({ parentProjection, projection }));
    }
    return projection !== null && projection !== void 0 ? projection : parentProjection;
}
//# sourceMappingURL=core.js.map