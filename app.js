const STORE_KEY = 'fip_mobile_case_v2';
const FILE_VERSION = '2.0.0';
const $ = selector => document.querySelector(selector);
const uid = () => `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const todayLocal = () => new Date().toISOString().slice(0, 10);
const nowLocalTime = () => new Date().toTimeString().slice(0, 5);

const sections = [
  ['overview', '⌂', 'Case Overview'],
  ['case', '▤', 'Case Details'],
  ['people', '👥', 'People'],
  ['interviews', '❝', 'Interviews'],
  ['evidence', '▣', 'Evidence'],
  ['building', '▥', 'Building'],
  ['utilities', '⚡', 'Utilities'],
  ['electrical', '⏚', 'Electrical Panels'],
  ['exterior', '▱', 'Exterior'],
  ['roof', '⌃', 'Roof'],
  ['deck', '▭', 'Deck'],
  ['alarms', '◉', 'Smoke Alarms'],
  ['origin', '◎', 'Area of Origin'],
  ['ignition', '♨', 'Ignition Source'],
  ['cause', '✓', 'Origin & Cause'],
  ['timeline', '◷', 'Timeline'],
  ['tasks', '☑', 'Tasks'],
  ['reports', '⇩', 'Reports / Files']
];

const blankBreaker = number => ({ number, label: '', amp: '', position: 'Unknown', notes: '' });
const blankPanel = () => ({ id: uid(), name: '', location: '', manufacturer: '', mainBreaker: '', condition: '', notes: '', breakers: Array.from({ length: 40 }, (_, index) => blankBreaker(index + 1)) });
const blankAlarm = () => ({ id: uid(), location: '', type: '', power: '', present: 'Unknown', operated: 'Unknown', notes: '' });
const blankPerson = () => ({ id: uid(), name: '', role: '', phone: '', email: '', address: '', notes: '' });
const blankInterview = () => ({ id: uid(), personId: '', date: todayLocal(), time: nowLocalTime(), location: '', interviewer: '', method: '', summary: '', followUp: '' });
const blankEvidence = () => ({ id: uid(), itemNumber: '', description: '', locationFound: '', collectedBy: '', dateCollected: todayLocal(), disposition: '', chainOfCustody: '', notes: '' });
const blankTimeline = () => ({ id: uid(), date: todayLocal(), time: nowLocalTime(), title: '', source: '', notes: '' });

function blankCase() {
  const now = new Date().toISOString();
  return {
    meta: { app: 'Fire Investigation Platform', version: FILE_VERSION, createdAt: now, updatedAt: now },
    case: {
      caseNumber: '', incidentAddress: '', city: '', state: '', jurisdiction: '', incidentDate: '', incidentTime: '',
      investigator: '', agency: '', status: 'Draft', occupancyType: '', fireType: '', fileName: ''
    },
    people: [],
    interviews: [],
    evidence: [],
    building: {
      propertyUse: '', constructionType: '', stories: '', basement: 'Unknown', occupancyStatus: '', areaInvolved: '',
      fireProtection: '', ventilation: '', damageSummary: '', buildingNotes: ''
    },
    utilities: {
      electricProvider: '', electricStatus: 'Unknown', gasProvider: '', gasStatus: 'Unknown', waterProvider: '', waterStatus: 'Unknown',
      hvacType: '', utilityActions: '', notes: ''
    },
    electrical: { panels: [blankPanel()] },
    exterior: {
      Front: { damage: '', openings: '', utilities: '', notes: '' },
      Right: { damage: '', openings: '', utilities: '', notes: '' },
      Rear: { damage: '', openings: '', utilities: '', notes: '' },
      Left: { damage: '', openings: '', utilities: '', notes: '' }
    },
    roof: { style: '', material: '', access: '', ventilation: '', damage: '', notes: '' },
    deck: { present: 'Unknown', location: '', material: '', attachment: '', damage: '', notes: '' },
    alarms: [],
    origin: { area: '', room: '', level: '', indicators: '', eliminatedAreas: '', investigatorConclusion: '' },
    ignition: { source: '', firstFuel: '', heatSource: '', sequence: '', eliminatedSources: '', notes: '' },
    cause: { classification: '', causeStatement: '', supportingFacts: '', limitations: '' },
    timeline: [],
    tasks: {
      initialReport: { label: 'Submit Initial Report', done: false, due: '', notes: '' },
      googleDrive: { label: 'Upload Photos to Google Drive', done: false, due: '', notes: '' },
      lcsoEvidence: { label: 'Upload Photos to LCSO Digital Evidence Platform', done: false, due: '', notes: '' }
    },
    notes: { crispNotes: '' }
  };
}

let state = loadCase();
let active = 'overview';
let autosaveTimer;
const content = $('#content');
const nav = $('#sectionNav');
const title = $('#viewTitle');

function loadCase() {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) return normalize(JSON.parse(stored));
  } catch (error) {
    console.warn('Unable to load autosaved case', error);
  }
  return blankCase();
}

function normalize(input) {
  const base = blankCase();
  const merged = deepMerge(base, input || {});
  merged.electrical.panels = (merged.electrical.panels && merged.electrical.panels.length ? merged.electrical.panels : [blankPanel()]).map(panel => ({
    ...blankPanel(),
    ...panel,
    breakers: Array.from({ length: 40 }, (_, index) => ({ ...blankBreaker(index + 1), ...(panel.breakers?.[index] || {}) }))
  }));
  ['Front', 'Right', 'Rear', 'Left'].forEach(side => { merged.exterior[side] = { damage: '', openings: '', utilities: '', notes: '', ...(merged.exterior[side] || {}) }; });
  return merged;
}

function deepMerge(target, source) {
  Object.keys(source || {}).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) target[key] = deepMerge(target[key] || {}, source[key]);
    else target[key] = source[key];
  });
  return target;
}

function saveSoon() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    state.meta.updatedAt = new Date().toISOString();
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    renderRibbon();
  }, 120);
}

function setValue(path, value) {
  const parts = path.split('.');
  let node = state;
  while (parts.length > 1) node = node[parts.shift()];
  node[parts[0]] = value;
  saveSoon();
}

function valueAt(path) {
  return path.split('.').reduce((node, part) => node?.[part], state) ?? '';
}

function esc(value = '') {
  return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function field(label, path, type = 'text', attrs = '') {
  const tag = type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input';
  if (tag === 'textarea') return `<div class="field"><label>${label}</label><textarea data-path="${path}" ${attrs}>${esc(valueAt(path))}</textarea></div>`;
  if (tag === 'select') return `<div class="field"><label>${label}</label><select data-path="${path}" ${attrs}>${attrs}</select></div>`;
  return `<div class="field"><label>${label}</label><input data-path="${path}" type="${type}" value="${esc(valueAt(path))}" ${attrs} /></div>`;
}

function selectField(label, path, options) {
  const current = valueAt(path);
  const opts = [''].concat(options).map(option => `<option value="${esc(option)}" ${current === option ? 'selected' : ''}>${option || 'Select'}</option>`).join('');
  return `<div class="field"><label>${label}</label><select data-path="${path}">${opts}</select></div>`;
}

function objectField(label, objectName, key, type = 'text') {
  const id = `${objectName}.${key}`;
  const value = valueAt(id);
  if (type === 'textarea') return `<div class="field"><label>${label}</label><textarea data-object-path="${id}">${esc(value)}</textarea></div>`;
  return `<div class="field"><label>${label}</label><input data-object-path="${id}" type="${type}" value="${esc(value)}" /></div>`;
}

function optionButtons(path, options) {
  const current = valueAt(path);
  return `<div class="segmented">${options.map(option => `<button class="pill ${current === option ? 'selected' : ''}" data-set="${path}" data-value="${esc(option)}" type="button">${option}</button>`).join('')}</div>`;
}

function render() {
  const section = sections.find(item => item[0] === active) || sections[0];
  title.textContent = section[2];
  renderRibbon();
  renderNav();
  content.innerHTML = `<section class="screen">${screens[active]()}</section>`;
  content.focus({ preventScroll: true });
}

function renderRibbon() {
  const c = state.case;
  $('#caseRibbon').innerHTML = [
    ['Case', c.caseNumber || 'No case number'],
    ['Address', c.incidentAddress || 'No address entered'],
    ['Investigator', c.investigator || 'Not assigned'],
    ['Status', c.status || 'Draft']
  ].map(([label, value]) => `<div class="ribbon-chip"><span class="ribbon-label">${label}</span><span class="ribbon-value">${esc(value)}</span></div>`).join('');
}

function countFor(section) {
  const counts = { people: state.people.length, interviews: state.interviews.length, evidence: state.evidence.length, alarms: state.alarms.length, timeline: state.timeline.length, electrical: state.electrical.panels.length };
  if (section === 'tasks') return Object.values(state.tasks).filter(task => task.done).length + '/3';
  return counts[section] || '';
}

function renderNav() {
  nav.innerHTML = sections.map(([id, icon, label]) => `<button type="button" class="nav-button ${active === id ? 'active' : ''}" data-nav="${id}"><span>${icon} ${label}</span><span class="nav-count">${countFor(id)}</span></button>`).join('');
}

const card = (titleText, body, extra = '') => `<article class="card ${extra}"><div class="card-title"><h2>${titleText}</h2></div>${body}</article>`;

const screens = {
  overview() {
    const completedTasks = Object.values(state.tasks).filter(task => task.done).length;
    return `
      ${card('Case Overview Landing Page', `
        <div class="stats">
          <div class="stat"><span class="muted">People</span><strong>${state.people.length}</strong></div>
          <div class="stat"><span class="muted">Interviews</span><strong>${state.interviews.length}</strong></div>
          <div class="stat"><span class="muted">Evidence</span><strong>${state.evidence.length}</strong></div>
          <div class="stat"><span class="muted">Tasks</span><strong>${completedTasks}/3</strong></div>
        </div>
        <div class="actions">
          <button class="btn blue" data-goto="case" type="button">Enter Case Details</button>
          <button class="btn secondary" data-goto="reports" type="button">Save / Open .fip</button>
        </div>`)}
      ${card('Current Case', `<div class="field-grid two">
        ${field('Case Number', 'case.caseNumber')}
        ${field('Investigator', 'case.investigator')}
        ${field('Incident Address', 'case.incidentAddress')}
        ${field('Incident Date', 'case.incidentDate', 'date')}
      </div>`)}
      ${card('Field Guardrails', `<div class="callout">This app stores structured investigator-entered observations only. It does not generate origin, cause, or investigative conclusions.</div>`)}
    `;
  },
  case() {
    return card('Case Details', `<div class="field-grid two">
      ${field('Case Number', 'case.caseNumber')}
      ${selectField('Case Status', 'case.status', ['Draft', 'Active', 'Pending Review', 'Submitted', 'Closed'])}
      ${field('Incident Address', 'case.incidentAddress')}
      ${field('City', 'case.city')}
      ${field('State', 'case.state')}
      ${field('Jurisdiction', 'case.jurisdiction')}
      ${field('Incident Date', 'case.incidentDate', 'date')}
      ${field('Incident Time', 'case.incidentTime', 'time')}
      ${field('Investigator', 'case.investigator')}
      ${field('Agency', 'case.agency')}
      ${field('Occupancy Type', 'case.occupancyType')}
      ${field('Fire Type', 'case.fireType')}
    </div>`);
  },
  people() {
    return `${card('People as Shared Objects', `<button class="btn blue" data-add="people" type="button">Add Person</button><p class="muted">People entered here can be linked to interviews.</p>`)}${listPeople()}`;
  },
  interviews() {
    return `${card('Interviews Linked to People', `<button class="btn blue" data-add="interviews" type="button">Add Interview</button>`)}${listInterviews()}`;
  },
  evidence() {
    return `${card('Evidence Module', `<button class="btn blue" data-add="evidence" type="button">Add Evidence Item</button>`)}${listEvidence()}`;
  },
  building() {
    return card('Building Module', `<div class="field-grid two">
      ${field('Property Use', 'building.propertyUse')}${field('Construction Type', 'building.constructionType')}
      ${field('Stories', 'building.stories')}${selectField('Basement', 'building.basement', ['Unknown', 'No', 'Yes', 'Partial'])}
      ${field('Occupancy Status', 'building.occupancyStatus')}${field('Area Involved', 'building.areaInvolved')}
      ${field('Fire Protection', 'building.fireProtection')}${field('Ventilation', 'building.ventilation')}
      ${field('Damage Summary', 'building.damageSummary', 'textarea')}${field('Building Notes', 'building.buildingNotes', 'textarea')}
    </div>`);
  },
  utilities() {
    return card('Utilities Module', `<div class="field-grid two">
      ${field('Electric Provider', 'utilities.electricProvider')}${selectField('Electric Status', 'utilities.electricStatus', ['Unknown', 'On', 'Off', 'Disconnected', 'Secured'])}
      ${field('Gas Provider', 'utilities.gasProvider')}${selectField('Gas Status', 'utilities.gasStatus', ['Unknown', 'On', 'Off', 'Disconnected', 'Secured', 'Not Present'])}
      ${field('Water Provider', 'utilities.waterProvider')}${selectField('Water Status', 'utilities.waterStatus', ['Unknown', 'On', 'Off', 'Secured'])}
      ${field('HVAC Type', 'utilities.hvacType')}${field('Utility Actions', 'utilities.utilityActions', 'textarea')}
      ${field('Utility Notes', 'utilities.notes', 'textarea')}
    </div>`);
  },
  electrical() {
    return `${card('Electrical Panels', `<button class="btn blue" data-add="panel" type="button">Add Panel</button><p class="muted">Each panel includes forty breaker positions.</p>`)}${state.electrical.panels.map(panelView).join('')}`;
  },
  exterior() {
    return card('Exterior: Front, Right, Rear, Left', `<div class="exterior-grid">${['Front','Right','Rear','Left'].map(side => `<button class="select-card" data-scroll-to="side-${side}" type="button"><strong>${side}</strong><span class="muted">${esc(state.exterior[side].damage || 'No damage notes')}</span></button>`).join('')}</div>`) + ['Front','Right','Rear','Left'].map(side => card(side, `<div id="side-${side}" class="field-grid">
      ${objectField('Damage / Fire Effects', `exterior.${side}`, 'damage', 'textarea')}
      ${objectField('Openings / Entry Points', `exterior.${side}`, 'openings', 'textarea')}
      ${objectField('Exterior Utilities', `exterior.${side}`, 'utilities', 'textarea')}
      ${objectField('Notes', `exterior.${side}`, 'notes', 'textarea')}
    </div>`, 'compact')).join('');
  },
  roof() {
    const styles = ['Gable', 'Hip', 'Flat', 'Shed', 'Mansard', 'Gambrel', 'Other'];
    return card('Roof Selector', `<div class="roof-grid">${styles.map(style => `<button class="select-card ${state.roof.style === style ? 'selected' : ''}" data-set="roof.style" data-value="${style}" type="button"><strong>${style}</strong><span class="muted">Tap to select</span></button>`).join('')}</div>
      <div class="field-grid two" style="margin-top:12px">${field('Roof Material', 'roof.material')}${field('Access / Observed From', 'roof.access')}${field('Ventilation', 'roof.ventilation')}${field('Damage', 'roof.damage', 'textarea')}${field('Roof Notes', 'roof.notes', 'textarea')}</div>`);
  },
  deck() {
    return card('Deck Module', `<div class="field-grid two">
      ${selectField('Deck Present', 'deck.present', ['Unknown', 'No', 'Yes'])}${field('Location', 'deck.location')}
      ${field('Material', 'deck.material')}${field('Attachment', 'deck.attachment')}
      ${field('Damage', 'deck.damage', 'textarea')}${field('Deck Notes', 'deck.notes', 'textarea')}
    </div>`);
  },
  alarms() {
    return `${card('Repeatable Smoke Alarms', `<button class="btn blue" data-add="alarms" type="button">Add Smoke Alarm</button>`)}${listAlarms()}`;
  },
  origin() {
    return card('Area of Origin', `<div class="callout">Investigator-entered origin only. No automated conclusion is produced.</div><div class="field-grid two" style="margin-top:12px">
      ${field('Area', 'origin.area')}${field('Room / Compartment', 'origin.room')}${field('Level', 'origin.level')}
      ${field('Indicators Considered', 'origin.indicators', 'textarea')}${field('Eliminated Areas', 'origin.eliminatedAreas', 'textarea')}${field('Investigator Conclusion', 'origin.investigatorConclusion', 'textarea')}
    </div>`);
  },
  ignition() {
    return card('Ignition Source Evaluation', `<div class="callout">Record evaluated sources and supporting facts. The app does not choose an ignition source.</div><div class="field-grid two" style="margin-top:12px">
      ${field('Ignition Source', 'ignition.source')}${field('First Fuel Ignited', 'ignition.firstFuel')}${field('Heat Source', 'ignition.heatSource')}
      ${field('Ignition Sequence', 'ignition.sequence', 'textarea')}${field('Eliminated Sources', 'ignition.eliminatedSources', 'textarea')}${field('Notes', 'ignition.notes', 'textarea')}
    </div>`);
  },
  cause() {
    return card('Origin & Cause Analysis', `<div class="callout">The investigator enters classification and cause. This app does not generate investigative conclusions.</div><div class="field-grid two" style="margin-top:12px">
      ${selectField('Cause Classification', 'cause.classification', ['Accidental', 'Incendiary', 'Natural', 'Undetermined'])}
      ${field('Cause Statement', 'cause.causeStatement', 'textarea')}${field('Supporting Facts', 'cause.supportingFacts', 'textarea')}${field('Limitations / Open Items', 'cause.limitations', 'textarea')}
    </div>`);
  },
  timeline() {
    return `${card('Timeline', `<button class="btn blue" data-add="timeline" type="button">Add Timeline Entry</button>`)}<div class="timeline">${state.timeline.map((entry, index) => timelineView(entry, index)).join('') || '<p class="muted">No timeline entries yet.</p>'}</div>`;
  },
  tasks() {
    return Object.entries(state.tasks).map(([key, task]) => card(task.label, `<div class="field-grid two">
      <div class="field"><label>Status</label><div class="segmented two"><button class="pill ${task.done ? 'selected' : ''}" data-set="tasks.${key}.done" data-value="true" type="button">Complete</button><button class="pill ${!task.done ? 'selected' : ''}" data-set="tasks.${key}.done" data-value="false" type="button">Open</button></div></div>
      ${field('Due Date', `tasks.${key}.due`, 'date')}${field('Notes', `tasks.${key}.notes`, 'textarea')}
    </div>`)).join('');
  },
  reports() {
    return `${card('Save / Open .fip Case File', `<div class="actions">
      <button class="btn green" data-download="fip" type="button">Save .fip Case File</button>
      <button class="btn secondary" data-open-file type="button">Open .fip Case File</button>
      <button class="btn danger" data-new-case type="button">Start New Blank Case</button>
    </div><p class="muted file-status">Autosave is local to this device. Use .fip files for transfer and records preservation.</p>`)}
    ${card('Reports / Crisp Notes Export', `<div class="field-grid">${field('Crisp Notes', 'notes.crispNotes', 'textarea')}</div><div class="actions"><button class="btn blue" data-download="notes" type="button">Export Crisp Notes .txt</button></div><pre class="report-preview">${esc(reportText())}</pre>`)}`;
  }
};

function listPeople() {
  return `<div class="list">${state.people.map((person, index) => card(person.name || `Person ${index + 1}`, `<div class="field-grid two">
    ${arrayInput('people', index, 'name', 'Name')}${arrayInput('people', index, 'role', 'Role')}${arrayInput('people', index, 'phone', 'Phone')}${arrayInput('people', index, 'email', 'Email')}${arrayInput('people', index, 'address', 'Address')}${arrayInput('people', index, 'notes', 'Notes', 'textarea')}
  </div><button class="btn ghost" data-remove="people" data-index="${index}" type="button">Remove Person</button>`, 'compact')).join('') || '<p class="muted">No people entered yet.</p>'}</div>`;
}

function personOptions(selected) {
  return `<option value="">Select person</option>${state.people.map(person => `<option value="${person.id}" ${selected === person.id ? 'selected' : ''}>${esc(person.name || 'Unnamed person')}</option>`).join('')}`;
}

function listInterviews() {
  return `<div class="list">${state.interviews.map((interview, index) => card(`Interview ${index + 1}`, `<div class="field-grid two">
    <div class="field"><label>Linked Person</label><select data-array="interviews" data-index="${index}" data-key="personId">${personOptions(interview.personId)}</select></div>
    ${arrayInput('interviews', index, 'date', 'Date', 'date')}${arrayInput('interviews', index, 'time', 'Time', 'time')}${arrayInput('interviews', index, 'location', 'Location')}${arrayInput('interviews', index, 'interviewer', 'Interviewer')}${arrayInput('interviews', index, 'method', 'Method')}${arrayInput('interviews', index, 'summary', 'Summary', 'textarea')}${arrayInput('interviews', index, 'followUp', 'Follow-up', 'textarea')}
  </div><button class="btn ghost" data-remove="interviews" data-index="${index}" type="button">Remove Interview</button>`, 'compact')).join('') || '<p class="muted">No interviews entered yet.</p>'}</div>`;
}

function listEvidence() {
  return `<div class="list">${state.evidence.map((item, index) => card(item.itemNumber || `Evidence ${index + 1}`, `<div class="field-grid two">
    ${arrayInput('evidence', index, 'itemNumber', 'Item Number')}${arrayInput('evidence', index, 'description', 'Description')}${arrayInput('evidence', index, 'locationFound', 'Location Found')}${arrayInput('evidence', index, 'collectedBy', 'Collected By')}${arrayInput('evidence', index, 'dateCollected', 'Date Collected', 'date')}${arrayInput('evidence', index, 'disposition', 'Disposition')}${arrayInput('evidence', index, 'chainOfCustody', 'Chain of Custody', 'textarea')}${arrayInput('evidence', index, 'notes', 'Notes', 'textarea')}
  </div><button class="btn ghost" data-remove="evidence" data-index="${index}" type="button">Remove Evidence</button>`, 'compact')).join('') || '<p class="muted">No evidence entered yet.</p>'}</div>`;
}

function listAlarms() {
  return `<div class="list">${state.alarms.map((alarm, index) => card(alarm.location || `Smoke Alarm ${index + 1}`, `<div class="field-grid two">
    ${arrayInput('alarms', index, 'location', 'Location')}${arrayInput('alarms', index, 'type', 'Type')}${arrayInput('alarms', index, 'power', 'Power Source')}
    ${arraySelect('alarms', index, 'present', 'Present', ['Unknown','Yes','No'])}${arraySelect('alarms', index, 'operated', 'Operated', ['Unknown','Yes','No'])}${arrayInput('alarms', index, 'notes', 'Notes', 'textarea')}
  </div><button class="btn ghost" data-remove="alarms" data-index="${index}" type="button">Remove Alarm</button>`, 'compact')).join('') || '<p class="muted">No smoke alarms entered yet.</p>'}</div>`;
}

function arrayInput(array, index, key, label, type = 'text') {
  const value = state[array][index][key] || '';
  if (type === 'textarea') return `<div class="field"><label>${label}</label><textarea data-array="${array}" data-index="${index}" data-key="${key}">${esc(value)}</textarea></div>`;
  return `<div class="field"><label>${label}</label><input data-array="${array}" data-index="${index}" data-key="${key}" type="${type}" value="${esc(value)}" /></div>`;
}

function arraySelect(array, index, key, label, options) {
  const value = state[array][index][key] || '';
  return `<div class="field"><label>${label}</label><select data-array="${array}" data-index="${index}" data-key="${key}">${options.map(option => `<option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>`).join('')}</select></div>`;
}

function panelView(panel, panelIndex) {
  return card(panel.name || `Panel ${panelIndex + 1}`, `<div class="field-grid two">
    ${panelInput(panelIndex, 'name', 'Panel Name')}${panelInput(panelIndex, 'location', 'Location')}${panelInput(panelIndex, 'manufacturer', 'Manufacturer')}${panelInput(panelIndex, 'mainBreaker', 'Main Breaker')}${panelInput(panelIndex, 'condition', 'Condition')}${panelInput(panelIndex, 'notes', 'Panel Notes', 'textarea')}
  </div><h3>40 Breakers</h3><div class="breaker-grid">${panel.breakers.map((breaker, breakerIndex) => `<div class="breaker-row"><div class="breaker-number">${breaker.number}</div><input aria-label="Breaker ${breaker.number} label" data-breaker="label" data-panel-index="${panelIndex}" data-breaker-index="${breakerIndex}" value="${esc(breaker.label)}" placeholder="Label" /><input aria-label="Breaker ${breaker.number} amps" data-breaker="amp" data-panel-index="${panelIndex}" data-breaker-index="${breakerIndex}" value="${esc(breaker.amp)}" placeholder="Amp" /></div>`).join('')}</div><button class="btn ghost" data-remove-panel="${panelIndex}" type="button">Remove Panel</button>`, 'compact');
}

function panelInput(index, key, label, type = 'text') {
  const value = state.electrical.panels[index][key] || '';
  if (type === 'textarea') return `<div class="field"><label>${label}</label><textarea data-panel="${key}" data-panel-index="${index}">${esc(value)}</textarea></div>`;
  return `<div class="field"><label>${label}</label><input data-panel="${key}" data-panel-index="${index}" value="${esc(value)}" /></div>`;
}

function timelineView(entry, index) {
  return `<div class="timeline-entry"><div class="field-grid two">${arrayInput('timeline', index, 'date', 'Date', 'date')}${arrayInput('timeline', index, 'time', 'Time', 'time')}${arrayInput('timeline', index, 'title', 'Title')}${arrayInput('timeline', index, 'source', 'Source')}${arrayInput('timeline', index, 'notes', 'Notes', 'textarea')}</div><button class="btn ghost" data-remove="timeline" data-index="${index}" type="button">Remove Entry</button></div>`;
}

function reportText() {
  const c = state.case;
  const lines = [
    'FIRE INVESTIGATION PLATFORM - CRISP NOTES',
    `Case: ${c.caseNumber || ''}`,
    `Address: ${c.incidentAddress || ''}, ${c.city || ''} ${c.state || ''}`.trim(),
    `Investigator: ${c.investigator || ''}`,
    `Incident: ${c.incidentDate || ''} ${c.incidentTime || ''}`.trim(),
    '',
    'AREA OF ORIGIN', state.origin.investigatorConclusion || state.origin.area || '', '',
    'IGNITION SOURCE EVALUATION', state.ignition.source || '', state.ignition.sequence || '', '',
    'ORIGIN & CAUSE', state.cause.classification || '', state.cause.causeStatement || '', '',
    'EVIDENCE', ...state.evidence.map(item => `- ${item.itemNumber || 'Item'}: ${item.description || ''} (${item.locationFound || 'location not entered'})`), '',
    'TASKS', ...Object.values(state.tasks).map(task => `- ${task.done ? '[x]' : '[ ]'} ${task.label}${task.due ? ` due ${task.due}` : ''}`), '',
    'NOTES', state.notes.crispNotes || ''
  ];
  return lines.join('\n');
}

function download(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function fileBaseName() {
  return (state.case.caseNumber || 'fire-investigation-case').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function bindEvents() {
  $('#menuButton').addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    $('#menuButton').setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('input', handleInput);
  document.addEventListener('change', handleInput);
  document.addEventListener('click', handleClick);
  $('#openFile').addEventListener('change', openFile);
}

function handleInput(event) {
  const el = event.target;
  if (el.dataset.path) setValue(el.dataset.path, coerce(el.value));
  if (el.dataset.objectPath) setValue(el.dataset.objectPath, el.value);
  if (el.dataset.array) { state[el.dataset.array][Number(el.dataset.index)][el.dataset.key] = el.value; saveSoon(); }
  if (el.dataset.panel) { state.electrical.panels[Number(el.dataset.panelIndex)][el.dataset.panel] = el.value; saveSoon(); }
  if (el.dataset.breaker) { state.electrical.panels[Number(el.dataset.panelIndex)].breakers[Number(el.dataset.breakerIndex)][el.dataset.breaker] = el.value; saveSoon(); }
}

function coerce(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function handleClick(event) {
  const el = event.target.closest('button');
  if (!el) return;
  if (el.dataset.nav || el.dataset.goto) { active = el.dataset.nav || el.dataset.goto; nav.classList.remove('open'); $('#menuButton').setAttribute('aria-expanded', 'false'); render(); return; }
  if (el.dataset.set) { setValue(el.dataset.set, coerce(el.dataset.value)); render(); return; }
  if (el.dataset.add) { addItem(el.dataset.add); render(); return; }
  if (el.dataset.remove) { state[el.dataset.remove].splice(Number(el.dataset.index), 1); saveSoon(); render(); return; }
  if (el.dataset.add === 'panel') { state.electrical.panels.push(blankPanel()); saveSoon(); render(); return; }
  if (el.dataset.removePanel) { state.electrical.panels.splice(Number(el.dataset.removePanel), 1); if (!state.electrical.panels.length) state.electrical.panels.push(blankPanel()); saveSoon(); render(); return; }
  if (el.dataset.openFile !== undefined) { $('#openFile').click(); return; }
  if (el.dataset.download === 'fip') { state.meta.updatedAt = new Date().toISOString(); download(`${fileBaseName()}.fip`, JSON.stringify(state, null, 2)); saveSoon(); return; }
  if (el.dataset.download === 'notes') { download(`${fileBaseName()}-crisp-notes.txt`, reportText(), 'text/plain'); return; }
  if (el.dataset.newCase !== undefined && confirm('Start a new blank case on this device? Save a .fip first if needed.')) { state = blankCase(); saveSoon(); active = 'overview'; render(); return; }
  if (el.dataset.scrollTo) document.getElementById(el.dataset.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function addItem(type) {
  const factories = { people: blankPerson, interviews: blankInterview, evidence: blankEvidence, alarms: blankAlarm, timeline: blankTimeline };
  if (type === 'panel') state.electrical.panels.push(blankPanel());
  else state[type].push(factories[type]());
  saveSoon();
}

function openFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = normalize(JSON.parse(reader.result));
      state.case.fileName = file.name;
      saveSoon();
      active = 'overview';
      render();
    } catch (error) {
      alert('Unable to open this .fip file. Confirm it contains valid JSON.');
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.warn));
}

bindEvents();
render();
saveSoon();
