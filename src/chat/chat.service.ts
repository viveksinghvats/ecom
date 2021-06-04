import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonResponseModel } from '../utils/app-service-data';
import { ChatDataModel, MessageModel } from './chat.model';
import { UsersDTO } from '../users/users.model';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel('Chat') private readonly chatModel: Model<any>,
        @InjectModel('Locations') private readonly locationModel: Model<any>,

    ) {
    }
    // ************************USER*******************

    // FOR USER APP INIT CHAT FIRST TIME
    public async initializeTheChat(messageBody: MessageModel) {
        try {
            console.log("messageBody", messageBody)
            messageBody.createdAt = Date.now();
            let checkIfAlreadyChatExist = await this.chatModel.findOne({ senderId: messageBody.senderId, receiverId: messageBody.receiverId, status: 'Opened' });
            if (checkIfAlreadyChatExist) {
            } else {
                let chatData: ChatDataModel = <ChatDataModel>Object.assign({
                    senderId: messageBody.senderId,
                    receiverId: messageBody.receiverId,
                    senderName: messageBody.senderName,
                    lastMessage: messageBody.message,
                    status: 'Opened',
                    messages: [messageBody],
                    lastMessageTime: messageBody.createdAt,
                    createdAt: messageBody.createdAt
                });
                let chat = new this.chatModel(chatData);
                chat.messages[0].chatId = chat._id;
                let savedChat = await chat.save()
                return { manager: savedChat, user: savedChat };
            }
        } catch (e) {
            console.log("errrrrrrrrrrrrr", e)
            return { response_code: HttpStatus.BAD_REQUEST, response_data: 'Could not initialize' };
        }
    }
    // FOR USER APP REGULAR CHAT
    public async regularChat(messageBody: MessageModel) {
        try {
            console.log("messageBody", messageBody)
            messageBody.createdAt = Date.now();
            let checkIfAlreadyChatExist = await this.chatModel.findOne({ senderId: messageBody.senderId, receiverId: messageBody.receiverId, status: 'Opened' });
            if (checkIfAlreadyChatExist) {
                messageBody.chatId = checkIfAlreadyChatExist._id;
                checkIfAlreadyChatExist.messages.push(messageBody);
                checkIfAlreadyChatExist.lastMessageTime = messageBody.createdAt;
                checkIfAlreadyChatExist.lastMessage = messageBody.message;
                let savedChat = await checkIfAlreadyChatExist.save();
                return { manager: messageBody, user: messageBody };
            }
        } catch (e) {
            console.log("errrrrrrrrrrrrr", e)
            return { response_code: HttpStatus.BAD_REQUEST, response_data: 'Could not initialize' };
        }
    }
    // FOR USER APP LOCATION AND OPEN CHAT LIST
    public async getAllChat(id: string) {
        try {
            let locations = await this.locationModel.find({ status: 1 }, 'locationName');
            const locationsList = locations.map(item => {
                const container = { _id: item._id, locationName: item.locationName, chatId: null };
                return container;
            })
            const chats = await this.chatModel.find({ senderId: id, status: 'Opened' }, 'receiverId')
            if (chats.length) {
                chats.forEach(function (chat) {
                    let index = locationsList.findIndex(p => p._id.toString() == chat.receiverId.toString());
                    if (index > -1) {
                        locationsList[index].chatId = chat._id;
                    }
                })
            }
            console.log("chats", locationsList)
            return locationsList;
        } catch (e) {
            console.log("chat list errrrrrrr", e)
        }
    }
    //FOR USER APP CHAT CLOSED HISTORY
    public async getAllChatClosedList(id: string) {
        try {
            const chats = await this.chatModel.find({ senderId: id, status: 'Closed' }, 'receiverId lastMessageTime').populate('receiverId', 'locationName').sort('-lastMessageTime')
            return chats;
        } catch (e) {
            console.log("chat list errrrrrrr", e)
        }
    }
    // FOR USER APP CHAT CLOSED INFO
    public async getChatClosedInfo(id: string) {
        try {
            const chat = await this.chatModel.findById(id)
            return chat;
        } catch (e) {
            console.log("chat list errrrrrrr", e)
        }
    }
    // FOR USER APP CHAT INFO 
    public async chatInfoForUser(id: string) {
        try {
            const chats = await this.chatModel.findById(id)
            return chats;
        } catch (e) {
            console.log("chat list errrrrrrr", e)
        }
    }
    // FOR USER APP TO CLOSE CHAT 
    public async chatClosed(id: string) {
        try {
            const chats = await this.chatModel.findByIdAndUpdate(id, { status: "Closed" }, { new: true })
            return chats;
        } catch (e) {
            console.log("chat list errrrrrrr", e)
        }
    }

    // ************************MANAGER*******************
    // FOR MANAGER TO SEND MSG
    public async sendMessage(messageBody: MessageModel) {
        try {
            messageBody.createdAt = Date.now();
            let checkIfAlreadyChatExist = await this.chatModel.findOne({ senderId: messageBody.senderId, receiverId: messageBody.receiverId, status: 'Opened' });
            if (checkIfAlreadyChatExist) {
                messageBody.chatId = checkIfAlreadyChatExist._id;
                checkIfAlreadyChatExist.messages.push(messageBody);
                checkIfAlreadyChatExist.lastMessageTime = messageBody.createdAt;
                checkIfAlreadyChatExist.lastMessage = messageBody.message;
                await checkIfAlreadyChatExist.save();
                return messageBody;
            } else {
                return {};
            }
        } catch (e) {
            return { response_code: HttpStatus.BAD_REQUEST, response_data: 'Could not initialize' };
        }
    }
    // FOR MANAGER CHAT OPEN LIST ONLY
    public async managerChatList(id: string) {
        try {
            let chat = await this.chatModel.find({ receiverId: id, status: 'Opened' }, '-messages');
            return chat
        } catch (e) {
            return { response_code: HttpStatus.BAD_REQUEST, response_data: 'Could not initialize' };
        }
    }
    // FOR MANAGER CHAT INFO -ID
    public async managerChatInfo(id: string) {
        try {
            let chat = await this.chatModel.findById(id);
            return chat
        } catch (e) {
            return { response_code: HttpStatus.BAD_REQUEST, response_data: 'Could not initialize' };
        }
    }


}
