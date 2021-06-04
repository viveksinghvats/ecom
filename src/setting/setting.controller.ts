import {Controller,Headers, UseGuards, Post, Body, Delete, Param, Get, Put} from '@nestjs/common';
import {SettingService} from './setting.service';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';
import {GetUser} from '../utils/user.decorator';
import {UsersDTO} from '../users/users.model';
import {SettingDTO, SettingPinCodeDTO, SettingWorkingHoursDTO, SettingCurrencyAndLanguageDTO, SettingCurrencyDTO, loyaltySettingDTO} from './setting.model';
import {CommonResponseModel} from '../utils/app-service-data';
import {identity} from 'rxjs';

@Controller('setting')
export class SettingController {
    constructor(private settingService: SettingService) {
    }

    //  ***  PINCODE API  *********
    // // add pincode
    // @UseGuards(AuthGuard('jwt'))
    // @ApiBearerAuth()
    // @Post('/pincode')
    // public savePinCode(@GetUser() user: UsersDTO, @Body() settingPinCodeData: SettingPinCodeDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
    //     return this.settingService.savePinCode(user, settingPinCodeData,language);
    // }

    // //find all the data
    // @UseGuards(AuthGuard('jwt'))
    // @ApiBearerAuth()
    // @Get('/pincode')
    // public getPincode(@Headers('language') language:string): Promise<CommonResponseModel> {
    //     return this.settingService.getPincode(language);
    // }

    // //delete pin code
    // @UseGuards(AuthGuard('jwt'))
    // @ApiBearerAuth()
    // @Delete('/:pincode')
    // public deletePinCode(@Param('pincode') pincode: string,@Headers('language') language:string): Promise<CommonResponseModel> {
    //     return this.settingService.deletePinCode(pincode,language);
    // }

    //  ***  DELIVERY SETTING API *****

    // add delivery time setting
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/working/time')
    public saveWorkingHrs(@GetUser() user: UsersDTO, @Body() settingWorkingHoursDTO: SettingWorkingHoursDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.settingService.saveWorkingHrs(user, settingWorkingHoursDTO,language);
    }

    //get delivery time for admin
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/working/time')
    public getWorkingTime(@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.settingService.getWorkingTime(language);
    } 

    //get delivery time for user
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/working/time/user/:time/:timestamp')
    public getDeliveryTimeUser(@Param('time') time: string,@Param('timestamp') timestamp: number,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.settingService.getDeliveryTimeUser(time,timestamp,language);
    }

    // add currency and language admin 
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put('/currency/:id')
    public saveCurrency(@Param('id') id:String, @GetUser() user: UsersDTO, @Body() settingCurrencyAndLanguageDTO: SettingCurrencyAndLanguageDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.settingService.saveCurrency(user,id, settingCurrencyAndLanguageDTO,language);
    }
    //get currency and language list admin
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/currency/language/list')
    public getCurrencyAndLanguageList(@GetUser() user: UsersDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.settingService.getCurrencyAndLanguageList(user,language);
    }

    //get currency and language info admin
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/currency/language/info')
    public getCurrencyAndLanguage(@GetUser() user: UsersDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.settingService.getCurrencyAndLanguage(user,language);
    }
    

    //get currency
    // @UseGuards(AuthGuard('jwt'))
    // @ApiBearerAuth()
    @Get('/currency')
    public getCurrency(@GetUser() user: UsersDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.settingService.getCurrency(user,language);
    }
//     //get loyaltyPoint API
//     @UseGuards(AuthGuard('jwt'))
//     @ApiBearerAuth()
//     @Get('/get/loyalty')
//     public getLoyaltyPointFromSetting(@Headers('language') language:string):Promise<CommonResponseModel>{
//         return this.settingService.getLoyaltyPoint(language);
//     }
//   //update and add loyalty point
//     @UseGuards(AuthGuard('jwt'))
//     @ApiBearerAuth()
//     @Put('/update/loyalty/:id')
//     public updateLoyaltyPointByAdmin(@Param('id')id:string, @GetUser() user: UsersDTO, @Body() loyaltyData:loyaltySettingDTO,@Headers('language') language:string):Promise<CommonResponseModel>{
//       return this.settingService.updateLoyaltyPointByAdmin(id,user,loyaltyData,language)
//     }
   //this Api for user App get currency and langauge code
   @Get('/user/App')
   public getListCurrecyandLangaugeCode(@Headers('language') language:string):Promise<CommonResponseModel>{
       return this.settingService.getCurrencyforUserApp(language);
   }
}
