/**
 * ImgBB Image Upload Service
 * API Key provided by user: bfbd887ebc86001dfbbd00f361b65421
 */

const IMGBB_API_KEY = 'bfbd887ebc86001dfbbd00f361b65421';
const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';

export interface ImgBBUploadResult {
  success: boolean;
  url?: string;
  thumbUrl?: string;
  deleteUrl?: string;
  error?: string;
}

/**
 * Upload a File object (from input[type=file]) directly to ImgBB
 */
export async function uploadImageToImgBB(file: File): Promise<ImgBBUploadResult> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch(IMGBB_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data && data.success && data.data) {
      return {
        success: true,
        url: data.data.url || data.data.display_url,
        thumbUrl: data.data.thumb?.url || data.data.medium?.url || data.data.url,
        deleteUrl: data.data.delete_url,
      };
    } else {
      const errMsg = data?.error?.message || 'Failed to upload image to ImgBB';
      console.error('ImgBB upload error response:', data);
      return {
        success: false,
        error: errMsg,
      };
    }
  } catch (err: any) {
    console.error('ImgBB network error:', err);
    return {
      success: false,
      error: err?.message || 'Network error while uploading image',
    };
  }
}

/**
 * Upload a Base64 string directly to ImgBB
 */
export async function uploadBase64ToImgBB(base64String: string): Promise<ImgBBUploadResult> {
  try {
    // Strip header if data URI
    const cleanBase64 = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const formData = new FormData();
    formData.append('image', cleanBase64);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch(IMGBB_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data && data.success && data.data) {
      return {
        success: true,
        url: data.data.url || data.data.display_url,
        thumbUrl: data.data.thumb?.url || data.data.url,
      };
    } else {
      return {
        success: false,
        error: data?.error?.message || 'ImgBB upload failed',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error uploading to ImgBB',
    };
  }
}
