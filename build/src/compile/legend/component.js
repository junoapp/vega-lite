"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegendComponent = exports.LEGEND_COMPONENT_PROPERTIES = void 0;
const legend_1 = require("../../legend");
const util_1 = require("../../util");
const split_1 = require("../split");
const LEGEND_COMPONENT_PROPERTY_INDEX = Object.assign(Object.assign({}, legend_1.COMMON_LEGEND_PROPERTY_INDEX), { disable: 1, labelExpr: 1, selections: 1, 
    // channel scales
    opacity: 1, shape: 1, stroke: 1, fill: 1, size: 1, strokeWidth: 1, strokeDash: 1, 
    // encode
    encode: 1 });
exports.LEGEND_COMPONENT_PROPERTIES = util_1.keys(LEGEND_COMPONENT_PROPERTY_INDEX);
class LegendComponent extends split_1.Split {
}
exports.LegendComponent = LegendComponent;
//# sourceMappingURL=component.js.map