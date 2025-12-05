import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile.component';
import { AuthGuard } from './guards/auth-guard';
import { Dashboard } from './pages/dashboard/dashboard';

// 👇 Import the inventory page you created
import { LaptopInventoryPageComponent } from './core/inventory/pages/laptop-inventory-page/laptop-inventory-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  // 👇 Dashboard route
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },

  // 👇 Laptop inventory list route (the one your card uses)
  {
    path: 'inventory/laptops',
    component: LaptopInventoryPageComponent,
    canActivate: [AuthGuard]
  },

  // You can add these later when you have pages for them:
  // {
  //   path: 'inventory/laptops/new',
  //   component: LaptopInventoryPageComponent,
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'inventory/laptops/reports',
  //   component: LaptopInventoryPageComponent,
  //   canActivate: [AuthGuard]
  // },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

