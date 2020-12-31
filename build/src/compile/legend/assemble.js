"use strict";
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
exports.assembleLegend = exports.assembleLegends = void 0;
const legend_1 = require("../../legend");
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const parse_1 = require("./parse");
function setLegendEncode(legend, part, vgProp, vgRef) {
    var _a, _b, _c;
    legend.encode = (_a = legend.encode) !== null && _a !== void 0 ? _a : {};
    legend.encode[part] = (_b = legend.encode[part]) !== null && _b !== void 0 ? _b : {};
    legend.encode[part].update = (_c = legend.encode[part].update) !== null && _c !== void 0 ? _c : {};
    // TODO: remove as any after https://github.com/prisma/nexus-prisma/issues/291
    legend.encode[part].update[vgProp] = vgRef;
}
function assembleLegends(model) {
    const legendComponentIndex = model.component.legends;
    const legendByDomain = {};
    for (const channel of util_1.keys(legendComponentIndex)) {
        const scaleComponent = model.getScaleComponent(channel);
        const domainHash = util_1.stringify(scaleComponent.get('domains'));
        if (legendByDomain[domainHash]) {
            for (const mergedLegendComponent of legendByDomain[domainHash]) {
                const merged = parse_1.mergeLegendComponent(mergedLegendComponent, legendComponentIndex[channel]);
                if (!merged) {
                    // If cannot merge, need to add this legend separately
                    legendByDomain[domainHash].push(legendComponentIndex[channel]);
                }
            }
        }
        else {
            legendByDomain[domainHash] = [legendComponentIndex[channel].clone()];
        }
    }
    const legends = util_1.vals(legendByDomain)
        .flat()
        .map(l => assembleLegend(l, model.config))
        .filter(l => l !== undefined);
    return legends;
}
exports.assembleLegends = assembleLegends;
function assembleLegend(legendCmpt, config) {
    var _a, _b, _c;
    const _d = legendCmpt.combine(), { disable, labelExpr, selections } = _d, legend = __rest(_d, ["disable", "labelExpr", "selections"]);
    if (disable) {
        return undefined;
    }
    if (config.aria === false && legend.aria == undefined) {
        legend.aria = false;
    }
    if ((_a = legend.encode) === null || _a === void 0 ? void 0 : _a.symbols) {
        const out = legend.encode.symbols.update;
        if (out.fill && out.fill['value'] !== 'transparent' && !out.stroke && !legend.stroke) {
            // For non color channel's legend, we need to override symbol stroke config from Vega config if stroke channel is not used.
            out.stroke = { value: 'transparent' };
        }
        // Remove properties that the legend is encoding.
        for (const property of legend_1.LEGEND_SCALE_CHANNELS) {
            if (legend[property]) {
                delete out[property];
            }
        }
    }
    if (!legend.title) {
        // title schema doesn't include null, ''
        delete legend.title;
    }
    if (labelExpr !== undefined) {
        let expr = labelExpr;
        if (((_c = (_b = legend.encode) === null || _b === void 0 ? void 0 : _b.labels) === null || _c === void 0 ? void 0 : _c.update) && vega_schema_1.isSignalRef(legend.encode.labels.update.text)) {
            expr = util_1.replaceAll(labelExpr, 'datum.label', legend.encode.labels.update.text.signal);
        }
        setLegendEncode(legend, 'labels', 'text', { signal: expr });
    }
    return legend;
}
exports.assembleLegend = assembleLegend;
//# sourceMappingURL=assemble.js.map