import * as mongoose from 'mongoose';
import {
  IsNotEmpty,
  IsEmail,
  IsEmpty,
  IsUrl,
  IsNumber,
  Length,
  IsOptional,
  IsPositive,
  Min,
  Equals,
  IsArray,
  ValidateNested,
  IsString,
  Max,
  IsEnum,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export const UsersSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
        trim: true,
        lowercase: true,
        unique: true,
    },
    mobileNumber: {
      type: String,
    },
    password: {
      type: String,
    },
    salt: {
      type: String,
    },
    role: {
      type: String,
    },
    // for all role if profile pic required used***********
    profilePic: {
      type: String,
    },
    profilePicId: {
      type: String,
    },
    filePath:{
      type:String
    },
    // **********************
    otp: {
      type: Number,
    },
    playerId:{
      type:String
    },
    mobileNumberverified: {
      type: Boolean,
    },
    emailVerified: {
      type: Boolean,
    },
    verificationId: {
      type: String,
    },
    registrationDate: {
      type: Number,
    },
    status: {
      type: Boolean,
      default:true
    },
    // only for admin
    exportedFile: {
      type: Object,
    },
    // only for admin
    productExportedFile: {
      type: Object,
    },
    //newly added field loyaltyPoint and totalLoyaltyPoints
    loyaltyPoints:{
      type:Array
    },
    //current loyalty point
    totalLoyaltyPoints: {
      type: Number
    },
    // LANGUAGE CODE 
    language: {
      type: String,
    },
    locationId:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'Locations'
    },
    // TOTAL NO OF ORDER CURRENTLY ACCEPTED 
    noOfOrderAccepted: {
      type: Number
    },
    // TOTAL NO OF ORDER DELIVERED
    noOfOrderDelivered: {
      type: Number
    },
    //this is for deliveryBoy
    areaAdminId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Users'
    },
    locationArea: {
      lat: {
          type: Number,
      },
      long: {
          type: Number,
      },
  },
  },
  
  { timestamps: true },
);

//only These role should be created
enum RoleType {
  User = 'User',
  DileveryBoy= 'Delivery Boy',
  Admin='Admin',
  Manager='Manager',
  Area_Admin='Area Admin'
}


export class UsersDTO {
  @IsEmpty()
  _id: string;

  @IsOptional()
  @ApiModelProperty()
  firstName: string;

  @IsOptional()
  @ApiModelProperty()
  lastName: string;

  @IsNotEmpty()
  @ApiModelProperty()
  email: string;

  @IsNotEmpty()
  @ApiModelProperty()
  password: string;

  @IsOptional()
  @Length(0, 15)
  @ApiModelProperty()
  mobileNumber: string;

  @IsEmpty()
  salt: string;
  
  

  @IsOptional()
  playerId:String

  @IsNotEmpty()
  @IsEnum(RoleType, {message: 'Role  type should be User or Admin or DeliveryBoy'})
  @ApiModelProperty()
  role: string;


  @IsOptional()
  otp: number;

  @IsOptional()
  @IsUrl()
  @ApiModelProperty()
  profilePic: string;

  @IsOptional()
  @ApiModelProperty()
  profilePicId: string;

  @IsOptional()
  @ApiModelProperty()
  filePath:string

  @IsOptional()
  registrationDate: number;

  @IsOptional()
  emailVerified: boolean;

  @IsOptional()
  mobileNumberverified: boolean;

  @IsOptional()
  verificationId: string;


  status:boolean
  @IsOptional()
  @ApiModelProperty()
  loyaltyPoints:Array<any>

  @ApiModelProperty()
  totalLoyaltyPoints:number;

  @IsOptional()
  @ApiModelProperty()
  locationId:string
  
  @IsOptional()
  noOfOrderAccepted: number; 

  @IsOptional()
  noOfOrderDelivered: number;
  locationArea:{
    lat: {
        type: Number,
    },
    long: {
        type: Number,
    }
  }
  areaAdminId:string
}

export class UsersUpdateDTO {
  @IsOptional()
  _id: string;

  @IsOptional()
  @ApiModelProperty()
  firstName: string;

  @IsOptional()
  @ApiModelProperty()
  lastName: string;

  @IsOptional()
  @Length(0, 15)
  @ApiModelProperty()
  mobileNumber: string;


  @IsOptional()
  otp: number;

  @IsOptional()
  @IsUrl()
  @ApiModelProperty()
  profilePic: string;

  @IsOptional()
  @ApiModelProperty()
  profilePicId: string;

  @IsOptional()
  @ApiModelProperty()
  filePath:string

  @IsOptional()
  registrationDate: number;

  @IsOptional()
  emailVerified: boolean;

  @IsOptional()
  mobileNumberverified: boolean;

  @IsOptional()
  verificationId: string;

  @IsOptional()
  @ApiModelProperty()
  playerId:string
  status:boolean
  @IsOptional()
  @ApiModelProperty()
  locationId:string
  locationArea:{
    lat: {
        type: Number,
    },
    long: {
        type: Number,
    }
  }
  
 
}

export class CredentialsDTO {
  @IsNotEmpty()
  @IsEmail()
  @ApiModelProperty()
  email: string;
  
  @IsOptional()
  playerId:string

  @IsNotEmpty()
  @ApiModelProperty()
  password: string;
}

export class UploadFileDTO {
  @ApiModelProperty()
  type: string;
}

export class VerifyEmailDTO {
  @IsNotEmpty()
  @IsEmail()
  @ApiModelProperty()
  email: string;
}

export class OTPVerificationDTO {
  @IsNotEmpty()
  @Length(4, 4)
  @ApiModelProperty()
  otp: string;
}

export class PasswordResetDTO {
  @IsNotEmpty()
  @ApiModelProperty()
  password: string;
}

export class ChangePasswordDTO {
  @IsNotEmpty()
  @ApiModelProperty()
  currentPassword: string;

  @IsNotEmpty()
  @ApiModelProperty()
  newPassword: string;

  @IsNotEmpty()
  @ApiModelProperty()
  confirmPassword: string;
}



//deliveryBoy status update model
export class DeliverBoyStatusDTO{
  @IsNotEmpty()
  @ApiModelProperty()
  status:boolean
}

//only for admin
export class ExportedFileDTO{
  @ApiModelProperty()
  exportedFile:object
}
export class PushNotificationDTO{
  @ApiModelProperty()
  @IsNotEmpty()
  title:string
  @ApiModelProperty()
  @IsNotEmpty()
  mssg:String;
  couponecode:string
  
}
