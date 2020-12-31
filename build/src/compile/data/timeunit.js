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
exports.TimeUnitNode = void 0;
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const timeunit_1 = require("../../timeunit");
const util_1 = require("../../util");
const model_1 = require("../model");
const dataflow_1 = require("./dataflow");
class TimeUnitNode extends dataflow_1.DataFlowNode {
    constructor(parent, formula) {
        super(parent);
        this.formula = formula;
    }
    clone() {
        return new TimeUnitNode(null, util_1.duplicate(this.formula));
    }
    static makeFromEncoding(parent, model) {
        const formula = model.reduceFieldDef((timeUnitComponent, fieldDef, channel) => {
            const { field, timeUnit } = fieldDef;
            const channelDef2 = model_1.isUnitModel(model) ? model.encoding[channel_1.getSecondaryRangeChannel(channel)] : undefined;
            const band = model_1.isUnitModel(model) && channeldef_1.hasBand(channel, fieldDef, channelDef2, model.stack, model.markDef, model.config);
            if (timeUnit) {
                const as = channeldef_1.vgField(fieldDef, { forAs: true });
                timeUnitComponent[util_1.hash({
                    as,
                    field,
                    timeUnit
                })] = Object.assign({ as,
                    field,
                    timeUnit }, (band ? { band: true } : {}));
            }
            return timeUnitComponent;
        }, {});
        if (util_1.isEmpty(formula)) {
            return null;
        }
        return new TimeUnitNode(parent, formula);
    }
    static makeFromTransform(parent, t) {
        const _a = Object.assign({}, t), { timeUnit } = _a, other = __rest(_a, ["timeUnit"]);
        const normalizedTimeUnit = timeunit_1.normalizeTimeUnit(timeUnit);
        const component = Object.assign(Object.assign({}, other), { timeUnit: normalizedTimeUnit });
        return new TimeUnitNode(parent, {
            [util_1.hash(component)]: component
        });
    }
    /**
     * Merge together TimeUnitNodes assigning the children of `other` to `this`
     * and removing `other`.
     */
    merge(other) {
        this.formula = Object.assign({}, this.formula);
        // if the same hash happen twice, merge "band"
        for (const key in other.formula) {
            if (!this.formula[key] || other.formula[key].band) {
                // copy if it's not a duplicate or if we need to copy band over
                this.formula[key] = other.formula[key];
            }
        }
        for (const child of other.children) {
            other.removeChild(child);
            child.parent = this;
        }
        other.remove();
    }
    /**
     * Remove time units coming from the other node.
     */
    removeFormulas(fields) {
        const newFormula = {};
        for (const [key, timeUnit] of util_1.entries(this.formula)) {
            if (!fields.has(timeUnit.as)) {
                newFormula[key] = timeUnit;
            }
        }
        this.formula = newFormula;
    }
    producedFields() {
        return new Set(util_1.vals(this.formula).map(f => f.as));
    }
    dependentFields() {
        return new Set(util_1.vals(this.formula).map(f => f.field));
    }
    hash() {
        return `TimeUnit ${util_1.hash(this.formula)}`;
    }
    assemble() {
        const transforms = [];
        for (const f of util_1.vals(this.formula)) {
            const { field, as, timeUnit } = f;
            const _a = timeunit_1.normalizeTimeUnit(timeUnit), { unit, utc } = _a, params = __rest(_a, ["unit", "utc"]);
            transforms.push(Object.assign(Object.assign(Object.assign(Object.assign({ field: util_1.replacePathInField(field), type: 'timeunit' }, (unit ? { units: timeunit_1.getTimeUnitParts(unit) } : {})), (utc ? { timezone: 'utc' } : {})), params), { as: [as, `${as}_end`] }));
        }
        return transforms;
    }
}
exports.TimeUnitNode = TimeUnitNode;
//# sourceMappingURL=timeunit.js.map