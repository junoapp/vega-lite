"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxisConfig = exports.getAxisConfigStyle = exports.getAxisConfigs = void 0;
const vega_util_1 = require("vega-util");
const scale_1 = require("../../scale");
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const common_1 = require("../common");
function getAxisConfigFromConfigTypes(configTypes, config, channel, orient) {
    // TODO: add special casing to add conditional value based on orient signal
    return Object.assign.apply(null, [
        {},
        ...configTypes.map(configType => {
            if (configType === 'axisOrient') {
                const orient1 = channel === 'x' ? 'bottom' : 'left';
                const orientConfig1 = config[channel === 'x' ? 'axisBottom' : 'axisLeft'] || {};
                const orientConfig2 = config[channel === 'x' ? 'axisTop' : 'axisRight'] || {};
                const props = new Set([...util_1.keys(orientConfig1), ...util_1.keys(orientConfig2)]);
                const conditionalOrientAxisConfig = {};
                for (const prop of props.values()) {
                    conditionalOrientAxisConfig[prop] = {
                        // orient is surely signal in this case
                        signal: `${orient['signal']} === "${orient1}" ? ${common_1.signalOrStringValue(orientConfig1[prop])} : ${common_1.signalOrStringValue(orientConfig2[prop])}`
                    };
                }
                return conditionalOrientAxisConfig;
            }
            return config[configType];
        })
    ]);
}
function getAxisConfigs(channel, scaleType, orient, config) {
    const typeBasedConfigTypes = scaleType === 'band'
        ? ['axisDiscrete', 'axisBand']
        : scaleType === 'point'
            ? ['axisDiscrete', 'axisPoint']
            : scale_1.isQuantitative(scaleType)
                ? ['axisQuantitative']
                : scaleType === 'time' || scaleType === 'utc'
                    ? ['axisTemporal']
                    : [];
    const axisChannel = channel === 'x' ? 'axisX' : 'axisY';
    const axisOrient = vega_schema_1.isSignalRef(orient) ? 'axisOrient' : `axis${util_1.titleCase(orient)}`; // axisTop, axisBottom, ...
    const vlOnlyConfigTypes = [
        // technically Vega does have axisBand, but if we make another separation here,
        // it will further introduce complexity in the code
        ...typeBasedConfigTypes,
        ...typeBasedConfigTypes.map(c => axisChannel + c.substr(4))
    ];
    const vgConfigTypes = ['axis', axisOrient, axisChannel];
    return {
        vlOnlyAxisConfig: getAxisConfigFromConfigTypes(vlOnlyConfigTypes, config, channel, orient),
        vgAxisConfig: getAxisConfigFromConfigTypes(vgConfigTypes, config, channel, orient),
        axisConfigStyle: getAxisConfigStyle([...vgConfigTypes, ...vlOnlyConfigTypes], config)
    };
}
exports.getAxisConfigs = getAxisConfigs;
function getAxisConfigStyle(axisConfigTypes, config) {
    var _a;
    const toMerge = [{}];
    for (const configType of axisConfigTypes) {
        // TODO: add special casing to add conditional value based on orient signal
        let style = (_a = config[configType]) === null || _a === void 0 ? void 0 : _a.style;
        if (style) {
            style = vega_util_1.array(style);
            for (const s of style) {
                toMerge.push(config.style[s]);
            }
        }
    }
    return Object.assign.apply(null, toMerge);
}
exports.getAxisConfigStyle = getAxisConfigStyle;
function getAxisConfig(property, styleConfigIndex, style, axisConfigs = {}) {
    var _a;
    const styleConfig = common_1.getStyleConfig(property, style, styleConfigIndex);
    if (styleConfig !== undefined) {
        return {
            configFrom: 'style',
            configValue: styleConfig
        };
    }
    for (const configFrom of ['vlOnlyAxisConfig', 'vgAxisConfig', 'axisConfigStyle']) {
        if (((_a = axisConfigs[configFrom]) === null || _a === void 0 ? void 0 : _a[property]) !== undefined) {
            return { configFrom, configValue: axisConfigs[configFrom][property] };
        }
    }
    return {};
}
exports.getAxisConfig = getAxisConfig;
//# sourceMappingURL=config.js.map