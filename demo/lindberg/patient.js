/* ─────────── bliv patient ───────────
   Formularen er delt i tre trin frem for én lang side. Et felt bliver
   foerst markeret som forkert, naar man har forsoegt at gaa videre — ikke
   mens man skriver. Ellers staar halvdelen af siden roed, foer man er
   naaet ned til feltet.

   Demo: intet sendes nogen steder, og intet gemmes — hverken i browseren
   eller andre steder. Derfor ingen localStorage her; CPR-nummeret maa
   ikke ligge og flyde i en demo. */

var ftrin = 1;

/* Hvert trin: felterne der skal vaere udfyldt, og hvordan de tjekkes.
   Et tomt tjek betyder "skal bare have indhold". */
var KRAV = {
  1: [
    ["fornavn", null],
    ["efternavn", null],
    ["vej", null],
    ["husnr", null],
    ["postnr", /^\d{4}$/],
    ["by", null]
  ],
  2: [
    ["mobil", /^(\+?45)?\s?(\d[\s-]?){8}$/],
    ["mail", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/],
    ["cpr", /^\d{6}-?\d{4}$/]
  ],
  3: []
};

function felt(id) { return document.getElementById(id).closest(".field"); }

function tjekTrin(n) {
  var ok = true;
  KRAV[n].forEach(function (krav) {
    var el = document.getElementById(krav[0]);
    var vaerdi = el.value.trim();
    var gyldig = krav[1] ? krav[1].test(vaerdi) : vaerdi.length > 0;
    felt(krav[0]).classList.toggle("bad", !gyldig);
    if (!gyldig && ok) { el.focus(); ok = false; }
  });

  // Samtykket hoerer til sidste trin og er ikke et almindeligt felt
  if (n === 3) {
    var sam = document.getElementById("samtykke");
    document.getElementById("consentwrap").classList.toggle("bad", !sam.checked);
    if (!sam.checked && ok) { sam.focus(); ok = false; }
  }
  return ok;
}

function visTrin(n) {
  for (var i = 1; i <= 4; i++) {
    document.getElementById("fs" + i).classList.toggle("on", i === n);
  }
  for (var p = 1; p <= 3; p++) {
    document.getElementById("p" + p).classList.toggle("on", p <= Math.min(n, 3));
  }
  ftrin = n;
  // Rul op til kortets top, saa man ikke lander midt i det naeste trin
  var kort = document.getElementById("patientform");
  var y = kort.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function fgo(n) {
  // Fremad: tjek trinnet man forlader. Tilbage: altid frit.
  if (n > ftrin && !tjekTrin(ftrin)) return;
  visTrin(n);
}

/* Naar et felt er markeret forkert, fjernes markeringen i samme oejeblik
   det bliver rigtigt — saa man kan se at rettelsen virkede. */
document.getElementById("patientform").addEventListener("input", function (e) {
  var f = e.target.closest(".field");
  if (f && f.classList.contains("bad")) {
    var id = e.target.id;
    var alle = KRAV[1].concat(KRAV[2]);
    for (var i = 0; i < alle.length; i++) {
      if (alle[i][0] !== id) continue;
      var v = e.target.value.trim();
      var gyldig = alle[i][1] ? alle[i][1].test(v) : v.length > 0;
      if (gyldig) f.classList.remove("bad");
    }
  }
});

document.getElementById("samtykke").addEventListener("change", function (e) {
  if (e.target.checked) document.getElementById("consentwrap").classList.remove("bad");
});

document.getElementById("patientform").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!tjekTrin(3)) return;

  var navn = document.getElementById("fornavn").value.trim();
  document.getElementById("fkvit").textContent =
    navn ? "Tak, " + navn + " — vi har oprettet dig i klinikken." : "Vi har oprettet dig i klinikken.";

  visTrin(4);
  // Demoen skal ikke efterlade et CPR-nummer i felterne
  document.getElementById("cpr").value = "";
});
