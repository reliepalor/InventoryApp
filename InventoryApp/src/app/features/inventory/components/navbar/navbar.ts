import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  // styleUrl: './navbar.css',
})
export class Navbar {
  isSidebarOpen = true;

  constructor(private sidebarService: SidebarService) {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }
}
