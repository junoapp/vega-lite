"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullName = exports.TYPES = exports.GEOJSON = exports.NOMINAL = exports.TEMPORAL = exports.ORDINAL = exports.QUANTITATIVE = exports.isType = exports.Type = void 0;
const util_1 = require("./util");
/**
 * Data type based on level of measurement
 */
exports.Type = {
    quantitative: 'quantitative',
    ordinal: 'ordinal',
    temporal: 'temporal',
    nominal: 'nominal',
    geojson: 'geojson'
};
function isType(t) {
    return t in exports.Type;
}
exports.isType = isType;
exports.QUANTITATIVE = exports.Type.quantitative;
exports.ORDINAL = exports.Type.ordinal;
exports.TEMPORAL = exports.Type.temporal;
exports.NOMINAL = exports.Type.nominal;
exports.GEOJSON = exports.Type.geojson;
exports.TYPES = util_1.keys(exports.Type);
/**
 * Get full, lowercase type name for a given type.
 * @param  type
 * @return Full type name.
 */
function getFullName(type) {
    if (type) {
        type = type.toLowerCase();
        switch (type) {
            case 'q':
            case exports.QUANTITATIVE:
                return 'quantitative';
            case 't':
            case exports.TEMPORAL:
                return 'temporal';
            case 'o':
            case exports.ORDINAL:
                return 'ordinal';
            case 'n':
            case exports.NOMINAL:
                return 'nominal';
            case exports.GEOJSON:
                return 'geojson';
        }
    }
    // If we get invalid input, return undefined type.
    return undefined;
}
exports.getFullName = getFullName;
//# sourceMappingURL=type.js.map