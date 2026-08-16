# Template execution contract - Bao cao tuan 12

- Reference: `D:\PROJECT_2026\Social-networking\reports\bao_cao_tuan_11_ui_ai_kiem_thu.docx`
- SHA-256: `0B0157BD2C090436A470D9B24BCF9EF85AB2650C1B19A8CD98A621BB114DE49B`
- Reference render: `D:\PROJECT_2026\Social-networking\reports\.qa_tuan11` (6 pages, inspected)
- Style evidence: `D:\PROJECT_2026\Social-networking\reports\.week12_work\template-style-evidence.json`
- Sections: 1, A4 portrait (8.27 x 11.69 in), margins left 0.98 in, right 0.79 in, top/bottom 1.00 in.

## Page system and recurring treatment

- Cover page followed by a manual page break; report body begins on page 2.
- No recurring header or footer content and no visible page numbers.
- Cover: centered Times New Roman title block; student metadata is left aligned; date is centered near the foot of the page.
- Body: Times New Roman 12 pt, justified, 1.15 line spacing, 5 pt after normal prose.
- Level-1 headings: Times New Roman 14 pt, bold, left aligned, 7 pt before and 5 pt after.
- Level-2 headings: Times New Roman 12 pt, bold, left aligned, 5 pt before and 3 pt after.
- Page geometry, cover metadata, and visual hierarchy are preserve-only except for the week number, report subtitle, date, and body content.

## Slot map

- `word/document.xml`, cover paragraph 2: replace week number 11 with 12.
- `word/document.xml`, cover paragraph 3: replace report subtitle while preserving its centered two-line title treatment.
- `word/document.xml`, cover paragraph 22: replace report date with 10/08/2026.
- Body content after the cover page break: replace with the week-12 report; preserve section properties and page geometry.
- Existing week-11 drawings are body-specific and may be removed because the week-12 report uses prose sections instead of diagrams.

## Content flow

1. Muc tieu cua tuan 12.
2. Ket qua da thuc hien: AI backend, UI, tests, frontend performance.
3. Ket qua kiem thu va danh gia.
4. Kien thuc va kinh nghiem.
5. Kho khan va cach xu ly.
6. Muc do hoan thien.
7. Han che hien tai va huong phat trien.
8. Ket luan.
9. Ke hoach tuan 13.
10. Tu danh gia.

## Fidelity gates

- Reference hash must remain unchanged.
- Final section count and A4 page geometry must match the reference.
- Cover metadata, font family, hierarchy, paragraph rhythm, and page-break behavior must remain recognizably source-derived.
- No clipping, overlap, broken glyphs, unexpected blank pages, or orphaned headings in the final render.
