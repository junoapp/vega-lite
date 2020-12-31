"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeJoinAggregateFromFacet = void 0;
const channeldef_1 = require("../../channeldef");
const sort_1 = require("../../sort");
const facet_1 = require("../facet");
const joinaggregate_1 = require("./joinaggregate");
function makeJoinAggregateFromFacet(parent, facet) {
    const { row, column } = facet;
    if (row && column) {
        let newParent = null;
        // only need to make one for crossed facet
        for (const fieldDef of [row, column]) {
            if (sort_1.isSortField(fieldDef.sort)) {
                const { field, op = sort_1.DEFAULT_SORT_OP } = fieldDef.sort;
                parent = newParent = new joinaggregate_1.JoinAggregateTransformNode(parent, {
                    joinaggregate: [
                        {
                            op,
                            field,
                            as: facet_1.facetSortFieldName(fieldDef, fieldDef.sort, { forAs: true })
                        }
                    ],
                    groupby: [channeldef_1.vgField(fieldDef)]
                });
            }
        }
        return newParent;
    }
    return null;
}
exports.makeJoinAggregateFromFacet = makeJoinAggregateFromFacet;
//# sourceMappingURL=joinaggregatefacet.js.map