"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEADER_CONFIGS = exports.HEADER_LABEL_PROPERTIES = exports.HEADER_TITLE_PROPERTIES = exports.HEADER_LABEL_PROPERTIES_MAP = exports.HEADER_TITLE_PROPERTIES_MAP = void 0;
const util_1 = require("./util");
exports.HEADER_TITLE_PROPERTIES_MAP = {
    titleAlign: 'align',
    titleAnchor: 'anchor',
    titleAngle: 'angle',
    titleBaseline: 'baseline',
    titleColor: 'color',
    titleFont: 'font',
    titleFontSize: 'fontSize',
    titleFontStyle: 'fontStyle',
    titleFontWeight: 'fontWeight',
    titleLimit: 'limit',
    titleLineHeight: 'lineHeight',
    titleOrient: 'orient',
    titlePadding: 'offset'
};
exports.HEADER_LABEL_PROPERTIES_MAP = {
    labelAlign: 'align',
    labelAnchor: 'anchor',
    labelAngle: 'angle',
    labelBaseline: 'baseline',
    labelColor: 'color',
    labelFont: 'font',
    labelFontSize: 'fontSize',
    labelFontStyle: 'fontStyle',
    labelFontWeight: 'fontWeight',
    labelLimit: 'limit',
    labelLineHeight: 'lineHeight',
    labelOrient: 'orient',
    labelPadding: 'offset'
};
exports.HEADER_TITLE_PROPERTIES = util_1.keys(exports.HEADER_TITLE_PROPERTIES_MAP);
exports.HEADER_LABEL_PROPERTIES = util_1.keys(exports.HEADER_LABEL_PROPERTIES_MAP);
const HEADER_CONFIGS_INDEX = {
    header: 1,
    headerRow: 1,
    headerColumn: 1,
    headerFacet: 1
};
exports.HEADER_CONFIGS = util_1.keys(HEADER_CONFIGS_INDEX);
//# sourceMappingURL=header.js.map