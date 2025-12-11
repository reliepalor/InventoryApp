import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
@Component({
  selector: 'app-inventory',
  imports: [Navbar, Sidebar],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory {

}
