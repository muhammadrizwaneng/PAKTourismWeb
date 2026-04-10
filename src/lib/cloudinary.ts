import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileUri: string, folder: string = 'pak-tourism') => {
  try {
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: folder,
      resource_type: 'auto',
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

export default cloudinary;
