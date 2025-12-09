import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  // styleUrl: './sidebar.css',
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
    { label: 'Processor', route: '/inventory/maintenance/processor' },
    { label: 'RAM Model', route: '/inventory/maintenance/ram-model' },
    { label: 'RAM Size', route: '/inventory/maintenance/ram-size' },
    { label: 'Storage Model', route: '/inventory/maintenance/storage-model' },
    { label: 'Storage Size', route: '/inventory/maintenance/storage-size' },
    { label: 'Video Card Memory', route: '/inventory/maintenance/video-card-memory' },
    { label: 'Video Card Model', route: '/inventory/maintenance/video-card-model' },
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private sidebarService = inject(SidebarService);
  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
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
