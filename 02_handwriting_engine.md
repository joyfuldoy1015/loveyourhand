Implement the Handwriting Engine.

Read:
- PRD
- TAD

Priority:

1. Drawing Engine
2. Stroke Normalization Engine
3. Handwriting Preview Engine
4. Post-it Card Engine
5. PNG Export

Do NOT implement TTF generation yet.

Requirements:

Drawing Engine

- React Konva
- Touch support
- Mouse support
- Undo
- Redo
- Clear
- Auto Save

Stroke Normalization

Must include:

- path smoothing
- point reduction
- baseline alignment
- scale normalization
- center alignment
- bounding box correction

Handwriting Quality Goals

Generated handwriting should feel:

- natural
- human
- slightly imperfect
- emotionally warm

Avoid:

- robotic output
- shaky output
- inconsistent size

Card Engine

Create:

1. Post-it
2. Note
3. Polaroid

Export:

PNG

Responsive:

Mobile first

Success Criteria:

A user should be able to:

draw handwriting
→ see normalized handwriting
→ generate beautiful card
→ export PNG

before any font generation exists.