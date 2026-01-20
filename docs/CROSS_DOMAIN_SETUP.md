# Cross-Domain Widget Setup

Dette dokumentet forklarer hvordan du bruker Beat Machine Widget på tvers av domener.

## Scenario

Du vil hoste Beat Machine på `beat.salsanor.no` og bruke widgeten på `salsanor.no` (eller andre domener).

## Steg 1: Server-konfigurasjon (beat.salsanor.no)

Serveren som hoster Beat Machine må sende riktige CORS-headere for å tillate cross-origin requests.

### Next.js (next.config.js)

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
        ],
      },
      {
        source: '/widget.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};
```

### Apache (.htaccess)

```apache
<IfModule mod_headers.c>
    <FilesMatch "\.(js|webm|mp3|json|xml)$">
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
</IfModule>
```

### Nginx

```nginx
location ~* \.(js|webm|mp3|json|xml)$ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}
```

## Steg 2: Bygg widget for produksjon

```bash
npm run bundle
```

Dette genererer `dist/widget.js` og `dist/widget.css`.

## Steg 3: Deploy til beat.salsanor.no

Last opp følgende filer til `beat.salsanor.no`:

```
/widget.js              # Fra dist/widget.js (includes CSS)
/assets/
  audio/
    main.webm           # Audio samples
    main.mp3            # Fallback for eldre nettlesere
    main.json           # Audio sample descriptor
  machines/
    salsa.xml           # Salsa rhythm definitions
    merengue.xml        # Merengue rhythm definitions
```

## Steg 4: Bruk på salsanor.no

### HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Salsa Article</title>
</head>
<body>
    <h1>Min Salsa Artikkel</h1>
    
    <p>Her er en clave-rytme:</p>
    <div data-beat-widget data-instruments="clave" data-bpm="120"></div>
    
    <p>Og her er en full salsa-rytme:</p>
    <div data-beat-widget data-instruments="clave,cowbell,bongo" data-bpm="140"></div>
    
    <script src="https://beat.salsanor.no/widget.js"></script>
    <script>
        // Sett base URL for cross-domain loading
        window.BeatMachineWidget.setBaseUrl('https://beat.salsanor.no');
    </script>
</body>
</html>
```

**Note:** CSS is automatically injected by the widget.js file - no separate CSS file needed!

### WordPress

I WordPress kan du legge til følgende i `functions.php`:

```php
function enqueue_beat_machine_widget() {
    wp_enqueue_script('beat-machine-widget', 'https://beat.salsanor.no/widget.js', array(), null, true);
    wp_add_inline_script('beat-machine-widget', 
        'window.BeatMachineWidget.setBaseUrl("https://beat.salsanor.no");'
    );
}
add_action('wp_enqueue_scripts', 'enqueue_beat_machine_widget');
```

**Note:** CSS is automatically injected - no need to enqueue a separate stylesheet!

Deretter kan du bruke widgeten i innlegg/sider:

```html
<div data-beat-widget data-instruments="clave,cowbell" data-bpm="120"></div>
```

## Widget-attributter

- `data-beat-widget` - Påkrevd for å initialisere widgeten
- `data-instruments` - Kommaseparert liste over instrumenter (f.eks. "clave,cowbell,bongo")
- `data-programs` - Velg spesifikt pattern for instrumenter (f.eks. "clave:1,cowbell:2" der tallet er program-index)
- `data-bpm` - Tempo (60-200, standard: 120)
- `data-machine` - Velg maskin ("salsa" eller "merengue", standard: "salsa")
- `data-autoplay` - Start automatisk ("true" eller "false", standard: "false")

### Eksempel med custom patterns:
```html
<!-- Clave med Rumba pattern (index 1) og Cowbell med Simple pattern (index 1) -->
<div data-beat-widget 
     data-instruments="clave,cowbell" 
     data-programs="clave:1,cowbell:1"
     data-bpm="120"></div>
```

## Tilgjengelige instrumenter

### Salsa
- `clave` - Son clave (3-2 eller 2-3)
- `cowbell` - Campana/Bell
- `bongo` - Bongo
- `bass` - Bass
- `congas` - Congas
- `timbales` - Timbales
- `guiro` - Güiro
- `maracas` - Maracas
- `piano` - Piano montuno

### Merengue
- `tambora` - Tambora
- `guira` - Güira
- `bass` - Bass

## Feilsøking

### Widget laster ikke
- Sjekk at `widget.js` lastes uten feil i nettleserens konsoll
- Verifiser at CORS-headere er konfigurert riktig

### Ingen lyd
- Sjekk at audio-filer er tilgjengelige på `beat.salsanor.no/assets/audio/`
- Åpne nettleserens konsoll og se etter feilmeldinger
- Verifiser at `setBaseUrl()` er kalt før widgeten initialiseres

### Console errors om CORS
- Serveren på `beat.salsanor.no` må sende `Access-Control-Allow-Origin` header
- Test at ressursene er tilgjengelige: åpne f.eks. `https://beat.salsanor.no/assets/machines/salsa.xml` direkte i nettleseren

## Sikkerhet

Hvis du vil begrense hvem som kan bruke widgeten, kan du endre CORS-konfigurasjonen:

```javascript
// Kun tillat salsanor.no
{ key: 'Access-Control-Allow-Origin', value: 'https://salsanor.no' }

// Tillat flere domener
{ key: 'Access-Control-Allow-Origin', value: 'https://salsanor.no, https://www.salsanor.no' }
```

## Support

For spørsmål eller problemer, opprett en issue på GitHub eller kontakt utvikler.
