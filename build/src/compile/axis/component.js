"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxisComponent = exports.AXIS_COMPONENT_PROPERTIES = void 0;
const axis_1 = require("../../axis");
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const split_1 = require("../split");
function isFalseOrNull(v) {
    return v === false || v === null;
}
const AXIS_COMPONENT_PROPERTIES_INDEX = Object.assign(Object.assign({ disable: 1, gridScale: 1, scale: 1 }, axis_1.COMMON_AXIS_PROPERTIES_INDEX), { labelExpr: 1, encode: 1 });
exports.AXIS_COMPONENT_PROPERTIES = util_1.keys(AXIS_COMPONENT_PROPERTIES_INDEX);
class AxisComponent extends split_1.Split {
    constructor(explicit = {}, implicit = {}, mainExtracted = false) {
        super();
        this.explicit = explicit;
        this.implicit = implicit;
        this.mainExtracted = mainExtracted;
    }
    clone() {
        return new AxisComponent(util_1.duplicate(this.explicit), util_1.duplicate(this.implicit), this.mainExtracted);
    }
    hasAxisPart(part) {
        // FIXME(https://github.com/vega/vega-lite/issues/2552) this method can be wrong if users use a Vega theme.
        if (part === 'axis') {
            // always has the axis container part
            return true;
        }
        if (part === 'grid' || part === 'title') {
            return !!this.get(part);
        }
        // Other parts are enabled by default, so they should not be false or null.
        return !isFalseOrNull(this.get(part));
    }
    hasOrientSignalRef() {
        return vega_schema_1.isSignalRef(this.explicit.orient);
    }
}
exports.AxisComponent = AxisComponent;
//# sourceMappingURL=component.js.map