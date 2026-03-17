## Product Requirements Document – Osobní portfolio Andreje Zdvořáka

### 1. Kontext a účel dokumentu

**Účel**: Tento dokument definuje požadavky na jednostránkové osobní portfolio (landing page) Andreje Zdvořáka. Stránka má prezentovat Andreje jako talentovaného, pracovitého a ambiciózního studenta oboru Informační technologie, který hledá příležitosti (stáže, brigády, junior pozice, spolupráce) v oblasti vývoje webových a mobilních aplikací a souvisejících IT disciplín.

**Vstupní zdroj**: Informace vycházejí primárně z dokumentu `medailon.pdf` (studentské portfolio) a dále z požadavků na vizuální styl: šedé pozadí, glowing efekty, organické tvary a již započatý design v existujícím projektu.

**Použití**:

- Pro agenty/AI asistenty, kteří mají na základě tohoto dokumentu navrhnout a implementovat frontend.
- Pro vývojáře jako zadání pro implementaci.
- Pro designéry jako rámec pro vizuální a UX návrh.

---

### 2. Cíle a metriky úspěchu

#### 2.1 Primární cíle

- **Představit Andreje jako schopného kandidáta** na stáž/brigádu/junior pozici v IT, zejména v oblasti vývoje webových a mobilních aplikací.
- **Ukázat reálné výsledky a dovednosti** prostřednictvím projektů, zkušeností a certifikací.
- **Zjednodušit kontaktování Andreje** (e-mail, LinkedIn, případně formulář).

#### 2.2 Sekundární cíle

- Podpořit Andrejovu **osobní značku** (kombinace profesionality, pracovitosti a vášně pro IT).
- Poskytnout doplňující materiál k CV / školnímu portfoliu.
- Vytvořit základ, který lze do budoucna rozšiřovat o další projekty a obsah (např. blog, case studies).

#### 2.3 Měřitelné ukazatele (orientační)

Tyto metriky nejsou vynucené, ale slouží jako vodítko pro UX:

- Návštěvník **v prvních 5 vteřinách** pochopí:
    - kdo Andrej je (student IT),
    - co dělá (vývoj web/mobil aplikací, práce s AI),
    - jaký typ příležitostí hledá (spolupráce, práce, stáž).
- Návštěvník **do 30–60 vteřin**:
    - najde sekci „Projekty“,
    - zobrazí si alespoň jeden projekt,
    - najde sekci „Kontakt“ nebo CTA pro kontaktování.
- Stránka je přehledná a použitelná na mobilu, tabletu i desktopu (responzivita).

---

### 3. Cílové publikum

#### 3.1 Primární cílové skupiny

- **HR / rekruteři / hiring manažeři** v IT firmách (junior pozice, internship, part-time).
- **Technicky orientovaní vedoucí / mentoři** (např. vedoucí projektů, učitelé, vedoucí praxí).
- **Potenciální menší klienti** pro zakázkový vývoj (např. menší web nebo jednoduchá aplikace).

#### 3.2 Sekundární cílové skupiny

- **Akademická sféra** – přijímací komise na VŠ, vyučující.
- **Spolužáci a komunita** – inspirace, reference, networking.

#### 3.3 Očekávání a potřeby uživatelů

- **Rychlé pochopení profilu** kandidáta (shrnutí v hero sekci).
- **Důkazy** (projekty, reference, certifikáty) místo prázdných frází.
- **Kontaktní informace** na pár kliknutí (jasná CTA).
- **Profesionalita** – stránka nesmí působit jako polotovar, ale jako promyšlené portfolio.

---

### 4. Tonalita, hlas a obsahová identita

#### 4.1 Tonalita

- Profesionální, ale **lidská a osobní**.
- **Sebevědomá, ale ne arogantní** – „vím, co umím, a dál se učím“.
- Odraz hodnot z medailonu:
    - pracovitost,
    - produktivita,
    - nadšení pro obor,
    - vytrvalost a schopnost nevzdávat se,
    - otevřenost a sebereflexe.

#### 4.2 Hlavní sdělení (positioning)

Stránka by měla implicitně i explicitně komunikovat:

- Andrej je **student oboru Informační technologie** se zaměřením na **vývoj softwaru**, zejména:
    - vývoj **webových aplikací**,
    - vývoj **mobilních aplikací**,
    - **využití AI** pro vývoj a zefektivnění práce.
- Má **praktické zkušenosti**:
    - odborná praxe v oblasti webového vývoje a AI,
    - brigáda ve firmě Webforte Technologies s.r.o. (web aplikace s AI),
    - osobní projekty (RehearsalHub, The GT Series).
- Má **silné zázemí v teorii i praxi**:
    - certifikace Cisco (IT Essentials, CCNAv7, CCNA),
    - školní projekty,
    - mimoškolní aktivity (např. Ataccama FrontEnd meetup).
- Má **jasné plány** do budoucna:
    - pokračovat ve studiu IT na VŠ,
    - rozvíjet se v oblastech kyberbezpečnosti, hardwaru a etického hackingu,
    - směřovat k tomu, aby byl **známým profesionálem** pracujícím na smysluplných projektech.

---

### 5. Informační architektura a struktura stránky

Stránka je koncipována jako **jednostránkový landing page** s horizontálním menu (anchor navigace). Následující sekce jsou doporučené a mohou být jemně upravené dle implementace:

1. **Header & Navigace**
2. **Hero (Úvod / první dojem)**
3. **O mně**
4. **Dovednosti**
5. **Projekty**
6. **Zkušenosti a úspěchy**
7. **Cíle a plány**
8. **Sebehodnocení**
9. **Kontakt**
10. **Footer**

#### 5.1 Header & Navigace

- **Obsah**:
    - Textové logo / wordmark: např. „Andrej Zdvořák“ nebo monogram „AZ“.
    - Navigační položky (anchor links):
        - „O mně“
        - „Dovednosti“
        - „Projekty“
        - „Zkušenosti“
        - „Cíle“
        - „Kontakt“
    - Volitelně ikony pro externí profily (LinkedIn, GitHub) – pokud budou k dispozici.

- **Funkční požadavky**:
    - **Sticky** navigace při scrollu.
    - Plynulý scroll na jednotlivé sekce.
    - Na mobilu změna na burger menu / off-canvas navigaci.

- **UX / UI specifika**:
    - Poloprůhledné pozadí headeru (glassmorphism) na tmavém/šedém backgroundu.
    - Hover efekty na položky menu (změna barvy + lehký glow).

#### 5.2 Hero sekce

- **Cíl**: Během několika vteřin vysvětlit, **kdo Andrej je**, **co dělá** a **co hledá**.

- **Textový obsah (příklad)**:
    - Hlavní nadpis (H1):
        - „Andrej Zdvořák – student IT a tvůrce webových aplikací“
    - Podnadpis:
        - „Vyvíjím webové a mobilní aplikace, které lidem zjednodušují a zefektivňují práci. Baví mě hledat chytrá řešení a využívat umělou inteligenci v praxi.“
    - Krátké taglines / bullet body:
        - „Web & mobilní vývoj“
        - „AI v praxi“
        - „Pracovitost, tah na branku, velké cíle“

- **Call To Action (CTA)**:
    - Primární CTA: „Kontaktujte mě“ (scroll do sekce Kontakt nebo `mailto:`).
    - Sekundární CTA: „Projekty“ (scroll do sekce Projekty).

- **Vizuální prvky**:
    - Možnost zobrazení portrétu / fotografie nebo abstraktního avataru (rozhodnutí na straně Andreje).
    - Glowing gradientní tvary v pozadí (za textem a/nebo za fotkou).
    - Subtilní pohyb / parallax tvarů.

- **Animace**:
    - Fade-in hero textu a CTA při načtení.
    - Jemné hover animace na tlačítkách (scale, glow).

#### 5.3 Sekce „O mně“

- **Obsahová struktura**:
    - Krátký odstavec přepsaný z medailonu:
        - Představení: jméno, studijní obor, škola (Střední průmyslová škola, Ústí nad Labem, Resslova 5; obor Informační technologie, třída 3ITB – lze zjednodušit).
        - Zájmy v IT: dlouhodobý zájem o vývoj softwaru, zejména webové stránky, mobilní aplikace, vyhledávání a tvorba řešení, která zjednodušují práci.
        - Další zájmy: hudba (klavír, kytara, poslech, produkce), čtení, sběratelství, motorsport.
    - Krátký odstavec o silných stránkách:
        - pracovitost,
        - produktivita,
        - nadšení pro to, co dělá,
        - vytrvalost,
        - schopnost mít velké cíle a jít si za nimi.

- **UX / UI specifika**:
    - Dvousloupcový layout: vlevo text, vpravo vizuál (tvar, ilustrace, fotka).
    - Silné stránky mohou být znázorněny formou „badge“ / „pill“ prvků (např. „Pracovitost“, „Vytrvalost“, „Kreativita“).

#### 5.4 Sekce „Dovednosti“

Rozdělení podle kategorií z medailonu:

- **Odborné dovednosti** (hard skills):
    - Vývoj webových aplikací a jejich následné nasazení a správa.
    - Vývoj mobilních aplikací.
    - Tvorba a správa databází.
    - Tvorba a nastavení datových sítí.
    - Využití umělé inteligence pro vývoj.

- **Měkké dovednosti** (soft skills – doporučuje se vybrat 6–8 nejdůležitějších):
    - Samostatné učení a řešení problémů.
    - Analytické myšlení.
    - Adaptabilita a flexibilita.
    - Vedení a týmová spolupráce.
    - Otevřenost a sebereflexe.
    - Pracovitost.
    - Kreativita a inovativnost.
    - Schopnost pracovat pod tlakem.

- **Jazykové znalosti**:
    - Český jazyk – C2 (rodilý mluvčí).
    - Anglický jazyk – C1 (předpokládaný).

- **Možné rozšíření**:
    - Doplňující mini-tag „úroveň“ (např. „pokročilý“, „středně pokročilý“) – dle preferencí.
    - Seznam používaných technologií / stacku (React, TypeScript, Node.js, atd.), pokud bude k dispozici.

- **UX / UI specifika**:
    - Karty dovedností (glassmorphism, glow border, hover efekty).
    - Rozdělení do sekcí / sloupců s nadpisy „Odborné“, „Soft Skills“, „Jazyky“.

#### 5.5 Sekce „Projekty“

Minimálně z medailonu:

1. **RehearsalHub**
    - Typ: Aplikace pro menší kapely (ročníkový projekt).
    - Obsah k doplnění:
        - krátký popis problému, který řeší (např. organizace zkoušek, sdílení materiálů),
        - použité technologie,
        - role Andreje v projektu.

2. **The GT Series**
    - Typ: Webová stránka s administrací pro správu a prezentaci závodní ligy ve hře Forza Horizon 5.
    - Link: `https://www.thegtseries.com` (ověřit aktuálnost odkazu).
    - Obsah k doplnění:
        - stručný popis, co web umí (např. rozpis závodů, výsledky, přehled jezdců),
        - použité technologie,
        - přínos pro uživatele (organizátory / účastníky).

- **Struktura projektové karty**:
    - Název projektu.
    - Podtitul (typ projektu – osobní, školní, komerční).
    - Krátký popis (2–4 věty).
    - Seznam klíčových technologií (tags).
    - Stručné vyzdvihnutí přínosu („co to řeší“).
    - Odkaz na web / repozitář, pokud existuje.

- **UX / UI specifika**:
    - Karty v gridu (2–3 sloupce na desktopu, 1 na mobilu).
    - Hover efekty: zvýraznění stínu, glowing border, lehké zvětšení.
    - Možnost „view more“/rozbalení detailu (volitelné).

#### 5.6 Sekce „Zkušenosti a úspěchy“

Z medailonu:

- **Brigády a praxe**:
    - Odborná praxe u podnikatele zaměřeného na webový vývoj a využití AI.
    - Brigáda ve firmě Webforte Technologies s.r.o., zaměřená na vývoj webových aplikací s AI.
    - Každý záznam by měl obsahovat:
        - období (např. rok / semestr),
        - roli (např. „Junior web developer – praxe“),
        - krátký popis konkrétních činností a zodpovědností.

- **Certifikace**:
    - IT Essentials: PC Hardware and Software.
    - CCNAv7: Introduction to Networks.
    - CCNA: Switching, Routing, and Wireless Essentials.
    - U každé certifikace:
        - poskytovatel (Cisco),
        - stručné shrnutí obsahu (např. sítě, hardware, routing).

- **Mimoškolní aktivity**:
    - Ataccama – FrontEnd Meetup (návštěva odborné akce).
    - Možnost doplnit další akce, hackathony apod., pokud se objeví.

- **UX / UI specifika**:
    - Timeline (vertikální nebo horizontální) nebo rozdělení do dvou sloupců:
        - vlevo „Zkušenosti“ (brigády, praxe),
        - vpravo „Certifikace a akce“.
    - Ikony pro odlišení typu záznamu (práce, certifikát, meetup).

#### 5.7 Sekce „Cíle a plány“

Vychází z části „Cíle a plány do budoucna“:

- **Krátkodobé cíle** (během střední a bezprostředně po ní):
    - Pokračovat v rozvoji stávajících dovedností (vývoj, AI).
    - Získávat další praktické zkušenosti (projekty, brigády).

- **Střednědobé cíle** (studium na VŠ):
    - Studium na VŠ v oboru IT (uvažované školy: Univerzita Hradec Králové, Západočeská univerzita v Plzni – lze uvést obecně).
    - Rozvoj v oblastech:
        - kyberbezpečnost,
        - práce s hardwarem,
        - etické hackování.
    - Získání práce během VŠ studie (praxe v oboru, financování vybavení).

- **Dlouhodobé cíle**:
    - Po VŠ pracovat v IT jako profesionál se silným jménem v oboru.
    - Později případně přechod k podnikání, pokud se objeví vhodný nápad.
    - Pracovat na projektech, které **pomáhají nebo zpříjemňují práci lidem**.

- **UX / UI specifika**:
    - Tři boxy / sloupce: „Krátkodobě“, „Střednědobě“, „Dlouhodobě“.
    - Ikony (např. kniha, raketa, cíl).

#### 5.8 Sekce „Sebehodnocení“

Z části „Sebehodnocení studenta“:

- **Klíčové body**:
    - Andrej vidí velký pokrok zejména v osobním rozvoji:
        - větší vášeň pro IT,
        - schopnost učit se i mimo školu,
        - posílená pracovitost a odhodlanost,
        - schopnost nevzdávat se při překážkách.
    - Uvědomuje si prostor pro zlepšení v samotných dovednostech a vědomostech.
    - Chce zlepšit kódovací schopnosti; vnímá, že dobré programátorské dovednosti jsou důležité i v éře AI a pomáhají lépe chápat chyby AI.

- **Forma zobrazení**:
    - Jeden hlavní citát ve stylu „blockquote“ (např. 1–2 věty).
    - Pod ním krátký odstavec shrnující, na čem chce pracovat dál.

#### 5.9 Sekce „Kontakt“

- **Obsah**:
    - E-mail: `andrej.zdvorak.123@gmail.com`.
    - Telefon: `+420 731 447 705` (podle rozhodnutí, zda bude veřejný).
    - Odkazy na profily:
        - LinkedIn (až bude k dispozici).
        - GitHub / další (pokud existuje).

- **Funkční požadavky**:
    - Primární CTA tlačítko „Napsat e-mail“ (`mailto:`).
    - Volitelně jednoduchý kontaktní formulář:
        - jméno,
        - e-mail,
        - krátká zpráva,
        - tlačítko „Odeslat“.
    - Případná integrace se službou pro odesílání e-mailů (např. form backend) může být doplněna později.

- **UX / UI specifika**:
    - Jasná, čistá sekce s vyšším vizuálním kontrastem (větší glow, výraznější CTA).
    - Krátká závěrečná věta typu:
        - „Pokud vás zaujal můj profil, rád se pobavím o možné spolupráci nebo stáži v IT.“

#### 5.10 Footer

- Stručný footer může obsahovat:
    - jméno (© Andrej Zdvořák, rok),
    - zkrácenou navigaci nebo odkazy na profily,
    - volitelně malou zmínku o použitých technologiích (např. „Postaveno pomocí React/Next.js“ – až bude relevantní).

---

### 6. Funkční požadavky

#### 6.1 Technická architektura (vysoká úroveň)

- **Typ aplikace**: Jednostránkový web (SPA nebo klasický statický web s anchor navigací).
- **Struktura**:
    - Jedna hlavní stránka (např. `/` nebo `/home`), bez nutnosti dalších podstránek.
    - Navigace pomocí interních anchor odkazů (IDs sekcí).

#### 6.2 Responzivita a kompatibilita

- Plně responzivní design pro:
    - mobilní telefony,
    - tablety,
    - desktop / větší monitory.
- Podpora moderních prohlížečů (Chrome, Firefox, Edge, Safari) v posledních stabilních verzích.

#### 6.3 Navigace

- Smooth scroll při kliknutí na položku v menu nebo CTA.
- Viditelný stav aktivní sekce (např. zvýrazněná položka v menu při scrollu).

#### 6.4 Výkon

- Minimalizovat zbytečné knihovny (hlavně pro animace).
- Obrázky optimalizované pro web (správné rozlišení, komprese).
- Animace nesmí způsobovat výrazné zpomalování nebo trhaný scroll.

#### 6.5 Přístupnost (A11y)

- Dostatečný kontrast textu na tmavém/šedém pozadí.
- Sémantické HTML (správné nadpisy H1–H3, landmarky).
- Ovládání přes klávesnici:
    - zaměření (focus) dobře viditelné,
    - menu a tlačítka ovladatelná tabulátorem.
- Alternativní texty pro obrázky (zejména portrét).

---

### 7. Vizuální styl a animace

#### 7.1 Barevná paleta

- **Pozadí**:
    - odstíny tmavší šedé (např. #111–#222),
    - segmentace sekcí jemnými změnami odstínu.
- **Akcentní barvy**:
    - neonové / glowing tóny (např. azurová, fialová, tyrkysová),
    - používány pro CTA, odkazy, zvýraznění klíčových prvků.
- **Text**:
    - hlavní text bílý / světle šedý,
    - sekundární text slabší šedá pro méně důležité informace.

#### 7.2 Tvary a glowing efekty

- Organické gradientní tvary v pozadí sekcí (rozmazané „blob“ tvary).
- Glow efekty:
    - kolem CTA tlačítek,
    - kolem aktivních karet (projekty, dovednosti),
    - jemné světelné přechody v pozadí.
- Konzistentní použití:
    - pozadí sekcí by mělo působit propojeně, ne náhodně poskládaně.

#### 7.3 Typografie

- Moderní bezpatkové písmo (např. Inter, Poppins, Nunito – dle implementace).
- Hierarchie:
    - H1 výrazný, velký, jednoznačně identifikující stránku,
    - H2 pro názvy sekcí,
    - H3 pro podnadpisy a názvy karet.

#### 7.4 Animace

- **On-scroll animace**:
    - fade-in, slide-up při zobrazení sekce v viewportu,
    - použít s mírou, aby stránka nepůsobila přeanimovaně.
- **Hover efekty**:
    - CTA tlačítka: zvětšení o pár procent, změna barvy, glow.
    - Karty projektů a dovedností: jemný posun / tilt, zvýraznění stínu.
- **Parallax / pohyb pozadí**:
    - lehký parallax pro glowing tvary při scrollu / pohybu myši (volitelné).

---

### 8. Jazyk, lokalizace a obsah

- **Primární jazyk**: Čeština (dle medailonu a cílového publika).
- **Budoucí rozšíření**:
    - možnost přidání anglické verze (přepínač jazyků nebo samostatná verze stránky).
    - Pokud se přidá, texty v PRD mohou být základem pro překlad.

---

### 9. Otevřené body a parametry k doplnění

Pro co nejpřesnější implementaci je vhodné v budoucnu doplnit:

1. **Sada technologií (stack)**:
    - konkrétní technologie, které Andrej používá (React, Next.js, TypeScript, Node.js, Tailwind, atd.),
    - pro zobrazení v sekci Dovednosti a Projekty.

2. **Externí profily**:
    - LinkedIn URL,
    - GitHub profil,
    - případně další (např. Dev.to, Behance, apod.).

3. **Fotografie / avatar**:
    - zda použít reálnou fotku, ilustraci, nebo zůstat u abstraktních tvarů.

4. **Další projekty**:
    - možnost rozšířit seznam projektů nad rámec RehearsalHub a The GT Series.

5. **Zobrazení telefonu**:
    - rozhodnout, zda má být telefon zobrazován veřejně nebo používat pouze e-mail/formulář.

---

### 10. Shrnutí pro implementaci

- Vytvořit **jednostránkový landing page** s anchor navigací a responsivním designem.
- Dodržet **tmavý/šedý vizuál** s glowing efekty a organickými tvary, navazující na stávající styl v projektu.
- Stránka musí přehledně prezentovat:
    - kdo Andrej je („O mně“),
    - co umí („Dovednosti“, „Zkušenosti a úspěchy“, certifikace),
    - co vytvořil („Projekty“),
    - kam směřuje („Cíle a plány“, „Sebehodnocení“),
    - jak ho kontaktovat („Kontakt“ s viditelným CTA).
- Dokument slouží jako podrobný podklad, podle kterého může agentická AI nebo vývojář navrhnout konkrétní komponenty a layout v rámci existujícího kódu (např. v `home.tsx` či jiné vstupní stránce).
