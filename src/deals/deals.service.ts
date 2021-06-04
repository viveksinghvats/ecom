import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {DealsDTO, DealsStatusDTO} from './deals.model';
import {CommonResponseModel} from '../utils/app-service-data';
import {UsersDTO} from '../users/users.model';
import {DealProductDTO} from '../products/products.model';
import { UploadService } from '../upload/upload.service';


@Injectable()
export class DealsService { 
    constructor(
        @InjectModel('deals') private readonly dealsModel: Model<any>,
        @InjectModel('Products') private readonly productsModel: Model<any>,
        @InjectModel('Categories') private readonly categoryModel: Model<any>,
        private utilsService: UploadService) {

    }
    // gets deals by pagination
    public async getDealsByPagination(user: UsersDTO,pageNum: number, limit: number,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                let query={}
                if(user.role === 'Manager'){
                    query["location"]= user.locationId
                }
                const deals = await this.dealsModel.find(query).populate('location','locationName').populate('category','title').populate('product','title').limit(limit).skip((pageNum * limit) - limit);
                const totalDeals = await this.dealsModel.countDocuments();
                return {response_code: HttpStatus.OK, response_data: {deals, totalDeals}};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
       
    }

    // gets deal information
    public async getDealInformation(user: UsersDTO,dealId: string,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const dealData = await this.dealsModel.findById(dealId).populate('location','locationName').populate('category','title').populate('product','title');
                return {response_code: HttpStatus.OK, response_data: dealData};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }

    // creates a new deal
    public async createNewDeal(user: UsersDTO, dealData: DealsDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const dealExist = await this.dealsModel.findOne({name: dealData.name});
                if (dealExist) {
                    let resMsg=language?await this.utilsService.sendResMsg(language,"DEAL_EXIST")?await this.utilsService.sendResMsg(language,"DEAL_EXIST"):"Deal already exist":'Deal already exist'
                    return {
                        response_code: HttpStatus.BAD_REQUEST,
                        response_data: resMsg,
                    };
                } else {
                    if(dealData.category==null ||  dealData.category==""){
                        delete dealData.category;
                    }
                    if(dealData.product==null ||  dealData.product==""){
                        delete dealData.product;
                    }
                    const response = await this.dealsModel.create(dealData) as DealsDTO;
                    if (response._id) {
                        let dealObj={isDealAvailable:true,delaPercent:response.delaPercent,dealId:response._id}
                        let query={}
                        if(response.delalType=="Category"){
                            query={category:response.category}
                            await this.categoryModel.updateMany({_id:response.category},{ $set: dealObj });
                        }else{
                            query={_id:response.product}
                        }
                        await this.productsModel.updateMany(query,{ $set: dealObj });
                        let resMsg=language?await this.utilsService.sendResMsg(language,"DEAL_SAVED")?await this.utilsService.sendResMsg(language,"DEAL_SAVED"):"Deal saved successfully":'Deal saved successfully'
                        return {response_code: HttpStatus.CREATED, response_data: resMsg};
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

    // updates the deal
    public async updateDeal(user: UsersDTO, dealId: string, dealData: DealsDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const response = await this.dealsModel.findByIdAndUpdate(dealId, dealData);
                let dealObj={isDealAvailable:true,delaPercent:response.delaPercent,dealId:response._id}
                let query={}
                if(response.delalType=="Category"){
                    query={category:response.category}
                    await this.categoryModel.updateMany({_id:response.category},{ $set: dealObj });
                }else{
                    query={_id:response.product}
                }
                await this.productsModel.updateMany(query,{ $set: dealObj });
                let resMsg=language?await this.utilsService.sendResMsg(language,"DEAL_UPDATE")?await this.utilsService.sendResMsg(language,"DEAL_UPDATE"):"Deal updated successfully":'Deal updated successfully'
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

    // deletes deal
    public async deletesDeal(user: UsersDTO, dealId: string,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const response = await this.dealsModel.findById(dealId);
                const deletedResponse = await this.dealsModel.findByIdAndDelete(dealId);
                let dealObj={isDealAvailable:false,delaPercent:response.delaPercent,dealId:response._id}
                let query={}
                if(response.delalType=="Category"){
                    query={category:response.category}
                    await this.categoryModel.updateMany({_id:response.category},{ $set: dealObj });
                }else{
                    query={_id:response.product}
                }
                await this.productsModel.updateMany(query,{ $set: dealObj });
                let resMsg=language?await this.utilsService.sendResMsg(language,"DEAL_DELETE")?await this.utilsService.sendResMsg(language,"DEAL_DELETE"):"Deal deleted successfully":'Deal deleted successfully'
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

    // update deals status
    public async dealsUpdateStatus(user: UsersDTO,id: string, dealsStatusData: DealsStatusDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const response = await this.dealsModel.findByIdAndUpdate(id, dealsStatusData);
                let isDealAvailable=response.status==1?true:false;
                let dealObj={isDealAvailable:isDealAvailable,delaPercent:response.delaPercent,dealId:response._id}
                let query={}
                if(response.delalType=="Category"){
                    query={category:response.category}
                    await this.categoryModel.updateMany({_id:response.category},{ $set: dealObj });
                }else{
                    query={_id:response.product}
                }
                await this.productsModel.updateMany(query,{ $set: dealObj });
                let resMsg=language?await this.utilsService.sendResMsg(language,"DEAL_STATUS_UPDATE")?await this.utilsService.sendResMsg(language,"DEAL_STATUS_UPDATE"):"Deal status update succesfully":'Deal status update succesfully'
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
