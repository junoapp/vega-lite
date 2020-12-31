"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleRootData = exports.assembleFacetData = void 0;
const data_1 = require("../../data");
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
const loess_1 = require("./loess");
const lookup_1 = require("./lookup");
const quantile_1 = require("./quantile");
const regression_1 = require("./regression");
const pivot_1 = require("./pivot");
const sample_1 = require("./sample");
const sequence_1 = require("./sequence");
const source_1 = require("./source");
const stack_1 = require("./stack");
const timeunit_1 = require("./timeunit");
const window_1 = require("./window");
function makeWalkTree(data) {
    // to name datasources
    let datasetIndex = 0;
    /**
     * Recursively walk down the tree.
     */
    function walkTree(node, dataSource) {
        var _a;
        if (node instanceof source_1.SourceNode) {
            // If the source is a named data source or a data source with values, we need
            // to put it in a different data source. Otherwise, Vega may override the data.
            if (!node.isGenerator && !data_1.isUrlData(node.data)) {
                data.push(dataSource);
                const newData = {
                    name: null,
                    source: dataSource.name,
                    transform: []
                };
                dataSource = newData;
            }
        }
        if (node instanceof formatparse_1.ParseNode) {
            if (node.parent instanceof source_1.SourceNode && !dataSource.source) {
                // If node's parent is a root source and the data source does not refer to another data source, use normal format parse
                dataSource.format = Object.assign(Object.assign({}, ((_a = dataSource.format) !== null && _a !== void 0 ? _a : {})), { parse: node.assembleFormatParse() });
                // add calculates for all nested fields
                dataSource.transform.push(...node.assembleTransforms(true));
            }
            else {
                // Otherwise use Vega expression to parse
                dataSource.transform.push(...node.assembleTransforms());
            }
        }
        if (node instanceof facet_1.FacetNode) {
            if (!dataSource.name) {
                dataSource.name = `data_${datasetIndex++}`;
            }
            if (!dataSource.source || dataSource.transform.length > 0) {
                data.push(dataSource);
                node.data = dataSource.name;
            }
            else {
                node.data = dataSource.source;
            }
            data.push(...node.assemble());
            // break here because the rest of the tree has to be taken care of by the facet.
            return;
        }
        if (node instanceof graticule_1.GraticuleNode ||
            node instanceof sequence_1.SequenceNode ||
            node instanceof filterinvalid_1.FilterInvalidNode ||
            node instanceof filter_1.FilterNode ||
            node instanceof calculate_1.CalculateNode ||
            node instanceof geopoint_1.GeoPointNode ||
            node instanceof aggregate_1.AggregateNode ||
            node instanceof lookup_1.LookupNode ||
            node instanceof window_1.WindowTransformNode ||
            node instanceof joinaggregate_1.JoinAggregateTransformNode ||
            node instanceof fold_1.FoldTransformNode ||
            node instanceof flatten_1.FlattenTransformNode ||
            node instanceof density_1.DensityTransformNode ||
            node instanceof loess_1.LoessTransformNode ||
            node instanceof quantile_1.QuantileTransformNode ||
            node instanceof regression_1.RegressionTransformNode ||
            node instanceof identifier_1.IdentifierNode ||
            node instanceof sample_1.SampleTransformNode ||
            node instanceof pivot_1.PivotTransformNode) {
            dataSource.transform.push(node.assemble());
        }
        if (node instanceof bin_1.BinNode ||
            node instanceof timeunit_1.TimeUnitNode ||
            node instanceof impute_1.ImputeNode ||
            node instanceof stack_1.StackNode ||
            node instanceof geojson_1.GeoJSONNode) {
            dataSource.transform.push(...node.assemble());
        }
        if (node instanceof dataflow_1.OutputNode) {
            if (dataSource.source && dataSource.transform.length === 0) {
                node.setSource(dataSource.source);
            }
            else if (node.parent instanceof dataflow_1.OutputNode) {
                // Note that an output node may be required but we still do not assemble a
                // separate data source for it.
                node.setSource(dataSource.name);
            }
            else {
                if (!dataSource.name) {
                    dataSource.name = `data_${datasetIndex++}`;
                }
                // Here we set the name of the datasource we generated. From now on
                // other assemblers can use it.
                node.setSource(dataSource.name);
                // if this node has more than one child, we will add a datasource automatically
                if (node.numChildren() === 1) {
                    data.push(dataSource);
                    const newData = {
                        name: null,
                        source: dataSource.name,
                        transform: []
                    };
                    dataSource = newData;
                }
            }
        }
        switch (node.numChildren()) {
            case 0:
                // done
                if (node instanceof dataflow_1.OutputNode && (!dataSource.source || dataSource.transform.length > 0)) {
                    // do not push empty datasources that are simply references
                    data.push(dataSource);
                }
                break;
            case 1:
                walkTree(node.children[0], dataSource);
                break;
            default: {
                if (!dataSource.name) {
                    dataSource.name = `data_${datasetIndex++}`;
                }
                let source = dataSource.name;
                if (!dataSource.source || dataSource.transform.length > 0) {
                    data.push(dataSource);
                }
                else {
                    source = dataSource.source;
                }
                for (const child of node.children) {
                    const newData = {
                        name: null,
                        source: source,
                        transform: []
                    };
                    walkTree(child, newData);
                }
                break;
            }
        }
    }
    return walkTree;
}
/**
 * Assemble data sources that are derived from faceted data.
 */
function assembleFacetData(root) {
    const data = [];
    const walkTree = makeWalkTree(data);
    for (const child of root.children) {
        walkTree(child, {
            source: root.name,
            name: null,
            transform: []
        });
    }
    return data;
}
exports.assembleFacetData = assembleFacetData;
/**
 * Create Vega data array from a given compiled model and append all of them to the given array
 *
 * @param  model
 * @param  data array
 * @return modified data array
 */
function assembleRootData(dataComponent, datasets) {
    var _a, _b;
    const data = [];
    // dataComponent.sources.forEach(debug);
    // draw(dataComponent.sources);
    const walkTree = makeWalkTree(data);
    let sourceIndex = 0;
    for (const root of dataComponent.sources) {
        // assign a name if the source does not have a name yet
        if (!root.hasName()) {
            root.dataName = `source_${sourceIndex++}`;
        }
        const newData = root.assemble();
        walkTree(root, newData);
    }
    // remove empty transform arrays for cleaner output
    for (const d of data) {
        if (d.transform.length === 0) {
            delete d.transform;
        }
    }
    // move sources without transforms (the ones that are potentially used in lookups) to the beginning
    let whereTo = 0;
    for (const [i, d] of data.entries()) {
        if (((_a = d.transform) !== null && _a !== void 0 ? _a : []).length === 0 && !d.source) {
            data.splice(whereTo++, 0, data.splice(i, 1)[0]);
        }
    }
    // now fix the from references in lookup transforms
    for (const d of data) {
        for (const t of (_b = d.transform) !== null && _b !== void 0 ? _b : []) {
            if (t.type === 'lookup') {
                t.from = dataComponent.outputNodes[t.from].getSource();
            }
        }
    }
    // inline values for datasets that are in the datastore
    for (const d of data) {
        if (d.name in datasets) {
            d.values = datasets[d.name];
        }
    }
    return data;
}
exports.assembleRootData = assembleRootData;
//# sourceMappingURL=assemble.js.map