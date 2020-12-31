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
exports.mergeTitleComponent = exports.mergeTitle = exports.mergeTitleFieldDefs = exports.sortParams = exports.getStyleConfig = exports.getMarkStyleConfig = exports.getMarkConfig = exports.getMarkPropOrConfig = exports.getStyles = exports.applyMarkConfig = exports.signalOrStringValue = exports.exprFromValueOrSignalRef = exports.signalOrValueRef = exports.conditionalSignalRefOrValue = exports.signalRefOrValue = exports.signalOrValueRefWithCondition = exports.BIN_RANGE_DELIMITER = void 0;
const vega_util_1 = require("vega-util");
const channeldef_1 = require("../channeldef");
const expr_1 = require("../expr");
const title_1 = require("../title");
const util_1 = require("../util");
const vega_schema_1 = require("../vega.schema");
exports.BIN_RANGE_DELIMITER = ' \u2013 ';
function signalOrValueRefWithCondition(val) {
    const condition = vega_util_1.isArray(val.condition)
        ? val.condition.map(conditionalSignalRefOrValue)
        : conditionalSignalRefOrValue(val.condition);
    return Object.assign(Object.assign({}, signalRefOrValue(val)), { condition });
}
exports.signalOrValueRefWithCondition = signalOrValueRefWithCondition;
function signalRefOrValue(value) {
    if (expr_1.isExprRef(value)) {
        const { expr } = value, rest = __rest(value, ["expr"]);
        return Object.assign({ signal: expr }, rest);
    }
    return value;
}
exports.signalRefOrValue = signalRefOrValue;
function conditionalSignalRefOrValue(value) {
    if (expr_1.isExprRef(value)) {
        const { expr } = value, rest = __rest(value, ["expr"]);
        return Object.assign({ signal: expr }, rest);
    }
    return value;
}
exports.conditionalSignalRefOrValue = conditionalSignalRefOrValue;
function signalOrValueRef(value) {
    if (expr_1.isExprRef(value)) {
        const { expr } = value, rest = __rest(value, ["expr"]);
        return Object.assign({ signal: expr }, rest);
    }
    if (vega_schema_1.isSignalRef(value)) {
        return value;
    }
    return value !== undefined ? { value } : undefined;
}
exports.signalOrValueRef = signalOrValueRef;
function exprFromValueOrSignalRef(ref) {
    if (vega_schema_1.isSignalRef(ref)) {
        return ref.signal;
    }
    return vega_util_1.stringValue(ref.value);
}
exports.exprFromValueOrSignalRef = exprFromValueOrSignalRef;
function signalOrStringValue(v) {
    if (vega_schema_1.isSignalRef(v)) {
        return v.signal;
    }
    return v == null ? null : vega_util_1.stringValue(v);
}
exports.signalOrStringValue = signalOrStringValue;
function applyMarkConfig(e, model, propsList) {
    for (const property of propsList) {
        const value = getMarkConfig(property, model.markDef, model.config);
        if (value !== undefined) {
            e[property] = signalOrValueRef(value);
        }
    }
    return e;
}
exports.applyMarkConfig = applyMarkConfig;
function getStyles(mark) {
    var _a;
    return [].concat(mark.type, (_a = mark.style) !== null && _a !== void 0 ? _a : []);
}
exports.getStyles = getStyles;
function getMarkPropOrConfig(channel, mark, config, opt = {}) {
    const { vgChannel, ignoreVgConfig } = opt;
    if (vgChannel && mark[vgChannel] !== undefined) {
        return mark[vgChannel];
    }
    else if (mark[channel] !== undefined) {
        return mark[channel];
    }
    else if (ignoreVgConfig && (!vgChannel || vgChannel === channel)) {
        return undefined;
    }
    return getMarkConfig(channel, mark, config, opt);
}
exports.getMarkPropOrConfig = getMarkPropOrConfig;
/**
 * Return property value from style or mark specific config property if exists.
 * Otherwise, return general mark specific config.
 */
function getMarkConfig(channel, mark, config, { vgChannel } = {}) {
    return util_1.getFirstDefined(
    // style config has highest precedence
    vgChannel ? getMarkStyleConfig(channel, mark, config.style) : undefined, getMarkStyleConfig(channel, mark, config.style), 
    // then mark-specific config
    vgChannel ? config[mark.type][vgChannel] : undefined, config[mark.type][channel], // Need to cast because MarkDef doesn't perfectly match with AnyMarkConfig, but if the type isn't available, we'll get nothing here, which is fine
    // If there is vgChannel, skip vl channel.
    // For example, vl size for text is vg fontSize, but config.mark.size is only for point size.
    vgChannel ? config.mark[vgChannel] : config.mark[channel] // Need to cast for the same reason as above
    );
}
exports.getMarkConfig = getMarkConfig;
function getMarkStyleConfig(prop, mark, styleConfigIndex) {
    return getStyleConfig(prop, getStyles(mark), styleConfigIndex);
}
exports.getMarkStyleConfig = getMarkStyleConfig;
function getStyleConfig(p, styles, styleConfigIndex) {
    styles = vega_util_1.array(styles);
    let value;
    for (const style of styles) {
        const styleConfig = styleConfigIndex[style];
        if (styleConfig && styleConfig[p] !== undefined) {
            value = styleConfig[p];
        }
    }
    return value;
}
exports.getStyleConfig = getStyleConfig;
/**
 * Return Vega sort parameters (tuple of field and order).
 */
function sortParams(orderDef, fieldRefOption) {
    return vega_util_1.array(orderDef).reduce((s, orderChannelDef) => {
        var _a;
        s.field.push(channeldef_1.vgField(orderChannelDef, fieldRefOption));
        s.order.push((_a = orderChannelDef.sort) !== null && _a !== void 0 ? _a : 'ascending');
        return s;
    }, { field: [], order: [] });
}
exports.sortParams = sortParams;
function mergeTitleFieldDefs(f1, f2) {
    const merged = [...f1];
    f2.forEach(fdToMerge => {
        for (const fieldDef1 of merged) {
            // If already exists, no need to append to merged array
            if (util_1.deepEqual(fieldDef1, fdToMerge)) {
                return;
            }
        }
        merged.push(fdToMerge);
    });
    return merged;
}
exports.mergeTitleFieldDefs = mergeTitleFieldDefs;
function mergeTitle(title1, title2) {
    if (util_1.deepEqual(title1, title2) || !title2) {
        // if titles are the same or title2 is falsy
        return title1;
    }
    else if (!title1) {
        // if title1 is falsy
        return title2;
    }
    else {
        return [...vega_util_1.array(title1), ...vega_util_1.array(title2)].join(', ');
    }
}
exports.mergeTitle = mergeTitle;
function mergeTitleComponent(v1, v2) {
    const v1Val = v1.value;
    const v2Val = v2.value;
    if (v1Val == null || v2Val === null) {
        return {
            explicit: v1.explicit,
            value: null
        };
    }
    else if ((title_1.isText(v1Val) || vega_schema_1.isSignalRef(v1Val)) && (title_1.isText(v2Val) || vega_schema_1.isSignalRef(v2Val))) {
        return {
            explicit: v1.explicit,
            value: mergeTitle(v1Val, v2Val)
        };
    }
    else if (title_1.isText(v1Val) || vega_schema_1.isSignalRef(v1Val)) {
        return {
            explicit: v1.explicit,
            value: v1Val
        };
    }
    else if (title_1.isText(v2Val) || vega_schema_1.isSignalRef(v2Val)) {
        return {
            explicit: v1.explicit,
            value: v2Val
        };
    }
    else if (!title_1.isText(v1Val) && !vega_schema_1.isSignalRef(v1Val) && !title_1.isText(v2Val) && !vega_schema_1.isSignalRef(v2Val)) {
        return {
            explicit: v1.explicit,
            value: mergeTitleFieldDefs(v1Val, v2Val)
        };
    }
    /* istanbul ignore next: Condition should not happen -- only for warning in development. */
    throw new Error('It should never reach here');
}
exports.mergeTitleComponent = mergeTitleComponent;
//# sourceMappingURL=common.js.map