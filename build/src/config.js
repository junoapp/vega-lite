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
exports.stripAndRedirectConfig = exports.initConfig = exports.fontConfig = exports.fontSizeSignalConfig = exports.colorSignalConfig = exports.DEFAULT_COLOR = exports.DEFAULT_FONT_SIZE = exports.defaultConfig = exports.isVgScheme = exports.defaultViewConfig = exports.DEFAULT_STEP = exports.getViewConfigDiscreteSize = exports.getViewConfigDiscreteStep = exports.getViewConfigContinuousSize = void 0;
const vega_util_1 = require("vega-util");
const axis_1 = require("./axis");
const common_1 = require("./compile/common");
const compositemark_1 = require("./compositemark");
const expr_1 = require("./expr");
const guide_1 = require("./guide");
const header_1 = require("./header");
const legend_1 = require("./legend");
const mark = __importStar(require("./mark"));
const mark_1 = require("./mark");
const parameter_1 = require("./parameter");
const scale_1 = require("./scale");
const selection_1 = require("./selection");
const base_1 = require("./spec/base");
const title_1 = require("./title");
const util_1 = require("./util");
function getViewConfigContinuousSize(viewConfig, channel) {
    var _a;
    return (_a = viewConfig[channel]) !== null && _a !== void 0 ? _a : viewConfig[channel === 'width' ? 'continuousWidth' : 'continuousHeight']; // get width/height for backwards compatibility
}
exports.getViewConfigContinuousSize = getViewConfigContinuousSize;
function getViewConfigDiscreteStep(viewConfig, channel) {
    const size = getViewConfigDiscreteSize(viewConfig, channel);
    return base_1.isStep(size) ? size.step : exports.DEFAULT_STEP;
}
exports.getViewConfigDiscreteStep = getViewConfigDiscreteStep;
function getViewConfigDiscreteSize(viewConfig, channel) {
    var _a;
    const size = (_a = viewConfig[channel]) !== null && _a !== void 0 ? _a : viewConfig[channel === 'width' ? 'discreteWidth' : 'discreteHeight']; // get width/height for backwards compatibility
    return util_1.getFirstDefined(size, { step: viewConfig.step });
}
exports.getViewConfigDiscreteSize = getViewConfigDiscreteSize;
exports.DEFAULT_STEP = 20;
exports.defaultViewConfig = {
    continuousWidth: 200,
    continuousHeight: 200,
    step: exports.DEFAULT_STEP
};
function isVgScheme(rangeScheme) {
    return rangeScheme && !!rangeScheme['scheme'];
}
exports.isVgScheme = isVgScheme;
exports.defaultConfig = {
    background: 'white',
    padding: 5,
    timeFormat: '%b %d, %Y',
    countTitle: 'Count of Records',
    view: exports.defaultViewConfig,
    mark: mark.defaultMarkConfig,
    arc: {},
    area: {},
    bar: mark.defaultBarConfig,
    circle: {},
    geoshape: {},
    image: {},
    line: {},
    point: {},
    rect: mark.defaultRectConfig,
    rule: { color: 'black' },
    square: {},
    text: { color: 'black' },
    tick: mark.defaultTickConfig,
    trail: {},
    boxplot: {
        size: 14,
        extent: 1.5,
        box: {},
        median: { color: 'white' },
        outliers: {},
        rule: {},
        ticks: null
    },
    errorbar: {
        center: 'mean',
        rule: true,
        ticks: false
    },
    errorband: {
        band: {
            opacity: 0.3
        },
        borders: false
    },
    scale: scale_1.defaultScaleConfig,
    projection: {},
    legend: legend_1.defaultLegendConfig,
    header: { titlePadding: 10, labelPadding: 10 },
    headerColumn: {},
    headerRow: {},
    headerFacet: {},
    selection: selection_1.defaultConfig,
    style: {},
    title: {},
    facet: { spacing: base_1.DEFAULT_SPACING },
    concat: { spacing: base_1.DEFAULT_SPACING }
};
// Tableau10 color palette, copied from `vegaScale.scheme('tableau10')`
const tab10 = [
    '#4c78a8',
    '#f58518',
    '#e45756',
    '#72b7b2',
    '#54a24b',
    '#eeca3b',
    '#b279a2',
    '#ff9da6',
    '#9d755d',
    '#bab0ac'
];
exports.DEFAULT_FONT_SIZE = {
    text: 11,
    guideLabel: 10,
    guideTitle: 11,
    groupTitle: 13,
    groupSubtitle: 12
};
exports.DEFAULT_COLOR = {
    blue: tab10[0],
    orange: tab10[1],
    red: tab10[2],
    teal: tab10[3],
    green: tab10[4],
    yellow: tab10[5],
    purple: tab10[6],
    pink: tab10[7],
    brown: tab10[8],
    gray0: '#000',
    gray1: '#111',
    gray2: '#222',
    gray3: '#333',
    gray4: '#444',
    gray5: '#555',
    gray6: '#666',
    gray7: '#777',
    gray8: '#888',
    gray9: '#999',
    gray10: '#aaa',
    gray11: '#bbb',
    gray12: '#ccc',
    gray13: '#ddd',
    gray14: '#eee',
    gray15: '#fff'
};
function colorSignalConfig(color = {}) {
    return {
        signals: [
            {
                name: 'color',
                value: vega_util_1.isObject(color) ? Object.assign(Object.assign({}, exports.DEFAULT_COLOR), color) : exports.DEFAULT_COLOR
            }
        ],
        mark: { color: { signal: 'color.blue' } },
        rule: { color: { signal: 'color.gray0' } },
        text: {
            color: { signal: 'color.gray0' }
        },
        style: {
            'guide-label': {
                fill: { signal: 'color.gray0' }
            },
            'guide-title': {
                fill: { signal: 'color.gray0' }
            },
            'group-title': {
                fill: { signal: 'color.gray0' }
            },
            'group-subtitle': {
                fill: { signal: 'color.gray0' }
            },
            cell: {
                stroke: { signal: 'color.gray8' }
            }
        },
        axis: {
            domainColor: { signal: 'color.gray13' },
            gridColor: { signal: 'color.gray8' },
            tickColor: { signal: 'color.gray13' }
        },
        range: {
            category: [
                { signal: 'color.blue' },
                { signal: 'color.orange' },
                { signal: 'color.red' },
                { signal: 'color.teal' },
                { signal: 'color.green' },
                { signal: 'color.yellow' },
                { signal: 'color.purple' },
                { signal: 'color.pink' },
                { signal: 'color.brown' },
                { signal: 'color.grey8' }
            ]
        }
    };
}
exports.colorSignalConfig = colorSignalConfig;
function fontSizeSignalConfig(fontSize) {
    return {
        signals: [
            {
                name: 'fontSize',
                value: vega_util_1.isObject(fontSize) ? Object.assign(Object.assign({}, exports.DEFAULT_FONT_SIZE), fontSize) : exports.DEFAULT_FONT_SIZE
            }
        ],
        text: {
            fontSize: { signal: 'fontSize.text' }
        },
        style: {
            'guide-label': {
                fontSize: { signal: 'fontSize.guideLabel' }
            },
            'guide-title': {
                fontSize: { signal: 'fontSize.guideTitle' }
            },
            'group-title': {
                fontSize: { signal: 'fontSize.groupTitle' }
            },
            'group-subtitle': {
                fontSize: { signal: 'fontSize.groupSubtitle' }
            }
        }
    };
}
exports.fontSizeSignalConfig = fontSizeSignalConfig;
function fontConfig(font) {
    return {
        text: { font },
        style: {
            'guide-label': { font },
            'guide-title': { font },
            'group-title': { font },
            'group-subtitle': { font }
        }
    };
}
exports.fontConfig = fontConfig;
function getAxisConfigInternal(axisConfig) {
    const props = util_1.keys(axisConfig || {});
    const axisConfigInternal = {};
    for (const prop of props) {
        const val = axisConfig[prop];
        axisConfigInternal[prop] = axis_1.isConditionalAxisValue(val)
            ? common_1.signalOrValueRefWithCondition(val)
            : common_1.signalRefOrValue(val);
    }
    return axisConfigInternal;
}
function getStyleConfigInternal(styleConfig) {
    const props = util_1.keys(styleConfig);
    const styleConfigInternal = {};
    for (const prop of props) {
        // We need to cast to cheat a bit here since styleConfig can be either mark config or axis config
        styleConfigInternal[prop] = getAxisConfigInternal(styleConfig[prop]);
    }
    return styleConfigInternal;
}
const configPropsWithExpr = [
    ...mark_1.MARK_CONFIGS,
    ...axis_1.AXIS_CONFIGS,
    ...header_1.HEADER_CONFIGS,
    'background',
    'padding',
    'legend',
    'lineBreak',
    'scale',
    'style',
    'title',
    'view'
];
/**
 * Merge specified config with default config and config for the `color` flag,
 * then replace all expressions with signals
 */
function initConfig(specifiedConfig = {}) {
    const { color, font, fontSize } = specifiedConfig, restConfig = __rest(specifiedConfig, ["color", "font", "fontSize"]);
    const mergedConfig = vega_util_1.mergeConfig({}, exports.defaultConfig, font ? fontConfig(font) : {}, color ? colorSignalConfig(color) : {}, fontSize ? fontSizeSignalConfig(fontSize) : {}, restConfig || {});
    const outputConfig = util_1.omit(mergedConfig, configPropsWithExpr);
    for (const prop of ['background', 'lineBreak', 'padding']) {
        if (mergedConfig[prop]) {
            outputConfig[prop] = common_1.signalRefOrValue(mergedConfig[prop]);
        }
    }
    for (const markConfigType of mark.MARK_CONFIGS) {
        if (mergedConfig[markConfigType]) {
            // FIXME: outputConfig[markConfigType] expects that types are replaced recursively but replaceExprRef only replaces one level deep
            outputConfig[markConfigType] = expr_1.replaceExprRef(mergedConfig[markConfigType]);
        }
    }
    for (const axisConfigType of axis_1.AXIS_CONFIGS) {
        if (mergedConfig[axisConfigType]) {
            outputConfig[axisConfigType] = getAxisConfigInternal(mergedConfig[axisConfigType]);
        }
    }
    for (const headerConfigType of header_1.HEADER_CONFIGS) {
        if (mergedConfig[headerConfigType]) {
            outputConfig[headerConfigType] = expr_1.replaceExprRef(mergedConfig[headerConfigType]);
        }
    }
    if (mergedConfig.legend) {
        outputConfig.legend = expr_1.replaceExprRef(mergedConfig.legend);
    }
    if (mergedConfig.scale) {
        outputConfig.scale = expr_1.replaceExprRef(mergedConfig.scale);
    }
    if (mergedConfig.style) {
        outputConfig.style = getStyleConfigInternal(mergedConfig.style);
    }
    if (mergedConfig.title) {
        outputConfig.title = expr_1.replaceExprRef(mergedConfig.title);
    }
    if (mergedConfig.view) {
        outputConfig.view = expr_1.replaceExprRef(mergedConfig.view);
    }
    return outputConfig;
}
exports.initConfig = initConfig;
const MARK_STYLES = ['view', ...mark_1.PRIMITIVE_MARKS];
const VL_ONLY_CONFIG_PROPERTIES = [
    'color',
    'fontSize',
    'background',
    'padding',
    'facet',
    'concat',
    'numberFormat',
    'timeFormat',
    'countTitle',
    'header',
    'axisQuantitative',
    'axisTemporal',
    'axisDiscrete',
    'axisPoint',
    'axisXBand',
    'axisXPoint',
    'axisXDiscrete',
    'axisXQuantitative',
    'axisXTemporal',
    'axisYBand',
    'axisYPoint',
    'axisYDiscrete',
    'axisYQuantitative',
    'axisYTemporal',
    'scale',
    'selection',
    'overlay' // FIXME: Redesign and unhide this
];
const VL_ONLY_ALL_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX = Object.assign({ view: ['continuousWidth', 'continuousHeight', 'discreteWidth', 'discreteHeight', 'step'] }, mark_1.VL_ONLY_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX);
function stripAndRedirectConfig(config) {
    config = util_1.duplicate(config);
    for (const prop of VL_ONLY_CONFIG_PROPERTIES) {
        delete config[prop];
    }
    if (config.axis) {
        // delete condition axis config
        for (const prop in config.axis) {
            if (axis_1.isConditionalAxisValue(config.axis[prop])) {
                delete config.axis[prop];
            }
        }
    }
    if (config.legend) {
        for (const prop of guide_1.VL_ONLY_LEGEND_CONFIG) {
            delete config.legend[prop];
        }
    }
    // Remove Vega-Lite only generic mark config
    if (config.mark) {
        for (const prop of mark_1.VL_ONLY_MARK_CONFIG_PROPERTIES) {
            delete config.mark[prop];
        }
        if (config.mark.tooltip && vega_util_1.isObject(config.mark.tooltip)) {
            delete config.mark.tooltip;
        }
    }
    if (config.params) {
        config.signals = (config.signals || []).concat(parameter_1.assembleParameterSignals(config.params));
        delete config.params;
    }
    for (const markType of MARK_STYLES) {
        // Remove Vega-Lite-only mark config
        for (const prop of mark_1.VL_ONLY_MARK_CONFIG_PROPERTIES) {
            delete config[markType][prop];
        }
        // Remove Vega-Lite only mark-specific config
        const vlOnlyMarkSpecificConfigs = VL_ONLY_ALL_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX[markType];
        if (vlOnlyMarkSpecificConfigs) {
            for (const prop of vlOnlyMarkSpecificConfigs) {
                delete config[markType][prop];
            }
        }
        // Redirect mark config to config.style so that mark config only affect its own mark type
        // without affecting other marks that share the same underlying Vega marks.
        // For example, config.rect should not affect bar marks.
        redirectConfigToStyleConfig(config, markType);
    }
    for (const m of compositemark_1.getAllCompositeMarks()) {
        // Clean up the composite mark config as we don't need them in the output specs anymore
        delete config[m];
    }
    redirectTitleConfig(config);
    // Remove empty config objects.
    for (const prop in config) {
        if (vega_util_1.isObject(config[prop]) && util_1.isEmpty(config[prop])) {
            delete config[prop];
        }
    }
    return util_1.isEmpty(config) ? undefined : config;
}
exports.stripAndRedirectConfig = stripAndRedirectConfig;
/**
 *
 * Redirect config.title -- so that title config do not affect header labels,
 * which also uses `title` directive to implement.
 *
 * For subtitle configs in config.title, keep them in config.title as header titles never have subtitles.
 */
function redirectTitleConfig(config) {
    const { titleMarkConfig, subtitleMarkConfig, subtitle } = title_1.extractTitleConfig(config.title);
    // set config.style if title/subtitleMarkConfig is not an empty object
    if (!util_1.isEmpty(titleMarkConfig)) {
        config.style['group-title'] = Object.assign(Object.assign({}, config.style['group-title']), titleMarkConfig // config.title has higher precedence than config.style.group-title in Vega
        );
    }
    if (!util_1.isEmpty(subtitleMarkConfig)) {
        config.style['group-subtitle'] = Object.assign(Object.assign({}, config.style['group-subtitle']), subtitleMarkConfig);
    }
    // subtitle part can stay in config.title since header titles do not use subtitle
    if (!util_1.isEmpty(subtitle)) {
        config.title = subtitle;
    }
    else {
        delete config.title;
    }
}
function redirectConfigToStyleConfig(config, prop, // string = composite mark
toProp, compositeMarkPart) {
    const propConfig = compositeMarkPart ? config[prop][compositeMarkPart] : config[prop];
    if (prop === 'view') {
        toProp = 'cell'; // View's default style is "cell"
    }
    const style = Object.assign(Object.assign({}, propConfig), config.style[toProp !== null && toProp !== void 0 ? toProp : prop]);
    // set config.style if it is not an empty object
    if (!util_1.isEmpty(style)) {
        config.style[toProp !== null && toProp !== void 0 ? toProp : prop] = style;
    }
    if (!compositeMarkPart) {
        // For composite mark, so don't delete the whole config yet as we have to do multiple redirections.
        delete config[prop];
    }
}
//# sourceMappingURL=config.js.map