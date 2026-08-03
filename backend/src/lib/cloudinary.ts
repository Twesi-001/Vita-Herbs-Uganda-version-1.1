import { createHash } from 'crypto';

interface CloudinaryUploadResult {
  secure_url?: string;
  error?: { message: string };
}

export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  mimetype: string,
  resourceType: 'image' | 'video' = 'image',
  folder = 'karorganics',
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary env vars not configured on server');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const formData = new FormData();
  const blob = new Blob([buffer as unknown as ArrayBuffer], { type: mimetype });
  formData.append('file', blob, filename);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = (await cloudRes.json()) as CloudinaryUploadResult;

  if (!data.secure_url) {
    throw new Error(data.error?.message ?? 'Cloudinary upload failed');
  }
  return data.secure_url;
}
