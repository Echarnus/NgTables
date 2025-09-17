import { SortDirection } from '../types/table.types';

/**
 * Safely get nested property value from an object using dot notation
 * @param obj The object to extract value from
 * @param path The property path (e.g., 'user.name' or 'address.city')
 * @returns The property value or undefined if not found
 */
export function getNestedProperty(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  return path.split('.').reduce((current, prop) => {
    return current?.[prop];
  }, obj);
}

/**
 * Generate a unique row ID from row data
 * @param row The row data
 * @param index The row index as fallback
 * @returns A unique string ID
 */
export function generateRowId(row: any, index: number): string {
  // Try to use an 'id' property if available
  if (row?.id !== undefined) {
    return String(row.id);
  }
  
  // Try to use a 'uuid' or '_id' property
  if (row?.uuid) return String(row.uuid);
  if (row?._id) return String(row._id);
  
  // Fallback to index
  return `row_${index}`;
}

/**
 * Default sort function for table columns
 * @param a First value to compare
 * @param b Second value to compare
 * @param direction Sort direction
 * @returns Comparison result
 */
export function defaultSort(a: any, b: any, direction: SortDirection): number {
  if (direction === null) return 0;
  
  // Handle null/undefined values
  if (a == null && b == null) return 0;
  if (a == null) return direction === 'asc' ? -1 : 1;
  if (b == null) return direction === 'asc' ? 1 : -1;
  
  // Convert to comparable values
  const aVal = typeof a === 'string' ? a.toLowerCase() : a;
  const bVal = typeof b === 'string' ? b.toLowerCase() : b;
  
  // Compare values
  let result = 0;
  if (aVal < bVal) result = -1;
  else if (aVal > bVal) result = 1;
  
  return direction === 'asc' ? result : -result;
}

/**
 * Debounce function for performance optimization
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Check if an element is visible in the viewport
 * @param element The element to check
 * @returns Whether the element is visible
 */
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Calculate the total width of frozen columns
 * @param columns Array of column definitions
 * @param side Which side (left or right)
 * @returns Total width in pixels
 */
export function calculateFrozenWidth(columns: any[], side: 'left' | 'right'): number {
  return columns
    .filter(col => col.frozen === side)
    .reduce((total, col) => {
      const width = parseFloat(col.width) || 150; // Default column width
      return total + width;
    }, 0);
}