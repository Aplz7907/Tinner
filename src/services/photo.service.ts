import { error } from "elysia"
import { photo } from "../types/photo.type"
import { ImageHelper } from "../helper/image.helper"
import { Cloudinary } from "../config/cloudinary.config"
import mongoose, { mongo } from "mongoose"
import { User } from "../models/user.model"
import { _Photo } from "../models/photo.model"

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
        const uploadPhoto = new _Photo({
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
    get: async function (user_id: string): Promise<boolean> {
        throw new Error("not imlement")
    },
    delete: async function (photo_id: string): Promise<boolean> {
        throw new Error("not imlement")
    },
    setAvatar: async function (photo_id: string, user_id: string): Promise<boolean> {
        throw new Error("not imlement")
    }
}