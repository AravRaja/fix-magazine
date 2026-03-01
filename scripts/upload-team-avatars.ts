/**
 * One-off script: upload public/images/team/ avatars to Cloudinary
 * and print the URLs to paste into src/lib/authors.ts
 *
 * Usage:
 *   bun --env-file=.env.local scripts/upload-team-avatars.ts
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.trim()
const API_KEY    = process.env.CLOUDINARY_API_KEY?.trim()
const API_SECRET = process.env.CLOUDINARY_API_SECRET?.trim()

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('Missing Cloudinary env vars')
  process.exit(1)
}

const FOLDER     = 'fix-magazine/team'
const TEAM_DIR   = path.join(process.cwd(), 'public', 'images', 'team')

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png',  gif: 'image/gif', webp: 'image/webp',
}

function sign(params: Record<string, string>): string {
  const str =
    Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&') + API_SECRET
  return crypto.createHash('sha1').update(str).digest('hex')
}

async function upload(filePath: string, publicId: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const params: Record<string, string> = { folder: FOLDER, public_id: publicId, timestamp }
  const signature = sign(params)

  const ext   = path.extname(filePath).slice(1).toLowerCase()
  const mime  = MIME[ext] ?? 'image/jpeg'
  const b64   = fs.readFileSync(filePath).toString('base64')

  const form = new FormData()
  form.append('file', `data:${mime};base64,${b64}`)
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

async function main() {
  const files = fs.readdirSync(TEAM_DIR).filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f))
  const results: Record<string, string> = {}

  for (const file of files) {
    const publicId = path.basename(file, path.extname(file))
    const filePath = path.join(TEAM_DIR, file)
    try {
      const url = await upload(filePath, publicId)
      results[publicId] = url
      console.log(`✓ ${file} → ${url}`)
    } catch (err) {
      console.error(`✗ ${file}: ${err}`)
    }
  }

  console.log('\n--- Paste into src/lib/authors.ts ---')
  console.log('export const AUTHOR_AVATAR: Record<string, string> = {')
  for (const [slug, url] of Object.entries(results)) {
    console.log(`  ${slug}: '${url}',`)
  }
  console.log('}')
}

main().catch(err => { console.error(err); process.exit(1) })
