# Výsledek implementace — 6. 10. 2026

## Následné opravy podle uživatelské kontroly

- Menu: stagger 25 ms, fade 120 ms, všechny odkazy/jazyk dostupné přibližně do 245 ms.
- Projekt: 40 px mezi technologiemi a odkazem; galerie má omezenou výšku, portrétní obrázky se vejdou bez ořezu. Bílá sticky lišta popsaná v původním výsledku níže byla nahrazena samostatným černým close tlačítkem s bílým rámečkem; zůstává sticky, 48 px a má safe-area odsazení.
- Lakování: mobilní výstup byl užší než hotové fyzikální části. Model nyní odvozuje průchod od nejširší části a měřené šířky stroje; SVG a collidery používají stejný výstup. Desktopové kolejnice zůstaly na 82/178.
- Nová Matter regrese původně selhala na `192px: headline jams at exit`; po opravě všechny hotové tvary projdou při 192/208/288 px se stejným ID. Živý mobilní browser propustil 18/18 sledovaných částí za 30 s, žádná nebyla zaseknutá. Ověřeno menu, obě velikosti portrétní galerie, sticky close po scrollu a odstup 40 px.
- Celkem **129/129 testů**, čistý lint, úspěšný build a diff check. Screenshoty a skript: `C:/Users/andre/.codex/visualizations/2026/10/06/01a11210-1368-7e92-9c6d-61b2fe7abe34/followup-*`.

Implementováno přímo na `feat/interface-foundry`, bez nových produkčních závislostí, commitu nebo pushnutí. Původní plán zůstal zachován. Postup: jedna implementační relace a jeden závěrečný nezávislý code review.

## Změny

- Sdílená správa menu, projektu a privacy dialogu: počáteční focus, Tab/Shift+Tab, Escape pouze pro nejvyšší dialog, inert pozadí, zachování původního scroll stylu a focusu až po exit animaci. Backdrop zůstává klikací. Menu se zavírá při přechodu na desktop.
- Projektový detail má sticky bílou lištu s kontrastním close 48 × 48 px a safe-area odsazením. Šipky mají 48 px, selektory obrázků 44 px, lokalizované názvy a `aria-current`. Zvětšeny jsou také cíle menu, loga, jazyka a footerových akcí.
- `html.lang` sleduje uložený i změněný jazyk. Kopírování v kontaktu/footeru oznamuje úspěch až po potvrzení clipboardu; chyba nabízí lokalizovaný pokyn a mailto, bez ztráty formuláře.
- Růžová na světlém `#ba104c`: 6,43 : 1 proti bílé. Modrá na tmavém `#7291ff`: 7,21 : 1 proti černé. Původní strojová paleta zůstává. Upraven také světlý text na hover pozadí projektového odkazu.
- Živý reduced-motion hook sdílí všechny animované komponenty, doplněn `MotionConfig`. Cursor follower a velké posuny se vypínají, výsledky linky zůstávají staticky dostupné. Časovače lisu/lakování pozastavují zbývající čas, při návratu pokračují. Statické části se uklidí a assembler obnoví předchozí živý stav.
- Hero fráze projdou jednou s intervalem 3500 ms a skončí na první frázi. Přístupný popis je stabilní bez live regionu; evidence časovačů neroste. Přerušení výměny normalizuje viditelnost fráze. Základní intro zůstává.
- Statement má společný trigger nadpisu s dokončením do 700 ms; odstavec se odhaluje jako celek během 350 ms po zpoždění 150 ms. Factory boundary zůstává nezávislé.
- Mobilní lis 192 × 416 px, lakování 192 × 384 px; tablet má souběžné sloupce a stanice 208 px. Kontakt má DOM i úzké vizuální pořadí intro → form → assembler, scéna nejvýše 448 × 364 px. Na tabletu je scéna zarovnaná doprava, aby zachytila skutečný proud částí. Zachovány reading surfaces 55 %, průhledný form a desktopové rozložení.
- Logo 64/128 px, PNG favicon se správným MIME; WebP náhledy 640/960/1280 se srcset/sizes, lazy loading a async decoding. Originální obrázky zůstávají v detailu. EmailJS se načte až při submitu. Odstraněno „Privacy / 01“, About copy změněno v CS/EN podle plánu.

## Ověření

- Výchozí testy: 125/125. Finální testy: 128/128; přidány behaviorální testy konečného hero cyklu, rozpočtu Statement a pozastavení/rušení station timerů. Aktualizovány čtyři původní kontrakty změněné plánem.
- `npm.cmd run lint`, `npm.cmd run build` a `git diff --check` prošly; lint bez warnings. Základ pro srovnání byl commit `ab7dda4`. Prohlížeč Chrome 154.0.8037.98.
- Browser: CS/EN menu focus/wrap/Escape/resize, project sticky close na 320/390/767/768/900/1023/1024/1440 px, správné pořadí kontaktu a rozměry, bez overflow a page errors; zamítnutý clipboard a zachovaný draft; reduce → normal i za běhu; privacy focus/Escape; překrývající se dialogy a přesné obnovení `overflow: scroll !important`; landscape a CSS zoom 200 %.
- Skutečné Matter trajektorie na 390/900/1440 px: stejná `part-0` prošla raw → formed → printed → inspected → contact capture → placement. Zmenšení tabletové scény nejprve způsobilo minutí proudu; oprava pouze zarovnáním obnovila zachycení bez změny colliderů nebo identity. Závěrečný review našel race při přerušení hero; browser reprodukce měla opacity 0, po opravě 1.
- Produkční síť před/po: na 390 px logo/favicon/GT preview přibližně **1,42 MB → 33 kB**. Na 900/1440 px přibližně 54,5 kB. Před otevřením detailu se původní PNG nestahují. Logo 64 px 3323 B, 128 px 7646 B, favicon 1409 B; WebP 27284/48878/71350 B.
- Počáteční JS gzip 194,68 kB → 194,47 kB; odložený EmailJS chunk 1,48 kB gzip. CSS gzip 10,24 → 10,60 kB. Zůstává Vite upozornění na hlavní chunk nad 500 kB; nezbytná hero fyzika nebyla odložena.
- Profil: izolovaný headless Chrome na Windows, viewport 390/900/1440 × 844, CDP CPU 4×, viditelný dokument, alespoň 32 s na každou variantu. P95 frame před/po: 16,5/16,7; 24,9/16,7; 16,7/16,8 ms. Long tasks před/po: 11/7; 11/9; 8/10. Aktivní RAF v závěru před/po: 4/3; 3/3; 3/3 (včetně jedné měřicí RAF). Srovnání je orientační, zátěž hostu nebyla zcela izolovaná a finální oprava tabletového zarovnání následovala po tomto profilu.
- Finální 60s pobyt na lakovací scéně při 4× CPU: 8–18 částí, v pozdějších vzorcích stabilně 17–18; následný kontakt měl 17. Bez neomezeného růstu; tento scénář neprokazuje celý assembler, jeho kontinuitu dokládají samostatné trajektorie.

## Rozhodnutí a limity

1. Současný feature checkout ponechán pro nejnižší režii; riziko práce bez odděleného worktree bylo omezeno čistým auditem a absencí Git mutací.
2. Physics clock nepřepsán: profil nepotvrdil viditelný nesoulad stanic a fyziky. Existující clamp může při stabilních 30 Hz zpomalovat fyziku oproti timeoutům; reálné 30Hz/low-end zařízení a případná změna clocku potřebují samostatnou trajektorii a phase důkaz. Při chybném odhadu může na pomalejším zařízení zůstat rozdílný pacing.
3. Playwright MCP měl obsazený profil; použit již instalovaný Playwright se samostatným headless Chrome, bez instalace nové závislosti a bez zásahu do cizího prohlížeče.

Safari, fyzický mobil a nativní browser zoom zůstávají neověřené. Lokální Vite preview neprokazuje produkční hostingové CSP/cache hlavičky. Žádný skutečný e-mail nebyl odeslán a výsledek není prohlášením plné WCAG shody.

Podrobné logy, browser skripty a měření: `C:/Users/andre/.codex/visualizations/2026/10/06/01a11210-1368-7e92-9c6d-61b2fe7abe34/frontend-ux-accessibility-performance/`.
