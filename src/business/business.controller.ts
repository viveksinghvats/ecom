import {Controller,Headers, Body, Post, Put, Param, Delete, Get, UseGuards} from '@nestjs/common';
import {BusinessService} from './business.service';
import {BusinessDTO} from './business.model';
import {CommonResponseModel} from '../utils/app-service-data'; 
import {UsersDTO} from '../users/users.model';
import {GetUser} from '../utils/user.decorator';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';

@Controller('business')

export class BusinessController {
    constructor(private businessService: BusinessService) {
    }

    // save business data
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/save')
    public saveBusinessData(@GetUser() user: UsersDTO, @Body() businesData: BusinessDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.businessService.saveBusinessdata(user, businesData,language);
    }

    //get bussi-infomation
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()   
    @Get('/info')
    public getBusinessinfomation(@GetUser() user: UsersDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.businessService.getBusinessinfomation(user,language);
    }

    
    //get by id API
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()  
    @Get('/show/:businessId')
    public showbyId(@Param('businessId') businessId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.businessService.getByidBusiness(businessId,language);
    }

    //update infomatiom by businessId
    @UseGuards(AuthGuard('jwt')) 
    @ApiBearerAuth()  
    @Put('/edit/:businessId')
    public editBusinessInfo(@Param('businessId') businessId: string, @Body() businesData: BusinessDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.businessService.editBusinessInfo(businessId, businesData,language);
    }

    //detele by business ID
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()  
    @Delete('/remove/account/:businessId')
    public removerAccountFromDB(@Param('businessId')businessId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.businessService.deleteBusinessAccount(businessId,language);
    }
    //this api for user APP about infomaion
    @Get('/business/about/us')
    public getAboutUs(@Headers('language') language:string):Promise<CommonResponseModel>{
        return this.businessService.getBussinessInfomation(language);
    }
}
