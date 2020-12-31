"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceType = exports.isGraticuleGenerator = exports.isSphereGenerator = exports.isSequenceGenerator = exports.isGenerator = exports.isNamedData = exports.isInlineData = exports.isUrlData = void 0;
function isUrlData(data) {
    return 'url' in data;
}
exports.isUrlData = isUrlData;
function isInlineData(data) {
    return 'values' in data;
}
exports.isInlineData = isInlineData;
function isNamedData(data) {
    return 'name' in data && !isUrlData(data) && !isInlineData(data) && !isGenerator(data);
}
exports.isNamedData = isNamedData;
function isGenerator(data) {
    return data && (isSequenceGenerator(data) || isSphereGenerator(data) || isGraticuleGenerator(data));
}
exports.isGenerator = isGenerator;
function isSequenceGenerator(data) {
    return 'sequence' in data;
}
exports.isSequenceGenerator = isSequenceGenerator;
function isSphereGenerator(data) {
    return 'sphere' in data;
}
exports.isSphereGenerator = isSphereGenerator;
function isGraticuleGenerator(data) {
    return 'graticule' in data;
}
exports.isGraticuleGenerator = isGraticuleGenerator;
var DataSourceType;
(function (DataSourceType) {
    DataSourceType[DataSourceType["Raw"] = 0] = "Raw";
    DataSourceType[DataSourceType["Main"] = 1] = "Main";
    DataSourceType[DataSourceType["Row"] = 2] = "Row";
    DataSourceType[DataSourceType["Column"] = 3] = "Column";
    DataSourceType[DataSourceType["Lookup"] = 4] = "Lookup";
})(DataSourceType = exports.DataSourceType || (exports.DataSourceType = {}));
//# sourceMappingURL=data.js.map