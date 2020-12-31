"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeMarkNormalizer = void 0;
const mark_1 = require("../mark");
const unit_1 = require("../spec/unit");
class CompositeMarkNormalizer {
    constructor(name, run) {
        this.name = name;
        this.run = run;
    }
    hasMatchingType(spec) {
        if (unit_1.isUnitSpec(spec)) {
            return mark_1.getMarkType(spec.mark) === this.name;
        }
        return false;
    }
}
exports.CompositeMarkNormalizer = CompositeMarkNormalizer;
//# sourceMappingURL=base.js.map