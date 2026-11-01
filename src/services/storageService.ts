import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadShopImage(
  file: File,
  ownerId: string,
  shopId: string = 'new'
): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image size must be less than 5MB');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed');
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storagePath = `shops/${ownerId}/${shopId}/${timestamp}_${sanitizedName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    console.warn('Firebase Storage upload failed, falling back to local base64 preview:', err);
    // Convert to Base64 data URL as robust fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
