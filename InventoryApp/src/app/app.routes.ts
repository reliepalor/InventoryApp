import { Dashboard } from './features/inventory/pages/dashboard/dashboard';
import { Routes } from '@angular/router';
import { authGuard } from './features/services/auth.guard';
import { StorageModelPageComponent } from './features/inventory/pages/storage-model/storage-model';
import { VideocardMemoryPageComponent } from './features/inventory/pages/videocard-memory/videocard-memory';
import { VideocardModelPageComponent } from './features/inventory/pages/videocard-model/videocard-model';
import { StorageSizePageComponent } from './features/inventory/pages/storage-size/storage-size';

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
        canActivate: [authGuard]
    },
    {
        path: 'add-table',
        loadComponent: () => import('./features/inventory/pages/add-table/add-table').then(m => m.AddTablePageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'table/:id',
        loadComponent: () => import('./features/inventory/pages/add-table/add-table').then(m => m.AddTablePageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/pages/inventory/inventory').then(m => m.InventoryPageComponent),
        canActivate: [authGuard]
    },
    { 
        path: 'model', 
        loadComponent: () => import('./features/inventory/pages/model/model').then(m => m.ModelPageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'brand',
        loadComponent: () => import('./features/inventory/pages/brand/brand').then(m => m.BrandPageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'motherboard',
        loadComponent: () => import('./features/inventory/pages/motherboard/motherboard').then(m => m.MotherboardPageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'office-installed',
        loadComponent: () => import('./features/inventory/pages/office-installed/office-installed').then(m => m.OfficeInstalled),
        canActivate: [authGuard]
    },
    {
        path: 'os-installed',
        loadComponent: () => import('./features/inventory/pages/os-installed/os-installed').then(m => m.OsInstalled),
        canActivate: [authGuard]
    },
    {
        path: 'processor',
        loadComponent: () => import('./features/inventory/pages/processor/processor').then(m => m.ProcessorPageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'ram-model',
        loadComponent: () => import('./features/inventory/pages/ram-model/ram-model').then(m => m.RamModelPageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'ram-size',
        loadComponent: () => import('./features/inventory/pages/ram-size/ram-size').then(m => m.RamSizePageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'storage-model',
        loadComponent: () => import('./features/inventory/pages/storage-model/storage-model').then(m => StorageModelPageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'storage-size',
        loadComponent: () => import('./features/inventory/pages/storage-size/storage-size').then(m => StorageSizePageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'videocard-memory',
        loadComponent: () => import('./features/inventory/pages/videocard-memory/videocard-memory').then(m => VideocardMemoryPageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'videocard-model',
        loadComponent: () => import('./features/inventory/pages/videocard-model/videocard-model').then(m => VideocardModelPageComponent),
        canActivate: [authGuard]
    }




];
