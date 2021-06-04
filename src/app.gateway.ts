import {
    ConnectedSocket, MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrdersDTO } from './order/order.model';
import { ChatDataModel, MessageModel } from './chat/chat.model';
import { ChatService } from './chat/chat.service';
import { UploadService } from './upload/upload.service';
const GeneralService = require('./utils/general-service');


@Injectable()
@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @InjectModel('Notifications') private readonly notificationModel: Model<any>,
        @InjectModel('Orders') private readonly orderModel: Model<any>,
        @InjectModel('Users') private readonly userModel: Model<any>,
        @InjectModel('Business') private readonly businessModel: Model<any>,
        @InjectModel('Setting') private readonly settingModel: Model<any>,

        private utilsService: UploadService,
        private chatService: ChatService) {
    }

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger();

    // this method is called when client is connected to websocket
    public handleConnection(client: Socket, ...args): any {
        this.logger.log('CLIENT CONNECTED');
        console.log('Client info', client.id);
    }

    // this method is called when client is disconnected from socket
    public handleDisconnect(client: Socket): any {
        this.logger.log('CLIENT DISCONNECTED');
        console.log('CLIENT info', client.id);
    }


    // ************************************************ORDER RELATED******************************

    // this method is called when a new order os placed
    public sendNewOrderNotification(notificationData): any {
        console.log('NEW ORDER SOCKET METHOD');
        this.server.emit('newOrderPlaced', notificationData);
        this.server.emit('managerNewOrder' + notificationData.location, notificationData);
    }

    // new added by jeet
    public async sendPushNotification(playerId, language, status, orderID): Promise<any> {
        console.log("CONVERTED LANGUAGE RESP", playerId, language, status, orderID)

        let msgData = await this.utilsService.pushResMsg(language, status)
        console.log("CONVERTED LANGUAGE RESP", msgData)
        if (msgData) {
            let newMsg = `${msgData.text} #${orderID}, ${msgData.msg}`
            await GeneralService.orderPushNotification(playerId, newMsg, msgData.title);
        }
    }

    public async sendInvoice(id) {
        const orderInfo = await this.orderModel.findById(id).populate('deliveryAddress', 'address').populate('user', 'firstName email language mobileNumber playerId').populate('cart', 'cart couponInfo');
        const businessInfo = await this.businessModel.findOne({}, 'address email phoneNumber storeName webApp iconLogo');
        const settingInfo = await this.settingModel.findOne({}, 'currencyCode');
        let res = await this.utilsService.sendOrderMail(orderInfo, businessInfo, settingInfo ? settingInfo.currencyCode : "$")
        return {
            response_data: res
        }
    }

    afterInit(server: Server): any {
        this.logger.log('WEBSOCKET GATWEAY INITIALIZED');
    }
    // for admin get notification list or update status by admin/manager
    @SubscribeMessage('notification-list')
    public async notificationList(@MessageBody() data) {
        try {
            console.log("ADMIN SUBSCRIBE NOTIFICATION...........................", data)
            if (data && data.id) {
                let p = await this.notificationModel.findByIdAndUpdate(data.id, { status: false }, { new: true });
            } else {
                const list = await this.notificationModel.find({ status: true }, 'ORDERID order').limit(5).sort('-createdAt');
                this.server.emit('newOrderPlaced', list);
            }
        } catch (e) {
            console.log('COULD NOT UPDATE ORDER STATUS');
        }
    }

    // for manger to get notification list
    @SubscribeMessage('notification-manager-list')
    public async notificationManagerList(@MessageBody() data) {
        try {
            console.log("MANAGER ..NOTIFICATION LIST.........................", data)
            if (data && data.id) {
                const list = await this.notificationModel.find({ status: true, location: data.id }, 'ORDERID order').limit(5).sort('-createdAt');
                this.server.emit('managerNewOrder' + data.id, list);
            }
        } catch (e) {
            console.log('COULD NOT UPDATE ORDER STATUS');
        }
    }

    @SubscribeMessage('get-assigned-orders')
    public async getOrderAssignedToDeliveryboy(@MessageBody() data) {
        console.log(data.id);
        try {
            const list = await this.orderModel.find({
                assignedTo: data.id,
                $or: [{ orderStatus: 'Confirmed' }, { orderStatus: 'Out for delivery' }]
            }).populate('cart').populate('product').populate('deliveryAddress').populate('user');
            this.emitAssignedOrders(data.id, list);
        } catch (e) {
            this.emitAssignedOrders(data.id, []);
        }
    }

    // emits order's assigne to delivery boy or any new orders assigned to him
    public emitAssignedOrders(id: string, data) {
        this.server.emit(`assigned-orders${id}`, { assignedOrders: data });
    }

    @SubscribeMessage('update-order-status')
    public async updateOrderStatus(@MessageBody() statusInfo) {
        try {
            if (!statusInfo.orderInfo.isAcceptedByDeliveryBoy) {
                statusInfo.orderInfo.orderAssigned = false;
                statusInfo.orderInfo.assignedTo = null;
            }
            console.log('ORDER STATUS CHANGED');
            const res = await this.orderModel.findByIdAndUpdate(statusInfo.orderInfo._id, statusInfo.orderInfo);
            if (statusInfo.orderInfo.isAcceptedByDeliveryBoy) {
                let deliveryBoy = await this.userModel.findById(statusInfo.id, 'noOfOrderAccepted');
                deliveryBoy.noOfOrderAccepted = deliveryBoy.noOfOrderAccepted + 1;
                await deliveryBoy.save();
            }
            const list = await this.orderModel.find({ assignedTo: statusInfo.id, $or: [{ orderStatus: 'Confirmed' }, { orderStatus: 'Out for delivery' }] }).populate('cart').populate('product').populate('deliveryAddress').populate('user');
            this.emitAssignedOrders(statusInfo.id, list);
            let message = '';
            if (statusInfo.orderInfo.isAcceptedByDeliveryBoy) {
                message = 'Delivery boy has accepted the order';
            } else {
                message = 'Delivery boy has rejected the order';
            }
            this.server.emit('order-status-changed' + res.location, { message });
        } catch (e) {
            console.log('COULD NOT UPDATE ORDER STATUS');
        }
    }

    @SubscribeMessage('order-update-status')
    public async changeOrderStatus(@MessageBody() statusInfo) {
        try {
            const orderInfo: OrdersDTO = await this.orderModel.findById(statusInfo.orderId);
            if (orderInfo) {
                orderInfo.orderStatus = statusInfo.status;
            }
            const res = await this.orderModel.findByIdAndUpdate(statusInfo.orderId, orderInfo, { new: true }).populate('user', 'language playerId email');
            if (res && res.user.playerId) {
                console.log("ORDER  NOTIFICATIN TEST***************", res.user.playerId)
                this.sendPushNotification(res.user['playerId'], res.user['language'], res.orderStatus, res.orderID)
            }
            if (res && res.orderStatus == "DELIVERED") {
                console.log("ORDER  DELIVERED BY DELIVERY BOY")
                let deliveryBoy = await this.userModel.findById(statusInfo.id, 'noOfOrderAccepted noOfOrderDelivered');
                deliveryBoy.noOfOrderAccepted = deliveryBoy.noOfOrderAccepted - 1;
                deliveryBoy.noOfOrderDelivered = deliveryBoy.noOfOrderDelivered + 1;
                await deliveryBoy.save();
                if (res.user['email']) {
                    this.sendInvoice(res._id).then(function (data) { console.log("LAST CALL BACK") })
                }
            }
            const list = await this.orderModel.find({ assignedTo: statusInfo.id, $or: [{ orderStatus: 'Confirmed' }, { orderStatus: 'Out for delivery' }] }).populate('cart').populate('product').populate('deliveryAddress').populate('user');
            const deliveredOrders = await this.orderModel.find({ assignedTo: statusInfo.id, orderStatus: 'DELIVERED' }).populate('cart').populate('product').populate('deliveryAddress').populate('user');
            const message = `Order status is changed to ${orderInfo.orderStatus}`;
            this.server.emit('order-status-changed' + res.location, { message });
            this.server.emit(`updated-order-status${statusInfo.id}`, { orderInfo });
            this.emitAssignedOrders(statusInfo.id, list);
            this.emitDeliveredOrders(statusInfo.id, deliveredOrders);
        } catch (e) {
            console.log('COULD NOT UPDATE ORDER STATUS');
            console.log(e);
        }
    }

    @SubscribeMessage('get-delivered-orders')
    public async getDeliveredOrders(@MessageBody() data) {
        const list = await this.orderModel.find({
            assignedTo: data.id,
            orderStatus: 'DELIVERED'
        }).populate('cart').populate('product').populate('deliveryAddress').populate('user');
        this.emitDeliveredOrders(data.id, list);
    }

    // emit delivered orders
    public emitDeliveredOrders(id: string, list) {
        this.server.emit(`delivered-orders${id}`, { orders: list });
    }

    // **************************************************************************************************************************

    //********************************CHAT(USER/MANAGER)*********************************************

    // FOR USER APP INIT CHAT FIRST TIME
    @SubscribeMessage('initialize-chat')
    public async initializeChat(@MessageBody() messageBody: MessageModel) {
        const res = await this.chatService.initializeTheChat(messageBody);
        this.server.emit(`chat-info-user-listen${messageBody.senderId}`, res.user);
        this.server.emit(`current-manager-chat-listen${messageBody.receiverId}`, res.manager);
    }
    // FOR USER APP REGULAR CHAT
    @SubscribeMessage('regular-chat')
    public async regularChat(@MessageBody() messageBody: MessageModel) {
        const res = await this.chatService.regularChat(messageBody);
        this.server.emit(`regular-user-chat-listen${messageBody.senderId}`, res.user);
        this.server.emit(`manager-listen-message${messageBody.receiverId}`, res.manager);
    }
    // FOR USER APP LOCATION AND OPEN CHAT LIST
    @SubscribeMessage('user-chat-list')
    public async getUserChatList(@MessageBody() body) {
        const data = await this.chatService.getAllChat(body.id);
        this.server.emit(`chat-list-user${body.id}`, data);
    }
    // FOR USER APP CHAT CLOSED HISTORY
    @SubscribeMessage('user-chat-history')
    public async getChatList(@MessageBody() data) {
        const list = await this.chatService.getAllChatClosedList(data.id);
        this.server.emit(`chat-list-user-history${data.id}`, list);
    }

    // FOR USER APP CHAT CLOSED INFO
    @SubscribeMessage('user-chat-closed-info')
    public async getChatClosedInfo(@MessageBody() data) {
        const list = await this.chatService.getChatClosedInfo(data.id);
        this.server.emit(`user-chat-closed-info-listen${list.senderId}`, list);
    }

    // FOR USER APP CHAT INFO 
    @SubscribeMessage('user-chat-info')
    public async chatInfoForUser(@MessageBody() data) {
        const chat = await this.chatService.chatInfoForUser(data.id);
        if (chat && chat.senderId) {
            this.server.emit(`chat-info-user-listen${chat.senderId}`, chat);
        }
    }

    // FOR USER APP TO CLOSE CHAT 
    @SubscribeMessage('chat-closed')
    public async chatClosed(@MessageBody() data) {
        const chat = await this.chatService.chatClosed(data.id);
        if (chat && chat.senderId) {
            this.server.emit(`chat-closed-user-listen${chat.senderId}`, {_id:data.id});
        }if (chat && chat.receiverId) {
            this.server.emit(`chat-closed-manager-listen${chat.receiverId}`, {_id:data.id});
        }
    }



    // ***********************MANAGER*********************

    // FOR MANAGER TO SEND MSG
    @SubscribeMessage('manager-send-message')
    public async sendMessage(@MessageBody() messageBody: MessageModel) {
        const res = await this.chatService.sendMessage(messageBody);
        this.server.emit(`manager-listen-message${messageBody.receiverId}`, res);
        this.server.emit(`user-new-chat-listen${messageBody.senderId}`, res);
    }

    // FOR MANAGER CHAT OPEN LIST ONLY
    @SubscribeMessage('manager-chat-list')
    public async managerChatList(@MessageBody() data: any) {
        const res = await this.chatService.managerChatList(data.id);
        this.server.emit(`manager-chat-list-listen${data.id}`, res);
    }
    // FOR MANAGER CHAT INFO -ID
    @SubscribeMessage('manager-chat-info')
    public async managerChatInfo(@MessageBody() data: any) {
        const res = await this.chatService.managerChatInfo(data.chatId);
        this.server.emit(`manager-chat-info-listen${data.id}`, res);
    }

}
