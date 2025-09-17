import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  AfterViewInit,
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
export class NgTableComponent<T = any> implements OnInit, OnDestroy, AfterViewInit {
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
  }

  ngOnInit(): void {
    this.setupResizeObserver();
  }

  ngAfterViewInit(): void {
    // Ensure width synchronization after view is fully initialized
    setTimeout(() => {
      this.syncHeaderBodyWidths();
      this.updateColumnWidths();
    }, 100);
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
    
    // Sync header and body widths
    setTimeout(() => this.syncHeaderBodyWidths(), 0);
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
    // Ensure header and body columns have exact same widths
    const container = this.tableContainer?.nativeElement;
    if (!container) return;

    // Get all header cells and corresponding body cells
    const leftFrozenHeaders = container.querySelectorAll('.ngt-frozen-left .ngt-header-cell');
    const scrollableHeaders = container.querySelectorAll('.ngt-scrollable .ngt-header-cell');
    const rightFrozenHeaders = container.querySelectorAll('.ngt-frozen-right .ngt-header-cell');

    // Sync left frozen columns
    this.syncSectionWidths(leftFrozenHeaders, '.ngt-frozen-left .ngt-cell');
    
    // Sync scrollable columns
    this.syncSectionWidths(scrollableHeaders, '.ngt-scrollable .ngt-cell');
    
    // Sync right frozen columns
    this.syncSectionWidths(rightFrozenHeaders, '.ngt-frozen-right .ngt-cell');
  }

  private syncSectionWidths(headerCells: NodeListOf<Element>, bodyCellSelector: string): void {
    const container = this.tableContainer?.nativeElement;
    if (!container || !headerCells.length) return;

    // Get the first row's cells to use as reference
    const firstRow = container.querySelector('.ngt-row-container:first-child');
    if (!firstRow) return;

    const bodyCells = firstRow.querySelectorAll(bodyCellSelector);
    
    headerCells.forEach((headerCell, index) => {
      const bodyCell = bodyCells[index] as HTMLElement;
      if (!bodyCell) return;

      // Get the computed width of the header cell
      const headerWidth = (headerCell as HTMLElement).offsetWidth;
      
      // Apply the same width to all corresponding body cells in this column
      const allBodyCells = container.querySelectorAll(`.ngt-row-container ${bodyCellSelector}:nth-child(${index + 1})`);
      allBodyCells.forEach(cell => {
        (cell as HTMLElement).style.width = `${headerWidth}px`;
        (cell as HTMLElement).style.minWidth = `${headerWidth}px`;
        (cell as HTMLElement).style.maxWidth = `${headerWidth}px`;
      });
    });
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
