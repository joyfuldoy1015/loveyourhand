# PRD — Loveyourhand

Version: 1.0

Product Type:
Handwriting-to-Font & Handwriting Content Creation Platform

Website:
loveyourhand.app

---

# 1. Product Vision

Loveyourhand는 사용자의 손글씨를 디지털 폰트와 감성 콘텐츠로 변환하는 웹 서비스이다.

사용자는 자신의 손글씨를 직접 그리거나 업로드하여 개인 폰트를 생성할 수 있으며, 생성된 손글씨로 포스트잇, 메모, 감성 카드 이미지를 제작하고 다운로드 및 공유할 수 있다.

서비스의 핵심 가치는 다음과 같다.

* 손글씨를 디지털 자산으로 변환
* 손글씨를 SNS 콘텐츠로 활용
* 누구나 쉽게 사용 가능
* 회원가입 없이 즉시 사용 가능
* 모바일에서도 자연스러운 경험 제공

---

# 2. Brand Positioning

Service Name:

Loveyourhand

Tagline:

Love your hand.

Alternative Taglines:

Your handwriting deserves a place in the digital world.

Turn your handwriting into something worth keeping.

Handmade in a machine-made world.

---

# 3. Target Users

Primary

* 10대
* 20대
* 30대

Secondary

* 40대
* 다이어리 사용자
* 디지털 플래너 사용자
* 크리에이터
* 학생
* SNS 사용자

---

# 4. Core User Value

Before

종이에만 존재하는 손글씨

After

손글씨 폰트
+
손글씨 이미지
+
SNS 공유 콘텐츠

---

# 5. Product Strategy

Loveyourhand는 두 가지 결과물을 만든다.

A.

Personal Font

(.ttf)

B.

Handwriting Content

(PNG Image)

---

# 6. Feature Roadmap

P0
MVP Launch

P1
Enhanced Handwriting Experience

P2
Advanced Font Platform

---

# 7. P0 Requirements

## 7.1 Landing Page

Reference

handofyou.app

Design Principles

* minimal
* emotional
* clean
* typography-focused
* calm

Hero Copy

LOVE YOUR HAND

Sub Copy

Turn your handwriting into a font and something worth sharing.

CTA

Make Your Font

Secondary CTA

See Examples

---

## 7.2 Font Creation Flow

User Flow

Landing

↓

Start

↓

Choose Language

↓

Draw Letters

↓

Generate Font

↓

Preview

↓

Download

↓

Create Image

↓

Share

---

## 7.3 Language Selection

Options

* English
* Korean
* English + Korean

Default

English + Korean

---

# 8. English Glyph Collection

Required

Uppercase

A-Z

Lowercase

a-z

Numbers

0-9

Symbols

. , ! ? ' " : ; - _ ( ) & @ #

Total

약 80 glyphs

---

# 9. Korean Glyph Collection

IMPORTANT

MVP에서도 한글을 지원한다.

하지만 방식은 단계적으로 구현한다.

---

## P0 Korean Strategy

Collect

초성

19

중성

21

종성

27

Total

67 glyphs

---

User draws

ㄱ

ㄴ

ㄷ

...

ㅏ

ㅑ

...

etc

---

System stores vector data.

---

Generated font preview supports:

* 한글 문장 미리보기
* 포스트잇 이미지 생성

---

TTF Export

Experimental

MVP에서는 완벽한 완성형 한글 폰트 생성보다

한글 렌더링과 이미지 생성에 집중한다.

---

# 10. Drawing Experience

Canvas

500x500 desktop

350x350 mobile

---

Features

Draw

Undo

Redo

Clear

Next

Previous

Finish

---

Pen Size

1~10

---

Guide

Baseline

X-height

Ascender

Descender

---

Ghost Character

현재 입력해야 하는 글자 표시

예

a

ㄱ

ㅏ

---

# 11. Auto Save

Required

Every 5 seconds

Storage

IndexedDB

LocalStorage

---

Recovery

User revisits page

↓

Restore Session

---

# 12. Stroke Processing

Very Important

Raw drawing should not directly become font.

Need normalization.

---

Normalize

Center Alignment

Baseline Alignment

Scale Matching

Stroke Smoothing

Path Simplification

Bounding Box Correction

---

Goal

Result should look clean even with messy input.

---

# 13. Font Generation Engine

Frontend First

Client-side generation

---

Tech

opentype.js

SVG Path Conversion

Bezier Path Processing

---

Output

TTF

---

Generated Font

Preview immediately

Without reload

---

# 14. Font Preview Screen

Title

Your font is ready

---

Preview Text

English

The quick brown fox jumps over the lazy dog.

Korean

안녕하세요.
이것은 나의 손글씨입니다.

---

Actions

Download TTF

Edit Letters

Create Card

Start Over

---

# 15. Handwriting Card Generator

This is a core feature.

Not secondary.

---

Purpose

Create shareable content.

---

Card Types

Post-it

Notebook

Letter

Polaroid

Simple Card

---

P0

Post-it only

---

# 16. Post-it Generator

Square Format

1200x1200

---

Colors

Yellow

Pink

Blue

White

Cream

---

Controls

Font Size

Line Height

Padding

Card Color

---

# 17. Content Modes

Mode A

Preset Quotes

Examples

Handmade in a machine-made world.

Love your hand.

Some things are better imperfect.

---

Mode B

Memory Note

User writes text

Maximum

120 characters

---

Mode C

Today's Thought

Single sentence

---

# 18. Image Export

PNG

Required

---

Resolution

1200x1200

2400x2400 Retina

---

Download

One Click

---

# 19. Viral Loop

Required

All exported images include

Footer

Made with Loveyourhand

loveyourhand.app

---

Subtle watermark

Bottom right

---

# 20. Mobile Experience

Priority

Mobile First

---

Target

iPhone Safari

Chrome Android

---

Touch Drawing

Required

---

# 21. Analytics

Track

Landing Visit

Start Creation

Completed Glyph

Generate Font

Download Font

Generate Card

Download Image

Share

---

# 22. P1 Features

## Smart Glyph Mode

User does not need to draw all letters.

System asks

20~30 representative glyphs

Generate remaining shapes.

---

## Multiple Templates

Post-it

Letter

Journal

Quote Card

Polaroid

---

## Share Page

Unique URL

loveyourhand.app/u/xxxxx

---

## Font Library

Save multiple fonts

---

# 23. P2 Features

## Full Korean Font Engine

Generate

완성형 한글

11,172 syllables

---

## AI Glyph Completion

Predict missing glyphs.

---

## Public Gallery

Community Feed

---

## Premium Features

Unlimited Fonts

Custom Templates

Commercial License

---

# 24. Design System

Style

Minimal

Soft

Editorial

Japanese-inspired

Apple-like

Calm

---

Background

#FAFAF8

Text

#1A1A1A

Border

#EAEAEA

---

Radius

24px

---

Buttons

Pill Shape

---

Typography

Geist Mono

IBM Plex Mono

Space Mono

---

Animation

Subtle

Fade

Scale

200ms

---

No flashy effects.

---

# 25. Technical Stack

Frontend

Next.js 15

React

TypeScript

TailwindCSS

Framer Motion

---

Canvas

react-konva

or Fabric.js

---

Font

opentype.js

fontkit

---

Image Export

html-to-image

---

Storage

IndexedDB

Dexie

---

Deployment

Vercel

---

# 26. Success Metrics

Font Completion Rate

> 60%

Font Download Rate

> 40%

Card Generation Rate

> 50%

Image Download Rate

> 30%

Mobile Completion Rate

> 70%

---

# 27. Codex Build Instructions

Build a production-ready MVP.

Requirements:

* Next.js 15 App Router
* TypeScript
* TailwindCSS
* Mobile-first design
* Handwriting canvas
* English + Korean glyph collection
* Auto-save
* Stroke normalization
* TTF generation
* Font preview
* Post-it image generator
* PNG export
* Responsive UI
* Minimal aesthetic inspired by handofyou.app
* Loveyourhand branding
* Clean architecture
* Reusable components
* Accessibility support
* Optimized performance

Prioritize user delight and emotional design over feature density.
