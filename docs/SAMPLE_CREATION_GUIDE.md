# Sample Creation Guide for SalsaNor Beat Machine

## Innholdsfortegnelse

1. [Oversikt over Audio Sprite-systemet](#oversikt-over-audio-sprite-systemet)
2. [Filstruktur og formater](#filstruktur-og-formater)
3. [Hvordan Audio Sprites fungerer](#hvordan-audio-sprites-fungerer)
4. [Verktøy som brukes](#verktøy-som-brukes)
5. [Komplett arbeidsflyt for å lage samples](#komplett-arbeidsflyt-for-å-lage-samples)
6. [Tekniske spesifikasjoner](#tekniske-spesifikasjoner)
7. [XML-konfigurasjon](#xml-konfigurasjon)
8. [Praktiske eksempler](#praktiske-eksempler)
9. [Feilsøking og beste praksis](#feilsøking-og-beste-praksis)

---

## Oversikt over Audio Sprite-systemet

SalsaNor Beat Machine bruker et **audio sprite-system** for effektiv lasting og avspilling av lydsamples. I stedet for å laste hundrevis av individuelle lydfiler, er alle samples pakket inn i én enkelt lydfil.

### Hvorfor Audio Sprites?

**Fordeler:**
- **Raskere lasting**: Én HTTP-forespørsel i stedet for 227 separate forespørsler
- **Mindre overhead**: Redusert nettverkstrafikk og serverbelastning
- **Bedre caching**: Nettleseren cacher én stor fil
- **Enklere deployment**: Færre filer å administrere
- **Konsistent timing**: Alle samples lastes samtidig

**Ulemper:**
- Må laste hele filen før noen samples kan spilles (227 samples = ~1 MB)
- Krever mer kompleks mapping-logikk
- Vanskeligere å oppdatere individuelle samples

### Systemarkitektur

```
┌─────────────────────────────────────────────────────────────┐
│                   Beat Machine Audio System                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │  main.webm   │────▶│  main.json   │────▶│  salsa.xml  │ │
│  │  (912 KB)    │     │  (7.8 KB)    │     │  (1411 lin) │ │
│  │              │     │              │     │             │ │
│  │ Alle samples │     │ Offset-map   │     │ Patterns &  │ │
│  │ i én fil     │     │ for samples  │     │ Instrumenter│ │
│  └──────────────┘     └──────────────┘     └─────────────┘ │
│         │                     │                     │        │
│         └─────────────────────┴─────────────────────┘        │
│                               │                              │
│                               ▼                              │
│                   ┌───────────────────────┐                 │
│                   │  audio-backend.ts     │                 │
│                   │  beat-engine.ts       │                 │
│                   │  instrument-player.ts │                 │
│                   └───────────────────────┘                 │
│                               │                              │
│                               ▼                              │
│                      Web Audio API                          │
│                    (Browser Playback)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Filstruktur og formater

### Hoveddokumentasjon av filer

```
public/assets/audio/
├── main.webm          # Primær audio sprite (912 KB, WebM/Vorbis)
├── main.mp3           # Fallback audio sprite (1.0 MB, MP3 56kbps)
└── main.json          # Sample offset mapping (7.8 KB)

public/assets/machines/
├── salsa.xml          # Salsa-maskin konfigurasjon (1411 linjer)
└── merengue.xml       # Merengue-maskin konfigurasjon
```

### Filstørrelser og sammenligning

| Fil        | Størrelse | Format           | Formål                          |
|------------|-----------|------------------|---------------------------------|
| main.webm  | 912 KB    | WebM (Vorbis)    | Moderne nettlesere (Chrome, FF) |
| main.mp3   | 1.0 MB    | MP3 (56 kbps)    | Eldre nettlesere (Safari, IE)   |
| main.json  | 7.8 KB    | JSON             | Sample offset mapping           |

**Observasjon**: WebM er 16% mindre enn MP3 (912 KB vs 1.0 MB) og gir bedre kvalitet ved samme filstørrelse.

---

## Hvordan Audio Sprites fungerer

### 1. Audio Sprite-filen (main.webm / main.mp3)

En **audio sprite** er én kontinuerlig lydfil som inneholder alle samples lagt etter hverandre:

```
[sample1][sample2][sample3][sample4]...[sample227]
 0       21473    36275   64890
```

Hver sample ligger på en spesifikk posisjon (offset) og har en bestemt varighet (duration).

### 2. Mapping-filen (main.json)

`main.json` inneholder en mapping som forteller hvor hver sample befinner seg i sprite-filen:

```json
{
  "italian:instructor-5": [0, 0, 21473],
  "piano-59": [0, 36275, 28615],
  "clave-0": [0, 356633, 5842],
  "congas-2": [0, 590235, 6707]
}
```

**Format**: `"sample-navn": [kanal, offset, varighet]`

- **Kanal**: 0 = mono (alle samples)
- **Offset**: Startposisjon i samples (ikke sekunder!)
- **Varighet**: Lengde i samples

**Viktig**: Verdiene er i **samples**, ikke sekunder. Ved 44.1 kHz sample rate:
- 44100 samples = 1 sekund
- 21473 samples = ~0.487 sekunder
- 5842 samples = ~0.132 sekunder

### 3. Beregning av tid

For å konvertere samples til sekunder:

```javascript
const sampleRate = 44100; // Hz
const offsetInSamples = 356633;
const durationInSamples = 5842;

const startTimeSeconds = offsetInSamples / sampleRate; // 8.085 sekunder
const durationSeconds = durationInSamples / sampleRate; // 0.132 sekunder
```

### 4. Avspilling med Web Audio API

Slik spilles en sample fra sprite-filen:

```javascript
// Fra audio-backend.ts
play(name, destination, time, volume = 1.0) {
  const offset = this.bankDescriptor[name];
  if (!offset) return;

  const [channel, offsetInSamples, durationInSamples] = offset;
  const source = this.context.createBufferSource();
  
  source.buffer = this.audioBank;
  source.connect(destination);
  
  // Konverter samples til sekunder
  const startTime = offsetInSamples / this.audioBank.sampleRate;
  const duration = durationInSamples / this.audioBank.sampleRate;
  
  // Start avspilling fra riktig offset
  source.start(time, startTime, duration);
}
```

---

## Verktøy som brukes

### 1. Audiosprite (npm-pakke)

**audiosprite** er det mest sannsynlige verktøyet som ble brukt til å lage audio sprite-filene.

**Installasjon:**
```bash
npm install -g audiosprite
```

**Bruk:**
```bash
audiosprite --output main \
  --format howler \
  --export webm,mp3 \
  --samplerate 44100 \
  --channels 1 \
  samples/*.wav
```

**Parametere:**
- `--output main`: Output-filnavn (main.webm, main.mp3, main.json)
- `--format howler`: JSON-format kompatibelt med Howler.js
- `--export webm,mp3`: Generer både WebM og MP3
- `--samplerate 44100`: Standard CD-kvalitet
- `--channels 1`: Mono (sparer plass)

### 2. DAW (Digital Audio Workstation)

For å redigere og normalisere samples før de pakkes:

**Profesjonelle alternativer:**
- **Logic Pro X** (Mac) - $199
- **Ableton Live** (Mac/Win) - Fra $99
- **FL Studio** (Mac/Win) - Fra $99

**Gratis alternativer:**
- **Audacity** (Mac/Win/Linux) - Gratis
- **GarageBand** (Mac) - Gratis
- **Reaper** (Mac/Win) - $60 (evalueringsversjon gratis)

### 3. Lydeditor

For finpussing av individuelle samples:

- **Audacity**: Gratis, open-source, perfekt for nybegynnere
- **Adobe Audition**: Profesjonell, del av Creative Cloud
- **WaveLab**: Avansert mastering og editing

### 4. Sample-biblioteker

Hvor man kan hente profesjonelle samples:

**Betalte biblioteker:**
- **Splice** (splice.com) - $9.99/måned, millioner av samples
- **Loopmasters** (loopmasters.com) - Individuelle packs
- **Native Instruments** - Kontakt libraries
- **EastWest** - Orkester og world instruments

**Gratis ressurser:**
- **Freesound.org** - Creative Commons samples
- **99sounds.org** - Gratis sample packs
- **Bedroom Producers Blog** - Gratis VSTs og samples

### 5. ffmpeg (for konvertering)

```bash
brew install ffmpeg  # macOS
apt install ffmpeg   # Linux
```

**Brukseksempler:**
```bash
# Konverter til WebM
ffmpeg -i input.wav -c:a libvorbis -b:a 96k output.webm

# Konverter til MP3
ffmpeg -i input.wav -c:a libmp3lame -b:a 56k output.mp3

# Normaliser audio
ffmpeg -i input.wav -af loudnorm output.wav
```

---

## Komplett arbeidsflyt for å lage samples

### Steg 1: Planlegging

**Definer instrumentet:**
- Hvilke lyder trenger du? (Piano: C3-B3, Congas: 3 varianter, etc.)
- Hvor mange samples per instrument? (12 noter, 3 slagvarianter, etc.)
- Hvilke artikulasjoner? (Muted, open, slap, etc.)

**Navnekonvensjon:**
```
instrument-pitch.wav
piano-48.wav         # MIDI note 48 (C3)
piano-59.wav         # MIDI note 59 (B3)
congas-0.wav         # Første variant
congas-1.wav         # Andre variant
cowbell-muted.wav    # Spesifikk artikulasjon
```

### Steg 2: Innspilling eller anskaffelse

**Alternativ A: Spill inn selv**
1. Sett opp mikrofon og audio interface
2. Innstillinger: 44.1 kHz, 24-bit, mono
3. Spill inn hver sample individuelt
4. Navngi filene riktig med en gang

**Alternativ B: Bruk sample-bibliotek**
1. Søk etter "salsa percussion samples" på Splice/Loopmasters
2. Last ned individuelle samples
3. Omdøp til riktig navnekonvensjon

**Alternativ C: Ekstraher fra eksisterende lydfiler**
1. Finn backing tracks eller loops
2. Isoler individuelle slag med audio editor
3. Eksporter som individuelle WAV-filer

### Steg 3: Redigering og normalisering

**I Audacity (eller annen editor):**

1. **Åpne sample**
   - File → Open → Velg WAV-fil

2. **Trim stillhet**
   - Velg starten av lyden (før attack)
   - Trim unødvendig stillhet (la ~10ms før attack stå)
   - Trim fade-out når lyden er helt stille

3. **Normaliser volum**
   - Effect → Normalize
   - Sett til -1.0 dB (forhindrer clipping)
   - Apply

4. **Fade-in/Fade-out (valgfritt)**
   - Velg første 5ms: Effect → Fade In
   - Velg siste 10ms: Effect → Fade Out

5. **Konverter til mono**
   - Tracks → Stereo Track to Mono

6. **Sett sample rate**
   - Nederst til venstre: Velg "44100 Hz"

7. **Eksporter**
   - File → Export → Export as WAV
   - Settings: PCM signed 16-bit, 44100 Hz, Mono

**Batch-prosessering:**
```bash
# Normaliser alle WAV-filer i en mappe
for file in *.wav; do
  ffmpeg -i "$file" -af loudnorm "normalized_$file"
done
```

### Steg 4: Generer audio sprite

**Organiser filene:**
```bash
samples/
├── piano-48.wav
├── piano-49.wav
├── piano-50.wav
├── ...
├── congas-0.wav
├── congas-1.wav
└── congas-2.wav
```

**Kjør audiosprite:**
```bash
cd public/assets/audio

audiosprite \
  --output main \
  --format howler \
  --export webm,mp3 \
  --samplerate 44100 \
  --channels 1 \
  --bitrate 96 \
  ../../../samples/*.wav
```

**Output:**
```
✓ main.webm (912 KB)
✓ main.mp3 (1.0 MB)
✓ main.json (7.8 KB)
```

**Verifiser main.json:**
```json
{
  "src": ["main.webm", "main.mp3"],
  "sprite": {
    "piano-48": [0, 21473, false],
    "piano-49": [21473, 18342, false],
    "congas-0": [39815, 8421, false]
  }
}
```

### Steg 5: Oppdater XML-konfigurasjon

**Rediger salsa.xml (eller merengue.xml):**

```xml
<!-- Legg til nytt instrument -->
<bm:Instrument name="NewInstrument" enabled="true" activeProgram="0">
  <bm:Program title="Basic Pattern" length="16">
    <!-- index = beat position (0-15) -->
    <!-- pitch = sample variant (0, 1, 2...) -->
    <!-- velocity = volum (0.0-1.0, default 1.0) -->
    <bm:Note index="0" pitch="0" />
    <bm:Note index="4" pitch="1" />
    <bm:Note index="8" pitch="0" velocity="0.8" />
    <bm:Note index="12" pitch="2" />
  </bm:Program>
</bm:Instrument>
```

**Sample-naming mapping:**
- `pitch="0"` → spiller `newinstrument-0` fra main.json
- `pitch="1"` → spiller `newinstrument-1` fra main.json
- `pitch="2"` → spiller `newinstrument-2` fra main.json

### Steg 6: Testing

**Lokal testing:**
```bash
npm run dev
```

**Åpne nettleser:**
```
http://localhost:3000
```

**Test i konsollen:**
```javascript
// Åpne Developer Tools (F12)
// Test at sample spilles
audioBackend.play('newinstrument-0', audioContext.destination, 0, 1.0);
```

**Sjekk feilmeldinger:**
- Åpne Console tab
- Sjekk etter "Failed to load" eller "Sample not found"

### Steg 7: Build og deploy

**Bygg produksjonsversjon:**
```bash
npm run build
```

**Verifiser output:**
```bash
ls -lh out/assets/audio/
# Skal vise main.webm, main.mp3, main.json
```

**Deploy til server:**
```bash
# Last opp hele 'out/' mappen til webserver
scp -r out/* user@server:/var/www/beat.salsanor.no/
```

---

## Tekniske spesifikasjoner

### Audio-spesifikasjoner

| Parameter      | Verdi                  | Begrunnelse                              |
|----------------|------------------------|------------------------------------------|
| Sample rate    | 44.1 kHz               | Standard CD-kvalitet                     |
| Bit depth      | 16-bit (PCM)           | God kvalitet, akseptabel filstørrelse    |
| Kanaler        | Mono (1)               | Sparer 50% plass vs. stereo              |
| WebM codec     | Vorbis (~96 kbps)      | God kvalitet, liten filstørrelse         |
| MP3 bitrate    | 56 kbps                | Akseptabel for backing track-bruk        |
| Format         | WebM (primær), MP3     | WebM for moderne, MP3 for eldre browsers |

### Sample-statistikk (current system)

```javascript
// Fra main.json analyse
Total samples: 227
Instrumenter: 14
  - Piano: 12 samples (piano-48 til piano-59) = MIDI C3-B3
  - Clave: 1 sample (clave-0)
  - Congas: 3 samples (congas-0, congas-1, congas-2)
  - Bongos: 2 samples (bongos-0, bongos-1)
  - Cowbell: 2 samples (cowbell-0, cowbell-1)
  - Timbales: 3 samples (timbales-0, timbales-1, timbales-2)
  - Guira: 2 samples (guira-0, guira-1)
  - Maracas: 2 samples (maracas-0, maracas-1)
  - Tambora: 3 samples (tambora-0, tambora-1, tambora-2)
  - Bass: 12 samples (bass-48 til bass-59)
  - Clap: 1 sample (clap-0)
  - Instructor (Spanish): 38 samples
  - Instructor (Italian): 38 samples
  - Instructor (Portuguese): 38 samples
  - ... etc.

Gjennomsnittlig sample-størrelse: ~4.5 KB per sample (komprimert)
Lengste sample: ~0.5 sekunder
Korteste sample: ~0.1 sekunder
```

### Filstruktur i detalj

**main.json format:**
```json
{
  "sample-name": [channel, offset_samples, duration_samples],
  "clave-0": [0, 356633, 5842],
  //           │  │       └─ Varighet: 5842 samples = 0.132 sek
  //           │  └───────── Offset: 356633 samples = 8.085 sek
  //           └────────────── Kanal: 0 = mono
}
```

**Beregningseksempel:**
```javascript
// Sample: clave-0
const sampleRate = 44100;
const offset = 356633;      // samples
const duration = 5842;      // samples

const startTime = offset / sampleRate;    // 8.085 sekunder
const endTime = (offset + duration) / sampleRate; // 8.217 sekunder
const length = duration / sampleRate;     // 0.132 sekunder
```

---

## XML-konfigurasjon

### Struktur av salsa.xml / merengue.xml

```xml
<?xml version="1.0"?>
<bm:Machine xmlns:bm="http://www.salsabeatmachine.org/xns/bm"
            xmlns:i="http://www.salsabeatmachine.org/xns/instruments">
  
  <!-- Global machine settings -->
  <bm:Instrument name="Clave" enabled="true" activeProgram="0" respectsClave="false">
    
    <!-- Program = et pattern / groove -->
    <bm:Program title="Son Clave" length="16">
      <!-- Note = en enkelt hit -->
      <!-- index = beat position (0-15 for 16-beat pattern) -->
      <!-- pitch = sample variant (0, 1, 2...) → clave-0, clave-1, etc. -->
      <!-- velocity = volume (0.0-1.0, default 1.0 hvis ikke spesifisert) -->
      <bm:Note index="2" pitch="0" />
      <bm:Note index="4" pitch="0" />
      <bm:Note index="8" pitch="0" />
      <bm:Note index="11" pitch="0" />
      <bm:Note index="14" pitch="0" />
    </bm:Program>
    
    <bm:Program title="Rumba Clave" length="16">
      <bm:Note index="2" pitch="0" />
      <bm:Note index="4" pitch="0" />
      <bm:Note index="7" pitch="0" />
      <bm:Note index="11" pitch="0" />
      <bm:Note index="14" pitch="0" />
    </bm:Program>
    
  </bm:Instrument>
  
  <!-- Flere instrumenter... -->
  
</bm:Machine>
```

### XML-attributter forklart

**`<bm:Instrument>`:**
- `name`: Instrumentnavn (må matche prefix i sample-navn)
- `enabled`: true/false (vises i UI eller ikke)
- `activeProgram`: Index til default program (0-basert)
- `respectsClave`: Påvirkes av clave-synkronisering

**`<bm:Program>`:**
- `title`: Visningsnavn i UI
- `length`: Antall beats i pattern (vanligvis 16)

**`<bm:Note>`:**
- `index`: Beat-posisjon (0-15 for 16-beat)
- `pitch`: Sample-variant (0, 1, 2...) → `{instrument}-{pitch}`
- `velocity`: Volum 0.0-1.0 (valgfri, default 1.0)

### Sample-naming mapping

Systemet bygger sample-navn automatisk:

```javascript
// Fra beat-engine.ts
const sampleName = `${instrument.name.toLowerCase()}-${note.pitch}`;

// Eksempler:
// Instrument: "Clave", pitch: 0 → "clave-0"
// Instrument: "Piano", pitch: 59 → "piano-59"
// Instrument: "Congas", pitch: 2 → "congas-2"
```

**Viktig**: Instrument-navnet i XML må matche prefixet i sample-navnet!

### Eksempel: Legge til nytt instrument

**1. Lag samples:**
```
samples/
├── shaker-0.wav   # Soft shake
├── shaker-1.wav   # Medium shake
└── shaker-2.wav   # Hard shake
```

**2. Generer sprite med audiosprite** (se Steg 4)

**3. Legg til i salsa.xml:**
```xml
<bm:Instrument name="Shaker" enabled="true" activeProgram="0">
  <bm:Program title="Steady Shake" length="16">
    <!-- Spiller shaker-0 på hver åttendedel -->
    <bm:Note index="0" pitch="0" />
    <bm:Note index="2" pitch="0" />
    <bm:Note index="4" pitch="0" />
    <bm:Note index="6" pitch="0" />
    <bm:Note index="8" pitch="0" />
    <bm:Note index="10" pitch="0" />
    <bm:Note index="12" pitch="0" />
    <bm:Note index="14" pitch="0" />
  </bm:Program>
  
  <bm:Program title="Varied Shake" length="16">
    <!-- Alternerer mellom soft (0) og hard (2) -->
    <bm:Note index="0" pitch="0" />
    <bm:Note index="2" pitch="2" />
    <bm:Note index="4" pitch="0" />
    <bm:Note index="6" pitch="2" />
    <bm:Note index="8" pitch="0" />
    <bm:Note index="10" pitch="2" />
    <bm:Note index="12" pitch="0" />
    <bm:Note index="14" pitch="2" />
  </bm:Program>
</bm:Instrument>
```

---

## Praktiske eksempler

### Eksempel 1: Lag et enkelt Cowbell-instrument

**Steg-for-steg:**

```bash
# 1. Skaff samples (enten spill inn eller last ned)
# La oss si du har: cowbell-hit.wav

# 2. Redigér i Audacity
# - Åpne cowbell-hit.wav
# - Trim stillhet
# - Normalize til -1.0 dB
# - Eksporter som: cowbell-0.wav (16-bit, 44.1kHz, mono)

# 3. Lag samples/ mappe
mkdir -p samples
mv cowbell-0.wav samples/

# 4. Generer sprite (OBS: Dette overskriver eksisterende!)
# Sikkerhetskopi først:
cp public/assets/audio/main.* backup/

# Kombiner med eksisterende samples:
# Pakk ut eksisterende samples først (valgfritt)
# Eller kjør bare audiosprite med de nye:
cd samples
audiosprite \
  --output ../public/assets/audio/main \
  --format howler \
  --export webm,mp3 \
  --samplerate 44100 \
  --channels 1 \
  *.wav

# 5. Sjekk main.json
cat public/assets/audio/main.json
# Skal inneholde: "cowbell-0": [0, XXXX, YYYY]

# 6. Oppdater salsa.xml
nano public/assets/machines/salsa.xml
```

**XML for Cowbell:**
```xml
<bm:Instrument name="Cowbell" enabled="true" activeProgram="0">
  <bm:Program title="Basic" length="16">
    <bm:Note index="0" pitch="0" />
    <bm:Note index="4" pitch="0" />
    <bm:Note index="8" pitch="0" />
    <bm:Note index="12" pitch="0" />
  </bm:Program>
</bm:Instrument>
```

**Test:**
```bash
npm run dev
# Åpne http://localhost:3000
# Aktiver Cowbell i UI
# Trykk Play
```

### Eksempel 2: Lag en melodisk bassline

**Konsept**: Bass med 12 tonehøyder (én oktav)

```bash
# 1. Skaff bass-samples (MIDI notes 48-59 = C3-B3)
# Fra sample-bibliotek eller synth

# 2. Omdøp filer:
bass-48.wav   # C3
bass-49.wav   # C#3
bass-50.wav   # D3
# ... osv til ...
bass-59.wav   # B3

# 3. Normaliser alle:
for file in bass-*.wav; do
  ffmpeg -i "$file" -af loudnorm "normalized_${file}"
done
mv normalized_*.wav .

# 4. Generer sprite
audiosprite \
  --output ../public/assets/audio/main \
  --format howler \
  --export webm,mp3 \
  --samplerate 44100 \
  --channels 1 \
  bass-*.wav

# 5. XML konfigurasjon
```

**Bass XML med melodi:**
```xml
<bm:Instrument name="Bass" enabled="true" activeProgram="0">
  <bm:Program title="Tumba" length="16">
    <!-- Spiller C3, E3, G3, C3 (4/4 tumbao pattern) -->
    <bm:Note index="0" pitch="48" />   <!-- C3 -->
    <bm:Note index="4" pitch="52" />   <!-- E3 -->
    <bm:Note index="8" pitch="55" />   <!-- G3 -->
    <bm:Note index="12" pitch="48" />  <!-- C3 -->
  </bm:Program>
  
  <bm:Program title="Walking Bass" length="16">
    <!-- Kromatisk walking bass -->
    <bm:Note index="0" pitch="48" />   <!-- C3 -->
    <bm:Note index="2" pitch="49" />   <!-- C#3 -->
    <bm:Note index="4" pitch="50" />   <!-- D3 -->
    <bm:Note index="6" pitch="51" />   <!-- D#3 -->
    <bm:Note index="8" pitch="52" />   <!-- E3 -->
    <bm:Note index="10" pitch="53" />  <!-- F3 -->
    <bm:Note index="12" pitch="54" />  <!-- F#3 -->
    <bm:Note index="14" pitch="55" />  <!-- G3 -->
  </bm:Program>
</bm:Instrument>
```

### Eksempel 3: Velocity-variasjon (ghost notes)

**Konsept**: Congas med dynamikk (høye og lave slag)

```xml
<bm:Instrument name="Congas" enabled="true" activeProgram="0">
  <bm:Program title="Tumbao with Ghost Notes" length="16">
    <!-- Accent notes (normale volume) -->
    <bm:Note index="0" pitch="0" />
    <bm:Note index="4" pitch="1" />
    <bm:Note index="8" pitch="0" />
    <bm:Note index="12" pitch="2" />
    
    <!-- Ghost notes (lav volume) -->
    <bm:Note index="2" pitch="0" velocity="0.3" />
    <bm:Note index="6" pitch="1" velocity="0.25" />
    <bm:Note index="10" pitch="0" velocity="0.35" />
    <bm:Note index="14" pitch="2" velocity="0.3" />
  </bm:Program>
</bm:Instrument>
```

**Velocity-guide:**
- `1.0`: Full volume (accent)
- `0.7-0.9`: Medium volume
- `0.3-0.5`: Ghost notes (subtile)
- `0.1-0.2`: Svært svake (bør unngås)

---

## Feilsøking og beste praksis

### Vanlige problemer

#### Problem 1: "Sample not found" i konsollen

**Symptom:**
```
Error: Sample 'newinstrument-0' not found in bank descriptor
```

**Årsak:**
- Sample-navnet i XML matcher ikke navnet i main.json

**Løsning:**
```javascript
// Sjekk main.json:
cat public/assets/audio/main.json | grep "newinstrument"

// Hvis ikke funnet, generer sprite på nytt
// Hvis funnet med annet navn, oppdater XML
```

#### Problem 2: Sprite-filen lastes ikke

**Symptom:**
```
Failed to load audio: NetworkError
```

**Årsak:**
- Feil URL-path
- CORS-problem
- Filen mangler

**Løsning:**
```bash
# Sjekk at filene eksisterer
ls -lh public/assets/audio/main.*

# Sjekk URL i browser DevTools → Network tab
# Skal være: /assets/audio/main.webm (ikke /public/...)

# Sjekk CORS headers hvis remote loading:
curl -I https://beat.salsanor.no/assets/audio/main.webm
# Skal inneholde: Access-Control-Allow-Origin: *
```

#### Problem 3: Lydkvalitet er dårlig

**Symptom:**
- Samples høres komprimert eller forvrengt ut

**Årsak:**
- For lav bitrate
- Dårlig originalkvalitet
- Overdreven normalisering

**Løsning:**
```bash
# Øk bitrate i audiosprite:
audiosprite \
  --bitrate 128 \      # Økt fra 96
  --quality 5 \        # Lavere tall = bedre kvalitet (0-9)
  --samplerate 48000 \ # Hvis kilden er 48kHz
  *.wav

# Sjekk originalkvalitet:
ffprobe input.wav
# Bør være minst 16-bit, 44.1kHz
```

#### Problem 4: Samples "kutter" eller klikker

**Symptom:**
- Hørbare klikk ved start/slutt av sample

**Årsak:**
- Manglende fade-in/fade-out
- DC offset
- Dårlig trimming

**Løsning i Audacity:**
```
1. Select sample
2. Effect → Fade In (5ms på starten)
3. Effect → Fade Out (10ms på slutten)
4. Effect → Normalize → Remove DC offset (checkbox)
5. Eksporter på nytt
```

#### Problem 5: XML-feil

**Symptom:**
```
XML Parsing Error: mismatched tag
```

**Årsak:**
- Ugyldig XML-syntaks
- Manglende lukke-tag
- Feil namespace

**Løsning:**
```bash
# Valider XML:
xmllint --noout public/assets/machines/salsa.xml

# Hvis feil, sjekk:
# - Alle <bm:Note> tags er self-closing: <bm:Note ... />
# - Alle <bm:Program> har </bm:Program>
# - Alle <bm:Instrument> har </bm:Instrument>
# - Namespace er riktig: xmlns:bm="..."
```

### Beste praksis

#### 1. Navngiving

**Gjør:**
```
✓ piano-48.wav
✓ congas-0.wav
✓ cowbell-muted.wav
✓ bass-c3.wav
```

**Ikke gjør:**
```
✗ Piano Sample 48.wav     (mellomrom)
✗ CONGAS_0.WAV            (store bokstaver)
✗ cowbell (final).wav     (spesialtegn)
✗ bass_C#3.wav            (# forårsaker problemer)
```

**Regel**: Lowercase, bindestrek, ingen mellomrom eller spesialtegn.

#### 2. Filorganisering

```
project/
├── samples/              # Original samples (WAV, høy kvalitet)
│   ├── piano/
│   │   ├── piano-48.wav
│   │   └── piano-59.wav
│   └── percussion/
│       ├── clave-0.wav
│       └── congas-0.wav
├── normalized/           # Redigerte samples (klar for sprite)
│   ├── piano-48.wav
│   └── congas-0.wav
└── public/assets/audio/  # Genererte sprites
    ├── main.webm
    ├── main.mp3
    └── main.json
```

#### 3. Version control

```bash
# .gitignore
/samples/original/        # Ikke commit store RAW-filer
*.aup                     # Audacity prosjektfiler
*.aup3
*.reapeaks                # Reaper cache
*_data/                   # Audacity data folders

# DO commit:
# - main.webm
# - main.mp3
# - main.json
# - salsa.xml / merengue.xml
```

#### 4. Backup-strategi

```bash
# Før du regenerer sprite:
mkdir -p backups/$(date +%Y%m%d)
cp public/assets/audio/main.* backups/$(date +%Y%m%d)/

# Restore hvis nødvendig:
cp backups/20260122/main.* public/assets/audio/
```

#### 5. Testing-prosedyre

**Før deploy:**
```bash
# 1. Bygg lokalt
npm run build

# 2. Test i produksjonsmodus
cd out
python3 -m http.server 8000

# 3. Åpne i browser
open http://localhost:8000

# 4. Test alle instrumenter
# - Aktiver hvert instrument
# - Test alle programmer
# - Sjekk volum og timing
# - Sjekk i konsoll for feil

# 5. Test i flere browsere
# - Chrome
# - Firefox
# - Safari
# - Edge (hvis tilgjengelig)

# 6. Test på mobil
# - iOS Safari
# - Android Chrome
```

#### 6. Ytelsesoptimalisering

**Hold filstørrelsen nede:**
```bash
# Sjekk total størrelse
du -h public/assets/audio/

# Mål: Under 1.5 MB totalt for god UX
# Hvis for stor, vurder:
# - Reduser bitrate (96 → 64 kbps)
# - Færre samples
# - Kortere samples (trim release)
# - Bare WebM (dropp MP3 hvis moderne browsers kun)
```

**Lazy loading (fremtidig forbedring):**
```javascript
// Last kun aktive instrumenter
async loadInstrument(name) {
  const url = `/assets/audio/${name}.webm`;
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await this.context.decodeAudioData(arrayBuffer);
}
```

#### 7. Dokumentasjon

**Oppretthold en samples.md fil:**
```markdown
# Samples Documentation

## Piano (piano-48 til piano-59)
- Kilde: Splice "Latin Piano" pack
- Lizens: Royalty-free
- Prosessering: Normalized to -1dB, trimmed
- Dato: 2024-01-15

## Congas (congas-0, congas-1, congas-2)
- Kilde: Egeninnspilling
- Mikrofon: Shure SM57
- Prosessering: EQ, normalisering
- Notater: congas-0 = open, congas-1 = muted, congas-2 = slap
- Dato: 2024-02-10
```

---

## Appendiks

### A. Sample rate-referanse

| Sample Rate | Beskrivelse           | Bruksområde           |
|-------------|-----------------------|-----------------------|
| 22.05 kHz   | Telefonkvalitet       | Tale (legacy)         |
| 44.1 kHz    | CD-kvalitet           | **Anbefalt for web**  |
| 48 kHz      | DVD, profesjonell    | Video, profesjonell   |
| 96 kHz      | High-resolution       | Mastering, arkiv      |

**Hvorfor 44.1 kHz?**
- Nyquist-frekvens: 22.05 kHz (over menneskelig hørsel ~20 kHz)
- Industristandard for musikk
- God balanse mellom kvalitet og filstørrelse
- Universell nettleser-støtte

### B. Bitrate-guide for Web Audio

**MP3:**
| Bitrate    | Kvalitet   | Bruk                  |
|------------|------------|-----------------------|
| 32 kbps    | Dårlig     | Ikke anbefalt         |
| 56 kbps    | Akseptabel | Backing tracks (nåværende) |
| 96 kbps    | God        | Anbefalt for samples  |
| 128 kbps   | Meget god  | Musikkstreaming       |
| 320 kbps   | Maksimal   | Overkill for web      |

**WebM (Vorbis):**
| Bitrate    | Kvalitet   | MP3-ekvivalent |
|------------|------------|----------------|
| 64 kbps    | God        | ~96 kbps MP3   |
| 96 kbps    | Meget god  | ~128 kbps MP3  |
| 128 kbps   | Utmerket   | ~192 kbps MP3  |

### C. MIDI Note Numbers

Referanse for melodiske instrumenter:

```
Oktav 2:  C2=36, C#2=37, D2=38, ..., B2=47
Oktav 3:  C3=48, C#3=49, D3=50, ..., B3=59  ← Bass-range
Oktav 4:  C4=60, C#4=61, D4=62, ..., B4=71  ← Middle C (C4)
Oktav 5:  C5=72, C#5=73, D5=74, ..., B5=83  ← Piano høy-range
```

**Eksempel**: `piano-59` = B3 (H i skandinavisk notasjon)

### D. Audio file format-sammenligning

| Format | Container | Codec     | Compression | Browser Support       |
|--------|-----------|-----------|-------------|-----------------------|
| WAV    | WAV       | PCM       | Lossless    | ✓ Universal           |
| MP3    | MP3       | MP3       | Lossy       | ✓ Universal           |
| WebM   | WebM      | Vorbis    | Lossy       | ✓ Chrome, Firefox, Edge |
| OGG    | OGG       | Vorbis    | Lossy       | ✓ Chrome, Firefox     |
| AAC    | M4A/MP4   | AAC       | Lossy       | ✓ Safari, Chrome      |

**Anbefaling**: WebM + MP3 fallback (nåværende oppsett)

### E. Nyttige ressurser

**Audio-verktøy:**
- Audiosprite: https://github.com/tonistiigi/audiosprite
- Howler.js: https://howlerjs.com/ (alternativ player)
- Web Audio API docs: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

**Sample-biblioteker:**
- Freesound: https://freesound.org/
- Splice: https://splice.com/sounds
- Loopmasters: https://loopmasters.com/
- 99sounds: https://99sounds.org/

**Programvare:**
- Audacity: https://www.audacityteam.org/
- Reaper: https://www.reaper.fm/
- ffmpeg: https://ffmpeg.org/

**Læring:**
- Web Audio API Book: https://webaudioapi.com/book/
- Salsa Rhythm Guide: (søk YouTube for "salsa clave patterns")

---

## Konklusjon

Denne guiden har dekket hele prosessen for å lage nye samples og instrumenter til SalsaNor Beat Machine:

1. **Planlegging**: Definér hvilke lyder du trenger
2. **Anskaffelse**: Spill inn, kjøp, eller last ned samples
3. **Redigering**: Trim, normaliser, og forbedre lydkvalitet
4. **Sprite-generering**: Pakk alle samples i én fil med audiosprite
5. **XML-konfigurasjon**: Definer instrumenter og patterns
6. **Testing**: Verifiser at alt fungerer i dev og prod
7. **Deploy**: Bygg og last opp til server

**Nøkkelprinsipper:**
- Alle samples ved 44.1 kHz, mono, 16-bit
- Navnekonvensjon: `instrument-pitch.wav`
- Audio sprites for effektiv web-lasting
- XML-basert konfigurasjon for fleksibilitet

Med denne kunnskapen kan du nå utvide beat machine med egne instrumenter, samples, og rytmer!

**Lykke til!** 🎵🥁🎹
