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
  ContentChild
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
  ExpandableRowContext 
} from '../types/table.types';
import { 
  getNestedProperty, 
  generateRowId, 
  defaultSort, 
  debounce,
  calculateFrozenWidth 
} from '../utils/table.utils';

@Component({
  selector: 'ngt-table',
  templateUrl: './ng-table.html',
  styleUrl: './ng-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
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

  // Internal state using signals
  sortState = signal<SortState | null>(null);
  expandedRows = signal<RowExpandState>({});
  selectedRows = signal<RowSelectionState>({});
  hoveredRowId = signal<string | null>(null);
  
  // Computed properties
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
    
    // Initial width synchronization after component initialization
    setTimeout(() => {
      this.updateColumnWidths();
    }, 0);
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
    this.updateColumnWidths();
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
    
    // If container is smaller than required width, enable horizontal scrolling
    if (totalRequiredWidth > containerWidth) {
      container.style.overflowX = 'auto';
    } else {
      container.style.overflowX = 'hidden';
    }
    
    // Sync header and body widths after DOM has been updated with multiple attempts
    // to ensure it happens after the flexbox layout is complete
    setTimeout(() => this.syncHeaderBodyWidths(), 0);
    setTimeout(() => this.syncHeaderBodyWidths(), 50);
    setTimeout(() => this.syncHeaderBodyWidths(), 100);
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
    // Ensure header and body tables have exact same column widths
    const container = this.tableContainer?.nativeElement;
    if (!container) return;

    // Get all header and body sections
    const headerSections = container.querySelectorAll('.ngt-header-section');
    const bodySections = container.querySelectorAll('.ngt-row-section');
    
    // Wait for DOM to be fully rendered before measuring
    setTimeout(() => {
      // Sync widths for each section type (frozen-left, scrollable, frozen-right)
      this.syncSectionWidths(headerSections, bodySections, 'ngt-frozen-left');
      this.syncSectionWidths(headerSections, bodySections, 'ngt-scrollable');
      this.syncSectionWidths(headerSections, bodySections, 'ngt-frozen-right');
    }, 10);
  }

  private syncSectionWidths(headerSections: NodeListOf<Element>, bodySections: NodeListOf<Element>, sectionClass: string): void {
    const headerSection = Array.from(headerSections).find(section => section.classList.contains(sectionClass));
    const bodySection = Array.from(bodySections).find(section => section.classList.contains(sectionClass));
    
    if (!headerSection || !bodySection) return;

    const headerCells = headerSection.querySelectorAll('.ngt-header-cell');
    const firstBodyRow = bodySection.querySelector('.ngt-row');
    const bodyCells = firstBodyRow?.querySelectorAll('.ngt-cell');

    if (!bodyCells || headerCells.length !== bodyCells.length) return;

    // Calculate actual widths from the first body row and apply to header
    Array.from(bodyCells).forEach((bodyCell, index) => {
      const headerCell = headerCells[index] as HTMLElement;
      if (headerCell && bodyCell) {
        const bodyRect = (bodyCell as HTMLElement).getBoundingClientRect();
        const bodyWidth = bodyRect.width;
        
        // Apply the exact same width to header cell
        headerCell.style.width = `${bodyWidth}px`;
        headerCell.style.minWidth = `${bodyWidth}px`;
        headerCell.style.maxWidth = `${bodyWidth}px`;
      }
    });

    // Force table layout recalculation
    const headerTable = headerSection.querySelector('.ngt-header-table') as HTMLElement;
    if (headerTable) {
      headerTable.style.tableLayout = 'auto';
      // Use setTimeout instead of requestAnimationFrame for more reliable behavior
      setTimeout(() => {
        headerTable.style.tableLayout = 'fixed';
      }, 0);
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
}
