/* Fire Investigation Field Notes - Alpha 1.2 PWA foundation */
const STORE_KEY = 'fip_field_notes_case_v12';
const LEGACY_KEYS = ['fip_field_notes_case_v05','fip_field_notes_case_v04','fip_field_notes_case','fip_case','fip_saved_case'];
const $ = s => document.querySelector(s);
const content = $('#content');
const titleEl = $('#screenTitle');
const saveStatus = $('#saveStatus');
const INCIDENT_TYPES = ['Structure','Vehicle','Machinery','Outside Fire','Explosion','Other'];

const blank = () => {
  const now = new Date().toISOString();
  const caseId = id();
  return {
  meta:{app:'Fire Investigation Field Notes',version:'1.2',createdAt:now,updatedAt:now},
  case:{id:caseId,active:true,caseNumber:'',incidentType:'Structure',incidentTypeOther:'',incidentAddress:'',jurisdiction:'',primaryInvestigator:'C. Mount, #5572',assistedBy:'',caseStatus:'Draft',createdAt:now,createdBy:'',updatedAt:now,updatedBy:''},
  initial:{caseNumber:'',incidentNumber:'',incidentType:'Structure',incidentTypeOther:'',cause:'Undetermined',dateNotified:'',timeNotified:'',reportedDate:'',reportedTime:'',dispatchSame:'',dispatchDate:'',dispatchTime:'',arrivalDate:'',arrivalTime:'',sceneReleasedDate:'',sceneReleasedTime:'',incidentAddress:'',city:'',state:'VA',jurisdiction:'',authority:'Exigency',consentName:'',otherLEO:[],leoOther:'',notes:''},
  caller:{name:'',phone:'',address:'',howReported:'',whatObserved:''},
  fireDept:{department:'',incidentCommander:'',icUnit:'',alarms:'',firstEngine:'',engineOfficer:'',engineActivity:'',firstTruck:'',truckOfficer:'',truckActivity:'',fdNotes:''},
  environment:{temperature:'',humidity:'',windDirection:'',windSpeed:'',dayNight:'',conditions:[]},
  scene:{frontDirection:'',frontFacesToward:'',narrative:'',illumination:[],illuminationNotes:''},
  exterior:{front:'',left:'',rear:'',right:''},
  building:{propertyDescription:'',residentialType:'',commercialType:'',otherUse:'',yearBuilt:'',stories:'',length:'',width:'',assessedValue:'',percentInvolved:'',openPermits:'',priorClaims:'',status:'',underConstruction:'',fence:'',fenceType:'',fenceDamage:'',constructionType:'',foundationType:'',foundationMaterial:'',exteriorCovering:'',roofCovering:'',roofStyle:'',roofCondition:'',roofVentilation:'',solarPanels:'',roofNotes:'',alarmNotes:''},
  interior:{general:'',firstFloor:'',secondFloor:'',basement:'',attic:'',garage:'',other:''},
  utilities:{electricOn:'',electricServiceType:'',electricProvider:'',electricProviderOther:'',electricMeterLocation:'',gasOn:'',fuelType:'',gasProvider:'',gasMeterLocation:'',lpTank:'',lpTankSize:'',lpLocation:'',generatorPresent:'',generatorLocation:'',generatorNotes:'',batteryStoragePresent:'',batteryStorageLocation:'',batteryType:'',batteryStorageNotes:'',notes:''},
  electrical:{serviceNotes:'',panels:[],circuits:[]},
  lifeSafety:{smokeAlarms:'',smokeAlerted:'',smokeHardwired:'',smokeBattery:'',batteriesInPlace:'',coDetectors:'',coAlerted:'',fireAlarm:'',fireAlarmActivated:'',sprinklers:'',sprinklersFunctioned:'',controlValves:'',standpipes:'',securityCameras:'',hiddenKeys:'',hiddenKeyLocation:'',securityBars:'',notes:''},
  people:[], vehicles:[], machinery:[], rooms:[], windows:[], evidence:[], photos:[], interviews:[], notes:[], assignments:[],
  report:{areaOfOrigin:'',causeClassification:'Undetermined',ignitionSource:'',firstFuel:'',oxidizingAgent:'normal atmospheric oxygen',structureLoss:'',contentsLoss:'',status:'Open',narrative:'',electricalNotes:''},
  settings:{investigator:'C. Mount, #5572',agencyLabel:'',useAgencyBranding:false}
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
  ['people','vehicles','machinery','rooms','windows','evidence','photos','interviews','notes','assignments'].forEach(k=>{ if(!Array.isArray(out[k])) out[k]=[]; });
  if(!out.electrical || typeof out.electrical !== 'object' || Array.isArray(out.electrical)) out.electrical = {serviceNotes:'',panels:[],circuits:[]};
  ['panels','circuits'].forEach(k=>{ if(!Array.isArray(out.electrical[k])) out.electrical[k]=[]; });
  out.people = out.people.map(migratePerson);
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
function syncCaseFromLegacy(target=state){
  const incidentType = normalizeIncidentType(target.initial.incidentType || target.case.incidentType || 'Structure');
  const incidentTypeOther = target.initial.incidentTypeOther || target.case.incidentTypeOther || '';
  target.case.caseNumber = target.initial.caseNumber || target.case.caseNumber || '';
  target.case.incidentType = incidentType;
  target.case.incidentTypeOther = incidentTypeOther;
  target.case.incidentAddress = target.initial.incidentAddress || target.case.incidentAddress || '';
  target.case.jurisdiction = target.initial.jurisdiction || target.case.jurisdiction || '';
  target.case.primaryInvestigator = target.settings.investigator || target.case.primaryInvestigator || '';
  target.initial.caseNumber = target.case.caseNumber || target.initial.caseNumber || '';
  target.initial.incidentType = incidentType;
  target.initial.incidentTypeOther = incidentTypeOther;
  target.initial.incidentAddress = target.case.incidentAddress || target.initial.incidentAddress || '';
  target.initial.jurisdiction = target.case.jurisdiction || target.initial.jurisdiction || '';
  target.settings.investigator = target.case.primaryInvestigator || target.settings.investigator || '';
}
function syncCaseAfterPath(path){
  if(path.startsWith('case.')){
    state.initial.caseNumber = state.case.caseNumber || '';
    state.initial.incidentType = normalizeIncidentType(state.case.incidentType || 'Structure');
    state.case.incidentType = state.initial.incidentType;
    state.initial.incidentTypeOther = state.case.incidentTypeOther || '';
    state.initial.incidentAddress = state.case.incidentAddress || '';
    state.initial.jurisdiction = state.case.jurisdiction || '';
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
  summary(){ syncCaseFromLegacy(state); return state.case; },
  requiredMissing(){
    const c = this.summary();
    const checks = [['Case Number', c.caseNumber], ['Incident Type', c.incidentType], ['Incident Address', c.incidentAddress], ['Primary Investigator', c.primaryInvestigator]];
    return checks.filter(([,v]) => !String(v||'').trim()).map(([label]) => label);
  },
  initialComplete(){ return this.requiredMissing().length === 0 && Boolean(state.initial.dateNotified || state.initial.reportedDate); }
};
function save(){ syncCaseFromLegacy(state); state.meta.updatedAt = new Date().toISOString(); state.case.updatedAt = state.meta.updatedAt; localStorage.setItem(STORE_KEY, JSON.stringify(state)); saveStatus.textContent='Autosaved ' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }
function scheduleSave(){ saveStatus.textContent='Saving…'; clearTimeout(autosaveTimer); autosaveTimer=setTimeout(save, 350); }
function pathGet(path){ return path.split('.').reduce((o,k)=>o?.[k], state) ?? ''; }
function collectionGet(path){ const arr=pathGet(path); return Array.isArray(arr) ? arr : []; }
function collectionAdd(path,item){ const a=path.split('.'); let o=state; while(a.length>1){ const k=a.shift(); if(!o[k] || typeof o[k] !== 'object') o[k]={}; o=o[k]; } const k=a[0]; if(!Array.isArray(o[k])) o[k]=[]; o[k].push(item); save(); }
function collectionRemove(path,index){ const arr=collectionGet(path); arr.splice(Number(index),1); save(); }
function pathSet(path,val){ const a=path.split('.'); let o=state; while(a.length>1){ const k=a.shift(); if(!o[k]) o[k]={}; o=o[k]; } o[a[0]]=val; syncCaseAfterPath(path); scheduleSave(); }
function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function field(label,path,type='text',opts={}){ const v=esc(pathGet(path)); const ph=opts.placeholder?` placeholder="${esc(opts.placeholder)}"`:''; if(type==='textarea') return `<div class="field"><label>${label}</label><textarea data-path="${path}"${ph}>${v}</textarea></div>`; if(type==='select') return `<div class="field"><label>${label}</label><select data-path="${path}">${(opts.options||[]).map(o=>`<option value="${esc(o)}" ${pathGet(path)==o?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`; return `<div class="field"><label>${label}</label><input type="${type}" data-path="${path}" value="${v}"${ph}></div>`; }
function seg(label,path,options){ const val=pathGet(path); return `<div class="field"><label>${label}</label><div class="seg">${options.map(o=>`<button class="pill ${val===o?'selected':''}" data-set="${path}" data-value="${esc(o)}" type="button">${esc(o)}</button>`).join('')}</div></div>`; }
function incidentTypeButtons(path,otherPath){ return `${seg('Incident Type',path,INCIDENT_TYPES)}${pathGet(path)==='Other' ? field('Other Incident Type',otherPath) : ''}`; }
function checks(label,path,options){ const arr=pathGet(path); return `<div class="field"><label>${label}</label><div class="seg">${options.map(o=>`<button class="pill ${Array.isArray(arr)&&arr.includes(o)?'selected':''}" data-toggle="${path}" data-value="${esc(o)}" type="button">${esc(o)}</button>`).join('')}</div></div>`; }
function card(title,body){ return `<div class="card"><h2>${title}</h2>${body}</div>`; }
function id(){ return Math.random().toString(36).slice(2,10); }
function bindInputs(){
  content.querySelectorAll('[data-path]').forEach(el=>el.addEventListener('input', e=>pathSet(e.target.dataset.path, e.target.value)));
  content.querySelectorAll('[data-set]').forEach(el=>el.addEventListener('click', e=>{ pathSet(e.currentTarget.dataset.set, e.currentTarget.dataset.value); render(current); }));
  content.querySelectorAll('[data-toggle]').forEach(el=>el.addEventListener('click', e=>{ const p=e.currentTarget.dataset.toggle, v=e.currentTarget.dataset.value; let arr=pathGet(p); if(!Array.isArray(arr)) arr=[]; arr = arr.includes(v) ? arr.filter(x=>x!==v) : [...arr,v]; pathSet(p,arr); render(current); }));
  content.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click', handleAction));
}
function setTitle(t){ titleEl.textContent=t; }
function noActiveCaseScreen(){
  setTitle('No Active Case');
  return `<div class="grid full">${card('Active Case Required',`<div class="warn">Create a new case or open a .fip file from the dashboard before using this module.</div><div class="actions"><button class="btn secondary" data-action="goDashboard">Back to Dashboard</button></div>`)}</div>`;
}
function render(screen=current){
  const requested = screen || 'dashboard';
  current = requested;
  document.querySelectorAll('.rail-btn').forEach(b=>b.classList.toggle('active',b.dataset.screen===requested));
  const map={dashboard,initial,scene,building,electrical,exterior,roof,interior,people,vehicles,machinery,rooms,photos,evidence,interviews,reports,files};
  content.innerHTML = requested !== 'dashboard' && !hasActiveCase() ? noActiveCaseScreen() : (map[requested]||dashboard)();
  bindInputs();
}

document.querySelectorAll('.rail-btn').forEach(b=>b.addEventListener('click',()=>render(b.dataset.screen)));
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});

function dashboard(){
  setTitle('Case Dashboard');
  if(!hasActiveCase()){
    return `<div class="grid full">${card('No Active Case',`<div class="warn">No case is active. Create a new case or open a .fip file to begin.</div><div class="actions"><button class="btn secondary" data-action="newCase">New Case</button><button class="btn secondary" data-action="importFip">Open .fip</button></div>`)}</div>`;
  }
  const c = caseEngine.summary();
  const missing = caseEngine.requiredMissing();
  const counts = [['People',state.people.length],['Evidence',state.evidence.length],['Interviews',state.interviews.length],['Photos',state.photos.length]];
  const initialStatus = caseEngine.initialComplete() ? '<div class="ok">Initial Information foundation has the core case fields needed for Alpha 1.2.</div>' : `<div class="warn">Missing required case fields: ${missing.length ? missing.map(esc).join(', ') : 'Reported or notified date'}.</div>`;
  return `<div class="grid full"><div class="kpi">${counts.map(c=>`<div class="card"><div class="muted">${c[0]}</div><div class="kpi-num">${c[1]}</div></div>`).join('')}</div>${card('Case Engine',`${field('Case Number','case.caseNumber')}${incidentTypeButtons('case.incidentType','case.incidentTypeOther')}${field('Incident Address / Location','case.incidentAddress')}${field('Jurisdiction','case.jurisdiction')}${field('Primary Investigator','case.primaryInvestigator')}${field('Assisted By','case.assistedBy')}${field('Case Status','case.caseStatus','select',{options:['Draft','Active','Pending Review','Closed','Reopened','Archived']})}<div class="actions"><button class="btn blue" data-action="exportFip">Export .fip</button><button class="btn secondary" data-action="importFip">Open .fip</button><button class="btn secondary" data-action="newCase">New Case</button></div><div class="muted">Case ID: ${esc(c.id)} • Updated: ${esc((c.updatedAt||state.meta.updatedAt||'').replace('T',' ').slice(0,19))}</div>`)}${card('Dashboard Engine',`<div class="row two"><div><span class="badge">${esc(c.caseStatus||'Draft')}</span><p class="muted">Landing page for the active case after create/open/import. Modules continue to use the current PWA screens while Alpha 1.2 foundations are built.</p></div><div>${initialStatus}</div></div><div class="actions"><span class="badge">Offline-first</span><span class="badge">Autosave</span><span class="badge">.fip import/export</span><span class="badge">Shared case object</span></div>`)}${card('Approved Build Scope',`<ol class="muted"><li>Case Engine foundation</li><li>Dashboard Engine foundation</li><li>Initial Information foundation</li><li>Scene, exterior, roof, and interior field-note workflows</li></ol><p class="muted">Case Management, Warrants, Tags, Cellular Analysis, AI, cloud backend, and encryption remain intentionally deferred.</p>`)}</div>`;
}
function initial(){ setTitle('Initial Information'); return `<div class="grid">${card('Incident Information',`${field('FM Report Number','initial.caseNumber')}${field('Incident Number','initial.incidentNumber')}${field('Incident Address / Location','initial.incidentAddress','textarea')}${field('City','initial.city')}${field('State','initial.state')}${field('Jurisdiction','initial.jurisdiction')}${incidentTypeButtons('initial.incidentType','initial.incidentTypeOther')}${seg('Authority of Scene Examination','initial.authority',['Exigency','Search Warrant','Consent'])}${field('Consent Name','initial.consentName')}${field('Assisted By','case.assistedBy')}${field('Initial Notes','initial.notes','textarea')}`)}${card('Incident Timeline',`${field('Date Notified','initial.dateNotified','date')}${field('Time Notified','initial.timeNotified','time')}${field('Reported Date','initial.reportedDate','date')}${field('Reported Time','initial.reportedTime','time')}${seg('Dispatch same as reported','initial.dispatchSame',['Yes','No'])}${field('Dispatch Date','initial.dispatchDate','date')}${field('Dispatch Time','initial.dispatchTime','time')}${field('Arrival Date','initial.arrivalDate','date')}${field('Arrival Time','initial.arrivalTime','time')}${field('Scene Released Date','initial.sceneReleasedDate','date')}${field('Scene Released Time','initial.sceneReleasedTime','time')}`)}${card('911 Caller Info',`${field('Name','caller.name')}${field('Phone Number','caller.phone','tel')}${field('Address','caller.address','textarea')}${field('How Reported','caller.howReported')}${field('What made caller notice fire','caller.whatObserved','textarea')}`)}${card('Law Enforcement on Scene',`${checks('Agencies','initial.otherLEO',['LCSO','Leesburg PD','Purcellville PD','Middleburg PD','Other LEO'])}${field('Other LEO Notes','initial.leoOther')}`)}${card('Fire Suppression Information',`${field('Fire Department','fireDept.department')}${field('Incident Commander','fireDept.incidentCommander')}${field('IC Unit ID','fireDept.icUnit')}${field('Number of Alarms','fireDept.alarms','number')}${field('1st Arriving Engine Company','fireDept.firstEngine')}${field('Engine Officer','fireDept.engineOfficer')}${field('Activity on Arrival','fireDept.engineActivity','textarea')}${field('1st Arriving Truck/Specialty','fireDept.firstTruck')}${field('Truck/Specialty Officer','fireDept.truckOfficer')}${field('Activity on Arrival','fireDept.truckActivity','textarea')}`)}${card('Environmental Conditions',`${field('Temperature °F','environment.temperature','number')}${field('Humidity %','environment.humidity','number')}${field('Wind Direction','environment.windDirection')}${field('Wind Speed MPH','environment.windSpeed','number')}${seg('Light Condition','environment.dayNight',['Day','Night'])}${checks('Conditions','environment.conditions',['Clear','Overcast','Snow','Cloudy','Lightning','Rain'])}`)}</div>`; }

function scene(){
  setTitle('Initial Scene Assessment');
  return `<div class="grid">${card('Scene Orientation',`${seg('Front Direction','scene.frontDirection',['North','East','South','West','Northeast','Southeast','Southwest','Northwest'])}${field('Front Faces Toward','scene.frontFacesToward')}`)}${card('Initial Scene Assessment Narrative',`${field('Narrative','scene.narrative','textarea',{placeholder:'Initial observations, arrival context, smoke/fire conditions, suppression status, access, scene hazards, and investigator actions.'})}`)}${card('Scene Illumination',`${checks('Illumination Checklist','scene.illumination',['Daylight','Dusk','Night','Street Lights','Exterior Lights','Interior Lights','Fire Department Lighting','Investigator Lighting','Other'])}${field('Illumination Notes','scene.illuminationNotes','textarea')}`)}</div>`;
}
function exterior(){
  setTitle('Exterior Examination');
  return `<div class="grid">${card('Front Exterior',`${field('Front Exterior Observations','exterior.front','textarea')}`)}${card('Left Exterior',`${field('Left Exterior Observations','exterior.left','textarea')}`)}${card('Rear Exterior',`${field('Rear Exterior Observations','exterior.rear','textarea')}`)}${card('Right Exterior',`${field('Right Exterior Observations','exterior.right','textarea')}`)}</div>`;
}
function roof(){
  setTitle('Roof Examination');
  return `<div class="grid">${card('Roof Style',`${roofSelector()}`)}${card('Roof Construction / Covering',`${seg('Roof Covering','building.roofCovering',['Asphalt Shingles','Wood','Metal','Tile','Slate','Membrane','Other'])}${field('Roof Condition / Damage','building.roofCondition','textarea')}`)}${card('Roof Systems and Observations',`${field('Roof Ventilation Observations','building.roofVentilation','textarea')}${seg('Solar Panels','building.solarPanels',['Yes','No','Unknown'])}${field('Roof Notes','building.roofNotes','textarea')}`)}</div>`;
}
function interior(){
  setTitle('Interior Examination');
  return `<div class="grid">${card('Interior Observations',`${field('General Interior Observations','interior.general','textarea')}${field('First Floor Observations','interior.firstFloor','textarea')}${field('Second Floor Observations','interior.secondFloor','textarea')}${field('Basement Observations','interior.basement','textarea')}${field('Attic Observations','interior.attic','textarea')}${field('Garage Observations','interior.garage','textarea')}${field('Other Interior Areas','interior.other','textarea')}`)}${dynamicInner('rooms','Dynamic Rooms / Areas',roomTemplate,roomCard)}${dynamicInner('windows','Window Documentation',windowTemplate,windowCard)}${card('Electrical Notes',`${field('Electrical Notes','report.electricalNotes','textarea')}`)}</div>`;
}
function building(){ setTitle('Building / Utilities'); return `<div class="grid">${card('Property Description',`${seg('Property Description','building.propertyDescription',['Residential','Commercial','Other'])}${seg('Residential','building.residentialType',['Single Family Dwelling','Townhouse','Condominium','Apartment'])}${seg('Commercial','building.commercialType',['Assembly','Business/Mercantile','Educational','Health Care Facility','Parking Garage'])}${field('Other Description','building.otherUse')}${field('Year Built','building.yearBuilt','number')}${field('Number of Stories','building.stories','number')}${field('Length','building.length','number')}${field('Width','building.width','number')}${field('Assessed Value','building.assessedValue','number')}${field('Percentage Involved','building.percentInvolved')}${field('Open Permits','building.openPermits','textarea')}${field('Prior Insurance Claims','building.priorClaims','textarea')}${seg('Property Status','building.status',['Owner Occupied','Rented','Vacant','For Sale'])}${seg('Under Construction / Remodel','building.underConstruction',['Yes','No'])}${seg('Perimeter Fence','building.fence',['Yes','No'])}${field('Fence Type','building.fenceType')}${seg('Fence Damage','building.fenceDamage',['Yes','No'])}`)}${card('Construction',`${seg('Construction Type','building.constructionType',['Fire Resistive','Non-Combustible','Ordinary','Heavy Timber','Wood Frame'])}${seg('Foundation Type','building.foundationType',['Basement','Slab','Crawlspace','Other'])}${seg('Foundation Material','building.foundationMaterial',['Masonry','Concrete','Stone','Other'])}${seg('Exterior Covering','building.exteriorCovering',['Vinyl','Aluminum','Hardie board','Brick/Stone','Stucco','Wood','Other'])}${seg('Roof Covering','building.roofCovering',['Asphalt Shingles','Wood','Metal','Tile','Other'])}${roofSelector()}${seg('Solar Panels','building.solarPanels',['Yes','No'])}`)}${card('Utilities',`<h3>Electric</h3>${seg('Electricity','utilities.electricOn',['On','Off','None'])}${field('Electric Service Provider','utilities.electricProvider','select',{options:['','Dominion Power','NOVEC','Virginia Power','Other']})}${field('Other Electric Provider','utilities.electricProviderOther')}${seg('Electric Service Type','utilities.electricServiceType',['Overhead','Service Lateral','Underground','None'])}${field('Location of Electric Meter','utilities.electricMeterLocation')}<h3>Natural Gas</h3>${seg('Natural Gas Present','utilities.gasOn',['Yes','No','Unknown'])}${field('Gas Provider','utilities.gasProvider')}${field('Gas Meter Location','utilities.gasMeterLocation')}<h3>Propane / LP</h3>${seg('LP Present','utilities.lpTank',['Yes','No','Unknown'])}${field('LP Tank Size','utilities.lpTankSize')}${field('LP Tank Location','utilities.lpLocation')}<h3>Generator</h3>${seg('Generator Present','utilities.generatorPresent',['Yes','No','Unknown'])}${field('Generator Location','utilities.generatorLocation')}${field('Generator Notes','utilities.generatorNotes','textarea')}<h3>Battery Storage</h3>${seg('Battery Storage Present','utilities.batteryStoragePresent',['Yes','No','Unknown'])}${field('Battery Storage Location','utilities.batteryStorageLocation')}${field('Battery Type','utilities.batteryType')}${field('Battery Storage Notes','utilities.batteryStorageNotes','textarea')}<h3>Solar</h3>${seg('Solar Panels','building.solarPanels',['Yes','No'])}${field('Utility Notes','utilities.notes','textarea')}`)}${card('Life Safety / Alarms / Security',`${seg('Smoke Alarms','lifeSafety.smokeAlarms',['Yes','No','Unknown'])}${seg('Alerted Occupants','lifeSafety.smokeAlerted',['Yes','No','Unknown'])}${seg('Hardwired','lifeSafety.smokeHardwired',['Yes','No','Unknown'])}${seg('Battery Operated','lifeSafety.smokeBattery',['Yes','No','Unknown'])}${seg('Batteries in Place','lifeSafety.batteriesInPlace',['Yes','No','Unknown'])}${seg('CO Detectors','lifeSafety.coDetectors',['Yes','No','Unknown'])}${seg('Fire Alarm System','lifeSafety.fireAlarm',['Yes','No','Unknown'])}${seg('Did It Alarm','lifeSafety.fireAlarmActivated',['Yes','No','Unknown'])}${seg('Fire Sprinklers','lifeSafety.sprinklers',['Yes','No','Unknown'])}${seg('Did They Function','lifeSafety.sprinklersFunctioned',['Yes','No','Unknown'])}${seg('Control Valves at Arrival','lifeSafety.controlValves',['On','Off','Unknown'])}${seg('Standpipes','lifeSafety.standpipes',['Yes','No','Unknown'])}${seg('Security Cameras','lifeSafety.securityCameras',['Yes','No','Unknown'])}${seg('Hidden Keys / Lockbox','lifeSafety.hiddenKeys',['Yes','No','Unknown'])}${field('Hidden Key / Lockbox Location','lifeSafety.hiddenKeyLocation')}${seg('Security Bars / Grills','lifeSafety.securityBars',['Yes','No','Unknown'])}${field('Notes','lifeSafety.notes','textarea')}`)}</div>`; }
function electrical(){ setTitle('Electrical'); return `<div class="grid">${card('Electrical Service Notes',`${field('Service / System Notes','electrical.serviceNotes','textarea')}`)}${dynamicInner('electrical.panels','Electrical Panels',electricalPanelTemplate,electricalPanelCard)}${dynamicInner('electrical.circuits','Branch Circuits',electricalCircuitTemplate,electricalCircuitCard)}</div>`; }
function roofSelector(){ const roofs=['Gable','Hip','Flat','Gambrel','Mansard','Shed','Butterfly','Monitor']; const val=state.building.roofStyle; return `<div class="field"><label>Roof Style</label><div class="roof-grid">${roofs.map(r=>`<button type="button" class="roof-card ${val===r?'selected':''}" data-set="building.roofStyle" data-value="${r}">${roofSvg(r)}<div class="roof-label">${r}</div></button>`).join('')}</div></div>`; }
function roofSvg(type){ const sv={Gable:'<polyline points="10,55 50,18 90,55"/><line x1="20" y1="55" x2="80" y2="55"/>',Hip:'<polygon points="10,58 50,20 90,58 70,66 30,66"/><line x1="50" y1="20" x2="50" y2="66"/>',Flat:'<rect x="18" y="35" width="64" height="28"/>',Gambrel:'<polyline points="10,60 30,32 50,22 70,32 90,60"/><line x1="20" y1="60" x2="80" y2="60"/>',Mansard:'<polygon points="18,30 82,30 92,62 8,62"/><line x1="28" y1="38" x2="72" y2="38"/>',Shed:'<polyline points="15,60 85,30 85,60"/><line x1="15" y1="60" x2="85" y2="60"/>',Butterfly:'<polyline points="8,35 50,58 92,35"/><line x1="50" y1="58" x2="50" y2="65"/>',Monitor:'<polyline points="8,58 32,38 42,38 42,28 58,28 58,38 68,38 92,58"/><line x1="18" y1="58" x2="82" y2="58"/>'}; return `<svg class="roof-svg" viewBox="0 0 100 80" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${sv[type]||sv.Gable}</svg>`; }
function people(){ setTitle('People'); return dynamicScreen('people','People / Interested Parties',personTemplate,personCard); }
function vehicles(){ setTitle('Vehicles'); return dynamicScreen('vehicles','Vehicles',vehicleTemplate,vehicleCard); }
function machinery(){ setTitle('Machinery'); return dynamicScreen('machinery','Machinery / Equipment',machineTemplate,machineCard); }
function rooms(){ setTitle('Rooms / Windows / Electrical'); return `<div class="grid">${dynamicInner('rooms','Rooms / Areas of Origin',roomTemplate,roomCard)}${dynamicInner('windows','Window Documentation',windowTemplate,windowCard)}${card('Electrical Documentation Notes',`${field('Room / Area Electrical Notes','report.electricalNotes','textarea')}`)}</div>`; }
function photos(){ setTitle('Photos'); return dynamicScreen('photos','Photo Log',photoTemplate,photoCard,`<div class="warn">PWA camera/photo capture support varies by iPhone browser mode. This module stores photo metadata now; image attachment storage and title-card generation should be a later controlled release.</div>`); }
function evidence(){ setTitle('Evidence'); return dynamicScreen('evidence','Evidence Log',evidenceTemplate,evidenceCard); }
function interviews(){ setTitle('Interviews'); const guides = ['Firefighter Observation','Owner','Employee','Contractor','Discoverer / First Witness','Neighborhood Canvass','Case Solvability']; return `<div class="grid full">${card('Interview Guides',`<div class="seg">${guides.map(g=>`<button class="pill" data-action="addInterview" data-guide="${g}">${g}</button>`).join('')}</div><p class="muted">Adds a structured interview note. Full question-by-question guides will be expanded in the next release without changing the saved .fip format.</p>`)}${dynamicInner('interviews','Interview Notes',interviewTemplate,interviewCard)}</div>`; }
function reports(){ setTitle('Reports'); const p=reportText(); return `<div class="grid full">${card('Report Builder',`${field('Area of Origin','report.areaOfOrigin')}${seg('Cause Classification','report.causeClassification',['Accidental','Undetermined','Incendiary','Natural'])}${field('Ignition Source','report.ignitionSource')}${field('First Fuel Ignited','report.firstFuel')}${field('Oxidizing Agent','report.oxidizingAgent')}${field('Structure Loss','report.structureLoss','number')}${field('Contents Loss','report.contentsLoss','number')}${seg('Status','report.status',['Open','Closed','Pending Lab','Pending Interviews'])}${field('Narrative Notes','report.narrative','textarea')}`)}${card('Draft Narrative',`<div class="report-preview">${esc(p)}</div><div class="actions"><button class="btn secondary" data-action="copyReport">Copy Report Text</button></div>`)}</div>`; }
function files(){ setTitle('Files / Export'); return `<div class="grid full">${card('Case File',`<div class="ok">Use GitHub only for the app files. Do not upload real case data, photos, names, or .fip exports to the public repository.</div><div class="actions"><button class="btn blue" data-action="exportFip">Export .fip</button><button class="btn green" data-action="shareFip">Share / Save to Files</button><button class="btn secondary" data-action="importFip">Import .fip</button><button class="btn danger" data-action="newCase">New Blank Case</button></div><p class="muted">On iPhone, “Share / Save to Files” uses the iOS share sheet. Pick “Save to Files” and choose your folder.</p>`)}</div>`; }
function dynamicScreen(key,title,template,view,pre=''){ return `<div class="grid full">${pre}${dynamicInner(key,title,template,view)}</div>`; }
function dynamicInner(key,title,template,view){ const arr=collectionGet(key); return card(title,`<div class="actions"><button class="btn blue" data-action="add" data-key="${key}">Add ${title.split('/')[0].trim()}</button></div><div class="list">${arr.map((x,i)=>view(x,i,key)).join('') || '<p class="muted">No entries yet.</p>'}</div>`); }
function commonItem(obj,i,key,label,body){ return `<div class="item"><div class="item-head"><strong>${label}</strong><button class="pill" data-action="remove" data-key="${key}" data-index="${i}">Remove</button></div>${body}</div>`; }
function dynField(key,i,prop,label,type='text',opts={}){ return field(label,`${key}.${i}.${prop}`,type,opts); }
function personTemplate(){return {id:id(),role:'Owner',roles:['Owner'],name:'',phone:'',email:'',address:'',dob:'',oln:'',olnState:'',social:'',notes:''};}
function vehicleTemplate(){return {id:id(),type:'Vehicle',year:'',make:'',model:'',vin:'',plate:'',owner:'',damage:'',notes:''};}
function machineTemplate(){return {id:id(),type:'Machine',manufacturer:'',model:'',serial:'',dateOfManufacture:'',engine:'',owner:'',damage:'',notes:''};}
function roomTemplate(){return {id:id(),name:'',areaOfOrigin:'No',contents:'',ignitionSources:'',damage:'',notes:''};}
function windowTemplate(){return {id:id(),number:'',location:'',position:'Undetermined',lockStatus:'Undetermined',fixedEncased:'',damage:'',notes:''};}
function electricalPanelTemplate(){return {id:id(),label:'',location:'',mainBreaker:'',condition:'',arcMapping:'',notes:''};}
function electricalCircuitTemplate(){return {id:id(),panel:'',circuitNumber:'',areaServed:'',breakerSize:'',status:'Undetermined',observations:'',notes:''};}
function photoTemplate(){return {id:id(),number:String((state.photos?.length||0)+1).padStart(3,'0'),date:new Date().toISOString().slice(0,10),description:'',location:'',photographer:state.settings.investigator,notes:''};}
function evidenceTemplate(){return {id:id(),number:String((state.evidence?.length||0)+1).padStart(3,'0'),description:'',location:'',collectedBy:state.settings.investigator,date:new Date().toISOString().slice(0,10),packaging:'',lab:'',notes:''};}
function interviewTemplate(guide='General'){return {id:id(),guide,person:'',date:new Date().toISOString().slice(0,10),time:'',location:'',summary:'',followUp:''};}
function personCard(x,i,k){ const roleLabel = Array.isArray(x.roles) && x.roles.length ? x.roles.join(', ') : (x.role || 'Person'); return commonItem(x,i,k,`${roleLabel}: ${x.name||'Unnamed'}`,`${checks('Roles',`${k}.${i}.roles`,['Owner','Occupant','Renter','Visitor','Witness','Victim','Fire Department','Other'])}${dynField(k,i,'role','Legacy / Primary Role','select',{options:['','Owner','Renter/Lessee','Occupant','Victim','Witness','Discoverer','Firefighter','Contractor','Employee','Suspect','Other']})}${dynField(k,i,'name','Name')}${dynField(k,i,'address','Address','textarea')}${dynField(k,i,'phone','Phone','tel')}${dynField(k,i,'email','Email','email')}${dynField(k,i,'dob','DOB','date')}${dynField(k,i,'oln','OLN')}${dynField(k,i,'olnState','OLN State')}${dynField(k,i,'social','Social')}${dynField(k,i,'notes','Notes','textarea')}`); }
function vehicleCard(x,i,k){ return commonItem(x,i,k,`${x.year||''} ${x.make||''} ${x.model||'Vehicle'}`,`${dynField(k,i,'type','Type','select',{options:['Vehicle','Trailer','ATV/UTV','Boat','Other']})}${dynField(k,i,'year','Year','number')}${dynField(k,i,'make','Make')}${dynField(k,i,'model','Model')}${dynField(k,i,'vin','VIN')}${dynField(k,i,'plate','Plate')}${dynField(k,i,'owner','Owner')}${dynField(k,i,'damage','Damage','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function machineCard(x,i,k){ return commonItem(x,i,k,`${x.manufacturer||'Machinery'} ${x.model||''}`,`${dynField(k,i,'type','Type')}${dynField(k,i,'manufacturer','Manufacturer')}${dynField(k,i,'model','Model')}${dynField(k,i,'serial','Serial Number')}${dynField(k,i,'dateOfManufacture','Date of Manufacture')}${dynField(k,i,'engine','Engine / Power Source')}${dynField(k,i,'owner','Owner')}${dynField(k,i,'damage','Damage','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function roomCard(x,i,k){ return commonItem(x,i,k,`${x.name||'Room / Area'}`,`${dynField(k,i,'name','Room / Area Identified')}${dynField(k,i,'areaOfOrigin','Area of Origin?','select',{options:['No','Possible','Yes']})}${dynField(k,i,'contents','Contents / Appliances','textarea')}${dynField(k,i,'ignitionSources','Ignition Sources Associated With / Connected To Structure','textarea')}${dynField(k,i,'damage','Damage Description','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function windowCard(x,i,k){ return commonItem(x,i,k,`Window ${x.number||i+1}`,`${dynField(k,i,'number','Window #')}${dynField(k,i,'location','Location')}${dynField(k,i,'position','Opened / Closed','select',{options:['Opened','Closed','Undetermined']})}${dynField(k,i,'lockStatus','Locked / Unlocked','select',{options:['Locked','Unlocked','Undetermined']})}${dynField(k,i,'fixedEncased','Fixed or Encased','select',{options:['','Fixed','Encased','Neither','Undetermined']})}${dynField(k,i,'damage','Damage')}${dynField(k,i,'notes','Notes','textarea')}`); }
function electricalPanelCard(x,i,k){ return commonItem(x,i,k,`${x.label||'Panel'} ${x.location ? `- ${x.location}` : i+1}`,`${dynField(k,i,'label','Panel Label / Identifier')}${dynField(k,i,'location','Panel Location')}${dynField(k,i,'mainBreaker','Main Breaker / Disconnect')}${dynField(k,i,'condition','Panel Condition','textarea')}${dynField(k,i,'arcMapping','Arc Mapping / Damage Indicators','textarea')}${dynField(k,i,'notes','Panel Notes','textarea')}`); }
function electricalCircuitCard(x,i,k){ return commonItem(x,i,k,`Circuit ${x.circuitNumber||i+1}`,`${dynField(k,i,'panel','Panel')}${dynField(k,i,'circuitNumber','Circuit Number')}${dynField(k,i,'areaServed','Area / Equipment Served')}${dynField(k,i,'breakerSize','Breaker Size')}${dynField(k,i,'status','Status','select',{options:['Undetermined','On','Off','Tripped','Removed','Damaged']})}${dynField(k,i,'observations','Observations','textarea')}${dynField(k,i,'notes','Circuit Notes','textarea')}`); }
function photoCard(x,i,k){ return commonItem(x,i,k,`Photo ${x.number||i+1}`,`${dynField(k,i,'number','Photo #')}${dynField(k,i,'date','Photo Date','date')}${dynField(k,i,'photographer','Photographer')}${dynField(k,i,'location','Photo Location')}${dynField(k,i,'description','Description','textarea')}${dynField(k,i,'notes','Notes','textarea')}`); }
function evidenceCard(x,i,k){ return commonItem(x,i,k,`Evidence ${x.number||i+1}`,`${dynField(k,i,'number','Evidence #')}${dynField(k,i,'description','Description','textarea')}${dynField(k,i,'location','Location Collected')}${dynField(k,i,'collectedBy','Collected By')}${dynField(k,i,'date','Date Collected','date')}${dynField(k,i,'packaging','Packaging')}${dynField(k,i,'lab','Lab / Submission')}${dynField(k,i,'notes','Notes','textarea')}`); }
function interviewCard(x,i,k){ return commonItem(x,i,k,`${x.guide||'Interview'}: ${x.person||'Unnamed'}`,`${dynField(k,i,'guide','Guide / Type','select',{options:['General','Firefighter Observation','Owner','Employee','Contractor','Discoverer / First Witness','Neighborhood Canvass','Case Solvability']})}${dynField(k,i,'person','Person Interviewed')}${dynField(k,i,'date','Date','date')}${dynField(k,i,'time','Time','time')}${dynField(k,i,'location','Location')}${dynField(k,i,'summary','Summary','textarea')}${dynField(k,i,'followUp','Follow-up Needed','textarea')}`); }
function handleAction(e){ const a=e.currentTarget.dataset.action, key=e.currentTarget.dataset.key; if(a==='goDashboard') render('dashboard'); if(a==='add'){ collectionAdd(key,templates[key]()); render(current); } if(a==='remove'){ collectionRemove(key,e.currentTarget.dataset.index); render(current); } if(a==='addInterview'){ state.interviews.push(interviewTemplate(e.currentTarget.dataset.guide)); save(); render('interviews'); } if(a==='exportFip') exportFip(false); if(a==='shareFip') exportFip(true); if(a==='importFip') $('#importFile').click(); if(a==='newCase') { if(confirm('Create a new blank case? Export the current case first if needed.')) caseEngine.create(); } if(a==='copyReport'){ navigator.clipboard?.writeText(reportText()); saveStatus.textContent='Report copied'; }}
const templates={people:personTemplate,vehicles:vehicleTemplate,machinery:machineTemplate,rooms:roomTemplate,windows:windowTemplate,photos:photoTemplate,evidence:evidenceTemplate,interviews:interviewTemplate,'electrical.panels':electricalPanelTemplate,'electrical.circuits':electricalCircuitTemplate};
function filename(){ const c=(state.initial.caseNumber||'FIP_Case').replace(/[^a-z0-9_-]/gi,'_'); return `${c}.fip`; }
async function exportFip(share){ save(); const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const file=new File([blob], filename(), {type:'application/json'}); if(share && navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'FIP Case File'}); return; } const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename(); a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
$('#importFile').addEventListener('change', async e=>{ const f=e.target.files[0]; if(!f) return; try{ const txt=await f.text(); state=migrate(JSON.parse(txt)); activateCase(); save(); render('dashboard'); }catch(err){ alert('Could not import that .fip file.'); } e.target.value=''; });
function reportText(){ const i=state.initial,b=state.building,r=state.report; const total=(Number(r.structureLoss||0)+Number(r.contentsLoss||0))||''; return `Case#: ${i.caseNumber || '[CASE NUMBER]'} - Summary Investigative Report\nType: ${i.incidentType || '[TYPE]'} - ${i.incidentAddress || '[ADDRESS]'}\nReported: ${i.reportedDate || i.dateNotified || '[DATE]'} ${i.reportedTime || i.timeNotified || '[TIME]'}\nInvestigator: ${state.settings.investigator || '[INVESTIGATOR]'}\n\nNARRATIVE:\nOn ${i.dateNotified || '[DATE]'}, at ${i.timeNotified || '[TIME]'}, I was dispatched to the above-listed address to conduct a fire origin and cause investigation.\n\nThe property was documented as ${b.propertyDescription || '[PROPERTY DESCRIPTION]'} with ${b.constructionType || '[CONSTRUCTION TYPE]'} construction. The investigator documented the area of origin as ${r.areaOfOrigin || '[AREA OF ORIGIN]'}.\n\nThe investigator classified the cause as ${r.causeClassification || i.cause || '[CAUSE CLASSIFICATION]'}. The investigator documented the ignition source as ${r.ignitionSource || '[IGNITION SOURCE]'}, which ignited ${r.firstFuel || '[FIRST FUEL]'}, utilizing ${r.oxidizingAgent || 'normal atmospheric oxygen'} as the oxidizing agent.\n\nThe estimated dollar loss for this incident was $${r.structureLoss || '0'} in structure damage and $${r.contentsLoss || '0'} in contents, totaling $${total || '0'}.\n\n${r.narrative || ''}\n\nSTATUS: ${r.status || 'Open'}`; }
render('dashboard'); save();
