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
exports.RuleForRangedLineNormalizer = void 0;
const bin_1 = require("../bin");
const channel_1 = require("../channel");
const channeldef_1 = require("../channeldef");
const log = __importStar(require("../log"));
const unit_1 = require("../spec/unit");
class RuleForRangedLineNormalizer {
    constructor() {
        this.name = 'RuleForRangedLine';
    }
    hasMatchingType(spec) {
        if (unit_1.isUnitSpec(spec)) {
            const { encoding, mark } = spec;
            if (mark === 'line') {
                for (const channel of channel_1.SECONDARY_RANGE_CHANNEL) {
                    const mainChannel = channel_1.getMainRangeChannel(channel);
                    const mainChannelDef = encoding[mainChannel];
                    if (encoding[channel]) {
                        if ((channeldef_1.isFieldDef(mainChannelDef) && !bin_1.isBinned(mainChannelDef.bin)) || channeldef_1.isDatumDef(mainChannelDef)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    run(spec, params, normalize) {
        const { encoding } = spec;
        log.warn(log.message.lineWithRange(!!encoding.x2, !!encoding.y2));
        return normalize(Object.assign(Object.assign({}, spec), { mark: 'rule' }), params);
    }
}
exports.RuleForRangedLineNormalizer = RuleForRangedLineNormalizer;
//# sourceMappingURL=ruleforrangedline.js.map