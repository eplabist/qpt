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
