import { HttpStatus, Injectable, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersDTO } from '../users/users.model';
import { AssignOrderDTO, DeliveryType, OrdersDTO, OrderStatusDTO } from './order.model';
import { CommonResponseModel } from '../utils/app-service-data';
import { UploadService } from '../upload/upload.service';
import { CartDataModel } from '../cart/cart.model';
import { NotificationsModel } from '../notifications/notifications.model';
import { StartEndDTO } from './order.model';
import { AppGateway } from '../app.gateway';
const _ = require('lodash');
var appRoot = require('app-root-path');
const GeneralService = require('../utils/general-service');
var json2xls = require('json2xls');
var fs = require('fs');
var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


@Injectable()
export class OrderService {
    constructor(@InjectModel('Orders') private readonly orderModel: Model<any>,
        @InjectModel('Cart') private readonly cartModel: Model<any>,
        private utilsService: UploadService,
        @InjectModel('Notifications') private readonly notificationModel: Model<any>,
        @InjectModel('Products') private readonly productModel: Model<any>,
        @InjectModel('Users') private readonly userModel: Model<any>,
        @InjectModel('Business') private readonly businessModel: Model<any>,
        @InjectModel('Rating') private readonly ratingModel: Model<any>,
        @InjectModel('Categories') private readonly categoryModel: Model<any>,
        @InjectModel('Setting') private readonly settingModel: Model<any>,
        @InjectModel('Sequence') private readonly sequenceModel: Model<any>,
        @InjectModel('DeliveryTaxSettings') private readonly deliveryModel: Model<any>,
        
        private socketService: AppGateway,
    ) {

    }
    // get all order assigned to Areaadmin
    public async getAllOrderListWhichAssigedToMiniAdmin(user:UsersDTO,language:string):Promise<CommonResponseModel>{
          
        if( user.role==='Area Admin'){
            const res=await this.orderModel.find({assignedToAreaAdmin:user._id}).populate('cart').populate('product').populate('deliveryAddress').populate('user').populate('assignedToAreaAdmin','firstName').populate('assignedTo','firstName').sort('-createdAt');
           
        return{
        
                response_code: HttpStatus.OK,
                response_data: res
        }
    }else{
        let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
        return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
    }
    }
    //ORDER LIST -ADMIN
    public async index(user: UsersDTO,query:any, page: number, limit: number,language:string): Promise<CommonResponseModel> {
        try{
            console.log("order query",query)
            if (user.role === 'Admin' || user.role === 'Manager') {
                let filterQuery={}
                if(query.status!=="All"){
                    filterQuery["orderStatus"]=query.status
                }if(user.role === 'Manager'){
                    filterQuery["location"]= user.locationId
                }
                const order = await this.orderModel.find(filterQuery).populate('location','locationName').populate('assignedToAreaAdmin','firstName').populate('user','firstName').limit(limit).skip((page * limit) - limit).sort('-createdAt');
                const total = await this.orderModel.countDocuments(filterQuery);
                return { response_code: HttpStatus.OK, response_data: { data:order, total } };
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // ORDER DETAILS -ADMIN
    public async orderDetails(user: UsersDTO,orderId: string,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager'|| user.role==='Area Admin') {
                const order = await this.orderModel.findById(orderId).populate('location','locationName').populate('assignedTo','firstName').populate('user','firstName email mobileNumber').populate('cart').populate('deliveryAddress');
                return { response_code: HttpStatus.OK, response_data: order};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // USER ORDER DETAILS
    public async getOrderDetails(user: UsersDTO,orderId: string, language: string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'User') {
                const orderInfo = await this.orderModel.findById(orderId).populate('location','locationName').populate('cart');
                return { response_code: HttpStatus.OK, response_data: orderInfo };
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }

    // USER HISTORY
    public async orderUserHitory(user: UsersDTO, language: string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'User') {
                const res = await this.orderModel.find({ user: user._id }).sort('-createdAt').populate('cart');
                return {response_code: HttpStatus.OK,response_data: res};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
        
    }
    public async verify(cart, products): Promise<any> {
        let cartArr = [], productArr = []
        for (let cartItem of cart.cart) {
            const productIndex = await products.findIndex(val => val._id.toString() == cartItem.productId.toString());
            if (productIndex === -1) {

            } else {
                if (products[productIndex].variant.length) {
                    if (products[productIndex].status == 0) {

                        cartArr.push(cartItem)
                    } else {
                        const varientIndex = await products[productIndex].variant.findIndex(val => val.unit == cartItem.unit);
                        if (varientIndex === -1) {

                        } else {
                            if (products[productIndex].variant[varientIndex].enable && products[productIndex].variant[varientIndex].productstock < cartItem.quantity) {
                                cartArr.push(cartItem)

                            } else {
                                products[productIndex].variant[varientIndex].productstock = products[productIndex].variant[varientIndex].productstock - cartItem.quantity;
                                productArr.push(products[productIndex])
                            }
                        }
                    }
                } else {

                }
            }
        }
        return { cartArr, productArr }
    }
    public async sendPushNotification(playerId,language,status,orderID): Promise<any> {
        console.log("CONVERTED LANGUAGE RESP",playerId,language,status,orderID)

        let msgData=await this.utilsService.pushResMsg(language,status)
        console.log("CONVERTED LANGUAGE RESP",msgData)
        if(msgData){
            let newMsg=`${msgData.text} #${orderID}, ${msgData.msg}`
            await GeneralService.orderPushNotification(playerId, newMsg, msgData.title);
        }
    }
    public async cartVerify(user: UsersDTO, order: OrdersDTO, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role !== 'User') {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            } else {
                const deliverySetting = await this.deliveryModel.findOne({}, 'minimumOrderAmountToPlaceOrder');
                if (deliverySetting && order.subTotal < deliverySetting.minimumOrderAmountToPlaceOrder) {
                    let resMsg=language?await this.utilsService.sendResMsg(language,"ORDER_SUBTOTAL")?await this.utilsService.sendResMsg(language,"ORDER_SUBTOTAL"):"Order Subtotal must be greater tha":'Order Subtotal must be greater tha'
                    return { response_code: HttpStatus.BAD_REQUEST, response_data: `${resMsg }` + deliverySetting.minimumOrderAmountToPlaceOrder };
                }
                if (order.paymentType === 'CARD' && !order.transactionDetails) {
                    let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                    return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
                } if (order.deliveryType === DeliveryType.Home_Delivery) {
                    if (!order.deliveryDate) {
                        let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                        return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
                    } else if (!order.deliveryTime) {
                        let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                        return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
                    }
                }
                const cartInfo = await this.cartModel.findById(order.cart) as CartDataModel;
                if (cartInfo.isOrderLinked) {
                    return { response_code: HttpStatus.BAD_REQUEST, response_data: 'Order is already placed for this cart items' };
                }
                let products, cartVerifyData;
                if (cartInfo && cartInfo.products) {
                    products = await this.productModel.find({ _id: { $in: cartInfo.products } });
                    cartVerifyData = await this.verify(cartInfo, products);
                    if (cartVerifyData && cartVerifyData.cartArr.length) {
                        let resMsg=language?await this.utilsService.sendResMsg(language,"ORDER_OUT_OF_STOCK")?await this.utilsService.sendResMsg(language,"ORDER_OUT_OF_STOCK"):"Out of stock":'Out of stock'
                        return { response_code: 403, response_data: { cartVerifyData, message:resMsg } }
                    }
                }
                order.deliveryCharges = cartInfo.deliveryCharges;
                order.subTotal = cartInfo.subTotal;
                order.tax = cartInfo.tax;
                order.appTimestamp = Date.now();
                order.grandTotal = cartInfo.grandTotal;
                order.user = user._id;
                order.orderStatus = 'Pending';
                if (order.paymentType === 'CARD') {
                    let setting = await this.settingModel.findOne({}, 'currencyName');
                    let total = order.grandTotal * 100;
                    if (order.orderBy == "web app") {
                        const charge = await stripe.charges.create({
                            amount: total,
                            currency: setting && setting.currencyName ? setting.currencyName : "USD",
                            description: 'Payment by web app',
                            source: order.transactionDetails.paymentMethodId,
                        });
                        if (charge && charge.status == "succeeded") {
                            order.transactionDetails.transactionStatus = charge.status;
                            order.transactionDetails.receiptUrl = charge.receipt_url;
                            order.transactionDetails.transactionId = charge.id;
                            order.transactionDetails.currency = charge.currency;
                        } else {
                            let resMsg=language?await this.utilsService.sendResMsg(language,"ORDER_PAYMENT_ERR")?await this.utilsService.sendResMsg(language,"ORDER_PAYMENT_ERR"):"Something went wrong with payment retry":'Something went wrong with payment retry'
                            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
                        }
                    } else {
                        let paymentIntent = await stripe.paymentIntents.create({
                            amount: total,
                            currency: setting && setting.currencyName ? setting.currencyName : "USD",
                            payment_method: order.transactionDetails.paymentMethodId,
                            capture_method: "manual",
                            confirm: true
                        });

                        if (paymentIntent && paymentIntent.id && paymentIntent.status == "requires_capture") {
                            let capturedPay = await stripe.paymentIntents.capture(paymentIntent.id, { amount_to_capture: total });
                            if (capturedPay && capturedPay.status == "succeeded") {
                                order.transactionDetails.transactionStatus = capturedPay.status;
                                order.transactionDetails.receiptUrl = capturedPay.charges.data[0].receipt_url;
                                order.transactionDetails.transactionId = capturedPay.charges.data[0].id;
                                order.transactionDetails.currency = capturedPay.currency;
                            } else {
                                let resMsg=language?await this.utilsService.sendResMsg(language,"ORDER_PAYMENT_ERR")?await this.utilsService.sendResMsg(language,"ORDER_PAYMENT_ERR"):"Something went wrong with payment retry":'Something went wrong with payment retry'
                                return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
                            }
                        } else {
                            let resMsg=language?await this.utilsService.sendResMsg(language,"ORDER_PAYMENT_ERR")?await this.utilsService.sendResMsg(language,"ORDER_PAYMENT_ERR"):"Something went wrong with payment retry":'Something went wrong with payment retry'
                            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
                        }
                    }
                } else {
                    order.transactionDetails = null;
                }
                let sequence = await this.sequenceModel.findOneAndUpdate({ "sequenceType": "order" }, { $inc: { sequenceNo: 1 } }, { new: true })
                order.orderID = sequence ? sequence.sequenceNo : Math.floor(900000 * Math.random()) + 100000;
                const orderRes = await this.orderModel.create(order);
                if (orderRes) {
                    if (cartVerifyData && cartVerifyData.productArr.length) {
                        for (let prods of cartVerifyData.productArr) {
                            await this.productModel.findByIdAndUpdate(prods._id, prods, { new: true })
                        }
                    }
                    const userData = await this.userModel.findById(order.user);
                    const notificationData: NotificationsModel = { title: 'Order Confirmation', ORDERID: orderRes.orderID, description: 'You have successfully placed the order. Thank you for shopping.', user: user._id, order: orderRes._id,location: orderRes.location  };
                    const notificationRes = await this.notificationModel.create(notificationData);
                    this.socketService.sendNewOrderNotification({ _id: notificationRes._id, order: notificationRes.order, ORDERID: notificationRes.ORDERID,location: notificationRes.location});
                    await this.cartModel.findByIdAndUpdate(order.cart, { isOrderLinked: true, grandTotal: order.grandTotal, deliveryCharges: order.deliveryCharges });
                    if (userData.playerId) {
                        this.sendPushNotification(userData.playerId,userData.language,orderRes.orderStatus,orderRes.orderID)
                    }
                }
                let resMsg=language?await this.utilsService.sendResMsg(language,"ORDER_SAVED")?await this.utilsService.sendResMsg(language,"ORDER_SAVED"):"Order placed successfully":'Order placed successfully'
                return { response_code: HttpStatus.CREATED, response_data: resMsg };

            }
        } catch (e) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
    }

    // ORDER STATUS UPDATE ADMIN
    public async updateOrderStatusByAdmin(user: UsersDTO, orderData: OrderStatusDTO, language: string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager'|| user.role === 'Area Admin') {
                const orderInfo = await this.orderModel.findById(orderData.orderId).populate('deliveryAddress', 'address').populate('user', 'firstName email language mobileNumber playerId').populate('cart', 'cart couponInfo');
                if (orderInfo) {
                    orderInfo.orderStatus = orderData.status;
                    const orderRes = await this.orderModel.findByIdAndUpdate(orderData.orderId, { orderStatus: orderInfo.orderStatus },{new:true});
                    if (orderInfo.user) {
                        // send Invoice
                        if (orderInfo.orderStatus == 'DELIVERED' && orderInfo.user['email']) {
                            this.sendInvoice(orderInfo).then(function (data) { console.log("LAST CALL BACK") })
                        }
                        //push notificatin one signal
                        if (orderInfo.user['playerId']) {
                            this.sendPushNotification(orderInfo.user['playerId'],orderInfo.user['language'],orderRes.orderStatus,orderRes.orderID)
                        }
                    }
                    let resMsg = language ? await this.utilsService.sendResMsg(language, "ORDER_UPDATE") ? await this.utilsService.sendResMsg(language, "ORDER_UPDATE") : "Order updated successfully" : 'Order updated successfully'
                    return { response_code: HttpStatus.OK, response_data: resMsg};
                } else {
                    let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                    return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
                }
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }

    // ORDER ASSIGNED ORDER -ADMIN
    public async assignOrder(user: UsersDTO, data: AssignOrderDTO, language: string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Manager' || user.role === 'Area Admin') {
                const orderInfo: OrdersDTO = await this.orderModel.findById(data.orderId);
                if (orderInfo) {
                    orderInfo.orderAssignedToDeliveryBoy = true;
                    orderInfo.isAcceptedByDeliveryBoy = false;
                    orderInfo.assignedTo = data.deliveryBoy;
                    try {
                        await this.orderModel.findByIdAndUpdate(data.orderId, orderInfo,{new:true});
                        const orderData = await this.orderModel.findById(data.orderId).populate('cart').populate('product').populate('deliveryAddress').populate('user').populate('deliveryAddress').populate('assignedTo','firstName');
                       // console.log("oooooooooooooooooo",orderData)
                        this.socketService.emitAssignedOrders(data.deliveryBoy, orderData);
                        if(orderData.assignedTo && orderData.assignedTo.playerId){
                            this.sendPushNotification(orderData.assignedTo.playerId,orderData.assignedTo.language,"Delivry Boy Order Assigned",orderData.orderID)
                        }
                        let resMsg = language ? await this.utilsService.sendResMsg(language, "ORDER_ASSIGNED") ? await this.utilsService.sendResMsg(language, "ORDER_ASSIGNED") : "Order assigned successfully" : 'Order assigned successfully'
                        return { response_code: HttpStatus.OK, response_data: resMsg };
                    } catch (e) {
                        let resMsg = language ? await this.utilsService.sendResMsg(language, "SOMETHING_WRONG") ? await this.utilsService.sendResMsg(language, "SOMETHING_WRONG") : "Something went wrong , please try again" : 'Something went wrong , please try again'
                        return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
                    }
                }
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
        
    }
    // order Assigned to Area- admin
     public async assignOrderToAreaAdmin(user: UsersDTO, data: AssignOrderDTO, language: string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const orderInfo: OrdersDTO = await this.orderModel.findById(data.orderId);
                if (orderInfo) {
                    orderInfo.orderAssigned = true;
                    orderInfo.isAcceptedByDeliveryBoy = false;
                    orderInfo.assignedToAreaAdmin = data.deliveryBoy;
                    try {
                        await this.orderModel.findByIdAndUpdate(data.orderId, orderInfo,{new:true});
                        const orderData = await this.orderModel.findById(data.orderId).populate('cart').populate('product').populate('deliveryAddress').populate('user').populate('assignedToAreaAdmin','firstName')
                        // console.log("7777777777777777777777777",orderData)
                        this.socketService.emitAssignedOrders(data.deliveryBoy, orderData);
                        if(orderData.assignedToAreaAdmin && orderData.assignedToAreaAdmin.playerId){
                            this.sendPushNotification(orderData.assignedToAreaAdmin.playerId,orderData.assignedToAreaAdmin.language,"Assigned To Area Admin",orderData.orderID)
                        }
                        let resMsg = language ? await this.utilsService.sendResMsg(language, "ORDER_ASSIGNED") ? await this.utilsService.sendResMsg(language, "ORDER_ASSIGNED") : "Order assigned successfully" : 'Order assigned successfully'
                        return { response_code: HttpStatus.OK, response_data: resMsg };
                    } catch (e) {
                        let resMsg = language ? await this.utilsService.sendResMsg(language, "SOMETHING_WRONG") ? await this.utilsService.sendResMsg(language, "SOMETHING_WRONG") : "Something went wrong , please try again" : 'Something went wrong , please try again'
                        return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
                    }
                }
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
        
    }

    
    // get's graph data
    public async getOrderEarnings(language: string): Promise<CommonResponseModel> {
        try {
            let date = new Date();
            let thisMidnight = date.setHours(0, 0, 0, 0);
            let lastSevenDaysMidnight = thisMidnight - 6 * 24 * 60 * 60 * 1000;
            let lastsSevenDaysMidnight = new Date(lastSevenDaysMidnight);
            const ressult = await this.orderModel.aggregate([
                { $match: { orderStatus: 'DELIVERED', createdAt: { $gt: lastsSevenDaysMidnight, $lt: new Date() } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            date: { $dayOfMonth: '$createdAt' }
                        },
                        data: { $sum: '$grandTotal' }
                    }
                }
            ]);

            const res = await GeneralService.graphDataModification(new Date(), ressult);
            let graphData = {
                'barData': {
                    'labels': res.dateArr,
                    'datasets': [{
                        'data': res.totalArr
                    }]
                }
            };
            const orderCounTotal = await this.orderModel.aggregate([
                { $match: { orderStatus: 'DELIVERED' } },
                { $group: { _id: {}, data: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
            ]);
            let totalOrders = 0, totalEarnings = 0;
            if (orderCounTotal && orderCounTotal.length) {
                totalOrders = orderCounTotal[0].count;
                totalEarnings = orderCounTotal[0].data;
            }
            const totalProducts: number = await this.productModel.countDocuments();
            const totalCategories: number = await this.categoryModel.countDocuments();
            return { response_code: HttpStatus.OK, response_data: { graphData, counts: { totalProducts, totalCategories, totalOrders, totalEarnings } } };
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "SOMETHING_WRONG") ? await this.utilsService.sendResMsg(language, "SOMETHING_WRONG") : "Something went wrong , please try again" : 'Something went wrong , please try again'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
        }
    }

    
    public async  pageCreation(count) {
        let limit = 1000, arr = [];
        let noOfPage = Math.ceil(count / limit);
        for (let i = 1; i <= noOfPage; i++) {
            let p = (Number(i) - 1) * limit;
            arr.push({ skip: p, limit: limit })
        }
        return arr
    }
    // json to xls and upload
    async jsonToXls(json, fileName) {
        var xls = json2xls(json);
        await fs.writeFileSync(fileName, xls, 'binary');
        let path = appRoot.path + "/" + fileName;

        let base64 = await fs.readFileSync(path, { encoding: 'base64' });
        let uploadRes = await this.utilsService.xlsUploadToImageKit(base64, fileName);
        await fs.unlinkSync(path);

        return uploadRes
    }
    // data Manupulation
    public async dataManupulation(data) {
        let newArr = [];
        for (let item of data) {
            let obj = {
                ORDER_ID: item.orderID,
                LOCATION_NAME:item.location?item.location["locationName"]:null,
                NAME: item.user ? item.user.firstName : null,
                EMAIL: item.user ? item.user.email : null,
                ORDER_STATUS: item.orderStatus,
                DELIVERY_TYPE: item.deliveryType,
                PAYMENT_TYPE: item.paymentType,
                TOTAL_ITEM: item.cart ? item.cart.products.length : null,
                DELIVERY_DATE: item.deliveryDate,
                SUB_TOTAL: item.subTotal,
                TAX: item.tax,
                DELIVERY_CHARGES: item.deliveryCharges,
                COUPON: item.cart.couponInfo ? item.cart.couponInfo.couponDiscountAmount : 0,
                GRAND_TOTAL: item.grandTotal,
                DELIVERED_BY: item.assignedTo ? item.assignedTo.firstName : null
            }
            newArr.push(obj)
        }
        return newArr;
    }
    // data fetch
    public async dataFetch(pageArr,query , id) {
        let mergeArr = [];
        for (let item of pageArr) {
            const data = await this.orderModel.find(query, 'orderStatus orderID deliveryType paymentType deliveryDate subTotal tax deliveryCharges grandTotal').populate('user', 'firstName email').populate('cart', 'products couponInfo').populate('location','locationName').populate('assignedTo', 'firstName').skip(Number(item.skip)).limit(Number(item.limit)).sort("-createdAt");
            mergeArr.push(...data)
        }
        let formateData = await this.dataManupulation(mergeArr)
        let fileName = "order_data_export.xlsx"
        let fileRes = await this.jsonToXls(formateData, fileName)
        let obj = { url: fileRes.url, status: "Completed", publicId: fileRes.key }
        await this.userModel.findByIdAndUpdate(id, { exportedFile: obj }, { new: true });
        return true;
    }
    // data export
    public async orderExport(user: UsersDTO, startEndDTO: StartEndDTO, language: string): Promise<CommonResponseModel> {
        let startDate = new Date(startEndDTO.startDate);
        let endDate = new Date(startEndDTO.endDate);
        startDate.setHours(0, 0, 0, 999)
        endDate.setHours(23, 59, 59, 999)
        if (user.role === 'Admin' || user.role === 'Manager') {
            let query = { createdAt: { $gt: startDate, $lt: endDate } };
            if(user.role === 'Manager'){
                query["location"]= user.locationId
            }
            const count = await this.orderModel.countDocuments(query);
            let pageArr = await this.pageCreation(count)
            if (pageArr && pageArr.length) {
                this.dataFetch(pageArr, query,user._id).then(function (d) { console.log("Data fetched") })
            }
            let obj = { url: null, status: "Processing", publicId: null }
            await this.userModel.findByIdAndUpdate(user._id, { exportedFile: obj }, { new: true });
            return {
                response_code: HttpStatus.OK,
                response_data: obj
            }
        } else {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
            return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
        }
    }
    // data export
    public async getExportFile(user: UsersDTO, language: string): Promise<CommonResponseModel> {
        if (user.role === 'Admin' || user.role === 'Manager') {
            const userInfo = await this.userModel.findById(user._id, 'exportedFile');
            return {response_code: HttpStatus.OK,response_data: userInfo}
        } else {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
            return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
        }
    }
    public async orderExportDelete(user: UsersDTO, deleteKey: string, language: string): Promise<CommonResponseModel> {
        if (user.role === 'Admin' || user.role === 'Manager') {
            await this.utilsService.deleteUplodedFile(deleteKey)
            let obj = { url: null, status: "Pending", publicId: null }
            await this.userModel.findByIdAndUpdate(user._id, { exportedFile: obj }, { new: true });
            return {response_code: HttpStatus.OK,response_data: obj}
        } else {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
            return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
        }
    }
    // invoice download
    public async invoiceDownload(res, id, language: string): Promise<CommonResponseModel> {
        const order = await this.orderModel.findById(id).populate('deliveryAddress', 'address').populate('user', 'firstName email mobileNumber').populate('cart', 'cart couponInfo');
        const settingInfo = await this.settingModel.findOne({}, 'currencyCode');
        const businessInfo = await this.businessModel.findOne({}, 'address email phoneNumber storeName webApp iconLogo');
        return res.sendFile(await this.utilsService.invoicePdfGenerate(order, businessInfo, settingInfo ? settingInfo.currencyCode : "$"));
    }
    // send invoice and mail
    public async sendInvoice(order): Promise<CommonResponseModel> {
        const businessInfo = await this.businessModel.findOne({}, 'address email phoneNumber storeName webApp iconLogo');
        const settingInfo = await this.settingModel.findOne({}, 'currencyCode');
        let res = await this.utilsService.sendOrderMail(order, businessInfo, settingInfo ? settingInfo.currencyCode : "$")
        return {
            response_code: HttpStatus.OK,
            response_data: res
        }
    }

    //ODER CANCELL BY USER
    public async cancelOrder(user: UsersDTO, orderData: OrderStatusDTO, language: string): Promise<CommonResponseModel> {
    try{
        if (user.role === 'User') {
            const orderInfo = await this.orderModel.findById(orderData.orderId).populate('deliveryAddress', 'address').populate('user', 'firstName email language mobileNumber playerId').populate('cart', 'cart couponInfo');
            if(orderInfo.orderStatus==='Order Assigned to Delivery Boy'){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "ORDER_CANCEL_NOT") ? await this.utilsService.sendResMsg(language, "ORDER_CANCEL_NOT") : "Your  assigned successfully can not be Cancel" : 'Your  assigned successfully can not be Cancel'
                        return { response_code: HttpStatus.OK, response_data: resMsg };
            }
            if (orderInfo) {
                orderInfo.orderStatus = orderData.status;
                orderInfo.orderCancelByUser=true
                const orderRes = await this.orderModel.findByIdAndUpdate(orderData.orderId, orderInfo ,{new:true});
                if (orderInfo.user) {
                    // // send Invoice
                    // if (orderInfo.orderStatus == 'DELIVERED' && orderInfo.user['email']) {
                    //     this.sendInvoice(orderInfo).then(function (data) { console.log("LAST CALL BACK") })
                    // }
                    //push notificatin one signal
                    if (orderInfo.user['playerId']) {
                        this.sendPushNotification(orderInfo.user['playerId'],orderInfo.user['language'],orderRes.orderStatus,orderRes.orderID)
                    }
                }
                let resMsg = language ? await this.utilsService.sendResMsg(language, "ORDER_UPDATE") ? await this.utilsService.sendResMsg(language, "ORDER_CANCEL") : "Your Order cancelled SuccessFully" : 'Your Order cancelled SuccessFully'
                return { response_code: HttpStatus.OK, response_data: resMsg};
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
            } 
          }
       }  
       catch (e) {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "SOMETHING_WRONG") ? await this.utilsService.sendResMsg(language, "SOMETHING_WRONG") : "Something went wrong , please try again" : 'Something went wrong , please try again'
                return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
            }
        
        }
   
}


