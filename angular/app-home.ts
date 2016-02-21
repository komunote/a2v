/// <reference path="../typings/angular2/angular2.d.ts" />
import {Component, View, bootstrap, NgFor, NgIf} from 'angular2/angular2';

@Component({
  selector: 'app-home'
})
class FriendsService {
  names: Array<string>;
  constructor() {
    console.log(17);
    this.names = ["Alice", "Aarav", "Martín", "Shannon", "Ariana", "Kai"];
  }
}

@Component({
  selector: 'app-home'
})
class SubscribeService {
  email: string;
  
  constructor() {
  }
  
  checkEmail(email:string) {
    this.email = email;
  }
}

// Annotation section
@Component({
  selector: 'app-home',
  bindings: [FriendsService, SubscribeService]
})
@View({
  templateUrl: 'view/index-home.ng.html',
  directives: [NgFor, NgIf]
})
// Component controller
class AppHomeComponent {
  myName: string;
  names: Array<string>;
  constructor(friendsService: FriendsService) {
    console.log(27);
    this.myName = 'Alice';
    this.names = friendsService.names;
  }
}

bootstrap(AppHomeComponent);