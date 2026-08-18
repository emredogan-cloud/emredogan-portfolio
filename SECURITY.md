# Security policy

## Reporting

Email **emre30283@gmail.com** with the details and a way to reproduce.
Please do not open a public issue for an unpatched vulnerability.

Expect an acknowledgement within 72 hours.

## Scope

This repository is a static personal website. The only server-side surface is
the contact form endpoint, which validates input server-side, rate-limits by
IP, and carries a honeypot field.

## Secrets

No credentials are stored in this repository. `.env.example` documents the
shape of the configuration; real values live only in GitHub Secrets and Vercel
environment variables. Every push is scanned by gitleaks and CodeQL in CI.

## Dependency advisories

`pnpm audit --audit-level=high` runs on every push and pull request and fails
the build. Where an advisory has no upstream fix, it is suppressed explicitly
and documented — with severity, reachability and an exit condition — in
[`docs/SECURITY_EXCEPTIONS.md`](./docs/SECURITY_EXCEPTIONS.md). A suppression
without an entry there is treated as a defect.
