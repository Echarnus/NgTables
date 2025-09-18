# NgTables Requirements

This document details the functional, technical, and UX requirements for the NgTables project. For the project goal, see [project-goal.md](./project-goal.md).

---

## Functional Requirements

1. **Data Source Flexibility**
   - Support both in-memory and HTTP-based data sources.
   - Data loading and paging are presentation concerns; parent component manages data changes.

2. **Pagination**
   - Customizable items per page (configurable via code).
   - Option to hide pager if only one page is present.
   - Pager must be accessible and keyboard-navigable.

3. **Row Expansion**
   - Expandable rows to show detailed views using custom templates.
   - Expansion state managed via signals and event propagation.

4. **Sorting**
   - UI/UX for sorting columns.
   - Sorting triggers event with field and direction; parent handles actual sorting.
   - Sort indicators must be accessible and visually clear.

5. **Theme Support**
   - Toggle between dark and light themes.
   - Tailwind CSS integration for styling.
   - All color choices must meet WCAG contrast requirements.

6. **Frozen Columns**
   - Support for frozen columns within a single HTML table element.
   - Frozen columns remain visible during horizontal scroll.

7. **Column Width Control**
   - Configurable column width: ellipsis, min/max, multiline, or unlimited width.
   - Responsive to parent container and user configuration.

8. **Scrolling**
   - Horizontal scrollbar appears when table width exceeds container.
   - Vertical height follows parent unless a fixed height is set.

9. **Sticky Header**
   - Table header remains sticky and visible when scrolling vertically.
   - Sticky behavior must be smooth and accessible.

---

## Technical Requirements

- Built with Angular, using strict best practices:
  - Standalone components (no NgModules).
  - Signals for state management and reactivity.
  - OnPush change detection for all components.
  - Template-driven for rows and headers.
  - All actions are event-driven; no direct data mutation in table component.
  - Use `NgOptimizedImage` for static images.
  - Use `[class]` and `[style]` bindings (not `ngClass`/`ngStyle`).
  - Host bindings via `host` object in decorators.
  - Prefer CSS logical properties for layout.

- Accessibility:
  - All components must be fully keyboard accessible.
  - Use semantic HTML, ARIA roles, and labels.
  - Visual and non-visual feedback for user actions.
  - Test with screen readers and accessibility tools (Axe, Lighthouse).

---

## UX Requirements

- Consistent spacing, typography, and color contrast.
- Simple, intuitive workflows and interfaces.
- Minimize cognitive load; clear feedback for all actions.
- Responsive design for all screen sizes.
- Focus management and clear focus indicators.

---

## Stakeholder Feedback & Visual Demonstration

- Every feature, bug fix, or enhancement must include a feedback mechanism (comment link, form, or widget).
- All graphical/UX changes require screenshots or GIFs in `docs/assets/`.
- Interactive features require a short GIF demonstrating behavior.
- Document feedback path in PRs (GitHub Discussions, issue template, or embedded app feedback).

---

For further details, see [copilot-instructions.md](../.github/copilot-instructions.md).
