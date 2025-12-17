
import { Brands } from './../../../model/Brands';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { BrandServices } from '../../../services/brand-services';
import { BrandTableComponent } from '../../components/brand-table/brand-table';
import { SidebarService } from '../../../services/sidebar-service';
// import { AuthService } from '../../../services/auth.service';
// import { BrandItem } from '../../../models/brand';

@Component({
  selector: 'app-brand',
  standalone: true,
    imports: [CommonModule, FormsModule, Navbar, Sidebar, BrandTableComponent],
  templateUrl: './brand.html',
  styleUrls: ['./brand.css']
})
export class BrandPageComponent {
    
    // Brand Model
    brands: Brands[] = [];
    filteredBrands: Brands[] = [];
    searchTerm = '';
    isSidebarOpen = true;
    isLoading = false;
    errorMessage = '';
    
    currentBrand: Brands = {
        id: 0,
        referenceId: '',
        model: '',
        motherboard: '',
        officeInstalled: '',
        osInstalled: '',
        processor: '',
        ramModel: '',
        ramSize: '',
        storageModel: '',
        storageSize: '',
        videoCardMemory: '',
        videoCardModel: '',
        userId: ''
    };

    isEditMode = false;
    showForm = false;
    showDeleteModal = false;

    brandToDelete: Brands | null = null;

    private sidebarService = inject(SidebarService);
    private brandService = inject(BrandServices);

    constructor() {
        this.sidebarService.sidebarOpen$.subscribe(isOpen => {
            this.isSidebarOpen = isOpen as boolean;
        });
    }
    // On component init, load brands
    ngOnInit(): void {
        this.loadBrands();
    }
    loadBrands(): void {
        this.isLoading = true;
        this.brandService.getAllBrands().subscribe({
            next: (data: Brands[]) => {
                this.brands = data;
                this.filteredBrands = [...data];
                this.isLoading = false;
            },
            error: (error: any) => {
                this.errorMessage = 'Error loading brands. Please try again later.';
                this.isLoading = false;
            }
        });
    }
    // Search logic
    onSearch(): void {
        if (!this.searchTerm) {
            this.filteredBrands = [...this.brands];
            return;
        }

        const search = this.searchTerm.toLowerCase();
        this.filteredBrands = this.brands.filter(b => 
            b.referenceId?.toLowerCase().includes(search) ||
            b.model.toLowerCase().includes(search) ||
            b.motherboard.toLowerCase().includes(search) ||
            b.officeInstalled.toLowerCase().includes(search) ||
            b.osInstalled.toLowerCase().includes(search) ||
            b.processor.toLowerCase().includes(search) ||
            b.ramModel.toLowerCase().includes(search) ||
            b.storageModel.toLowerCase().includes(search) ||
            b.videoCardModel.toLowerCase().includes(search)
        );
    }

    openAddForm() {
        this.isEditMode = false;
        this.showForm = true;
        this.resetForm();
    }
    openEditForm(brand: Brands) {
        this.isEditMode = true;
        this.showForm = true;
        this.currentBrand = { ...brand };
    }
    resetForm() : void {
        this.currentBrand = {
            id: 0,
            referenceId: '',
            model: '',
            motherboard: '',
            officeInstalled: '',
            osInstalled: '',
            processor: '',
            ramModel: '',
            ramSize: '',
            storageModel: '',
            storageSize: '',
            videoCardMemory: '',
            videoCardModel: '',
            userId: ''
        };
    }
    closeForm() {
        this.showForm = false;
        this.resetForm();
    }
    onSubmit(): void {
        this.isLoading = true;
        this.errorMessage = '';
        if (this.isEditMode) 
        {
            this.brandService.updateBrand(this.currentBrand.id, this.currentBrand).subscribe({
                next: (updatedBrand: Brands) => {
                    const index = this.brands.findIndex(b => b.id === updatedBrand.id);
                    if (index !== -1) {
                        this.brands[index] = updatedBrand;
                        this.filteredBrands[index] = updatedBrand;
                    }
                    this.showForm = false;
                    this.isLoading = false;
                },
                error: () => {
                // refresh list to reconcile state and close form as fallback
                this.brandService.getAllBrands().subscribe({
                    next: (items) => {
                    this.brands = items;
                    this.onSearch();
                    this.closeForm();
                    this.isLoading = false;
                    },
                    error: () => { this.isLoading = false; }
                });
                }
            });
        }else {
            const payload = {
                referenceId: `BR-${Date.now()}`,
                model: this.currentBrand.model,
                motherboard: this.currentBrand.motherboard,
                officeInstalled: this.currentBrand.officeInstalled,
                osInstalled: this.currentBrand.osInstalled,
                processor: this.currentBrand.processor,
                ramModel: this.currentBrand.ramModel,
                ramSize: this.currentBrand.ramSize,
                storageModel: this.currentBrand.storageModel,
                storageSize: this.currentBrand.storageSize,
                videoCardMemory: this.currentBrand.videoCardMemory,
                videoCardModel: this.currentBrand.videoCardModel,
                userId: this.currentBrand.userId
            } as any;
            this.brandService.createBrand(payload).subscribe({
                next: (newBrand: Brands) => {
                    // Reload from server to ensure we have canonical data (id, defaults)
                    this.loadBrands();
                    // close form and stop loading
                    this.showForm = false;
                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                }
            });
        }
    }
    deleteBrand(brand: Brands) : void{
        this.brandToDelete = brand;
        this.showDeleteModal = true;
    }
    confirmDelete() {
        if (!this.brandToDelete) return;

        this.isLoading = true;

        this.brandService.deleteBrand(this.brandToDelete.id).subscribe({
        next: () => {
            this.loadBrands();
            this.closeDeleteModal();
        },
        error: () => {
            this.loadBrands();
            this.closeDeleteModal();
        }
        });
    }
    closeDeleteModal() {
        this.showDeleteModal = false;
        this.brandToDelete = null;
    }
}
