# Reservoir Pet Care

A small, honest marketing site for a **solo** pet carer based in **Reservoir**, serving
**Reservoir & Preston, Melbourne**. Static HTML/CSS/JS — no build step, no backend.

## Services & pricing

| Service          | Price            |
|------------------|------------------|
| Single walk      | $30              |
| Regular walks    | $25 each (2+/week) |
| Mobile grooming  | from $60         |
| Overnight care   | $80 / night      |

## Design

Dark, editorial look: Anton for headlines, Marcellus for the wordmark, Inter for body text,
and a single orange accent (`#E85E24`). Photos live in `images/` and are resized and
compressed JPEGs (~290 KB total). Sections fade in as you scroll; this is switched off for
visitors who have "reduce motion" enabled.

## What's on the page

- **Booking flow** — a four-step request form (service → date/time → your details →
  confirm). It does **not** take payment. The final step opens a pre-filled email to
  `Leightoncunn@pm.me`.
- **Pricing cards** — the four services laid out as cards.
- **FAQ accordion** — expandable questions and answers.
- **Walk reports** — an example report card (route summary, photos, notes) plus a
  working builder that previews a card in your browser. Photos are previewed locally
  only; nothing is uploaded.

## Deliberately not included

Per the brief, these are **not** implemented because they aren't real features yet:

- No live GPS tracking (walk reports are written summaries).
- No AI chatbot.
- No payment processing.

## Honest-credentialing

The site is intentionally upfront:

- Solo operator — no team, no subcontractors.
- Currently **studying** toward Certificate III & IV in Animal Companionship (in progress).
- ABN **not yet registered**.
- No insurance or background-check claims are made.

## Running locally

It's a static site — open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html      # all page sections
css/styles.css  # styles
js/main.js      # nav, scroll reveal, accordion, booking flow, walk-report builder
images/         # hero, services and philosophy photos
```
