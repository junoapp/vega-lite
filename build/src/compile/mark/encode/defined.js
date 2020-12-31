"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.valueIfDefined = exports.defined = void 0;
const channel_1 = require("../../../channel");
const scale_1 = require("../../../scale");
const util_1 = require("../../../util");
const common_1 = require("../../common");
const valueref_1 = require("./valueref");
function defined(model) {
    const { config, markDef } = model;
    const invalid = common_1.getMarkPropOrConfig('invalid', markDef, config);
    if (invalid) {
        const signal = allFieldsInvalidPredicate(model, { channels: channel_1.POSITION_SCALE_CHANNELS });
        if (signal) {
            return { defined: { signal } };
        }
    }
    return {};
}
exports.defined = defined;
function allFieldsInvalidPredicate(model, { invalid = false, channels }) {
    const filterIndex = channels.reduce((aggregator, channel) => {
        const scaleComponent = model.getScaleComponent(channel);
        if (scaleComponent) {
            const scaleType = scaleComponent.get('type');
            const field = model.vgField(channel, { expr: 'datum' });
            // While discrete domain scales can handle invalid values, continuous scales can't.
            if (field && scale_1.hasContinuousDomain(scaleType)) {
                aggregator[field] = true;
            }
        }
        return aggregator;
    }, {});
    const fields = util_1.keys(filterIndex);
    if (fields.length > 0) {
        const op = invalid ? '||' : '&&';
        return fields.map(field => valueref_1.fieldInvalidPredicate(field, invalid)).join(` ${op} `);
    }
    return undefined;
}
function valueIfDefined(prop, value) {
    if (value !== undefined) {
        return { [prop]: common_1.signalOrValueRef(value) };
    }
    return undefined;
}
exports.valueIfDefined = valueIfDefined;
//# sourceMappingURL=defined.js.map