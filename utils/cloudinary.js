import cloudinary from 'cloudinary';
const { v2: cloudinaryV2 } = cloudinary;

cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Check environment variable
    api_key: process.env.CLOUDINARY_API_KEY, // Check environment variable
    api_secret: process.env.CLOUDINARY_API_SECRET, // Check environment variable
  });

export const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    console.log('Uploading file:', file.path);
    cloudinaryV2.uploader.upload(file.path, (error, result) => {
      if (error) {
        console.error('Error uploading image:', error);
        reject(error);
      } else {
        console.log('Image uploaded successfully:', result.secure_url);
        resolve(result.secure_url);
      }
    });
  });
};
