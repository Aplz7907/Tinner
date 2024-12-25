import Elysia from "elysia"
import { LikeService } from "../services/like.service"
import { UserDto } from "../types/user.type"
import { AuthMiddleware, AuthPayLoad } from "../middlewares/auth.middleware"
import { Query } from "mongoose"

export const LikeController = new Elysia({
    prefix: "api/like",
    tags: ['Like']
})
    .use(AuthMiddleware)
    .use(UserDto)


    .put('/', async ({ body: { target_id }, set, Auth }) => {
        try {
            const user_id = (Auth.payload as AuthPayLoad).id
            await LikeService.togglelike(user_id, target_id)
            set.status = "No Content"
        } catch (error) {
            set.status = "Bad Request"
            throw error
        }
    }, {
        detail: { summary: "Toggle Like" },
        isSignIn: true,
        body: "target_id"
    })
    .get('/followers', async ({ Auth, query }) => {
        const user_id = (Auth.payload as AuthPayLoad).id
        const user_pagination = await LikeService.getFollowers(user_id, query)
        return user_pagination
    }, {
        detail: { summary: "Get Followers" },
        isSignIn: true,
        query: "pagination",
        response: "users"
    })

    .get('/following', async ({ Auth, query }) => {
        const user_id = (Auth.payload as AuthPayLoad).id
        const user_pagination = await LikeService.getFollowing(user_id, query)
        return user_pagination
    }, {
        detail: { summary: "Get Following" },
        isSignIn: true,
        query: "pagination",
        response: "users"
    })