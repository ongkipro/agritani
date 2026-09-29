# Product

<!-- impeccable:product-schema 1 -->

Durable product truth for design work. Requirements live in `PRD.md`, visual
system in `DESIGN.md`, decisions in `DECISIONS.md`; this file does not replace them.

## Platform

web

## Users

- **Primary: Indonesian farmers** (smallholder horticulture, rice, palm-oil
  plasma) reading on low-end Android phones in the field, often on 3G/4G. Job:
  recognise a crop problem from its symptoms, learn what to do first, and plan
  planting and spraying. (Owner decision 2026-09-29: "Petani dulu, B2B kedua".)
- **Secondary: B2B partners** (kios saprotan, district distributors, estates)
  who need a clear partnership path. Available and findable, never dominant.
- Personas in `PRD.md` §4 are proto-personas (Assumption), not research.

## Product Purpose

agritani.com is four things in one site (PRD §1.5): **Jurnal Tani** (agronomy
articles by Prof. Arif Prabowo), **Alat Tani** (symptom diagnosis, planting
calendar, BMKG weather, dose calculator), **Konsultasi** (structured WhatsApp
questions to the agronomy team), and the **company profile**. Success means
farmers find credible, traceable answers and reuse the tools; partners can
apply without friction.

## Positioning

PT Agritani Internasional is an **official distributor** (owner decision
2026-09-29) of four products: Aussie, BENSU, Kojien, Saratoga. The difference
from category sites is a professor-moderated, reference-backed journal plus
free field tools, with products shown as relevant references, not a storefront.

## Constraints

- Indonesian UI copy; technical artifacts in English.
- No invented facts: bios, registration numbers, dosages, addresses, and
  reviews only from owner-supplied or sourced data (open items: PRD OQ-1…OQ-12).
- At most one WhatsApp CTA per page (DESIGN §2.8); no contact-CTA spam.
- No third-party brand names in product surfaces (PRD NG-3).
- No accounts, cart, or payment (PRD NG-1, NG-5). No personal data from the
  agrimarket source repository.
- Static site on Cloudflare; strict CSP with zero inline scripts or styles.
- Accessibility: text contrast ≥ 7:1 target, touch targets ≥ 44px, works
  without hover (DESIGN §6).

## Assets

- Logo "Tunas A" (`docs/brand/logo/`, DEC-013).
- Photography is dummy (Pixabay/Pexels, `src/assets/images/dummy/CREDITS.md`)
  until the owner supplies real photos (OQ-5).
- Prof. Arif Prabowo photo pending from the owner.
