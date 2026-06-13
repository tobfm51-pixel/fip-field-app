import fs from 'node:fs';

const app = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

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

const acceptedDataPaths = [
  'initial.caseNumber', 'initial.cause', 'fireDept.fdNotes', 'caller.name', 'fireDept.department', 'environment.temperature', 'scene.narrative',
  'exterior.front', 'exterior.right', 'exterior.rear', 'exterior.left', 'building.propertyDescription', 'building.alarmNotes', 'lifeSafety.smokeAlarms', 'utilities.electricProvider',
  'electrical.serviceNotes', 'panelType', 'breakerLayout', 'interior.firstFloor', 'rooms', 'windows', 'originAreas', 'firePatterns',
  'ignitionSources', 'ignitionMatrix', 'exposureStructures', 'photos', 'evidence', 'propertyCounter', 'station', 'locker', 'interviews', 'personId', 'INTERVIEW_PROMPTS', 'timelineEvents', 'crispNotesText', 'initialReportText', 'sectionStatus', 'report.areaOfOrigin'
];
const missingDataPaths = acceptedDataPaths.filter(path => !app.includes(path));

const requiredTaskLabels = [
  'Submit Initial Report',
  'Upload Photos to Google Drive',
  'Upload Photos to LCSO Digital Evidence Platform'
];
const missingTaskLabels = requiredTaskLabels.filter(label => !app.includes(label));

const failures = [
  ['screen registry entries', missingNav],
  ['render map entries', missingRenderMap],
  ['screen functions', missingFunctions],
  ['accepted data paths', missingDataPaths],
  ['required task labels', missingTaskLabels]
].filter(([, missing]) => missing.length);

if (failures.length) {
  for (const [label, missing] of failures) console.error(`Missing ${label}: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Preservation check passed for ${acceptedScreens.length} accepted screens and ${requiredMobileAdditions.length} mobile-required additions.`);
