# Fire Investigation Platform Project Instructions

These instructions govern future development of the Fire Investigation Platform (FIP) ecosystem.

The accompanying **Governance.md** document is the authoritative design specification. These instructions define how development should proceed.

---

# Development Philosophy

Treat this project as commercial-grade software.

Build production-ready functionality rather than demonstrations.

Never create mockups in place of working functionality unless specifically requested.

Every release shall be stable and represent a usable product.

---

# Release Philosophy

Build by module.

Complete one module before expanding to the next.

Do not redesign completed modules unless specifically approved.

Improve existing functionality rather than replacing it.

Never regress accepted functionality.

Preserve backwards compatibility whenever practical.

---

# User Interface

Design for iPhone first.

Desktop layouts are secondary.

Interfaces shall be:

* Professional
* Clean
* Consistent
* Fast
* Easy to learn

Avoid:

* Hidden functionality
* Excessive scrolling
* Unnecessary clicks
* Decorative graphics that do not improve documentation

Large touch targets shall be used throughout the application.

---

# Workflow

Always preserve the investigator's workflow.

Do not reorganize modules unless specifically requested.

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

# Data Philosophy

Every real-world object exists only once.

Everything else references that object.

Examples include:

* Case
* Person
* Building
* Room
* Vehicle
* Machinery
* Evidence
* Photo
* Interview
* Timeline Event
* Attachment
* Ignition Source
* Appliance

Avoid duplicate data whenever possible.

Capture information once.

Reuse it everywhere.

---

# Shared Services

Before implementing new functionality, determine whether it belongs as a reusable shared service rather than an application-specific feature.

Examples include:

* Authentication Engine
* Case Engine
* Timeline Engine
* People Engine
* Evidence Engine
* Attachment Engine
* Report Engine
* External Intelligence Engine

Applications should consume shared services rather than duplicate functionality.

---

# Report Generation

Reports shall be generated from structured investigative data whenever practical.

Generated reports shall always remain fully editable.

The platform shall capture information once and reuse it throughout all applicable reports.

Reports shall accurately reflect investigator-entered observations without generating unsupported conclusions.

---

# Observation Assistant

Observation prompts may:

* Identify missing documentation
* Suggest commonly documented observations
* Recommend investigative steps
* Remind investigators of accepted investigative practices
* Reduce documentation omissions

Observation prompts shall never:

* Determine origin
* Determine cause
* Determine responsibility
* Determine criminal intent
* Replace professional judgment

---

# Artificial Intelligence

AI assists.

Investigators decide.

AI may:

* Identify missing documentation
* Generate report drafts
* Organize investigative information
* Correlate evidence
* Assist with searching
* Assist with report writing
* Suggest documentation reminders

AI shall never:

* Determine origin
* Determine cause
* Determine responsibility
* Determine criminal intent
* State investigative conclusions unsupported by documented evidence

---

# External Intelligence

The platform may integrate with trusted external information sources.

Examples include:

* NHTSA VIN decoding
* NHTSA recall searches
* CPSC recall searches
* Manufacturer recalls
* Weather history
* Sunrise and sunset
* Secretary of State records
* Business information
* GIS services
* Utility provider information
* Future public investigative databases

External information shall be preserved as investigative reference material.

The existence of external information shall never be interpreted by the platform as evidence supporting an investigative conclusion.

---

# Design Rules

Whenever an existing workflow is superior to a proposed redesign, preserve the existing workflow.

When discussing a proposed feature, first determine whether it belongs as:

* Shared Service
* Shared Object
* Module
* Application-specific feature

Favor reusable architecture over one-time implementations.

Always consider how a proposed feature could benefit the entire ecosystem.

---

# Version Control

Every release shall:

* Increase capability
* Preserve existing functionality
* Be tested before deployment
* Build upon previous releases
* Never remove approved functionality without explicit approval

Approved releases become future development baselines.

---

# Future Development

Whenever practical, new functionality shall enhance the existing platform rather than introducing parallel workflows.

Design decisions should favor:

* Scalability
* Reusability
* Maintainability
* Performance
* Long-term commercial viability

Always think several releases ahead before implementing architecture changes.

---

# Long-Term Goal

Create a complete investigative ecosystem consisting of:

* Fire Investigation Platform (FIP)
* Legal Suite
* Cellular Analysis Platform (CAP)

Sharing:

* Authentication Engine
* Case Engine
* Timeline Engine
* People Engine
* Evidence Engine
* Attachment Engine
* Report Engine
* External Intelligence Engine
* Shared Object Repository

Each application shall function independently while sharing a common investigative ecosystem.

---

# Project Motto

Capture information once.

Use it everywhere.
