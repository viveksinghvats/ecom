import * as mongoose from 'mongoose';
import {IsArray, IsDate, IsEmpty, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUrl, Max, Min} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger';

export const DealsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    delaPercent: {
        type: Number,
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locations',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories',
    },
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
    },
    //Category or Product
    delalType:{
        type: String,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    imageId: {
        type: String,
        required: true,
    },
    filePath:{
        type: String
    },
    //top deal
    topDeal: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Number,
        default: 1,
    }
}, {timestamps: true});

enum delalType {
    Category = 'Category',
    Product = 'Product'
}

export class DealsDTO {

    @IsOptional()
    _id: string;

    @IsNotEmpty()
    @ApiModelProperty()
    name: string;

    @IsNotEmpty()
    @ApiModelProperty()
    description: string;

    @IsNotEmpty()
    @ApiModelProperty()
    delaPercent: number;

    @IsNotEmpty()
    @IsEnum(delalType, {message: 'Enter a valid type'})
    @ApiModelProperty()
    delalType: string;

    
    @IsOptional()
    @ApiModelProperty()
    location: string;

    @IsOptional()
    @ApiModelProperty()
    category: string;

    @IsOptional()
    @ApiModelProperty()
    product: string;

    @IsNotEmpty()
    @IsUrl()
    @ApiModelProperty()
    imageUrl: string;

    @IsNotEmpty()
    @ApiModelProperty()
    imageId: string;

    @IsNotEmpty()
    @ApiModelProperty()
    filePath: string;

    @IsNotEmpty()
    @ApiModelProperty()
    topDeal: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    @ApiModelProperty()
    status: number;
}

export class DealsStatusDTO {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(1)
    @ApiModelProperty()
    status: number;

}


    // @IsOptional()
    // @ApiModelProperty()
    // user: string;