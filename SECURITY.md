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
