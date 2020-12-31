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
exports.replaceRepeaterInEncoding = exports.replaceRepeaterInFacet = void 0;
const vega_util_1 = require("vega-util");
const channeldef_1 = require("../channeldef");
const log = __importStar(require("../log"));
const sort_1 = require("../sort");
const facet_1 = require("../spec/facet");
function replaceRepeaterInFacet(facet, repeater) {
    if (!repeater) {
        return facet;
    }
    if (facet_1.isFacetMapping(facet)) {
        return replaceRepeaterInMapping(facet, repeater);
    }
    return replaceRepeaterInFieldDef(facet, repeater);
}
exports.replaceRepeaterInFacet = replaceRepeaterInFacet;
function replaceRepeaterInEncoding(encoding, repeater) {
    if (!repeater) {
        return encoding;
    }
    return replaceRepeaterInMapping(encoding, repeater);
}
exports.replaceRepeaterInEncoding = replaceRepeaterInEncoding;
/**
 * Replaces repeated value and returns if the repeated value is valid.
 */
function replaceRepeatInProp(prop, o, repeater) {
    const val = o[prop];
    if (channeldef_1.isRepeatRef(val)) {
        if (val.repeat in repeater) {
            return Object.assign(Object.assign({}, o), { [prop]: repeater[val.repeat] });
        }
        else {
            log.warn(log.message.noSuchRepeatedValue(val.repeat));
            return undefined;
        }
    }
    return o;
}
/**
 * Replace repeater values in a field def with the concrete field name.
 */
function replaceRepeaterInFieldDef(fieldDef, repeater) {
    fieldDef = replaceRepeatInProp('field', fieldDef, repeater);
    if (fieldDef === undefined) {
        // the field def should be ignored
        return undefined;
    }
    else if (fieldDef === null) {
        return null;
    }
    if (channeldef_1.isSortableFieldDef(fieldDef) && sort_1.isSortField(fieldDef.sort)) {
        const sort = replaceRepeatInProp('field', fieldDef.sort, repeater);
        fieldDef = Object.assign(Object.assign({}, fieldDef), (sort ? { sort } : {}));
    }
    return fieldDef;
}
function replaceRepeaterInFieldOrDatumDef(def, repeater) {
    if (channeldef_1.isFieldDef(def)) {
        return replaceRepeaterInFieldDef(def, repeater);
    }
    else {
        const datumDef = replaceRepeatInProp('datum', def, repeater);
        if (datumDef !== def && !datumDef.type) {
            datumDef.type = 'nominal';
        }
        return datumDef;
    }
}
function replaceRepeaterInChannelDef(channelDef, repeater) {
    if (channeldef_1.isFieldOrDatumDef(channelDef)) {
        const fd = replaceRepeaterInFieldOrDatumDef(channelDef, repeater);
        if (fd) {
            return fd;
        }
        else if (channeldef_1.isConditionalDef(channelDef)) {
            return { condition: channelDef.condition };
        }
    }
    else {
        if (channeldef_1.hasConditionalFieldOrDatumDef(channelDef)) {
            const fd = replaceRepeaterInFieldOrDatumDef(channelDef.condition, repeater);
            if (fd) {
                return Object.assign(Object.assign({}, channelDef), { condition: fd });
            }
            else {
                const { condition } = channelDef, channelDefWithoutCondition = __rest(channelDef, ["condition"]);
                return channelDefWithoutCondition;
            }
        }
        return channelDef;
    }
    return undefined;
}
function replaceRepeaterInMapping(mapping, repeater) {
    const out = {};
    for (const channel in mapping) {
        if (vega_util_1.hasOwnProperty(mapping, channel)) {
            const channelDef = mapping[channel];
            if (vega_util_1.isArray(channelDef)) {
                // array cannot have condition
                out[channel] = channelDef // somehow we need to cast it here
                    .map(cd => replaceRepeaterInChannelDef(cd, repeater))
                    .filter(cd => cd);
            }
            else {
                const cd = replaceRepeaterInChannelDef(channelDef, repeater);
                if (cd !== undefined) {
                    out[channel] = cd;
                }
            }
        }
    }
    return out;
}
//# sourceMappingURL=repeater.js.map