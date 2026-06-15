import fs from 'node:fs';

const app = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

const acceptedScreens = [
  'dashboard', 'initial', 'scene', 'building', 'utilities', 'electrical', 'exterior', 'roof', 'interior',
  'people', 'investigationItems', 'rooms', 'areaOrigin', 'firePatterns', 'ignitionSources',
  'ignitionMatrix', 'photos', 'evidence', 'interviews', 'reports', 'files'
];
const requiredMobileAdditions = ['deck', 'smokeAlarms', 'timeline', 'tasks'];
const allScreens = [...acceptedScreens, ...requiredMobileAdditions];

const missingNav = allScreens.filter(screen => !app.includes(`id:'${screen}'`) && !app.includes(`id:"${screen}"`));
const missingRenderMap = allScreens.filter(screen => !new RegExp(`const map=\\{[^}]*\\b${screen}\\b`, 's').test(app));
const missingFunctions = allScreens.filter(screen => !new RegExp(`function\\s+${screen}\\s*\\(`).test(app));

const requiredText = [
  'function newCaseWizard', 'defaultFmNumber', 'FM Report Number', 'visibleScreens', 'Roof Style', 'roofSvg',
  'panelType', 'Main Panel', 'Subpanel', 'Labeled As', 'Single Pole', 'settings.evidencePrefix',
  'settings.photoPrefix', 'lastEvidenceCollector', 'evidenceSecured', 'dateSecured', 'timeSecured', 'lockerStorageLocation', 'personId',
  'INTERVIEW_PROMPTS', 'questions:promptsForInterviewType', 'whyConsidered', 'observations', 'crispNotesText',
  'initialReportText', 'timelineEvents', 'evidenceDispositionLines', 'LCSO Property Counter', 'FMO Evidence Storage Locker', 'Submit Initial Report', 'Upload Photos to Google Drive',
  'Upload Photos to LCSO Digital Evidence Platform'
];
const missingRequiredText = requiredText.filter(text => !app.includes(text));
const investigationItemRequirements = [
  ['Additional Investigation Items section', 'Additional Investigation Items'],
  ['+ Add Item flow', 'data-action="addInvestigationItem"'],
  ['Vehicle item type', 'Vehicle'],
  ['Machinery / Equipment item type', 'Machinery / Equipment'],
  ['Exposure Structure item type', 'Exposure Structure'],
  ['Appliance item type', 'Appliance'],
  ['Appliance renderer', 'function applianceFields'],
  ['Check Recalls placeholder action', "a==='checkRecalls'"]
];
const missingInvestigationItems = investigationItemRequirements.filter(([, text]) => !app.includes(text)).map(([label]) => label);
const forbiddenLiteral = 'juris' + 'diction';
const forbidden = [];
if(app.toLowerCase().includes(forbiddenLiteral)) forbidden.push('removed field still present in app.js');
if(html.toLowerCase().includes(forbiddenLiteral)) forbidden.push('removed field still present in index.html');
if(app.includes('Area ' + 'Served')) forbidden.push('old breaker label still present');
if(app.includes('property' + 'Counter')) forbidden.push('old evidence yes/no control still present');
if(app.includes("checks('Rol" + "es'")) forbidden.push('multi-select person role still present');
if(app.includes('Section Completion ' + 'Tracking')) forbidden.push('section-completion dashboard was reintroduced');

const failures = [
  ['screen registry entries', missingNav],
  ['render map entries', missingRenderMap],
  ['screen functions', missingFunctions],
  ['field-use requirements', missingRequiredText],
  ['investigation item framework requirements', missingInvestigationItems],
  ['forbidden regressions', forbidden]
].filter(([, missing]) => missing.length);

if (failures.length) {
  for (const [label, missing] of failures) console.error(`Missing ${label}: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Preservation check passed for ${acceptedScreens.length} accepted screens, ${requiredMobileAdditions.length} mobile additions, field-use fixes, and approved Investigation Items framework checks.`);
