/* ─────────── samtykke ───────────
   Boksen er ikke pynt. Den eneste tredjepart paa siden er Google-kortet,
   og det bliver faktisk holdt tilbage, indtil den besoegende siger ja:
   iframen har kun data-src, saa browseren henter intet fra Google foer da.

   Valget gemmes i browseren med et versionsnummer. AEndrer vi, hvad der
   hentes, haeves nummeret, og der bliver spurgt igen — det er kravet.  */

var SAMTYKKE_NOEGLE = "lindberg-samtykke-v1";

function laesSamtykke() {
  try {
    return JSON.parse(localStorage.getItem(SAMTYKKE_NOEGLE) || "null");
  } catch (e) {
    return null; // privat vindue eller blokeret lager
  }
}

function gemSamtykke(valg) {
  try {
    localStorage.setItem(SAMTYKKE_NOEGLE, JSON.stringify({
      funktionelle: !!valg.funktionelle,
      dato: new Date().toISOString()
    }));
  } catch (e) { /* kan ikke gemmes — saa spoerges der igen naeste gang */ }
}

/* ── kortet ── */
function aabnKort() {
  var ramme = document.getElementById("gmap");
  if (!ramme || ramme.src) return;
  var kilde = ramme.getAttribute("data-src");
  if (kilde) ramme.src = kilde;
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
    '<p>Google Maps henter data fra Google, når kortet vises. Vi venter med det, ' +
    'til du siger ja.</p>' +
    '<button type="button" class="btn btn-cta" onclick="sigJaTilKort()">Vis kortet</button>' +
    '<a class="kortspaerre-vej" target="_blank" rel="noopener" ' +
    'href="https://www.google.com/maps/search/?api=1&amp;query=Tandl%C3%A6geTeam%20Lindberg%2C%20Lundtofteparken%2083%2C%202800%20Kgs.%20Lyngby">' +
    'Eller åbn i Maps i stedet →</a>';
  kort.appendChild(d);
}

function sigJaTilKort() {
  gemSamtykke({ funktionelle: true });
  aabnKort();
  lukBanner();
}

/* ── banneret ── */
var BANNER_HTML =
'<div class="samtykke" id="samtykke" role="dialog" aria-modal="false" aria-labelledby="samtykke-titel">' +
  '<div class="samtykke-kort">' +
    '<h2 id="samtykke-titel">Vi bruger kun det nødvendige</h2>' +
    '<p>Siden virker uden at samle data om dig. Det eneste, der henter fra en anden ' +
    'virksomhed, er Google-kortet under “Find vej” — og det venter, til du siger ja.</p>' +

    '<div class="samtykke-valg" id="samtykkeValg" hidden>' +
      '<label class="samtykke-linje">' +
        '<input type="checkbox" checked disabled>' +
        '<span><strong>Nødvendige</strong><br>Sidens egne funktioner, fx at din menu lukker ' +
        'igen. Der sendes intet videre, og de kan ikke fravælges.</span></label>' +
      '<label class="samtykke-linje">' +
        '<input type="checkbox" id="valgFunktionelle">' +
        '<span><strong>Kort fra Google Maps</strong><br>Viser klinikkens placering direkte på ' +
        'siden. Google modtager din IP-adresse, når kortet indlæses.</span></label>' +
      '<label class="samtykke-linje tom">' +
        '<input type="checkbox" disabled>' +
        '<span><strong>Statistik og markedsføring</strong><br>Bruges ikke på denne side. ' +
        'Der er hverken besøgstælling eller annoncesporing.</span></label>' +
    '</div>' +

    '<div class="samtykke-knapper">' +
      '<button type="button" class="btn btn-cta" onclick="samtykkeAlle()">Tillad alle</button>' +
      '<button type="button" class="btn btn-ghost" onclick="samtykkeNoedvendige()">Kun nødvendige</button>' +
      '<button type="button" class="samtykke-link" id="samtykkeTilpas" onclick="samtykkeTilpas()">Tilpas</button>' +
    '</div>' +
    '<p class="samtykke-fod">Du kan altid ændre dit valg nederst på siden.</p>' +
  '</div>' +
'</div>';

function lukBanner() {
  var b = document.getElementById("samtykke");
  if (b) b.remove();
  document.body.classList.remove("har-samtykke-banner");
}

function samtykkeAlle() { gemSamtykke({ funktionelle: true }); aabnKort(); lukBanner(); }

function samtykkeNoedvendige() {
  gemSamtykke({ funktionelle: false });
  visKortspaerre();
  lukBanner();
}

function samtykkeTilpas() {
  var valg = document.getElementById("samtykkeValg");
  var knap = document.getElementById("samtykkeTilpas");
  if (valg.hidden) {
    valg.hidden = false;
    knap.textContent = "Gem mit valg";
  } else {
    gemSamtykke({ funktionelle: document.getElementById("valgFunktionelle").checked });
    if (document.getElementById("valgFunktionelle").checked) aabnKort(); else visKortspaerre();
    lukBanner();
  }
}

function aabnSamtykke() {
  if (document.getElementById("samtykke")) return;
  document.body.insertAdjacentHTML("beforeend", BANNER_HTML);
  document.body.classList.add("har-samtykke-banner");
  var gemt = laesSamtykke();
  if (gemt) {
    document.getElementById("samtykkeValg").hidden = false;
    document.getElementById("samtykkeTilpas").textContent = "Gem mit valg";
    document.getElementById("valgFunktionelle").checked = !!gemt.funktionelle;
  }
}

/* ── start ── */
(function () {
  var gemt = laesSamtykke();
  if (!gemt) { aabnSamtykke(); visKortspaerre(); return; }
  if (gemt.funktionelle) aabnKort(); else visKortspaerre();
})();
