---
name: excel-to-html
description: This skill converts Excel (.xlsx) spreadsheet reports/forms into pixel-perfect HTML that faithfully reproduces the original layout, with iterative screenshot comparison until convergence. This skill should be used when users want to convert Excel files into HTML/PDF, recreate Excel report layouts in web format, or generate PDFs from Excel-based forms. Supports dynamic content (variable columns/rows).
context: fork
allowed-tools: Read, Write, Edit, Bash(python *), Bash(pip install *), Bash(playwright install *), Bash(powershell *), Glob, Grep
argument-hint: [excel-file-path]
---

# Excel to Pixel-Perfect HTML Converter

Convert Excel (.xlsx) reports/forms into pixel-perfect HTML with iterative comparison loop.

## When to Use

- User wants to convert an Excel file to HTML/PDF
- User wants to recreate an Excel report layout in web format
- User wants pixel-perfect reproduction of Excel spreadsheet forms
- The content may have variable columns/rows (dynamic content)

## Architecture Overview

The pipeline consists of 4 stages, with an iterative feedback loop between stages 3-4:

```
Excel File (.xlsx)
    │
    ▼
[Stage 1] Extract (excel_analyzer.py)
    │  - openpyxl: cells, styles, merges, images, page setup
    │  - win32com (COM): accurate column widths in points,
    │    row heights, Range dimensions, screenshot aspect ratio
    │
    ▼
analysis.json
    │
    ▼
[Stage 2] Generate HTML (html_generator.py)
    │  - Table-based layout with fixed colgroup widths
    │  - Uniform aspect-preserving scaling to fit printable area
    │  - Accurate image positioning via EMU→points conversion
    │
    ▼
output.html
    │
    ├──► [Stage 3] Compare (compare_screenshots.py)
    │      - Playwright screenshot of HTML
    │      - PIL/numpy pixel comparison with Excel screenshot
    │      - Similarity score + visual diff image
    │      │
    │      ▼
    │    If similarity < threshold → iterate (adjust CSS, fix issues)
    │      │
    │      └──► Back to Stage 2 with fixes
    │
    ▼
[Stage 4] Generate PDF (pdf_generator.py)
    - Playwright PDF with zero margins (margins are in HTML body padding)
```

## Process

### Step 1: Install Dependencies

```bash
pip install openpyxl Pillow numpy playwright pywin32
playwright install chromium
```

### Step 2: Extract Excel Data

Run the bundled analyzer script:

```bash
python "C:\Users\NEC\.claude\skills\excel-to-html\scripts\excel_analyzer.py" "<excel-file-path>" "<output-dir>"
```

This produces `analysis.json` with:
- Cell values (computed, not formulas), formatting, merged ranges
- Column widths in points from COM (not just Excel character units)
- Row heights in points from COM
- Range dimensions (Width/Height) from COM
- Screenshot of rendered Excel for aspect ratio correction
- Embedded images as base64 with EMU position data
- Page setup (paper size, orientation, margins, scale, print area)

### Step 3: Generate HTML

Run the bundled generator:

```bash
python "C:\Users\NEC\.claude\skills\excel-to-html\scripts\html_generator.py" "<analysis.json>" "<output.html>"
```

Or generate manually using analysis.json following the rules below.

### Step 4: Compare & Iterate

Run the bundled comparison script:

```bash
python "C:\Users\NEC\.claude\skills\excel-to-html\scripts\compare_screenshots.py" "<output.html>" "<excel-screenshot.png>" "<diff-output-dir>"
```

This outputs:
- Similarity percentage
- Visual diff image (red = HTML-only pixels, blue = Excel-only pixels)
- Region-by-region breakdown

If similarity is below target (aim for >90%), analyze the diff and fix issues, then re-run.

### Step 5: Generate PDF

```bash
python "C:\Users\NEC\.claude\skills\excel-to-html\scripts\pdf_generator.py" "<output.html>" "<output.pdf>"
```

## Critical Technical Rules

### Unit Systems (MUST get right)

| Unit | Conversion | Notes |
|------|-----------|-------|
| EMU | 914400 EMU = 1 inch = 72 points | Image anchor offsets |
| Points (pt) | 72 pt = 1 inch | COM column widths, row heights |
| Pixels (px) | 96 px = 1 inch | openpyxl image width/height |
| mm | 25.4 mm = 1 inch | Page dimensions, margins |

**CRITICAL BUG to avoid**: openpyxl `img.width`/`img.height` is in pixels (96 DPI), but COM column widths are in points (72 DPI). When calculating image size as percentage of table width, MUST convert pixels to points first:

```python
# WRONG: img.width is pixels, total_width is points
img_width_pct = img.width / total_width * 100  # 33% too large!

# CORRECT: Convert pixels to points first
img_width_pt = img.width * 72 / 96
img_width_pct = img_width_pt / total_width * 100
```

Similarly for EMU offsets — convert to points (not pixels):
```python
# WRONG
col_off_px = emu_value / 914400 * 96

# CORRECT
col_off_pt = emu_value / 914400 * 72
```

### Scaling Strategy

Excel "Fit to 1 page" uses **uniform (aspect-preserving) scaling**:

```python
# Natural dimensions from COM Range.Width/Height (points → mm)
natural_w_mm = range_width_pt / 72 * 25.4
natural_h_mm = range_height_pt / 72 * 25.4

# IMPORTANT: Range.Height from COM doesn't include internal cell rendering padding
# Use screenshot aspect ratio to correct:
if screenshot_aspect:
    natural_h_mm = natural_w_mm / screenshot_aspect  # ~3% taller than COM reports

# Uniform scale to fit printable area
scale_w = printable_w_mm / natural_w_mm
scale_h = printable_h_mm / natural_h_mm
uniform_scale = min(scale_w, scale_h)

# Final dimensions preserve aspect ratio
final_w_mm = natural_w_mm * uniform_scale
final_h_mm = natural_h_mm * uniform_scale
```

### Column Widths

- Use COM `Column.Width` (points) — NOT openpyxl character units
- Express as percentage of total table width for `<col style="width:X%">`
- Use 6 decimal precision: `round(col_pt / total_pt * 100, 6)`
- Percentage-based widths perform better than mm-based for browser rendering

### Row Heights

- Use COM `Row.Height` (points) — more accurate than openpyxl
- Express as mm proportional to final table height:
  ```python
  row_h_mm = row_pt / total_height_pt * final_h_mm
  ```

### Font Scaling

All font sizes must be scaled by the uniform scale factor:
```python
font_size_px = font_size_pt * 96 / 72 * uniform_scale
```

### Border Styles

Map Excel border styles to CSS with point-based widths:
```python
border_mapping = {
    "thin": "0.75pt solid",
    "medium": "1.5pt solid",
    "thick": "2.25pt solid",
    "double": "2.25pt double",
    "hair": "0.5pt dotted",
    "dashed": "0.75pt dashed",
    "dotted": "0.75pt dotted",
}
```

### CSS Baseline (Optimized via Grid Search)

These values were found optimal through systematic comparison:
```css
td {
    padding: 1px 2px;
    vertical-align: middle;
    line-height: 1.1;
    overflow: hidden;
    box-sizing: border-box;
}
```

### Image Positioning

Images use `position: absolute` within a `position: relative` table container:
- **left**: Percentage of table width (cumulative column widths + EMU offset)
- **top**: mm from table top (cumulative row heights + EMU offset)
- **width**: Percentage of table width
- **height**: mm

### HTML Structure

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: {W}mm {H}mm; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      margin: 0;
      padding: {top}mm {right}mm {bottom}mm {left}mm;
      width: {W}mm; height: {H}mm;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .table-container {
      position: relative;
      width: {final_w}mm; height: {final_h}mm;
      overflow: hidden;
    }
    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: {final_w}mm; height: {final_h}mm;
    }
    td {
      overflow: hidden;
      padding: 1px 2px;
      box-sizing: border-box;
      font-family: 'Meiryo', sans-serif;
      font-size: {default_scaled}px;
      vertical-align: middle;
      line-height: 1.1;
    }
  </style>
</head>
<body>
  <div class="table-container">
    <!-- images with position:absolute -->
    <table>
      <colgroup>
        <!-- <col style="width:X.XXXXXX%"> for each column -->
      </colgroup>
      <!-- <tr style="height:Xmm"> for each row -->
      <!--   <td colspan rowspan style="...">value</td> -->
    </table>
  </div>
</body>
</html>
```

### PDF Generation

Playwright PDF with **zero margins** (margins are handled in HTML body padding):
```python
page.pdf(
    path=pdf_path,
    format=paper_format,  # "A3" or "A4"
    landscape=True,
    print_background=True,
    scale=1.0,
    margin={"top": "0mm", "right": "0mm", "bottom": "0mm", "left": "0mm"},
)
```

## Paper Sizes

| Paper | Portrait | Landscape |
|-------|----------|-----------|
| A3 (paper_size=8) | 297mm x 420mm | 420mm x 297mm |
| A4 (paper_size=9) | 210mm x 297mm | 297mm x 210mm |

## Japanese Font Mapping

```python
font_map = {
    "Meiryo": "Meiryo, 'メイリオ'",
    "メイリオ": "Meiryo, 'メイリオ'",
    "ＭＳ ゴシック": "'MS Gothic', 'ＭＳ ゴシック'",
    "ＭＳ Ｐゴシック": "'MS PGothic', 'ＭＳ Ｐゴシック'",
    "游ゴシック": "'Yu Gothic', '游ゴシック'",
}
```

## Iterative Improvement Strategy

When the similarity score is below target:

1. **Check structural issues first**: Missing/extra cells, wrong merge ranges, table overflow
2. **Check sizing**: Column widths, row heights, overall table dimensions
3. **Check positioning**: Image placement, text alignment
4. **Fine-tune CSS**: line-height, padding, vertical-align
5. **Font rendering gap**: GDI (Excel) vs Skia (Chromium) will always have ~3-5% difference in dark pixel count — this is the theoretical limit

## Known Limitations

- Font rendering difference between Excel (GDI) and Chromium (Skia) causes ~3-5% irreducible pixel difference
- Theme colors are approximated (exact theme requires parsing xlsx theme XML)
- Conditional formatting colors may need manual verification
- On non-Windows systems, COM integration is unavailable — fall back to openpyxl-only extraction

## File Argument

The `<arguments>` placeholder receives the Excel file path. If not provided, prompt the user for the file path.
