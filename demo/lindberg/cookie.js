/* ─────────── samtykke ───────────
   Opbygget som de kendte samtykkeløsninger: tre faner, en kontakt pr.
   kategori og tre knapper. Forskellen er, at tallene er ægte. Siden har
   ingen statistik og ingen annoncesporing, og det står der så — i stedet
   for fire kategorier der skal udfyldes for syns skyld.

   Det eneste, der henter fra en anden virksomhed, er Google-kortet. Det
   er sat op med data-src, så browseren intet henter, før der siges ja.  */

var SAMTYKKE_NOEGLE = "lindberg-samtykke-v2";

var KATEGORIER = [
  { id: "noedvendig", navn: "Nødvendig", laast: true, antal: 1,
    beskrivelse: "Nødvendige valg gør hjemmesiden brugbar ved at huske det, du selv har " +
      "bestemt. De kan ikke fravælges, og der sendes intet videre til andre.",
    poster: [["Dit cookievalg", "Gemmes i din egen browser, så du ikke bliver spurgt igen. " +
      "Forlader aldrig din enhed."]] },
  { id: "praeferencer", navn: "Præferencer", antal: 0,
    beskrivelse: "Præferencer husker oplysninger, der ændrer, hvordan hjemmesiden ser ud " +
      "eller opfører sig — fx dit foretrukne sprog.",
    poster: [] },
  { id: "statistik", navn: "Statistik", antal: 0,
    beskrivelse: "Statistik giver ejeren indsigt i, hvordan hjemmesiden bliver brugt. " +
      "Denne hjemmeside tæller ikke besøgende og bruger ikke analyseværktøjer.",
    poster: [] },
  { id: "marketing", navn: "Marketing", antal: 1,
    beskrivelse: "Marketing bruges til at genkende dig på tværs af hjemmesider. Denne " +
      "hjemmeside annoncerer ikke — men Google-kortet hører til her, fordi Google selv " +
      "kan sætte den slags, når kortet vises.",
    poster: [["Google Maps", "Kortet under “Find vej”. Google modtager din IP-adresse og kan " +
      "sætte cookies, når kortet indlæses. Siger du nej, vises kortet ikke, og du får i " +
      "stedet et link til Google Maps."]] }
];

function laesSamtykke() {
  try { return JSON.parse(localStorage.getItem(SAMTYKKE_NOEGLE) || "null"); }
  catch (e) { return null; }
}

function gemSamtykke(valg) {
  var gammel = laesSamtykke();
  var post = {
    praeferencer: !!valg.praeferencer,
    statistik: !!valg.statistik,
    marketing: !!valg.marketing,
    id: (gammel && gammel.id) || nytId(),
    dato: new Date().toISOString()
  };
  try { localStorage.setItem(SAMTYKKE_NOEGLE, JSON.stringify(post)); } catch (e) {}
  return post;
}

function nytId() {
  var s = "";
  for (var i = 0; i < 4; i++) s += Math.random().toString(36).slice(2, 8);
  return s.slice(0, 20);
}

/* ── kortet ── */
function aabnKort() {
  var ramme = document.getElementById("gmap");
  if (!ramme) return;
  if (!ramme.src) {
    var kilde = ramme.getAttribute("data-src");
    if (kilde) ramme.src = kilde;
  }
  var spaerre = document.getElementById("kortspaerre");
  if (spaerre) spaerre.remove();
  var skift = document.querySelector(".maptoggle");
  if (skift) skift.hidden = false;
}

function visKortspaerre() {
  var kort = document.querySelector(".mapcard");
  if (!kort || document.getElementById("kortspaerre")) return;
  var skift = kort.querySelector(".maptoggle");
  if (skift) skift.hidden = true;
  var d = document.createElement("div");
  d.id = "kortspaerre";
  d.className = "kortspaerre";
  d.innerHTML =
    '<p><strong>Kortet er ikke indlæst</strong></p>' +
    '<p>Google Maps henter data fra Google, når kortet vises. Vi venter med det, til du siger ja.</p>' +
    '<button type="button" class="btn btn-cta" onclick="sigJaTilKort()">Vis kortet</button>' +
    '<a class="kortspaerre-vej" target="_blank" rel="noopener" ' +
    'href="https://www.google.com/maps/search/?api=1&amp;query=Tandl%C3%A6geTeam%20Lindberg%2C%20Lundtofteparken%2083%2C%202800%20Kgs.%20Lyngby">' +
    'Eller åbn i Maps i stedet →</a>';
  kort.appendChild(d);
}

function sigJaTilKort() {
  var g = laesSamtykke() || {};
  g.marketing = true;
  gemSamtykke(g);
  aabnKort();
  lukSamtykke();
}

function anvend(valg) {
  if (valg.marketing) aabnKort(); else visKortspaerre();
}

/* ── dialogen ── */
function kontakt(k, tilvalgt) {
  return '<label class="kat' + (k.laast ? " laast" : "") + '">' +
    '<span class="kat-navn">' + k.navn + ' <span class="kat-tal">' + k.antal + '</span></span>' +
    '<input type="checkbox" class="kat-boks" id="kat-' + k.id + '"' +
      (k.laast ? " checked disabled" : (tilvalgt ? " checked" : "")) +
      (k.antal === 0 && !k.laast ? " data-tom" : "") + '>' +
    '<span class="kat-skift" aria-hidden="true"></span></label>';
}

function detaljer() {
  return KATEGORIER.map(function (k, i) {
    var poster = k.poster.length
      ? '<dl class="post">' + k.poster.map(function (p) {
          return "<dt>" + p[0] + "</dt><dd>" + p[1] + "</dd>";
        }).join("") + "</dl>"
      : '<p class="post-tom">Der bruges ingen i denne kategori på hjemmesiden.</p>';
    return '<div class="detalje">' +
      '<button type="button" class="detalje-top" onclick="foldUd(' + i + ')" aria-expanded="false">' +
        '<span class="detalje-pil" aria-hidden="true">›</span>' +
        '<span>' + k.navn + ' <span class="kat-tal">' + k.antal + '</span></span></button>' +
      '<div class="detalje-krop" hidden><p>' + k.beskrivelse + "</p>" + poster + "</div></div>";
  }).join("");
}

function foldUd(i) {
  var top = document.querySelectorAll(".detalje-top")[i];
  var krop = document.querySelectorAll(".detalje-krop")[i];
  var aaben = !krop.hidden;
  krop.hidden = aaben;
  top.setAttribute("aria-expanded", String(!aaben));
  top.classList.toggle("aaben", !aaben);
}

function visFane(navn) {
  ["samtykke", "detaljer", "om"].forEach(function (f) {
    document.getElementById("fane-" + f).hidden = f !== navn;
    var k = document.getElementById("faneknap-" + f);
    k.classList.toggle("valgt", f === navn);
    k.setAttribute("aria-selected", String(f === navn));
  });
}

function dialogHtml(gemt) {
  var g = gemt || {};
  return '<div class="ck" id="ck" role="dialog" aria-modal="true" aria-labelledby="ck-titel">' +
    '<div class="ck-kort">' +
      '<div class="ck-top">' +
        '<img src="img/logo.svg" alt="TandlægeTeam Lindberg" width="227" height="48">' +
        '<span class="ck-maerke">Cookieindstillinger</span>' +
      '</div>' +

      '<div class="ck-faner" role="tablist">' +
        '<button type="button" role="tab" id="faneknap-samtykke" class="valgt" aria-selected="true" onclick="visFane(\'samtykke\')">Samtykke</button>' +
        '<button type="button" role="tab" id="faneknap-detaljer" aria-selected="false" onclick="visFane(\'detaljer\')">Detaljer</button>' +
        '<button type="button" role="tab" id="faneknap-om" aria-selected="false" onclick="visFane(\'om\')">Om</button>' +
      '</div>' +

      '<div class="ck-krop">' +
        '<div id="fane-samtykke">' +
          '<h2 id="ck-titel">Denne hjemmeside bruger kun det nødvendige</h2>' +
          '<p>Vi tæller ikke besøgende, annoncerer ikke og deler ikke oplysninger med ' +
          'samarbejdspartnere. Det eneste, der henter fra en anden virksomhed, er ' +
          'Google-kortet under “Find vej” — og det venter, til du siger ja.</p>' +
          '<div class="kat-raekke">' + KATEGORIER.map(function (k) {
            return kontakt(k, k.id === "marketing" ? !!g.marketing
              : k.id === "praeferencer" ? !!g.praeferencer : !!g.statistik);
          }).join("") + '</div>' +
        '</div>' +

        '<div id="fane-detaljer" hidden>' + detaljer() + '</div>' +

        '<div id="fane-om" hidden>' +
          '<p>Vi bruger kun det, der er nødvendigt for, at hjemmesiden virker. Alt andet ' +
          'kræver dit samtykke, og du giver det selv her.</p>' +
          '<p>Skrifttyper, billeder og kode hentes fra klinikkens egen server, så dit besøg ' +
          'ikke sendes videre til andre. Google-kortet er den eneste undtagelse, og det ' +
          'indlæses ikke, før du siger ja til det.</p>' +
          '<p>Du kan til enhver tid ændre eller trække dit valg tilbage via ' +
          '“Cookieindstillinger” nederst på siden.</p>' +
          '<p class="ck-id">' + (g.id
            ? 'Dit samtykke-ID: <code>' + g.id + '</code><br>Afgivet: ' +
              new Date(g.dato).toLocaleString("da-DK")
            : 'Du har endnu ikke taget stilling.') + '</p>' +
        '</div>' +
      '</div>' +

      '<div class="ck-knapper">' +
        '<button type="button" class="btn btn-ghost" onclick="ckAfvis()">Afvis</button>' +
        '<button type="button" class="btn btn-ghost" onclick="ckValgte()">Tillad valgte</button>' +
        '<button type="button" class="btn btn-cta" onclick="ckAlle()">Tillad alle</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function lukSamtykke() {
  var d = document.getElementById("ck");
  if (d) d.remove();
  document.body.classList.remove("ck-aaben");
}

function ckAfvis() {
  anvend(gemSamtykke({ praeferencer: false, statistik: false, marketing: false }));
  lukSamtykke();
}
function ckAlle() {
  anvend(gemSamtykke({ praeferencer: true, statistik: true, marketing: true }));
  lukSamtykke();
}
function ckValgte() {
  anvend(gemSamtykke({
    praeferencer: document.getElementById("kat-praeferencer").checked,
    statistik: document.getElementById("kat-statistik").checked,
    marketing: document.getElementById("kat-marketing").checked
  }));
  lukSamtykke();
}

function aabnSamtykke() {
  if (document.getElementById("ck")) return;
  document.body.insertAdjacentHTML("beforeend", dialogHtml(laesSamtykke()));
  document.body.classList.add("ck-aaben");
}

/* ── start ── */
(function () {
  var gemt = laesSamtykke();
  if (!gemt) { visKortspaerre(); aabnSamtykke(); return; }
  anvend(gemt);
})();
