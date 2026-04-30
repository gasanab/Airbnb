import { Request, Response } from "express";
import prisma from "../config/prisma";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (req.userId !== userId) {
      res.status(403).json({ message: "You can only change your own avatar" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Delete old avatar if exists
    if (user.avatarPublicId) {
      try {
        await deleteFromCloudinary(user.avatarPublicId);
      } catch (error) {
        console.error("Failed to delete old avatar:", error);
      }
    }

    // Upload new avatar
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, "airbnb/avatars");

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: url, avatarPublicId: publicId }
    });

    const { password: _password, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    handleControllerError(error, res, "upload.uploadAvatar");
  }
};

export const deleteAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (req.userId !== userId) {
      res.status(403).json({ message: "You can only delete your own avatar" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.avatar) {
      res.status(400).json({ message: "No avatar to remove" });
      return;
    }

    // Delete from Cloudinary
    if (user.avatarPublicId) {
      try {
        await deleteFromCloudinary(user.avatarPublicId);
      } catch (error) {
        console.error("Failed to delete avatar:", error);
      }
    }

    // Update user to remove avatar
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: null, avatarPublicId: null }
    });

    res.status(200).json({ message: "Avatar removed successfully" });
  } catch (error) {
    handleControllerError(error, res, "upload.deleteAvatar");
  }
};

export const uploadListingPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id as string;

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { photos: true }
    });

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (listing.hostId !== req.userId) {
      res.status(403).json({ message: "You can only upload photos to your own listings" });
      return;
    }

    const existingPhotos = listing.photos.length;
    if (existingPhotos >= 5) {
      res.status(400).json({ message: "Maximum of 5 photos allowed per listing" });
      return;
    }

    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const remainingSlots = 5 - existingPhotos;
    const filesToUpload = files.slice(0, remainingSlots);

    const uploadPromises = filesToUpload.map(file =>
      uploadToCloudinary(file.buffer, "airbnb/listings")
    );

    const uploadResults = await Promise.all(uploadPromises);

    const photoCreateData = uploadResults.map(result => ({
      url: result.url,
      publicId: result.publicId,
      listingId
    }));

    await prisma.listingPhoto.createMany({
      data: photoCreateData
    });

    const updatedListing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { photos: true, host: true, bookings: true }
    });

    res.status(200).json(updatedListing);
  } catch (error) {
    handleControllerError(error, res, "upload.uploadListingPhotos");
  }
};

export const deleteListingPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id as string;
    const photoId = req.params.photoId as string;

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (listing.hostId !== req.userId) {
      res.status(403).json({ message: "You can only delete photos from your own listings" });
      return;
    }

    const photo = await prisma.listingPhoto.findUnique({ where: { id: photoId } });
    if (!photo) {
      res.status(404).json({ message: "Photo not found" });
      return;
    }

    if (photo.listingId !== listingId) {
      res.status(403).json({ message: "This photo does not belong to this listing" });
      return;
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(photo.publicId);
    } catch (error) {
      console.error("Failed to delete photo from Cloudinary:", error);
    }

    // Delete from database
    await prisma.listingPhoto.delete({ where: { id: photoId } });

    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    handleControllerError(error, res, "upload.deleteListingPhoto");
  }
};
