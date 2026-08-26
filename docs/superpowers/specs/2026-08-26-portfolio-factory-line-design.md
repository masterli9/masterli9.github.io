# Portfolio Factory Line — návrh zbytku stránky

**Stav:** schválený návrh k uživatelské revizi dokumentu

**Datum:** 2026-08-26

**Typ práce:** redesign zbytku existující one-page portfolio stránky podle hotového hero

## 1. Záměr

Hotové hero zavádí hravou výrobní linku, která vypouští surové geometrické objekty. Zbytek stránky tuto myšlenku rozvine do jednoho srozumitelného příběhu: objekty projdou přepravou, tvarováním, barvením, kontrolou, tříděním a nakonec se složí do hotového webu.

Portfolio má stejnou měrou přesvědčit potenciální zaměstnavatele i klienty. Projekty dokazují kvalitu výsledku; stanice ukazují schopnosti, způsob práce a osobnost; závěrečná montáž vede obě skupiny ke kontaktu.

Nejde o doslovnou realistickou továrnu. Stroje jsou jednoduché, ploché a čitelné SVG mechanismy. Hravost vzniká fyzikou, načasováním a překvapivými kolizemi, ne množstvím dekorací.

Tento dokument nahrazuje původní návrh zbytku stránky v `2026-08-24-interface-foundry-design.md`. Hotové hero a navbar zůstávají vizuální autoritou.

## 2. Pevná vizuální pravidla

- Hlavní plocha je čistě černá `#000000`, text čistě bílý `#FFFFFF`.
- Typografie zůstává převážně regular; hierarchie vzniká velikostí, délkou řádku a prostorem.
- Eyebrow texty, sekční indexy, šedé podtexty a samoúčelné technické štítky budou odstraněny.
- Signal pink a cobalt blue patří hlavně objektům, senzorům a aktivním částem strojů.
- Vybrané titulky mohou zvýraznit nejvýše jedno až dvě významová slova. Pink označuje proměnu nebo akci, blue směr, kontrolu nebo schopnost.
- Layout se nebude mechanicky střídat podle šablony. Umístění textu a stroje určuje trajektorie objektů.
- Výrazné fyzikální stanice střídají klidnější čtecí pasáže.
- Stávající logo, navbar, jazykový přepínač, cursor follower a funkční interakce zůstávají zachovány.

## 3. Struktura a pořadí stránky

### 3.1 Hero — vstup materiálu

Současný pás zůstává začátkem výrobní linky. Objekty se mohou zvětšit nebo dostat upravenou sadu základních tvarů, aby byly v dalších stanicích dobře čitelné.

Dokud uživatel zůstává v hero, pás naplní box nejvýše třiceti objekty. Limit je pouze čekací režim před spuštěním celé linky.

### 3.2 Statement — odrazová platforma

Mini textová sekce pod hero zůstane samostatná. Po prvním scrollu se otevře box a nahromaděné objekty se v krátké kontrolované lavině vysypou na jednoduchou šikmou nebo pružnou platformu. Objekty se fyzikálně odrazí volným prostorem vedle textu a pokračují dolů.

Text použije stejný word-by-word reveal jako hero, ale rychlejší. Reveal se spustí jednou při vstupu do viewportu a potom zůstane stabilní. Překlady musí používat stabilní animační identity.

Po otevření boxu pás přejde do nepřetržitého režimu a dále vytváří pravidelný proud objektů.

### 3.3 Vybraná práce — časný důkaz

Selected Work zůstává brzy na stránce, protože je hlavním důkazem pro obě cílové skupiny. Náhled projektu bude obsahově a vizuálně dominantní. Výrobní proud jej nebude předstírat jako předčasný výstup linky; objekty pouze projdou vedle něj volným pádem nebo přes jednoduchou skluzavku.

Existující projektový modal, externí odkazy a další projekty zůstávají funkční. Prezentace se pročistí od eyebrow, číslování náhledu a šedých metadat, pokud nejsou informačně nutná.

### 3.4 About — bílá mezihra

About bude jedinou celoplošnou bílou sekcí a zároveň pevnou hranicí mezi dvěma fyzikálními akty.

- bílá plocha, černý text a výrazná regular typografie;
- žádná fyzika, stroje, padající objekty, eyebrow ani sekční číslo;
- nejvýše jedno barevné slovo v titulku;
- dostatek vertikálního prostoru pro skutečný čtecí klid.

Na konci první černé části objekty zmizí za pevnou hranou nebo do servisního otvoru ještě před začátkem bílé plochy. Linka se během About chápe jako vedená za stěnou. První fyzikální akt se zde může úplně ukončit.

About zůstává samostatným obsahem a navigačním cílem. Neslučuje se se Skills.

### 3.5 Skills — tvarovací lis

Nad druhým černým aktem objekty znovu vstoupí mimo viewport a padají k hlavní stanici stránky.

Průběh lisu:

1. Objekt spadne do krátké otevřené trubky.
2. Senzor zaznamená jeho příchod.
3. Zarážka objekt zachytí ve středu stroje.
4. Dva bílé obdélníky objekt z horní a dolní strany překryjí.
5. Během překrytí se jeho reprezentace změní.
6. Čelisti se odsunou a odkryjí tlačítko, kurzor, toggle, radio button nebo jiný jednoduchý UI prvek.
7. Spodní zarážka se otevře a hotový prvek propadne dál.

Lis je hlavním animovaným momentem zbytku stránky. Text Skills zůstává normální čitelný HTML obsah vedle stroje; seznamy dovedností se mohou vizuálně zjednodušit, ale obsah se neztrácí.

### 3.6 Experience — barvení a kontrola

Vytvarované prvky padají nebo sjedou pod jednoduché trysky. Některé získají signal pink, jiné cobalt blue a ostatní zůstanou bílé. Barva vyjadřuje budoucí roli prvku, nikoliv náhodnou dekoraci.

Po barvení prvky projdou krátkým senzorovým tunelem nebo kontrolní bránou. Zkušenosti a ověřitelné certifikace se zobrazí jako důkaz kvality vedle této stanice, bez technického kostýmu a bez zbytečných stavových štítků.

### 3.7 Goals — třídička tras

Hotové prvky spadnou do trychtýře a mechanická výhybka je rozdělí do tří cest odpovídajících třem cílům. Jednotlivé cíle zůstávají samostatně čitelné a nejsou redukovány jen na animaci. Cesty se před odchodem ze sekce znovu spojí do jednoho výstupu.

### 3.8 Contact — finální montáž

Vedle nebo pod kontaktním formulářem bude prázdný rám browser okna. První várka hotových prvků do něj fyzikálně dopadne a jednotlivé prvky se přichytí na předem určená místa. Postupně vznikne malá hotová webová stránka; poslední prvek vytvoří její kontaktní akci.

Browser se sestaví pouze jednou. Následující nekonečný proud objektů:

- naráží do horní nebo boční hrany rámu,
- sklouzne po něm,
- proletí za oknem nebo vedle něj,
- zmizí pod spodní hranou sekce.

Pozdější objekty nesmějí zakrývat formulář ani znovu rozebírat hotový web. Existující odesílání, stavy formuláře a kopírování e-mailu zůstávají funkční.

## 4. Pohybový jazyk

Volný pád je výchozí způsob přesunu. Další prvky se používají pouze tehdy, když mají fyzickou funkci:

- skluzavka mění směr nebo stranu layoutu;
- krátká trubka vede objekt do přesné části stroje;
- pás objekt aktivně přepravuje;
- zarážka nebo dvířka vytvářejí čekání a následné uvolnění;
- platforma odráží nebo směruje proud.

Trubky nebudou kresleny přes každou sekci. Objekty mohou padat prázdným prostorem, rotovat, narážet do hran a opustit scénu spodní hranou.

Scroll animaci přímo neovládá. Vstup do připravené oblasti spustí krátkou fyzikální sekvenci; následný proud pokračuje samostatně. Výjimkou je jednorázové otevření hero boxu při prvním opuštění hero.

## 5. Fyzikální architektura

Stránka používá dva fyzikální akty oddělené bílým About:

```text
Akt 1: Hero → Statement → Selected Work
Pevná hranice: About bez fyziky
Akt 2: Skills → Experience → Goals → Contact
```

Každý akt má jeden společný Matter.js engine a jednu společnou vykreslovací vrstvu v souřadnicích dokumentu. Sekce nejsou samostatné fyzikální světy. Jednotlivé React komponenty pouze registrují do společného aktu své statické collidery, vstupní a výstupní oblasti a vizuální stroj.

Toto řešení zajišťuje, že když jsou současně vidět dvě sousední sekce, objekt zůstává stejným fyzikálním tělesem a bez předání přejde mezi jejich collidery. Nemůže vzniknout viditelná duplikace, teleportace ani změna rychlosti na hranici sekcí.

### 5.1 Aktivní oblast a virtualizace

- Simulace udržuje aktivní oblast přibližně dvě výšky viewportu nad a pod obrazovkou.
- Stanice se připraví před vstupem do viewportu pomocí předstihu v observeru.
- Objekty daleko mimo aktivní oblast se odstraní a jejich tok se zachová jako lehký deterministický stav: pořadí, typy, barvy a cadence.
- Před další vzdálenou stanicí se proud obnoví nad viditelnou oblastí, nikdy uprostřed viewportu.
- Pokud jsou výstup a vstup současně viditelné, objekt se nerecykluje a pokračuje jako stejné těleso.
- Rychlý anchor skok připraví cílovou stanici a vstupní proud mimo horní okraj obrazovky.

Nekonečný vizuální proud tedy neznamená nekonečný počet DOM uzlů nebo Matter.js bodies. Objekty se po bezpečném opuštění aktivní oblasti recyklují.

### 5.2 Měření layoutu

Collidery vycházejí ze skutečně změřených DOM/SVG rozměrů. Změna breakpointu, velikosti viewportu nebo obsahu vyvolá řízený přepočet statické geometrie. Přepočet nesmí teleportovat právě viditelné objekty; proběhne při bezpečném resetu mimo viewport nebo zachová jejich normalizovanou pozici a rychlost.

## 6. Stav a komponentové hranice

Sdílený koordinátor uchovává pouze stav potřebný pro kontinuitu:

- `lineStarted` — hero box už byl otevřen;
- stav prvního a druhého fyzikálního aktu;
- deterministickou sekvenci objektů;
- informaci, které stanice jsou připravené nebo aktivní;
- `finalWebsiteAssembled` — finální browser je hotový;
- preference reduced motion a viditelnost stránky.

Stroje zůstávají samostatné komponenty s jedním účelem: rebound platform, forming press, paint/inspection station, goal sorter a final assembler. Textový obsah, projekty a formulář nejsou součástí fyzikálního enginu.

## 7. Responsivita a přístupnost

Na desktopu může stanice a text sdílet jeden viewport nebo se částečně překrývat v řízené kompozici. Layout nemusí střídat stejné dva sloupce.

Na mobilu:

- hlavní sdělení sekce předchází stroji;
- stanice zůstává viditelná a funkční, ale používá méně současných objektů;
- trajektorie je užší a collidery jednodušší;
- žádná animace nevytváří horizontální overflow;
- formulář a projektové ovládání zůstávají nad fyzikální vrstvou a plně ovladatelné.

Při `prefers-reduced-motion` se prostorový pohyb výrazně omezí. Každá stanice zobrazí stabilní dokončený stav a nanejvýš krátkou stavovou změnu, která vysvětluje transformaci. Obsah ani význam stanice nesmějí zmizet.

Fyzikální vrstva je dekorativní pro asistivní technologie, nepřebírá focus ani pointer události a nesmí být jediným nositelem informace.

## 8. Výkon a stabilita

- Matter.js engine neběží, když je stránka skrytá.
- Každý akt má pevný limit současně aktivních bodies odvozený od reálné hustoty viewportu.
- Offscreen objekty se recyklují; nekonečný proud nepřidává neomezené uzly.
- Vizuální vrstva používá transformace a izolované SVG skupiny, ne layoutové změny v každém frame.
- Statické collidery se nepřepočítávají v animační smyčce.
- About je skutečný teardown první simulace a čistý start druhé.
- Animace musí zůstat správná při pomalém scrollu přes hranici sekcí, rychlém wheel scrollu, anchor navigaci, změně velikosti okna a přepnutí jazyka.

## 9. Zachované funkce a hranice rozsahu

Zachovat:

- hotové hero a navbar jako výchozí vizuální autoritu;
- logo, jazyk, anchors a scrollové chování navbaru;
- cursor follower včetně normálního offsetu a hover centrování;
- projekty, jejich data, náhledy, odkazy a modal;
- obsah About, Skills, Experience a Goals, i když bude přeskupen nebo nově vysázen;
- kontaktní formulář, EmailJS, validaci, rate limit, stavy a kopírování e-mailu;
- českou i anglickou variantu.

Mimo rozsah této fáze je vymýšlení nových projektů, referencí, klientů, pracovních zkušeností nebo měřitelných výsledků.

## 10. Ověření

Implementační plán musí pokrýt automatizovanými testy alespoň:

- limit třiceti objektů před spuštěním linky;
- jednorázové otevření boxu a přechod do nepřetržitého režimu;
- deterministickou sekvenci a recyklaci objektů;
- současnou aktivitu sousedních sekcí bez předání tělesa;
- bezpečný teardown mezi prvním aktem a bílým About;
- sekvenci senzoru, zarážky, sevření, transformace a uvolnění lisu;
- přiřazení barev a průchod kontrolní stanicí;
- rozdělení a opětovné spojení tří cest Goals;
- jednorázové složení finálního browseru a chování následujících objektů;
- reduced motion, pozastavení skryté stránky a změnu jazyka;
- přepočet geometrie při změně breakpointu.

Browser QA musí společně ověřit desktop a mobil, pomalý přechod přes každou hranici, rychlý scroll, anchor skok, dlouhé běžení stránky a trajektorii objektů kolem hotového browser okna.

## 11. Akceptační kritéria

Návrh je správně implementován, pokud:

- výrobní linka působí jako jeden příběh od hero po kontakt;
- žádný viditelný přechod mezi sousedními černými sekcemi neobsahuje teleportaci, duplikaci nebo náhlou změnu rychlosti;
- trubky se objevují jen tam, kde mají mechanickou funkci;
- tvarovací lis je hlavní animovaný moment a přesně odpovídá schválené sekvenci;
- po prvním scrollu pokračuje proud bez pevného limitu, ale počet aktivních těles zůstává omezený;
- bílý About je jedinou výraznou čtecí mezihrou a skutečně odděluje oba fyzikální akty;
- Selected Work zůstává časným a dominantním důkazem;
- finální web se sestaví jednou a další objekty kolem něj fyzikálně pokračují;
- obsah je čitelný a funkční i bez animací;
- nejsou přítomné eyebrow, sekční indexy ani šedá textová hierarchie;
- mobilní verze zachová stanice a příběh bez overflow nebo výrazného propadu výkonu.
