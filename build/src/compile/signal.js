"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalRefWrapper = void 0;
/**
 * A class that behaves like a SignalRef but lazily generates the signal.
 * The provided generator function should use `Model.getSignalName` to use the correct signal name.
 */
class SignalRefWrapper {
    constructor(exprGenerator) {
        Object.defineProperty(this, 'signal', {
            enumerable: true,
            get: exprGenerator
        });
    }
    static fromName(rename, signalName) {
        return new SignalRefWrapper(() => rename(signalName));
    }
}
exports.SignalRefWrapper = SignalRefWrapper;
//# sourceMappingURL=signal.js.map