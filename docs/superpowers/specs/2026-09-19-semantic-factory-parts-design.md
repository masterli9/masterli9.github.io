# Sémantické díly výrobní linky

## Záměr

Výrobní linka nebude přesouvat náhodné geometrické symboly. Každý díl bude představovat konkrétní vizuální prvek, který lze později beze změny použít při sestavení dekorativní mini landing page vedle kontaktu.

Aktuální etapa předělá tvarovací lis a stanici barvení a kontroly. Zároveň doplní chybějící nadpis sekce Zkušenosti a certifikace. Samotná kontaktní montáž se v této etapě nepředělává; nový model dílů jí však poskytne stabilní vstup pro navazující návrh.

## Výsledná mini landing page

Budoucí výstup bude jednoduchá dekorativní produktová landing page, nikoliv funkční aplikace. Bude tvořena nejvýše pěti typy prvků:

1. značka nebo malé logo,
2. krátký hlavní nadpis,
3. jeden řádek doprovodného textu,
4. výrazné CTA tlačítko s krátkým textem,
5. abstraktní produktový vizuál nebo barevná karta.

Kompozice nebude obsahovat formulář, menu, přepínače, kurzor, statistiky ani ovládací prvky, které by naznačovaly skutečnou funkčnost. Celý výstup bude dekorativní a skrytý před asistivními technologiemi.

## Sémantický model dílu

Dosavadní kombinace `shape` a jedné `color` nestačí. Díl ponese trvalou identitu a recept, který se postupně naplňuje výrobními stanicemi.

Každý díl bude mít:

- stabilní `id` a pořadové číslo,
- sémantickou roli: `brand`, `heading`, `copy`, `cta` nebo `visual`,
- fázi výroby: surový, vytvarovaný, potištěný/nabarvený, zkontrolovaný a sestavený,
- geometrii potřebnou pro fyziku a vykreslení,
- vizuální recept obsahující výplň, barvu textu, obrys a volitelný krátký text,
- budoucí montážní pozici odvozenou ze sémantické role, nikoliv z náhodného pořadí dopadu.

Recept bude jediným zdrojem pravdy pro vzhled dílu ve výrobní lince i v budoucí mini landing page. Stanice nesmějí vytvářet náhradní pseudo-prvky, které se až při montáži zamění za něco jiného.

## Tvarovací lis

Lis bude cyklicky vyrábět pouze pět prvků potřebných pro výslednou kompozici. Po sevření čelistí se surový díl změní na rozpoznatelnou, ale zatím nenabarvenou geometrii své role:

- značka: kompaktní symbol,
- nadpis: širší blok reprezentující textovou řádku,
- doprovodný text: užší a nižší textová řádka,
- CTA: zaoblené tlačítko bez finální výplně a textu,
- vizuál: větší karta nebo abstraktní obrazový blok.

Typy `cursor`, `toggle` a `radio` se z výrobního cyklu odstraní, protože v cílové kompozici nemají využití. Rozdílné proporce budou součástí fyzikálního těla i SVG grafiky, aby se vizuál a kolize nerozcházely.

## Barvení a tisk

Současný neurčitý růžový obdélník nahradí čitelná programovatelná lakovací a tisková stanice.

Stanice bude mít dvě neutrální programovatelné hlavy napojené na společnou lištu. Širší lakovací hlava nanese výplň a obrys; užší tisková hlava doplní text nebo jednoduchou grafickou kresbu. Trysky nebudou napevno spojeny s konkrétními barvami. Před každým krokem se u aktivní hlavy zobrazí právě používaná barva a poté z ní vyjde krátký proud, kužel nebo několik kapek směrem k zachycenému dílu.

Průběh cyklu:

1. vytvarovaný díl spadne do stanice,
2. zarážka jej zachytí pod hlavou,
3. hlavy převezmou jeho vizuální recept,
4. lakovací proud se viditelně dotkne dílu a doplní výplň a obrys,
5. pokud recept obsahuje text nebo kresbu, tisková hlava ji přidá druhým krátkým krokem,
6. zarážka jej uvolní,
7. díl projde krátkou kontrolní bránou, která potvrdí dokončení jemným modrým impulsem.

Změna vzhledu nastane až při zásahu proudem, ne při vstupu do neviditelné senzorové plochy. CTA dostane zároveň výplň, barvu textu a skutečný krátký nápis. Nadpis, doprovodný text a značka mohou získat vlastní textovou či grafickou kresbu. Vizuální karta dostane jednoduchou abstraktní kompozici, ne pouze plnou barvu.

Technologie nebude omezena na tři konkrétní barvy. První sada receptů může používat černou, bílou, růžovou a modrou, aby mini landing page navazovala na portfolio, ale typy a vykreslení umožní libovolnou validní barvu receptu.

## Sekce Zkušenosti a certifikace

Sekce dostane hlavní nadpis „Zkušenosti & certifikace“ a anglickou variantu „Experience & Certifications“. Nadpis bude součástí běžné hierarchie stránky nad obsahovým gridem; stávající menší titulek certifikací zůstane pouze jako název druhého sloupce.

Textové zkušenosti a odkazy na certifikáty se obsahově nemění. Nová stanice zůstane vpravo na desktopu a pod obsahem na užších obrazovkách. Animace nesmí snižovat čitelnost ani překrývat odkazy.

## Pohyb a přístupnost

Pohyb zachová fyzikální charakter současné linky, ale každý krok musí mít jasnou příčinu a výsledek. Jeden aktivní díl se vždy dokončí před spuštěním dalšího lakovacího cyklu, aby bylo čitelné, který recept se právě používá.

Při `prefers-reduced-motion` se zobrazí statický vzorek hotových dílů. Tryska může změnit indikátor barvy, ale nepoužije proud částic ani opakovaný pohyb. Dekorativní stanice a budoucí mini landing page budou mít `aria-hidden="true"`; obsahový nadpis a odkazy zůstanou plně přístupné.

## Rozsah aktuální implementace

Aktuální etapa zahrnuje:

- nový sémantický model dílů a vizuálních receptů,
- společné vykreslení skutečných prvků,
- změnu výstupů tvarovacího lisu,
- novou programovatelnou lakovací/tiskovou stanici,
- kontrolní bránu a její stav,
- nadpis sekce v češtině i angličtině,
- odpovídající variantu pro omezený pohyb,
- aktualizaci modelových a integračních testů.

Aktuální etapa nezahrnuje:

- redesign kontaktní sekce,
- konečnou kompozici mini landing page,
- interaktivitu prvků mini landing page,
- změny textového obsahu zkušeností nebo certifikací.

Do doby redesignu kontaktu může starý assembler nové role pouze ignorovat nebo zobrazit ve své stávající zástupné podobě. Nesmí však zpětně měnit identitu nebo recept dílu.

## Ověření

Modelové testy ověří deterministickou posloupnost pěti rolí, stálost receptu při průchodu stanicemi a správné přechody výrobních fází. Testy lisu ověří, že nevyrábí nepoužité typy. Testy lakovny ověří aplikaci celého receptu včetně textu a nezávislost trysek na konkrétních barvách.

Integrační kontrola ověří, že stejný díl zůstává sémanticky totožný od výstupu lisu po opuštění kontrolní brány. Vizuální kontrola proběhne na desktopu a mobilu, včetně varianty s omezeným pohybem, a musí potvrdit, že je z animace bez vysvětlení patrné zachycení, nástřik, změna vzhledu, kontrola a uvolnění.
