import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileUri: string, folder: string = 'pak-tourism') => {
  try {
    const result = await cloudinary.uploader.upload(fileUri, {
      folder,
      resource_type: 'auto',
      transformation: [{ width: 800, height: 600, crop: 'fill', gravity: 'auto' }],
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const uploadRemoteImage = async (
  imageUrl: string,
  folder: string = 'pak-tourism',
  publicId?: string
) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      public_id: publicId,
      unique_filename: publicId ? false : true,
      overwrite: true,
      resource_type: 'auto',
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary remote upload error:', error);
    throw error;
  }
};

export const uploadRemoteImageSafe = async (
  imageUrl: string,
  folder: string = 'pak-tourism',
  publicId?: string
) => {
  try {
    return await uploadRemoteImage(imageUrl, folder, publicId);
  } catch {
    return null;
  }
};

/**
 * Extract the Cloudinary public_id from a secure URL.
 * e.g. https://res.cloudinary.com/demo/image/upload/v123/pak-tourism/photo.jpg
 * → pak-tourism/photo
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    let path = url.slice(uploadIndex + '/upload/'.length);
    // Strip optional version segment (v<digits>/)
    path = path.replace(/^v\d+\//, '');
    // Strip file extension
    path = path.replace(/\.[^/.]+$/, '');
    return path;
  } catch {
    return null;
  }
};

export const deleteImage = async (url: string): Promise<void> => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) throw new Error('Could not extract public_id from URL');
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
