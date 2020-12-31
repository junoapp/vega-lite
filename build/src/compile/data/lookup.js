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
exports.LookupNode = void 0;
const vega_util_1 = require("vega-util");
const log = __importStar(require("../../log"));
const transform_1 = require("../../transform");
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
const parse_1 = require("./parse");
const source_1 = require("./source");
const data_1 = require("../../data");
class LookupNode extends dataflow_1.DataFlowNode {
    constructor(parent, transform, secondary) {
        super(parent);
        this.transform = transform;
        this.secondary = secondary;
    }
    clone() {
        return new LookupNode(null, util_1.duplicate(this.transform), this.secondary);
    }
    static make(parent, model, transform, counter) {
        const sources = model.component.data.sources;
        const { from } = transform;
        let fromOutputNode = null;
        if (transform_1.isLookupData(from)) {
            let fromSource = parse_1.findSource(from.data, sources);
            if (!fromSource) {
                fromSource = new source_1.SourceNode(from.data);
                sources.push(fromSource);
            }
            const fromOutputName = model.getName(`lookup_${counter}`);
            fromOutputNode = new dataflow_1.OutputNode(fromSource, fromOutputName, data_1.DataSourceType.Lookup, model.component.data.outputNodeRefCounts);
            model.component.data.outputNodes[fromOutputName] = fromOutputNode;
        }
        else if (transform_1.isLookupSelection(from)) {
            const selName = from.selection;
            transform = Object.assign({ as: selName }, transform);
            fromOutputNode = model.getSelectionComponent(util_1.varName(selName), selName).materialized;
            if (!fromOutputNode) {
                throw new Error(log.message.noSameUnitLookup(selName));
            }
        }
        return new LookupNode(parent, transform, fromOutputNode.getSource());
    }
    dependentFields() {
        return new Set([this.transform.lookup]);
    }
    producedFields() {
        return new Set(this.transform.as ? vega_util_1.array(this.transform.as) : this.transform.from.fields);
    }
    hash() {
        return `Lookup ${util_1.hash({ transform: this.transform, secondary: this.secondary })}`;
    }
    assemble() {
        let foreign;
        if (this.transform.from.fields) {
            // lookup a few fields and add create a flat output
            foreign = Object.assign({ values: this.transform.from.fields }, (this.transform.as ? { as: vega_util_1.array(this.transform.as) } : {}));
        }
        else {
            // lookup full record and nest it
            let asName = this.transform.as;
            if (!vega_util_1.isString(asName)) {
                log.warn(log.message.NO_FIELDS_NEEDS_AS);
                asName = '_lookup';
            }
            foreign = {
                as: [asName]
            };
        }
        return Object.assign(Object.assign({ type: 'lookup', from: this.secondary, key: this.transform.from.key, fields: [this.transform.lookup] }, foreign), (this.transform.default ? { default: this.transform.default } : {}));
    }
}
exports.LookupNode = LookupNode;
//# sourceMappingURL=lookup.js.map