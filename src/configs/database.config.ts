import mongoose from "mongoose"

const username = Bun.env.MONGO_USERNAME || 'jatuphatkr'
const password = Bun.env.MONGO_PASSWORD || 'h7lLMuawJrd7V6Vw'
const db_name = Bun.env.MONGGO_DBNAME || 'tinner_app'

const uri = `mongodb+srv://jatuphatkr:h7lLMuawJrd7V6Vw@cluster0.pk05e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`


export const mongodb = {
    connect: async function () {
        try {
            await mongoose.connect(uri)
            console.log("------------- mongoDB Connected!!!!! -------------")
        } catch (error) {
            console.error("------------- mongoDB connected fail -------------")
            console.error(error)

        }
    }
}