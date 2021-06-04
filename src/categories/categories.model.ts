import * as mongoose from 'mongoose';
import { IsNotEmpty, IsOptional, IsUrl, IsMongoId,IsEmpty,IsBoolean, IsNumber, IsPositive, Min, Max } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export const CategoriesSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  isSubCategoryAvailable: {
    type: Boolean,
    required: false,
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
  // new deal section
  isDealAvailable: {
    type: Boolean,
    default:false
  },
  delaPercent: {
      type: Number
  },
  dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deals'
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Locations',
  },
  refrenceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories',
  },
  addedBy: {
    type: String
  },
  status: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

export class CategoryDTO {
  @IsOptional()
  _id: string;

  @IsNotEmpty()
  @ApiModelProperty()
  title: string;

  @IsNotEmpty()
  @ApiModelProperty()
  description: string;

  @IsNotEmpty()
  @IsUrl()
  @ApiModelProperty()
  imageUrl: string;

  @IsOptional()
  @ApiModelProperty()
  imageId: string;

  @IsNotEmpty()
  @ApiModelProperty()
  filePath: string;

  @IsOptional()
  @ApiModelProperty()
  user: string;

  @IsOptional()
  @IsBoolean()
  isDealAvailable: boolean;

  @IsOptional()
  delaPercent: number;

  @IsOptional()
  @IsMongoId()
  dealId: string ;

  // @IsNotEmpty()
  @IsOptional()
  @ApiModelProperty()
  status: number;

  @IsOptional()
  @ApiModelProperty()
  addedBy: string;

  @IsOptional()
  @ApiModelProperty()
  location: string;

  
}

export class CategoryStatusDTO{
  @IsNotEmpty()
  @IsNumber()
  @ApiModelProperty()
  status: number;
}

export class DealCategoryDTO {
  @IsOptional()
  delaPercent: number;

  @IsOptional()
  isDealAvailable: boolean;

  @IsOptional()
  @IsMongoId()
  dealId: string 
}
