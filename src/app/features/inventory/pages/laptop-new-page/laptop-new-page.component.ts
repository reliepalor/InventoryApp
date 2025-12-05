import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LaptopInventoryItem } from '../../../../core/models/laptop-inventory.model';

@Component({
  selector: 'app-laptop-new-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './laptop-new-page.component.html',
  styleUrls: ['./laptop-new-page.component.css']
})
export class LaptopNewPageComponent implements OnInit {

  form: FormGroup;
  loading = false;

  private readonly STORAGE_KEY = 'laptop-new-form';
  private readonly INVENTORY_STORAGE_KEY = 'laptop-inventory';

  // Dropdown data (example values)
  models = ['Dell Optiplex', 'HP Elitebook', 'Lenovo ThinkPad'];
  motherboards = ['MSI B560', 'ASUS A520', 'Gigabyte Z490'];
  sockets = ['LGA1200', 'AM4', 'LGA1700'];
  chipsets = ['B560', 'A520', 'Z490', 'H610'];
  processors = ['Intel i5-11400', 'Ryzen 5 3600', 'Intel i7-10700'];
  ramModels = ['DDR4', 'DDR5'];
  ramSizes = ['4GB', '8GB', '16GB', '32GB', '64GB'];
  storageModels = ['Samsung SSD', 'WD Blue SSD', 'Seagate HDD'];
  storageSizes = ['256GB', '512GB', '1TB', '2TB'];
  videoCardModels = ['GTX 1650', 'RTX 3050', 'Integrated'];
  videoCardMemory = ['2GB', '4GB', '8GB', '16GB'];
  osInstalled = ['Windows 10', 'Windows 11', 'Ubuntu', 'macOS'];
  officeInstalled = ['Office 2016', 'Office 2019', 'Microsoft 365'];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      model: ['', Validators.required],
      motherboard: ['', Validators.required],
      socket: ['', Validators.required],
      chipset: ['', Validators.required],
      processor: ['', Validators.required],
      ramModel: ['', Validators.required],
      ramSize: ['', Validators.required],
      storageModel: ['', Validators.required],
      storageSize: ['', Validators.required],
      videoCardModel: ['', Validators.required],
      videoCardMemory: ['', Validators.required],
      osInstalled: ['', Validators.required],
      officeInstalled: ['', Validators.required],
    });

    // Load saved data (if any) from localStorage
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.form.patchValue(parsed);
      } catch (e) {
        console.error('Failed to parse saved laptop form from localStorage', e);
      }
    }
  }

  ngOnInit(): void {
    // Auto-save to localStorage whenever the form changes
    this.form.valueChanges.subscribe(value => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(value));
    });
  }

  increaseRamSize() {
    const currentValue = this.form.get('ramSize')?.value;
    const currentIndex = this.ramSizes.indexOf(currentValue);
    
    if (currentIndex !== -1 && currentIndex < this.ramSizes.length - 1) {
      this.form.get('ramSize')?.setValue(this.ramSizes[currentIndex + 1]);
    } else if (!currentValue) {
      // If empty, set to first option
      this.form.get('ramSize')?.setValue(this.ramSizes[0]);
    }
  }

  decreaseRamSize() {
    const currentValue = this.form.get('ramSize')?.value;
    const currentIndex = this.ramSizes.indexOf(currentValue);
    
    if (currentIndex > 0) {
      this.form.get('ramSize')?.setValue(this.ramSizes[currentIndex - 1]);
    }
  }

  submit() {
    if (this.form.invalid) {
      // Mark all fields as touched to show validation errors
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = this.form.value;
    console.log('Form Data:', formData);

    // Get existing inventory
    const existingInventory = this.getInventoryFromStorage();

    // Create new inventory item
    const newItem: LaptopInventoryItem = this.mapFormDataToInventoryItem(formData, existingInventory.length + 1);

    // Add to inventory
    existingInventory.push(newItem);

    // Save to localStorage
    localStorage.setItem(this.INVENTORY_STORAGE_KEY, JSON.stringify(existingInventory));

    // simulate API call
    setTimeout(() => {
      this.loading = false;

      // Clear saved draft after successful save
      localStorage.removeItem(this.STORAGE_KEY);

      this.router.navigate(['/inventory/laptops']);
    }, 500);
  }

  private getInventoryFromStorage(): LaptopInventoryItem[] {
    const stored = localStorage.getItem(this.INVENTORY_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse inventory from localStorage', e);
      }
    }
    return [];
  }

  private mapFormDataToInventoryItem(formData: any, nextNo: number): LaptopInventoryItem {
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    return {
      no: nextNo,
      propertyTagNew: `INV-LAP-${String(nextNo).padStart(4, '0')}`,
      propertyTagOld: '',
      purchasedDate: now,
      department: 'IT', // default
      endUser: 'New User', // default
      systemType: 'Laptop',
      systemBrand: 'Unknown', // could extract from model, but for now default
      systemModel: formData.model,
      motherboard: formData.motherboard,
      socket: formData.socket,
      chipset: formData.chipset,
      processorSpec: formData.processor,
      ramBrandModel: formData.ramModel,
      ramSize: formData.ramSize,
      ramSerialNumber: '',
      ramInterface: '',
      storageModel: formData.storageModel,
      storageSize: formData.storageSize,
      videoCardModel: formData.videoCardModel,
      videoCardMemory: formData.videoCardMemory,
      mouse: '',
      keyboard: '',
      dvdRom: '',
      serviceTag: '',
      displaySpec: '',
      displayPurchaseDate: '',
      displaySerialNumber: '',
      displayTagNumber: '',
      macAddress: '',
      wlan: '',
      lan: '',
      osType: formData.osInstalled,
      osVersion: '',
      osSerialKey: '',
      officeType: formData.officeInstalled,
      officeVersion: '',
      officeSerialKey: '',
      location: '',
      status: 'Available',
      remarks: '',
      price: '',
      configuredBy: 'User',
      computerName: `LAP-${nextNo}`
    };
  }

  cancel() {
    this.router.navigate(['/inventory/laptops']);
  }
}