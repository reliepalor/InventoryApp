import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent} from './shared/navbar/navbar';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  imports: [RouterOutlet]
})
export class App {
  title = 'InventoryApp';
}
