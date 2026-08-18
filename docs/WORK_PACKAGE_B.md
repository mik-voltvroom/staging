# VVOS Work Package B — Commercial Core

Date started: 2026-08-18

Canonical branch: `rc/consolidation-v1.3.0`

Status: in progress / not deployed / not merged

## Objective

Replace preview-only commercial flows with server-authorized, repository-backed and auditable state while migrating financial truth to integer eurocents.

## Slice B1 — Deals and delivery

Implemented in code:

- strict, unknown-field-rejecting deal-create schema;
- integer-cent inputs and server-calculated `totalCents`;
- atomic Firestore creation of a deal and five default delivery tasks;
- crypto-random deal/task/payment identifiers;
- no predictable production portal token on new deals;
- repository-backed deal list, detail and delivery overview;
- persisted deal and delivery-task status transitions;
- action-level permissions for deal creation, deal status, delivery writes and payment creation;
- server-only Firestore boundaries for deals, delivery tasks, payments, deal documents and finance applications;
- delivery readiness gate for registration, payment and checklist completion;
- local demo reads may still use sample data, but mutations fail closed instead of reporting fake persistence.

## Eurocent transition

New deal, warranty, payment and deal-finance values use `...Cents` integer fields. Existing Firestore documents with `...Eur` fields are normalized to cents when read, without modifying live data. A later controlled migration must backfill verified documents and remove the compatibility reader only after readback and rollback evidence exist.

The wider vehicle, workshop and finance models still contain euro-float fields. They remain explicit follow-up work and must not be described as migrated by this slice.

## Remaining B backlog

- persistent payment provider records with idempotency and verified webhooks;
- persistent documents and finance applications;
- hashed, expiring and revocable portal grants with minimized responses;
- immutable accepted-deal commercial/customer snapshots;
- vehicle reservation/sale transition in the same commercial transaction boundary;
- integer-cent migration for vehicle costs, invoices, ledger, cashflow and workshop parts;
- emulator-backed repository and Firestore Rules tests;
- migration dry-run, readback, rollback and staging acceptance evidence.

## Safety boundary

This work changes repository code and Rules definitions only. It does not deploy Rules, migrate Firestore data, activate providers, modify credentials, merge PR #15 or deploy staging/production.
