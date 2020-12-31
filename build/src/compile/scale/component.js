"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaleComponent = void 0;
const vega_util_1 = require("vega-util");
const util_1 = require("../../util");
const split_1 = require("../split");
class ScaleComponent extends split_1.Split {
    constructor(name, typeWithExplicit) {
        super({}, // no initial explicit property
        { name } // name as initial implicit property
        );
        this.merged = false;
        this.setWithExplicit('type', typeWithExplicit);
    }
    /**
     * Whether the scale definitely includes zero in the domain
     */
    domainDefinitelyIncludesZero() {
        if (this.get('zero') !== false) {
            return true;
        }
        return util_1.some(this.get('domains'), d => vega_util_1.isArray(d) && d.length === 2 && d[0] <= 0 && d[1] >= 0);
    }
}
exports.ScaleComponent = ScaleComponent;
//# sourceMappingURL=component.js.map