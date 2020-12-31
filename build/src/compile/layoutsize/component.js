"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSizeTypeFromLayoutSizeType = void 0;
function getSizeTypeFromLayoutSizeType(layoutSizeType) {
    return layoutSizeType === 'childWidth' ? 'width' : layoutSizeType === 'childHeight' ? 'height' : layoutSizeType;
}
exports.getSizeTypeFromLayoutSizeType = getSizeTypeFromLayoutSizeType;
//# sourceMappingURL=component.js.map