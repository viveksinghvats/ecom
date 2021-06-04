
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonResponseModel } from '../utils/app-service-data';
import { SubCategoryDTO, EnambleDisableStatusDTO } from './subcategory.model';
import { UsersDTO } from '../users/users.model';

import { UploadService } from '../upload/upload.service';

@Injectable()
export class SubcategoryService {
    constructor(
        @InjectModel('Subcategory') private readonly subcategoryModel: Model<any>,
        @InjectModel('Products') private readonly productModel: Model<any>,
        @InjectModel('Categories') private readonly categoryModel: Model<any>,
        private utilsService: UploadService) { }


    // LIST
    public async index(user: UsersDTO, page: number, limit: number, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                let query = {}
                if (user.role === 'Manager') {
                    query["location"] = user.locationId
                }
                const subCategory = await this.subcategoryModel.find(query).populate('location', 'locationName').populate('category', 'title').limit(limit).skip((page * limit) - limit).sort('createdAt');
                const total = await this.subcategoryModel.countDocuments(query);
                return { response_code: HttpStatus.OK, response_data: { data: subCategory, total } };
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    // SHOW
    public async show(user: UsersDTO, id: string, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                const subCategory = await this.subcategoryModel.findById(id, {});
                return { response_code: HttpStatus.OK, response_data: subCategory };
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    // CREATE
    public async create(user: UsersDTO, subCategoryData: SubCategoryDTO, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                subCategoryData.addedBy = user.role;
                await this.subcategoryModel.create(subCategoryData);
                let resMsg = language ? await this.utilsService.sendResMsg(language, "SUB_CATEGORY_SAVED") ? await this.utilsService.sendResMsg(language, "SUB_CATEGORY_SAVED") : "Subcategory saved successfully" : 'Subcategory saved successfully'
                return { response_code: HttpStatus.CREATED, response_data: resMsg };
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    // UPDATE
    public async upsert(user: UsersDTO, id: string, subCategoryData: SubCategoryDTO, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                await this.subcategoryModel.findByIdAndUpdate(id, subCategoryData, { new: true });
                let resMsg = language ? await this.utilsService.sendResMsg(language, "SUB_CATEGORY_UPDATE") ? await this.utilsService.sendResMsg(language, "SUB_CATEGORY_UPDATE") : "Subcategory updated successfully" : 'Subcategory updated successfully'

                return { response_code: HttpStatus.OK, response_data: resMsg };
            }
            else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    // STATUS UPDATE
    public async statusUpdate(user: UsersDTO, id: string, categoryStatusData: EnambleDisableStatusDTO, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                await this.subcategoryModel.findByIdAndUpdate(id, categoryStatusData, { new: true });
                await this.productModel.updateMany({ category: id }, categoryStatusData);

                // if(user.role === 'Manager'){
                //     await this.productModel.updateMany({category: id}, categoryStatusData);
                // }
                let resMsg = language ? await this.utilsService.sendResMsg(language, "SUB_CATEGORY_STATUS_UPDATE") ? await this.utilsService.sendResMsg(language, "SUB_CATEGORY_STATUS_UPDATE") : "Subcategory status update succesfully" : 'Subcategory status update succesfully'
                return { response_code: HttpStatus.OK, response_data: resMsg };

            }
            else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    // SUB-CATEGORY LIST TO ADD PRODUCT -ADMIN
    public async subCatListForProduct(user: UsersDTO, category: string, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                let query = { category: category }
                if (user.role === 'Manager') {
                    query["location"] = user.locationId
                } if (user.role === 'Admin') {
                    query["location"] = { $exists: false }
                }
                console.log("query", query)

                const subcategory = await this.subcategoryModel.find(query, 'title');
                return { response_code: HttpStatus.OK, response_data: subcategory };
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            console.log("errrrrrrrrrr", e)
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
}
