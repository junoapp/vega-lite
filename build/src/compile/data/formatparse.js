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
exports.ParseNode = exports.getImplicitFromSelection = exports.getImplicitFromEncoding = exports.getImplicitFromFilterTransform = void 0;
const vega_util_1 = require("vega-util");
const aggregate_1 = require("../../aggregate");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const data_1 = require("../../data");
const datetime_1 = require("../../datetime");
const log = __importStar(require("../../log"));
const logical_1 = require("../../logical");
const mark_1 = require("../../mark");
const predicate_1 = require("../../predicate");
const sort_1 = require("../../sort");
const util_1 = require("../../util");
const common_1 = require("../common");
const model_1 = require("../model");
const split_1 = require("../split");
const dataflow_1 = require("./dataflow");
/**
 * Remove quotes from a string.
 */
function unquote(pattern) {
    if ((pattern[0] === "'" && pattern[pattern.length - 1] === "'") ||
        (pattern[0] === '"' && pattern[pattern.length - 1] === '"')) {
        return pattern.slice(1, -1);
    }
    return pattern;
}
/**
 * @param field The field.
 * @param parse What to parse the field as.
 */
function parseExpression(field, parse) {
    const f = util_1.accessPathWithDatum(field);
    if (parse === 'number') {
        return `toNumber(${f})`;
    }
    else if (parse === 'boolean') {
        return `toBoolean(${f})`;
    }
    else if (parse === 'string') {
        return `toString(${f})`;
    }
    else if (parse === 'date') {
        return `toDate(${f})`;
    }
    else if (parse === 'flatten') {
        return f;
    }
    else if (parse.startsWith('date:')) {
        const specifier = unquote(parse.slice(5, parse.length));
        return `timeParse(${f},'${specifier}')`;
    }
    else if (parse.startsWith('utc:')) {
        const specifier = unquote(parse.slice(4, parse.length));
        return `utcParse(${f},'${specifier}')`;
    }
    else {
        log.warn(log.message.unrecognizedParse(parse));
        return null;
    }
}
function getImplicitFromFilterTransform(transform) {
    const implicit = {};
    logical_1.forEachLeaf(transform.filter, filter => {
        var _a;
        if (predicate_1.isFieldPredicate(filter)) {
            // Automatically add a parse node for filters with filter objects
            let val = null;
            // For EqualFilter, just use the equal property.
            // For RangeFilter and OneOfFilter, all array members should have
            // the same type, so we only use the first one.
            if (predicate_1.isFieldEqualPredicate(filter)) {
                val = common_1.signalRefOrValue(filter.equal);
            }
            else if (predicate_1.isFieldLTEPredicate(filter)) {
                val = common_1.signalRefOrValue(filter.lte);
            }
            else if (predicate_1.isFieldLTPredicate(filter)) {
                val = common_1.signalRefOrValue(filter.lt);
            }
            else if (predicate_1.isFieldGTPredicate(filter)) {
                val = common_1.signalRefOrValue(filter.gt);
            }
            else if (predicate_1.isFieldGTEPredicate(filter)) {
                val = common_1.signalRefOrValue(filter.gte);
            }
            else if (predicate_1.isFieldRangePredicate(filter)) {
                val = filter.range[0];
            }
            else if (predicate_1.isFieldOneOfPredicate(filter)) {
                val = ((_a = filter.oneOf) !== null && _a !== void 0 ? _a : filter['in'])[0];
            } // else -- for filter expression, we can't infer anything
            if (val) {
                if (datetime_1.isDateTime(val)) {
                    implicit[filter.field] = 'date';
                }
                else if (vega_util_1.isNumber(val)) {
                    implicit[filter.field] = 'number';
                }
                else if (vega_util_1.isString(val)) {
                    implicit[filter.field] = 'string';
                }
            }
            if (filter.timeUnit) {
                implicit[filter.field] = 'date';
            }
        }
    });
    return implicit;
}
exports.getImplicitFromFilterTransform = getImplicitFromFilterTransform;
/**
 * Creates a parse node for implicit parsing from a model and updates ancestorParse.
 */
function getImplicitFromEncoding(model) {
    const implicit = {};
    function add(fieldDef) {
        if (channeldef_1.isFieldOrDatumDefForTimeFormat(fieldDef)) {
            implicit[fieldDef.field] = 'date';
        }
        else if (fieldDef.type === 'quantitative' &&
            aggregate_1.isMinMaxOp(fieldDef.aggregate) // we need to parse numbers to support correct min and max
        ) {
            implicit[fieldDef.field] = 'number';
        }
        else if (util_1.accessPathDepth(fieldDef.field) > 1) {
            // For non-date/non-number (strings and booleans), derive a flattened field for a referenced nested field.
            // (Parsing numbers / dates already flattens numeric and temporal fields.)
            if (!(fieldDef.field in implicit)) {
                implicit[fieldDef.field] = 'flatten';
            }
        }
        else if (channeldef_1.isScaleFieldDef(fieldDef) && sort_1.isSortField(fieldDef.sort) && util_1.accessPathDepth(fieldDef.sort.field) > 1) {
            // Flatten fields that we sort by but that are not otherwise flattened.
            if (!(fieldDef.sort.field in implicit)) {
                implicit[fieldDef.sort.field] = 'flatten';
            }
        }
    }
    if (model_1.isUnitModel(model) || model_1.isFacetModel(model)) {
        // Parse encoded fields
        model.forEachFieldDef((fieldDef, channel) => {
            if (channeldef_1.isTypedFieldDef(fieldDef)) {
                add(fieldDef);
            }
            else {
                const mainChannel = channel_1.getMainRangeChannel(channel);
                const mainFieldDef = model.fieldDef(mainChannel);
                add(Object.assign(Object.assign({}, fieldDef), { type: mainFieldDef.type }));
            }
        });
    }
    // Parse quantitative dimension fields of path marks as numbers so that we sort them correctly.
    if (model_1.isUnitModel(model)) {
        const { mark, markDef, encoding } = model;
        if (mark_1.isPathMark(mark) &&
            // No need to sort by dimension if we have a connected scatterplot (order channel is present)
            !model.encoding.order) {
            const dimensionChannel = markDef.orient === 'horizontal' ? 'y' : 'x';
            const dimensionChannelDef = encoding[dimensionChannel];
            if (channeldef_1.isFieldDef(dimensionChannelDef) &&
                dimensionChannelDef.type === 'quantitative' &&
                !(dimensionChannelDef.field in implicit)) {
                implicit[dimensionChannelDef.field] = 'number';
            }
        }
    }
    return implicit;
}
exports.getImplicitFromEncoding = getImplicitFromEncoding;
/**
 * Creates a parse node for implicit parsing from a model and updates ancestorParse.
 */
function getImplicitFromSelection(model) {
    const implicit = {};
    if (model_1.isUnitModel(model) && model.component.selection) {
        for (const name of util_1.keys(model.component.selection)) {
            const selCmpt = model.component.selection[name];
            for (const proj of selCmpt.project.items) {
                if (!proj.channel && util_1.accessPathDepth(proj.field) > 1) {
                    implicit[proj.field] = 'flatten';
                }
            }
        }
    }
    return implicit;
}
exports.getImplicitFromSelection = getImplicitFromSelection;
class ParseNode extends dataflow_1.DataFlowNode {
    constructor(parent, parse) {
        super(parent);
        this._parse = parse;
    }
    clone() {
        return new ParseNode(null, util_1.duplicate(this._parse));
    }
    hash() {
        return `Parse ${util_1.hash(this._parse)}`;
    }
    /**
     * Creates a parse node from a data.format.parse and updates ancestorParse.
     */
    static makeExplicit(parent, model, ancestorParse) {
        // Custom parse
        let explicit = {};
        const data = model.data;
        if (!data_1.isGenerator(data) && data && data.format && data.format.parse) {
            explicit = data.format.parse;
        }
        return this.makeWithAncestors(parent, explicit, {}, ancestorParse);
    }
    /**
     * Creates a parse node from "explicit" parse and "implicit" parse and updates ancestorParse.
     */
    static makeWithAncestors(parent, explicit, implicit, ancestorParse) {
        // We should not parse what has already been parsed in a parent (explicitly or implicitly) or what has been derived (maked as "derived"). We also don't need to flatten a field that has already been parsed.
        for (const field of util_1.keys(implicit)) {
            const parsedAs = ancestorParse.getWithExplicit(field);
            if (parsedAs.value !== undefined) {
                // We always ignore derived fields even if they are implicitly defined because we expect users to create the right types.
                if (parsedAs.explicit ||
                    parsedAs.value === implicit[field] ||
                    parsedAs.value === 'derived' ||
                    implicit[field] === 'flatten') {
                    delete implicit[field];
                }
                else {
                    log.warn(log.message.differentParse(field, implicit[field], parsedAs.value));
                }
            }
        }
        for (const field of util_1.keys(explicit)) {
            const parsedAs = ancestorParse.get(field);
            if (parsedAs !== undefined) {
                // Don't parse a field again if it has been parsed with the same type already.
                if (parsedAs === explicit[field]) {
                    delete explicit[field];
                }
                else {
                    log.warn(log.message.differentParse(field, explicit[field], parsedAs));
                }
            }
        }
        const parse = new split_1.Split(explicit, implicit);
        // add the format parse from this model so that children don't parse the same field again
        ancestorParse.copyAll(parse);
        // copy only non-null parses
        const p = {};
        for (const key of util_1.keys(parse.combine())) {
            const val = parse.get(key);
            if (val !== null) {
                p[key] = val;
            }
        }
        if (util_1.keys(p).length === 0 || ancestorParse.parseNothing) {
            return null;
        }
        return new ParseNode(parent, p);
    }
    get parse() {
        return this._parse;
    }
    merge(other) {
        this._parse = Object.assign(Object.assign({}, this._parse), other.parse);
        other.remove();
    }
    /**
     * Assemble an object for Vega's format.parse property.
     */
    assembleFormatParse() {
        const formatParse = {};
        for (const field of util_1.keys(this._parse)) {
            const p = this._parse[field];
            if (util_1.accessPathDepth(field) === 1) {
                formatParse[field] = p;
            }
        }
        return formatParse;
    }
    // format parse depends and produces all fields in its parse
    producedFields() {
        return new Set(util_1.keys(this._parse));
    }
    dependentFields() {
        return new Set(util_1.keys(this._parse));
    }
    assembleTransforms(onlyNested = false) {
        return util_1.keys(this._parse)
            .filter(field => (onlyNested ? util_1.accessPathDepth(field) > 1 : true))
            .map(field => {
            const expr = parseExpression(field, this._parse[field]);
            if (!expr) {
                return null;
            }
            const formula = {
                type: 'formula',
                expr,
                as: util_1.removePathFromField(field) // Vega output is always flattened
            };
            return formula;
        })
            .filter(t => t !== null);
    }
}
exports.ParseNode = ParseNode;
//# sourceMappingURL=formatparse.js.map