"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.description = exports.aria = void 0;
const util_1 = require("../../../util");
const common_1 = require("../../common");
const vega_schema_1 = require("./../../../vega.schema");
const conditional_1 = require("./conditional");
const text_1 = require("./text");
const tooltip_1 = require("./tooltip");
function aria(model) {
    const { markDef, config } = model;
    const enableAria = common_1.getMarkPropOrConfig('aria', markDef, config);
    // We can ignore other aria properties if ariaHidden is true.
    if (enableAria === false) {
        // getMarkGroups sets aria to false already so we don't have to set it in the encode block
        return {};
    }
    return Object.assign(Object.assign(Object.assign({}, (enableAria ? { aria: enableAria } : {})), ariaRoleDescription(model)), description(model));
}
exports.aria = aria;
function ariaRoleDescription(model) {
    const { mark, markDef, config } = model;
    if (config.aria === false) {
        return {};
    }
    const ariaRoleDesc = common_1.getMarkPropOrConfig('ariaRoleDescription', markDef, config);
    if (ariaRoleDesc != null) {
        return { ariaRoleDescription: { value: ariaRoleDesc } };
    }
    return mark in vega_schema_1.VG_MARK_INDEX ? {} : { ariaRoleDescription: { value: mark } };
}
function description(model) {
    const { encoding, markDef, config, stack } = model;
    const channelDef = encoding.description;
    if (channelDef) {
        return conditional_1.wrapCondition(model, channelDef, 'description', cDef => text_1.textRef(cDef, model.config));
    }
    // Use default from mark def or config if defined.
    // Functions in encode usually just return undefined but since we are defining a default below, we need to check the default here.
    const descriptionValue = common_1.getMarkPropOrConfig('description', markDef, config);
    if (descriptionValue != null) {
        return {
            description: common_1.signalOrValueRef(descriptionValue)
        };
    }
    if (config.aria === false) {
        return {};
    }
    const data = tooltip_1.tooltipData(encoding, stack, config);
    if (util_1.isEmpty(data)) {
        return undefined;
    }
    return {
        description: {
            signal: util_1.entries(data)
                .map(([key, value], index) => `"${index > 0 ? '; ' : ''}${key}: " + (${value})`)
                .join(' + ')
        }
    };
}
exports.description = description;
//# sourceMappingURL=aria.js.map