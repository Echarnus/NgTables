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
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ColumnDefinition, 
  TableConfiguration, 
  SortState, 
  SortDirection, 
  RowExpandState, 
  RowSelectionState,
  TableEvents 
} from '../types/table.types';
import { 
  getNestedProperty, 
  generateRowId, 
  defaultSort, 
  debounce,
  calculateFrozenWidth 
} from '../utils/table.utils';

@Component({
  selector: 'ngt-mailchimp-table',
  templateUrl: './mailchimp-table.html',
  styleUrl: './mailchimp-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class MailchimpTableComponent<T = any> implements OnInit, OnDestroy {
  @ViewChild('tableContainer', { static: true }) tableContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('headerContainer', { static: true }) headerContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('bodyContainer', { static: true }) bodyContainer!: ElementRef<HTMLDivElement>;

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

  private syncHorizontalScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollLeft = target.scrollLeft;
    
    if (this.headerContainer?.nativeElement) {
      this.headerContainer.nativeElement.scrollLeft = scrollLeft;
    }
  }

  private updateColumnWidths(): void {
    // This method can be used to dynamically adjust column widths
    // Implementation would depend on specific resize requirements
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
}
