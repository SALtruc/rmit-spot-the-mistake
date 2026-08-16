import { readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const publicDir = path.resolve('public')

async function pngFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? pngFiles(target) : target.toLowerCase().endsWith('.png') ? [target] : []
  }))
  return files.flat()
}

const files = await pngFiles(publicDir)

await Promise.all(files.map(async (source) => {
  const destination = source.replace(/\.png$/i, '.webp')
  await sharp(source).webp({ quality: 88, alphaQuality: 95, smartSubsample: true }).toFile(destination)
}))

console.log(`Optimized ${files.length} PNG assets to WebP.`)
