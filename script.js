const { jsPDF } = window.jspdf;
const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs');
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs';

const fileInput = document.getElementById('fileInput');
const inputType = document.getElementById('inputType');
const outputFormat = document.getElementById('outputFormat');
const iconSize = document.getElementById('iconSize');
const pdfScale = document.getElementById('pdfScale');
const preserveTransparency = document.getElementById('preserveTransparency');
const mergePdfImages = document.getElementById('mergePdfImages');
const downloadAllImages = document.getElementById('downloadAllImages');
const convertBtn = document.getElementById('convertBtn');
const resetBtn = document.getElementById('resetBtn');
const previewBox = document.getElementById('previewBox');
const resultBox = document.getElementById('resultBox');
const statusBadge = document.getElementById('statusBadge');
const progressPanel = document.getElementById('progressPanel');
const progressLabel = document.getElementById('progressLabel');
const progressValue = document.getElementById('progressValue');
const progressTrack = document.getElementById('progressTrack');
const progressFill = document.getElementById('progressFill');
const downloadAllBtn = document.getElementById('downloadAllBtn');

const adStripTop = document.getElementById('adStripTop');
const adStripBottom = document.getElementById('adStripBottom');
const adSidebarInfo = document.getElementById('adSidebarInfo');
const adsAdminDialog = document.getElementById('adsAdminDialog');
const openAdsAdminBtn = document.getElementById('openAdsAdminBtn');
const closeAdsAdminBtn = document.getElementById('closeAdsAdminBtn');
const unlockAdsAdminBtn = document.getElementById('unlockAdsAdminBtn');
const adsAdminPassword = document.getElementById('adsAdminPassword');
const adsAdminEditorWrap = document.getElementById('adsAdminEditorWrap');
const adsConfigEditor = document.getElementById('adsConfigEditor');
const loadAdsConfigBtn = document.getElementById('loadAdsConfigBtn');
const downloadAdsConfigBtn = document.getElementById('downloadAdsConfigBtn');

const DEFAULT_ADS_PASSWORD = 'formatify-admin';
const ADS_CONFIG_PATH = './ads-config.json';
const IMAGE_TYPES = ['png', 'jpg', 'jpeg', 'ico'];
const MAX_RENDER_BYTES = 40 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 12 * 1024 * 1024;

const MATRIX = {
  png: ['png', 'jpg', 'jpeg', 'ico', 'pdf'],
  jpg: ['png', 'jpg', 'jpeg', 'ico', 'pdf'],
  jpeg: ['png', 'jpg', 'jpeg', 'ico', 'pdf'],
  ico: ['png', 'jpg', 'jpeg', 'ico', 'pdf'],
  pdf: ['png', 'jpg', 'jpeg', 'txt'],
  docx: ['pdf', 'txt'],
  xlsx: ['pdf', 'csv', 'txt']
};

let currentAdsConfig = null;
let loadedFile = null;
let loadedType = null;
let loadedFileName = 'file';
let previewState = null;
let activeTaskId = 0;
let resultObjectUrls = [];
let currentResults = [];

fileInput.addEventListener('change', handleFileSelection);
convertBtn.addEventListener('click', handleConvert);
resetBtn.addEventListener('click', resetAll);
pdfScale.addEventListener('change', refreshPdfPreviewIfNeeded);
openAdsAdminBtn?.addEventListener('click', () => adsAdminDialog?.showModal());
closeAdsAdminBtn?.addEventListener('click', () => adsAdminDialog?.close());
unlockAdsAdminBtn?.addEventListener('click', unlockAdsEditor);
loadAdsConfigBtn?.addEventListener('click', loadConfigIntoEditor);
downloadAdsConfigBtn?.addEventListener('click', downloadAdsConfigFile);
downloadAllBtn?.addEventListener('click', handleDownloadAll);

await initAds();
resetAll();

async function handleFileSelection(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const taskId = startTask();
  cleanupPreviewState();

  loadedFile = file;
  loadedFileName = file.name.replace(/\.[^.]+$/, '') || 'file';
  loadedType = detectFileType(file);
  inputType.value = loadedType ? loadedType.toUpperCase() : 'Unsupported';

  if (!loadedType || !MATRIX[loadedType]) {
    syncVisibleControls(null);
    outputFormat.innerHTML = '';
    renderPreviewMessage('Unsupported file type');
    showResultInfo('This file type is not supported.');
    setStatus('This file type is not supported.', true);
    return;
  }

  updateOutputOptions(loadedType);
  syncVisibleControls(loadedType);
  setStatus('Loading preview...');
  showResultInfo(`Selected: ${file.name}`);

  try {
    const state = await buildPreviewState(file, loadedType, taskId);
    if (!isTaskActive(taskId)) return;
    previewState = state;
    renderPreview(previewState);
    setStatus('Ready to convert.');
  } catch (error) {
    if (!isTaskActive(taskId)) return;
    console.error(error);
    cleanupPreviewState();
    renderPreviewMessage('Preview could not be generated');
    showResultInfo(error.message || 'Preview could not be generated.');
    setStatus(`Preview failed: ${error.message}`, true);
  }
}

async function refreshPdfPreviewIfNeeded() {
  if (!loadedFile || loadedType !== 'pdf') return;
  const taskId = startTask();
  cleanupPreviewState();
  setStatus('Refreshing PDF preview...');

  try {
    const state = await buildPreviewState(loadedFile, 'pdf', taskId);
    if (!isTaskActive(taskId)) return;
    previewState = state;
    renderPreview(previewState);
    setStatus('Ready to convert.');
  } catch (error) {
    if (!isTaskActive(taskId)) return;
    console.error(error);
    renderPreviewMessage('Preview could not be generated');
    setStatus(`Preview failed: ${error.message}`, true);
  }
}

async function handleConvert() {
  if (!loadedFile || !loadedType) {
    showResultInfo('Please choose a file first.');
    setStatus('Please choose a file first.', true);
    return;
  }

  const taskId = startTask();
  convertBtn.disabled = true;
  cleanupResultUrls();
  currentResults = [];
  setProgress(2, 100, 'Preparing conversion...');
  showResultInfo('Preparing conversion...');
  setStatus('Converting...');

  try {
    const format = outputFormat.value;
    let results = [];

    if (IMAGE_TYPES.includes(loadedType)) {
      const formats = downloadAllImages.checked ? ['png', 'jpg', 'jpeg', 'ico', 'pdf'] : [format];
      const image = previewState?.image || await fileToImage(loadedFile);
      results = await convertImageInput(image, formats, taskId);
    } else if (loadedType === 'pdf') {
      results = await convertPdfInput(loadedFile, format, taskId);
    } else if (loadedType === 'docx') {
      results = await convertDocxInput(loadedFile, format, taskId);
    } else if (loadedType === 'xlsx') {
      results = await convertXlsxInput(loadedFile, format, taskId);
    } else {
      throw new Error('Unsupported conversion path.');
    }

    if (!isTaskActive(taskId)) return;
    renderResults(results);
    setProgress(100, 100, 'Conversion complete.');
    setStatus('Conversion done.');
  } catch (error) {
    if (!isTaskActive(taskId)) return;
    console.error(error);
    showResultError(`Conversion failed: ${error.message}`);
    setProgress(100, 100, 'Conversion failed.');
    setStatus(`Conversion failed: ${error.message}`, true);
  } finally {
    if (isTaskActive(taskId)) {
      convertBtn.disabled = false;
    }
  }
}

function startTask() {
  activeTaskId += 1;
  return activeTaskId;
}

function isTaskActive(taskId) {
  return taskId === activeTaskId;
}

function detectFileType(file) {
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.png')) return 'png';
  if (name.endsWith('.jpg')) return 'jpg';
  if (name.endsWith('.jpeg')) return 'jpeg';
  if (name.endsWith('.ico')) return 'ico';
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.xlsx')) return 'xlsx';
  return null;
}

function updateOutputOptions(type) {
  const options = MATRIX[type] || [];
  outputFormat.innerHTML = options
    .map((value) => `<option value="${value}">${value.toUpperCase()}</option>`)
    .join('');
}

function syncVisibleControls(type) {
  const isImage = IMAGE_TYPES.includes(type);
  const isPdf = type === 'pdf';
  toggleHidden('imageSizeField', !isImage);
  toggleHidden('transparencyField', !isImage);
  toggleHidden('downloadAllImagesField', !isImage);
  toggleHidden('pdfScaleField', !isPdf);
  toggleHidden('mergePdfImagesField', !isPdf);
}

function toggleHidden(id, hidden) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('is-hidden', hidden);
}

async function buildPreviewState(file, type, taskId) {
  if (IMAGE_TYPES.includes(type)) {
    return { kind: 'image', image: await fileToImage(file) };
  }

  if (type === 'pdf') {
    const pdf = await loadPdf(file);
    if (!isTaskActive(taskId)) {
      await safeDestroyPdf(pdf);
      throw new Error('Preview cancelled.');
    }

    const previewScale = clampPdfScaleForMemory(await getPdfPageDimensions(pdf, 1), Math.min(Number(pdfScale.value || 1), 1.2), MAX_PREVIEW_BYTES);
    const firstPageCanvas = await renderPdfPageToCanvas(pdf, 1, previewScale);
    const pageCount = pdf.numPages;
    await safeDestroyPdf(pdf);

    return {
      kind: 'pdf',
      firstPageCanvas,
      pageCount,
      previewScale,
      note: previewScale < Number(pdfScale.value || 1) ? 'Preview scale was reduced for performance.' : ''
    };
  }

  if (type === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.convertToHtml({ arrayBuffer });
    return { kind: 'docx', html: sanitizeHtml(result.value), messages: result.messages || [] };
  }

  if (type === 'xlsx') {
    const workbook = await readWorkbook(file);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const html = window.XLSX.utils.sheet_to_html(sheet);
    return { kind: 'xlsx', html };
  }

  return null;
}

function renderPreview(state) {
  previewBox.className = 'preview-box';
  previewBox.innerHTML = '';

  if (!state) {
    renderPreviewMessage('No preview available');
    return;
  }

  if (state.kind === 'image') {
    previewBox.appendChild(state.image);
    return;
  }

  if (state.kind === 'pdf') {
    const wrapper = document.createElement('div');
    wrapper.className = 'page-preview-list';

    const card = document.createElement('div');
    card.className = 'page-preview-card';

    const meta = document.createElement('div');
    meta.className = 'preview-meta';
    meta.innerHTML = `<span class="muted">Page 1 of ${state.pageCount}</span>${state.note ? `<span class="muted">${escapeHtml(state.note)}</span>` : ''}`;

    card.appendChild(meta);
    card.appendChild(state.firstPageCanvas);
    wrapper.appendChild(card);
    previewBox.appendChild(wrapper);
    return;
  }

  if (state.kind === 'docx' || state.kind === 'xlsx') {
    const container = document.createElement('div');
    container.className = 'preview-doc';
    container.innerHTML = state.html;
    previewBox.appendChild(container);
  }
}

function renderPreviewMessage(message) {
  previewBox.className = 'preview-box empty';
  previewBox.textContent = message;
}

async function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unsupported or corrupt image file.'));
    };
    img.src = url;
  });
}

async function convertImageInput(image, formats, taskId) {
  const selectedSize = iconSize.value || 'original';
  const files = [];

  for (let index = 0; index < formats.length; index += 1) {
    assertTaskActive(taskId);
    const format = formats[index];
    setProgress(index, formats.length, `Converting ${format.toUpperCase()} (${index + 1}/${formats.length})...`);

    if (format === 'pdf') {
      const pdfBlob = await imageToPdf(image);
      files.push(makeFileResult(`${loadedFileName}.pdf`, 'PDF', pdfBlob));
    } else {
      const blob = await convertImage(image, format, selectedSize, preserveTransparency.checked);
      const filenameSuffix = getImageSizeFilenameSuffix(selectedSize, image);
      files.push(makeFileResult(`${loadedFileName}${filenameSuffix}.${format}`, format.toUpperCase(), blob));
    }

    await yieldToBrowser();
  }

  return files;
}

async function convertPdfInput(file, format, taskId) {
  const pdf = await loadPdf(file);

  try {
    if (format === 'txt') {
      setProgress(10, 100, 'Extracting text from PDF...', true);
      const text = await extractPdfText(pdf, taskId);
      return [makeTextResult(`${loadedFileName}.txt`, text)];
    }

    const pageBlobs = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      assertTaskActive(taskId);
      setProgress(pageNumber - 1, pdf.numPages, `Rendering PDF page ${pageNumber} of ${pdf.numPages}...`);
      const pageInfo = await getPdfPageDimensions(pdf, pageNumber);
      const requestedScale = Number(pdfScale.value || 1);
      const safeScale = clampPdfScaleForMemory(pageInfo, requestedScale, MAX_RENDER_BYTES);
      const canvas = await renderPdfPageToCanvas(pdf, pageNumber, safeScale);
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      const blob = await canvasToBlob(canvas, mime, 0.92);
      releaseCanvas(canvas);

      pageBlobs.push({
        filename: `${loadedFileName}-page-${pageNumber}.${format}`,
        label: `${format.toUpperCase()} page ${pageNumber}`,
        blob,
        note: safeScale < requestedScale ? `Scaled to ${safeScale.toFixed(2)}× to stay memory-safe.` : ''
      });

      await yieldToBrowser();
    }

    if (pageBlobs.length > 1 && mergePdfImages.checked) {
      setProgress(pdf.numPages, pdf.numPages, 'Packaging ZIP file...', true);
      const zipBlob = await filesToZip(pageBlobs);
      return [
        makeFileResult(`${loadedFileName}-${format}-pages.zip`, 'ZIP', zipBlob, `${pageBlobs.length} exported pages`),
        ...pageBlobs.map((item) => makeFileResult(item.filename, item.label, item.blob, item.note))
      ];
    }

    return pageBlobs.map((item) => makeFileResult(item.filename, item.label, item.blob, item.note));
  } finally {
    await safeDestroyPdf(pdf);
  }
}

async function convertDocxInput(file, format) {
  setProgress(20, 100, 'Reading DOCX content...', true);
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  const rawText = (result.value || '').trim();

  if (format === 'txt') {
    return [makeTextResult(`${loadedFileName}.txt`, rawText)];
  }

  setProgress(75, 100, 'Building PDF from DOCX...', true);
  const htmlResult = await window.mammoth.convertToHtml({ arrayBuffer });
  const html = sanitizeHtml(htmlResult.value);
  const pdfBlob = await htmlToPdfBlob(html, `${loadedFileName}.docx`);
  return [makeFileResult(`${loadedFileName}.pdf`, 'PDF', pdfBlob, 'Generated from DOCX content')];
}

async function convertXlsxInput(file, format) {
  setProgress(18, 100, 'Reading workbook...', true);
  const workbook = await readWorkbook(file);
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });

  if (format === 'csv') {
    const csv = window.XLSX.utils.sheet_to_csv(sheet);
    return [makeTextResult(`${loadedFileName}.csv`, csv, 'text/csv')];
  }

  if (format === 'txt') {
    const text = rows.map((row) => row.join('\t')).join('\n');
    return [makeTextResult(`${loadedFileName}.txt`, text)];
  }

  setProgress(76, 100, 'Building PDF from workbook...', true);
  const pdfBlob = await workbookToPdfBlob(workbook);
  return [makeFileResult(`${loadedFileName}.pdf`, 'PDF', pdfBlob, `Sheet: ${firstSheetName}`)];
}

async function convertImage(img, format, requestedSize, keepTransparency) {
  const size = getTargetImageSize(requestedSize, img);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });

  if (format === 'jpg' || format === 'jpeg' || !keepTransparency) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size.width, size.height);
  }

  const ratio = Math.min(size.width / img.width, size.height / img.height);
  const drawWidth = Math.max(1, Math.round(img.width * ratio));
  const drawHeight = Math.max(1, Math.round(img.height * ratio));
  const dx = Math.round((size.width - drawWidth) / 2);
  const dy = Math.round((size.height - drawHeight) / 2);
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

  if (format === 'ico') {
    const pngBlob = await canvasToBlob(canvas, 'image/png');
    releaseCanvas(canvas);
    const icoSize = normalizeIcoSize(requestedSize, size);
    return pngBlobToIco(pngBlob, icoSize);
  }

  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, mime, 0.92);
  releaseCanvas(canvas);
  return blob;
}

function getTargetImageSize(requestedSize, img) {
  if (requestedSize === 'original') {
    return {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height
    };
  }

  const numericSize = Number(requestedSize || 256);
  return { width: numericSize, height: numericSize };
}

function getImageSizeFilenameSuffix(requestedSize, img) {
  if (requestedSize === 'original') {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    return `-original-${width}x${height}`;
  }

  return `-${requestedSize}x${requestedSize}`;
}

function normalizeIcoSize(requestedSize, actualSize) {
  if (requestedSize === 'original') {
    const maxDimension = Math.max(actualSize.width, actualSize.height);
    const icoSizes = [16, 32, 48, 64, 128, 256];
    return icoSizes.find((size) => size >= maxDimension) || 256;
  }

  return Number(requestedSize || 256);
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas export failed.'));
    }, mime, quality);
  });
}

async function pngBlobToIco(pngBlob, size) {
  const pngBuffer = new Uint8Array(await pngBlob.arrayBuffer());
  const headerSize = 6;
  const dirEntrySize = 16;
  const fileOffset = headerSize + dirEntrySize;
  const totalSize = fileOffset + pngBuffer.length;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);
  bytes[6] = size >= 256 ? 0 : size;
  bytes[7] = size >= 256 ? 0 : size;
  bytes[8] = 0;
  bytes[9] = 0;
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, pngBuffer.length, true);
  view.setUint32(18, fileOffset, true);
  bytes.set(pngBuffer, fileOffset);

  return new Blob([buffer], { type: 'image/x-icon' });
}

async function imageToPdf(image) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const orientation = width >= height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height] });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!preserveTransparency.checked) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(image, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/png');
  releaseCanvas(canvas);

  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  return pdf.output('blob');
}

async function loadPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
}

async function getPdfPageDimensions(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const info = { width: viewport.width, height: viewport.height };
  page.cleanup();
  return info;
}

function clampPdfScaleForMemory(pageInfo, requestedScale, maxBytes) {
  const safeRequestedScale = Number.isFinite(requestedScale) && requestedScale > 0 ? requestedScale : 1;
  const baseBytes = pageInfo.width * pageInfo.height * 4;
  if (!baseBytes) return safeRequestedScale;
  const maxScale = Math.sqrt(maxBytes / baseBytes);
  return Math.max(0.5, Math.min(safeRequestedScale, maxScale));
}

async function renderPdfPageToCanvas(pdf, pageNumber, scale) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;
  page.cleanup();
  return canvas;
}

async function extractPdfText(pdf, taskId) {
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    assertTaskActive(taskId);
    setProgress(i - 1, pdf.numPages, `Reading PDF text ${i}/${pdf.numPages}...`);
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const lines = textContent.items.map((item) => item.str).join(' ');
    pages.push(`--- Page ${i} ---\n${lines}`.trim());
    page.cleanup();
    await yieldToBrowser();
  }
  return pages.join('\n\n');
}

async function readWorkbook(file) {
  const arrayBuffer = await file.arrayBuffer();
  return window.XLSX.read(arrayBuffer, { type: 'array' });
}

async function workbookToPdfBlob(workbook) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginX = 36;
  let first = true;

  workbook.SheetNames.forEach((sheetName) => {
    const sheetRows = window.XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, defval: '' });
    if (!first) pdf.addPage('a4', 'landscape');
    first = false;

    pdf.setFontSize(16);
    pdf.text(sheetName, marginX, 28);

    const header = (sheetRows[0] || []).map((cell) => String(cell || ''));
    const body = (sheetRows.slice(1).length ? sheetRows.slice(1) : [[]]).map((row) => row.map((cell) => String(cell ?? '')));

    pdf.autoTable({
      startY: 40,
      head: header.length ? [header] : [['']],
      body,
      margin: { left: marginX, right: marginX },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [24, 35, 63],
        textColor: [237, 242, 255]
      },
      tableWidth: pageWidth - marginX * 2
    });
  });

  return pdf.output('blob');
}

async function htmlToPdfBlob(html, sourceName) {
  const container = document.createElement('div');
  container.innerHTML = html;
  const text = (container.textContent || '').replace(/\s+\n/g, '\n').trim();

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const usableWidth = pageWidth - margin * 2;
  const lineHeight = 15;
  let y = 56;

  pdf.setFontSize(16);
  pdf.text(sourceName, margin, 32);
  pdf.setFontSize(11);

  const blocks = text.split(/\n{2,}/).filter(Boolean);
  for (const block of blocks) {
    const lines = pdf.splitTextToSize(block.trim(), usableWidth);
    for (const line of lines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    }
    y += 8;
  }

  return pdf.output('blob');
}

async function filesToZip(files) {
  const zip = new window.JSZip();
  for (const file of files) {
    zip.file(file.filename, file.blob);
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

function renderResults(files) {
  cleanupResultUrls();
  currentResults = Array.isArray(files) ? [...files] : [];
  toggleDownloadAllButton();

  const wrapper = document.createElement('div');
  wrapper.className = 'result-list';

  for (const file of files) {
    const item = document.createElement('div');
    item.className = 'result-item';

    const url = URL.createObjectURL(file.blob);
    resultObjectUrls.push(url);
    const sizeLabel = formatBytes(file.blob.size);

    item.innerHTML = `
      <h3>${escapeHtml(file.filename)}</h3>
      <div class="muted">${escapeHtml(file.label)} • ${escapeHtml(sizeLabel)}${file.note ? ` • ${escapeHtml(file.note)}` : ''}</div>
      <div class="result-links"></div>
    `;

    const linkWrap = item.querySelector('.result-links');
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = file.filename;
    downloadLink.textContent = 'Download';
    linkWrap.appendChild(downloadLink);

    if (file.textContent) {
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.textContent = 'Copy text';
      copyBtn.addEventListener('click', async () => {
        await navigator.clipboard.writeText(file.textContent);
        copyBtn.textContent = 'Copied';
        setTimeout(() => { copyBtn.textContent = 'Copy text'; }, 1500);
      });
      linkWrap.appendChild(copyBtn);
    }

    wrapper.appendChild(item);
  }

  resultBox.innerHTML = '';
  resultBox.appendChild(wrapper);
}

function makeFileResult(filename, label, blob, note = '') {
  return { filename, label, blob, note };
}

function makeTextResult(filename, text, mime = 'text/plain;charset=utf-8') {
  return {
    filename,
    label: filename.split('.').pop().toUpperCase(),
    blob: new Blob([text], { type: mime }),
    note: `${text.length.toLocaleString()} characters`,
    textContent: text
  };
}

function setStatus(message, isError = false) {
  if (!statusBadge) return;
  statusBadge.textContent = message;
  statusBadge.className = 'status-badge';

  if (isError) {
    statusBadge.classList.add('error');
    return;
  }

  if (/converting|loading|refreshing|reading|packaging/i.test(message)) {
    statusBadge.classList.add('busy');
  } else if (/ready/i.test(message)) {
    statusBadge.classList.add('ready');
  } else if (/complete|done/i.test(message)) {
    statusBadge.classList.add('success');
  } else {
    statusBadge.classList.add('idle');
  }
}

function setProgress(current, total, message, indeterminate = false) {
  const safeTotal = Math.max(1, Number(total) || 1);
  const safeCurrent = Math.max(0, Number(current) || 0);
  const percent = indeterminate ? Math.max(5, Math.min(95, Math.round((safeCurrent / safeTotal) * 100) || 0)) : Math.max(0, Math.min(100, Math.round((safeCurrent / safeTotal) * 100)));

  if (progressLabel) progressLabel.textContent = message;
  if (progressValue) progressValue.textContent = `${percent}%`;
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressTrack) {
    progressTrack.classList.toggle('indeterminate', indeterminate);
    progressTrack.setAttribute('aria-valuenow', String(percent));
  }
}

function showProgress(message) {
  setProgress(0, 100, message, true);
}

function showResultInfo(message) {
  resultBox.innerHTML = `<div class="status">${escapeHtml(message)}</div>`;
}

function showResultError(message) {
  resultBox.innerHTML = `<div class="status error">${escapeHtml(message)}</div>`;
}

function sanitizeHtml(html) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function releaseCanvas(canvas) {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (context) context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 1;
  canvas.height = 1;
}

function cleanupPreviewState() {
  if (previewState?.firstPageCanvas) {
    releaseCanvas(previewState.firstPageCanvas);
  }
  previewState = null;
}

function cleanupResultUrls() {
  resultObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  resultObjectUrls = [];
}

function toggleDownloadAllButton() {
  if (!downloadAllBtn) return;
  downloadAllBtn.disabled = !currentResults.length;
}

async function handleDownloadAll() {
  if (!currentResults.length) return;

  downloadAllBtn.disabled = true;
  const originalText = downloadAllBtn.textContent;
  downloadAllBtn.textContent = 'Preparing ZIP...';

  try {
    const zipBlob = await filesToZip(currentResults);
    const zipName = `${loadedFileName || 'formatify'}-all-results.zip`;
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('All result files downloaded.');
  } catch (error) {
    console.error(error);
    setStatus(`Download All failed: ${error.message}`, true);
  } finally {
    downloadAllBtn.textContent = originalText;
    toggleDownloadAllButton();
  }
}

function assertTaskActive(taskId) {
  if (!isTaskActive(taskId)) {
    throw new Error('Operation cancelled.');
  }
}

async function yieldToBrowser() {
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

async function safeDestroyPdf(pdf) {
  if (!pdf) return;
  try {
    await pdf.destroy();
  } catch (error) {
    console.warn('PDF cleanup warning:', error);
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 100 || index === 0 ? 0 : 1)} ${units[index]}`;
}

async function initAds() {
  try {
    const response = await fetch(`${ADS_CONFIG_PATH}?v=${Date.now()}`);
    if (!response.ok) throw new Error('ads-config.json could not be loaded.');
    currentAdsConfig = await response.json();
  } catch (error) {
    console.error(error);
    currentAdsConfig = getFallbackAdsConfig();
  }

  renderAds(currentAdsConfig);
  loadConfigIntoEditor();
}

function getFallbackAdsConfig() {
  return {
    adminPassword: DEFAULT_ADS_PASSWORD,
    slots: {
      top: [
        {
          enabled: true,
          label: 'Featured',
          title: 'Promote your premium converter offer',
          text: 'Use this space for your own product, service, affiliate, announcement, or sponsor message.',
          buttonText: 'Learn more',
          url: '#'
        },
        {
          enabled: true,
          label: 'Tools',
          title: 'Share another useful tool from your brand',
          text: 'Perfect for cross-promotion, featured updates, partner links, or limited-time offers.',
          buttonText: 'Open',
          url: '#'
        }
      ],
      sidebar: {
        enabled: true,
        label: 'Spotlight',
        title: 'Highlight a trusted recommendation',
        text: 'This smaller card works well for one compact internal ad or announcement.',
        buttonText: 'See details',
        url: '#'
      },
      bottom: [
        {
          enabled: true,
          label: 'New',
          title: 'Announce a new feature or product',
          text: 'Keep your audience aware of launches without touching the main app layout.',
          buttonText: 'Check it out',
          url: '#'
        }
      ]
    }
  };
}

function renderAds(config) {
  renderAdGroup(adStripTop, config?.slots?.top || []);
  renderAdGroup(adStripBottom, config?.slots?.bottom || []);
  renderSingleAd(adSidebarInfo, config?.slots?.sidebar || null, true);
}

function renderAdGroup(container, items) {
  if (!container) return;
  const enabledItems = (items || []).filter((item) => item && item.enabled !== false);
  if (!enabledItems.length) {
    container.innerHTML = '';
    container.classList.add('ad-empty');
    return;
  }

  container.classList.remove('ad-empty');
  container.innerHTML = enabledItems.map((item) => getAdCardMarkup(item)).join('');
}

function renderSingleAd(container, item, compact = false) {
  if (!container) return;
  if (!item || item.enabled === false) {
    container.innerHTML = '';
    container.classList.add('ad-empty');
    return;
  }

  container.classList.remove('ad-empty');
  container.innerHTML = getAdCardMarkup(item, compact);
}

function getAdCardMarkup(item, compact = false) {
  const label = escapeHtml(item.label || 'Featured');
  const title = escapeHtml(item.title || 'Your promotion goes here');
  const text = escapeHtml(item.text || 'Update this area from ads-config.json.');
  const buttonText = escapeHtml(item.buttonText || 'Open');
  const href = escapeHtml(item.url || '#');
  return `
    <article class="ad-slot ${compact ? 'compact-ad' : ''}">
      <div class="ad-slot-inner">
        <div class="ad-copy">
          <span class="ad-label">${label}</span>
          <h3 class="ad-title">${title}</h3>
          <p class="ad-text">${text}</p>
        </div>
        <a class="ad-cta" href="${href}" target="_blank" rel="noopener noreferrer">${buttonText}</a>
      </div>
    </article>
  `;
}

function unlockAdsEditor() {
  const typedPassword = adsAdminPassword?.value || '';
  const expectedPassword = currentAdsConfig?.adminPassword || DEFAULT_ADS_PASSWORD;

  if (typedPassword !== expectedPassword) {
    alert('Wrong admin password.');
    return;
  }

  adsAdminEditorWrap?.classList.remove('is-hidden');
  loadConfigIntoEditor();
}

function loadConfigIntoEditor() {
  if (!adsConfigEditor) return;
  adsConfigEditor.value = JSON.stringify(currentAdsConfig || getFallbackAdsConfig(), null, 2);
}

function downloadAdsConfigFile() {
  if (!adsConfigEditor) return;

  try {
    const parsed = JSON.parse(adsConfigEditor.value);
    currentAdsConfig = parsed;
    renderAds(currentAdsConfig);

    const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ads-config.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Ads config ready. Upload ads-config.json to GitHub to publish it for everyone.');
  } catch (error) {
    alert(`Invalid JSON: ${error.message}`);
  }
}

function resetAll() {
  startTask();
  cleanupPreviewState();
  cleanupResultUrls();
  fileInput.value = '';
  currentResults = [];
  toggleDownloadAllButton();
  loadedFile = null;
  loadedType = null;
  loadedFileName = 'file';
  convertBtn.disabled = false;
  inputType.value = 'No file selected';
  updateOutputOptions('png');
  syncVisibleControls('png');
  renderPreviewMessage('No file loaded');
  resultBox.innerHTML = '<p class="muted">Converted files will appear here.</p>';
  setProgress(0, 100, 'Waiting for conversion...');
  setStatus('Waiting for file');
}
