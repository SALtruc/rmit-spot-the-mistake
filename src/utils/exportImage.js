// "Save to device" used to be a plain <a download> pointing straight at the corrected doc's
// .webp file, with no way for the user to pick a format. These two helpers rasterize that image
// onto a canvas and hand back a PNG or a single-page PDF, so the caller can offer a real choice.

async function loadImage(src) {
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  await img.decode()
  return img
}

async function toCanvas(src) {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.getContext('2d').drawImage(img, 0, 0)
  return canvas
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob failed'))), type, quality))
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Wraps a JPEG directly in a single-page PDF (DCTDecode needs no re-encoding) without pulling in
// a PDF library for one embedded image. Page size mirrors the image's pixel size 1:1 (72dpi
// assumption) — unconventional as a page size, but the whole document is just the one picture.
function buildSingleImagePdf(jpegBytes, width, height) {
  const encoder = new TextEncoder()
  const chunks = []
  let offset = 0
  const objectOffsets = []

  const push = (part) => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part
    chunks.push(bytes)
    offset += bytes.length
  }
  const startObject = (num) => { objectOffsets[num] = offset }

  push('%PDF-1.4\n')

  startObject(1)
  push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')

  startObject(2)
  push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')

  startObject(3)
  push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`)

  startObject(4)
  push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`)
  push(jpegBytes)
  push('\nendstream\nendobj\n')

  const content = `q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q`
  startObject(5)
  push(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`)

  const xrefOffset = offset
  let xref = 'xref\n0 6\n0000000000 65535 f \n'
  for (let i = 1; i <= 5; i++) xref += `${String(objectOffsets[i]).padStart(10, '0')} 00000 n \n`
  push(xref)
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)

  const total = chunks.reduce((sum, part) => sum + part.length, 0)
  const bytes = new Uint8Array(total)
  let position = 0
  for (const part of chunks) { bytes.set(part, position); position += part.length }
  return bytes
}

export async function downloadAsPng(src, filename) {
  const canvas = await toCanvas(src)
  triggerDownload(await canvasToBlob(canvas, 'image/png'), filename)
}

export async function downloadAsPdf(src, filename) {
  const canvas = await toCanvas(src)
  const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.92)
  const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer())
  const pdfBytes = buildSingleImagePdf(jpegBytes, canvas.width, canvas.height)
  triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), filename)
}
