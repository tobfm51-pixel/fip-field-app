/* Fire Investigation Field Notes - Alpha 1.2 PWA foundation */
const STORE_KEY = 'fip_field_notes_case_v12';
const LEGACY_KEYS = ['fip_field_notes_case_v05','fip_field_notes_case_v04','fip_field_notes_case','fip_case','fip_saved_case'];
const $ = s => document.querySelector(s);
const content = $('#content');
const titleEl = $('#screenTitle');
const saveStatus = $('#saveStatus');
const sectionNav = $('#sectionNav');
const INCIDENT_TYPES = ['Structure','Vehicle','Machinery','Outside Fire','Explosion','Other'];

const SCREEN_REGISTRY = [
  {id:'dashboard', icon:'⌂', label:'Home', title:'Dashboard', accepted:true},
  {id:'initial', icon:'🚒', label:'Initial', title:'Initial Information', accepted:true},
  {id:'scene', icon:'◇', label:'Scene', title:'Initial Scene Assessment', accepted:true},
  {id:'building', icon:'⌂', label:'Bldg', title:'Building', accepted:true},
  {id:'utilities', icon:'⚡', label:'Util', title:'Utilities', accepted:true},
  {id:'electrical', icon:'⏚', label:'Elec', title:'Electrical', accepted:true},
  {id:'exterior', icon:'▱', label:'Exterior', title:'Exterior Examination', accepted:true},
  {id:'roof', icon:'⌃', label:'Roof', title:'Roof Examination', accepted:true},
  {id:'deck', icon:'▭', label:'Deck', title:'Deck', accepted:false},
  {id:'interior', icon:'▦', label:'Interior', title:'Interior Examination', accepted:true},
  {id:'people', icon:'👥', label:'People', title:'People / Interested Parties', accepted:true},
  {id:'vehicles', icon:'🚗', label:'Vehicle', title:'Vehicles', accepted:true},
  {id:'machinery', icon:'⚙', label:'Machine', title:'Machinery / Equipment', accepted:true},
  {id:'exposures', icon:'⌂', label:'Expose', title:'Exposure Structures', accepted:true},
  {id:'rooms', icon:'▦', label:'Rooms', title:'Rooms / Windows / Electrical', accepted:true},
  {id:'smokeAlarms', icon:'◉', label:'Alarms', title:'Repeatable Smoke Alarms', accepted:false},
  {id:'areaOrigin', icon:'◎', label:'Origin', title:'Area(s) of Origin', accepted:true},
  {id:'firePatterns', icon:'▧', label:'Pattern', title:'Fire Patterns', accepted:true},
  {id:'ignitionSources', icon:'♨', label:'Ignition', title:'Potential Ignition Sources', accepted:true},
  {id:'ignitionMatrix', icon:'▥', label:'Matrix', title:'Ignition Source Assessment Matrix', accepted:true},
  {id:'photos', icon:'📷', label:'Photos', title:'Photos', accepted:true},
  {id:'evidence', icon:'▣', label:'Evidence', title:'Evidence', accepted:true},
  {id:'interviews', icon:'❝', label:'Interview', title:'Interviews', accepted:true},
  {id:'timeline', icon:'◷', label:'Timeline', title:'Timeline', accepted:false},
  {id:'tasks', icon:'☑', label:'Tasks', title:'Tasks', accepted:false},
  {id:'reports', icon:'▤', label:'Report', title:'Reports', accepted:true},
  {id:'files', icon:'⇪', label:'Files', title:'Files / Export', accepted:true}
];


const blank = () => {
  const now = new Date().toISOString();
  const caseId = id();
  return {
  meta:{app:'Fire Investigation Field Notes',version:'1.2',createdAt:now,updatedAt:now},
  case:{id:caseId,active:true,caseNumber:defaultFmNumber(),incidentType:'Structure',incidentTypeOther:'',incidentAddress:'',primaryInvestigator:'C. Mount, #5572',assistedBy:'',caseStatus:'Draft',createdAt:now,createdBy:'',updatedAt:now,updatedBy:''},
  initial:{caseNumber:defaultFmNumber(),incidentType:'Structure',incidentTypeOther:'',cause:'Undetermined',reportedDate:'',reportedTime:'',dispatchSame:'',dispatchDate:'',dispatchTime:'',arrivalDate:'',arrivalTime:'',sceneReleasedDate:'',sceneReleasedTime:'',incidentAddress:'',city:'',state:'VA',authority:'Exigency',consentName:'',otherLEO:[],leoOther:'',notes:''},
  caller:{name:'',phone:'',address:'',whatObserved:''},
  fireDept:{department:'',incidentCommander:'',icUnit:'',alarms:'',firstEngine:'',engineOfficer:'',engineActivity:'',firstTruck:'',truckOfficer:'',truckActivity:'',fdNotes:''},
  environment:{temperature:'',humidity:'',windDirection:'',windSpeed:'',dayNight:'',conditions:[]},
  scene:{frontDirection:'',frontFacesToward:'',narrative:'',illumination:[],illuminationNotes:''},
  exterior:{front:'',left:'',rear:'',right:''},
  building:{propertyDescription:'',residentialType:'',commercialType:'',otherUse:'',yearBuilt:'',stories:'',length:'',width:'',assessedValue:'',percentInvolved:'',openPermits:'',priorClaims:'',status:'',underConstruction:'',fence:'',fenceType:'',fenceDamage:'',constructionType:'',foundationType:'',foundationMaterial:'',exteriorCovering:'',roofCovering:'',roofStyle:'',roofCondition:'',roofVentilation:'',solarPanels:'',roofNotes:'',alarmNotes:''},
  deck:{present:'Unknown',location:'',material:'',attachment:'',size:'',condition:'',damage:'',fireInvolvement:'',notes:''},
  interior:{general:'',firstFloor:'',secondFloor:'',basement:'',attic:'',garage:'',other:''},
  utilities:{electricOn:'',electricServiceType:'',electricProvider:'',electricProviderOther:'',electricMeterLocation:'',mainDisconnectLocation:'',gasOn:'',fuelType:'',gasProvider:'',gasMeterLocation:'',lpTank:'',lpTankSize:'',lpLocation:'',generatorPresent:'',generatorLocation:'',generatorNotes:'',batteryStoragePresent:'',batteryStorageLocation:'',batteryType:'',batteryStorageNotes:'',notes:''},
  electrical:{serviceNotes:'',panels:[],circuits:[]},
  lifeSafety:{smokeAlarms:'',smokeAlerted:'',smokeHardwired:'',smokeBattery:'',batteriesInPlace:'',coDetectors:'',coAlerted:'',fireAlarm:'',fireAlarmActivated:'',sprinklers:'',sprinklersFunctioned:'',controlValves:'',standpipes:'',securityCameras:'',hiddenKeys:'',hiddenKeyLocation:'',securityBars:'',notes:''},
  smokeAlarms:[],
  people:[], vehicles:[], machinery:[], rooms:[], windows:[], originAreas:[], firePatterns:[], ignitionSources:[], ignitionMatrix:[], exposureStructures:[], evidence:[], photos:[], interviews:[], notes:[], assignments:[], timeline:[], customTasks:[],
  report:{areaOfOrigin:'',causeClassification:'Undetermined',ignitionSource:'',firstFuel:'',oxidizingAgent:'normal atmospheric oxygen',structureLoss:'',contentsLoss:'',status:'Open',narrative:'',electricalNotes:''},
  tasks:{initialReport:{label:'Submit Initial Report',status:'Open',due:'',notes:''},googleDrive:{label:'Upload Photos to Google Drive',status:'Open',due:'',notes:''},lcsoEvidence:{label:'Upload Photos to LCSO Digital Evidence Platform',status:'Open',due:'',notes:''}},
  settings:{investigator:'C. Mount, #5572',agencyLabel:'',useAgencyBranding:false,firstEvidenceItem:'E001',firstPhotoNumber:'P001'}
  };
};
let state = migrate(load());
let current = 'dashboard';
let autosaveTimer = null;

function inactiveBlank(){ const fresh = blank(); fresh.case.active = false; return fresh; }
function hasActiveCase(){ return state?.case?.active === true; }
function activateCase(){ state.case.active = true; state.case.updatedAt = new Date().toISOString(); }
function load(){
  try{ const raw = localStorage.getItem(STORE_KEY); if(raw) return JSON.parse(raw); }catch(e){}
  for(const k of LEGACY_KEYS){ try{ const raw = localStorage.getItem(k); if(raw) return JSON.parse(raw); }catch(e){} }
  return inactiveBlank();
}
function migrate(data){
  const base = blank();
  const deep = (b,d) => {
    if(!d || typeof d !== 'object') return b;
    for(const k of Object.keys(d)){
      if(Array.isArray(base[k]) || Array.isArray(b[k])) b[k] = Array.isArray(d[k]) ? d[k] : [];
      else if(b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) b[k] = deep({...b[k]}, d[k]);
      else b[k] = d[k] ?? b[k];
    }
    return b;
  };
  const out = deep(base, data||{});
  migrateIncidentType(out);
  migrateUtilities(out.utilities);
  ['people','vehicles','machinery','rooms','windows','originAreas','firePatterns','ignitionSources','ignitionMatrix','exposureStructures','evidence','photos','interviews','notes','assignments','smokeAlarms','timeline','customTasks'].forEach(k=>{ if(!Array.isArray(out[k])) out[k]=[]; });
  if(!out.electrical || typeof out.electrical !== 'object' || Array.isArray(out.electrical)) out.electrical = {serviceNotes:'',panels:[],circuits:[]};
  ['panels','circuits'].forEach(k=>{ if(!Array.isArray(out.electrical[k])) out.electrical[k]=[]; });
  out.electrical.panels = out.electrical.panels.map(migrateElectricalPanel);
  out.people = out.people.map(migratePerson);
  out.evidence = out.evidence.map(migrateEvidence);
  out.rooms = out.rooms.map(room=>{ const r={...room}; delete r.areaOfOrigin; return r; });
  out.originAreas = out.originAreas.map(origin=>{ const o={...origin}; delete o['supporting'+'Photos']; return o; });
  delete out.case?.['juris'+'diction'];
  delete out.initial?.['juris'+'diction'];
  delete out['section'+'Status'];
  delete out.caller?.['how'+'Reported'];
  delete out.initial?.['date'+'Notified'];
  delete out.initial?.['time'+'Notified'];
  if(out.settings.firstEvidenceItem === undefined) out.settings.firstEvidenceItem = `${out.settings['evidence'+'Prefix'] || 'E'}001`;
  if(out.settings.firstPhotoNumber === undefined) out.settings.firstPhotoNumber = `${out.settings['photo'+'Prefix'] || 'P'}001`;
  delete out.settings['evidence'+'Prefix'];
  delete out.settings['photo'+'Prefix'];
  out.tasks = {...blank().tasks, ...(out.tasks || {})};
  if(!Array.isArray(out.customTasks)) out.customTasks = [];
  if(!Array.isArray(out.timeline)) out.timeline = [];
  out.meta.version='1.2';
  if(!out.case || typeof out.case !== 'object') out.case = blank().case;
  if(!out.case.id) out.case.id = id();
  if(out.case.active !== false) out.case.active = true;
  syncCaseFromLegacy(out);
  out.meta.updatedAt=new Date().toISOString();
  return out;
}
function normalizeIncidentType(value){
  const map = {'Vehicle/Machinery':'Vehicle', Outside:'Outside Fire', Explosives:'Explosion'};
  const normalized = map[value] || value;
  return INCIDENT_TYPES.includes(normalized) ? normalized : (normalized ? 'Other' : 'Structure');
}
function migrateIncidentType(target){
  const raw = target.initial?.incidentType || target.case?.incidentType || 'Structure';
  const type = normalizeIncidentType(raw);
  const other = target.initial?.incidentTypeOther || target.case?.incidentTypeOther || (type === 'Other' ? raw : '');
  target.initial.incidentType = type;
  target.case.incidentType = type;
  target.initial.incidentTypeOther = other;
  target.case.incidentTypeOther = other;
}
function migrateUtilities(utilities){
  if(!utilities || typeof utilities !== 'object') return;
  const presentMap = {On:'Yes', Off:'No', None:'No'};
  if(presentMap[utilities.gasOn]) utilities.gasOn = presentMap[utilities.gasOn];
  if(!utilities.lpTank && utilities.fuelType === 'Propane') utilities.lpTank = 'Yes';
}

function migrateElectricalPanel(panel){
  const p = {...panel};
  if(!p.id) p.id = id();
  if(p.spaces === undefined || p.spaces === '') p.spaces = '40';
  if(!p.breakers || typeof p.breakers !== 'object' || Array.isArray(p.breakers)) p.breakers = {};
  return p;
}
function migratePerson(person){
  const p = {...person};
  const roleMap = {'Renter/Lessee':'Renter', Firefighter:'Fire Department'};
  const normalizedRole = roleMap[p.role] || p.role;
  if(!Array.isArray(p.roles)) p.roles = normalizedRole ? [normalizedRole] : [];
  p.roles = [...new Set(p.roles.map(r => roleMap[r] || r).filter(Boolean))];
  if(!p.role && p.roles.length) p.role = p.roles[0];
  if(p.olnState === undefined) p.olnState = '';
  if(p.social === undefined) p.social = '';
  return p;
}

function migrateEvidence(item){
  const e = {...item};
  if(e.evidenceSecured === undefined){
    if(e['property'+'Counter'] === 'Yes') e.evidenceSecured = 'LCSO Property Counter';
    else e.evidenceSecured = e.station || '';
  }
  if(e.dateSecured === undefined) e.dateSecured = '';
  if(e.timeSecured === undefined) e.timeSecured = '';
  if(e.lockerStorageLocation === undefined) e.lockerStorageLocation = e.locker || '';
  delete e['la'+'b'];
  return e;
}
function syncCaseFromLegacy(target=state){
  const incidentType = normalizeIncidentType(target.initial.incidentType || target.case.incidentType || 'Structure');
  const incidentTypeOther = target.initial.incidentTypeOther || target.case.incidentTypeOther || '';
  target.case.caseNumber = target.initial.caseNumber || target.case.caseNumber || '';
  target.case.incidentType = incidentType;
  target.case.incidentTypeOther = incidentTypeOther;
  target.case.incidentAddress = target.initial.incidentAddress || target.case.incidentAddress || '';
  target.case.primaryInvestigator = target.settings.investigator || target.case.primaryInvestigator || '';
  target.initial.caseNumber = target.case.caseNumber || target.initial.caseNumber || '';
  target.initial.incidentType = incidentType;
  target.initial.incidentTypeOther = incidentTypeOther;
  target.initial.incidentAddress = target.case.incidentAddress || target.initial.incidentAddress || '';
  target.settings.investigator = target.case.primaryInvestigator || target.settings.investigator || '';
}
function syncCaseAfterPath(path){
  if(path.startsWith('case.')){
    state.initial.caseNumber = state.case.caseNumber || '';
    state.initial.incidentType = normalizeIncidentType(state.case.incidentType || 'Structure');
    state.case.incidentType = state.initial.incidentType;
    state.initial.incidentTypeOther = state.case.incidentTypeOther || '';
    state.initial.incidentAddress = state.case.incidentAddress || '';
    state.settings.investigator = state.case.primaryInvestigator || '';
  } else if(path.startsWith('initial.') || path.startsWith('settings.')) {
    syncCaseFromLegacy(state);
  }
}
const caseEngine = {
  create(){
    const now = new Date().toISOString();
    const investigator = state.case?.primaryInvestigator || state.settings.investigator || 'C. Mount, #5572';
    state = blank();
    state.case.id = id();
    state.case.active = true;
    state.case.createdAt = now;
    state.case.updatedAt = now;
    state.case.primaryInvestigator = investigator;
    state.settings.investigator = investigator;
    syncCaseFromLegacy(state);
    save();
    render('initial');
  },
  createFromWizard(){
    const caseNumber = state.initial.caseNumber || defaultFmNumber();
    const incidentType = normalizeIncidentType(state.initial.incidentType || 'Structure');
    const incidentTypeOther = state.initial.incidentTypeOther || '';
    const incidentAddress = state.initial.incidentAddress || state.case.incidentAddress || '';
    const city = state.initial.city || '';
    const firstEvidenceItem = state.settings.firstEvidenceItem || 'E001';
    const firstPhotoNumber = state.settings.firstPhotoNumber || 'P001';
    const createdDate = localDateTimeParts().date;
    this.create();
    state.initial.caseNumber = caseNumber;
    state.case.caseNumber = caseNumber;
    state.initial.incidentType = incidentType;
    state.case.incidentType = incidentType;
    state.initial.incidentTypeOther = incidentTypeOther;
    state.case.incidentTypeOther = incidentTypeOther;
    state.initial.incidentAddress = incidentAddress;
    state.case.incidentAddress = incidentAddress;
    state.initial.city = city;
    state.settings.firstEvidenceItem = firstEvidenceItem;
    state.settings.firstPhotoNumber = firstPhotoNumber;
    state.initial.reportedDate = state.initial.reportedDate || createdDate;
    state.initial.dispatchDate = state.initial.dispatchDate || createdDate;
    state.initial.arrivalDate = state.initial.arrivalDate || createdDate;
    save();
    render('initial');
  },
  summary(){ syncCaseFromLegacy(state); return state.case; },
  requiredMissing(){
    const c = this.summary();
    const checks = [['Case Number', c.caseNumber], ['Incident Type', c.incidentType], ['Incident Address', c.incidentAddress], ['Primary Investigator', c.primaryInvestigator]];
    return checks.filter(([,v]) => !String(v||'').trim()).map(([label]) => label);
  },
  initialComplete(){ return this.requiredMissing().length === 0 && Boolean(state.initial.reportedDate); }
};
function save(){ syncCaseFromLegacy(state); state.meta.updatedAt = new Date().toISOString(); state.case.updatedAt = state.meta.updatedAt; localStorage.setItem(STORE_KEY, JSON.stringify(state)); saveStatus.textContent='Autosaved ' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); updateCaseRibbon(); }
function scheduleSave(){ saveStatus.textContent='Saving…'; clearTimeout(autosaveTimer); autosaveTimer=setTimeout(save, 350); }
function pathGet(path){ return path.split('.').reduce((o,k)=>o?.[k], state) ?? ''; }
function collectionGet(path){ const arr=pathGet(path); return Array.isArray(arr) ? arr : []; }
function collectionAdd(path,item){ const a=path.split('.'); let o=state; while(a.length>1){ const k=a.shift(); if(!o[k] || typeof o[k] !== 'object') o[k]={}; o=o[k]; } const k=a[0]; if(!Array.isArray(o[k])) o[k]=[]; o[k].push(item); save(); }
function collectionRemove(path,index){ const arr=collectionGet(path); arr.splice(Number(index),1); save(); }
function pathSetRaw(path,val){ const a=path.split('.'); let o=state; while(a.length>1){ const k=a.shift(); if(!o[k]) o[k]={}; o=o[k]; } o[a[0]]=val; }
function pathSet(path,val){ pathSetRaw(path,val); if(/^evidence\.\d+\.evidenceSecured$/.test(path) && val){ const base=path.replace(/\.evidenceSecured$/, ''); const now=localDateTimeParts(); if(!pathGet(`${base}.dateSecured`)) pathSetRaw(`${base}.dateSecured`, now.date); if(!pathGet(`${base}.timeSecured`)) pathSetRaw(`${base}.timeSecured`, now.time); } syncCaseAfterPath(path); scheduleSave(); }
function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function field(label,path,type='text',opts={}){ const v=esc(pathGet(path)); const ph=opts.placeholder?` placeholder="${esc(opts.placeholder)}"`:''; if(type==='textarea') return `<div class="field"><label>${label}</label><textarea data-path="${path}"${ph}>${v}</textarea></div>`; if(type==='select') return `<div class="field"><label>${label}</label><select data-path="${path}">${(opts.options||[]).map(o=>`<option value="${esc(o)}" ${pathGet(path)==o?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`; return `<div class="field"><label>${label}</label><input type="${type}" data-path="${path}" value="${v}"${ph}></div>`; }
function seg(label,path,options){ const val=pathGet(path); return `<div class="field"><label>${label}</label><div class="seg">${options.map(o=>`<button class="pill ${val===o?'selected':''}" data-set="${path}" data-value="${esc(o)}" type="button">${esc(o)}</button>`).join('')}</div></div>`; }
function incidentTypeButtons(path,otherPath){ return `${seg('Incident Type',path,INCIDENT_TYPES)}${pathGet(path)==='Other' ? field('Other Incident Type',otherPath) : ''}`; }
function checks(label,path,options){ const arr=pathGet(path); return `<div class="field"><label>${label}</label><div class="seg">${options.map(o=>`<button class="pill ${Array.isArray(arr)&&arr.includes(o)?'selected':''}" data-toggle="${path}" data-value="${esc(o)}" type="button">${esc(o)}</button>`).join('')}</div></div>`; }
function card(title,body){ return `<div class="card"><h2>${title}</h2>${body}</div>`; }
function id(){ return Math.random().toString(36).slice(2,10); }
function defaultFmNumber(){ return `FM${String(new Date().getFullYear()).slice(-2)}0000`; }
function nextNumber(collection,firstNumber){ const seed=String(firstNumber || '001'); const offset=collection?.length || 0; const match=seed.match(/^(.*?)(\d+)$/); if(!match) return offset ? `${seed}${offset + 1}` : seed; const [,prefix,digits]=match; return `${prefix}${String(Number(digits) + offset).padStart(digits.length,'0')}`; }
function localDateTimeParts(){ const d=new Date(); const pad=n=>String(n).padStart(2,'0'); return {date:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`, time:`${pad(d.getHours())}:${pad(d.getMinutes())}`}; }
function bindInputs(){
  content.querySelectorAll('[data-path]').forEach(el=>{ const handler=e=>{ pathSet(e.target.dataset.path, e.target.value); if(e.target.dataset.path.endsWith('.interviewType') || e.target.dataset.path.endsWith('.evidenceSecured') || e.target.dataset.path.endsWith('.spaces')) render(current); }; el.addEventListener(el.tagName==='SELECT' ? 'change' : 'input', handler); });
  content.querySelectorAll('[data-set]').forEach(el=>el.addEventListener('click', e=>{ pathSet(e.currentTarget.dataset.set, e.currentTarget.dataset.value); render(current); }));
  content.querySelectorAll('[data-toggle]').forEach(el=>el.addEventListener('click', e=>{ const p=e.currentTarget.dataset.toggle, v=e.currentTarget.dataset.value; let arr=pathGet(p); if(!Array.isArray(arr)) arr=[]; arr = arr.includes(v) ? arr.filter(x=>x!==v) : [...arr,v]; pathSet(p,arr); render(current); }));
  content.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click', handleAction));
}
function setTitle(t){ titleEl.textContent=t; }
function updateCaseRibbon(){
  const ribbon = $('#caseRibbon');
  if(!ribbon) return;
  const c = caseEngine.summary();
  const chips = [['Case', c.caseNumber || 'No case #'], ['Type', c.incidentType || 'Unknown'], ['Address', c.incidentAddress || 'No address'], ['Status', c.caseStatus || 'Draft']];
  ribbon.innerHTML = chips.map(([label,value]) => `<div class="ribbon-chip"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('');
}
function visibleScreens(){
  const type = normalizeIncidentType(state.initial?.incidentType || state.case?.incidentType || 'Structure');
  const base = new Set(['dashboard','initial','scene','people','photos','evidence','interviews','timeline','tasks','reports','files','areaOrigin','firePatterns','ignitionSources','ignitionMatrix']);
  const structure = ['building','utilities','electrical','exterior','roof','deck','interior','rooms','smokeAlarms','exposures'];
  const byType = {
    Structure: structure,
    Vehicle: ['vehicles'],
    Machinery: ['machinery','utilities','electrical'],
    'Outside Fire': ['exterior','deck','exposures','utilities'],
    Explosion: ['building','utilities','electrical','exterior','interior','rooms','exposures'],
    Other: structure.concat(['vehicles','machinery'])
  };
  (byType[type] || byType.Structure).forEach(id=>base.add(id));
  return SCREEN_REGISTRY.filter(screen=>base.has(screen.id));
}
function isScreenVisible(screenId){ return visibleScreens().some(screen=>screen.id===screenId); }
function renderSectionNav(activeScreen=current){
  if(!sectionNav) return;
  sectionNav.innerHTML = visibleScreens().map(screen => `<button class="rail-btn ${screen.id===activeScreen?'active':''}" data-screen="${screen.id}" title="${esc(screen.title)}" type="button">${screen.icon}<span>${esc(screen.label)}</span></button>`).join('');
}
function noActiveCaseScreen(){
  setTitle('No Active Case');
  return `<div class="grid full">${card('Active Case Required',`<div class="warn">Create a new case or open a .fip file from the dashboard before using this module.</div><div class="actions"><button class="btn secondary" data-action="goDashboard">Back to Dashboard</button></div>`)}</div>`;
}
function render(screen=current){
  let requested = screen || 'dashboard';
  const map={dashboard,newCaseWizard,initial,scene,building,deck,utilities,electrical,exterior,roof,interior,rooms,areaOrigin,firePatterns,ignitionSources,ignitionMatrix,people,vehicles,machinery,exposures,photos,evidence,interviews,smokeAlarms,timeline,tasks,reports,files};
  if(requested !== 'dashboard' && requested !== 'newCaseWizard' && hasActiveCase() && !isScreenVisible(requested)) requested = 'dashboard';
  current = requested;
  renderSectionNav(requested);
  updateCaseRibbon();
  content.innerHTML = requested !== 'dashboard' && requested !== 'newCaseWizard' && !hasActiveCase() ? noActiveCaseScreen() : (map[requested]||dashboard)();
  bindInputs();
}

sectionNav?.addEventListener('click', e=>{ const button=e.target.closest('[data-screen]'); if(button) render(button.dataset.screen); });
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});

function dashboard(){
  setTitle('Case Overview');
  if(!hasActiveCase()){
    return `<div class="grid full">${card('No Active Case',`<div class="warn">No case is active. Create a new case or open a .fip file to begin.</div><div class="actions"><button class="btn secondary" data-action="newCaseWizard">New Case</button><button class="btn secondary" data-action="importFip">Open .fip</button></div>`)}</div>`;
  }
  const c = caseEngine.summary();
  const missing = caseEngine.requiredMissing();
  const counts = [['Origin Areas',state.originAreas.length],['Ignition Sources',state.ignitionSources.length],['Evidence',state.evidence.length],['Photos',state.photos.length]];
  const initialStatus = caseEngine.initialComplete() ? '<div class="ok">Initial information has the core case fields needed for field use.</div>' : `<div class="warn">Missing required case fields: ${missing.length ? missing.map(esc).join(', ') : 'Reported or notified date'}.</div>`;
  return `<div class="grid full"><div class="kpi">${counts.map(c=>`<div class="card"><div class="muted">${c[0]}</div><div class="kpi-num">${c[1]}</div></div>`).join('')}</div>${card('Case Overview',`${field('Case Number','case.caseNumber')}${incidentTypeButtons('case.incidentType','case.incidentTypeOther')}${field('Incident Address / Location','case.incidentAddress')}${field('Primary Investigator','case.primaryInvestigator')}${field('Assisted By','case.assistedBy')}${field('Case Status','case.caseStatus','select',{options:['Draft','Active','Pending Review','Closed','Reopened','Archived']})}<div class="actions"><button class="btn blue" data-action="exportFip">Export .fip</button><button class="btn secondary" data-action="importFip">Open .fip</button><button class="btn secondary" data-action="newCaseWizard">New Case</button></div><div class="muted">Case ID: ${esc(c.id)} • Updated: ${esc((c.updatedAt||state.meta.updatedAt||'').replace('T',' ').slice(0,19))}</div>`)}${card('Field Readiness',`<div class="row two"><div><span class="badge">${esc(c.caseStatus||'Draft')}</span><p class="muted">Incident type determines which base modules are shown in the section navigation.</p></div><div>${initialStatus}</div></div><div class="actions"><span class="badge">Offline-first</span><span class="badge">Autosave</span><span class="badge">.fip import/export</span><span class="badge">Shared case object</span></div>`)}</div>`;
}
function newCaseWizard(){
  setTitle('New Case');
  if(!state.initial.caseNumber) state.initial.caseNumber = defaultFmNumber();
  if(!state.case.caseNumber) state.case.caseNumber = state.initial.caseNumber;
  return `<div class="grid full">${card('New Case Wizard',`${field('FM Report Number','initial.caseNumber')}${field('Address','initial.incidentAddress','textarea')}${field('City','initial.city')}${incidentTypeButtons('initial.incidentType','initial.incidentTypeOther')}${field('First Evidence Item','settings.firstEvidenceItem')}${field('First Photo Number','settings.firstPhotoNumber')}<div class="actions"><button class="btn blue" data-action="createCaseFromWizard">Create Case</button><button class="btn secondary" data-action="goDashboard">Cancel</button></div><p class="muted">The default FM report number uses the FMYY0000 pattern and can be edited before creating the case. Reported, dispatch, and arrival dates are set to the created date after the case is created.</p>`)}</div>`;
}
function initial(){ setTitle('Initial Information'); return `<div class="grid">${card('Incident Information',`${field('FM Report Number','initial.caseNumber')}${field('Incident Address / Location','initial.incidentAddress','textarea')}${field('City','initial.city')}${field('State','initial.state')}${incidentTypeButtons('initial.incidentType','initial.incidentTypeOther')}${field('Cause Classification / Initial Cause','initial.cause','select',{options:['Undetermined','Accidental','Incendiary','Natural']})}${seg('Authority of Scene Examination','initial.authority',['Exigency','Search Warrant','Consent'])}${field('Consent Name','initial.consentName')}${field('Assisted By','case.assistedBy')}${field('Initial Notes','initial.notes','textarea')}`)}${card('Incident Timeline',`${field('Reported Date','initial.reportedDate','date')}${field('Reported Time','initial.reportedTime','time')}${seg('Dispatch same as reported','initial.dispatchSame',['Yes','No'])}${field('Dispatch Date','initial.dispatchDate','date')}${field('Dispatch Time','initial.dispatchTime','time')}${field('Arrival Date','initial.arrivalDate','date')}${field('Arrival Time','initial.arrivalTime','time')}${field('Scene Released Date','initial.sceneReleasedDate','date')}${field('Scene Released Time','initial.sceneReleasedTime','time')}`)}${card('911 Caller Info',`${field('Name','caller.name')}${field('Phone Number','caller.phone','tel')}${field('Address','caller.address','textarea')}${field('What made caller notice fire','caller.whatObserved','textarea')}`)}${card('Law Enforcement on Scene',`${checks('Agencies','initial.otherLEO',['LCSO','Leesburg PD','Purcellville PD','Middleburg PD','Other LEO'])}${field('Other LEO Notes','initial.leoOther')}`)}${card('Fire Suppression Information',`${field('Fire Department','fireDept.department')}${field('Incident Commander','fireDept.incidentCommander')}${field('IC Unit ID','fireDept.icUnit')}${field('Number of Alarms','fireDept.alarms','number')}${field('1st Arriving Engine Company','fireDept.firstEngine')}${field('Engine Officer','fireDept.engineOfficer')}${field('Activity on Arrival','fireDept.engineActivity','textarea')}${field('1st Arriving Truck/Specialty','fireDept.firstTruck')}${field('Truck/Specialty Officer','fireDept.truckOfficer')}${field('Activity on Arrival','fireDept.truckActivity','textarea')}${field('Fire Department Notes','fireDept.fdNotes','textarea')}`)}${card('Environmental Conditions',`${field('Temperature °F','environment.temperature','number')}${field('Humidity %','environment.humidity','number')}${field('Wind Direction','environment.windDirection')}${field('Wind Speed MPH','environment.windSpeed','number')}${seg('Light Condition','environment.dayNight',['Day','Night'])}${checks('Conditions','environment.conditions',['Clear','Overcast','Snow','Cloudy','Lightning','Rain'])}`)}</div>`; }

function scene(){
  setTitle('Initial Scene Assessment');
  return `<div class="grid">${card('Scene Orientation',`${seg('Front Direction','scene.frontDirection',['North','East','South','West','Northeast','Southeast','Southwest','Northwest'])}${field('Front Faces Toward','scene.frontFacesToward')}`)}${card('Initial Scene Assessment Narrative',`${field('Narrative','scene.narrative','textarea',{placeholder:'Initial observations, arrival context, smoke/fire conditions, suppression status, access, scene hazards, and investigator actions.'})}`)}${card('Scene Illumination',`${checks('Illumination Checklist','scene.illumination',['Daylight','Dusk','Night','Street Lights','Exterior Lights','Interior Lights','Fire Department Lighting','Investigator Lighting','Other'])}${field('Illumination Notes','scene.illuminationNotes','textarea')}`)}</div>`;
}
function exterior(){
  setTitle('Exterior Examination');
  return `<div class="grid">${card('Exterior Side Designations',`<div class="warn">Exterior side designations are from the vantage point of standing at the front of the structure and facing the structure.</div>`)}${card('Front Exterior',`${field('Front Exterior Observations','exterior.front','textarea')}`)}${card('Right Exterior',`${field('Right Exterior Observations','exterior.right','textarea')}`)}${card('Rear Exterior',`${field('Rear Exterior Observations','exterior.rear','textarea')}`)}${card('Left Exterior',`${field('Left Exterior Observations','exterior.left','textarea')}`)}</div>`;
}
function deck(){ setTitle('Deck'); return `<div class="grid">${card('Deck Module',`${seg('Deck Present','deck.present',['Yes','No','Unknown'])}${field('Deck Location','deck.location')}${field('Deck Material','deck.material')}${field('Attachment / Connection','deck.attachment')}${field('Approximate Size','deck.size')}${field('Condition','deck.condition','textarea')}${field('Damage / Fire Involvement','deck.damage','textarea')}${field('Fire Involvement Path','deck.fireInvolvement','textarea')}${field('Deck Notes','deck.notes','textarea')}`)}</div>`; }
function roof(){
  setTitle('Roof Examination');
  return `<div class="grid">${card('Roof Style',`${roofSelector()}`)}${card('Roof Construction / Covering',`${seg('Roof Covering','building.roofCovering',['Asphalt Shingles','Wood','Metal','Tile','Slate','Membrane','Other'])}${field('Roof Condition / Damage','building.roofCondition','textarea')}`)}${card('Roof Systems and Observations',`${field('Roof Ventilation Observations','building.roofVentilation','textarea')}${field('Roof Notes','building.roofNotes','textarea')}`)}</div>`;
}
function interior(){
  setTitle('Interior Examination');
  return `<div class="grid">${card('Interior Observations',`${field('General Interior Observations','interior.general','textarea')}${field('First Floor Observations','interior.firstFloor','textarea')}${field('Second Floor Observations','interior.secondFloor','textarea')}${field('Basement Observations','interior.basement','textarea')}${field('Attic Observations','interior.attic','textarea')}${field('Garage Observations','interior.garage','textarea')}${field('Other Interior Areas','interior.other','textarea')}`)}</div>`;
}
function building(){ setTitle('Building'); return `<div class="grid">${card('Property Description',`${seg('Property Description','building.propertyDescription',['Residential','Commercial','Other'])}${seg('Residential','building.residentialType',['Single Family Dwelling','Townhouse','Condominium','Apartment'])}${seg('Commercial','building.commercialType',['Assembly','Business/Mercantile','Educational','Health Care Facility','Parking Garage'])}${field('Other Description','building.otherUse')}${field('Year Built','building.yearBuilt','number')}${field('Number of Stories','building.stories','number')}${field('Length','building.length','number')}${field('Width','building.width','number')}${field('Assessed Value','building.assessedValue','number')}${field('Percentage Involved','building.percentInvolved')}${field('Open Permits','building.openPermits','textarea')}${field('Prior Insurance Claims','building.priorClaims','textarea')}${seg('Property Status','building.status',['Owner Occupied','Rented','Vacant','For Sale'])}${seg('Under Construction / Remodel','building.underConstruction',['Yes','No'])}${seg('Perimeter Fence','building.fence',['Yes','No'])}${field('Fence Type','building.fenceType')}${seg('Fence Damage','building.fenceDamage',['Yes','No'])}`)}${card('Construction',`${seg('Construction Type','building.constructionType',['Fire Resistive','Non-Combustible','Ordinary','Heavy Timber','Wood Frame'])}${seg('Foundation Type','building.foundationType',['Basement','Slab','Crawlspace','Other'])}${seg('Foundation Material','building.foundationMaterial',['Masonry','Concrete','Stone','Other'])}${seg('Exterior Covering','building.exteriorCovering',['Vinyl','Aluminum','Hardie board','Brick/Stone','Stucco','Wood','Other'])}`)}${card('Life Safety / Alarms / Security',`${seg('Smoke Alarms','lifeSafety.smokeAlarms',['Yes','No','Unknown'])}${seg('Alerted Occupants','lifeSafety.smokeAlerted',['Yes','No','Unknown'])}${seg('Hardwired','lifeSafety.smokeHardwired',['Yes','No','Unknown'])}${seg('Battery Operated','lifeSafety.smokeBattery',['Yes','No','Unknown'])}${seg('Batteries in Place','lifeSafety.batteriesInPlace',['Yes','No','Unknown'])}${seg('CO Detectors','lifeSafety.coDetectors',['Yes','No','Unknown'])}${seg('Fire Alarm System','lifeSafety.fireAlarm',['Yes','No','Unknown'])}${seg('Did It Alarm','lifeSafety.fireAlarmActivated',['Yes','No','Unknown'])}${seg('Fire Sprinklers','lifeSafety.sprinklers',['Yes','No','Unknown'])}${seg('Did They Function','lifeSafety.sprinklersFunctioned',['Yes','No','Unknown'])}${seg('Control Valves at Arrival','lifeSafety.controlValves',['On','Off','Unknown'])}${seg('Standpipes','lifeSafety.standpipes',['Yes','No','Unknown'])}${seg('Security Cameras','lifeSafety.securityCameras',['Yes','No','Unknown'])}${seg('Hidden Keys / Lockbox','lifeSafety.hiddenKeys',['Yes','No','Unknown'])}${field('Hidden Key / Lockbox Location','lifeSafety.hiddenKeyLocation')}${seg('Security Bars / Grills','lifeSafety.securityBars',['Yes','No','Unknown'])}${field('Notes','lifeSafety.notes','textarea')}${field('Alarm Notes','building.alarmNotes','textarea')}`)}</div>`; }
function utilities(){ setTitle('Utilities'); return `<div class="grid">${card('Electric',`${seg('Electricity','utilities.electricOn',['On','Off','None'])}${field('Electric Service Provider','utilities.electricProvider','select',{options:['','Dominion Power','NOVEC','Virginia Power','Other']})}${field('Other Electric Provider','utilities.electricProviderOther')}${seg('Electric Service Type','utilities.electricServiceType',['Overhead','Service Lateral','Underground','None'])}${field('Location of Electric Meter','utilities.electricMeterLocation')}${field('Main Disconnect Location','utilities.mainDisconnectLocation')}`)}${card('Natural Gas',`${seg('Natural Gas Present','utilities.gasOn',['Yes','No','Unknown'])}${field('Gas Provider','utilities.gasProvider')}${field('Gas Meter Location','utilities.gasMeterLocation')}`)}${card('Propane / LP',`${seg('LP Present','utilities.lpTank',['Yes','No','Unknown'])}${field('LP Tank Size','utilities.lpTankSize')}${field('LP Tank Location','utilities.lpLocation')}`)}${card('Generator',`${seg('Generator Present','utilities.generatorPresent',['Yes','No','Unknown'])}${field('Generator Location','utilities.generatorLocation')}${field('Generator Notes','utilities.generatorNotes','textarea')}`)}${card('Battery Storage',`${seg('Battery Storage Present','utilities.batteryStoragePresent',['Yes','No','Unknown'])}${field('Battery Storage Location','utilities.batteryStorageLocation')}${field('Battery Type','utilities.batteryType')}${field('Battery Storage Notes','utilities.batteryStorageNotes','textarea')}`)}${card('Solar',`${seg('Solar Panels','building.solarPanels',['Yes','No','Unknown'])}${field('Utility Notes','utilities.notes','textarea')}`)}</div>`; }
function electrical(){ setTitle('Electrical'); return `<div class="grid full">${card('Electrical Service Notes',`${field('Service / System Notes','electrical.serviceNotes','textarea')}`)}${dynamicInner('electrical.panels','Electrical Panels',electricalPanelTemplate,electricalPanelCard)}<div class="warn">Electrical circuit documentation uses a panel layout. Document the breaker positions that matter; blank positions can be left untouched.</div></div>`; }
function breakerPath(panelIndex,pos,prop){ return `electrical.panels.${panelIndex}.breakers.${pos}.${prop}`; }
function breakerValue(panelIndex,pos,prop){ return pathGet(breakerPath(panelIndex,pos,prop)); }
function breakerSummary(panelIndex,pos){
  const panel = state.electrical?.panels?.[panelIndex] || {};
  const b = panel.breakers?.[pos] || {};
  return [pos, b.labeledAs || b.areaServed, b.breakerType || 'Single Pole', b.breakerSize, b.status].filter(Boolean).join(' • ');
}
function breakerPosition(panelIndex,pos){
  const typePath = breakerPath(panelIndex,pos,'breakerType');
  if(!pathGet(typePath)) pathSetRaw(typePath,'Single Pole');
  return `<details class="item breaker-detail"><summary><strong>${esc(breakerSummary(panelIndex,pos))}</strong></summary>${field('Labeled As',breakerPath(panelIndex,pos,'labeledAs'))}${field('Breaker Type',typePath,'select',{options:['Single Pole','Double Pole','Tandem','GFCI','AFCI','Blank / Unused','Removed','Other']})}${field('Breaker Size',breakerPath(panelIndex,pos,'breakerSize'))}${field('Status',breakerPath(panelIndex,pos,'status'),'select',{options:['','On','Off','Tripped','Unknown','Damaged']})}${field('Notes',breakerPath(panelIndex,pos,'notes'),'textarea')}</details>`;
}
function breakerLayout(panelIndex){
  const spaces = Number(pathGet(`electrical.panels.${panelIndex}.spaces`) || 40);
  const max = Number.isFinite(spaces) && spaces > 0 ? spaces : 40;
  const left = [], right = [];
  for(let n=1; n<=max; n++) (n % 2 ? left : right).push(n);
  return `<div class="row two"><div><h3>Left Side</h3>${left.map(n=>breakerPosition(panelIndex,n)).join('')}</div><div><h3>Right Side</h3>${right.map(n=>breakerPosition(panelIndex,n)).join('')}</div></div>`;
}
function roofSelector(){ const roofs=['Gable','Hip','Flat','Gambrel','Mansard','Shed','Butterfly','Monitor','Sawtooth','Combination','Other']; const val=pathGet('building.roofStyle'); return `<div class="roof-grid">${roofs.map(type=>`<button class="roof-card ${val===type?'selected':''}" data-set="building.roofStyle" data-value="${esc(type)}" type="button">${roofSvg(type)}<span>${esc(type)}</span></button>`).join('')}</div>`; }
function roofSvg(type){ const sv={Gable:'<polyline points="10,55 50,18 90,55"/><line x1="20" y1="55" x2="80" y2="55"/>',Hip:'<polygon points="10,58 50,20 90,58 70,66 30,66"/><line x1="50" y1="20" x2="50" y2="66"/>',Flat:'<rect x="18" y="35" width="64" height="28"/>',Gambrel:'<polyline points="10,60 30,32 50,22 70,32 90,60"/><line x1="20" y1="60" x2="80" y2="60"/>',Mansard:'<polygon points="18,30 82,30 92,62 8,62"/><line x1="28" y1="38" x2="72" y2="38"/>',Shed:'<polyline points="15,60 85,30 85,60"/><line x1="15" y1="60" x2="85" y2="60"/>',Butterfly:'<polyline points="8,35 50,58 92,35"/><line x1="50" y1="58" x2="50" y2="65"/>',Monitor:'<polyline points="8,58 32,38 42,38 42,28 58,28 58,38 68,38 92,58"/><line x1="18" y1="58" x2="82" y2="58"/>'}; return `<svg class="roof-svg" viewBox="0 0 100 80" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${sv[type]||sv.Gable}</svg>`; }
function people(){ setTitle('People'); return dynamicScreen('people','People / Interested Parties',personTemplate,personCard); }
function vehicles(){ setTitle('Vehicles'); return dynamicScreen('vehicles','Vehicles',vehicleTemplate,vehicleCard); }
function machinery(){ setTitle('Machinery'); return dynamicScreen('machinery','Machinery / Equipment',machineTemplate,machineCard); }
function rooms(){ setTitle('Rooms Documentation'); return `<div class="grid">${dynamicInner('rooms','Rooms Documentation',roomTemplate,roomCard)}${dynamicInner('windows','Window Documentation',windowTemplate,windowCard)}${card('Electrical Documentation Notes',`${field('Room / Area Electrical Notes','report.electricalNotes','textarea')}`)}</div>`; }
function areaOrigin(){ setTitle('Area(s) of Origin'); return `<div class="grid full">${dynamicInner('originAreas','Origin Area Candidates',originAreaTemplate,originAreaCard)}${card('Final Area of Origin',`${field('Final Area of Origin','report.areaOfOrigin')}${field('Origin Determination Notes','report.narrative','textarea',{placeholder:'Document the basis for the area of origin, supporting observations, limitations, and remaining uncertainties.'})}`)}</div>`; }
function firePatterns(){ setTitle('Fire Patterns'); return dynamicScreen('firePatterns','Fire Pattern Documentation',firePatternTemplate,firePatternCard,`<div class="warn">Document observed fire patterns. The platform records observations only; the investigator determines significance.</div>`); }
function ignitionSources(){ setTitle('Potential Ignition Sources'); return dynamicScreen('ignitionSources','Potential Ignition Sources',ignitionSourceTemplate,ignitionSourceCard,`<div class="warn">List and document potential ignition sources. Do not let the software determine cause.</div>`); }
function ignitionMatrix(){ setTitle('Ignition Source Assessment Matrix'); return `<div class="grid full">${card('Matrix Guidance',`<div class="warn">Use this to document considered ignition sources and why each was retained, eliminated, or remains undetermined. The investigator makes all conclusions.</div>`)}${dynamicInner('ignitionMatrix','Ignition Source Assessment Matrix',ignitionMatrixTemplate,ignitionMatrixCard)}</div>`; }
function exposures(){ setTitle('Exposure Structures'); return dynamicScreen('exposureStructures','Exposure Structures / Additional Structures',exposureTemplate,exposureCard,`<div class="warn">Use this for exposure buildings, detached structures, sheds, garages, or additional affected structures.</div>`); }

function photos(){ setTitle('Photos'); return `<div class="grid full">${card('Photo Numbering',`${field('First Photo Number','settings.firstPhotoNumber')}`)}${dynamicInner('photos','Photo Log',photoTemplate,photoCard)}<div class="warn">PWA camera/photo capture support varies by iPhone browser mode. This module stores photo metadata now; image attachment storage and title-card generation should be a later controlled release.</div></div>`; }
function evidence(){ setTitle('Evidence'); return `<div class="grid full">${card('Evidence Numbering',`${field('First Evidence Item','settings.firstEvidenceItem')}`)}${dynamicInner('evidence','Evidence Log',evidenceTemplate,evidenceCard)}</div>`; }
function interviews(){ setTitle('Interviews'); return `<div class="grid full">${card('Interview Types',`<div class="seg">${INTERVIEW_TYPES.map(g=>`<button class="pill" data-action="addInterview" data-guide="${g}">${g}</button>`).join('')}</div><p class="muted">Adds a structured interview linked to a Person record and loads prompts based on interview type.</p>`)}${dynamicInner('interviews','Interview Notes',interviewTemplate,interviewCard)}</div>`; }
function smokeAlarms(){ setTitle('Repeatable Smoke Alarms'); return dynamicScreen('smokeAlarms','Smoke Alarm Locations',smokeAlarmTemplate,smokeAlarmCard,`<div class="warn">Use this repeatable log for each alarm found, tested, missing, or reported.</div>`); }
function taskItem(key,task,pathPrefix){ return `<div class="item"><div class="item-head"><strong>${esc(task.label || 'Custom Task')}</strong><span class="badge">${esc(task.status || 'Open')}</span></div>${pathPrefix==='customTasks'?field('Task Label',`${pathPrefix}.${key}.label`):''}${seg('Status',`${pathPrefix}.${key}.status`,['Open','Done','N/A'])}${field('Due Date',`${pathPrefix}.${key}.due`,'date')}${field('Notes',`${pathPrefix}.${key}.notes`,'textarea')}${pathPrefix==='customTasks'?`<button class="pill" data-action="remove" data-key="customTasks" data-index="${key}">Remove</button>`:''}</div>`; }
function tasks(){ setTitle('Tasks'); const today=new Date().toISOString().slice(0,10); const required=Object.keys(state.tasks).map(key=>taskItem(key,state.tasks[key],'tasks')).join(''); const custom=(state.customTasks||[]).map((task,i)=>taskItem(i,task,'customTasks')).join(''); const todays=[...Object.values(state.tasks||{}),...(state.customTasks||[])].filter(t=>(!t.due || t.due===today) && t.status!=='Done' && t.status!=='N/A'); return `<div class="grid full">${card("Today's Tasks", todays.map(t=>`<div class="item"><strong>${esc(t.label || 'Custom Task')}</strong><div class="muted">${esc(t.due || 'No due date')}</div></div>`).join('') || '<p class="muted">No open tasks for today.</p>')}${card('Required Case Tasks', required)}${card('Custom Tasks',`<div class="actions"><button class="btn blue" data-action="add" data-key="customTasks">Add Custom Task</button></div><div class="list">${custom || '<p class="muted">No custom tasks yet.</p>'}</div>`)}</div>`; }
function timeline(){ setTitle('Timeline'); const events=timelineEvents(); return `<div class="grid full">${card('Automatic Timeline',`<div class="warn">Generated from reported, dispatch, arrival, scene release, evidence, interview, utilities-controlled, and manual timeline entries. Photo saves and form edits are not included.</div><div class="list">${events.map(e=>`<div class="item"><div class="item-head"><strong>${esc(e.label)}</strong><span class="badge">${esc([e.date,e.time].filter(Boolean).join(' '))}</span></div><div class="muted">${esc(e.source)}</div>${e.notes?`<p>${esc(e.notes)}</p>`:''}</div>`).join('') || '<p class="muted">No timeline events yet.</p>'}</div>`)}${dynamicInner('timeline','Manual Timeline Entries',timelineTemplate,timelineCard)}</div>`; }
function timelineEvents(){ const events=[]; const push=(date,time,label,source,notes='')=>{ if(date || time || notes) events.push({date:date||'',time:time||'',label,source,notes}); }; push(state.initial.reportedDate,state.initial.reportedTime,'Reported','Initial Incident'); push(state.initial.dispatchDate,state.initial.dispatchTime,'Dispatched','Initial Incident'); push(state.initial.arrivalDate,state.initial.arrivalTime,'Investigator Arrival','Initial Incident'); push(state.initial.sceneReleasedDate,state.initial.sceneReleasedTime,'Scene Released','Initial Incident'); if(state.utilities.utilityActions || state.utilities.electricOn || state.utilities.gasOn) push('', '', 'Utilities Controlled / Documented','Utilities', state.utilities.utilityActions || `Electric: ${state.utilities.electricOn || 'Unknown'}; Gas: ${state.utilities.gasOn || 'Unknown'}`); (state.evidence||[]).forEach(e=>push(e.date,'',`Evidence ${e.number||''} Collected`.trim(),'Evidence',`${e.description||''} ${e.location?`at ${e.location}`:''}`.trim())); (state.interviews||[]).forEach(i=>{ const person=(state.people||[]).find(p=>p.id===i.personId); push(i.date,i.time,`Interview - ${i.interviewType || i.guide || 'General'}`,'Interviews',person?.name || i.person || ''); }); (state.timeline||[]).forEach(t=>push(t.date,t.time,t.title || 'Manual Timeline Entry','Manual',t.notes || '')); return events.sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)); }
function reports(){ setTitle('Reports'); const p=reportText(); return `<div class="grid full">${card('Report Builder',`${field('Area of Origin','report.areaOfOrigin')}${seg('Cause Classification','report.causeClassification',['Accidental','Undetermined','Incendiary','Natural'])}${field('Ignition Source','report.ignitionSource')}${field('First Fuel Ignited','report.firstFuel')}${field('Oxidizing Agent','report.oxidizingAgent')}${field('Structure Loss','report.structureLoss','number')}${field('Contents Loss','report.contentsLoss','number')}${seg('Status','report.status',['Open','Closed','Pending Lab','Pending Interviews'])}${field('Narrative Notes','report.narrative','textarea')}`)}${card('Draft Narrative',`<div class="report-preview">${esc(p)}</div><div class="actions"><button class="btn secondary" data-action="copyReport">Copy Summary Report</button><button class="btn blue" data-action="exportSummaryReport">Export Summary Report</button><button class="btn green" data-action="exportInitialReport">Export Initial Report</button><button class="btn secondary" data-action="exportCrispNotes">Export Crisp Notes</button></div>`)}</div>`; }
function files(){ setTitle('Files / Export'); return `<div class="grid full">${card('Case File',`<div class="ok">Use GitHub only for the app files. Do not upload real case data, photos, names, or .fip exports to the public repository.</div><div class="actions"><button class="btn blue" data-action="exportFip">Export .fip</button><button class="btn green" data-action="shareFip">Share / Save to Files</button><button class="btn secondary" data-action="importFip">Import .fip</button><button class="btn danger" data-action="newCaseWizard">New Case</button></div><p class="muted">On iPhone, “Share / Save to Files” uses the iOS share sheet. Pick “Save to Files” and choose your folder.</p>`)}</div>`; }
function dynamicScreen(key,title,template,view,pre=''){ return `<div class="grid full">${pre}${dynamicInner(key,title,template,view)}</div>`; }
function dynamicInner(key,title,template,view){ const arr=collectionGet(key); return card(title,`<div class="actions"><button class="btn blue" data-action="add" data-key="${key}">Add ${title.split('/')[0].trim()}</button></div><div class="list">${arr.map((x,i)=>view(x,i,key)).join('') || '<p class="muted">No entries yet.</p>'}</div>`); }
function commonItem(obj,i,key,label,body){ return `<div class="item"><div class="item-head"><strong>${label}</strong><button class="pill" data-action="remove" data-key="${key}" data-index="${i}">Remove</button></div>${body}</div>`; }
function dynField(key,i,prop,label,type='text',opts={}){ return field(label,`${key}.${i}.${prop}`,type,opts); }
function personTemplate(){return {id:id(),role:'Owner',roles:['Owner'],name:'',phone:'',email:'',address:'',dob:'',oln:'',olnState:'',social:'',notes:''};}
function vehicleTemplate(){return {id:id(),type:'Vehicle',year:'',make:'',model:'',vin:'',plate:'',owner:'',damage:'',notes:''};}
function machineTemplate(){return {id:id(),type:'Machine',manufacturer:'',model:'',serial:'',dateOfManufacture:'',engine:'',owner:'',damage:'',notes:''};}
function roomTemplate(){return {id:id(),name:'',contents:'',ignitionSources:'',damage:'',notes:''};}
function windowTemplate(){return {id:id(),number:'',location:'',position:'Undetermined',lockStatus:'Undetermined',fixedEncased:'',damage:'',notes:''};}
function originAreaTemplate(){return {id:id(),name:'',room:'',level:'',status:'Possible',basis:'',supportingPatterns:'',contradictoryIndicators:'',notes:''};}
function firePatternTemplate(){return {id:id(),location:'',patternType:'',surface:'',description:'',directionality:'',supportingPhotoNumbers:'',notes:''};}
function ignitionSourceTemplate(){return {id:id(),category:'Electrical',specificSource:'',location:'',withinOriginArea:'Unknown',observations:'',whyConsidered:'',notes:''};}
function ignitionMatrixTemplate(){return {id:id(),source:'',location:'',hypothesis:'',evidenceFor:'',evidenceAgainst:'',testingPerformed:'',status:'Undetermined',basis:''};}
function exposureTemplate(){return {id:id(),label:'Exposure A',address:'',directionFromOrigin:'',distance:'',damage:'',exposureMechanism:'',photos:'',notes:''};}
function electricalPanelTemplate(){return {id:id(),label:'',panelType:'Main Panel',location:'',manufacturer:'',mainBreaker:'',spaces:'40',condition:'',arcMapping:'',notes:'',breakers:{}};}
function electricalCircuitTemplate(){return {id:id(),panel:'',circuitNumber:'',labeledAs:'',breakerSize:'',status:'Undetermined',observations:'',notes:''};}
function photoTemplate(){return {id:id(),number:nextNumber(state.photos,state.settings.firstPhotoNumber || 'P001'),date:new Date().toISOString().slice(0,10),description:'',location:'',photographer:state.settings.investigator,notes:''};}
function timelineTemplate(){return {id:id(),date:new Date().toISOString().slice(0,10),time:'',title:'',source:'Manual',notes:''};}
function customTaskTemplate(){return {id:id(),label:'',status:'Open',due:new Date().toISOString().slice(0,10),notes:''};}
function smokeAlarmTemplate(){return {id:id(),location:'',type:'',powerSource:'',present:'Unknown',operated:'Unknown',tested:'Unknown',soundPattern:'',condition:'',notes:''};}
function lastEvidenceCollector(){ const previous=[...(state.evidence||[])].reverse().find(x=>String(x.collectedByPersonId||x.collectedBy||'').trim()); return {personId:previous?.collectedByPersonId || '', name:previous?.collectedBy || ''}; }
function collectorSelect(path,selected=''){ return `<div class="field"><label>Collector</label><select data-path="${path}"><option value="">Manual Override</option>${(state.people||[]).map(p=>`<option value="${esc(p.id)}" ${selected===p.id?'selected':''}>${esc(p.name || p.role || 'Unnamed person')}</option>`).join('')}</select></div>`; }
const EVIDENCE_SECURED_OPTIONS = ['', 'LCSO Property Counter','LCSO Admin','LCSO Eastern Station','LCSO Ashburn Station','LCSO Dulles South','LCSO Western Station','FMO Evidence Storage Locker','Other'];
function evidenceTemplate(){ const collector=lastEvidenceCollector(); return {id:id(),number:nextNumber(state.evidence,state.settings.firstEvidenceItem || 'E001'),evidenceSecured:'',dateSecured:'',timeSecured:'',lockerStorageLocation:'',description:'',location:'',collectedByPersonId:collector.personId,collectedBy:collector.name,date:new Date().toISOString().slice(0,10),packaging:'',notes:''};}
const INTERVIEW_TYPES = ['Owner','Occupant','Discoverer','Witness','Neighbor','Firefighter','Contractor','Employee','Police Officer','Insurance','Other'];
const INTERVIEW_PROMPTS = {Owner:['Occupancy and ownership history','Timeline before discovery','Recent repairs, contractors, or insurance issues','Utilities, appliances, alarms, and security'],Occupant:['Activities before fire','Discovery and escape timeline','Appliances, smoking, candles, heating, or cooking','Alarm operation and prior issues'],Discoverer:['First observation','Location of smoke/flames','Actions taken before fire department arrival','People or vehicles observed'],Witness:['Observation location','Timeline of observations','Smoke/flame color and direction','People, vehicles, sounds, or odors'],Neighbor:['Normal occupancy/activity','Prior disputes or unusual activity','First observations','Security camera or doorbell footage'],Firefighter:['Arrival conditions','Entry/suppression actions','Fire location and extension','Utilities controlled and overhaul observations'],Contractor:['Work performed and dates','Materials/equipment used','Utilities affected','Permits and completion status'],Employee:['Work schedule and closing/opening routine','Equipment used','Alarm/security observations','People present'],['Police Officer']:['Scene security observations','Persons contacted','Evidence or statements received','Photos/body camera/CAD references'],Insurance:['Policy and claim history','Recent changes or inspections','Loss information','Contact and documentation needs'],Other:['Role in incident','Timeline and observations','Relevant documents/photos','Follow-up needed']};
function personOptions(selected=''){ return `<option value="">Select person</option>${(state.people||[]).map(p=>`<option value="${esc(p.id)}" ${selected===p.id?'selected':''}>${esc(p.name || p.role || 'Unnamed person')}</option>`).join('')}`; }
function personSelect(label,path){ return `<div class="field"><label>${label}</label><select data-path="${path}">${personOptions(pathGet(path))}</select></div>`; }
function promptsForInterviewType(type){ return INTERVIEW_PROMPTS[type] || INTERVIEW_PROMPTS.Other; }
function syncInterviewQuestions(x){ const prompts=promptsForInterviewType(x.interviewType || x.guide || 'Other'); const existing=Array.isArray(x.questions) ? x.questions : []; x.questions = prompts.map(prompt=>{ const match=existing.find(q=>(q.prompt||q)===prompt); return typeof match === 'object' ? {...match,prompt,answer:match.answer||''} : {prompt,answer:''}; }); return x.questions; }
function interviewQuestionFields(x,i,k){ return syncInterviewQuestions(x).map((q,qi)=>dynField(`${k}.${i}.questions`,qi,'answer',q.prompt,'textarea')).join(''); }
function interviewTemplate(guide='Owner'){return {id:id(),guide,interviewType:guide,personId:'',person:'',date:new Date().toISOString().slice(0,10),time:'',location:'',questions:promptsForInterviewType(guide).map(prompt=>({prompt,answer:''})),summary:'',notes:'',followUp:''};}
function personCard(x,i,k){ const roleLabel = x.role || 'Person'; return commonItem(x,i,k,`${roleLabel}: ${x.name||'Unnamed'}`,`${dynField(k,i,'role','Role','select',{options:['','Owner','Renter/Lessee','Occupant','Victim','Witness','Discoverer','Firefighter','Contractor','Employee','Suspect','Other']})}${dynField(k,i,'name','Name')}${dynField(k,i,'address','Address','textarea')}${dynField(k,i,'phone','Phone','tel')}${dynField(k,i,'email','Email','email')}${dynField(k,i,'dob','DOB','date')}${dynField(k,i,'oln','OLN')}${dynField(k,i,'olnState','OLN State')}${dynField(k,i,'social','Social')}${dynField(k,i,'notes','Notes','textarea')}`); }
function vehicleCard(x,i,k){ return commonItem(x,i,k,`${x.year||''} ${x.make||''} ${x.model||'Vehicle'}`,`${dynField(k,i,'type','Type','select',{options:['Vehicle','Trailer','ATV/UTV','Boat','Other']})}${dynField(k,i,'year','Year','number')}${dynField(k,i,'make','Make')}${dynField(k,i,'model','Model')}${dynField(k,i,'vin','VIN')}${dynField(k,i,'plate','Plate')}${dynField(k,i,'owner','Owner')}${dynField(k,i,'damage','Damage','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function machineCard(x,i,k){ return commonItem(x,i,k,`${x.manufacturer||'Machinery'} ${x.model||''}`,`${dynField(k,i,'type','Type')}${dynField(k,i,'manufacturer','Manufacturer')}${dynField(k,i,'model','Model')}${dynField(k,i,'serial','Serial Number')}${dynField(k,i,'dateOfManufacture','Date of Manufacture')}${dynField(k,i,'engine','Engine / Power Source')}${dynField(k,i,'owner','Owner')}${dynField(k,i,'damage','Damage','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function roomCard(x,i,k){ return commonItem(x,i,k,`${x.name||'Room / Area'}`,`${dynField(k,i,'name','Room / Area Identified')}${dynField(k,i,'contents','Contents / Appliances','textarea')}${dynField(k,i,'ignitionSources','Ignition Sources Associated With / Connected To Structure','textarea')}${dynField(k,i,'damage','Damage Description','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function windowCard(x,i,k){ return commonItem(x,i,k,`Window ${x.number||i+1}`,`${dynField(k,i,'number','Window #')}${dynField(k,i,'location','Location')}${dynField(k,i,'position','Opened / Closed','select',{options:['Opened','Closed','Undetermined']})}${dynField(k,i,'lockStatus','Locked / Unlocked','select',{options:['Locked','Unlocked','Undetermined']})}${dynField(k,i,'fixedEncased','Fixed or Encased','select',{options:['','Fixed','Encased','Neither','Undetermined']})}${dynField(k,i,'damage','Damage')}${dynField(k,i,'notes','Notes','textarea')}`); }
function originAreaCard(x,i,k){ return commonItem(x,i,k,`${x.name||'Origin Area Candidate'} - ${x.status||'Possible'}`,`${dynField(k,i,'name','Area / Room Name')}${dynField(k,i,'room','Room / Area Link')}${dynField(k,i,'level','Level / Floor')}${dynField(k,i,'status','Status','select',{options:['Possible','Likely','Confirmed','Eliminated','Undetermined']})}${dynField(k,i,'basis','Basis for Consideration','textarea')}${dynField(k,i,'supportingPatterns','Supporting Fire Patterns / Damage Indicators','textarea')}${dynField(k,i,'contradictoryIndicators','Contradictory Indicators / Limitations','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function firePatternCard(x,i,k){ return commonItem(x,i,k,`${x.patternType||'Fire Pattern'} - ${x.location||'Location not set'}`,`${dynField(k,i,'location','Location')}${dynField(k,i,'patternType','Pattern Type','select',{options:['','V-Pattern','Inverted Cone','Clean Burn','Low Burning','Protected Area / Shadowing','Spalling','Melt Pattern','Char Pattern','Ventilation Pattern','Flow Path Indicator','Other']})}${dynField(k,i,'surface','Surface / Material')}${dynField(k,i,'description','Description','textarea')}${dynField(k,i,'directionality','Directionality / Movement Indicator','textarea')}${dynField(k,i,'supportingPhotoNumbers','Supporting Photo Numbers')}${dynField(k,i,'notes','Notes','textarea')}`); }
function ignitionSourceCard(x,i,k){ return commonItem(x,i,k,`${x.category||'Ignition Source'} - ${x.specificSource||'Specific source not set'}`,`${dynField(k,i,'category','Category','select',{options:['Electrical','Cooking','Heating','Smoking Materials','Open Flame','Appliance','Mechanical','Chemical','Lightning','Incendiary / Human Act','Vehicle','Battery / Energy Storage','Other']})}${dynField(k,i,'specificSource','Specific Source')}${dynField(k,i,'location','Location')}${dynField(k,i,'withinOriginArea','Within Area of Origin?','select',{options:['Unknown','Yes','No','Adjacent']})}${dynField(k,i,'observations','Observations','textarea')}${dynField(k,i,'whyConsidered','Why Considered','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function ignitionMatrixCard(x,i,k){ return commonItem(x,i,k,`${x.source||'Ignition Source'} - ${x.status||'Undetermined'}`,`${dynField(k,i,'source','Ignition Source / Hypothesis')}${dynField(k,i,'location','Location')}${dynField(k,i,'hypothesis','Hypothesis','textarea')}${dynField(k,i,'evidenceFor','Evidence Supporting','textarea')}${dynField(k,i,'evidenceAgainst','Evidence Against / Elimination Factors','textarea')}${dynField(k,i,'testingPerformed','Testing / Examination Performed','textarea')}${dynField(k,i,'status','Assessment Status','select',{options:['Undetermined','Retained','Eliminated','Most Probable','Cannot Eliminate','Needs Follow-up']})}${dynField(k,i,'basis','Investigator Basis / Notes','textarea')}`); }
function exposureCard(x,i,k){ return commonItem(x,i,k,`${x.label||'Exposure'} - ${x.address||'No address'}`,`${dynField(k,i,'label','Exposure Label')}${dynField(k,i,'address','Address / Description','textarea')}${dynField(k,i,'directionFromOrigin','Direction from Origin')}${dynField(k,i,'distance','Approximate Distance')}${dynField(k,i,'damage','Damage Observed','textarea')}${dynField(k,i,'exposureMechanism','Exposure Mechanism','select',{options:['','Radiant Heat','Direct Flame Contact','Convected Heat','Embers / Firebrands','Smoke Only','Suppression Damage','Undetermined','Other']})}${dynField(k,i,'photos','Photo Numbers')}${dynField(k,i,'notes','Notes','textarea')}`); }
function electricalPanelCard(x,i,k){ return commonItem(x,i,k,`${x.label||'Panel'} ${x.location ? `- ${x.location}` : i+1}`,`${dynField(k,i,'label','Panel Label / Identifier')}${dynField(k,i,'panelType','Panel Type / Designation','select',{options:['Main Panel','Subpanel','Other']})}${dynField(k,i,'location','Panel Location')}${dynField(k,i,'manufacturer','Manufacturer')}${dynField(k,i,'mainBreaker','Main Breaker / Disconnect')}${dynField(k,i,'spaces','Number of Spaces','select',{options:['20','30','40','42']})}${dynField(k,i,'condition','Panel Condition','textarea')}${dynField(k,i,'arcMapping','Overall Arc Mapping / Damage Indicators','textarea')}${dynField(k,i,'notes','Panel Notes','textarea')}${breakerLayout(i)}`); }
function electricalCircuitCard(x,i,k){ return commonItem(x,i,k,`Circuit ${x.circuitNumber||i+1}`,`${dynField(k,i,'panel','Panel')}${dynField(k,i,'circuitNumber','Circuit Number')}${dynField(k,i,'labeledAs','Labeled As')}${dynField(k,i,'breakerSize','Breaker Size')}${dynField(k,i,'status','Status','select',{options:['Undetermined','On','Off','Tripped','Removed','Damaged']})}${dynField(k,i,'observations','Observations','textarea')}${dynField(k,i,'notes','Circuit Notes','textarea')}`); }
function photoCard(x,i,k){ return commonItem(x,i,k,`Photo ${x.number||i+1}`,`${dynField(k,i,'number','Photo #')}${dynField(k,i,'date','Photo Date','date')}${dynField(k,i,'photographer','Photographer')}${dynField(k,i,'location','Photo Location')}${dynField(k,i,'description','Description','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function timelineCard(x,i,k){ return commonItem(x,i,k,`${x.title || 'Manual Timeline Entry'}`,`${dynField(k,i,'date','Date','date')}${dynField(k,i,'time','Time','time')}${dynField(k,i,'title','Title')}${dynField(k,i,'source','Source')}${dynField(k,i,'notes','Notes','textarea')}`); }
function smokeAlarmCard(x,i,k){ return commonItem(x,i,k,`Smoke Alarm ${x.location || i+1}`,`${dynField(k,i,'location','Location')}${dynField(k,i,'type','Type')}${dynField(k,i,'powerSource','Power Source')}${dynField(k,i,'present','Present','select',{options:['Unknown','Yes','No','Reported Missing']})}${dynField(k,i,'operated','Operated','select',{options:['Unknown','Yes','No','N/A']})}${dynField(k,i,'tested','Tested','select',{options:['Unknown','Yes','No','N/A']})}${dynField(k,i,'soundPattern','Sound Pattern / Alert Description')}${dynField(k,i,'condition','Condition','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function evidenceCard(x,i,k){ const showStorage=x.evidenceSecured && (x.evidenceSecured !== 'LCSO Property Counter' || x.lockerStorageLocation); return commonItem(x,i,k,`Evidence ${x.number||i+1}`,`${dynField(k,i,'number','Evidence #')}${dynField(k,i,'description','Description','textarea')}${dynField(k,i,'location','Location Collected')}${collectorSelect(`${k}.${i}.collectedByPersonId`,x.collectedByPersonId||'')}${dynField(k,i,'collectedBy','Collector Manual Override')}${dynField(k,i,'date','Date Collected','date')}${dynField(k,i,'evidenceSecured','Evidence Secured','select',{options:EVIDENCE_SECURED_OPTIONS})}${dynField(k,i,'dateSecured','Date Secured','date')}${dynField(k,i,'timeSecured','Time Secured','time')}${showStorage?dynField(k,i,'lockerStorageLocation','Locker Number / Storage Location'):''}${dynField(k,i,'packaging','Packaging')}${dynField(k,i,'notes','Notes','textarea')}`); }
function interviewCard(x,i,k){ const linked=(state.people||[]).find(p=>p.id===x.personId); const type=x.interviewType || x.guide || 'Other'; return commonItem(x,i,k,`${type}: ${linked?.name || x.person || 'Unlinked person'}`,`${personSelect('Linked Person',`${k}.${i}.personId`)}${dynField(k,i,'interviewType','Interview Type','select',{options:INTERVIEW_TYPES})}${interviewQuestionFields(x,i,k)}${dynField(k,i,'person','Person Interviewed (free text override)')}${dynField(k,i,'date','Date','date')}${dynField(k,i,'time','Time','time')}${dynField(k,i,'location','Location')}${dynField(k,i,'summary','Summary','textarea')}${dynField(k,i,'notes','Free-form Notes','textarea')}${dynField(k,i,'followUp','Follow-up Needed','textarea')}`); }
function handleAction(e){ const a=e.currentTarget.dataset.action, key=e.currentTarget.dataset.key; if(a==='goDashboard') render('dashboard'); if(a==='add'){ collectionAdd(key,templates[key]()); render(current); } if(a==='remove'){ collectionRemove(key,e.currentTarget.dataset.index); render(current); } if(a==='addInterview'){ state.interviews.push(interviewTemplate(e.currentTarget.dataset.guide)); save(); render('interviews'); } if(a==='exportFip') exportFip(false); if(a==='shareFip') exportFip(true); if(a==='importFip') $('#importFile').click(); if(a==='newCaseWizard') render('newCaseWizard'); if(a==='createCaseFromWizard') caseEngine.createFromWizard(); if(a==='copyReport'){ navigator.clipboard?.writeText(reportText()); saveStatus.textContent='Report copied'; } if(a==='exportSummaryReport') exportText(`${filename().replace('.fip','')}_summary.txt`, reportText()); if(a==='exportInitialReport') exportText(`${filename().replace('.fip','')}_initial.txt`, initialReportText()); if(a==='exportCrispNotes') exportText(`${filename().replace('.fip','')}_crisp_notes.txt`, crispNotesText());}
const templates={people:personTemplate,vehicles:vehicleTemplate,machinery:machineTemplate,rooms:roomTemplate,windows:windowTemplate,originAreas:originAreaTemplate,firePatterns:firePatternTemplate,ignitionSources:ignitionSourceTemplate,ignitionMatrix:ignitionMatrixTemplate,exposureStructures:exposureTemplate,photos:photoTemplate,evidence:evidenceTemplate,interviews:interviewTemplate,timeline:timelineTemplate,customTasks:customTaskTemplate,smokeAlarms:smokeAlarmTemplate,'electrical.panels':electricalPanelTemplate,'electrical.circuits':electricalCircuitTemplate};
function exportText(name,text){ const blob=new Blob([text],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
function filename(){ const c=(state.initial.caseNumber||'FIP_Case').replace(/[^a-z0-9_-]/gi,'_'); return `${c}.fip`; }
async function exportFip(share){ save(); const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const file=new File([blob], filename(), {type:'application/json'}); if(share && navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'FIP Case File'}); return; } const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename(); a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
$('#importFile').addEventListener('change', async e=>{ const f=e.target.files[0]; if(!f) return; try{ const txt=await f.text(); state=migrate(JSON.parse(txt)); activateCase(); save(); render('dashboard'); }catch(err){ alert('Could not import that .fip file.'); } e.target.value=''; });
function evidenceDispositionLines(){ return (state.evidence||[]).filter(e=>e.evidenceSecured || e.dateSecured || e.timeSecured || e.lockerStorageLocation).map(e=>`Evidence ${e.number || ''}: ${[e.evidenceSecured, [e.dateSecured,e.timeSecured].filter(Boolean).join(' '), e.lockerStorageLocation].filter(Boolean).join(' • ')}`); }
function crispNotesText(){ const evidenceLines=evidenceDispositionLines(); return [`Case: ${state.initial.caseNumber || ''}`,`Address: ${state.initial.incidentAddress || ''}`,`Area of Origin: ${state.report.areaOfOrigin || ''}`,`Cause: ${state.report.causeClassification || state.initial.cause || ''}`,`Ignition Source: ${state.report.ignitionSource || ''}`,`First Fuel: ${state.report.firstFuel || ''}`,`Status: ${state.report.status || ''}`, evidenceLines.length ? `Evidence Secured:\n${evidenceLines.join('\n')}` : '', state.report.narrative || ''].filter(Boolean).join('\n'); }
function initialReportText(){ const i=state.initial; return [`Initial Report`, `Case#: ${i.caseNumber || ''}`, `Incident Type: ${i.incidentType || ''}`, `Address: ${i.incidentAddress || ''}`, `Reported: ${i.reportedDate || ''} ${i.reportedTime || ''}`, `Dispatch: ${i.dispatchDate || ''} ${i.dispatchTime || ''}`, `Arrival: ${i.arrivalDate || ''} ${i.arrivalTime || ''}`, `Investigator: ${state.settings.investigator || ''}`, `Initial Notes: ${i.notes || ''}`].join('\n'); }
function reportText(){ const i=state.initial,b=state.building,r=state.report; const total=(Number(r.structureLoss||0)+Number(r.contentsLoss||0))||''; const evidenceLines=evidenceDispositionLines(); return `Case#: ${i.caseNumber || '[CASE NUMBER]'} - Summary Investigative Report\nType: ${i.incidentType || '[TYPE]'} - ${i.incidentAddress || '[ADDRESS]'}\nReported: ${i.reportedDate || '[DATE]'} ${i.reportedTime || '[TIME]'}\nInvestigator: ${state.settings.investigator || '[INVESTIGATOR]'}\n\nNARRATIVE:\nOn ${i.reportedDate || '[DATE]'}, at ${i.reportedTime || '[TIME]'}, I was dispatched to the above-listed address to conduct a fire origin and cause investigation.\n\nThe property was documented as ${b.propertyDescription || '[PROPERTY DESCRIPTION]'} with ${b.constructionType || '[CONSTRUCTION TYPE]'} construction. The investigator documented the area of origin as ${r.areaOfOrigin || '[AREA OF ORIGIN]'}.\n\nThe investigator classified the cause as ${r.causeClassification || i.cause || '[CAUSE CLASSIFICATION]'}. The investigator documented the ignition source as ${r.ignitionSource || '[IGNITION SOURCE]'}, which ignited ${r.firstFuel || '[FIRST FUEL]'}, utilizing ${r.oxidizingAgent || 'normal atmospheric oxygen'} as the oxidizing agent.\n\nThe estimated dollar loss for this incident was $${r.structureLoss || '0'} in structure damage and $${r.contentsLoss || '0'} in contents, totaling $${total || '0'}.\n\n${evidenceLines.length ? `EVIDENCE SECURED:\n${evidenceLines.join('\n')}\n\n` : ''}${r.narrative || ''}\n\nSTATUS: ${r.status || 'Open'}`; }
render('dashboard'); save();
