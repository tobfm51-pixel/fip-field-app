That’s fine. I would only tighten the paths so Codex knows exactly where to look.

Replace it with this:

```markdown
# Legacy Desktop Application

This folder contains the last stable desktop Fire Investigation Platform implementation.

Purpose:

- Preserve accepted functionality.
- Provide a functional reference for modernization.
- Identify existing workflows, field coverage, and data handling.

These files are NOT the authoritative design.

When conflicts exist, the following documents take precedence:

1. `/docs/FIP-Governance.md`
2. `/docs/PROJECT_INSTRUCTIONS.md`
3. `/docs/SHARED_SERVICES_ARCHITECTURE.md`
4. `/docs/Module Specifications.md`

The objective is to modernize the desktop application into a Cloudflare-hosted, mobile-first Progressive Web App while preserving accepted functionality where appropriate.

Do not copy legacy implementation patterns blindly.

Preserve accepted functionality where practical.

Adapt legacy functionality when required by governance, shared services, workflow order, mobile-first design, or long-term commercial architecture.
```
