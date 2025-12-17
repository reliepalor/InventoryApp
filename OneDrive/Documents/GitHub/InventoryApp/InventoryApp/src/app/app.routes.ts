import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    { path: 'login', loadComponent: () => import('./features/inventory/auth/login/login.component').then(m => m.LoginPageComponent) },
    { path: 'register', loadComponent: () => import('./features/inventory/auth/register/register.component').then(m => m.RegisterPageComponent) },
    { 
        path: 'dashboard', 
        loadComponent: () => import('./features/inventory/pages/dashboard/dashboard').then(m => m.Dashboard),
    },
    {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/pages/inventory/inventory').then(m => m.InventoryPageComponent),
    },
    {
        path: 'brand',
        loadComponent: () => import('./features/inventory/pages/brand/brand').then(m => m.BrandPageComponent),
    },
];
