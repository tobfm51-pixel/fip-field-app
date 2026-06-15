# Fire Investigation Platform (FIP)
# Module Specifications

Version: 1.1 (Living Document)

---

# Purpose

This document defines the functional specifications for every module within the Fire Investigation Platform ecosystem.

Where Governance.md defines the platform philosophy and Project Instructions.md defines development standards, this document defines how each module functions.

This document shall evolve throughout the life of the project.

This document shall be updated whenever an approved module workflow, field, validation rule, or user interface behavior changes. It serves as the authoritative specification for module implementation.

---

# Module Design Standards

Every module shall define:

- Purpose
- Workflow
- Required Fields
- Optional Fields
- Shared Objects
- Relationships
- Validation Rules
- Observation Assistant Behavior
- Report Output
- Future Enhancements

Modules should follow a consistent user experience and support mobile-first operation.

---

# Current Workflow

1. Initial Information
2. Building Information
3. Utilities
4. Safety Assessment
5. Exterior Documentation
6. Interior Documentation
7. Evidence
8. People
9. Interviews
10. Surveillance Camera Canvass
11. Area(s) of Origin
12. Potential Ignition Sources
13. Origin & Cause Analysis
14. Reports

---

# Module Specifications

---

# Initial Information

Purpose

Capture the initial dispatch and incident information.

Status

In Development

---

# Building Information

Purpose

Document the building and property.

Status

In Development

---

# Utilities

Purpose

Document electrical, gas, water, solar, generators, battery storage, and utility conditions.

Status

In Development

---

# Safety Assessment

Purpose

Document scene hazards and investigator safety considerations.

Status

Planned

---

# Exterior Documentation

Purpose

Document exterior observations without rendering conclusions.

Status

In Development

---

# Interior Documentation

Purpose

Document interior observations by room and area.

Status

In Development

---

# Evidence

Purpose

Document physical evidence collected during the investigation.

Current Design

- Evidence Number
- Description
- Location Collected
- Collected By
- Date/Time Collected
- Date/Time Delivered to LCSO
- LCSO Station
- Evidence Secured disposition, Date/Time Secured, and Locker Number / Storage Location when applicable
- Narrative Notes

Evidence remains independent of photographs.

Status

In Development

---

# People

Purpose

Maintain a shared repository of every person associated with a case.

Future interviews reference People rather than duplicating information.

Status

In Development

---

# Interviews

Purpose

Document interviews linked to People.

Status

In Development

---

# Surveillance Camera Canvass

Purpose

Document surveillance cameras observed during the investigation.

Record:

- Address
- Camera Present
- Contact Made
- Owner
- Follow-up Required
- Notes

Status

Planned

---

# Area(s) of Origin

Purpose

Document observations supporting origin determination.

This module documents observations only.

It shall not include ignition source evaluation or investigative conclusions.

Features

- General Area of Origin
- Specific Area of Origin
- Narrative
- Fire Spread
- Smoke Spread
- Observation Notes

Optional:

- Add Photo Log

Status

In Development

---

# Potential Ignition Sources

Purpose

Document potential ignition sources identified during the investigation.

This module documents observations only.

It shall not render investigative opinions.

Each ignition source may include:

- Type
- Description
- Location
- Observations
- Condition
- Energized / Operating Status
- Narrative
- Recall Lookup (where applicable)

Status

Planned

---

# Vehicle Fire / Vehicle Object

Purpose

Document vehicles involved in a fire investigation.

Vehicle documentation shall support vehicle fire investigations without automatically treating every vehicle as part of the origin or cause analysis.

Fields

- VIN
- Year
- Make
- Model
- Color
- Plate
- State
- Owner
- Location
- Vehicle Fire
- Vehicle Associated With Area of Origin
- Vehicle Associated With Potential Ignition Source
- Recall Check Required
- Recall Checked
- Recall Check Date/Time
- Recall Source
- Recall Results
- Vehicle Notes

Recall Workflow

Vehicle recall checks shall not automatically run for every vehicle added to a case.

If Incident Type = Vehicle Fire, and the investigator marks the vehicle as:

- Vehicle Associated With Area of Origin, or
- Vehicle Associated With Potential Ignition Source

then the platform shall prompt:

"Run NHTSA recall check for this vehicle?"

If confirmed, the External Intelligence Engine shall:

- Decode VIN
- Query NHTSA recalls
- Save recall check date/time
- Save recall source
- Save possible recall results
- Preserve recall result in the case record

Recall results shall be treated as reference information only.

The platform shall never state or imply that a recall caused or contributed to the fire.

Status

Planned

---

# Appliance / Product Recall Workflow

Purpose

Document appliances or products identified as potential ignition sources and support recall checks where appropriate.

Recall checks shall be initiated only when an appliance or product is documented as a potential ignition source.

Workflow

- Document appliance or product
- Enter manufacturer, model, serial number, and date code where available
- Select whether item is a potential ignition source
- If selected, offer recall check
- Query CPSC or other approved recall source
- Save recall check date/time
- Save recall source
- Save possible recall results
- Preserve recall result in the case record

Recall results shall be treated as reference information only.

The platform shall never state or imply that a recall caused or contributed to the fire.

Status

Planned

---

# Origin & Cause Analysis

Purpose

Document the investigator's professional analysis after documentation has been completed.

Includes:

- Origin Analysis
- Origin Matrix
- Ignition Source Evaluation
- Ignition Source Assessment Matrix
- Ignition Sequence
- Cause Classification
- Origin and Cause Narrative

Status

Planned

---

# Reports

Purpose

Generate reports from structured investigative data.

Reports remain fully editable.

Status

In Development

---

# Future Modules

Examples include:

- Fire Fatality
- Vehicle Fires
- Machinery
- Appliances
- Weather
- Laboratory Tracking
- Timeline
- Case Management
- Search Warrants
- Cellular Analysis

Future modules shall follow the same specification format.

---

This document is intended to evolve continuously as the Fire Investigation Platform expands.