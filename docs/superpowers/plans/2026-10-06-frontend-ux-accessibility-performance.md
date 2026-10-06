# Frontend UX, accessibility and performance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax. Delegation is optional only when explicitly authorized; the plan does not require it.

**Goal:** Opravit nálezy frontend review na desktopu, tabletu a mobilu, včetně špatně viditelného zavírání projektu, a zachovat vlastní výrobní příběh.

**Architecture:** Cílené úpravy současných React komponent. Dialogy sdílejí správu focusu, scroll lock a inert pozadí; pohyb sdílí živou reduced-motion preferenci. Responsivní stanice dál používají současné registrace a měřené collidery, takže rozložení nesmí měnit identitu objektů ani nahrazovat fyziku přehráváním.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind 4, Framer Motion, Matter.js, Phosphor, Node test runner; živé ověření přes Playwright MCP. Bez plánované nové produkční závislosti.

**Spec:** Zadání uživatele z 6. 10. 2026 + [frontend review](C:/Users/andre/.codex/visualizations/2026/10/06/01a111ba-cedc-7510-9f4f-b22cc035452a/frontend-review.md); konkrétní návrhová rozhodnutí níže. Toto je objednaný plán, nikoli zahájená implementace.

## Global Constraints

- Zachovat černou/bílou a růžové/modré akcenty, logo, českou/anglickou verzi, navigaci, projekty, cookies/privacy a EmailJS kontrakt.
- Zachovat živé části výrobní linky, jejich identitu a kontinuální pohyb; žádná skrytá fronta starých příletů ani náhodné replay.
- Zachovat 55% černé lokální reading surfaces do 1023 px a průhledný kontaktní formulář. Obsah musí zůstat čitelný při pádu částí.
- Desktopový layout od 1024 px zachovat kromě opravených interakcí, kontrastů a časování textu.
- Základní hero intro, drawer 350 ms a finální umístění 640 ms ponechat pro běžný pohyb.
- Neprovádět commit/push, reset ani odstraňování nesouvisejících souborů bez výslovného zadání. Při implementaci znovu auditovat pracovní strom.
- Neodesílat skutečné testovací kontaktní zprávy. Drobné CSS/asset opravy ověřovat renderem, ne testy kopírujícími třídy.
- Před UI editací načíst Impeccable craft-floor a uplatnit design-taste-frontend/gpt-taste v mezích PRODUCT.md; nevymýšlet metriky, reference ani nový vizuální svět.

## Priority labels

Číslo vyjadřuje dopad a naléhavost, nikoli náročnost nebo pořadí implementace.

| Priorita | Význam | Postup |
|---|---|---|
| P0 | Blokuje základní úkol, např. kontakt nelze dokončit | Opravit ihned |
| P1 | Zásadní problém ovládání nebo přístupnosti | Opravit před vydáním |
| P2 | Zhoršuje pohodlí, čitelnost, rytmus nebo efektivitu; existuje cesta kolem | Opravit v této cílené úpravě |
| P3 | Drobné vizuální nebo textové doladění | Až po funkčních opravách |

V review nebylo P0. Nově ověřené neviditelné close je P1: jde o zásadní ovládání detailu, zejména na mobilu. Priority se mohou měnit podle nových důkazů.

## Review Focus

1. Klávesnice/čtečka: dialog dostane focus, Tab neopouští dialog, Escape a close vrátí focus a obnoví původní scroll lock.
2. Úzký displej a scroll detailu: close je kontrastní a stále dosažitelný při 320 px, landscape, 200% zoomu a dlouhém obsahu.
3. Změna reduced motion za běhu: pohyb a timery se správně zastaví, obsah ani část výrobního výsledku nezmizí.
4. Resize a rychlý scroll: části nadále zasahují skutečné collidery, nerozpadne se jejich předávání a reading surfaces chrání celý text.
5. Pomalejší zařízení a clipboard chyba: fyzikální čas se nerozchází s časováním stanic; chyba kopírování má srozumitelnou náhradní cestu.

## Rozhodnutí o návrhu

- **Close:** samostatná sticky horní lišta uvnitř projektového panelu, bílé pozadí, oddělující linka, černá ikona a rámeček, tlačítko 48×48 px. Lišta nesmí zakrývat obrázek a musí respektovat safe-area inset. Viditelnost nesmí záviset na hoveru ani barvě fotografie.
- **Galerie:** šipky 48×48 px, tečky uvnitř tlačítek alespoň 44×44 px, viditelný focus, `aria-current` aktivního obrázku; všechny názvy lokalizované.
- **Tablet 768–1023:** Skills/Experience text a stanice v souběžných sloupcích, stanice 12–14 rem, mezera 3 rem. Vnitřní seznamy se smí skládat, aby textový sloupec nebyl stísněný.
- **Mobil pod 768:** stanice ponechat v toku pod textem, maximální šířka 12 rem, mezera 2,5 rem; nezkracovat SVG neuniformním natažením ani neodřezávat aktivní dráhu. Lis bude při šířce 192 px vysoký přibližně 416 px, lakování 384 px.
- **Kontakt do 1023:** DOM i vizuální pořadí intro → form → assembler. Scéna maximálně 28 rem, na tabletové šířce tedy přibližně 364 px vysoká. Desktop zachová form/scénu vedle sebe.
- **Hero:** vizuální fráze po 3,5 s, pouze jeden průchod všemi položkami, poté stabilní první fráze. Mimo viewport běh pozastavit; timer/frame evidence se nesmí neomezeně hromadit. Přístupný text je jedna stabilní věta se všemi schopnostmi, bez live regionu.
- **Statement:** nadpis se zkráceným staggerem a celkovým dokončením do 700 ms; odstavec odhalit jako celek za 350 ms se zpožděním 150 ms, tedy do 500 ms od vlastního vstupu. Factory spouštění ponechat nezávislé.
- **Reduced motion:** velké posuny a cursor follower vypnout; statické výrobní výsledky zachovat. Drobné opacity odezvy nejvýše 120 ms, obsah přístupný okamžitě.
- **Barvy textu:** zvláštní tokeny pro růžovou na světlém pozadí a modrou na tmavém. Konkrétní odstíny vybrat při implementaci s výpočtem AA alespoň 4,5:1, ideálně s rezervou 5:1; barvy strojů a velkých headline zůstanou.
- **Copy:** odstranit „Privacy / 01“. Původní obecnou About headline nahradit pravdivým „Od nápadu k fungujícímu produktu.“ / „From an idea to a working product.“; Statement copy zachovat, aby se neredesignoval schválený příběh.

## Task 1: Dialogy a viditelné zavírání — P1/P2

**Files:** vytvořit `src/components/useDialogLifecycle.ts`; upravit `Header.tsx`, `ProjectModal.tsx`, `PrivacyModal.tsx`, `translations.ts`; vizuální styly ponechat lokální v těchto komponentách.

**Interface:** `useDialogLifecycle({open, dialogRef, initialFocusRef, onClose, returnFocusRef?}): void`. Refs jsou `RefObject<HTMLElement | null>`; `onClose: () => void`. Hook zachytí původní aktivní element, řídí focus a úklid. Pozadí inertovat mimo větev obsahující dialog; při úklidu obnovit přesně původní hodnoty. Překrývající se dialogy používají stack: Escape reaguje pouze v nejvyšším, scroll lock trvá do uzavření posledního.

- [ ] Reprodukovat původní chyby přes Playwright MCP: focus za překryvem, Escape v menu, Tab/Shift+Tab mimo dialog a černé close nad černou galerií. Uložit výsledek před změnou.
- [ ] Implementovat hook a připojit ke třem dialogům. Prvotní focus dát na close, pozadí udělat inert, obnovovat focus až po uzavření včetně exit animace. Backdrop nepřidávat jako redundantní klávesnicový stop.
- [ ] Přidat sticky close lištu a zvětšit ovládání galerie podle návrhu. Mobilní menu, logo link a přepínač jazyka mají hit area alespoň 44 px; zkontrolovat i footerové akce.
- [ ] Lokalizovat Open/Close menu, Previous/Next image a image selector v CS/EN.
- [ ] Ověřit browserem celý cyklus všech dialogů v CS/EN: opening → Tab/Shift+Tab → scroll → Escape/close → focus zpět. Testovat resize otevřeného menu přes 768 px; skryté mobile menu se uzavře a body nezůstane zamčené.
- [ ] Zkontrolovat close při 320/390/900/1440 px, landscape a 200% zoomu. Ikona nesplývá s žádným obrázkem, lišta neskáče, nezakrývá obsah. Galerijní cíle alespoň 44 px, close 48 px.

## Task 2: Jazyk dokumentu, kontrast a náhradní kontakt — P1/P2

**Files:** `src/i18n/LanguageContext.tsx`, `src/index.css`, `About.tsx`, `Experience.tsx`, `ContactSection.tsx`, `Footer.tsx`, `translations.ts`.

- [ ] Přes Playwright reprodukovat český text s `html.lang=en`; poté synchronizovat `document.documentElement.lang` s contextem při mountu i změně jazyka.
- [ ] Zavést kontextové barevné tokeny a použít je pro malé texty ve světlých/tmavých sekcích a dialogu. Výpočtem a computed style ověřit min. 4,5:1; barevné focus/ikony min. 3:1 proti okolí.
- [ ] Zachovat globální paletu, upravit pouze konkrétní nevyhovující kombinace včetně hoverů a dialogových kategorií.
- [ ] Kopírování emailu v Contact/Footer obalit zpracováním chyby: úspěch oznamovat až po potvrzení clipboardu. Při chybě zobrazit lokalizovaný pokyn a `mailto:` link „Otevřít e-mail“ / „Open email“. Žádná neobsloužená promise.
- [ ] Ověřit CS/EN, reload uloženého jazyka a zamítnutý clipboard přes browserovou injekci zamítnutí. Formulář nesmí přijít o vyplněný obsah.

## Task 3: Konzistentní preference omezeného pohybu — P2

**Files:** vytvořit `src/hooks/useMotionPreference.ts`; upravit `Layout.tsx` nebo `App.tsx`, `Hero.tsx`, `Statement.tsx`, `CursorFollower.tsx`, dialogy, `FactoryAct.tsx`, `HeroConveyor.tsx`, `FinalAssembler.tsx`, `index.css` podle stávajících motion subscription.

**Interface:** `useMotionPreference(): boolean`, živý `matchMedia` store přes `useSyncExternalStore`; server fallback true. Sdílet stejný subscribe/getSnapshot, místo nesourodých mount-only rozhodnutí. Framer `MotionConfig reducedMotion="user"` je pojistka, explicitní stavy/timery zůstávají odpovědností komponent.

- [ ] Reprodukovat slide při reduce a změnu preference za běhu. Implementovat sdílený hook, nejprve připojit dialogy a cursor follower, poté sjednotit výrobní/hero komponenty bez změny jejich běžné mechaniky.
- [ ] Pro reduce vypnout x/y slide, word cycling, follower a mechanický běh; zachovat statické výsledky a bezprostřední dostupnost obsahu. Nahradit plošný CSS `0.01ms` cílenými pravidly, až jsou všechny aktivní animace inventarizované.
- [ ] Při přepnutí z reduce zpět obnovit validní controller/runtime state. Static assembly snapshot nesmí blokovat pozdější živé sestavování; nenechat staré timers/listenery nebo kolidery.
- [ ] Playwright: preference před reloadem a uprostřed otevřeného panelu/hero/assembly, oběma směry. Žádný velký transform v reduce, žádné skryté texty a platný dokončený statický web.
- [ ] Rozšířit relevantní behaviorální testy v `tests/factory-flow.test.mjs` pro preference/state přechody; samotné JSX regexy neprokazují funkčnost.

## Task 4: Klidnější hero a rychle dostupný Statement — P2

**Files:** `Hero.tsx`, `heroTimeline.ts`, `Statement.tsx`, `statementReboundModel.ts`, `translations.ts`; testy `interface-foundry.test.mjs`, `factory-flow.test.mjs`.

- [ ] Přidat behaviorální test konce hero cyklu: všechny položky projdou jednou, finální index je 0, další výměna nevzniká. Interval je 3500 ms; reduced motion přepnutí ruší čekající práci.
- [ ] Implementovat konečný cyklus a stabilní přístupný popis. Zrušit opakující se aria-live; timer/frame reference po provedení uvolnit. Zachovat úvodní timing.
- [ ] Statement spouštět po celých skupinách, ne individuálně po slovech s rostoucím zpožděním od jejich samostatného vstupu. Nadpis dokončit do 700 ms, odstavec do 500 ms od svého triggeru v CS i EN. Upravit testy, které explicitně vyžadují původní reveal markup.
- [ ] Živě kontrolovat normální i rychlý scroll, přepnutí jazyka a návrat do hero. Čitelná věta nesmí čekat na fyzikální scénu, factory gate má stejné spouštění jako před změnou.

## Task 5: Kompaktní mobil/tablet a přímější kontakt — P2

**Files:** `Skills.tsx`, `Experience.tsx`, `ContactSection.tsx`, `contact.css`, `factory-line.css`; testy `interface-foundry.test.mjs`, `factory-flow.test.mjs`. Station geometry/controller soubory upravit jen při skutečně zjištěné kolizní regresi.

- [ ] Zaznamenat aktuální měřené rozměry stanic, collider vstupy/výstupy a pozice částí při průchodu každou stanicí. Zachovat srovnávací desktopový vzorek.
- [ ] Přesunout contact form před assembler v DOM, udržet desktopové grid areas. Aktualizovat stávající test `contact uses an equal desktop split and intro-assembler-form mobile order`, aby ověřoval nově dohodnutý kontrakt, ne staré pořadí.
- [ ] Nastavit rozměry/gapy stanic podle návrhu, zachovat aspect ratios. Kontaktová scéna cap 28 rem; mobile press/paint cap 12 rem. Tablet souběžné sloupce od 768 px, desktop pravidla od 1024 px.
- [ ] Přeměřit registrace colliderů po resize. Ověřit skutečný pohyb vstup → lis → lakování → contact capture → stejné ID/pose ve finálním umístění. Nedokládat návaznost pouze screenshotem hotového konce.
- [ ] Ověřit 320, 390, 767, 768, 900, 1023, 1024, 1440 px: bez overflow, bez zakrytých kontrol, čitelný text včetně Experience certifikací. Contact form následuje intro jen s deklarovaným gapem, nikoli celou scénou mezi nimi.
- [ ] Ověřit scroll pryč/zpět, přímý anchor na kontakt a reduced motion. Žádná část se nesmí zázračně vracet, mizet v kritickém předání nebo vstoupit ze staré fronty.

## Task 6: Assety a ověřený výkon — P2 + měřicí riziko

**Files:** vytvořit optimalizované soubory v `public/branding/` a `public/projects-photos/gt-series/`; upravit `Header.tsx`, `index.html`, `ProjectMedia.tsx`, `data/projects.ts` jen pokud jsou potřeba preview metadata. Pro lazy EmailJS případně `ContactForm.tsx`.

- [ ] Z původního Logo.png vytvořit transparentní velikosti 64/128 px a odpovídající favicon; hero identitu neměnit. Cíl loga <=20 kB a favicon <=10 kB; transparentní okraje nesmí logo zmenšit nebo oříznout.
- [ ] Vytvořit WebP/AVIF preview varianty 640/960/1280 px z reálného project image, nastavit srcset/sizes, lazy loading a async decoding. Původní detailové obrázky zachovat v modalu; preview aspect ratio stabilní. Cíl mobilní varianty <=150 kB, největší <=250 kB při čitelných detailech.
- [ ] Změřit síť na produkčním buildu před/po: logo a projektový preview nesmí předčasně stahovat originální PNG. Ověřit CSP/cache a správný favicon MIME.
- [ ] Profilovat bundlování; EmailJS načíst až při submitu pomocí dynamic import, se stávajícím sending/error stavem. Lazy modal/chunk splitting použít pouze pokud snižuje úvodní přenos bez prázdného prvního otevření. Nepřesouvat nezbytné hero physics do pozdního chunku pouze kvůli Vite warningu.
- [ ] Profilovat produkční průchod na 390/900/1440, 4× CPU, viditelný tab, alespoň 30 s, a dlouhý pobyt na scéně. Porovnat p95, long tasks, počet částí a aktivní RAF před/po. Testované prostředí zapsat; bez skutečného zařízení neoznačovat mobilní výkon jako definitivně ověřený.
- [ ] Ověřit riziko 30Hz: současný clamp delta zpomaluje fyziku, zatímco timeouty běží reálně. Pokud se potvrdí nesoulad nebo má být pacing stabilní napříč refresh rates, přidat `src/factory/physicsClock.ts` s `advancePhysicsClock(accumulatorMs, elapsedMs): {steps, remainderMs}`. Fixed step 1000/120 ms, catch-up nejvýše 100 ms/12 kroků, restart po visibility změně zahazuje čas skrytí. Stejný clock v FactoryAct a HeroConveyor; station phase čas odvozovat ze stejné simulation clock. Jde o samostatnou behaviorální změnu: nepřidávat automaticky kvůli domnělému škubání.
- [ ] Pokud se clock mění, nejprve behaviorální test: za 1 s na 30/60/120Hz stejný simulated elapsed v toleranci jednoho fixed stepu; phase close/release timing stejné vůči fyzice; návrat z hidden bez skoku. Následně celé trajectory QA. React render/rect read optimalizovat jen podle profilu, ne preventivním přepisem runtime.

## Task 7: Drobné copy a závěrečné ověření — P3

**Files:** `PrivacyModal.tsx`, `translations.ts`; podle změněných kontraktů existující testy.

- [ ] Odstranit samoúčelné „Privacy / 01“ a použít navrženou konkrétní About headline v CS/EN. Bez nových neověřených tvrzení.
- [ ] Spustit `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build`, `git -c safe.directory=D:/kodovani/Portfolio diff --check`. Zaznamenat skutečné výsledky a změnu bundle/asset velikostí.
- [ ] Jedna souhrnná browserová kontrola desktop/tablet/mobile: layout, dialogs/focus, kontrast, CS/EN, reduce, rychlý scroll a průchod všech stanic. Po opravě zjištěných defektů nejvýše jedna potvrzovací vizuální kontrola; bez nekonečného polishingu.
- [ ] Zkontrolovat form labely a stavy, kopírování včetně chyby, anchor offsets pod headerem a návrat z modalu bez skoku scrollu. Skutečné odeslání emailu netestovat bez samostatného zadání.
- [ ] Závěrečný report: co je opraveno, co bylo skutečně ověřeno a co vyžaduje fyzické zařízení/Safari. Žádné neověřené tvrzení o plné WCAG shodě.

## Handoff

Implementace má postupovat po uvedených krocích; first deliverable je ovladatelný projektový detail s viditelným close. Dokument je připraven k realizaci, produkční změny ještě nezačaly. Rozložení stanic a případná změna physics clock potřebují důkazy během implementace; limity clocku se nesmí použít jako záminka k plošnému zrychlení mechaniky.
