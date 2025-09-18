# NgTables - Advanced Table Component

A comprehensive Angular table component with advanced features including frozen columns, expandable rows, sorting, and full accessibility support.

**[📖 View Live Demo](https://echarnus.github.io/NgTables/)**

## Features

### ✅ Core Requirements Met

- **🚫 No Fixed Height**: Table expands to fit content, parent element handles overflow
- **↔️ Horizontal Scrolling**: Appears automatically when width constraints are applied
- **🎨 Custom Header Elements**: Fully configurable header content and styling
- **📌 Sticky Header**: Remains visible during vertical scrolling
- **📏 Precise Width Matching**: Header widths perfectly align with column widths
- **🔒 Frozen Columns**: Left and right column freezing for horizontal scroll scenarios
- **📂 Expandable Rows**: Toggle additional content display for each row
- **🔢 Column Sorting**: Click-to-sort functionality with visual indicators
- **♿ Full Accessibility**: WCAG compliant with keyboard navigation and screen reader support

### 🎯 Advanced Features

- **🔘 Row Selection**: Single and multi-select with checkbox controls
- **🎛️ Configurable Options**: All features can be enabled/disabled per table
- **📱 Responsive Design**: Works across all device sizes
- **🎨 Custom Cell Rendering**: Support for custom content and styling
- **⚡ Performance Optimized**: OnPush change detection and virtual scrolling ready
- **🌙 Dark Mode Support**: Automatic adaptation to user preferences
- **🔧 TypeScript First**: Full type safety and IntelliSense support

## Requirements

- **Node.js**: ^20.19.0 || ^22.12.0 || >=24.0.0
- **npm**: ^6.11.0 || ^7.5.6 || >=8.0.0
- **Angular**: 19.0.0+ or 20.0.0+

## Quick Start

### Installation

```bash
npm install ng-tables
```

### Basic Usage

```typescript
import { Component, signal } from '@angular/core';
import { NgTableComponent, ColumnDefinition, TableConfiguration } from 'ng-tables';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-users',
  imports: [NgTableComponent],
  template: `
    <ngt-table
      [data]="users()"
      [columns]="columns()"
      [config]="config()"
      (sortChange)="onSort($event)"
      (selectionChange)="onSelectionChange($event)">
    </ngt-table>
  `
})
export class UsersComponent {
  users = signal<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' }
  ]);

  columns = signal<ColumnDefinition<User>[]>([
    { id: 'id', header: 'ID', accessor: 'id', width: '80px', frozen: 'left' },
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    { id: 'email', header: 'Email', accessor: 'email', sortable: true },
    { id: 'status', header: 'Status', accessor: 'status', sortable: true }
  ]);

  config = signal<TableConfiguration>({
    selectable: true,
    expandableRows: true,
    stickyHeader: true
  });

  onSort(sortState: SortState) {
    console.log('Sort changed:', sortState);
  }

  onSelectionChange(event: { selectedRows: string[]; allSelected: boolean }) {
    console.log('Selection changed:', event);
  }
}
```

## Live Demo

View the interactive demo at: [https://echarnus.github.io/NgTables/](https://echarnus.github.io/NgTables/)

For local development:

```bash
git clone https://github.com/Echarnus/NgTables.git
cd NgTables
npm install
npm start
```

Open http://localhost:4200 to view the local demo.

## Research: Dual `<thead>` Approach

During development, we investigated the use of two `<thead>` elements as seen in various table implementations. Our analysis found:

**Why Some Implementations Use Dual `<thead>`:**
- Workaround for complex CSS styling limitations in older browsers
- Separation of frozen and scrollable header sections
- Better control over sticky positioning in complex layouts

**Our Implementation:**
- Uses CSS Flexbox and CSS Grid for modern browser support
- Single semantic table structure with proper ARIA attributes
- Better accessibility and standards compliance
- Achieves the same visual and functional results with cleaner markup

## Documentation

For comprehensive documentation and examples, see the [live demo](https://echarnus.github.io/NgTables/) which includes:

- Interactive examples of all features
- Code samples and usage patterns  
- Accessibility demonstrations
- Performance optimizations
- Migration guidance

## Contributing

This project welcomes contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

For development setup, clone the repository and run `npm install` followed by `npm start` to launch the demo application.

## License

MIT License - see [LICENSE](LICENSE) for details.