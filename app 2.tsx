/*
  Klarschiff – der Kreuzfahrt-Planer von @wolken.wanderer
  Läuft ohne Bauwerkzeuge direkt im Browser, offline nutzbar.
*/
const { useState, useEffect, useMemo, useRef } = React;

/* =========================================================
   SYMBOLE
========================================================= */
const Svg = ({ size = 18, color = "currentColor", style, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={style} aria-hidden="true" focusable="false">{children}</svg>
);
const Check = (p) => <Svg {...p}><polyline points="20 6 9 17 4 12" /></Svg>;
const ChevronLeft = (p) => <Svg {...p}><polyline points="15 18 9 12 15 6" /></Svg>;
const ChevronRight = (p) => <Svg {...p}><polyline points="9 18 15 12 9 6" /></Svg>;
const Plus = (p) => <Svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Svg>;
const X = (p) => <Svg {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>;
const RotateCcw = (p) => (
  <Svg {...p}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></Svg>
);
const Alert = (p) => (
  <Svg {...p}><path d="M12 9v4" /><path d="M12 17h.01" />
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></Svg>
);

/* =========================================================
   DESIGNSYSTEM – Logbuch an Bord

   Der Einband ist dunkel wie eine Brücke bei Nacht, die Seiten
   sind hell wie eine Seekarte. Messing ist die einzige Zierde
   und bleibt Linien, Ziffern und der Windrose vorbehalten.
========================================================= */
const C = {
  /* Einband */
  tiefsee: "#0B2338",
  nachtblau: "#16405E",
  messing: "#C8A055",
  messingHell: "#E4CA95",
  messingLeise: "rgba(200,160,85,0.42)",

  /* Seiten */
  paper: "#E7EDEC",
  sky: "#DDE7E6",
  skySoft: "#EFF4F3",
  white: "#F5F8F7",
  sand: "#E6DFCD",
  line: "#C2D1D0",

  /* Schrift */
  navy: "#0B2338",
  body: "#33505F",
  muted: "#4E6A78",
  blue: "#16405E",

  /* Signale */
  warn: "#A63A2E",
  warnSoft: "#F1E2DC",
  green: "#2E6E5B",
  greenSoft: "#DDE9E4",

  /* Karte */
  wasser: "#DCE7E7",
  wasserLinie: "#C3D4D4",
  land: "#DFD6C0",
  landLinie: "#BCAC8A",
};

const SERIF = "'Bodoni Moda', 'Playfair Display', Georgia, serif";
const SANS = "'Questrial', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', monospace";

const RUND = 6;

const STORAGE_KEY = "klarschiff-kreuzfahrtplaner";

/* Speichert auf dem Gerät. Funktioniert in der Vorschau und als eigenständige Datei. */
const store = {
  async get(k) {
    if (typeof window !== "undefined" && window.storage) return window.storage.get(k, false);
    const v = localStorage.getItem(k);
    if (v === null) throw new Error("noch nichts gespeichert");
    return { value: v };
  },
  async set(k, v) {
    if (typeof window !== "undefined" && window.storage) return window.storage.set(k, v, false);
    localStorage.setItem(k, v);
    return true;
  },
};

/* =========================================================
   DATUMSHILFEN
========================================================= */
const WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
function alsDatum(s) {
  if (!s) return null;
  const t = s.split("-").map(Number);
  if (t.length !== 3 || !t[0]) return null;
  return new Date(t[0], t[1] - 1, t[2]);
}
function minusTage(d, n) { const x = new Date(d); x.setDate(x.getDate() - n); return x; }
function zwei(n) { return String(n).padStart(2, "0"); }
function kurz(d) { return `${WD[d.getDay()]}, ${zwei(d.getDate())}.${zwei(d.getMonth() + 1)}.`; }
function heute() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
function tageBis(d) { return Math.round((d - heute()) / 86400000); }
function euro(n) { return Math.round(n).toLocaleString("de-DE") + " €"; }

/* =========================================================
   MODUL 1 – COUNTDOWN
========================================================= */
const COUNTDOWN = [
  {
    id: "p90", tage: 90, titel: "Drei Monate vorher",
    intro: "Jetzt wird es ernst, und zwar bei genau den Punkten, die sich später nicht mehr reparieren lassen.",
    punkte: [
      { id: "pass", t: "Ausweis wirklich rausholen und das Datum lesen", d: "Nicht darauf verlassen, dass er schon passen wird, denn außerhalb der EU muss er oft noch sechs Monate nach Reiseende gültig sein." },
      { id: "einreise", t: "Einreiseregeln für jeden einzelnen Hafen prüfen", d: "Ein Hafen mit Sonderregel reicht, um euch den Landgang zu kosten." },
      { id: "versicherung", t: "Versicherung mit Rücktransport abschließen", stern: true, d: "Der Punkt, den fast alle überspringen: Standardpolicen zahlen keine Bergung von einem Schiff mitten auf See, und genau diese eine Zeile wird im Ernstfall fünfstellig." },
      { id: "arzt", t: "Arzttermin, Rezepte für die komplette Reise plus Puffer", d: "Die Bordapotheke ist kein Drogeriemarkt." },
      { id: "anreise", t: "Anreise buchen, und zwar einen Tag früher", stern: true, d: "Unsere wichtigste Regel überhaupt. Wir sehen jede Woche, was ein annullierter Flug anrichtet, und das Schiff wartet nicht, auf niemanden." },
      { id: "parken", t: "Hafenparkplatz oder Bahnfahrt sichern", d: "Beides wird kurzfristig absurd teuer." },
      { id: "ausfluege", t: "Ausflüge sichten, aber noch nicht buchen", d: "Erst vergleichen — der Landgang-Planer hilft euch dabei." },
    ],
  },
  {
    id: "p56", tage: 56, titel: "Acht Wochen vorher",
    intro: "Ab hier geht es um alles, was an Bord ausgebucht ist, wenn ihr euch zu spät kümmert.",
    punkte: [
      { id: "getraenke", t: "Getränkepaket ehrlich durchrechnen", d: "Geht von dem aus, was ihr wirklich trinkt, und nicht von dem, was ihr euch im Urlaub zutraut. Der Bordkonto-Rechner macht das für euch." },
      { id: "restaurants", t: "Spezialitätenrestaurants reservieren, sobald freigeschaltet", d: "Die guten Zeiten sind innerhalb von Tagen weg, und wer wartet, isst um halb zehn." },
      { id: "bordkonto", t: "Bordkonto einrichten und Karte hinterlegen" },
      { id: "hotel", t: "Hotel für die Nacht vor der Abfahrt buchen" },
      { id: "kinder", t: "Kinderbetreuung anmelden und Altersgrenze prüfen", wenn: (s) => s.kind, d: "Die Altersgrenze unterscheidet sich je nach Reederei deutlich." },
      { id: "sonder", t: "Sonderwünsche melden: Allergien, Kinderbett, Kühlschrank für Medikamente", d: "Heute ist das eine Buchung, an Bord ist es nur noch eine Bitte." },
    ],
  },
  {
    id: "p28", tage: 28, titel: "Vier Wochen vorher",
    intro: "Der Feinschliff, bei dem die kleinen Dinge über den Stresspegel entscheiden.",
    punkte: [
      { id: "landgang", t: "Landgänge planen und die Bordzeit notieren", stern: true, d: "Nicht die Abfahrtszeit, sondern die Bordzeit, die meistens 30 bis 60 Minuten davor liegt, denn wer das verwechselt, steht am Kai und winkt." },
      { id: "steckdosen", t: "Steckdosen an Bord prüfen", d: "Auf vielen Schiffen hängen EU- und US-Dosen nebeneinander." },
      { id: "kleiderordnung", t: "Kleiderordnung und Gala-Abende klären", d: "Damit das gute Hemd nicht zu Hause bleibt." },
      { id: "trinkgeld", t: "Trinkgeld-Regelung nachlesen", d: "Läuft meist automatisch übers Bordkonto und ist je nach Reederei schon im Preis." },
      { id: "bargeld", t: "Bargeld für die Häfen zurechtlegen" },
    ],
  },
  {
    id: "p14", tage: 14, titel: "Zwei Wochen vorher",
    intro: "Jetzt kommt der teuerste Fehler dieser ganzen Liste — und der ist in zehn Sekunden erledigt.",
    punkte: [
      { id: "packen", t: "Packliste starten", d: "Der Packlisten-Generator baut sie euch passend zu Route, Saison und Familiengröße." },
      { id: "apotheke", t: "Reiseapotheke samt Mittel gegen Seekrankheit einpacken", d: "Auch wenn ihr denkt, ihr braucht es nicht." },
      { id: "waage", t: "Kofferwaage rausholen", wenn: (s) => s.anreise === "flug", d: "Bei Fly & Cruise Pflicht, und bei uns ohnehin Job-Reflex." },
      { id: "roaming", t: "Roaming am Handy komplett ausschalten", stern: true, d: "Der teuerste Fehler auf dieser Liste: Auf See läuft Satellitennetz, und wer das vergisst, finanziert es später mit einer dreistelligen Rechnung." },
      { id: "zuhause", t: "Post, Pflanzen und Nachbarn regeln" },
    ],
  },
  {
    id: "p3", tage: 3, titel: "Drei Tage vorher",
    intro: "Kurz vor knapp, aber entspannt, weil der Rest schon steht.",
    punkte: [
      { id: "checkin", t: "Online-Check-in machen und Bordkarte sichern" },
      { id: "kofferfoto", t: "Koffer fotografieren und Gepäckanhänger befestigen", d: "Der Anhänger hilft im Problemfall oft mehr als der Koffer selbst." },
      { id: "cloud", t: "Dokumente in die Cloud legen", d: "Und die wichtigsten Zahlen zusätzlich ins Notfallfach hier in der App, weil das offline funktioniert." },
      { id: "karten", t: "Offline-Karten für alle Häfen laden", d: "An Bord kostet WLAN, an Land habt ihr oft keins." },
      { id: "wetter", t: "Einen Blick aufs Wetter werfen" },
    ],
  },
  {
    id: "p0", tage: 0, titel: "Einschiffungstag",
    intro: "Der Tag, an dem sich entscheidet, ob eure Reise entspannt startet oder ob ihr zwei Tage hinterherlauft.",
    punkte: [
      { id: "viertasche", t: "Die Vier-Stunden-Tasche packen", stern: true, d: "Der wichtigste Punkt überhaupt: Euer Koffer steht oft erst am späten Nachmittag vor der Kabine, weshalb Badesachen, Medikamente, Wechselsachen, Ladekabel und Dokumente ins Handgepäck gehören — sonst steht ihr im Reiseoutfit am Pool und schaut zu." },
      { id: "frueh", t: "Frühe Einschiffungszeit nehmen", d: "Mehr Schiff, weniger Schlange." },
      { id: "sofort", t: "An Bord sofort Restaurants, WLAN und Kabine erledigen", d: "Die genaue Reihenfolge steht im Modul „Der erste Tag an Bord“." },
      { id: "seenot", t: "Seenotübung mitmachen und wirklich zuhören", d: "Das ist der eine Programmpunkt an Bord, der kein Programm ist." },
      { id: "flugmodus", t: "Handy auf Flugmodus, dann ins Schiffs-WLAN" },
    ],
  },
];

/* =========================================================
   MODUL 3 – PACKLISTE
========================================================= */
const PACK = [
  {
    id: "dok", titel: "Dokumente und Geld",
    punkte: [
      { id: "ausweis", t: "Ausweis oder Reisepass" },
      { id: "bordkarte", t: "Bordkarte oder Buchungsnummer" },
      { id: "versicherung", t: "Versicherungsunterlagen samt Notrufnummer" },
      { id: "impf", t: "Impfnachweise, falls für die Route nötig" },
      { id: "karte", t: "Kreditkarte fürs Bordkonto" },
      { id: "bargeld", t: "Bargeld in Hafenwährung" },
      { id: "kopien", t: "Alles zusätzlich digital in der Cloud" },
    ],
  },
  {
    id: "kabine", titel: "Die Kabinen-Gamechanger",
    hinweis: "Hier vergisst wirklich fast jeder etwas, und genau diese sechs Kleinigkeiten machen den größten Unterschied.",
    punkte: [
      { id: "haken", t: "Magnetische Haken", stern: true, d: "Kabinenwände sind aus Stahl, und vier Haken verwandeln eine enge Kabine in einen ordentlichen Raum." },
      { id: "nachtlicht", t: "Kleines Nachtlicht", d: "Innenkabinen sind absolut dunkel, und der Gang zur Toilette endet sonst damit, dass das große Licht angeht und alle wach sind." },
      { id: "leine", t: "Wäscheleine mit Klammern", d: "Bad und Balkon trocknen nichts." },
      { id: "usb", t: "USB-Ladewürfel", d: "Steckdosen sind knapp, aber Mehrfachsteckdosen mit Überspannungsschutz werden bei vielen Reedereien einbehalten — schaut vorher in die Liste eurer Reederei." },
      { id: "tuer", t: "Etwas Auffälliges für die Kabinentür", d: "Ein Magnet oder ein Band reicht, denn auf Deck 9 sehen 300 Türen identisch aus und mit müden Beinen sucht ihr wirklich." },
      { id: "organizer", t: "Türhänger-Organizer fürs Bad", d: "Die Ablage dort reicht für eine Zahnbürste, nicht für zwei Menschen." },
    ],
  },
  {
    id: "gesund", titel: "Bad und Gesundheit",
    punkte: [
      { id: "medis", t: "Eigene Medikamente in Originalverpackung, ganze Reise plus Puffer" },
      { id: "seekrank", t: "Mittel gegen Seekrankheit" },
      { id: "pflaster", t: "Pflaster und Kleinkram" },
      { id: "sonne", t: "Sonnenschutz mit hohem Faktor", d: "An Bord ist der teuer." },
      { id: "aftersun", t: "After Sun" },
      { id: "desi", t: "Desinfektionsgel", d: "Wird euch an Bord ohnehin überall hingehalten, und zwar aus gutem Grund." },
    ],
  },
  {
    id: "kleidung", titel: "Kleidung",
    punkte: [
      { id: "warm", t: "Eine warme Schicht, auch in der Karibik", stern: true, d: "Das Schiff wird innen konsequent heruntergekühlt, und an Deck zieht es abends immer." },
      { id: "schuhe", t: "Rutschfeste Schuhe", d: "Nasse Decks sind glatt." },
      { id: "bade", t: "Badesachen doppelt", d: "Damit nie beides gleichzeitig nass ist." },
      { id: "gala", t: "Ein Gala-Outfit, das sich zweimal tragen lässt", wenn: (f) => f.gala },
      { id: "regen", t: "Regenjacke und Mütze", wenn: (f) => f.route === "nord" },
      { id: "warmschicht2", t: "Richtig warme Schicht für Deck und Landgänge", wenn: (f) => f.route === "nord" || f.saison === "winter" },
    ],
  },
  {
    id: "technik", titel: "Technik",
    punkte: [
      { id: "powerbank", t: "Powerbank" },
      { id: "kabel", t: "Ladekabel doppelt" },
      { id: "kopfhoerer", t: "Kopfhörer" },
      { id: "offline", t: "Karten, Musik und Serien offline geladen", d: "An Bord kostet WLAN, und ihr wollt es nicht für Netflix ausgeben." },
      { id: "huelle", t: "Wasserdichte Handyhülle für Landgänge" },
    ],
  },
  {
    id: "landgang", titel: "Für die Landgänge",
    punkte: [
      { id: "rucksack", t: "Kleiner Rucksack" },
      { id: "flasche", t: "Trinkflasche zum Auffüllen an Bord" },
      { id: "snack", t: "Snack für unterwegs" },
      { id: "kopie", t: "Kopie der Bordkarte" },
    ],
  },
  {
    id: "kind", titel: "Mit Kind", wenn: (f) => f.kind,
    punkte: [
      { id: "tuersicherung", t: "Türsicherung für den Balkon", stern: true },
      { id: "kindnachtlicht", t: "Nachtlicht" },
      { id: "bettzeug", t: "Vertraute Bettwäsche oder Schlafsack" },
      { id: "kindsnacks", t: "Snacks für den Einschiffungstag" },
      { id: "fieber", t: "Fieberthermometer und Fiebersaft" },
      { id: "wechsel", t: "Doppelte Wechselsachen in die Vier-Stunden-Tasche" },
      { id: "buggy", t: "Buggy, den ihr auch einhändig faltet" },
    ],
  },
  {
    id: "flug", titel: "Fly & Cruise", wenn: (f) => f.anreise === "flug",
    punkte: [
      { id: "waage", t: "Kofferwaage" },
      { id: "handgepaeck", t: "Handgepäckgrenzen der Airline geprüft" },
      { id: "fluessig", t: "Flüssigkeiten unter 100 ml im Handgepäck" },
    ],
  },
];

const NICHT_MIT = [
  "Bügeleisen und Wasserkocher, weil beides an Bord verboten ist und einbehalten wird",
  "Handtücher, die es überall gibt, auch fürs Pooldeck",
  "Die dritte Handtasche, versprochen",
];

/* =========================================================
   MODUL 6 – ERSTER TAG
========================================================= */
const TAG1 = [
  {
    id: "terminal", titel: "Vor dem Terminal",
    punkte: [
      { id: "frueh", t: "Frühe Einschiffungszeit gewählt", d: "Früh an Bord heißt volles Mittagessen, leerer Pool und Zeit, das Schiff kennenzulernen, bevor es voll wird." },
      { id: "tasche", t: "Vier-Stunden-Tasche griffbereit", stern: true, d: "Badesachen, Medikamente, ein Wechselshirt, Ladekabel und Dokumente bleiben bei euch, weil der Koffer oft erst am späten Nachmittag kommt." },
    ],
  },
  {
    id: "stunde", titel: "Die erste Stunde, in dieser Reihenfolge",
    hinweis: "Fast alle machen es andersherum, stehen dann am Buffet Schlange und finden abends nur noch Tische um halb zehn.",
    punkte: [
      { id: "reservieren", t: "1. Spezialitätenrestaurants und Shows reservieren", stern: true, d: "Die guten Zeiten sind innerhalb der ersten Stunden vergeben." },
      { id: "wlan", t: "2. WLAN-Paket buchen, falls ihr eins wollt" },
      { id: "essen", t: "3. Erst danach essen gehen" },
    ],
  },
  {
    id: "kabinecheck", titel: "Sobald die Kabine offen ist",
    hinweis: "Am ersten Tag wird das in Minuten geregelt, während dieselbe Bitte am dritten Tag plötzlich zwei Tage dauert.",
    punkte: [
      { id: "betten", t: "Stehen die Betten so, wie ihr sie gebucht habt?" },
      { id: "handtuecher", t: "Genug Handtücher und Kissen da?" },
      { id: "technik", t: "Klimaanlage, Safe und Föhn funktionieren?" },
      { id: "kuehl", t: "Kühlschrank für Medikamente angefragt, falls nötig" },
    ],
  },
  {
    id: "pflicht", titel: "Pflichtprogramm",
    punkte: [
      { id: "seenot", t: "Seenotübung mitgemacht und zugehört", stern: true, d: "Wir machen dieselbe Ansage jeden Tag in der Luft und sehen dabei jeden Tag dieselben gesenkten Köpfe. Dabei ist das der Grund, warum am Ende alle wieder von Bord gehen." },
    ],
  },
  {
    id: "rest", titel: "Der Rest des Tages",
    punkte: [
      { id: "ablaufen", t: "Schiff einmal komplett ablaufen, von ganz oben bis ganz unten", d: "Damit ihr nicht drei Tage lang sucht." },
      { id: "flugmodus", t: "Handy auf Flugmodus, nur Schiffs-WLAN" },
      { id: "programm", t: "Abends das Tagesprogramm lesen", d: "Dort steht, was am nächsten Tag ausgebucht sein wird." },
    ],
  },
];

/* =========================================================
   NOTFALLPLÄNE
========================================================= */
const NOTFALL = [
  {
    id: "verpasst", titel: "Wenn ihr das Schiff verpasst",
    text: "Geht sofort zur Hafenagentur der Reederei und meldet euch nicht erst bei Freunden, und nehmt Pass sowie Kreditkarte mit, denn ohne beides geht gar nichts. Die Agentur organisiert die Weiterreise zum nächsten Hafen, auf eure Kosten zwar, aber deutlich schneller, als ihr das selbst könntet.",
  },
  {
    id: "krank", titel: "Wenn jemand krank wird",
    text: "Geht zum Bordarzt, wisst aber, dass die Behandlung privat abgerechnet wird und ihr die Rechnung später bei der Versicherung einreicht, weshalb ihr alle Belege behaltet.",
  },
  {
    id: "ausweis", titel: "Wenn ein Ausweis weg ist",
    text: "Ihr braucht die digitale Kopie, die deshalb vorher in die Cloud gehört, und ihr wendet euch an die Rezeption, die den Kontakt zum Konsulat herstellt.",
  },
  {
    id: "gepaeck", titel: "Wenn das Gepäck nicht ankommt",
    text: "Meldet es sofort und nicht am nächsten Tag, und zeigt das Foto vom Koffer samt Gepäckanhänger, weil das oft mehr hilft als jede Beschreibung.",
  },
];

/* =========================================================
   MODULÜBERSICHT
========================================================= */
const MODULE = [
  { id: 1, titel: "Der Countdown", teaser: "Von drei Monaten vorher bis zum Einschiffungstag, ohne dass ihr euch etwas merken müsst." },
  { id: 2, titel: "Der Kabinen-Check", teaser: "Was euch in eurer gebuchten Kabine erwartet — und was ihr jetzt noch erledigen könnt." },
  { id: 3, titel: "Die Packliste", teaser: "Passt sich eurer Route und Familiengröße an, samt der Dinge, die fast alle vergessen." },
  { id: 4, titel: "Der Bordkonto-Rechner", teaser: "Was an Bord noch dazukommt, bevor es euch die Endabrechnung sagt." },
  { id: 5, titel: "Der Landgang-Planer", teaser: "Wie viel Zeit ihr wirklich habt, und wann ihr die Reederei nehmen solltet." },
  { id: 6, titel: "Der erste Tag an Bord", teaser: "Die Reihenfolge, die über entspannt oder hinterherlaufen entscheidet." },
  { id: 7, titel: "Dokumente und Notfall", teaser: "Alle wichtigen Zahlen offline griffbereit, weil offline an Bord der Normalzustand ist." },
  { id: 8, titel: "Das Fahrtenbuch", teaser: "Jede gefahrene Reise, jeder Hafen, jede Notiz — und was sich über die Jahre summiert." },
];

/* =========================================================
   LEERER STAND
========================================================= */
const LEER = {
  setup: {
    reederei: "", schiff: "", route: "", abfahrt: "", naechte: "7",
    personen: "2", kind: false, anreise: "", saison: "", gala: false, reisepreis: "",
  },
  haken: {},
  kabine: { art: "", laengs: "", deck: "", seekrank: "", kind: "", nummer: "" },
  packExtra: [],
  bord: {
    inklusive: [], getraenke: "", paket: "", ausfluege: "", wlan: "", trinkgeld: "",
    spezial: "", spa: "", fotos: "",
  },
  haefen: [],
  archiv: [],
  doks: {
    buchung: "", kabinennr: "", versicherung: "", notruf: "", ausweise: "",
    medikamente: "", blutgruppe: "", kontakt: "", agentur: "",
  },
};

/* =========================================================
   BAUSTEINE
========================================================= */
function Kicker({ children, color, hell }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
      <span aria-hidden="true" style={{ width: 20, height: 1, background: C.messing, flexShrink: 0 }} />
      <span style={{
        fontFamily: MONO, fontSize: 10.5, letterSpacing: 2.4, fontWeight: 500,
        textTransform: "uppercase", color: color || (hell ? C.messingHell : C.muted),
      }}>{children}</span>
    </div>
  );
}

function H2({ children, style }) {
  return (
    <h2 style={{
      fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(29px, 7vw, 42px)",
      lineHeight: 1.12, letterSpacing: "-0.01em", color: C.navy, margin: 0, ...style,
    }}>{children}</h2>
  );
}

function H3({ children, style }) {
  return (
    <h3 style={{
      fontFamily: SERIF, fontWeight: 500, fontSize: 23, lineHeight: 1.28,
      color: C.navy, margin: "0 0 14px", ...style,
    }}>{children}</h3>
  );
}

function P({ children, style }) {
  return (
    <p style={{
      fontFamily: SANS, fontSize: 15.5, lineHeight: 1.72,
      color: C.body, margin: "0 0 16px", ...style,
    }}>{children}</p>
  );
}

function Card({ children, tone, style }) {
  const bg = tone === "white" ? C.white : tone === "warn" ? C.warnSoft
    : tone === "green" ? C.greenSoft : tone === "sand" ? C.sand : C.sky;
  return (
    <section style={{
      background: bg, borderRadius: RUND, padding: "24px 20px 26px", marginBottom: 20,
      border: `1px solid ${tone === "warn" ? "rgba(166,58,46,0.22)" : C.line}`, ...style,
    }}>{children}</section>
  );
}

function Lead({ children }) {
  return (
    <div style={{ borderLeft: `2px solid ${C.messing}`, paddingLeft: 17, margin: "0 0 26px" }}>
      {React.Children.map(children, (c, i) => (
        <p key={i} style={{
          fontFamily: SERIF, fontSize: 19, fontStyle: "italic", fontWeight: 400,
          lineHeight: 1.56, color: C.navy, margin: i === 0 ? "0 0 10px" : 0,
        }}>{c}</p>
      ))}
    </div>
  );
}

function Btn({ children, onClick, variant = "solid", small, full, style, title }) {
  const solide = variant === "solid";
  const skin = solide
    ? { background: C.tiefsee, color: C.white, borderColor: C.tiefsee,
        boxShadow: `inset 0 0 0 1px ${C.messingLeise}` }
    : variant === "quiet"
      ? { background: "transparent", color: C.body, borderColor: C.line }
      : { background: C.white, color: C.navy, borderColor: C.line };
  return (
    <button type="button" onClick={onClick} title={title} style={{
      fontFamily: SANS, fontSize: small ? 13.5 : 15, letterSpacing: 0.2,
      padding: small ? "11px 17px" : "15px 26px", minHeight: 46,
      borderWidth: 1, borderStyle: "solid", borderRadius: 3, cursor: "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      width: full ? "100%" : "auto", ...skin, ...style,
    }}>{children}</button>
  );
}

function Balken({ wert, gesamt }) {
  const p = gesamt ? Math.round((wert / gesamt) * 100) : 0;
  return (
    <div>
      <div style={{ height: 3, background: C.line, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", background: C.tiefsee, transition: "width .35s ease" }} />
      </div>
      <div style={{
        fontFamily: MONO, fontSize: 11, letterSpacing: 0.6, color: C.muted, marginTop: 7,
      }}>{wert} / {gesamt} erledigt</div>
    </div>
  );
}

function Haken({ an, onToggle, titel, text, stern, extra, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "12px 0", borderBottom: `1px solid ${C.line}` }}>
      <button type="button" onClick={onToggle} aria-pressed={an} style={{
        flexShrink: 0, width: 44, height: 44, margin: "-9px 0 -9px -9px", padding: 0,
        background: "transparent", border: "none", cursor: "pointer",
        display: "grid", placeItems: "center",
      }}>
        <span style={{
          width: 26, height: 26, borderRadius: 3, display: "grid", placeItems: "center",
          border: `1.4px solid ${an ? C.tiefsee : C.muted}`, background: an ? C.tiefsee : "transparent",
        }}>{an && <Check size={15} color={C.messingHell} />}</span>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: SANS, fontSize: 15.5, lineHeight: 1.5,
          color: an ? C.muted : C.navy, textDecoration: an ? "line-through" : "none",
        }}>
          {stern && <span style={{ color: C.messing, marginRight: 7 }} aria-hidden="true">✦</span>}
          {titel}
        </div>
        {text && !an && (
          <div style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.62, color: C.muted, marginTop: 6 }}>
            {text}
          </div>
        )}
        {extra}
      </div>
      {onDelete && (
        <button type="button" onClick={onDelete} aria-label="Löschen" style={{
          flexShrink: 0, background: "transparent", border: "none", cursor: "pointer",
          color: C.muted, width: 44, height: 44, display: "grid", placeItems: "center",
        }}><X size={16} /></button>
      )}
    </div>
  );
}

const eingabeStil = {
  width: "100%", boxSizing: "border-box", fontFamily: SANS, fontSize: 16,
  color: C.navy, background: C.white, border: `1px solid ${C.line}`,
  borderRadius: 3, padding: "13px 14px", minHeight: 46,
};

function Feld({ label, wert, onChange, placeholder, type = "text", hinweis }) {
  const daten = type === "number" || type === "time" || type === "date";
  return (
    <div style={{ marginBottom: 16, minWidth: 0 }}>
      <label style={{
        display: "block", fontFamily: MONO, fontSize: 11, letterSpacing: 1.4,
        textTransform: "uppercase", color: C.muted, marginBottom: 7,
        overflowWrap: "anywhere",
      }}>{label}</label>
      <input type={type} value={wert} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        inputMode={type === "number" ? "numeric" : undefined}
        style={{ ...eingabeStil, fontFamily: daten ? MONO : SANS, fontSize: daten ? 15 : 16 }} />
      {hinweis && (
        <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.muted, marginTop: 6 }}>{hinweis}</div>
      )}
    </div>
  );
}

function Wahl({ label, wert, onChange, optionen, hinweis }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.6, textTransform: "uppercase",
        color: C.muted, marginBottom: 9,
      }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {optionen.map((o) => {
          const an = wert === o.v;
          return (
            <button key={o.v} type="button" onClick={() => onChange(an ? "" : o.v)} style={{
              fontFamily: SANS, fontSize: 14, cursor: "pointer", minHeight: 44,
              padding: "11px 16px", borderRadius: 3,
              border: `1px solid ${an ? C.tiefsee : C.line}`,
              background: an ? C.tiefsee : "transparent", color: an ? C.white : C.body,
              boxShadow: an ? `inset 0 0 0 1px ${C.messingLeise}` : "none",
            }}>{o.l}</button>
          );
        })}
      </div>
      {hinweis && (
        <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.muted, marginTop: 8 }}>{hinweis}</div>
      )}
    </div>
  );
}

function WahlMehr({ label, werte, onChange, optionen, hinweis }) {
  const liste = werte || [];
  const um = (v) => onChange(liste.indexOf(v) >= 0 ? liste.filter((x) => x !== v) : [...liste, v]);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: MONO, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
        color: C.muted, marginBottom: 9,
      }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {optionen.map((o) => {
          const an = liste.indexOf(o.v) >= 0;
          return (
            <button key={o.v} type="button" onClick={() => um(o.v)} aria-pressed={an} style={{
              fontFamily: SANS, fontSize: 14, cursor: "pointer", minHeight: 44,
              padding: "11px 16px", borderRadius: 3,
              border: `1px solid ${an ? C.tiefsee : C.line}`,
              background: an ? C.tiefsee : "transparent", color: an ? C.white : C.body,
              boxShadow: an ? `inset 0 0 0 1px ${C.messingLeise}` : "none",
              display: "inline-flex", alignItems: "center", gap: 7,
            }}>{an && <Check size={13} color={C.messingHell} />}{o.l}</button>
          );
        })}
      </div>
      {hinweis && (
        <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.muted, marginTop: 8 }}>{hinweis}</div>
      )}
    </div>
  );
}

function Schalter({ label, an, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!an)} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
      background: C.white, border: `1px solid ${an ? C.tiefsee : C.line}`, borderRadius: 3,
      padding: "13px 14px", marginBottom: 14, cursor: "pointer", minHeight: 46,
    }}>
      <span style={{
        width: 24, height: 24, borderRadius: 3, flexShrink: 0,
        border: `1.4px solid ${an ? C.tiefsee : C.muted}`, background: an ? C.tiefsee : "transparent",
        display: "grid", placeItems: "center",
      }}>{an && <Check size={14} color={C.messingHell} />}</span>
      <span style={{ fontFamily: SANS, fontSize: 15, color: C.navy }}>{label}</span>
    </button>
  );
}

function Warnung({ children }) {
  return (
    <div style={{
      background: C.warnSoft, borderLeft: `2px solid ${C.warn}`, borderRadius: 3,
      padding: "15px 16px", display: "flex", gap: 11, marginBottom: 18,
    }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}><Alert size={16} color={C.warn} /></div>
      <div style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.62, color: C.navy }}>{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------
   Windrose – zeigt, wie weit ihr mit der Vorbereitung seid
--------------------------------------------------------- */
function Windrose({ prozent, oben, unten, groesse = 260 }) {
  const M = 150;
  const R = 104;
  const striche = [];
  for (let i = 0; i < 72; i++) {
    const a = (i * 5 * Math.PI) / 180;
    const lang = i % 9 === 0;
    const r1 = R + 6;
    const r2 = R + (lang ? 15 : 10);
    striche.push(
      <line key={"s" + i}
        x1={M + r1 * Math.sin(a)} y1={M - r1 * Math.cos(a)}
        x2={M + r2 * Math.sin(a)} y2={M - r2 * Math.cos(a)}
        stroke={C.messing} strokeWidth={lang ? 1.4 : 0.7} opacity={lang ? 0.95 : 0.5} />
    );
  }

  const zacke = (grad, laenge, breit) => {
    const a = (grad * Math.PI) / 180;
    const q = ((grad + 90) * Math.PI) / 180;
    const sp = [M + laenge * Math.sin(a), M - laenge * Math.cos(a)];
    const l = [M + breit * Math.sin(q), M - breit * Math.cos(q)];
    const r = [M - breit * Math.sin(q), M + breit * Math.cos(q)];
    return { sp, l, r };
  };

  const punkte = [];
  [0, 90, 180, 270].forEach((g) => {
    const z = zacke(g, R - 6, 17);
    punkte.push(<polygon key={"a" + g} points={`${z.sp} ${z.l} ${M},${M}`} fill={C.messing} opacity="0.92" />);
    punkte.push(<polygon key={"b" + g} points={`${z.sp} ${z.r} ${M},${M}`} fill="none" stroke={C.messing} strokeWidth="1" />);
  });
  [45, 135, 225, 315].forEach((g) => {
    const z = zacke(g, R * 0.6, 11);
    punkte.push(<polygon key={"c" + g} points={`${z.sp} ${z.l} ${M},${M}`} fill={C.messing} opacity="0.55" />);
    punkte.push(<polygon key={"d" + g} points={`${z.sp} ${z.r} ${M},${M}`} fill="none" stroke={C.messing} strokeWidth="0.8" opacity="0.8" />);
  });

  const rF = R + 22;
  const umfang = 2 * Math.PI * rF;
  const anteil = Math.max(0, Math.min(100, prozent || 0)) / 100;

  return (
    <svg viewBox="0 0 300 300" width={groesse} height={groesse} role="img"
      aria-label={`Windrose, ${Math.round(prozent || 0)} Prozent vorbereitet`}
      style={{ display: "block", margin: "0 auto", maxWidth: "100%" }}>
      <circle cx={M} cy={M} r={rF} fill="none" stroke={C.messing} strokeWidth="1" opacity="0.28" />
      <circle cx={M} cy={M} r={rF} fill="none" stroke={C.messingHell} strokeWidth="2.5"
        strokeLinecap="round" strokeDasharray={`${umfang * anteil} ${umfang}`}
        transform={`rotate(-90 ${M} ${M})`} style={{ transition: "stroke-dasharray .6s ease" }} />
      <circle cx={M} cy={M} r={R + 4} fill="none" stroke={C.messing} strokeWidth="0.8" opacity="0.45" />
      {striche}
      {punkte}
      <circle cx={M} cy={M} r="47" fill="#0B2338" stroke={C.messing} strokeWidth="1" opacity="0.97" />
      <text x={M} y={oben ? M + 2 : M + 8} textAnchor="middle" fill="#F5F8F7"
        fontFamily={SERIF} fontSize={oben && String(oben).length > 3 ? 27 : 34} fontWeight="500">
        {oben}
      </text>
      {unten && (
        <text x={M} y={M + 24} textAnchor="middle" fill={C.messingHell}
          fontFamily={MONO} fontSize="9.5" letterSpacing="1.6">{unten}</text>
      )}
      <text x={M} y={M - R - 22} textAnchor="middle" fill={C.messingHell}
        fontFamily={MONO} fontSize="11" letterSpacing="2">N</text>
    </svg>
  );
}

/* =========================================================
   MODUL 1 – COUNTDOWN
========================================================= */
function ModulCountdown({ daten, setzeHaken }) {
  const s = daten.setup;
  const ab = alsDatum(s.abfahrt);
  return (
    <div>
      <Kicker>Modul 1</Kicker>
      <H2>Der Countdown</H2>
      <Lead>
        <span>Wir sind Vivi und Chris, wir arbeiten in der Luft und nicht auf See, aber wir waren oft genug an Bord, um mit Crew-Augen draufzuschauen.</span>
        <span>Das hier ist kein Reisekatalog, sondern die Liste, die wir selbst abarbeiten.</span>
      </Lead>

      {!ab && (
        <Warnung>
          Tragt oben im Reise-Setup euer Abfahrtsdatum ein, dann rechnet euch der Countdown jede Phase auf ein echtes Datum um.
        </Warnung>
      )}

      {COUNTDOWN.map((phase) => {
        const punkte = phase.punkte.filter((p) => !p.wenn || p.wenn(s));
        const faellig = ab ? minusTage(ab, phase.tage) : null;
        const offen = punkte.filter((p) => !daten.haken[`c-${p.id}`]).length;
        const ueber = faellig && faellig < heute() && offen > 0;
        return (
          <Card key={phase.id} tone="white" style={{ border: `1px solid ${ueber ? C.warn : C.line}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
              <H3 style={{ margin: 0 }}>{phase.titel}</H3>
              {faellig && (
                <div style={{
                  fontFamily: SANS, fontSize: 13, whiteSpace: "nowrap",
                  color: ueber ? C.warn : C.blue,
                }}>{kurz(faellig)}</div>
              )}
            </div>
            {ueber && (
              <div style={{ fontFamily: SANS, fontSize: 13, color: C.warn, marginBottom: 10 }}>
                Dieser Block ist überfällig, {offen} {offen === 1 ? "Punkt" : "Punkte"} offen.
              </div>
            )}
            <P style={{ marginTop: 8, marginBottom: 6, fontSize: 14.5 }}>{phase.intro}</P>
            {punkte.map((p) => (
              <Haken key={p.id} an={!!daten.haken[`c-${p.id}`]}
                onToggle={() => setzeHaken(`c-${p.id}`)}
                titel={p.t} text={p.d} stern={p.stern} />
            ))}
          </Card>
        );
      })}
    </div>
  );
}

/* =========================================================
   MODUL 2 – KABINEN-CHECK
========================================================= */
function kabinenCheck(a) {
  const erwartet = [];
  const jetzt = [];

  if (a.art === "innen") {
    erwartet.push({ t: "Es wird stockdunkel", d: "Innenkabinen haben kein Tageslicht, und das ist Fluch und Segen zugleich: Ihr schlaft hervorragend, verliert aber jedes Zeitgefühl und verschlaft ohne Wecker zuverlässig den Hafen." });
    jetzt.push("Weckruf für jeden Hafentag stellen, am besten am Abend vorher");
    jetzt.push("Kleines Nachtlicht einpacken, sonst geht nachts das große Licht an und alle sind wach");
  }
  if (a.art === "aussen") {
    erwartet.push({ t: "Fenster ja, frische Luft nein", d: "Ihr habt Tageslicht und einen Blick auf den Horizont, aber das Fenster lässt sich nicht öffnen, und je nach Deck kann ein Rettungsboot davorhängen." });
    jetzt.push("Bei der Reederei nachfragen, ob eure Kabine als „eingeschränkte Sicht“ geführt wird");
  }
  if (a.art === "balkon") {
    erwartet.push({ t: "Der Balkon ist windiger, als ihr denkt", d: "Auf See zieht es auf dem Balkon fast immer, und alles Lose fliegt weg. Abends ist er dafür der beste Platz an Bord." });
    jetzt.push("Nichts Loses auf der Reling ablegen, Handtücher und Papier fliegen sofort über Bord");
  }
  if (a.art === "suite") {
    erwartet.push({ t: "Ihr habt Rechte, die kaum jemand nutzt", d: "Zu Suiten gehören je nach Reederei bevorzugte Einschiffung, eigene Restaurantzeiten oder ein Concierge — das steht selten prominent in den Unterlagen." });
    jetzt.push("In euren Unterlagen nachlesen, welche Extras zur Kategorie gehören, und die bevorzugte Einschiffung wirklich nutzen");
  }

  if (a.laengs === "vorne") {
    erwartet.push({ t: "Morgens im Hafen hört ihr die Ankerkette", d: "Ganz vorne liegt ihr über dem Ankerspill, und das ist ein Geräusch, das keinen Wecker mehr nötig macht. Bei Welle bewegt sich der Bug außerdem am stärksten." });
    jetzt.push("Ohrstöpsel einpacken, das ist hier der wichtigste Gegenstand im Koffer");
  }
  if (a.laengs === "achtern") {
    erwartet.push({ t: "Bester Blick, meiste Vibration", d: "Achtern schaut ihr aufs Kielwasser, spürt dafür aber die Maschine und die Schrauben deutlicher als überall sonst — besonders beim An- und Ablegen." });
  }
  if (a.laengs === "mittschiffs") {
    erwartet.push({ t: "Ihr habt die ruhigste Lage erwischt", d: "Mittschiffs bewegt sich das Schiff am wenigsten, und die Wege zu Restaurants und Aufzügen sind kurz. Das ist die Lage, die wir selbst buchen würden." });
  }

  if (a.deck === "pool") {
    erwartet.push({ t: "Ab sechs Uhr werden über euch Liegen geschoben", d: "Direkt unter dem Pooldeck beginnt der Tag früh, und das klingt genau so, wie es sich anhört. Nachmittags ist es meist ruhiger." });
    jetzt.push("Ohrstöpsel einpacken und am Einschiffungstag freundlich nach einem Kabinenwechsel fragen, falls noch etwas frei ist");
  }
  if (a.deck === "buehne") {
    erwartet.push({ t: "Abends wird es laut, dafür nachts ruhig", d: "Über Theater, Disco oder Bühne hört ihr den Bass bis etwa Mitternacht, danach kehrt Ruhe ein. Wer spät ins Bett geht, merkt davon wenig." });
    jetzt.push("Am ersten Abend prüfen, wie laut es wirklich ist, denn ein Wechsel ist nur in den ersten Stunden realistisch");
  }
  if (a.deck === "kabinen") {
    erwartet.push({ t: "Über und unter euch schläft man auch", d: "Das ist die beste Nachbarschaft, die ein Schiff zu bieten hat, und der häufigste Grund, warum Gäste gut schlafen." });
  }

  if (a.seekrank === "sofort" && (a.art === "innen")) {
    erwartet.push({ t: "Ohne Horizont wird Seekrankheit schlimmer", d: "Euer Gleichgewichtssinn meldet Bewegung, eure Augen sehen eine feste Wand, und genau dieser Widerspruch macht übel. In der Innenkabine fehlt euch der Ausgleich." });
    jetzt.push("Mittel gegen Seekrankheit vor der Reise besorgen und bei Seegang mittschiffs an Deck gehen, nicht in die Kabine legen");
  } else if (a.seekrank === "sofort") {
    jetzt.push("Bei Seegang mit Blick auf den Horizont hinsetzen, frische Luft und ein fester Punkt am Horizont helfen mehr als jedes Hausmittel");
  }
  if (a.seekrank === "manchmal") {
    jetzt.push("Mittel gegen Seekrankheit einpacken, auch wenn ihr denkt, ihr braucht es nicht");
  }

  if (a.kind === "ja") {
    if (a.art === "balkon" || a.art === "suite") {
      erwartet.push({ t: "Der Balkon ist mit Kleinkind der kritische Punkt", d: "Die Tür lässt sich oft leichter öffnen, als Eltern erwarten, und Stühle vor der Reling werden zur Leiter." });
      jetzt.push("Türsicherung mitnehmen und die Möbel auf dem Balkon von der Reling wegstellen");
    } else {
      erwartet.push({ t: "Für den Mittagsschlaf habt ihr die bessere Kabine", d: "Ohne Tageslicht schläft ein Kleinkind auch mittags um zwei, und genau daran scheitern Familien mit Balkon regelmäßig." });
    }
    jetzt.push("Vertraute Bettwäsche oder Schlafsack einpacken, das ist auf See der halbe Schlaf");
  }

  jetzt.push("Kabine am ersten Tag prüfen: Betten, Handtücher, Klimaanlage, Safe und Föhn — am ersten Tag dauert das Minuten, am dritten zwei Tage");

  return { erwartet, jetzt };
}

function ModulKabine({ daten, setze }) {
  const a = daten.kabine;
  const fertig = a.art && a.laengs && a.deck && a.seekrank && a.kind;
  const e = fertig ? kabinenCheck(a) : null;
  const set = (k, v) => setze("kabine", { ...a, [k]: v });

  return (
    <div>
      <Kicker>Modul 2</Kicker>
      <H2>Der Kabinen-Check</H2>
      <Lead>
        <span>Eure Kabine ist gebucht, daran ändern wir nichts mehr — aber ihr könnt vorher wissen, was euch dort erwartet.</span>
        <span>Fünf Angaben, dann sagen wir euch, womit ihr rechnen solltet und was ihr jetzt noch erledigen könnt.</span>
      </Lead>

      <Card tone="white">
        <Wahl label="Welche Kabine habt ihr gebucht?" wert={a.art} onChange={(v) => set("art", v)}
          optionen={[{ v: "innen", l: "Innen" }, { v: "aussen", l: "Außen" },
                     { v: "balkon", l: "Balkon" }, { v: "suite", l: "Suite" }]} />
        <Wahl label="Wo liegt sie im Schiff?" wert={a.laengs} onChange={(v) => set("laengs", v)}
          optionen={[{ v: "vorne", l: "Vorne" }, { v: "mittschiffs", l: "Mittschiffs" },
                     { v: "achtern", l: "Achtern" }, { v: "unbekannt", l: "Weiß ich nicht" }]}
          hinweis="Steht im Deckplan eurer Reederei, meist als PDF im Buchungsbereich." />
        <Wahl label="Was liegt über oder unter euch?" wert={a.deck} onChange={(v) => set("deck", v)}
          optionen={[{ v: "kabinen", l: "Nur Kabinen" }, { v: "pool", l: "Pooldeck" },
                     { v: "buehne", l: "Theater oder Disco" }, { v: "unbekannt", l: "Weiß ich nicht" }]} />
        <Wahl label="Werdet ihr seekrank?" wert={a.seekrank} onChange={(v) => set("seekrank", v)}
          optionen={[{ v: "nie", l: "Nie" }, { v: "manchmal", l: "Manchmal" }, { v: "sofort", l: "Sofort" }]} />
        <Wahl label="Ist ein Kind unter drei dabei?" wert={a.kind} onChange={(v) => set("kind", v)}
          optionen={[{ v: "ja", l: "Ja" }, { v: "nein", l: "Nein" }]} />
        <Feld label="Kabinennummer" wert={a.nummer} onChange={(v) => set("nummer", v)}
          hinweis="Nur für euch — sie wandert später ins Fahrtenbuch, damit ihr beim nächsten Mal wisst, welche Kabine ihr hattet." />
      </Card>

      {e ? (
        <div>
          <Card tone="white" style={{ borderLeft: `2px solid ${C.messing}` }}>
            <Kicker>Was euch erwartet</Kicker>
            {e.erwartet.map((x, i) => (
              <div key={i} style={{ marginBottom: i === e.erwartet.length - 1 ? 0 : 20 }}>
                <div style={{ fontFamily: SERIF, fontSize: 19, color: C.navy, marginBottom: 7 }}>{x.t}</div>
                <P style={{ marginBottom: 0, fontSize: 14.5 }}>{x.d}</P>
              </div>
            ))}
          </Card>

          <Card tone="green">
            <Kicker color={C.green}>Das erledigt ihr jetzt</Kicker>
            {e.jetzt.map((x, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <span aria-hidden="true" style={{ color: C.messing, flexShrink: 0, marginTop: 1 }}>✦</span>
                <span style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.62, color: C.navy }}>{x}</span>
              </div>
            ))}
          </Card>

          <Card tone="sand">
            <P style={{ margin: 0, fontFamily: SERIF, fontSize: 17.5, fontStyle: "italic", lineHeight: 1.55, color: C.navy }}>
              Fürs nächste Mal: Fragt beim Buchen konkret nach einer Kabine, über und unter der ebenfalls Kabinen liegen, denn das ist die Frage, die kaum jemand stellt und die am meisten bringt.
            </P>
          </Card>
        </div>
      ) : (
        <Card>
          <P style={{ margin: 0, fontSize: 14.5 }}>
            Beantwortet die fünf Fragen, dann steht hier, was euch in eurer Kabine erwartet und was ihr vor der Reise noch erledigen solltet.
          </P>
        </Card>
      )}
    </div>
  );
}

/* =========================================================
   MODUL 3 – PACKLISTE
========================================================= */
function ModulPack({ daten, setze, setzeHaken }) {
  const s = daten.setup;
  const f = { route: s.route, saison: s.saison, kind: s.kind, anreise: s.anreise, gala: s.gala };
  const [neu, setNeu] = useState("");
  const bloecke = PACK.filter((b) => !b.wenn || b.wenn(f));

  function addExtra() {
    const t = neu.trim();
    if (!t) return;
    setze("packExtra", [...daten.packExtra, { id: "x" + Date.now(), t }]);
    setNeu("");
  }

  return (
    <div>
      <Kicker>Modul 3</Kicker>
      <H2>Die Packliste</H2>
      <Lead>
        <span>Wir packen beruflich und haben auf unserer ersten Kreuzfahrt trotzdem die Hälfte falsch gemacht, weil ein Schiff eben kein Hotel ist.</span>
      </Lead>

      <Card style={{ background: C.skySoft }}>
        <P style={{ margin: 0, fontSize: 14.5 }}>
          Die Liste baut sich aus eurem Reise-Setup zusammen: {s.route ? "Route gesetzt" : "Route fehlt noch"}, {s.saison ? "Saison gesetzt" : "Saison fehlt noch"}, {s.kind ? "mit Kind" : "ohne Kind"}, {s.anreise === "flug" ? "Fly & Cruise" : s.anreise ? "Anreise mit Auto oder Bahn" : "Anreiseart fehlt noch"}.
        </P>
      </Card>

      {bloecke.map((b) => {
        const punkte = b.punkte.filter((p) => !p.wenn || p.wenn(f));
        if (!punkte.length) return null;
        return (
          <Card key={b.id} tone="white">
            <H3 style={{ marginBottom: b.hinweis ? 8 : 12 }}>{b.titel}</H3>
            {b.hinweis && <P style={{ fontSize: 14, marginBottom: 8 }}>{b.hinweis}</P>}
            {punkte.map((p) => (
              <Haken key={p.id} an={!!daten.haken[`p-${p.id}`]}
                onToggle={() => setzeHaken(`p-${p.id}`)}
                titel={p.t} text={p.d} stern={p.stern} />
            ))}
          </Card>
        );
      })}

      <Card tone="white">
        <H3>Eure eigenen Punkte</H3>
        {daten.packExtra.map((p) => (
          <Haken key={p.id} an={!!daten.haken[`p-${p.id}`]}
            onToggle={() => setzeHaken(`p-${p.id}`)} titel={p.t}
            onDelete={() => setze("packExtra", daten.packExtra.filter((x) => x.id !== p.id))} />
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <input value={neu} onChange={(e) => setNeu(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addExtra(); }}
            placeholder="Was fehlt euch noch?"
            style={{
              flex: 1, minWidth: 0, fontFamily: SANS, fontSize: 16, color: C.navy,
              background: C.white, border: `1px solid ${C.line}`, borderRadius: 10,
              padding: "12px 14px", minHeight: 46,
            }} />
          <Btn small onClick={addExtra} style={{ flexShrink: 0 }}><Plus size={15} /></Btn>
        </div>
      </Card>

      <Card tone="sand">
        <H3>Was ihr zu Hause lassen könnt</H3>
        {NICHT_MIT.map((t, i) => (
          <P key={i} style={{ fontSize: 14.5, marginBottom: 10 }}>· {t}</P>
        ))}
      </Card>
    </div>
  );
}

/* =========================================================
   MODUL 4 – BORDKONTO
========================================================= */
const PREIS = {
  getraenke: { sparsam: 9, gemischt: 24, cocktails: 46 },
  paketTag: 34,
  ausflug: 70,
  wlanTag: 20,
  trinkgeld: 11,
  spezial: 32,
  spa: 90,
  fotos: 90,
};

function bordRechnung(b, s) {
  const personen = Math.max(1, parseInt(s.personen || "2", 10) || 2);
  const naechte = Math.max(1, parseInt(s.naechte || "7", 10) || 7);
  const zeilen = [];
  const inkl = b.inklusive || [];
  const hat = (k) => inkl.indexOf(k) >= 0;

  let getraenke = 0;
  let paketTipp = null;
  if (b.getraenke && !hat("getraenke")) {
    const einzel = PREIS.getraenke[b.getraenke] * personen * naechte;
    const paket = PREIS.paketTag * personen * naechte;
    if (b.paket === "ja") { getraenke = paket; zeilen.push({ t: "Getränkepaket", v: paket }); }
    else if (b.paket === "nein") { getraenke = einzel; zeilen.push({ t: "Getränke einzeln", v: einzel }); }
    else {
      getraenke = Math.min(einzel, paket);
      zeilen.push({ t: paket < einzel ? "Getränkepaket (günstiger)" : "Getränke einzeln (günstiger)", v: getraenke });
    }
    paketTipp = {
      einzel, paket,
      lohnt: paket < einzel,
      diff: Math.abs(paket - einzel),
    };
  }

  const haefen = Math.max(2, Math.round(naechte * 0.6));
  let ausfluege = 0;
  if (hat("ausfluege")) ausfluege = 0;
  else if (b.ausfluege === "wenige") ausfluege = 3 * PREIS.ausflug * personen;
  else if (b.ausfluege === "jeder") ausfluege = haefen * PREIS.ausflug * personen;
  if (ausfluege) zeilen.push({ t: "Ausflüge über die Reederei", v: ausfluege });

  let wlan = 0;
  if (hat("wlan")) wlan = 0;
  else if (b.wlan === "gelegentlich") wlan = Math.round(PREIS.wlanTag * naechte * 0.5);
  else if (b.wlan === "durchgehend") wlan = PREIS.wlanTag * naechte;
  if (wlan) zeilen.push({ t: "WLAN an Bord", v: wlan });

  let trinkgeld = 0;
  if (b.trinkgeld === "nein" && !hat("trinkgeld")) trinkgeld = PREIS.trinkgeld * personen * naechte;
  if (trinkgeld) zeilen.push({ t: "Trinkgeld", v: trinkgeld });

  let spezial = 0;
  if (hat("spezial")) spezial = 0;
  else if (b.spezial === "wenige") spezial = 2 * PREIS.spezial * personen;
  else if (b.spezial === "viele") spezial = 5 * PREIS.spezial * personen;
  if (spezial) zeilen.push({ t: "Spezialitätenrestaurants", v: spezial });

  let spa = 0;
  if (b.spa === "ja" && !hat("spa")) spa = PREIS.spa * personen;
  if (spa) zeilen.push({ t: "Spa und Wellness", v: spa });

  let fotos = 0;
  if (b.fotos === "ja") fotos = PREIS.fotos;
  if (fotos) zeilen.push({ t: "Fotos und Shop", v: fotos });

  const summe = zeilen.reduce((a, z) => a + z.v, 0);
  const preis = parseFloat((s.reisepreis || "").replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  const prozent = preis > 0 ? Math.round((summe / preis) * 100) : null;

  return { zeilen, summe, prozent, paketTipp, personen, naechte, haefen, inkl };
}

function ModulBord({ daten, setze }) {
  const b = daten.bord;
  const s = daten.setup;
  const r = useMemo(() => bordRechnung(b, s), [b, s]);
  const set = (k, v) => setze("bord", { ...b, [k]: v });
  const inkl = (k) => (b.inklusive || []).indexOf(k) >= 0;
  const NAMEN = { getraenke: "Getränke", trinkgeld: "Trinkgeld", spa: "Sauna und Spa-Bereich",
    wlan: "WLAN", spezial: "Spezialitätenrestaurants", ausfluege: "Ausflüge" };

  return (
    <div>
      <Kicker>Modul 4</Kicker>
      <H2>Der Bordkonto-Rechner</H2>
      <Lead>
        <span>Die Kreuzfahrt kostet nicht das, was auf der Rechnung stand, und das ist keine Abzocke, sondern das Geschäftsmodell.</span>
        <span>Der Reisepreis ist der Einstieg, verdient wird an Bord — wer das vorher weiß, ärgert sich am Ende nicht.</span>
      </Lead>

      <Card tone="white">
        <P style={{ fontSize: 14, color: C.muted }}>
          Gerechnet wird mit {r.personen} {r.personen === 1 ? "Person" : "Personen"} und {r.naechte} Nächten aus eurem Reise-Setup.
        </P>
        <WahlMehr label="Was ist in eurem Tarif schon enthalten?" werte={b.inklusive}
          onChange={(v) => set("inklusive", v)}
          optionen={[{ v: "getraenke", l: "Getränke" }, { v: "trinkgeld", l: "Trinkgeld" },
                     { v: "spa", l: "Sauna & Spa-Bereich" }, { v: "wlan", l: "WLAN" },
                     { v: "spezial", l: "Spezialitätenrestaurants" }, { v: "ausfluege", l: "Ausflüge" }]}
          hinweis="Bei Mein Schiff sind Getränke, Trinkgeld und der Saunabereich meist dabei, bei AIDA hängt es vom Tarif ab. Ein Blick in die Buchungsbestätigung lohnt sich hier wirklich." />

        {!inkl("getraenke") && (
          <div>
            <Wahl label="Was trinkt ihr an Bord?" wert={b.getraenke} onChange={(v) => set("getraenke", v)}
              optionen={[{ v: "sparsam", l: "Wasser & Kaffee" }, { v: "gemischt", l: "gemischt" }, { v: "cocktails", l: "gerne Cocktails" }]} />
            <Wahl label="Getränkepaket?" wert={b.paket} onChange={(v) => set("paket", v)}
              optionen={[{ v: "rechnen", l: "rechnet für uns" }, { v: "ja", l: "haben wir" }, { v: "nein", l: "wollen wir nicht" }]} />
          </div>
        )}
        {!inkl("ausfluege") && (
          <Wahl label="Ausflüge über die Reederei" wert={b.ausfluege} onChange={(v) => set("ausfluege", v)}
            optionen={[{ v: "keine", l: "keine" }, { v: "wenige", l: "zwei bis drei" }, { v: "jeder", l: "an jedem Hafen" }]} />
        )}
        {!inkl("wlan") && (
          <Wahl label="WLAN an Bord" wert={b.wlan} onChange={(v) => set("wlan", v)}
            optionen={[{ v: "nein", l: "gar keins" }, { v: "gelegentlich", l: "gelegentlich" }, { v: "durchgehend", l: "durchgehend" }]} />
        )}
        {!inkl("trinkgeld") && (
          <Wahl label="Kommt das Trinkgeld noch dazu?" wert={b.trinkgeld} onChange={(v) => set("trinkgeld", v)}
            optionen={[{ v: "ja", l: "nein, ist enthalten" }, { v: "nein", l: "ja, kommt dazu" }]} />
        )}
        {!inkl("spezial") && (
          <Wahl label="Spezialitätenrestaurants" wert={b.spezial} onChange={(v) => set("spezial", v)}
            optionen={[{ v: "keine", l: "keine" }, { v: "wenige", l: "ein bis zwei" }, { v: "viele", l: "öfter" }]} />
        )}
        {!inkl("spa") && (
          <Wahl label="Spa-Anwendungen" wert={b.spa} onChange={(v) => set("spa", v)}
            optionen={[{ v: "nein", l: "nein" }, { v: "ja", l: "ja" }]} />
        )}
        <Wahl label="Fotos und Shop" wert={b.fotos} onChange={(v) => set("fotos", v)}
          optionen={[{ v: "nein", l: "nein" }, { v: "ja", l: "ja" }]} />
      </Card>

      {r.inkl.length > 0 && (
        <Card tone="green">
          <Kicker color={C.green}>Schon im Reisepreis enthalten</Kicker>
          <P style={{ marginBottom: 0, fontSize: 14.5 }}>
            {r.inkl.map((k) => NAMEN[k]).join(", ")} — das rechnen wir unten nicht noch einmal dazu.
            Prüft trotzdem die Grenzen eures Tarifs, denn oft sind Premiumweine, einzelne Cocktails
            oder Behandlungen im Spa ausgenommen.
          </P>
        </Card>
      )}

      {r.zeilen.length > 0 && (
        <Card tone="white" style={{ borderLeft: `2px solid ${C.messing}` }}>
          <Kicker>Eure Hochrechnung</Kicker>
          {r.zeilen.map((z, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", gap: 12,
              padding: "11px 0", borderBottom: `1px solid ${C.line}`,
              fontFamily: SANS, fontSize: 15, color: C.body,
            }}>
              <span>{z.t}</span><span style={{ color: C.navy, whiteSpace: "nowrap" }}>{euro(z.v)}</span>
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between", gap: 12, paddingTop: 16,
            fontFamily: SERIF, fontSize: 24, color: C.navy,
          }}>
            <span>An Bord gesamt</span><span style={{ whiteSpace: "nowrap" }}>{euro(r.summe)}</span>
          </div>
          {r.prozent !== null && (
            <P style={{ marginTop: 14, marginBottom: 0, fontSize: 14.5 }}>
              Das sind rund {r.prozent} Prozent eures Reisepreises, die auf der Buchungsbestätigung nirgends stehen.
            </P>
          )}
        </Card>
      )}

      {r.paketTipp && b.paket === "rechnen" && (
        <Card tone={r.paketTipp.lohnt ? "green" : "warn"}>
          <H3>{r.paketTipp.lohnt ? "Das Getränkepaket lohnt sich für euch" : "Ohne Paket fahrt ihr günstiger"}</H3>
          <P style={{ marginBottom: 0, fontSize: 14.5 }}>
            Einzeln zahlt ihr hochgerechnet {euro(r.paketTipp.einzel)}, das Paket kostet {euro(r.paketTipp.paket)}, macht einen Unterschied von {euro(r.paketTipp.diff)}. Wichtig dabei: Bei den meisten Reedereien muss die ganze Kabine buchen und nicht nur eine Person, und Wasser und Kaffee zählen mit.
          </P>
        </Card>
      )}

      <Card tone="white">
        <H3>Die sechs Stellschrauben</H3>
        <P><strong style={{ color: C.navy }}>Getränkepaket.</strong> Falls es nicht ohnehin im Tarif steckt, der größte Hebel, weshalb ihr ehrlich rechnen solltet, denn ab etwa fünf bis sechs Getränken am Tag lohnt es sich, und wer abends zwei Gläser Wein trinkt, kommt ohne Paket deutlich günstiger weg.</P>
        <P><strong style={{ color: C.navy }}>Ausflüge auf eigene Faust.</strong> Kosten oft nur ein Drittel bis die Hälfte, aber der Preisunterschied ist eine Versicherungsprämie, denn beim Reederei-Ausflug wartet das Schiff, wenn der Bus im Stau steht, und auf eigene Faust wartet niemand.</P>
        <P><strong style={{ color: C.navy }}>WLAN.</strong> Rechnet den Tagespreis mal Reisetage, weil die Summe fast alle überrascht, und die ehrliche Alternative ist, gar keins zu buchen und in den Häfen ein Café zu nehmen.</P>
        <P><strong style={{ color: C.navy }}>Trinkgeld.</strong> Läuft meist automatisch übers Bordkonto und ist je nach Reederei schon enthalten, was ihr vorher prüfen solltet, nicht um es abzubestellen, sondern damit ihr wisst, womit ihr rechnet.</P>
        <P><strong style={{ color: C.navy }}>Spezialitätenrestaurants.</strong> Ein schöner Luxus für ein bis zwei Abende, während sieben davon schlicht eine zweite Rechnung ergeben.</P>
        <P style={{ marginBottom: 0 }}><strong style={{ color: C.navy }}>Fotos und Shop.</strong> Hier hilft nur ein vorher gesetztes Budget, weil an Bord alles auf Impuls gebaut ist und wer sich vorher eine Zahl setzt, sich fast immer daran hält.</P>
      </Card>

      <Card tone="sand">
        <P style={{ margin: 0, fontFamily: SERIF, fontSize: 18, fontStyle: "italic", lineHeight: 1.55, color: C.navy }}>
          Das hier ist kein Spar-Guide, gebt das Geld gerne aus, aber gebt es bewusst aus, denn der Unterschied zwischen einem tollen und einem bitteren letzten Abend ist meistens nur, ob die Endabrechnung euch überrascht hat.
        </P>
      </Card>
    </div>
  );
}

/* =========================================================
   SEEKARTE – Küstenlinien, Häfen, Route
   Bewusst vereinfacht gezeichnet, damit die Karte auch ohne
   Internet funktioniert. Kein Kartendienst, keine Datenübertragung.
========================================================= */
const REGIONEN = {
  mittel: {
    name: "Mittelmeer",
    box: [-7, 29.5, 37.5, 47],
    land: [
      [[-7, 37.3], [-6.9, 37.2], [-6.5, 36.9], [-6.25, 36.6], [-6.1, 36.2], [-5.6, 36.0], [-4.4, 36.7], [-2.5, 36.8], [-1.0, 37.6], [0.2, 38.7], [-0.3, 39.5],
       [0.9, 40.7], [2.2, 41.4], [3.2, 42.3], [4.0, 43.4], [5.4, 43.3], [6.6, 43.1], [7.3, 43.7],
       [8.5, 44.3], [9.8, 44.1], [10.3, 43.0], [11.8, 42.1], [12.4, 41.3], [13.6, 41.2], [14.3, 40.8],
       [15.3, 40.0], [15.9, 38.9], [15.6, 38.1], [16.6, 38.5], [17.2, 39.0], [16.9, 40.5], [18.5, 40.1],
       [18.0, 40.7], [16.9, 41.1], [15.9, 41.9], [14.2, 42.4], [13.5, 43.6], [12.4, 44.4], [12.3, 45.4],
       [13.6, 45.7], [14.5, 45.0], [15.9, 43.7], [16.4, 43.5], [18.1, 42.6], [19.2, 42.0], [19.4, 41.3],
       [20.0, 39.9], [20.7, 38.3], [21.4, 37.7], [21.7, 36.8], [22.5, 36.4], [23.2, 36.4], [23.0, 37.5],
       [23.7, 37.9], [24.0, 38.4], [23.4, 39.2], [22.9, 40.6], [24.0, 40.6], [25.9, 40.8], [26.1, 40.6],
       [26.2, 40.2], [27.0, 40.6], [28.9, 41.1], [29.3, 40.7], [27.3, 40.3], [26.7, 40.0], [26.2, 39.6],
       [26.7, 38.9], [27.1, 38.4], [27.3, 37.0], [28.2, 36.6], [29.1, 36.2], [30.5, 36.3], [30.7, 36.9],
       [32.0, 36.5], [32.8, 36.0], [34.6, 36.8], [36.2, 36.6], [36.0, 36.0], [35.8, 35.5], [35.5, 34.5],
       [35.5, 33.9], [35.1, 33.1], [34.9, 32.8], [34.7, 32.1], [34.3, 31.3], [34.1, 31.2],
       [38, 31.0], [38, 48], [-7, 48]],
      [[34.0, 31.2], [32.3, 31.25], [31.2, 31.5], [30.0, 31.2], [28.9, 30.8], [27.2, 31.3], [25.2, 31.5],
       [23.9, 32.1], [22.0, 32.8], [20.1, 32.1], [19.5, 30.9], [18.5, 30.4], [16.6, 31.1], [15.2, 32.4],
       [13.2, 32.9], [11.5, 33.2], [10.8, 33.9], [11.0, 33.5], [10.8, 34.7], [10.6, 35.8], [11.1, 36.9],
       [10.3, 36.9], [9.9, 37.3], [8.7, 36.9], [7.0, 37.1], [5.1, 36.8], [3.1, 36.8], [1.3, 36.5],
       [-0.6, 35.8], [-2.0, 35.3], [-3.9, 35.2], [-5.3, 35.9], [-5.9, 35.8], [-7, 35.7],
       [-7, 29], [38, 29], [38, 31.2]],
      [[2.35, 39.55], [3.2, 39.75], [3.45, 39.72], [3.15, 39.35], [2.6, 39.28], [2.35, 39.45]],
      [[3.8, 40.0], [4.32, 40.06], [4.27, 39.85], [3.85, 39.85]],
      [[1.2, 39.05], [1.62, 39.1], [1.57, 38.65], [1.2, 38.85]],
      [[8.6, 42.6], [9.35, 43.0], [9.55, 42.2], [9.4, 41.4], [8.9, 41.4], [8.65, 42.0]],
      [[8.2, 41.1], [8.5, 41.2], [9.6, 41.1], [9.75, 40.5], [9.6, 39.15], [9.28, 39.02], [9.2, 39.3], [9.0, 39.28], [8.98, 38.95], [8.62, 38.9], [8.4, 39.05], [8.4, 40.0]],
      [[12.45, 37.8], [13.4, 38.2], [15.1, 38.3], [15.5, 38.18], [15.05, 37.55], [15.32, 36.98], [15.1, 36.68], [14.5, 36.68], [12.6, 37.5]],
      [[23.5, 35.6], [24.8, 35.6], [26.3, 35.3], [25.7, 35.0], [24.0, 35.15], [23.5, 35.4]],
      [[32.3, 35.1], [33.5, 35.4], [34.6, 35.7], [34.0, 34.9], [33.0, 34.6], [32.4, 34.75]],
    ],
    inseln: [[14.45, 35.9, 4], [28.0, 36.2, 5], [19.85, 39.6, 4], [25.35, 37.45, 3], [25.43, 36.42, 3],
             [24.45, 37.45, 3], [26.9, 37.1, 3], [27.3, 38.9, 4], [10.3, 42.8, 3], [8.3, 43.0, 3]],
  },

  kanaren: {
    name: "Kanaren und Madeira",
    box: [-19, 26.5, -5, 41],
    land: [
      [[-5, 41], [-8.9, 41.0], [-9.4, 39.4], [-9.2, 38.7], [-8.8, 38.5], [-8.8, 37.0], [-7.9, 37.0],
       [-6.9, 37.2], [-6.3, 36.8], [-5.6, 36.05], [-5, 36.05], [-5, 41]],
      [[-5.9, 35.8], [-6.3, 34.0], [-6.8, 34.0], [-7.6, 33.6], [-8.6, 32.9], [-9.8, 31.5], [-9.6, 30.4],
       [-10.5, 29.2], [-12.0, 28.0], [-13.2, 27.7], [-13.4, 26.0], [-5, 26.0], [-5, 35.75]],
      [[-13.85, 29.25], [-13.42, 29.2], [-13.45, 28.85], [-13.85, 28.85]],
      [[-14.3, 28.75], [-13.85, 28.75], [-13.85, 28.05], [-14.1, 28.05]],
      [[-15.85, 28.15], [-15.35, 28.15], [-15.35, 27.75], [-15.75, 27.78]],
      [[-16.92, 28.37], [-16.12, 28.55], [-16.15, 28.15], [-16.75, 28.0]],
    ],
    inseln: [[-17.25, 28.1, 4], [-17.85, 28.68, 5], [-18.0, 27.75, 4],
             [-16.95, 32.68, 6], [-16.32, 33.06, 3]],
  },

  karibik: {
    name: "Karibik",
    box: [-90, 8, -58, 28.5],
    land: [
      [[-90, 31], [-84.0, 30.0], [-83.0, 29.2], [-82.7, 28.0], [-82.0, 26.7], [-81.5, 25.8], [-81.1, 25.2],
       [-80.4, 25.2], [-80.1, 26.0], [-80.1, 27.0], [-80.6, 28.2], [-81.0, 29.4], [-81.4, 30.4],
       [-80.9, 32.0], [-90, 32]],
      [[-90, 21.5], [-88.5, 21.6], [-86.8, 21.5], [-86.75, 20.5], [-87.5, 19.5], [-87.8, 18.2],
       [-88.3, 18.5], [-88.9, 15.9], [-88.0, 15.7], [-86.0, 15.9], [-83.9, 15.8], [-83.2, 14.9],
       [-83.4, 13.0], [-83.7, 11.0], [-82.9, 9.6], [-82.2, 9.0], [-81.0, 8.9], [-79.5, 9.6],
       [-78.5, 9.4], [-77.4, 8.6], [-76.9, 8.2], [-75.5, 10.4], [-74.8, 11.0], [-74.2, 11.25],
       [-72.9, 11.5], [-71.3, 12.4], [-71.6, 11.6], [-71.0, 10.5], [-70.2, 11.4], [-68.4, 10.5],
       [-67.0, 10.6], [-65.9, 10.3], [-64.7, 10.6], [-63.9, 10.7], [-62.9, 10.7], [-62.0, 9.9],
       [-60.9, 9.4], [-60.0, 8.5], [-58, 8.0], [-90, 8.0]],
      [[-84.95, 21.9], [-83.0, 22.2], [-81.5, 23.2], [-80.0, 23.2], [-78.5, 22.5], [-77.0, 21.6],
       [-75.6, 21.1], [-74.1, 20.3], [-74.8, 19.9], [-76.5, 19.9], [-77.7, 20.7], [-79.5, 21.6],
       [-82.0, 21.9], [-83.5, 21.85]],
      [[-78.4, 18.5], [-76.2, 18.5], [-76.2, 17.8], [-78.4, 18.1]],
      [[-74.5, 20.0], [-71.7, 19.9], [-69.9, 19.9], [-68.3, 18.6], [-70.0, 18.2], [-71.7, 17.9],
       [-73.4, 18.2], [-74.5, 18.6]],
      [[-67.3, 18.5], [-65.6, 18.5], [-65.6, 17.9], [-67.2, 17.9]],
      [[-78.9, 26.7], [-77.6, 26.9], [-77.0, 26.5], [-78.5, 26.3]],
      [[-77.9, 25.15], [-77.3, 25.2], [-77.3, 24.7], [-77.9, 24.9]],
      [[-76.5, 23.7], [-75.6, 24.2], [-75.3, 23.6], [-76.2, 23.2]],
      [[-61.9, 10.85], [-60.9, 10.85], [-60.9, 10.05], [-61.9, 10.1]],
    ],
    inseln: [[-63.05, 18.05, 4], [-62.72, 17.3, 4], [-61.85, 17.1, 5], [-61.55, 16.25, 5],
             [-61.38, 15.4, 4], [-61.02, 14.65, 5], [-60.97, 13.9, 4], [-59.55, 13.15, 4],
             [-61.2, 13.25, 4], [-61.7, 12.1, 4], [-70.03, 12.5, 4], [-68.93, 12.15, 4],
             [-68.28, 12.15, 3], [-64.93, 18.34, 3], [-64.6, 18.45, 3], [-81.38, 19.3, 4],
             [-83.05, 21.55, 4], [-64.0, 11.0, 4]],
  },

  nord: {
    name: "Nordeuropa",
    box: [-25, 48, 32, 72],
    land: [
      [[7.0, 58.0], [5.5, 58.6], [5.3, 60.4], [5.0, 61.6], [6.15, 62.5], [8.5, 63.1], [10.4, 63.45],
       [12.0, 65.0], [14.4, 67.3], [16.5, 68.6], [18.95, 69.65], [21.0, 70.2], [23.7, 70.7],
       [25.8, 71.15], [28.5, 70.95], [30.5, 69.8], [31.0, 68.0], [29.8, 66.5], [30.2, 64.5],
       [31.5, 63.0], [31.0, 61.3], [30.3, 60.0], [28.0, 60.2], [26.9, 60.5], [25.0, 60.17],
       [22.3, 60.45], [21.3, 61.5], [21.5, 63.2], [22.5, 64.6], [24.5, 65.75], [22.3, 65.5],
       [20.3, 63.8], [17.9, 62.6], [17.3, 60.7], [18.1, 59.35], [16.8, 58.6], [16.5, 57.0],
       [14.7, 56.1], [13.0, 55.4], [12.6, 56.2], [11.9, 57.7], [11.2, 58.8], [10.7, 59.9],
       [9.7, 59.1], [8.0, 58.15]],
      [[32, 59.0], [28.9, 59.4], [26.5, 59.5], [24.7, 59.5], [23.5, 58.4], [24.0, 57.6], [21.0, 56.2],
       [21.1, 55.7], [19.6, 54.6], [18.65, 54.4], [16.2, 54.5], [14.3, 54.0], [13.7, 54.3],
       [12.1, 54.2], [11.0, 54.4], [10.2, 54.4], [9.9, 54.8], [8.9, 54.4], [8.6, 53.9], [8.8, 53.5],
       [8.0, 53.6], [7.2, 53.5], [6.2, 53.5], [5.0, 52.9], [4.5, 52.4], [4.1, 51.9], [3.4, 51.4],
       [3.1, 51.3], [2.3, 51.1], [1.6, 50.9], [0.5, 50.1], [0.0, 49.4], [-1.5, 49.4], [-2.0, 48],
       [32, 48]],
      [[9.9, 54.85], [9.4, 55.5], [8.2, 55.5], [8.1, 56.5], [8.6, 57.1], [9.6, 57.6], [10.6, 57.75],
       [10.4, 57.0], [10.9, 56.5], [10.3, 56.0], [9.9, 55.4]],
      [[11.8, 55.95], [12.65, 56.1], [12.6, 55.3], [11.7, 55.2]],
      [[9.8, 55.6], [10.8, 55.6], [10.8, 55.0], [9.9, 55.1]],
      [[-5.7, 50.1], [-3.5, 50.6], [-1.4, 50.6], [0.7, 51.0], [1.75, 52.48], [0.3, 53.5], [-0.2, 54.1],
       [-1.6, 55.0], [-2.0, 56.0], [-2.9, 56.4], [-2.1, 57.15], [-3.0, 57.7], [-4.0, 57.9],
       [-3.0, 58.6], [-5.0, 58.6], [-5.8, 58.3], [-5.5, 57.5], [-5.8, 56.7], [-5.0, 55.9],
       [-4.9, 55.0], [-4.8, 54.6], [-3.0, 54.1], [-3.0, 53.4], [-4.2, 53.3], [-4.8, 52.9],
       [-4.2, 52.2], [-5.0, 51.8], [-3.5, 51.4], [-4.2, 51.2], [-5.2, 50.4]],
      [[-6.0, 55.2], [-5.5, 54.6], [-6.2, 54.1], [-6.0, 53.4], [-6.1, 52.2], [-7.5, 51.9],
       [-9.5, 51.5], [-10.0, 52.2], [-9.8, 53.4], [-10.0, 54.2], [-8.3, 55.2], [-7.0, 55.4]],
      [[-24.5, 65.5], [-22.5, 66.5], [-18.3, 66.4], [-18.15, 65.55], [-17.95, 66.4], [-15.0, 66.3],
       [-14.5, 65.5], [-16.5, 64.3], [-19.0, 63.4], [-21.4, 63.85], [-22.1, 64.35], [-22.85, 64.15],
       [-24.5, 64.8]],
    ],
    inseln: [[-6.85, 62.0, 5], [-1.2, 60.25, 4], [-3.0, 59.0, 4], [18.3, 57.6, 5], [22.0, 58.4, 5]],
  },

  atlantik: {
    name: "Atlantik",
    box: [-85, 10, 15, 62],
    land: [
      [[-85, 62], [-64, 62], [-64, 58], [-56, 53], [-55, 50], [-52.5, 47.5], [-59, 46], [-63.6, 44.6],
       [-66, 44], [-70, 43], [-71, 42.3], [-74, 40.7], [-75.5, 39], [-76, 37], [-78, 34], [-80.5, 32],
       [-81, 31], [-80.1, 26.0], [-80.4, 25.2], [-82, 27], [-83, 29], [-85, 29.5]],
      [[-90, 21.5], [-86.8, 21.5], [-87.8, 18.2], [-88.9, 15.9], [-83.9, 15.8], [-83.4, 13.0],
       [-82.2, 9.0], [-79.5, 9.6], [-77.4, 8.6], [-75.5, 10.4], [-71.3, 12.4], [-68.4, 10.5],
       [-64.7, 10.6], [-62.0, 9.9], [-60.0, 8.5], [-58, 8.0], [-90, 8.0]],
      [[15, 62], [5, 58], [4, 52], [-2, 49], [-5, 48], [-1, 44], [-9, 43], [-9.2, 38.7], [-6, 36],
       [-9.8, 31], [-13, 27], [-17, 21], [-17.5, 14.7], [-16, 12], [-15, 10], [15, 10]],
      [[-84.95, 21.9], [-80.0, 23.2], [-77.0, 21.6], [-74.1, 20.3], [-76.5, 19.9], [-79.5, 21.6],
       [-83.5, 21.85]],
      [[-74.5, 20.0], [-69.9, 19.9], [-68.3, 18.6], [-71.7, 17.9], [-73.4, 18.2]],
      [[-5.7, 50.1], [0.7, 51.0], [1.75, 52.48], [-0.2, 54.1], [-2.0, 56.0], [-3.0, 58.6],
       [-5.8, 58.3], [-5.0, 55.9], [-3.0, 53.4], [-4.8, 52.9], [-5.0, 51.8], [-4.2, 51.2]],
      [[-6.0, 55.2], [-6.0, 53.4], [-6.1, 52.2], [-9.5, 51.5], [-10.0, 54.2], [-8.3, 55.2]],
    ],
    wasser: [
      [[-5.6, 35.9], [-2.5, 35.4], [1.0, 36.2], [5.0, 36.7], [10.0, 36.4], [12.5, 37.3], [15, 37.0],
       [15, 38.5], [15.6, 38.2], [15.0, 40.0], [14.4, 40.85], [12.2, 41.4], [11.9, 42.1],
       [10.45, 43.5], [9.9, 44.1], [8.8, 44.5], [7.0, 43.9], [5.2, 43.4], [3.0, 43.0], [2.6, 42.4],
       [-0.5, 40.3], [-1.1, 37.9], [-2.5, 37.0], [-4.5, 36.85], [-5.5, 36.2]],
      [[4.0, 51.6], [7.0, 53.3], [8.5, 55.0], [8.0, 57.0], [10.7, 57.9], [12.5, 56.0], [15, 55.5],
       [15, 53.5], [11.0, 53.6], [7.5, 53.2], [4.5, 52.2], [3.0, 51.6]],
    ],
    inseln: [[2.65, 39.6, 5], [9.0, 41.0, 6], [13.8, 37.6, 6], [-25.5, 37.8, 4], [-28.0, 38.5, 4], [-31.1, 39.4, 3], [-16.9, 32.7, 4], [-15.6, 28.1, 4],
             [-16.6, 28.3, 4], [-13.6, 29.0, 3], [-64.8, 32.3, 3], [-77.5, 25.0, 4], [-66.1, 18.4, 4],
             [-61.5, 16.0, 4], [-61.0, 14.0, 4], [-59.6, 13.1, 3], [-81.4, 19.3, 3]],
  },
};

/* Häfen mit Koordinaten – Grundlage für Karte und Suche */
const HAFENLISTE = [
  ["Barcelona", 2.17, 41.38], ["Palma de Mallorca", 2.65, 39.57], ["Ibiza", 1.43, 38.91],
  ["Valencia", -0.32, 39.46], ["Málaga", -4.42, 36.72], ["Cartagena", -0.99, 37.6],
  ["Marseille", 5.37, 43.3], ["Toulon", 5.93, 43.12], ["Nizza", 7.27, 43.7], ["Cannes", 7.02, 43.55],
  ["Monaco", 7.42, 43.73], ["Genua", 8.93, 44.41], ["Savona", 8.48, 44.31], ["La Spezia", 9.83, 44.1],
  ["Livorno", 10.31, 43.55], ["Civitavecchia (Rom)", 11.8, 42.09], ["Neapel", 14.26, 40.84],
  ["Salerno", 14.76, 40.68], ["Messina", 15.55, 38.19], ["Palermo", 13.36, 38.12],
  ["Catania", 15.09, 37.5], ["Valletta", 14.51, 35.9], ["Cagliari", 9.11, 39.22],
  ["Olbia", 9.5, 40.92], ["Ajaccio", 8.74, 41.93], ["Bastia", 9.45, 42.7],
  ["Venedig", 12.34, 45.44], ["Triest", 13.77, 45.65], ["Ravenna", 12.28, 44.49],
  ["Ancona", 13.51, 43.62], ["Bari", 16.87, 41.13], ["Dubrovnik", 18.09, 42.65],
  ["Split", 16.44, 43.51], ["Zadar", 15.23, 44.12], ["Kotor", 18.77, 42.42],
  ["Korfu", 19.92, 39.62], ["Katakolon", 21.32, 37.65], ["Piräus (Athen)", 23.62, 37.94],
  ["Mykonos", 25.33, 37.45], ["Santorini", 25.43, 36.42], ["Rhodos", 28.22, 36.45],
  ["Heraklion (Kreta)", 25.14, 35.34], ["Thessaloniki", 22.94, 40.63], ["Istanbul", 28.98, 41.01],
  ["Izmir", 27.14, 38.42], ["Kusadasi", 27.26, 37.86], ["Bodrum", 27.43, 37.03],
  ["Antalya", 30.71, 36.89], ["Limassol", 33.04, 34.68], ["Haifa", 34.99, 32.82],
  ["Ashdod", 34.65, 31.81], ["Alexandria", 29.92, 31.2], ["Tunis (La Goulette)", 10.3, 36.82],
  ["Tanger", -5.8, 35.79], ["Gibraltar", -5.35, 36.14], ["Ceuta", -5.32, 35.89],
  ["Las Palmas", -15.42, 28.14], ["Santa Cruz de Tenerife", -16.25, 28.47],
  ["Arrecife (Lanzarote)", -13.55, 28.96], ["Puerto del Rosario", -13.86, 28.5],
  ["Santa Cruz de La Palma", -17.76, 28.68], ["Funchal (Madeira)", -16.91, 32.65],
  ["Lissabon", -9.14, 38.71], ["Porto (Leixões)", -8.7, 41.19], ["Cádiz", -6.29, 36.53],
  ["Casablanca", -7.62, 33.6], ["Agadir", -9.6, 30.42],
  ["Miami", -80.19, 25.77], ["Fort Lauderdale", -80.14, 26.12], ["Port Canaveral", -80.6, 28.41],
  ["Tampa", -82.45, 27.95], ["Key West", -81.78, 24.56], ["Nassau", -77.34, 25.06],
  ["Freeport", -78.7, 26.53], ["Havanna", -82.36, 23.13], ["Cozumel", -86.95, 20.51],
  ["Costa Maya", -87.72, 18.73], ["Roatán", -86.53, 16.32], ["Belize City", -88.19, 17.5],
  ["Colón (Panama)", -79.9, 9.36], ["Cartagena (Kolumbien)", -75.51, 10.4],
  ["Oranjestad (Aruba)", -70.03, 12.52], ["Willemstad (Curaçao)", -68.93, 12.11],
  ["Kralendijk (Bonaire)", -68.28, 12.15], ["Ocho Rios", -77.1, 18.41],
  ["Montego Bay", -77.92, 18.47], ["George Town (Cayman)", -81.38, 19.3],
  ["Labadee", -72.24, 19.75], ["Puerto Plata", -70.68, 19.8], ["La Romana", -68.95, 18.42],
  ["San Juan", -66.11, 18.47], ["Charlotte Amalie (St. Thomas)", -64.93, 18.34],
  ["Road Town (Tortola)", -64.62, 18.42], ["Philipsburg (St. Maarten)", -63.05, 18.02],
  ["Basseterre (St. Kitts)", -62.72, 17.3], ["St. John's (Antigua)", -61.85, 17.12],
  ["Pointe-à-Pitre", -61.53, 16.24], ["Roseau (Dominica)", -61.39, 15.3],
  ["Fort-de-France", -61.07, 14.6], ["Castries (St. Lucia)", -60.99, 14.01],
  ["Bridgetown (Barbados)", -59.62, 13.1], ["Kingstown (St. Vincent)", -61.22, 13.16],
  ["St. George's (Grenada)", -61.75, 12.05], ["Port of Spain", -61.51, 10.65],
  ["Kiel", 10.14, 54.32], ["Hamburg", 9.97, 53.54], ["Warnemünde", 12.09, 54.18],
  ["Bremerhaven", 8.58, 53.54], ["Kopenhagen", 12.6, 55.68], ["Oslo", 10.73, 59.91],
  ["Kristiansand", 8.0, 58.15], ["Stavanger", 5.73, 58.97], ["Bergen", 5.32, 60.39],
  ["Ålesund", 6.16, 62.47], ["Geiranger", 7.21, 62.1], ["Flåm", 7.11, 60.86],
  ["Trondheim", 10.4, 63.43], ["Bodø", 14.4, 67.28], ["Tromsø", 18.96, 69.65],
  ["Honningsvåg (Nordkap)", 25.97, 70.98], ["Stockholm", 18.07, 59.33], ["Helsinki", 24.94, 60.17],
  ["Tallinn", 24.75, 59.44], ["Riga", 24.11, 56.95], ["Klaipėda", 21.13, 55.7],
  ["Gdynia", 18.55, 54.52], ["Danzig", 18.65, 54.35], ["Visby", 18.3, 57.64],
  ["Göteborg", 11.97, 57.71], ["IJmuiden (Amsterdam)", 4.6, 52.46], ["Rotterdam", 4.48, 51.92],
  ["Zeebrügge", 3.2, 51.33], ["Le Havre", 0.11, 49.49], ["Southampton", -1.4, 50.9],
  ["Dover", 1.31, 51.13], ["Leith (Edinburgh)", -3.17, 55.99], ["Invergordon", -4.17, 57.69],
  ["Kirkwall (Orkney)", -2.96, 58.98], ["Lerwick (Shetland)", -1.15, 60.16],
  ["Reykjavík", -21.94, 64.15], ["Akureyri", -18.09, 65.68], ["Ísafjörður", -23.13, 66.07],
  ["Tórshavn (Färöer)", -6.77, 62.01], ["Belfast", -5.93, 54.6], ["Dublin", -6.21, 53.35],
  ["Cobh (Cork)", -8.3, 51.85],
  ["Ponta Delgada (Azoren)", -25.67, 37.74], ["Horta (Azoren)", -28.63, 38.53],
  ["Hamilton (Bermuda)", -64.78, 32.29], ["New York", -74.02, 40.7],
  ["Halifax", -63.57, 44.65], ["Saint John's (Neufundland)", -52.71, 47.56],
].map((h) => ({ n: h[0], lon: h[1], lat: h[2] }));

function normText(s) {
  return (s || "").toLowerCase()
    .replace(/[àáâä]/g, "a").replace(/[èéêë]/g, "e").replace(/[ìíîï]/g, "i")
    .replace(/[òóôöø]/g, "o").replace(/[ùúûü]/g, "u").replace(/[å]/g, "a")
    .replace(/ß/g, "ss").replace(/[^a-z0-9]/g, "");
}

function hafenVorschlaege(q) {
  const s = normText(q);
  if (s.length < 2) return [];
  const treffer = HAFENLISTE.filter((h) => normText(h.n).indexOf(s) >= 0);
  treffer.sort((a, b) => normText(a.n).indexOf(s) - normText(b.n).indexOf(s));
  return treffer.slice(0, 6);
}

/* Entfernung in Seemeilen */
function seemeilen(a, b) {
  const R = 3440.065;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}

function regionWaehlen(punkte, route) {
  const kandidaten = Object.keys(REGIONEN).filter((k) => k !== "atlantik");
  const passend = kandidaten.filter((k) => {
    const [x0, y0, x1, y1] = REGIONEN[k].box;
    return punkte.every((p) => p.lon >= x0 && p.lon <= x1 && p.lat >= y0 && p.lat <= y1);
  });
  if (punkte.length > 0 && passend.length > 0) {
    passend.sort((a, b) => {
      const fa = REGIONEN[a].box, fb = REGIONEN[b].box;
      return (fa[2] - fa[0]) * (fa[3] - fa[1]) - (fb[2] - fb[0]) * (fb[3] - fb[1]);
    });
    return passend[0];
  }
  if (punkte.length > 0) return "atlantik";
  const zuordnung = { karibik: "karibik", mittel: "mittel", nord: "nord", trans: "atlantik" };
  return zuordnung[route] || "mittel";
}

function Karte({ haefen, route, linie = true, nummern = true }) {
  const punkte = haefen.filter((h) => typeof h.lon === "number" && typeof h.lat === "number");
  const regKey = regionWaehlen(punkte, route);
  const reg = REGIONEN[regKey];

  /* Ausschnitt bestimmen */
  let [bx0, by0, bx1, by1] = reg.box;
  const drin = punkte.filter((p) => p.lon >= bx0 && p.lon <= bx1 && p.lat >= by0 && p.lat <= by1);
  if (drin.length >= 2) {
    const lons = drin.map((p) => p.lon), lats = drin.map((p) => p.lat);
    const pufX = Math.max(2.5, (Math.max(...lons) - Math.min(...lons)) * 0.3);
    const pufY = Math.max(1.5, (Math.max(...lats) - Math.min(...lats)) * 0.3);
    bx0 = Math.max(bx0, Math.min(...lons) - pufX);
    bx1 = Math.min(bx1, Math.max(...lons) + pufX);
    by0 = Math.max(by0, Math.min(...lats) - pufY);
    by1 = Math.min(by1, Math.max(...lats) + pufY);
  }

  const lat0 = (by0 + by1) / 2;
  const k = Math.cos(lat0 * Math.PI / 180);
  const X = (lon) => lon * k;
  const bxs = [X(bx0), X(bx1)];
  const breite = 1000;
  const wProj = bxs[1] - bxs[0];
  const hProj = by1 - by0;
  let skala = breite / wProj;
  let hoehe = hProj * skala;
  if (hoehe > 820) { skala = 820 / hProj; hoehe = 820; }
  if (hoehe < 360) hoehe = 360;
  hoehe = Math.round(hoehe);
  const offX = (breite - wProj * skala) / 2;
  const offY = (hoehe - hProj * skala) / 2;
  const zx = (lon) => (X(lon) - bxs[0]) * skala + offX;
  const zy = (lat) => (by1 - lat) * skala + offY;
  const px = (p) => [zx(p.lon), zy(p.lat)];

  const pfad = (ring) => ring.map((c, i) =>
    (i ? "L" : "M") + zx(c[0]).toFixed(1) + " " + zy(c[1]).toFixed(1)
  ).join(" ") + " Z";

  /* Gitternetz */
  const schrittX = (bx1 - bx0) > 40 ? 20 : (bx1 - bx0) > 15 ? 10 : 5;
  const schrittY = (by1 - by0) > 30 ? 10 : (by1 - by0) > 12 ? 5 : 2;
  const linienX = [], linienY = [];
  for (let v = Math.ceil(bx0 / schrittX) * schrittX; v <= bx1; v += schrittX) linienX.push(v);
  for (let v = Math.ceil(by0 / schrittY) * schrittY; v <= by1; v += schrittY) linienY.push(v);

  const gesamt = punkte.reduce((a, p, i) => i ? a + seemeilen(punkte[i - 1], p) : 0, 0);

  /* Maßstabsleiste */
  const pxProSm = skala / 60;
  const stufen = [25, 50, 100, 200, 500, 1000];
  let smBalken = stufen[0];
  stufen.forEach((v) => { if (v * pxProSm <= 260) smBalken = v; });
  const balkenBreite = smBalken * pxProSm;

  const gradLon = (v) => `${Math.abs(Math.round(v))}°${v < 0 ? "W" : "O"}`;
  const gradLat = (v) => `${Math.abs(Math.round(v))}°${v < 0 ? "S" : "N"}`;

  /* kleine Windrose in der Ecke */
  const rx = breite - 78, ry = 78, rr = 32;
  const roseStriche = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * 22.5 * Math.PI) / 180;
    const lang = i % 4 === 0;
    roseStriche.push(
      <line key={"rs" + i}
        x1={rx + (rr - (lang ? 9 : 5)) * Math.sin(a)} y1={ry - (rr - (lang ? 9 : 5)) * Math.cos(a)}
        x2={rx + rr * Math.sin(a)} y2={ry - rr * Math.cos(a)}
        stroke={C.messing} strokeWidth={lang ? 1.3 : 0.7} opacity="0.75" />
    );
  }

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        background: C.wasser, borderRadius: RUND, overflow: "hidden",
        border: `1px solid ${C.line}`, boxShadow: `inset 0 0 0 1px ${C.messingLeise}`,
      }}>
        <svg viewBox={`0 0 ${breite} ${hoehe}`} width="100%" style={{ display: "block" }}
          role="img" aria-label={`Seekarte ${reg.name} mit euren Häfen`}>
          <rect x="0" y="0" width={breite} height={hoehe} fill={C.wasser} />

          {linienX.map((v) => (
            <line key={"gx" + v} x1={zx(v)} y1="0" x2={zx(v)} y2={hoehe}
              stroke={C.wasserLinie} strokeWidth="1" />
          ))}
          {linienY.map((v) => (
            <line key={"gy" + v} x1="0" y1={zy(v)} x2={breite} y2={zy(v)}
              stroke={C.wasserLinie} strokeWidth="1" />
          ))}

          {reg.land.map((ring, i) => (
            <path key={"l" + i} d={pfad(ring)} fill={C.land} stroke={C.landLinie} strokeWidth="1.8"
              strokeLinejoin="round" />
          ))}
          {(reg.wasser || []).map((ring, i) => (
            <path key={"w" + i} d={pfad(ring)} fill={C.wasser} stroke={C.landLinie} strokeWidth="1.8"
              strokeLinejoin="round" />
          ))}
          {reg.inseln.map((s, i) => {
            const [x, y] = px({ lon: s[0], lat: s[1] });
            return <circle key={"i" + i} cx={x} cy={y} r={s[2]} fill={C.land} stroke={C.landLinie} strokeWidth="1.4" />;
          })}

          {linienX.map((v) => (
            <text key={"tx" + v} x={zx(v) + 5} y={hoehe - 9} fontFamily={MONO} fontSize="13"
              fill={C.muted} opacity="0.85">{gradLon(v)}</text>
          ))}
          {linienY.map((v) => (
            <text key={"ty" + v} x="7" y={zy(v) - 6} fontFamily={MONO} fontSize="13"
              fill={C.muted} opacity="0.85">{gradLat(v)}</text>
          ))}

          <g opacity="0.9">
            <circle cx={rx} cy={ry} r={rr} fill="none" stroke={C.messing} strokeWidth="1" opacity="0.6" />
            {roseStriche}
            <polygon points={`${rx},${ry - rr + 4} ${rx - 5},${ry} ${rx},${ry - 9} ${rx + 5},${ry}`}
              fill={C.messing} />
            <text x={rx} y={ry - rr - 7} textAnchor="middle" fontFamily={MONO} fontSize="12"
              fill={C.messing} letterSpacing="1">N</text>
          </g>

          {linie && punkte.length > 1 && (
            <path d={punkte.map((p, i) => {
              const [x, y] = px(p);
              return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
            }).join(" ")}
              fill="none" stroke={C.messing} strokeWidth="3.5" strokeDasharray="11 8"
              strokeLinecap="round" strokeLinejoin="round" />
          )}

          {punkte.map((p, i) => {
            const [x, y] = px(p);
            const rechts = x < breite * 0.62;
            const r = nummern ? 14 : 9;
            return (
              <g key={"p" + i}>
                <circle cx={x} cy={y} r={r} fill={C.tiefsee} />
                <circle cx={x} cy={y} r={r} fill="none" stroke={C.messing} strokeWidth="2" />
                {nummern && (
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fill={C.messingHell}
                    fontFamily={MONO}>{i + 1}</text>
                )}
                {punkte.length <= 12 && (
                  <text x={rechts ? x + r + 7 : x - r - 7} y={y + 6} textAnchor={rechts ? "start" : "end"}
                    fontSize="21" fill={C.navy} fontFamily={SANS} stroke={C.wasser} strokeWidth="5"
                    paintOrder="stroke">{p.name || "Hafen"}</text>
                )}
              </g>
            );
          })}

          <g transform={`translate(18 ${hoehe - 34})`}>
            <line x1="0" y1="0" x2={balkenBreite} y2="0" stroke={C.navy} strokeWidth="2" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke={C.navy} strokeWidth="2" />
            <line x1={balkenBreite} y1="-5" x2={balkenBreite} y2="5" stroke={C.navy} strokeWidth="2" />
            <text x={balkenBreite / 2} y="-11" textAnchor="middle" fontFamily={MONO} fontSize="13"
              fill={C.navy}>{smBalken} sm</text>
          </g>
        </svg>
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.3, textTransform: "uppercase",
        color: C.muted, marginTop: 10,
      }}>
        <span>{reg.name}{punkte.length < 2 ? " · noch keine Route" : ""}</span>
        {gesamt > 0 && (
          <span>{gesamt.toLocaleString("de-DE")} sm · rund {Math.round(gesamt / 18)} Std. Fahrt</span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MODUL 5 – LANDGANG
========================================================= */
function minuten(hhmm) {
  if (!hhmm || hhmm.indexOf(":") < 0) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}
function alsZeit(min) {
  if (min === null || min < 0) return "–";
  return `${zwei(Math.floor(min / 60))}:${zwei(min % 60)}`;
}

const AMPEL = {
  nah: { farbe: C.green, bg: C.greenSoft, titel: "Grün, macht es selbst",
    text: "Der Hafen liegt im Zentrum oder ihr kommt zu Fuß beziehungsweise mit einer kurzen Bahnfahrt hin, weshalb ihr für den Reederei-Bus vor allem Bequemlichkeit zahlen würdet." },
  mittel: { farbe: C.warn, bg: C.warnSoft, titel: "Gelb, überlegt es euch",
    text: "Bei einer Stunde Fahrt oder mehr lässt sich Verkehr nicht planen, weshalb ihr einen Anbieter braucht, der euch garantiert rechtzeitig zurückbringt." },
  weit: { farbe: "#B02A2A", bg: "#F9E7E5", titel: "Rot, nehmt die Reederei",
    text: "Die Fahrt ist weit, das Zeitfenster knapp oder die Verkehrslage unbekannt, und beim Reederei-Ausflug wartet das Schiff auf euch, während auf eigene Faust niemand wartet." },
};

function HafenFeld({ eintrag, onAendern }) {
  const [offen, setOffen] = useState(false);
  const vorschlaege = offen ? hafenVorschlaege(eintrag.name) : [];
  const hatKoordinaten = typeof eintrag.lon === "number";
  return (
    <div style={{ marginBottom: 16, position: "relative" }}>
      <label style={{ display: "block", fontFamily: SANS, fontSize: 13.5, color: C.body, marginBottom: 6 }}>
        Hafen
      </label>
      <input value={eintrag.name} placeholder="Name eintippen, z. B. Funchal"
        onChange={(e) => { onAendern({ name: e.target.value, lon: null, lat: null }); setOffen(true); }}
        onFocus={() => setOffen(true)}
        onBlur={() => setTimeout(() => setOffen(false), 180)}
        style={{
          width: "100%", boxSizing: "border-box", fontFamily: SANS, fontSize: 16, color: C.navy,
          background: C.white, border: `1px solid ${hatKoordinaten ? C.green : C.line}`,
          borderRadius: 10, padding: "13px 14px", minHeight: 46,
        }} />
      <div style={{ fontFamily: SANS, fontSize: 12.5, color: hatKoordinaten ? C.green : C.muted, marginTop: 6 }}>
        {hatKoordinaten ? "Steht auf der Karte" : "Wählt einen Vorschlag, dann erscheint der Hafen auf der Karte."}
      </div>
      {vorschlaege.length > 0 && (
        <div style={{
          position: "absolute", left: 0, right: 0, top: 76, zIndex: 20,
          background: C.white, border: `1px solid ${C.line}`, borderRadius: 12,
          overflow: "hidden", boxShadow: "0 8px 24px rgba(18,57,92,0.14)",
        }}>
          {vorschlaege.map((v) => (
            <button key={v.n} type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onAendern({ name: v.n, lon: v.lon, lat: v.lat }); setOffen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left", cursor: "pointer",
                background: "transparent", border: "none", borderBottom: `1px solid ${C.line}`,
                padding: "13px 14px", minHeight: 46, fontFamily: SANS, fontSize: 15, color: C.navy,
              }}>{v.n}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModulLandgang({ daten, setze }) {
  const h = daten.haefen;
  const notizen = useMemo(() => notizArchiv(daten.archiv || []), [daten.archiv]);
  function add() {
    setze("haefen", [...h, { id: "h" + Date.now(), name: "", lon: null, lat: null, an: "08:00", ab: "18:00", puffer: "45", weg: "", note: "", sterne: 0 }]);
  }
  function upd(id, teil) {
    setze("haefen", h.map((x) => (x.id === id ? { ...x, ...teil } : x)));
  }
  function schieben(i, richtung) {
    const j = i + richtung;
    if (j < 0 || j >= h.length) return;
    const kopie = h.slice();
    const merk = kopie[i]; kopie[i] = kopie[j]; kopie[j] = merk;
    setze("haefen", kopie);
  }

  return (
    <div>
      <Kicker>Modul 5</Kicker>
      <H2>Der Landgang-Planer</H2>
      <Lead>
        <span>Ein Hafentag fühlt sich lang an, ist aber kürzer als gedacht, weil Ausschiffung, Weg zum Zentrum und Rückweg schnell drei Stunden fressen.</span>
      </Lead>

      <Karte haefen={h} route={daten.setup.route} />

      {h.length === 0 && (
        <Card>
          <P style={{ margin: 0, fontSize: 14.5 }}>
            Legt für jeden Hafen einen Eintrag an, tragt Ankunft und Abfahrt ein, und wir zeichnen euch die Route auf die Karte und rechnen aus, wie viel Zeit ihr wirklich habt statt der Zeit, die auf dem Papier steht.
          </P>
        </Card>
      )}

      {h.map((x, i) => {
        const an = minuten(x.an);
        const ab = minuten(x.ab);
        const puf = parseInt(x.puffer || "45", 10) || 45;
        const bord = ab !== null ? ab - puf : null;
        const netto = an !== null && bord !== null ? bord - an - 60 : null;
        const amp = x.weg ? AMPEL[x.weg] : null;
        const vor = i > 0 ? h[i - 1] : null;
        const strecke = vor && typeof vor.lon === "number" && typeof x.lon === "number"
          ? seemeilen(vor, x) : null;
        return (
          <Card key={x.id} tone="white">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{
                width: 30, height: 30, borderRadius: "50%", background: C.navy, color: C.white,
                display: "grid", placeItems: "center", fontFamily: SANS, fontSize: 14, flexShrink: 0,
              }}>{i + 1}</span>
              <div style={{ flex: 1, fontFamily: SANS, fontSize: 13, color: C.muted }}>
                {strecke ? `${strecke.toLocaleString("de-DE")} sm ab ${vor.name || "vorherigem Hafen"}` : "Reihenfolge der Route"}
              </div>
              <button type="button" onClick={() => schieben(i, -1)} aria-label="nach oben" style={{
                background: "transparent", border: `1px solid ${C.line}`, borderRadius: 3,
                cursor: "pointer", color: C.body, width: 44, height: 44, fontSize: 15,
              }}>↑</button>
              <button type="button" onClick={() => schieben(i, 1)} aria-label="nach unten" style={{
                background: "transparent", border: `1px solid ${C.line}`, borderRadius: 3,
                cursor: "pointer", color: C.body, width: 44, height: 44, fontSize: 15,
              }}>↓</button>
              <button type="button" onClick={() => setze("haefen", h.filter((y) => y.id !== x.id))}
                aria-label="Hafen entfernen" style={{
                  background: "transparent", border: "none", cursor: "pointer", color: C.muted,
                  width: 44, height: 44, display: "grid", placeItems: "center",
                }}><X size={17} /></button>
            </div>

            <HafenFeld eintrag={x} onAendern={(teil) => upd(x.id, teil)} />

            {notizen[normText(x.name)] && (
              <div style={{
                background: C.sand, borderRadius: 3, padding: "14px 15px", marginBottom: 18,
                borderLeft: `2px solid ${C.messing}`,
              }}>
                <div style={{
                  fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                  color: C.muted, marginBottom: 7,
                }}>Aus eurem Fahrtenbuch</div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                  <Sterne wert={notizen[normText(x.name)].sterne} />
                  {notizen[normText(x.name)].schiff && (
                    <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.muted }}>
                      {notizen[normText(x.name)].schiff}
                    </span>
                  )}
                </div>
                {notizen[normText(x.name)].note && (
                  <div style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: C.navy }}>
                    {notizen[normText(x.name)].note}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}><Feld label="Ankunft" type="time" wert={x.an} onChange={(v) => upd(x.id, { an: v })} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><Feld label="Abfahrt" type="time" wert={x.ab} onChange={(v) => upd(x.id, { ab: v })} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><Feld label="Bordzeit" type="number" wert={x.puffer} onChange={(v) => upd(x.id, { puffer: v })} hinweis="Min. vorher" /></div>
            </div>

            <div style={{ background: C.skySoft, borderRadius: 12, padding: "16px", marginBottom: 18 }}>
              <div style={{ fontFamily: SANS, fontSize: 14, color: C.body, marginBottom: 6 }}>
                Bordzeit: <strong style={{ color: C.navy }}>{alsZeit(bord)}</strong> — und nur die zählt.
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 22, color: C.navy }}>
                {netto !== null && netto > 0
                  ? `Ihr habt realistisch ${Math.floor(netto / 60)} Std. ${zwei(netto % 60)} Min.`
                  : "Zeiten eintragen"}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: C.muted, marginTop: 6 }}>
                Ausschiffung, Wege und Rückpuffer sind bereits abgezogen.
              </div>
            </div>

            <Wahl label="Wie weit wollt ihr weg vom Hafen?" wert={x.weg} onChange={(v) => upd(x.id, { weg: v })}
              optionen={[{ v: "nah", l: "Zentrum, zu Fuß" }, { v: "mittel", l: "bis eine Stunde" }, { v: "weit", l: "weiter weg" }]} />

            {amp && (
              <div style={{ background: amp.bg, borderRadius: 3, padding: "16px" }}>
                <div style={{ fontFamily: SANS, fontSize: 15, color: amp.farbe, marginBottom: 7 }}>{amp.titel}</div>
                <div style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.62, color: C.navy }}>{amp.text}</div>
              </div>
            )}

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
              <div style={{
                fontFamily: MONO, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
                color: C.muted, marginBottom: 8,
              }}>Notiz fürs Fahrtenbuch</div>
              <textarea value={x.note || ""} rows={2}
                onChange={(e) => upd(x.id, { note: e.target.value })}
                placeholder="Was solltet ihr beim nächsten Mal anders machen?"
                style={{ ...eingabeStil, fontFamily: SANS, resize: "vertical", lineHeight: 1.6 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <span style={{
                  fontFamily: MONO, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted,
                }}>Hafen</span>
                <Sterne wert={x.sterne} onChange={(v) => upd(x.id, { sterne: v })} />
              </div>
            </div>
          </Card>
        );
      })}

      <Btn full variant="outline" onClick={add} style={{ marginBottom: 26 }}>
        <Plus size={16} /> Hafen hinzufügen
      </Btn>

      <Card tone="sand">
        <H3>Unsere Hafentag-Regeln</H3>
        <P style={{ marginBottom: 0, fontSize: 14.5 }}>
          Plant eine Sache pro Hafen richtig statt drei halb, seid mindestens eine Stunde vor der Bordzeit zurück und nehmt immer Wasser, einen Snack und die Kopie der Bordkarte mit, weil genau das fehlt, wenn es unangenehm wird.
        </P>
      </Card>
    </div>
  );
}

/* =========================================================
   MODUL 6 – ERSTER TAG
========================================================= */
function ModulTag1({ daten, setzeHaken }) {
  return (
    <div>
      <Kicker>Modul 6</Kicker>
      <H2>Der erste Tag an Bord</H2>
      <Lead>
        <span>Der Einschiffungstag entscheidet, ob die Reise entspannt startet oder ob ihr zwei Tage hinterherlauft.</span>
        <span>Weil alle 3.000 Gäste dasselbe gleichzeitig wollen, gewinnt hier schlicht, wer weiß, was zuerst dran ist.</span>
      </Lead>

      {TAG1.map((b) => (
        <Card key={b.id} tone="white">
          <H3 style={{ marginBottom: b.hinweis ? 8 : 12 }}>{b.titel}</H3>
          {b.hinweis && <P style={{ fontSize: 14, marginBottom: 8 }}>{b.hinweis}</P>}
          {b.punkte.map((p) => (
            <Haken key={p.id} an={!!daten.haken[`t-${p.id}`]}
              onToggle={() => setzeHaken(`t-${p.id}`)}
              titel={p.t} text={p.d} stern={p.stern} />
          ))}
        </Card>
      ))}

      <Card tone="warn">
        <H3>Der eine Fehler, den fast alle machen</H3>
        <P style={{ marginBottom: 0, fontSize: 14.5 }}>
          Der Spa-Rundgang am ersten Tag ist kein Rundgang, sondern ein Verkaufsgespräch mit Getränk, und wer ihn mitmacht, hat danach oft ein Paket gebucht, das er nüchtern nicht gebucht hätte. Geht hin, wenn ihr das Angebot ohnehin wolltet, aber geht nicht hin, weil es kostenlos klingt.
        </P>
      </Card>
    </div>
  );
}

/* =========================================================
   MODUL 7 – NOTFALLFACH
========================================================= */
function ModulDoks({ daten, setze }) {
  const d = daten.doks;
  const set = (k, v) => setze("doks", { ...d, [k]: v });
  return (
    <div>
      <Kicker>Modul 7</Kicker>
      <H2>Dokumente und Notfall</H2>
      <Lead>
        <span>Dieses Modul ist das langweiligste und im Ernstfall das wertvollste, weil es offline funktioniert, und offline ist an Bord der Normalzustand.</span>
      </Lead>

      <Card tone="white">
        <Feld label="Buchungsnummer" wert={d.buchung} onChange={(v) => set("buchung", v)} />
        <Feld label="Kabinennummer" wert={d.kabinennr} onChange={(v) => set("kabinennr", v)} />
        <Feld label="Versicherung und Vertragsnummer" wert={d.versicherung} onChange={(v) => set("versicherung", v)} />
        <Feld label="Notrufnummer der Versicherung" wert={d.notruf} onChange={(v) => set("notruf", v)} />
        <Feld label="Ausweisnummern aller Mitreisenden" wert={d.ausweise} onChange={(v) => set("ausweise", v)} />
        <Feld label="Medikamente mit Wirkstoffnamen" wert={d.medikamente} onChange={(v) => set("medikamente", v)}
          hinweis="Wirkstoff statt Marke, weil die Marke im Ausland oft anders heißt." />
        <Feld label="Blutgruppe und Allergien" wert={d.blutgruppe} onChange={(v) => set("blutgruppe", v)} />
        <Feld label="Notfallkontakt zu Hause" wert={d.kontakt} onChange={(v) => set("kontakt", v)} />
        <Feld label="Hafenagentur der Reederei" wert={d.agentur} onChange={(v) => set("agentur", v)}
          hinweis="Die Nummer, die ihr braucht, wenn ihr das Schiff verpasst." />
      </Card>

      <Card tone="white">
        <H3>Die Notfallpläne</H3>
        {NOTFALL.map((n) => (
          <div key={n.id} style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: SANS, fontSize: 15.5, color: C.navy, marginBottom: 7 }}>{n.titel}</div>
            <P style={{ fontSize: 14.5, marginBottom: 0 }}>{n.text}</P>
          </div>
        ))}
      </Card>

      <Card tone="sand">
        <H3>Warum offline der eigentliche Punkt ist</H3>
        <P style={{ marginBottom: 0, fontSize: 14.5 }}>
          An Bord kostet WLAN je nach Reederei zwischen 15 und 25 Euro am Tag, in vielen Häfen habt ihr kein Netz, und ausgerechnet dann braucht ihr diese Zahlen. Genau deshalb ist Klarschiff eine App und keine PDF-Datei.
        </P>
      </Card>
    </div>
  );
}

/* =========================================================
   MODUL 8 – DAS FAHRTENBUCH
   Jede abgeschlossene Reise bleibt hier liegen: mit Häfen,
   Notizen und allem, was sich über die Jahre summiert.
========================================================= */
function archivStatistik(archiv) {
  const reisen = archiv.length;
  let naechte = 0, haefenGesamt = 0, sm = 0;
  const namen = {}, schiffe = {}, reedereien = {};
  archiv.forEach((r) => {
    naechte += parseInt(r.naechte || "0", 10) || 0;
    sm += r.sm || 0;
    (r.haefen || []).forEach((h) => {
      haefenGesamt++;
      const n = (h.name || "").trim();
      if (n) namen[n] = (namen[n] || 0) + 1;
    });
    if (r.schiff) schiffe[r.schiff] = (schiffe[r.schiff] || 0) + 1;
    if (r.reederei) reedereien[r.reederei] = (reedereien[r.reederei] || 0) + 1;
  });
  const oft = Object.keys(namen).sort((a, b) => namen[b] - namen[a])[0];
  return {
    reisen, naechte, haefenGesamt, sm,
    einzigartig: Object.keys(namen).length,
    schiffe: Object.keys(schiffe).length,
    reedereien: Object.keys(reedereien),
    lieblingshafen: oft ? { name: oft, mal: namen[oft] } : null,
  };
}

function alleHaefen(archiv) {
  const gesehen = {};
  const liste = [];
  archiv.forEach((r) => (r.haefen || []).forEach((h) => {
    if (typeof h.lon !== "number") return;
    const k = normText(h.name);
    if (gesehen[k]) return;
    gesehen[k] = true;
    liste.push({ name: h.name, lon: h.lon, lat: h.lat });
  }));
  return liste;
}

function notizArchiv(archiv) {
  const m = {};
  archiv.forEach((r) => (r.haefen || []).forEach((h) => {
    if (!h.name || (!h.note && !h.sterne)) return;
    m[normText(h.name)] = { note: h.note, sterne: h.sterne, schiff: r.schiff, abfahrt: r.abfahrt };
  }));
  return m;
}

function Zahl({ wert, label }) {
  return (
    <div style={{ flex: "1 1 30%", minWidth: 92, padding: "14px 4px", textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1, color: C.navy }}>{wert}</div>
      <div style={{
        fontFamily: MONO, fontSize: 9.5, letterSpacing: 1.4, textTransform: "uppercase",
        color: C.muted, marginTop: 8,
      }}>{label}</div>
    </div>
  );
}

function Sterne({ wert, onChange, klein }) {
  return (
    <div style={{ display: "flex", gap: klein ? 2 : 0 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        onChange ? (
          <button key={n} type="button" onClick={() => onChange(wert === n ? 0 : n)}
            aria-label={`${n} von 5`} style={{
              width: 44, height: 44, background: "transparent", border: "none", cursor: "pointer",
              color: n <= (wert || 0) ? C.messing : C.line, fontSize: 21, padding: 0,
            }}>★</button>
        ) : (
          <span key={n} style={{ color: n <= (wert || 0) ? C.messing : C.line, fontSize: 14 }}>★</span>
        )
      ))}
    </div>
  );
}

function ModulFahrtenbuch({ daten, setze }) {
  const archiv = daten.archiv || [];
  const st = archivStatistik(archiv);
  const haefen = alleHaefen(archiv);
  const [offen, setOffen] = useState(null);

  return (
    <div>
      <Kicker>Modul 8</Kicker>
      <H2>Das Fahrtenbuch</H2>
      <Lead>
        <span>Jede abgeschlossene Reise bleibt hier liegen, mit Häfen, Notizen und Seemeilen.</span>
        <span>Beim nächsten Mal wisst ihr wieder, was ihr euch damals notiert habt — und das ist mehr wert als jedes Reiseportal.</span>
      </Lead>

      {archiv.length === 0 ? (
        <Card>
          <H3>Noch keine Reise eingetragen</H3>
          <P style={{ marginBottom: 0, fontSize: 14.5 }}>
            Sobald ihr von Bord seid, legt ihr die Reise über den Startbildschirm ins Fahrtenbuch.
            Häfen, Notizen und Seemeilen wandern automatisch mit, und der Planer ist danach wieder
            leer für die nächste Reise.
          </P>
        </Card>
      ) : (
        <div>
          <Card tone="white" style={{ borderLeft: `2px solid ${C.messing}`, padding: "10px 8px 14px" }}>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <Zahl wert={st.reisen} label={st.reisen === 1 ? "Reise" : "Reisen"} />
              <Zahl wert={st.naechte} label="Nächte an Bord" />
              <Zahl wert={st.einzigartig} label="Häfen" />
              <Zahl wert={st.sm.toLocaleString("de-DE")} label="Seemeilen" />
              <Zahl wert={st.haefenGesamt} label="Anläufe" />
              <Zahl wert={st.schiffe} label={st.schiffe === 1 ? "Schiff" : "Schiffe"} />
            </div>
          </Card>

          {st.lieblingshafen && st.lieblingshafen.mal > 1 && (
            <Card tone="sand">
              <P style={{ margin: 0, fontFamily: SERIF, fontSize: 17.5, fontStyle: "italic", lineHeight: 1.55, color: C.navy }}>
                Am häufigsten wart ihr in {st.lieblingshafen.name} — {st.lieblingshafen.mal} Mal.
              </P>
            </Card>
          )}

          {haefen.length > 0 && (
            <div>
              <Kicker>Alles, was ihr schon gesehen habt</Kicker>
              <Karte haefen={haefen} route={daten.setup.route} linie={false} nummern={false} />
            </div>
          )}

          <Kicker>Eure Reisen</Kicker>
          {archiv.slice().reverse().map((r) => {
            const auf = offen === r.id;
            const d = alsDatum(r.abfahrt);
            return (
              <Card key={r.id} tone="white" style={{ padding: "18px 18px 20px" }}>
                <button type="button" onClick={() => setOffen(auf ? null : r.id)} style={{
                  display: "block", width: "100%", textAlign: "left", background: "transparent",
                  border: "none", cursor: "pointer", padding: 0,
                }}>
                  <div style={{
                    fontFamily: MONO, fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase",
                    color: C.muted, marginBottom: 7,
                  }}>{d ? kurz(d) : "ohne Datum"} · {r.naechte || "?"} Nächte</div>
                  <div style={{ fontFamily: SERIF, fontSize: 21, color: C.navy, marginBottom: 6 }}>
                    {[r.reederei, r.schiff].filter(Boolean).join(" ") || "Reise"}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 13.8, color: C.muted }}>
                    {(r.haefen || []).map((h) => h.name).filter(Boolean).join(" · ") || "keine Häfen eingetragen"}
                  </div>
                </button>

                {auf && (
                  <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
                    {r.kabine && (r.kabine.nummer || r.kabine.art) && (
                      <P style={{ fontSize: 14.5 }}>
                        Kabine {r.kabine.nummer ? r.kabine.nummer + ", " : ""}
                        {{ innen: "Innen", aussen: "Außen", balkon: "Balkon", suite: "Suite" }[r.kabine.art] || ""}
                        {r.kabine.laengs && r.kabine.laengs !== "unbekannt"
                          ? ", " + { vorne: "vorne", mittschiffs: "mittschiffs", achtern: "achtern" }[r.kabine.laengs] : ""}
                      </P>
                    )}
                    {(r.haefen || []).filter((h) => h.note || h.sterne).map((h, i) => (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                          <span style={{ fontFamily: SANS, fontSize: 15, color: C.navy }}>{h.name}</span>
                          <Sterne wert={h.sterne} />
                        </div>
                        {h.note && (
                          <P style={{ fontSize: 14, marginBottom: 0 }}>{h.note}</P>
                        )}
                      </div>
                    ))}
                    {r.sm > 0 && (
                      <div style={{
                        fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.4, textTransform: "uppercase",
                        color: C.muted, marginTop: 12,
                      }}>{r.sm.toLocaleString("de-DE")} Seemeilen</div>
                    )}
                    <div style={{ marginTop: 16 }}>
                      <Btn small variant="quiet"
                        onClick={() => setze("archiv", archiv.filter((x) => x.id !== r.id))}>
                        Reise löschen
                      </Btn>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {st.reedereien.length > 1 && (
        <Card tone="green">
          <P style={{ margin: 0, fontSize: 14.5 }}>
            Ihr wart bei {st.reedereien.length} Reedereien an Bord: {st.reedereien.join(", ")}. Genau
            solche Vergleiche sind das, wonach euch Freunde fragen, bevor sie selbst buchen.
          </P>
        </Card>
      )}
    </div>
  );
}

/* =========================================================
   REISE-SETUP
========================================================= */
function Setup({ daten, setze }) {
  const s = daten.setup;
  const set = (k, v) => setze("setup", { ...s, [k]: v });
  return (
    <div>
      <Kicker>Reise-Setup</Kicker>
      <H2>Eure Reise</H2>
      <P style={{ marginTop: 14 }}>
        Diese Angaben steuern alles Weitere: Der Countdown rechnet daraus echte Termine, die Packliste passt sich an, und der Bordkonto-Rechner rechnet mit euren Zahlen.
      </P>

      <Card tone="white">
        <Feld label="Reederei" wert={s.reederei} onChange={(v) => set("reederei", v)} placeholder="z. B. Mein Schiff, AIDA …" />
        <Feld label="Schiff" wert={s.schiff} onChange={(v) => set("schiff", v)} />
        <Feld label="Abfahrtsdatum" type="date" wert={s.abfahrt} onChange={(v) => set("abfahrt", v)} />
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}><Feld label="Nächte" type="number" wert={s.naechte} onChange={(v) => set("naechte", v)} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><Feld label="Personen" type="number" wert={s.personen} onChange={(v) => set("personen", v)} /></div>
        </div>
        <Feld label="Reisepreis gesamt" type="number" wert={s.reisepreis} onChange={(v) => set("reisepreis", v)}
          hinweis="Freiwillig — damit euch der Rechner zeigt, wie viel oben drauf kommt." />

        <Wahl label="Route" wert={s.route} onChange={(v) => set("route", v)}
          optionen={[
            { v: "karibik", l: "Karibik / Kanaren" }, { v: "mittel", l: "Mittelmeer" },
            { v: "nord", l: "Nordland / Ostsee" }, { v: "trans", l: "Transatlantik" }, { v: "andere", l: "Andere" },
          ]} />
        <Wahl label="Saison" wert={s.saison} onChange={(v) => set("saison", v)}
          optionen={[{ v: "sommer", l: "Sommer" }, { v: "neben", l: "Nebensaison" }, { v: "winter", l: "Winter" }]} />
        <Wahl label="Anreise" wert={s.anreise} onChange={(v) => set("anreise", v)}
          optionen={[{ v: "flug", l: "Fly & Cruise" }, { v: "boden", l: "Auto oder Bahn" }]} />

        <Schalter label="Ein Kind unter drei Jahren ist dabei" an={s.kind} onChange={(v) => set("kind", v)} />
        <Schalter label="Es gibt Gala-Abende" an={s.gala} onChange={(v) => set("gala", v)} />
      </Card>
    </div>
  );
}

/* =========================================================
   START – der Einband
========================================================= */
const PHASE = {
  1: "ab 3 Monate vorher",
  2: "sobald gebucht",
  3: "2 Wochen vorher",
  4: "vor dem Buchen",
  5: "4 Wochen vorher",
  6: "Einschiffungstag",
  7: "immer dabei",
  8: "nach der Reise",
};

function Start({ daten, gehe, fortschritt, onAbschliessen }) {
  const s = daten.setup;
  const bilanz = archivStatistik(daten.archiv || []);
  const ab = alsDatum(s.abfahrt);
  const tage = ab ? tageBis(ab) : null;

  let wert = 0, gesamt = 0;
  Object.keys(fortschritt).forEach((k) => { wert += fortschritt[k].wert; gesamt += fortschritt[k].gesamt; });
  const prozent = gesamt ? (wert / gesamt) * 100 : 0;

  const mitte = tage !== null && tage > 0 ? String(tage) : `${Math.round(prozent)}%`;
  const unterMitte = tage !== null && tage > 0
    ? (tage === 1 ? "TAG BIS ABFAHRT" : "TAGE BIS ABFAHRT")
    : "VORBEREITET";

  const schiffszeile = [s.reederei, s.schiff].filter(Boolean).join(" · ");

  return (
    <div>
      <div style={{
        background: `radial-gradient(circle at 50% 58%, ${C.nachtblau} 0%, ${C.tiefsee} 64%)`,
        margin: "-22px -20px 26px", padding: "16px 16px 30px",
        position: "relative",
      }}>
        <div style={{
          border: `1px solid ${C.messingLeise}`, padding: "26px 18px 24px",
          position: "relative",
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", inset: 4, border: `1px solid rgba(200,160,85,0.18)`, pointerEvents: "none",
          }} />

          <div style={{ textAlign: "center", position: "relative" }}>
            <div style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: 3.2, color: C.messing,
              textTransform: "uppercase", marginBottom: 16,
            }}>Logbuch · @wolken.wanderer</div>

            <h1 style={{
              fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(46px, 13vw, 66px)",
              lineHeight: 0.98, letterSpacing: "-0.015em", color: C.white, margin: "0 0 14px",
            }}>Klarschiff</h1>

            <div style={{
              display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
              margin: "0 auto 14px", maxWidth: 320,
            }}>
              <span style={{ flex: 1, height: 1, background: C.messingLeise }} />
              <span style={{ color: C.messing, fontSize: 11 }} aria-hidden="true">✦</span>
              <span style={{ flex: 1, height: 1, background: C.messingLeise }} />
            </div>

            <p style={{
              fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: "#A9C0CE",
              margin: "0 auto 22px", maxWidth: 330,
            }}>
              Der Kreuzfahrt-Planer von einem Crew-Paar, das weiß, wie der Laden von innen läuft
            </p>

            <Windrose prozent={prozent} oben={mitte} unten={unterMitte} groesse={252} />

            {(schiffszeile || ab) && (
              <div style={{
                fontFamily: MONO, fontSize: 11, letterSpacing: 1.4, color: C.messingHell,
                textTransform: "uppercase", marginTop: 20, lineHeight: 1.9,
              }}>
                {schiffszeile && <div>{schiffszeile}</div>}
                {ab && <div style={{ color: "#8FA9B8" }}>Auslaufen {kurz(ab)} · {s.naechte} Nächte</div>}
              </div>
            )}

            {bilanz.reisen > 0 && (
              <div style={{
                marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.messingLeise}`,
                fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.6, textTransform: "uppercase",
                color: C.messingHell, lineHeight: 1.9,
              }}>
                {bilanz.reisen} {bilanz.reisen === 1 ? "Reise" : "Reisen"} · {bilanz.naechte} Nächte · {bilanz.einzigartig} Häfen
                {bilanz.sm > 0 && <div style={{ color: "#8FA9B8" }}>{bilanz.sm.toLocaleString("de-DE")} Seemeilen im Kielwasser</div>}
              </div>
            )}

            <button type="button" onClick={() => gehe("setup")} style={{
              marginTop: 22, background: "transparent", border: `1px solid ${C.messingLeise}`,
              borderRadius: 3, color: C.messingHell, fontFamily: MONO, fontSize: 11.5,
              letterSpacing: 1.6, textTransform: "uppercase", padding: "13px 22px",
              minHeight: 46, cursor: "pointer",
            }}>
              {schiffszeile || ab ? "Reise bearbeiten" : "Reise eintragen"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span aria-hidden="true" style={{ width: 20, height: 1, background: C.messing }} />
        <span style={{
          fontFamily: MONO, fontSize: 10.5, letterSpacing: 2.4, textTransform: "uppercase", color: C.muted,
        }}>Die sieben Kapitel</span>
        <span aria-hidden="true" style={{ flex: 1, height: 1, background: C.line }} />
      </div>

      {MODULE.map((m) => {
        const f = fortschritt[m.id];
        return (
          <button key={m.id} type="button" onClick={() => gehe(m.id)} style={{
            width: "100%", textAlign: "left", cursor: "pointer", marginBottom: 10,
            background: C.white, border: `1px solid ${C.line}`, borderLeft: `2px solid ${C.messing}`,
            borderRadius: RUND, padding: "18px 18px 20px",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8,
            }}>
              <span style={{
                fontFamily: MONO, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted,
              }}>{PHASE[m.id]}</span>
              <ChevronRight size={16} color={C.messing} />
            </div>
            <div style={{
              fontFamily: SERIF, fontSize: 22, lineHeight: 1.2, color: C.navy, marginBottom: 7,
            }}>{m.titel}</div>
            <div style={{
              fontFamily: SANS, fontSize: 13.8, lineHeight: 1.6, color: C.muted, marginBottom: f ? 13 : 0,
            }}>{m.teaser}</div>
            {f && <Balken wert={f.wert} gesamt={f.gesamt} />}
          </button>
        );
      })}

      {(daten.haefen.length > 0 || s.schiff || s.reederei) && (
        <div style={{ textAlign: "center", padding: "18px 0 4px" }}>
          <Btn small variant="outline" onClick={onAbschliessen} full>
            Reise ins Fahrtenbuch legen
          </Btn>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>
            Häfen, Notizen und Seemeilen wandern ins Fahrtenbuch, der Planer wird für die nächste Reise leer.
          </div>
        </div>
      )}

      <div style={{
        fontFamily: SANS, fontSize: 12.5, lineHeight: 1.75, color: C.muted,
        textAlign: "center", padding: "26px 8px 8px",
      }}>
        Alle Eingaben bleiben auf eurem Gerät. Klarschiff läuft offline — legt es euch auf den
        Startbildschirm, dann habt ihr es an Bord auch ohne WLAN dabei.
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */
function App() {
  const [daten, setDaten] = useState(LEER);
  const [screen, setScreen] = useState("start");
  const [geladen, setGeladen] = useState(false);
  const [gespeichert, setGespeichert] = useState(false);
  const [frage, setFrage] = useState(false);
  const [abschluss, setAbschluss] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    store.get(STORAGE_KEY)
      .then((r) => {
        const d = JSON.parse(r.value);
        setDaten({ ...LEER, ...d, setup: { ...LEER.setup, ...(d.setup || {}) },
          kabine: { ...LEER.kabine, ...(d.kabine || {}) },
          bord: { ...LEER.bord, ...(d.bord || {}) },
          doks: { ...LEER.doks, ...(d.doks || {}) } });
      })
      .catch(() => {})
      .finally(() => setGeladen(true));
  }, []);

  useEffect(() => {
    if (!geladen) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      store.set(STORAGE_KEY, JSON.stringify(daten)).then(() => {
        setGespeichert(true);
        setTimeout(() => setGespeichert(false), 1300);
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(timer.current);
  }, [daten, geladen]);

  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const setze = (k, v) => setDaten((d) => ({ ...d, [k]: v }));
  const setzeHaken = (id) => setDaten((d) => {
    const h = { ...d.haken };
    if (h[id]) delete h[id]; else h[id] = true;
    return { ...d, haken: h };
  });

  const fortschritt = useMemo(() => {
    const s = daten.setup;
    const f = {};
    let cg = 0, cw = 0;
    COUNTDOWN.forEach((p) => p.punkte.filter((x) => !x.wenn || x.wenn(s)).forEach((x) => {
      cg++; if (daten.haken[`c-${x.id}`]) cw++;
    }));
    f[1] = { wert: cw, gesamt: cg };

    const ff = { route: s.route, saison: s.saison, kind: s.kind, anreise: s.anreise, gala: s.gala };
    let pg = 0, pw = 0;
    PACK.filter((b) => !b.wenn || b.wenn(ff)).forEach((b) =>
      b.punkte.filter((x) => !x.wenn || x.wenn(ff)).forEach((x) => {
        pg++; if (daten.haken[`p-${x.id}`]) pw++;
      }));
    daten.packExtra.forEach((x) => { pg++; if (daten.haken[`p-${x.id}`]) pw++; });
    f[3] = { wert: pw, gesamt: pg };

    let tg = 0, tw = 0;
    TAG1.forEach((b) => b.punkte.forEach((x) => { tg++; if (daten.haken[`t-${x.id}`]) tw++; }));
    f[6] = { wert: tw, gesamt: tg };
    return f;
  }, [daten]);

  function neueReise() {
    setDaten((d) => ({ ...LEER, archiv: d.archiv || [] }));
    setFrage(false);
    setScreen("start");
  }

  function insFahrtenbuch() {
    setDaten((d) => {
      const mitOrt = (d.haefen || []).filter((x) => typeof x.lon === "number");
      const sm = mitOrt.reduce((a, p, i) => (i ? a + seemeilen(mitOrt[i - 1], p) : 0), 0);
      const eintrag = {
        id: "r" + Date.now(),
        reederei: d.setup.reederei, schiff: d.setup.schiff, abfahrt: d.setup.abfahrt,
        naechte: d.setup.naechte, route: d.setup.route, sm,
        kabine: { art: d.kabine.art, laengs: d.kabine.laengs, nummer: d.kabine.nummer },
        haefen: (d.haefen || []).map((x) => ({
          name: x.name, lon: x.lon, lat: x.lat, note: x.note || "", sterne: x.sterne || 0,
        })),
      };
      return { ...LEER, archiv: [...(d.archiv || []), eintrag] };
    });
    setAbschluss(false);
    setScreen(8);
  }

  if (!geladen) return null;

  const istModul = typeof screen === "number";
  const titel = istModul ? (MODULE.find((m) => m.id === screen) || {}).titel : "";

  return (
    <div style={{
      minHeight: "100vh", background: C.paper,
      paddingBottom: istModul || screen === "setup" ? 104 : 40,
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "22px 20px 0" }}>
        {(istModul || screen === "setup") && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 22,
            paddingBottom: 14, borderBottom: `1px solid ${C.line}`,
          }}>
            <button type="button" onClick={() => setScreen("start")} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.8, textTransform: "uppercase",
              color: C.muted, padding: "6px 10px 6px 0", minHeight: 44,
            }}><ChevronLeft size={14} color={C.messing} /> Logbuch</button>
            <span style={{ flex: 1 }} />
            {istModul && (
              <span style={{
                fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.8, textTransform: "uppercase",
                color: C.muted,
              }}>{screen} von 8</span>
            )}
          </div>
        )}

        <div key={String(screen)} style={{ animation: "auftauchen .32s ease both" }}>
          {screen === "start" && <Start daten={daten} gehe={setScreen} fortschritt={fortschritt} onAbschliessen={() => setAbschluss(true)} />}
          {screen === "setup" && <Setup daten={daten} setze={setze} />}
          {screen === 1 && <ModulCountdown daten={daten} setzeHaken={setzeHaken} />}
          {screen === 2 && <ModulKabine daten={daten} setze={setze} />}
          {screen === 3 && <ModulPack daten={daten} setze={setze} setzeHaken={setzeHaken} />}
          {screen === 4 && <ModulBord daten={daten} setze={setze} />}
          {screen === 5 && <ModulLandgang daten={daten} setze={setze} />}
          {screen === 6 && <ModulTag1 daten={daten} setzeHaken={setzeHaken} />}
          {screen === 7 && <ModulDoks daten={daten} setze={setze} />}
          {screen === 8 && <ModulFahrtenbuch daten={daten} setze={setze} />}
        </div>

        {screen === "start" && (
          <div style={{ textAlign: "center", padding: "4px 0 30px" }}>
            <Btn small variant="quiet" onClick={() => setFrage(true)}>
              <RotateCcw size={14} /> Neue Reise anlegen
            </Btn>
          </div>
        )}
      </div>

      {istModul && (
        <nav style={{
          position: "fixed", left: 0, right: 0, bottom: 0, background: C.tiefsee,
          borderTop: `1px solid ${C.messingLeise}`,
          padding: "12px 20px calc(12px + env(safe-area-inset-bottom))",
        }}>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" onClick={() => setScreen(screen > 1 ? screen - 1 : "start")}
              aria-label="Zurück" style={{
                background: "transparent", border: `1px solid ${C.messingLeise}`, borderRadius: 3,
                color: C.messingHell, cursor: "pointer", width: 46, height: 46,
                display: "grid", placeItems: "center", flexShrink: 0,
              }}><ChevronLeft size={16} /></button>
            <div style={{
              flex: 1, minWidth: 0, fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.6,
              textTransform: "uppercase", color: "#8FA9B8", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{titel}</div>
            <button type="button" onClick={() => setScreen(screen < 8 ? screen + 1 : "start")}
              style={{
                background: "transparent", border: `1px solid ${C.messingLeise}`, borderRadius: 3,
                color: C.messingHell, cursor: "pointer", minHeight: 46, padding: "0 18px",
                fontFamily: MONO, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase",
                display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0,
              }}>{screen < 8 ? "Weiter" : "Logbuch"} <ChevronRight size={15} /></button>
          </div>
        </nav>
      )}

      {abschluss && (
        <div role="dialog" aria-modal="true" onClick={() => setAbschluss(false)} style={{
          position: "fixed", inset: 0, zIndex: 60, background: "rgba(11,35,56,0.62)",
          display: "grid", placeItems: "center", padding: 22,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.paper, borderRadius: RUND, border: `1px solid ${C.line}`,
            borderTop: `2px solid ${C.messing}`, padding: "28px 24px 24px", maxWidth: 400, width: "100%",
          }}>
            <H3>Reise ins Fahrtenbuch legen?</H3>
            <P style={{ fontSize: 14.5 }}>
              Schiff, Häfen, eure Notizen und die gefahrenen Seemeilen bleiben dauerhaft im Fahrtenbuch.
              Der Planer selbst wird danach leer, damit ihr die nächste Reise vorbereiten könnt.
            </P>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn small variant="outline" onClick={() => setAbschluss(false)} style={{ flex: 1 }}>Noch nicht</Btn>
              <Btn small onClick={insFahrtenbuch} style={{ flex: 1 }}>Eintragen</Btn>
            </div>
          </div>
        </div>
      )}

      {frage && (
        <div role="dialog" aria-modal="true" onClick={() => setFrage(false)} style={{
          position: "fixed", inset: 0, zIndex: 60, background: "rgba(11,35,56,0.62)",
          display: "grid", placeItems: "center", padding: 22,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.paper, borderRadius: RUND, border: `1px solid ${C.line}`,
            borderTop: `2px solid ${C.messing}`, padding: "28px 24px 24px", maxWidth: 400, width: "100%",
          }}>
            <H3>Neue Reise anlegen?</H3>
            <P style={{ fontSize: 14.5 }}>
              Damit werden alle Eingaben und Häkchen der aktuellen Reise gelöscht. Euer Fahrtenbuch
              mit den vergangenen Reisen bleibt erhalten.
            </P>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn small variant="outline" onClick={() => setFrage(false)} style={{ flex: 1 }}>Abbrechen</Btn>
              <Btn small onClick={neueReise} style={{ flex: 1 }}>Zurücksetzen</Btn>
            </div>
          </div>
        </div>
      )}

      <div aria-live="polite" style={{
        position: "fixed", bottom: 88, left: "50%",
        transform: `translateX(-50%) translateY(${gespeichert ? "0" : "16px"})`,
        opacity: gespeichert ? 1 : 0, transition: "all .3s", pointerEvents: "none", zIndex: 50,
        background: C.tiefsee, color: C.messingHell, fontFamily: MONO, fontSize: 10.5,
        letterSpacing: 1.6, textTransform: "uppercase", padding: "10px 18px", borderRadius: 3,
        border: `1px solid ${C.messingLeise}`, display: "flex", alignItems: "center", gap: 8,
      }}>
        <Check size={13} /> Eingetragen
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
