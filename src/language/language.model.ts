import * as mongoose from 'mongoose';
import {IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsUrl} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger';

export const LanguageSchema = new mongoose.Schema({
    languageCode: {
        type:String
    },
    languageName: {
        type:String
    },
    status: {
        type:Number,
        default:1
    },
    isDefault: {
        type:Number,
        default:0
    },
    webJson: {
        type:Object
    },
    deliveyAppJson: {
        type:Object
    },
    mobAppJson: {
        type:Object
    },
    cmsJson: {
        type:Object
    },
    backendJson: {
        type:Object
    }
}, {timestamps: true});

export class LanguageDTO{
    @IsOptional()
    @IsMongoId()
    _id: string;

    @ApiModelProperty() 
    @IsNotEmpty() 
    languageCode:string;

    @ApiModelProperty()
    @IsNotEmpty()
    languageName:string

    @ApiModelProperty()
    @IsNotEmpty()
    webJson:object;

    @ApiModelProperty()
    @IsNotEmpty()
    deliveyAppJson:object;

    @ApiModelProperty()
    @IsNotEmpty()
    mobAppJson:object;

    @ApiModelProperty()
    @IsNotEmpty()
    cmsJson:object;

    @ApiModelProperty()
    @IsNotEmpty()
    backendJson:object;
}
export class StatusUpdateDTO{
    @ApiModelProperty()
    @IsNotEmpty()
    status:number
}
export class SetDefaultDTO{
    @ApiModelProperty()
    @IsNotEmpty()
    isDefault:number
}
