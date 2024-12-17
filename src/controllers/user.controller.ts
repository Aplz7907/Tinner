import { UserDto } from './../types/user.type'
import Elysia from "elysia"
import { AuthMiddleware, AuthPayLoad } from "../middlewares/auth.middleware"
import { UserService } from '../services/user.service'
import { set } from 'mongoose'

export const UserController = new Elysia({
    prefix: "/api/user",
    tags: ['User']
})
    .use(UserDto)
    .use(AuthMiddleware)

    .get('/all', () => {
        return {
            user: [
                { id: '123' }
            ]
        }
    }, {
        isSignIn: true,
    })

    .get('/', ({ query, Auth }) => {
        const user_id = (Auth.payload as AuthPayLoad).id
        return UserService.get(query, user_id)
    }, {
        detail: { summary: "Get User" },
        query: "pagination",
        response: "users",
        isSignIn: true
    })

    .patch('/', async ({ body, set, Auth }) => {
        try {
            const user_id = (Auth.payload as AuthPayLoad).id
            await UserService.updateProfile(body, user_id)
            set.status = 204
        } catch (error) {
            set.status = "Bad Request"
            if (error instanceof Error)
                throw new Error(error.message)
            set.status = 500
            throw new Error('something went wrong, try again later')
        }
    }, {
        detail: { summary: "Update Profile" },
        body: "updateProfile",
        // response: "user",
        isSignIn: true
    })