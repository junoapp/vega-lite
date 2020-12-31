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
exports.FacetModel = exports.facetSortFieldName = void 0;
const vega_util_1 = require("vega-util");
const bin_1 = require("../bin");
const channel_1 = require("../channel");
const channeldef_1 = require("../channeldef");
const expr_1 = require("../expr");
const log = __importStar(require("../log"));
const scale_1 = require("../scale");
const sort_1 = require("../sort");
const facet_1 = require("../spec/facet");
const util_1 = require("../util");
const vega_schema_1 = require("../vega.schema");
const buildmodel_1 = require("./buildmodel");
const assemble_1 = require("./data/assemble");
const calculate_1 = require("./data/calculate");
const parse_1 = require("./data/parse");
const assemble_2 = require("./header/assemble");
const common_1 = require("./header/common");
const component_1 = require("./header/component");
const parse_2 = require("./header/parse");
const parse_3 = require("./layoutsize/parse");
const model_1 = require("./model");
const domain_1 = require("./scale/domain");
const assemble_3 = require("./selection/assemble");
function facetSortFieldName(fieldDef, sort, opt) {
    return channeldef_1.vgField(sort, Object.assign({ suffix: `by_${channeldef_1.vgField(fieldDef)}` }, (opt !== null && opt !== void 0 ? opt : {})));
}
exports.facetSortFieldName = facetSortFieldName;
class FacetModel extends model_1.ModelWithField {
    constructor(spec, parent, parentGivenName, config) {
        super(spec, 'facet', parent, parentGivenName, config, spec.resolve);
        this.child = buildmodel_1.buildModel(spec.spec, this, this.getName('child'), undefined, config);
        this.children = [this.child];
        this.facet = this.initFacet(spec.facet);
    }
    initFacet(facet) {
        // clone to prevent side effect to the original spec
        if (!facet_1.isFacetMapping(facet)) {
            return { facet: this.initFacetFieldDef(facet, 'facet') };
        }
        const channels = util_1.keys(facet);
        const normalizedFacet = {};
        for (const channel of channels) {
            if (![channel_1.ROW, channel_1.COLUMN].includes(channel)) {
                // Drop unsupported channel
                log.warn(log.message.incompatibleChannel(channel, 'facet'));
                break;
            }
            const fieldDef = facet[channel];
            if (fieldDef.field === undefined) {
                log.warn(log.message.emptyFieldDef(fieldDef, channel));
                break;
            }
            normalizedFacet[channel] = this.initFacetFieldDef(fieldDef, channel);
        }
        return normalizedFacet;
    }
    initFacetFieldDef(fieldDef, channel) {
        const { header } = fieldDef, rest = __rest(fieldDef, ["header"]);
        // Cast because we call initFieldDef, which assumes general FieldDef.
        // However, FacetFieldDef is a bit more constrained than the general FieldDef
        const facetFieldDef = channeldef_1.initFieldDef(rest, channel);
        if (header) {
            facetFieldDef.header = expr_1.replaceExprRef(header);
        }
        return facetFieldDef;
    }
    channelHasField(channel) {
        return !!this.facet[channel];
    }
    fieldDef(channel) {
        return this.facet[channel];
    }
    parseData() {
        this.component.data = parse_1.parseData(this);
        this.child.parseData();
    }
    parseLayoutSize() {
        parse_3.parseChildrenLayoutSize(this);
    }
    parseSelections() {
        // As a facet has a single child, the selection components are the same.
        // The child maintains its selections to assemble signals, which remain
        // within its unit.
        this.child.parseSelections();
        this.component.selection = this.child.component.selection;
    }
    parseMarkGroup() {
        this.child.parseMarkGroup();
    }
    parseAxesAndHeaders() {
        this.child.parseAxesAndHeaders();
        parse_2.parseFacetHeaders(this);
    }
    assembleSelectionTopLevelSignals(signals) {
        return this.child.assembleSelectionTopLevelSignals(signals);
    }
    assembleSignals() {
        this.child.assembleSignals();
        return [];
    }
    assembleSelectionData(data) {
        return this.child.assembleSelectionData(data);
    }
    getHeaderLayoutMixins() {
        var _a, _b, _c;
        const layoutMixins = {};
        for (const channel of channel_1.FACET_CHANNELS) {
            for (const headerType of component_1.HEADER_TYPES) {
                const layoutHeaderComponent = this.component.layoutHeaders[channel];
                const headerComponent = layoutHeaderComponent[headerType];
                const { facetFieldDef } = layoutHeaderComponent;
                if (facetFieldDef) {
                    const titleOrient = common_1.getHeaderProperty('titleOrient', facetFieldDef.header, this.config, channel);
                    if (['right', 'bottom'].includes(titleOrient)) {
                        const headerChannel = common_1.getHeaderChannel(channel, titleOrient);
                        layoutMixins.titleAnchor = (_a = layoutMixins.titleAnchor) !== null && _a !== void 0 ? _a : {};
                        layoutMixins.titleAnchor[headerChannel] = 'end';
                    }
                }
                if (headerComponent === null || headerComponent === void 0 ? void 0 : headerComponent[0]) {
                    // set header/footerBand
                    const sizeType = channel === 'row' ? 'height' : 'width';
                    const bandType = headerType === 'header' ? 'headerBand' : 'footerBand';
                    if (channel !== 'facet' && !this.child.component.layoutSize.get(sizeType)) {
                        // If facet child does not have size signal, then apply headerBand
                        layoutMixins[bandType] = (_b = layoutMixins[bandType]) !== null && _b !== void 0 ? _b : {};
                        layoutMixins[bandType][channel] = 0.5;
                    }
                    if (layoutHeaderComponent.title) {
                        layoutMixins.offset = (_c = layoutMixins.offset) !== null && _c !== void 0 ? _c : {};
                        layoutMixins.offset[channel === 'row' ? 'rowTitle' : 'columnTitle'] = 10;
                    }
                }
            }
        }
        return layoutMixins;
    }
    assembleDefaultLayout() {
        const { column, row } = this.facet;
        const columns = column ? this.columnDistinctSignal() : row ? 1 : undefined;
        let align = 'all';
        // Do not align the cells if the scale corresponding to the direction is indepent.
        // We always align when we facet into both row and column.
        if (!row && this.component.resolve.scale.x === 'independent') {
            align = 'none';
        }
        else if (!column && this.component.resolve.scale.y === 'independent') {
            align = 'none';
        }
        return Object.assign(Object.assign(Object.assign({}, this.getHeaderLayoutMixins()), (columns ? { columns } : {})), { bounds: 'full', align });
    }
    assembleLayoutSignals() {
        // FIXME(https://github.com/vega/vega-lite/issues/1193): this can be incorrect if we have independent scales.
        return this.child.assembleLayoutSignals();
    }
    columnDistinctSignal() {
        if (this.parent && this.parent instanceof FacetModel) {
            // For nested facet, we will add columns to group mark instead
            // See discussion in https://github.com/vega/vega/issues/952
            // and https://github.com/vega/vega-view/releases/tag/v1.2.6
            return undefined;
        }
        else {
            // In facetNode.assemble(), the name is always this.getName('column') + '_layout'.
            const facetLayoutDataName = this.getName('column_domain');
            return { signal: `length(data('${facetLayoutDataName}'))` };
        }
    }
    assembleGroup(signals) {
        if (this.parent && this.parent instanceof FacetModel) {
            // Provide number of columns for layout.
            // See discussion in https://github.com/vega/vega/issues/952
            // and https://github.com/vega/vega-view/releases/tag/v1.2.6
            return Object.assign(Object.assign({}, (this.channelHasField('column')
                ? {
                    encode: {
                        update: {
                            // TODO(https://github.com/vega/vega-lite/issues/2759):
                            // Correct the signal for facet of concat of facet_column
                            columns: { field: channeldef_1.vgField(this.facet.column, { prefix: 'distinct' }) }
                        }
                    }
                }
                : {})), super.assembleGroup(signals));
        }
        return super.assembleGroup(signals);
    }
    /**
     * Aggregate cardinality for calculating size
     */
    getCardinalityAggregateForChild() {
        const fields = [];
        const ops = [];
        const as = [];
        if (this.child instanceof FacetModel) {
            if (this.child.channelHasField('column')) {
                const field = channeldef_1.vgField(this.child.facet.column);
                fields.push(field);
                ops.push('distinct');
                as.push(`distinct_${field}`);
            }
        }
        else {
            for (const channel of channel_1.POSITION_SCALE_CHANNELS) {
                const childScaleComponent = this.child.component.scales[channel];
                if (childScaleComponent && !childScaleComponent.merged) {
                    const type = childScaleComponent.get('type');
                    const range = childScaleComponent.get('range');
                    if (scale_1.hasDiscreteDomain(type) && vega_schema_1.isVgRangeStep(range)) {
                        const domain = domain_1.assembleDomain(this.child, channel);
                        const field = domain_1.getFieldFromDomain(domain);
                        if (field) {
                            fields.push(field);
                            ops.push('distinct');
                            as.push(`distinct_${field}`);
                        }
                        else {
                            log.warn(log.message.unknownField(channel));
                        }
                    }
                }
            }
        }
        return { fields, ops, as };
    }
    assembleFacet() {
        const { name, data } = this.component.data.facetRoot;
        const { row, column } = this.facet;
        const { fields, ops, as } = this.getCardinalityAggregateForChild();
        const groupby = [];
        for (const channel of channel_1.FACET_CHANNELS) {
            const fieldDef = this.facet[channel];
            if (fieldDef) {
                groupby.push(channeldef_1.vgField(fieldDef));
                const { bin, sort } = fieldDef;
                if (bin_1.isBinning(bin)) {
                    groupby.push(channeldef_1.vgField(fieldDef, { binSuffix: 'end' }));
                }
                if (sort_1.isSortField(sort)) {
                    const { field, op = sort_1.DEFAULT_SORT_OP } = sort;
                    const outputName = facetSortFieldName(fieldDef, sort);
                    if (row && column) {
                        // For crossed facet, use pre-calculate field as it requires a different groupby
                        // For each calculated field, apply max and assign them to the same name as
                        // all values of the same group should be the same anyway.
                        fields.push(outputName);
                        ops.push('max');
                        as.push(outputName);
                    }
                    else {
                        fields.push(field);
                        ops.push(op);
                        as.push(outputName);
                    }
                }
                else if (vega_util_1.isArray(sort)) {
                    const outputName = calculate_1.sortArrayIndexField(fieldDef, channel);
                    fields.push(outputName);
                    ops.push('max');
                    as.push(outputName);
                }
            }
        }
        const cross = !!row && !!column;
        return Object.assign({ name,
            data,
            groupby }, (cross || fields.length > 0
            ? {
                aggregate: Object.assign(Object.assign({}, (cross ? { cross } : {})), (fields.length ? { fields, ops, as } : {}))
            }
            : {}));
    }
    facetSortFields(channel) {
        const { facet } = this;
        const fieldDef = facet[channel];
        if (fieldDef) {
            if (sort_1.isSortField(fieldDef.sort)) {
                return [facetSortFieldName(fieldDef, fieldDef.sort, { expr: 'datum' })];
            }
            else if (vega_util_1.isArray(fieldDef.sort)) {
                return [calculate_1.sortArrayIndexField(fieldDef, channel, { expr: 'datum' })];
            }
            return [channeldef_1.vgField(fieldDef, { expr: 'datum' })];
        }
        return [];
    }
    facetSortOrder(channel) {
        const { facet } = this;
        const fieldDef = facet[channel];
        if (fieldDef) {
            const { sort } = fieldDef;
            const order = (sort_1.isSortField(sort) ? sort.order : !vega_util_1.isArray(sort) && sort) || 'ascending';
            return [order];
        }
        return [];
    }
    assembleLabelTitle() {
        var _a;
        const { facet, config } = this;
        if (facet.facet) {
            // Facet always uses title to display labels
            return assemble_2.assembleLabelTitle(facet.facet, 'facet', config);
        }
        const ORTHOGONAL_ORIENT = {
            row: ['top', 'bottom'],
            column: ['left', 'right']
        };
        for (const channel of component_1.HEADER_CHANNELS) {
            if (facet[channel]) {
                const labelOrient = common_1.getHeaderProperty('labelOrient', (_a = facet[channel]) === null || _a === void 0 ? void 0 : _a.header, config, channel);
                if (ORTHOGONAL_ORIENT[channel].includes(labelOrient)) {
                    // Row/Column with orthogonal labelOrient must use title to display labels
                    return assemble_2.assembleLabelTitle(facet[channel], channel, config);
                }
            }
        }
        return undefined;
    }
    assembleMarks() {
        const { child } = this;
        // If we facet by two dimensions, we need to add a cross operator to the aggregation
        // so that we create all groups
        const facetRoot = this.component.data.facetRoot;
        const data = assemble_1.assembleFacetData(facetRoot);
        const encodeEntry = child.assembleGroupEncodeEntry(false);
        const title = this.assembleLabelTitle() || child.assembleTitle();
        const style = child.assembleGroupStyle();
        const markGroup = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ name: this.getName('cell'), type: 'group' }, (title ? { title } : {})), (style ? { style } : {})), { from: {
                facet: this.assembleFacet()
            }, 
            // TODO: move this to after data
            sort: {
                field: channel_1.FACET_CHANNELS.map(c => this.facetSortFields(c)).flat(),
                order: channel_1.FACET_CHANNELS.map(c => this.facetSortOrder(c)).flat()
            } }), (data.length > 0 ? { data: data } : {})), (encodeEntry ? { encode: { update: encodeEntry } } : {})), child.assembleGroup(assemble_3.assembleFacetSignals(this, [])));
        return [markGroup];
    }
    getMapping() {
        return this.facet;
    }
}
exports.FacetModel = FacetModel;
//# sourceMappingURL=facet.js.map