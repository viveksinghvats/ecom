import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UploadService } from '../upload/upload.service';
import { UsersDTO } from '../users/users.model';
import { CommonResponseModel } from '../utils/app-service-data';
import { LocationsDTO, LocationStausDTO,ManagerDTO } from './locations.model';

@Injectable()
export class LocationsService {
    constructor(
        @InjectModel('Locations') private readonly locationModel: Model<any>, 
        @InjectModel('Products') private readonly productModel: Model<any>,
        @InjectModel('Users') private readonly userModel: Model<any>,

        private utilsService: UploadService) {

    }

    // LIST
    public async index(user: UsersDTO, page: number, limit: number,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role !== 'Admin') {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            const locations = await this.locationModel.find({}).populate('managerId','firstName').limit(limit).skip((page * limit) - limit).sort('createdAt');
            const total = await this.locationModel.countDocuments();
            return { response_code: HttpStatus.OK, response_data: { locations, total } };
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: e.message}; 
        }
    }

    
    // SHOW
    public async show(user: UsersDTO, id: string,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role !== 'Admin') {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            const locations = await this.locationModel.findById(id,{});
            return { response_code: HttpStatus.OK, response_data: locations };
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // CREATE
    public async create(user: UsersDTO, location: LocationsDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin') {
                location.adminId = user._id
                await this.locationModel.create(location);
                let resMsg=language?await this.utilsService.sendResMsg(language,"LOCATION_SAVED")?await this.utilsService.sendResMsg(language,"LOCATION_SAVED"):"Location saved successfully":'Location saved successfully'
                return { response_code: HttpStatus.CREATED, response_data: resMsg };
            }
            else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // UPDATE
    public async upsert(user: UsersDTO,id:string, locationData: LocationsDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin') {
                await this.locationModel.findByIdAndUpdate(id, locationData,{new:true});
                let resMsg=language?await this.utilsService.sendResMsg(language,"LOCATION_UPDATED")?await this.utilsService.sendResMsg(language,"LOCATION_UPDATED"):"Location updated successfully":'Location updated successfully'
                return { response_code: HttpStatus.CREATED, response_data: resMsg };
            }
            else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // STATUS UPDATE
    public async statusUpdate(user: UsersDTO, id: string, locaationStatusData: LocationStausDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin') {
                if(locaationStatusData.status){
                    let location=await this.locationModel.findById(id, 'managerId');
                    if(location && location.managerId && location.managerId.length==0){
                        let resMsg=language?await this.utilsService.sendResMsg(language,"MANAGER_NOT_FOUND_LOCATION")?await this.utilsService.sendResMsg(language,"MANAGER_NOT_FOUND_LOCATION"):"First add manager to this location":"First add manager to this location"
                        return { response_code:400, response_data: resMsg }; 
                    }
                    let productExist=await this.productModel.countDocuments({status:1});
                    if(!productExist){
                        let resMsg=language?await this.utilsService.sendResMsg(language,"LOCATION_PRODUCT_NOT_EXIST")?await this.utilsService.sendResMsg(language,"LOCATION_PRODUCT_NOT_EXIST"):"You can't enable this location, there must be one enable product":"You can't enable this location, there must be one enable product"
                        return { response_code:400, response_data: resMsg };
                    }
                }
                await this.locationModel.findByIdAndUpdate(id, locaationStatusData,{new:true});
                let resMsg=language?await this.utilsService.sendResMsg(language,"LOCATION_STATUS_UPDATED")?await this.utilsService.sendResMsg(language,"LOCATION_STATUS_UPDATED"):"Location status updated successfully":'Location status updated successfully'
                return { response_code: HttpStatus.CREATED, response_data: resMsg };
            }
            else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // MANAGER UNLINK 
    public async managerUnlink(user: UsersDTO, id: string, managerData: ManagerDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin') {
                if(managerData.managerId && managerData.managerId.length){
                    let location=await this.locationModel.findById(id,'managerId');
                    for(let manager of managerData.managerId){
                        const index = location.managerId.findIndex(list => list.toString() == manager.toString());
                        if (index !== -1) {
                            location.managerId.splice(index, 1);
                        }
                        await this.userModel.findByIdAndUpdate(manager, {status:0,locationId:null},{new:true});
                    }
                    if(location.managerId.length){
                        location.status=0;
                    }
                    await location.save();
                    let resMsg=language?await this.utilsService.sendResMsg(language,"MANAGER_UNLINK_LOCATION")?await this.utilsService.sendResMsg(language,"MANAGER_UNLINK_LOCATION"):"Managers unlink successfully":'Managers unlink successfully'
                    return { response_code: HttpStatus.CREATED, response_data: resMsg };
                }else{
                    let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                    return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
                }
            }
            else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }

    // LOCATION LIST ONLY NAME
    public async locationListForAdmin(user: UsersDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role !== 'Admin') {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            const locations = await this.locationModel.find({status:1},'locationName');
            return { response_code: HttpStatus.OK, response_data: locations };
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: e.message}; 
        }
    }

    


    //     **********************ALL APIS RELATED USER ********************************

    // USER 
    public async locationList(language:string): Promise<CommonResponseModel> {
        try{
            const locations = await this.locationModel.find({status:1},'locationName');
            return { response_code: HttpStatus.OK, response_data: locations };
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    ///////////////////////area manager API
    // LIST
    public async areaAdminList(user: UsersDTO, page: number, limit: number,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role !== 'Admin') {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            const locations = await this.locationModel.find({}).populate('areaAdminId','firstName').limit(limit).skip((page * limit) - limit).sort('createdAt');
            const total = await this.locationModel.countDocuments();
            return { response_code: HttpStatus.OK, response_data: { locations, total } };
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
}
