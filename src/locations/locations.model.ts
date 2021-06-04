import * as mongoose from 'mongoose';
import {IsEmpty, IsNotEmpty, IsOptional, Matches, IsNumber, IsPositive, Max, Min} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger';
import {COOrdinatesDTO} from '../address/address.model';

export const LocationsSchema = new mongoose.Schema({
    locationName: {
        type: String
    },
    address:{
        type: String 
    },
    city: {
        type: String
    },
    postalCode: {
        type: String
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    },
    status: {
        type: Number,
        default: 0
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    managerId:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
    ],
    areaAdminId:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
    ]
}, {timestamps: true});

export class LocationsDTO {
    @IsNotEmpty()
    @ApiModelProperty()
    locationName: string;

    @IsNotEmpty()
    @ApiModelProperty()
    city: string;

    @IsNotEmpty()
    @ApiModelProperty()
    address: string;

    @IsOptional()
    @ApiModelProperty()
    location: COOrdinatesDTO;

    @IsOptional()
    adminId:string

    @IsNotEmpty()
    @ApiModelProperty()
    postalCode: string;
    
    @ApiModelProperty()
    managerId:[]

    @IsOptional()
    status: number;
    areaAdminId:[]
}
export class LocationStausDTO{
    @IsNumber()
    @IsNotEmpty()
    @ApiModelProperty()
    status :number
}

export class ManagerDTO{
    @IsNotEmpty()
    @ApiModelProperty()
    managerId: Array<string>
}