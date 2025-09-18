# NgTables Theming Guide

NgTables provides comprehensive theming support with automatic dark mode detection and Tailwind CSS compatibility.

## Automatic Theme Detection

NgTables automatically detects and applies the appropriate theme based on user preferences:

- **Light theme**: Applied by default
- **Dark theme**: Automatically applied when `prefers-color-scheme: dark` is detected

## CSS Custom Properties

NgTables uses CSS custom properties (CSS variables) for theming, making it easy to customize colors and integrate with design systems.

### Table Component Variables

```css
:root {
  /* Colors */
  --ngt-primary-color: #007c89;
  --ngt-secondary-color: #f4f4f4;
  --ngt-border-color: #e1e5e9;
  --ngt-text-color: #241c15;
  --ngt-text-muted: #86888a;
  --ngt-hover-color: #f8f9fa;
  --ngt-selected-color: #e6f7ff;
  --ngt-focus-color: #4d90fe;
  --ngt-shadow-color: rgba(0, 0, 0, 0.1);
  
  /* Component backgrounds */
  --ngt-table-bg: #ffffff;
  --ngt-header-bg: #f8f9fa;
  --ngt-row-bg: #ffffff;
  --ngt-expanded-row-bg: #f8f9fa;
  --ngt-checkbox-bg: #ffffff;
  --ngt-expand-button-bg: #ffffff;
}
```

### Pagination Component Variables

```css
:root {
  /* Pagination colors */
  --ngt-pagination-bg: #f9fafb;
  --ngt-pagination-border: #e5e7eb;
  --ngt-pagination-text: #374151;
  --ngt-pagination-button-bg: #ffffff;
  --ngt-pagination-button-border: #d1d5db;
  --ngt-pagination-button-text: #374151;
  --ngt-pagination-button-hover-bg: #f3f4f6;
  --ngt-pagination-button-hover-border: #9ca3af;
  --ngt-pagination-select-bg: #ffffff;
  --ngt-pagination-select-border: #d1d5db;
  --ngt-pagination-select-text: #374151;
  --ngt-pagination-current-bg: #3b82f6;
  --ngt-pagination-current-border: #3b82f6;
  --ngt-pagination-current-text: #ffffff;
}
```

## Tailwind CSS Compatibility

NgTables provides theme classes that can be used with Tailwind CSS or any CSS framework:

### Light Theme

```html
<!-- Apply light theme to table container -->
<div class="ngt-theme-light">
  <ng-table [data]="data" [columns]="columns"></ng-table>
</div>
```

### Dark Theme

```html
<!-- Apply dark theme to table container -->
<div class="ngt-theme-dark">
  <ng-table [data]="data" [columns]="columns"></ng-table>
</div>
```

### With Tailwind CSS

```html
<!-- Combine with Tailwind classes -->
<div class="ngt-theme-dark bg-gray-900 p-4">
  <ng-table [data]="data" [columns]="columns"></ng-table>
</div>
```

## Custom Theming

### Override Specific Variables

You can override specific CSS variables to customize the appearance:

```css
.my-custom-table {
  --ngt-primary-color: #10b981; /* Green primary color */
  --ngt-hover-color: #f0fdf4;   /* Light green hover */
  --ngt-selected-color: #dcfce7; /* Light green selection */
}
```

### Complete Custom Theme

Create a complete custom theme by overriding all variables:

```css
.my-brand-theme {
  /* Brand colors */
  --ngt-primary-color: #7c3aed;
  --ngt-secondary-color: #f3f4f6;
  --ngt-border-color: #e5e7eb;
  --ngt-text-color: #1f2937;
  --ngt-text-muted: #6b7280;
  --ngt-hover-color: #f9fafb;
  --ngt-selected-color: #ede9fe;
  --ngt-focus-color: #7c3aed;
  --ngt-shadow-color: rgba(124, 58, 237, 0.1);
  
  /* Component backgrounds */
  --ngt-table-bg: #ffffff;
  --ngt-header-bg: #f9fafb;
  --ngt-row-bg: #ffffff;
  --ngt-expanded-row-bg: #f9fafb;
  --ngt-checkbox-bg: #ffffff;
  --ngt-expand-button-bg: #ffffff;
}
```

## Integration Examples

### With Angular Material

```typescript
// app.component.ts
@Component({
  selector: 'app-root',
  template: `
    <div [class]="themeClass">
      <ng-table [data]="data" [columns]="columns"></ng-table>
    </div>
  `
})
export class AppComponent {
  themeClass = 'ngt-theme-light';
  
  toggleTheme() {
    this.themeClass = this.themeClass === 'ngt-theme-light' 
      ? 'ngt-theme-dark' 
      : 'ngt-theme-light';
  }
}
```

### With System Theme Detection

```typescript
// theme.service.ts
@Injectable()
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('light');
  theme$ = this.themeSubject.asObservable();
  
  constructor() {
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.themeSubject.next(mediaQuery.matches ? 'dark' : 'light');
      
      mediaQuery.addEventListener('change', (e) => {
        this.themeSubject.next(e.matches ? 'dark' : 'light');
      });
    }
  }
}
```

### With Tailwind CSS Dark Mode

```html
<!-- app.component.html -->
<div [class]="'ngt-theme-' + (theme$ | async)" 
     class="min-h-screen transition-colors duration-200"
     [class.dark]="(theme$ | async) === 'dark'">
  <ng-table [data]="data" [columns]="columns"></ng-table>
</div>
```

## Browser Support

- **CSS Custom Properties**: All modern browsers (IE11+ with polyfill)
- **prefers-color-scheme**: Chrome 76+, Firefox 67+, Safari 12.1+
- **Fallback values**: Provided for all custom properties

## Migration from v1.x

If you're upgrading from a previous version that used hardcoded colors:

1. Remove any custom CSS overrides for NgTables colors
2. Use CSS custom properties instead of SCSS variables
3. Apply theme classes (`ngt-theme-light` or `ngt-theme-dark`) if needed
4. Test automatic dark mode detection

## Tips

- Use browser dev tools to inspect and modify CSS custom properties in real-time
- CSS custom properties cascade, so you can override them at any level
- The automatic dark mode detection respects user system preferences
- All theme changes are smooth with CSS transitions