# Kontakt a finální assembler NOVA

## Záměr

Kontaktní sekce bude posledním dějstvím hlavního redesignu. Musí současně fungovat jako přesvědčivý a pohodlný kontaktní bod a jako čitelné zakončení výrobní linky: hotové sémantické díly se sestaví do malé artistické landing page NOVA a další příchozí díly se po dokončení odrazí od její horní hrany pryč.

Současné řešení se nenavrhuje jako základ k pouhému uhlazení. Třísloupcová kompozice, úzký formulář, vysoký prázdný rám a zástupné kruhy se nahradí novou kompozicí a skutečným sémantickým sestavením. EmailJS, ochranný honeypot, rate limit, lokalizace a existující stavové zprávy formuláře zůstávají funkčně zachované.

## Vizuální kompozice sekce

Sekce nebude mít horní dělící čáru. Na desktopu použije dvě rovnocenné poloviny v rámci stejného `foundry-container`:

- levá polovina obsahuje nadpis, krátký text, přímý e-mail a široký kontaktní formulář,
- pravá polovina obsahuje finální assembler a mini landing page NOVA.

Poměr je 1:1; assembler nesmí být odsunut do úzkého pomocného sloupce. Nadpis zůstane výrazný, ale nebude tvořit vysoký třířádkový blok. Text a e-mail vytvoří kompaktní úvod nad formulářem.

Formulář bude jeden plochý technický celek s vnějším rámem a vnitřními dělicími liniemi, nikoliv sada zaoblených karet. Na širších obrazovkách budou jméno a e-mail vedle sebe, předmět přes celou šířku, zpráva dostane výrazně větší plochu a submit bude pevnou spodní akcí přes celou šířku. Focus, hover, disabled, sending, success a error musí být vizuálně rozeznatelné bez změny současného odesílacího kontraktu.

Na mobilu se obsah seřadí jako úvod, assembler NOVA a formulář. Assembler tak zachytí nebo odrazí padající díly před interaktivními ovládacími prvky. Jméno, e-mail, předmět a zpráva se skládají pod sebe a žádný text ani e-mail nesmí vytvořit horizontální overflow.

## Mini landing page NOVA

Výstup je dekorativní mini landing page, ne zmenšený screenshot portfolia a ne funkční vložený web. Použije existující produktovou identitu z receptů dílů:

- značka,
- nadpis `NOVA`,
- text `Ideas in motion.`,
- CTA `Explore`,
- abstraktní vizuální karta.

Kompozice bude přibližně v poměru 16:11 a bude připomínat skutečnou jednoduchou landing page: tenká horní lišta, jasná hero hierarchie, oddělená textová a vizuální oblast a čitelná CTA. Černá, bílá, růžová a střídmá modrá navážou na zbytek portfolia. Artistický charakter vznikne asymetrickou kompozicí, přesahem několika linek a přesným pohybem dílů, nikoliv gradienty, glow efekty, stíny, sklem nebo nadbytečnou dekorací.

Miniatura bude od počátku obsahovat prázdnou konstrukci stránky, aby bylo zřejmé, kam se jednotlivé prvky skládají. Po usazení se zobrazí skutečná grafika stejného sémantického dílu; nesmí se zaměnit za kruh ani jiný zástupný symbol. Celá miniatura a její pohyb jsou dekorativní a budou skryté před asistivními technologiemi.

## Hybridní montáž

Matter.js zůstává autoritou pro pád dílu od předchozích stanic až ke vstupu assembleru. Přesné finální usazení převezme řízená SVG/Framer Motion animace, protože fyzikální constraint nedokáže spolehlivě zajistit výslednou kompozici, pořadí a rotaci.

Průběh jednoho platného zachycení:

1. zkontrolovaný díl vstoupí do senzoru těsně nad horní hranou miniatury,
2. model ověří, že jeho sémantický slot ještě není obsazený ani rezervovaný,
3. poloha, rotace a recept dílu se převedou z globálního Matter prostoru do lokálního SVG prostoru assembleru,
4. fyzikální tělo se odstraní ve stejném okamžiku, kdy se na shodné obrazovkové pozici objeví animovaná podoba stejného dílu,
5. díl se krátce srovná nad stránkou a po zakřivené trase se usadí do svého přesného slotu,
6. po dokončení pohybu se slot označí jako zaplněný a díl dostane fázi `assembled`.

V jednom okamžiku se usazuje nejvýše jeden díl. Stav se ukládá podle pěti unikátních `assemblySlot` hodnot `brand`, `heading`, `copy`, `cta` a `visual`, nikoliv podle počtu různých ID. Duplicita již obsazeného nebo právě rezervovaného slotu se nezachytí a zůstane ve fyzikálním toku.

Assembler je dokončený pouze tehdy, když obsahuje všech pět unikátních slotů. Následně zůstane hotová NOVA stránka viditelná a proběhne jeden krátký aktivační pohyb omezený na opacity, transform a stroke. Výsledek se nesmí cyklicky rozebírat ani znovu skládat.

## Horní odraz a overflow

Horní hrana miniatury bude mít fyzickou odrazovou geometrii po celou dobu. Platný dosud chybějící díl zachytí senzor dříve, než na ni dopadne; duplicita nebo libovolný díl po dokončení assembleru pokračuje k horní hraně.

Při prvním kontaktu s horní odrazovou plochou dostane tělo jeden omezený impuls vzhůru a směrem od středu miniatury. Následný pohyb znovu řídí Matter.js. Impuls nesmí být aplikován opakovaně témuž tělu, nesmí jej teleportovat a nesmí měnit jeho sémantickou identitu. Geometrie a impuls musí zajistit, že objekty opustí prostor assembleru horní nebo boční stranou, nepropadnou do hotové stránky a nepřekryjí formulář.

Odraz se stane hlavním viditelným chováním až po zaplnění všech pěti slotů. Před dokončením může stejná plocha bezpečně odmítnout pouze duplicity slotů.

## Stavový model a životní cyklus

Čistý model assembleru bude rozlišovat:

- prázdné, rezervované a zaplněné sloty,
- právě usazovaný díl,
- dokončený stav všech pěti slotů,
- množinu ID, která již obdržela overflow impuls.

Model rozhoduje, zda se díl zachytí, odmítne jako duplicita nebo odrazí po dokončení. Komponenta zajišťuje pouze převod souřadnic, Matter kolize, animaci a vykreslení.

Stav hotové miniatury musí přežít suspend/restore cyklus spodního `FactoryAct`. Zachycený Matter díl se nesmí po návratu obnovit současně s již usazenou SVG kopií. Producenti a kolizní obsluha musí respektovat `simulationActive`; skrytý dokument ani pozastavený act nesmí vytvářet nové zachycení nebo duplicitní impulsy.

Při změně velikosti se zaplněné díly přepočítají z normalizovaných slotů, nikoliv z historických pixelových souřadnic. Změna jazyka nemění dekorativní obsah NOVA ani nerestartuje montáž.

## Omezený pohyb

Při `prefers-reduced-motion: reduce` se mini landing page vykreslí rovnou kompletní se všemi pěti sémantickými díly. Neběží zachytávací přelet, aktivační sekvence ani overflow impulsy. Kontaktní sekce zůstane ve stejné 1:1 desktopové kompozici a ve stejném mobilním pořadí; omezení pohybu nesmí způsobit duplicitní statické díly v okolí assembleru.

## Přístupnost a funkční hranice

- Formulář si zachová skutečné labely, required pole, čitelné focus stavy a stavové zprávy s `role="status"` nebo `role="alert"`.
- Kopírování e-mailu zůstane ovladatelné klávesnicí a změna ikony nebude jediným potvrzením akce.
- Dekorativní assembler nebude focusovatelný a nebude vstupovat do accessibility tree.
- Hotová CTA uvnitř NOVA miniatury nebude interaktivní.
- Obsah českých a anglických kontaktních textů se v této etapě nemění.
- Hero, Statement collider, Selected Work, About, Skills a Experience zůstávají mimo rozsah změn s výjimkou nutného napojení stávajícího toku dílů na Contact.

## Ověření

Modelové testy musí prokázat:

- zachycení prvního dílu pro každý z pěti slotů,
- odmítnutí duplicitního nebo rezervovaného slotu,
- dokončení až po pěti unikátních slotech,
- idempotentní assembly a overflow události,
- nejvýše jeden overflow impuls pro jedno ID,
- stabilní normalizované pozice slotů při změně rozměrů.

Integrační testy musí ověřit zachování formulářových polí `from_name`, `reply_to`, `subject`, `message` a honeypotu `website_url`, odstranění horní dělící čáry, desktopové dvě rovnocenné poloviny, mobilní pořadí a použití skutečného `FactoryPartGraphic` nebo stejného sdíleného vykreslení uvnitř miniatury.

Browser QA proběhne v jednom desktopovém a mobilním průchodu na šířkách přibližně 1440, 390 a 320 px a samostatně s omezeným pohybem. Musí potvrdit:

- čitelnou NOVA kompozici bez zástupných kruhů,
- plynulý vizuální handoff bez skoku mezi Matter tělem a animovaným dílem,
- správné usazení všech pěti unikátních rolí,
- odraz nejméně tří dalších objektů vzhůru nebo do strany mimo assembler,
- žádné překrytí formuláře a žádný horizontální overflow,
- stabilitu po resize, změně jazyka a skoku na kotvu Contact,
- stabilitu po scrollu pryč, čekání a návratu včetně nulových duplicitních pozic.

Finální automatická kontrola zahrne celý test suite, lint, produkční build a `git diff --check`. Browserová trajektorie a lifecycle kontrola jsou součástí akceptace; zelené unit testy samy o sobě nestačí.
