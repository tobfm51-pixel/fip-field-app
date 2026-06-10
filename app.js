const STORE_KEY = 'fip-field-test-v1';
const pages = [...document.querySelectorAll('.page')];
const navs = [...document.querySelectorAll('.nav')];
const title = document.getElementById('pageTitle');
const saveBtn = document.getElementById('saveBtn');
const preview = document.getElementById('preview');
let data = load();

function load(){ try{return JSON.parse(localStorage.getItem(STORE_KEY)) || {app:'FIP Field Notes', version:1, updatedAt:new Date().toISOString()};}catch{return {app:'FIP Field Notes', version:1};}}
function save(){ data.updatedAt = new Date().toISOString(); localStorage.setItem(STORE_KEY, JSON.stringify(data)); saveBtn.textContent='Saved'; setTimeout(()=>saveBtn.textContent='Saved',800); updatePreview();}
function setDirty(){ saveBtn.textContent='Saving…'; clearTimeout(window.__saveTimer); window.__saveTimer=setTimeout(save,250);}
function bindValues(){
  document.querySelectorAll('[data-key]').forEach(el=>{
    const key = el.dataset.key;
    if(el.classList.contains('seg')){
      el.querySelectorAll('button').forEach(btn=>{btn.classList.toggle('selected', data[key]===btn.textContent); btn.onclick=()=>{data[key]=btn.textContent; bindValues(); setDirty();};});
    } else if(el.type === 'checkbox') { el.checked = !!data[key]; el.onchange=()=>{data[key]=el.checked; setDirty();};
    } else { if(data[key]!==undefined) el.value = data[key]; el.oninput=()=>{data[key]=el.value; setDirty();}; }
  });
  updatePreview();
}
function go(page){ pages.forEach(p=>p.classList.toggle('active',p.id===page)); navs.forEach(n=>n.classList.toggle('active',n.dataset.page===page)); title.textContent = ({dashboard:'Dashboard',incident:'Initial Info',building:'Building',utilities:'Utilities',origin:'Origin / Cause',witnesses:'People',export:'Export'})[page] || 'FIP'; window.scrollTo(0,0); }
navs.forEach(n=>n.onclick=()=>go(n.dataset.page));
document.querySelectorAll('.quick').forEach(b=>b.onclick=()=>go(b.dataset.page));
function filename(){ const c=(data.caseNumber || 'FIP_CASE').replace(/[^a-z0-9_-]/gi,'_'); return `${c}.fip`; }
document.getElementById('exportBtn').onclick=()=>{ save(); const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename(); a.click(); URL.revokeObjectURL(a.href); };
document.getElementById('importFile').onchange=async e=>{ const file=e.target.files[0]; if(!file) return; try{ data=JSON.parse(await file.text()); localStorage.setItem(STORE_KEY, JSON.stringify(data)); bindValues(); alert('FIP case imported.'); }catch{ alert('That file could not be imported.'); }};
document.getElementById('clearBtn').onclick=()=>{ if(confirm('Clear this test case from this device?')){ localStorage.removeItem(STORE_KEY); data=load(); document.querySelectorAll('input,textarea,select').forEach(el=>{ if(el.type==='file') return; if(el.type==='checkbox') el.checked=false; else el.value=''; }); bindValues(); save(); }};
function updatePreview(){ if(preview) preview.textContent = JSON.stringify(data,null,2); }
if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{})); }
bindValues();
