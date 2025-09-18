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
  /** Text overflow strategy for cell content */
  overflow?: 'ellipsis' | 'multiline' | 'expandable';
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
  /** Whether to use template for this column */
  useTemplate?: boolean;
}

/** Context provided to column templates */
export interface ColumnTemplateContext<T = any> {
  /** The cell value */
  $implicit: any;
  /** The row data object */
  row: T;
  /** The column definition */
  column: ColumnDefinition<T>;
  /** Zero-based row index */
  index: number;
  /** Unique row identifier */
  rowId: string;
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
  /** Pagination configuration */
  pagination?: PaginationConfiguration;
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

export interface PaginationConfiguration {
  /** Whether pagination is enabled */
  enabled?: boolean;
  /** Number of items per page */
  pageSize?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Whether to show the page size selector */
  showPageSizeSelector?: boolean;
  /** Whether to show the first/last page buttons */
  showFirstLastButtons?: boolean;
  /** Whether to show page numbers */
  showPageNumbers?: boolean;
  /** Maximum number of page buttons to show */
  maxPageButtons?: number;
  /** Position of pagination controls */
  position?: 'top' | 'bottom' | 'both';
}

export interface PaginationState {
  /** Current page (1-based) */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
}

export interface PageChangeEvent {
  /** New page number (1-based) */
  page: number;
  /** Current page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Previous page number */
  previousPage: number;
}

export interface PageSizeChangeEvent {
  /** New page size */
  pageSize: number;
  /** Current page (may be adjusted) */
  page: number;
  /** Previous page size */
  previousPageSize: number;
}