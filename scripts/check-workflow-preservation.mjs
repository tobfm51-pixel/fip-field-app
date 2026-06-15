import fs from 'node:fs';

const app = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

const acceptedScreens = [
  'dashboard', 'initial', 'scene', 'building', 'utilities', 'electrical', 'exterior', 'roof', 'interior',
  'people', 'rooms', 'areaOrigin', 'firePatterns', 'ignitionSources', 'ignitionMatrix', 'photos',
  'evidence', 'interviews', 'exports'
];
const investigationItemOnlyScreens = ['vehicles', 'machinery', 'exposures'];
const requiredMobileAdditions = ['deck', 'smokeAlarms', 'timeline', 'tasks'];
const allScreens = [...acceptedScreens, ...investigationItemOnlyScreens, ...requiredMobileAdditions];

const missingNav = acceptedScreens.concat(requiredMobileAdditions).filter(screen => !app.includes(`id:'${screen}'`) && !app.includes(`id:"${screen}"`));
const missingRenderMap = allScreens.filter(screen => !new RegExp(`const map=\\{[^}]*\\b${screen}\\b`, 's').test(app));
const missingFunctions = allScreens.filter(screen => !new RegExp(`function\\s+${screen}\\s*\\(`).test(app));

const requiredText = [
  'function newCaseWizard', 'defaultFmNumber', 'FM Report Number', 'visibleScreens', 'Roof Style', 'roofSvg',
  'panelType', 'Main Panel', 'Subpanel', 'Labeled As', 'Single Pole', 'settings.evidencePrefix',
  'settings.photoPrefix', 'lastEvidenceCollector', 'evidenceSecured', 'dateSecured', 'timeSecured', 'lockerStorageLocation', 'personId',
  'INTERVIEW_PROMPTS', 'questions:promptsForInterviewType', 'whyConsidered', 'observations', 'crispNotesText',
  'initialReportText', 'timelineEvents', 'evidenceDispositionLines', 'LCSO Property Counter', 'FMO Evidence Storage Locker', 'Submit Initial Report', 'Upload Photos to Google Drive',
  'Upload Photos to LCSO Digital Evidence Platform',
  'INVESTIGATION_ITEM_TYPES', 'Vehicle', 'Machinery / Equipment', 'Exposure Structure', 'Appliance', 'Injury / Fatality', 'Other Item',
  'Injury/Fatality documentation pending approved field form.', 'applianceFields', 'Check Recalls',
  'function exports', 'Export Case Bundle ZIP', 'Export Crisp Notes PDF', 'Export Initial Report TXT', 'Export .fip', 'Export Task List TXT', 'Open .fip', 'exportCaseBundle', 'taskListText'
];
const missingRequiredText = requiredText.filter(text => !app.includes(text));
const forbiddenLiteral = 'juris' + 'diction';
const forbidden = [];
if(app.toLowerCase().includes(forbiddenLiteral)) forbidden.push('removed field still present in app.js');
if(html.toLowerCase().includes(forbiddenLiteral)) forbidden.push('removed field still present in index.html');
if(app.includes('Area ' + 'Served')) forbidden.push('old breaker label still present');
if(app.includes('property' + 'Counter')) forbidden.push('old evidence yes/no control still present');
if(app.includes("checks('Rol" + "es'")) forbidden.push('multi-select person role still present');
if(app.includes('Section Completion ' + 'Tracking')) forbidden.push('section-completion dashboard was reintroduced');
if(/const INVESTIGATION_ITEM_TYPES = \[[^\]]*Battery \/ Energy Storage/s.test(app)) forbidden.push('battery/energy storage added as an investigation item before approval');
if(/const base = new Set\([^;]*(?:vehicles|machinery|exposures)/s.test(app)) forbidden.push('vehicle, machinery, or exposure restored as permanent visible navigation');

const failures = [
  ['screen registry entries', missingNav],
  ['render map entries', missingRenderMap],
  ['screen functions', missingFunctions],
  ['field-use requirements', missingRequiredText],
  ['forbidden regressions', forbidden]
].filter(([, missing]) => missing.length);

if (failures.length) {
  for (const [label, missing] of failures) console.error(`Missing ${label}: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Preservation check passed for ${acceptedScreens.length} visible screens, investigation-item vehicle/machinery/exposure access, Appliance and Injury/Fatality items, Exports, and field-use fixes.`);
