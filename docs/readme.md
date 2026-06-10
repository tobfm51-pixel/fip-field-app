# Fire Investigation Platform (FIP)

## Overview

The Fire Investigation Platform (FIP) is a commercial-grade investigative ecosystem designed specifically for fire investigators.

The platform is intended to reduce administrative burden while improving investigative documentation, organization, report generation, evidence management, and long-term case management.

The ecosystem currently consists of:

* Fire Investigation Platform (FIP)
* Legal Suite
* Cellular Analysis Platform (CAP)

---

# Before Making Any Changes

Read these documents **in the following order**:

1. `/docs/FIP-Governance.md`
2. `/docs/PROJECT_INSTRUCTIONS.md`
3. `/docs/SHARED_SERVICES_ARCHITECTURE.md`
4. `/docs/Module Specifications.md`

These documents are the authoritative design specifications for the project.

---

# Development Priorities

* Never regress accepted functionality.
* Build production-ready software.
* Complete modules in workflow order.
* Design mobile-first (iPhone).
* Preserve investigator workflow.
* Capture information once and reuse it everywhere.
* Prefer shared services over application-specific implementations.

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

# AI Philosophy

AI assists investigators.

Investigators make all investigative decisions.

The platform shall never determine or imply:

* Origin
* Cause
* Responsibility
* Criminal intent
* Legal conclusions

---

# Repository Structure

* `/docs` — Project governance, architecture, and specifications
* `/reference` — Investigative reference material
* `/src` — Application source code
* `/public` — Static assets and PWA resources
* `/assets` — Images, icons, and other project assets

---

# License

Private repository. All rights reserved.
