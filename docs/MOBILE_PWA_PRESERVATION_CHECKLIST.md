# Mobile PWA Preservation Checklist

This checklist documents the PR #16 preservation review after revising the mobile-first PWA. Every listed checklist item is now **YES**.

## Required YES / NO checklist

### Initial Incident
| Item | YES/NO | Evidence |
| --- | --- | --- |
| All fields preserved? | YES | `initial()` renders the incident fields, `initial.cause`, caller, law enforcement, fire suppression, `fireDept.fdNotes`, and environmental fields. |

### Building Information
| Item | YES/NO | Evidence |
| --- | --- | --- |
| All fields preserved? | YES | `building()` renders property, construction, life safety/security, and `building.alarmNotes`. |

### Utilities
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Electric? | YES | Electric card in `utilities()`. |
| Natural Gas? | YES | Natural Gas card in `utilities()`. |
| LP/Propane? | YES | Propane / LP card in `utilities()`. |
| Solar? | YES | Solar card in `utilities()`. |
| Generator? | YES | Generator card in `utilities()`. |
| Battery Storage? | YES | Battery Storage card in `utilities()`. |

### Electrical
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Multiple panels? | YES | Repeatable `electrical.panels` collection. |
| Subpanels? | YES | Panel Type / Designation supports Main Panel / Subpanel / Other. |
| 40 breaker layout? | YES | `breakerLayout()` defaults spaces to 40 and renders breaker positions. |
| Circuit labels? | YES | Breakers include area served and circuit fields; circuit cards preserve circuit number/area served. |
| Manufacturer? | YES | Electrical panel card renders Manufacturer. |

### Exterior
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Front | YES | Exterior screen renders Front first. |
| Right | YES | Exterior screen renders Right second. |
| Rear | YES | Exterior screen renders Rear third. |
| Left | YES | Exterior screen renders Left fourth. |
| Decks | YES | Deck module is present. |
| Roof selector | YES | Roof selector is present. |

### Interior
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Repeatable rooms? | YES | `rooms` collection and Dynamic Rooms / Areas are preserved. |

### People
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Name | YES | Person card renders Name. |
| Address | YES | Person card renders Address. |
| Phone | YES | Person card renders Phone. |
| OLN | YES | Person card renders OLN. |
| State | YES | Person card renders OLN State. |
| Social | YES | Person card renders Social. |
| Roles | YES | Person card renders multi-role buttons and legacy/primary role. |

### Interviews
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Linked to People? | YES | Interviews use `personId` and a People-populated dropdown. |
| Dynamic interview questions? | YES | `INTERVIEW_PROMPTS` loads type-specific prompts. |
| Prompts based on interview type? | YES | `interviewPromptBlock()` renders prompts for the selected interview type. |

### Evidence
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Auto-select last collector? | YES | `lastEvidenceCollector()` defaults new evidence to the most recent collector. |
| Property counter? | YES | Evidence card renders Property Counter. |
| Locker? | YES | Evidence card renders Locker. |
| Station? | YES | Evidence card renders Station. |

### Origin
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Multiple origin areas? | YES | `originAreas` repeatable collection is preserved. |

### Ignition Sources
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Repeatable? | YES | `ignitionSources` repeatable collection is preserved. |

### Reports
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Crisp notes? | YES | `crispNotesText()` export is available. |
| Initial report? | YES | `initialReportText()` export is available. |
| Summary report? | YES | Existing `reportText()` summary report is preserved and exportable. |

### Timeline
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Automatic timeline? | YES | Timeline screen auto-generates from reported, dispatch, arrival, scene release, evidence, interviews, utilities, and manual timeline entries. |

### Tasks
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Today's Tasks? | YES | Tasks screen includes Today's Tasks, required tasks, custom tasks, and Open / Done / N/A statuses. |

### Case Overview
| Item | YES/NO | Evidence |
| --- | --- | --- |
| Counts? | YES | Existing dashboard counts are preserved. |
| Progress? | YES | Dashboard computes percent complete and case health. |
| Section completion? | YES | Dashboard renders section completion status for each registered section. |

### Mobile
| Item | YES/NO | Evidence |
| --- | --- | --- |
| One-handed? | YES | Single-column mobile layout and sticky horizontal section rail. |
| No desktop tables? | YES | Mobile cards/lists are used instead of desktop tables. |
| Full-width buttons? | YES | Action buttons are full-width by default on mobile. |
| Large touch targets? | YES | Buttons/inputs use 44px+ minimum touch targets. |

## Existing accepted workflow screens/modules

| Screen / module | Preserved in mobile PWA |
| --- | --- |
| Case Dashboard / Case Engine | YES |
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
| Reports | YES |
| Files / Export | YES |

## Verification command

Run this preservation guard after edits; it checks the dynamic screen registry, render map, screen functions, accepted data paths, missing fields from this review, timeline/report/task additions, and required task labels:

```bash
node scripts/check-workflow-preservation.mjs
```
