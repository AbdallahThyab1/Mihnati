import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { File } from 'expo-file-system';

// Pure JS base64 to Uint8Array decoder (reliable across all React Native engines)
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function base64ToUint8Array(base64: string): Uint8Array {
  const cleanBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  let bufferLength = cleanBase64.length * 0.75;
  if (cleanBase64.endsWith('==')) bufferLength -= 2;
  else if (cleanBase64.endsWith('=')) bufferLength -= 1;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < cleanBase64.length; i += 4) {
    const encoded1 = chars.indexOf(cleanBase64[i]);
    const encoded2 = chars.indexOf(cleanBase64[i + 1]);
    const encoded3 = chars.indexOf(cleanBase64[i + 2]);
    const encoded4 = chars.indexOf(cleanBase64[i + 3]);

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (encoded3 !== 64 && encoded3 !== -1) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (encoded4 !== 64 && encoded4 !== -1) {
      bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
    }
  }
  return bytes;
}

export async function uploadImageToStorage(
  uri: string,
  bucket: 'avatars' | 'service-images' = 'avatars',
  customFileName?: string,
): Promise<string> {
  try {
    const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const fileName = customFileName
      ? `${customFileName}.${ext}`
      : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    let uploadBody: any;

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      uploadBody = await response.blob();
    } else {
      const file = new File(uri);
      const base64 = await file.base64();
      uploadBody = base64ToUint8Array(base64);
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, uploadBody, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error:', uploadError.message);
      return uri;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.warn('uploadImageToStorage exception:', error);
    return uri;
  }
}
