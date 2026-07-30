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
   DESIGNSYSTEM – maritim, ruhig, gut lesbar bei Sonne
========================================================= */
const C = {
  paper: "#F5FAFD",
  sky: "#E4F2FB",
  skySoft: "#EFF7FC",
  line: "#C6DEEE",
  navy: "#12395C",
  body: "#3D5C74",
  muted: "#5A778C",
  blue: "#1B7FC0",
  blueSoft: "#DCEDF9",
  sand: "#EFE5D3",
  warn: "#A8531F",
  warnSoft: "#F8EDE2",
  green: "#2C7355",
  greenSoft: "#E3F0EA",
  white: "#FFFFFF",
};

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Questrial', 'Helvetica Neue', Arial, sans-serif";

const STORAGE_KEY = "klarschiff-kreuzfahrtplaner";

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
  { id: 2, titel: "Der Kabinen-Finder", teaser: "Fünf Fragen, dann wisst ihr, wo ihr buchen solltet und wovor wir warnen." },
  { id: 3, titel: "Die Packliste", teaser: "Passt sich eurer Route und Familiengröße an, samt der Dinge, die fast alle vergessen." },
  { id: 4, titel: "Der Bordkonto-Rechner", teaser: "Was an Bord noch dazukommt, bevor es euch die Endabrechnung sagt." },
  { id: 5, titel: "Der Landgang-Planer", teaser: "Wie viel Zeit ihr wirklich habt, und wann ihr die Reederei nehmen solltet." },
  { id: 6, titel: "Der erste Tag an Bord", teaser: "Die Reihenfolge, die über entspannt oder hinterherlaufen entscheidet." },
  { id: 7, titel: "Dokumente und Notfall", teaser: "Alle wichtigen Zahlen offline griffbereit, weil offline an Bord der Normalzustand ist." },
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
  kabine: { budget: "", seekrank: "", kind: "", schlaf: "" },
  packExtra: [],
  bord: {
    getraenke: "", paket: "", ausfluege: "", wlan: "", trinkgeld: "", spezial: "", spa: "", fotos: "",
  },
  haefen: [],
  doks: {
    buchung: "", kabinennr: "", versicherung: "", notruf: "", ausweise: "",
    medikamente: "", blutgruppe: "", kontakt: "", agentur: "",
  },
};

/* =========================================================
   BAUSTEINE
========================================================= */
function Kicker({ children, color }) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: 11.5, letterSpacing: 2.4, fontWeight: 600,
      textTransform: "uppercase", color: color || C.blue, marginBottom: 10,
    }}>{children}</div>
  );
}

function H2({ children, style }) {
  return (
    <h2 style={{
      fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(28px, 6.6vw, 40px)",
      lineHeight: 1.14, color: C.navy, margin: 0, ...style,
    }}>{children}</h2>
  );
}

function H3({ children, style }) {
  return (
    <h3 style={{
      fontFamily: SERIF, fontWeight: 500, fontSize: 23, lineHeight: 1.25,
      color: C.navy, margin: "0 0 14px", ...style,
    }}>{children}</h3>
  );
}

function P({ children, style }) {
  return (
    <p style={{
      fontFamily: SANS, fontSize: 15.5, lineHeight: 1.7,
      color: C.body, margin: "0 0 16px", ...style,
    }}>{children}</p>
  );
}

function Card({ children, tone, style }) {
  const bg = tone === "white" ? C.white : tone === "warn" ? C.warnSoft
    : tone === "green" ? C.greenSoft : tone === "sand" ? C.sand : C.sky;
  return (
    <section style={{ background: bg, borderRadius: 16, padding: "24px 20px 26px", marginBottom: 22, ...style }}>
      {children}
    </section>
  );
}

function Lead({ children }) {
  return (
    <div style={{ borderLeft: `2px solid ${C.blue}`, paddingLeft: 16, margin: "0 0 26px" }}>
      {React.Children.map(children, (c, i) => (
        <p key={i} style={{
          fontFamily: SERIF, fontSize: 18.5, fontStyle: "italic",
          lineHeight: 1.55, color: C.navy, margin: i === 0 ? "0 0 10px" : 0,
        }}>{c}</p>
      ))}
    </div>
  );
}

function Btn({ children, onClick, variant = "solid", small, full, style, title }) {
  const skin = variant === "solid" ? { background: C.blue, color: C.white, borderColor: C.blue }
    : variant === "quiet" ? { background: "transparent", color: C.body, borderColor: C.line }
    : { background: C.white, color: C.navy, borderColor: C.line };
  return (
    <button type="button" onClick={onClick} title={title} style={{
      fontFamily: SANS, fontSize: small ? 13.5 : 15,
      padding: small ? "10px 16px" : "14px 24px", minHeight: 44,
      borderWidth: 1, borderStyle: "solid", borderRadius: 40, cursor: "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      width: full ? "100%" : "auto", ...skin, ...style,
    }}>{children}</button>
  );
}

function Balken({ wert, gesamt, farbe }) {
  const p = gesamt ? Math.round((wert / gesamt) * 100) : 0;
  return (
    <div>
      <div style={{ height: 6, background: C.line, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", background: farbe || C.blue, transition: "width .3s" }} />
      </div>
      <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.muted, marginTop: 7 }}>
        {wert} von {gesamt} erledigt
      </div>
    </div>
  );
}

function Haken({ an, onToggle, titel, text, stern, extra, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 13, padding: "13px 0", borderBottom: `1px solid ${C.line}` }}>
      <button type="button" onClick={onToggle} aria-pressed={an} style={{
        flexShrink: 0, width: 26, height: 26, marginTop: 1, borderRadius: 8, cursor: "pointer",
        border: `1.5px solid ${an ? C.green : C.line}`, background: an ? C.green : C.white,
        display: "grid", placeItems: "center", padding: 0,
      }}>
        {an && <Check size={15} color={C.white} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: SANS, fontSize: 15.5, lineHeight: 1.5,
          color: an ? C.muted : C.navy, textDecoration: an ? "line-through" : "none",
        }}>
          {stern && <span style={{ color: C.warn, marginRight: 6 }} aria-hidden="true">★</span>}
          {titel}
        </div>
        {text && !an && (
          <div style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6, color: C.muted, marginTop: 6 }}>
            {text}
          </div>
        )}
        {extra}
      </div>
      {onDelete && (
        <button type="button" onClick={onDelete} aria-label="Löschen" style={{
          flexShrink: 0, background: "transparent", border: "none", cursor: "pointer",
          color: C.muted, padding: 4,
        }}><X size={16} /></button>
      )}
    </div>
  );
}

function Feld({ label, wert, onChange, placeholder, type = "text", hinweis }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontFamily: SANS, fontSize: 13.5, color: C.body, marginBottom: 6,
      }}>{label}</label>
      <input type={type} value={wert} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        inputMode={type === "number" ? "numeric" : undefined}
        style={{
          width: "100%", boxSizing: "border-box", fontFamily: SANS, fontSize: 16,
          color: C.navy, background: C.white, border: `1px solid ${C.line}`,
          borderRadius: 10, padding: "13px 14px", minHeight: 46,
        }} />
      {hinweis && (
        <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.muted, marginTop: 6 }}>{hinweis}</div>
      )}
    </div>
  );
}

function Wahl({ label, wert, onChange, optionen, hinweis }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: SANS, fontSize: 14.5, color: C.navy, marginBottom: 9 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {optionen.map((o) => {
          const an = wert === o.v;
          return (
            <button key={o.v} type="button" onClick={() => onChange(an ? "" : o.v)} style={{
              fontFamily: SANS, fontSize: 14, cursor: "pointer", minHeight: 42,
              padding: "10px 16px", borderRadius: 30,
              border: `1px solid ${an ? C.blue : C.line}`,
              background: an ? C.blue : C.white, color: an ? C.white : C.body,
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

function Schalter({ label, an, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!an)} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
      background: C.white, border: `1px solid ${an ? C.blue : C.line}`, borderRadius: 10,
      padding: "13px 14px", marginBottom: 16, cursor: "pointer", minHeight: 46,
    }}>
      <span style={{
        width: 24, height: 24, borderRadius: 7, flexShrink: 0,
        border: `1.5px solid ${an ? C.blue : C.line}`, background: an ? C.blue : C.white,
        display: "grid", placeItems: "center",
      }}>{an && <Check size={14} color={C.white} />}</span>
      <span style={{ fontFamily: SANS, fontSize: 15, color: C.navy }}>{label}</span>
    </button>
  );
}

function Warnung({ children }) {
  return (
    <div style={{
      background: C.warnSoft, borderRadius: 12, padding: "16px 16px 16px 14px",
      display: "flex", gap: 11, marginBottom: 18,
    }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}><Alert size={17} color={C.warn} /></div>
      <div style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.62, color: C.navy }}>{children}</div>
    </div>
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
   MODUL 2 – KABINEN-FINDER
========================================================= */
function kabinenErgebnis(a, route) {
  const gruende = [];
  const warnungen = [];
  const nicht = [];
  let typ = "Außenkabine";
  let lage = "mittschiffs";
  let deck = "mittleres Deck";

  if (a.seekrank === "sofort") {
    lage = "mittschiffs";
    deck = "tiefes Deck";
    typ = a.budget === "low" ? "Außenkabine" : "Balkonkabine";
    gruende.push("Weil ihr schnell seekrank werdet, gehört ihr mittschiffs auf ein tiefes Deck, denn dort bewegt sich am wenigsten, und ein Balkon hilft dabei tatsächlich mehr als jede Tablette, weil frische Luft und ein fester Horizont die beiden besten Mittel sind, die es gibt — das kennen wir aus der Luft ganz genauso.");
  } else if (a.kind === "ja") {
    typ = "Innenkabine";
    gruende.push("Alle sagen euch, mit Kind braucht ihr einen Balkon, und wir sagen: nehmt die Innenkabine. Innen ist es stockdunkel, der Mittagsschlaf funktioniert egal wie hell es draußen ist, und genau daran scheitern Familien an Bord. Die romantischen Balkonabende fallen mit Kleinkind sowieso aus, weil ihr um acht im Dunkeln neben dem Bett sitzt und flüstert.");
  } else if (route === "nord") {
    typ = "Balkonkabine";
    gruende.push("Auf Nordland- und Ostseerouten lohnt sich der Balkon wirklich, weil die Landschaft das Programm ist und auch um sechs Uhr morgens vorbeizieht.");
  } else if (route === "trans") {
    typ = a.budget === "low" ? "Außenkabine mit Fenster" : "Balkonkabine";
    gruende.push("Auf Transatlantik-Routen kommen viele Seetage, und Tageslicht macht dabei einen echten Unterschied, weshalb ihr mindestens ein Fenster haben solltet.");
  } else if (route === "karibik" && a.budget === "low") {
    typ = "Innen- oder Außenkabine";
    gruende.push("In der Karibik oder auf den Kanaren mit knappem Budget reicht innen oder außen völlig, denn ihr seid ohnehin nie in der Kabine.");
  } else if (a.budget === "high") {
    typ = "Balkonkabine";
    gruende.push("Bei eurem Budget ist der Balkon eine schöne Sache, und ihr müsst euch die Frage nicht stellen — achtet dafür umso mehr auf die Lage, denn die entscheidet mehr als die Kategorie.");
  } else {
    typ = "Außen- oder Balkonkabine";
    gruende.push("Bei eurer Kombination geht beides, weshalb wir die Lage höher gewichten würden als die Kategorie, denn eine gut gelegene Außenkabine schlägt einen schlecht gelegenen Balkon jedes Mal.");
  }

  if (a.kind === "ja" && typ.indexOf("Balkon") >= 0) {
    warnungen.push("Falls es doch ein Balkon wird, kommt die Türsicherung mit, ohne Diskussion.");
  }
  if (a.schlaf === "leicht") {
    deck = "ein Deck, über und unter dem ebenfalls Kabinen liegen";
    warnungen.push("Weil ihr leicht schlaft: meidet alles direkt unter dem Pooldeck, denn die Liegen werden ab sechs Uhr geschoben und das klingt genau so, wie es sich anhört, und ebenso alles über Theater oder Disco.");
  }
  warnungen.push("Ganz vorne hört ihr morgens im Hafen die Ankerkette, direkt am Aufzug oder Treppenhaus habt ihr Dauerbetrieb, und „eingeschränkte Sicht“ heißt übersetzt schlicht, dass ein Rettungsboot vor eurem Fenster hängt.");
  warnungen.push("Achterkabinen haben den schönsten Blick und die meiste Bewegung, und beides bekommt ihr leider nicht getrennt.");

  if (route === "karibik") nicht.push("ihr eine Karibikroute fahrt, früh aufsteht und den ganzen Tag an Land seid");
  if (a.kind === "ja") nicht.push("euer Kind noch Mittagsschlaf braucht, denn dann ist Dunkelheit mehr wert als Aussicht");
  if (a.budget === "low") nicht.push("das Geld an anderer Stelle fehlt, denn Ausflüge bringen euch mehr als zwei Quadratmeter Balkon");

  return { typ, lage, deck, gruende, warnungen, nicht };
}

function ModulKabine({ daten, setze }) {
  const a = daten.kabine;
  const route = daten.setup.route;
  const fertig = a.budget && a.seekrank && a.kind && a.schlaf && route;
  const e = fertig ? kabinenErgebnis(a, route) : null;

  return (
    <div>
      <Kicker>Modul 2</Kicker>
      <H2>Der Kabinen-Finder</H2>
      <Lead>
        <span>Die Kabine beeinflusst eure Reise mehr als jede andere Entscheidung, und gleichzeitig wird bei kaum etwas so viel Unsinn erzählt, denn „Balkon ist immer besser“ stimmt schlicht nicht.</span>
        <span>Fünf Fragen, dann wisst ihr es.</span>
      </Lead>

      <Card tone="white">
        <Wahl label="1. Budget pro Person und Nacht" wert={a.budget}
          onChange={(v) => setze("kabine", { ...a, budget: v })}
          optionen={[{ v: "low", l: "unter 100 €" }, { v: "mid", l: "100 bis 180 €" }, { v: "high", l: "über 180 €" }]} />
        <Wahl label="2. Werdet ihr seekrank?" wert={a.seekrank}
          onChange={(v) => setze("kabine", { ...a, seekrank: v })}
          optionen={[{ v: "nie", l: "nie" }, { v: "manchmal", l: "manchmal" }, { v: "sofort", l: "sofort" }]} />
        <Wahl label="3. Ist ein Kind unter drei dabei?" wert={a.kind}
          onChange={(v) => setze("kabine", { ...a, kind: v })}
          optionen={[{ v: "ja", l: "ja" }, { v: "nein", l: "nein" }]} />
        <Wahl label="4. Schlaft ihr leicht?" wert={a.schlaf}
          onChange={(v) => setze("kabine", { ...a, schlaf: v })}
          optionen={[{ v: "leicht", l: "ja, leicht" }, { v: "normal", l: "nein, eher fest" }]} />
        <div style={{ fontFamily: SANS, fontSize: 14.5, color: C.navy, marginBottom: 6 }}>5. Eure Route</div>
        <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted }}>
          {route
            ? { karibik: "Karibik oder Kanaren", mittel: "Mittelmeer", nord: "Nordland oder Ostsee", trans: "Transatlantik", andere: "Andere Route" }[route]
            : "Noch nicht gesetzt — tragt sie oben im Reise-Setup ein."}
        </div>
      </Card>

      {e ? (
        <Card tone="white" style={{ border: `1px solid ${C.blue}` }}>
          <Kicker>Eure Empfehlung</Kicker>
          <H3 style={{ fontSize: 26 }}>{e.typ}, {e.lage}</H3>
          <P style={{ fontFamily: SANS, fontSize: 15, color: C.navy }}>
            Lage: {e.deck}.
          </P>
          {e.gruende.map((g, i) => <P key={i}>{g}</P>)}

          <div style={{ height: 1, background: C.line, margin: "6px 0 20px" }} />
          <Kicker color={C.warn}>Die Warnungen, die keine Buchungsseite hinschreibt</Kicker>
          {e.warnungen.map((w, i) => <P key={i} style={{ fontSize: 14.5 }}>{w}</P>)}

          {e.nicht.length > 0 && (
            <div style={{ background: C.skySoft, borderRadius: 12, padding: "16px 16px 6px", marginTop: 8 }}>
              <div style={{ fontFamily: SANS, fontSize: 14, color: C.navy, marginBottom: 8 }}>
                Der Aufpreis lohnt sich nicht, wenn …
              </div>
              {e.nicht.map((n, i) => (
                <P key={i} style={{ fontSize: 14.5, marginBottom: 10 }}>… {n}.</P>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20, background: C.greenSoft, borderRadius: 12, padding: "16px" }}>
            <P style={{ margin: 0, fontSize: 14.5, color: C.navy }}>
              Fragt beim Buchen konkret nach einer Kabine, über und unter der ebenfalls Kabinen liegen, denn das ist die Frage, die kaum jemand stellt und die am meisten bringt.
            </P>
          </div>
        </Card>
      ) : (
        <Card>
          <P style={{ margin: 0, fontSize: 14.5 }}>
            Beantwortet alle fünf Fragen, dann bekommt ihr hier eure Empfehlung samt der Warnungen, die auf keiner Buchungsseite stehen.
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

  let getraenke = 0;
  let paketTipp = null;
  if (b.getraenke) {
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
  if (b.ausfluege === "wenige") ausfluege = 3 * PREIS.ausflug * personen;
  else if (b.ausfluege === "jeder") ausfluege = haefen * PREIS.ausflug * personen;
  if (ausfluege) zeilen.push({ t: "Ausflüge über die Reederei", v: ausfluege });

  let wlan = 0;
  if (b.wlan === "gelegentlich") wlan = Math.round(PREIS.wlanTag * naechte * 0.5);
  else if (b.wlan === "durchgehend") wlan = PREIS.wlanTag * naechte;
  if (wlan) zeilen.push({ t: "WLAN an Bord", v: wlan });

  let trinkgeld = 0;
  if (b.trinkgeld === "nein") trinkgeld = PREIS.trinkgeld * personen * naechte;
  if (trinkgeld) zeilen.push({ t: "Trinkgeld", v: trinkgeld });

  let spezial = 0;
  if (b.spezial === "wenige") spezial = 2 * PREIS.spezial * personen;
  else if (b.spezial === "viele") spezial = 5 * PREIS.spezial * personen;
  if (spezial) zeilen.push({ t: "Spezialitätenrestaurants", v: spezial });

  let spa = 0;
  if (b.spa === "ja") spa = PREIS.spa * personen;
  if (spa) zeilen.push({ t: "Spa und Wellness", v: spa });

  let fotos = 0;
  if (b.fotos === "ja") fotos = PREIS.fotos;
  if (fotos) zeilen.push({ t: "Fotos und Shop", v: fotos });

  const summe = zeilen.reduce((a, z) => a + z.v, 0);
  const preis = parseFloat((s.reisepreis || "").replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  const prozent = preis > 0 ? Math.round((summe / preis) * 100) : null;

  return { zeilen, summe, prozent, paketTipp, personen, naechte, haefen };
}

function ModulBord({ daten, setze }) {
  const b = daten.bord;
  const s = daten.setup;
  const r = useMemo(() => bordRechnung(b, s), [b, s]);
  const set = (k, v) => setze("bord", { ...b, [k]: v });

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
        <Wahl label="Was trinkt ihr an Bord?" wert={b.getraenke} onChange={(v) => set("getraenke", v)}
          optionen={[{ v: "sparsam", l: "Wasser & Kaffee" }, { v: "gemischt", l: "gemischt" }, { v: "cocktails", l: "gerne Cocktails" }]} />
        <Wahl label="Getränkepaket?" wert={b.paket} onChange={(v) => set("paket", v)}
          optionen={[{ v: "rechnen", l: "rechnet für uns" }, { v: "ja", l: "haben wir" }, { v: "nein", l: "wollen wir nicht" }]} />
        <Wahl label="Ausflüge über die Reederei" wert={b.ausfluege} onChange={(v) => set("ausfluege", v)}
          optionen={[{ v: "keine", l: "keine" }, { v: "wenige", l: "zwei bis drei" }, { v: "jeder", l: "an jedem Hafen" }]} />
        <Wahl label="WLAN an Bord" wert={b.wlan} onChange={(v) => set("wlan", v)}
          optionen={[{ v: "nein", l: "gar keins" }, { v: "gelegentlich", l: "gelegentlich" }, { v: "durchgehend", l: "durchgehend" }]} />
        <Wahl label="Ist das Trinkgeld im Reisepreis enthalten?" wert={b.trinkgeld} onChange={(v) => set("trinkgeld", v)}
          optionen={[{ v: "ja", l: "ja, enthalten" }, { v: "nein", l: "nein, kommt dazu" }]} />
        <Wahl label="Spezialitätenrestaurants" wert={b.spezial} onChange={(v) => set("spezial", v)}
          optionen={[{ v: "keine", l: "keine" }, { v: "wenige", l: "ein bis zwei" }, { v: "viele", l: "öfter" }]} />
        <Wahl label="Spa und Wellness" wert={b.spa} onChange={(v) => set("spa", v)}
          optionen={[{ v: "nein", l: "nein" }, { v: "ja", l: "ja" }]} />
        <Wahl label="Fotos und Shop" wert={b.fotos} onChange={(v) => set("fotos", v)}
          optionen={[{ v: "nein", l: "nein" }, { v: "ja", l: "ja" }]} />
      </Card>

      {r.zeilen.length > 0 && (
        <Card tone="white" style={{ border: `1px solid ${C.blue}` }}>
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
        <P><strong style={{ color: C.navy }}>Getränkepaket.</strong> Der größte Hebel, weshalb ihr ehrlich rechnen solltet, denn ab etwa fünf bis sechs Getränken am Tag lohnt es sich, und wer abends zwei Gläser Wein trinkt, kommt ohne Paket deutlich günstiger weg.</P>
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

function ModulLandgang({ daten, setze }) {
  const h = daten.haefen;
  function add() {
    setze("haefen", [...h, { id: "h" + Date.now(), name: "", an: "08:00", ab: "18:00", puffer: "45", weg: "" }]);
  }
  function upd(id, k, v) {
    setze("haefen", h.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  }

  return (
    <div>
      <Kicker>Modul 5</Kicker>
      <H2>Der Landgang-Planer</H2>
      <Lead>
        <span>Ein Hafentag fühlt sich lang an, ist aber kürzer als gedacht, weil Ausschiffung, Weg zum Zentrum und Rückweg schnell drei Stunden fressen.</span>
      </Lead>

      {h.length === 0 && (
        <Card>
          <P style={{ margin: 0, fontSize: 14.5 }}>
            Legt für jeden Hafen einen Eintrag an, tragt Ankunft und Abfahrt ein, und wir rechnen euch aus, wie viel Zeit ihr wirklich habt statt der Zeit, die auf dem Papier steht.
          </P>
        </Card>
      )}

      {h.map((x) => {
        const an = minuten(x.an);
        const ab = minuten(x.ab);
        const puf = parseInt(x.puffer || "45", 10) || 45;
        const bord = ab !== null ? ab - puf : null;
        const netto = an !== null && bord !== null ? bord - an - 60 : null;
        const amp = x.weg ? AMPEL[x.weg] : null;
        return (
          <Card key={x.id} tone="white">
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Feld label="Hafen" wert={x.name} onChange={(v) => upd(x.id, "name", v)} placeholder="z. B. Funchal" />
              </div>
              <button type="button" onClick={() => setze("haefen", h.filter((y) => y.id !== x.id))}
                aria-label="Hafen entfernen" style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: C.muted, padding: 6, marginTop: 26,
                }}><X size={17} /></button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><Feld label="Ankunft" type="time" wert={x.an} onChange={(v) => upd(x.id, "an", v)} /></div>
              <div style={{ flex: 1 }}><Feld label="Abfahrt" type="time" wert={x.ab} onChange={(v) => upd(x.id, "ab", v)} /></div>
              <div style={{ flex: 1 }}><Feld label="Bordzeit vor Abfahrt" type="number" wert={x.puffer} onChange={(v) => upd(x.id, "puffer", v)} hinweis="Minuten" /></div>
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

            <Wahl label="Wie weit wollt ihr weg vom Hafen?" wert={x.weg} onChange={(v) => upd(x.id, "weg", v)}
              optionen={[{ v: "nah", l: "Zentrum, zu Fuß" }, { v: "mittel", l: "bis eine Stunde" }, { v: "weit", l: "weiter weg" }]} />

            {amp && (
              <div style={{ background: amp.bg, borderRadius: 12, padding: "16px" }}>
                <div style={{ fontFamily: SANS, fontSize: 15, color: amp.farbe, marginBottom: 7 }}>{amp.titel}</div>
                <div style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.62, color: C.navy }}>{amp.text}</div>
              </div>
            )}
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
          <div style={{ flex: 1 }}><Feld label="Nächte" type="number" wert={s.naechte} onChange={(v) => set("naechte", v)} /></div>
          <div style={{ flex: 1 }}><Feld label="Personen" type="number" wert={s.personen} onChange={(v) => set("personen", v)} /></div>
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
   START
========================================================= */
function Start({ daten, gehe, fortschritt }) {
  const s = daten.setup;
  const ab = alsDatum(s.abfahrt);
  const tage = ab ? tageBis(ab) : null;

  return (
    <div>
      <div style={{ textAlign: "center", padding: "10px 0 26px" }}>
        <div style={{ fontFamily: SANS, fontSize: 11.5, letterSpacing: 3.4, color: C.blue, marginBottom: 12 }}>
          @WOLKEN.WANDERER
        </div>
        <h1 style={{
          fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(40px, 11vw, 60px)",
          color: C.navy, margin: "0 0 12px", letterSpacing: -0.5,
        }}>Klarschiff</h1>
        <div style={{ fontFamily: SERIF, fontSize: 17.5, fontStyle: "italic", color: C.body, lineHeight: 1.5 }}>
          Der Kreuzfahrt-Planer von einem Crew-Paar,<br />das weiß, wie der Laden von innen läuft
        </div>
      </div>

      {tage !== null && (
        <Card tone="white" style={{ textAlign: "center", border: `1px solid ${C.blue}` }}>
          {tage > 0 ? (
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 46, color: C.navy, lineHeight: 1 }}>{tage}</div>
              <div style={{ fontFamily: SANS, fontSize: 14.5, color: C.body, marginTop: 8 }}>
                {tage === 1 ? "Tag" : "Tage"} bis {s.schiff ? s.schiff : "zur Abfahrt"}
              </div>
            </div>
          ) : tage === 0 ? (
            <div style={{ fontFamily: SERIF, fontSize: 26, color: C.navy }}>Heute geht es los ⚓</div>
          ) : (
            <div style={{ fontFamily: SERIF, fontSize: 22, color: C.navy }}>Gute Reise — oder legt eine neue Reise an.</div>
          )}
        </Card>
      )}

      <button type="button" onClick={() => gehe("setup")} style={{
        width: "100%", textAlign: "left", cursor: "pointer", marginBottom: 22,
        background: C.sky, border: "none", borderRadius: 16, padding: "20px",
      }}>
        <div style={{ fontFamily: SANS, fontSize: 15.5, color: C.navy, marginBottom: 5 }}>
          {s.reederei || s.schiff ? `${s.reederei} ${s.schiff}`.trim() : "Reise-Setup ausfüllen"}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted }}>
          {ab ? `Abfahrt ${kurz(ab)} · ${s.naechte} Nächte · ${s.personen} Personen` : "Damit rechnet euch der Countdown echte Termine aus."}
        </div>
      </button>

      {MODULE.map((m) => {
        const f = fortschritt[m.id];
        return (
          <button key={m.id} type="button" onClick={() => gehe(m.id)} style={{
            width: "100%", textAlign: "left", cursor: "pointer", marginBottom: 12,
            background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: "20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 7 }}>
              <div style={{ fontFamily: SERIF, fontSize: 21, color: C.navy }}>{m.titel}</div>
              <ChevronRight size={17} color={C.muted} />
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13.8, lineHeight: 1.6, color: C.muted, marginBottom: f ? 12 : 0 }}>
              {m.teaser}
            </div>
            {f && <Balken wert={f.wert} gesamt={f.gesamt} />}
          </button>
        );
      })}

      <div style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.7, color: C.muted, textAlign: "center", padding: "24px 6px 10px" }}>
        Alle Eingaben bleiben ausschließlich auf eurem Gerät und werden nicht übertragen.
        Klarschiff funktioniert offline — legt es euch auf den Startbildschirm, dann habt ihr es an Bord ohne WLAN dabei.
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
    setDaten(LEER);
    setFrage(false);
    setScreen("start");
  }

  if (!geladen) return null;

  const istModul = typeof screen === "number";

  return (
    <div style={{
      minHeight: "100vh", background: C.paper,
      paddingBottom: istModul || screen === "setup" ? 100 : 40,
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "22px 20px 0" }}>
        {(istModul || screen === "setup") && (
          <button type="button" onClick={() => setScreen("start")} style={{
            display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 20,
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: SANS, fontSize: 14.5, color: C.blue, padding: "6px 0", minHeight: 40,
          }}><ChevronLeft size={16} /> Übersicht</button>
        )}

        {screen === "start" && <Start daten={daten} gehe={setScreen} fortschritt={fortschritt} />}
        {screen === "setup" && <Setup daten={daten} setze={setze} />}
        {screen === 1 && <ModulCountdown daten={daten} setzeHaken={setzeHaken} />}
        {screen === 2 && <ModulKabine daten={daten} setze={setze} />}
        {screen === 3 && <ModulPack daten={daten} setze={setze} setzeHaken={setzeHaken} />}
        {screen === 4 && <ModulBord daten={daten} setze={setze} />}
        {screen === 5 && <ModulLandgang daten={daten} setze={setze} />}
        {screen === 6 && <ModulTag1 daten={daten} setzeHaken={setzeHaken} />}
        {screen === 7 && <ModulDoks daten={daten} setze={setze} />}

        {screen === "start" && (
          <div style={{ textAlign: "center", padding: "6px 0 30px" }}>
            <Btn small variant="quiet" onClick={() => setFrage(true)}>
              <RotateCcw size={14} /> Neue Reise anlegen
            </Btn>
          </div>
        )}
      </div>

      {istModul && (
        <nav style={{
          position: "fixed", left: 0, right: 0, bottom: 0, background: C.paper,
          borderTop: `1px solid ${C.line}`, padding: "12px 20px calc(12px + env(safe-area-inset-bottom))",
        }}>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", gap: 10 }}>
            <Btn small variant="quiet" onClick={() => setScreen(screen > 1 ? screen - 1 : "start")}
              style={{ flexShrink: 0 }}><ChevronLeft size={15} /> Zurück</Btn>
            {screen < 7 && (
              <Btn small onClick={() => setScreen(screen + 1)} style={{ flex: 1 }}>
                Weiter <ChevronRight size={15} />
              </Btn>
            )}
            {screen === 7 && (
              <Btn small onClick={() => setScreen("start")} style={{ flex: 1 }}>Zur Übersicht</Btn>
            )}
          </div>
        </nav>
      )}

      {frage && (
        <div role="dialog" aria-modal="true" onClick={() => setFrage(false)} style={{
          position: "fixed", inset: 0, zIndex: 60, background: "rgba(18,57,92,0.44)",
          display: "grid", placeItems: "center", padding: 22,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.paper, borderRadius: 18, padding: "30px 24px 24px", maxWidth: 400, width: "100%",
          }}>
            <H3>Neue Reise anlegen?</H3>
            <P style={{ fontSize: 14.5 }}>
              Damit werden alle Eingaben und Häkchen gelöscht, und ihr startet mit einem leeren Planer.
            </P>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn small variant="outline" onClick={() => setFrage(false)} style={{ flex: 1 }}>Abbrechen</Btn>
              <Btn small onClick={neueReise} style={{ flex: 1 }}>Zurücksetzen</Btn>
            </div>
          </div>
        </div>
      )}

      <div aria-live="polite" style={{
        position: "fixed", bottom: 84, left: "50%",
        transform: `translateX(-50%) translateY(${gespeichert ? "0" : "16px"})`,
        opacity: gespeichert ? 1 : 0, transition: "all .3s", pointerEvents: "none", zIndex: 50,
        background: C.navy, color: C.white, fontFamily: SANS, fontSize: 13,
        padding: "9px 18px", borderRadius: 30, display: "flex", alignItems: "center", gap: 8,
      }}>
        <Check size={14} /> Gespeichert
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
