import mongoose, { get } from "mongoose"
import { user, userPagination, userPaginator } from "../types/user.type"
import { User } from "../models/user.model"
import { QueryHelper } from "../helper/query.helper"

export const LikeService = {
    togglelike: async function (user_id: string, target_id: string): Promise<boolean> {
        const target = await User.findById(target_id).select("_id").exec()
        if (!target)
            throw new Error("Invalid target_get")

        const LikeTarget = await User.findOne({
            _id: new mongoose.Types.ObjectId(user_id),
            following: { $elemMatch: { $eq: target._id } }

        }).exec()

        if (LikeTarget) {
            await User.findByIdAndUpdate(user_id, { $pull: { follwoing: target_id } })

            await User.findByIdAndUpdate(target_id, { $pull: { follwers: target_id } })

        } else {
            await User.findByIdAndUpdate(user_id, { $addToSet: { follwoing: target_id } })

            await User.findByIdAndUpdate(target_id, { $addToSet: { follwers: target_id } })

        }
        return true
    },

    getFollowers: async function (user_id: string, pagination: userPagination): Promise<userPaginator> {
        const _query = User.findById(user_id)
            .populate({
                path: "followers",
                match: { $and: QueryHelper.parseUserQuery(pagination) },
                select: '_id username display_name photos introductuin interest gender date_of_birth',
                populate: { path: "photos" }


            })
        const [docs, total] = await Promise.all([
            _query.exec(),
            User.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(user_id) } },
                { $project: { const: { $size: { $ifNull: ["$followers", []] } } } }

            ])
        ])
        pagination.length = total[0].const
        let follower: user[] = []
        if (docs) {
            follower = docs.followers as user[]
        }
        return {
            pagination: pagination,
            items: follower
        }

    },

    getFollowing: async function (user_id: string, pagination: userPagination): Promise<userPaginator> {
        const _query = User.findById(user_id)
            .populate({
                path: "following",
                match: { $and: QueryHelper.parseUserQuery(pagination) },
                select: '_id username display_name photos introductuin interest gender date_of_birth',
                populate: { path: "photos" }


            })
        const [docs, total] = await Promise.all([
            _query.exec(),
            User.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(user_id) } },
                { $project: { const: { $size: { $ifNull: ["$following", []] } } } }

            ])
        ])
        pagination.length = total[0].const
        let followings: user[] = []
        if (docs) {
            followings = docs.following as user[]
        }
        return {
            pagination: pagination,
            items: followings
        }
    },
}