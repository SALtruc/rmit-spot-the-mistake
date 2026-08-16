import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const sourceDir = path.resolve('Des Ref')
const outputDir = path.resolve('tmp', 'ref-sheets')
const columns = 4
const rows = 6
const cellWidth = 220
const imageHeight = 478
const labelHeight = 34
const gap = 10
const pageSize = columns * rows

const numericId = (name) => Number(name.match(/(\d+)(?=\.[^.]+$)/)?.[1] ?? 0)
const files = (await readdir(sourceDir))
  .filter((name) => /\.(png|jpe?g)$/i.test(name))
  .sort((a, b) => numericId(a) - numericId(b))

await mkdir(outputDir, { recursive: true })

for (let offset = 0; offset < files.length; offset += pageSize) {
  const page = files.slice(offset, offset + pageSize)
  const width = columns * cellWidth + (columns - 1) * gap
  const height = rows * (imageHeight + labelHeight) + (rows - 1) * gap
  const composites = []

  for (const [index, name] of page.entries()) {
    const column = index % columns
    const row = Math.floor(index / columns)
    const left = column * (cellWidth + gap)
    const top = row * (imageHeight + labelHeight + gap)
    const image = await sharp(path.join(sourceDir, name))
      .resize(cellWidth, imageHeight, { fit: 'contain', background: '#3e313b' })
      .png()
      .toBuffer()
    const label = Buffer.from(`<svg width="${cellWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#161116"/><text x="10" y="23" fill="#fff" font-family="Arial" font-size="17" font-weight="700">${numericId(name)}</text></svg>`)
    composites.push({ input: image, left, top }, { input: label, left, top: top + imageHeight })
  }

  const pageNumber = String(Math.floor(offset / pageSize) + 1).padStart(2, '0')
  await sharp({ create: { width, height, channels: 3, background: '#3e313b' } })
    .composite(composites)
    .png()
    .toFile(path.join(outputDir, `refs-${pageNumber}.png`))
}

console.log(`Created ${Math.ceil(files.length / pageSize)} reference sheets from ${files.length} images.`)
