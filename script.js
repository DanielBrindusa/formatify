const fileInput = document.getElementById('fileInput');
const outputFormat = document.getElementById('outputFormat');
const iconSize = document.getElementById('iconSize');
const preserveTransparency = document.getElementById('preserveTransparency');
const downloadAll = document.getElementById('downloadAll');
const convertBtn = document.getElementById('convertBtn');
const resetBtn = document.getElementById('resetBtn');
const previewBox = document.getElementById('previewBox');
const resultBox = document.getElementById('resultBox');

let loadedImage = null;
let loadedFileName = 'image';

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  loadedFileName = file.name.replace(/\.[^.]+$/, '') || 'image';

  try {
    loadedImage = await fileToImage(file);
    showPreview(loadedImage.src);
    resultBox.innerHTML = '<p class="muted">Ready to convert.</p>';
  } catch (error) {
    loadedImage = null;
    previewBox.className = 'preview-box empty';
    previewBox.textContent = 'Could not load this image.';
    resultBox.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
});

convertBtn.addEventListener('click', async () => {
  if (!loadedImage) {
    resultBox.innerHTML = '<p class="muted">Please choose an image first.</p>';
    return;
  }

  const size = Number(iconSize.value || 32);
  const formats = downloadAll.checked ? ['png', 'jpg', 'jpeg', 'ico'] : [outputFormat.value];

  try {
    const files = [];
    for (const format of formats) {
      const blob = await convertImage(loadedImage, format, size, preserveTransparency.checked);
      files.push({
        format,
        blob,
        filename: `${loadedFileName}-${size}x${size}.${format}`
      });
    }
    renderResults(files);
  } catch (error) {
    resultBox.innerHTML = `<p class="muted">Conversion failed: ${escapeHtml(error.message)}</p>`;
  }
});

resetBtn.addEventListener('click', () => {
  fileInput.value = '';
  loadedImage = null;
  loadedFileName = 'image';
  previewBox.className = 'preview-box empty';
  previewBox.textContent = 'No image loaded';
  resultBox.innerHTML = '<p class="muted">Converted files will appear here.</p>';
});

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unsupported or corrupt image file.'));
    img.src = url;
  });
}

function showPreview(src) {
  previewBox.className = 'preview-box';
  previewBox.innerHTML = '';
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Preview';
  previewBox.appendChild(img);
}

async function convertImage(img, format, size, keepTransparency) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if ((format === 'jpg' || format === 'jpeg') || !keepTransparency) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
  }

  const ratio = Math.min(size / img.width, size / img.height);
  const drawWidth = Math.round(img.width * ratio);
  const drawHeight = Math.round(img.height * ratio);
  const dx = Math.round((size - drawWidth) / 2);
  const dy = Math.round((size - drawHeight) / 2);
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

  if (format === 'ico') {
    const pngBlob = await canvasToBlob(canvas, 'image/png');
    return pngBlobToIco(pngBlob, size);
  }

  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  return canvasToBlob(canvas, mime, 0.92);
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

  bytes[6] = size === 256 ? 0 : size;
  bytes[7] = size === 256 ? 0 : size;
  bytes[8] = 0;
  bytes[9] = 0;
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, pngBuffer.length, true);
  view.setUint32(18, fileOffset, true);

  bytes.set(pngBuffer, fileOffset);

  return new Blob([buffer], { type: 'image/x-icon' });
}

function renderResults(files) {
  const wrapper = document.createElement('div');
  wrapper.className = 'result-list';

  for (const file of files) {
    const item = document.createElement('div');
    item.className = 'result-item';

    const url = URL.createObjectURL(file.blob);
    const sizeKb = (file.blob.size / 1024).toFixed(1);

    item.innerHTML = `
      <div><strong>${file.filename}</strong></div>
      <div class="muted">Format: ${file.format.toUpperCase()} • Size: ${sizeKb} KB</div>
      <div style="margin-top:8px;"><a href="${url}" download="${file.filename}">Download</a></div>
    `;
    wrapper.appendChild(item);
  }

  resultBox.innerHTML = '';
  resultBox.appendChild(wrapper);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}
