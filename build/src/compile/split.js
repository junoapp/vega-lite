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
exports.mergeValuesWithExplicit = exports.defaultTieBreaker = exports.tieBreakByComparing = exports.makeImplicit = exports.makeExplicit = exports.Split = void 0;
const log = __importStar(require("../log"));
const util_1 = require("../util");
/**
 * Generic class for storing properties that are explicitly specified
 * and implicitly determined by the compiler.
 * This is important for scale/axis/legend merging as
 * we want to prioritize properties that users explicitly specified.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
class Split {
    constructor(explicit = {}, implicit = {}) {
        this.explicit = explicit;
        this.implicit = implicit;
    }
    clone() {
        return new Split(util_1.duplicate(this.explicit), util_1.duplicate(this.implicit));
    }
    combine() {
        return Object.assign(Object.assign({}, this.explicit), this.implicit);
    }
    get(key) {
        // Explicit has higher precedence
        return util_1.getFirstDefined(this.explicit[key], this.implicit[key]);
    }
    getWithExplicit(key) {
        // Explicit has higher precedence
        if (this.explicit[key] !== undefined) {
            return { explicit: true, value: this.explicit[key] };
        }
        else if (this.implicit[key] !== undefined) {
            return { explicit: false, value: this.implicit[key] };
        }
        return { explicit: false, value: undefined };
    }
    setWithExplicit(key, { value, explicit }) {
        if (value !== undefined) {
            this.set(key, value, explicit);
        }
    }
    set(key, value, explicit) {
        delete this[explicit ? 'implicit' : 'explicit'][key];
        this[explicit ? 'explicit' : 'implicit'][key] = value;
        return this;
    }
    copyKeyFromSplit(key, { explicit, implicit }) {
        // Explicit has higher precedence
        if (explicit[key] !== undefined) {
            this.set(key, explicit[key], true);
        }
        else if (implicit[key] !== undefined) {
            this.set(key, implicit[key], false);
        }
    }
    copyKeyFromObject(key, s) {
        // Explicit has higher precedence
        if (s[key] !== undefined) {
            this.set(key, s[key], true);
        }
    }
    /**
     * Merge split object into this split object. Properties from the other split
     * overwrite properties from this split.
     */
    copyAll(other) {
        for (const key of util_1.keys(other.combine())) {
            const val = other.getWithExplicit(key);
            this.setWithExplicit(key, val);
        }
    }
}
exports.Split = Split;
function makeExplicit(value) {
    return {
        explicit: true,
        value
    };
}
exports.makeExplicit = makeExplicit;
function makeImplicit(value) {
    return {
        explicit: false,
        value
    };
}
exports.makeImplicit = makeImplicit;
function tieBreakByComparing(compare) {
    return (v1, v2, property, propertyOf) => {
        const diff = compare(v1.value, v2.value);
        if (diff > 0) {
            return v1;
        }
        else if (diff < 0) {
            return v2;
        }
        return defaultTieBreaker(v1, v2, property, propertyOf);
    };
}
exports.tieBreakByComparing = tieBreakByComparing;
function defaultTieBreaker(v1, v2, property, propertyOf) {
    if (v1.explicit && v2.explicit) {
        log.warn(log.message.mergeConflictingProperty(property, propertyOf, v1.value, v2.value));
    }
    // If equal score, prefer v1.
    return v1;
}
exports.defaultTieBreaker = defaultTieBreaker;
function mergeValuesWithExplicit(v1, v2, property, propertyOf, tieBreaker = defaultTieBreaker) {
    if (v1 === undefined || v1.value === undefined) {
        // For first run
        return v2;
    }
    if (v1.explicit && !v2.explicit) {
        return v1;
    }
    else if (v2.explicit && !v1.explicit) {
        return v2;
    }
    else if (util_1.deepEqual(v1.value, v2.value)) {
        return v1;
    }
    else {
        return tieBreaker(v1, v2, property, propertyOf);
    }
}
exports.mergeValuesWithExplicit = mergeValuesWithExplicit;
//# sourceMappingURL=split.js.map