"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var vega_util_1 = require("vega-util");
var channel_1 = require("./channel");
var fielddef_1 = require("./fielddef");
var log = require("./log");
var type_1 = require("./type");
var util_1 = require("./util");
function channelHasField(encoding, channel) {
    var channelDef = encoding && encoding[channel];
    if (channelDef) {
        if (vega_util_1.isArray(channelDef)) {
            return util_1.some(channelDef, function (fieldDef) { return !!fieldDef.field; });
        }
        else {
            return fielddef_1.isFieldDef(channelDef) || fielddef_1.hasConditionalFieldDef(channelDef);
        }
    }
    return false;
}
exports.channelHasField = channelHasField;
function isAggregate(encoding) {
    return util_1.some(channel_1.CHANNELS, function (channel) {
        if (channelHasField(encoding, channel)) {
            var channelDef = encoding[channel];
            if (vega_util_1.isArray(channelDef)) {
                return util_1.some(channelDef, function (fieldDef) { return !!fieldDef.aggregate; });
            }
            else {
                var fieldDef = fielddef_1.getFieldDef(channelDef);
                return fieldDef && !!fieldDef.aggregate;
            }
        }
        return false;
    });
}
exports.isAggregate = isAggregate;
function normalizeEncoding(encoding, mark) {
    return util_1.keys(encoding).reduce(function (normalizedEncoding, channel) {
        if (!channel_1.isChannel(channel)) {
            // Drop invalid channel
            log.warn(log.message.invalidEncodingChannel(channel));
            return normalizedEncoding;
        }
        if (!channel_1.supportMark(channel, mark)) {
            // Drop unsupported channel
            log.warn(log.message.incompatibleChannel(channel, mark));
            return normalizedEncoding;
        }
        // Drop line's size if the field is aggregated.
        if (channel === 'size' && mark === 'line') {
            var fieldDef = fielddef_1.getFieldDef(encoding[channel]);
            if (fieldDef && fieldDef.aggregate) {
                log.warn(log.message.LINE_WITH_VARYING_SIZE);
                return normalizedEncoding;
            }
        }
        // Drop color if either fill or stroke is specified
        if (channel === 'color' && ('fill' in encoding || 'stroke' in encoding)) {
            log.warn(log.message.droppingColor('encoding', { fill: 'fill' in encoding, stroke: 'stroke' in encoding }));
            return normalizedEncoding;
        }
        var channelDef = encoding[channel];
        if (channel === 'detail' ||
            (channel === 'order' && !vega_util_1.isArray(channelDef) && !fielddef_1.isValueDef(channelDef)) ||
            (channel === 'tooltip' && vega_util_1.isArray(channelDef))) {
            if (channelDef) {
                // Array of fieldDefs for detail channel (or production rule)
                normalizedEncoding[channel] = (vega_util_1.isArray(channelDef) ? channelDef : [channelDef])
                    .reduce(function (defs, fieldDef) {
                    if (!fielddef_1.isFieldDef(fieldDef)) {
                        log.warn(log.message.emptyFieldDef(fieldDef, channel));
                    }
                    else {
                        defs.push(fielddef_1.normalizeFieldDef(fieldDef, channel));
                    }
                    return defs;
                }, []);
            }
        }
        else {
            var fieldDef = fielddef_1.getFieldDef(encoding[channel]);
            if (fieldDef && util_1.contains([type_1.Type.LATITUDE, type_1.Type.LONGITUDE], fieldDef.type)) {
                var _a = channel, _ = normalizedEncoding[_a], newEncoding = tslib_1.__rest(normalizedEncoding, [typeof _a === "symbol" ? _a : _a + ""]);
                var newChannel = channel === 'x' ? 'longitude' :
                    channel === 'y' ? 'latitude' :
                        channel === 'x2' ? 'longitude2' :
                            channel === 'y2' ? 'latitude2' : undefined;
                log.warn(log.message.latLongDeprecated(channel, fieldDef.type, newChannel));
                return tslib_1.__assign({}, newEncoding, (_b = {}, _b[newChannel] = tslib_1.__assign({}, fielddef_1.normalize(fieldDef, channel), { type: 'quantitative' }), _b));
            }
            if (!fielddef_1.isFieldDef(channelDef) && !fielddef_1.isValueDef(channelDef) && !fielddef_1.isConditionalDef(channelDef)) {
                log.warn(log.message.emptyFieldDef(channelDef, channel));
                return normalizedEncoding;
            }
            normalizedEncoding[channel] = fielddef_1.normalize(channelDef, channel);
        }
        return normalizedEncoding;
        var _b;
    }, {});
}
exports.normalizeEncoding = normalizeEncoding;
function isRanged(encoding) {
    return encoding && ((!!encoding.x && !!encoding.x2) || (!!encoding.y && !!encoding.y2));
}
exports.isRanged = isRanged;
function fieldDefs(encoding) {
    var arr = [];
    channel_1.CHANNELS.forEach(function (channel) {
        if (channelHasField(encoding, channel)) {
            var channelDef = encoding[channel];
            (vega_util_1.isArray(channelDef) ? channelDef : [channelDef]).forEach(function (def) {
                if (fielddef_1.isFieldDef(def)) {
                    arr.push(def);
                }
                else if (fielddef_1.hasConditionalFieldDef(def)) {
                    arr.push(def.condition);
                }
            });
        }
    });
    return arr;
}
exports.fieldDefs = fieldDefs;
function forEach(mapping, f, thisArg) {
    if (!mapping) {
        return;
    }
    var _loop_1 = function (channel) {
        if (vega_util_1.isArray(mapping[channel])) {
            mapping[channel].forEach(function (channelDef) {
                f.call(thisArg, channelDef, channel);
            });
        }
        else {
            f.call(thisArg, mapping[channel], channel);
        }
    };
    for (var _i = 0, _a = util_1.keys(mapping); _i < _a.length; _i++) {
        var channel = _a[_i];
        _loop_1(channel);
    }
}
exports.forEach = forEach;
function reduce(mapping, f, init, thisArg) {
    if (!mapping) {
        return init;
    }
    return util_1.keys(mapping).reduce(function (r, channel) {
        var map = mapping[channel];
        if (vega_util_1.isArray(map)) {
            return map.reduce(function (r1, channelDef) {
                return f.call(thisArg, r1, channelDef, channel);
            }, r);
        }
        else {
            return f.call(thisArg, r, map, channel);
        }
    }, init);
}
exports.reduce = reduce;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZW5jb2RpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdUNBQWtDO0FBQ2xDLHFDQUFvRTtBQUVwRSx1Q0FrQm9CO0FBQ3BCLDJCQUE2QjtBQUU3QiwrQkFBNEI7QUFDNUIsK0JBQTRDO0FBOEk1Qyx5QkFBZ0MsUUFBa0MsRUFBRSxPQUFnQjtJQUNsRixJQUFNLFVBQVUsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELElBQUksVUFBVSxFQUFFO1FBQ2QsSUFBSSxtQkFBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sV0FBSSxDQUFDLFVBQVUsRUFBRSxVQUFDLFFBQVEsSUFBSyxPQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFoQixDQUFnQixDQUFDLENBQUM7U0FDekQ7YUFBTTtZQUNMLE9BQU8scUJBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxpQ0FBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNyRTtLQUNGO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBVkQsMENBVUM7QUFHRCxxQkFBNEIsUUFBa0M7SUFDNUQsT0FBTyxXQUFJLENBQUMsa0JBQVEsRUFBRSxVQUFDLE9BQU87UUFDNUIsSUFBSSxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQ3RDLElBQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQyxJQUFJLG1CQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3ZCLE9BQU8sV0FBSSxDQUFDLFVBQVUsRUFBRSxVQUFDLFFBQVEsSUFBSyxPQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFwQixDQUFvQixDQUFDLENBQUM7YUFDN0Q7aUJBQU07Z0JBQ0wsSUFBTSxRQUFRLEdBQUcsc0JBQVcsQ0FBQyxVQUFVLENBQUMs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LENBQUMsQ0FBQyxDQUFDO1NBQ1A7YUFBTTtZQUNMLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN6QztJQUNILENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNYLENBQUM7QUFqQkQsd0JBaUJDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQge2lzQXJyYXl9IGZyb20gJ3ZlZ2EtdXRpbCc7XG5pbXBvcnQge0NoYW5uZWwsIENIQU5ORUxTLCBpc0NoYW5uZWwsIHN1cHBvcnRNYXJrfSBmcm9tICcuL2NoYW5uZWwnO1xuaW1wb3J0IHtGYWNldE1hcHBpbmd9IGZyb20gJy4vZmFjZXQnO1xuaW1wb3J0IHtcbiAgQ2hhbm5lbERlZixcbiAgRmllbGQsXG4gIEZpZWxkRGVmLFxuICBGaWVsZERlZldpdGhDb25kaXRpb24sXG4gIGdldEZpZWxkRGVmLFxuICBoYXNDb25kaXRpb25hbEZpZWxkRGVmLFxuICBpc0NvbmRpdGlvbmFsRGVmLFxuICBpc0ZpZWxkRGVmLFxuICBpc1ZhbHVlRGVmLFxuICBNYXJrUHJvcEZpZWxkRGVmLFxuICBub3JtYWxpemUsXG4gIG5vcm1hbGl6ZUZpZWxkRGVmLFxuICBPcmRlckZpZWxkRGVmLFxuICBQb3NpdGlvbkZpZWxkRGVmLFxuICBUZXh0RmllbGREZWYsXG4gIFZhbHVlRGVmLFxuICBWYWx1ZURlZldpdGhDb25kaXRpb25cbn0gZnJvbSAnLi9maWVsZGRlZic7XG5pbXBvcnQgKiBhcyBsb2cgZnJvbSAnLi9sb2cnO1xuaW1wb3J0IHtNYXJrfSBmcm9tICcuL21hcmsnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuL3R5cGUnO1xuaW1wb3J0IHtjb250YWlucywga2V5cywgc29tZX0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBFbmNvZGluZzxGPiB7XG4gIC8qKlxuICAgKiBYIGNvb3JkaW5hdGVzIG9mIHRoZSBtYXJrcywgb3Igd2lkdGggb2YgaG9yaXpvbnRhbCBgXCJiYXJcImAgYW5kIGBcImFyZWFcImAuXG4gICAqL1xuICB4PzogUG9zaXRpb25GaWVsZERlZjxGPiB8IFZhbHVlRGVmO1xuXG4gIC8qKlxuICAgKiBZIGNvb3JkaW5hdGVzIG9mIHRoZSBtYXJrcywgb3IgaGVpZ2h0IG9mIHZlcnRpY2FsIGBcImJhclwiYCBhbmQgYFwiYXJlYVwiYC5cbiAgICovXG4gIHk/OiBQb3NpdGlvbkZpZWxkRGVmPEY+IHwgVmFsdWVEZWY7XG5cbiAgLyoqXG4gICAqIFgyIGNvb3JkaW5hdGVzIGZvciByYW5nZWQgYFwiYXJlYVwiYCwgYFwiYmFyXCJgLCBgXCJyZWN0XCJgLCBhbmQgIGBcInJ1bGVcImAuXG4gICAqL1xuICAvLyBUT0RPOiBIYW0gbmVlZCB0byBhZGQgZGVmYXVsdCBiZWhhdmlvclxuICB4Mj86IEZpZWxkRGVmPEY+IHwgVmFsdWVEZWY7XG5cbiAgLyoqXG4gICAqIFkyIGNvb3JkaW5hdGVzIGZvciByYW5nZWQgYFwiYXJlYVwiYCwgYFwiYmFyXCJgLCBgXCJyZWN0XCJgLCBhbmQgIGBcInJ1bGVcImAuXG4gICAqL1xuICAvLyBUT0RPOiBIYW0gbmVlZCB0byBhZGQgZGVmYXVsdCBiZWhhdmlvclxuICB5Mj86IEZpZWxkRGVmPEY+IHwgVmFsdWVEZWY7XG5cblxuICAvKipcbiAgICogTG9uZ2l0dWRlIHBvc2l0aW9uIG9mIGdlb2dyYXBoaWNhbGx5IHByb2plY3RlZCBtYXJrcy5cbiAgICovXG4gIGxvbmdpdHVkZT86IEZpZWxkRGVmPEY+O1xuXG4gIC8qKlxuICAgKiBMYXRpdHVkZSBwb3NpdGlvbiBvZiBnZW9ncmFwaGljYWxseSBwcm9qZWN0ZWQgbWFya3MuXG4gICAqL1xuICBsYXRpdHVkZT86IEZpZWxkRGVmPEY+O1xuXG4gIC8qKlxuICAgKiBMb25naXR1ZGUtMiBwb3NpdGlvbiBmb3IgZ2VvZ3JhcGhpY2FsbHkgcHJvamVjdGVkIHJhbmdlZCBgXCJhcmVhXCJgLCBgXCJiYXJcImAsIGBcInJlY3RcImAsIGFuZCAgYFwicnVsZVwiYC5cbiAgICovXG4gIGxvbmdpdHVkZTI/OiBGaWVsZERlZjxGPjtcblxuICAvKipcbiAgICogTGF0aXR1ZGUtMiBwb3NpdGlvbiBmb3IgZ2VvZ3JhcGhpY2FsbHkgcHJvamVjdGVkIHJhbmdlZCBgXCJhcmVhXCJgLCBgXCJiYXJcImAsIGBcInJlY3RcImAsIGFuZCAgYFwicnVsZVwiYC5cbiAgICovXG4gIGxhdGl0dWRlMj86IEZpZWxkRGVmPEY+O1xuXG4gIC8qKlxuICAgKiBDb2xvciBvZiB0aGUgbWFya3Mg4oCTIGVpdGhlciBmaWxsIG9yIHN0cm9rZSBjb2xvciBiYXNlZCBvbiAgdGhlIGBmaWxsZWRgIHByb3BlcnR5IG9mIG1hcmsgZGVmaW5pdGlvbi5cbiAgICogQnkgZGVmYXVsdCwgYGNvbG9yYCByZXByZXNlbnRzIGZpbGwgY29sb3IgZm9yIGBcImFyZWFcImAsIGBcImJhclwiYCwgYFwidGlja1wiYCxcbiAgICogYFwidGV4dFwiYCwgYFwidHJhaWxcImAsIGBcImNpcmNsZVwiYCwgYW5kIGBcInNxdWFyZVwiYCAvIHN0cm9rZSBjb2xvciBmb3IgYFwibGluZVwiYCBhbmQgYFwicG9pbnRcImAuXG4gICAqXG4gICAqIF9fRGVmYXVsdCB2YWx1ZTpfXyBJZiB1bmRlZmluZWQsIHRoZSBkZWZhdWx0IGNvbG9yIGRlcGVuZHMgb24gW21hcmsgY29uZmlnXShodHRwczovL3ZlZ2EuZ2l0aHViLmlvL3ZlZ2EtbGl0ZS9kb2NzL2NvbmZpZy5odG1sI21hcmspJ3MgYGNvbG9yYCBwcm9wZXJ0eS5cbiAgICpcbiAgICogX05vdGU6X1xuICAgKiAxKSBGb3IgZmluZS1ncmFpbmVkIGNvbnRyb2wgb3ZlciBib3RoIGZpbGwgYW5kIHN0cm9rZSBjb2xvcnMgb2YgdGhlIG1hcmtzLCBwbGVhc2UgdXNlIHRoZSBgZmlsbGAgYW5kIGBzdHJva2VgIGNoYW5uZWxzLiAgSWYgZWl0aGVyIGBmaWxsYCBvciBgc3Ryb2tlYCBjaGFubmVsIGlzIHNwZWNpZmllZCwgYGNvbG9yYCBjaGFubmVsIHdpbGwgYmUgaWdub3JlZC5cbiAgICogMikgU2VlIHRoZSBzY2FsZSBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGN1c3RvbWl6aW5nIFtjb2xvciBzY2hlbWVdKGh0dHBzOi8vdmVnYS5naXRodWIuaW8vdmVnYS1saXRlL2RvY3Mvc2NhbGUuaHRtbCNzY2hlbWUpLlxuICAgKi9cbiAgY29sb3I/OiBGaWVsZERlZldpdGhDb25kaXRpb248TWFya1Byb3BGaWVsZERlZjxGPj4gfCBWYWx1ZURlZldpdGhDb25kaXRpb248TWFya1Byb3BGaWVsZERlZjxGPj47XG5cbiAgLyoqXG4gICAqIEZpbGwgY29sb3Igb2YgdGhlIG1hcmtzLlxuICAgKiBfX0RlZmF1bHQgdmFsdWU6X18gSWYgdW5kZWZpbmVkLCB0aGUgZGVmYXVsdCBjb2xvciBkZXBlbmRzIG9uIFttYXJrIGNvbmZpZ10oaHR0cHM6Ly92ZWdhLmdpdGh1Yi5pby92ZWdhLWxpdGUvZG9jcy9jb25maWcuaHRtbCNtYXJrKSdzIGBjb2xvcmAgcHJvcGVydHkuXG4gICAqXG4gICAqIF9Ob3RlOl8gV2hlbiB1c2luZyBgZmlsbGAgY2hhbm5lbCwgYGNvbG9yIGAgY2hhbm5lbCB3aWxsIGJlIGlnbm9yZWQuIFRvIGN1c3RvbWl6ZSBib3RoIGZpbGwgYW5kIHN0cm9rZSwgcGxlYXNlIHVzZSBgZmlsbGAgYW5kIGBzdHJva2VgIGNoYW5uZWxzIChub3QgYGZpbGxgIGFuZCBgY29sb3JgKS5cbiAgICovXG4gIGZpbGw/OiBGaWVsZERlZldpdGhDb25kaXRpb248TWFya1Byb3BGaWVsZERlZjxGPj4gfCBWYWx1ZURlZldpdGhDb25kaXRpb248TWFya1Byb3BGaWVsZERlZjxGPj47XG5cblxuICAvKipcbiAgICogU3Ryb2tlIGNvbG9yIG9mIHRoZSBtYXJrcy5cbiAgICogX19EZWZhdWx0IHZhbHVlOl9fIElmIHVuZGVmaW5lZCwgdGhlIGRlZmF1bHQgY29sb3IgZGVwZW5kcyBvbiBbbWFyayBjb25maWddKGh0dHBzOi8vdmVnYS5naXRodWIuaW8vdmVnYS1saXRlL2RvY3MvY29uZmlnLmh0bWwjbWFyaykncyBgY29sb3JgIHByb3BlcnR5LlxuICAgKlxuICAgKiBfTm90ZTpfIFdoZW4gdXNpbmcgYHN0cm9rZWAgY2hhbm5lbCwgYGNvbG9yIGAgY2hhbm5lbCB3aWxsIGJlIGlnbm9yZWQuIFRvIGN1c3RvbWl6ZSBib3RoIHN0cm9rZSBhbmQgZmlsbCwgcGxlYXNlIHVzZSBgc3Ryb2tlYCBhbmQgYGZpbGxgIGNoYW5uZWxzIChub3QgYHN0cm9rZWAgYW5kIGBjb2xvcmApLlxuICAgKi9cbiAgc3Ryb2tlPzogRmllbGREZWZXaXRoQ29uZGl0aW9uPE1hcmtQcm9wRmllbGREZWY8Rj4+IHwgVmFsdWVEZWZXaXRoQ29uZGl0aW9uPE1hcmtQcm9wRmllbGREZWY8Rj4+O1xuXG5cbiAgLyoqXG4gICAqIE9wYWNpdHkgb2YgdGhlIG1hcmtzIOKAkyBlaXRoZXIgY2FuIGJlIGEgdmFsdWUgb3IgYSByYW5nZS5cbiAgICpcbiAgICogX19EZWZhdWx0IHZhbHVlOl9fIElmIHVuZGVmaW5lZCwgdGhlIGRlZmF1bHQgb3BhY2l0eSBkZXBlbmRzIG9uIFttYXJrIGNvbmZpZ10oaHR0cHM6Ly92ZWdhLmdpdGh1Yi5pby92ZWdhLWxpdGUvZG9jcy9jb25maWcuaHRtbCNtYXJrKSdzIGBvcGFjaXR5YCBwcm9wZXJ0eS5cbiAgICovXG4gIG9wYWNpdHk/OiBGaWVsZERlZldpdGhDb25kaXRpb248TWFya1Byb3BGaWVsZERlZjxGPj4gfCBWYWx1ZURlZldpdGhDb25kaXRpb248TWFya1Byb3BGaWVsZERlZjxGPj47XG5cbiAgLyoqXG4gICAqIFNpemUgb2YgdGhlIG1hcmsuXG4gICAqIC0gRm9yIGBcInBvaW50XCJgLCBgXCJzcXVhcmVcImAgYW5kIGBcImNpcmNsZVwiYCwg4oCTIHRoZSBzeW1ib2wgc2l6ZSwgb3IgcGl4ZWwgYXJlYSBvZiB0aGUgbWFyay5cbiAgICogLSBGb3IgYFwiYmFyXCJgIGFuZCBgXCJ0aWNrXCJgIOKAkyB0aGUgYmFyIGFuZCB0aWNrJ3Mgc2l6ZS5cbiAgICogLSBGb3IgYFwidGV4dFwiYCDigJMgdGhlIHRleHQncyBmb250IHNpemUuXG4gICAqIC0gU2l6ZSBpcyB1bnN1cHBvcnRlZCBmb3IgYFwibGluZVwiYCwgYFwiYXJlYVwiYCwgYW5kIGBcInJlY3RcImAuIChVc2UgYFwidHJhaWxcImAgaW5zdGVhZCBvZiBsaW5lIHdpdGggdmFyeWluZyBzaXplKVxuICAgKi9cbiAgc2l6ZT86IEZpZWxkRGVmV2l0aENvbmRpdGlvbjxNYXJrUHJvcEZpZWxkRGVmPEY+PiB8IFZhbHVlRGVmV2l0aENvbmRpdGlvbjxNYXJrUHJvcEZpZWxkRGVmPEY+PjtcblxuICAvKipcbiAgICogRm9yIGBwb2ludGAgbWFya3MgdGhlIHN1cHBvcnRlZCB2YWx1ZXMgYXJlXG4gICAqIGBcImNpcmNsZVwiYCAoZGVmYXVsdCksIGBcInNxdWFyZVwiYCwgYFwiY3Jvc3NcImAsIGBcImRpYW1vbmRcImAsIGBcInRyaWFuZ2xlLXVwXCJgLFxuICAgKiBvciBgXCJ0cmlhbmdsZS1kb3duXCJgLCBvciBlbHNlIGEgY3VzdG9tIFNWRyBwYXRoIHN0cmluZy5cbiAgICogRm9yIGBnZW9zaGFwZWAgbWFya3MgaXQgc2hvdWxkIGJlIGEgZmllbGQgZGVmaW5pdGlvbiBvZiB0aGUgZ2VvanNvbiBkYXRhXG4gICAqXG4gICAqIF9fRGVmYXVsdCB2YWx1ZTpfXyBJZiB1bmRlZmluZWQsIHRoZSBkZWZhdWx0IHNoYXBlIGRlcGVuZHMgb24gW21hcmsgY29uZmlnXShodHRwczovL3ZlZ2EuZ2l0aHViLmlvL3ZlZ2EtbGl0ZS9kb2NzL2NvbmZpZy5odG1sI3BvaW50LWNvbmZpZykncyBgc2hhcGVgIHByb3BlcnR5LlxuICAgKi9cbiAgc2hhcGU/OiBGaWVsZERlZldpdGhDb25kaXRpb248TWFya1Byb3BGaWVsZERlZjxGPj4gfCBWYWx1ZURlZldpdGhDb25kaXRpb248TWFya1Byb3BGaWVsZERlZjxGPj47IC8vIFRPRE86IG1heWJlIGRpc3Rpbmd1aXNoIG9yZGluYWwtb25seVxuXG4gIC8qKlxuICAgKiBBZGRpdGlvbmFsIGxldmVscyBvZiBkZXRhaWwgZm9yIGdyb3VwaW5nIGRhdGEgaW4gYWdncmVnYXRlIHZpZXdzIGFuZFxuICAgKiBpbiBsaW5lLCB0cmFpbCwgYW5kIGFyZWEgbWFya3Mgd2l0aG91dCBtYXBwaW5nIGRhdGEgdG8gYSBzcGVjaWZpYyB2aXN1YWwgY2hhbm5lbC5cbiAgICovXG4gIGRldGFpbD86IEZpZWxkRGVmPEY+IHwgRmllbGREZWY8Rj5bXTtcblxuICAvKipcbiAgICogQSBkYXRhIGZpZWxkIHRvIHVzZSBhcyBhIHVuaXF1ZSBrZXkgZm9yIGRhdGEgYmluZGluZy4gV2hlbiBhIHZpc3VhbGl6YXRpb27igJlzIGRhdGEgaXMgdXBkYXRlZCwgdGhlIGtleSB2YWx1ZSB3aWxsIGJlIHVzZWQgdG8gbWF0Y2ggZGF0YSBlbGVtZW50cyB0byBleGlzdGluZyBtYXJrIGluc3RhbmNlcy4gVXNlIGEga2V5IGNoYW5uZWwgdG8gZW5hYmxlIG9iamVjdCBjb25zdGFuY3kgZm9yIHRyYW5zaXRpb25zIG92ZXIgZHluYW1pYyBkYXRhLlxuICAgKi9cbiAga2V5PzogRmllbGREZWY8Rj47XG5cbiAgLyoqXG4gICAqIFRleHQgb2YgdGhlIGB0ZXh0YCBtYXJrLlxuICAgKi9cbiAgdGV4dD86IEZpZWxkRGVmV2l0aENvbmRpdGlvbjxUZXh0RmllbGREZWY8Rj4+IHwgVmFsdWVEZWZXaXRoQ29uZGl0aW9uPFRleHRGaWVsZERlZjxGPj47XG5cbiAgLyoqXG4gICAqIFRoZSB0b29sdGlwIHRleHQgdG8gc2hvdyB1cG9uIG1vdXNlIGhvdmVyLlxuICAgKi9cbiAgdG9vbHRpcD86IEZpZWxkRGVmV2l0aENvbmRpdGlvbjxUZXh0RmllbGREZWY8Rj4+IHwgVmFsdWVEZWZXaXRoQ29uZGl0aW9uPFRleHRGaWVsZERlZjxGPj4gfCBUZXh0RmllbGREZWY8Rj5bXTtcblxuICAvKipcbiAgICogQSBVUkwgdG8gbG9hZCB1cG9uIG1vdXNlIGNsaWNrLlxuICAgKi9cbiAgaHJlZj86IEZpZWxkRGVmV2l0aENvbmRpdGlvbjxGaWVsZERlZjxGPj4gfCBWYWx1ZURlZldpdGhDb25kaXRpb248RmllbGREZWY8Rj4+O1xuXG4gIC8qKlxuICAgKiBPcmRlciBvZiB0aGUgbWFya3MuXG4gICAqIC0gRm9yIHN0YWNrZWQgbWFya3MsIHRoaXMgYG9yZGVyYCBjaGFubmVsIGVuY29kZXMgW3N0YWNrIG9yZGVyXShodHRwczovL3ZlZ2EuZ2l0aHViLmlvL3ZlZ2EtbGl0ZS9kb2NzL3N0YWNrLmh0bWwjb3JkZXIpLlxuICAgKiAtIEZvciBsaW5lIGFuZCB0cmFpbCBtYXJrcywgdGhpcyBgb3JkZXJgIGNoYW5uZWwgZW5jb2RlcyBvcmRlciBvZiBkYXRhIHBvaW50cyBpbiB0aGUgbGluZXMuIFRoaXMgY2FuIGJlIHVzZWZ1bCBmb3IgY3JlYXRpbmcgW2EgY29ubmVjdGVkIHNjYXR0ZXJwbG90XShodHRwczovL3ZlZ2EuZ2l0aHViLmlvL3ZlZ2EtbGl0ZS9leGFtcGxlcy9jb25uZWN0ZWRfc2NhdHRlcnBsb3QuaHRtbCkuICBTZXR0aW5nIGBvcmRlcmAgdG8gYHtcInZhbHVlXCI6IG51bGx9YCBtYWtlcyB0aGUgbGluZSBtYXJrcyB1c2UgdGhlIG9yaWdpbmFsIG9yZGVyIGluIHRoZSBkYXRhIHNvdXJjZXMuXG4gICAqIC0gT3RoZXJ3aXNlLCB0aGlzIGBvcmRlcmAgY2hhbm5lbCBlbmNvZGVzIGxheWVyIG9yZGVyIG9mIHRoZSBtYXJrcy5cbiAgICpcbiAgICogX19Ob3RlX186IEluIGFnZ3JlZ2F0ZSBwbG90cywgYG9yZGVyYCBmaWVsZCBzaG91bGQgYmUgYGFnZ3JlZ2F0ZWBkIHRvIGF2b2lkIGNyZWF0aW5nIGFkZGl0aW9uYWwgYWdncmVnYXRpb24gZ3JvdXBpbmcuXG4gICAqL1xuICBvcmRlcj86IE9yZGVyRmllbGREZWY8Rj4gfCBPcmRlckZpZWxkRGVmPEY+W10gfCBWYWx1ZURlZjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbmNvZGluZ1dpdGhGYWNldDxGPiBleHRlbmRzIEVuY29kaW5nPEY+LCBGYWNldE1hcHBpbmc8Rj4ge31cblxuZXhwb3J0IGZ1bmN0aW9uIGNoYW5uZWxIYXNGaWVsZChlbmNvZGluZzogRW5jb2RpbmdXaXRoRmFjZXQ8RmllbGQ+LCBjaGFubmVsOiBDaGFubmVsKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNoYW5uZWxEZWYgPSBlbmNvZGluZyAmJiBlbmNvZGluZ1tjaGFubmVsXTtcbiAgaWYgKGNoYW5uZWxEZWYpIHtcbiAgICBpZiAoaXNBcnJheShjaGFubmVsRGVmKSkge1xuICAgICAgcmV0dXJuIHNvbWUoY2hhbm5lbERlZiwgKGZpZWxkRGVmKSA9PiAhIWZpZWxkRGVmLmZpZWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGlzRmllbGREZWYoY2hhbm5lbERlZikgfHwgaGFzQ29uZGl0aW9uYWxGaWVsZERlZihjaGFubmVsRGVmKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FnZ3JlZ2F0ZShlbmNvZGluZzogRW5jb2RpbmdXaXRoRmFjZXQ8RmllbGQ+KSB7XG4gIHJldHVybiBzb21lKENIQU5ORUxTLCAoY2hhbm5lbCkgPT4ge1xuICAgIGlmIChjaGFubmVsSGFzRmllbGQoZW5jb2RpbmcsIGNoYW5uZWwpKSB7XG4gICAgICBjb25zdCBjaGFubmVsRGVmID0gZW5jb2RpbmdbY2hhbm5lbF07XG4gICAgICBpZiAoaXNBcnJheShjaGFubmVsRGVmKSkge1xuICAgICAgICByZXR1cm4gc29tZShjaGFubmVsRGVmLCAoZmllbGREZWYpID0+ICEhZmllbGREZWYuYWdncmVnYXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZpZWxkRGVmID0gZ2V0RmllbGREZWYoY2hhbm5lbERlZik7XG4gICAgICAgIHJldHVybiBmaWVsZERlZiAmJiAhIWZpZWxkRGVmLmFnZ3JlZ2F0ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUVuY29kaW5nKGVuY29kaW5nOiBFbmNvZGluZzxzdHJpbmc+LCBtYXJrOiBNYXJrKTogRW5jb2Rpbmc8c3RyaW5nPiB7XG4gICByZXR1cm4ga2V5cyhlbmNvZGluZykucmVkdWNlKChub3JtYWxpemVkRW5jb2Rpbmc6IEVuY29kaW5nPHN0cmluZz4sIGNoYW5uZWw6IENoYW5uZWwgfCBzdHJpbmcpID0+IHtcbiAgICBpZiAoIWlzQ2hhbm5lbChjaGFubmVsKSkge1xuICAgICAgLy8gRHJvcCBpbnZhbGlkIGNoYW5uZWxcbiAgICAgIGxvZy53YXJuKGxvZy5tZXNzYWdlLmludmFsaWRFbmNvZGluZ0NoYW5uZWwoY2hhbm5lbCkpO1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRFbmNvZGluZztcbiAgICB9XG5cbiAgICBpZiAoIXN1cHBvcnRNYXJrKGNoYW5uZWwsIG1hcmspKSB7XG4gICAgICAvLyBEcm9wIHVuc3VwcG9ydGVkIGNoYW5uZWxcblxuICAgICAgbG9nLndhcm4obG9nLm1lc3NhZ2UuaW5jb21wYXRpYmxlQ2hhbm5lbChjaGFubmVsLCBtYXJrKSk7XG4gICAgICByZXR1cm4gbm9ybWFsaXplZEVuY29kaW5nO1xuICAgIH1cblxuICAgIC8vIERyb3AgbGluZSdzIHNpemUgaWYgdGhlIGZpZWxkIGlzIGFnZ3JlZ2F0ZWQuXG4gICAgaWYgKGNoYW5uZWwgPT09ICdzaXplJyAmJiBtYXJrID09PSAnbGluZScpIHtcbiAgICAgIGNvbnN0IGZpZWxkRGVmID0gZ2V0RmllbGREZWYoZW5jb2RpbmdbY2hhbm5lbF0pO1xuICAgICAgaWYgKGZpZWxkRGVmICYmIGZpZWxkRGVmLmFnZ3JlZ2F0ZSkge1xuICAgICAgICBsb2cud2Fybihsb2cubWVzc2FnZS5MSU5FX1dJVEhfVkFSWUlOR19TSVpFKTtcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRFbmNvZGluZztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEcm9wIGNvbG9yIGlmIGVpdGhlciBmaWxsIG9yIHN0cm9rZSBpcyBzcGVjaWZpZWRcbiAgICAgaWYgKGNoYW5uZWwgPT09ICdjb2xvcicgJiYgKCdmaWxsJyBpbiBlbmNvZGluZyB8fCAnc3Ryb2tlJyBpbiBlbmNvZGluZykgKSB7XG4gICAgICAgbG9nLndhcm4obG9nLm1lc3NhZ2UuZHJvcHBpbmdDb2xvcignZW5jb2RpbmcnLCB7ZmlsbDogJ2ZpbGwnIGluIGVuY29kaW5nLCBzdHJva2U6ICdzdHJva2UnIGluIGVuY29kaW5nfSkpO1xuICAgICAgIHJldHVybiBub3JtYWxpemVkRW5jb2Rpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgY2hhbm5lbERlZiA9IGVuY29kaW5nW2NoYW5uZWxdO1xuICAgIGlmIChcbiAgICAgIGNoYW5uZWwgPT09ICdkZXRhaWwnIHx8XG4gICAgICAoY2hhbm5lbCA9PT0gJ29yZGVyJyAmJiAhaXNBcnJheShjaGFubmVsRGVmKSAmJiAhaXNWYWx1ZURlZihjaGFubmVsRGVmKSkgfHxcbiAgICAgIChjaGFubmVsID09PSAndG9vbHRpcCcgJiYgaXNBcnJheShjaGFubmVsRGVmKSlcbiAgICApIHtcbiAgICAgIGlmIChjaGFubmVsRGVmKSB7XG4gICAgICAgIC8vIEFycmF5IG9mIGZpZWxkRGVmcyBmb3IgZGV0YWlsIGNoYW5uZWwgKG9yIHByb2R1Y3Rpb24gcnVsZSlcbiAgICAgICAgbm9ybWFsaXplZEVuY29kaW5nW2NoYW5uZWxdID0gKGlzQXJyYXkoY2hhbm5lbERlZikgPyBjaGFubmVsRGVmIDogW2NoYW5uZWxEZWZdKVxuICAgICAgICAgIC5yZWR1Y2UoKGRlZnM6IEZpZWxkRGVmPHN0cmluZz5bXSwgZmllbGREZWY6IEZpZWxkRGVmPHN0cmluZz4pID0+IHtcbiAgICAgICAgICAgIGlmICghaXNGaWVsZERlZihmaWVsZERlZikpIHtcbiAgICAgICAgICAgICAgbG9nLndhcm4obG9nLm1lc3NhZ2UuZW1wdHlGaWVsZERlZihmaWVsZERlZiwgY2hhbm5lbCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVmcy5wdXNoKG5vcm1hbGl6ZUZpZWxkRGVmKGZpZWxkRGVmLCBjaGFubmVsKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVmcztcbiAgICAgICAgICB9LCBbXSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcblxuICAgICAgY29uc3QgZmllbGREZWYgPSBnZXRGaWVsZERlZihlbmNvZGluZ1tjaGFubmVsXSk7XG4gICAgICBpZiAoZmllbGREZWYgJiYgY29udGFpbnMoW1R5cGUuTEFUSVRVREUsIFR5cGUuTE9OR0lUVURFXSwgZmllbGREZWYudHlwZSkpIHtcbiAgICAgICAgY29uc3Qge1tjaGFubmVsXTogXywgLi4ubmV3RW5jb2Rpbmd9ID0gbm9ybWFsaXplZEVuY29kaW5nO1xuICAgICAgICBjb25zdCBuZXdDaGFubmVsID0gY2hhbm5lbCA9PT0gJ3gnID8gJ2xvbmdpdHVkZScgOlxuICAgICAgICAgIGNoYW5uZWwgPT09ICd5JyA/ICdsYXRpdHVkZScgOlxuICAgICAgICAgIGNoYW5uZWwgPT09ICd4MicgPyAnbG9uZ2l0dWRlMicgOlxuICAgICAgICAgIGNoYW5uZWwgPT09ICd5MicgPyAnbGF0aXR1ZGUyJyA6IHVuZGVmaW5lZDtcbiAgICAgICAgbG9nLndhcm4obG9nLm1lc3NhZ2UubGF0TG9uZ0RlcHJlY2F0ZWQoY2hhbm5lbCwgZmllbGREZWYudHlwZSwgbmV3Q2hhbm5lbCkpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLm5ld0VuY29kaW5nLFxuICAgICAgICAgIFtuZXdDaGFubmVsXToge1xuICAgICAgICAgICAgLi4ubm9ybWFsaXplKGZpZWxkRGVmIGFzIGFueSwgY2hhbm5lbCksXG4gICAgICAgICAgICB0eXBlOiAncXVhbnRpdGF0aXZlJ1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc0ZpZWxkRGVmKGNoYW5uZWxEZWYpICYmICFpc1ZhbHVlRGVmKGNoYW5uZWxEZWYpICYmICFpc0NvbmRpdGlvbmFsRGVmKGNoYW5uZWxEZWYpKSB7XG4gICAgICAgIGxvZy53YXJuKGxvZy5tZXNzYWdlLmVtcHR5RmllbGREZWYoY2hhbm5lbERlZiwgY2hhbm5lbCkpO1xuICAgICAgICByZXR1cm4gbm9ybWFsaXplZEVuY29kaW5nO1xuICAgICAgfVxuICAgICAgbm9ybWFsaXplZEVuY29kaW5nW2NoYW5uZWxdID0gbm9ybWFsaXplKGNoYW5uZWxEZWYgYXMgQ2hhbm5lbERlZjxzdHJpbmc+LCBjaGFubmVsKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRFbmNvZGluZztcbiAgfSwge30pO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JhbmdlZChlbmNvZGluZzogRW5jb2RpbmdXaXRoRmFjZXQ8YW55Pikge1xuICByZXR1cm4gZW5jb2RpbmcgJiYgKCghIWVuY29kaW5nLnggJiYgISFlbmNvZGluZy54MikgfHwgKCEhZW5jb2RpbmcueSAmJiAhIWVuY29kaW5nLnkyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWVsZERlZnMoZW5jb2Rpbmc6IEVuY29kaW5nV2l0aEZhY2V0PEZpZWxkPik6IEZpZWxkRGVmPEZpZWxkPltdIHtcbiAgY29uc3QgYXJyOiBGaWVsZERlZjxGaWVsZD5bXSA9IFtdO1xuICBDSEFOTkVMUy5mb3JFYWNoKGZ1bmN0aW9uKGNoYW5uZWwpIHtcbiAgICBpZiAoY2hhbm5lbEhhc0ZpZWxkKGVuY29kaW5nLCBjaGFubmVsKSkge1xuICAgICAgY29uc3QgY2hhbm5lbERlZiA9IGVuY29kaW5nW2NoYW5uZWxdO1xuICAgICAgKGlzQXJyYXkoY2hhbm5lbERlZikgPyBjaGFubmVsRGVmIDogW2NoYW5uZWxEZWZdKS5mb3JFYWNoKChkZWYpID0+IHtcbiAgICAgICAgaWYgKGlzRmllbGREZWYoZGVmKSkge1xuICAgICAgICAgIGFyci5wdXNoKGRlZik7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ29uZGl0aW9uYWxGaWVsZERlZihkZWYpKSB7XG4gICAgICAgICAgYXJyLnB1c2goZGVmLmNvbmRpdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhcnI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoKG1hcHBpbmc6IGFueSxcbiAgICBmOiAoZmQ6IEZpZWxkRGVmPHN0cmluZz4sIGM6IENoYW5uZWwpID0+IHZvaWQsXG4gICAgdGhpc0FyZz86IGFueSkge1xuICBpZiAoIW1hcHBpbmcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IgKGNvbnN0IGNoYW5uZWwgb2Yga2V5cyhtYXBwaW5nKSkge1xuICAgIGlmIChpc0FycmF5KG1hcHBpbmdbY2hhbm5lbF0pKSB7XG4gICAgICBtYXBwaW5nW2NoYW5uZWxdLmZvckVhY2goZnVuY3Rpb24oY2hhbm5lbERlZjogQ2hhbm5lbERlZjxzdHJpbmc+KSB7XG4gICAgICAgIGYuY2FsbCh0aGlzQXJnLCBjaGFubmVsRGVmLCBjaGFubmVsKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmLmNhbGwodGhpc0FyZywgbWFwcGluZ1tjaGFubmVsXSwgY2hhbm5lbCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWR1Y2U8VCwgVSBleHRlbmRzIHtbayBpbiBDaGFubmVsXT86IGFueX0+KG1hcHBpbmc6IFUsXG4gICAgZjogKGFjYzogYW55LCBmZDogRmllbGREZWY8c3RyaW5nPiwgYzogQ2hhbm5lbCkgPT4gVSxcbiAgICBpbml0OiBULCB0aGlzQXJnPzogYW55KSB7XG4gIGlmICghbWFwcGluZykge1xuICAgIHJldHVybiBpbml0O1xuICB9XG5cbiAgcmV0dXJuIGtleXMobWFwcGluZykucmVkdWNlKChyLCBjaGFubmVsKSA9PiB7XG4gICAgY29uc3QgbWFwID0gbWFwcGluZ1tjaGFubmVsXTtcbiAgICBpZiAoaXNBcnJheShtYXApKSB7XG4gICAgICByZXR1cm4gbWFwLnJlZHVjZSgocjE6IFQsIGNoYW5uZWxEZWY6IENoYW5uZWxEZWY8c3RyaW5nPikgPT4ge1xuICAgICAgICByZXR1cm4gZi5jYWxsKHRoaXNBcmcsIHIxLCBjaGFubmVsRGVmLCBjaGFubmVsKTtcbiAgICAgIH0sIHIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZi5jYWxsKHRoaXNBcmcsIHIsIG1hcCwgY2hhbm5lbCk7XG4gICAgfVxuICB9LCBpbml0KTtcbn1cbiJdfQ==