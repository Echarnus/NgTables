# HTML Table Element Specification

## Overview

This document outlines the requirements and specifications for refactoring NgTables from a div-based layout to proper HTML table elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`).

## Core Requirements

### 1. HTML Structure
- **Root Container**: Maintain `<div class="ngt-table-container">` as the main wrapper
- **Header**: Use `<table>` with `<thead>` and `<tr>` containing `<th>` elements
- **Body**: Use `<table>` with `<tbody>` and `<tr>` containing `<td>` elements
- **Frozen Columns**: Maintain separate table structures for left/right frozen sections

### 2. Paging Functionality
- **Requirement**: Pagination controls must work seamlessly with table structure
- **Implementation**: 
  - Pagination components remain outside table structure
  - Row rendering must respect current page and page size
  - Page changes should update tbody content without affecting table structure

### 3. Sorting Functionality
- **Requirement**: Column sorting (asc, desc, off) must work with table headers
- **Implementation**:
  - `<th>` elements must contain sortable headers with proper ARIA attributes
  - Sort state reflected in `aria-sort` attribute (`ascending`, `descending`, `none`)
  - Visual sort indicators maintained in header cells
  - Click/keyboard interaction preserved for `<th>` elements

### 4. Frozen Columns
- **Requirement**: Left and right frozen columns must stay fixed during horizontal scroll
- **Implementation**:
  - Separate `<table>` structures for frozen left, scrollable center, frozen right
  - Column width synchronization between header and body tables
  - Proper z-index layering for frozen sections
  - Border styling to visually separate frozen from scrollable areas

### 5. Template-Driven Cells
- **Requirement**: Custom cell templates must render correctly in `<td>` elements
- **Implementation**:
  - `ngTemplateOutlet` must work within `<td>` context
  - Cell renderer functions preserved
  - Default text rendering maintains ellipsis/multiline behavior

### 6. Sticky Header
- **Requirement**: Header must remain visible during vertical scroll
- **Implementation**:
  - `position: sticky` on header table container
  - Proper z-index management for frozen sections
  - Shadow/border effects during scroll state

### 7. Horizontal Scrollbar and Overflow
- **Requirement**: Horizontal scrolling with configurable text overflow
- **Implementation**:
  - Scrollable table section must allow horizontal overflow
  - `text-overflow: ellipsis` for single-line content (default)
  - `white-space: normal` option for multiline content
  - Synchronized scrolling between header and body sections

### 8. Theme Support
- **Requirement**: Dark and light theme compatibility
- **Implementation**:
  - CSS custom properties preserved for theme switching
  - Table-specific styling variables for borders, backgrounds
  - High contrast mode support maintained

## Accessibility Requirements

### Table Semantics
- **Table Role**: Proper table semantics with `role="table"` (implicit in `<table>`)
- **Row Role**: `role="row"` (implicit in `<tr>`)
- **Cell Role**: `role="columnheader"` for `<th>`, `role="gridcell"` for `<td>`
- **Headers**: `scope="col"` on column headers for screen reader association

### Selection Support
- **Checkbox Headers**: `<th>` for selection column headers
- **Checkbox Cells**: `<td>` containing checkbox inputs with proper labels
- **Row Selection**: `aria-selected` on `<tr>` elements

### Expandable Rows
- **Expand Button**: `<td>` containing expand/collapse controls
- **Expanded Content**: Additional `<tr>` with colspan for full-width content
- **ARIA States**: `aria-expanded` on expand buttons

### Sort State Communication
- **Sort Indicators**: `aria-sort` attributes on sortable `<th>` elements
- **Live Regions**: Screen reader announcements for sort changes
- **Keyboard Support**: Tab navigation and Enter/Space activation

## Technical Implementation Strategy

### Phase 1: Header Refactor
- Convert existing header table structures to ensure proper semantic HTML
- Maintain current frozen column approach with separate table elements
- Preserve all sorting and accessibility features

### Phase 2: Body Refactor  
- Replace div-based row structure with `<tbody>` and `<tr>` elements
- Convert cell divs to `<td>` elements
- Maintain template and render function compatibility

### Phase 3: Styling Updates
- Update CSS to work with table elements instead of flexbox divs
- Preserve visual appearance and responsive behavior
- Ensure theme compatibility

### Phase 4: Synchronization Logic
- Update TypeScript component methods that rely on DOM structure
- Modify width synchronization for table-based layout
- Preserve horizontal scroll synchronization

## Testing Requirements

### Functional Tests
- [ ] Pagination works correctly with table structure
- [ ] Sorting maintains state and updates aria-sort attributes  
- [ ] Frozen columns remain fixed during horizontal scroll
- [ ] Template-driven cells render properly in `<td>` elements
- [ ] Sticky header behavior preserved
- [ ] Horizontal scrollbar functions as expected
- [ ] Text overflow options (ellipsis/multiline) work correctly

### Accessibility Tests
- [ ] Screen reader navigation follows proper table semantics
- [ ] Keyboard navigation works with table elements
- [ ] Sort state announced correctly to assistive technology
- [ ] Selection state communicated properly
- [ ] Expand/collapse functionality accessible

### Theme Tests  
- [ ] Light theme displays correctly with table elements
- [ ] Dark theme maintains proper contrast and styling
- [ ] Theme switching preserves table layout
- [ ] High contrast mode compatibility

### Browser Compatibility
- [ ] Modern browsers support table-based frozen columns
- [ ] Sticky positioning works across target browsers
- [ ] Performance remains acceptable with table DOM structure

## Success Criteria

1. **Semantic HTML**: All data presentation uses proper table elements
2. **Feature Parity**: No loss of existing functionality
3. **Accessibility**: Improved semantic structure for assistive technology
4. **Performance**: Comparable or better rendering performance
5. **Maintainability**: Cleaner DOM structure reduces complexity
6. **Compliance**: Meets HTML accessibility guidelines for data tables

## Rollback Plan

If table-based implementation introduces critical issues:
1. Feature flag to toggle between div and table rendering
2. Gradual migration path with hybrid support
3. Ability to revert to div-based structure if needed

## Future Enhancements

With proper table structure in place:
- Enhanced keyboard navigation patterns
- Better screen reader table navigation
- Simplified CSS Grid fallback option
- Improved print styling for tables
- Native browser table features utilization