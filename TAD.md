# TAD — Loveyourhand

Version 1.0

Technical Architecture Document

---

# 1. Overview

Product

Loveyourhand

Purpose

Convert handwriting into:

* Personal Font (.ttf)
* Handwriting Cards (PNG)
* Shareable Content

Architecture Goal

* Mobile-first
* Browser-first
* Fast interaction
* No mandatory account
* Local-first storage
* Scalable Korean font support

---

# 2. High-Level Architecture

Frontend

Next.js App Router

↓

Drawing Engine

↓

Glyph Processing Engine

↓

Font Generation Engine

↓

Card Generation Engine

↓

Export Engine

---

# 3. System Architecture

Client

Next.js

React

TypeScript

TailwindCSS

Framer Motion

Dexie

---

Storage Layer

IndexedDB

LocalStorage

---

Rendering Layer

Canvas

React Konva

---

Font Layer

SVG Paths

↓

Glyph Objects

↓

OpenType

↓

TTF

---

Image Layer

Canvas

HTML Export

PNG

---

# 4. Domain Architecture

Modules

app/

components/

features/

font/

glyph/

canvas/

card/

storage/

utils/

types/

---

Feature Modules

features/

landing/

drawing/

font-generator/

font-preview/

card-generator/

sharing/

---

# 5. Data Model

## UserFont

```ts
interface UserFont {
  id: string;
  name: string;
  createdAt: string;

  language: "en" | "ko" | "mixed";

  glyphs: Glyph[];

  metadata: FontMetadata;
}
```

---

## Glyph

```ts
interface Glyph {
  id: string;

  character: string;

  strokes: Stroke[];

  svgPath?: string;

  normalizedPath?: string;
}
```

---

## Stroke

```ts
interface Stroke {
  points: Point[];

  width: number;
}
```

---

## Point

```ts
interface Point {
  x: number;
  y: number;
}
```

---

# 6. Drawing Engine

Purpose

Collect handwriting.

---

Library

React Konva

Preferred

Alternative

Fabric.js

---

Canvas Requirements

Desktop

500x500

Mobile

350x350

---

Features

Draw

Undo

Redo

Clear

Next Glyph

Previous Glyph

Pressure-ready architecture

Future Apple Pencil support

---

# 7. Stroke Capture Pipeline

User Draws

↓

Stroke Array

↓

Point Collection

↓

Bezier Smoothing

↓

SVG Path

↓

Store

---

Raw Example

```ts
[
 {x:100,y:100},
 {x:102,y:103},
 {x:105,y:108}
]
```

---

Stored As

```ts
M100 100
Q102 103
105 108
```

---

# 8. Stroke Normalization Engine

Critical Module

Raw handwriting cannot become font directly.

---

Pipeline

Raw Path

↓

Remove Noise

↓

Smooth Curves

↓

Scale Normalize

↓

Center Align

↓

Baseline Align

↓

Bounding Box Normalize

↓

Output Path

---

Libraries

paper.js

bezier-js

svg-pathdata

---

Goal

All glyphs share consistent proportions.

---

# 9. English Font Generation

Input

A-Z

a-z

0-9

symbols

---

Process

Glyph

↓

SVG Path

↓

OpenType Glyph

↓

OpenType Font

↓

TTF

---

Library

opentype.js

---

Example

```ts
new opentype.Glyph({
 name: "A",
 unicode: 65,
 path
})
```

---

# 10. Korean Architecture

Important

Do NOT attempt 11,172 glyph generation in MVP.

---

Strategy

Collect Jamo

초성

19

중성

21

종성

27

---

Store Each Jamo Separately

```ts
ㄱ
ㄴ
ㄷ

ㅏ
ㅓ
ㅗ
```

---

Purpose

Render Korean content.

Generate Korean previews.

Create Korean cards.

---

P0

Jamo Rendering

---

P1

Dynamic Korean Composition

---

P2

Complete Hangul OpenType Font

---

# 11. Korean Composition Engine

Future Ready

---

Input

ㄱ

ㅏ

↓

Compose

↓

가

---

Use

Unicode Hangul Algorithm

---

Formula

```txt
SIndex =
((LIndex × 21) + VIndex)
× 28
+ TIndex
```

---

Unicode

0xAC00 + SIndex

---

Purpose

Compose syllables dynamically.

---

# 12. Font Generation Service

Interface

```ts
interface FontGenerator {
 generate(
   glyphs: Glyph[]
 ): Promise<ArrayBuffer>;
}
```

---

Output

TTF

---

Preview

Blob URL

---

Download

font.ttf

---

# 13. Font Preview Engine

Purpose

Instant Preview

---

Flow

Generate TTF

↓

Blob URL

↓

FontFace API

↓

Inject

↓

Preview

---

Example

```ts
const fontFace =
new FontFace(
 "UserFont",
 blob
);
```

---

# 14. Auto Save Architecture

Required

---

Every

5 seconds

---

Store

IndexedDB

---

Backup

LocalStorage

---

Recovery

Open App

↓

Detect Draft

↓

Restore

---

# 15. Card Generation Engine

Purpose

Create shareable content.

---

Input

User Font

Text

Template

Color

---

Output

Rendered Card

---

Supported Templates

P0

Post-it

P1

Notebook

Letter

Polaroid

Journal

---

# 16. Post-it Template

Canvas

1200x1200

---

Layer Structure

Background

↓

Paper

↓

Shadow

↓

Text

↓

Watermark

---

# 17. Watermark System

Always Render

Bottom Right

---

Text

made with loveyourhand

loveyourhand.app

---

Opacity

15%

---

# 18. PNG Export

Library

html-to-image

---

Export

PNG

---

Sizes

1200

2400

---

# 19. Sharing System

P1

---

Generate Share Page

```txt
/u/[id]
```

---

Meta Tags

OpenGraph

Twitter

Kakao

---

# 20. State Management

Preferred

Zustand

---

Stores

FontStore

DrawingStore

CardStore

SettingsStore

---

# 21. Database Strategy

P0

No Server

---

P1

Supabase

---

Tables

users

fonts

cards

shares

---

# 22. API Architecture

Future

---

POST

/api/font

---

POST

/api/card

---

GET

/api/share/:id

---

# 23. Performance Targets

Initial Load

< 2s

---

Canvas FPS

60

---

TTF Generation

< 5s

---

Card Export

< 2s

---

# 24. Accessibility

Keyboard Navigation

Required

---

ARIA Labels

Required

---

Contrast Ratio

WCAG AA

---

# 25. Security

No user handwriting uploaded by default.

Local-first.

---

Export only after user action.

---

No analytics capturing handwriting content.

---

# 26. Deployment

Platform

Vercel

---

CDN

Vercel Edge

---

Storage

Client First

---

Future

Supabase Storage

---

# 27. Engineering Priorities

Priority 1

Drawing Experience

Priority 2

Stroke Normalization

Priority 3

TTF Generation

Priority 4

Card Generator

Priority 5

Sharing

---

# 28. Non-Goals (MVP)

No Authentication

No Team Accounts

No Marketplace

No Public Gallery

No AI Completion

No Commercial Licensing

---

# 29. Future Architecture (P2)

AI Glyph Completion

User draws:

a

e

g

m

↓

Model predicts

remaining glyphs

---

Full Korean Font Generation

11,172 syllables

↓

OpenType GSUB

↓

Production-grade Korean font

---

This architecture must be implemented with clean separation between:

Drawing Layer

Glyph Processing Layer

Font Engine

Card Engine

Storage Layer

Export Layer

to support future AI-assisted font generation.
