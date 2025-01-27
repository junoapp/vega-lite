"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeaderProperties = exports.getHeaderProperty = exports.getHeaderChannel = void 0;
const util_1 = require("../../util");
/**
 * Get header channel, which can be different from facet channel when orient is specified or when the facet channel is facet.
 */
function getHeaderChannel(channel, orient) {
    if (util_1.contains(['top', 'bottom'], orient)) {
        return 'column';
    }
    else if (util_1.contains(['left', 'right'], orient)) {
        return 'row';
    }
    return channel === 'row' ? 'row' : 'column';
}
exports.getHeaderChannel = getHeaderChannel;
function getHeaderProperty(prop, header, config, channel) {
    const headerSpecificConfig = channel === 'row' ? config.headerRow : channel === 'column' ? config.headerColumn : config.headerFacet;
    return util_1.getFirstDefined((header || {})[prop], headerSpecificConfig[prop], config.header[prop]);
}
exports.getHeaderProperty = getHeaderProperty;
function getHeaderProperties(properties, header, config, channel) {
    const props = {};
    for (const prop of properties) {
        const value = getHeaderProperty(prop, header || {}, config, channel);
        if (value !== undefined) {
            props[prop] = value;
        }
    }
    return props;
}
exports.getHeaderProperties = getHeaderProperties;
//# sourceMappingURL=common.js.map