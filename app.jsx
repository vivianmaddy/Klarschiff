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
const Home = (p) => <Svg {...p}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /></Svg>;
const Search = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.2" y2="16.2" /></Svg>;
const MapPin = (p) => (
  <Svg {...p}><path d="M19.5 10.5c0 6-7.5 11-7.5 11s-7.5-5-7.5-11a7.5 7.5 0 0 1 15 0z" /><circle cx="12" cy="10.5" r="2.6" /></Svg>
);
const Menu = (p) => <Svg {...p}><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></Svg>;
const Anchor = (p) => (
  <Svg {...p}><circle cx="12" cy="5" r="2.2" /><line x1="12" y1="7.2" x2="12" y2="21" />
    <path d="M5 13a7 7 0 0 0 14 0" /><line x1="5" y1="13" x2="5" y2="10" /><line x1="19" y1="13" x2="19" y2="10" /></Svg>
);
const Waves = (p) => (
  <Svg {...p}><path d="M2 8c1.8-1.6 3.6-1.6 5.4 0s3.6 1.6 5.4 0 3.6-1.6 5.4 0 3.6 1.6 5.4 0" />
    <path d="M2 15c1.8-1.6 3.6-1.6 5.4 0s3.6 1.6 5.4 0 3.6-1.6 5.4 0 3.6 1.6 5.4 0" /></Svg>
);
const Compass = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><polygon points="14.5 9.5 12 12 9.5 14.5 12 12 14.5 9.5" /></Svg>
);
const Ship = (p) => (
  <Svg {...p}><path d="M3 16l1.6 4.2c.3.7 1 1.1 1.7 1.1h11.4c.7 0 1.4-.4 1.7-1.1L21 16" />
    <path d="M5 16V9h14v7" /><path d="M8 9V5h8v4" /><line x1="12" y1="2" x2="12" y2="5" /></Svg>
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

  /* Karte — Blau/Weiß/Creme */
  wasser: "#BFDCEE",
  wasserLinie: "#9CC5E3",
  land: "#FBF7EE",
  landLinie: "#D9CFB8",
};

const SERIF = "'Bodoni Moda', 'Playfair Display', Georgia, serif";
const SANS = "'Questrial', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', monospace";
const DISPLAY = "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif";

const RUND = 16;
const RUND_KLEIN = 10;

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

/* Werte fürs Countdown-Kärtchen — mit Abfahrtszeit auf Tage+Stunden
   genau, ohne Abfahrtszeit auf ganze Kalendertage (wie überall sonst
   in der App). Gibt null zurück, wenn kein Abfahrtsdatum bekannt ist
   oder die Abfahrt schon vorbei ist. */
function countdownWerte(s) {
  const ab = alsDatum(s.abfahrt);
  if (!ab) return null;
  const tageKalendarisch = tageBis(ab);
  if (tageKalendarisch < 0) return null;

  if (s.abfahrtZeit) {
    const [hh, mm] = s.abfahrtZeit.split(":").map(Number);
    const ziel = new Date(ab.getFullYear(), ab.getMonth(), ab.getDate(), hh || 0, mm || 0).getTime();
    const diffMs = ziel - Date.now();
    if (diffMs <= 0) return null;
    const stundenGesamt = Math.floor(diffMs / 3600000);
    const tage = Math.floor(stundenGesamt / 24);
    const stunden = stundenGesamt % 24;
    return [
      { zahl: String(tage), label: tage === 1 ? "Tag" : "Tage" },
      { zahl: String(stunden), label: stunden === 1 ? "Stunde" : "Stunden" },
    ];
  }
  return [{ zahl: String(tageKalendarisch), label: tageKalendarisch === 1 ? "Tag" : "Tage" }];
}

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
  {
    id: "tempel", titel: "Für Tempel- und Kultur-Häfen", wenn: (f) => (f.typen || []).indexOf("TK") >= 0,
    punkte: [
      { id: "schulterbedeckt", t: "Ein Oberteil mit bedeckten Schultern", stern: true, d: "An vielen Tempeln ist das Voraussetzung für den Einlass, und ein Tuch zum Überziehen reicht meist schon." },
      { id: "langehose", t: "Eine leichte lange Hose oder ein langer Rock" },
      { id: "schnellschuhe", t: "Schuhe, die sich schnell aus- und wieder anziehen lassen", d: "Vor vielen Tempeln müsst ihr die Schuhe ausziehen." },
    ],
  },
  {
    id: "golf", titel: "Für Golf- und Wüsten-Häfen", wenn: (f) => (f.typen || []).indexOf("WU") >= 0,
    punkte: [
      { id: "kopfbedeckung", t: "Kopfbedeckung gegen die Sonne" },
      { id: "leichtekleidung", t: "Leichte, bedeckende Kleidung statt Shorts und Trägertop", d: "Auch aus Respekt vor lokalen Gepflogenheiten abseits der Strandresorts." },
      { id: "sonnenhoch", t: "Sonnenschutz mit sehr hohem Faktor" },
    ],
  },
  {
    id: "arktisnatur", titel: "Für Fjord-, Arktis- und Naturhäfen", wenn: (f) => ["FJ", "NA"].some((t) => (f.typen || []).indexOf(t) >= 0),
    punkte: [
      { id: "extraschicht", t: "Eine zusätzliche warme Schicht mehr, als ihr für nötig haltet", stern: true },
      { id: "fernglas", t: "Fernglas für Wale, Vögel oder Gletscher" },
      { id: "wanderschuhe", t: "Wasserfeste, eingelaufene Schuhe" },
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

/* Ideen für Tage ohne Landgang. */
const SEETAG_IDEEN = [
  "Früh aufstehen und Deck-Yoga oder eine Runde auf dem Laufdeck, solange es dort noch leer ist.",
  "Das Tagesprogramm in Ruhe durchlesen und die guten Plätze für Shows oder Vorträge vormerken.",
  "Spa und Sauna nutzen, an Seetagen ist es dort deutlich ruhiger als an Hafentagen.",
  "Ein Buch, das ihr euch für genau diesen Moment aufgehoben habt.",
  "Die Kabine oder den Koffer einmal in Ruhe sortieren, bevor der nächste Hafentag alles wieder durcheinanderbringt.",
  "Ein Spezialitätenrestaurant für den Abend reservieren, an Seetagen sind die guten Zeiten oft noch frei.",
  "Am Nachmittag einen Blick auf die Live-Positionskarte werfen, wo genau ihr gerade seid, macht überraschend viel Freude.",
];

/* Typische Bordaktivitäten für den Rückblick im Fahrtenbuch — bewusst
   reedereiübergreifend gehalten, feste Multiple-Choice-Liste. */
const BORD_AKTIVITAETEN = [
  { v: "pool", l: "🏊 Pool & Sonnendeck" },
  { v: "spa", l: "💆 Spa & Sauna" },
  { v: "shows", l: "🎭 Shows & Theater" },
  { v: "casino", l: "🎰 Casino" },
  { v: "fitness", l: "🏋️ Fitness & Sport" },
  { v: "kids", l: "🧒 Kids Club" },
  { v: "quiz", l: "🧠 Quiz & Spieleabend" },
  { v: "kochkurs", l: "🍳 Kochkurs oder Cocktailkurs" },
  { v: "spezial", l: "🍽️ Spezialitätenrestaurant" },
  { v: "shopping", l: "🛍️ Shopping an Bord" },
  { v: "livemusik", l: "🎷 Live-Musik & Bar" },
  { v: "vortrag", l: "🗺️ Landausflug-Vortrag" },
  { v: "ruhe", l: "📖 Lesen & Ruhe an Deck" },
];

/* =========================================================
   MODULÜBERSICHT
========================================================= */
const MODULE = [
  { id: 1, titel: "Der Countdown", teaser: "Von drei Monaten vorher bis zum Einschiffungstag, ohne dass ihr euch etwas merken müsst." },
  { id: 2, titel: "Der Kabinen-Check", teaser: "Was euch in eurer gebuchten Kabine erwartet — und was ihr jetzt noch erledigen könnt." },
  { id: 3, titel: "Die Packliste", teaser: "Passt sich eurer Route und Familiengröße an, samt der Dinge, die fast alle vergessen." },
  { id: 4, titel: "Der Bordkonto-Rechner", teaser: "Was an Bord noch dazukommt, bevor es euch die Endabrechnung sagt." },
  { id: 6, titel: "Der erste Tag an Bord", teaser: "Die Reihenfolge, die über entspannt oder hinterherlaufen entscheidet." },
  { id: 7, titel: "Dokumente und Notfall", teaser: "Alle wichtigen Zahlen offline griffbereit, weil offline an Bord der Normalzustand ist." },
  { id: 8, titel: "Das Fahrtenbuch", teaser: "Jede gefahrene Reise, jeder Hafen, jede Notiz — und was sich über die Jahre summiert." },
];

/* =========================================================
   LEERER STAND
========================================================= */
const LEER = {
  nutzerName: "",
  setup: {
    reederei: "", schiff: "", route: "", abfahrt: "", abfahrtZeit: "", naechte: "7",
    personen: "2", kind: false, anreise: "", saison: "", gala: false, reisepreis: "",
    interessen: [],
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
  geplant: [],
  wunschliste: [],
  hafenNotizen: {},
  tagebuch: [],
  doks: {
    buchung: "", kabinennr: "", versicherung: "", notruf: "", ausweise: "",
    medikamente: "", blutgruppe: "", kontakt: "", agentur: "",
  },
};

const INTERESSEN_OPTIONEN = [
  { v: "schnorcheln", l: "Schnorcheln & Strand" },
  { v: "geschichte", l: "Geschichte & Kultur" },
  { v: "natur", l: "Natur & Wandern" },
  { v: "shopping", l: "Shopping" },
  { v: "kulinarik", l: "Kulinarik" },
  { v: "nachtleben", l: "Nachtleben" },
  { v: "familie", l: "Familie & Kinder" },
];
/* Ordnet Hafentypen den Interessen zu, für den „Passt zu euch"-Hinweis. */
const INTERESSEN_ZU_TYP = {
  schnorcheln: ["SI", "PI"],
  geschichte: ["RU", "AS", "TK"],
  natur: ["FJ", "NA", "DJ"],
  shopping: ["GM", "HK"],
  kulinarik: ["AS", "TK", "SA"],
  nachtleben: ["GM", "SI"],
  familie: ["PI", "SI", "GM"],
};

/* =========================================================
   BAUSTEINE
========================================================= */
function Kicker({ children, color, hell }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
      <span aria-hidden="true" style={{ width: 20, height: 1, background: C.messing, flexShrink: 0 }} />
      <span style={{
        fontFamily: MONO, fontSize: 11.5, letterSpacing: 2.4, fontWeight: 500,
        textTransform: "uppercase", color: color || (hell ? C.messingHell : C.muted),
      }}>{children}</span>
    </div>
  );
}

function H2({ children, style }) {
  return (
    <h2 style={{
      fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(27px, 6.6vw, 39px)",
      lineHeight: 1.08, letterSpacing: "-0.02em", color: C.navy, margin: 0, ...style,
    }}>{children}</h2>
  );
}

function H3({ children, style }) {
  return (
    <h3 style={{
      fontFamily: DISPLAY, fontWeight: 700, fontSize: 21, lineHeight: 1.2,
      letterSpacing: "-0.01em", color: C.navy, margin: "0 0 14px", ...style,
    }}>{children}</h3>
  );
}

function P({ children, style }) {
  return (
    <p style={{
      fontFamily: SANS, fontSize: 16.5, lineHeight: 1.72,
      color: C.body, margin: "0 0 16px", ...style,
    }}>{children}</p>
  );
}

function Card({ children, tone, style }) {
  const bg = tone === "white" ? C.white : tone === "warn" ? C.warnSoft
    : tone === "green" ? C.greenSoft : tone === "sand" ? C.sand : C.sky;
  return (
    <section style={{
      background: bg, borderRadius: RUND, padding: "22px 20px", marginBottom: 14,
      boxShadow: "0 1px 2px rgba(11,35,56,0.05)", ...style,
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

function Btn({ children, onClick, variant = "solid", small, full, style, title, disabled }) {
  const solide = variant === "solid";
  const skin = solide
    ? { background: C.tiefsee, color: C.white, borderColor: C.tiefsee,
        boxShadow: `inset 0 0 0 1px ${C.messingLeise}` }
    : variant === "quiet"
      ? { background: "transparent", color: C.body, borderColor: "transparent" }
      : { background: C.white, color: C.navy, borderColor: C.line };
  return (
    <button type="button" onClick={onClick} title={title} disabled={disabled} style={{
      fontFamily: SANS, fontSize: small ? 13.5 : 15, letterSpacing: 0.1,
      padding: small ? "11px 18px" : "15px 26px", minHeight: 46,
      borderWidth: 1, borderStyle: "solid", borderRadius: 999, cursor: disabled ? "default" : "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      width: full ? "100%" : "auto", opacity: disabled ? 0.5 : 1, ...skin, ...style,
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
        fontFamily: MONO, fontSize: 12, letterSpacing: 0.6, color: C.muted, marginTop: 7,
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
          fontFamily: SANS, fontSize: 16.5, lineHeight: 1.5,
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
        display: "block", fontFamily: MONO, fontSize: 12, letterSpacing: 1.4,
        textTransform: "uppercase", color: C.muted, marginBottom: 7,
        overflowWrap: "anywhere",
      }}>{label}</label>
      <input type={type} value={wert} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        inputMode={type === "number" ? "numeric" : undefined}
        style={{ ...eingabeStil, fontFamily: daten ? MONO : SANS, fontSize: daten ? 15 : 16 }} />
      {hinweis && (
        <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, marginTop: 6 }}>{hinweis}</div>
      )}
    </div>
  );
}

function Wahl({ label, wert, onChange, optionen, hinweis }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: MONO, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase",
        color: C.muted, marginBottom: 9,
      }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {optionen.map((o) => {
          const an = wert === o.v;
          return (
            <button key={o.v} type="button" onClick={() => onChange(an ? "" : o.v)} style={{
              fontFamily: SANS, fontSize: 15, cursor: "pointer", minHeight: 44,
              padding: "11px 16px", borderRadius: 3,
              border: `1px solid ${an ? C.tiefsee : C.line}`,
              background: an ? C.tiefsee : "transparent", color: an ? C.white : C.body,
              boxShadow: an ? `inset 0 0 0 1px ${C.messingLeise}` : "none",
            }}>{o.l}</button>
          );
        })}
      </div>
      {hinweis && (
        <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, marginTop: 8 }}>{hinweis}</div>
      )}
    </div>
  );
}

/* Echtes Auswahlfeld statt Freitext — mit "Andere"-Ausweg für Fälle,
   die unsere Liste nicht abdeckt, damit niemand blockiert wird. */
function Auswahl({ label, wert, onChange, optionen, platzhalter, deaktiviert, hinweis }) {
  const bekannt = optionen.indexOf(wert) >= 0;
  const [andereOffen, setAndereOffen] = useState(wert !== "" && !bekannt);
  return (
    <div style={{ marginBottom: 16, minWidth: 0 }}>
      <label style={{
        display: "block", fontFamily: MONO, fontSize: 12, letterSpacing: 1.4,
        textTransform: "uppercase", color: C.muted, marginBottom: 7,
      }}>{label}</label>
      {andereOffen ? (
        <div>
          <input type="text" value={wert} placeholder={label}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...eingabeStil, fontFamily: SANS, fontSize: 16 }} />
          <button type="button" onClick={() => { setAndereOffen(false); onChange(""); }} style={{
            background: "transparent", border: "none", cursor: "pointer", color: C.muted,
            fontFamily: SANS, fontSize: 13.5, padding: "8px 0", textDecoration: "underline",
          }}>Doch aus der Liste wählen</button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <select value={bekannt ? wert : ""} disabled={deaktiviert}
            onChange={(e) => { if (e.target.value === "__andere__") { setAndereOffen(true); onChange(""); } else onChange(e.target.value); }}
            style={{
              ...eingabeStil, fontFamily: SANS, fontSize: 16, appearance: "none", WebkitAppearance: "none",
              paddingRight: 40, opacity: deaktiviert ? 0.55 : 1, cursor: deaktiviert ? "default" : "pointer",
              color: wert ? C.navy : C.muted,
            }}>
            <option value="" disabled>{platzhalter || "Bitte wählen"}</option>
            {optionen.map((o) => <option key={o} value={o}>{o}</option>)}
            <option value="__andere__">Andere / nicht gelistet …</option>
          </select>
          <ChevronRight size={15} color={C.messing} style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%) rotate(90deg)",
            pointerEvents: "none",
          }} />
        </div>
      )}
      {hinweis && (
        <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, marginTop: 6 }}>{hinweis}</div>
      )}
    </div>
  );
}

function WahlMehr({ label, werte, onChange, optionen, hinweis }) {
  const liste = werte || [];
  const um = (v) => onChange(liste.indexOf(v) >= 0 ? liste.filter((x) => x !== v) : [...liste, v]);
  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <div style={{
          fontFamily: MONO, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase",
          color: C.muted, marginBottom: 9,
        }}>{label}</div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {optionen.map((o) => {
          const an = liste.indexOf(o.v) >= 0;
          return (
            <button key={o.v} type="button" onClick={() => um(o.v)} aria-pressed={an} style={{
              fontFamily: SANS, fontSize: 15, cursor: "pointer", minHeight: 44,
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
        <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, marginTop: 8 }}>{hinweis}</div>
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
   UrlaubsCountdown – ruhiges, glasiges Kärtchen mit ein oder zwei
   nebeneinanderstehenden Kennzahlen (z. B. Tage | Stunden),
   für Start-Titelbild (dunkel) und Teilen-Postkarte (hell)
--------------------------------------------------------- */
function UrlaubsCountdown({ titel, werte, hell = false }) {
  const kartenBg = hell ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.08)";
  const kartenRand = hell ? "rgba(11,35,56,0.10)" : "rgba(228,202,149,0.22)";
  const titelFarbe = hell ? C.muted : "#A9C0CE";
  const zahlFarbe = hell ? C.navy : C.white;
  const labelFarbe = hell ? C.muted : C.messingHell;
  const trennerFarbe = hell ? "rgba(11,35,56,0.14)" : "rgba(228,202,149,0.28)";

  return (
    <div style={{
      background: kartenBg, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      border: `1px solid ${kartenRand}`, borderRadius: RUND, padding: "22px 20px",
      maxWidth: 320, margin: "0 auto",
    }}>
      {titel && (
        <div style={{
          fontFamily: SANS, fontSize: 15, color: titelFarbe, textAlign: "center", marginBottom: 16,
        }}>{titel}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {werte.map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <span aria-hidden="true" style={{ width: 1, height: 50, background: trennerFarbe, margin: "0 22px" }} />
            )}
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, lineHeight: 1,
                color: zahlFarbe, letterSpacing: "-0.02em",
              }}>{w.zahl}</div>
              <div style={{
                fontFamily: MONO, fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
                color: labelFarbe, marginTop: 7,
              }}>{w.label}</div>
            </div>
          </div>
        ))}
      </div>
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

          {a.kind === "ja" && reedereiFinden(daten.setup.reederei) && reedereiFinden(daten.setup.reederei).kidsClubAb && (
            <Card tone="white">
              <P style={{ margin: 0, fontSize: 14.5 }}>
                Bei {reedereiFinden(daten.setup.reederei).n} nimmt der Kids Club Kinder üblicherweise
                ab {reedereiFinden(daten.setup.reederei).kidsClubAb} Jahren — meldet euer Kind vorab an, sobald es geht, denn die Plätze sind begrenzt.
              </P>
            </Card>
          )}

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
  const f = {
    route: s.route, saison: s.saison, kind: s.kind, anreise: s.anreise, gala: s.gala,
    typen: typenInRoute(daten.haefen),
  };
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
            {b.hinweis && <P style={{ fontSize: 15, marginBottom: 8 }}>{b.hinweis}</P>}
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

function bordRechnung(b, s, haefen) {
  const personen = Math.max(1, parseInt(s.personen || "2", 10) || 2);
  const naechte = Math.max(1, parseInt(s.naechte || "7", 10) || 7);
  const zeilen = [];
  const inkl = b.inklusive || [];
  const hat = (k) => inkl.indexOf(k) >= 0;
  const echtesAusflugBudget = (haefen || []).reduce((a, x) => a + (parseFloat(x.budgetGeplant) || 0), 0);

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

  const haefenSchaetzung = Math.max(2, Math.round(naechte * 0.6));
  let ausfluege = 0;
  if (echtesAusflugBudget > 0) {
    ausfluege = echtesAusflugBudget;
    zeilen.push({ t: "Ausflüge (Budget aus eurem Landgang-Planer)", v: ausfluege });
  } else if (hat("ausfluege")) ausfluege = 0;
  else if (b.ausfluege === "wenige") ausfluege = 3 * PREIS.ausflug * personen;
  else if (b.ausfluege === "jeder") ausfluege = haefenSchaetzung * PREIS.ausflug * personen;
  if (ausfluege && echtesAusflugBudget === 0) zeilen.push({ t: "Ausflüge über die Reederei", v: ausfluege });

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

  return { zeilen, summe, prozent, paketTipp, personen, naechte, haefen: haefenSchaetzung, inkl, echtesAusflugBudget };
}

function ModulBord({ daten, setze }) {
  const b = daten.bord;
  const s = daten.setup;
  const r = useMemo(() => bordRechnung(b, s, daten.haefen), [b, s, daten.haefen]);
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
        <P style={{ fontSize: 15, color: C.muted }}>
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

  karibikOst: {
    name: "US-Ostküste & Karibik",
    box: [-98, 8, -58, 43],
    land: [
      /* US-Ostküste, von Maine bis Florida */
      [[-98, 43.6], [-70.2, 43.6], [-71.4, 41.3], [-73.9, 40.8], [-74.1, 40.6], [-75.5, 39.0],
       [-76.3, 36.9], [-77.9, 34.7], [-79.9, 32.8], [-80.9, 32.0], [-81.4, 30.4], [-81.0, 29.4],
       [-80.6, 28.2], [-80.1, 27.0], [-80.1, 26.0], [-80.4, 25.2], [-81.1, 25.2], [-81.5, 25.8],
       [-82.0, 26.7], [-82.7, 28.0], [-83.0, 29.2], [-84.0, 30.0], [-90.1, 29.2], [-94.8, 29.5],
       [-98, 28], [-98, 43.6]],
      /* Kuba & Bahamas */
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
      [[-71.6, 21.6], [-71.0, 21.6], [-71.0, 21.3], [-71.6, 21.3]],
      /* Mittelamerika & Nordküste Südamerika */
      [[-90, 21.5], [-88.5, 21.6], [-86.8, 21.5], [-86.75, 20.5], [-87.5, 19.5], [-87.8, 18.2],
       [-88.3, 18.5], [-88.9, 15.9], [-88.0, 15.7], [-86.0, 15.9], [-83.9, 15.8], [-83.2, 14.9],
       [-83.4, 13.0], [-83.7, 11.0], [-82.9, 9.6], [-82.2, 9.0], [-81.0, 8.9], [-79.5, 9.6],
       [-78.5, 9.4], [-77.4, 8.6], [-76.9, 8.2], [-75.5, 10.4], [-74.8, 11.0], [-74.2, 11.25],
       [-72.9, 11.5], [-71.3, 12.4], [-71.6, 11.6], [-71.0, 10.5], [-70.2, 11.4], [-68.4, 10.5],
       [-67.0, 10.6], [-65.9, 10.3], [-64.7, 10.6], [-63.9, 10.7], [-62.9, 10.7], [-62.0, 9.9],
       [-60.9, 9.4], [-60.0, 8.5], [-58, 8.0], [-90, 8.0]],
      [[-61.9, 10.85], [-60.9, 10.85], [-60.9, 10.05], [-61.9, 10.1]],
    ],
    inseln: [[-63.05, 18.05, 4], [-62.72, 17.3, 4], [-61.85, 17.1, 5], [-61.55, 16.25, 5],
             [-61.38, 15.4, 4], [-61.02, 14.65, 5], [-60.97, 13.9, 4], [-59.55, 13.15, 4],
             [-61.2, 13.25, 4], [-61.7, 12.1, 4], [-70.03, 12.5, 4], [-68.93, 12.15, 4],
             [-68.28, 12.15, 3], [-64.93, 18.34, 3], [-64.6, 18.45, 3], [-81.38, 19.3, 4],
             [-83.05, 21.55, 4], [-64.0, 11.0, 4], [-77.91, 25.82, 2], [-75.92, 23.99, 2],
             [-77.95, 25.83, 2], [-76.14, 24.85, 2]],
  },

  suedamerika: {
    name: "Südamerika",
    box: [-80, -57, -33, 13],
    land: [
      [[-33, 13], [-40, 3], [-51, -1], [-48.5, -5], [-44, -3], [-38, -4], [-34.9, -8], [-35, -9.5],
       [-37.1, -11], [-38.5, -13], [-39.0, -17], [-39.2, -19.5], [-40.9, -22], [-42, -22.9],
       [-43.2, -22.9], [-44.9, -23.4], [-46.3, -24], [-48.5, -25.5], [-48.6, -27], [-48.5, -28.6],
       [-49.3, -29.5], [-50.1, -32], [-52.1, -32.1], [-53, -33.7], [-55, -34.8], [-56.2, -34.9],
       [-58.4, -34.6], [-57.5, -36], [-62, -39.8], [-64.5, -41], [-65.1, -43.3], [-65.3, -45],
       [-67.6, -46], [-67, -47.8], [-65.9, -49.9], [-67.7, -50.1], [-68.6, -52.6], [-68.3, -54.8],
       [-71.5, -52.9], [-73.8, -52.5], [-74.7, -51.5], [-73.7, -50], [-73.4, -47.7], [-74.5, -46],
       [-73.7, -44.5], [-73.3, -42], [-73.1, -39.5], [-73.2, -37], [-73.4, -33.6], [-71.6, -33.05],
       [-71.4, -30.5], [-71.0, -27], [-70.6, -23.6], [-70.4, -20.5], [-70.2, -18.3], [-72.9, -13.5],
       [-76.3, -13.8], [-77.15, -12.05], [-79.9, -8], [-80.4, -5.8], [-80.0, -4.3], [-79.9, -2],
       [-80.0, 0], [-78.9, 1], [-78, 2], [-77.3, 4], [-77.5, 6], [-77.3, 7.2], [-75.5, 10.4],
       [-73, 11], [-70, 11], [-66.9, 10.5], [-64.3, 10.6], [-62, 8.6], [-58.5, 6.5], [-57.2, 5.9],
       [-54, 5], [-51.7, 4.6], [-49.9, 1.9], [-48.5, -0.5], [-44.3, -1.5], [-40, 0], [-35, 5],
       [-33, 13]],
    ],
    inseln: [[-63.5, -42.0, 4], [-68.3, -54.8, 3]],
  },

  asien: {
    name: "Naher Osten & Asien",
    box: [48, -12, 143, 43],
    land: [
      /* Arabische Halbinsel & Indien */
      [[48, 30], [48, 24.5], [51.5, 24.2], [51.8, 25.3], [54.3, 24.4], [56.2, 25.6], [56.4, 24.9],
       [58.6, 23.6], [59.8, 22.5], [58.9, 20], [57.1, 17.9], [54, 16.9], [52.2, 15.6], [51.5, 12.6],
       [48, 15], [45, 15], [43, 18], [42, 22], [41.5, 27], [43, 30], [48, 30]],
      [[72.8, 21.7], [73.0, 19.0], [72.83, 18.95], [73.5, 15.5], [74.7, 12.9], [76.2, 10.0],
       [77.5, 8.1], [79.8, 9.3], [80.2, 12.9], [80.3, 16.3], [82.3, 17.7], [83.9, 17.7],
       [86.5, 20.3], [88.1, 21.6], [88.5, 22.0], [72.8, 21.7]],
      [[79.6, 9.8], [81.9, 8.5], [81.6, 6.0], [79.9, 6.9], [79.6, 9.8]],
      /* Südostasien */
      [[97.3, 16], [98.4, 7.9], [99.5, 3], [103, 1.3], [104, 1.2], [104.5, 3.5], [105.8, 5],
       [102, 6.5], [100.9, 13.1], [102.6, 16.4], [104.9, 20.9], [106.7, 20.9], [107, 16.1],
       [109.2, 12.3], [104.5, 10.4], [98, 9.5], [97.3, 16]],
      [[95, 20], [92, 22], [90, 22], [88.1, 21.6], [95, 20]],
      /* Ostasien */
      [[108, 22], [113, 22.3], [114.2, 22.3], [117, 24], [118.1, 24.5], [120.5, 23.5], [121.7, 25.1],
       [121, 25.3], [119, 26], [120, 30], [121.6, 31.4], [120.5, 32.5], [122, 35], [121, 37],
       [124, 39.9], [127, 39.4], [129, 35.1], [129.5, 37], [128, 38], [130, 42], [143, 43],
       [140, 40], [139.7, 35.4], [135.2, 34.7], [131, 34], [130, 32], [129.9, 32.8], [108, 22]],
    ],
    inseln: [[115.2, -8.6, 4], [126.5, 33.5, 4], [127.7, 26.2, 4], [120.9, 14.6, 5], [123, 10, 5]],
  },

  australien: {
    name: "Australien & Neuseeland",
    box: [110, -47, 179, -10],
    land: [
      [[113, -22], [113.7, -26], [115.7, -32.1], [117.9, -35], [121, -34], [124, -32.6],
       [129, -31.6], [132, -31.9], [136, -35], [137.8, -34.8], [138, -35], [139.8, -37.9],
       [141, -38.3], [144.9, -38.4], [146.4, -38.7], [147.2, -38], [150, -37.5], [150.3, -35.6],
       [151.2, -33.9], [152.9, -31], [153.1, -28], [153.5, -25.3], [152.9, -24.8], [151, -23.4],
       [149.2, -21.1], [146.3, -18.3], [145.8, -16.9], [145.3, -14.9], [143.5, -14], [141.6, -12.4],
       [136.8, -11.9], [133.6, -11.6], [130.8, -12.4], [129, -14.9], [126.2, -14], [123.6, -16.6],
       [122, -18], [113.5, -21], [113, -22]],
      [[172.6, -34.4], [174.4, -35.2], [174.8, -36.8], [175.8, -37], [177.9, -37.7], [178.3, -38.7],
       [177.2, -39.1], [176.9, -40.4], [175, -41.3], [174.8, -41.3], [173.8, -41.7], [172.7, -40.5],
       [172.1, -40.9], [171.2, -42.5], [169.3, -43.6], [166.5, -45.4], [167.8, -46.6], [169.8, -46.6],
       [171, -44.5], [172.7, -43.6], [173.2, -41.3], [172.6, -34.4]],
    ],
    inseln: [],
  },
};

/* =========================================================
   HAFEN-DATENBANK – Koordinaten, Land, Ausflugstyp
   Grundlage für Karte, Suche und das Hafen-Lexikon.
   Format je Eintrag: [Name, Längengrad, Breitengrad, Land, Typ]
========================================================= */
const HAFENLISTE_ROH = [
  /* ---- Mittelmeer & Atlantik-Spanien/Portugal ---- */
  ["Barcelona", 2.17, 41.38, "Spanien", "AS"], ["Palma de Mallorca", 2.65, 39.57, "Spanien", "AS"],
  ["Ibiza", 1.43, 38.91, "Spanien", "AS"], ["Valencia", -0.32, 39.46, "Spanien", "AS"],
  ["Málaga", -4.42, 36.72, "Spanien", "AS"], ["Cartagena", -0.99, 37.6, "Spanien", "AS"],
  ["Marseille", 5.37, 43.3, "Frankreich", "AS"], ["Toulon", 5.93, 43.12, "Frankreich", "AS"],
  ["Nizza", 7.27, 43.7, "Frankreich", "AS"], ["Cannes", 7.02, 43.55, "Frankreich", "AS"],
  ["Monaco", 7.42, 43.73, "Monaco", "AS"], ["Genua", 8.93, 44.41, "Italien", "AS"],
  ["Savona", 8.48, 44.31, "Italien", "AS"], ["La Spezia", 9.83, 44.1, "Italien", "AS"],
  ["Livorno", 10.31, 43.55, "Italien", "AS"], ["Civitavecchia (Rom)", 11.8, 42.09, "Italien", "HK"],
  ["Neapel", 14.26, 40.84, "Italien", "RU"], ["Salerno", 14.76, 40.68, "Italien", "AS"],
  ["Messina", 15.55, 38.19, "Italien", "AS"], ["Palermo", 13.36, 38.12, "Italien", "AS"],
  ["Catania", 15.09, 37.5, "Italien", "RU"], ["Valletta", 14.51, 35.9, "Malta", "AS"],
  ["Cagliari", 9.11, 39.22, "Italien", "AS"], ["Olbia", 9.5, 40.92, "Italien", "AS"],
  ["Ajaccio", 8.74, 41.93, "Frankreich", "AS"], ["Bastia", 9.45, 42.7, "Frankreich", "AS"],
  ["Venedig", 12.34, 45.44, "Italien", "AS"], ["Triest", 13.77, 45.65, "Italien", "AS"],
  ["Ravenna", 12.28, 44.49, "Italien", "AS"], ["Ancona", 13.51, 43.62, "Italien", "AS"],
  ["Bari", 16.87, 41.13, "Italien", "AS"], ["Dubrovnik", 18.09, 42.65, "Kroatien", "AS"],
  ["Split", 16.44, 43.51, "Kroatien", "AS"], ["Zadar", 15.23, 44.12, "Kroatien", "AS"],
  ["Kotor", 18.77, 42.42, "Montenegro", "AS"], ["Korfu", 19.92, 39.62, "Griechenland", "AS"],
  ["Katakolon", 21.32, 37.65, "Griechenland", "RU"], ["Piräus (Athen)", 23.62, 37.94, "Griechenland", "HK"],
  ["Mykonos", 25.33, 37.45, "Griechenland", "AS"], ["Santorini", 25.43, 36.42, "Griechenland", "AS"],
  ["Rhodos", 28.22, 36.45, "Griechenland", "AS"], ["Heraklion (Kreta)", 25.14, 35.34, "Griechenland", "RU"],
  ["Thessaloniki", 22.94, 40.63, "Griechenland", "AS"], ["Istanbul", 28.98, 41.01, "Türkei", "HK"],
  ["Izmir", 27.14, 38.42, "Türkei", "RU"], ["Kusadasi", 27.26, 37.86, "Türkei", "RU"],
  ["Bodrum", 27.43, 37.03, "Türkei", "AS"], ["Antalya", 30.71, 36.89, "Türkei", "AS"],
  ["Limassol", 33.04, 34.68, "Zypern", "AS"], ["Haifa", 34.99, 32.82, "Israel", "HK"],
  ["Ashdod", 34.65, 31.81, "Israel", "HK"], ["Alexandria", 29.92, 31.2, "Ägypten", "RU"],
  ["Tunis (La Goulette)", 10.3, 36.82, "Tunesien", "RU"], ["Tanger", -5.8, 35.79, "Marokko", "AS"],
  ["Gibraltar", -5.35, 36.14, "Gibraltar", "AS"], ["Ceuta", -5.32, 35.89, "Spanien", "AS"],
  ["Las Palmas", -15.42, 28.14, "Spanien", "SI"], ["Santa Cruz de Tenerife", -16.25, 28.47, "Spanien", "SI"],
  ["Arrecife (Lanzarote)", -13.55, 28.96, "Spanien", "SI"], ["Puerto del Rosario", -13.86, 28.5, "Spanien", "SI"],
  ["Santa Cruz de La Palma", -17.76, 28.68, "Spanien", "SI"], ["Funchal (Madeira)", -16.91, 32.65, "Portugal", "SI"],
  ["Lissabon", -9.14, 38.71, "Portugal", "HK"], ["Porto (Leixões)", -8.7, 41.19, "Portugal", "AS"],
  ["Cádiz", -6.29, 36.53, "Spanien", "AS"], ["Casablanca", -7.62, 33.6, "Marokko", "HK"],
  ["Agadir", -9.6, 30.42, "Marokko", "SI"],
  ["Menorca (Mahón)", 4.27, 39.89, "Spanien", "AS"], ["Alicante", -0.48, 38.35, "Spanien", "AS"],
  ["La Coruña", -8.4, 43.37, "Spanien", "AS"], ["Vigo", -8.72, 42.24, "Spanien", "AS"],
  ["Bilbao", -3.02, 43.32, "Spanien", "HK"], ["Koper", 13.73, 45.55, "Slowenien", "AS"],

  /* ---- US-Ostküste & Golfküste ---- */
  ["Cape Liberty (Bayonne)", -74.09, 40.66, "USA", "GM"], ["New York", -74.02, 40.7, "USA", "GM"],
  ["Boston", -71.03, 42.35, "USA", "HK"], ["Baltimore", -76.58, 39.27, "USA", "HK"],
  ["Charleston", -79.93, 32.78, "USA", "AS"], ["Miami", -80.19, 25.77, "USA", "GM"],
  ["Fort Lauderdale", -80.14, 26.12, "USA", "GM"], ["Port Canaveral", -80.6, 28.41, "USA", "GM"],
  ["Tampa", -82.45, 27.95, "USA", "GM"], ["Key West", -81.78, 24.56, "USA", "SI"],
  ["New Orleans", -90.07, 29.95, "USA", "AS"], ["Galveston", -94.8, 29.3, "USA", "GM"],

  /* ---- US-Westküste & Alaska ---- */
  ["Los Angeles (San Pedro)", -118.29, 33.74, "USA", "GM"], ["San Diego", -117.17, 32.72, "USA", "GM"],
  ["San Francisco", -122.42, 37.81, "USA", "GM"], ["Seattle", -122.34, 47.6, "USA", "GM"],
  ["Vancouver", -123.11, 49.29, "Kanada", "GM"], ["Victoria (Vancouver Island)", -123.37, 48.43, "Kanada", "AS"],
  ["Ketchikan", -131.65, 55.34, "USA", "NA"], ["Juneau", -134.42, 58.3, "USA", "NA"],
  ["Skagway", -135.33, 59.46, "USA", "NA"], ["Sitka", -135.33, 57.05, "USA", "NA"],
  ["Icy Strait Point", -135.45, 58.11, "USA", "NA"], ["Whittier (Anchorage)", -148.68, 60.77, "USA", "NA"],
  ["Astoria", -123.83, 46.19, "USA", "AS"],

  /* ---- Mexiko Pazifik & Mittelamerika ---- */
  ["Cabo San Lucas", -109.91, 22.89, "Mexiko", "SI"], ["Puerto Vallarta", -105.23, 20.62, "Mexiko", "SI"],
  ["Mazatlán", -106.41, 23.22, "Mexiko", "SI"], ["Ensenada", -116.6, 31.86, "Mexiko", "AS"],
  ["Huatulco", -96.12, 15.77, "Mexiko", "DJ"], ["Puerto Chiapas", -92.4, 14.71, "Mexiko", "DJ"],
  ["Puerto Quetzal", -90.79, 13.92, "Guatemala", "DJ"], ["Corinto", -87.17, 12.48, "Nicaragua", "DJ"],
  ["Puntarenas", -84.83, 9.98, "Costa Rica", "DJ"], ["Puerto Limón", -83.03, 9.99, "Costa Rica", "DJ"],
  ["Colón (Panama)", -79.9, 9.36, "Panama", "DJ"],

  /* ---- Karibik & Bahamas ---- */
  ["Cozumel", -86.95, 20.51, "Mexiko", "SI"], ["Costa Maya", -87.72, 18.73, "Mexiko", "DJ"],
  ["Progreso", -89.66, 21.28, "Mexiko", "RU"], ["Bimini", -79.29, 25.73, "Bahamas", "SI"],
  ["Roatán", -86.53, 16.32, "Honduras", "SI"], ["Belize City", -88.19, 17.5, "Belize", "DJ"],
  ["Cartagena (Kolumbien)", -75.51, 10.4, "Kolumbien", "AS"],
  ["Oranjestad (Aruba)", -70.03, 12.52, "Aruba", "SI"], ["Willemstad (Curaçao)", -68.93, 12.11, "Curaçao", "AS"],
  ["Kralendijk (Bonaire)", -68.28, 12.15, "Bonaire", "SI"], ["Ocho Rios", -77.1, 18.41, "Jamaika", "DJ"],
  ["Montego Bay", -77.92, 18.47, "Jamaika", "SI"], ["Falmouth (Jamaika)", -77.65, 18.49, "Jamaika", "AS"],
  ["George Town (Cayman)", -81.38, 19.3, "Kaimaninseln", "SI"], ["Labadee", -72.24, 19.75, "Haiti", "PI"],
  ["Puerto Plata", -70.68, 19.8, "Dominikanische Republik", "AS"], ["Amber Cove", -70.69, 19.76, "Dominikanische Republik", "SI"],
  ["La Romana", -68.95, 18.42, "Dominikanische Republik", "SI"], ["Samaná", -69.33, 19.2, "Dominikanische Republik", "DJ"],
  ["Havanna", -82.36, 23.13, "Kuba", "HK"], ["Nassau", -77.34, 25.06, "Bahamas", "SI"],
  ["Freeport", -78.7, 26.53, "Bahamas", "SI"], ["Grand Turk", -71.14, 21.47, "Turks- und Caicosinseln", "SI"],
  ["Great Stirrup Cay", -77.91, 25.82, "Bahamas", "PI"], ["Half Moon Cay", -75.92, 23.99, "Bahamas", "PI"],
  ["Perfect Day at CocoCay", -77.95, 25.83, "Bahamas", "PI"], ["Princess Cays", -76.14, 24.85, "Bahamas", "PI"],
  ["San Juan", -66.11, 18.47, "Puerto Rico", "HK"], ["Charlotte Amalie (St. Thomas)", -64.93, 18.34, "US Virgin Islands", "SI"],
  ["Road Town (Tortola)", -64.62, 18.42, "Britische Jungferninseln", "SI"],
  ["Philipsburg (St. Maarten)", -63.05, 18.02, "St. Maarten (niederl.)", "SI"],
  ["Basseterre (St. Kitts)", -62.72, 17.3, "St. Kitts und Nevis", "AS"],
  ["St. John's (Antigua)", -61.85, 17.12, "Antigua und Barbuda", "SI"],
  ["Pointe-à-Pitre", -61.53, 16.24, "Guadeloupe", "SI"], ["Roseau (Dominica)", -61.39, 15.3, "Dominica", "DJ"],
  ["Fort-de-France", -61.07, 14.6, "Martinique", "SI"], ["Castries (St. Lucia)", -60.99, 14.01, "St. Lucia", "SI"],
  ["Bridgetown (Barbados)", -59.62, 13.1, "Barbados", "SI"],
  ["Kingstown (St. Vincent)", -61.22, 13.16, "St. Vincent und die Grenadinen", "SI"],
  ["St. George's (Grenada)", -61.75, 12.05, "Grenada", "AS"], ["Port of Spain", -61.51, 10.65, "Trinidad und Tobago", "HK"],

  /* ---- Nordeuropa, Ostsee & Fjorde ---- */
  ["Kiel", 10.14, 54.32, "Deutschland", "AS"], ["Hamburg", 9.97, 53.54, "Deutschland", "HK"],
  ["Warnemünde", 12.09, 54.18, "Deutschland", "AS"], ["Bremerhaven", 8.58, 53.54, "Deutschland", "AS"],
  ["Kopenhagen", 12.6, 55.68, "Dänemark", "HK"], ["Oslo", 10.73, 59.91, "Norwegen", "HK"],
  ["Kristiansand", 8.0, 58.15, "Norwegen", "AS"], ["Stavanger", 5.73, 58.97, "Norwegen", "FJ"],
  ["Bergen", 5.32, 60.39, "Norwegen", "FJ"], ["Ålesund", 6.16, 62.47, "Norwegen", "FJ"],
  ["Geiranger", 7.21, 62.1, "Norwegen", "FJ"], ["Flåm", 7.11, 60.86, "Norwegen", "FJ"],
  ["Trondheim", 10.4, 63.43, "Norwegen", "AS"], ["Bodø", 14.4, 67.28, "Norwegen", "NA"],
  ["Tromsø", 18.96, 69.65, "Norwegen", "NA"], ["Honningsvåg (Nordkap)", 25.97, 70.98, "Norwegen", "NA"],
  ["Eidfjord", 7.07, 60.47, "Norwegen", "FJ"], ["Molde", 7.09, 62.74, "Norwegen", "FJ"],
  ["Narvik", 17.42, 68.44, "Norwegen", "NA"],
  ["Stockholm", 18.07, 59.33, "Schweden", "HK"], ["Helsinki", 24.94, 60.17, "Finnland", "HK"],
  ["Tallinn", 24.75, 59.44, "Estland", "AS"], ["Riga", 24.11, 56.95, "Lettland", "AS"],
  ["Klaipėda", 21.13, 55.7, "Litauen", "AS"], ["Gdynia", 18.55, 54.52, "Polen", "AS"],
  ["Danzig", 18.65, 54.35, "Polen", "AS"], ["Świnoujście", 14.27, 53.91, "Polen", "AS"],
  ["Visby", 18.3, 57.64, "Schweden", "AS"], ["Aarhus", 10.21, 56.15, "Dänemark", "AS"],
  ["Rønne (Bornholm)", 14.7, 55.1, "Dänemark", "AS"],
  ["Göteborg", 11.97, 57.71, "Schweden", "AS"], ["IJmuiden (Amsterdam)", 4.6, 52.46, "Niederlande", "HK"],
  ["Rotterdam", 4.48, 51.92, "Niederlande", "HK"], ["Zeebrügge", 3.2, 51.33, "Belgien", "AS"],
  ["Le Havre", 0.11, 49.49, "Frankreich", "AS"], ["Saint-Malo", -2.03, 48.65, "Frankreich", "AS"],
  ["Guernsey (St. Peter Port)", -2.54, 49.46, "Vereinigtes Königreich", "AS"],
  ["Jersey (St. Helier)", -2.11, 49.19, "Vereinigtes Königreich", "AS"],
  ["Southampton", -1.4, 50.9, "Vereinigtes Königreich", "HK"],
  ["Dover", 1.31, 51.13, "Vereinigtes Königreich", "AS"], ["Leith (Edinburgh)", -3.17, 55.99, "Vereinigtes Königreich", "HK"],
  ["Invergordon", -4.17, 57.69, "Vereinigtes Königreich", "NA"], ["Kirkwall (Orkney)", -2.96, 58.98, "Vereinigtes Königreich", "NA"],
  ["Lerwick (Shetland)", -1.15, 60.16, "Vereinigtes Königreich", "NA"], ["Reykjavík", -21.94, 64.15, "Island", "NA"],
  ["Akureyri", -18.09, 65.68, "Island", "NA"], ["Ísafjörður", -23.13, 66.07, "Island", "NA"],
  ["Tórshavn (Färöer)", -6.77, 62.01, "Färöer", "NA"], ["Belfast", -5.93, 54.6, "Vereinigtes Königreich", "AS"],
  ["Dublin", -6.21, 53.35, "Irland", "HK"], ["Cobh (Cork)", -8.3, 51.85, "Irland", "AS"],

  /* ---- Atlantik-Inseln & Kanada-Ost ---- */
  ["Ponta Delgada (Azoren)", -25.67, 37.74, "Portugal", "NA"], ["Horta (Azoren)", -28.63, 38.53, "Portugal", "NA"],
  ["Hamilton (Bermuda)", -64.78, 32.29, "Bermuda", "SI"], ["Halifax", -63.57, 44.65, "Kanada", "AS"],
  ["Saint John's (Neufundland)", -52.71, 47.56, "Kanada", "NA"],

  /* ---- Südamerika ---- */
  ["Rio de Janeiro", -43.18, -22.9, "Brasilien", "SA"], ["Santos (São Paulo)", -46.33, -23.96, "Brasilien", "SA"],
  ["Salvador da Bahia", -38.51, -12.97, "Brasilien", "SA"], ["Recife", -34.87, -8.05, "Brasilien", "SA"],
  ["Buenos Aires", -58.37, -34.6, "Argentinien", "SA"], ["Montevideo", -56.19, -34.9, "Uruguay", "SA"],
  ["Punta del Este", -54.95, -34.97, "Uruguay", "SI"], ["Valparaíso", -71.63, -33.05, "Chile", "SA"],
  ["Puerto Montt", -72.94, -41.47, "Chile", "NA"], ["Ushuaia", -68.3, -54.8, "Argentinien", "NA"],
  ["Puerto Madryn", -65.03, -42.77, "Argentinien", "NA"], ["Callao (Lima)", -77.15, -12.05, "Peru", "SA"],

  /* ---- Naher Osten & Asien ---- */
  ["Dubai", 55.27, 25.2, "Vereinigte Arabische Emirate", "WU"], ["Abu Dhabi", 54.37, 24.47, "Vereinigte Arabische Emirate", "WU"],
  ["Muscat", 58.59, 23.62, "Oman", "WU"], ["Doha", 51.53, 25.29, "Katar", "WU"],
  ["Mumbai", 72.83, 18.95, "Indien", "TK"], ["Kochi (Cochin)", 76.24, 9.97, "Indien", "TK"],
  ["Goa", 73.81, 15.48, "Indien", "TK"], ["Colombo", 79.84, 6.93, "Sri Lanka", "TK"],
  ["Singapur", 103.85, 1.29, "Singapur", "GM"], ["Penang", 100.35, 5.41, "Malaysia", "TK"],
  ["Phuket", 98.39, 7.89, "Thailand", "SI"], ["Bangkok (Laem Chabang)", 100.89, 13.09, "Thailand", "TK"],
  ["Ho-Chi-Minh-Stadt (Phu My)", 107.02, 10.58, "Vietnam", "TK"], ["Da Nang", 108.22, 16.07, "Vietnam", "TK"],
  ["Nha Trang", 109.19, 12.24, "Vietnam", "SI"],
  ["Halong-Bucht (Haiphong)", 106.68, 20.87, "Vietnam", "NA"], ["Hongkong", 114.16, 22.28, "Hongkong", "GM"],
  ["Manila", 120.98, 14.6, "Philippinen", "GM"],
  ["Shanghai", 121.65, 31.36, "China", "GM"], ["Xiamen", 118.08, 24.48, "China", "AS"],
  ["Kaohsiung", 120.28, 22.61, "Taiwan", "GM"], ["Keelung (Taipeh)", 121.74, 25.13, "Taiwan", "HK"],
  ["Busan", 129.08, 35.1, "Südkorea", "GM"], ["Jeju", 126.53, 33.51, "Südkorea", "SI"],
  ["Tokyo (Yokohama)", 139.65, 35.44, "Japan", "GM"], ["Kobe (Osaka)", 135.18, 34.68, "Japan", "GM"],
  ["Nagasaki", 129.87, 32.75, "Japan", "AS"], ["Naha (Okinawa)", 127.68, 26.21, "Japan", "SI"],
  ["Bali (Benoa)", 115.21, -8.75, "Indonesien", "TK"],

  /* ---- Australien & Neuseeland ---- */
  ["Sydney", 151.21, -33.87, "Australien", "AU"], ["Melbourne", 144.96, -37.84, "Australien", "AU"],
  ["Brisbane", 153.03, -27.47, "Australien", "AU"], ["Cairns", 145.77, -16.92, "Australien", "SI"],
  ["Fremantle (Perth)", 115.74, -32.06, "Australien", "AU"], ["Auckland", 174.76, -36.84, "Neuseeland", "AU"],
  ["Wellington", 174.78, -41.29, "Neuseeland", "HK"], ["Bay of Islands", 174.09, -35.28, "Neuseeland", "NA"],
  ["Tauranga", 176.17, -37.68, "Neuseeland", "AS"],
];
const HAFENLISTE = HAFENLISTE_ROH.map((h) => ({ n: h[0], lon: h[1], lat: h[2], land: h[3], typ: h[4] }));

function normText(s) {
  return (s || "").toLowerCase()
    .replace(/[àáâä]/g, "a").replace(/[èéêë]/g, "e").replace(/[ìíîï]/g, "i")
    .replace(/[òóôöø]/g, "o").replace(/[ùúûü]/g, "u").replace(/[å]/g, "a")
    .replace(/ß/g, "ss").replace(/[^a-z0-9]/g, "");
}

function hafenVorschlaege(q, limit) {
  const s = normText(q);
  if (s.length < 2) return [];
  const treffer = HAFENLISTE.filter((h) => normText(h.n).indexOf(s) >= 0);
  treffer.sort((a, b) => normText(a.n).indexOf(s) - normText(b.n).indexOf(s));
  return treffer.slice(0, limit || 6);
}

/* =========================================================
   HAFEN-LEXIKON – Währung, Kurzinfo, Landgang auf eigene
   Faust und gebuchte Ausflüge, für jeden Hafen der Liste.
   Jeder Hafen bekommt mindestens die Vorlage seines Typs,
   die wichtigsten Häfen zusätzlich eigene, geprüfte Inhalte.
========================================================= */
const WAEHRUNG = {
  "Spanien": ["EUR", "Euro"], "Frankreich": ["EUR", "Euro"], "Monaco": ["EUR", "Euro"],
  "Italien": ["EUR", "Euro"], "Malta": ["EUR", "Euro"], "Kroatien": ["EUR", "Euro"], "Slowenien": ["EUR", "Euro"],
  "Montenegro": ["EUR", "Euro"], "Griechenland": ["EUR", "Euro"], "Zypern": ["EUR", "Euro"],
  "Portugal": ["EUR", "Euro"], "Deutschland": ["EUR", "Euro"], "Finnland": ["EUR", "Euro"],
  "Estland": ["EUR", "Euro"], "Lettland": ["EUR", "Euro"], "Litauen": ["EUR", "Euro"],
  "Niederlande": ["EUR", "Euro"], "Belgien": ["EUR", "Euro"], "Irland": ["EUR", "Euro"],
  "Guadeloupe": ["EUR", "Euro"], "Martinique": ["EUR", "Euro"],
  "Türkei": ["TRY", "Türkische Lira"], "Israel": ["ILS", "Schekel"], "Ägypten": ["EGP", "Ägyptisches Pfund"],
  "Tunesien": ["TND", "Tunesischer Dinar"], "Marokko": ["MAD", "Marokkanischer Dirham"],
  "Gibraltar": ["GIP", "Gibraltar-Pfund"], "Dänemark": ["DKK", "Dänische Krone"],
  "Norwegen": ["NOK", "Norwegische Krone"], "Schweden": ["SEK", "Schwedische Krone"],
  "Polen": ["PLN", "Złoty"], "Vereinigtes Königreich": ["GBP", "Pfund Sterling"],
  "Island": ["ISK", "Isländische Krone"], "Färöer": ["DKK", "Dänische Krone"],
  "USA": ["USD", "US-Dollar"], "Bahamas": ["BSD", "Bahama-Dollar (1:1 zum USD)"],
  "Kuba": ["CUP", "Kubanischer Peso"], "Mexiko": ["MXN", "Mexikanischer Peso"],
  "Kaimaninseln": ["KYD", "Kaiman-Dollar"], "Jamaika": ["JMD", "Jamaika-Dollar"],
  "Haiti": ["HTG", "Gourde"], "Dominikanische Republik": ["DOP", "Dominikanischer Peso"],
  "Puerto Rico": ["USD", "US-Dollar"], "US Virgin Islands": ["USD", "US-Dollar"],
  "Britische Jungferninseln": ["USD", "US-Dollar"], "St. Maarten (niederl.)": ["ANG", "Antillen-Gulden"],
  "St. Kitts und Nevis": ["XCD", "Ostkaribischer Dollar"], "Antigua und Barbuda": ["XCD", "Ostkaribischer Dollar"],
  "Dominica": ["XCD", "Ostkaribischer Dollar"], "St. Lucia": ["XCD", "Ostkaribischer Dollar"],
  "Barbados": ["BBD", "Barbados-Dollar"], "St. Vincent und die Grenadinen": ["XCD", "Ostkaribischer Dollar"],
  "Grenada": ["XCD", "Ostkaribischer Dollar"], "Trinidad und Tobago": ["TTD", "Trinidad-Dollar"],
  "Turks- und Caicosinseln": ["USD", "US-Dollar"],
  "Aruba": ["AWG", "Aruba-Florin"], "Curaçao": ["ANG", "Antillen-Gulden"], "Bonaire": ["USD", "US-Dollar"],
  "Kolumbien": ["COP", "Kolumbianischer Peso"], "Panama": ["USD", "US-Dollar (Balboa 1:1)"],
  "Costa Rica": ["CRC", "Costa-Rica-Colón"], "Nicaragua": ["NIO", "Córdoba"],
  "Guatemala": ["GTQ", "Quetzal"], "Belize": ["BZD", "Belize-Dollar"], "Honduras": ["HNL", "Lempira"],
  "Kanada": ["CAD", "Kanadischer Dollar"], "Bermuda": ["BMD", "Bermuda-Dollar (1:1 zum USD)"],
  "Brasilien": ["BRL", "Real"], "Uruguay": ["UYU", "Uruguayischer Peso"],
  "Argentinien": ["ARS", "Argentinischer Peso"], "Chile": ["CLP", "Chilenischer Peso"], "Peru": ["PEN", "Sol"],
  "Vereinigte Arabische Emirate": ["AED", "Dirham"], "Oman": ["OMR", "Rial"], "Katar": ["QAR", "Riyal"],
  "Indien": ["INR", "Rupie"], "Sri Lanka": ["LKR", "Rupie"],
  "Singapur": ["SGD", "Singapur-Dollar"], "Malaysia": ["MYR", "Ringgit"], "Thailand": ["THB", "Baht"],
  "Vietnam": ["VND", "Dong"], "Indonesien": ["IDR", "Rupiah"], "China": ["CNY", "Renminbi"],
  "Philippinen": ["PHP", "Philippinischer Peso"],
  "Hongkong": ["HKD", "Hongkong-Dollar"], "Taiwan": ["TWD", "Neuer Taiwan-Dollar"],
  "Südkorea": ["KRW", "Won"], "Japan": ["JPY", "Yen"],
  "Australien": ["AUD", "Australischer Dollar"], "Neuseeland": ["NZD", "Neuseeland-Dollar"],
};

const SPRACHE = {
  "Spanien": "Spanisch", "Frankreich": "Französisch", "Monaco": "Französisch", "Italien": "Italienisch",
  "Malta": "Maltesisch/Englisch", "Kroatien": "Kroatisch", "Slowenien": "Slowenisch", "Montenegro": "Montenegrinisch",
  "Griechenland": "Griechisch", "Zypern": "Griechisch/Englisch", "Portugal": "Portugiesisch",
  "Deutschland": "Deutsch", "Finnland": "Finnisch", "Estland": "Estnisch", "Lettland": "Lettisch",
  "Litauen": "Litauisch", "Niederlande": "Niederländisch", "Belgien": "Niederländisch/Französisch",
  "Irland": "Englisch", "Guadeloupe": "Französisch", "Martinique": "Französisch",
  "Türkei": "Türkisch", "Israel": "Hebräisch", "Ägypten": "Arabisch", "Tunesien": "Arabisch/Französisch",
  "Marokko": "Arabisch/Französisch", "Gibraltar": "Englisch", "Dänemark": "Dänisch",
  "Norwegen": "Norwegisch", "Schweden": "Schwedisch", "Polen": "Polnisch",
  "Vereinigtes Königreich": "Englisch", "Island": "Isländisch", "Färöer": "Färöisch",
  "USA": "Englisch", "Bahamas": "Englisch", "Kuba": "Spanisch", "Mexiko": "Spanisch",
  "Kaimaninseln": "Englisch", "Jamaika": "Englisch", "Haiti": "Französisch/Haitianisch-Kreol",
  "Dominikanische Republik": "Spanisch", "Puerto Rico": "Spanisch/Englisch",
  "US Virgin Islands": "Englisch", "Britische Jungferninseln": "Englisch",
  "St. Maarten (niederl.)": "Niederländisch/Englisch", "St. Kitts und Nevis": "Englisch",
  "Antigua und Barbuda": "Englisch", "Dominica": "Englisch", "St. Lucia": "Englisch",
  "Barbados": "Englisch", "St. Vincent und die Grenadinen": "Englisch", "Grenada": "Englisch",
  "Trinidad und Tobago": "Englisch", "Turks- und Caicosinseln": "Englisch",
  "Aruba": "Niederländisch/Papiamento", "Curaçao": "Niederländisch/Papiamento",
  "Bonaire": "Niederländisch/Papiamento", "Kolumbien": "Spanisch", "Panama": "Spanisch",
  "Costa Rica": "Spanisch", "Nicaragua": "Spanisch", "Guatemala": "Spanisch", "Belize": "Englisch",
  "Honduras": "Spanisch", "Kanada": "Englisch/Französisch", "Bermuda": "Englisch",
  "Brasilien": "Portugiesisch", "Uruguay": "Spanisch", "Argentinien": "Spanisch", "Chile": "Spanisch",
  "Peru": "Spanisch", "Vereinigte Arabische Emirate": "Arabisch", "Oman": "Arabisch", "Katar": "Arabisch",
  "Indien": "Hindi/Englisch", "Sri Lanka": "Singhalesisch/Tamil", "Singapur": "Englisch/Mandarin/Malaiisch",
  "Malaysia": "Malaiisch/Englisch", "Thailand": "Thai", "Vietnam": "Vietnamesisch", "Philippinen": "Filipino/Englisch",
  "Indonesien": "Indonesisch", "China": "Mandarin", "Hongkong": "Kantonesisch/Englisch",
  "Taiwan": "Mandarin", "Südkorea": "Koreanisch", "Japan": "Japanisch",
  "Australien": "Englisch", "Neuseeland": "Englisch",
};

/* Steckdosentyp nach Land, grob gruppiert. Bei Unsicherheit lieber
   den Weltadapter empfehlen, als eine falsche genaue Angabe machen. */
const STECKDOSE_GRUPPEN = [
  [["Vereinigtes Königreich", "Irland", "Malta", "Zypern", "Gibraltar"], "Typ G (UK-Dreieckstecker), 230V"],
  [["USA", "Kanada", "Mexiko", "Bahamas", "Bermuda", "Kuba", "Kaimaninseln", "Jamaika", "Haiti",
    "Dominikanische Republik", "Puerto Rico", "US Virgin Islands", "Britische Jungferninseln",
    "St. Maarten (niederl.)", "Trinidad und Tobago", "Barbados", "Kolumbien", "Panama", "Costa Rica",
    "Nicaragua", "Guatemala", "Belize", "Honduras", "Aruba", "Curaçao", "Bonaire", "Japan", "Philippinen"],
    "Typ A/B (US-Flachstecker), 110–120V"],
  [["Guadeloupe", "Martinique", "Frankreich", "Monaco"], "Typ C/E (Europa-Rundstecker), 220–230V"],
  [["Spanien", "Italien", "Malta", "Kroatien", "Slowenien", "Montenegro", "Griechenland", "Portugal", "Deutschland",
    "Finnland", "Estland", "Lettland", "Litauen", "Niederlande", "Belgien", "Türkei", "Israel",
    "Ägypten", "Tunesien", "Marokko", "Dänemark", "Norwegen", "Schweden", "Polen", "Südkorea"],
    "Europlug (Typ C/F), 220–230V"],
  [["Australien", "Neuseeland", "China", "Argentinien"], "Typ I (Winkelstecker), 220–230V"],
  [["Vereinigte Arabische Emirate", "Oman", "Katar", "Singapur", "Malaysia", "Hongkong", "Indien",
    "Sri Lanka"], "meist Typ G (UK-Dreieckstecker), 220–230V"],
];
function steckdoseFuer(land) {
  const treffer = STECKDOSE_GRUPPEN.find((g) => g[0].indexOf(land) >= 0);
  return treffer ? treffer[1] : "wechselnde Steckertypen — ein Weltadapter ist hier die sichere Wahl";
}

/* Kontinent/Region je Land, Grundlage für die Fahrtenbuch-Abzeichen. */
const KONTINENT = {
  Europa: ["Spanien", "Frankreich", "Monaco", "Italien", "Malta", "Kroatien", "Slowenien", "Montenegro", "Griechenland",
    "Zypern", "Portugal", "Deutschland", "Finnland", "Estland", "Lettland", "Litauen", "Niederlande",
    "Belgien", "Irland", "Gibraltar", "Dänemark", "Norwegen", "Schweden", "Polen",
    "Vereinigtes Königreich", "Island", "Färöer", "Türkei"],
  Afrika: ["Ägypten", "Tunesien", "Marokko"],
  Nordamerika: ["USA", "Kanada", "Bermuda"],
  "Mittelamerika & Karibik": ["Mexiko", "Bahamas", "Kuba", "Kaimaninseln", "Jamaika", "Haiti",
    "Dominikanische Republik", "Puerto Rico", "US Virgin Islands", "Britische Jungferninseln",
    "St. Maarten (niederl.)", "St. Kitts und Nevis", "Antigua und Barbuda", "Guadeloupe", "Dominica",
    "Martinique", "St. Lucia", "Barbados", "St. Vincent und die Grenadinen", "Grenada",
    "Trinidad und Tobago", "Turks- und Caicosinseln", "Aruba", "Curaçao", "Bonaire", "Panama",
    "Costa Rica", "Nicaragua", "Guatemala", "Belize", "Honduras"],
  Südamerika: ["Kolumbien", "Brasilien", "Uruguay", "Argentinien", "Chile", "Peru"],
  Asien: ["Vereinigte Arabische Emirate", "Oman", "Katar", "Indien", "Sri Lanka", "Singapur", "Malaysia",
    "Thailand", "Vietnam", "Indonesien", "China", "Hongkong", "Taiwan", "Südkorea", "Japan", "Israel",
    "Philippinen"],
  Ozeanien: ["Australien", "Neuseeland"],
};
function kontinentFuer(land) {
  return Object.keys(KONTINENT).find((k) => KONTINENT[k].indexOf(land) >= 0) || null;
}
function trinkgeldTippFuer(land) {
  const k = kontinentFuer(land);
  const texte = {
    "Europa": "Trinkgeld ist meist freiwillig, 5–10 % beim Essen sind üblich, oft wird einfach aufgerundet.",
    "Nordamerika": "Deutlich mehr als in Europa üblich — 15–20 % bei Restaurants und Ausflügen sind Standard.",
    "Mittelamerika & Karibik": "Wie in den USA — 15–20 % bei Restaurants und Ausflügen sind Standard, auch bei Guides.",
    "Südamerika": "Trinkgeld ist verbreitet, 10 % sind meist eine gute Richtschnur.",
    "Asien": "Sehr unterschiedlich von Land zu Land, teils unüblich bis unerwünscht — bei geführten Ausflügen aber zunehmend erwartet.",
    "Afrika": "Bei geführten Ausflügen üblich, 10 % sind eine gute Richtschnur.",
    "Ozeanien": "Unüblich und wird nicht erwartet.",
  };
  return texte[k] || "Informiert euch am besten kurz vor Ort, das ist von Land zu Land sehr unterschiedlich.";
}

/* Reederei-Eigenheiten — Richtwerte, die sich ändern können.
   Aktuelle Zahlen bitte immer bei der Reederei selbst prüfen. */
const REEDEREIEN = [
  { n: "AIDA Cruises", puffer: 45, trinkgeldAutomatik: true, trinkgeldProNacht: 12, kidsClubAb: 3,
    schiffe: ["AIDAcosma", "AIDAnova", "AIDAprima", "AIDAperla", "AIDAstella", "AIDAsol", "AIDAmar",
      "AIDAblu", "AIDAluna", "AIDAdiva", "AIDAaura", "AIDAvita"] },
  { n: "TUI Cruises (Mein Schiff)", puffer: 45, trinkgeldAutomatik: true, trinkgeldProNacht: 10, kidsClubAb: 1,
    schiffe: ["Mein Schiff 1", "Mein Schiff 2", "Mein Schiff 3", "Mein Schiff 4", "Mein Schiff 5",
      "Mein Schiff 6", "Mein Schiff 7"] },
  { n: "MSC Cruises", puffer: 60, trinkgeldAutomatik: true, trinkgeldProNacht: 12, kidsClubAb: 2,
    schiffe: ["MSC World Europa", "MSC World America", "MSC Euribia", "MSC Virtuosa", "MSC Grandiosa",
      "MSC Bellissima", "MSC Meraviglia", "MSC Seaside", "MSC Seaview", "MSC Divina", "MSC Preziosa",
      "MSC Splendida", "MSC Fantasia", "MSC Magnifica", "MSC Musica", "MSC Poesia", "MSC Orchestra"] },
  { n: "Costa Crociere", puffer: 60, trinkgeldAutomatik: true, trinkgeldProNacht: 10, kidsClubAb: 3,
    schiffe: ["Costa Smeralda", "Costa Toscana", "Costa Firenze", "Costa Venezia", "Costa Diadema",
      "Costa Fascinosa", "Costa Favolosa", "Costa Pacifica", "Costa Deliziosa", "Costa Fortuna", "Costa Luminosa"] },
  { n: "Royal Caribbean", puffer: 90, trinkgeldAutomatik: true, trinkgeldProNacht: 18, kidsClubAb: 3,
    schiffe: ["Icon of the Seas", "Utopia of the Seas", "Wonder of the Seas", "Symphony of the Seas",
      "Harmony of the Seas", "Oasis of the Seas", "Allure of the Seas", "Odyssey of the Seas",
      "Spectrum of the Seas", "Anthem of the Seas", "Ovation of the Seas", "Quantum of the Seas",
      "Independence of the Seas", "Freedom of the Seas", "Liberty of the Seas", "Voyager of the Seas",
      "Explorer of the Seas", "Adventure of the Seas", "Navigator of the Seas", "Mariner of the Seas",
      "Brilliance of the Seas", "Radiance of the Seas", "Serenade of the Seas", "Jewel of the Seas"] },
  { n: "Celebrity Cruises", puffer: 90, trinkgeldAutomatik: true, trinkgeldProNacht: 18, kidsClubAb: 3,
    schiffe: ["Celebrity Ascent", "Celebrity Beyond", "Celebrity Apex", "Celebrity Edge",
      "Celebrity Silhouette", "Celebrity Reflection", "Celebrity Eclipse", "Celebrity Equinox",
      "Celebrity Solstice", "Celebrity Constellation", "Celebrity Infinity", "Celebrity Millennium",
      "Celebrity Summit"] },
  { n: "Norwegian Cruise Line", puffer: 90, trinkgeldAutomatik: true, trinkgeldProNacht: 19, kidsClubAb: 3,
    schiffe: ["Norwegian Aqua", "Norwegian Viva", "Norwegian Prima", "Norwegian Encore", "Norwegian Bliss",
      "Norwegian Joy", "Norwegian Escape", "Norwegian Getaway", "Norwegian Breakaway", "Norwegian Epic",
      "Norwegian Gem", "Norwegian Jade", "Norwegian Jewel", "Norwegian Pearl", "Norwegian Dawn",
      "Norwegian Star", "Norwegian Sun", "Norwegian Sky", "Norwegian Spirit"] },
  { n: "Princess Cruises", puffer: 90, trinkgeldAutomatik: true, trinkgeldProNacht: 16, kidsClubAb: 3,
    schiffe: ["Sun Princess", "Star Princess", "Discovery Princess", "Enchanted Princess", "Sky Princess",
      "Majestic Princess", "Regal Princess", "Royal Princess", "Crown Princess", "Emerald Princess",
      "Caribbean Princess", "Island Princess", "Coral Princess", "Diamond Princess", "Sapphire Princess",
      "Ruby Princess", "Grand Princess", "Golden Princess"] },
  { n: "Carnival Cruise Line", puffer: 90, trinkgeldAutomatik: true, trinkgeldProNacht: 16, kidsClubAb: 2,
    schiffe: ["Carnival Jubilee", "Carnival Celebration", "Mardi Gras", "Carnival Venezia", "Carnival Firenze",
      "Carnival Panorama", "Carnival Horizon", "Carnival Vista", "Carnival Breeze", "Carnival Magic",
      "Carnival Dream", "Carnival Sunshine", "Carnival Radiance", "Carnival Miracle", "Carnival Legend",
      "Carnival Spirit", "Carnival Freedom", "Carnival Liberty", "Carnival Valor", "Carnival Glory"] },
  { n: "Holland America Line", puffer: 60, trinkgeldAutomatik: true, trinkgeldProNacht: 16, kidsClubAb: 3,
    schiffe: ["Rotterdam", "Nieuw Statendam", "Koningsdam", "Eurodam", "Nieuw Amsterdam", "Oosterdam",
      "Westerdam", "Zuiderdam", "Volendam", "Zaandam", "Noordam"] },
  { n: "Disney Cruise Line", puffer: 90, trinkgeldAutomatik: true, trinkgeldProNacht: 16, kidsClubAb: 3,
    schiffe: ["Disney Treasure", "Disney Wish", "Disney Fantasy", "Disney Dream", "Disney Wonder", "Disney Magic"] },
  { n: "Hurtigruten / HX", puffer: 45, trinkgeldAutomatik: false, trinkgeldProNacht: 0, kidsClubAb: null,
    schiffe: ["MS Trollfjord", "MS Finnmarken", "MS Nordnorge", "MS Nordkapp", "MS Polarlys", "MS Kong Harald",
      "MS Richard With", "MS Nordlys", "MS Spitsbergen", "MS Roald Amundsen", "MS Fridtjof Nansen", "MS Maud"] },
];
function reedereiFinden(name) {
  const s = normText(name || "");
  if (s.length < 2) return null;
  return REEDEREIEN.find((r) => normText(r.n) === s)
    || REEDEREIEN.find((r) => normText(r.n).indexOf(s) >= 0 || s.indexOf(normText(r.n)) >= 0)
    || null;
}

/* Generische Vorlage je Hafentyp, greift überall dort, wo es noch keine
   eigenen Inhalte gibt — damit hat wirklich jeder Hafen etwas Nützliches. */
const TYP_VORLAGEN = {
  AS: {
    kurz: "Ein Hafenstädtchen mit einer Altstadt, die sich zu Fuß gut erkunden lässt — meistens reicht der Landgang genau dafür.",
    zuFuss: [
      "Vom Anleger direkt Richtung Altstadt oder Zentrum laufen, ein Ziel wie eine Kirche oder ein Marktplatz reicht als Orientierung.",
      "Eine Gasse ohne festes Ziel entlanglaufen — in kleinen Hafenstädten ist genau das oft der beste Programmpunkt.",
      "Rechtzeitig einen Kaffee oder ein Eis am Hafen einplanen, mit Blick auf das eigene Schiff.",
      "Auf einem kleinen Markt am Hafen nach Käse, Wein oder Gebäck aus der Region stöbern.",
      "Zu einer Kirche oder einem Aussichtspunkt am Ortsrand hochlaufen, oft der schönste Blick auf Schiff und Bucht.",
      "Wer noch Zeit hat, eine kurze Wanderung ins Hügelland oberhalb der Stadt einplanen, viele Häfen liegen am Fuß von Weinbergen oder Olivenhainen.",
    ],
    gefuehrt: [
      "Ein zwei- bis dreistündiger Altstadt- oder Food-Walk mit lokalem Guide.",
      "Bei knapper Zeit oder wenn der Ort etwas außerhalb liegt: den Reederei-Bus ins Zentrum nehmen statt zu Fuß zu gehen.",
      "Auf GetYourGuide oder Viator nach einer Altstadt-Tour suchen, oft günstiger als der gleiche Ausflug über die Reederei.",
      "Eine Wein- oder Olivenölverkostung in der Umgebung, wenn die Region dafür bekannt ist.",
      "Eine kurze Bootstour entlang der Küste für die schönste Perspektive auf die Hafenstadt.",
      "Ein Wander- oder Radausflug ins Hinterland, wenn ihr die Stadt selbst schon kennt.",
    ],
  },
  HK: {
    kurz: "Eine große Stadt mit eigenem Nahverkehr — hier entscheidet sich der Tag daran, wie viele Ziele ihr wirklich anfahrt statt nur anzuvisieren.",
    zuFuss: [
      "Ein Ziel in Laufnähe zum Kai wählen und den Rest bewusst weglassen, statt drei Viertel der Stadt in vier Stunden abzuhaken.",
      "Ein Tagesticket für Bus, Bahn oder Fähre kaufen, sobald ihr von Bord seid — meist die schnellste Art, Zeit zu sparen.",
      "Eine Sehenswürdigkeit mit Warteschlangen direkt nach der Ausschiffung ansteuern, bevor die Busse mit Tagesausflüglern ankommen.",
      "Einen belebten Markt oder ein Streetfood-Viertel ansteuern, oft die authentischste Art, die Stadt kennenzulernen.",
      "Einen Park oder eine Uferpromenade für eine ruhige halbe Stunde einplanen, als Ausgleich zum Trubel.",
      "Einen Aussichtspunkt oder ein Rooftop mit Blick über die Skyline ansteuern, wenn die Zeit für mehr nicht reicht.",
    ],
    gefuehrt: [
      "Ein Hop-on-Hop-off-Bus, wenn die Stadt groß und die Zeit knapp ist.",
      "Eine Highlights-Tour mit Guide für die Orte, zu denen ihr sonst nicht rechtzeitig zurückfindet.",
      "Auf GetYourGuide oder Viator nach „Skip the Line“-Tickets für die größte Sehenswürdigkeit suchen, das spart hier oft am meisten Zeit.",
      "Eine Bootstour im Hafen oder entlang der Küste für einen Blick auf die Stadt vom Wasser aus.",
      "Ein Kochkurs oder eine geführte Markttour durch die Streetfood-Szene.",
      "Ein Museumsbesuch oder eine Tour zu einem historischen Wahrzeichen, wenn euch Geschichte mehr interessiert als Shopping.",
    ],
  },
  RU: {
    kurz: "Der Hafen selbst ist meist unspektakulär, das eigentliche Ziel liegt außerhalb — eine antike Stätte, für die ihr Zeit und Transport braucht.",
    zuFuss: [
      "Prüfen, ob die Ruinenstätte wirklich fußläufig ist — meistens ist das nicht der Fall, und ein Taxi vom Kai spart euch Stunden.",
      "Wasser und Sonnenschutz einpacken, antike Stätten liegen fast immer schattenlos in praller Sonne.",
      "Feste Schuhe anziehen, der Untergrund auf Ausgrabungsstätten ist uneben.",
      "Nach dem Rundgang ein Café oder einen schattigen Rastplatz am Ausgang der Anlage ansteuern.",
      "Wenn vorhanden, einen Abstecher zum kleinen Vor-Ort-Museum einplanen, das ordnet die Funde meist gut ein.",
      "Ein Fernglas mitnehmen, viele Anlagen liegen erhöht mit weitem Blick über die Küste.",
    ],
    gefuehrt: [
      "Ein Ausflug mit Guide zur Hauptstätte, weil die Geschichte dahinter den Unterschied macht zwischen Steinhaufen und Weltwunder.",
      "Reederei-Bus, wenn die Distanz groß und die Rückfahrt zeitlich eng ist — dort wartet das Schiff notfalls auf euch.",
      "Auf GetYourGuide oder Viator nach einer Tour mit Zeitfenster-Ticket suchen, das umgeht Warteschlangen am Einlass.",
      "Eine Kombination aus Ruinen-Tour und Strandnachmittag, viele Anbieter verbinden beides in einem Tagesausflug.",
      "Eine Wanderung mit lokalem Guide durch die weitläufigeren, weniger besuchten Bereiche der Stätte.",
      "Ein Kochkurs mit landestypischen Gerichten, wenn ihr den Nachmittag lieber kulinarisch verbringt als am Fels.",
    ],
  },
  FJ: {
    kurz: "Ein kleiner Ort, dessen eigentliche Attraktion die Landschaft drumherum ist — Fjord, Berge und Wasserfälle statt Sehenswürdigkeiten in der Stadt.",
    zuFuss: [
      "Den Ort selbst in 30 bis 60 Minuten ablaufen, das reicht meistens völlig für das Zentrum.",
      "Zu einer nahen Aussichtsplattform oder einem Wasserfall am Ortsrand laufen, wenn die Zeit reicht — oft ausgeschildert.",
      "Eine warme Schicht mitnehmen, im Fjord ist es selbst im Sommer kühler als erwartet.",
      "Eine kurze Wanderung zu einem nahen Aussichtspunkt über dem Fjord einplanen, wenn die Zeit reicht.",
      "Am Kai ein Café mit Blick auf die Berge für eine ruhige Pause ansteuern.",
      "Wer mag, an einer geschützten Stelle kurz schwimmen gehen, auch wenn das Wasser kühl ist.",
    ],
    gefuehrt: [
      "Eine Fjord-Boots- oder Kajaktour, weil ihr die Landschaft vom Wasser aus am besten seht.",
      "Eine Zahnradbahn- oder Panoramabus-Fahrt zu einem Aussichtspunkt, der zu Fuß zu weit wäre.",
      "Bei GetYourGuide oder Viator nach kleinen Gruppentouren suchen, die sind in Fjorden oft persönlicher als der große Reederei-Bus.",
      "Eine Wanderung zu einem Gletscher oder Aussichtsgipfel mit Guide, wenn ihr fit genug für ein paar Stunden Aufstieg seid.",
      "Eine Zugfahrt mit Panoramablick durch die Fjordlandschaft, wenn eine solche Strecke existiert.",
      "Eine Kajaktour auf dem Fjord selbst, das ruhigste Bild bekommt ihr meist vom Wasser aus.",
    ],
  },
  NA: {
    kurz: "Hier steht Natur im Vordergrund — Gletscher, Wale oder weite Landschaft statt Stadtprogramm, und die guten Plätze sind oft nur mit Tour erreichbar.",
    zuFuss: [
      "Den Ort selbst kurz ablaufen, aber nicht zu viel erwarten — das eigentliche Ziel liegt fast immer außerhalb.",
      "Wetterfeste Kleidung im Schichtsystem mitnehmen, das Wetter kann sich hier binnen einer Stunde drehen.",
      "Ein Fernglas einpacken, wenn Wale oder Vögel angekündigt sind.",
      "Eine Wanderung auf einem ausgeschilderten Naturpfad direkt am Ort einplanen, wenn Zeit und Wetter mitspielen.",
      "Ein warmes Getränk in einem der wenigen Cafés am Hafen vor der Weiterfahrt einplanen.",
      "Ruhig am Ufer nach Walen oder Robben Ausschau halten, oft lohnt sich das mehr als ein organisierter Ausflug.",
    ],
    gefuehrt: [
      "Eine Natur- oder Wildlife-Tour mit lokalem Anbieter, das ist hier meistens der ganze Sinn des Landgangs.",
      "Bei Gletschern oder abgelegenen Fjorden lieber die Reederei nehmen, weil Wetter und Wege unberechenbar sind und das Schiff sonst ohne euch fährt.",
      "Auf GetYourGuide oder Viator nach kleinen Gruppen suchen — meist persönlicher und oft günstiger als der Bordausflug.",
      "Eine Gletscherwanderung oder Eishöhlentour mit zertifiziertem Guide, das ist hier nichts für den Alleingang.",
      "Eine Walbeobachtungstour per Boot, in vielen Naturhäfen die Hauptattraktion.",
      "Ein Fotografie- oder Naturkunde-Ausflug mit lokalem Guide, der euch zeigt, wo sich die Tiere tatsächlich aufhalten.",
    ],
  },
  SI: {
    kurz: "Ein kleines Inselziel, an dem der Tag meistens aus Strand, Wasser und vielleicht einem kurzen Ortsbummel besteht.",
    zuFuss: [
      "Wenn ein Strand in Laufnähe liegt, braucht es keinen Ausflug — Handtuch, Sonnencreme und los.",
      "Den kleinen Ort am Hafen ablaufen, oft reicht das für Souvenirs und einen Cocktail zum Mittag.",
      "Klar absprechen, wo genau ihr euch am Strand aufhaltet, falls ihr euch trennt — Handynetz ist hier oft schwach.",
      "Ein Getränk oder einen Snack an einer der Strandbars einplanen, meist unkompliziert und ohne Reservierung.",
      "Schnorchelausrüstung selbst mitbringen oder direkt am Strand ausleihen, oft günstiger als der Bordausflug.",
      "Einen kurzen Spaziergang zum anderen Ende des Strandes für eine ruhigere, weniger belebte Ecke einplanen.",
    ],
    gefuehrt: [
      "Ein Katamaran-, Schnorchel- oder Strandausflug, meist die klassische Wahl an diesen Zielen.",
      "Wenn der beste Strand weiter draußen liegt, den Reederei-Bus oder -Katamaran nehmen statt Taxi auf gut Glück.",
      "Auf GetYourGuide oder Viator nach einem Beach Day oder einer Katamaran-Tour suchen, oft günstiger als das Bordangebot mit identischem Strand.",
      "Eine Bootstour zu einer vorgelagerten Sandbank oder einem noch leereren Strandabschnitt.",
      "Ein Kochkurs oder Rum-Tasting, wenn ihr den Nachmittag lieber kulinarisch statt am Wasser verbringt.",
      "Eine Insel-Rundfahrt mit lokalem Guide, der euch auch Orte abseits der Touristenstrände zeigt.",
    ],
  },
  PI: {
    kurz: "Eine Privatinsel oder ein eingezäunter Strandabschnitt der Reederei — hier gibt es keine Stadt und keinen eigenen Landausflug-Markt, sondern ein festes Programm vor Ort.",
    zuFuss: [
      "Früh von Bord gehen, die besten Liegen und Cabanas sind an belebten Tagen schnell weg.",
      "Die Insel ist überschaubar — ein Rundgang zu Fuß reicht, um alle Stationen zu finden.",
      "Wasserschuhe mitnehmen, der Einstieg ins Wasser ist an manchen Stellen mit Korallen oder Kieseln nicht barfußfreundlich.",
      "Ein Getränk an der Strandbar der Insel bestellen, meist im Kreuzfahrtpreis oder gegen Bordkonto inklusive.",
      "Schnorchelausrüstung direkt am Strand der Insel ausleihen, das Riff liegt oft nur wenige Meter vom Ufer.",
      "Eine ruhige Ecke abseits der Hauptliegewiese suchen, an belebten Tagen wird es dort deutlich leerer.",
    ],
    gefuehrt: [
      "Cabana oder Wasserpark-Zugang vorab über die Reederei-App reservieren, das ist hier meist die einzige Buchungsart.",
      "Wassersport wie Jetski, Parasailing oder Schnorcheln direkt am Strand der Insel buchen.",
      "Externe Anbieter wie GetYourGuide gibt es hier in der Regel nicht — alles läuft über die Reederei selbst.",
      "Ein Kajak oder Paddleboard direkt an der Insel ausleihen, meist unkompliziert vor Ort buchbar.",
      "Der reedereieigene Grill- oder Restaurantbereich, oft im Ausflugspreis enthalten.",
      "Ein Ausflug mit Glasboden-Boot, um das Riff zu sehen, ohne selbst ins Wasser zu müssen.",
    ],
  },
  GM: {
    kurz: "Eine moderne Großstadt mit gutem Nahverkehr — die Herausforderung ist hier weniger, etwas zu finden, sondern die Auswahl sinnvoll einzugrenzen.",
    zuFuss: [
      "Ein Viertel statt der ganzen Stadt auswählen und das dafür in Ruhe erkunden.",
      "Öffentliche Verkehrsmittel oder eine Ride-Hailing-App nutzen, das ist in modernen Großstädten meist einfacher als gedacht.",
      "Auf die Rückfahrzeit zum Hafen großzügig Puffer einplanen, Verkehr in Großstädten ist selten planbar.",
      "Einen Markt- oder Foodhall-Besuch einplanen, oft ein guter erster Eindruck der lokalen Küche.",
      "Eine Uferpromenade oder einen Stadtpark für eine ruhige Pause zwischen zwei Terminen einplanen.",
      "Ein Museum oder eine Galerie ansteuern, wenn Kunst und Geschichte euch mehr interessieren als Shopping.",
    ],
    gefuehrt: [
      "Eine Highlights-Tour mit Guide, wenn ihr in kurzer Zeit viel sehen wollt.",
      "Eine Hafenrundfahrt oder Skyline-Tour, die zeigt die Stadt oft besser als jeder Spaziergang.",
      "Auf GetYourGuide oder Viator nach einer privaten Tour suchen, wenn ihr lieber flexibel unterwegs sein wollt als in der Gruppe.",
      "Eine Hafenrundfahrt oder Bootstour für den besten Blick auf die Skyline.",
      "Eine private Food-Tour durch angesagte Viertel, wenn ihr kulinarisch unterwegs sein wollt.",
      "Ein Ausflug zu einem Wahrzeichen oder Aussichtsturm mit Guide, wenn ihr in kurzer Zeit viel sehen wollt.",
    ],
  },
  DJ: {
    kurz: "Ein Naturhafen, dessen Reiz im Umland liegt — Regenwald, Wasserfälle oder Riffe statt einer Stadt am Kai.",
    zuFuss: [
      "Den Hafenbereich selbst ablaufen, aber ohne große Erwartungen — hier ist meist wenig, das eigentliche Ziel liegt weiter draußen.",
      "Insektenschutz und wasserfeste Sandalen einpacken, falls ihr zu Wasserfällen oder auf Wanderwege wollt.",
      "Nur mit organisiertem Transport ins Landesinnere fahren, ein Taxi auf eigene Faust ist hier oft weder günstiger noch sicherer.",
      "Am Hafen ein kühles Getränk in einem der wenigen Cafés vor der Weiterfahrt einplanen.",
      "Wer mag, kurz am Strand nahe dem Hafen baden gehen, oft ruhiger als die organisierten Ausflugsziele.",
      "Eine kurze Wanderung auf einem ausgeschilderten Weg direkt am Hafen einplanen, wenn einer existiert.",
    ],
    gefuehrt: [
      "Ein Ausflug zu Wasserfällen, Zipline oder Regenwald mit lokalem Anbieter — das ist hier meistens der ganze Grund für den Halt.",
      "Bei größerer Entfernung ins Landesinnere die Reederei nehmen, damit das Schiff notfalls auf euch wartet.",
      "Auf GetYourGuide oder Viator nach Naturausflügen mit kleiner Gruppengröße suchen, oft persönlicher als der große Bordbus.",
      "Eine Kajak- oder Bootstour durch Mangroven oder entlang der Küste.",
      "Ein Ausflug zu einer Kaffee- oder Kakaoplantage mit Verkostung, wenn die Region dafür bekannt ist.",
      "Eine Nationalpark-Wanderung mit Guide, der euch zeigt, wo Tiere und Pflanzen tatsächlich zu sehen sind.",
    ],
  },
  WU: {
    kurz: "Eine moderne Golf-Metropole, bei der Hitze und Distanzen den Tag mehr bestimmen als fehlende Ziele.",
    zuFuss: [
      "Wenn möglich früh oder spätnachmittags draußen unterwegs sein, mittags ist es hier oft zu heiß für längere Fußwege.",
      "Leichte, bedeckende Kleidung mitnehmen — auch aus Respekt vor lokalen Gepflogenheiten sinnvoll.",
      "Viel Wasser trinken, mehr als ihr für nötig haltet.",
      "Eine klimatisierte Mall oder einen Food Court für eine Verschnaufpause zwischendurch ansteuern.",
      "Am frühen Abend eine Uferpromenade für einen ruhigen Spaziergang nutzen, dann ist es spürbar kühler.",
      "Ein Café mit Blick auf einen der Wolkenkratzer für eine kurze Pause einplanen.",
    ],
    gefuehrt: [
      "Eine Stadt- oder Skyline-Tour mit klimatisiertem Fahrzeug, weil zu Fuß hier oft keine Option ist.",
      "Ein Wüstenausflug mit Dünenfahrt, wenn ihr auch abseits der Stadt etwas sehen wollt.",
      "Auf GetYourGuide oder Viator nach klimatisierten Halbtagestouren suchen, das ist hier die angenehmste Art, viel zu sehen.",
      "Ein Ausflug ins Aquarium oder in einen Indoor-Freizeitpark, wenn euch die Hitze draußen zu viel wird.",
      "Eine Dinner-Cruise auf einem traditionellen Dhau-Boot mit Blick auf die beleuchtete Skyline.",
      "Eine Dünenfahrt mit Beduinen-Camp und Verkostung landestypischer Speisen am Abend.",
    ],
  },
  TK: {
    kurz: "Ein Ziel mit eigener Kultur und oft eigenem Verkehrschaos — hier lohnt sich ein klarer Plan mehr als anderswo.",
    zuFuss: [
      "Ein einziges Tempel- oder Marktziel in Hafennähe auswählen, statt mehrere über die Stadt verteilte anzusteuern.",
      "Kleidung mit bedeckten Schultern und Knien einpacken, an vielen Tempeln ist das Voraussetzung für den Einlass.",
      "Bargeld in kleinen Scheinen mitnehmen, Karten werden abseits der Touristenzentren seltener akzeptiert.",
      "Schuhe, die man leicht aus- und wieder anziehen kann, mitnehmen, an Tempeln müsst ihr sie oft am Eingang ausziehen.",
      "Einen Streetfood-Stand oder kleinen Markt für eine günstige, authentische Mittagspause ansteuern.",
      "Am Nachmittag einen ruhigeren Tempel oder Garten abseits der Hauptroute ansteuern, dort ist es oft deutlich leerer.",
    ],
    gefuehrt: [
      "Eine Tempel- oder Kulturtour mit Guide, der Kontext liefert, den ihr auf eigene Faust verpasst.",
      "Bei großer Entfernung zwischen Hafen und Stadtzentrum den Reederei-Transfer einplanen.",
      "Auf GetYourGuide oder Viator nach einer privaten Tour oder einem Kochkurs suchen, oft ein persönlicherer Einstieg als die große Gruppe.",
      "Eine Kochkurs- oder Streetfood-Tour durch lokale Märkte, wenn euch die Küche mehr interessiert als Sehenswürdigkeiten.",
      "Eine Fluss- oder Kanalfahrt mit Boot, in vielen asiatischen Häfen eine eigene Sehenswürdigkeit.",
      "Eine Wanderung zu einem weniger besuchten Tempel im Umland mit lokalem Guide.",
    ],
  },
  SA: {
    kurz: "Eine große südamerikanische Hafenstadt mit eigenem Rhythmus — hier lohnt sich ein organisierter erster Kontakt mehr als anderswo.",
    zuFuss: [
      "In direkter Hafennähe bleiben und Wertsachen unauffällig tragen, wie in jeder Großstadt dieser Größe.",
      "Ein Viertel mit gutem Ruf gezielt ansteuern, statt einfach drauflos zu laufen.",
      "Landeswährung in kleinen Scheinen dabeihaben, Karten werden nicht überall akzeptiert.",
      "Einen Markt oder ein Viertel mit Streetfood ansteuern, dort bekommt ihr oft den authentischsten Eindruck der Stadt.",
      "Eine Uferpromenade oder einen zentralen Platz für eine ruhige Pause zwischendurch einplanen.",
      "Ein Museum oder ein historisches Zentrum ansteuern, wenn Geschichte euch mehr interessiert als Shopping.",
    ],
    gefuehrt: [
      "Eine Stadttour mit Guide für den ersten Überblick, gerade bei eurem ersten Besuch.",
      "Ein Ausflug zum bekanntesten Wahrzeichen der Stadt, meist der Grund, warum das Schiff hier hält.",
      "Auf GetYourGuide oder Viator nach Kleingruppentouren mit Abholung am Pier suchen, das nimmt die Unsicherheit beim ersten Schritt von Bord.",
      "Eine Bootstour entlang der Küste oder Bucht, oft die schönste Perspektive auf die Stadt.",
      "Ein Tango-Abend oder Kochkurs, wenn ihr die lokale Kultur abseits der Sehenswürdigkeiten erleben wollt.",
      "Eine Wanderung oder ein Ausflug in die nähere Umgebung, wenn die Stadt selbst schon bekannt ist.",
    ],
  },
  AU: {
    kurz: "Entspannte Großstadt oder Naturhafen mit gutem Nahverkehr — hier ist meist mehr machbar, als die kurze Zeit vermuten lässt.",
    zuFuss: [
      "Die Uferpromenade am Hafen ablaufen, in Australien und Neuseeland liegt dort oft schon das Beste.",
      "Öffentliche Fähren nutzen, wo es sie gibt — meist die günstigste und schönste Art, die Bucht zu sehen.",
      "Sonnenschutz nicht unterschätzen, die Sonne ist hier stärker, als das Wetter vermuten lässt.",
      "Ein Fish-and-Chips oder einen Kaffee an der Promenade einplanen, in Australien und Neuseeland eine eigene kleine Kultur für sich.",
      "Barfuß oder mit Wasserschuhen am Strand entlanglaufen, oft der entspannteste Programmpunkt am Hafentag.",
      "Wer mag, in einem Nationalpark in Hafennähe eine kurze Wanderung einplanen.",
    ],
    gefuehrt: [
      "Eine Bootstour durch die Bucht oder den Hafen, der von See aus meist am schönsten ist.",
      "Ein Ausflug in Nationalpark oder Weinregion außerhalb der Stadt, wenn Zeit und Reederei-Tour es hergeben.",
      "Auf GetYourGuide oder Viator nach Halbtagestouren zu Naturzielen suchen, die per Bus allein schwer zu erreichen sind.",
      "Eine Wal- oder Delfin-Beobachtungstour per Boot, je nach Saison eine der Hauptattraktionen.",
      "Eine Wein- oder Kulinarik-Tour ins Umland, wenn die Region für ihre Weingüter bekannt ist.",
      "Eine geführte Wanderung im Nationalpark mit lokalem Guide, der euch Flora und Fauna erklärt.",
    ],
  },
};

/* Beste Reisezeit / Klima-Hinweis je Hafentyp — grobe, aber ehrliche Richtwerte. */
const KLIMA_VORLAGEN = {
  AS: "Frühling und Herbst sind meist angenehmer als der Hochsommer, wenn mehrere Kreuzfahrtschiffe gleichzeitig die Altstadt fluten.",
  HK: "Ganzjährig machbar, prüft aber lokale Feiertage — an denen sind viele Sehenswürdigkeiten geschlossen.",
  RU: "Vormittags ist es an Ausgrabungsstätten spürbar kühler und leerer als am Nachmittag.",
  FJ: "Von Mai bis September ist mit den meisten Sonnenstunden zu rechnen, dafür auch mit den meisten Mitreisenden.",
  NA: "Wetter und Tageslicht hängen stark von der Saison ab — informiert euch vor der Reise gezielt für euren Reisemonat.",
  SI: "Ganzjährig warm, Regen- und Hurrikansaison (grob Juni bis November in der Karibik) im Hinterkopf behalten.",
  PI: "Ganzjährig warm, bei Regen wird das Programm der Insel meist trotzdem durchgeführt.",
  GM: "Ganzjährig machbar, in tropischen Lagen ist Vor- oder Nachmittag angenehmer als die Mittagshitze.",
  DJ: "In der Regenzeit sind Wege schnell schlammig — Wechselschuhe einplanen.",
  WU: "Von November bis März ist es spürbar angenehmer als im Hochsommer, wenn tagsüber kaum jemand draußen unterwegs ist.",
  TK: "Vor der Reise kurz prüfen, ob euer Anlaufdatum in eine lokale Regen- oder Monsunzeit fällt.",
  SA: "Saisons liegen auf der Südhalbkugel spiegelverkehrt zu Europa — Sommer dort ist Winter hier.",
  AU: "Saisons liegen auf der Südhalbkugel spiegelverkehrt zu Europa — Sommer dort ist Winter hier.",
};

/* Eigene, geprüfte Inhalte für die meistangelaufenen Häfen —
   überschreiben die generische Typ-Vorlage, wo es sie gibt. */
const HAFEN_DETAILS = {
  "Cape Liberty (Bayonne)": {
    kurz: "Der Terminal liegt in Bayonne, New Jersey, direkt an der Bucht mit Blick auf die Skyline von Manhattan — aber nicht in Manhattan selbst, und das wird regelmäßig unterschätzt.",
    zuFuss: [
      "Zu Fuß ist hier nichts erreichbar, der Terminal liegt in einem Industriegebiet ohne Fußweg in die Stadt.",
      "Wer selbst nach Manhattan will, braucht ein Taxi, Uber oder den Shuttle der Reederei zur nächsten Bahnstation — rechnet mit 45 bis 60 Minuten bis Midtown.",
      "Am Einschiffungstag lohnt sich ein früher Flug oder eine Nacht vorher in der Nähe, weil New Yorker Verkehr sich nicht verlässlich planen lässt.",
      "Wer eine Nacht in Bayonne oder Jersey City übernachtet, findet dort ruhigere und günstigere Hotels als in Manhattan selbst.",
    ],
    gefuehrt: [
      "Ein Pre- oder Post-Cruise-Transfer der Reederei nach Manhattan, meist die stressfreieste Variante am An- oder Abreisetag.",
      "Wer noch Zeit in New York hat, bucht das separat als eigenen City-Trip vor oder nach der Kreuzfahrt statt als Landausflug am Terminal.",
      "Auf GetYourGuide oder Viator nach einem privaten Transfer Cape Liberty–Manhattan suchen, oft günstiger als ein Taxi vom Terminal.",
      "Eine Stadtrundfahrt mit Skyline-Blick auf Manhattan von der New Jersey-Seite aus, für alle, die den Trubel selbst nicht brauchen.",
    ],
    tipp: "Der Terminal wird oft fälschlich mit „New York“ gleichgesetzt — es ist ein eigener Hafen in New Jersey. Prüft in euren Unterlagen genau, ob euer Schiff von hier oder vom Manhattan Cruise Terminal ablegt.",
  },
  "New York": {
    kurz: "Das Manhattan Cruise Terminal liegt am Hudson River auf Höhe der 46th bis 54th Street — mitten in der Stadt, U-Bahn und Taxis direkt vor der Tür.",
    zuFuss: [
      "Der Times Square ist von hier aus in 20 bis 25 Minuten zu Fuß erreichbar.",
      "Direkt am Terminal die U-Bahn Richtung Downtown nehmen, meist schneller als ein Taxi im New Yorker Verkehr.",
      "Rechnet am Einschiffungstag mit langen Wartezeiten, New York gehört zu den meistfrequentierten Terminals der Welt.",
      "Ein Spaziergang am Hudson River Park direkt vor dem Terminal, gut für eine ruhige Stunde vor der Einschiffung.",
    ],
    gefuehrt: [
      "Eine Sightseeing-Tour zu Freiheitsstatue und Ellis Island, dafür lohnt sich wirklich ein ganzer Tag.",
      "Ein Hop-on-Hop-off-Bus, wenn ihr in kurzer Zeit viele Stadtteile sehen wollt.",
      "Auf GetYourGuide oder Viator nach Skip-the-Line-Tickets für Empire State Building oder Top of the Rock suchen, spart hier besonders viel Wartezeit.",
      "Eine Bootstour rund um Manhattan, die euch die Skyline von allen Seiten zeigt.",
    ],
  },
  "Port Canaveral": {
    kurz: "Der Hafen liegt an der Space Coast Floridas, gut 15 Autominuten von Cocoa Beach und knapp einer Stunde vom Kennedy Space Center entfernt — direkt am Terminal gibt es außer dem Hafengelände wenig.",
    zuFuss: [
      "Zu Fuß erreicht ihr vom Terminal aus praktisch nichts, es gibt keinen Ort in Laufnähe.",
      "Wer einen freien Tag vor der Einschiffung hat, bleibt besser gleich in Cocoa Beach oder Orlando statt am Hafen selbst.",
      "Cocoa Beach ist mit Taxi oder Uber in etwa 15 Minuten erreichbar, für einen entspannten Strandtag reicht das gut.",
      "Wer selbst surfen will, findet in Cocoa Beach mehrere Verleihstationen direkt am Strand.",
    ],
    gefuehrt: [
      "Ein Ausflug zum Kennedy Space Center, der Klassiker an diesem Hafen und für Familien besonders lohnend.",
      "Wer vor oder nach der Kreuzfahrt noch Zeit hat, verbindet den Hafen mit einem Abstecher nach Orlando zu den Themenparks.",
      "Auf GetYourGuide oder Viator nach einem Transfer Port Canaveral–Orlando suchen, wenn ihr Flughafen oder Parks anbinden wollt.",
      "Ein Surfkurs oder ein entspannter Strandtag in Cocoa Beach, wenn Themenparks nicht euer Ding sind.",
    ],
  },
  "Miami": {
    kurz: "PortMiami liegt auf einer eigenen Insel direkt vor der Skyline, South Beach ist rund 20 Autominuten entfernt.",
    zuFuss: [
      "Vom Terminal aus ist South Beach nicht fußläufig, aber ein kurzes Taxi oder Uber bringt euch in 15 bis 20 Minuten hin.",
      "Wer vor der Einschiffung noch Zeit hat, bummelt am besten durch die Art-déco-Viertel von South Beach statt am Hafen selbst.",
      "Bayside Marketplace liegt näher am Terminal, falls die Zeit für South Beach nicht reicht.",
      "Little Havana mit kubanischem Kaffee und Live-Musik ist einen kurzen Taxi-Abstecher wert.",
    ],
    gefuehrt: [
      "Ein Ausflug nach South Beach mit Art-déco-Spaziergang, klassisch und meist auch auf eigene Faust gut machbar.",
      "Eine Bootstour durch Biscayne Bay entlang der Promi-Villen.",
      "Auf GetYourGuide oder Viator nach einer Everglades-Airboat-Tour suchen, wenn ihr vor oder nach der Reise noch einen Tag übrig habt.",
      "Ein Kochkurs oder eine Food-Tour durch Little Havana, für einen kulinarischen statt touristischen Nachmittag.",
    ],
  },
  "Fort Lauderdale": {
    kurz: "Port Everglades liegt nur wenige Minuten vom Strand von Fort Lauderdale entfernt, deutlich ruhiger als Miami.",
    zuFuss: [
      "Der Strand von Fort Lauderdale ist mit Taxi oder Shuttle in 10 bis 15 Minuten erreichbar, zu Fuß ist es vom Terminal zu weit.",
      "Las Olas Boulevard mit Geschäften und Restaurants liegt in ähnlicher Nähe wie der Strand.",
      "Wer fliegt, hat den Flughafen fast vor der Tür — das macht Fort Lauderdale zu einem entspannten Ein- und Ausschiffungshafen.",
    ],
    gefuehrt: [
      "Eine Bootstour durch die Kanäle von Fort Lauderdale, das „Venedig Amerikas“, wie es hier gerne genannt wird.",
      "Ein Strandtag mit Shuttle, wenn ihr vor der Einschiffung noch Zeit habt.",
      "Auf GetYourGuide oder Viator nach einem privaten Transfer zum Flughafen suchen, oft günstiger als ein klassisches Taxi.",
    ],
  },
  "Tampa": {
    kurz: "Der Hafen liegt direkt an der Riverwalk von Tampa, das Zentrum ist fußläufig erreichbar.",
    zuFuss: [
      "Die Tampa Riverwalk direkt am Terminal entlanglaufen, dort reihen sich Cafés und kleine Parks.",
      "Das Viertel Ybor City mit kubanischem Flair ist mit kurzer Taxifahrt erreichbar.",
      "Der Florida Aquarium liegt in Gehweite zum Terminal.",
    ],
    gefuehrt: [
      "Ein Ausflug in die Everglades oder nach Busch Gardens, wenn ihr vor der Reise noch Zeit habt.",
      "Eine geführte Tour durch Ybor City mit Zigarrenfabrik-Besuch.",
      "Auf GetYourGuide oder Viator nach Manatee-Touren suchen, je nach Saison eine der schöneren Optionen in der Gegend.",
    ],
  },
  "Key West": {
    kurz: "Ein kompaktes Inselstädtchen, in dem sich fast alles zu Fuß erledigen lässt — Duval Street und Mallory Square liegen direkt am Kai.",
    zuFuss: [
      "Die Duval Street mit Bars, Läden und Straßenmusik komplett zu Fuß ablaufen.",
      "Zum südlichsten Punkt der kontinentalen USA laufen, ein beliebtes Fotomotiv nur wenige Gehminuten vom Zentrum.",
      "Hemingways Haus mit den bekannten sechszehigen Katzen liegt ebenfalls in Laufnähe.",
    ],
    gefuehrt: [
      "Eine Fahrt mit dem Conch Train oder Trolley, der euch die ganze Insel in gut einer Stunde zeigt.",
      "Ein Schnorchel- oder Katamaranausflug zum einzigen lebenden Riff der USA vor der Küste.",
      "Auf GetYourGuide oder Viator nach einer Sunset-Sail suchen, ein Klassiker in Key West.",
    ],
  },
  "Nassau": {
    kurz: "Downtown Nassau mit dem berühmten Straw Market liegt direkt gegenüber dem Kreuzfahrtterminal, Atlantis auf Paradise Island ist über eine kurze Brücke erreichbar.",
    zuFuss: [
      "Direkt vom Terminal ins Zentrum laufen, Straw Market und Bay Street liegen nur wenige Minuten entfernt.",
      "Über die Brücke nach Paradise Island laufen, um von außen einen Blick auf das Atlantis-Resort zu werfen.",
      "Queen's Staircase und Fort Fincastle sind ebenfalls fußläufig, wenn auch mit einigen Stufen.",
      "Ein Getränk an einer der Bars entlang der Bay Street einplanen, mit Blick auf die vor Anker liegenden Schiffe.",
    ],
    gefuehrt: [
      "Ein Tagesticket für die Wasserwelten des Atlantis-Resorts, wenn ihr das Budget dafür einplant.",
      "Ein Katamaran- oder Schnorchelausflug zu den vorgelagerten Cays.",
      "Auf GetYourGuide oder Viator nach Schweine-Insel-Touren (Exuma) suchen — die liegen zwar weiter weg, sind aber ein beliebter Tagesausflug ab Nassau.",
      "Eine geführte Stadttour durch Downtown Nassau, die auch die koloniale Geschichte der Insel erklärt.",
    ],
  },
  "Freeport": {
    kurz: "Ruhiger und touristisch weniger erschlossen als Nassau, mit Stränden und Naturparks statt großer Innenstadt.",
    zuFuss: [
      "Das Terminal liegt etwas außerhalb, für den Ort selbst braucht ihr meist ein Taxi.",
      "Port Lucaya Marketplace mit Läden und Restaurants ist die naheliegende Anlaufstelle.",
      "Taino Beach ist mit kurzer Taxifahrt gut erreichbar, für einen entspannten Strandtag.",
    ],
    gefuehrt: [
      "Ein Ausflug in den Lucayan National Park mit seinen Unterwasserhöhlen.",
      "Ein Delfin- oder Schnorchelausflug ab Sanctuary Bay.",
      "Auf GetYourGuide oder Viator nach Strandtagen mit Transfer suchen, da das Zentrum weniger fußläufig ist als in Nassau.",
    ],
  },
  "Havanna": {
    kurz: "Eine Stadt mit eigenem Tempo und eigenen Regeln — Internet ist selten und Kreditkarten funktionieren oft nicht, plant den Tag entsprechend bar und offline.",
    zuFuss: [
      "Die Altstadt Habana Vieja mit ihren Kolonialbauten ist gut zu Fuß erkundbar, ausgehend vom Kreuzfahrtterminal.",
      "Der Malecón, die berühmte Uferpromenade, lässt sich stundenlang entlanglaufen.",
      "Bargeld in Euro oder US-Dollar mitnehmen, Karten werden vielerorts nicht akzeptiert.",
    ],
    gefuehrt: [
      "Eine Fahrt in einem der klassischen amerikanischen Oldtimer, ein Muss für die meisten Gäste.",
      "Eine geführte Stadttour, weil politischer und historischer Kontext hier besonders viel erklärt.",
      "Auf GetYourGuide oder Viator nach Oldtimer-Touren mit festem Preis suchen, das erspart Verhandlungen vor Ort.",
    ],
    tipp: "Prüft vor der Reise die Einreisebestimmungen gesondert, für Kuba gelten je nach Staatsangehörigkeit eigene Regeln.",
  },
  "Cozumel": {
    kurz: "Eine der beliebtesten Tauch- und Schnorchelinseln der Karibik, das Riff liegt direkt vor der Küste.",
    zuFuss: [
      "San Miguel, der Hauptort, ist von manchen Piers aus fußläufig mit Läden und Restaurants direkt an der Uferpromenade.",
      "Punta Langosta liegt zentral und ist gut zu Fuß vom Terminal erreichbar.",
      "Wer selbst schnorcheln will, findet auch am Stadtstrand brauchbare Sicht, auch wenn die besten Riffe weiter draußen liegen.",
      "Ein Getränk oder Ceviche in einer der Strandbars am Malecón einplanen, meist unkompliziert und ohne Reservierung.",
    ],
    gefuehrt: [
      "Ein Tauch- oder Schnorchelausflug zum Palancar-Riff, einem der bekanntesten Riffe der Karibik.",
      "Ein Ausflug zu den Maya-Ruinen von Tulum per Fähre und Bus, wenn ihr genug Zeit habt.",
      "Auf GetYourGuide oder Viator nach Katamaran-Schnorcheltouren suchen, meist günstiger als das Bordangebot.",
      "Eine Jeep- oder Buggy-Tour über die Insel, die auch die windige Ostküste zeigt.",
    ],
  },
  "Costa Maya": {
    kurz: "Ein für Kreuzfahrer gebauter Terminal mit Pool- und Marktbereich direkt am Pier, das echte Mexiko liegt etwas außerhalb.",
    zuFuss: [
      "Der Terminalbereich mit Pools, Läden und Restaurants ist ohne Ausflug nutzbar und für einen entspannten Tag völlig ausreichend.",
      "Der Ort Mahahual liegt in Gehweite und bietet einen ruhigeren, lokaleren Strand als der Terminalbereich.",
      "Wer ins Hinterland will, braucht organisierten Transport, öffentliche Verkehrsmittel gibt es hier praktisch nicht.",
    ],
    gefuehrt: [
      "Ein Ausflug zu den Maya-Ruinen von Chacchoben, der nächsten bedeutenden Stätte.",
      "Ein Schnorchelausflug zum vorgelagerten Riff, dem zweitgrößten der Welt.",
      "Auf GetYourGuide oder Viator nach ATV- oder Zipline-Touren ins Hinterland suchen.",
    ],
  },
  "Roatán": {
    kurz: "Eine bewaldete Insel vor Honduras mit einigen der besten Tauchgründen der Karibik.",
    zuFuss: [
      "West Bay Beach ist einer der schönsten Strände der Karibik, je nach Terminal zu Fuß oder mit kurzem Taxi erreichbar.",
      "Der Ort Coxen Hole am Terminal selbst ist überschaubar und schnell abgelaufen.",
      "Wer selbst schnorcheln will, braucht dafür keinen Ausflug — vor West Bay Beach reicht die Sicht dafür meist aus.",
    ],
    gefuehrt: [
      "Ein Ausflug zum Affenwald- und Vogelpark, beliebt bei Familien.",
      "Ein Tauch- oder Schnorchelausflug zu den vorgelagerten Riffen.",
      "Auf GetYourGuide oder Viator nach Zipline-Touren durch den Regenwald suchen, einer der Klassiker der Insel.",
    ],
  },
  "Belize City": {
    kurz: "Die Stadt selbst ist meist nur Ausgangspunkt, das eigentliche Ziel liegt im Regenwald oder am Barrier Reef davor.",
    zuFuss: [
      "Von der Stadt selbst lohnt sich wenig, die meisten Gäste steigen direkt in einen organisierten Ausflug um.",
      "Wer bleibt, findet am Hafen kleine Märkte mit Kunsthandwerk.",
      "Bargeld in kleinen Scheinen mitnehmen, abseits der Touristenzentren wird es schnell knapp mit Kartenzahlung.",
    ],
    gefuehrt: [
      "Ein Ausflug zu den Maya-Ruinen von Altun Ha, gut in einem halben Tag zu schaffen.",
      "Ein Schnorchelausflug zum Belize Barrier Reef, dem zweitgrößten Riffsystem der Welt.",
      "Auf GetYourGuide oder Viator nach Cave-Tubing-Touren suchen, eine der bekanntesten Attraktionen der Region.",
    ],
  },
  "Colón (Panama)": {
    kurz: "Meist ist dieser Halt der Zugang zum Panamakanal selbst — entweder als Durchfahrt oder als Ausgangspunkt für einen Ausflug dorthin.",
    zuFuss: [
      "Von der Stadt Colón selbst wird abgeraten, sie gilt touristisch als wenig einladend für Alleingänge.",
      "Bleibt in diesem Hafen besser bei organisierten Optionen statt auf eigene Faust loszuziehen.",
    ],
    gefuehrt: [
      "Ein Ausflug zu den Gatún-Schleusen, um die Kanaltechnik aus der Nähe zu sehen.",
      "Eine Bootstour auf dem Gatún-See mit Blick auf tropischen Regenwald und teils Affen am Ufer.",
      "Auf GetYourGuide oder Viator nach Kanaltouren mit Guide suchen, hier lohnt sich Fachwissen besonders.",
    ],
  },
  "Cartagena (Kolumbien)": {
    kurz: "Die ummauerte Altstadt Cartagenas gehört zu den schönsten Kolonialstädten Südamerikas und ist UNESCO-Welterbe.",
    zuFuss: [
      "Durch die bunte Altstadt Ciudad Amurallada mit ihren Balkonen und Plätzen schlendern, das Terminal liegt in guter Nähe.",
      "Auf der Stadtmauer selbst entlanglaufen, von dort habt ihr einen schönen Blick über die Altstadt und aufs Meer.",
      "Am frühen Nachmittag lohnt sich Schatten, Hitze und Luftfeuchtigkeit sind hier ganzjährig hoch.",
    ],
    gefuehrt: [
      "Ein geführter Altstadt-Walk mit Blick auf Geschichte und Kolonialarchitektur.",
      "Ein Ausflug zu den Islas del Rosario, kleinen Inseln mit karibischem Wasser vor der Küste.",
      "Auf GetYourGuide oder Viator nach kostenlosen (nur trinkgeldbasierten) Free Walking Tours suchen, in Cartagena eine beliebte Option.",
    ],
  },
  "Oranjestad (Aruba)": {
    kurz: "Trockener und windiger als andere Karibikinseln, dafür mit türkisem Wasser und wenig Regen das ganze Jahr über.",
    zuFuss: [
      "Das Zentrum von Oranjestad mit niederländisch geprägter Architektur ist direkt vom Terminal aus zu Fuß erreichbar.",
      "Eagle Beach, einer der besten Strände der Karibik, ist mit kurzer Taxifahrt erreichbar, für Fußläufige eher zu weit.",
    ],
    gefuehrt: [
      "Eine Jeep- oder ATV-Tour durch den kargen Arikok-Nationalpark im Inselinneren.",
      "Ein Katamaran-Schnorchelausflug entlang der Westküste.",
      "Auf GetYourGuide oder Viator nach Strandtagen mit Transfer nach Eagle Beach oder Palm Beach suchen.",
    ],
  },
  "Willemstad (Curaçao)": {
    kurz: "Die farbenfrohen Fassaden von Handelskade direkt am Wasser gehören zu den meistfotografierten Ansichten der Karibik.",
    zuFuss: [
      "Direkt vom Terminal über die schwingende Königin-Emma-Brücke ins bunte Zentrum laufen.",
      "Das Viertel Pietermaai mit Straßenkunst und kleinen Cafés ist ebenfalls fußläufig.",
      "Fort Amsterdam direkt am Hafen ist frei zugänglich und schnell erkundet.",
    ],
    gefuehrt: [
      "Ein Ausflug zum Schnorcheln oder Tauchen an einem der Riffe, Curaçao zählt zu den besten Tauchzielen der Karibik.",
      "Ein Besuch der Kura Hulanda oder einer der Aloe-Farmen im Inselinneren.",
      "Auf GetYourGuide oder Viator nach Strand-Hopping-Touren zu Kenepa oder Cas Abao suchen, die ruhigeren Strände abseits der Stadt.",
    ],
  },
  "Kralendijk (Bonaire)": {
    kurz: "Eine der besten Tauch- und Schnorchelinseln der Welt, mit Riff, das direkt von der Küste aus beginnt.",
    zuFuss: [
      "Der kleine Ort Kralendijk ist in einer halben Stunde abgelaufen, bunte Häuser und ein paar Läden direkt am Wasser.",
      "Direkt vom Ufer aus schnorcheln, an vielen Stellen der Insel beginnt das Riff nur wenige Meter vor der Küste.",
    ],
    gefuehrt: [
      "Ein Tauch- oder Schnorchelausflug, das ist der Hauptgrund, warum die meisten Kreuzfahrer hier anlegen.",
      "Eine Fahrradtour durch den Washington-Slagbaai-Nationalpark im Norden der Insel.",
      "Auf GetYourGuide oder Viator nach geführten Schnorcheltouren mit Ausrüstung suchen, wenn ihr eure eigene nicht dabeihabt.",
    ],
  },
  "Ocho Rios": {
    kurz: "Bekannt vor allem für die Dunn's River Falls, einen begehbaren Wasserfall mitten im Grünen.",
    zuFuss: [
      "Der Ort selbst ist überschaubar, das Hauptziel Dunn's River Falls liegt aber außerhalb und braucht Transport.",
      "Der Ocho-Rios-Craft-Market direkt in Hafennähe ist zu Fuß gut zu erreichen für Souvenirs.",
    ],
    gefuehrt: [
      "Der Aufstieg an den Dunn's River Falls mit Guide, ein echter Klassiker in Jamaika, an dem ihr euch an den Händen die Kaskaden hochzieht.",
      "Ein Ausflug zur Rastafari-Kultur oder zu einer Kaffeeplantage im Hochland.",
      "Auf GetYourGuide oder Viator nach Dunn's-River-Falls-Tickets mit Guide suchen, ohne Guide ist der Zugang oft komplizierter zu organisieren.",
    ],
  },
  "Montego Bay": {
    kurz: "Jamaikas Touristenzentrum mit langen Sandstränden und guter touristischer Infrastruktur.",
    zuFuss: [
      "Doctor's Cave Beach ist einer der bekanntesten Strände Jamaikas und mit kurzer Taxifahrt vom Terminal erreichbar.",
      "Das Zentrum von Montego Bay selbst ist überschaubar, für die Strände braucht ihr aber Transport.",
    ],
    gefuehrt: [
      "Ein Ausflug zum Martha Brae River mit Bambusfloß-Fahrt, entspannt und familienfreundlich.",
      "Eine Fahrt zu den Rose Hall Great House, einer der bekanntesten Plantagen-Anwesen der Insel.",
      "Auf GetYourGuide oder Viator nach Zipline- oder Wasserfall-Kombitouren suchen, beliebt bei aktiveren Gästen.",
    ],
  },
  "Falmouth (Jamaika)": {
    kurz: "Ein für Kreuzfahrer ausgebauter Hafen mit georgianischer Altstadt direkt am Terminal.",
    zuFuss: [
      "Die kleine Altstadt von Falmouth mit ihrer georgianischen Architektur liegt direkt am Terminal und ist gut zu Fuß erkundbar.",
      "Für Strände braucht ihr Transport, in unmittelbarer Gehweite liegt keiner.",
    ],
    gefuehrt: [
      "Ein Ausflug zur Blue Hole oder zu den YS Falls, beides beliebte Wasserfall-Ziele in der Nähe.",
      "Eine nächtliche Bootstour auf der Luminous Lagoon mit biolumineszentem Plankton, ein besonderes Erlebnis, das es an wenigen Orten der Welt gibt.",
      "Auf GetYourGuide oder Viator nach der Luminous-Lagoon-Nachttour suchen, dafür müsst ihr abends an Bord zurück sein oder einen Abendliegeplatz haben.",
    ],
  },
  "George Town (Cayman)": {
    kurz: "Kein eigener Pier — das Schiff ankert vor der Küste, Tenderboote bringen euch an Land, plant dafür Zeit ein.",
    zuFuss: [
      "Seven Mile Beach ist einer der bekanntesten Strände der Karibik, aber mit Taxi statt zu Fuß erreichbar.",
      "Das Zentrum von George Town direkt am Tenderanleger ist klein und schnell abgelaufen.",
      "Rechnet mit Wartezeit für das Tenderboot, besonders wenn mehrere Schiffe gleichzeitig ankern.",
    ],
    gefuehrt: [
      "Ein Ausflug zur Stingray City, wo ihr im flachen Wasser mit wilden Rochen schwimmt — eines der bekanntesten Erlebnisse der Karibik.",
      "Ein Schnorchelausflug entlang der Riffe vor Seven Mile Beach.",
      "Auf GetYourGuide oder Viator nach Stingray-City-Kombitouren mit Schnorcheln suchen, meist günstiger als das identische Bordangebot.",
    ],
    tipp: "Da hier getendert wird, kann bei schlechtem Wetter der Landgang ganz ausfallen — bucht Ausflüge, die ihr stornieren könnt.",
  },
  "Labadee": {
    kurz: "Eine eingezäunte Privathalbinsel der Reederei an der Nordküste Haitis, nicht das restliche Land dahinter.",
    zuFuss: [
      "Die Halbinsel ist überschaubar, ein Rundgang zu Fuß reicht, um Strände und Stationen zu finden.",
      "Es gibt keinen Zugang zum restlichen Haiti von hier aus.",
    ],
    gefuehrt: [
      "Die Zipline über die Bucht, eine der längsten Ziplines der Karibik, gehört zu den bekanntesten Attraktionen von Labadee.",
      "Wassersport wie Kajak, Jetski oder ein schwimmender Wasserpark direkt am Strand.",
      "Externe Anbieter gibt es hier nicht, alles läuft über die Reederei-App oder direkt vor Ort.",
    ],
  },
  "Amber Cove": {
    kurz: "Ein für Kreuzfahrer gebauter Terminalbereich mit Pool direkt am Pier, die dominikanische Kultur liegt im nahen Ort Puerto Plata.",
    zuFuss: [
      "Der Terminalbereich mit Pool, Bar und Läden ist ohne Ausflug voll nutzbar.",
      "Für den echten Ort Puerto Plata braucht ihr ein Taxi oder einen Shuttle.",
    ],
    gefuehrt: [
      "Ein Ausflug zur Seilbahn auf den Isabel de Torres mit Panoramablick über die Küste.",
      "Ein Strandtag am Playa Dorada, dem bekanntesten Strand der Region.",
      "Auf GetYourGuide oder Viator nach ATV- oder Wasserfall-Touren ins Hinterland suchen.",
    ],
  },
  "Puerto Plata": {
    kurz: "Historisches Zentrum mit viktorianischer Architektur, ruhiger als die reinen Cruise-Terminals der Region.",
    zuFuss: ["Der Malecón und das Zentrum mit dem Fort San Felipe sind je nach genauem Liegeplatz zu Fuß gut zu erreichen."],
    gefuehrt: [
      "Die Seilbahnfahrt auf den Isabel de Torres, einer der Klassiker der Region.",
      "Ein Ausflug zu den 27 Wasserfällen von Damajagua.",
      "Auf GetYourGuide oder Viator nach Wasserfall- oder Strandtouren suchen.",
    ],
  },
  "La Romana": {
    kurz: "Gateway zum Nobelresort Casa de Campo und zur nachgebauten Künstlerstadt Altos de Chavón.",
    zuFuss: ["Vom Terminal selbst ist wenig fußläufig, die meisten Ziele liegen außerhalb."],
    gefuehrt: [
      "Ein Ausflug nach Altos de Chavón, einer aus Naturstein nachgebauten italienischen Künstlerstadt aus dem 16. Jahrhundert.",
      "Ein Katamaran- oder Strandausflug zur Isla Saona, einem der bekanntesten Postkarten-Strände der Karibik.",
      "Auf GetYourGuide oder Viator nach Isla-Saona-Tagestouren suchen, das ist der beliebteste Ausflug ab diesem Hafen.",
    ],
  },
  "Samaná": {
    kurz: "Naturreich und für Walbeobachtung bekannt, deutlich ruhiger als die großen Terminals der Insel.",
    zuFuss: ["Der kleine Ort Samaná selbst ist überschaubar, größere Ziele liegen außerhalb."],
    gefuehrt: [
      "Zwischen Januar und März: eine Bootstour zur Buckelwal-Beobachtung in der Samaná-Bucht, eine der besten Regionen der Karibik dafür.",
      "Ein Ausflug zum Wasserfall El Limón, teils zu Pferd erreichbar.",
      "Auf GetYourGuide oder Viator nach Wal-Touren suchen (nur saisonal verfügbar).",
    ],
  },
  "San Juan": {
    kurz: "Old San Juan mit seinen bunten Kolonialhäusern und Kopfsteinpflaster liegt direkt am Kreuzfahrtterminal.",
    zuFuss: [
      "Old San Juan komplett zu Fuß erkunden, das Terminal liegt mitten in der historischen Altstadt.",
      "Die Festungen El Morro und San Cristóbal sind beide fußläufig und einen Besuch wert.",
      "US-Dollar ist hier die Währung, das vereinfacht die Reisekasse für die meisten europäischen Gäste.",
    ],
    gefuehrt: [
      "Ein geführter Altstadt-Walk mit Blick auf die spanische Kolonialgeschichte.",
      "Ein Ausflug zum Regenwald El Yunque, dem einzigen tropischen Regenwald im US-Forstsystem.",
      "Auf GetYourGuide oder Viator nach Bio-Bay-Kajaktouren suchen (nur bei Abendliegezeit möglich), leuchtendes Plankton in der Bucht von Fajardo.",
    ],
  },
  "Charlotte Amalie (St. Thomas)": {
    kurz: "Duty-free-Shopping-Zentrum der Karibik, mit Magens Bay einem der schönsten Strände der Region.",
    zuFuss: [
      "Die Haupteinkaufsstraße direkt am Hafen ist bekannt für zollfreies Shopping, besonders Schmuck und Alkohol.",
      "Für Magens Bay, den bekanntesten Strand der Insel, braucht ihr ein Taxi.",
    ],
    gefuehrt: [
      "Ein Strandtag an Magens Bay mit Transfer, einer der meistfotografierten Strände der Karibik.",
      "Eine Fahrt mit dem Skyride zur Aussichtsplattform über der Bucht.",
      "Auf GetYourGuide oder Viator nach Katamaran- oder Segway-Touren suchen.",
    ],
  },
  "Road Town (Tortola)": {
    kurz: "Ruhiger als die US-Inseln, mit Cane Garden Bay als bekanntestem Strandziel.",
    zuFuss: [
      "Road Town selbst ist überschaubar und schnell abgelaufen.",
      "Für Cane Garden Bay, den schönsten Strand der Insel, braucht ihr ein Taxi über die Berge.",
    ],
    gefuehrt: [
      "Ein Ausflug zur Cane Garden Bay, meist mit offenem Safari-Taxi über die kurvige Bergstraße.",
      "Eine Insel-Hopping-Tour zu Nachbarinseln der Britischen Jungferninseln per Boot.",
      "Auf GetYourGuide oder Viator nach Segeltouren durch die BVI suchen, das Seegebiet gilt als eines der schönsten der Karibik.",
    ],
  },
  "Philipsburg (St. Maarten)": {
    kurz: "Die Insel ist zweigeteilt — niederländisch St. Maarten mit Casinos und Shopping, französisch St. Martin ruhiger und mit besseren Stränden.",
    zuFuss: [
      "Front Street direkt am Hafen mit Shopping und Cafés ist gut zu Fuß erkundbar.",
      "Maho Beach, berühmt für die tief landenden Flugzeuge direkt über den Köpfen der Strandgäste, braucht ein Taxi.",
      "Ein Cocktail an einer der Strandbars der Front Street für einen entspannten Ausklang vor der Rückfahrt.",
    ],
    gefuehrt: [
      "Ein Ausflug zum Maho Beach, um die berühmten Flugzeuglandungen aus nächster Nähe zu erleben.",
      "Ein Abstecher auf die französische Seite nach Marigot oder Grand Case, ruhiger und kulinarisch bekannt.",
      "Auf GetYourGuide oder Viator nach Insel-Rundfahrten suchen, die beide Seiten der Insel zeigen.",
      "Eine Katamaran-Schnorcheltour zu vorgelagerten Buchten, meist ruhiger als die belebten Hauptstrände.",
    ],
  },
  "Basseterre (St. Kitts)": {
    kurz: "Eine grüne Vulkaninsel mit einer historischen Zuckerrohrbahn, die heute Kreuzfahrtgäste durchs Umland fährt.",
    zuFuss: [
      "Das Zentrum von Basseterre mit dem Circus, dem zentralen Kreisverkehr, ist zu Fuß erkundbar.",
      "Independence Square mit Kolonialarchitektur liegt ebenfalls in Gehweite.",
      "Ein Kaffee oder ein Rum Punch an einem der Cafés am Circus für eine ruhige Pause einplanen.",
    ],
    gefuehrt: [
      "Eine Fahrt mit der St. Kitts Scenic Railway, einer alten Zuckerrohrbahn mit Panoramablick.",
      "Ein Ausflug zum Brimstone Hill Fortress, einer der beeindruckendsten Festungsanlagen der Karibik.",
      "Auf GetYourGuide oder Viator nach Katamaran-Schnorcheltouren rund um die Nachbarinsel Nevis suchen.",
      "Eine Wanderung oder Jeep-Tour zum Vulkankrater des Mount Liamuiga, für die etwas sportlicheren Gäste.",
    ],
  },
  "St. John's (Antigua)": {
    kurz: "Eine Insel mit einem Strand für jeden Tag des Jahres, wie es hier oft heißt — 365 an der Zahl.",
    zuFuss: [
      "Das Zentrum von St. John's mit dem Redcliffe Quay direkt am Hafen ist gut zu Fuß erkundbar.",
      "Für die schönsten Strände wie Half Moon Bay braucht ihr allerdings ein Taxi.",
    ],
    gefuehrt: [
      "Ein Strandtag am Half Moon Bay oder Dickenson Bay mit Transfer.",
      "Eine Katamaran-Tour rund um die Insel mit Schnorchelstopps.",
      "Auf GetYourGuide oder Viator nach Nelson's-Dockyard-Touren suchen, einer historischen Marinewerft im Süden der Insel.",
    ],
  },
  "Pointe-à-Pitre": {
    kurz: "Französisches Übersee-Département mit Euro als Währung und deutlich französischerem Flair als die Nachbarinseln.",
    zuFuss: ["Der Markt von Pointe-à-Pitre mit Gewürzen und tropischen Früchten ist zu Fuß vom Hafen erreichbar."],
    gefuehrt: [
      "Ein Ausflug in den Nationalpark rund um den Wasserfall Carbet, mit Regenwald und teils dem Vulkan La Soufrière.",
      "Ein Katamaran-Tagesausflug zu den vorgelagerten Îles des Saintes.",
      "Auf GetYourGuide oder Viator nach Wasserfall- und Regenwaldtouren suchen.",
    ],
  },
  "Roseau (Dominica)": {
    kurz: "Die „Naturinsel der Karibik“ — weniger Strand, dafür Regenwald, heiße Quellen und Wasserfälle satt.",
    zuFuss: [
      "Das kleine Zentrum von Roseau ist in einer halben Stunde abgelaufen.",
      "Für die Natur-Highlights der Insel braucht ihr fast immer organisierten Transport.",
    ],
    gefuehrt: [
      "Eine Wanderung zum Trafalgar Falls, einem der bekanntesten Wasserfälle der Insel.",
      "Ein Bad in den heißen Quellen des Titou Gorge oder Ti Kwen Glo Cho.",
      "Auf GetYourGuide oder Viator nach Wal-Beobachtungstouren suchen, Dominica gilt als eines der besten Whale-Watching-Ziele der Karibik.",
    ],
  },
  "Fort-de-France": {
    kurz: "Französisches Flair mitten in der Karibik, mit Euro als Währung.",
    zuFuss: [
      "Das Zentrum um die Kathedrale und das Fort-Saint-Louis ist zu Fuß gut erkundbar.",
      "Der Große Markt mit lokalen Gewürzen und Rum liegt ebenfalls in Gehweite.",
    ],
    gefuehrt: [
      "Ein Ausflug zu den Jardins de Balata, einem tropischen Garten am Fuß des Vulkans Montagne Pelée.",
      "Eine Rum-Verkostung auf einer der traditionsreichen Rhumeries der Insel.",
      "Auf GetYourGuide oder Viator nach Katamarantouren entlang der Südküste suchen.",
    ],
  },
  "Castries (St. Lucia)": {
    kurz: "Die markanten Zwillingsberge Pitons sind das Wahrzeichen der Insel, liegen aber im Süden, gut zwei Autostunden vom Hafen entfernt.",
    zuFuss: [
      "Das Zentrum von Castries selbst ist eher unspektakulär, für die bekannten Ziele der Insel braucht ihr Transport.",
      "Der Markt direkt am Hafen lohnt sich für einen kurzen Bummel.",
      "Wer bleibt, findet an der Vigie Beach in Hafennähe einen unkomplizierten Strandnachmittag.",
    ],
    gefuehrt: [
      "Ein Ganztagesausflug zu den Pitons im Süden der Insel, meist der Hauptgrund für einen Besuch auf St. Lucia.",
      "Ein Bad in den Schwefelquellen von Sulphur Springs, oft mit Schlammbad kombiniert.",
      "Auf GetYourGuide oder Viator nach Piton-Tagestouren suchen, da die Distanz für einen Landgang ohne Guide knapp werden kann.",
      "Eine Katamaran-Tour die Westküste entlang bis zu den Pitons, als entspanntere Alternative zur Straße.",
    ],
  },
  "Bridgetown (Barbados)": {
    kurz: "Britisch geprägte Insel mit Rum-Tradition und einigen der besten Strände der Karibik an der Westküste.",
    zuFuss: [
      "Das Zentrum von Bridgetown mit dem UNESCO-gelisteten Garrison-Viertel ist zu Fuß erkundbar.",
      "Für die Strände der Westküste braucht ihr ein Taxi.",
    ],
    gefuehrt: [
      "Eine Rum-Tour zur Mount-Gay-Destillerie, einer der ältesten Rum-Marken der Welt.",
      "Eine Katamaran-Tour mit Schildkröten-Schnorcheln an der Westküste.",
      "Auf GetYourGuide oder Viator nach Schildkröten-Schnorcheltouren suchen, eines der beliebtesten Erlebnisse der Insel.",
    ],
  },
  "Kingstown (St. Vincent)": {
    kurz: "Weniger touristisch erschlossen als viele Nachbarinseln, mit ursprünglicher Natur und den vorgelagerten Grenadinen.",
    zuFuss: ["Das Zentrum von Kingstown ist kompakt und zu Fuß erkundbar."],
    gefuehrt: [
      "Ein Ausflug zu den Botanischen Gärten, einer der ältesten tropischen Gärten der westlichen Hemisphäre.",
      "Eine Bootstour zu den vorgelagerten Grenadinen wie Bequia oder Mustique.",
      "Auf GetYourGuide oder Viator nach Wasserfall- oder Regenwaldtouren suchen.",
    ],
  },
  "St. George's (Grenada)": {
    kurz: "Die „Gewürzinsel“ der Karibik, bekannt für Muskat, Zimt und einen der schönsten Naturhäfen der Region.",
    zuFuss: [
      "Der Carenage, die geschwungene Hafenpromenade von St. George's, ist ein Spaziergang für sich.",
      "Fort George über der Stadt ist zu Fuß erreichbar und bietet einen schönen Blick über den Hafen.",
    ],
    gefuehrt: [
      "Ein Besuch einer Gewürzplantage, um zu sehen, wo Muskat und Kakao wirklich herkommen.",
      "Ein Ausflug zum Unterwasser-Skulpturenpark, einem der ungewöhnlichsten Schnorchelziele der Karibik.",
      "Auf GetYourGuide oder Viator nach Wasserfall-Touren zu den Annandale Falls suchen.",
    ],
  },
  "Port of Spain": {
    kurz: "Industrieller und weniger touristisch als andere Karibikziele, dafür mit einzigartiger Natur wie den Caroni-Sümpfen.",
    zuFuss: ["Das Zentrum ist zu Fuß erkundbar, gilt aber als weniger klassisch karibisch als die Nachbarinseln."],
    gefuehrt: [
      "Eine Bootstour durch die Caroni-Sümpfe zur Vogelbeobachtung, berühmt für die Scharlachsichler bei Sonnenuntergang.",
      "Ein Ausflug zu den Maracas-Bay-Stränden im Norden der Insel.",
      "Auf GetYourGuide oder Viator nach Caroni-Bird-Sanctuary-Touren suchen.",
    ],
  },
  "Grand Turk": {
    kurz: "Ein für Kreuzfahrer gebauter Terminalbereich mit direktem Zugang zu einem der besten Riffe der Karibik.",
    zuFuss: [
      "Direkt am Terminal liegt ein Strandbereich mit Pool, von dem aus ihr auch selbst schnorcheln könnt.",
      "Das kleine historische Zentrum von Cockburn Town ist mit kurzem Taxi erreichbar.",
    ],
    gefuehrt: [
      "Ein Schnorchel- oder Tauchausflug an die Riffkante, die hier ungewöhnlich nah an der Küste abfällt.",
      "Zwischen Januar und April: eine Bootstour zur Buckelwal-Beobachtung.",
      "Auf GetYourGuide oder Viator nach Stingray- oder Schnorcheltouren suchen.",
    ],
  },
  "Great Stirrup Cay": {
    kurz: "Die private Insel von Norwegian Cruise Line auf den Bahamas, mit mehreren Strandabschnitten und eigenem Wasserpark-Bereich.",
    zuFuss: ["Die Insel ist klein und komplett zu Fuß erkundbar.", "Früh von Bord gehen für die besten Liegen."],
    gefuehrt: [
      "Cabana-Miete über die Reederei-App vorab reservieren.",
      "Wassersport wie Jetski oder Parasailing direkt am Strand buchen.",
      "Externe Anbieter gibt es hier nicht.",
    ],
  },
  "Half Moon Cay": {
    kurz: "Die private Insel von Holland America und Carnival, gilt als eine der schönsten Privatinseln der Karibik mit besonders langem Sandstrand.",
    zuFuss: [
      "Der lange, geschwungene Sandstrand ist zu Fuß in beide Richtungen erkundbar.",
      "Früh von Bord gehen, an vollen Tagen sind die schattigen Plätze schnell vergeben.",
    ],
    gefuehrt: [
      "Cabana- oder Liegeplatz-Reservierung über die Reederei-App.",
      "Pferdereiten am Strand, eines der bekannteren Angebote dieser Insel.",
      "Externe Anbieter gibt es hier nicht.",
    ],
  },
  "Perfect Day at CocoCay": {
    kurz: "Die aufwendig ausgebaute Privatinsel von Royal Caribbean mit Wasserpark, Zipline und dem höchsten Wasserrutschenturm der Karibik.",
    zuFuss: [
      "Die Insel ist groß für eine Privatinsel, ein Wasser-Taxi oder eine kleine Bahn bringt euch zwischen den Bereichen hin und her.",
      "Früh von Bord gehen, gerade der Wasserpark füllt sich schnell.",
    ],
    gefuehrt: [
      "Zugang zum Thrill Waterpark vorab über die Reederei-App buchen, das lohnt sich fast immer.",
      "Die Zipline über die Insel oder der Aufstieg auf den Aussichtsturm.",
      "Cabana-Miete, wenn ihr einen festen Rückzugsort für den Tag wollt.",
    ],
  },
  "Princess Cays": {
    kurz: "Die private Strandinsel von Princess Cruises auf Eleuthera, ruhiger und kleiner als andere Reederei-Inseln.",
    zuFuss: ["Der Strandbereich ist überschaubar und zu Fuß komplett erkundbar."],
    gefuehrt: [
      "Cabana- oder Liegeplatz-Reservierung über die Reederei-App.",
      "Wassersport wie Kajak oder Schnorchelausrüstung direkt am Strand mieten.",
      "Externe Anbieter gibt es hier nicht.",
    ],
  },

  "Barcelona": {
    kurz: "Eine der wenigen Kreuzfahrtstädte, die selbst schon das Ziel ist — die Sagrada Família allein braucht einen halben Tag.",
    zuFuss: [
      "Die Ramblas hinunterschlendern bis zum alten Hafen, ein Klassiker, der sich nie abnutzt.",
      "Das Gotische Viertel zu Fuß erkunden, hier verläuft man sich am schönsten.",
      "Vorab-Ticket für die Sagrada Família online buchen, ohne Ticket wartet ihr oft stundenlang.",
      "Die Markthalle La Boqueria für frisches Obst, Tapas und einen Kaffee zwischendurch ansteuern.",
    ],
    gefuehrt: [
      "Eine Gaudí-Tour mit Sagrada Família und Park Güell, beides mit Zeitfenster-Ticket.",
      "Ein Tapas- und Markt-Walk durch die Boqueria und umliegende Gassen.",
      "Auf GetYourGuide oder Viator nach Skip-the-Line-Tickets für die Sagrada Família suchen, das spart hier besonders viel Zeit.",
      "Ein Ausflug an den Strand von Barceloneta, wenn ihr die Stadt schon kennt und lieber entspannt.",
    ],
  },
  "Civitavecchia (Rom)": {
    kurz: "Der Hafen selbst ist unspektakulär, das Ziel ist Rom — eine gute Stunde entfernt, weshalb der Tag von der Anreise lebt.",
    zuFuss: [
      "In Civitavecchia selbst gibt es wenig zu sehen, fast alle Gäste fahren weiter nach Rom.",
      "Zug oder Reederei-Bus früh nehmen, die Fahrt nach Rom dauert je nach Verbindung 45 bis 80 Minuten.",
      "Kolosseum-Ticket vorab online buchen, die Warteschlangen vor Ort sind sonst lang.",
      "Wer bleibt, findet direkt in Civitavecchia eine ruhige Uferpromenade für einen entspannteren Alternativtag.",
    ],
    gefuehrt: [
      "Ein Ganztagesausflug nach Rom mit Kolosseum, Forum Romanum und Vatikan, klassisch über die Reederei wegen der garantierten Rückfahrt.",
      "Ein privater Fahrer oder Zug auf eigene Faust, wenn ihr die Reihenfolge selbst bestimmen wollt.",
      "Auf GetYourGuide oder Viator nach Kolosseum-Skip-the-Line mit Zugtransfer suchen, oft flexibler und günstiger als der Bordausflug.",
      "Eine Vatikan-Tour mit Sixtinischer Kapelle und Petersdom, wenn euch das mehr interessiert als die Antike.",
    ],
    tipp: "Die Rückfahrzeit ist hier der kritische Punkt — plant für die Rückfahrt nach Civitavecchia mindestens zwei Stunden Puffer vor der Bordzeit ein.",
  },
  "Neapel": {
    kurz: "Tor zu Pompeji, Amalfiküste und dem Vesuv — die Stadt selbst ist laut und lebendig, aber die großen Ziele liegen außerhalb.",
    zuFuss: [
      "Das historische Zentrum von Neapel mit Spaccanapoli ist zu Fuß erkundbar, behaltet aber Wertsachen im Blick.",
      "Für Pompeji, Amalfiküste oder Capri braucht ihr Zug, Boot oder organisierten Transport.",
    ],
    gefuehrt: [
      "Ein Ausflug zu den Ausgrabungen von Pompeji, einer der eindrücklichsten antiken Stätten Europas.",
      "Eine Fahrt entlang der Amalfiküste, landschaftlich einer der schönsten Küstenabschnitte Italiens.",
      "Auf GetYourGuide oder Viator nach Pompeji-Halbtagestouren mit Guide suchen, das erklärt die Ausgrabung deutlich besser als ein Alleingang.",
    ],
  },
  "Venedig": {
    kurz: "Eine Stadt, die sich am besten zu Fuß und mit dem Vaporetto erschließt — Autos gibt es hier ohnehin nicht.",
    zuFuss: [
      "Vom Anleger zum Markusplatz laufen und euch danach bewusst in den Gassen verlaufen, das ist hier Teil des Erlebnisses.",
      "Die Rialtobrücke und den gleichnamigen Markt einplanen, meist ohnehin auf dem Weg.",
      "Ein Vaporetto-Tagesticket kaufen, wenn ihr mehr als einen Stadtteil sehen wollt.",
    ],
    gefuehrt: [
      "Eine Gondelfahrt durch die kleinen Kanäle, touristisch, aber zurecht ein Klassiker.",
      "Ein Ausflug nach Murano und Burano zu den Glasbläsern und den bunten Häusern.",
      "Auf GetYourGuide oder Viator nach Dogenpalast-Skip-the-Line suchen, das spart hier besonders viel Zeit.",
    ],
    tipp: "Venedig erhebt an bestimmten Tagen eine Tagesgebühr für Besucher — informiert euch vorab, ob euer Anlaufdatum betroffen ist.",
  },
  "Dubrovnik": {
    kurz: "Die komplett von einer Stadtmauer umschlossene Altstadt gehört zu den fotogensten Zielen im Mittelmeer.",
    zuFuss: [
      "Die Stadtmauer einmal komplett umlaufen, rund zwei Kilometer mit immer neuen Ausblicken.",
      "Die Placa, die Hauptstraße der Altstadt, entlangschlendern und in die Seitengassen abbiegen.",
      "Früh am Tag starten, die Altstadt füllt sich ab Mittag schnell mit Tagesgästen mehrerer Schiffe.",
    ],
    gefuehrt: [
      "Eine Seilbahnfahrt auf den Berg Srđ für den Panoramablick über die Altstadt.",
      "Ein Bootsausflug zu den Elaphiten-Inseln vor der Küste.",
      "Auf GetYourGuide oder Viator nach Stadtmauer-Tickets mit frühem Zeitfenster suchen, um die größte Hitze und die größten Menschenmassen zu umgehen.",
    ],
  },
  "Kotor": {
    kurz: "Eine Altstadt am Fuß steiler Berge, direkt an einer der schönsten Buchten Europas gelegen.",
    zuFuss: [
      "Die Altstadt von Kotor ist klein und zu Fuß in ein bis zwei Stunden erkundbar.",
      "Der Aufstieg zur Festung über der Stadt lohnt sich, ist aber steil und braucht festes Schuhwerk.",
      "Genug Wasser für den Aufstieg mitnehmen, Schatten gibt es dort kaum.",
    ],
    gefuehrt: [
      "Der geführte Aufstieg zur Festungsanlage, mit Kontext zur Geschichte der Bucht.",
      "Eine Bootstour durch die Bucht von Kotor mit Stopp an der künstlichen Insel Our Lady of the Rocks.",
      "Auf GetYourGuide oder Viator nach Bootstouren durch die Bucht suchen, von See aus wirkt die Landschaft noch eindrücklicher.",
    ],
  },
  "Santorini": {
    kurz: "Die Insel wird meist angeankert, ein Tenderboot oder eine Seilbahn bringt euch die Steilküste hinauf nach Fira.",
    zuFuss: [
      "Von Fira nach Oia entlang der Caldera laufen, einer der schönsten Küstenwege Griechenlands, rund zwei bis drei Stunden.",
      "Die Seilbahn statt der 588 Stufen zum Hafen nehmen, wenn ihr Zeit sparen wollt.",
      "Sonnenuntergang in Oia einplanen, wird aber entsprechend voll — für einen Tagesausflug meist zeitlich knapp.",
      "Ein Café mit Caldera-Blick in Fira für eine ruhige Pause vor dem Rückweg ansteuern.",
    ],
    gefuehrt: [
      "Eine Insel-Rundfahrt mit Stopp in Oia, dem bekanntesten Ort der Insel.",
      "Eine Weinverkostung bei einem der Weingüter auf vulkanischem Boden.",
      "Auf GetYourGuide oder Viator nach Katamaran-Touren um die Caldera suchen, mit Blick auf die Steilküste vom Wasser aus.",
      "Eine Bootstour zu den heißen Quellen und der vulkanischen Insel Nea Kameni in der Caldera.",
    ],
  },
  "Mykonos": {
    kurz: "Enge weiße Gassen, Windmühlen und ein Nachtleben, das über die Insel hinaus bekannt ist.",
    zuFuss: [
      "Chora, die Hauptstadt, ist ein Labyrinth aus weißen Gassen, das sich am besten ohne festen Plan erlaufen lässt.",
      "Die Windmühlen und Little Venice direkt am Wasser sind die bekanntesten Fotomotive der Insel.",
    ],
    gefuehrt: [
      "Ein Ausflug zur Nachbarinsel Delos, einer antiken, unbewohnten Insel und UNESCO-Welterbe.",
      "Ein Strandtag an einem der Beach-Clubs im Süden der Insel.",
      "Auf GetYourGuide oder Viator nach Bootstouren zu Delos suchen, meist vergleichbar mit dem Bordausflug, aber flexibler in der Zeit.",
    ],
  },
  "Piräus (Athen)": {
    kurz: "Der Hafen von Athen — die Akropolis liegt rund eine Stunde entfernt im Zentrum der Stadt.",
    zuFuss: [
      "Vom Hafen selbst ist die Athener Innenstadt zu weit für einen Fußweg, U-Bahn oder Taxi sind nötig.",
      "Direkt vom Terminal fährt die U-Bahn relativ zügig in Richtung Zentrum.",
      "Bequeme Schuhe für den unebenen Boden rund um die Akropolis einplanen.",
    ],
    gefuehrt: [
      "Ein Ausflug zur Akropolis mit Guide, der Zusammenhänge erklärt, die man auf eigene Faust leicht verpasst.",
      "Eine Kombination aus Akropolis und Plaka-Altstadt-Bummel.",
      "Auf GetYourGuide oder Viator nach Akropolis-Skip-the-Line suchen, an belebten Tagen spart das erheblich Zeit.",
    ],
  },
  "Istanbul": {
    kurz: "Eine Stadt auf zwei Kontinenten, in der ein einziger Tag kaum reicht — plant, dass ihr nur einen Ausschnitt seht.",
    zuFuss: [
      "Hagia Sophia und Blaue Moschee liegen nah beieinander und sind beide von den meisten Terminals aus zu Fuß erreichbar.",
      "Den Großen Basar durchlaufen, plant für Verhandlungen und Umwege ausreichend Zeit ein.",
      "Bedeckte Schultern und Knie für den Moscheebesuch einplanen, an manchen Moscheen werden Tücher verliehen.",
    ],
    gefuehrt: [
      "Eine Kombitour aus Hagia Sophia, Blauer Moschee und Basar mit Guide, der euch durch Gedränge und Geschichte führt.",
      "Eine Bosporus-Bootstour zwischen Europa und Asien.",
      "Auf GetYourGuide oder Viator nach Topkapi-Palast-Skip-the-Line suchen, dort sind die Schlangen oft besonders lang.",
    ],
  },
  "Kusadasi": {
    kurz: "Ausgangspunkt für Ephesos, eine der besterhaltenen antiken Städte der Welt.",
    zuFuss: [
      "Kusadasi selbst ist ein überschaubarer Küstenort, das eigentliche Ziel Ephesos liegt jedoch außerhalb.",
      "Für Ephesos ist ein Taxi oder organisierter Transport nötig, zu Fuß ist es zu weit.",
      "Festes Schuhwerk und Sonnenschutz für die Ausgrabungsstätte einplanen, dort gibt es kaum Schatten.",
    ],
    gefuehrt: [
      "Ein Ausflug nach Ephesos mit Guide, das macht hier wirklich den Unterschied zwischen Steinen und Geschichte.",
      "Ein Besuch des Hauses der Jungfrau Maria in der Nähe von Ephesos.",
      "Auf GetYourGuide oder Viator nach Ephesos-Halbtagestouren suchen, meist mit Abholung direkt am Pier.",
    ],
  },
  "Katakolon": {
    kurz: "Ein winziger Ort, dessen einziger Zweck der Zugang zum antiken Olympia ist.",
    zuFuss: [
      "Katakolon selbst ist in zehn Minuten abgelaufen, es gibt kaum mehr als eine Hafenstraße.",
      "Olympia liegt rund 40 Minuten entfernt und ist nicht fußläufig.",
    ],
    gefuehrt: [
      "Ein Ausflug zur antiken Olympia-Stätte, dem Austragungsort der ersten Olympischen Spiele.",
      "Eine Kombination aus Olympia-Besuch und Weinprobe im Umland.",
      "Auf GetYourGuide oder Viator nach Olympia-Halbtagestouren suchen, meist die einzige sinnvolle Art, diesen Hafen zu nutzen.",
    ],
  },
  "Kopenhagen": {
    kurz: "Eine fahrradfreundliche Stadt mit gutem Nahverkehr, die kleine Meerjungfrau ist meist kleiner als erwartet.",
    zuFuss: [
      "Nyhavn mit den bunten Häusern am Kanal ist ein Muss und meist gut zu Fuß erreichbar.",
      "Ein Leihfahrrad nehmen, Kopenhagen gehört zu den fahrradfreundlichsten Städten Europas.",
    ],
    gefuehrt: [
      "Eine Kanalrundfahrt, die euch die Stadt vom Wasser aus zeigt.",
      "Ein Ausflug nach Schloss Frederiksborg oder Kronborg (Hamlets Schloss) außerhalb der Stadt.",
      "Auf GetYourGuide oder Viator nach Fahrradtouren mit Guide suchen, eine der angenehmsten Arten, die Stadt zu sehen.",
    ],
  },
  "Oslo": {
    kurz: "Kompakte Hauptstadt mit Fjordlage, das Vigeland-Skulpturenpark und die Museumshalbinsel Bygdøy sind die Klassiker.",
    zuFuss: [
      "Die Karl Johans Gate vom Hafen zum Königsschloss hochlaufen, die zentrale Achse der Stadt.",
      "Die Oper direkt am Wasser besteigen, ihr könnt aufs Dach laufen.",
    ],
    gefuehrt: [
      "Ein Ausflug zur Museumshalbinsel Bygdøy mit Wikingerschiff- und Kon-Tiki-Museum.",
      "Eine Fjordrundfahrt mit Blick auf die Stadt vom Wasser aus.",
      "Auf GetYourGuide oder Viator nach Kombitickets für die Bygdøy-Museen suchen, meist inklusive Fähre.",
    ],
  },
  "Bergen": {
    kurz: "Das Tor zu den Fjorden, mit dem UNESCO-gelisteten Hanseviertel Bryggen direkt am Wasser.",
    zuFuss: [
      "Das Hanseviertel Bryggen mit seinen bunten Holzhäusern liegt direkt am Hafen und ist zu Fuß erkundbar.",
      "Der Fischmarkt in Hafennähe lohnt sich für einen kurzen Bummel.",
    ],
    gefuehrt: [
      "Die Standseilbahn Fløibanen auf den Hausberg Fløyen für den Panoramablick über die Stadt.",
      "Ein Fjordausflug, wenn ihr von hier aus einen der Fjorde besuchen wollt.",
      "Auf GetYourGuide oder Viator nach Fløyen-Kombitickets mit Wanderung suchen.",
    ],
  },
  "Geiranger": {
    kurz: "Einer der spektakulärsten Fjorde Norwegens, das Schiff fährt oft selbst mitten hindurch.",
    zuFuss: [
      "Der kleine Ort Geiranger ist schnell abgelaufen, das Erlebnis liegt in der Landschaft ringsum.",
      "Zu einem der nahen Aussichtspunkte laufen, wenn ihr fit seid und Zeit habt — es geht steil bergauf.",
      "Warme Schicht mitnehmen, im Fjord ist es kühler, als das Tal vermuten lässt.",
    ],
    gefuehrt: [
      "Eine Fahrt zur Adlerstraße oder zum Aussichtspunkt Dalsnibba mit spektakulärem Blick auf den Fjord.",
      "Eine Kajaktour auf dem Fjord selbst, für alle, die aktiv unterwegs sein wollen.",
      "Auf GetYourGuide oder Viator nach kleinen Gruppentouren zu den Aussichtspunkten suchen, oft persönlicher als der große Bus.",
    ],
  },
  "Stockholm": {
    kurz: "Eine Stadt auf 14 Inseln, die Altstadt Gamla Stan ist besonders dicht an Sehenswürdigkeiten.",
    zuFuss: [
      "Gamla Stan, die Altstadt, komplett zu Fuß erkunden, die Gassen sind eng und autofrei.",
      "Das Vasamuseum mit dem geborgenen Kriegsschiff aus dem 17. Jahrhundert liegt in guter Nähe.",
    ],
    gefuehrt: [
      "Eine Bootstour durch den Schärengarten vor der Stadt.",
      "Ein Ausflug zum Schloss Drottningholm, UNESCO-Welterbe außerhalb der Stadt.",
      "Auf GetYourGuide oder Viator nach Vasamuseum-Skip-the-Line suchen.",
    ],
  },
  "Reykjavík": {
    kurz: "Die kleinste Hauptstadt Nordeuropas, meist eher Ausgangspunkt für Naturausflüge als Ziel für sich.",
    zuFuss: [
      "Die Innenstadt rund um die Kirche Hallgrímskirkja ist überschaubar und zu Fuß gut zu machen.",
      "Die Hafenpromenade mit dem Konzerthaus Harpa lohnt sich für einen Spaziergang.",
    ],
    gefuehrt: [
      "Ein Ausflug zum Golden Circle mit Geysir, Wasserfall Gullfoss und Nationalpark Þingvellir, das Wahrzeichen-Trio Islands.",
      "Eine Fahrt zur Blauen Lagune, wenn Zeit und Liegeplan es zulassen (vorab Zeitfenster buchen).",
      "Auf GetYourGuide oder Viator nach Golden-Circle-Kleingruppentouren suchen, oft persönlicher als der große Reisebus.",
    ],
    tipp: "Islands Wetter ändert sich schnell — Schichtkleidung ist hier wichtiger als anderswo, selbst im Sommer.",
  },
  "Southampton": {
    kurz: "Meist reiner Start- oder Endhafen ohne eigenen Landgang, London ist rund eineinhalb Stunden entfernt.",
    zuFuss: ["In Southampton selbst gibt es touristisch wenig, die meisten Gäste fahren weiter oder reisen direkt an."],
    gefuehrt: [
      "Ein Zug- oder Bustransfer nach London, wenn ihr vor oder nach der Reise noch Zeit habt.",
      "Auf GetYourGuide oder Viator nach Transfers Southampton–London-Zentrum suchen.",
    ],
  },
  "Tallinn": {
    kurz: "Eine der besterhaltenen mittelalterlichen Altstädte Europas, komplett von einer Stadtmauer umschlossen.",
    zuFuss: [
      "Die Altstadt mit ihren Kopfsteinpflastergassen ist direkt vom Hafen aus zu Fuß erreichbar.",
      "Auf den Domberg steigen für den Blick über die roten Ziegeldächer.",
    ],
    gefuehrt: [
      "Ein geführter Altstadt-Walk mit Blick auf die mittelalterliche Geschichte der Hansestadt.",
      "Ein Ausflug zum Freilichtmuseum Rocca al Mare außerhalb der Stadt.",
      "Auf GetYourGuide oder Viator nach Food-Touren durch die Altstadt suchen.",
    ],
  },
  "Singapur": {
    kurz: "Eine der saubersten und am besten organisierten Städte Asiens, mit hervorragendem Nahverkehr und viel Grün mitten in der Stadt.",
    zuFuss: [
      "Die Gardens by the Bay mit den Supertree-Baumriesen sind zu Fuß oder mit kurzer MRT-Fahrt erreichbar.",
      "Marina Bay Sands und den Merlion-Park entlang der Promenade ablaufen.",
      "Das MRT-System ist zuverlässig und kühl klimatisiert, meist die beste Art, längere Strecken zu überbrücken.",
    ],
    gefuehrt: [
      "Eine Nachttour durch Gardens by the Bay mit der Lichtshow Garden Rhapsody.",
      "Ein Ausflug in die Altstadtviertel Little India, Chinatown und Kampong Glam.",
      "Auf GetYourGuide oder Viator nach Gardens-by-the-Bay-Kombitickets mit Cloud Forest und Flower Dome suchen.",
    ],
  },
  "Dubai": {
    kurz: "Superlative auf engem Raum — vom höchsten Gebäude der Welt bis zur künstlichen Insel, dazwischen liegen aber oft weite, nicht begehbare Strecken.",
    zuFuss: [
      "In der Altstadt Al Fahidi und am Dubai Creek lässt sich noch das ursprünglichere Dubai zu Fuß erleben.",
      "Die Dubai Mall mit Blick auf den Burj Khalifa ist klimatisiert und gut zu Fuß erkundbar.",
      "Für alles andere lieber Taxi, Metro oder organisierten Transport nutzen, Distanzen und Hitze machen Fußwege sonst unangenehm.",
    ],
    gefuehrt: [
      "Eine Fahrt auf die Aussichtsplattform des Burj Khalifa, am besten mit vorab gebuchtem Zeitfenster.",
      "Ein Wüstenausflug mit Dünenfahrt und Beduinen-Camp am Nachmittag oder Abend.",
      "Auf GetYourGuide oder Viator nach Burj-Khalifa-Tickets mit festem Zeitfenster suchen, um lange Wartezeiten zu vermeiden.",
    ],
  },
  "Hongkong": {
    kurz: "Eine Skyline, die man am besten von der anderen Seite des Hafens sieht — die Star Ferry ist dafür die günstigste und schönste Option.",
    zuFuss: [
      "Mit der Star Ferry von Kowloon nach Hong Kong Island übersetzen, eine der günstigsten Attraktionen der Stadt.",
      "Die Uferpromenade am Victoria Harbour mit Blick auf die Skyline entlanglaufen.",
    ],
    gefuehrt: [
      "Eine Fahrt mit der Peak Tram auf den Victoria Peak für den bekanntesten Ausblick der Stadt.",
      "Eine Tour durch die schwimmenden Märkte und Fischerdörfer wie Aberdeen.",
      "Auf GetYourGuide oder Viator nach Peak-Tram-Skip-the-Line suchen, die Warteschlangen sind besonders an Wochenenden lang.",
    ],
  },
  "Sydney": {
    kurz: "Eine der schönsten Hafeneinfahrten der Welt — mit etwas Glück legt euer Schiff direkt an der Circular Quay an, mit Blick auf Opernhaus und Harbour Bridge.",
    zuFuss: [
      "Von der Circular Quay zum Opernhaus und weiter in die Royal Botanic Gardens laufen.",
      "The Rocks, das historische Hafenviertel, liegt direkt in Gehweite und lohnt einen Bummel.",
    ],
    gefuehrt: [
      "Ein Aufstieg auf die Harbour Bridge (BridgeClimb), eines der bekanntesten Erlebnisse der Stadt.",
      "Eine Fährfahrt nach Manly oder Watsons Bay, günstig und mit tollem Blick auf die Skyline.",
      "Auf GetYourGuide oder Viator nach Opernhaus-Führungen hinter die Kulissen suchen.",
    ],
  },
  "Rio de Janeiro": {
    kurz: "Zuckerhut und Corcovado prägen die Skyline, die Stadt selbst braucht wegen ihrer Größe und Kontraste einen organisierten ersten Zugang.",
    zuFuss: [
      "In direkter Hafennähe bleiben und Wertsachen nicht offen tragen, wie in jeder Millionenstadt dieser Größe.",
      "Copacabana und Ipanema sind mit kurzer Fahrt erreichbar, für einen entspannten Strandnachmittag.",
    ],
    gefuehrt: [
      "Eine Fahrt zur Christus-Statue auf dem Corcovado, das bekannteste Wahrzeichen der Stadt.",
      "Eine Seilbahnfahrt auf den Zuckerhut mit Panoramablick über die Bucht.",
      "Auf GetYourGuide oder Viator nach Kombitouren Corcovado und Zuckerhut mit Abholung am Pier suchen.",
    ],
  },
  "Buenos Aires": {
    kurz: "Europäisch geprägte Metropole mit eigenem Tango-Rhythmus, meist Start- oder Endpunkt für Patagonien-Kreuzfahrten.",
    zuFuss: [
      "Das Viertel La Boca mit den bunten Häusern von Caminito ist ein beliebtes, aber touristisch belebtes Fotomotiv.",
      "Recoleta mit seinem berühmten Friedhof und den eleganten Cafés lohnt einen längeren Bummel.",
    ],
    gefuehrt: [
      "Eine Tango-Show mit Abendessen, ein Klassiker für den ersten oder letzten Abend in der Stadt.",
      "Eine Stadtrundfahrt mit Guide durch die unterschiedlichen Viertel, gerade bei kurzer Zeit sinnvoll.",
      "Auf GetYourGuide oder Viator nach privaten Stadttouren mit Abholung am Pier suchen.",
    ],
  },
  "Tokyo (Yokohama)": {
    kurz: "Das Kreuzfahrtterminal liegt meist in Yokohama, Tokyo selbst ist mit dem Zug rund 30 bis 45 Minuten entfernt.",
    zuFuss: [
      "Der Bezirk Minato Mirai direkt am Terminal in Yokohama ist modern und gut zu Fuß erkundbar.",
      "Für Tokyo braucht ihr den Zug, das japanische Bahnsystem ist aber ausgesprochen zuverlässig und einfach zu nutzen.",
    ],
    gefuehrt: [
      "Ein Ganztagesausflug nach Tokyo mit den Klassikern Shibuya, Asakusa und Kaiserpalast-Außenbereich.",
      "Ein Besuch des Sankeien-Gartens direkt in Yokohama, wenn die Zeit für Tokyo nicht reicht.",
      "Auf GetYourGuide oder Viator nach Tokyo-Tagestouren ab Yokohama suchen, meist mit garantierter Rückfahrt zum Schiff.",
    ],
  },
};

/* Liefert Land, Währung, Kurzinfo und Ausflugsideen zu einem eingetragenen
   Hafennamen — eigene Inhalte, wo vorhanden, sonst die Typ-Vorlage. */
function hafenInfo(name) {
  const s = normText(name);
  if (s.length < 2) return null;
  const eintrag = HAFENLISTE.find((h) => normText(h.n) === s) || HAFENLISTE.find((h) => normText(h.n).indexOf(s) >= 0);
  if (!eintrag) return null;
  const bespoke = HAFEN_DETAILS[eintrag.n] || {};
  const vorlage = TYP_VORLAGEN[eintrag.typ] || TYP_VORLAGEN.AS;
  const waehrung = bespoke.waehrung || WAEHRUNG[eintrag.land] || null;
  return {
    name: eintrag.n,
    land: eintrag.land,
    typ: eintrag.typ,
    kontinent: kontinentFuer(eintrag.land),
    waehrung,
    sprache: SPRACHE[eintrag.land] || null,
    steckdose: steckdoseFuer(eintrag.land),
    trinkgeldTipp: trinkgeldTippFuer(eintrag.land),
    klima: KLIMA_VORLAGEN[eintrag.typ] || null,
    kurz: bespoke.kurz || vorlage.kurz,
    zuFuss: bespoke.zuFuss || vorlage.zuFuss,
    gefuehrt: bespoke.gefuehrt || vorlage.gefuehrt,
    tipp: bespoke.tipp || null,
  };
}

/* Welche Hafentypen kommen in der eingetragenen Route tatsächlich vor —
   Grundlage für die automatisch erweiterte Packliste. */
function typenInRoute(haefen) {
  const typen = new Set();
  (haefen || []).forEach((h) => {
    if (!h.name) return;
    const eintrag = HAFENLISTE.find((x) => normText(x.n) === normText(h.name));
    if (eintrag) typen.add(eintrag.typ);
  });
  return Array.from(typen);
}

/* Elektronische Vorab-Einreisegenehmigungen — bewusst nur Länder mit
   offizieller Online-Anmeldung, und nur mit der echten Regierungsseite
   verlinkt. Ob und was genau nötig ist, hängt von der Staatsangehörigkeit
   ab, deshalb als Hinweis formuliert statt als feste Aussage. */
const EINREISE_HINWEISE = {
  USA: { programm: "ESTA", url: "https://esta.cbp.dhs.gov/",
    hinweis: "Für die meisten europäischen Reisepässe nötig, am besten rechtzeitig vor der Reise beantragen." },
  Kanada: { programm: "eTA", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html",
    hinweis: "Bei Einreise über einen kanadischen Hafen für viele Staatsangehörigkeiten nötig." },
  "Vereinigtes Königreich": { programm: "ETA", url: "https://www.gov.uk/eta",
    hinweis: "Seit Einführung der britischen ETA auch für die meisten EU-Bürger nötig." },
};
function laenderMitEinreiseHinweis(haefen) {
  const laender = new Set();
  (haefen || []).forEach((h) => {
    if (!h.name) return;
    const eintrag = HAFENLISTE.find((x) => normText(x.n) === normText(h.name));
    if (eintrag && EINREISE_HINWEISE[eintrag.land]) laender.add(eintrag.land);
  });
  return Array.from(laender);
}
function EinreiseHinweisKarte({ laender }) {
  if (!laender.length) return null;
  return (
    <div style={{
      background: C.sand, borderRadius: RUND, padding: "16px 18px 18px", marginBottom: 18,
      borderLeft: `2px solid ${C.messing}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
        <span style={{ fontSize: 18 }} aria-hidden="true">🛂</span>
        <div style={{ fontFamily: SANS, fontSize: 16.5, color: C.navy }}>
          Einreisegenehmigung nötig?
        </div>
      </div>
      <P style={{ fontSize: 13, marginBottom: 14 }}>
        Eure Route berührt Länder mit elektronischer Vorab-Einreisegenehmigung. Ob und was genau ihr
        braucht, hängt von eurer Staatsangehörigkeit ab — bitte immer auf der offiziellen Seite prüfen.
      </P>
      {laender.map((land) => {
        const info = EINREISE_HINWEISE[land];
        return (
          <div key={land} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: SANS, fontSize: 14.5, color: C.navy, marginBottom: 3 }}>
              {land} <span style={{ color: C.muted }}>· {info.programm}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 8 }}>
              {info.hinweis}
            </div>
            <a href={info.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Btn small variant="outline">{info.programm} auf der offiziellen Seite prüfen</Btn>
            </a>
          </div>
        );
      })}
    </div>
  );
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

/* Grobe Zeitzonen-Schätzung allein aus dem Längengrad — kein Ersatz für die
   Bordansage, aber genug, um vor einem Zeitzonenwechsel zu warnen. */
function zeitzoneVersatz(a, b) {
  if (typeof a.lon !== "number" || typeof b.lon !== "number") return null;
  return Math.round(b.lon / 15) - Math.round(a.lon / 15);
}

function regionWaehlen(punkte, route) {
  if (punkte.length > 0) {
    let beste = "atlantik", besterTreffer = -1;
    Object.keys(REGIONEN).forEach((k) => {
      const [x0, y0, x1, y1] = REGIONEN[k].box;
      const treffer = punkte.filter((p) => p.lon >= x0 && p.lon <= x1 && p.lat >= y0 && p.lat <= y1).length;
      if (treffer > besterTreffer) {
        besterTreffer = treffer; beste = k;
      } else if (treffer === besterTreffer && treffer > 0) {
        const fa = REGIONEN[k].box, fb = REGIONEN[beste].box;
        if ((fa[2] - fa[0]) * (fa[3] - fa[1]) < (fb[2] - fb[0]) * (fb[3] - fb[1])) beste = k;
      }
    });
    return beste;
  }
  const zuordnung = { karibik: "karibikOst", mittel: "mittel", nord: "nord", trans: "atlantik" };
  return zuordnung[route] || "mittel";
}

function Karte({ haefen, route, linie = true, nummern = true }) {
  const punkte = haefen.filter((h) => typeof h.lon === "number" && typeof h.lat === "number");
  const regKey = regionWaehlen(punkte, route);
  const reg = REGIONEN[regKey];

  /* Ausschnitt bestimmen — richtet sich nach den eingetragenen Häfen,
     nicht nach der Standard-Box der Region, damit nie ein Hafen
     außerhalb des sichtbaren Kartenausschnitts landet. */
  let [bx0, by0, bx1, by1] = reg.box;
  if (punkte.length >= 2) {
    const lons = punkte.map((p) => p.lon), lats = punkte.map((p) => p.lat);
    const pufX = Math.max(2.5, (Math.max(...lons) - Math.min(...lons)) * 0.25);
    const pufY = Math.max(1.5, (Math.max(...lats) - Math.min(...lats)) * 0.25);
    bx0 = Math.min(...lons) - pufX; bx1 = Math.max(...lons) + pufX;
    by0 = Math.min(...lats) - pufY; by1 = Math.max(...lats) + pufY;
  } else if (punkte.length === 1) {
    const pufX = 6, pufY = 4;
    bx0 = punkte[0].lon - pufX; bx1 = punkte[0].lon + pufX;
    by0 = punkte[0].lat - pufY; by1 = punkte[0].lat + pufY;
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

  const gesamt = punkte.reduce((a, p, i) => i ? a + seemeilen(punkte[i - 1], p) : 0, 0);

  /* Pins dürfen sich nie überlappen, auch wenn Häfen geografisch dicht
     beieinanderliegen (z. B. mehrere Karibikinseln). Sanfte, iterative
     Abstoßung der projizierten Punkte — nur die Pins wandern, die
     Küstenlinie bleibt an ihrem Platz. */
  const pinPositionen = (() => {
    const pos = punkte.map((p) => { const [x, y] = px(p); return { x, y }; });
    const minAbstand = 36;
    const rand = 20;
    for (let iter = 0; iter < 60; iter++) {
      let bewegt = false;
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[j].x - pos[i].x, dy = pos[j].y - pos[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minAbstand) {
            bewegt = true;
            const ux = dist < 0.01 ? 1 : dx / dist, uy = dist < 0.01 ? 0 : dy / dist;
            const verschieb = (minAbstand - dist) / 2;
            pos[i].x -= ux * verschieb; pos[i].y -= uy * verschieb;
            pos[j].x += ux * verschieb; pos[j].y += uy * verschieb;
          }
        }
      }
      if (!bewegt) break;
    }
    pos.forEach((p) => {
      p.x = Math.min(breite - rand, Math.max(rand, p.x));
      p.y = Math.min(hoehe - rand, Math.max(rand, p.y));
    });
    return pos;
  })();

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        background: C.white, borderRadius: RUND + 4, padding: 14,
        boxShadow: "0 10px 28px rgba(11,35,56,0.08)",
      }}>
        <div style={{ borderRadius: RUND, overflow: "hidden" }}>
          <svg viewBox={`0 0 ${breite} ${hoehe}`} width="100%" style={{ display: "block" }}
            role="img" aria-label={`Seekarte ${reg.name} mit euren Häfen`}>
            <rect x="0" y="0" width={breite} height={hoehe} fill={C.wasser} />

            {reg.land.map((ring, i) => (
              <path key={"l" + i} d={pfad(ring)} fill={C.land} stroke={C.landLinie} strokeWidth="1.4"
                strokeLinejoin="round" />
            ))}
            {(reg.wasser || []).map((ring, i) => (
              <path key={"w" + i} d={pfad(ring)} fill={C.wasser} stroke={C.landLinie} strokeWidth="1.4"
                strokeLinejoin="round" />
            ))}
            {reg.inseln.map((s, i) => {
              const [x, y] = px({ lon: s[0], lat: s[1] });
              return <circle key={"i" + i} cx={x} cy={y} r={s[2]} fill={C.land} stroke={C.landLinie}
                strokeWidth="1.2" />;
            })}

            {linie && punkte.length > 1 && (
              <path d={pinPositionen.map((p, i) =>
                (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)
              ).join(" ")}
                fill="none" stroke={C.messing} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            )}

            {punkte.map((p, i) => {
              const { x, y } = pinPositionen[i];
              const rechts = x < breite * 0.62;
              const r = 8;
              return (
                <g key={"p" + i}>
                  <circle cx={x} cy={y} r={r + 3} fill={C.white} />
                  <circle cx={x} cy={y} r={r} fill={C.tiefsee} />
                  {nummern && (
                    <text x={x} y={y + 4} textAnchor="middle" fontSize="10.5" fill={C.messingHell}
                      fontFamily={MONO}>{i + 1}</text>
                  )}
                  {punkte.length <= 12 && (
                    <text x={rechts ? x + r + 9 : x - r - 9} y={y + 6} textAnchor={rechts ? "start" : "end"}
                      fontSize="21" fontStyle="italic" fill={C.navy} fontFamily={SERIF} stroke={C.wasser}
                      strokeWidth="6" paintOrder="stroke">{p.name || "Hafen"}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        fontFamily: MONO, fontSize: 11.5, letterSpacing: 1.3, textTransform: "uppercase",
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
      <div style={{ fontFamily: SANS, fontSize: 13.5, color: hatKoordinaten ? C.green : C.muted, marginTop: 6 }}>
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

const STECKBRIEF_ICONS = { "Sprache": "🗣️", "Steckdose": "🔌", "Trinkgeld": "💵", "Beste Reisezeit": "🌤️" };
function Steckbrief({ info }) {
  const zeilen = [
    info.sprache && ["Sprache", info.sprache],
    info.steckdose && ["Steckdose", info.steckdose],
    info.trinkgeldTipp && ["Trinkgeld", info.trinkgeldTipp],
    info.klima && ["Beste Reisezeit", info.klima],
  ].filter(Boolean);
  if (!zeilen.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
      {zeilen.map(([label, text]) => (
        <div key={label} style={{ background: C.sky, borderRadius: RUND_KLEIN, padding: "13px 14px" }}>
          <div style={{ fontSize: 18, marginBottom: 7 }} aria-hidden="true">{STECKBRIEF_ICONS[label]}</div>
          <div style={{
            fontFamily: MONO, fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase",
            color: C.muted, marginBottom: 3,
          }}>{label}</div>
          <div style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.45, color: C.navy }}>{text}</div>
        </div>
      ))}
    </div>
  );
}

/* Der eigentliche Inhalt eines Hafenprofils — wird sowohl in der
   aufklappbaren Karte im Route-Tab als auch auf der vollen
   Hafen-Lexikon-Seite verwendet. */
/* Grobe, keyword-basierte Einordnung der Ausflugsideen in Kategorien —
   arbeitet auf dem bestehenden Freitext, ohne dass jeder einzelne Eintrag
   von Hand neu getaggt werden muss. */
const KATEGORIEN = [
  { id: "wasser", icon: "🤿", label: "Wasser & Schnorcheln",
    schluessel: ["schnorchel", "tauch", "riff", "kajak", "katamaran", "delfin", "wal-beobacht",
      "walbeobacht", "buckelwal", "whale", "wale ", "walen ", "jetski",
      "parasailing", "schwimm", "segel", "wasserpark", "boot", "fähre", "kanal", "paddle"] },
  { id: "action", icon: "🥾", label: "Action & Abenteuer",
    schluessel: ["zipline", "atv", "jeep", "dünenfahrt", "kletter", "wander", "cave", "höhle",
      "nationalpark", "regenwald", "gletscher", "vulkan", "affenwald", "wildlife", "zahnradbahn",
      "radtour", "safari"] },
  { id: "kultur", icon: "🏛️", label: "Kultur & Geschichte",
    schluessel: ["altstadt", "tempel", "ruine", "museum", "guide", "stadtführ", "kolonial",
      "kathedrale", "kirche", "oldtimer", "ausgrabung", "maya", "unesco", "weltkulturerbe", "walk",
      "stadttour", "sightseeing", "hafenrundfahrt", "skyline", "geschichte"] },
  { id: "genuss", icon: "🛍️", label: "Shopping & Genuss",
    schluessel: ["shopping", "einkauf", "souvenir", "food", "kochkurs", "restaurant", "rum", "wein",
      "kulinar", "zigarr", "markt", "café", "kaffee", "verkostung"] },
  { id: "ruhe", icon: "🌅", label: "Ruhe & Entspannung",
    schluessel: ["strand", "cocktail", "liege", "sonnenuntergang", "entspann", "promenade", "ruhig",
      "cabana", "spa", "lagune", "aussicht", "bucht", "blick", "pause"] },
];
function kategorisiere(text) {
  const t = (text || "").toLowerCase();
  for (const k of KATEGORIEN) {
    if (k.schluessel.some((s) => t.indexOf(s) >= 0)) return k.id;
  }
  return "ruhe";
}
function gruppiereNachKategorie(liste) {
  const gruppen = {};
  (liste || []).forEach((t) => {
    const k = kategorisiere(t);
    if (!gruppen[k]) gruppen[k] = [];
    gruppen[k].push(t);
  });
  return KATEGORIEN.map((k) => ({ ...k, items: gruppen[k.id] })).filter((g) => g.items && g.items.length > 0);
}
function IdeenGruppen({ liste }) {
  const gruppen = gruppiereNachKategorie(liste);
  return gruppen.map((g, gi) => (
    <div key={g.id} style={{ marginBottom: gi === gruppen.length - 1 ? 0 : 15 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <span style={{ fontSize: 13.5 }} aria-hidden="true">{g.icon}</span>
        <span style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: 1.3, textTransform: "uppercase", color: C.muted,
        }}>{g.label}</span>
      </div>
      {g.items.map((t, i) => (
        <div key={i} style={{ display: "flex", gap: 9, marginBottom: 8 }}>
          <span style={{ color: C.messing, flexShrink: 0 }} aria-hidden="true">·</span>
          <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.body }}>{t}</span>
        </div>
      ))}
    </div>
  ));
}

/* Rückblick fürs Fahrtenbuch: welche der Ausflugsideen eines Hafens
   habt ihr tatsächlich gemacht — als ankreuzbare Chips, nach Kategorie. */
function AusflugAbhaken({ info, ausgewaehlt, onToggle }) {
  const kombiniert = [...(info.zuFuss || []), ...(info.gefuehrt || [])];
  const gruppen = gruppiereNachKategorie(kombiniert);
  return (
    <div>
      {gruppen.map((g) => (
        <div key={g.id} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
            <span style={{ fontSize: 13.5 }} aria-hidden="true">{g.icon}</span>
            <span style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: C.muted,
            }}>{g.label}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {g.items.map((t, i) => {
              const an = ausgewaehlt.indexOf(t) >= 0;
              return (
                <button key={i} type="button" onClick={() => onToggle(t)} aria-pressed={an} style={{
                  fontFamily: SANS, fontSize: 13, cursor: "pointer", minHeight: 40, textAlign: "left",
                  padding: "9px 13px", borderRadius: 3,
                  border: `1px solid ${an ? C.tiefsee : C.line}`,
                  background: an ? C.tiefsee : C.white, color: an ? C.white : C.body,
                  display: "inline-flex", alignItems: "center", gap: 7, maxWidth: "100%",
                }}>{an && <Check size={12} color={C.messingHell} style={{ flexShrink: 0 }} />}<span>{t}</span></button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function HafenInfoInhalt({ info, interessen, notiz, onNotizChange }) {
  const passt = (interessen || []).filter((i) => (INTERESSEN_ZU_TYP[i] || []).indexOf(info.typ) >= 0);
  const passtLabels = passt.map((v) => (INTERESSEN_OPTIONEN.find((o) => o.v === v) || {}).l).filter(Boolean);
  const gygUrl = "https://www.getyourguide.com/s/?q=" + encodeURIComponent(info.name);
  const viatorUrl = "https://www.viator.com/searchResults/all?text=" + encodeURIComponent(info.name);
  return (
    <div>
      {passtLabels.length > 0 && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7, background: C.greenSoft,
          borderRadius: 999, padding: "7px 12px", marginBottom: 14,
        }}>
          <Check size={13} color={C.green} />
          <span style={{ fontFamily: SANS, fontSize: 13.5, color: C.green }}>
            Passt zu euren Interessen: {passtLabels.join(", ")}
          </span>
        </div>
      )}
      <P style={{ fontSize: 15, marginBottom: 16 }}>{info.kurz}</P>
      {info.tipp && (
        <div style={{
          background: C.sand, borderRadius: RUND_KLEIN, padding: "13px 14px", marginBottom: 18,
          borderLeft: `2px solid ${C.messing}`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.62, color: C.navy }}>{info.tipp}</div>
        </div>
      )}
      <Steckbrief info={info} />

      <div style={{
        background: C.white, borderRadius: RUND, padding: "18px 18px 14px", marginBottom: 14,
        boxShadow: "0 1px 2px rgba(11,35,56,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
          <span style={{ fontSize: 19 }} aria-hidden="true">🥾</span>
          <H3 style={{ margin: 0, fontSize: 18 }}>Auf eigene Faust</H3>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: C.muted, marginBottom: 13 }}>
          Ohne Guide, ohne Buchung — selbst machen
        </div>
        <IdeenGruppen liste={info.zuFuss} />
      </div>

      <div style={{
        background: C.greenSoft, borderRadius: RUND, padding: "18px 18px 20px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
          <span style={{ fontSize: 19 }} aria-hidden="true">🎟️</span>
          <H3 style={{ margin: 0, fontSize: 18 }}>Klassische Ausflüge</H3>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: C.muted, marginBottom: 13 }}>
          Typische Touren, die viele Reedereien für dieses Ziel anbieten
        </div>
        <IdeenGruppen liste={info.gefuehrt} />
        <div style={{
          fontFamily: SANS, fontSize: 13.5, color: C.muted, margin: "14px 0 10px",
        }}>Selbst buchen statt über die Reederei:</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href={gygUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <Btn small variant="outline">{info.name} auf GetYourGuide</Btn>
          </a>
          <a href={viatorUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <Btn small variant="outline">{info.name} auf Viator</Btn>
          </a>
        </div>
      </div>

      {onNotizChange && (
        <div>
          <div style={{
            fontFamily: MONO, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase",
            color: C.muted, marginBottom: 8,
          }}>Eure eigene Notiz zu {info.name}</div>
          <textarea value={notiz || ""} rows={2} onChange={(e) => onNotizChange(e.target.value)}
            placeholder="Bleibt dauerhaft im Hafen-Lexikon, egal welche Reise gerade läuft."
            style={{ ...eingabeStil, fontFamily: SANS, resize: "vertical", lineHeight: 1.6 }} />
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HÄFEN – das globale Hafen-Lexikon, das Hauptfeature der App
========================================================= */
const BELIEBTE_HAEFEN = [
  "Barcelona", "Civitavecchia (Rom)", "Venedig", "Santorini", "Dubrovnik", "Kopenhagen", "Bergen",
  "Reykjavík", "Cape Liberty (Bayonne)", "Miami", "Nassau", "Cozumel", "Castries (St. Lucia)",
  "Singapur", "Dubai", "Sydney",
];

function HafenSucheZeile({ eintrag, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
      textAlign: "left", background: C.white, border: "none", cursor: "pointer",
      padding: "15px 16px", minHeight: 46, borderRadius: RUND_KLEIN, marginBottom: 8,
      boxShadow: "0 1px 2px rgba(11,35,56,0.05)",
    }}>
      <span style={{ minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: 16.5, color: C.navy }}>{eintrag.n}</div>
        {eintrag.land && (
          <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, marginTop: 2 }}>{eintrag.land}</div>
        )}
      </span>
      <ChevronRight size={16} color={C.messing} style={{ flexShrink: 0 }} />
    </button>
  );
}

function HafenDetailSeite({ daten, setze, name, onZurueck }) {
  const info = hafenInfo(name);
  const inRoute = (daten.haefen || []).some((h) => normText(h.name) === normText(name));

  function zurRouteHinzufuegen() {
    if (inRoute) return;
    const eintrag = HAFENLISTE.find((h) => normText(h.n) === normText(name));
    setze("haefen", [...(daten.haefen || []), {
      id: "h" + Date.now(), name: eintrag ? eintrag.n : name,
      lon: eintrag ? eintrag.lon : null, lat: eintrag ? eintrag.lat : null,
      an: "08:00", ab: "18:00", puffer: "45", weg: "", note: "", sterne: 0,
      gebucht: false, treffpunkt: "", budgetGeplant: "", budgetIst: "",
    }]);
  }

  return (
    <div>
      <button type="button" onClick={onZurueck} style={{
        display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", border: "none",
        cursor: "pointer", fontFamily: MONO, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase",
        color: C.muted, padding: "6px 0", minHeight: 44, marginBottom: 8,
      }}><ChevronLeft size={14} color={C.messing} /> Alle Häfen</button>
      {!info ? (
        <Card><P style={{ margin: 0 }}>Diesen Hafen kennen wir noch nicht.</P></Card>
      ) : (
        <div>
          <Kicker>{info.land}{info.kontinent ? ` · ${info.kontinent}` : ""}</Kicker>
          <H2 style={{ marginBottom: 12 }}>{info.name}</H2>
          {info.waehrung && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7, background: C.sand,
              borderRadius: 999, padding: "7px 14px", marginBottom: 20,
            }}>
              <span aria-hidden="true">💱</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.navy }}>
                {info.waehrung[1]} · {info.waehrung[0]}
              </span>
            </div>
          )}
          <div>
            <Btn small variant={inRoute ? "outline" : "solid"} onClick={zurRouteHinzufuegen} style={{ marginBottom: 24 }}>
              {inRoute ? "✓ Schon in eurer Route" : "Zur Route hinzufügen"}
            </Btn>
          </div>
          <HafenInfoInhalt info={info} interessen={daten.setup.interessen}
            notiz={(daten.hafenNotizen || {})[normText(info.name)]}
            onNotizChange={(v) => setze("hafenNotizen", { ...(daten.hafenNotizen || {}), [normText(info.name)]: v })} />
        </div>
      )}
    </div>
  );
}

function ModulHaefen({ daten, setze, anfangsHafen, onAnfangVerbraucht }) {
  const [suche, setSuche] = useState("");
  const [gewaehlt, setGewaehlt] = useState(anfangsHafen || null);

  useEffect(() => {
    if (anfangsHafen) { setGewaehlt(anfangsHafen); onAnfangVerbraucht(); }
    // eslint-disable-next-line
  }, [anfangsHafen]);

  if (gewaehlt) {
    return <HafenDetailSeite daten={daten} setze={setze} name={gewaehlt} onZurueck={() => setGewaehlt(null)} />;
  }

  const ergebnisse = suche.trim().length >= 2 ? hafenVorschlaege(suche, 40) : [];
  const meineRoute = (daten.haefen || []).filter((h) => h.name);

  return (
    <div>
      <Kicker>Hafen-Lexikon</Kicker>
      <H2 style={{ marginBottom: 10 }}>Alle Häfen</H2>
      <P style={{ marginBottom: 20 }}>
        {HAFENLISTE.length} Häfen weltweit — sucht nach einem Namen und findet Währung, Landgänge auf
        eigene Faust und Ausflugsideen.
      </P>
      <input value={suche} onChange={(e) => setSuche(e.target.value)} type="search"
        placeholder="Hafen suchen, z. B. Hamburg"
        style={{ ...eingabeStil, marginBottom: 22, fontSize: 17, borderRadius: 999, padding: "14px 20px" }} />

      {suche.trim().length >= 2 ? (
        ergebnisse.length === 0 ? (
          <P style={{ color: C.muted }}>Keinen Hafen mit diesem Namen gefunden.</P>
        ) : ergebnisse.map((h) => (
          <HafenSucheZeile key={h.n} eintrag={h} onClick={() => setGewaehlt(h.n)} />
        ))
      ) : (
        <div>
          {meineRoute.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Kicker>Eure Route</Kicker>
              {meineRoute.map((h) => (
                <HafenSucheZeile key={h.id} eintrag={{ n: h.name, land: (hafenInfo(h.name) || {}).land }}
                  onClick={() => setGewaehlt(h.name)} />
              ))}
            </div>
          )}
          <Kicker>Beliebte Häfen</Kicker>
          {BELIEBTE_HAEFEN.map((n) => {
            const eintrag = HAFENLISTE.find((h) => h.n === n);
            if (!eintrag) return null;
            return <HafenSucheZeile key={n} eintrag={eintrag} onClick={() => setGewaehlt(n)} />;
          })}
        </div>
      )}
    </div>
  );
}

function TagebuchEingabe({ eintraege, onAdd, onLoeschen }) {
  const [datum, setDatum] = useState("");
  const [text, setText] = useState("");
  function add() {
    if (!text.trim()) return;
    onAdd({ id: "tb" + Date.now(), datum, text: text.trim() });
    setText("");
  }
  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flexShrink: 0, width: 150 }}>
          <Feld label="Datum" type="date" wert={datum} onChange={setDatum} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{
            display: "block", fontFamily: MONO, fontSize: 12, letterSpacing: 1.4,
            textTransform: "uppercase", color: C.muted, marginBottom: 7,
          }}>Was war heute?</label>
          <textarea value={text} rows={2} onChange={(e) => setText(e.target.value)}
            placeholder="Kurz festhalten, bevor es wieder verblasst."
            style={{ ...eingabeStil, fontFamily: SANS, resize: "vertical", lineHeight: 1.6 }} />
        </div>
      </div>
      <Btn small variant="outline" onClick={add} style={{ marginBottom: 20 }}><Plus size={14} /> Eintragen</Btn>
      {eintraege.slice().reverse().map((e) => {
        const d = alsDatum(e.datum);
        return (
          <div key={e.id} style={{
            display: "flex", gap: 10, padding: "12px 0", borderTop: `1px solid ${C.line}`,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {d && (
                <div style={{
                  fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase",
                  color: C.muted, marginBottom: 4,
                }}>{kurz(d)}</div>
              )}
              <div style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: C.navy }}>{e.text}</div>
            </div>
            <button type="button" onClick={() => onLoeschen(e.id)} aria-label="Eintrag löschen" style={{
              background: "transparent", border: "none", cursor: "pointer", color: C.muted,
              width: 40, height: 40, display: "grid", placeItems: "center", flexShrink: 0,
            }}><X size={15} /></button>
          </div>
        );
      })}
    </div>
  );
}

function Aufklappbar({ titel, children }) {
  const [auf, setAuf] = useState(false);
  return (
    <div style={{ marginTop: 10, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
      <button type="button" onClick={() => setAuf(!auf)} aria-expanded={auf} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
        textAlign: "left", background: "transparent", border: "none", cursor: "pointer",
        padding: "6px 0", minHeight: 44, gap: 10,
      }}>
        <span style={{
          fontFamily: MONO, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted,
        }}>{titel}</span>
        <ChevronRight size={14} color={C.messing}
          style={{ transform: auf ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
      </button>
      {auf && <div style={{ paddingTop: 6 }}>{children}</div>}
    </div>
  );
}

function ModulLandgang({ daten, setze, onZeigeHafen }) {
  const h = daten.haefen;
  const notizen = useMemo(() => notizArchiv(daten.archiv || []), [daten.archiv]);
  const reederei = reedereiFinden(daten.setup.reederei);
  /* Zählt nur echte Häfen durch, damit die Nummer auf der Karte (die
     Seetage ja gar nicht zeichnet) zur Nummer auf der Karte passt. */
  let laufendeHafenNr = 0;
  const hafenNummern = h.map((e) => (typeof e.lon === "number" ? ++laufendeHafenNr : null));
  function add() {
    setze("haefen", [...h, {
      id: "h" + Date.now(), typ: "hafen", name: "", lon: null, lat: null, an: "08:00", ab: "18:00",
      puffer: String(reederei ? reederei.puffer : 45), weg: "", note: "", sterne: 0,
      gebucht: false, treffpunkt: "", budgetGeplant: "", budgetIst: "",
    }]);
  }
  function addSeetag() {
    setze("haefen", [...h, { id: "s" + Date.now(), typ: "see", note: "" }]);
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
      <Kicker>Eure Route</Kicker>
      <H2 style={{ marginBottom: 14 }}>Route & Zeitplan</H2>
      <P style={{ marginBottom: 20 }}>
        Reihenfolge, Uhrzeiten und wie viel Zeit ihr an Land wirklich habt. Alles zum Hafen selbst — Ausflüge,
        Währung, Ausflugsideen — steht drüben im Hafen-Lexikon.
      </P>

      <Karte haefen={h} route={daten.setup.route} />

      <EinreiseHinweisKarte laender={laenderMitEinreiseHinweis(h)} />

      {h.length > 1 && (
        <Card tone="white" style={{ padding: "16px 16px 8px" }}>
          <div style={{
            fontFamily: MONO, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase",
            color: C.muted, marginBottom: 10,
          }}>Übersicht — auf einen Blick</div>
          {h.map((x, i) => {
            const istSee = x.typ === "see";
            const rasterAmp = !istSee && x.weg ? AMPEL[x.weg] : null;
            return (
              <div key={x.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 0",
                borderBottom: i < h.length - 1 ? `1px solid ${C.line}` : "none",
              }}>
                <span aria-hidden="true" style={{
                  width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                  background: istSee ? C.blue : (rasterAmp ? rasterAmp.farbe : C.line),
                }} />
                <span style={{
                  fontFamily: SANS, fontSize: 15, color: C.navy, flex: 1, minWidth: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{istSee ? "🌊 Seetag" : (x.name || `Hafen ${i + 1}`)}</span>
                {!istSee && (
                  <span style={{
                    fontFamily: MONO, fontSize: 11.5, letterSpacing: 0.8, textTransform: "uppercase",
                    color: x.gebucht ? C.green : C.muted, whiteSpace: "nowrap",
                  }}>{x.gebucht ? "gebucht" : rasterAmp ? "offen" : "noch keine Wahl"}</span>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {h.length === 0 && (
        <Card>
          <P style={{ margin: 0, fontSize: 14.5 }}>
            Legt für jeden Hafen einen Eintrag an, tragt Ankunft und Abfahrt ein, und wir zeichnen euch die Route auf die Karte und rechnen aus, wie viel Zeit ihr wirklich habt statt der Zeit, die auf dem Papier steht.
          </P>
        </Card>
      )}

      <Card tone="white">
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
          <span style={{ fontSize: 19 }} aria-hidden="true">🌊</span>
          <H3 style={{ margin: 0 }}>Ideen für Seetage</H3>
        </div>
        <P style={{ fontSize: 15, marginBottom: 12 }}>Nicht jeder Tag hat einen Hafen — dafür ist der hier.</P>
        {SEETAG_IDEEN.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 9, marginBottom: 9 }}>
            <span style={{ color: C.messing, flexShrink: 0 }} aria-hidden="true">·</span>
            <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.body }}>{t}</span>
          </div>
        ))}
      </Card>

      {h.map((x, i) => {
        if (x.typ === "see") {
          return (
            <Card key={x.id} tone="white">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{
                  width: 30, height: 30, borderRadius: "50%", background: C.skySoft, color: C.navy,
                  display: "grid", placeItems: "center", fontSize: 15, flexShrink: 0,
                }} aria-hidden="true">🌊</span>
                <div style={{ flex: 1, fontFamily: SERIF, fontSize: 19, color: C.navy }}>Seetag</div>
                <button type="button" onClick={() => schieben(i, -1)} aria-label="nach oben" style={{
                  background: "transparent", border: `1px solid ${C.line}`, borderRadius: 3,
                  cursor: "pointer", color: C.body, width: 44, height: 44, fontSize: 15,
                }}>↑</button>
                <button type="button" onClick={() => schieben(i, 1)} aria-label="nach unten" style={{
                  background: "transparent", border: `1px solid ${C.line}`, borderRadius: 3,
                  cursor: "pointer", color: C.body, width: 44, height: 44, fontSize: 15,
                }}>↓</button>
                <button type="button" onClick={() => setze("haefen", h.filter((y) => y.id !== x.id))}
                  aria-label="Seetag entfernen" style={{
                    background: "transparent", border: "none", cursor: "pointer", color: C.muted,
                    width: 44, height: 44, display: "grid", placeItems: "center",
                  }}><X size={17} /></button>
              </div>
              <textarea value={x.note || ""} rows={2}
                onChange={(e) => upd(x.id, { note: e.target.value })}
                placeholder="Was ist an dem Tag geplant? Z. B. Galaabend, Vortrag über den nächsten Hafen …"
                style={{ ...eingabeStil, fontFamily: SANS, resize: "vertical", lineHeight: 1.6 }} />
            </Card>
          );
        }
        const an = minuten(x.an);
        const ab = minuten(x.ab);
        const puf = parseInt(x.puffer || "45", 10) || 45;
        const bord = ab !== null ? ab - puf : null;
        const netto = an !== null && bord !== null ? bord - an - 60 : null;
        const amp = x.weg ? AMPEL[x.weg] : null;
        let vor = null;
        for (let j = i - 1; j >= 0; j--) { if (typeof h[j].lon === "number") { vor = h[j]; break; } }
        const strecke = vor && typeof x.lon === "number" ? seemeilen(vor, x) : null;
        const zeitDiff = vor ? zeitzoneVersatz(vor, x) : null;
        return (
          <Card key={x.id} tone="white">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{
                width: 30, height: 30, borderRadius: "50%", background: C.navy, color: C.white,
                display: "grid", placeItems: "center", fontFamily: SANS, fontSize: 15, flexShrink: 0,
              }}>{hafenNummern[i]}</span>
              <div style={{ flex: 1, fontFamily: SANS, fontSize: 13, color: C.muted, minWidth: 0 }}>
                {strecke ? `${strecke.toLocaleString("de-DE")} sm ab ${vor.name || "vorherigem Hafen"}` : "Reihenfolge der Route"}
                {zeitDiff !== null && zeitDiff !== 0 && (
                  <div style={{ color: C.warn, marginTop: 2 }}>
                    Vermutlich {zeitDiff > 0 ? "+" : ""}{zeitDiff} Std. Zeitverschiebung — an Bord genau ansagen lassen
                  </div>
                )}
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

            {typeof x.lon === "number" && (
              <Btn small variant="outline" onClick={() => onZeigeHafen(x.name)} style={{ marginBottom: 18 }}>
                Hafen-Infos & Ausflüge ansehen
              </Btn>
            )}

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
                    <span style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted }}>
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
              <div style={{ fontFamily: SANS, fontSize: 15, color: C.body, marginBottom: 6 }}>
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
              <div style={{ background: amp.bg, borderRadius: 3, padding: "16px", marginBottom: 18 }}>
                <div style={{ fontFamily: SANS, fontSize: 15, color: amp.farbe, marginBottom: 7 }}>{amp.titel}</div>
                <div style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.62, color: C.navy }}>{amp.text}</div>
              </div>
            )}

            <Aufklappbar titel="Buchung, Budget & Notiz">
              <Schalter label="Ausflug ist gebucht" an={!!x.gebucht} onChange={(v) => upd(x.id, { gebucht: v })} />
              {x.gebucht && (
                <Feld label="Treffpunkt" wert={x.treffpunkt || ""} onChange={(v) => upd(x.id, { treffpunkt: v })}
                  placeholder="z. B. Pier 3, 08:45 Uhr" />
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Feld label="Budget geplant" type="number" wert={x.budgetGeplant || ""}
                    onChange={(v) => upd(x.id, { budgetGeplant: v })} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Feld label="Tatsächlich ausgegeben" type="number" wert={x.budgetIst || ""}
                    onChange={(v) => upd(x.id, { budgetIst: v })} />
                </div>
              </div>
              <div style={{
                fontFamily: MONO, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase",
                color: C.muted, marginBottom: 8,
              }}>Notiz fürs Fahrtenbuch</div>
              <textarea value={x.note || ""} rows={2}
                onChange={(e) => upd(x.id, { note: e.target.value })}
                placeholder="Was solltet ihr beim nächsten Mal anders machen?"
                style={{ ...eingabeStil, fontFamily: SANS, resize: "vertical", lineHeight: 1.6 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <span style={{
                  fontFamily: MONO, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted,
                }}>Hafen</span>
                <Sterne wert={x.sterne} onChange={(v) => upd(x.id, { sterne: v })} />
              </div>
            </Aufklappbar>
          </Card>
        );
      })}

      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Btn full variant="outline" onClick={add}>
            <Plus size={16} /> Hafen hinzufügen
          </Btn>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Btn full variant="outline" onClick={addSeetag}>
            🌊 Seetag hinzufügen
          </Btn>
        </div>
      </div>
      <P style={{ fontSize: 13.5, color: C.muted, marginTop: 0, marginBottom: 26 }}>
        Mehrere Seetage am Stück? Einfach mehrfach auf „Seetag hinzufügen" tippen und mit den Pfeilen
        an die richtige Stelle in der Route schieben.
      </P>

      <Card tone="sand">
        <H3>Unsere Hafentag-Regeln</H3>
        <P style={{ marginBottom: 0, fontSize: 14.5 }}>
          Plant eine Sache pro Hafen richtig statt drei halb, seid mindestens eine Stunde vor der Bordzeit zurück und nehmt immer Wasser, einen Snack und die Kopie der Bordkarte mit, weil genau das fehlt, wenn es unangenehm wird.
        </P>
      </Card>

      <Card tone="white">
        <H3>Euer Tagebuch</H3>
        <P style={{ fontSize: 15, marginBottom: 16 }}>
          Kurze Notizen zu jedem Tag an Bord, unabhängig von den Häfen — wandert automatisch mit ins Fahrtenbuch.
        </P>
        <TagebuchEingabe eintraege={daten.tagebuch || []}
          onAdd={(e) => setze("tagebuch", [...(daten.tagebuch || []), e])}
          onLoeschen={(id) => setze("tagebuch", (daten.tagebuch || []).filter((e) => e.id !== id))} />
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
          {b.hinweis && <P style={{ fontSize: 15, marginBottom: 8 }}>{b.hinweis}</P>}
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
            <div style={{ fontFamily: SANS, fontSize: 16.5, color: C.navy, marginBottom: 7 }}>{n.titel}</div>
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

/* Abzeichen fürs Fahrtenbuch — errechnet aus den besuchten Häfen. */
function abzeichenBerechnen(archiv) {
  const kontinente = new Set();
  const gesehen = new Set();
  let karibik = 0, fjord = 0, ruinen = 0, privatinsel = 0, asien = 0;
  archiv.forEach((r) => (r.haefen || []).forEach((h) => {
    if (!h.name) return;
    const key = normText(h.name);
    if (gesehen.has(key)) return;
    gesehen.add(key);
    const eintrag = HAFENLISTE.find((x) => normText(x.n) === key);
    if (!eintrag) return;
    const k = kontinentFuer(eintrag.land);
    if (k) kontinente.add(k);
    if (k === "Mittelamerika & Karibik") karibik++;
    if (eintrag.typ === "FJ") fjord++;
    if (eintrag.typ === "RU") ruinen++;
    if (eintrag.typ === "PI") privatinsel++;
    if (k === "Asien") asien++;
  }));
  const abzeichen = [];
  if (karibik >= 5) abzeichen.push({ t: "Karibik-Kennerin", d: `${karibik} karibische Häfen besucht` });
  if (fjord >= 3) abzeichen.push({ t: "Fjord-Fan", d: `${fjord} Fjord-Häfen besucht` });
  if (ruinen >= 3) abzeichen.push({ t: "Geschichtsfan", d: `${ruinen} antike Stätten besucht` });
  if (privatinsel >= 3) abzeichen.push({ t: "Insel-Sammlerin", d: `${privatinsel} Privatinseln besucht` });
  if (asien >= 3) abzeichen.push({ t: "Asien-Entdeckerin", d: `${asien} asiatische Häfen besucht` });
  if (kontinente.size >= 3) abzeichen.push({ t: "Weltenbummlerin", d: `${kontinente.size} Kontinente/Regionen bereist` });
  if (archiv.length >= 5) abzeichen.push({ t: "Vielfahrerin", d: `${archiv.length} Kreuzfahrten im Logbuch` });
  return abzeichen;
}

function reedereiRanking(archiv) {
  const m = {};
  archiv.forEach((r) => {
    if (!r.reederei || !r.bewertung) return;
    const werte = [r.bewertung.essen, r.bewertung.service, r.bewertung.kabine, r.bewertung.preis].filter((x) => x > 0);
    if (!werte.length) return;
    const schnitt = werte.reduce((a, x) => a + x, 0) / werte.length;
    if (!m[r.reederei]) m[r.reederei] = { summe: 0, n: 0 };
    m[r.reederei].summe += schnitt;
    m[r.reederei].n++;
  });
  return Object.keys(m)
    .map((k) => ({ reederei: k, schnitt: m[k].summe / m[k].n, mal: m[k].n }))
    .sort((a, b) => b.schnitt - a.schnitt);
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

function WunschlisteEingabe({ onAdd }) {
  const [text, setText] = useState("");
  const [offen, setOffen] = useState(false);
  const vorschlaege = offen ? hafenVorschlaege(text) : [];
  const waehle = (name) => { onAdd(name); setText(""); setOffen(false); };
  return (
    <div style={{ marginBottom: 16, position: "relative" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={text}
          onChange={(e) => { setText(e.target.value); setOffen(true); }}
          onFocus={() => setOffen(true)}
          onBlur={() => setTimeout(() => setOffen(false), 180)}
          onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) waehle(text.trim()); }}
          placeholder="Traumhafen eintippen, z. B. Bora Bora"
          style={{ ...eingabeStil, flex: 1, minWidth: 0 }} />
        <Btn small onClick={() => text.trim() && waehle(text.trim())} style={{ flexShrink: 0 }}><Plus size={15} /></Btn>
      </div>
      {vorschlaege.length > 0 && (
        <div style={{
          position: "absolute", left: 0, right: 0, top: 50, zIndex: 20,
          background: C.white, border: `1px solid ${C.line}`, borderRadius: 3,
          overflow: "hidden", boxShadow: "0 8px 24px rgba(18,57,92,0.14)",
        }}>
          {vorschlaege.map((v) => (
            <button key={v.n} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => waehle(v.n)}
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

function ModulFahrtenbuch({ daten, setze }) {
  const archiv = daten.archiv || [];
  const st = archivStatistik(archiv);
  const haefen = alleHaefen(archiv);
  const [offen, setOffen] = useState(null);
  const abzeichen = useMemo(() => abzeichenBerechnen(archiv), [archiv]);
  const ranking = useMemo(() => reedereiRanking(archiv), [archiv]);
  const besucht = useMemo(() => {
    const m = new Set();
    archiv.forEach((r) => (r.haefen || []).forEach((h) => h.name && m.add(normText(h.name))));
    return m;
  }, [archiv]);
  const wunschliste = daten.wunschliste || [];

  return (
    <div>
      <Kicker>Modul 8</Kicker>
      <H2>Das Fahrtenbuch</H2>
      <Lead>
        <span>Jede abgeschlossene Reise bleibt hier liegen, mit Häfen, Notizen und Seemeilen.</span>
        <span>Beim nächsten Mal wisst ihr wieder, was ihr euch damals notiert habt — und das ist mehr wert als jedes Reiseportal.</span>
      </Lead>

      {archiv.length > 0 && (
        <Btn small variant="outline" onClick={() => window.print()} style={{ marginBottom: 20 }}>
          Als PDF sichern oder drucken
        </Btn>
      )}

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

          {abzeichen.length > 0 && (
            <Card tone="white">
              <Kicker>Eure Abzeichen</Kicker>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {abzeichen.map((a) => (
                  <div key={a.t} title={a.d} style={{
                    background: C.sand, borderRadius: 3, padding: "10px 14px",
                    border: `1px solid ${C.messingLeise}`,
                  }}>
                    <div style={{ fontFamily: SERIF, fontSize: 15, color: C.navy }}>✦ {a.t}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: C.muted, marginTop: 3 }}>{a.d}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

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
                    {(r.haefen || []).length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{
                          fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                          color: C.muted, marginBottom: 10,
                        }}>Was habt ihr an den einzelnen Tagen unternommen?</div>
                        {(r.haefen || []).map((h, i) => {
                          const istSee = h.typ === "see";
                          const ausflug = h.ausflug || [];
                          const bordTag = h.bordAktivitaeten || [];
                          const info = !istSee && h.name ? hafenInfo(h.name) : null;
                          const setzeTag = (patch) => setze("archiv", archiv.map((x) => {
                            if (x.id !== r.id) return x;
                            return {
                              ...x,
                              haefen: (x.haefen || []).map((y, j) => (j === i ? { ...y, ...patch } : y)),
                            };
                          }));
                          return (
                            <div key={i} style={{ marginBottom: 14 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                                <span style={{ fontFamily: SANS, fontSize: 15, color: C.navy }}>
                                  {istSee ? "🌊 Seetag" : (h.name || `Tag ${i + 1}`)}
                                </span>
                                {!istSee && <Sterne wert={h.sterne} />}
                              </div>
                              {h.note && (
                                <P style={{ fontSize: 15, marginBottom: 6 }}>{h.note}</P>
                              )}
                              {!istSee && info && (
                                <Aufklappbar titel={
                                  ausflug.length > 0
                                    ? `${ausflug.length} Ausflüge ausgewählt — ansehen oder ändern`
                                    : "Was habt ihr hier unternommen? Ankreuzen"
                                }>
                                  <AusflugAbhaken info={info} ausgewaehlt={ausflug} onToggle={(text) => {
                                    const neu = ausflug.indexOf(text) >= 0
                                      ? ausflug.filter((t) => t !== text) : [...ausflug, text];
                                    setzeTag({ ausflug: neu });
                                  }} />
                                </Aufklappbar>
                              )}
                              <Aufklappbar titel={
                                bordTag.length > 0
                                  ? `${bordTag.length} Bordaktivitäten an diesem Tag`
                                  : "Was habt ihr an diesem Tag an Bord unternommen?"
                              }>
                                <WahlMehr label={null} werte={bordTag}
                                  onChange={(neu) => setzeTag({ bordAktivitaeten: neu })}
                                  optionen={BORD_AKTIVITAETEN} />
                              </Aufklappbar>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {r.sm > 0 && (
                      <div style={{
                        fontFamily: MONO, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase",
                        color: C.muted, marginTop: 12,
                      }}>{r.sm.toLocaleString("de-DE")} Seemeilen</div>
                    )}
                    {(r.tagebuch || []).length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{
                          fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                          color: C.muted, marginBottom: 8,
                        }}>Euer Tagebuch</div>
                        {r.tagebuch.slice().reverse().map((e) => (
                          <P key={e.id} style={{ fontSize: 15, marginBottom: 8 }}>
                            {e.datum && <strong style={{ color: C.navy }}>{e.datum}: </strong>}{e.text}
                          </P>
                        ))}
                      </div>
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

      {ranking.length > 0 && (
        <Card tone="green">
          <Kicker color={C.green}>Euer Reederei-Ranking</Kicker>
          {ranking.map((r, i) => (
            <div key={r.reederei} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 0", borderBottom: i < ranking.length - 1 ? `1px solid ${C.line}` : "none",
            }}>
              <span style={{ fontFamily: SANS, fontSize: 14.5, color: C.navy }}>{i + 1}. {r.reederei}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>{r.schnitt.toFixed(1)} ★ ({r.mal}×)</span>
            </div>
          ))}
        </Card>
      )}

      {st.reedereien.length > 1 && (
        <Card tone="green">
          <P style={{ margin: 0, fontSize: 14.5 }}>
            Ihr wart bei {st.reedereien.length} Reedereien an Bord: {st.reedereien.join(", ")}. Genau
            solche Vergleiche sind das, wonach euch Freunde fragen, bevor sie selbst buchen.
          </P>
        </Card>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 16px" }}>
        <span aria-hidden="true" style={{ width: 20, height: 1, background: C.messing }} />
        <span style={{
          fontFamily: MONO, fontSize: 11.5, letterSpacing: 2.4, textTransform: "uppercase", color: C.muted,
        }}>Eure Traumhäfen</span>
        <span aria-hidden="true" style={{ flex: 1, height: 1, background: C.line }} />
      </div>
      <Card tone="white">
        <P style={{ fontSize: 15, marginBottom: 16 }}>
          Eine Wunschliste, unabhängig von der aktuellen Route — für alles, wo ihr irgendwann mal hinwollt.
        </P>
        <WunschlisteEingabe onAdd={(name) => {
          if (wunschliste.some((w) => normText(w) === normText(name))) return;
          setze("wunschliste", [...wunschliste, name]);
        }} />
        {wunschliste.length === 0 ? (
          <P style={{ fontSize: 13.5, color: C.muted, marginBottom: 0 }}>Noch keine Träume eingetragen.</P>
        ) : wunschliste.map((name, i) => {
          const istBesucht = besucht.has(normText(name));
          return (
            <div key={name + i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
              borderBottom: i < wunschliste.length - 1 ? `1px solid ${C.line}` : "none",
            }}>
              {istBesucht && <Check size={14} color={C.green} />}
              <span style={{
                flex: 1, minWidth: 0, fontFamily: SANS, fontSize: 14.5,
                color: istBesucht ? C.muted : C.navy,
                textDecoration: istBesucht ? "line-through" : "none",
              }}>{name}</span>
              <button type="button" onClick={() => setze("wunschliste", wunschliste.filter((_, j) => j !== i))}
                aria-label="Entfernen" style={{
                  background: "transparent", border: "none", cursor: "pointer", color: C.muted,
                  width: 40, height: 40, display: "grid", placeItems: "center",
                }}><X size={15} /></button>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* =========================================================
   REISE-SETUP
========================================================= */
function ReedereiInfo({ reederei }) {
  const r = reedereiFinden(reederei);
  if (!r) return null;
  return (
    <div style={{
      background: C.sand, borderRadius: 3, padding: "14px 15px", margin: "0 0 20px",
      borderLeft: `2px solid ${C.messing}`,
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
        color: C.muted, marginBottom: 8,
      }}>Was wir über {r.n} wissen</div>
      <P style={{ fontSize: 15, marginBottom: 0, lineHeight: 1.6 }}>
        Bordzeit meist {r.puffer} Minuten vor Abfahrt fällig.{" "}
        {r.trinkgeldAutomatik
          ? `Trinkgeld läuft automatisch übers Bordkonto, Richtwert rund ${r.trinkgeldProNacht} € pro Person und Nacht.`
          : "Trinkgeld läuft hier nicht automatisch übers Bordkonto."}
        {" "}{r.kidsClubAb ? `Kids Club meist ab ${r.kidsClubAb} Jahren.` : "Kein klassischer Kids Club."}
        {" "}Richtwerte — die genauen, aktuellen Zahlen findet ihr in euren Buchungsunterlagen.
      </P>
    </div>
  );
}

function Setup({ daten, setze, gehe }) {
  const s = daten.setup;
  const set = (k, v) => setze("setup", { ...s, [k]: v });
  const reedereiEintrag = reedereiFinden(s.reederei);
  const schiffOptionen = reedereiEintrag ? reedereiEintrag.schiffe : [];

  return (
    <div>
      <Kicker>Reise-Setup</Kicker>
      <H2>Eure Reise</H2>
      <P style={{ marginTop: 14 }}>
        Reederei, Schiff und Termin braucht Klarschiff, um für euch zu rechnen: Der Countdown auf dem
        Startbildschirm zählt zu eurem Abfahrtstermin runter, das Fahrtgebiet bestimmt den Kartenausschnitt
        und die Packliste, und Personenzahl sowie Nächte fließen in den Bordkonto-Rechner ein.
      </P>

      <Card tone="white">
        <Feld label="Dein Name" wert={daten.nutzerName || ""} onChange={(v) => setze("nutzerName", v)}
          placeholder="Dein Vorname" hinweis="So begrüßen wir euch beim nächsten Öffnen der App." />
      </Card>

      <Card tone="white">
        <Auswahl label="Reederei" wert={s.reederei}
          onChange={(v) => setze("setup", { ...s, reederei: v, schiff: "" })}
          optionen={REEDEREIEN.map((r) => r.n)} platzhalter="Reederei wählen" />
        <ReedereiInfo reederei={s.reederei} />
        <Auswahl label="Schiff" wert={s.schiff} onChange={(v) => set("schiff", v)}
          optionen={schiffOptionen} deaktiviert={!s.reederei}
          platzhalter={s.reederei ? "Schiff wählen" : "Zuerst Reederei wählen"} />

        <Feld label="Abfahrtsdatum" type="date" wert={s.abfahrt} onChange={(v) => set("abfahrt", v)} />
        <Feld label="Abfahrtszeit (optional)" type="time" wert={s.abfahrtZeit} onChange={(v) => set("abfahrtZeit", v)}
          hinweis="Nur nötig, wenn der Countdown neben den Tagen auch die Stunden zeigen soll." />
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}><Feld label="Nächte" type="number" wert={s.naechte} onChange={(v) => set("naechte", v)} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><Feld label="Personen" type="number" wert={s.personen} onChange={(v) => set("personen", v)} /></div>
        </div>
        <Feld label="Reisepreis gesamt" type="number" wert={s.reisepreis} onChange={(v) => set("reisepreis", v)}
          hinweis="Freiwillig — der Bordkonto-Rechner zeigt euch damit, wie viel Prozent eure Extras an Bord noch zum Reisepreis dazukommen." />

        <Wahl label="Fahrtgebiet" wert={s.route} onChange={(v) => set("route", v)}
          optionen={[
            { v: "karibik", l: "Karibik / Kanaren" }, { v: "mittel", l: "Mittelmeer" },
            { v: "nord", l: "Nordland / Ostsee" }, { v: "trans", l: "Transatlantik" }, { v: "andere", l: "Andere" },
          ]}
          hinweis="Bestimmt den Kartenausschnitt in Route & Postkarte und die Packlisten-Empfehlungen." />
        <Wahl label="Saison" wert={s.saison} onChange={(v) => set("saison", v)}
          optionen={[{ v: "sommer", l: "Sommer" }, { v: "neben", l: "Nebensaison" }, { v: "winter", l: "Winter" }]} />
        <Wahl label="Anreise" wert={s.anreise} onChange={(v) => set("anreise", v)}
          optionen={[{ v: "flug", l: "Fly & Cruise" }, { v: "boden", l: "Auto oder Bahn" }]} />
        <WahlMehr label="Worauf freut ihr euch am meisten?" werte={s.interessen} onChange={(v) => set("interessen", v)}
          optionen={INTERESSEN_OPTIONEN}
          hinweis="Häfen, die dazu passen, sind im Hafen-Lexikon extra markiert." />

        <Schalter label="Ein Kind unter drei Jahren ist dabei" an={s.kind} onChange={(v) => set("kind", v)} />
        <Schalter label="Es gibt Gala-Abende" an={s.gala} onChange={(v) => set("gala", v)} />

        <Btn full onClick={() => gehe("start")} style={{ marginTop: 10 }}>
          <Check size={16} /> Speichern
        </Btn>
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

function GeplantKarte({ eintrag, onAktivieren, onLoeschen }) {
  const s = eintrag.setup;
  const ab = alsDatum(s.abfahrt);
  const tage = ab ? tageBis(ab) : null;
  const zeile = [s.reederei, s.schiff].filter(Boolean).join(" · ");
  return (
    <Card tone="white" style={{ padding: "16px 18px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ fontFamily: SERIF, fontSize: 19, color: C.navy }}>{zeile || "Reise ohne Namen"}</div>
        {tage !== null && tage > 0 && (
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.blue, whiteSpace: "nowrap" }}>{tage} Tage</div>
        )}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, marginBottom: 14 }}>
        {ab ? kurz(ab) : "kein Datum"} · {(eintrag.haefen || []).length} {(eintrag.haefen || []).length === 1 ? "Hafen" : "Häfen"} geplant
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn small onClick={onAktivieren} style={{ flex: 1 }}>Aktivieren</Btn>
        <Btn small variant="quiet" onClick={onLoeschen}>Löschen</Btn>
      </div>
    </Card>
  );
}

function StatChip({ Icon, wert, label }) {
  return (
    <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
      <Icon size={16} color={C.messingHell} style={{ display: "block", margin: "0 auto 6px" }} />
      <div style={{
        fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.white,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{wert}</div>
      <div style={{
        fontFamily: MONO, fontSize: 8.5, letterSpacing: 1, textTransform: "uppercase", color: "#8FA9B8", marginTop: 2,
      }}>{label}</div>
    </div>
  );
}

function KachelLink({ Icon, titel, unter, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, minWidth: 0, textAlign: "left", cursor: "pointer",
      background: C.white, border: "none", borderRadius: RUND, padding: "20px 16px",
      boxShadow: "0 1px 2px rgba(11,35,56,0.05)",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <span style={{
        width: 42, height: 42, borderRadius: "50%",
        background: "linear-gradient(135deg, #F3E7C9 0%, #E2C68F 100%)",
        display: "grid", placeItems: "center", flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(200,160,85,0.35)",
      }}>
        <Icon size={19} color={C.tiefsee} />
      </span>
      <div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, color: C.navy }}>{titel}</div>
        <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, marginTop: 3 }}>{unter}</div>
      </div>
    </button>
  );
}

function Start({ daten, gehe, fortschritt, onAbschliessen, onTeilen, onParken, onNeu, onAktivieren, onGeplantLoeschen }) {
  const s = daten.setup;
  const bilanz = archivStatistik(daten.archiv || []);
  const ab = alsDatum(s.abfahrt);
  const hafenZahl = daten.haefen.filter((x) => x.typ !== "see").length;
  const seetagZahl = daten.haefen.filter((x) => x.typ === "see").length;
  const routeZeile = [
    hafenZahl > 0 ? `${hafenZahl} ${hafenZahl === 1 ? "Hafen" : "Häfen"}` : null,
    seetagZahl > 0 ? `${seetagZahl} ${seetagZahl === 1 ? "Seetag" : "Seetage"}` : null,
  ].filter(Boolean).join(" · ") + (hafenZahl > 0 || seetagZahl > 0 ? " geplant" : "");

  let wert = 0, gesamt = 0;
  Object.keys(fortschritt).forEach((k) => { wert += fortschritt[k].wert; gesamt += fortschritt[k].gesamt; });
  const prozent = gesamt ? (wert / gesamt) * 100 : 0;

  const cdWerte = countdownWerte(s);
  const countdownTitel = cdWerte ? "Euer Urlaubs-Countdown" : "Euer Vorbereitungsstand";
  const countdownAnzeige = cdWerte || [{ zahl: `${Math.round(prozent)}%`, label: "Vorbereitet" }];

  const schiffszeile = [s.reederei, s.schiff].filter(Boolean).join(" · ");
  const routePunkte = daten.haefen.filter((x) => typeof x.lon === "number");
  const routeSm = routePunkte.reduce((a, p, i) => (i ? a + seemeilen(routePunkte[i - 1], p) : 0), 0);

  return (
    <div>
      <div style={{
        background: `radial-gradient(ellipse 150% 55% at 50% 40%, rgba(200,160,85,0.28) 0%, ${C.nachtblau} 48%, ${C.tiefsee} 85%)`,
        margin: "-22px -20px 24px", padding: "34px 20px 30px",
      }}>
        <div style={{ textAlign: "center" }}>
          {daten.nutzerName && (
            <div style={{
              fontFamily: MONO, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase",
              color: C.messingHell, marginBottom: 10,
            }}>Hallo, {daten.nutzerName} 👋</div>
          )}
          <h1 style={{
            fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(38px, 11vw, 54px)",
            lineHeight: 0.96, letterSpacing: "-0.03em", color: C.white, margin: "0 0 8px",
          }}>Klarschiff</h1>

          <p style={{
            fontFamily: SANS, fontSize: 14.5, lineHeight: 1.55, color: "#A9C0CE",
            margin: "0 auto 26px", maxWidth: 300,
          }}>
            Landausflüge, Route und Countdown für eure nächste Kreuzfahrt
          </p>

          <div aria-hidden="true" style={{ position: "relative", margin: "0 0 22px" }}>
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(228,202,149,0.5), transparent)" }} />
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: 38, height: 38, borderRadius: "50%", background: C.tiefsee,
              border: `1px solid ${C.messingLeise}`, display: "grid", placeItems: "center",
            }}>
              <Compass size={17} color={C.messingHell} />
            </div>
          </div>

          <UrlaubsCountdown titel={countdownTitel} werte={countdownAnzeige} />

          {(schiffszeile || ab) && (
            <div style={{
              background: "rgba(255,255,255,0.06)", border: `1px solid ${C.messingLeise}`,
              borderRadius: RUND, padding: "18px 18px 16px", marginTop: 18, textAlign: "left",
            }}>
              {schiffszeile && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ab ? 14 : 0 }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: "50%", background: "rgba(228,202,149,0.14)",
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}><Ship size={16} color={C.messingHell} /></span>
                  <div style={{ minWidth: 0 }}>
                    {s.reederei && (
                      <div style={{
                        fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: "#8FA9B8",
                      }}>{s.reederei}</div>
                    )}
                    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, color: C.white, marginTop: 2 }}>
                      {s.schiff || "Euer Schiff"}
                    </div>
                  </div>
                </div>
              )}
              {ab && (
                <div style={{
                  display: "flex", gap: 20, paddingTop: schiffszeile ? 14 : 0,
                  borderTop: schiffszeile ? `1px solid rgba(228,202,149,0.15)` : "none",
                }}>
                  <div>
                    <div style={{
                      fontFamily: MONO, fontSize: 9.5, letterSpacing: 1.2, textTransform: "uppercase",
                      color: "#8FA9B8", marginBottom: 3,
                    }}>Auslaufen</div>
                    <div style={{ fontFamily: SANS, fontSize: 15, color: C.white }}>{kurz(ab)}</div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: MONO, fontSize: 9.5, letterSpacing: 1.2, textTransform: "uppercase",
                      color: "#8FA9B8", marginBottom: 3,
                    }}>Nächte</div>
                    <div style={{ fontFamily: SANS, fontSize: 15, color: C.white }}>{s.naechte}</div>
                  </div>
                </div>
              )}
              {(hafenZahl > 0 || seetagZahl > 0 || routeSm > 0) && (
                <div style={{
                  display: "flex", gap: 8, marginTop: 14, paddingTop: 14,
                  borderTop: `1px solid rgba(228,202,149,0.15)`,
                }}>
                  {hafenZahl > 0 && <StatChip Icon={MapPin} wert={hafenZahl} label={hafenZahl === 1 ? "Hafen" : "Häfen"} />}
                  {seetagZahl > 0 && <StatChip Icon={Waves} wert={seetagZahl} label={seetagZahl === 1 ? "Seetag" : "Seetage"} />}
                  {routeSm > 0 && <StatChip Icon={Compass} wert={routeSm.toLocaleString("de-DE")} label="Seemeilen" />}
                </div>
              )}
            </div>
          )}

          {bilanz.reisen > 0 && (
            <div style={{
              marginTop: 16, paddingTop: 14, borderTop: `1px solid rgba(200,160,85,0.22)`,
              fontFamily: MONO, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase",
              color: C.messingHell, lineHeight: 1.9,
            }}>
              {bilanz.reisen} {bilanz.reisen === 1 ? "Reise" : "Reisen"} bisher · {bilanz.naechte} Nächte · {bilanz.einzigartig} Häfen
              {bilanz.sm > 0 && <div style={{ color: "#8FA9B8" }}>{bilanz.sm.toLocaleString("de-DE")} Seemeilen im Kielwasser</div>}
            </div>
          )}

          <button type="button" onClick={() => gehe("setup")} style={{
            marginTop: 22, background: "transparent", border: `1px solid ${C.messingLeise}`,
            borderRadius: 999, color: C.messingHell, fontFamily: MONO, fontSize: 11.5,
            letterSpacing: 1.6, textTransform: "uppercase", padding: "13px 22px",
            minHeight: 46, cursor: "pointer",
          }}>
            {schiffszeile || ab ? "Reise bearbeiten" : "Reise eintragen"}
          </button>
        </div>
      </div>

      <button type="button" onClick={() => gehe("haefen")} style={{
        width: "100%", textAlign: "left", cursor: "pointer", marginBottom: 14,
        background: C.tiefsee, border: "none", borderRadius: RUND, padding: "26px 22px",
        boxShadow: `inset 0 0 0 1px ${C.messingLeise}`,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <Search size={30} color={C.messingHell} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 25, color: C.white, lineHeight: 1.15 }}>Landausflüge & Häfen</div>
          <div style={{ fontFamily: SANS, fontSize: 13.5, color: "#A9C0CE", marginTop: 4 }}>
            {HAFENLISTE.length} Häfen weltweit durchsuchen — Währung, Landgänge, Ausflugsideen
          </div>
        </div>
        <ChevronRight size={20} color={C.messing} style={{ flexShrink: 0 }} />
      </button>

      <button type="button" onClick={onTeilen} style={{
        width: "100%", textAlign: "left", cursor: "pointer", marginBottom: 14,
        background: C.sand, border: "none", borderRadius: RUND, padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">📸</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 17, color: C.navy }}>Route als Postkarte teilen</div>
          <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, marginTop: 2 }}>Perfekt für Insta Stories</div>
        </div>
        <ChevronRight size={16} color={C.messing} style={{ flexShrink: 0 }} />
      </button>

      <div style={{ display: "flex", gap: 12, marginBottom: 26 }}>
        <KachelLink Icon={MapPin} titel="Route" onClick={() => gehe("route")}
          unter={routeZeile || "Eure Route eintragen"} />
        <KachelLink Icon={Menu} titel="Mehr" onClick={() => gehe("mehr")}
          unter="Packliste, Kabine, Bordkonto, Logbuch" />
      </div>

      {daten.geplant && daten.geplant.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 16px" }}>
            <span aria-hidden="true" style={{ width: 20, height: 1, background: C.messing }} />
            <span style={{
              fontFamily: MONO, fontSize: 11.5, letterSpacing: 2.4, textTransform: "uppercase", color: C.muted,
            }}>Weitere Reisen in Planung</span>
            <span aria-hidden="true" style={{ flex: 1, height: 1, background: C.line }} />
          </div>
          {daten.geplant.map((g) => (
            <GeplantKarte key={g.id} eintrag={g}
              onAktivieren={() => onAktivieren(g.id)} onLoeschen={() => onGeplantLoeschen(g.id)} />
          ))}
        </div>
      )}

      {(daten.haefen.length > 0 || s.schiff || s.reederei) && (
        <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
          <Btn small variant="outline" onClick={onAbschliessen} full>
            Reise ins Fahrtenbuch legen
          </Btn>
          <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>
            Häfen, Notizen und Seemeilen wandern ins Fahrtenbuch, der Planer wird für die nächste Reise leer.
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", padding: "6px 0 4px", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        {(s.reederei || s.schiff || daten.haefen.length > 0) && (
          <Btn small variant="quiet" onClick={onParken}><Plus size={14} /> Weitere Reise parken und neue anlegen</Btn>
        )}
        <Btn small variant="quiet" onClick={onNeu}><RotateCcw size={14} /> Neue Reise anlegen</Btn>
      </div>

      <div style={{
        fontFamily: SANS, fontSize: 13.5, lineHeight: 1.75, color: C.muted,
        textAlign: "center", padding: "22px 8px 8px",
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
/* =========================================================
   TEILEN – Postkarte fürs Screenshot
========================================================= */
function TeilenPostkarte({ daten, onClose }) {
  const s = daten.setup;
  const h = daten.haefen || [];
  const ab = alsDatum(s.abfahrt);
  const cdWerte = countdownWerte(s);
  const mitOrt = h.filter((x) => typeof x.lon === "number");
  const sm = mitOrt.reduce((a, p, i) => (i ? a + seemeilen(mitOrt[i - 1], p) : 0), 0);
  const schiffszeile = [s.reederei, s.schiff].filter(Boolean).join(" · ");

  return (
    <div role="dialog" aria-modal="true" className="no-print" style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: `radial-gradient(circle at 50% 30%, ${C.white} 0%, ${C.sky} 78%)`,
      overflowY: "auto", padding: "26px 20px 44px",
    }}>
      <button type="button" onClick={onClose} aria-label="Schließen" style={{
        position: "fixed", top: 18, right: 18, background: C.white,
        border: `1px solid ${C.line}`, borderRadius: 3, color: C.navy,
        width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", zIndex: 2,
        boxShadow: "0 1px 3px rgba(11,35,56,0.12)",
      }}><X size={18} /></button>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", margin: "20px 0 22px" }}>
          <div style={{
            fontFamily: MONO, fontSize: 10, letterSpacing: 3.2, color: C.messing,
            textTransform: "uppercase", marginBottom: 12,
          }}>Logbuch · @wolken.wanderer</div>
          <h2 style={{
            fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(30px, 8vw, 42px)",
            lineHeight: 1.08, color: C.navy, margin: "0 0 10px",
          }}>{schiffszeile || "Unsere Reise"}</h2>
          {ab && (
            <div style={{
              fontFamily: MONO, fontSize: 11.5, letterSpacing: 1.4, color: C.blue,
              textTransform: "uppercase",
            }}>Auslaufen {kurz(ab)} · {s.naechte} Nächte</div>
          )}
        </div>

        {cdWerte && (
          <div style={{ margin: "0 0 26px" }}>
            <UrlaubsCountdown titel="Euer Urlaubs-Countdown" werte={cdWerte} hell />
          </div>
        )}

        <div style={{
          background: C.white, borderRadius: RUND, padding: 12,
          border: `1px solid ${C.line}`, boxShadow: "0 2px 10px rgba(11,35,56,0.06)",
        }}>
          <Karte haefen={h} route={s.route} />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 34, marginTop: 22, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontSize: 30, color: C.navy }}>{mitOrt.length}</div>
            <div style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, color: C.messing,
              textTransform: "uppercase", marginTop: 5,
            }}>{mitOrt.length === 1 ? "Hafen" : "Häfen"}</div>
          </div>
          {sm > 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: C.navy }}>{sm.toLocaleString("de-DE")}</div>
              <div style={{
                fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, color: C.messing,
                textTransform: "uppercase", marginTop: 5,
              }}>Seemeilen</div>
            </div>
          )}
        </div>

        <div style={{
          textAlign: "center", marginTop: 30, fontFamily: SANS, fontSize: 13.5,
          lineHeight: 1.7, color: C.muted,
        }}>Macht einen Screenshot und teilt ihn — dieses Fenster ist extra für genau das gemacht.</div>
      </div>
    </div>
  );
}

/* =========================================================
   TAB-LEISTE – die vier Hauptbereiche der App
========================================================= */
const TABS = [
  { id: "start", label: "Start", Icon: Home },
  { id: "haefen", label: "Häfen", Icon: Search },
  { id: "route", label: "Route", Icon: MapPin },
  { id: "mehr", label: "Mehr", Icon: Menu },
];
function gehoertZuTab(screen, tabId) {
  if (tabId === "mehr") return screen === "mehr" || screen === "setup" || typeof screen === "number";
  return screen === tabId;
}
function TabBar({ screen, gehe }) {
  return (
    <nav className="no-print" style={{
      position: "fixed", left: 0, right: 0, bottom: 0, background: C.tiefsee, zIndex: 40,
      borderTop: `1px solid ${C.messingLeise}`,
      padding: "6px 10px calc(6px + env(safe-area-inset-bottom))",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "flex" }}>
        {TABS.map((t) => {
          const aktiv = gehoertZuTab(screen, t.id);
          const farbe = aktiv ? C.messingHell : "#7C93A2";
          return (
            <button key={t.id} type="button" onClick={() => gehe(t.id)} aria-current={aktiv ? "page" : undefined}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: "transparent", border: "none", cursor: "pointer", padding: "7px 4px",
                minHeight: 54,
              }}>
              <span style={{
                width: 34, height: 30, borderRadius: 10, display: "grid", placeItems: "center",
                background: aktiv ? "linear-gradient(135deg, rgba(228,202,149,0.30), rgba(200,160,85,0.12))" : "transparent",
              }}>
                <t.Icon size={19} color={farbe} />
              </span>
              <span style={{
                fontFamily: MONO, fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: farbe,
              }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ModulMehr({ gehe, fortschritt }) {
  return (
    <div>
      <Kicker>Mehr</Kicker>
      <H2 style={{ marginBottom: 20 }}>Vorbereitung & Logbuch</H2>
      {MODULE.map((m) => {
        const f = fortschritt[m.id];
        return (
          <button key={m.id} type="button" onClick={() => gehe(m.id)} style={{
            width: "100%", textAlign: "left", cursor: "pointer", marginBottom: 10,
            background: C.white, border: "none", borderRadius: RUND, padding: "18px 18px 20px",
            boxShadow: "0 1px 2px rgba(11,35,56,0.05)",
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
              fontFamily: SERIF, fontSize: 21, lineHeight: 1.2, color: C.navy, marginBottom: 7,
            }}>{m.titel}</div>
            <div style={{
              fontFamily: SANS, fontSize: 13.8, lineHeight: 1.6, color: C.muted, marginBottom: f ? 13 : 0,
            }}>{m.teaser}</div>
            {f && <Balken wert={f.wert} gesamt={f.gesamt} />}
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [daten, setDaten] = useState(LEER);
  const [screen, setScreen] = useState("start");
  const [geladen, setGeladen] = useState(false);
  const [gespeichert, setGespeichert] = useState(false);
  const [frage, setFrage] = useState(false);
  const [abschluss, setAbschluss] = useState(false);
  const [bewertung, setBewertung] = useState({ essen: 0, service: 0, kabine: 0, preis: 0 });
  const [teilen, setTeilen] = useState(false);
  const [haefenAnfang, setHaefenAnfang] = useState(null);
  const [namePopupGeschlossen, setNamePopupGeschlossen] = useState(false);
  const [nameEntwurf, setNameEntwurf] = useState("");
  const [einstiegSchritt, setEinstiegSchritt] = useState("name");
  /* Wird einmalig beim Laden anhand des gespeicherten Stands gesetzt — ändert
     sich NICHT mehr live mit daten.nutzerName, sonst würde das Popup beim
     Zwischenspeichern des Namens (Schritt 1 -> 2) sofort wieder zuklappen. */
  const [zeigeOnboarding, setZeigeOnboarding] = useState(false);
  const timer = useRef(null);
  const namePopupOffen = geladen && zeigeOnboarding && !namePopupGeschlossen;

  useEffect(() => {
    store.get(STORAGE_KEY)
      .then((r) => {
        const d = JSON.parse(r.value);
        setDaten({ ...LEER, ...d, setup: { ...LEER.setup, ...(d.setup || {}) },
          kabine: { ...LEER.kabine, ...(d.kabine || {}) },
          bord: { ...LEER.bord, ...(d.bord || {}) },
          doks: { ...LEER.doks, ...(d.doks || {}) } });
        setZeigeOnboarding(!d.nutzerName);
      })
      .catch(() => setZeigeOnboarding(true))
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

    const ff = {
      route: s.route, saison: s.saison, kind: s.kind, anreise: s.anreise, gala: s.gala,
      typen: typenInRoute(daten.haefen),
    };
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

  /* Felder, die reiseübergreifend erhalten bleiben, egal was mit der
     aktiven Reise passiert (neu, geparkt, ins Fahrtenbuch gelegt). */
  const uebergreifend = (d) => ({
    archiv: d.archiv || [], geplant: d.geplant || [], wunschliste: d.wunschliste || [],
    hafenNotizen: d.hafenNotizen || {}, nutzerName: d.nutzerName || "",
  });
  const reiseSnapshot = (d) => ({
    id: "g" + Date.now(), setup: d.setup, kabine: d.kabine, haefen: d.haefen,
    bord: d.bord, doks: d.doks, packExtra: d.packExtra, haken: d.haken, tagebuch: d.tagebuch || [],
  });
  const hatInhalt = (d) => !!(d.setup.reederei || d.setup.schiff || d.setup.abfahrt || (d.haefen && d.haefen.length));

  function neueReise() {
    setDaten((d) => ({ ...LEER, ...uebergreifend(d) }));
    setFrage(false);
    setScreen("start");
  }

  function reiseParken() {
    setDaten((d) => {
      const geplant = hatInhalt(d) ? [...(d.geplant || []), reiseSnapshot(d)] : (d.geplant || []);
      return { ...LEER, ...uebergreifend(d), geplant };
    });
    setScreen("start");
  }

  function reiseAktivieren(id) {
    setDaten((d) => {
      const eintrag = (d.geplant || []).find((g) => g.id === id);
      if (!eintrag) return d;
      const rest = (d.geplant || []).filter((g) => g.id !== id);
      const geplant = hatInhalt(d) ? [...rest, reiseSnapshot(d)] : rest;
      return {
        ...d, geplant,
        setup: eintrag.setup, kabine: eintrag.kabine, haefen: eintrag.haefen,
        bord: eintrag.bord, doks: eintrag.doks, packExtra: eintrag.packExtra, haken: eintrag.haken,
        tagebuch: eintrag.tagebuch || [],
      };
    });
    setScreen("start");
  }

  function geplantLoeschen(id) {
    setDaten((d) => ({ ...d, geplant: (d.geplant || []).filter((g) => g.id !== id) }));
  }

  function insFahrtenbuch(bewertung) {
    setDaten((d) => {
      const mitOrt = (d.haefen || []).filter((x) => typeof x.lon === "number");
      const sm = mitOrt.reduce((a, p, i) => (i ? a + seemeilen(mitOrt[i - 1], p) : 0), 0);
      const eintrag = {
        id: "r" + Date.now(),
        reederei: d.setup.reederei, schiff: d.setup.schiff, abfahrt: d.setup.abfahrt,
        naechte: d.setup.naechte, route: d.setup.route, sm, bewertung: bewertung || null,
        kabine: { art: d.kabine.art, laengs: d.kabine.laengs, nummer: d.kabine.nummer },
        haefen: (d.haefen || []).map((x) => ({
          typ: x.typ === "see" ? "see" : "hafen",
          name: x.name, lon: x.lon, lat: x.lat, note: x.note || "", sterne: x.sterne || 0,
          ausflug: [], bordAktivitaeten: [],
        })),
        tagebuch: d.tagebuch || [],
      };
      return { ...LEER, ...uebergreifend(d), archiv: [...(d.archiv || []), eintrag] };
    });
    setAbschluss(false);
    setScreen(8);
  }

  function zeigeHafen(name) {
    setHaefenAnfang(name);
    setScreen("haefen");
  }

  if (!geladen) return null;

  const zeigeKopf = screen === "setup" || typeof screen === "number";
  const zurueckZiel = screen === "setup" ? "start" : "mehr";
  const titel = typeof screen === "number" ? (MODULE.find((m) => m.id === screen) || {}).titel
    : screen === "setup" ? "Reise-Setup" : "";

  return (
    <div style={{ minHeight: "100vh", background: C.paper, paddingBottom: 92 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "22px 20px 0" }}>
        {zeigeKopf && (
          <div className="no-print" style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 22,
          }}>
            <button type="button" onClick={() => setScreen(zurueckZiel)} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: MONO, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase",
              color: C.muted, padding: "6px 10px 6px 0", minHeight: 44,
            }}><ChevronLeft size={14} color={C.messing} /> Zurück</button>
            <span style={{ flex: 1 }} />
            <span style={{
              fontFamily: MONO, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase",
              color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{titel}</span>
          </div>
        )}

        <div key={String(screen)} style={{ animation: "auftauchen .32s ease both" }}>
          {screen === "start" && <Start daten={daten} gehe={setScreen} fortschritt={fortschritt}
            onAbschliessen={() => setAbschluss(true)} onTeilen={() => setTeilen(true)}
            onParken={reiseParken} onNeu={() => setFrage(true)}
            onAktivieren={reiseAktivieren} onGeplantLoeschen={geplantLoeschen} />}
          {screen === "haefen" && <ModulHaefen daten={daten} setze={setze}
            anfangsHafen={haefenAnfang} onAnfangVerbraucht={() => setHaefenAnfang(null)} />}
          {screen === "route" && <ModulLandgang daten={daten} setze={setze} onZeigeHafen={zeigeHafen} />}
          {screen === "mehr" && <ModulMehr gehe={setScreen} fortschritt={fortschritt} />}
          {screen === "setup" && <Setup daten={daten} setze={setze} gehe={setScreen} />}
          {screen === 1 && <ModulCountdown daten={daten} setzeHaken={setzeHaken} />}
          {screen === 2 && <ModulKabine daten={daten} setze={setze} />}
          {screen === 3 && <ModulPack daten={daten} setze={setze} setzeHaken={setzeHaken} />}
          {screen === 4 && <ModulBord daten={daten} setze={setze} />}
          {screen === 6 && <ModulTag1 daten={daten} setzeHaken={setzeHaken} />}
          {screen === 7 && <ModulDoks daten={daten} setze={setze} />}
          {screen === 8 && <ModulFahrtenbuch daten={daten} setze={setze} />}
        </div>
      </div>

      <TabBar screen={screen} gehe={setScreen} />

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
            {daten.setup.reederei && (
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase",
                  color: C.muted, marginBottom: 10,
                }}>Wie war {daten.setup.reederei}? (freiwillig)</div>
                {[["essen", "Essen"], ["service", "Service"], ["kabine", "Kabine"], ["preis", "Preis-Leistung"]].map(([k, l]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: SANS, fontSize: 15, color: C.navy }}>{l}</span>
                    <Sterne wert={bewertung[k]} onChange={(v) => setBewertung({ ...bewertung, [k]: v })} />
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn small variant="outline" onClick={() => setAbschluss(false)} style={{ flex: 1 }}>Noch nicht</Btn>
              <Btn small onClick={() => { insFahrtenbuch(bewertung); setBewertung({ essen: 0, service: 0, kabine: 0, preis: 0 }); }} style={{ flex: 1 }}>Eintragen</Btn>
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

      {namePopupOffen && (
        <div role="dialog" aria-modal="true" style={{
          position: "fixed", inset: 0, zIndex: 70, background: "rgba(11,35,56,0.62)",
          display: "grid", placeItems: "center", padding: 22,
        }}>
          <div style={{
            background: C.paper, borderRadius: RUND, border: `1px solid ${C.line}`,
            borderTop: `2px solid ${C.messing}`, padding: "28px 24px 24px", maxWidth: 400, width: "100%",
          }}>
            {einstiegSchritt === "name" ? (
              <>
                <H3>Schön, dass ihr da seid!</H3>
                <P style={{ fontSize: 15.5 }}>
                  Wie dürfen wir dich nennen? Dann begrüßen wir dich beim nächsten Mal persönlich.
                </P>
                <Feld label="Dein Name" wert={nameEntwurf} onChange={setNameEntwurf}
                  placeholder="Dein Vorname" />
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn small variant="outline" onClick={() => setNamePopupGeschlossen(true)} style={{ flex: 1 }}>
                    Vielleicht später
                  </Btn>
                  <Btn small onClick={() => {
                    setDaten((d) => ({ ...d, nutzerName: nameEntwurf.trim() }));
                    setEinstiegSchritt("buchung");
                  }} style={{ flex: 1 }} disabled={!nameEntwurf.trim()}>
                    Weiter
                  </Btn>
                </div>
              </>
            ) : (
              <>
                <H3>Fast fertig, {(daten.nutzerName || nameEntwurf).trim()}!</H3>
                <P style={{ fontSize: 15.5 }}>
                  Habt ihr eure Kreuzfahrt schon gebucht?
                </P>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Btn onClick={() => { setNamePopupGeschlossen(true); setScreen("setup"); }} full>
                    Ja, Reise eintragen
                  </Btn>
                  <Btn variant="outline" onClick={() => setNamePopupGeschlossen(true)} full>
                    Noch nicht — erst mal umschauen
                  </Btn>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {teilen && <TeilenPostkarte daten={daten} onClose={() => setTeilen(false)} />}

      <div aria-live="polite" style={{
        position: "fixed", bottom: 88, left: "50%",
        transform: `translateX(-50%) translateY(${gespeichert ? "0" : "16px"})`,
        opacity: gespeichert ? 1 : 0, transition: "all .3s", pointerEvents: "none", zIndex: 50,
        background: C.tiefsee, color: C.messingHell, fontFamily: MONO, fontSize: 11.5,
        letterSpacing: 1.6, textTransform: "uppercase", padding: "10px 18px", borderRadius: 3,
        border: `1px solid ${C.messingLeise}`, display: "flex", alignItems: "center", gap: 8,
      }}>
        <Check size={13} /> Eingetragen
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
