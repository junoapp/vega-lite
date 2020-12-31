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
exports.parseData = exports.parseTransformArray = exports.findSource = void 0;
const _1 = require(".");
const data_1 = require("../../data");
const log = __importStar(require("../../log"));
const transform_1 = require("../../transform");
const util_1 = require("../../util");
const model_1 = require("../model");
const selection_1 = require("../selection");
const parse_1 = require("../selection/parse");
const aggregate_1 = require("./aggregate");
const bin_1 = require("./bin");
const calculate_1 = require("./calculate");
const dataflow_1 = require("./dataflow");
const density_1 = require("./density");
const facet_1 = require("./facet");
const filter_1 = require("./filter");
const filterinvalid_1 = require("./filterinvalid");
const flatten_1 = require("./flatten");
const fold_1 = require("./fold");
const formatparse_1 = require("./formatparse");
const geojson_1 = require("./geojson");
const geopoint_1 = require("./geopoint");
const graticule_1 = require("./graticule");
const identifier_1 = require("./identifier");
const impute_1 = require("./impute");
const joinaggregate_1 = require("./joinaggregate");
const joinaggregatefacet_1 = require("./joinaggregatefacet");
const loess_1 = require("./loess");
const lookup_1 = require("./lookup");
const pivot_1 = require("./pivot");
const quantile_1 = require("./quantile");
const regression_1 = require("./regression");
const sample_1 = require("./sample");
const sequence_1 = require("./sequence");
const source_1 = require("./source");
const stack_1 = require("./stack");
const timeunit_1 = require("./timeunit");
const window_1 = require("./window");
function findSource(data, sources) {
    var _a, _b, _c, _d;
    for (const other of sources) {
        const otherData = other.data;
        // if both datasets have a name defined, we cannot merge
        if (data.name && other.hasName() && data.name !== other.dataName) {
            continue;
        }
        const formatMesh = (_a = data['format']) === null || _a === void 0 ? void 0 : _a.mesh;
        const otherFeature = (_b = otherData.format) === null || _b === void 0 ? void 0 : _b.feature;
        // feature and mesh are mutually exclusive
        if (formatMesh && otherFeature) {
            continue;
        }
        // we have to extract the same feature or mesh
        const formatFeature = (_c = data['format']) === null || _c === void 0 ? void 0 : _c.feature;
        if ((formatFeature || otherFeature) && formatFeature !== otherFeature) {
            continue;
        }
        const otherMesh = (_d = otherData.format) === null || _d === void 0 ? void 0 : _d.mesh;
        if ((formatMesh || otherMesh) && formatMesh !== otherMesh) {
            continue;
        }
        if (data_1.isInlineData(data) && data_1.isInlineData(otherData)) {
            if (util_1.deepEqual(data.values, otherData.values)) {
                return other;
            }
        }
        else if (data_1.isUrlData(data) && data_1.isUrlData(otherData)) {
            if (data.url === otherData.url) {
                return other;
            }
        }
        else if (data_1.isNamedData(data)) {
            if (data.name === other.dataName) {
                return other;
            }
        }
    }
    return null;
}
exports.findSource = findSource;
function parseRoot(model, sources) {
    if (model.data || !model.parent) {
        // if the model defines a data source or is the root, create a source node
        if (model.data === null) {
            // data: null means we should ignore the parent's data so we just create a new data source
            const source = new source_1.SourceNode({ values: [] });
            sources.push(source);
            return source;
        }
        const existingSource = findSource(model.data, sources);
        if (existingSource) {
            if (!data_1.isGenerator(model.data)) {
                existingSource.data.format = util_1.mergeDeep({}, model.data.format, existingSource.data.format);
            }
            // if the new source has a name but the existing one does not, we can set it
            if (!existingSource.hasName() && model.data.name) {
                existingSource.dataName = model.data.name;
            }
            return existingSource;
        }
        else {
            const source = new source_1.SourceNode(model.data);
            sources.push(source);
            return source;
        }
    }
    else {
        // If we don't have a source defined (overriding parent's data), use the parent's facet root or main.
        return model.parent.component.data.facetRoot
            ? model.parent.component.data.facetRoot
            : model.parent.component.data.main;
    }
}
/**
 * Parses a transform array into a chain of connected dataflow nodes.
 */
function parseTransformArray(head, model, ancestorParse) {
    var _a, _b;
    let lookupCounter = 0;
    for (const t of model.transforms) {
        let derivedType = undefined;
        let transformNode;
        if (transform_1.isCalculate(t)) {
            transformNode = head = new calculate_1.CalculateNode(head, t);
            derivedType = 'derived';
        }
        else if (transform_1.isFilter(t)) {
            const implicit = formatparse_1.getImplicitFromFilterTransform(t);
            transformNode = head = (_a = formatparse_1.ParseNode.makeWithAncestors(head, {}, implicit, ancestorParse)) !== null && _a !== void 0 ? _a : head;
            head = new filter_1.FilterNode(head, model, t.filter);
        }
        else if (transform_1.isBin(t)) {
            transformNode = head = bin_1.BinNode.makeFromTransform(head, t, model);
            derivedType = 'number';
        }
        else if (transform_1.isTimeUnit(t)) {
            derivedType = 'date';
            const parsedAs = ancestorParse.getWithExplicit(t.field);
            // Create parse node because the input to time unit is always date.
            if (parsedAs.value === undefined) {
                head = new formatparse_1.ParseNode(head, { [t.field]: derivedType });
                ancestorParse.set(t.field, derivedType, false);
            }
            transformNode = head = timeunit_1.TimeUnitNode.makeFromTransform(head, t);
        }
        else if (transform_1.isAggregate(t)) {
            transformNode = head = aggregate_1.AggregateNode.makeFromTransform(head, t);
            derivedType = 'number';
            if (selection_1.requiresSelectionId(model)) {
                head = new identifier_1.IdentifierNode(head);
            }
        }
        else if (transform_1.isLookup(t)) {
            transformNode = head = lookup_1.LookupNode.make(head, model, t, lookupCounter++);
            derivedType = 'derived';
        }
        else if (transform_1.isWindow(t)) {
            transformNode = head = new window_1.WindowTransformNode(head, t);
            derivedType = 'number';
        }
        else if (transform_1.isJoinAggregate(t)) {
            transformNode = head = new joinaggregate_1.JoinAggregateTransformNode(head, t);
            derivedType = 'number';
        }
        else if (transform_1.isStack(t)) {
            transformNode = head = stack_1.StackNode.makeFromTransform(head, t);
            derivedType = 'derived';
        }
        else if (transform_1.isFold(t)) {
            transformNode = head = new fold_1.FoldTransformNode(head, t);
            derivedType = 'derived';
        }
        else if (transform_1.isFlatten(t)) {
            transformNode = head = new flatten_1.FlattenTransformNode(head, t);
            derivedType = 'derived';
        }
        else if (transform_1.isPivot(t)) {
            transformNode = head = new pivot_1.PivotTransformNode(head, t);
            derivedType = 'derived';
        }
        else if (transform_1.isSample(t)) {
            head = new sample_1.SampleTransformNode(head, t);
        }
        else if (transform_1.isImpute(t)) {
            transformNode = head = impute_1.ImputeNode.makeFromTransform(head, t);
            derivedType = 'derived';
        }
        else if (transform_1.isDensity(t)) {
            transformNode = head = new density_1.DensityTransformNode(head, t);
            derivedType = 'derived';
        }
        else if (transform_1.isQuantile(t)) {
            transformNode = head = new quantile_1.QuantileTransformNode(head, t);
            derivedType = 'derived';
        }
        else if (transform_1.isRegression(t)) {
            transformNode = head = new regression_1.RegressionTransformNode(head, t);
            derivedType = 'derived';
        }
        else if (transform_1.isLoess(t)) {
            transformNode = head = new loess_1.LoessTransformNode(head, t);
            derivedType = 'derived';
        }
        else {
            log.warn(log.message.invalidTransformIgnored(t));
            continue;
        }
        if (transformNode && derivedType !== undefined) {
            for (const field of (_b = transformNode.producedFields()) !== null && _b !== void 0 ? _b : []) {
                ancestorParse.set(field, derivedType, false);
            }
        }
    }
    return head;
}
exports.parseTransformArray = parseTransformArray;
/*
Description of the dataflow (http://asciiflow.com/):
     +--------+
     | Source |
     +---+----+
         |
         v
     FormatParse
     (explicit)
         |
         v
     Transforms
(Filter, Calculate, Binning, TimeUnit, Aggregate, Window, ...)
         |
         v
     FormatParse
     (implicit)
         |
         v
 Binning (in `encoding`)
         |
         v
 Timeunit (in `encoding`)
         |
         v
Formula From Sort Array
         |
         v
      +--+--+
      | Raw |
      +-----+
         |
         v
  Aggregate (in `encoding`)
         |
         v
  Stack (in `encoding`)
         |
         v
  Invalid Filter
         |
         v
   +----------+
   |   Main   |
   +----------+
         |
         v
     +-------+
     | Facet |----> "column", "column-layout", and "row"
     +-------+
         |
         v
  ...Child data...
*/
function parseData(model) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    let head = parseRoot(model, model.component.data.sources);
    const { outputNodes, outputNodeRefCounts } = model.component.data;
    const ancestorParse = model.parent ? model.parent.component.data.ancestorParse.clone() : new _1.AncestorParse();
    const data = model.data;
    if (data_1.isGenerator(data)) {
        // insert generator transform
        if (data_1.isSequenceGenerator(data)) {
            head = new sequence_1.SequenceNode(head, data.sequence);
        }
        else if (data_1.isGraticuleGenerator(data)) {
            head = new graticule_1.GraticuleNode(head, data.graticule);
        }
        // no parsing necessary for generator
        ancestorParse.parseNothing = true;
    }
    else if (((_a = data === null || data === void 0 ? void 0 : data.format) === null || _a === void 0 ? void 0 : _a.parse) === null) {
        // format.parse: null means disable parsing
        ancestorParse.parseNothing = true;
    }
    head = (_b = formatparse_1.ParseNode.makeExplicit(head, model, ancestorParse)) !== null && _b !== void 0 ? _b : head;
    // Default discrete selections require an identifer transform to
    // uniquely identify data points. Add this transform at the head of
    // the pipeline such that the identifier field is available for all
    // subsequent datasets. During optimization, we will remove this
    // transform if it proves to be unnecessary. Additional identifier
    // transforms will be necessary when new tuples are constructed
    // (e.g., post-aggregation).
    head = new identifier_1.IdentifierNode(head);
    // HACK: This is equivalent for merging bin extent for union scale.
    // FIXME(https://github.com/vega/vega-lite/issues/2270): Correctly merge extent / bin node for shared bin scale
    const parentIsLayer = model.parent && model_1.isLayerModel(model.parent);
    if (model_1.isUnitModel(model) || model_1.isFacetModel(model)) {
        if (parentIsLayer) {
            head = (_c = bin_1.BinNode.makeFromEncoding(head, model)) !== null && _c !== void 0 ? _c : head;
        }
    }
    if (model.transforms.length > 0) {
        head = parseTransformArray(head, model, ancestorParse);
    }
    // create parse nodes for fields that need to be parsed (or flattened) implicitly
    const implicitSelection = formatparse_1.getImplicitFromSelection(model);
    const implicitEncoding = formatparse_1.getImplicitFromEncoding(model);
    head = (_d = formatparse_1.ParseNode.makeWithAncestors(head, {}, Object.assign(Object.assign({}, implicitSelection), implicitEncoding), ancestorParse)) !== null && _d !== void 0 ? _d : head;
    if (model_1.isUnitModel(model)) {
        head = geojson_1.GeoJSONNode.parseAll(head, model);
        head = geopoint_1.GeoPointNode.parseAll(head, model);
    }
    if (model_1.isUnitModel(model) || model_1.isFacetModel(model)) {
        if (!parentIsLayer) {
            head = (_e = bin_1.BinNode.makeFromEncoding(head, model)) !== null && _e !== void 0 ? _e : head;
        }
        head = (_f = timeunit_1.TimeUnitNode.makeFromEncoding(head, model)) !== null && _f !== void 0 ? _f : head;
        head = calculate_1.CalculateNode.parseAllForSortIndex(head, model);
    }
    // add an output node pre aggregation
    const rawName = model.getDataName(data_1.DataSourceType.Raw);
    const raw = new dataflow_1.OutputNode(head, rawName, data_1.DataSourceType.Raw, outputNodeRefCounts);
    outputNodes[rawName] = raw;
    head = raw;
    if (model_1.isUnitModel(model)) {
        const agg = aggregate_1.AggregateNode.makeFromEncoding(head, model);
        if (agg) {
            head = agg;
            if (selection_1.requiresSelectionId(model)) {
                head = new identifier_1.IdentifierNode(head);
            }
        }
        head = (_g = impute_1.ImputeNode.makeFromEncoding(head, model)) !== null && _g !== void 0 ? _g : head;
        head = (_h = stack_1.StackNode.makeFromEncoding(head, model)) !== null && _h !== void 0 ? _h : head;
    }
    if (model_1.isUnitModel(model)) {
        head = (_j = filterinvalid_1.FilterInvalidNode.make(head, model)) !== null && _j !== void 0 ? _j : head;
    }
    // output node for marks
    const mainName = model.getDataName(data_1.DataSourceType.Main);
    const main = new dataflow_1.OutputNode(head, mainName, data_1.DataSourceType.Main, outputNodeRefCounts);
    outputNodes[mainName] = main;
    head = main;
    if (model_1.isUnitModel(model)) {
        parse_1.materializeSelections(model, main);
    }
    // add facet marker
    let facetRoot = null;
    if (model_1.isFacetModel(model)) {
        const facetName = model.getName('facet');
        // Derive new aggregate for facet's sort field
        // augment data source with new fields for crossed facet
        head = (_k = joinaggregatefacet_1.makeJoinAggregateFromFacet(head, model.facet)) !== null && _k !== void 0 ? _k : head;
        facetRoot = new facet_1.FacetNode(head, model, facetName, main.getSource());
        outputNodes[facetName] = facetRoot;
    }
    return Object.assign(Object.assign({}, model.component.data), { outputNodes,
        outputNodeRefCounts,
        raw,
        main,
        facetRoot,
        ancestorParse });
}
exports.parseData = parseData;
//# sourceMappingURL=parse.js.map