# Mobile PWA Preservation Checklist

This checklist documents the current PR revision. The scope is the accepted desktop workflow adapted to mobile screens plus the requested field-use corrections. Every item below is **YES**.

## Field-use correction checklist

| Requirement | YES/NO | Evidence |
| --- | --- | --- |
| New Case wizard with case number and incident type | YES | `newCaseWizard()` collects the FM report number and incident type before activation. |
| Default FM report number prefix `FMYY0000` | YES | `defaultFmNumber()` seeds blank/new cases. |
| Incident type controls base modules/forms shown | YES | `visibleScreens()` filters the section rail by incident type. |
| One Roof module only with image selector | YES | Roof fields are removed from Building, and `roofSelector()` uses roof image cards in the Roof screen. |
| Electrical general damage/notes above breakers | YES | Electrical panel condition, arc/damage mapping, and notes render before `breakerLayout()`. |
| Electrical breaker fields limited to requested field set | YES | Breakers render Labeled As, Breaker Type, Breaker Size, Status, and Notes only. |
| Breaker Type defaults to Single Pole | YES | `breakerPosition()` seeds empty breaker type values to Single Pole. |
| People role is single-select | YES | `personCard()` renders one Role select rather than role toggle buttons. |
| Final Area of Origin is at bottom of AO workflow | YES | `areaOrigin()` renders candidates first and the final determination card last. |
| Potential Ignition Sources keep observations and why considered | YES | `ignitionSourceCard()` renders Observations and Why Considered without testing/status fields. |
| Evidence/photo prefix with auto-increment numbering | YES | `settings.evidencePrefix`, `settings.photoPrefix`, and `nextNumber()` drive new item numbers. |
| Evidence secured disposition | YES | Evidence uses the requested secured-location choices, editable secured date/time, conditional locker/storage field, and report exports. |
| Interview questions populate by interview type | YES | `INTERVIEW_PROMPTS`, `syncInterviewQuestions()`, and `interviewQuestionFields()` render type-specific questions. |

## Existing accepted workflow screens/modules

| Screen / module | Preserved in mobile PWA |
| --- | --- |
| Case Overview / Case Engine | YES |
| Initial Information | YES |
| Initial Scene Assessment | YES |
| Building | YES |
| Utilities | YES |
| Electrical | YES |
| Electrical Panels / Breakers | YES |
| Exterior Examination | YES |
| Roof Examination | YES |
| Interior Examination | YES |
| People / Interested Parties | YES |
| Vehicles | YES |
| Machinery / Equipment | YES |
| Exposure Structures / Additional Structures | YES |
| Rooms / Areas / Windows / Electrical Notes | YES |
| Area(s) of Origin | YES |
| Fire Pattern Documentation | YES |
| Potential Ignition Sources | YES |
| Ignition Source Assessment Matrix | YES |
| Photos | YES |
| Evidence | YES |
| Interviews | YES |
| Timeline | YES |
| Tasks | YES |
| Reports | YES |
| Files / Export | YES |

## Verification command

```bash
node scripts/check-workflow-preservation.mjs
```
