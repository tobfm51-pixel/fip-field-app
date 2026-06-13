# Fire Investigation Platform (FIP)
# Shared Services Architecture

**Version:** 1.0 (Living Document)

---

# Purpose

This document defines the shared services, shared objects, storage architecture, service boundaries, and ecosystem-level technical design for the Fire Investigation Platform ecosystem.

Governance.md defines why the platform exists.

Project Instructions.md defines how development shall proceed.

Module Specifications.md defines what each module does.

This document defines how shared platform services are structured and reused across applications.

---

# Governing Principle

Shared services shall support the entire investigative ecosystem.

No module shall create isolated functionality when the same function could reasonably serve multiple modules or applications.

Applications shall consume shared services rather than duplicating logic.

---

# Ecosystem Applications

The shared services architecture shall support:

- Fire Investigation Platform (FIP)
- Legal Suite
- Cellular Analysis Platform (CAP)
- Future investigative applications

Each application may function independently while using common services, objects, authentication, storage, and reporting infrastructure.

---

# Core Architecture

Platform:

- Cloudflare Pages
- Progressive Web App
- Mobile-first design
- Desktop secondary
- GitHub source control
- Microsoft Lists / SharePoint backend where appropriate
- Power Automate integration where appropriate
- Pluggable storage provider architecture
- Offline-capable workflows where practical

---

# Shared Services

The following services are approved shared platform services:

1. Authentication Engine
2. Case Engine
3. Dashboard Engine
4. People Engine
5. Timeline Engine
6. Evidence Engine
7. Attachment Engine
8. Storage Provider Interface
9. Report Engine
10. External Intelligence Engine
11. Observation Assistant
12. Audit Log Engine
13. Search Engine
14. Notification Engine
15. Export Engine

---

# Shared Objects

Every real-world object shall exist only once within a case.

Modules shall reference shared objects rather than creating duplicate records.

Shared objects include:

- Case
- Person
- Address
- Building
- Room
- Vehicle
- Machinery
- Appliance
- Evidence
- Photo
- Attachment
- Interview
- Timeline Event
- Ignition Source
- Report
- External Intelligence Result
- Assignment
- Agency
- User

---

# Authentication Engine

## Purpose

Provide secure user authentication and access control across all ecosystem applications.

## Initial Strategy

Authentication may use Cloudflare Access with Microsoft login.

## Requirements

- Support agency users
- Support role-based access control
- Support future multi-tenant use
- Preserve user identity for audit logs
- Preserve user identity for report attribution
- Preserve user identity for evidence and attachment actions

## User Roles

Initial roles may include:

- Administrator
- Investigator
- Supervisor
- Reviewer
- Read Only
- External User

---

# Case Engine

## Purpose

Create and manage case records across the ecosystem.

## Requirements

No module may accept data unless a case is active.

A case becomes active only when the user:

1. Creates a new case, or
2. Searches and opens an existing case

## Core Case Fields

- Case Number
- Incident Type
- Incident Address
- Primary Investigator
- Assisted By
- Case Status
- Created Date/Time
- Created By
- Last Modified Date/Time
- Last Modified By

## Case Status Values

- Draft
- Active
- Pending Review
- Closed
- Reopened
- Archived

---

# Dashboard Engine

## Purpose

Provide the investigator with a case command screen.

## Dashboard Requirements

The dashboard shall display:

- Case Number
- Incident Address
- Incident Type
- Primary Investigator
- Case Status
- Workflow progress
- Required missing items
- Module completion status
- Counts for people, evidence, interviews, photos, attachments, vehicles, and reports
- Timeline preview
- Export Field Notes PDF option

The dashboard shall become the landing page after creating or opening a case.

---

# People Engine

## Purpose

Maintain one shared repository of people associated with a case.

## Person Roles

A person may have one or more roles, including:

- Owner
- Occupant
- Witness
- Victim
- Reporting Party
- 911 Caller
- Firefighter
- Law Enforcement Officer
- Investigator
- Insurance Representative
- Contractor
- Utility Representative
- Other

## Requirements

- A person shall be entered once.
- Interviews shall reference existing people.
- Evidence collection may reference existing people.
- Reports shall pull person information from the People Engine.
- Duplicate person creation shall be minimized.

---

# Timeline Engine

## Purpose

Record significant investigative and fire-related events.

## Timeline Philosophy

The timeline records meaningful investigative events, not routine software actions.

## Timeline Event Fields

- Event Date/Time
- Event Type
- Description
- Source Module
- Auto Created
- Created By
- Created Date/Time
- Editable
- Notes

## Event Types

- Fire Event
- Investigation Event
- Law Enforcement Event
- Evidence Event
- Interview Event
- Report Event
- External Intelligence Event
- Other

## Auto-Populated Events

The platform may automatically create timeline events from structured data, including:

- Incident reported
- Fire department dispatched
- Investigator notified
- Investigator dispatched
- Investigator arrived
- Evidence collected
- Interview conducted
- Search warrant served
- Report generated

## Filtering

The timeline shall support filtered views, including:

- Full Timeline
- Fire Timeline
- Investigation Timeline
- Criminal Investigation Timeline

---

# Evidence Engine

## Purpose

Document physical evidence collected during the investigation.

## Evidence Fields

- Evidence Number
- Description
- Location Collected
- Collected By
- Date/Time Collected
- Date/Time Delivered to LCSO
- LCSO Station
- Property Locker Number or Property Counter
- Narrative Notes

## Requirements

- Evidence shall remain independent of photographs.
- Evidence records may reference attachments in the future.
- Evidence records shall preserve investigator-entered observations.
- The platform shall not infer evidentiary meaning or causation.

---

# Attachment Engine

## Purpose

Manage files associated with cases, modules, and shared objects.

## Design Principle

Attachments shall be implemented as a shared service.

The platform shall not assume a single storage provider.

Attachment metadata shall be stored separately from the physical file.

## Attachment Metadata

Each attachment record shall preserve:

- Attachment ID
- Case Number
- Original File Name
- File Type
- File Size
- Date/Time Added
- Added By
- Linked Module
- Related Object Type
- Related Object ID
- Storage Provider
- Storage Status
- Storage Path or External Reference
- Notes
- Hash Value, future enhancement

## Storage Status Values

- Local Only
- Pending Sync
- Uploaded
- Upload Failed
- External Path Only
- Archived

## Attachment Sources

The user may add attachments from:

- Camera
- Photo Library
- Files App
- Document Scan
- Audio Recording
- Video Recording
- External Import

## Offline Behavior

Attachments may be stored locally when connectivity is unavailable.

Offline attachments shall be marked Pending Sync until uploaded, exported, or otherwise resolved by the investigator.

---

# Storage Provider Interface

## Purpose

Allow different agencies, companies, and users to store files in different systems without changing the core application.

## Supported Storage Modes

Initial and future storage providers may include:

- Agency SharePoint
- OneDrive
- Local Device Pending Sync
- Manual Folder Selection
- Cloudflare R2
- Azure Blob Storage
- Amazon S3
- Other future provider

## Requirements

The application shall interact with storage through a common provider interface.

Modules shall not directly depend on SharePoint, OneDrive, Cloudflare R2, or any specific storage provider.

## Storage Provider Responsibilities

A storage provider shall be responsible for:

- Saving files
- Returning file references
- Reporting upload status
- Supporting retrieval where authorized
- Supporting deletion only where authorized
- Supporting metadata updates where applicable

## Case-Level Storage

Each case may define a default storage provider.

The investigator may be permitted to override the default storage behavior where allowed by configuration.

---

# Report Engine

## Purpose

Generate editable reports from structured investigative data.

## Requirements

- Reports shall be generated from investigator-entered data.
- Reports shall remain fully editable.
- Reports shall not alter original observations.
- Reports shall not generate unsupported conclusions.
- Reports may draw from multiple shared services.
- Report templates shall support future agency customization.

## Report Sources

Reports may use data from:

- Case Engine
- Initial Information
- Building Information
- Utilities
- Safety Assessment
- Exterior Documentation
- Interior Documentation
- Evidence
- People
- Interviews
- Surveillance Camera Canvass
- Area(s) of Origin
- Potential Ignition Sources
- Origin & Cause Analysis
- External Intelligence Engine
- Timeline Engine

---

# External Intelligence Engine

## Purpose

Retrieve and preserve trusted external reference information.

## Approved Integrations

Future integrations may include:

- NHTSA VIN decoding
- NHTSA vehicle recalls
- CPSC recalls
- Manufacturer recalls
- Weather history
- Sunrise and sunset
- GIS services
- Utility provider information
- Secretary of State records
- Business records
- Future public investigative databases

## Requirements

External information shall be preserved as reference material only.

The platform shall never interpret external information as proof of origin, cause, responsibility, criminal intent, or legal conclusion.

## Snapshot Requirement

When external data is retrieved, the platform shall preserve:

- Source
- Query Date/Time
- Query Parameters
- Result Summary
- Raw Result where practical
- Investigator Notes
- Linked Case
- Linked Object

---

# Vehicle Recall Workflow

Vehicle recall checks shall not automatically run for every vehicle.

Each vehicle may include:

- Vehicle Associated With Area of Origin
- Vehicle Associated With Potential Ignition Source

If either is selected, or if the incident type is Vehicle Fire, the platform may prompt:

"Run NHTSA Recall Check?"

If confirmed, the External Intelligence Engine shall:

- Decode VIN
- Query NHTSA recalls
- Save results
- Preserve recall snapshot

Recall results shall be reference material only.

The platform shall never state or imply that a recall caused or contributed to the fire.

---

# Appliance Recall Workflow

Appliance recall checks shall be initiated only when an appliance or product is documented as a potential ignition source.

Workflow:

1. Document appliance or product
2. Mark as potential ignition source
3. Offer recall check
4. Query approved recall source
5. Save recall snapshot
6. Preserve as reference material only

The platform shall never state or imply that a recall caused or contributed to the fire.

---

# Observation Assistant

## Purpose

Improve documentation quality by assisting the investigator.

## Permitted Functions

The Observation Assistant may:

- Suggest commonly documented observations
- Identify missing documentation
- Recommend accepted investigative practices
- Reduce documentation omissions
- Remind investigators of commonly evaluated evidence

## Prohibited Functions

The Observation Assistant shall never:

- Determine origin
- Determine cause
- Determine responsibility
- Determine criminal intent
- Replace professional judgment
- Generate unsupported investigative conclusions

---

# Audit Log Engine

## Purpose

Preserve administrative activity and data integrity.

## Audit Events

Audit logs may record:

- Case created
- Case opened
- Record created
- Record edited
- Record deleted
- Report generated
- Export completed
- Attachment added
- Attachment uploaded
- External intelligence query performed
- User login
- User permission change

## Timeline Separation

Routine software actions belong in the audit log, not the investigative timeline.

---

# Search Engine

## Purpose

Allow users to locate cases, people, evidence, reports, and related records.

## Search Targets

Search may include:

- Case Number
- Address
- Person Name
- Vehicle VIN
- License Plate
- Evidence Number
- Report Text
- Timeline Events
- Interview Records
- Attachment Metadata

---

# Notification Engine

## Purpose

Support reminders and workflow alerts.

## Notification Examples

- Missing required fields
- Pending sync attachments
- Incomplete modules
- Review required
- Report not generated
- External intelligence lookup pending
- Evidence delivery information missing

Notifications shall support workflow efficiency without making investigative decisions.

---

# Export Engine

## Purpose

Allow investigators to export case information into usable formats.

## Export Types

Future export options may include:

- Field Notes PDF
- Full Case PDF
- Report Document
- Evidence Summary
- Timeline Export
- People Summary
- Attachment Index
- External Intelligence Snapshot

Exports shall preserve investigator-entered data and shall not modify original records.

---

# Offline Synchronization

## Purpose

Support field operations where cellular service is unavailable or unreliable.

## Requirements

Where practical, the PWA shall support:

- Local draft data entry
- Local attachment staging
- Pending sync status
- Conflict detection
- Manual sync retry
- Clear visual sync state

## Sync Status Values

- Saved Locally
- Pending Sync
- Syncing
- Synced
- Sync Failed
- Conflict Detected

---

# Data Integrity

All shared services shall preserve:

- Created By
- Created Date/Time
- Last Modified By
- Last Modified Date/Time
- Source Module
- Case Number
- Object ID
- Audit history where practical

Original observations shall remain attributable to the investigator.

Generated outputs shall not overwrite original investigative records.

---

# AI Service Boundary

AI may assist with:

- Organization
- Drafting
- Editing
- Missing documentation reminders
- Data correlation
- Search support
- Report drafting

AI shall never:

- Determine origin
- Determine cause
- Determine responsibility
- Determine criminal intent
- Determine legal conclusions
- State conclusions unsupported by investigator-entered observations

---

# Development Rules

Before building a new feature, determine whether it belongs as:

1. Shared Service
2. Shared Object
3. Module
4. Application-specific feature

Shared services shall be preferred when the function may benefit more than one module or application.

No accepted functionality shall be removed without explicit approval.

---

# Initial Implementation Priority

For Alpha 1.2, shared services priority shall be:

1. Case Engine
2. Dashboard Engine
3. Timeline Engine
4. People Engine
5. External Intelligence Engine for weather snapshot
6. Attachment Engine design only, physical storage deferred

Attachment storage shall not be locked to one provider during Alpha 1.2.

---

# Future Enhancements

Future versions may add:

- Multi-tenant organization management
- Advanced role-based access control
- Digital evidence integrity hashing
- Advanced offline sync
- Storage provider marketplace
- Agency template libraries
- Cross-application case linking
- Advanced search
- API access for external systems
- Supervisor review workflow
- Automated report package generation

---

# Revision History

| Version | Date | Notes |
|---|---|---|
| 1.0 | Draft | Initial shared services architecture document |