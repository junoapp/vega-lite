"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guideEncodeEntry = void 0;
const util_1 = require("../util");
const common_1 = require("./common");
const encode_1 = require("./mark/encode");
function guideEncodeEntry(encoding, model) {
    return util_1.keys(encoding).reduce((encode, channel) => {
        const valueDef = encoding[channel];
        return Object.assign(Object.assign({}, encode), encode_1.wrapCondition(model, valueDef, channel, def => common_1.signalOrValueRef(def.value)));
    }, {});
}
exports.guideEncodeEntry = guideEncodeEntry;
//# sourceMappingURL=guide.js.map