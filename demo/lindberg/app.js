const MODAL_HTML = `<div class="modal" id="modal" role="dialog" aria-modal="true" aria-label="Book tid">
  <div class="sheet">
    <button class="close" onclick="closeBooking()" aria-label="Luk">✕</button>
    <div class="klinik">TandlægeTeam Lindberg · Lyngby</div>
    <h2>Book tid</h2>
    <div class="pills">
      <button class="pill" id="pillNy" aria-pressed="true" onclick="setPatient('ny')">Ny patient</button>
      <button class="pill" id="pillEks" aria-pressed="false" onclick="setPatient('eks')">Eksisterende patient</button>
    </div>

    <!-- 1: behandling -->
    <div class="step on" id="step1">
      <h3>Vælg behandling</h3>
      <p class="recap" id="recap1">Hvad skal vi se på?</p>
      <div class="choices" id="choices"></div>
    </div>

    <!-- 2: tidspunkt -->
    <div class="step" id="step2">
      <h3>Vælg tidspunkt</h3>
      <p class="recap" id="recap2"></p>
      <div class="picker">
        <div>
          <h4>Tilgængelige dage</h4>
          <div class="cal">
            <div class="calhead" id="calhead"></div>
            <div class="caldays" id="caldays"></div>
          </div>
        </div>
        <div>
          <h4 id="slotHead">Ledige tider</h4>
          <div class="slots" id="slots"><p class="empty">Vælg først en dag i kalenderen.</p></div>
        </div>
      </div>
      <div class="stepnav">
        <button class="btn btn-ghost" onclick="goStep(1)">Tilbage</button>
        <button class="btn btn-cta" id="toStep3" disabled onclick="goStep(3)">Fortsæt</button>
      </div>
    </div>

    <!-- 3: oplysninger -->
    <div class="step" id="step3">
      <h3>Dine oplysninger</h3>
      <p class="recap" id="recap3"></p>
      <div class="field"><label for="f-navn">Navn</label><input id="f-navn" autocomplete="name"></div>
      <div class="field"><label for="f-tlf">Telefon</label><input id="f-tlf" type="tel" autocomplete="tel"></div>
      <div class="field"><label for="f-mail">E-mail</label><input id="f-mail" type="email" autocomplete="email"></div>
      <div class="field"><label for="f-besked">Er der noget vi skal vide? (valgfrit)</label>
        <textarea id="f-besked" rows="3" placeholder="Fx at du er nervøs, eller hvornår du sidst var til tandlæge."></textarea></div>
      <p style="font-size:.84rem;color:var(--mid)">Din tid er først bekræftet, når du har fået en
        besked fra os. Har du akut tandpine, så ring i stedet på 45 87 99 35.</p>
      <div class="stepnav">
        <button class="btn btn-ghost" onclick="goStep(2)">Tilbage</button>
        <button class="btn btn-cta" onclick="goStep(4)">Send anmodning</button>
      </div>
    </div>

    <!-- 4: kvittering -->
    <div class="step" id="step4">
      <div class="done">
        <div class="tick">✓</div>
        <h3 style="color:var(--ink)">Tak — vi har modtaget din anmodning</h3>
        <p class="recap" id="recap4" style="margin-top:8px"></p>
        <p style="color:var(--mid);font-size:.92rem">Du hører fra os inden for én hverdag med en bekræftelse.</p>
        <div class="demo-tag">
          <strong>Dette er en demo.</strong> Der er ikke sendt noget, og der er ikke booket en tid.
          I den færdige løsning kobles bookingen direkte på klinikkens eget kalendersystem.
        </div>
        <button class="btn btn-ghost" style="margin-top:20px" onclick="closeBooking()">Luk</button>
      </div>
    </div>
  </div>
</div>`;

/* ── åbningstider. Klinikken skifter mellem lige og ulige uger, hvilket er
      svært at aflæse af en tabel. Derfor regnes "åbent nu" ud i stedet. ── */
const HOURS = {
  lige:  [[8,14.5],[8,14.5],[8,18],[8,18],null,null,null],
  ulige: [[8,15.5],[8,14.5],[8,14.5],[8,14.5],[8,13.5],null,null]
};
const DAYS = ["Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag","Søndag"];

function isoWeek(d){
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - y) / 86400000 + 1) / 7);
}
const hhmm = v => String(Math.floor(v)).padStart(2,"0") + ":" + (v % 1 ? "30" : "00");
const weekKey = d => isoWeek(d) % 2 === 0 ? "lige" : "ulige";
const dayIdx  = d => (d.getDay() + 6) % 7;          // mandag = 0

function renderHours(){
  const now = new Date(), key = weekKey(now), di = dayIdx(now);
  for (const k of ["lige","ulige"]) {
    const box = document.getElementById("rows" + k[0].toUpperCase() + k.slice(1));
    if (!box) continue;
    box.innerHTML =
      HOURS[k].map((h,i)=>
        `<div class="hrow${k===key&&i===di?" today":""}"><span>${DAYS[i]}</span>
         <span class="${h?"":"c"}">${h ? hhmm(h[0])+" – "+hhmm(h[1]) : "Lukket"}</span></div>`).join("");
  }
  const card = document.getElementById("card" + key[0].toUpperCase() + key.slice(1));
  if (card) {
    card.classList.add("now");
    document.getElementById("sub" + key[0].toUpperCase() + key.slice(1)).textContent = "Vi er i en " + key + " uge nu";
  }

  // Statuslinjen findes kun nogle steder; tabellen ovenfor skal tegnes uanset.
  const el = document.getElementById("status"), txt = document.getElementById("statusText");
  if (!el || !txt) return;
  const today = HOURS[key][di], t = now.getHours() + now.getMinutes()/60;
  if (today && t >= today[0] && t < today[1]) {
    txt.textContent = "Åbent nu — lukker " + hhmm(today[1]);
  } else if (today && t < today[0]) {
    el.classList.add("lukket");
    txt.textContent = "Lukket nu — åbner i dag kl. " + hhmm(today[0]);
  } else {
    el.classList.add("lukket");
    let i = 1, next = null;
    while (i <= 7 && !next) {
      const d = new Date(now); d.setDate(d.getDate() + i);
      const h = HOURS[weekKey(d)][dayIdx(d)];
      if (h) next = (i === 1 ? "i morgen" : DAYS[dayIdx(d)].toLowerCase()) + " kl. " + hhmm(h[0]);
      i++;
    }
    txt.textContent = "Lukket nu — åbner " + (next || "snart");
  }
}
renderHours();

/* ── booking ── */
const TREATMENTS = {
  ny: [
    {n:"Første eftersyn",           d:"Gennemgang, røntgen ved behov og en plan",  p:"Fra 345 kr."},
    {n:"en uforpligtende snak", d:"Er du nervøs? Ingen behandling — vi taler bare om hvad du har brug for", p:"Gratis"},
    {n:"Tandrensning",              d:"Hos tandplejeren",                          p:"Fra 345 kr."},
    {n:"Invisalign-forundersøgelse",d:"Vurdering af om tandretning er en mulighed", p:"Gratis"}
  ],
  eks: [
    {n:"Regelmæssigt eftersyn",  d:"Dit halvårlige eller årlige tjek",        p:"Fra 345 kr."},
    {n:"Tandrensning",           d:"Hos tandplejeren",                        p:"Fra 345 kr."},
    {n:"Fortsat behandling",     d:"Næste tid i et forløb du er i gang med",  p:"Efter aftale"},
    {n:"Tandblegning",           d:"Begge kæber",                             p:"3.640 kr."}
  ]
};
let state = { patient:"ny", treat:null, date:null, time:null };
document.body.insertAdjacentHTML("beforeend", MODAL_HTML);
const modal = document.getElementById("modal");

function openBooking(){ modal.classList.add("open"); document.body.style.overflow="hidden"; goStep(1); }
function closeBooking(){ modal.classList.remove("open"); document.body.style.overflow=""; state={patient:state.patient,treat:null,date:null,time:null}; }
modal.addEventListener("click", e => { if (e.target === modal) closeBooking(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) closeBooking(); });

function setPatient(p){
  state.patient = p;
  document.getElementById("pillNy").setAttribute("aria-pressed", p==="ny");
  document.getElementById("pillEks").setAttribute("aria-pressed", p==="eks");
  renderChoices(); goStep(1);
}
function renderChoices(){
  document.getElementById("choices").innerHTML = TREATMENTS[state.patient].map((t,i)=>
    `<button class="choice" onclick="pickTreat(${i})">
       <span><b>${t.n[0].toUpperCase()+t.n.slice(1)}</b><small>${t.d}</small></span><span class="kr">${t.p}</span></button>`).join("");
}
renderChoices();

function pickTreat(i){
  state.treat = TREATMENTS[state.patient][i];
  state.date = null; state.time = null;
  document.getElementById("toStep3").disabled = true;
  document.getElementById("slots").innerHTML = '<p class="empty">Vælg først en dag i kalenderen.</p>';
  buildCalendar(); goStep(2);
}

/* Kun dage hvor klinikken faktisk har åbent kan vælges — som hos de bedste
   bookingsystemer. Tiderne er opdigtede, for demoen taler ikke med en kalender. */
function buildCalendar(){
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const MN = ["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"];
  document.getElementById("calhead").textContent = MN[m][0].toUpperCase()+MN[m].slice(1) + " " + y;
  const first = (new Date(y,m,1).getDay()+6)%7, last = new Date(y,m+1,0).getDate();
  let html = ["Ma","Ti","On","To","Fr","Lø","Sø"].map(d=>`<span class="dn">${d}</span>`).join("");
  for (let i=0;i<first;i++) html += "<span></span>";
  for (let d=1;d<=last;d++){
    const date = new Date(y,m,d);
    const open = !!HOURS[weekKey(date)][dayIdx(date)];
    const future = d > now.getDate();
    html += `<button ${open&&future?`onclick="pickDay(${d})"`:"disabled"} id="d${d}">${d}</button>`;
  }
  document.getElementById("caldays").innerHTML = html;
}
function pickDay(d){
  state.date = d; state.time = null;
  document.querySelectorAll(".caldays button").forEach(b=>b.classList.remove("sel"));
  document.getElementById("d"+d).classList.add("sel");
  const now = new Date(), date = new Date(now.getFullYear(), now.getMonth(), d);
  const h = HOURS[weekKey(date)][dayIdx(date)];
  const times = [];
  for (let t = h[0]+1; t < h[1]-0.5; t += 0.75) times.push(hhmm(Math.floor(t) + (t%1>=0.5?0.5:0)));
  document.getElementById("slotHead").textContent = "Ledige tider " + d + ". " +
    ["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"][now.getMonth()];
  document.getElementById("slots").innerHTML = [...new Set(times)].slice(0,6)
    .map(t=>`<button class="slot" onclick="pickTime('${t}',this)">${t}</button>`).join("");
  document.getElementById("toStep3").disabled = true;
}
function pickTime(t, el){
  state.time = t;
  document.querySelectorAll(".slot").forEach(s=>s.classList.remove("sel"));
  el.classList.add("sel");
  document.getElementById("toStep3").disabled = false;
}

function summary(){
  const MN = ["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"];
  const m = MN[new Date().getMonth()];
  const n = state.treat.n;
  return `${n[0].toUpperCase()+n.slice(1)} — ${state.date}. ${m} kl. ${state.time}`;
}
function goStep(n){
  if (n===3 && (!state.date || !state.time)) return;
  document.querySelectorAll(".step").forEach(s=>s.classList.remove("on"));
  document.getElementById("step"+n).classList.add("on");
  if (n===2) document.getElementById("recap2").textContent =
    `Du er ved at booke en tid til ${state.treat.n} hos TandlægeTeam Lindberg.`;
  if (n===3) document.getElementById("recap3").textContent = summary();
  if (n===4) document.getElementById("recap4").textContent = summary();
  document.querySelector(".sheet").scrollIntoView({block:"start",behavior:"smooth"});
}

/* Mobilmenu. Uden den er akut- og tandlægeskræk-siderne uden for rækkevidde
   på en telefon, hvilket er præcis dér de bliver læst. */
function toggleMenu(){
  const m = document.getElementById("menu"), b = document.getElementById("burger");
  const open = m.classList.toggle("open");
  b.setAttribute("aria-expanded", open);
}
document.getElementById("menu")?.addEventListener("click", e => {
  if (e.target.tagName === "A") toggleMenu();
});

/* Headeren er gennemsigtig oven paa hero og faar foerst sin egen flade,
   naar man har scrollet forbi billedet. Uden det ville den hvide menu
   staa paa hvid baggrund. */
(function(){
  const hero = document.querySelector(".hero"), head = document.querySelector("header");
  if (!hero || !head || !document.body.classList.contains("has-hero")) return;
  const io = new IntersectionObserver(
    ([e]) => head.classList.toggle("solid", !e.isIntersecting),
    { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
  );
  io.observe(hero.querySelector(".heroguard") || hero);
})();

/* ─────────── kortlinks ───────────
   Alle "find vej"-links peger paa klinikkens egen markering i stedet for
   bare gadenummeret, saa man lander paa forretningen og ikke paa en
   adresse uden navn. Paa iPhone, iPad og Mac aabnes Apple Kort, ellers
   Google Maps. Uden JavaScript virker linket stadig — HTML'en har
   Google-adressen som udgangspunkt. */
var KLINIK_NAVN = "TandlægeTeam Lindberg";
var KLINIK_ADR  = "Lundtofteparken 83, 2800 Kgs. Lyngby";
var KLINIK_POS  = "55.7959,12.5292";

function mapsUrl() {
  var q = encodeURIComponent(KLINIK_NAVN + ", " + KLINIK_ADR);
  var ua = navigator.userAgent || "";
  // iPadOS melder sig som Mac, derfor ogsaa tjekket paa touch
  var apple = /iPhone|iPad|iPod|Macintosh/.test(ua) ||
              (/Mac/.test(ua) && navigator.maxTouchPoints > 1);
  return apple
    ? "https://maps.apple.com/?q=" + q + "&ll=" + KLINIK_POS
    : "https://www.google.com/maps/search/?api=1&query=" + q;
}

document.querySelectorAll("[data-maps]").forEach(function (el) {
  el.href = mapsUrl();
  el.target = "_blank";
  el.rel = "noopener";
});

/* Kort eller satellit. t=m er vejkortet, t=k er luftfotoet. */
function visKort(hvilket) {
  var sat = hvilket === "sat";
  var ramme = document.getElementById("gmap");
  ramme.src = ramme.src.replace(/&t=[mk]/, "&t=" + (sat ? "k" : "m"));
  document.getElementById("knapKort").classList.toggle("on", !sat);
  document.getElementById("knapSat").classList.toggle("on", sat);
  document.getElementById("knapKort").setAttribute("aria-pressed", String(!sat));
  document.getElementById("knapSat").setAttribute("aria-pressed", String(sat));
}
