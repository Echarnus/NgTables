export interface ColumnDefinition<T = any> {
  /** Unique identifier for the column */
  id: string;
  /** Display header text */
  header: string;
  /** Property path for data access (supports nested properties like 'user.name') */
  accessor?: keyof T | string;
  /** Column width (CSS value) */
  width?: string;
  /** Minimum column width (CSS value) */
  minWidth?: string;
  /** Maximum column width (CSS value) */
  maxWidth?: string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Whether the column is frozen (left or right) */
  frozen?: 'left' | 'right';
  /** Custom cell renderer function */
  cellRenderer?: (value: any, row: T, column: ColumnDefinition<T>) => string | HTMLElement;
  /** Custom header renderer function */
  headerRenderer?: (column: ColumnDefinition<T>) => string | HTMLElement;
  /** CSS classes for the column */
  cssClass?: string;
  /** Whether the column is resizable */
  resizable?: boolean;
  /** Custom sort function */
  sortFunction?: (a: T, b: T, direction: SortDirection) => number;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface TableConfiguration {
  /** Whether to show expandable row toggles */
  expandableRows?: boolean;
  /** Whether to enable row selection */
  selectable?: boolean;
  /** Whether to enable multiple row selection */
  multiSelect?: boolean;
  /** Whether to show row numbers */
  showRowNumbers?: boolean;
  /** Custom CSS classes for the table */
  cssClass?: string;
  /** Whether to enable column resizing */
  resizable?: boolean;
  /** Whether to enable horizontal scrolling */
  horizontalScroll?: boolean;
  /** Whether to enable sticky header */
  stickyHeader?: boolean;
  /** Custom header height */
  headerHeight?: string;
  /** Custom row height */
  rowHeight?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

export interface RowExpandState {
  [rowId: string]: boolean;
}

export interface RowSelectionState {
  [rowId: string]: boolean;
}

export interface TableEvents<T = any> {
  /** Emitted when a column is sorted */
  onSort?: (sortState: SortState) => void;
  /** Emitted when a row is expanded/collapsed */
  onRowExpand?: (rowId: string, expanded: boolean, rowData: T) => void;
  /** Emitted when row selection changes */
  onSelectionChange?: (selectedRows: string[], allSelected: boolean) => void;
  /** Emitted when a cell is clicked */
  onCellClick?: (value: any, row: T, column: ColumnDefinition<T>) => void;
  /** Emitted when a row is clicked */
  onRowClick?: (row: T, rowId: string) => void;
}

export interface ExpandableRowData<T = any> {
  /** The expanded content template or component */
  template?: any;
  /** Data to pass to the expanded content */
  data?: any;
  /** Whether the row is initially expanded */
  expanded?: boolean;
}

export interface ExpandableRowContext<T = any> {
  /** The row data */
  $implicit: T;
  /** The row index */
  index: number;
  /** The row ID */
  rowId: string;
  /** Whether the row is expanded */
  expanded: boolean;
}

export interface RowContext<T = any> {
  /** The row data */
  $implicit: T;
  /** The row index */
  index: number;
  /** The row ID */
  rowId: string;
  /** The current columns */
  columns: ColumnDefinition<T>[];
  /** Whether the row is selected */
  selected: boolean;
  /** Whether the row is hovered */
  hovered: boolean;
}