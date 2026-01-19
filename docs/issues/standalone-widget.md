# Create Standalone JavaScript Widget for Embedding Beat Machine

**Status:** 📝 Planning  
**Priority:** High  
**Labels:** enhancement, feature, embed

---

## 🎯 Goal
Create a standalone JavaScript widget that allows the Beat Machine to be embedded on any website with simple HTML and data attributes.

## 📋 User Story
As a content creator, I want to embed a compact beat machine player in my articles so that I can demonstrate musical concepts (like clave patterns) inline with my content.

## 🔧 Technical Approach

### Implementation Steps

#### 1. Vite Bundle Configuration
- [ ] Create separate entry point for widget (`src/widget.tsx`)
- [ ] Configure Vite to build standalone bundle with minimal dependencies
- [ ] Use existing `vite-bundle` script as starting point
- [ ] Output to `dist/beat-widget.js` and `dist/beat-widget.css`
- [ ] Add source maps for debugging
- [ ] Configure code splitting for optimal loading

#### 2. Widget API Design
```html
<!-- Basic usage -->
<div id="beat-widget" 
     data-instruments="clave,cowbell,bongo" 
     data-bpm="120"
     data-machine="salsa"
     data-size="compact"></div>
<script src="https://yourdomain.com/beat-widget.js"></script>

<!-- Advanced usage -->
<div class="beat-widget" 
     data-instruments="clave,cowbell" 
     data-bpm="90"
     data-machine="salsa"
     data-size="compact"
     data-autoplay="true"
     data-pattern="3-2-son-clave"
     data-theme="dark"></div>
```

#### 3. Compact UI Component
- [ ] Create `BeatMachineCompact.tsx` component
- [ ] Minimal controls: play/pause, BPM slider (optional in compact mode)
- [ ] Show only specified instruments
- [ ] Responsive design for various container sizes
- [ ] Maintain glassmorphic design aesthetic
- [ ] Option to hide labels/titles for ultra-compact mode

#### 4. Configuration via Data Attributes

**Required:**
- `data-instruments`: Comma-separated instrument IDs (e.g., "clave,cowbell,bongo")

**Optional:**
- `data-bpm`: Initial tempo (default: 120)
- `data-machine`: Machine type - "salsa" or "merengue" (default: "salsa")
- `data-size`: "compact" or "full" (default: "compact")
- `data-autoplay`: Auto-start playback - "true" or "false" (default: "false")
- `data-pattern`: Pre-configured pattern name (optional)
- `data-theme`: "dark" or "light" (default: "dark")
- `data-show-labels`: Show instrument names - "true" or "false" (default: "true")
- `data-show-bpm`: Show BPM control - "true" or "false" (default: "true")

#### 5. Widget Initialization System
```typescript
// Auto-initialize all widgets on page load
window.BeatMachineWidget = {
  init: (selector?: string) => void,
  create: (element: HTMLElement, config: WidgetConfig) => WidgetInstance,
  destroy: (element: HTMLElement) => void
};

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.BeatMachineWidget.init();
});
```

## ✅ Acceptance Criteria

### Functionality
- [ ] Widget can be loaded with single script tag
- [ ] Configurable via HTML data attributes
- [ ] Multiple widgets can coexist on same page
- [ ] Works on any website without CSS/JS conflicts
- [ ] Audio plays correctly in embedded context

### Performance
- [ ] Bundle size < 200KB (gzipped)
- [ ] Lazy-load audio samples
- [ ] No performance impact on host page

### UI/UX
- [ ] Compact UI variant exists and looks good
- [ ] Responsive to container width
- [ ] Maintains glassmorphic design
- [ ] Dark/light theme support
- [ ] No global CSS conflicts (scoped styles)

### Documentation
- [ ] Example HTML page demonstrating usage
- [ ] API documentation in README
- [ ] Integration guide for common platforms
- [ ] WordPress integration example

## 🎨 UI Considerations

### Compact Mode Design
- Horizontal layout for space efficiency
- Instrument tiles reduced to icons only (no labels if `data-show-labels="false"`)
- Controls overlay on hover
- Minimal padding (use existing `.instrumentCard` improvements)
- Full glassmorphic aesthetic preserved

### Sizing Guidelines
- **Ultra-compact:** 300px × 80px (single row, minimal controls)
- **Compact:** 400px × 120px (single row with controls)
- **Medium:** 600px × 150px (instruments + full controls)
- **Full:** Responsive, similar to main app

## 📦 Bundle Strategy

### Core Bundle (Required)
- Beat engine
- Audio backend
- Minimal UI components
- Widget initialization

### Lazy Loaded
- Audio samples (load on demand)
- Full machine configurations
- Additional themes

### External Dependencies
- Consider inlining critical MUI components
- Remove unused Material-UI modules
- Use tree-shaking aggressively

## 🧪 Testing Strategy
- [ ] Test on vanilla HTML page
- [ ] Test on WordPress site
- [ ] Test with multiple widgets on same page
- [ ] Test in different browsers
- [ ] Test with different container sizes
- [ ] Test auto-play with browser restrictions

## 🔗 Future Enhancements
- WordPress plugin wrapper with admin UI
- Web Component version (`<beat-machine>`)
- React/Vue/Angular component wrappers
- CDN hosting for widget files
- Pattern library with predefined rhythms
- Visual pattern editor in embed mode

## 💡 Example Use Cases

### Educational Article
```html
<h2>Understanding the Clave Rhythm</h2>
<p>The clave is the foundational rhythm in salsa music...</p>
<div class="beat-widget" 
     data-instruments="clave" 
     data-bpm="90" 
     data-size="compact"
     data-pattern="3-2-son-clave"></div>
```

### Music Blog
```html
<h3>Salsa Rhythm Breakdown</h3>
<div class="beat-widget" 
     data-instruments="clave,cowbell,bongo,conga"
     data-bpm="120"
     data-machine="salsa"
     data-size="medium"></div>
```

### Interactive Tutorial
```html
<div class="beat-widget" 
     data-instruments="clave,cowbell"
     data-bpm="100"
     data-autoplay="false"
     data-show-bpm="true"
     data-theme="light"></div>
```

## 📝 Implementation Notes

### File Structure
```
src/
  widget/
    widget-entry.tsx          # Main entry point
    BeatMachineWidget.tsx     # Widget component
    WidgetCompact.tsx         # Compact UI variant
    widget-init.ts            # Auto-initialization
    widget-types.ts           # TypeScript definitions
  
public/
  widget-demo.html            # Demo page

dist/
  beat-widget.js              # Bundled widget
  beat-widget.css             # Scoped styles
  beat-widget.js.map          # Source map
```

### Vite Configuration
```javascript
// vite.config.widget.js
export default {
  build: {
    lib: {
      entry: 'src/widget/widget-entry.tsx',
      name: 'BeatMachineWidget',
      fileName: 'beat-widget',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        assetFileNames: 'beat-widget.[ext]'
      }
    }
  }
}
```

## 🚀 Deployment

### CDN Hosting
```html
<!-- Latest version -->
<script src="https://cdn.salsanor.com/beat-widget/latest/beat-widget.js"></script>

<!-- Specific version -->
<script src="https://cdn.salsanor.com/beat-widget/v1.0.0/beat-widget.js"></script>
```

### Self-Hosted
- Build widget bundle
- Upload to your server
- Reference from your domain

---

**Related Issues:**
- #2 - Glassmorphic UI design system (provides base styling)

**References:**
- Current beat-engine implementation
- Existing `vite-bundle` npm script
- Material-UI components in use
