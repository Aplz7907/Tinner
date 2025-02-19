import Elysia, { error, t } from "elysia"
import { jwtConfig } from "../configs/jwt.config"
import { AuthMiddleWare, AuthPayload } from "../middlewares/auth.middleware"
import { message, MessageDto } from "../types/message.type"
import mongoose from "mongoose"
import { Message } from "../models/message.model"
import { _pagination } from "../types/pagination.type"

type client = {
    ws_id: string,
    user_id: string,
    group_name: string,
}

const grounSubscripion = new Map<string, Set<any>>()

export const MessageController = new Elysia({
    prefix: "api/message",
    tags: ['Message']
})
    .use(jwtConfig)
    .use(AuthMiddleWare)
    .use(MessageDto)

    .ws('/ws', {
        async open(ws) {
            const token = ws.data.query.token
            const recipient_id = ws.data.query.recipient_id
            const payload = await ws.data.jwt.verify(token)
            if (!payload || !recipient_id) {
                ws.send({ sender: 'sysktem', content: 'eiei' })
                ws.close()
            }
            const user_id = (payload as AuthPayload).id
            const groupName = getGroupName(user_id, recipient_id!)

            ws.send({ sender: 'sysktem', content: 'eiei' })
            if (!ws.isSubscribed(groupName)) {
                ws.subscribe(groupName)
                if (!grounSubscripion.has(groupName)) {
                    grounSubscripion.set(groupName, new Set())
                }

                grounSubscripion.get(groupName)?.add({
                    ws_id: ws.id,
                    user_id: user_id,
                    group_name: groupName
                })
            }
        },

        close(ws) {
            for (const clients of grounSubscripion.values()) {
                for (const client of clients) {
                    if (client.ws_id === ws.id) {
                        ws.unsubscribe(client.group_name)
                        clients.delete(client)
                    }
                }
            }
        },

        async message(ws, message) {
            const msg = message as message
            if (!msg.sender) {
                ws.send({ sender: 'sysktem', content: 'eiei' })
                return
            }
            const groupName = getGroupName(msg.sender, msg.recipient)
            try {
                const newMessage = new Message({
                    sender: new mongoose.Types.ObjectId(msg.sender),
                    recipient: new mongoose.Types.ObjectId(msg.recipient),
                    content: msg.content
                })
                if (isRecipientConnected(groupName, msg.recipient)) {
                    newMessage.read_at = new Date()
                }
                await newMessage.save()
                const msgObj = newMessage.toMessage()
            } catch (error) {
                ws.send({ sender: 'sysktem', content: 'Somthing Black' })
                return

            }
        },
    })

    .get('/:recipient_id', async ({ Auth, params: { recipient_id }, query }) => {
        if (!query.pageSize || !query.currentPage)
            throw error(400)
        const user_id = (Auth.payload as AuthPayload).id
        const sender_ObjId = new mongoose.Types.ObjectId(user_id)
        const recipient_ObjId = new mongoose.Types.ObjectId(recipient_id)

        const filter = {
            $or: [
                { sender: sender_ObjId, recipient: recipient_ObjId, sender_delete: { $ne: true } },
                { sender: sender_ObjId, recipient: recipient_ObjId, recipient_delete: { $ne: true } },
            ]
        }
        const model = Message.find(filter).sort({ created_at: -1 })

        const skip = query.pageSize * (query.currentPage - 1)
        model.skip(skip).limit(query.pageSize)

        const [messageDocs, totalCount] = await Promise.all([
            model.exec(),
            Message.countDocuments(filter).exec()
        ])

        query.length = totalCount
        const message = messageDocs.map(doc => doc.toMessage())
        await Message.updateMany({
            sender: recipient_ObjId,
            recipient: sender_ObjId,
            read_at: { $exists: false }
        }, {
            $set: { read_at: new Date() }
        })

        return { 200: { pagination: query, items: message } }

    }, {
        query: "pagination",
        response: "messgeges",
        isSignIn: true,
        params: t.Object({ recipient_id: t.String() })
    })

const getGroupName = function (sender: string, recipient: string): string {
    const compare = sender.localeCompare(recipient)
    if (compare < 0)
        return `${sender}-${recipient}`
    return `${recipient}-${sender}`
}

const countSubcriber = function (groupName: string): number {
    return grounSubscripion.get(groupName)?.size || 0
}

const isRecipientConnected = function (group_name: string, recipient: string): boolean {
    const clinsts = grounSubscripion.get(group_name)
    if (clinsts)
        return Array.from(clinsts).find(client => client.user._id === recipient) != undefined
    return countSubcriber(group_name) > 1
}