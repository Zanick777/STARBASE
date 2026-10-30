# STARBASE v1 — Test Status

This file is honest about what has and hasn't been tested. **No one has run STARBASE by hand on a Windows 11 desktop yet.**
On Windows, only the automated CI build has run.

## ✅ Verified on Linux (Debian, Electron 45 under Xvfb)

| Item | How |
|------|-----|
| Unit tests: RSS/Atom parsing, HTML-entity decoding, dedupe and sort, publish-date format (`Oct 29, 2026 · 7:42 PM`), URL allow-list (`http`/`https`/`spotify` only), link sanitizing | `npm test` (Vitest) |
| Strict typecheck (renderer + main + preload) | `npm run typecheck` |
| Production build | `npm run build` |
| App launches, window renders with the intended design | Xvfb run; screenshots in `docs/` |
| News loads live from all 6 sources (6/6 online), ~80 items, with publish dates and source links rendered | Xvfb run + screenshot |
| ALL / AI filter switches the list | Scripted click + screenshot |
| Quick-links edit mode renders (add / move / edit / delete controls) | Scripted click + screenshot |
| Portable `STARBASE.exe` (x64) builds from Linux | `electron-builder --win portable --x64` |

## ✅ Verified on Windows — CI only (`windows-latest`)

| Item | How |
|------|-----|
| `npm ci`, typecheck, unit tests pass on Windows | GitHub Actions `build-windows` |
| `STARBASE-Setup.exe` (NSIS) and `STARBASE.exe` (portable) build for x64 | GitHub Actions artifacts / release assets |

CI only proves that the tests pass and the binaries build. It doesn't launch the GUI.

## ⏳ Needs manual testing on Windows 11

**Install**
- [ ] Download `STARBASE-Setup.exe` from Releases. SmartScreen shows *More info → Run anyway* and the install completes.
- [ ] The installer lets you pick a folder and creates Start Menu and desktop shortcuts, both using the STARBASE icon.
- [ ] The portable `STARBASE.exe` launches from Downloads and from the Desktop.
- [ ] The taskbar and window icon show the STARBASE logo, not the default Electron icon.

**News**
- [ ] Headlines load within ~15 s of launch, and Source Status shows 6/6 online.
- [ ] Each row shows a local-time publish date (check it matches your Windows clock and time zone).
- [ ] Clicking a title opens the article in the default browser.
- [ ] Clicking a source name opens that publication's site (for Hacker News, the HN discussion page).
- [ ] **REFRESH** works. Leave the app open for 15+ minutes and confirm the "SYNC" age resets.
- [ ] Turn Wi-Fi off and press REFRESH. You should see the OFFLINE banner, cached headlines stay, and the app doesn't crash. Turn Wi-Fi back on and refresh to recover.

**Quick links**
- [ ] Each default tile opens the right site.
- [ ] EDIT → add a tile (e.g. `news.ycombinator.com`; `https://` is added automatically). Rename one, reorder with drag and with ← →, and delete one.
- [ ] Close and relaunch STARBASE. The changes persist (`%APPDATA%\STARBASE\quicklinks.json` exists).
- [ ] Bad input (empty name, `ftp://x`) shows an error and nothing is saved.

**Spotify**
- [ ] With the Spotify desktop app installed (including the Microsoft Store version), LAUNCH SPOTIFY opens or focuses the app.
- [ ] Without Spotify installed, the button opens https://open.spotify.com in the browser. *This is the most likely edge case: Windows may show a "Get an app to open this link" dialog instead of raising an error, in which case the fallback won't fire.*

**Uninstall**
- [ ] Settings → Apps → STARBASE → Uninstall removes the app and its shortcuts. `%APPDATA%\STARBASE` is kept, as intended.

**Display**
- [ ] The layout looks right at 100%, 125% and 150% scaling and on a 1080p or larger monitor. The window can't be shrunk below 1000×640.
