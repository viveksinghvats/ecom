import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {FavouritesDTO} from './favourites.model';
import {CommonResponseModel} from '../utils/app-service-data';
import {UsersDTO} from '../users/users.model';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class FavouritesService {
    constructor(
        @InjectModel('Favourites') private readonly favouritesModel: Model<any>,
        @InjectModel('Cart') private readonly cartModel: Model<any>,
        private utilsService: UploadService) {

    }
    // product data normalize
    public async ProductDataCustomize(cart,products){
        for(let item of cart.cart){
            console.log("fav.unit",item.unit)
            let unit=item.unit;
            let quantity=item.quantity
            const productIndex = products.findIndex(val => (val && val.product && val.product._id.toString() == item.productId.toString()));
            if (productIndex === -1) {
            } else {
                console.log("fav productIndex",productIndex)
                let obj=products[productIndex].toJSON();
                if(obj && obj.product.variant.length>1){
                    const unitIndex = obj.product.variant.findIndex(val => val.unit == unit);
                    if(unitIndex>0){
                        console.log("unitIndex",obj.product.variant[unitIndex])
                        let tempVariant=obj.product.variant[unitIndex];
                        obj.product.variant.splice(unitIndex,1)
                        obj.product.variant.unshift(tempVariant)
                    }
                }
                obj.cartAddedQuantity=quantity;
                obj.cartId=cart._id;
                obj.cartAdded=true;
                products.splice(productIndex, 1,obj) 
            }
        }
        return products
    }
    
    // get's all favourites of user
    public async getUserFavourites(userId: string,query:any,language:string): Promise<CommonResponseModel> {
        console.log("QUERY GET FAV",query)
        if(!query.location){
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
        }
        let products = await this.favouritesModel.find({user: userId,location:query.location}).populate('product','title imageUrl filePath category isDealAvailable delaPercent variant averageRating')
        if(products && products.length){
            let cart=await this.cartModel.findOne({user: userId, isOrderLinked: false},'cart');
            if(cart && cart.cart && cart.cart.length){
                products=await this.ProductDataCustomize(cart,products)
            }
        }
        return {response_code: HttpStatus.OK, response_data: products};
    }

    // get's favourite information
    public async getFavouriteInfo(favouriteId: string,query:any,language:string): Promise<CommonResponseModel> {
        const favouriteInfo = await this.favouritesModel.findById(favouriteId).populate('product');
        if (favouriteInfo) {
            return {response_code: HttpStatus.OK, response_data: favouriteInfo};
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"FAVOURITE_NOT_FOUND")?await this.utilsService.sendResMsg(language,"FAVOURITE_NOT_FOUND"):"Favourite not found":'Favourite not found'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
    }

    // save favourite
    public async saveFavourite(user: UsersDTO, favouriteData: FavouritesDTO,query:any,language:string): Promise<CommonResponseModel> {
        console.log("QUERY SAVE FAV",query)
        if(!query.location){
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
        }
        if (user.role !== 'User') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};   
        }
        const checkIfExist = await this.favouritesModel.findOne({user: user._id,location:query.location, product: favouriteData.product});
        if (checkIfExist) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"FAVOURITE_ALREADY_ADDED")?await this.utilsService.sendResMsg(language,"FAVOURITE_ALREADY_ADDED"):"Product is already added to your favourites":'Product is already added to your favourites'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
        favouriteData.user = user._id;
        favouriteData.location=query.location
        const response = await this.favouritesModel.create(favouriteData);
        if (response._id) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"FAVOURITE_SAVED")?await this.utilsService.sendResMsg(language,"FAVOURITE_SAVED"):"Product added to favourites":'Product added to favourites'
            return {response_code: HttpStatus.CREATED, response_data: resMsg};
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
    }

    // deletes favourite
    public async deleteFavourite(user: UsersDTO, favouriteId: string,query:any,language:string): Promise<CommonResponseModel> {
        if (user.role == 'User') {
            const response = await this.favouritesModel.findByIdAndDelete(favouriteId);
            let resMsg=language?await this.utilsService.sendResMsg(language,"FAVOURITE_DELETE")?await this.utilsService.sendResMsg(language,"FAVOURITE_DELETE"):"Favourite deleted successfully":'Favourite deleted successfully'
            return {response_code: HttpStatus.OK, response_data: resMsg};
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};   
        }
    }

    //delete fav item by product id
    public async deleteFavouritebyProdutItem(user: UsersDTO, favouriteId: string,query:any,language:string): Promise<CommonResponseModel> {
        if (user.role == 'User') {
            await this.favouritesModel.findOneAndDelete({user: favouriteId});
            let resMsg=language?await this.utilsService.sendResMsg(language,"FAVOURITE_DELETE")?await this.utilsService.sendResMsg(language,"FAVOURITE_DELETE"):"Favourite deleted successfully":'Favourite deleted successfully'
            return {response_code: HttpStatus.OK, response_data: resMsg};
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};   
        }
    }

    // checks if user has added a product to favourite
    public async checkIfUserHasAddedProductToFavourite(user: UsersDTO, productId: string,query:any,language:string): Promise<CommonResponseModel> {
        if (user.role == 'User') {
            console.log("QUERY CHECK FAV",query)
            if(!query.location){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
            }
            const response = await this.favouritesModel.findOne({user: user._id, product: productId,location:query.location});
            return {response_code: HttpStatus.OK, response_data: response};
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};   
        }
    }
}
