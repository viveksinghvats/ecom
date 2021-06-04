import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {UsersDTO} from '../users/users.model';
import {CommonResponseModel} from '../utils/app-service-data';
import {DeliveryTaxDTO, DeliveryTypeEnum, UserLocationDTO} from './delivery-tax.model';
import {UploadService} from '../upload/upload.service';
import {CartDataModel} from '../cart/cart.model';

@Injectable()
export class DeliveryTaxService {
    constructor(
        @InjectModel('DeliveryTaxSettings') private readonly deliveryModel: Model<any>, 
        @InjectModel('Locations') private readonly locationModel: Model<any>,

        private utilsService: UploadService,
        @InjectModel('Cart') private readonly cartModel: Model<any>) {
    }

    // get's store's settings
    public async getStoreDeliverySettings(user: UsersDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};        
        }
        const deliveryTaxData = await this.deliveryModel.findOne({store: user._id});
        return {response_code: !deliveryTaxData ? HttpStatus.BAD_REQUEST : HttpStatus.OK, response_data: deliveryTaxData};
    }

    // for user
    public async taxSettingInfo(language:string): Promise<CommonResponseModel> {
        const deliveryTaxData = await this.deliveryModel.findOne({},'minimumOrderAmountToPlaceOrder');
        return {response_code: HttpStatus.OK, response_data: deliveryTaxData};
    }

    // get's admin delivery settings
    public async getAdminDeliverySettings(language:string): Promise<CommonResponseModel> {
        const deliveryTaxData = await this.deliveryModel.find();
        return {response_code: !deliveryTaxData ? HttpStatus.BAD_REQUEST : HttpStatus.OK, response_data: deliveryTaxData[0]};
    }
    // saves/updates store's delivery and tax settings
    public async saveDeliveryTaxSettings(user: UsersDTO, deliveryData: DeliveryTaxDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
        if (!deliveryData._id) {
            const res = await this.deliveryModel.create(deliveryData);
            if (res._id) {
                let resMsg=language?await this.utilsService.sendResMsg(language,"TAX_SAVED")?await this.utilsService.sendResMsg(language,"TAX_SAVED"):"Tax saved successfully":'Tax saved successfully'
                return {response_code: HttpStatus.OK, response_data: resMsg};
            }
        } else {
            const res = await this.deliveryModel.findByIdAndUpdate(deliveryData._id, deliveryData);
            let resMsg=language?await this.utilsService.sendResMsg(language,"TAX_UPDATE")?await this.utilsService.sendResMsg(language,"TAX_UPDATE"):"Tax updated successfully":'Tax updated successfully'
            return {response_code: HttpStatus.OK, response_data: resMsg};
        }
    }
    private taxCalculation(cart,deliveryAndTaxSetting) {
        let tax=Number((cart.subTotal*deliveryAndTaxSetting.taxAmount/100).toFixed(2));
        console.log("taxxxxxxxxxxxxx",tax)
        return tax;
    }
    // calculate distance between user location and store location  ObjectId("5e4e17bedba62e1b4886721a")
    public async calculateDistance(user: UsersDTO, userLocation: UserLocationDTO,language:string): Promise<CommonResponseModel> {
        if (user.role === 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
        const list = await this.deliveryModel.find();
        let storeDeliverySettings: DeliveryTaxDTO = list[0];
        let temp=0
        let cartInfo: CartDataModel = await this.cartModel.findById(userLocation.cartId);
        if(cartInfo && cartInfo.couponInfo && cartInfo.couponInfo["couponDiscountAmount"]){
            console.log("cartInfo.couponInfo",cartInfo.couponInfo["couponDiscountAmount"])
            temp= cartInfo.couponInfo["couponDiscountAmount"];
        }
        cartInfo.deliveryAddress=userLocation["deliveryAddress"]
        if (storeDeliverySettings.deliveryType === DeliveryTypeEnum.flexible) {
            let location=await this.locationModel.findById(cartInfo.location,'location');
            if(location && location.location && location.location.coordinates && location.location.coordinates.length){
                const adminLocation= {latitude: location.location.coordinates[1], longitude: location.location.coordinates[0]};
                const preciseDistance = this.utilsService.calculateDistance(adminLocation, userLocation);
                let deliveryCharges = Number((storeDeliverySettings.deliveryChargePerKm * preciseDistance).toFixed(2)); 
                if(storeDeliverySettings.minimumOrderAmount && cartInfo.subTotal>=storeDeliverySettings.minimumOrderAmount){
                    deliveryCharges = 0
                }
                cartInfo.deliveryCharges = Number(deliveryCharges);
                cartInfo.tax =this.taxCalculation(cartInfo,storeDeliverySettings);
                cartInfo.taxInfo={taxName:storeDeliverySettings["taxName"]?storeDeliverySettings["taxName"]:"GST",amount:storeDeliverySettings.taxAmount}
                cartInfo.grandTotal = cartInfo.subTotal + cartInfo.tax + deliveryCharges-temp;
                cartInfo.grandTotal = Number((cartInfo.grandTotal).toFixed(2));
                let updated=await this.cartModel.findByIdAndUpdate(userLocation.cartId, cartInfo,{new:true});
                const chargesObj = Object.assign({tax: storeDeliverySettings.taxAmount, deliveryCharges, distance: preciseDistance});
                return {response_code: HttpStatus.OK, response_data: {deliveryDetails: chargesObj, cartData: updated}};
                }
        } else {
            cartInfo.tax =this.taxCalculation(cartInfo,storeDeliverySettings);
            cartInfo.taxInfo={taxName:storeDeliverySettings["taxName"]?storeDeliverySettings["taxName"]:"GST",amount:storeDeliverySettings.taxAmount}
            if(storeDeliverySettings.minimumOrderAmount && cartInfo.subTotal>=storeDeliverySettings.minimumOrderAmount){
                storeDeliverySettings.fixedDeliveryCharges=0;
            }
            const chargesObj = Object.assign({tax: cartInfo.tax, deliveryCharges: storeDeliverySettings.fixedDeliveryCharges});
            cartInfo.deliveryCharges = Number((storeDeliverySettings.fixedDeliveryCharges).toFixed(2));
            cartInfo.grandTotal = Number((cartInfo.subTotal + cartInfo.tax + storeDeliverySettings.fixedDeliveryCharges-temp).toFixed(2));
            let updated=await this.cartModel.findByIdAndUpdate(userLocation.cartId, cartInfo,{new:true});
            return {response_code: HttpStatus.OK, response_data: {deliveryDetails: chargesObj, cartData: updated}};
        }
    }
}
