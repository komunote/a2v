var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/// <reference path="../typings/angular2/angular2.d.ts" />
var angular2_1 = require('angular2/angular2');
var FriendsService = (function () {
    function FriendsService() {
        console.log(17);
        this.names = ["Alice", "Aarav", "Martín", "Shannon", "Ariana", "Kai"];
    }
    FriendsService = __decorate([
        angular2_1.Component({
            selector: 'app-home'
        }), 
        __metadata('design:paramtypes', [])
    ], FriendsService);
    return FriendsService;
})();
var SubscribeService = (function () {
    function SubscribeService() {
    }
    SubscribeService.prototype.checkEmail = function (email) {
        this.email = email;
    };
    SubscribeService = __decorate([
        angular2_1.Component({
            selector: 'app-home'
        }), 
        __metadata('design:paramtypes', [])
    ], SubscribeService);
    return SubscribeService;
})();
// Annotation section
var AppHomeComponent = (function () {
    function AppHomeComponent(friendsService) {
        console.log(27);
        this.myName = 'Alice';
        this.names = friendsService.names;
    }
    AppHomeComponent = __decorate([
        angular2_1.Component({
            selector: 'app-home',
            bindings: [FriendsService, SubscribeService]
        }),
        angular2_1.View({
            templateUrl: 'view/index-home.ng.html',
            directives: [angular2_1.NgFor, angular2_1.NgIf]
        }), 
        __metadata('design:paramtypes', [FriendsService])
    ], AppHomeComponent);
    return AppHomeComponent;
})();
angular2_1.bootstrap(AppHomeComponent);
