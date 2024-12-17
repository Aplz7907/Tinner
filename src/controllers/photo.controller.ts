import Elysia, { error, t } from "elysia"
import { ImageHelper } from "../helper/image.helper"
import { PhotoDto } from "../types/photo.type"
import { AuthMiddleware, AuthPayLoad } from "../middlewares/auth.middleware"
import { Photoservice as PhotoService } from "../services/photo.service"


export const PhotoController = new Elysia({
    prefix: "/api/photo",
    tags: ['Photo']
})
    .use(PhotoDto)
    .use(AuthMiddleware)

    .post('/', async ({ body: { file }, set, Auth }) => {
        const user_id = (Auth.payload as AuthPayLoad).id
        try {
            return await PhotoService.upload(file, user_id)
        }
        catch (error) {
            set.status = "Bad Request"
            if (error instanceof Error)
                throw error
            throw new Error("Somthing wrong")
        }

    }, {

        detail: { summary: "Upload Photo" },
        body: t.Object({
            imgFile: t.File()
        })
    })