import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://eptmbcnllwnasdlqwdca.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdG1iY25sbHduYXNkbHF3ZGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjQ2MDUsImV4cCI6MjA5NTA0MDYwNX0.6570q3wW6edKqq3tAnmtEBeCvhjHD4kspDEFAXDfXDg'
)

// Upload file to Supabase Storage
export async function uploadFile(file, bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}

// Upload multiple photos for an inspection item
export async function uploadPhotos(inspectionId, sectionId, files) {
  const urls = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file || !file.file) continue
    try {
      const ext = file.file.type.includes('png') ? 'png' : 'jpg'
      const path = `${inspectionId}/${sectionId}_${i}_${Date.now()}.${ext}`
      const url = await uploadFile(file.file, 'inspection-media', path)
      urls.push(url)
    } catch (e) { console.warn('Photo upload failed:', e.message) }
  }
  return urls
}

// Upload video
export async function uploadVideo(inspectionId, sectionId, file) {
  if (!file) return null
  try {
    const ext = file.name?.split('.').pop() || 'mp4'
    const path = `${inspectionId}/video_${sectionId}_${Date.now()}.${ext}`
    return await uploadFile(file, 'inspection-media', path)
  } catch (e) { console.warn('Video upload failed:', e.message); return null }
}
