/**
 * Upload all images from output/images/ to Cloudinary.
 *
 * Usage:
 *   CLOUDINARY_CLOUD_NAME=xxx \
 *   CLOUDINARY_API_KEY=xxx \
 *   CLOUDINARY_API_SECRET=xxx \
 *   bun scripts/upload-to-cloudinary.ts
 *
 * Resume-safe: already-uploaded images are skipped.
 * Saves progress to src/lib/cloudinary-urls.json every 20 uploads.
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME?.trim()
const API_KEY     = process.env.CLOUDINARY_API_KEY?.trim()
const API_SECRET  = process.env.CLOUDINARY_API_SECRET?.trim()

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('Missing env vars. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET')
  process.exit(1)
}

const FOLDER       = 'fix-magazine'
const IMAGES_DIR   = path.join(process.cwd(), 'output', 'images')
const URL_MAP_PATH = path.join(process.cwd(), 'src', 'lib', 'cloudinary-urls.json')

// Load existing map so we can resume interrupted uploads
const urlMap: Record<string, string> = fs.existsSync(URL_MAP_PATH)
  ? JSON.parse(fs.readFileSync(URL_MAP_PATH, 'utf-8'))
  : {}

function sign(params: Record<string, string>): string {
  const str =
    Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&') + API_SECRET
  return crypto.createHash('sha1').update(str).digest('hex')
}

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png',  gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml',
}

async function uploadOne(filePath: string, publicId: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const params: Record<string, string> = { folder: FOLDER, public_id: publicId, timestamp }
  const signature = sign(params)

  // Send as base64 data URI — more reliable than Blob/FormData across runtimes
  const ext  = path.extname(filePath).slice(1).toLowerCase()
  const mime = MIME[ext] ?? 'image/jpeg'
  const b64  = fs.readFileSync(filePath).toString('base64')
  const dataUri = `data:${mime};base64,${b64}`

  const form = new FormData()
  form.append('file', dataUri)
  form.append('folder', FOLDER)
  form.append('public_id', publicId)
  form.append('timestamp', timestamp)
  form.append('api_key', API_KEY!)
  form.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form }
  )

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)

  const data = await res.json() as { secure_url: string }
  return data.secure_url
}

function saveMap() {
  fs.writeFileSync(URL_MAP_PATH, JSON.stringify(urlMap, null, 2))
}

async function main() {
  const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|svg)$/i
  const files = fs.readdirSync(IMAGES_DIR).filter(f => IMAGE_EXTS.test(f))
  const total = files.length

  let uploaded = 0
  let skipped  = 0
  let failed   = 0

  console.log(`Found ${total} images. Uploading to Cloudinary (folder: ${FOLDER})…\n`)

  for (let i = 0; i < files.length; i++) {
    const file      = files[i]
    const localPath = `images/${file}`

    if (urlMap[localPath]) {
      skipped++
      continue
    }

    const filePath = path.join(IMAGES_DIR, file)
    const publicId = path.basename(file, path.extname(file))

    try {
      const url = await uploadOne(filePath, publicId)
      urlMap[localPath] = url
      uploaded++

      if (uploaded % 20 === 0) {
        saveMap()
        const pct = Math.round(((i + 1) / total) * 100)
        console.log(`[${i + 1}/${total}] ${pct}% — uploaded: ${uploaded}, skipped: ${skipped}, failed: ${failed}`)
      }
    } catch (err) {
      failed++
      console.error(`  ✗ ${file}: ${err}`)
    }

    // Small delay — avoids hammering the API
    await new Promise(r => setTimeout(r, 60))
  }

  saveMap()
  console.log(`\n✓ Done! Uploaded: ${uploaded}, Skipped: ${skipped}, Failed: ${failed}`)
  console.log(`URL map saved → ${URL_MAP_PATH}`)
}

main().catch(err => { console.error(err); process.exit(1) })
