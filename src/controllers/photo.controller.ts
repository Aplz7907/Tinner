import Elysia from "elysia"
import { AuthMiddleware, AuthPayLoad } from "../middlewares/auth.middleware"
import { PhotoDto } from "../types/photo.type"
import { Photoservice } from "../services/photo.service"




export const PhotoController = new Elysia({
    prefix: "/api/photo",
    tags: ['Photo']
})
    .use(PhotoDto)
    .use(AuthMiddleware)
    .patch('/:photo_id', async ({ params: { photo_id }, set, Auth }) => {
        try {
            const user_id = (Auth.payload as AuthPayLoad).id
            return Photoservice.setAvatar(photo_id, user_id)
            set.status = 400
        } catch (error) {
            set.status = 400
            if (error instanceof Error)
                throw error
            throw new Error("Somthing wrong")

        }
    }, {
        detail: { summary: "Set Avatar" },
        isSignIn: true,
        params: "photo_id"

    })
    .delete('/:photo_id', async ({ params: { photo_id }, set }) => {
        try {
            await Photoservice.delete(photo_id)
            set.status = 400
        } catch (error) {
            set.status = 400
            if (error instanceof Error)
                throw error
            throw new Error("Somthing wrong")

        }
    }, {
        detail: { summary: "Deleta photo" },
        isSignIn: true,
        params: "photo_id"
    })
    .get('/', async ({ Auth }) => {
        const user_id = (Auth.payload as AuthPayLoad).id
        return await Photoservice.ePhotosByUserID(user_id)
    }, {
        detail: { summary: "Get poto[] by user_id" },
        isSignIn: true,
        response: "photos"
    })

    .post('/', async ({ body: { file }, set, Auth }) => {
        const user_id = (Auth.payload as AuthPayLoad).id
        try {
            return await Photoservice.upload(file, user_id)
        }
        catch (error) {
            set.status = 400
            if (error instanceof Error)
                throw error
            throw new Error("Somthing wrong")
        }

    }, {

        detail: { summary: "Upload Photo" },
        body: "upload",
        response: "photo",
        isSignIn: true
    })