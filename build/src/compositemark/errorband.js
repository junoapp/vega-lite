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
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeErrorBand = exports.errorBandNormalizer = exports.ERRORBAND_PARTS = exports.ERRORBAND = void 0;
const encoding_1 = require("../encoding");
const log = __importStar(require("../log"));
const base_1 = require("./base");
const common_1 = require("./common");
const errorbar_1 = require("./errorbar");
exports.ERRORBAND = 'errorband';
exports.ERRORBAND_PARTS = ['band', 'borders'];
exports.errorBandNormalizer = new base_1.CompositeMarkNormalizer(exports.ERRORBAND, normalizeErrorBand);
function normalizeErrorBand(spec, { config }) {
    // Need to initEncoding first so we can infer type
    spec = Object.assign(Object.assign({}, spec), { encoding: encoding_1.normalizeEncoding(spec.encoding, config) });
    const { transform, continuousAxisChannelDef, continuousAxis, encodingWithoutContinuousAxis, markDef, outerSpec, tooltipEncoding } = errorbar_1.errorBarParams(spec, exports.ERRORBAND, config);
    const errorBandDef = markDef;
    const makeErrorBandPart = common_1.makeCompositeAggregatePartFactory(errorBandDef, continuousAxis, continuousAxisChannelDef, encodingWithoutContinuousAxis, config.errorband);
    const is2D = spec.encoding.x !== undefined && spec.encoding.y !== undefined;
    let bandMark = { type: is2D ? 'area' : 'rect' };
    let bordersMark = { type: is2D ? 'line' : 'rule' };
    const interpolate = Object.assign(Object.assign({}, (errorBandDef.interpolate ? { interpolate: errorBandDef.interpolate } : {})), (errorBandDef.tension && errorBandDef.interpolate ? { tension: errorBandDef.tension } : {}));
    if (is2D) {
        bandMark = Object.assign(Object.assign(Object.assign({}, bandMark), interpolate), { ariaRoleDescription: 'errorband' });
        bordersMark = Object.assign(Object.assign(Object.assign({}, bordersMark), interpolate), { aria: false });
    }
    else if (errorBandDef.interpolate) {
        log.warn(log.message.errorBand1DNotSupport('interpolate'));
    }
    else if (errorBandDef.tension) {
        log.warn(log.message.errorBand1DNotSupport('tension'));
    }
    return Object.assign(Object.assign({}, outerSpec), { transform, layer: [
            ...makeErrorBandPart({
                partName: 'band',
                mark: bandMark,
                positionPrefix: 'lower',
                endPositionPrefix: 'upper',
                extraEncoding: tooltipEncoding
            }),
            ...makeErrorBandPart({
                partName: 'borders',
                mark: bordersMark,
                positionPrefix: 'lower',
                extraEncoding: tooltipEncoding
            }),
            ...makeErrorBandPart({
                partName: 'borders',
                mark: bordersMark,
                positionPrefix: 'upper',
                extraEncoding: tooltipEncoding
            })
        ] });
}
exports.normalizeErrorBand = normalizeErrorBand;
//# sourceMappingURL=errorband.js.map