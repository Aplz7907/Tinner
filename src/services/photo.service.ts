import mongoose from "mongoose"
import { Cloudinary } from "../config/cloudinary.config"
import { ImageHelper } from "../helper/image.helper"
import { User } from "../models/user.model"
import { photo } from "../types/photo.type"
import { _Photo as Photo } from "../models/photo.model"


export const Photoservice
    = {
    upload: async function (file: File, user_id: string): Promise<photo> {
        const buffer = await file.arrayBuffer()
        const isFileValid = ImageHelper.isImage(buffer)
        if (!isFileValid)
            throw new Error("not imlement jpeg to png")
        const base64 = Buffer.from(buffer).toString('base64')
        const dataURI = `data: ${file.type};base64,${base64}`
        const clouPhoto = await Cloudinary.uploader.upload(dataURI, {
            folder: 'ipeexample-uer-image',
            response_type: 'auto',
            transformation: [{
                width: 500,
                height: 500,
                crop: 'fill',
                gravity: 'face'
            }]
        })
        if (!clouPhoto.public_id || !clouPhoto.secure_url)
            throw new Error("Somthinng went wrong")
        const uploadPhoto = new Photo({
            user: new mongoose.Types.ObjectId(user_id),
            url: clouPhoto.secure_url,
            public_id: clouPhoto.public_id
        })
        await uploadPhoto.save()
        await User.findByIdAndUpdate(
            user_id,
            { $push: { photos: uploadPhoto._id } }
        )
        return uploadPhoto.toPhoto()
    },
    ePhotosByUserID: async function (user_id: string): Promise<photo[]> {
        const photoDoc = await Photo.find({ user: user_id }).exec()
        const photos = photoDoc.map(doc => doc.toPhoto())
        return photos
    },
    delete: async function (photo_id: string): Promise<boolean> {
        const doc = await Photo.findById(photo_id).exec()
        if (!doc) {
            throw new Error(`photo ${photo_id} not existing`)
        }
        await User.findByIdAndUpdate(doc.user, {
            $pull: { photos: photo_id }

        })
        await Photo.findByIdAndDelete(photo_id)
        await Cloudinary.uploader.destroy(doc.public_id)
        return true
    },
    setAvatar: async function (photo_id: string, user_id: string): Promise<boolean> {
        await Photo.updateMany(
            { user: new mongoose.Types.ObjectId(user_id) },
            { $set: { is_avatar: true } }
        )
        const result = await Photo.findByIdAndUpdate(photo_id,
            { $set: { is_avatar: true } },
            { new: true }
        )
        return !!result

    },
}