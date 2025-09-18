# Dark Theme Support

NgTables provides comprehensive dark theme support through CSS custom properties and automatic media query detection.

## Features

- **Automatic Detection**: Dark theme is automatically applied when the user's system preference is set to dark mode (`prefers-color-scheme: dark`)
- **Customizable**: All colors are defined using CSS custom properties for easy customization
- **Tailwind Compatible**: Includes compatibility classes for use with Tailwind CSS
- **Consistent**: Both the table component and sample application support dark theme

## CSS Custom Properties

The library uses CSS custom properties for theming:

```css
:root {
  /* Light theme (default) */
  --ngt-primary-color: #007c89;
  --ngt-secondary-color: #f4f4f4;
  --ngt-border-color: #e1e5e9;
  --ngt-text-color: #241c15;
  --ngt-table-bg: #ffffff;
  --ngt-header-bg: #f8f9fa;
  /* ... and more */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark theme */
    --ngt-primary-color: #5fb3c4;
    --ngt-secondary-color: #2a2a2a;
    --ngt-border-color: #404040;
    --ngt-text-color: #ffffff;
    --ngt-table-bg: #1a1a1a;
    --ngt-header-bg: #2a2a2a;
    /* ... and more */
  }
}
```

## Tailwind CSS Compatibility

For projects using Tailwind CSS, you can manually control the theme using CSS classes:

### Light Theme
```html
<div class="ngt-theme-light demo-theme-light">
  <ngt-table>...</ngt-table>
</div>
```

### Dark Theme
```html
<div class="ngt-theme-dark demo-theme-dark">
  <ngt-table>...</ngt-table>
</div>
```

### With Tailwind Dark Mode
```html
<!-- Using Tailwind's dark: modifier -->
<div class="ngt-theme-light demo-theme-light dark:ngt-theme-dark dark:demo-theme-dark">
  <ngt-table>...</ngt-table>
</div>
```

## Manual Theme Control

You can override the automatic detection by applying the theme classes directly:

```typescript
@Component({
  template: `
    <div [class]="themeClass">
      <ngt-table [config]="config" [data]="data"></ngt-table>
    </div>
  `
})
export class MyComponent {
  isDarkMode = false;
  
  get themeClass() {
    return this.isDarkMode 
      ? 'ngt-theme-dark demo-theme-dark' 
      : 'ngt-theme-light demo-theme-light';
  }
  
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }
}
```

## Customizing Colors

You can customize the dark theme colors by overriding the CSS custom properties:

```css
/* Custom dark theme colors */
@media (prefers-color-scheme: dark) {
  :root {
    --ngt-primary-color: #ff6b6b; /* Custom red accent */
    --ngt-table-bg: #0d1117;      /* GitHub dark background */
    --ngt-header-bg: #161b22;     /* GitHub header background */
  }
}

/* Or using classes for manual control */
.my-custom-dark-theme {
  --ngt-primary-color: #ff6b6b;
  --ngt-table-bg: #0d1117;
  --ngt-header-bg: #161b22;
}
```

## Available CSS Custom Properties

### Table Component Properties
- `--ngt-primary-color`: Primary accent color
- `--ngt-secondary-color`: Secondary background color
- `--ngt-border-color`: Border color
- `--ngt-text-color`: Primary text color
- `--ngt-text-muted`: Muted text color
- `--ngt-hover-color`: Row hover background
- `--ngt-selected-color`: Selected row background
- `--ngt-focus-color`: Focus outline color
- `--ngt-table-bg`: Table background
- `--ngt-header-bg`: Header background
- `--ngt-row-bg`: Row background
- `--ngt-expanded-row-bg`: Expanded row background

### Sample App Properties
- `--demo-bg`: App background color
- `--demo-text`: Primary text color
- `--demo-text-muted`: Muted text color
- `--demo-primary`: Primary accent color
- `--demo-border`: Border color
- `--demo-card-bg`: Card background
- `--demo-card-border`: Card border color
- `--demo-control-bg`: Control panel background
- `--demo-button-bg`: Button background
- `--demo-button-hover`: Button hover state

## Browser Support

Dark theme support works in all modern browsers that support:
- CSS Custom Properties (CSS Variables)
- `prefers-color-scheme` media query

This includes:
- Chrome 76+
- Firefox 67+
- Safari 12.1+
- Edge 79+

## Migration from Previous Versions

If you were using custom CSS to override colors, you should migrate to using CSS custom properties:

### Before
```css
.ngt-table-container {
  background: #1a1a1a !important;
  color: #ffffff !important;
}
```

### After
```css
:root {
  --ngt-table-bg: #1a1a1a;
  --ngt-text-color: #ffffff;
}
```

This approach is more maintainable and provides better integration with the component's theming system.