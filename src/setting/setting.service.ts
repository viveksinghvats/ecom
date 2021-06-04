import {Injectable, HttpStatus} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {UsersDTO} from '../users/users.model';
import {SettingDTO, SettingPinCodeDTO, SettingWorkingHoursDTO, SettingCurrencyDTO,SettingCurrencyAndLanguageDTO, loyaltySettingDTO} from './setting.model';
import {CommonResponseModel} from '../utils/app-service-data';
import {json} from 'express';
import { UploadService } from '../upload/upload.service';

const GeneralService = require('../utils/general-service');

//import {General} from '../utils/general-service'

@Injectable()
export class SettingService {
    constructor(
        @InjectModel('Setting') private readonly settingModel: Model<any>,
        private utilsService: UploadService) {
    }

    // // **************PINCODE*************
    // //add pin code NOT USED
    // public async savePinCode(user: UsersDTO, settingPinCodeDTO: SettingPinCodeDTO,language:string): Promise<CommonResponseModel> {
    //     let pincode = settingPinCodeDTO.pincode;
    //     if (user && user.role == 'Admin') {
    //         let setting = await this.settingModel.findOne({});
    //         if (setting) {
    //             if (setting.pincode && setting.pincode.length) {
    //                 if (setting.pincode.indexOf(pincode) == -1) {
    //                     setting.pincode.push(pincode);
    //                     await setting.save();
    //                     return {response_code: HttpStatus.CREATED, response_data: 'PinCode saved successfully'};
    //                 } else {
    //                     return {response_code: 400, response_data: 'PinCode already exist.'};
    //                 }
    //             } else {
    //                 setting.pincode = [pincode];
    //                 await setting.save();
    //                 return {response_code: HttpStatus.CREATED, response_data: 'PinCode saved successfully'};
    //             }
    //         } else {
    //             const setting = await this.settingModel.create({pincode: [pincode]});
    //             return {response_code: HttpStatus.CREATED, response_data: 'PinCode saved successfully'};
    //         }
    //     } else {
    //         return {response_code: HttpStatus.UNAUTHORIZED, response_data: 'You are not allowed to create PinCode'};
    //     }
    // }

    // //get all the PinCode NOT USED
    // public async getPincode(language:string): Promise<CommonResponseModel> {
    //     const res = await this.settingModel.findOne({}, 'pincode');

    //     if (res && res.pincode && res.pincode.length) {
    //         let obj = res.toJSON();
    //         return {response_code: HttpStatus.OK, response_data: obj};
    //     } else {
    //         return {response_code: 400, response_data: {pincode: []}};
    //     }
    // }

    // //delete pin code NOT USED
    // public async deletePinCode(pincode: string,language:string): Promise<CommonResponseModel> {
    //     const setting = await this.settingModel.findOne({}, 'pincode');
    //     if (setting && setting.pincode.length) {
    //         let index = setting.pincode.indexOf(pincode);
    //         if (index > -1) {
    //             setting.pincode.splice(index, 1);
    //             await setting.save();
    //         }
    //         return {response_code: 200, response_data: 'PinCode deleted successfully'};
    //     } else {
    //         return {response_code: 400, response_data: 'No pincode exist'};
    //     }
    // }

    //*******WORKING HRS*********** */
    //save working hours
    public async saveWorkingHrs(user: UsersDTO, settingWorkingHoursDTO: SettingWorkingHoursDTO,language:string): Promise<CommonResponseModel> {
        if (user && user.role == 'Admin') {
            let setting = await this.settingModel.findOne({}, 'workingHours');
            if (setting) {
                setting.workingHours = settingWorkingHoursDTO.workingHours;
                await setting.save();
                let resMsg=language?await this.utilsService.sendResMsg(language,"SETTING_WORKING_HOURS_SAVED")?await this.utilsService.sendResMsg(language,"SETTING_WORKING_HOURS_SAVED"):"Working hours saved successfully":'Working hours saved successfully'
                return {response_code: HttpStatus.CREATED, response_data: resMsg};
            } else {
                await this.settingModel.create({workingHours: settingWorkingHoursDTO.workingHours});
                let resMsg=language?await this.utilsService.sendResMsg(language,"SETTING_WORKING_HOURS_SAVED")?await this.utilsService.sendResMsg(language,"SETTING_WORKING_HOURS_SAVED"):"Working hours saved successfully":'Working hours saved successfully'
                return {response_code: HttpStatus.CREATED, response_data: resMsg};
            }
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
    }

    //get working Hrs for admin
    public async getWorkingTime(language:string): Promise<CommonResponseModel> {
        const res = await this.settingModel.findOne({}, 'workingHours');
        if (res && res.workingHours && res.workingHours.length) {
            return {response_code: HttpStatus.OK, response_data: res};
        } else {
            return {response_code: 400, response_data: {workingHours: []}};
        }
    }

    //get working Hrs for user
    public async getDeliveryTimeUser(time:string,timestamp:number,language:string): Promise<CommonResponseModel> {
        const res = await this.settingModel.findOne({}, 'workingHours');
        if (res && res.workingHours && res.workingHours.length) {
            let newRes = await GeneralService.workingTimeCalculation(res.workingHours,time,timestamp);
            return {response_code: HttpStatus.OK, response_data: newRes};
        } else {
            return {response_code: 400, response_data: {workingHours: []}};
        }
    }

    // **************CURRENCY*************
    
    //add CURRENCY Admin
    public async saveCurrency(user: UsersDTO,id:String, settingCurrencyAndLanguageDTO: SettingCurrencyAndLanguageDTO,language:string): Promise<CommonResponseModel> {
        if (user && user.role == 'Admin') {
            await this.settingModel.findByIdAndUpdate(id, settingCurrencyAndLanguageDTO, {new: true});
            let resMsg=language?await this.utilsService.sendResMsg(language,"SETTING_CURRENCY_LANGUAGE_UPDATE")?await this.utilsService.sendResMsg(language,"SETTING_CURRENCY_LANGUAGE_UPDATE"):"Currency And language updated successfully":'Currency And language updated successfully'
            return {response_code: HttpStatus.CREATED, response_data: resMsg};
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
    }
    //CURRENCY DETAILS ADMIN OR MANAGER
    public async getCurrencyAndLanguage(user: UsersDTO,language:string): Promise<CommonResponseModel> {
        if (user.role == 'Admin' || user.role == 'Manager') {
            const res = await this.settingModel.findOne({}, 'currencyCode currencyName');
            return {response_code: HttpStatus.OK, response_data: res};
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
    }
    //CURRENCY LIST FOR ADMIN TO UPDATE
    public async getCurrencyAndLanguageList(user: UsersDTO,language:string): Promise<CommonResponseModel> {
        if (user && user.role == 'Admin') {
            const res = await this.settingModel.findOne({}, 'currencyList');
            return {response_code: HttpStatus.OK, response_data: res};
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
    }
    // CURRENCY DETAIL FOR ADMIN
    public async getCurrency(user: UsersDTO,language:string): Promise<CommonResponseModel> {
        if(user.role==='Admin'){
            const res = await this.settingModel.findOne({}, 'languageCode currencyCode');
            if (res) {
                return {response_code: HttpStatus.OK, response_data: res};
            } else {
                return {response_code: 400, response_data: {pincode: []}};
            }
        } else{
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
     }
    //  // loyaltyPoint API NOT USED
    //  public async getLoyaltyPoint(language:string):Promise<CommonResponseModel>{
    //      const resData=await this.settingModel.findOne({},'loyaltySetting');
    //      return{
    //          response_code:HttpStatus.OK,
    //          response_data:resData
    //      }
    //  }
    //  //update loyalityPoint and update NOT USED
    // public async updateLoyaltyPointByAdmin(id:string,user:UsersDTO,loyaltyData:loyaltySettingDTO,language:string):Promise<CommonResponseModel>{
    //     if(user.role == 'Admin'){
    //         await this.settingModel.findByIdAndUpdate(id,loyaltyData,{new: true});
    //         return{response_code:HttpStatus.OK,response_data:"Loyalty Point update successFully"}
    //     }else{
    //         return{
    //             response_code:HttpStatus.UNAUTHORIZED,
    //             response_data:"You are not allowed  for this API"
    //         }
    //     }   
    // }
    // CURRENCY DETAIL FOR ALL 
    public async getCurrencyforUserApp(language:string): Promise<CommonResponseModel> {
        const res = await this.settingModel.findOne({}, 'currencyCode currencyName');
        if (res) {
            return {response_code: HttpStatus.OK, response_data: res};
        } else {
            return {response_code: 400, response_data: {pincode: []}};
        }
    } 
      
}
