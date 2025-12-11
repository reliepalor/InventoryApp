import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  isMaintenanceOpen = false;
  isSidebarOpen = true;

  maintenanceItems = [
    { label: 'Brand', route: '/brand' },
    { label: 'Model', route: '/model' },
    { label: 'Motherboard', route: '/motherboard' },
    { label: 'Office Installed', route: '/office-installed' },
    { label: 'OS Installed', route: '/os-installed' },
    { label: 'Processor', route: '/processor' },
    { label: 'RAM Model', route: '/ram-model' },
    { label: 'RAM Size', route: '/ram-size' },
    { label: 'Storage Model', route: '/storage-model' },
    { label: 'Storage Size', route: '/storage-size' },
    { label: 'Video Card Memory', route: '/videocard-memory' },
    { label: 'Video Card Model', route: '/videocard-model' },
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private sidebarService = inject(SidebarService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });

    // Listen to route changes and keep maintenance open if route matches
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        this.isMaintenanceOpen = this.maintenanceItems.some(item => currentUrl.startsWith(item.route));
      }
    });
  }

  toggleMaintenance(): void {
    this.isMaintenanceOpen = !this.isMaintenanceOpen;
  }

  expandAndOpenMaintenance(): void {
    if (!this.isSidebarOpen) {
      this.sidebarService.toggleSidebar();
    }
    this.isMaintenanceOpen = true;
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  logout(): void {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
}
