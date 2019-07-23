"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var convector_core_1 = require("@worldsibu/convector-core");
var rec_model_1 = require("./rec.model");
var RecController = (function (_super) {
    tslib_1.__extends(RecController, _super);
    function RecController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RecController.prototype.create = function (rec) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, rec.save()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    tslib_1.__decorate([
        convector_core_1.Invokable(),
        tslib_1.__param(0, convector_core_1.Param(rec_model_1.Rec))
    ], RecController.prototype, "create", null);
    RecController = tslib_1.__decorate([
        convector_core_1.Controller('rec')
    ], RecController);
    return RecController;
}(convector_core_1.ConvectorController));
exports.RecController = RecController;
//# sourceMappingURL=rec.controller.js.map