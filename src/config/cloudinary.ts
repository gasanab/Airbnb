import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        } else {
          reject(new Error("Upload failed: no result"));
        }
      }
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete ${publicId} from Cloudinary:`, error);
    throw error;
  }
};

export const getOptimizedUrl = (url: string, width: number, height: number): string => {
  if (!url.includes('cloudinary.com')) {
    return url; // Return original URL if not a Cloudinary URL
  }
  
  // Insert transformation parameters into Cloudinary URL
  // Example: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
  // Becomes: https://res.cloudinary.com/demo/image/upload/w_300,h_200,c_fill,f_auto,q_auto/v1234/sample.jpg
  const transformation = `w_${width},h_${height},c_fill,f_auto,q_auto`;
  
  return url.replace('/upload/', `/upload/${transformation}/`);
};