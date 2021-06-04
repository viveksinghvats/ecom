import {Injectable, HttpStatus} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {CategoryDTO, CategoryStatusDTO} from './categories.model';
import {CommonResponseModel} from '../utils/app-service-data';
import {UsersDTO} from '../users/users.model';
import {ProductsDTO} from '../products/products.model';
import { UploadService } from '../upload/upload.service';


@Injectable() 
export class CategoryService {
    constructor(
        @InjectModel('Categories') private readonly categoryModel: Model<any>, 
        @InjectModel('Subcategory') private readonly subcategoryModel: Model<any>,
        @InjectModel('Products') private readonly productModel: Model<any>,
        @InjectModel('deals') private readonly dealsModel: Model<any>,
        private utilsService: UploadService) { 
    }
    
    // LIST
    public async index(user: UsersDTO, page: number, limit: number,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                let query={}
                if(user.role === 'Manager'){
                    query["location"]= user.locationId
                }
                const category = await this.categoryModel.find(query).populate('location','locationName').limit(limit).skip((page * limit) - limit).sort('createdAt');
                const total = await this.categoryModel.countDocuments(query);
                return { response_code: HttpStatus.OK, response_data: { data:category, total } };
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // SHOW
    public async show(user: UsersDTO, id: string,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const category = await this.categoryModel.findById(id,{});
                return { response_code: HttpStatus.OK, response_data: category };
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // CREATE
    public async create(user: UsersDTO, categoryData: CategoryDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                categoryData.addedBy=user.role;
                await this.categoryModel.create(categoryData);
                let resMsg=language?await this.utilsService.sendResMsg(language,"CATEGORY_SAVED")?await this.utilsService.sendResMsg(language,"CATEGORY_SAVED"):"Category saved successfully":'Category saved successfully'
                return {response_code: HttpStatus.CREATED, response_data: resMsg};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // UPDATE
    public async upsert(user: UsersDTO,id:string, categoryData: CategoryDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                await this.categoryModel.findByIdAndUpdate(id, categoryData,{new:true});
                let resMsg=language?await this.utilsService.sendResMsg(language,"CATEGORY_UPDATE")?await this.utilsService.sendResMsg(language,"CATEGORY_UPDATE"):"Category updated successfully":'Category updated successfully'
                return {response_code: HttpStatus.OK, response_data: resMsg};
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
    public async statusUpdate(user: UsersDTO, id: string, categoryStatusData: CategoryStatusDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                await this.categoryModel.findByIdAndUpdate(id, categoryStatusData,{new:true});
                if(user.role === 'Manager'){
                    await this.subcategoryModel.updateMany({category: id}, categoryStatusData);
                    await this.productModel.updateMany({category: id}, categoryStatusData);
                }
                let resMsg=language?await this.utilsService.sendResMsg(language,"CATEGORY_STATUS_UPDATE")?await this.utilsService.sendResMsg(language,"CATEGORY_STATUS_UPDATE"):"Category status update succesfully":'Category status update succesfully'
                return {response_code: HttpStatus.OK,response_data: resMsg};

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
    // CATEGORY LIST TO ADD PRODUCT -ADMIN
    public async catListForProduct(user: UsersDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                let query={}
                if(user.role === 'Manager'){
                    query["location"]= user.locationId
                }if(user.role === 'Admin'){
                    query["location"]= { $exists: false }
                }
                console.log("query",query)

                const category = await this.categoryModel.find(query,'title');
                return { response_code: HttpStatus.OK, response_data: category };
            }else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
        }catch(e){
            console.log("errrrrrrrrrr",e)
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // CATEGORY PRODUCT LIST
    public async categoryProductList(user: UsersDTO,location:string,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const category = await this.categoryModel.find({location:location},'title');
                const product = await this.productModel.find({location:location},'title');
                return { response_code: HttpStatus.OK, response_data: { category, product } };
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
     // product search user
     public async searchCategory(search_key: string,query,language:string): Promise<CommonResponseModel> {
        console.log("QUERY SEARCH PRODUCT",query,search_key)
        if(!query.location){
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
        }
        let products = await this.categoryModel.find( { title: { $regex:search_key,$options: 'i' },status:1,location:query.location},);

        return {response_code: HttpStatus.OK, response_data: products};
    }
}
