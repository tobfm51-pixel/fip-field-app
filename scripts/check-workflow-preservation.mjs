import fs from 'node:fs';

const app = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

const acceptedScreens = [
  'dashboard', 'initial', 'scene', 'building', 'utilities', 'electrical', 'exterior', 'roof', 'interior',
  'people', 'vehicles', 'machinery', 'exposures', 'rooms', 'areaOrigin', 'firePatterns', 'ignitionSources',
  'ignitionMatrix', 'photos', 'evidence', 'interviews', 'reports', 'files'
];
const requiredMobileAdditions = ['deck', 'smokeAlarms', 'timeline', 'tasks'];
const allScreens = [...acceptedScreens, ...requiredMobileAdditions];

const missingNav = allScreens.filter(screen => !app.includes(`id:'${screen}'`) && !app.includes(`id:"${screen}"`));
const missingRenderMap = allScreens.filter(screen => !new RegExp(`const map=\\{[^}]*\\b${screen}\\b`, 's').test(app));
const missingFunctions = allScreens.filter(screen => !new RegExp(`function\\s+${screen}\\s*\\(`).test(app));

const requiredText = [
  'function newCaseWizard', 'defaultFmNumber', 'FM Report Number', 'Address', 'City', 'First Evidence Item', 'First Photo Number', 'visibleScreens', 'Roof Style', 'roofSvg',
  'panelType', 'Main Panel', 'Subpanel', 'Number of Spaces', "options:['20','30','40','42']", 'Rooms Documentation', 'Window Documentation', 'Labeled As', 'Single Pole', 'settings.firstEvidenceItem',
  'settings.firstPhotoNumber', 'lastEvidenceCollector', 'collectorSelect', 'collectedByPersonId', 'evidenceSecured', 'dateSecured', 'timeSecured', 'lockerStorageLocation', 'personId',
  'INTERVIEW_PROMPTS', 'questions:promptsForInterviewType', 'whyConsidered', 'observations', 'crispNotesText',
  'initialReportText', 'timelineEvents', 'evidenceDispositionLines', 'LCSO Property Counter', 'FMO Evidence Storage Locker', 'Submit Initial Report', 'Upload Photos to Google Drive',
  'Upload Photos to LCSO Digital Evidence Platform'
];
const missingRequiredText = requiredText.filter(text => !app.includes(text));
const forbiddenLiteral = 'juris' + 'diction';
const forbidden = [];
const missingResponsiveCss = ['max-width:767px', 'min-width:768px', 'max-width:1199px', 'min-width:1200px', 'grid-template-areas:"topbar topbar" "rail main"'].filter(text => !css.includes(text));
if(app.toLowerCase().includes(forbiddenLiteral)) forbidden.push('removed field still present in app.js');
if(html.toLowerCase().includes(forbiddenLiteral)) forbidden.push('removed field still present in index.html');
if(app.includes('Area ' + 'Served')) forbidden.push('old breaker label still present');
if(app.includes('property' + 'Counter')) forbidden.push('old evidence yes/no control still present');
if(app.includes('La' + 'b / ' + 'Submission')) forbidden.push('excluded submission field still present');
if(app.includes('Evidence ' + 'Status')) forbidden.push('evidence status field was introduced');
if(app.includes('Date ' + 'Notified') || app.includes('Time ' + 'Notified') || app.includes('date' + 'Notified') || app.includes('time' + 'Notified')) forbidden.push('notified date/time field still present');
if(app.includes('How ' + 'Reported') || app.includes('how' + 'Reported')) forbidden.push('caller how-reported field still present');
if(app.includes("checks('Rol" + "es'")) forbidden.push('multi-select person role still present');
if(app.includes('Section Completion ' + 'Tracking')) forbidden.push('section-completion dashboard was reintroduced');
if(app.includes('Dynamic Rooms / ' + 'Areas')) forbidden.push('rooms collection still embedded in Interior');
if(app.includes("'area" + "OfOrigin','Area of Origin?'")) forbidden.push('room origin flag still present');
if(app.includes('supporting' + 'Photos')) forbidden.push('area origin supporting photo field still present');

const failures = [
  ['screen registry entries', missingNav],
  ['render map entries', missingRenderMap],
  ['screen functions', missingFunctions],
  ['field-use requirements', missingRequiredText],
  ['responsive CSS breakpoints', missingResponsiveCss],
  ['forbidden regressions', forbidden]
].filter(([, missing]) => missing.length);

if (failures.length) {
  for (const [label, missing] of failures) console.error(`Missing ${label}: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Preservation check passed for ${acceptedScreens.length} accepted screens, ${requiredMobileAdditions.length} mobile additions, and field-use fixes.`);
