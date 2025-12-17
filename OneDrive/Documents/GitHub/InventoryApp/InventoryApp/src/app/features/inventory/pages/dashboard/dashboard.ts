import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { SidebarService } from '../../../services/sidebar-service';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Navbar } from '../../components/navbar/navbar';
import { InventoryService } from '../../../services/inventory-service';
import { Inventy } from '../../../model';
// import { InventoryService } from '../../../services/inventory.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Sidebar, Navbar],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  isSidebarOpen = true;
  inventoryCount = 0;
  acceptedCount = 0;
  pendingCount = 0;
  issuesCount = 0;
  recentItems: Inventy[] = [];

  private authService = inject(AuthService);
  private router = inject(Router);
  private sidebarService = inject(SidebarService);
  private inventoryService = inject(InventoryService);
//   inventoryService = inject(InventoryService);
  
  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }


  ngOnInit(): void {
    this.loadInventoryStats();
  }

  private loadInventoryStats(): void {
    this.inventoryService.getAllInventory().subscribe({
      next: (items) => {
        this.inventoryCount = items.length;
        this.acceptedCount = items.filter(i => !!i.assignedTo).length;
        this.pendingCount = items.filter(i => !i.assignedTo).length;
        this.issuesCount = items.filter(i => {
          const t = (i.type || '').toLowerCase();
          return t.includes('issue') || t.includes('fault') || t.includes('damag') || t.includes('broken');
        }).length;
        this.recentItems = items
          .slice()
          .sort((a, b) => {
            const da = a.created_at ? Date.parse(a.created_at) : 0;
            const db = b.created_at ? Date.parse(b.created_at) : 0;
            return db - da;
          })
          .slice(0, 5);
      },
      error: (err) => {
        console.error('Failed to load inventory stats', err);
      }
    });
  }

//   loadInventoryData(): void {
//     this.inventoryService.getAllInventory().subscribe({
//       next: (data: any) => {
//         console.log('Inventory data loaded:', data);
//       },
//       error: (error: any) => {
//         console.error('Error loading inventory data:', error);
//       }
//     });
//   }
  Logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
