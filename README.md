# Universal File Converter for GitHub Pages

A browser-based converter you can upload directly to GitHub and publish with GitHub Pages.

## Supported conversions

### Images and icons
- PNG -> JPG / JPEG / ICO / PDF
- JPG -> PNG / JPEG / ICO / PDF
- JPEG -> PNG / JPG / ICO / PDF
- ICO -> PNG / JPG / JPEG / ICO / PDF

### PDF
- PDF -> PNG / JPG / JPEG
- PDF -> TXT
- PNG / JPG / JPEG / ICO -> PDF

### Office files
- DOCX -> PDF
- DOCX -> TXT
- XLSX -> PDF
- XLSX -> CSV
- XLSX -> TXT

## Important note
DOCX to PDF and XLSX to PDF are generated in the browser using JavaScript libraries. That means:
- simple documents and tables work well
- advanced layout, tracked changes, charts, comments, formulas, embedded objects, or exact Microsoft Office rendering may be simplified

## Files
- `index.html`
- `style.css`
- `script.js`

## Libraries used from CDN
- PDF.js
- jsPDF
- JSZip
- Mammoth.js
- SheetJS (XLSX)
- jsPDF AutoTable

## How to publish on GitHub Pages
1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, and `script.js`.
3. Go to repository **Settings** -> **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and `/root`.
6. Save and open the generated GitHub Pages link.

## Recommendation
For best browser compatibility, use a current Chrome, Edge, or Firefox version.
