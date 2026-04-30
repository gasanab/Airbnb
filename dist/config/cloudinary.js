"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptimizedUrl = exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({ resource_type: "auto", folder }, (error, result) => {
            if (error) {
                reject(error);
            }
            else if (result) {
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
            else {
                reject(new Error("Upload failed: no result"));
            }
        });
        stream.end(buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        console.error(`Failed to delete ${publicId} from Cloudinary:`, error);
        throw error;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
const getOptimizedUrl = (url, width, height) => {
    if (!url.includes('cloudinary.com')) {
        return url; // Return original URL if not a Cloudinary URL
    }
    // Insert transformation parameters into Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
    // Becomes: https://res.cloudinary.com/demo/image/upload/w_300,h_200,c_fill,f_auto,q_auto/v1234/sample.jpg
    const transformation = `w_${width},h_${height},c_fill,f_auto,q_auto`;
    return url.replace('/upload/', `/upload/${transformation}/`);
};
exports.getOptimizedUrl = getOptimizedUrl;
