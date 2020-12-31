"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumeric = exports.normalizeAngle = exports.isInternalField = exports.internalField = exports.resetIdCounter = exports.uniqueId = exports.getFirstDefined = exports.accessPathDepth = exports.removePathFromField = exports.replaceAll = exports.replacePathInField = exports.flatAccessWithDatum = exports.accessPathWithDatum = exports.titleCase = exports.deleteNestedProperty = exports.logicalExpr = exports.varName = exports.isBoolean = exports.entries = exports.vals = exports.keys = exports.isEmpty = exports.fieldIntersection = exports.prefixGenerator = exports.hasIntersection = exports.setEqual = exports.isEqual = exports.unique = exports.mergeDeep = exports.every = exports.some = exports.contains = exports.isNullOrFalse = exports.hash = exports.stringify = exports.omit = exports.pick = exports.duplicate = exports.deepEqual = void 0;
require("array-flat-polyfill");
const clone_1 = __importDefault(require("clone"));
const fast_deep_equal_1 = __importDefault(require("fast-deep-equal"));
const fast_json_stable_stringify_1 = __importDefault(require("fast-json-stable-stringify"));
const vega_util_1 = require("vega-util");
const logical_1 = require("./logical");
exports.deepEqual = fast_deep_equal_1.default;
exports.duplicate = clone_1.default;
/**
 * Creates an object composed of the picked object properties.
 *
 * var object = {'a': 1, 'b': '2', 'c': 3};
 * pick(object, ['a', 'c']);
 * // → {'a': 1, 'c': 3}
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function pick(obj, props) {
    const copy = {};
    for (const prop of props) {
        if (vega_util_1.hasOwnProperty(obj, prop)) {
            copy[prop] = obj[prop];
        }
    }
    return copy;
}
exports.pick = pick;
/**
 * The opposite of _.pick; this method creates an object composed of the own
 * and inherited enumerable string keyed properties of object that are not omitted.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function omit(obj, props) {
    const copy = Object.assign({}, obj);
    for (const prop of props) {
        delete copy[prop];
    }
    return copy;
}
exports.omit = omit;
/**
 * Monkey patch Set so that `stringify` produces a string representation of sets.
 */
Set.prototype['toJSON'] = function () {
    return `Set(${[...this].map(x => fast_json_stable_stringify_1.default(x)).join(',')})`;
};
/**
 * Converts any object to a string representation that can be consumed by humans.
 */
exports.stringify = fast_json_stable_stringify_1.default;
/**
 * Converts any object to a string of limited size, or a number.
 */
function hash(a) {
    if (vega_util_1.isNumber(a)) {
        return a;
    }
    const str = vega_util_1.isString(a) ? a : fast_json_stable_stringify_1.default(a);
    // short strings can be used as hash directly, longer strings are hashed to reduce memory usage
    if (str.length < 250) {
        return str;
    }
    // from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        h = (h << 5) - h + char;
        h = h & h; // Convert to 32bit integer
    }
    return h;
}
exports.hash = hash;
function isNullOrFalse(x) {
    return x === false || x === null;
}
exports.isNullOrFalse = isNullOrFalse;
function contains(array, item) {
    return array.includes(item);
}
exports.contains = contains;
/**
 * Returns true if any item returns true.
 */
function some(arr, f) {
    let i = 0;
    for (const [k, a] of arr.entries()) {
        if (f(a, k, i++)) {
            return true;
        }
    }
    return false;
}
exports.some = some;
/**
 * Returns true if all items return true.
 */
function every(arr, f) {
    let i = 0;
    for (const [k, a] of arr.entries()) {
        if (!f(a, k, i++)) {
            return false;
        }
    }
    return true;
}
exports.every = every;
/**
 * recursively merges src into dest
 */
function mergeDeep(dest, ...src) {
    for (const s of src) {
        deepMerge_(dest, s !== null && s !== void 0 ? s : {});
    }
    return dest;
}
exports.mergeDeep = mergeDeep;
function deepMerge_(dest, src) {
    for (const property of exports.keys(src)) {
        vega_util_1.writeConfig(dest, property, src[property], true);
    }
}
function unique(values, f) {
    const results = [];
    const u = {};
    let v;
    for (const val of values) {
        v = f(val);
        if (v in u) {
            continue;
        }
        u[v] = 1;
        results.push(val);
    }
    return results;
}
exports.unique = unique;
/**
 * Returns true if the two dictionaries disagree. Applies only to defined values.
 */
function isEqual(dict, other) {
    const dictKeys = exports.keys(dict);
    const otherKeys = exports.keys(other);
    if (dictKeys.length !== otherKeys.length) {
        return false;
    }
    for (const key of dictKeys) {
        if (dict[key] !== other[key]) {
            return false;
        }
    }
    return true;
}
exports.isEqual = isEqual;
function setEqual(a, b) {
    if (a.size !== b.size) {
        return false;
    }
    for (const e of a) {
        if (!b.has(e)) {
            return false;
        }
    }
    return true;
}
exports.setEqual = setEqual;
function hasIntersection(a, b) {
    for (const key of a) {
        if (b.has(key)) {
            return true;
        }
    }
    return false;
}
exports.hasIntersection = hasIntersection;
function prefixGenerator(a) {
    const prefixes = new Set();
    for (const x of a) {
        const splitField = vega_util_1.splitAccessPath(x);
        // Wrap every element other than the first in `[]`
        const wrappedWithAccessors = splitField.map((y, i) => (i === 0 ? y : `[${y}]`));
        const computedPrefixes = wrappedWithAccessors.map((_, i) => wrappedWithAccessors.slice(0, i + 1).join(''));
        for (const y of computedPrefixes) {
            prefixes.add(y);
        }
    }
    return prefixes;
}
exports.prefixGenerator = prefixGenerator;
/**
 * Returns true if a and b have an intersection. Also return true if a or b are undefined
 * since this means we don't know what fields a node produces or depends on.
 */
function fieldIntersection(a, b) {
    if (a === undefined || b === undefined) {
        return true;
    }
    return hasIntersection(prefixGenerator(a), prefixGenerator(b));
}
exports.fieldIntersection = fieldIntersection;
// eslint-disable-next-line @typescript-eslint/ban-types
function isEmpty(obj) {
    return exports.keys(obj).length === 0;
}
exports.isEmpty = isEmpty;
// This is a stricter version of Object.keys but with better types. See https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-263132208
exports.keys = Object.keys;
exports.vals = Object.values;
exports.entries = Object.entries;
function isBoolean(b) {
    return b === true || b === false;
}
exports.isBoolean = isBoolean;
/**
 * Convert a string into a valid variable name
 */
function varName(s) {
    // Replace non-alphanumeric characters (anything besides a-zA-Z0-9_) with _
    const alphanumericS = s.replace(/\W/g, '_');
    // Add _ if the string has leading numbers.
    return (s.match(/^\d+/) ? '_' : '') + alphanumericS;
}
exports.varName = varName;
function logicalExpr(op, cb) {
    if (logical_1.isLogicalNot(op)) {
        return `!(${logicalExpr(op.not, cb)})`;
    }
    else if (logical_1.isLogicalAnd(op)) {
        return `(${op.and.map((and) => logicalExpr(and, cb)).join(') && (')})`;
    }
    else if (logical_1.isLogicalOr(op)) {
        return `(${op.or.map((or) => logicalExpr(or, cb)).join(') || (')})`;
    }
    else {
        return cb(op);
    }
}
exports.logicalExpr = logicalExpr;
/**
 * Delete nested property of an object, and delete the ancestors of the property if they become empty.
 */
function deleteNestedProperty(obj, orderedProps) {
    if (orderedProps.length === 0) {
        return true;
    }
    const prop = orderedProps.shift(); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    if (prop in obj && deleteNestedProperty(obj[prop], orderedProps)) {
        delete obj[prop];
    }
    return isEmpty(obj);
}
exports.deleteNestedProperty = deleteNestedProperty;
function titleCase(s) {
    return s.charAt(0).toUpperCase() + s.substr(1);
}
exports.titleCase = titleCase;
/**
 * Converts a path to an access path with datum.
 * @param path The field name.
 * @param datum The string to use for `datum`.
 */
function accessPathWithDatum(path, datum = 'datum') {
    const pieces = vega_util_1.splitAccessPath(path);
    const prefixes = [];
    for (let i = 1; i <= pieces.length; i++) {
        const prefix = `[${pieces.slice(0, i).map(vega_util_1.stringValue).join('][')}]`;
        prefixes.push(`${datum}${prefix}`);
    }
    return prefixes.join(' && ');
}
exports.accessPathWithDatum = accessPathWithDatum;
/**
 * Return access with datum to the flattened field.
 *
 * @param path The field name.
 * @param datum The string to use for `datum`.
 */
function flatAccessWithDatum(path, datum = 'datum') {
    return `${datum}[${vega_util_1.stringValue(vega_util_1.splitAccessPath(path).join('.'))}]`;
}
exports.flatAccessWithDatum = flatAccessWithDatum;
function escapePathAccess(string) {
    return string.replace(/(\[|\]|\.|'|")/g, '\\$1');
}
/**
 * Replaces path accesses with access to non-nested field.
 * For example, `foo["bar"].baz` becomes `foo\\.bar\\.baz`.
 */
function replacePathInField(path) {
    return `${vega_util_1.splitAccessPath(path).map(escapePathAccess).join('\\.')}`;
}
exports.replacePathInField = replacePathInField;
/**
 * Replace all occurrences of a string with another string.
 *
 * @param string the string to replace in
 * @param find the string to replace
 * @param replacement the replacement
 */
function replaceAll(string, find, replacement) {
    return string.replace(new RegExp(find.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replacement);
}
exports.replaceAll = replaceAll;
/**
 * Remove path accesses with access from field.
 * For example, `foo["bar"].baz` becomes `foo.bar.baz`.
 */
function removePathFromField(path) {
    return `${vega_util_1.splitAccessPath(path).join('.')}`;
}
exports.removePathFromField = removePathFromField;
/**
 * Count the depth of the path. Returns 1 for fields that are not nested.
 */
function accessPathDepth(path) {
    if (!path) {
        return 0;
    }
    return vega_util_1.splitAccessPath(path).length;
}
exports.accessPathDepth = accessPathDepth;
/**
 * This is a replacement for chained || for numeric properties or properties that respect null so that 0 will be included.
 */
function getFirstDefined(...args) {
    for (const arg of args) {
        if (arg !== undefined) {
            return arg;
        }
    }
    return undefined;
}
exports.getFirstDefined = getFirstDefined;
// variable used to generate id
let idCounter = 42;
/**
 * Returns a new random id every time it gets called.
 *
 * Has side effect!
 */
function uniqueId(prefix) {
    const id = ++idCounter;
    return prefix ? String(prefix) + id : id;
}
exports.uniqueId = uniqueId;
/**
 * Resets the id counter used in uniqueId. This can be useful for testing.
 */
function resetIdCounter() {
    idCounter = 42;
}
exports.resetIdCounter = resetIdCounter;
function internalField(name) {
    return isInternalField(name) ? name : `__${name}`;
}
exports.internalField = internalField;
function isInternalField(name) {
    return name.startsWith('__');
}
exports.isInternalField = isInternalField;
/**
 * Normalize angle to be within [0,360).
 */
function normalizeAngle(angle) {
    if (angle === undefined) {
        return undefined;
    }
    return ((angle % 360) + 360) % 360;
}
exports.normalizeAngle = normalizeAngle;
/**
 * Returns whether the passed in value is a valid number.
 */
function isNumeric(value) {
    if (vega_util_1.isNumber(value)) {
        return true;
    }
    return !isNaN(value) && !isNaN(parseFloat(value));
}
exports.isNumeric = isNumeric;
//# sourceMappingURL=util.js.map