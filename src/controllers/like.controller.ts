import Elysia from "elysia"
import { AuthMiddleware, AuthPayLoad } from "../middlewares/auth.middleware"
import { UserDto } from "../types/user.type"
import { set } from "mongoose"
import { LikeService } from "../services/like.service"

export const LikeController = new Elysia({
    prefix: "api/like",
    tags: ['Like']

})
    .use(AuthMiddleware)
    .use(UserDto)

    .put('/', async ({ body: { target_id }, Auth, set }) => {
        try {
            const user_id = (Auth.payload as AuthPayLoad).id
            await LikeService.togglelike(user_id, target_id)
            set.status = 400

        } catch (error) {
            set.status = 400
            if (error instanceof Error)
                throw error
            throw new Error("Somthing wrong")

        }

    }, {
        detail: { summary: "Total Like" },
        isSignIn: true,
        body: "target_id"
    })