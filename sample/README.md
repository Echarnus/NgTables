# NgTables Sample Application

This sample application demonstrates the NgTables library in action with all its features.

## Features Demonstrated

- **Frozen Columns**: ID column frozen on the left, Subscriptions on the right
- **Row Selection**: Multi-select with checkbox controls
- **Sorting**: Click any column header to sort data
- **Expandable Rows**: Click + button to show additional details
- **Responsive Design**: Horizontal scrolling for narrow screens
- **Accessibility**: Full keyboard navigation and screen reader support
- **Custom Rendering**: Status badges and formatted dates

## Running the Sample

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production (GitHub Pages)
npm run build:sample:prod
```

## Live Demo

The sample is automatically deployed to GitHub Pages at: [https://echarnus.github.io/NgTables/](https://echarnus.github.io/NgTables/)

## Usage

This sample demonstrates how to integrate NgTables into your Angular application:

```typescript
import { MailchimpTableComponent, ColumnDefinition, TableConfiguration } from 'ng-tables';

@Component({
  template: `
    <ngt-mailchimp-table
      [data]="users()"
      [columns]="columns()"
      [config]="config()"
      (sortChange)="onSort($event)"
      (selectionChange)="onSelectionChange($event)">
    </ngt-mailchimp-table>
  `
})
export class MyComponent {
  // Implementation details...
}
```

## Interactive Features

Try these features in the demo:

- **Sort columns**: Click on any column header to sort the data
- **Select rows**: Use checkboxes to select individual rows or all rows
- **Expand rows**: Click the + button to show additional details
- **Horizontal scroll**: Try resizing your browser to see frozen columns in action
- **Keyboard navigation**: Use Tab, Enter, and Space keys to navigate and interact
- **Check console**: Open developer tools to see event logging