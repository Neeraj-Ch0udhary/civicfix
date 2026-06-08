import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://owbjstdqmjicnwiomqfd.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YmpzdGRxbWppY253aW9tcWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzM4MDcsImV4cCI6MjA5NjUwOTgwN30.hEE3NIaCuVA0lflCANCsh8uCTcITpQmfoqKyVLpOLUY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const submitIssue = async (data: {
  category: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  photo: string | null;
}) => {
  let photo_url = null;

  // Upload photo to Supabase Storage if provided
  if (data.photo) {
    const fileName = `issue_${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('issues')
      .upload(fileName, decode(data.photo), {
        contentType: 'image/jpeg',
      });
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('issues').getPublicUrl(fileName);
      photo_url = urlData.publicUrl;
    }
  }

  const { error } = await supabase.from('issues').insert({
    title: data.category,
    category: data.category,
    description: data.description,
    latitude: data.latitude,
    longitude: data.longitude,
    photo_url,
    status: 'pending',
  });

  if (error) throw error;
};

// base64 decoder helper
function decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
export const getIssues = async () => {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};