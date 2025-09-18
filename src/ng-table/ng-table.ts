import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ElementRef, 
  ViewChild, 
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  input,
  output,
  TemplateRef,
  ContentChild,
  ContentChildren,
  QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ColumnDefinition, 
  TableConfiguration, 
  SortState, 
  SortDirection, 
  RowExpandState, 
  RowSelectionState,
  TableEvents,
  ExpandableRowContext,
  ColumnTemplateContext,
  PaginationState,
  PageChangeEvent,
  PageSizeChangeEvent
} from '../types/table.types';
import { 
  getNestedProperty, 
  generateRowId, 
  defaultSort, 
  debounce,
  calculateFrozenWidth 
} from '../utils/table.utils';
import { NgTablePagingComponent } from '../ng-table-paging/ng-table-paging';

@Component({
  selector: 'ngt-table',
  templateUrl: './ng-table.html',
  styleUrl: './ng-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgTablePagingComponent]
})
export class NgTableComponent<T = any> implements OnInit, OnDestroy {
  @ViewChild('tableContainer', { static: true }) tableContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('headerContainer', { static: true }) headerContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('bodyContainer', { static: true }) bodyContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollableHeader', { static: false }) scrollableHeader?: ElementRef<HTMLDivElement>;
  @ViewChild('scrollableBody', { static: false }) scrollableBody?: ElementRef<HTMLDivElement>;

  // Template content children for customization
  @ContentChild('expandedRowTemplate', { static: false }) expandedRowTemplate?: TemplateRef<ExpandableRowContext<T>>;
  @ContentChild('cellTemplate', { static: false }) cellTemplate?: TemplateRef<any>;

  // Inputs using the new signal-based approach
  data = input.required<T[]>();
  columns = input.required<ColumnDefinition<T>[]>();
  config = input<TableConfiguration>({});
  
  // Outputs using the new signal-based approach
  sortChange = output<SortState>();
  rowExpand = output<{ rowId: string; expanded: boolean; rowData: T }>();
  selectionChange = output<{ selectedRows: string[]; allSelected: boolean }>();
  cellClick = output<{ value: any; row: T; column: ColumnDefinition<T> }>();
  rowClick = output<{ row: T; rowId: string }>();
  pageChange = output<PageChangeEvent>();
  pageSizeChange = output<PageSizeChangeEvent>();

  // Internal state using signals
  sortState = signal<SortState | null>(null);
  expandedRows = signal<RowExpandState>({});
  selectedRows = signal<RowSelectionState>({});
  hoveredRowId = signal<string | null>(null);
  
  // Pagination state
  private currentPage = signal<number>(1);
  private pageSize = signal<number>(25);
  private pageSizeSetByUser = signal<boolean>(false);
  
  // Computed properties
  paginationState = computed((): PaginationState => {
    const totalItems = this.data().length;
    const size = this.pageSize();
    const current = this.currentPage();
    const totalPages = Math.max(1, Math.ceil(totalItems / size));
    
    // Ensure current page is within bounds
    const validPage = Math.max(1, Math.min(current, totalPages));
    if (validPage !== current) {
      this.currentPage.set(validPage);
    }
    
    return {
      currentPage: validPage,
      pageSize: size,
      totalItems,
      totalPages
    };
  });
  
  isPaginationEnabled = computed(() => 
    this.config().pagination?.enabled === true
  );
  
  sortedData = computed(() => {
    const currentSort = this.sortState();
    const rawData = this.data();
    
    if (!currentSort || !currentSort.direction) {
      return rawData;
    }
    
    const column = this.columns().find(col => col.id === currentSort.columnId);
    if (!column) return rawData;
    
    return [...rawData].sort((a, b) => {
      const aValue = column.accessor ? getNestedProperty(a, column.accessor as string) : a;
      const bValue = column.accessor ? getNestedProperty(b, column.accessor as string) : b;
      
      if (column.sortFunction) {
        return column.sortFunction(a, b, currentSort.direction);
      }
      
      return defaultSort(aValue, bValue, currentSort.direction);
    });
  });
  
  // Paginated data - shows only the current page
  paginatedData = computed(() => {
    const sorted = this.sortedData();
    
    if (!this.isPaginationEnabled()) {
      return sorted;
    }
    
    const pagination = this.paginationState();
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    
    return sorted.slice(startIndex, endIndex);
  });

  leftFrozenColumns = computed(() => 
    this.columns().filter(col => col.frozen === 'left')
  );
  
  rightFrozenColumns = computed(() => 
    this.columns().filter(col => col.frozen === 'right')
  );
  
  scrollableColumns = computed(() => 
    this.columns().filter(col => !col.frozen)
  );

  allSelected = computed(() => {
    const selected = this.selectedRows();
    const dataLength = this.data().length;
    return dataLength > 0 && Object.keys(selected).length === dataLength &&
           Object.values(selected).every(Boolean);
  });

  someSelected = computed(() => {
    const selected = this.selectedRows();
    return Object.values(selected).some(Boolean);
  });

  leftFrozenWidth = computed(() => {
    let width = calculateFrozenWidth(this.leftFrozenColumns(), 'left');
    
    // Add width for selection column (48px when enabled)
    if (this.config().selectable && this.config().multiSelect) {
      width += 48;
    }
    
    // Add width for expand column (48px when enabled)
    if (this.config().expandableRows) {
      width += 48;
    }
    
    return width;
  });
  
  rightFrozenWidth = computed(() => calculateFrozenWidth(this.rightFrozenColumns(), 'right'));

  private scrollSyncHandler = debounce((event: Event) => {
    this.syncHorizontalScroll(event);
  }, 16); // ~60fps

  private resizeObserver?: ResizeObserver;

  constructor() {
    // Initialize pagination settings from config - ensure initial page size is properly set
    effect(() => {
      const config = this.config();
      // Only set from config if:
      // 1. Config has a pageSize
      // 2. User hasn't manually set a page size yet
      // 3. The config pageSize is different from current pageSize
      if (config.pagination?.pageSize && !this.pageSizeSetByUser()) {
        // Always use the config pageSize for initial setup, but not for subsequent config changes
        // unless the user hasn't made any manual changes
        const configPageSize = config.pagination.pageSize;
        if (configPageSize !== this.pageSize()) {
          this.pageSize.set(configPageSize);
          this.currentPage.set(1); // Reset to first page when page size changes
        }
      }
    });
    
    // Sync scroll between header and body
    effect(() => {
      const container = this.bodyContainer?.nativeElement;
      if (container) {
        container.addEventListener('scroll', this.scrollSyncHandler);
      }
    });

    // Sync header and body widths when data or columns change
    effect(() => {
      // Track dependencies: data, columns, and configuration
      this.data();
      this.columns();
      this.config();
      
      // Schedule width synchronization after DOM updates
      requestAnimationFrame(() => {
        this.updateColumnWidths();
      });
    });
  }

  ngOnInit(): void {
    this.setupResizeObserver();
    
    // Initial width synchronization with multiple attempts to ensure it works
    setTimeout(() => this.updateColumnWidths(), 0);
    setTimeout(() => this.updateColumnWidths(), 100);
    setTimeout(() => this.updateColumnWidths(), 250);
    setTimeout(() => this.updateColumnWidths(), 500);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    const container = this.bodyContainer?.nativeElement;
    if (container) {
      container.removeEventListener('scroll', this.scrollSyncHandler);
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateColumnWidths();
      });
      
      if (this.tableContainer?.nativeElement) {
        this.resizeObserver.observe(this.tableContainer.nativeElement);
      }
    }
  }

  /**
   * Public method to force header-body width synchronization
   * Useful when external factors affect table dimensions
   */
  refreshLayout(): void {
    // Force immediate and repeated width updates
    this.updateColumnWidths();
    requestAnimationFrame(() => {
      this.updateColumnWidths();
    });
    setTimeout(() => {
      this.updateColumnWidths();
    }, 100);
  }

  syncHorizontalScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollLeft = target.scrollLeft;
    
    // Sync the scrollable header if this event came from the body
    if (this.scrollableHeader?.nativeElement && target !== this.scrollableHeader.nativeElement) {
      this.scrollableHeader.nativeElement.scrollLeft = scrollLeft;
    }
    
    // Sync the scrollable body if this event came from the header
    if (this.scrollableBody?.nativeElement && target !== this.scrollableBody.nativeElement) {
      this.scrollableBody.nativeElement.scrollLeft = scrollLeft;
    }
    
    // Update frozen column positions if needed
    this.updateFrozenColumnPositions(scrollLeft);
  }

  private updateColumnWidths(): void {
    // Update column widths for responsive behavior
    const container = this.tableContainer?.nativeElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    
    // Calculate total required width for all columns
    const totalRequiredWidth = this.calculateTotalTableWidth();
    
    // Calculate available width for scrollable content (excluding frozen columns)
    const leftFrozenWidth = this.leftFrozenWidth();
    const rightFrozenWidth = this.rightFrozenWidth();
    const scrollableAreaWidth = containerWidth - leftFrozenWidth - rightFrozenWidth;
    const scrollableContentWidth = this.calculateScrollableContentWidth();
    
    // Determine if horizontal scrolling is needed
    const needsHorizontalScroll = totalRequiredWidth > containerWidth;
    
    // Enable/disable horizontal scrolling on the appropriate elements
    this.updateScrollableSectons(needsHorizontalScroll, scrollableContentWidth);
    
    // Sync header and body widths with multiple attempts for robustness
    this.syncHeaderBodyWidths();
    setTimeout(() => this.syncHeaderBodyWidths(), 10);
    setTimeout(() => this.syncHeaderBodyWidths(), 50);
    setTimeout(() => this.syncHeaderBodyWidths(), 100);
  }

  private calculateScrollableContentWidth(): number {
    let scrollableWidth = 0;
    
    // Add all scrollable column widths
    this.scrollableColumns().forEach(column => {
      const width = column.width ? parseInt(column.width.replace('px', '')) : 120;
      scrollableWidth += width;
    });
    
    return scrollableWidth;
  }

  private updateScrollableSectons(needsScroll: boolean, scrollableContentWidth: number): void {
    // Update scrollable header section
    const scrollableHeader = this.scrollableHeader?.nativeElement;
    if (scrollableHeader) {
      scrollableHeader.style.overflowX = needsScroll ? 'auto' : 'hidden';
      
      // Ensure the header table can expand to accommodate content
      const headerTable = scrollableHeader.querySelector('.ngt-header-table') as HTMLElement;
      if (headerTable && needsScroll) {
        headerTable.style.minWidth = `${scrollableContentWidth}px`;
      } else if (headerTable) {
        headerTable.style.minWidth = '';
      }
    }
    
    // Update scrollable body section
    const scrollableBody = this.scrollableBody?.nativeElement;
    if (scrollableBody) {
      scrollableBody.style.overflowX = needsScroll ? 'auto' : 'hidden';
      
      // Ensure the body table can expand to accommodate content
      const bodyTable = scrollableBody.querySelector('.ngt-body-table') as HTMLElement;
      if (bodyTable && needsScroll) {
        bodyTable.style.minWidth = `${scrollableContentWidth}px`;
      } else if (bodyTable) {
        bodyTable.style.minWidth = '';
      }
    }
    
    // Ensure the main body container doesn't have conflicting overflow settings
    const bodyContainer = this.bodyContainer?.nativeElement;
    if (bodyContainer) {
      // Remove any container-level horizontal scrolling to avoid double scrollbars
      bodyContainer.style.overflowX = 'hidden';
    }
  }

  private calculateTotalTableWidth(): number {
    let totalWidth = 0;
    
    // Add selection column width
    if (this.config().selectable && this.config().multiSelect) {
      totalWidth += 48;
    }
    
    // Add expand column width
    if (this.config().expandableRows) {
      totalWidth += 48;
    }
    
    // Add all column widths
    this.columns().forEach(column => {
      const width = column.width ? parseInt(column.width.replace('px', '')) : 120;
      totalWidth += width;
    });
    
    return totalWidth;
  }

  private syncHeaderBodyWidths(): void {
    // Ensure header and body have exact same column widths
    const container = this.tableContainer?.nativeElement;
    if (!container) return;

    // Force immediate layout calculation
    requestAnimationFrame(() => {
      this.doWidthSync(container);
    });
  }

  private doWidthSync(container: HTMLElement): void {
    // Get all sections and sync them
    this.syncSection(container, 'ngt-frozen-left');
    this.syncSection(container, 'ngt-scrollable');  
    this.syncSection(container, 'ngt-frozen-right');
  }

  private syncSection(container: HTMLElement, sectionClass: string): void {
    const headerSection = container.querySelector(`.ngt-header-section.${sectionClass}`);
    
    // Update to look for the new body section structure
    const bodySection = container.querySelector(`.ngt-body-section.${sectionClass}`) ||
                       container.querySelector(`.ngt-row-section.${sectionClass}`); // Fallback for legacy
    
    if (!headerSection || !bodySection) return;

    // Get header and body cells
    const headerCells = Array.from(headerSection.querySelectorAll('.ngt-header-cell')) as HTMLElement[];
    
    // For table-based structure, look in the first tbody row
    const firstBodyTable = bodySection.querySelector('.ngt-body-table');
    const firstBodyRow = firstBodyTable?.querySelector('tbody tr.ngt-row') ||
                        bodySection.querySelector('.ngt-row'); // Fallback for legacy div-based
    const bodyCells = Array.from(firstBodyRow?.querySelectorAll('.ngt-cell') || []) as HTMLElement[];

    if (headerCells.length === 0 || bodyCells.length === 0 || headerCells.length !== bodyCells.length) {
      return;
    }

    // Clear any existing width constraints first
    headerCells.forEach(cell => {
      cell.style.width = '';
      cell.style.minWidth = '';
      cell.style.maxWidth = '';
    });

    // Force layout recalculation
    container.offsetHeight;

    // Now measure and apply widths
    const widths: number[] = [];
    bodyCells.forEach((bodyCell, index) => {
      const rect = bodyCell.getBoundingClientRect();
      widths[index] = rect.width;
    });

    // Apply widths to header cells
    headerCells.forEach((headerCell, index) => {
      if (widths[index] && widths[index] > 0) {
        const width = Math.floor(widths[index]);
        headerCell.style.width = `${width}px`;
        headerCell.style.minWidth = `${width}px`;
        headerCell.style.maxWidth = `${width}px`;
      }
    });

    // Ensure table uses fixed layout
    const headerTable = headerSection.querySelector('.ngt-header-table') as HTMLElement;
    if (headerTable) {
      headerTable.style.tableLayout = 'fixed';
      headerTable.style.width = '100%';
    }
  }

  private updateFrozenColumnPositions(scrollLeft: number): void {
    // Update right frozen columns position based on scroll
    const rightFrozenElements = this.tableContainer?.nativeElement?.querySelectorAll('.ngt-frozen-right');
    rightFrozenElements?.forEach((element) => {
      (element as HTMLElement).style.transform = `translateX(-${scrollLeft}px)`;
    });
  }

  onSort(column: ColumnDefinition<T>): void {
    if (!column.sortable) return;
    
    const currentSort = this.sortState();
    let newDirection: SortDirection = 'asc';
    
    if (currentSort?.columnId === column.id) {
      newDirection = currentSort.direction === 'asc' ? 'desc' : 
                    currentSort.direction === 'desc' ? null : 'asc';
    }
    
    const newSortState = newDirection ? { columnId: column.id, direction: newDirection } : null;
    this.sortState.set(newSortState);
    
    if (newSortState) {
      this.sortChange.emit(newSortState);
    }
  }

  onRowExpand(rowId: string, row: T): void {
    const currentState = this.expandedRows();
    const isExpanded = !currentState[rowId];
    
    this.expandedRows.set({
      ...currentState,
      [rowId]: isExpanded
    });
    
    this.rowExpand.emit({ rowId, expanded: isExpanded, rowData: row });
  }

  onRowSelect(rowId: string, selected: boolean): void {
    const currentState = this.selectedRows();
    const newState = { ...currentState };
    
    if (selected) {
      newState[rowId] = true;
    } else {
      delete newState[rowId];
    }
    
    this.selectedRows.set(newState);
    this.emitSelectionChange(newState);
  }

  onSelectAll(selected: boolean): void {
    const newState: RowSelectionState = {};
    
    if (selected) {
      this.sortedData().forEach((row, index) => {
        const rowId = generateRowId(row, index);
        newState[rowId] = true;
      });
    }
    
    this.selectedRows.set(newState);
    this.emitSelectionChange(newState);
  }

  private emitSelectionChange(selectionState: RowSelectionState): void {
    const selectedRows = Object.keys(selectionState).filter(rowId => selectionState[rowId]);
    const allSelected = this.allSelected();
    
    this.selectionChange.emit({ selectedRows, allSelected });
  }

  onCellClick(value: any, row: T, column: ColumnDefinition<T>): void {
    this.cellClick.emit({ value, row, column });
  }

  onRowClick(row: T, rowId: string): void {
    this.rowClick.emit({ row, rowId });
  }

  onRowHover(rowId: string | null): void {
    this.hoveredRowId.set(rowId);
  }

  getCellValue(row: T, column: ColumnDefinition<T>): any {
    if (column.accessor) {
      return getNestedProperty(row, column.accessor as string);
    }
    return row;
  }

  getRowId(row: T, index: number): string {
    return generateRowId(row, index);
  }

  isRowExpanded(rowId: string): boolean {
    return this.expandedRows()[rowId] || false;
  }

  isRowSelected(rowId: string): boolean {
    return this.selectedRows()[rowId] || false;
  }

  isRowHovered(rowId: string): boolean {
    return this.hoveredRowId() === rowId;
  }

  getSortIcon(column: ColumnDefinition<T>): string {
    if (!column.sortable) return '';
    
    const currentSort = this.sortState();
    if (currentSort?.columnId !== column.id) {
      return 'sort';
    }
    
    return currentSort.direction === 'asc' ? 'sort-up' : 'sort-down';
  }

  trackByRowId(index: number, row: T): string {
    return this.getRowId(row, index);
  }

  trackByColumnId(index: number, column: ColumnDefinition<T>): string {
    return column.id;
  }

  getSortedColumnHeader(): string {
    const currentSort = this.sortState();
    if (!currentSort) return '';
    
    const column = this.columns().find(col => col.id === currentSort.columnId);
    return column?.header || '';
  }

  getSelectedRowsCount(): number {
    return Object.keys(this.selectedRows()).length;
  }

  getExpandedRowContext(row: T, index: number, rowId: string): ExpandableRowContext<T> {
    return {
      $implicit: row,
      index: index,
      rowId: rowId,
      expanded: this.isRowExpanded(rowId)
    };
  }

  getColumnTemplateContext(row: T, column: ColumnDefinition<T>, index: number, rowId: string): ColumnTemplateContext<T> {
    return {
      $implicit: this.getCellValue(row, column),
      row: row,
      column: column,
      index: index,
      rowId: rowId
    };
  }

  getLeftFrozenColumnCount(): number {
    let count = this.leftFrozenColumns().length;
    
    // Add selection column if multi-select is enabled
    if (this.config().selectable && this.config().multiSelect) {
      count++;
    }
    
    // Add expand column if expandable rows are enabled
    if (this.config().expandableRows) {
      count++;
    }
    
    return count;
  }

  // Pagination event handlers
  onPageChange(event: PageChangeEvent): void {
    this.currentPage.set(event.page);
    this.pageChange.emit(event);
  }

  onPageSizeChange(event: PageSizeChangeEvent): void {
    this.pageSizeSetByUser.set(true); // Mark that user has set page size
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.page);
    this.pageSizeChange.emit(event);
  }
}
