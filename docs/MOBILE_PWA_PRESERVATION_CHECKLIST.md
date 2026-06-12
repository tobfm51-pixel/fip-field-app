# Mobile PWA Preservation Checklist

This checklist documents the accepted Alpha 1.2 desktop-style workflow screens/modules and confirms that the mobile-first PWA presentation keeps them present instead of replacing or simplifying them.

## Accepted workflow screens/modules

| Screen / module | Preserved in mobile PWA | Evidence |
| --- | --- | --- |
| Case Dashboard / Case Engine | Yes | `dashboard()` screen, `caseEngine`, case create/open/export actions, dashboard KPIs |
| Initial Information | Yes | `initial()` screen with incident information, incident timeline, caller, law enforcement, fire suppression, and environmental fields |
| Initial Scene Assessment | Yes | `scene()` screen with orientation, narrative, and illumination checklist |
| Building | Yes | `building()` screen with property description, construction, roof selector, and life safety/security fields |
| Utilities | Yes | `utilities()` screen with electrical, gas/fuel, generator, battery storage, and notes fields |
| Electrical | Yes | `electrical()` screen with service notes and repeatable electrical panels |
| Electrical Panels / Breakers | Yes | `electricalPanelCard()` and `breakerLayout()` preserve panel metadata and breaker-position documentation |
| Exterior Examination | Yes | `exterior()` screen preserves Front, Left, Rear, and Right exterior observation fields |
| Roof Examination | Yes | `roof()` screen preserves roof style selector, roof covering, roof condition/damage, ventilation, and roof notes |
| Interior Examination | Yes | `interior()` screen preserves general, first floor, second floor, basement, attic, garage, and other fields |
| People / Interested Parties | Yes | `people()` screen with repeatable person records and roles |
| Vehicles | Yes | `vehicles()` screen with repeatable vehicle records |
| Machinery / Equipment | Yes | `machinery()` screen with repeatable machinery/equipment records |
| Exposure Structures / Additional Structures | Yes | `exposures()` screen with repeatable exposure records |
| Rooms / Areas / Windows / Electrical Notes | Yes | `rooms()` screen preserves rooms, window documentation, and room/area electrical notes |
| Area(s) of Origin | Yes | `areaOrigin()` screen preserves final area of origin, origin notes, and repeatable origin candidates |
| Fire Pattern Documentation | Yes | `firePatterns()` screen preserves repeatable observed fire pattern documentation |
| Potential Ignition Sources | Yes | `ignitionSources()` screen preserves repeatable potential ignition source records and investigator-only determination guidance |
| Ignition Source Assessment Matrix | Yes | `ignitionMatrix()` screen preserves retained/eliminated/undetermined source evaluation workflow |
| Photos | Yes | `photos()` screen preserves the photo log workflow |
| Evidence | Yes | `evidence()` screen preserves the evidence log workflow |
| Interviews | Yes | `interviews()` screen preserves interview guide/type selection and repeatable interview notes |
| Reports | Yes | `reports()` screen preserves report builder, report fields, draft narrative, and copy action |
| Files / Export | Yes | `files()` screen preserves `.fip` export, share/save, import, and new-case workflow |

## Required mobile additions without regression

| Required item | Present | Evidence |
| --- | --- | --- |
| PWA installable on iPhone/iPad | Yes | iOS web app meta tags, manifest, touch icon, and service worker app-shell cache |
| Case ribbon | Yes | `#caseRibbon` in the topbar and `updateCaseRibbon()` in app logic |
| Full-width section navigation | Yes | Dynamic `SCREEN_REGISTRY`-driven horizontal `.rail` navigation containing all accepted screens plus required additions |
| Save/Open `.fip` case file | Yes | Existing `exportFip()` and `#importFile` import workflow preserved |
| Local autosave | Yes | Existing `save()` / `scheduleSave()` localStorage flow preserved |
| People as shared objects | Yes | Existing `people` collection and People screen preserved |
| Interviews linked to People workflow | Yes | Existing interview records and person/interview fields preserved; no accepted interview functionality removed |
| Deck module | Yes | `deck()` screen and `deck` case object added |
| Repeatable smoke alarms | Yes | `smokeAlarms` collection, template, card, and screen added while preserving accepted `lifeSafety` smoke alarm fields |
| Tasks | Yes | Required task records and `tasks()` screen added |
| No AI-generated investigative conclusions | Yes | Origin, ignition, and cause/report fields remain investigator-entered records |

## Verification command

Run this preservation guard after edits; it checks the dynamic screen registry, render map, screen functions, accepted data paths, and required task labels:

```bash
node scripts/check-workflow-preservation.mjs
```
