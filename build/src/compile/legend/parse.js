"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeLegendComponent = exports.parseLegendForChannel = exports.parseLegend = void 0;
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const legend_1 = require("../../legend");
const timeunit_1 = require("../../timeunit");
const type_1 = require("../../type");
const util_1 = require("../../util");
const common_1 = require("../common");
const guide_1 = require("../guide");
const model_1 = require("../model");
const resolve_1 = require("../resolve");
const legends_1 = require("../selection/transforms/legends");
const split_1 = require("../split");
const component_1 = require("./component");
const encode_1 = require("./encode");
const properties_1 = require("./properties");
function parseLegend(model) {
    const legendComponent = model_1.isUnitModel(model) ? parseUnitLegend(model) : parseNonUnitLegend(model);
    model.component.legends = legendComponent;
    return legendComponent;
}
exports.parseLegend = parseLegend;
function parseUnitLegend(model) {
    const { encoding } = model;
    const legendComponent = {};
    for (const channel of [channel_1.COLOR, ...legend_1.LEGEND_SCALE_CHANNELS]) {
        const def = channeldef_1.getFieldOrDatumDef(encoding[channel]);
        if (!def || !model.getScaleComponent(channel)) {
            continue;
        }
        if (channel === channel_1.SHAPE && channeldef_1.isFieldDef(def) && def.type === type_1.GEOJSON) {
            continue;
        }
        legendComponent[channel] = parseLegendForChannel(model, channel);
    }
    return legendComponent;
}
function getLegendDefWithScale(model, channel) {
    const scale = model.scaleName(channel);
    if (model.mark === 'trail') {
        if (channel === 'color') {
            // trail is a filled mark, but its default symbolType ("stroke") should use "stroke"
            return { stroke: scale };
        }
        else if (channel === 'size') {
            return { strokeWidth: scale };
        }
    }
    if (channel === 'color') {
        return model.markDef.filled ? { fill: scale } : { stroke: scale };
    }
    return { [channel]: scale };
}
// eslint-disable-next-line @typescript-eslint/ban-types
function isExplicit(value, property, legend, fieldDef) {
    switch (property) {
        case 'disable':
            return legend !== undefined; // if axis is specified or null/false, then its enable/disable state is explicit
        case 'values':
            // specified legend.values is already respected, but may get transformed.
            return !!(legend === null || legend === void 0 ? void 0 : legend.values);
        case 'title':
            // title can be explicit if fieldDef.title is set
            if (property === 'title' && value === (fieldDef === null || fieldDef === void 0 ? void 0 : fieldDef.title)) {
                return true;
            }
    }
    // Otherwise, things are explicit if the returned value matches the specified property
    return value === (legend || {})[property];
}
function parseLegendForChannel(model, channel) {
    var _a, _b, _c;
    let legend = model.legend(channel);
    const { markDef, encoding, config } = model;
    const legendConfig = config.legend;
    const legendCmpt = new component_1.LegendComponent({}, getLegendDefWithScale(model, channel));
    legends_1.parseInteractiveLegend(model, channel, legendCmpt);
    const disable = legend !== undefined ? !legend : legendConfig.disable;
    legendCmpt.set('disable', disable, legend !== undefined);
    if (disable) {
        return legendCmpt;
    }
    legend = legend || {};
    const scaleType = model.getScaleComponent(channel).get('type');
    const fieldOrDatumDef = channeldef_1.getFieldOrDatumDef(encoding[channel]);
    const timeUnit = channeldef_1.isFieldDef(fieldOrDatumDef) ? (_a = timeunit_1.normalizeTimeUnit(fieldOrDatumDef.timeUnit)) === null || _a === void 0 ? void 0 : _a.unit : undefined;
    const orient = legend.orient || config.legend.orient || 'right';
    const legendType = properties_1.getLegendType({ legend, channel, timeUnit, scaleType });
    const direction = properties_1.getDirection({ legend, legendType, orient, legendConfig });
    const ruleParams = {
        legend,
        channel,
        model,
        markDef,
        encoding,
        fieldOrDatumDef,
        legendConfig,
        config,
        scaleType,
        orient,
        legendType,
        direction
    };
    for (const property of component_1.LEGEND_COMPONENT_PROPERTIES) {
        if ((legendType === 'gradient' && property.startsWith('symbol')) ||
            (legendType === 'symbol' && property.startsWith('gradient'))) {
            continue;
        }
        const value = property in properties_1.legendRules ? properties_1.legendRules[property](ruleParams) : legend[property];
        if (value !== undefined) {
            const explicit = isExplicit(value, property, legend, model.fieldDef(channel));
            if (explicit || config.legend[property] === undefined) {
                legendCmpt.set(property, value, explicit);
            }
        }
    }
    const legendEncoding = (_b = legend === null || legend === void 0 ? void 0 : legend.encoding) !== null && _b !== void 0 ? _b : {};
    const selections = legendCmpt.get('selections');
    const legendEncode = {};
    const legendEncodeParams = { fieldOrDatumDef, model, channel, legendCmpt, legendType };
    for (const part of ['labels', 'legend', 'title', 'symbols', 'gradient', 'entries']) {
        const legendEncodingPart = guide_1.guideEncodeEntry((_c = legendEncoding[part]) !== null && _c !== void 0 ? _c : {}, model);
        const value = part in encode_1.legendEncodeRules
            ? encode_1.legendEncodeRules[part](legendEncodingPart, legendEncodeParams) // apply rule
            : legendEncodingPart; // no rule -- just default values
        if (value !== undefined && !util_1.isEmpty(value)) {
            legendEncode[part] = Object.assign(Object.assign(Object.assign({}, ((selections === null || selections === void 0 ? void 0 : selections.length) && channeldef_1.isFieldDef(fieldOrDatumDef)
                ? { name: `${util_1.varName(fieldOrDatumDef.field)}_legend_${part}` }
                : {})), ((selections === null || selections === void 0 ? void 0 : selections.length) ? { interactive: !!selections } : {})), { update: value });
        }
    }
    if (!util_1.isEmpty(legendEncode)) {
        legendCmpt.set('encode', legendEncode, !!(legend === null || legend === void 0 ? void 0 : legend.encoding));
    }
    return legendCmpt;
}
exports.parseLegendForChannel = parseLegendForChannel;
function parseNonUnitLegend(model) {
    const { legends, resolve } = model.component;
    for (const child of model.children) {
        parseLegend(child);
        for (const channel of util_1.keys(child.component.legends)) {
            resolve.legend[channel] = resolve_1.parseGuideResolve(model.component.resolve, channel);
            if (resolve.legend[channel] === 'shared') {
                // If the resolve says shared (and has not been overridden)
                // We will try to merge and see if there is a conflict
                legends[channel] = mergeLegendComponent(legends[channel], child.component.legends[channel]);
                if (!legends[channel]) {
                    // If merge returns nothing, there is a conflict so we cannot make the legend shared.
                    // Thus, mark legend as independent and remove the legend component.
                    resolve.legend[channel] = 'independent';
                    delete legends[channel];
                }
            }
        }
    }
    for (const channel of util_1.keys(legends)) {
        for (const child of model.children) {
            if (!child.component.legends[channel]) {
                // skip if the child does not have a particular legend
                continue;
            }
            if (resolve.legend[channel] === 'shared') {
                // After merging shared legend, make sure to remove legend from child
                delete child.component.legends[channel];
            }
        }
    }
    return legends;
}
function mergeLegendComponent(mergedLegend, childLegend) {
    var _a, _b, _c, _d;
    if (!mergedLegend) {
        return childLegend.clone();
    }
    const mergedOrient = mergedLegend.getWithExplicit('orient');
    const childOrient = childLegend.getWithExplicit('orient');
    if (mergedOrient.explicit && childOrient.explicit && mergedOrient.value !== childOrient.value) {
        // TODO: throw warning if resolve is explicit (We don't have info about explicit/implicit resolve yet.)
        // Cannot merge due to inconsistent orient
        return undefined;
    }
    let typeMerged = false;
    // Otherwise, let's merge
    for (const prop of component_1.LEGEND_COMPONENT_PROPERTIES) {
        const mergedValueWithExplicit = split_1.mergeValuesWithExplicit(mergedLegend.getWithExplicit(prop), childLegend.getWithExplicit(prop), prop, 'legend', 
        // Tie breaker function
        (v1, v2) => {
            switch (prop) {
                case 'symbolType':
                    return mergeSymbolType(v1, v2);
                case 'title':
                    return common_1.mergeTitleComponent(v1, v2);
                case 'type':
                    // There are only two types. If we have different types, then prefer symbol over gradient.
                    typeMerged = true;
                    return split_1.makeImplicit('symbol');
            }
            return split_1.defaultTieBreaker(v1, v2, prop, 'legend');
        });
        mergedLegend.setWithExplicit(prop, mergedValueWithExplicit);
    }
    if (typeMerged) {
        if ((_b = (_a = mergedLegend.implicit) === null || _a === void 0 ? void 0 : _a.encode) === null || _b === void 0 ? void 0 : _b.gradient) {
            util_1.deleteNestedProperty(mergedLegend.implicit, ['encode', 'gradient']);
        }
        if ((_d = (_c = mergedLegend.explicit) === null || _c === void 0 ? void 0 : _c.encode) === null || _d === void 0 ? void 0 : _d.gradient) {
            util_1.deleteNestedProperty(mergedLegend.explicit, ['encode', 'gradient']);
        }
    }
    return mergedLegend;
}
exports.mergeLegendComponent = mergeLegendComponent;
function mergeSymbolType(st1, st2) {
    if (st2.value === 'circle') {
        // prefer "circle" over "stroke"
        return st2;
    }
    return st1;
}
//# sourceMappingURL=parse.js.map