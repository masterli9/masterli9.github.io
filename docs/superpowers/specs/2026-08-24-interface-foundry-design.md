# Interface Foundry — nový vizuální svět portfolia

**Stav:** návrh k uživatelské revizi
**Datum:** 2026-08-24
**Typ práce:** kompletní redesign vizuální identity existující one-page portfolio stránky

## 1. Záměr

Portfolio má působit jako přesný, klidný a osobitý digitální nástroj. Jeho hlavní metaforou je malá „interface foundry“: systém, ve kterém se z několika modulů postupně skládá hotový webový interface.

Metafora nebude zobrazena jako doslovná továrna s ozubenými koly nebo jako detailní industriální ilustrace. Půjde o kompaktní SVG assembly cell, který se vrací napříč stránkou a vytváří vizuální kontinuitu.

Stránka odmítá:

- glow efekty,
- drop shadows,
- gradienty,
- glassmorphism,
- přerostlou hero typografii,
- generické pill tagy,
- grid karet jako hlavní způsob prezentace portfolia.

## 2. Produktová pravda a cíl první obrazovky

Obsah, funkce a kontaktní možnosti zůstávají zachované. Portfolio má návštěvníkovi rychle ukázat:

1. kdo Andrej je,
2. že vytváří webové a mobilní aplikace,
3. že jeho práce má konkrétní výstupy,
4. kde si může prohlédnout projekt a jak ho kontaktovat.

První viewport musí působit jako teze, ne jen jako běžný hero header: návštěvník má vidět Andreje a zároveň mechanismus, který vysvětluje jeho způsob práce.

## 3. Vizuální principy

### 3.1 Černá jako hlavní prostor

Černá nebude pouze jedna z barev, ale hlavní plocha celé zkušenosti. Sekce se nebudou mechanicky střídat po jedné; černé bloky mohou tvořit souvislé skupiny a bílé bloky budou sloužit jako čtecí úlevy.

Navržený rytmus:

```text
Hero              black
Statement         black
Selected work     black
Profile           white
Capabilities      white
Experience        white
Goals             black
Contact           black
```

### 3.2 Plochá geometrie

Komponenty používají převážně ostré rohy, ploché výplně a přesné 1px linky. Hloubka vzniká rozestupy, překrytím a zarovnáním, nikoli stíny nebo rozostřením.

### 3.3 Barva jako signál

Barva není ambientní atmosféra. Označuje aktivní modul, stav mechanismu nebo důležitý bod rozhraní. V jednom viewportu má být dominantní pouze jedna sytá barva.

## 4. Tokeny

### Barvy

```text
Ink black       #050505
Soft white      #F7F7F5
Signal pink     #F21868
Cobalt blue     #355CFF
Line gray       #777777
```

Signal pink je hlavní akcent. Cobalt blue se používá střídmě pro technické/aktivní stavy. Další akcentní barvy se nepřidávají bez konkrétního důvodu.

### Typografie

Hlavním fontem bude Instrument Sans, který je open-source pod SIL Open Font License 1.1 a lze ho bundlovat přímo v repozitáři.

Použití:

- jeden font pro headingy i body text,
- title case místo automatického uppercase,
- výrazná, ale ne obří hero typografie,
- menší utility labels bez přehnaného letter-spacing,
- užší max-width textových bloků pro klidnější rytmus čtení.

Usual nebude technickou závislostí projektu, protože lokálně není dostupný Adobe Creative Cloud.

## 5. Opakující se SVG systém

Celá vizuální identita stojí na čtyřech primitivech:

- **rail** — tenká spojovací linka,
- **module** — plochý barevný čtverec nebo kapsle,
- **frame** — obrys výsledného interface,
- **inspection square** — kontrolní čtverec, který navazuje na existující cursor-square.

### Hero assembly cell

Vpravo v hero bude kompaktní assembly cell zabírající přibližně pravou čtvrtinu až třetinu viewportu. Nebude to široká výrobní linka přes celou stránku.

Má obsahovat pouze:

- krátký rail,
- dva až tři moduly,
- jeden mechanismus pro přesun modulu,
- jednoduchý output frame s náznakem webu.

SVG bude působit jako přesný designový/technický nástroj, ne jako ilustrace továrny.

### Kontinuita

- v hero se interface skládá,
- ve Statement se objeví pouze decentní konstrukční stopa,
- v Selected work se output frame promění v reálný náhled The GT Series,
- v bílých sekcích se systém redukuje na drobné linky a body,
- v Goals se moduly objeví jako další položky ve výrobní frontě,
- v Contact se proces uzavře možností zadat nový request.

## 6. Struktura stránky

### 6.1 Hero — black

Levou část tvoří jméno v title case, krátké zařazení a dvě CTA. Pravou část tvoří kompaktní assembly cell s velkým množstvím prázdného prostoru kolem.

Stávající animace navbaru se jménem zůstává zachována. Navbar se pouze vizuálně přizpůsobí novému flat systému.

### 6.2 Statement — black

Téměř prázdná černá plocha s jednou důležitou myšlenkou a krátkým vysvětlením. Bez karet a bez další velké ilustrace. Assembly systém se zde připomene jen jednou linkou nebo jedním modulem.

### 6.3 Selected work — black

První hotový výstup bude The GT Series. Sekce nebude používat klasickou kartu ani grid.

Vizuální skladba:

```text
[ název projektu + metadata ]       [ skutečný náhled webu ]
[ krátký popis + odkaz ]             [ tenký frame / SVG body ]
```

Náhled bude působit jako výstup z assembly cell. Druhý projekt se později zobrazí jako jednodušší pracovní výstup, ne jako identická karta vedle prvního.

### 6.4 Profile / capabilities — white

Jedna čistá typografická zóna pro About a Skills. Bílá plocha, černý text, asymetrický layout a velké rozestupy. SVG systém pouze decentně: jeden rail, několik bodů nebo malý module.

### 6.5 Experience — white

Obsahová sekce s klidným textovým rytmem. Timeline může existovat jako tenká konstrukční osa, ale nesmí se stát dominantní ilustrací.

### 6.6 Goals / Contact — black

Závěrečný černý blok tvoří další výrobní fronta a následně request pro nový kontakt. Goals nepoužívají tři velké karty. Contact nepoužívá klasický panel se stínem; formulář má být jednoduchá soustava linek a polí.

## 7. Motion systém

### Assembly loop

Assembly cell běží samostatně v pomalé smyčce:

1. modul přijede,
2. zarovná se,
3. vloží se do frame,
4. output se krátce aktivuje,
5. mechanismus se zastaví,
6. cyklus se po pauze zopakuje.

Pohyb používá pouze transformace, změnu opacity a vykreslování stroke. Žádné bounce, elastic easing ani nekontrolovaný parallax.

### Existing interactions

- animace navbaru se jménem zůstává zachována,
- cursor-square zůstává zachován a funguje jako inspection marker,
- nové animace nesmí tyto dva prvky vizuálně přebít.

### Reduced motion

Při `prefers-reduced-motion` musí být obsah i assembly cell dostupné ve stabilním stavu; animace se pouze zkrátí nebo zastaví.

## 8. Responzivita

Na desktopu je hero asymetrický: text vlevo, assembly cell vpravo. Na mobilu se layout převede do jednoho sloupce:

```text
text
assembly cell
CTA
```

Assembly cell zůstává viditelný, ale používá méně modulů a menší rozsah pohybu. Nesmí být nahrazen horizontálním overflow ani schován pouze kvůli zjednodušení implementace.

## 9. Zachované části

- obsahové pravdy portfolia,
- anchor navigace,
- animace navbaru se jménem,
- cursor-square,
- existující funkce kontaktu, modalu a jazykového přepínače,
- responzivní a přístupnostní požadavky.

## 10. Mimo rozsah této designové fáze

- finální texty a copywriting,
- definitivní výběr screenshotů projektů,
- implementace SVG komponent,
- konkrétní timing jednotlivých animací,
- backend nebo změna kontaktního mechanismu,
- přidávání nových produktových funkcí.

## 11. Akceptační kritéria vizuálního směru

Návrh je považován za správně interpretovaný, pokud:

- černá vizuálně převažuje,
- první viewport má výrazný, ale kompaktní assembly cell,
- návštěvník pochopí metaforu „interface se skládá“,
- pravý motiv není široká detailní továrna,
- text není automaticky v caps locku,
- bílé sekce působí čistě a typograficky,
- nejsou použité glow efekty, stíny, gradienty ani glassmorphism,
- The GT Series se objeví jako první hotový výstup,
- SVG primitive se vracejí napříč stránkou v různém měřítku,
- navbar name-transition a cursor-square zůstanou rozpoznatelné,
- mobilní verze zachová assembly motiv bez horizontálního overflow.

## 12. Otevřené rozhodnutí pro implementaci

Před implementací ještě zbývá rozhodnout:

- přesné copy v Hero a Statement,
- finální proporci assembly cell na desktopu,
- konkrétní preview The GT Series,
- zda Contact zůstane plně černý, nebo se poslední formulář přelije do bílé plochy,
- finální timing assembly loopu.

Tato rozhodnutí nemění základní vizuální svět; pouze ho zpřesňují.
