"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textRef = exports.text = void 0;
const channeldef_1 = require("../../../channeldef");
const common_1 = require("../../common");
const format_1 = require("../../format");
const conditional_1 = require("./conditional");
function text(model, channel = 'text') {
    const channelDef = model.encoding[channel];
    return conditional_1.wrapCondition(model, channelDef, channel, cDef => textRef(cDef, model.config));
}
exports.text = text;
function textRef(channelDef, config, expr = 'datum') {
    // text
    if (channelDef) {
        if (channeldef_1.isValueDef(channelDef)) {
            return common_1.signalOrValueRef(channelDef.value);
        }
        if (channeldef_1.isFieldOrDatumDef(channelDef)) {
            const { format, formatType } = channeldef_1.getFormatMixins(channelDef);
            return format_1.formatSignalRef({ fieldOrDatumDef: channelDef, format, formatType, expr, config });
        }
    }
    return undefined;
}
exports.textRef = textRef;
//# sourceMappingURL=text.js.map