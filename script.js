const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});


// Dynamic "Today in the Lab" timetable. Entries are transcribed from the supplied timetable.
const weeklyLabSchedule = {
  Monday: [{ time: "9:00 – 11:00", group: "BTech. CSE 2", instructor: "Dr. Shiju. E" }],
  Tuesday: [{ time: "2:00 – 4:00", group: "BTech. CSE 1", instructor: "Dr. Shiju. E" }],
  Wednesday: [{ time: "9:00 – 11:00", group: "BTech. ECE", instructor: "Dr. Shiju. E" }],
  Thursday: [
    { time: "9:00 – 11:00", group: "BTech. ECE", instructor: "Dr. Shiju. E" },
    { time: "2:00 – 4:00", group: "BTech. CSE 1", instructor: "Dr. Shiju. E" }
  ],
  Friday: [{ time: "9:00 – 11:00", group: "BTech. CSE 2", instructor: "Dr. Shiju. E" }],
  Saturday: [], Sunday: []
};

function parseSessionStart(timeText){
  const m = timeText.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if(!m) return null;
  let hour = Number(m[1]), minute = Number(m[2]);
  // The supplied timetable uses 24-hour time.
  return {hour, minute};
}

function getUpcomingSessions(now){
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  // Show all sessions on the next lab day, rather than limiting the
  // preview to a fixed number of sessions. This is important when a
  // single day contains multiple batches, such as Thursday (ECE 9–11 AM
  // and CSE 1 2–4 PM).
  for(let offset = 1; offset <= 7; offset++){
    const d = new Date(now);
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + offset);
    const day = dayNames[d.getDay()];
    const daySessions = (weeklyLabSchedule[day] || []).map(session => {
      const start = parseSessionStart(session.time);
      if(!start) return null;
      const occurrence = new Date(d);
      occurrence.setHours(start.hour, start.minute, 0, 0);
      return occurrence > now ? {date: occurrence, day, ...session} : null;
    }).filter(Boolean);

    if(daySessions.length){
      return daySessions.sort((a,b)=>a.date-b.date);
    }
  }

  return [];
}

function renderTodayLab() {
  const dateEl = document.getElementById("today-date"), statusEl = document.getElementById("today-status"), listEl = document.getElementById("session-list"), upcomingList = document.getElementById("upcoming-list"), upcomingToggle = document.getElementById("upcoming-toggle"), upcomingWrap = document.getElementById("upcoming-wrap");
  if (!dateEl || !statusEl || !listEl) return;
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const date = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const sessions = weeklyLabSchedule[day] || [];
  dateEl.textContent = date;
  const dateBlock = document.getElementById("today-date-block");
  if (dateBlock) {
    dateBlock.innerHTML = `<span class="today-date-day">${now.getDate()}</span><span class="today-date-month">${now.toLocaleDateString("en-US", {month:"short"}).toUpperCase()}</span><span class="today-date-weekday">${now.toLocaleDateString("en-US", {weekday:"long"}).toUpperCase()}</span>`;
  }
  statusEl.textContent = sessions.length ? `LAB SESSION (${sessions.length} TODAY)` : "NO LAB SESSION TODAY";
  listEl.innerHTML = sessions.length ? sessions.map(session => {
    const times = String(session.time).split(/\s*[–—-]\s*/);
    const rawStart = times[0] || session.time;
    const rawEnd = times[1] || "";
    // Keep AM/PM only once for a range when both times share the same period.
    // The source timetable is in 24-hour notation: 9–11 is AM; 14–16 is PM.
    const periodFor = value => {
      const m = String(value).match(/(\d{1,2})\s*:\s*(\d{2})/);
      if (!m) return "";
      const h = Number(m[1]);
      return h >= 12 ? "PM" : "AM";
    };
    const format12 = value => {
      const m = String(value).match(/(\d{1,2})\s*:\s*(\d{2})/);
      if (!m) return String(value).trim();
      let h = Number(m[1]);
      h = h % 12 || 12;
      return h + ":" + m[2];
    };
    const startPeriod = periodFor(rawStart);
    const endPeriod = rawEnd ? periodFor(rawEnd) : "";
    const periodLabel = rawEnd && startPeriod !== endPeriod ? `${startPeriod} / ${endPeriod}` : (startPeriod || endPeriod);
    const start = format12(rawStart);
    const end = rawEnd ? format12(rawEnd) : "";
    const timeRange = end ? `${start} – ${end}` : start;
    const batch = String(session.group || "").replace(/^BTech\.?\s*/i, "").replace(/\s+/g, "").replace(/^CSE([12])$/i, "CSE$1").toUpperCase();
    const periodClass = startPeriod === "AM" ? "session-am" : (startPeriod === "PM" ? "session-pm" : "session-am-pm");
    return `<article class="session-card ${periodClass}"><div class="session-time"><span class="session-time-period">${periodLabel}</span><div class="session-time-range"><strong>${timeRange}</strong></div></div><div class="session-main"><span class="session-group">${batch}</span><span class="session-instructor">${session.instructor}</span></div></article>`;
  }).join("") : `<div class="today-empty">There are no FOUNDATION OF QUANTUM AND PHOTONIC TECHNOLOGIES LAB sessions scheduled for ${day}.</div>`;

  if(upcomingList){
    const upcoming = getUpcomingSessions(now);

    // Group by calendar date and render one compact inline row per date.
    const upcomingGroups = [];
    upcoming.forEach(session => {
      const key = session.date.toISOString().slice(0, 10);
      let group = upcomingGroups.find(item => item.key === key);
      if (!group) {
        group = { key, date: session.date, sessions: [] };
        upcomingGroups.push(group);
      }
      group.sessions.push(session);
    });

    upcomingList.innerHTML = upcomingGroups.length ? upcomingGroups.map(group => {
      group.sessions.sort((a,b) => a.date - b.date);
      const dateLabel = group.date.toLocaleDateString("en-IN", {weekday:"short", day:"numeric", month:"short"});
      const sessionText = group.sessions.map(session =>
        `${session.time} — ${session.group}`
      ).join(' | ');
      return `<div class="upcoming-inline-row" data-date="${group.key}"><span class="upcoming-inline-date">${dateLabel}</span><span class="upcoming-inline-sep">|</span><span class="upcoming-inline-sessions">${sessionText}</span></div>`;
    }).join("") : `<div class="today-empty">No upcoming lab sessions found.</div>`;

    if (upcomingToggle && upcomingWrap) {
      upcomingToggle.hidden = upcoming.length === 0;
      upcomingToggle.addEventListener("click", () => {
        const willOpen = upcomingWrap.hidden;
        upcomingWrap.hidden = !willOpen;
        upcomingToggle.setAttribute("aria-expanded", String(willOpen));
        const upcomingLabel = upcomingToggle.querySelector(".today-upcoming-label");
        if (upcomingLabel) upcomingLabel.textContent = willOpen ? "Hide Upcoming Sessions" : "View Upcoming Sessions";
      });
    }
  }
}
renderTodayLab();


// Compact homepage search. Results are rendered as an overlay beneath the header,
// so opening/searching never increases the header height.
const navSearch = document.getElementById("nav-search");
const navSearchInput = document.getElementById("nav-search-input");
const navSearchButton = document.getElementById("nav-search-button");
const navSearchResults = document.getElementById("nav-search-results");

const labSearchIndex = [
  {e:"01", title:"Diffraction Grating", section:"Theory", id:"theory", terms:"diffraction grating fraunhofer interference grating element d sin theta n lambda wavelength mercury spectral lines"},
  {e:"01", title:"Diffraction Grating", section:"Visualize", id:"visual", terms:"diffraction interference wave interference path difference maxima minima"},
  {e:"01", title:"Diffraction Grating", section:"Calculations", id:"calculator", terms:"least count main scale division vernier wavelength angle readings spectrometer regression linear fit"},
  {e:"01", title:"Diffraction Grating", section:"Procedure", id:"procedure", terms:"spectrometer telescope collimator grating normal incidence first order spectrum"},
  {e:"02", title:"Refractive Index of Prism", section:"Theory", id:"theory", terms:"prism refraction refractive index minimum deviation snell law prism angle incidence emergence internal symmetry"},
  {e:"02", title:"Refractive Index of Prism", section:"Calculations", id:"calculator", terms:"minimum deviation 2a b minus a prism angle spectrometer msr vsr total reading vernier"},
  {e:"02", title:"Refractive Index of Prism", section:"Procedure", id:"procedure", terms:"spectrometer prism direct image refracted image minimum deviation telescope collimator"},
  {e:"03", title:"Photoelectric Effect", section:"Theory", id:"theory", terms:"photoelectric effect photon planck constant h nu work function stopping potential einstein equation threshold frequency"},
  {e:"03", title:"Photoelectric Effect", section:"Calculations", id:"calculations", terms:"planck constant work function frequency wavelength stopping potential slope graph linear regression"},
  {e:"03", title:"Photoelectric Effect", section:"Calculations", id:"calculator", terms:"filter readings voltage frequency stopping potential current"},
  {e:"04", title:"Circular Coil", section:"Theory", id:"theory", terms:"biot savart law circular coil magnetic field current carrying coil earth horizontal magnetic field"},
  {e:"04", title:"Circular Coil", section:"Visualize", id:"visualize", terms:"magnetic field circular coil axis field variation axial distance center"},
  {e:"04", title:"Circular Coil", section:"Calculations", id:"calculations", terms:"tangent law deflection magnetometer earth field bh tan theta current radius number turns"},
  {e:"04", title:"Circular Coil", section:"Demonstration", id:"demonstration", terms:"circular coil magnetometer deflection experiment bh"},
  {e:"04", title:"Circular Coil", section:"Observations", id:"observations", terms:"axial distance left right reading magnetic field graph variation center coil"},
  {e:"05", title:"Newton’s Rings", section:"Theory", id:"theory", terms:"newtons rings interference division amplitude air film dark fringe sodium wavelength diameter radius curvature"},
  {e:"05", title:"Newton’s Rings", section:"Visualize", id:"visualize", terms:"optical arrangement plano convex lens glass plate sodium lamp travelling microscope concentric rings"},
  {e:"05", title:"Newton’s Rings", section:"Observations", id:"observations", terms:"main scale division vernier least count microscope readings left right diameter Dn squared rings"},
  {e:"05", title:"Newton’s Rings", section:"Calculations", id:"calculations", terms:"wavelength sodium lambda focal length radius curvature p 10 Dn+p squared Dn squared"},
  {e:"06", title:"Diffraction of Laser", section:"Theory", id:"theory", terms:"laser diffraction grating He-Ne wavelength grating element d sin theta n lambda"},
  {e:"06", title:"Diffraction of Laser", section:"Visualize", id:"visualize", terms:"diffraction pattern screen first order second order distance D y1 y2"},
  {e:"06", title:"Diffraction of Laser", section:"Observations", id:"observations", terms:"grating lines N distance screen left right mean Y theta sin wavelength"},
  {e:"06", title:"Diffraction of Laser", section:"Calculations", id:"calculations", terms:"grating equation wavelength diffraction angle first order second order He-Ne laser"},
  {e:"08", title:"P-N Junction Diode Characteristics", section:"Theory", id:"theory", terms:"p-n junction diode semiconductor depletion region forward bias reverse bias diode equation knee voltage breakdown"},
  {e:"08", title:"P-N Junction Diode Characteristics", section:"Visualize", id:"visualize", terms:"forward bias reverse bias circuit V-I characteristic knee cut-in voltage"},
  {e:"08", title:"P-N Junction Diode Characteristics", section:"Observations", id:"observations", terms:"forward voltage current milliampere reverse voltage microampere observation table"},
  {e:"08", title:"P-N Junction Diode Characteristics", section:"Calculations", id:"calculations", terms:"dc resistance dynamic resistance delta V delta I knee voltage V-I graph"}
];

function normaliseSearchText(value){
  return value.toLowerCase().replace(/[–—−]/g,"-").replace(/[^a-z0-9.\s-]/g," ").replace(/\s+/g," ").trim();
}
function scoreSearchResult(item, query){
  const q=normaliseSearchText(query);
  const tokens=q.split(/\s+/).filter(Boolean);
  if(!tokens.length) return 0;
  const title=normaliseSearchText(item.title), section=normaliseSearchText(item.section), terms=normaliseSearchText(item.terms);
  let score=0;
  if(title.includes(q)) score+=12;
  if(section.includes(q)) score+=7;
  if(terms.includes(q)) score+=8;
  tokens.forEach(t=>{
    if(title.includes(t)) score+=5;
    else if(section.includes(t)) score+=3;
    else if(terms.includes(t)) score+=1;
  });
  return score;
}
// Move the result panel to <body> so no header/hero stacking or clipping context can hide it.
if(navSearchResults && navSearchResults.parentElement !== document.body){
  document.body.appendChild(navSearchResults);
}
function positionNavSearchResults(){
  if(!navSearch || !navSearchResults || !navSearchResults.classList.contains("open")) return;
  const r=navSearch.getBoundingClientRect();
  const gap=8;
  const panelWidth=Math.min(320, window.innerWidth-30);
  let left=r.right-panelWidth;
  if(left<15) left=15;
  if(left+panelWidth>window.innerWidth-15) left=window.innerWidth-15-panelWidth;
  navSearchResults.style.width=panelWidth+"px";
  navSearchResults.style.left=Math.max(15,left)+"px";
  navSearchResults.style.top=(r.bottom+gap)+"px";
}
function closeNavSearch(){
  navSearchResults?.classList.remove("open");
  navSearchInput?.setAttribute("aria-expanded","false");
}
function renderNavSearch(query){
  if(!navSearchResults || !navSearchInput) return;
  const q=query.trim();
  if(!q){ navSearchResults.innerHTML=""; closeNavSearch(); return; }
  const results=labSearchIndex.map((item,index)=>({item,index,score:scoreSearchResult(item,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score || a.index-b.index).slice(0,6);
  navSearchResults.innerHTML=results.length ? results.map(({item})=>`<a class="nav-search-result" role="option" href="experiment-${item.e}.html#${item.id}"><strong>Experiment ${item.e} · ${item.title}</strong><span>${item.section} <em>↗</em></span></a>`).join("") : `<div class="nav-search-message">No matching experiment section found.</div>`;
  navSearchResults.classList.add("open");
  navSearchInput.setAttribute("aria-expanded","true");
  positionNavSearchResults();
}

navSearchInput?.addEventListener("input", e=>renderNavSearch(e.target.value));
navSearchInput?.addEventListener("focus", e=>{ if(e.target.value.trim()) renderNavSearch(e.target.value); });
navSearchButton?.addEventListener("click", ()=>{
  if(!navSearchInput) return;
  if(navSearchInput.value.trim()) renderNavSearch(navSearchInput.value);
  navSearchInput.focus();
});
navSearchResults?.addEventListener("click", ()=>closeNavSearch());
document.addEventListener("click", e=>{ if(navSearch && !navSearch.contains(e.target)) closeNavSearch(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeNavSearch(); });
window.addEventListener("resize", positionNavSearchResults, {passive:true});
window.addEventListener("scroll", positionNavSearchResults, {passive:true});
