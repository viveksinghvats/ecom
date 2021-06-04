import {Body, Controller,Headers, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';
import {AddressService} from './address.service';
import {CommonResponseModel} from '../utils/app-service-data';
import {GetUser} from '../utils/user.decorator';
import {UsersDTO} from '../users/users.model';
import {AddressDTO} from './address.model';

@Controller('address')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AddressController {
    constructor(private addressService: AddressService) {

    }

    // sends request to get list of all user Address
   
    @Get('/user/all')
    public getUserAddress(@GetUser() user: UsersDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.addressService.getAddress(user._id,language);
    }

    // sends request to get Address information
    @Get('/:addressId')
    public getAddressInformation(@Param('addressId') addressId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.addressService.getAddressInformation(addressId,language);
    }

    // sends request to create Address
    @Post('')
    public saveAddress(@GetUser() user: UsersDTO, @Body() addressData: AddressDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.addressService.saveAddress(user, addressData,language);
    }

    // sends requests to update Address
    @Put('/update/:addressId')
    public updateAddress(@GetUser() user: UsersDTO, @Param('addressId') addressId: string, @Body() addressData: AddressDTO,@Headers('language') language:string) {
        return this.addressService.updateAddress(user, addressId, addressData,language);
    }

    // sends request to delete Address
    @Delete('/delete/:addressId')
    public deleteAddress(@GetUser() user: UsersDTO, @Param('addressId') addressId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.addressService.deleteAddress(user, addressId,language);
    }
}
