import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PaginationConfiguration,
  PaginationState,
  PageChangeEvent,
  PageSizeChangeEvent
} from '../types/table.types';

@Component({
  selector: 'ngt-table-paging',
  templateUrl: './ng-table-paging.html',
  styleUrl: './ng-table-paging.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class NgTablePagingComponent {
  // Inputs
  pagination = input.required<PaginationState>();
  config = input<PaginationConfiguration>({});
  
  // Outputs
  pageChange = output<PageChangeEvent>();
  pageSizeChange = output<PageSizeChangeEvent>();
  
  // Internal state
  private readonly defaultConfig: Required<PaginationConfiguration> = {
    enabled: true,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 75, 100],
    showPageSizeSelector: true,
    showFirstLastButtons: true,
    showPageNumbers: true,
    maxPageButtons: 5,
    position: 'bottom'
  };
  
  // Computed properties
  mergedConfig = computed(() => ({ ...this.defaultConfig, ...this.config() }));
  
  currentPage = computed(() => this.pagination().currentPage);
  totalPages = computed(() => this.pagination().totalPages);
  pageSize = computed(() => this.pagination().pageSize);
  totalItems = computed(() => this.pagination().totalItems);
  
  // Calculate visible page numbers
  visiblePageNumbers = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const maxButtons = this.mergedConfig().maxPageButtons;
    
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxButtons - 1);
    
    // Adjust start if we're near the end
    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });
  
  // Calculate start and end item numbers
  startItem = computed(() => {
    const current = this.currentPage();
    const size = this.pageSize();
    return Math.max(0, (current - 1) * size + 1);
  });
  
  endItem = computed(() => {
    const current = this.currentPage();
    const size = this.pageSize();
    const total = this.totalItems();
    return Math.min(total, current * size);
  });
  
  // Navigation state
  canGoPrevious = computed(() => this.currentPage() > 1);
  canGoNext = computed(() => this.currentPage() < this.totalPages());
  
  // Page navigation methods
  goToPage(page: number): void {
    if (page === this.currentPage() || page < 1 || page > this.totalPages()) {
      return;
    }
    
    this.pageChange.emit({
      page,
      pageSize: this.pageSize(),
      totalItems: this.totalItems(),
      previousPage: this.currentPage()
    });
  }
  
  goToFirstPage(): void {
    this.goToPage(1);
  }
  
  goToLastPage(): void {
    this.goToPage(this.totalPages());
  }
  
  goToPreviousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }
  
  goToNextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }
  
  onPageSizeChange(newPageSize: number): void {
    const currentPageSize = this.pageSize();
    if (newPageSize === currentPageSize) {
      return;
    }
    
    // Calculate new page to maintain roughly the same position
    const currentFirstItem = this.startItem();
    const newPage = Math.max(1, Math.ceil(currentFirstItem / newPageSize));
    
    this.pageSizeChange.emit({
      pageSize: newPageSize,
      page: newPage,
      previousPageSize: currentPageSize
    });
  }
  
  onPageSizeSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPageSize = parseInt(select.value, 10);
    this.onPageSizeChange(newPageSize);
  }
  
  trackByPageNumber(index: number, page: number): number {
    return page;
  }
}