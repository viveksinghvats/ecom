import {Injectable, HttpStatus} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {UsersDTO} from '../users/users.model';
import {BusinessDTO} from './business.model';
import {CommonResponseModel} from '../utils/app-service-data';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class BusinessService {
    constructor(
        @InjectModel('Business') private readonly businessModel: Model<any>,
        private utilsService: UploadService) {
    }

    // save business data
    public async saveBusinessdata(user: UsersDTO, businesData: BusinessDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }

        const res = await this.businessModel.create(businesData);
        // "BUSINESS_UPDATE":"Business info updated successfully",
        //     "BUSINESS_DELETE":"Business info deleted successfully",
        let resMsg=language?await this.utilsService.sendResMsg(language,"BUSINESS_SAVED")?await this.utilsService.sendResMsg(language,"BUSINESS_SAVED"):"Business info saved successfully":'Business info saved successfully'
    
        return {response_code: HttpStatus.CREATED, response_data: resMsg};
    }

    // get bussiness data
    public async getBusinessinfomation(user: UsersDTO,language:string): Promise<CommonResponseModel> {
        if (user.role == 'Admin' ||user.role == "Manager"||user.role == "Area Admin" ) {
            const resData = await this.businessModel.findOne({});
            return {response_code: HttpStatus.OK, response_data: resData}
        }else{
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
    }

    //get by id
    public async getByidBusiness(businessId: string,language:string): Promise<CommonResponseModel> {
        const res = await this.businessModel.findById(businessId);
        return {
            response_code: HttpStatus.OK,
            response_data: res
        };
    }

    //edit businessInfo
    public async editBusinessInfo(businessId: string, businesData: BusinessDTO,language:string): Promise<CommonResponseModel> {
        const res = await this.businessModel.findByIdAndUpdate(businessId, businesData);
        let resMsg=language?await this.utilsService.sendResMsg(language,"BUSINESS_UPDATE")?await this.utilsService.sendResMsg(language,"BUSINESS_UPDATE"):"Business info updated successfully":'Business info updated successfully'
        return {
            response_code: HttpStatus.OK,
            response_data: resMsg
        };
    }

    // detele by business Id
    public async deleteBusinessAccount(businessId: string,language:string): Promise<CommonResponseModel> {
        const res = await this.businessModel.findByIdAndDelete(businessId);
        let resMsg=language?await this.utilsService.sendResMsg(language,"BUSINESS_DELETE")?await this.utilsService.sendResMsg(language,"BUSINESS_DELETE"):"Business info deleted successfully":'Business info deleted successfully'
        return {
            response_code: HttpStatus.OK,
            response_data: resMsg
        };
    }
    
    // get bussiness data for user
    public async getBussinessInfomation(language:string):Promise<CommonResponseModel>{
        const res=await this.businessModel.find({});{
            return{
                response_code:HttpStatus.OK,
                response_data:res
            }
        }
    }
        
}
