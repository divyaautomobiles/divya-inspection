import { createClient } from '@supabase/supabase-js'
const URL = 'https://eptmbcnllwnasdlqwdca.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdG1iY25sbHduYXNkbHF3ZGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjQ2MDUsImV4cCI6MjA5NTA0MDYwNX0.6570q3wW6edKqq3tAnmtEBeCvhjHD4kspDEFAXDfXDg'
export const supabase = createClient(URL, KEY)
export default supabase
