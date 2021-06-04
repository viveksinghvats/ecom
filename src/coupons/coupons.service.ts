import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {CommonResponseModel} from '../utils/app-service-data';
import {UsersDTO} from '../users/users.model';
import {CouponsDTO, CouponStatusDTO} from './coupons.model';
import {ProductsDTO, VariantDTO} from '../products/products.model';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class CouponsService {
    constructor(
        @InjectModel('Coupons') private readonly couponsModel: Model<any>, 
        @InjectModel('Products') private readonly productModel: Model<any>,
        private utilsService: UploadService) {

    }
    // gets coupons by pagination admin
    public async couponsListByPagination(user: UsersDTO,page: number, limit: number,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                let l = Number(limit);
                let p = (Number(page) - 1) * l;
                let query={}
                if(user.role === 'Manager'){
                    query["location"]= user.locationId
                }
                const coupons = await this.couponsModel.find(query).populate('location','locationName').limit(l).skip(p).sort('-createdAt');
                const totalCoupons = await this.couponsModel.count({});
                return {response_code: HttpStatus.OK, response_data: {coupons, totalCoupons}};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }

    public async couponInfo(user: UsersDTO,couponId: string,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const couponInfo = await this.couponsModel.findById(couponId);
                if (couponInfo) {
                    return {response_code: HttpStatus.OK, response_data: couponInfo};
                } else {
                    let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_INVALID")?await this.utilsService.sendResMsg(language,"COUPON_INVALID"):"Invalid coupon":'Invalid coupon'
                    return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
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

    // creates a new coupon admin
    public async saveCoupon(user: UsersDTO, coupon: CouponsDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const checkIfExist = await this.couponsModel.findOne({ couponCode: coupon.couponCode });
                if (checkIfExist) {
                    let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_EXIST")?await this.utilsService.sendResMsg(language,"COUPON_EXIST"):"Coupon already exist":'Coupon already exist'
                    return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
                } else {
                    const response = await this.couponsModel.create(coupon);
                    if (response._id) {
                        let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_SAVED")?await this.utilsService.sendResMsg(language,"COUPON_SAVED"):"Coupon saved successfully":'Coupon saved successfully'
                        return { response_code: HttpStatus.CREATED, response_data: resMsg};
                    } else {
                        let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                        return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
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
    // updates coupon admin
    public async updateCoupon(user: UsersDTO, couponId: string, coupon: CouponsDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const response = await this.couponsModel.findByIdAndUpdate(couponId, coupon);
                let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_UPDATE")?await this.utilsService.sendResMsg(language,"COUPON_UPDATE"):"Coupon updated successfully":'Coupon updated successfully'
                return {response_code: HttpStatus.OK,response_data: resMsg};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // deletes coupon admin
    public async deleteCoupon(user: UsersDTO, couponId: string,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const response = await this.couponsModel.findByIdAndDelete(couponId);
                let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_DELETE")?await this.utilsService.sendResMsg(language,"COUPON_DELETE"):"Coupon deleted successfully":'Coupon deleted successfully'
                return {response_code: HttpStatus.OK, response_data: resMsg};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }

    //update  in coupon admin
    public async couponStatusUpdate(user: UsersDTO,id: string, couponStatusData: CouponStatusDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                await this.couponsModel.findByIdAndUpdate(id, couponStatusData);
                let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_STATUS_UPDATE")?await this.utilsService.sendResMsg(language,"COUPON_STATUS_UPDATE"):"Coupon status updated successfully":'Coupon status updated successfully'
                return {response_code: HttpStatus.OK,response_data: resMsg};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
}
