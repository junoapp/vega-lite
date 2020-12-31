"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectionComponent = void 0;
const split_1 = require("../split");
class ProjectionComponent extends split_1.Split {
    constructor(name, specifiedProjection, size, data) {
        super(Object.assign({}, specifiedProjection), // all explicit properties of projection
        { name } // name as initial implicit property
        );
        this.specifiedProjection = specifiedProjection;
        this.size = size;
        this.data = data;
        this.merged = false;
    }
    /**
     * Whether the projection parameters should fit provided data.
     */
    get isFit() {
        return !!this.data;
    }
}
exports.ProjectionComponent = ProjectionComponent;
//# sourceMappingURL=component.js.map