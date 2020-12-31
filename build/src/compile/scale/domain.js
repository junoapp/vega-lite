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
exports.assembleDomain = exports.getFieldFromDomain = exports.mergeDomains = exports.canUseUnaggregatedDomain = exports.domainSort = exports.parseDomainForChannel = exports.parseScaleDomain = void 0;
const vega_util_1 = require("vega-util");
const aggregate_1 = require("../../aggregate");
const bin_1 = require("../../bin");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const data_1 = require("../../data");
const log = __importStar(require("../../log"));
const scale_1 = require("../../scale");
const sort_1 = require("../../sort");
const timeunit_1 = require("../../timeunit");
const util = __importStar(require("../../util"));
const vega_schema_1 = require("../../vega.schema");
const bin_2 = require("../data/bin");
const calculate_1 = require("../data/calculate");
const optimize_1 = require("../data/optimize");
const model_1 = require("../model");
const signal_1 = require("../signal");
const split_1 = require("../split");
function parseScaleDomain(model) {
    if (model_1.isUnitModel(model)) {
        parseUnitScaleDomain(model);
    }
    else {
        parseNonUnitScaleDomain(model);
    }
}
exports.parseScaleDomain = parseScaleDomain;
function parseUnitScaleDomain(model) {
    const localScaleComponents = model.component.scales;
    for (const channel of util.keys(localScaleComponents)) {
        const domains = parseDomainForChannel(model, channel);
        const localScaleCmpt = localScaleComponents[channel];
        localScaleCmpt.setWithExplicit('domains', domains);
        parseSelectionDomain(model, channel);
        if (model.component.data.isFaceted) {
            // get resolve from closest facet parent as this decides whether we need to refer to cloned subtree or not
            let facetParent = model;
            while (!model_1.isFacetModel(facetParent) && facetParent.parent) {
                facetParent = facetParent.parent;
            }
            const resolve = facetParent.component.resolve.scale[channel];
            if (resolve === 'shared') {
                for (const domain of domains.value) {
                    // Replace the scale domain with data output from a cloned subtree after the facet.
                    if (vega_schema_1.isDataRefDomain(domain)) {
                        // use data from cloned subtree (which is the same as data but with a prefix added once)
                        domain.data = optimize_1.FACET_SCALE_PREFIX + domain.data.replace(optimize_1.FACET_SCALE_PREFIX, '');
                    }
                }
            }
        }
    }
}
function parseNonUnitScaleDomain(model) {
    for (const child of model.children) {
        parseScaleDomain(child);
    }
    const localScaleComponents = model.component.scales;
    for (const channel of util.keys(localScaleComponents)) {
        let domains;
        let selectionExtent = null;
        for (const child of model.children) {
            const childComponent = child.component.scales[channel];
            if (childComponent) {
                if (domains === undefined) {
                    domains = childComponent.getWithExplicit('domains');
                }
                else {
                    domains = split_1.mergeValuesWithExplicit(domains, childComponent.getWithExplicit('domains'), 'domains', 'scale', domainsTieBreaker);
                }
                const se = childComponent.get('selectionExtent');
                if (selectionExtent && se && selectionExtent.selection !== se.selection) {
                    log.warn(log.message.NEEDS_SAME_SELECTION);
                }
                selectionExtent = se;
            }
        }
        localScaleComponents[channel].setWithExplicit('domains', domains);
        if (selectionExtent) {
            localScaleComponents[channel].set('selectionExtent', selectionExtent, true);
        }
    }
}
/**
 * Remove unaggregated domain if it is not applicable
 * Add unaggregated domain if domain is not specified and config.scale.useUnaggregatedDomain is true.
 */
function normalizeUnaggregatedDomain(domain, fieldDef, scaleType, scaleConfig) {
    if (domain === 'unaggregated') {
        const { valid, reason } = canUseUnaggregatedDomain(fieldDef, scaleType);
        if (!valid) {
            log.warn(reason);
            return undefined;
        }
    }
    else if (domain === undefined && scaleConfig.useUnaggregatedDomain) {
        // Apply config if domain is not specified.
        const { valid } = canUseUnaggregatedDomain(fieldDef, scaleType);
        if (valid) {
            return 'unaggregated';
        }
    }
    return domain;
}
function parseDomainForChannel(model, channel) {
    const scaleType = model.getScaleComponent(channel).get('type');
    const { encoding } = model;
    const domain = normalizeUnaggregatedDomain(model.scaleDomain(channel), model.typedFieldDef(channel), scaleType, model.config.scale);
    if (domain !== model.scaleDomain(channel)) {
        model.specifiedScales[channel] = Object.assign(Object.assign({}, model.specifiedScales[channel]), { domain });
    }
    // If channel is either X or Y then union them with X2 & Y2 if they exist
    if (channel === 'x' && channeldef_1.getFieldOrDatumDef(encoding.x2)) {
        if (channeldef_1.getFieldOrDatumDef(encoding.x)) {
            return split_1.mergeValuesWithExplicit(parseSingleChannelDomain(scaleType, domain, model, 'x'), parseSingleChannelDomain(scaleType, domain, model, 'x2'), 'domain', 'scale', domainsTieBreaker);
        }
        else {
            return parseSingleChannelDomain(scaleType, domain, model, 'x2');
        }
    }
    else if (channel === 'y' && channeldef_1.getFieldOrDatumDef(encoding.y2)) {
        if (channeldef_1.getFieldOrDatumDef(encoding.y)) {
            return split_1.mergeValuesWithExplicit(parseSingleChannelDomain(scaleType, domain, model, 'y'), parseSingleChannelDomain(scaleType, domain, model, 'y2'), 'domain', 'scale', domainsTieBreaker);
        }
        else {
            return parseSingleChannelDomain(scaleType, domain, model, 'y2');
        }
    }
    return parseSingleChannelDomain(scaleType, domain, model, channel);
}
exports.parseDomainForChannel = parseDomainForChannel;
function mapDomainToDataSignal(domain, type, timeUnit) {
    return domain.map(v => {
        const data = channeldef_1.valueExpr(v, { timeUnit, type });
        return { signal: `{data: ${data}}` };
    });
}
function convertDomainIfItIsDateTime(domain, type, timeUnit) {
    var _a;
    // explicit value
    const normalizedTimeUnit = (_a = timeunit_1.normalizeTimeUnit(timeUnit)) === null || _a === void 0 ? void 0 : _a.unit;
    if (type === 'temporal' || normalizedTimeUnit) {
        return mapDomainToDataSignal(domain, type, normalizedTimeUnit);
    }
    return [domain]; // Date time won't make sense
}
function parseSingleChannelDomain(scaleType, domain, model, channel) {
    const { encoding } = model;
    const fieldOrDatumDef = channeldef_1.getFieldOrDatumDef(encoding[channel]);
    const { type } = fieldOrDatumDef;
    const timeUnit = fieldOrDatumDef['timeUnit'];
    if (scale_1.isDomainUnionWith(domain)) {
        const defaultDomain = parseSingleChannelDomain(scaleType, undefined, model, channel);
        const unionWith = convertDomainIfItIsDateTime(domain.unionWith, type, timeUnit);
        return split_1.makeExplicit([...defaultDomain.value, ...unionWith]);
    }
    else if (vega_schema_1.isSignalRef(domain)) {
        return split_1.makeExplicit([domain]);
    }
    else if (domain && domain !== 'unaggregated' && !scale_1.isSelectionDomain(domain)) {
        return split_1.makeExplicit(convertDomainIfItIsDateTime(domain, type, timeUnit));
    }
    const stack = model.stack;
    if (stack && channel === stack.fieldChannel) {
        if (stack.offset === 'normalize') {
            return split_1.makeImplicit([[0, 1]]);
        }
        const data = model.requestDataName(data_1.DataSourceType.Main);
        return split_1.makeImplicit([
            {
                data,
                field: model.vgField(channel, { suffix: 'start' })
            },
            {
                data,
                field: model.vgField(channel, { suffix: 'end' })
            }
        ]);
    }
    const sort = channel_1.isScaleChannel(channel) && channeldef_1.isFieldDef(fieldOrDatumDef) ? domainSort(model, channel, scaleType) : undefined;
    if (channeldef_1.isDatumDef(fieldOrDatumDef)) {
        const d = convertDomainIfItIsDateTime([fieldOrDatumDef.datum], type, timeUnit);
        return split_1.makeImplicit(d);
    }
    const fieldDef = fieldOrDatumDef; // now we can be sure it's a fieldDef
    if (domain === 'unaggregated') {
        const data = model.requestDataName(data_1.DataSourceType.Main);
        const { field } = fieldOrDatumDef;
        return split_1.makeImplicit([
            {
                data,
                field: channeldef_1.vgField({ field, aggregate: 'min' })
            },
            {
                data,
                field: channeldef_1.vgField({ field, aggregate: 'max' })
            }
        ]);
    }
    else if (bin_1.isBinning(fieldDef.bin)) {
        if (scale_1.hasDiscreteDomain(scaleType)) {
            if (scaleType === 'bin-ordinal') {
                // we can omit the domain as it is inferred from the `bins` property
                return split_1.makeImplicit([]);
            }
            // ordinal bin scale takes domain from bin_range, ordered by bin start
            // This is useful for both axis-based scale (x/y) and legend-based scale (other channels).
            return split_1.makeImplicit([
                {
                    // If sort by aggregation of a specified sort field, we need to use RAW table,
                    // so we can aggregate values for the scale independently from the main aggregation.
                    data: util.isBoolean(sort)
                        ? model.requestDataName(data_1.DataSourceType.Main)
                        : model.requestDataName(data_1.DataSourceType.Raw),
                    // Use range if we added it and the scale does not support computing a range as a signal.
                    field: model.vgField(channel, channeldef_1.binRequiresRange(fieldDef, channel) ? { binSuffix: 'range' } : {}),
                    // we have to use a sort object if sort = true to make the sort correct by bin start
                    sort: sort === true || !vega_util_1.isObject(sort)
                        ? {
                            field: model.vgField(channel, {}),
                            op: 'min' // min or max doesn't matter since we sort by the start of the bin range
                        }
                        : sort
                }
            ]);
        }
        else {
            // continuous scales
            const { bin } = fieldDef;
            if (bin_1.isBinning(bin)) {
                const binSignal = bin_2.getBinSignalName(model, fieldDef.field, bin);
                return split_1.makeImplicit([
                    new signal_1.SignalRefWrapper(() => {
                        const signal = model.getSignalName(binSignal);
                        return `[${signal}.start, ${signal}.stop]`;
                    })
                ]);
            }
            else {
                return split_1.makeImplicit([
                    {
                        data: model.requestDataName(data_1.DataSourceType.Main),
                        field: model.vgField(channel, {})
                    }
                ]);
            }
        }
    }
    else if (fieldDef.timeUnit &&
        util.contains(['time', 'utc'], scaleType) &&
        channeldef_1.hasBand(channel, fieldDef, model_1.isUnitModel(model) ? model.encoding[channel_1.getSecondaryRangeChannel(channel)] : undefined, model.stack, model.markDef, model.config)) {
        const data = model.requestDataName(data_1.DataSourceType.Main);
        return split_1.makeImplicit([
            {
                data,
                field: model.vgField(channel)
            },
            {
                data,
                field: model.vgField(channel, { suffix: 'end' })
            }
        ]);
    }
    else if (sort) {
        return split_1.makeImplicit([
            {
                // If sort by aggregation of a specified sort field, we need to use RAW table,
                // so we can aggregate values for the scale independently from the main aggregation.
                data: util.isBoolean(sort)
                    ? model.requestDataName(data_1.DataSourceType.Main)
                    : model.requestDataName(data_1.DataSourceType.Raw),
                field: model.vgField(channel),
                sort: sort
            }
        ]);
    }
    else {
        return split_1.makeImplicit([
            {
                data: model.requestDataName(data_1.DataSourceType.Main),
                field: model.vgField(channel)
            }
        ]);
    }
}
function normalizeSortField(sort, isStackedMeasure) {
    const { op, field, order } = sort;
    return Object.assign(Object.assign({ 
        // Apply default op
        op: op !== null && op !== void 0 ? op : (isStackedMeasure ? 'sum' : sort_1.DEFAULT_SORT_OP) }, (field ? { field: util.replacePathInField(field) } : {})), (order ? { order } : {}));
}
function parseSelectionDomain(model, channel) {
    var _a;
    const scale = model.component.scales[channel];
    const spec = model.specifiedScales[channel].domain;
    const bin = (_a = model.fieldDef(channel)) === null || _a === void 0 ? void 0 : _a.bin;
    const domain = scale_1.isSelectionDomain(spec) && spec;
    const extent = bin_1.isBinParams(bin) && bin_1.isSelectionExtent(bin.extent) && bin.extent;
    if (domain || extent) {
        // As scale parsing occurs before selection parsing, we cannot set
        // domainRaw directly. So instead, we store the selectionExtent on
        // the scale component, and then add domainRaw during scale assembly.
        scale.set('selectionExtent', domain !== null && domain !== void 0 ? domain : extent, true);
    }
}
function domainSort(model, channel, scaleType) {
    if (!scale_1.hasDiscreteDomain(scaleType)) {
        return undefined;
    }
    // save to cast as the only exception is the geojson type for shape, which would not generate a scale
    const fieldDef = model.fieldDef(channel);
    const sort = fieldDef.sort;
    // if the sort is specified with array, use the derived sort index field
    if (sort_1.isSortArray(sort)) {
        return {
            op: 'min',
            field: calculate_1.sortArrayIndexField(fieldDef, channel),
            order: 'ascending'
        };
    }
    const { stack } = model;
    const stackDimensions = stack
        ? [...(stack.groupbyField ? [stack.groupbyField] : []), ...stack.stackBy.map(s => s.fieldDef.field)]
        : undefined;
    // Sorted based on an aggregate calculation over a specified sort field (only for ordinal scale)
    if (sort_1.isSortField(sort)) {
        const isStackedMeasure = stack && !util.contains(stackDimensions, sort.field);
        return normalizeSortField(sort, isStackedMeasure);
    }
    else if (sort_1.isSortByEncoding(sort)) {
        const { encoding, order } = sort;
        const fieldDefToSortBy = model.fieldDef(encoding);
        const { aggregate, field } = fieldDefToSortBy;
        const isStackedMeasure = stack && !util.contains(stackDimensions, field);
        if (aggregate_1.isArgminDef(aggregate) || aggregate_1.isArgmaxDef(aggregate)) {
            return normalizeSortField({
                field: channeldef_1.vgField(fieldDefToSortBy),
                order
            }, isStackedMeasure);
        }
        else if (aggregate_1.isAggregateOp(aggregate) || !aggregate) {
            return normalizeSortField({
                op: aggregate,
                field,
                order
            }, isStackedMeasure);
        }
    }
    else if (sort === 'descending') {
        return {
            op: 'min',
            field: model.vgField(channel),
            order: 'descending'
        };
    }
    else if (util.contains(['ascending', undefined /* default =ascending*/], sort)) {
        return true;
    }
    // sort == null
    return undefined;
}
exports.domainSort = domainSort;
/**
 * Determine if a scale can use unaggregated domain.
 * @return {Boolean} Returns true if all of the following conditions apply:
 * 1. `scale.domain` is `unaggregated`
 * 2. Aggregation function is not `count` or `sum`
 * 3. The scale is quantitative or time scale.
 */
function canUseUnaggregatedDomain(fieldDef, scaleType) {
    const { aggregate, type } = fieldDef;
    if (!aggregate) {
        return {
            valid: false,
            reason: log.message.unaggregateDomainHasNoEffectForRawField(fieldDef)
        };
    }
    if (vega_util_1.isString(aggregate) && !aggregate_1.SHARED_DOMAIN_OP_INDEX[aggregate]) {
        return {
            valid: false,
            reason: log.message.unaggregateDomainWithNonSharedDomainOp(aggregate)
        };
    }
    if (type === 'quantitative') {
        if (scaleType === 'log') {
            return {
                valid: false,
                reason: log.message.unaggregatedDomainWithLogScale(fieldDef)
            };
        }
    }
    return { valid: true };
}
exports.canUseUnaggregatedDomain = canUseUnaggregatedDomain;
/**
 * Tie breaker for mergeValuesWithExplicit for domains. We concat the specified values.
 */
function domainsTieBreaker(v1, v2, property, propertyOf) {
    if (v1.explicit && v2.explicit) {
        log.warn(log.message.mergeConflictingDomainProperty(property, propertyOf, v1.value, v2.value));
    }
    // If equal score, concat the domains so that we union them later.
    return { explicit: v1.explicit, value: [...v1.value, ...v2.value] };
}
/**
 * Converts an array of domains to a single Vega scale domain.
 */
function mergeDomains(domains) {
    const uniqueDomains = util.unique(domains.map(domain => {
        // ignore sort property when computing the unique domains
        if (vega_schema_1.isDataRefDomain(domain)) {
            const { sort: _s } = domain, domainWithoutSort = __rest(domain, ["sort"]);
            return domainWithoutSort;
        }
        return domain;
    }), util.hash);
    const sorts = util.unique(domains
        .map(d => {
        if (vega_schema_1.isDataRefDomain(d)) {
            const s = d.sort;
            if (s !== undefined && !util.isBoolean(s)) {
                if ('op' in s && s.op === 'count') {
                    // let's make sure that if op is count, we don't use a field
                    delete s.field;
                }
                if (s.order === 'ascending') {
                    // drop order: ascending as it is the default
                    delete s.order;
                }
            }
            return s;
        }
        return undefined;
    })
        .filter(s => s !== undefined), util.hash);
    if (uniqueDomains.length === 0) {
        return undefined;
    }
    else if (uniqueDomains.length === 1) {
        const domain = domains[0];
        if (vega_schema_1.isDataRefDomain(domain) && sorts.length > 0) {
            let sort = sorts[0];
            if (sorts.length > 1) {
                log.warn(log.message.MORE_THAN_ONE_SORT);
                sort = true;
            }
            else {
                // Simplify domain sort by removing field and op when the field is the same as the domain field.
                if (vega_util_1.isObject(sort) && 'field' in sort) {
                    const sortField = sort.field;
                    if (domain.field === sortField) {
                        sort = sort.order ? { order: sort.order } : true;
                    }
                }
            }
            return Object.assign(Object.assign({}, domain), { sort });
        }
        return domain;
    }
    // only keep sort properties that work with unioned domains
    const unionDomainSorts = util.unique(sorts.map(s => {
        if (util.isBoolean(s) || !('op' in s) || (vega_util_1.isString(s.op) && s.op in aggregate_1.MULTIDOMAIN_SORT_OP_INDEX)) {
            return s;
        }
        log.warn(log.message.domainSortDropped(s));
        return true;
    }), util.hash);
    let sort;
    if (unionDomainSorts.length === 1) {
        sort = unionDomainSorts[0];
    }
    else if (unionDomainSorts.length > 1) {
        log.warn(log.message.MORE_THAN_ONE_SORT);
        sort = true;
    }
    const allData = util.unique(domains.map(d => {
        if (vega_schema_1.isDataRefDomain(d)) {
            return d.data;
        }
        return null;
    }), x => x);
    if (allData.length === 1 && allData[0] !== null) {
        // create a union domain of different fields with a single data source
        const domain = Object.assign({ data: allData[0], fields: uniqueDomains.map(d => d.field) }, (sort ? { sort } : {}));
        return domain;
    }
    return Object.assign({ fields: uniqueDomains }, (sort ? { sort } : {}));
}
exports.mergeDomains = mergeDomains;
/**
 * Return a field if a scale uses a single field.
 * Return `undefined` otherwise.
 */
function getFieldFromDomain(domain) {
    if (vega_schema_1.isDataRefDomain(domain) && vega_util_1.isString(domain.field)) {
        return domain.field;
    }
    else if (vega_schema_1.isDataRefUnionedDomain(domain)) {
        let field;
        for (const nonUnionDomain of domain.fields) {
            if (vega_schema_1.isDataRefDomain(nonUnionDomain) && vega_util_1.isString(nonUnionDomain.field)) {
                if (!field) {
                    field = nonUnionDomain.field;
                }
                else if (field !== nonUnionDomain.field) {
                    log.warn(log.message.FACETED_INDEPENDENT_DIFFERENT_SOURCES);
                    return field;
                }
            }
        }
        log.warn(log.message.FACETED_INDEPENDENT_SAME_FIELDS_DIFFERENT_SOURCES);
        return field;
    }
    else if (vega_schema_1.isFieldRefUnionDomain(domain)) {
        log.warn(log.message.FACETED_INDEPENDENT_SAME_SOURCE);
        const field = domain.fields[0];
        return vega_util_1.isString(field) ? field : undefined;
    }
    return undefined;
}
exports.getFieldFromDomain = getFieldFromDomain;
function assembleDomain(model, channel) {
    const scaleComponent = model.component.scales[channel];
    const domains = scaleComponent.get('domains').map((domain) => {
        // Correct references to data as the original domain's data was determined
        // in parseScale, which happens before parseData. Thus the original data
        // reference can be incorrect.
        if (vega_schema_1.isDataRefDomain(domain)) {
            domain.data = model.lookupDataSource(domain.data);
        }
        return domain;
    });
    // domains is an array that has to be merged into a single vega domain
    return mergeDomains(domains);
}
exports.assembleDomain = assembleDomain;
//# sourceMappingURL=domain.js.map