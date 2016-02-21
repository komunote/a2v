/// <reference path="../typings/angular2/angular2.d.ts" />
import {Component, View, bootstrap, NgFor, NgIf} from 'angular2/angular2';


@Component({
  selector: 'app'
})
class UserService {
  user: Object;
  
  constructor(_user:Object) {
    this.user = _user;
  }
  
  getUserData(email:string, password:string) {
    this.email = email;
    this.password = password;
  }
}

// Annotation section
@Component({
  selector: 'app',
  bindings: [UserService]
})
@View({
  templateUrl: 'view/index.ng.html',
  directives: [NgFor, NgIf]
})
// Component controller
class AppComponent {
  user: Object;
  constructor(userService: UserService) {
    console.log('login');
    this.user = userService.user;
  }
}

bootstrap(AppComponent);