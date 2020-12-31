"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarkType = exports.defaultTickConfig = exports.defaultRectConfig = exports.defaultBarConfig = exports.BAR_CORNER_RADIUS_INDEX = exports.MARK_CONFIGS = exports.defaultMarkConfig = exports.VL_ONLY_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX = exports.VL_ONLY_MARK_CONFIG_PROPERTIES = exports.FILL_STROKE_CONFIG = exports.FILL_CONFIG = exports.STROKE_CONFIG = exports.isPrimitiveMark = exports.isMarkDef = exports.PRIMITIVE_MARKS = exports.isRectBasedMark = exports.isPathMark = exports.isMark = exports.GEOSHAPE = exports.SQUARE = exports.CIRCLE = exports.TRAIL = exports.TICK = exports.TEXT = exports.RULE = exports.RECT = exports.POINT = exports.LINE = exports.IMAGE = exports.BAR = exports.AREA = exports.ARC = exports.Mark = void 0;
const vega_util_1 = require("vega-util");
const util_1 = require("./util");
/**
 * All types of primitive marks.
 */
exports.Mark = {
    arc: 'arc',
    area: 'area',
    bar: 'bar',
    image: 'image',
    line: 'line',
    point: 'point',
    rect: 'rect',
    rule: 'rule',
    text: 'text',
    tick: 'tick',
    trail: 'trail',
    circle: 'circle',
    square: 'square',
    geoshape: 'geoshape'
};
exports.ARC = exports.Mark.arc;
exports.AREA = exports.Mark.area;
exports.BAR = exports.Mark.bar;
exports.IMAGE = exports.Mark.image;
exports.LINE = exports.Mark.line;
exports.POINT = exports.Mark.point;
exports.RECT = exports.Mark.rect;
exports.RULE = exports.Mark.rule;
exports.TEXT = exports.Mark.text;
exports.TICK = exports.Mark.tick;
exports.TRAIL = exports.Mark.trail;
exports.CIRCLE = exports.Mark.circle;
exports.SQUARE = exports.Mark.square;
exports.GEOSHAPE = exports.Mark.geoshape;
function isMark(m) {
    return m in exports.Mark;
}
exports.isMark = isMark;
function isPathMark(m) {
    return ['line', 'area', 'trail'].includes(m);
}
exports.isPathMark = isPathMark;
function isRectBasedMark(m) {
    return ['rect', 'bar', 'image', 'arc' /* arc is rect/interval in polar coordinate */].includes(m);
}
exports.isRectBasedMark = isRectBasedMark;
exports.PRIMITIVE_MARKS = util_1.keys(exports.Mark);
function isMarkDef(mark) {
    return mark['type'];
}
exports.isMarkDef = isMarkDef;
const PRIMITIVE_MARK_INDEX = vega_util_1.toSet(exports.PRIMITIVE_MARKS);
function isPrimitiveMark(mark) {
    const markType = isMarkDef(mark) ? mark.type : mark;
    return markType in PRIMITIVE_MARK_INDEX;
}
exports.isPrimitiveMark = isPrimitiveMark;
exports.STROKE_CONFIG = [
    'stroke',
    'strokeWidth',
    'strokeDash',
    'strokeDashOffset',
    'strokeOpacity',
    'strokeJoin',
    'strokeMiterLimit'
];
exports.FILL_CONFIG = ['fill', 'fillOpacity'];
exports.FILL_STROKE_CONFIG = [...exports.STROKE_CONFIG, ...exports.FILL_CONFIG];
const VL_ONLY_MARK_CONFIG_INDEX = {
    color: 1,
    filled: 1,
    invalid: 1,
    order: 1,
    radius2: 1,
    theta2: 1,
    timeUnitBand: 1,
    timeUnitBandPosition: 1
};
exports.VL_ONLY_MARK_CONFIG_PROPERTIES = util_1.keys(VL_ONLY_MARK_CONFIG_INDEX);
exports.VL_ONLY_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX = {
    area: ['line', 'point'],
    bar: ['binSpacing', 'continuousBandSize', 'discreteBandSize'],
    rect: ['binSpacing', 'continuousBandSize', 'discreteBandSize'],
    line: ['point'],
    tick: ['bandSize', 'thickness']
};
exports.defaultMarkConfig = {
    color: '#4c78a8',
    invalid: 'filter',
    timeUnitBand: 1
};
const MARK_CONFIG_INDEX = {
    mark: 1,
    arc: 1,
    area: 1,
    bar: 1,
    circle: 1,
    image: 1,
    line: 1,
    point: 1,
    rect: 1,
    rule: 1,
    square: 1,
    text: 1,
    tick: 1,
    trail: 1,
    geoshape: 1
};
exports.MARK_CONFIGS = util_1.keys(MARK_CONFIG_INDEX);
exports.BAR_CORNER_RADIUS_INDEX = {
    horizontal: ['cornerRadiusTopRight', 'cornerRadiusBottomRight'],
    vertical: ['cornerRadiusTopLeft', 'cornerRadiusTopRight']
};
const DEFAULT_RECT_BAND_SIZE = 5;
exports.defaultBarConfig = {
    binSpacing: 1,
    continuousBandSize: DEFAULT_RECT_BAND_SIZE,
    timeUnitBandPosition: 0.5
};
exports.defaultRectConfig = {
    binSpacing: 0,
    continuousBandSize: DEFAULT_RECT_BAND_SIZE,
    timeUnitBandPosition: 0.5
};
exports.defaultTickConfig = {
    thickness: 1
};
function getMarkType(m) {
    return isMarkDef(m) ? m.type : m;
}
exports.getMarkType = getMarkType;
//# sourceMappingURL=mark.js.map