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
var UserService = (function () {
    function UserService(_user) {
        this.user = _user;
    }
    UserService.prototype.getUserData = function (email, password) {
        this.email = email;
        this.password = password;
    };
    UserService = __decorate([
        angular2_1.Component({
            selector: 'app'
        }), 
        __metadata('design:paramtypes', [Object])
    ], UserService);
    return UserService;
})();
// Annotation section
var AppComponent = (function () {
    function AppComponent(userService) {
        console.log('login');
        this.user = userService.user;
    }
    AppComponent = __decorate([
        angular2_1.Component({
            selector: 'app',
            bindings: [UserService]
        }),
        angular2_1.View({
            templateUrl: 'view/index.ng.html',
            directives: [angular2_1.NgFor, angular2_1.NgIf]
        }), 
        __metadata('design:paramtypes', [UserService])
    ], AppComponent);
    return AppComponent;
})();
angular2_1.bootstrap(AppComponent);
