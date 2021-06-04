import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {UsersDTO} from '../users/users.model';
import {RatingDTO, RatingModel} from './rating.model';
import {CommonResponseModel} from '../utils/app-service-data';
import {ProductsDTO} from '../products/products.model';
import {OrdersDTO} from '../order/order.model';
import {CartDataModel} from '../cart/cart.model';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class RatingService {
    constructor(
        @InjectModel('Rating') private readonly ratingModel: Model<any>, 
        @InjectModel('Products') private readonly productModel: Model<any>, 
        @InjectModel('Orders') private readonly orderModel: Model<any>,
        @InjectModel('Cart') private readonly cartModel: Model<any>,
        private utilsService: UploadService) {

    }

    // save rating
    public async saveRating(user: UsersDTO, ratingData: RatingDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'User') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
        const productInfo = await this.productModel.findById(ratingData.productId) as ProductsDTO;
        const orderInfo = await this.orderModel.findById(ratingData.order) as OrdersDTO;
        const cartData: CartDataModel = await this.cartModel.findById(orderInfo.cart);
        if (productInfo) {
            if (!productInfo.totalRating) {
                productInfo.totalRating = 0;
            }
            if (!productInfo.averageRating) {
                productInfo.averageRating = 0;
            }
            if (!productInfo.noOfUsersRated) {
                productInfo.noOfUsersRated = 0;
            }
            productInfo.totalRating += ratingData.rate
            productInfo.noOfUsersRated += 1;
            productInfo.averageRating = Number((productInfo.totalRating / productInfo.noOfUsersRated).toFixed(1));
            const ratingInfo: RatingModel = {
                rate: ratingData.rate,
                description: ratingData.description,
                user: user._id,
                product: ratingData.productId,
                order: ratingData.order,
            };
            const cartIndex = cartData.cart.findIndex(c => c.productId == ratingData.productId);
            if (!cartData.cart[cartIndex].rating) {
                cartData.cart[cartIndex].rating = 0;
            }
            cartData.cart[cartIndex].rating = ratingData.rate;
            const ratingRes = await this.ratingModel.create(ratingInfo);
            const orderUpdate = await this.cartModel.findByIdAndUpdate(cartData._id, cartData);
            if (ratingRes._id) {
                const res = await this.productModel.findByIdAndUpdate(productInfo._id, productInfo);
                let resMsg=language?await this.utilsService.sendResMsg(language,"RATING_SAVED")?await this.utilsService.sendResMsg(language,"RATING_SAVED"):"Rating saved successfully":'Rating saved successfully'
                return {response_code: HttpStatus.CREATED, response_data: resMsg};
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
            }
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
    }
}
