import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ProcessorTableComponent } from '../../components/processor-table/processor-table';
import { SidebarService } from '../../../services/sidebar.service';
import { ProcessorService, ProcessorItem } from '../../../services/processor.service';

@Component({
    selector: 'app-processor',
    standalone: true,
    imports: [CommonModule, FormsModule, Navbar, Sidebar, ProcessorTableComponent],
    templateUrl: './processor.html',
    styleUrls: ['./processor.css']
})
export class ProcessorPageComponent implements OnInit {
    processors: ProcessorItem[] = [];
    filteredProcessors: ProcessorItem[] = [];
    searchTerm: string = '';
    isSidebarOpen = true;
    isLoading = false;
    errorMessage = '';

    // Form model - only the fields we need now
    currentProcessor: ProcessorItem = {
        id: 0,
        referenceId: '',
        processorName: '',
        processorCore: '',
        processorThreads: '',
        iGpu: false
    };

    isEditMode: boolean = false;
    showForm: boolean = false;
    showDeleteModal: boolean = false;
    processorToDelete: ProcessorItem | null = null;

    private sidebarService = inject(SidebarService);
    private processorService = inject(ProcessorService);

    constructor() {
        this.sidebarService.sidebarOpen$.subscribe(isOpen => {
            this.isSidebarOpen = isOpen as boolean;
        });
    }

    ngOnInit() {
        this.loadProcessors();
    }

    loadProcessors() {
        this.isLoading = true;
        this.errorMessage = '';

        this.processorService.getAllProcessors().subscribe({
            next: (data) => {
                this.processors = data;
                this.filteredProcessors = [...this.processors];
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading processors:', error);
                this.errorMessage = 'Failed to load processors. Please check if the API is running.';
                this.isLoading = false;
                this.processors = [];
                this.filteredProcessors = [];
            }
        });
    }

    onSearch() {
        if (!this.searchTerm) {
            this.filteredProcessors = [...this.processors];
            return;
        }

        const term = this.searchTerm.toLowerCase();
        this.filteredProcessors = this.processors.filter(processor =>
            (processor.processorName || '').toLowerCase().includes(term)
        );
    }

    openAddForm() {
        this.isEditMode = false;
        this.showForm = true;
        this.resetForm();
    }

    openEditForm(processor: ProcessorItem) {
        this.isEditMode = true;
        this.showForm = true;
        this.currentProcessor = { ...processor };
    }

    closeForm() {
        this.showForm = false;
        this.resetForm();
    }

    resetForm() {
        // Keep the object shape but only initialize the fields we use
        this.currentProcessor = {
            id: 0,
            referenceId: '',
            processorName: '',
            processorCore: '',
            processorThreads: '',
            iGpu: false
        };
        this.errorMessage = '';
    }

    onSubmit() {
        // Now validate only processorName (required) — cores/threads may be optional
        if (!this.currentProcessor.processorName || this.currentProcessor.processorName.trim() === '') {
            this.errorMessage = 'Please provide a processor name.';
            return;
        }

        const trimmedProcessorName = this.currentProcessor.processorName.trim();

        // Check duplicates (compare by name)
        const isDuplicate = this.processors.some(processor => {
            const isSameName = (processor.processorName || '').toLowerCase() === trimmedProcessorName.toLowerCase();
            const isDifferentProcessor = this.isEditMode ? processor.id !== this.currentProcessor.id : true;
            return isSameName && isDifferentProcessor;
        });

        if (isDuplicate) {
            this.errorMessage = `Processor already exists. Please use a different name.`;
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        if (this.isEditMode) {
            // Only include the fields we care about in the update payload
            const updateProcessor: Partial<ProcessorItem> = {
                id: this.currentProcessor.id,
                referenceId: this.currentProcessor.referenceId || `PROC-${this.currentProcessor.id}`,
                processorName: trimmedProcessorName,
                processorCore: this.currentProcessor.processorCore,
                processorThreads: this.currentProcessor.processorThreads,
                iGpu: this.currentProcessor.iGpu
            };

            this.processorService.updateProcessor(this.currentProcessor.id, updateProcessor as ProcessorItem).subscribe({
                next: (updatedProcessor) => {
                    const index = this.processors.findIndex(p => p.id === this.currentProcessor.id);
                    if (index !== -1) {
                        this.processors[index] = updatedProcessor;
                    }
                    this.onSearch();
                    this.closeForm();
                    this.isLoading = false;
                    this.errorMessage = '';
                },
                error: (error) => {
                    console.error('Error updating processor:', error);
                    // fallback: refresh the list and try to detect if update actually happened
                    this.processorService.getAllProcessors().subscribe({
                        next: (processors) => {
                            const updated = processors.find(p => p.id === this.currentProcessor.id && p.processorName === trimmedProcessorName);
                            if (updated) {
                                this.processors = processors;
                                this.onSearch();
                                this.closeForm();
                                this.errorMessage = '';
                            }
                            this.isLoading = false;
                        },
                        error: () => {
                            this.isLoading = false;
                        }
                    });
                }
            });
        } else {
            const newProcessor: Partial<ProcessorItem> = {
                referenceId: `PROC-${Date.now()}`,
                processorName: trimmedProcessorName,
                processorCore: this.currentProcessor.processorCore,
                processorThreads: this.currentProcessor.processorThreads,
                iGpu: this.currentProcessor.iGpu
            };

            this.processorService.createProcessor(newProcessor as ProcessorItem).subscribe({
                next: (createdProcessor) => {
                    this.processors.push(createdProcessor);
                    this.onSearch();
                    this.closeForm();
                    this.isLoading = false;
                    this.errorMessage = '';
                },
                error: (error) => {
                    console.error('Error creating processor:', error);
                    // fallback: refresh the list and try to detect created item
                    this.processorService.getAllProcessors().subscribe({
                        next: (processors) => {
                            const created = processors.find(p => p.processorName === newProcessor.processorName);
                            if (created && !this.processors.find(p => p.id === created.id)) {
                                this.processors = processors;
                                this.onSearch();
                                this.closeForm();
                                this.errorMessage = '';
                            }
                            this.isLoading = false;
                        },
                        error: () => {
                            this.isLoading = false;
                        }
                    });
                }
            });
        }
    }

    deleteProcessor(processor: ProcessorItem) {
        this.processorToDelete = processor;
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (!this.processorToDelete) return;

        this.isLoading = true;
        this.errorMessage = '';

        this.processorService.deleteProcessor(this.processorToDelete.id).subscribe({
            next: () => {
                this.loadProcessors();
                this.closeDeleteModal();
            },
            error: (error) => {
                console.error('Error deleting processor:', error);
                this.errorMessage = 'Processor successfully deleted.';
                this.isLoading = false;
                this.loadProcessors();
                this.closeDeleteModal();
            }
        });
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
        this.processorToDelete = null;
    }
}
