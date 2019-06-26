"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var convector_core_1 = require("@worldsibu/convector-core");
var medrec_model_1 = require("./medrec.model");
var MedrecController = (function (_super) {
    tslib_1.__extends(MedrecController, _super);
    function MedrecController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MedrecController.prototype.create = function (medrec) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, medrec.save()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    tslib_1.__decorate([
        convector_core_1.Invokable(),
        tslib_1.__param(0, convector_core_1.Param(medrec_model_1.Medrec))
    ], MedrecController.prototype, "create", null);
    MedrecController = tslib_1.__decorate([
        convector_core_1.Controller('medrec')
    ], MedrecController);
    return MedrecController;
}(convector_core_1.ConvectorController));
exports.MedrecController = MedrecController;
//# sourceMappingURL=medrec.controller.js.map