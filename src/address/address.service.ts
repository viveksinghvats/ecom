import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersDTO } from '../users/users.model';
import { AddressDTO } from './address.model';
import { CommonResponseModel } from '../utils/app-service-data';
import { UploadService } from '../upload/upload.service';

@Injectable() 
export class AddressService {
  constructor(
    @InjectModel('Address') private readonly addressModel: Model<any>,
    private utilsService: UploadService) {

  }
  // get's list of all Address of user
  public async getAddress(userId: string,language:string): Promise<CommonResponseModel> {
    const address = await this.addressModel.find({ user: userId });
    return { response_code: HttpStatus.OK, response_data: address };
  }
  // get's Address information
  public async getAddressInformation(addressId: string,language:string): Promise<CommonResponseModel> {
    const addressInfo = await this.addressModel.findById(addressId) as AddressDTO;
    if (addressInfo) {
      return { response_code: HttpStatus.OK, response_data: addressInfo };
    } else {
      let resMsg=language?await this.utilsService.sendResMsg(language,"ADDRESS_NOT_FOUND")?await this.utilsService.sendResMsg(language,"ADDRESS_NOT_FOUND"):"Address not found":'Address not found'
      return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
    }
  }
  // creates a new Address
  public async saveAddress(user: UsersDTO, address: AddressDTO,language:string): Promise<CommonResponseModel> {
    if (user.role !== 'User') {
      let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
      return {
        response_code: HttpStatus.UNAUTHORIZED,
        response_data: resMsg,
      };
    } else {
      address.user = user._id;
      const response = await this.addressModel.create(address);
      if (response._id) {
        let resMsg=language?await this.utilsService.sendResMsg(language,"ADDRESS_SAVED")?await this.utilsService.sendResMsg(language,"ADDRESS_SAVED"):"Address saved successfully":'Address saved successfully'

        return { response_code: HttpStatus.CREATED, response_data: {message:resMsg }};
      } else {
        let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
        return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
      }
    }
  }
  // updates Address info
  public async updateAddress(user: UsersDTO, addressId: string, addressData: AddressDTO,language:string): Promise<CommonResponseModel> {
    if (user.role !== 'User') {
      let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
      return {
        response_code: HttpStatus.UNAUTHORIZED,
        response_data: resMsg,
      };
    } else {
      let resMsg=language?await this.utilsService.sendResMsg(language,"ADDRESS_UPDATE")?await this.utilsService.sendResMsg(language,"ADDRESS_UPDATE"):"Address updated successfully":'Address updated successfully'
      const response = await this.addressModel.findByIdAndUpdate(addressId, addressData);
      return { response_code: HttpStatus.OK, response_data: resMsg };
    }
  }
  // deletes user's Address
  public async deleteAddress(user: UsersDTO, addressId: string,language:string): Promise<CommonResponseModel> {
    if (user.role !== 'User') {
      let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
      return {
        response_code: HttpStatus.UNAUTHORIZED,
        response_data: resMsg,
      };
    } else {
      const response = await this.addressModel.findByIdAndDelete(addressId);
      let resMsg=language?await this.utilsService.sendResMsg(language,"ADDRESS_DELETE")?await this.utilsService.sendResMsg(language,"ADDRESS_DELETE"):"Address deleted successfully":'Address deleted successfully'
      return { response_code: HttpStatus.OK, response_data: resMsg };
    }
  }
}
//console.log("")
