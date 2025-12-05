import { Component } from '@angular/core';
import {
  ButtonModule,
  DropdownMenuModule,
  AvatarModule,
  SheetModule
} from 'shadcn-ng';
import { LucideAngularModule, Menu, User, LogOut } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    ButtonModule,
    DropdownMenuModule,
    AvatarModule,
    SheetModule,
    LucideAngularModule.pick({ Menu, User, LogOut })
  ],
  templateUrl: './navbar.component.html'
})
export class Navbar{}
