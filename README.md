# Regierungs-Quiz CH & Zug

Lernquiz, um die 7 Bundesräte, die 7 Zuger Regierungsräte und die 46 Mitglieder des Ständerats an Gesicht, Name, Partei und Ressort bzw. Kanton zu erkennen. Statische Seite ohne Build-Schritt, läuft auf GitHub Pages.

## Lokal starten

```
npx serve .
```

Direkt als Datei geöffnet (`file://`) funktioniert es nicht, weil `data.json` per `fetch` geladen wird.

## Bilder hinzufügen

1. Porträts nach `img/raw/` legen (jpg, png, webp …). Der Dateiname ist der Slug:

   ```
   br-parmelin  br-cassis  br-keller-sutter  br-roesti
   br-baume-schneider  br-jans  br-pfister
   zg-dittli  zg-hausheer  zg-thalmann-gut  zg-hostettler
   zg-weber  zg-schleiss  zg-taennler
   sr-<nachname>   (Ständerat, Slugs siehe data.json)
   ```

2. Aufbereiten (einmalig vorher `npm install`):

   ```
   npm run images
   ```

   Das schreibt `img/<slug>.webp` (480×600) und `img/manifest.json` und meldet, welche Bilder und welche Bildnachweise noch fehlen. Wird ein Kopf angeschnitten: `npm run images -- --north`. Verfehlt die Automatik bei einzelnen Bildern das Gesicht, den Ausschnitt in `scripts/crops.json` von Hand festlegen.

3. Nutzungsbedingungen der Quelle prüfen und den Bildnachweis in `data.json` eintragen (Feld `credit`, z. B. `"Foto: Bundeskanzlei"`).

4. Committen und pushen: `data.json`, `img/*.webp`, `img/manifest.json`. `img/raw/` bleibt lokal (`.gitignore`).

Ein Bild erscheint nur, wenn es im Manifest steht **und** `credit` nicht leer ist. Sonst zeigt das Quiz die Initialen in Parteifarbe. Es funktioniert auch ganz ohne oder mit nur einem Teil der Bilder; der Fragetyp «Wo ist …?» braucht mindestens 4 Bilder im jeweiligen Gremium.

## Deploy

GitHub Pages: Settings → Pages → «Deploy from a branch», Branch `main`, Ordner `/ (root)`.

## Bildquellen

- Bundesrat: offizielle Porträts der Bundeskanzlei (admin.ch).
- Zuger Regierungsrat: Porträts von zg.ch.
- Ständerat: Porträts der Parlamentsdienste (parlament.ch). Nutzung zu Informations-, Unterrichts- und Staatskundezwecken erlaubt, Quellenangabe «© ParlCH / Name der Fotografin oder des Fotografen» ([Nutzungsbedingungen](https://www.parlament.ch/de/services/mediathek/fotos-nutzungsbedingungen)). Keine kommerzielle Nutzung.

## Daten aktualisieren

Alles steht in `data.json`. Ein weiteres Gremium ist ein zusätzlicher Eintrag unter `sets`; der Tab entsteht automatisch.

- **Dezember 2026:** Bundespräsidium 2027 (Wahl durch die Bundesversammlung) → Feld `x` und `asOf` im Set `br` anpassen.
- **Januar 2027:** Direktionsverteilung des Zuger Regierungsrats 2027–2030 prüfen → `d`, `asOf` und `note` im Set `zg` anpassen.
- **Ständerat:** Mitgliederliste und Parteien stammen aus den Open Data der Parlamentsdienste (Stand 25.11.2026). Bei Rücktritten oder Parteiwechseln `data.json` nachführen.
