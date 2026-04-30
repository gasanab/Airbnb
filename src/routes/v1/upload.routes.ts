import { Router } from "express";
import {
  uploadAvatar,
  deleteAvatar,
  uploadListingPhotos,
  deleteListingPhoto
} from "../../controllers/upload.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";

const uploadRouter = Router();

/**
 * @swagger
 * /users/{id}/avatar:
 *   post:
 *     summary: Upload user avatar
 *     description: |
 *       Upload a profile picture for a user.
 *       
 *       **Important Notes:**
 *       - Users can only upload their own avatar
 *       - Admins can upload avatar for any user
 *       - Old avatar is automatically deleted when uploading a new one
 *       - Supported formats: JPEG, PNG, WebP
 *       - Maximum file size: 5MB
 *       - Images are stored on Cloudinary
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WebP, max 5MB)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: File validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noFile:
 *                 summary: No file uploaded
 *                 value:
 *                   message: "No file uploaded"
 *               invalidType:
 *                 summary: Invalid file type
 *                 value:
 *                   message: "Only jpeg, png, webp are allowed"
 *               tooLarge:
 *                 summary: File too large
 *                 value:
 *                   message: "File size exceeds 5MB limit"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Can only upload own avatar (unless admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You can only change your own avatar"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
uploadRouter.post("/users/:id/avatar", authenticate, upload.single("image"), uploadAvatar);

/**
 * @swagger
 * /users/{id}/avatar:
 *   delete:
 *     summary: Delete user avatar
 *     description: Remove a user's profile picture
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Avatar removed successfully"
 *       400:
 *         description: No avatar to remove
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "No avatar to remove"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Can only delete own avatar (unless admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You can only delete your own avatar"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
uploadRouter.delete("/users/:id/avatar", authenticate, deleteAvatar);

/**
 * @swagger
 * /listings/{id}/photos:
 *   post:
 *     summary: Upload listing photos
 *     description: |
 *       Upload photos for a listing (maximum 5 photos per listing).
 *       
 *       **Important Notes:**
 *       - Only listing owner (HOST) can upload photos
 *       - Admins can upload photos for any listing
 *       - Maximum 5 photos per listing
 *       - Supported formats: JPEG, PNG, WebP
 *       - Maximum file size: 5MB per file
 *       - Multiple files can be uploaded at once
 *       - Images are stored on Cloudinary
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Listing ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [photos]
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files (JPEG, PNG, WebP, max 5MB each)
 *                 maxItems: 5
 *     responses:
 *       200:
 *         description: Photos uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Upload validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noFiles:
 *                 summary: No files uploaded
 *                 value:
 *                   message: "No files uploaded"
 *               tooMany:
 *                 summary: Too many photos
 *                 value:
 *                   message: "Maximum of 5 photos allowed per listing"
 *               invalidType:
 *                 summary: Invalid file type
 *                 value:
 *                   message: "Only jpeg, png, webp are allowed"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Can only upload photos to own listings (unless admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You can only upload photos to your own listings"
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
uploadRouter.post("/listings/:id/photos", authenticate, upload.array("photos", 5), uploadListingPhotos);

/**
 * @swagger
 * /listings/{id}/photos/{photoId}:
 *   delete:
 *     summary: Delete listing photo
 *     description: Delete a specific photo from a listing
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Listing ID
 *         example: 1
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photo ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Photo deleted successfully"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Can only delete photos from own listings (unless admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notOwner:
 *                 summary: Not listing owner
 *                 value:
 *                   message: "You can only delete photos from your own listings"
 *               wrongListing:
 *                 summary: Photo doesn't belong to listing
 *                 value:
 *                   message: "This photo does not belong to this listing"
 *       404:
 *         description: Listing or photo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               listingNotFound:
 *                 summary: Listing not found
 *                 value:
 *                   message: "Listing not found"
 *               photoNotFound:
 *                 summary: Photo not found
 *                 value:
 *                   message: "Photo not found"
 */
uploadRouter.delete("/listings/:id/photos/:photoId", authenticate, deleteListingPhoto);

export default uploadRouter;
