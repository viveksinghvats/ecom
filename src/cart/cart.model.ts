import * as mongoose from 'mongoose';
import {
    IsBoolean,
    IsMongoId,
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    Min,
    ValidateNested,
} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {CouponsDTO} from '../coupons/coupons.model';

export const CartSchema = new mongoose.Schema({
    cart: {
        type: Array,
    },
    products: [{type: mongoose.Schema.Types.ObjectId, ref: 'Products'}],
    subTotal: {
        type: Number,
    },
    tax: {
        type: Number,
    },
    grandTotal: {
        type: Number,
    },
    deliveryCharges: {
        type: Number,
    },
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },
    unit: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupons',
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locations',
    },
    imageUrl: {
        type: String
    },
    filePath:{
       type:String
    },
    couponInfo: {
        type: Object
    },
    taxInfo:{
        type: Object
    },
    isFreeDelivery:{
        type: Boolean,
        default:false
    },
    isOrderLinked: {
        type: Boolean, 
    },
    description: {
        type: String
    }
}, {timestamps: true});

export interface CartModel {
    productId: string;
    title: string;
    variantsName: string;
    productName: string;
    filePath: string;
    imageUrl:string;
    quantity: number;
    price: number;
    productTotal: number;
    unit: string;
    description: string;
    rating?: number;
    discountAmount?: number;
    originalPrice?: number;
    offerInfo?: CouponsDTO;
    amountAfterDiscount?: number;
    MRP?:Number,//Ampil
    //for deal

    delaPercent?: number;
    dealTotalAmount?: number;
    dealAmountOneProd?: number;

    isDealAvailable?: boolean;
}

export interface CartDataModel {
    _id?: string;
    cart: Array<CartModel>;
    products: Array<string>;
    subTotal: number;
    tax: number;
    isFreeDelivery:boolean;
    grandTotal: number;
    deliveryCharges: number;
    user: string;
    location: string;
    deliveryAddress?:string;
    isOrderLinked: boolean;
    coupon?: string;
    couponInfo?: object;
    taxInfo?: object;
}

export class DeleteCartProductDTO {
    @IsNotEmpty()
    @IsMongoId()
    @ApiModelProperty()
    cartId: string;

    @IsNotEmpty()
    @IsMongoId()
    @ApiModelProperty()
    productId: string;
}
// export class DeleteCartMultiProductDTO {
//     @IsNotEmpty()
//     @IsMongoId()
//     @ApiModelProperty()
//     cartId: string;

//     @IsArray
//     @ApiModelProperty()
//     productIds: [];
// }

export class CartDTO {

    @IsNotEmpty()
    @ApiModelProperty()
    productId: string;

    @ApiModelProperty()
    variantsName: string;

    @ApiModelProperty()
    productName: string;

    @ApiModelProperty()
    title: string;

    @ApiModelProperty()
    imageUrl: string;
    @ApiModelProperty()
    description: string;
    @IsNotEmpty()
    @IsNumber()
    @ApiModelProperty()
    quantity: number;

    @ApiModelProperty()
    price: number;

    @ApiModelProperty()
    productTotal: number;

    @ApiModelProperty()
    delaPercent: number;

    @ApiModelProperty()
    dealTotalAmount: number;

    @ApiModelProperty()
    dealAmountOneProd: number;

    @ApiModelProperty()
    filePath:string

    @ApiModelProperty()
    isDealAvailable: number;

}

export class UpdateCartDTO {
    @IsOptional()
    @IsMongoId()
    @ApiModelProperty()
    cartId: string;

    @IsNotEmpty()
    @IsMongoId()
    @ApiModelProperty()
    productId: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Min(1)
    @ApiModelProperty()
    quantity: number;
}
