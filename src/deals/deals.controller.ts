import {Body, Controller,Headers, Delete, Get, Param, Patch, Post, Put, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';
import {DealsService} from './deals.service';
import {GetUser} from '../utils/user.decorator';
import {UsersDTO} from '../users/users.model';
import {DealsDTO, DealsStatusDTO} from './deals.model';
import {CommonResponseModel} from '../utils/app-service-data';

@Controller('deals')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DealsController { 
    constructor(private dealService: DealsService) {

    } 



    // sends request to get deals by pagination
    @Get('/:page/:limit')
    public getDealsByPagination(@GetUser() user: UsersDTO,@Param('page') page: string, @Param('limit') limit: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.dealService.getDealsByPagination(user,Number(page), Number(limit),language);
    }

    // sends request to get deal information
    @Get('/:dealId')
    public getDealInformation(@GetUser() user: UsersDTO,@Param('dealId') dealId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.dealService.getDealInformation(user,dealId,language);
    }

    // sends request to create a new deal
    @Post('')
    public saveDeal(@GetUser() user: UsersDTO, @Body() dealData: DealsDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.dealService.createNewDeal(user, dealData,language);
    }

    // sends request to update deal
    @Put('/:dealId')
    public updateDeal(@GetUser() user: UsersDTO, @Param('dealId') dealId: string, @Body() dealData: DealsDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.dealService.updateDeal(user, dealId, dealData,language);
    }

    // sends request to delete deal
    @Delete('/delete/:dealId')
    public deleteDeal(@GetUser() user: UsersDTO, @Param('dealId') dealId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.dealService.deletesDeal(user, dealId,language);
    }

    //deal status Update
    @Put('status/update/:id')
    public dealStatus(@GetUser() user: UsersDTO,@Param('id')id: string, @Body()dealstatusData: DealsStatusDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.dealService.dealsUpdateStatus(user,id, dealstatusData,language);
    }
}
