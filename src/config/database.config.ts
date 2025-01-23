import mongoose from "mongoose"

const username = Bun.env.DB_USERNAME || 'jatuphatkr'
const password = Bun.env.DB_PASSWORD || 'HmyqPX8PGKGQFmZ7'
const db_name = Bun.env.MONGO_DBNAME || 'tinnerapp'

const uri = `mongodb+srv://jatuphatkr:HmyqPX8PGKGQFmZ7@cluster0.pk05e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

export const MongoDB = {
    connect: async function () {
        try {
            await mongoose.connect(uri)
            console.log('--------MongoDB Conneted--------')
        } catch (error) {
            console.log('--------MongoDB Connection Error--------')
            console.log(error)
        }
    }
}
