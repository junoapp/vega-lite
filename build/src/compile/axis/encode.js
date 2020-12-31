"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.labels = void 0;
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const format_1 = require("../format");
function labels(model, channel, specifiedLabelsSpec) {
    var _a;
    const { encoding, config } = model;
    const fieldOrDatumDef = (_a = channeldef_1.getFieldOrDatumDef(encoding[channel])) !== null && _a !== void 0 ? _a : channeldef_1.getFieldOrDatumDef(encoding[channel_1.getSecondaryRangeChannel(channel)]);
    const axis = model.axis(channel) || {};
    const { format, formatType } = axis;
    if (format_1.isCustomFormatType(formatType)) {
        return Object.assign({ text: format_1.formatCustomType({
                fieldOrDatumDef,
                field: 'datum.value',
                format,
                formatType,
                config
            }) }, specifiedLabelsSpec);
    }
    return specifiedLabelsSpec;
}
exports.labels = labels;
//# sourceMappingURL=encode.js.map