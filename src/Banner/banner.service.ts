import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {UsersDTO} from '../users/users.model';
import {BannerDTO, BannerType} from './banner.model';
import {CommonResponseModel} from '../utils/app-service-data';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class BannerService { 
    constructor(
        @InjectModel('Banner') private readonly bannerModel: Model<any>,
        private utilsService: UploadService
        ) {
    }

    // sends request to get banners
    public async getBannerByPagination(user: UsersDTO, pageNum: number, limit: number,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
        const banners = await this.bannerModel.find({}).limit(limit).skip((pageNum * limit) - limit).populate('location','locationName').populate('category','title').populate('product','title');
        const bannerCount = await this.bannerModel.countDocuments();
        const paginationCount = Math.round(bannerCount / limit);
        return {response_code: HttpStatus.OK, response_data: {banners, bannerCount, paginationCount}};
    }
    public async saveBanner(user: UsersDTO, banner: BannerDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
        if (banner.bannerType === BannerType.Category && !banner.category) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"BANNER_CAT_MISS")?await this.utilsService.sendResMsg(language,"BANNER_CAT_MISS"):"Please select a category":'Please select a category'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        } else if (banner.bannerType === BannerType.Product && !banner.product) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"BANNER_PROD_MISS")?await this.utilsService.sendResMsg(language,"BANNER_PROD_MISS"):"Please select a product":'Please select a product'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        } else if (banner.category && banner.product) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"BANNER_LINK_MISS")?await this.utilsService.sendResMsg(language,"BANNER_LINK_MISS"):"Banner can be linked either to category or product, not both":'Banner can be linked either to category or product, not both'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
        try {
            const bannerSaveRes = await this.bannerModel.create(banner);
            let resMsg=language?await this.utilsService.sendResMsg(language,"BANNER_SAVED")?await this.utilsService.sendResMsg(language,"BANNER_SAVED"):"Banner saved successfully":'Banner saved successfully'
            return {response_code: HttpStatus.CREATED, response_data: resMsg};
        } catch (e) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
    }

    // updates banner
    public async updateBanner(user: UsersDTO, bannerId, banner: BannerDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
        if (banner.bannerType === BannerType.Category && !banner.category) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"BANNER_CAT_MISS")?await this.utilsService.sendResMsg(language,"BANNER_CAT_MISS"):"Please select a category":'Please select a category'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        } else if (banner.bannerType === BannerType.Product && !banner.product) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"BANNER_PROD_MISS")?await this.utilsService.sendResMsg(language,"BANNER_PROD_MISS"):"Please select a product":'Please select a product'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        } else if (banner.category && banner.product) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"BANNER_LINK_MISS")?await this.utilsService.sendResMsg(language,"BANNER_LINK_MISS"):"Banner can be linked either to category or product, not both":'Banner can be linked either to category or product, not both'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
        try {
            const bannerSaveRes = await this.bannerModel.findByIdAndUpdate(bannerId, banner);
            let resMsg=language?await this.utilsService.sendResMsg(language,"BANNER_UPDATE")?await this.utilsService.sendResMsg(language,"BANNER_UPDATE"):"Banner updated successfully":'Banner updated successfully'
            return {response_code: HttpStatus.OK, response_data: resMsg};
        } catch (e) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
    }

    // deletes banner
    public async deleteBanner(user: UsersDTO, bannerId: string,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
        try {
            const bannerSaveRes = await this.bannerModel.findByIdAndDelete(bannerId);
            let resMsg=language?await this.utilsService.sendResMsg(language,"BANNER_DELETE")?await this.utilsService.sendResMsg(language,"BANNER_DELETE"):"Banner deleted successfully":'Banner deleted successfully'
            return {response_code: HttpStatus.OK, response_data: resMsg};
        } catch (e) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
    }
    // sends request to get banners user
    public async getBanner(query:any,language:string): Promise<CommonResponseModel> {
        console.log("QUERY getBanner",query)
        if(!query.location){
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
        }
        const banners = await this.bannerModel.find({status:1,location:query.location},'title bannerType filePath imageURL category product description');
        return {response_code: HttpStatus.OK, response_data: {banners,total:banners.length}};
    }

}
