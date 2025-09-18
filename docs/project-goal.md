# NgTables Project Goal

NgTables aims to deliver an advanced, highly configurable Angular table component with modern UX features and accessibility. The core objectives and features are:

## Project Goal
Create a table component with advanced UX behaviors, including sticky headers and columns, supporting both in-memory and HTTP data sources, and designed for scalable, accessible web applications.

## Key Features
- **Standard Table Behavior**: Display data from in-memory or HTTP resources.
- **Customizable Paginator**: Configure items per page, hide pager for single-page tables, and set values via code.
- **Row Expansion**: Expand rows to show detailed views using custom templates.
- **Sorting**: UI/UX for sorting rows, propagating sort events (field and direction) to parent components.
- **Theme Support**: Dark/light theme toggle with Tailwind CSS integration.
- **Frozen Columns**: Support for frozen columns within a single HTML table element.
- **Column Width Control**: Configure column width behavior (ellipsis, min/max, multiline, or unlimited width).
- **Horizontal Scrollbar**: Appears when table width exceeds container.
- **Responsive Height**: Table height follows parent element unless a fixed height is set.
- **Sticky Header**: Header remains visible and sticky when scrolling vertically.

## Technical Approach
- Built with Angular, following strict best practices and accessibility standards.
- Template-driven for rows and headers.
- All actions are event-driven: sorting, paging, and data loading are handled via event propagation to the parent component.
- Paging and data loading are presentation concerns; the parent component manages data changes in response to table events.

---

For further requirements and implementation details, see [docs/requirements.md](./requirements.md).
