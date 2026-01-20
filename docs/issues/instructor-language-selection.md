# Add Language Selection for Instructor Voice

## 📋 Issue Summary

The Instructor instrument currently plays voice counting ("1", "2", "3", etc.) in English only, but the audio files include **6 different languages**. These language options are hidden and not accessible through the UI.

## 🎯 Current State

**Available Audio Files:**
- 🇬🇧 `instructor-0` to `instructor-7` (English - default)
- 🇮🇹 `italian:instructor-0` to `italian:instructor-7`
- 🇪🇸 `spanish:instructor-0` to `spanish:instructor-7`
- 🇫🇷 `french:instructor-0` to `french:instructor-7`
- 🇷🇺 `russian:instructor-0` to `russian:instructor-7`
- 🇩🇪 `german:instructor-0` to `german:instructor-7`

**Current Behavior:**
- UI only shows "Instructor" instrument
- Only English (`instructor-X`) samples are played
- No way to select language
- Language-prefixed samples exist but are inaccessible

## 🎨 Proposed Solution

### Main App UI

Add a **language selector toggle** in the footer, next to the Widget Generator button:

```
┌─────────────────────────────────────────┐
│                                         │
│         [Beat Machine Content]          │
│                                         │
└─────────────────────────────────────────┘
     Footer:
     [🌐 EN ▾] [Widget Generator]
```

**Language Toggle Options:**
- 🇬🇧 English (EN)
- 🇮🇹 Italian (IT)
- 🇪🇸 Spanish (ES)
- 🇫🇷 French (FR)
- 🇷🇺 Russian (RU)
- 🇩🇪 German (DE)

### Widget Generator

Add a **language dropdown** in the Instructor instrument settings section:

```tsx
<section className={styles.section}>
  <h2>Instructor Language</h2>
  <select className={styles.select}>
    <option value="">English (default)</option>
    <option value="italian">Italian</option>
    <option value="spanish">Spanish</option>
    <option value="french">French</option>
    <option value="russian">Russian</option>
    <option value="german">German</option>
  </select>
  <p className={styles.help}>
    Language for counting beats (1, 2, 3, etc.)
  </p>
</section>
```

### Widget Code Generation

**Generated code should support:**
```html
<div data-beat-widget
     data-instruments="clave,instructor"
     data-instructor-language="spanish"
     data-bpm="120"></div>
```

**Widget Configuration Interface:**
```typescript
interface WidgetConfig {
  instruments?: string[];
  instructorLanguage?: 'italian' | 'spanish' | 'french' | 'russian' | 'german';
  bpm?: number;
  autoplay?: boolean;
}
```

## 🔧 Technical Implementation

### 1. Update Machine Interfaces

```typescript
// engine/machine-interfaces.ts
export interface IInstrument {
  id: string;
  title: string;
  enabled: boolean;
  volume: number;
  activeProgram: number;
  programs: IProgram[];
  
  // New property for language-aware instruments
  language?: string; // 'italian', 'spanish', 'french', 'russian', 'german'
}
```

### 2. Update AudioBackend Sample Loading

Modify `engine/audio-backend.ts` to check for language prefix:

```typescript
private getSampleName(instrument: IInstrument, pitch: number): string {
  const baseId = `${instrument.id}-${pitch}`;
  
  // If instrument has language setting and it's instructor
  if (instrument.language && instrument.id === 'instructor') {
    return `${instrument.language}:${baseId}`;
  }
  
  return baseId;
}
```

### 3. Add Language State Management

```typescript
// Store language preference globally
interface AppState {
  instructorLanguage: string;
}

// Persist to localStorage
localStorage.setItem('beat-machine-instructor-lang', language);
```

### 4. Update Widget Entry

```typescript
// src/widget/widget-entry.tsx
const instructorLanguage = element.dataset.instructorLanguage;

if (instructorLanguage) {
  const instructor = machine.instruments.find(i => i.id === 'instructor');
  if (instructor) {
    instructor.language = instructorLanguage;
  }
}
```

## 📁 Files to Modify

### Core Engine
- `engine/machine-interfaces.ts` - Add `language?: string` property
- `engine/audio-backend.ts` - Update sample name resolution
- `engine/instrument-player.ts` - Pass language info to audio backend

### UI Components
- `components/beat-machine-ui-glass.tsx` - Add language toggle in footer
- `components/instrument-tile.tsx` - Show language selector for Instructor
- `pages/widget-generator.tsx` - Add language selection
- `pages/widget-generator.module.css` - Style language selector

### Widget System
- `src/widget/widget-types.ts` - Add `instructorLanguage?` to config
- `src/widget/widget-entry.tsx` - Parse `data-instructor-language` attribute
- `src/widget/WidgetCompact.tsx` - Support language prop

### Documentation
- `docs/CROSS_DOMAIN_SETUP.md` - Document language attribute
- `README.md` - Update features list

## ✅ Acceptance Criteria

- [ ] Language toggle appears in main app footer
- [ ] Clicking toggle shows dropdown with all 6 language options
- [ ] Selected language persists in localStorage
- [ ] Instructor instrument plays correct language samples
- [ ] Widget generator includes language selector
- [ ] Generated widget code includes `data-instructor-language` attribute
- [ ] Widget respects language setting from data attribute
- [ ] Language setting only affects Instructor instrument (not others)
- [ ] Default behavior (no language set) uses English
- [ ] Invalid language values fallback to English gracefully

## 🎯 Testing Checklist

### Main App
- [ ] Toggle appears in footer on all screen sizes
- [ ] Language selection persists after page reload
- [ ] Instructor plays correct language after selection
- [ ] Other instruments unaffected by language setting
- [ ] Mobile responsive (dropdown doesn't break layout)

### Widget Generator
- [ ] Language dropdown appears in UI
- [ ] Generated code includes correct language attribute
- [ ] Live preview plays selected language
- [ ] Copy button includes language in generated code

### Widget Embed
- [ ] `data-instructor-language="spanish"` works correctly
- [ ] Missing language attribute uses English (default)
- [ ] Invalid language gracefully falls back to English
- [ ] Multiple widgets on same page can have different languages

## 🚀 Future Enhancements

- **Auto-detect language** from browser settings (`navigator.language`)
- **Add more languages** if audio samples become available
- **Language-specific UI text** (not just Instructor voice)
- **Per-pattern language override** (different language for different programs)
- **Voice gender options** (if multiple recordings available)

## 📝 Notes

- Audio files already exist for all 6 languages
- No audio recording needed - implementation only
- Consider whether other instruments might need language support
- Performance: all language samples already in single audio file
- File size: no additional downloads needed

## 🔗 Related Issues

- Widget Generator feature (#existing-issue-number)
- Cross-domain deployment (#existing-issue-number)

---

**Priority:** Medium  
**Estimated Effort:** 4-6 hours  
**Impact:** Enhances accessibility for international users
