import * as mongoose from 'mongoose';

export const ChatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locations'
    },
    senderName: String,
    status: {
        type: String
    },
    messages: [
      {
        message: String,
        createdAt: Number,
        senderName: String,
        receiverName: String,
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Locations'
        },
        sentBy: String,
        chatId:String
      }
    ],
    lastMessage: {
        type: String
    },
    lastMessageTime: {
        type: Number
    },
    createdAt:{
        type: Number
    }
});

export interface ChatDataModel {
    senderId: string;
    receiverId: string;
    status: string;
    messages: Array<MessageModel>;
    createdAt?: number;
    lastMessage: string;
    lastMessageTime: number;
}

export interface MessageModel {
    message: string;
    createdAt: number;
    senderName: string;
    receiverName: string;
    senderId: string;
    receiverId: string;
    sentBy: string;
    chatId?: string;
}
