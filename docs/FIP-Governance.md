# Fire Investigation Platform (FIP)

# Governance & Design Specification

**Version:** 2.1 (Living Document)

---

# 1. Purpose

This document establishes the mission, vision, architecture, development principles, design standards, and long-term direction of the Fire Investigation Platform (FIP) ecosystem.

It serves as the governing authority for all future development decisions.

This document is the single source of truth for the project.

Future revisions shall expand this document while preserving its governing principles.

---

# 2. Mission

The mission of the Fire Investigation Platform is to reduce administrative burden while improving investigative quality, documentation, evidence management, report generation, and case organization.

The platform shall assist investigators throughout the investigative process while preserving the investigator's professional judgment.

---

# 3. Vision

Develop a commercial-grade investigative ecosystem composed of specialized applications sharing a common architecture.

The ecosystem shall support the complete investigative lifecycle from initial dispatch through final report and long-term case management.

The platform shall become the primary investigative workspace rather than simply replacing paper forms.

---

# 4. Ecosystem

The Fire Investigation Platform ecosystem consists of independent applications sharing common services.

Current applications include:

* Fire Investigation Platform (FIP)
* Legal Suite
* Cellular Analysis Platform (CAP)

Future applications may be added without altering the underlying architecture.

---

# 5. Core Principles

## Investigator First

The platform shall adapt to the investigator.

Investigators shall never be required to modify accepted investigative workflow because of software limitations.

---

## Scientific Method

The platform shall support accepted investigative methodology.

The platform shall never determine:

* Origin
* Cause
* Responsibility
* Criminal intent
* Legal conclusions

Professional judgment always belongs to the investigator.

---

## Capture Information Once

Information shall be entered once.

The platform shall reuse information wherever practical.

Duplicate data entry shall be minimized throughout the ecosystem.

---

## Mobile First

The primary design target shall be the iPhone.

Desktop interfaces shall support larger workflows while preserving the same user experience.

---

## Modular Architecture

Every major investigative function shall exist as an independent module.

Modules shall communicate through shared services.

Modules shall remain independently maintainable.

---

## Shared Objects

Every real-world object shall exist only once within a case.

Examples include:

* Case
* Person
* Building
* Room
* Vehicle
* Machinery
* Appliance
* Evidence
* Photo
* Interview
* Timeline Event
* Ignition Source
* Attachment

Modules reference shared objects rather than creating duplicate information.

---

## Shared Services

Whenever practical, functionality shall exist as reusable shared services rather than application-specific implementations.

Shared services include:

* Authentication
* Case Engine
* Timeline Engine
* People Engine
* Evidence Engine
* Attachment Engine
* Report Engine
* External Intelligence Engine

---

## No Regression

Once accepted functionality has been implemented, it shall never be removed without explicit approval.

Future releases shall build upon previous releases.

Approved releases become future development baselines.

---

## Stable Development

Development shall proceed through incremental, production-quality releases.

Every release shall increase capability while preserving existing functionality.

---

## Workflow Driven

The software shall follow the investigator's workflow rather than the underlying database structure.

Current workflow:

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
13. Ignition Source Assessment Matrix
14. Reports

---

# 6. Observation Assistant

The Observation Assistant exists to improve documentation quality.

It may:

* Suggest commonly documented observations
* Identify missing documentation
* Recommend accepted investigative practices
* Reduce documentation omissions
* Remind investigators of commonly evaluated evidence

It shall never:

* Determine origin
* Determine cause
* Determine responsibility
* Determine criminal intent
* Replace professional judgment
* Generate unsupported investigative conclusions

Observation prompts are intended to function as dynamic field reminders similar to printed investigative checklists.

---

# 7. Artificial Intelligence

Artificial intelligence exists to assist investigators.

AI may:

* Organize information
* Generate report drafts
* Assist with searching
* Correlate structured information
* Identify missing documentation
* Recommend documentation reminders
* Assist with report editing

AI shall never:

* Determine origin
* Determine cause
* Determine responsibility
* Determine criminal intent
* State conclusions unsupported by investigator-entered observations

AI shall always remain subordinate to investigator judgment.

---

# 8. Timeline Philosophy

The timeline records significant investigative events.

Examples include:

* Dispatch
* Arrival
* Fire department actions
* Witness observations
* Smoke observed
* Evidence collected
* Search warrants served
* Interviews
* Laboratory submissions

The timeline shall not document routine software actions.

Examples include:

* Saving records
* Editing records
* Importing photographs
* Exporting reports

Administrative actions belong in the audit log or case notes.

---

# 9. Reporting Philosophy

Reports shall be generated from structured investigative data whenever practical.

Generated reports shall always remain fully editable.

Reports shall accurately reflect investigator-entered observations.

The platform shall never generate unsupported investigative conclusions.

---

# 10. Evidence Integrity

The platform shall preserve the integrity of investigative observations.

Original observations shall remain attributable to the investigator.

Generated reports shall not modify original investigative documentation.

Chain of custody shall be preserved throughout the investigative process.

---

# 11. External Intelligence

The platform may retrieve trusted external information.

Examples include:

* NHTSA VIN decoding
* Vehicle recalls
* CPSC recalls
* Manufacturer recalls
* Weather history
* Sunrise and sunset
* GIS services
* Utility providers
* Secretary of State records
* Business information
* Future public investigative databases

External information shall be preserved as investigative reference material.

The existence of external information shall never be interpreted by the platform as evidence supporting an investigative conclusion.

---

# 12. User Interface Standards

Interfaces shall be:

* Professional
* Consistent
* Mobile first
* Efficient
* Easy to learn

Large touch targets shall be used throughout.

Images shall only be used when they improve investigative documentation.

Sketches shall be preferred whenever visual documentation communicates information more effectively than text.

Structured diagrams shall preserve standardized layouts whenever practical.

Examples include:

* Electrical panels
* Roof geometry
* Utility layouts
* Window layouts

---

# 13. Platform Architecture

The ecosystem shall consist of independent applications sharing common services.

Shared Engines include:

* Authentication Engine
* Case Engine
* Timeline Engine
* People Engine
* Evidence Engine
* Attachment Engine
* Report Engine
* External Intelligence Engine

Shared Object Repository:

* Cases
* People
* Buildings
* Rooms
* Vehicles
* Evidence
* Photos
* Interviews
* Attachments
* Timeline Events

Backend technologies may include:

* Cloudflare
* GitHub
* Microsoft Lists
* SharePoint
* Power Automate

Implementation technologies may evolve without altering governance principles.

---

# 14. Future Development

Every proposed feature shall first be evaluated to determine whether it belongs as:

* Shared Service
* Shared Object
* Module
* Application-specific feature

Whenever practical, reusable architecture shall be preferred over one-time implementations.

Development decisions shall favor:

* Scalability
* Reusability
* Maintainability
* Long-term commercial viability

---


The long-term objective is to develop a complete investigative ecosystem supporting:

## Fire Investigation

* Field documentation
* Case management
* Evidence management
* Reports
* Timeline

## Legal Suite

* Search warrant builder
# 15. Project Documentation Hierarchy

The Fire Investigation Platform shall be governed by a hierarchy of authoritative project documents.

Each document serves a distinct purpose.

## Governance.md

Defines:

- Mission
- Vision
- Platform philosophy
- Development principles
- Artificial intelligence boundaries
- Long-term direction

Governance.md is the highest authority for project decisions.

## Project Instructions.md

Defines:

- Development standards
- Release philosophy
- User interface standards
- Development workflow
- Coding expectations

Project Instructions.md governs how development is performed.

## Shared Services Architecture.md

Defines:

- Shared services
- Shared objects
- Service boundaries
- Storage architecture
- Platform architecture
- Reusable infrastructure
- Cross-application integration

Shared Services Architecture.md governs how the ecosystem is constructed.

## Module Specifications.md

Defines:

- Module purpose
- Workflows
- Required fields
- Validation rules
- User interface behavior
- Observation Assistant behavior
- Report outputs

Module Specifications.md governs how each functional module operates.

## Precedence

When conflicts arise between documents, precedence shall be:

1. Governance.md
2. Project Instructions.md
3. Shared Services Architecture.md
4. Module Specifications.md

All future development shall remain consistent with this hierarchy.

---

# 16. Long-Term Roadmap

The long-term objective is to develop a complete investigative ecosystem supporting:

## Fire Investigation

* Field documentation
* Case management
* Evidence management
* Reports
* Timeline

## Legal Suite

* Search warrant builder
* Search warrant tracking
* Preservation requests
* Court orders
* Subpoenas
* Provider directory
* Template library

## Cellular Analysis Platform

* Tower dumps
* Area searches
* Call detail records
* RTT analysis
* Timing Advance
* Device movement analysis
* Timeline correlation
* AI-assisted analytical workflows

Each application shall share a common investigative architecture while remaining independently deployable.

---

# 17. Governance

This document governs all future development.

Future revisions shall expand this document while preserving its principles.

Conflicts between future design decisions and this governance shall be resolved in favor of this document unless it is formally amended.

---

# Project Motto

**Capture information once.**

**Use it everywhere.**