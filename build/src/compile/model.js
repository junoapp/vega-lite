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
exports.ModelWithField = exports.Model = exports.isLayerModel = exports.isConcatModel = exports.isFacetModel = exports.isUnitModel = exports.NameMap = void 0;
const channel_1 = require("../channel");
const channeldef_1 = require("../channeldef");
const data_1 = require("../data");
const encoding_1 = require("../encoding");
const expr_1 = require("../expr");
const log = __importStar(require("../log"));
const scale_1 = require("../scale");
const spec_1 = require("../spec");
const base_1 = require("../spec/base");
const title_1 = require("../title");
const transform_1 = require("../transform");
const util_1 = require("../util");
const vega_schema_1 = require("../vega.schema");
const assemble_1 = require("./axis/assemble");
const common_1 = require("./common");
const assemble_2 = require("./header/assemble");
const component_1 = require("./header/component");
const assemble_3 = require("./layoutsize/assemble");
const component_2 = require("./layoutsize/component");
const assemble_4 = require("./legend/assemble");
const parse_1 = require("./legend/parse");
const assemble_5 = require("./projection/assemble");
const parse_2 = require("./projection/parse");
const assemble_6 = require("./scale/assemble");
const domain_1 = require("./scale/domain");
const parse_3 = require("./scale/parse");
const split_1 = require("./split");
class NameMap {
    constructor() {
        this.nameMap = {};
    }
    rename(oldName, newName) {
        this.nameMap[oldName] = newName;
    }
    has(name) {
        return this.nameMap[name] !== undefined;
    }
    get(name) {
        // If the name appears in the _nameMap, we need to read its new name.
        // We have to loop over the dict just in case the new name also gets renamed.
        while (this.nameMap[name] && name !== this.nameMap[name]) {
            name = this.nameMap[name];
        }
        return name;
    }
}
exports.NameMap = NameMap;
/*
  We use type guards instead of `instanceof` as `instanceof` makes
  different parts of the compiler depend on the actual implementation of
  the model classes, which in turn depend on different parts of the compiler.
  Thus, `instanceof` leads to circular dependency problems.

  On the other hand, type guards only make different parts of the compiler
  depend on the type of the model classes, but not the actual implementation.
*/
function isUnitModel(model) {
    return (model === null || model === void 0 ? void 0 : model.type) === 'unit';
}
exports.isUnitModel = isUnitModel;
function isFacetModel(model) {
    return (model === null || model === void 0 ? void 0 : model.type) === 'facet';
}
exports.isFacetModel = isFacetModel;
function isConcatModel(model) {
    return (model === null || model === void 0 ? void 0 : model.type) === 'concat';
}
exports.isConcatModel = isConcatModel;
function isLayerModel(model) {
    return (model === null || model === void 0 ? void 0 : model.type) === 'layer';
}
exports.isLayerModel = isLayerModel;
class Model {
    constructor(spec, type, parent, parentGivenName, config, resolve, view) {
        var _a, _b;
        this.type = type;
        this.parent = parent;
        this.config = config;
        this.children = [];
        /**
         * Corrects the data references in marks after assemble.
         */
        this.correctDataNames = (mark) => {
            // TODO: make this correct
            // for normal data references
            if (mark.from && mark.from.data) {
                mark.from.data = this.lookupDataSource(mark.from.data);
            }
            // for access to facet data
            if (mark.from && mark.from.facet && mark.from.facet.data) {
                mark.from.facet.data = this.lookupDataSource(mark.from.facet.data);
            }
            return mark;
        };
        this.parent = parent;
        this.config = config;
        this.view = expr_1.replaceExprRef(view);
        // If name is not provided, always use parent's givenName to avoid name conflicts.
        this.name = (_a = spec.name) !== null && _a !== void 0 ? _a : parentGivenName;
        this.title = title_1.isText(spec.title) ? { text: spec.title } : spec.title ? expr_1.replaceExprRef(spec.title) : undefined;
        // Shared name maps
        this.scaleNameMap = parent ? parent.scaleNameMap : new NameMap();
        this.projectionNameMap = parent ? parent.projectionNameMap : new NameMap();
        this.signalNameMap = parent ? parent.signalNameMap : new NameMap();
        this.data = spec.data;
        this.description = spec.description;
        this.transforms = transform_1.normalizeTransform((_b = spec.transform) !== null && _b !== void 0 ? _b : []);
        this.layout = type === 'layer' || type === 'unit' ? {} : base_1.extractCompositionLayout(spec, type, config);
        this.component = {
            data: {
                sources: parent ? parent.component.data.sources : [],
                outputNodes: parent ? parent.component.data.outputNodes : {},
                outputNodeRefCounts: parent ? parent.component.data.outputNodeRefCounts : {},
                // data is faceted if the spec is a facet spec or the parent has faceted data and data is undefined
                isFaceted: spec_1.isFacetSpec(spec) || (parent && parent.component.data.isFaceted && spec.data === undefined)
            },
            layoutSize: new split_1.Split(),
            layoutHeaders: { row: {}, column: {}, facet: {} },
            mark: null,
            resolve: Object.assign({ scale: {}, axis: {}, legend: {} }, (resolve ? util_1.duplicate(resolve) : {})),
            selection: null,
            scales: null,
            projection: null,
            axes: {},
            legends: {}
        };
    }
    get width() {
        return this.getSizeSignalRef('width');
    }
    get height() {
        return this.getSizeSignalRef('height');
    }
    parse() {
        this.parseScale();
        this.parseLayoutSize(); // depends on scale
        this.renameTopLevelLayoutSizeSignal();
        this.parseSelections();
        this.parseProjection();
        this.parseData(); // (pathorder) depends on markDef; selection filters depend on parsed selections; depends on projection because some transforms require the finalized projection name.
        this.parseAxesAndHeaders(); // depends on scale and layout size
        this.parseLegends(); // depends on scale, markDef
        this.parseMarkGroup(); // depends on data name, scale, layout size, axisGroup, and children's scale, axis, legend and mark.
    }
    parseScale() {
        parse_3.parseScales(this);
    }
    parseProjection() {
        parse_2.parseProjection(this);
    }
    /**
     * Rename top-level spec's size to be just width / height, ignoring model name.
     * This essentially merges the top-level spec's width/height signals with the width/height signals
     * to help us reduce redundant signals declaration.
     */
    renameTopLevelLayoutSizeSignal() {
        if (this.getName('width') !== 'width') {
            this.renameSignal(this.getName('width'), 'width');
        }
        if (this.getName('height') !== 'height') {
            this.renameSignal(this.getName('height'), 'height');
        }
    }
    parseLegends() {
        parse_1.parseLegend(this);
    }
    assembleGroupStyle() {
        var _a, _b;
        if (this.type === 'unit' || this.type === 'layer') {
            return (_b = (_a = this.view) === null || _a === void 0 ? void 0 : _a.style) !== null && _b !== void 0 ? _b : 'cell';
        }
        return undefined;
    }
    assembleEncodeFromView(view) {
        // Exclude "style"
        const { style: _ } = view, baseView = __rest(view, ["style"]);
        const e = {};
        for (const property of util_1.keys(baseView)) {
            const value = baseView[property];
            if (value !== undefined) {
                e[property] = common_1.signalOrValueRef(value);
            }
        }
        return e;
    }
    assembleGroupEncodeEntry(isTopLevel) {
        let encodeEntry = {};
        if (this.view) {
            encodeEntry = this.assembleEncodeFromView(this.view);
        }
        if (!isTopLevel) {
            // Descriptions are already added to the top-level description so we only need to add them to the inner views.
            if (this.description) {
                encodeEntry['description'] = common_1.signalOrValueRef(this.description);
            }
            // For top-level spec, we can set the global width and height signal to adjust the group size.
            // For other child specs, we have to manually set width and height in the encode entry.
            if (this.type === 'unit' || this.type === 'layer') {
                return Object.assign({ width: this.getSizeSignalRef('width'), height: this.getSizeSignalRef('height') }, (encodeEntry !== null && encodeEntry !== void 0 ? encodeEntry : {}));
            }
        }
        return util_1.isEmpty(encodeEntry) ? undefined : encodeEntry;
    }
    assembleLayout() {
        if (!this.layout) {
            return undefined;
        }
        const _a = this.layout, { spacing } = _a, layout = __rest(_a, ["spacing"]);
        const { component, config } = this;
        const titleBand = assemble_2.assembleLayoutTitleBand(component.layoutHeaders, config);
        return Object.assign(Object.assign(Object.assign({ padding: spacing }, this.assembleDefaultLayout()), layout), (titleBand ? { titleBand } : {}));
    }
    assembleDefaultLayout() {
        return {};
    }
    assembleHeaderMarks() {
        const { layoutHeaders } = this.component;
        let headerMarks = [];
        for (const channel of channel_1.FACET_CHANNELS) {
            if (layoutHeaders[channel].title) {
                headerMarks.push(assemble_2.assembleTitleGroup(this, channel));
            }
        }
        for (const channel of component_1.HEADER_CHANNELS) {
            headerMarks = headerMarks.concat(assemble_2.assembleHeaderGroups(this, channel));
        }
        return headerMarks;
    }
    assembleAxes() {
        return assemble_1.assembleAxes(this.component.axes, this.config);
    }
    assembleLegends() {
        return assemble_4.assembleLegends(this);
    }
    assembleProjections() {
        return assemble_5.assembleProjections(this);
    }
    assembleTitle() {
        var _a, _b, _c;
        const _d = (_a = this.title) !== null && _a !== void 0 ? _a : {}, { encoding } = _d, titleNoEncoding = __rest(_d, ["encoding"]);
        const title = Object.assign(Object.assign(Object.assign({}, title_1.extractTitleConfig(this.config.title).nonMark), titleNoEncoding), (encoding ? { encode: { update: encoding } } : {}));
        if (title.text) {
            if (util_1.contains(['unit', 'layer'], this.type)) {
                // Unit/Layer
                if (util_1.contains(['middle', undefined], title.anchor)) {
                    title.frame = (_b = title.frame) !== null && _b !== void 0 ? _b : 'group';
                }
            }
            else {
                // composition with Vega layout
                // Set title = "start" by default for composition as "middle" does not look nice
                // https://github.com/vega/vega/issues/960#issuecomment-471360328
                title.anchor = (_c = title.anchor) !== null && _c !== void 0 ? _c : 'start';
            }
            return util_1.isEmpty(title) ? undefined : title;
        }
        return undefined;
    }
    /**
     * Assemble the mark group for this model. We accept optional `signals` so that we can include concat top-level signals with the top-level model's local signals.
     */
    assembleGroup(signals = []) {
        const group = {};
        signals = signals.concat(this.assembleSignals());
        if (signals.length > 0) {
            group.signals = signals;
        }
        const layout = this.assembleLayout();
        if (layout) {
            group.layout = layout;
        }
        group.marks = [].concat(this.assembleHeaderMarks(), this.assembleMarks());
        // Only include scales if this spec is top-level or if parent is facet.
        // (Otherwise, it will be merged with upper-level's scope.)
        const scales = !this.parent || isFacetModel(this.parent) ? assemble_6.assembleScales(this) : [];
        if (scales.length > 0) {
            group.scales = scales;
        }
        const axes = this.assembleAxes();
        if (axes.length > 0) {
            group.axes = axes;
        }
        const legends = this.assembleLegends();
        if (legends.length > 0) {
            group.legends = legends;
        }
        return group;
    }
    getName(text) {
        return util_1.varName((this.name ? `${this.name}_` : '') + text);
    }
    getDataName(type) {
        return this.getName(data_1.DataSourceType[type].toLowerCase());
    }
    /**
     * Request a data source name for the given data source type and mark that data source as required.
     * This method should be called in parse, so that all used data source can be correctly instantiated in assembleData().
     * You can lookup the correct dataset name in assemble with `lookupDataSource`.
     */
    requestDataName(name) {
        const fullName = this.getDataName(name);
        // Increase ref count. This is critical because otherwise we won't create a data source.
        // We also increase the ref counts on OutputNode.getSource() calls.
        const refCounts = this.component.data.outputNodeRefCounts;
        refCounts[fullName] = (refCounts[fullName] || 0) + 1;
        return fullName;
    }
    getSizeSignalRef(layoutSizeType) {
        if (isFacetModel(this.parent)) {
            const sizeType = component_2.getSizeTypeFromLayoutSizeType(layoutSizeType);
            const channel = channel_1.getPositionScaleChannel(sizeType);
            const scaleComponent = this.component.scales[channel];
            if (scaleComponent && !scaleComponent.merged) {
                // independent scale
                const type = scaleComponent.get('type');
                const range = scaleComponent.get('range');
                if (scale_1.hasDiscreteDomain(type) && vega_schema_1.isVgRangeStep(range)) {
                    const scaleName = scaleComponent.get('name');
                    const domain = domain_1.assembleDomain(this, channel);
                    const field = domain_1.getFieldFromDomain(domain);
                    if (field) {
                        const fieldRef = channeldef_1.vgField({ aggregate: 'distinct', field }, { expr: 'datum' });
                        return {
                            signal: assemble_3.sizeExpr(scaleName, scaleComponent, fieldRef)
                        };
                    }
                    else {
                        log.warn(log.message.unknownField(channel));
                        return null;
                    }
                }
            }
        }
        return {
            signal: this.signalNameMap.get(this.getName(layoutSizeType))
        };
    }
    /**
     * Lookup the name of the datasource for an output node. You probably want to call this in assemble.
     */
    lookupDataSource(name) {
        const node = this.component.data.outputNodes[name];
        if (!node) {
            // Name not found in map so let's just return what we got.
            // This can happen if we already have the correct name.
            return name;
        }
        return node.getSource();
    }
    getSignalName(oldSignalName) {
        return this.signalNameMap.get(oldSignalName);
    }
    renameSignal(oldName, newName) {
        this.signalNameMap.rename(oldName, newName);
    }
    renameScale(oldName, newName) {
        this.scaleNameMap.rename(oldName, newName);
    }
    renameProjection(oldName, newName) {
        this.projectionNameMap.rename(oldName, newName);
    }
    /**
     * @return scale name for a given channel after the scale has been parsed and named.
     */
    scaleName(originalScaleName, parse) {
        if (parse) {
            // During the parse phase always return a value
            // No need to refer to rename map because a scale can't be renamed
            // before it has the original name.
            return this.getName(originalScaleName);
        }
        // If there is a scale for the channel, it should either
        // be in the scale component or exist in the name map
        if (
        // If there is a scale for the channel, there should be a local scale component for it
        (channel_1.isChannel(originalScaleName) && channel_1.isScaleChannel(originalScaleName) && this.component.scales[originalScaleName]) ||
            // in the scale name map (the scale get merged by its parent)
            this.scaleNameMap.has(this.getName(originalScaleName))) {
            return this.scaleNameMap.get(this.getName(originalScaleName));
        }
        return undefined;
    }
    /**
     * @return projection name after the projection has been parsed and named.
     */
    projectionName(parse) {
        if (parse) {
            // During the parse phase always return a value
            // No need to refer to rename map because a projection can't be renamed
            // before it has the original name.
            return this.getName('projection');
        }
        if ((this.component.projection && !this.component.projection.merged) ||
            this.projectionNameMap.has(this.getName('projection'))) {
            return this.projectionNameMap.get(this.getName('projection'));
        }
        return undefined;
    }
    /**
     * Traverse a model's hierarchy to get the scale component for a particular channel.
     */
    getScaleComponent(channel) {
        /* istanbul ignore next: This is warning for debugging test */
        if (!this.component.scales) {
            throw new Error('getScaleComponent cannot be called before parseScale(). Make sure you have called parseScale or use parseUnitModelWithScale().');
        }
        const localScaleComponent = this.component.scales[channel];
        if (localScaleComponent && !localScaleComponent.merged) {
            return localScaleComponent;
        }
        return this.parent ? this.parent.getScaleComponent(channel) : undefined;
    }
    /**
     * Traverse a model's hierarchy to get a particular selection component.
     */
    getSelectionComponent(variableName, origName) {
        let sel = this.component.selection[variableName];
        if (!sel && this.parent) {
            sel = this.parent.getSelectionComponent(variableName, origName);
        }
        if (!sel) {
            throw new Error(log.message.selectionNotFound(origName));
        }
        return sel;
    }
    /**
     * Returns true if the model has a signalRef for an axis orient.
     */
    hasAxisOrientSignalRef() {
        var _a, _b;
        return (((_a = this.component.axes.x) === null || _a === void 0 ? void 0 : _a.some(a => a.hasOrientSignalRef())) || ((_b = this.component.axes.y) === null || _b === void 0 ? void 0 : _b.some(a => a.hasOrientSignalRef())));
    }
}
exports.Model = Model;
/** Abstract class for UnitModel and FacetModel. Both of which can contain fieldDefs as a part of its own specification. */
class ModelWithField extends Model {
    /** Get "field" reference for Vega */
    vgField(channel, opt = {}) {
        const fieldDef = this.fieldDef(channel);
        if (!fieldDef) {
            return undefined;
        }
        return channeldef_1.vgField(fieldDef, opt);
    }
    reduceFieldDef(f, init) {
        return encoding_1.reduce(this.getMapping(), (acc, cd, c) => {
            const fieldDef = channeldef_1.getFieldDef(cd);
            if (fieldDef) {
                return f(acc, fieldDef, c);
            }
            return acc;
        }, init);
    }
    forEachFieldDef(f, t) {
        encoding_1.forEach(this.getMapping(), (cd, c) => {
            const fieldDef = channeldef_1.getFieldDef(cd);
            if (fieldDef) {
                f(fieldDef, c);
            }
        }, t);
    }
}
exports.ModelWithField = ModelWithField;
//# sourceMappingURL=model.js.map