import {Body,Headers, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {CommonResponseModel} from '../utils/app-service-data';
import {GetUser} from '../utils/user.decorator';
import {UsersDTO} from '../users/users.model';
import {DeliveryTaxService} from './delivery-tax.service';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';
import {DeliveryTaxDTO, UserLocationDTO} from './delivery-tax.model';

@Controller('delivery/tax/settings')
export class DeliveryTaxController {
    constructor(private deliveryService: DeliveryTaxService) {
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('')
    public getDeliverySettings(@GetUser() user: UsersDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.deliveryService.getStoreDeliverySettings(user,language);
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()   
    @Post('/save')
    public saveSettings(@GetUser() user: UsersDTO, @Body() deliveryData: DeliveryTaxDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.deliveryService.saveDeliveryTaxSettings(user, deliveryData,language);
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/get/charges')
    public calculateDistanceAndGetCharges(@GetUser() user: UsersDTO, @Body() userLocationDTO: UserLocationDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.deliveryService.calculateDistance(user, userLocationDTO,language);
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get("/details")
    public getDeliverySettingsDetails(@GetUser() user:UsersDTO,@Headers('language') language:string):Promise<CommonResponseModel>{
        return this.deliveryService.getAdminDeliverySettings(language);
    }

    // for user 
    @Get("/info")
    public taxSettingInfo(@Headers('language') language:string):Promise<CommonResponseModel>{
        return this.deliveryService.taxSettingInfo(language);
    }
}
