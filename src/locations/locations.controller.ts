import {Body, Controller, Delete, Get, Param,Headers, Post, Put, UseGuards} from '@nestjs/common';
import {LocationsService} from './locations.service';
import {GetUser} from '../utils/user.decorator';
import {UsersDTO} from '../users/users.model';
import {LocationsDTO, LocationStausDTO,ManagerDTO} from './locations.model';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';
import {CommonResponseModel} from '../utils/app-service-data';

@Controller('locations')
export class LocationsController {
    constructor(private locationService: LocationsService) {
        
    }

   
    // SHOW
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/:id')
    public show(@GetUser() user: UsersDTO,@Param('id') id: string,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.locationService.show(user,id,language);
    }
    
    // CREATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Post('/')
    public create(@GetUser() user: UsersDTO, @Body() locationData: LocationsDTO,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.locationService.create(user, locationData,language);
    }

    // UPDATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Put('/:id')
    public upsert(@GetUser() user: UsersDTO,@Param('id') id: string, @Body() locationData: LocationsDTO,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.locationService.upsert(user,id, locationData,language);
    }
    // LIST 
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/:page/:limit')
    public index(@GetUser() user: UsersDTO,@Param('page') page: number, @Param('limit') limit: number,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.locationService.index(user,Number(page),Number(limit),language);
    }

    // STATUS UPDATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Put('status/:id')
    public statusUpdate(@GetUser() user: UsersDTO,@Param('id')id:string,@Body()locationStatusData:LocationStausDTO,@Headers('language') language:string ):Promise<CommonResponseModel>{
        return this.locationService.statusUpdate(user,id,locationStatusData,language);
    }

    // MANAGER UNLINK
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Put('manager/unlink/:id')
    public managerUnlink(@GetUser() user: UsersDTO,@Param('id')id:string,@Body()managerData:ManagerDTO,@Headers('language') language:string ):Promise<CommonResponseModel>{
        return this.locationService.managerUnlink(user,id,managerData,language);
    }
    // LOCATION LIST ONLY ENABLE ONLY ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/list/for/admin/')
    public locationListForAdmin(@GetUser() user: UsersDTO,@Headers('language') language:string ):Promise<CommonResponseModel>{
        return this.locationService.locationListForAdmin(user,language);
    }

    // ***************************ALL APIS USER*****************************
    // LOCATION LIST
    @Get('/public/user/list')
    public test(@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.locationService.locationList(language);
    }
    ///////////////////////////////////Area manger API
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/all/area-admin-list-by-location/:page/:limit')
    public getAreaMangerLis(@GetUser() user: UsersDTO,@Param('page') page: number, @Param('limit') limit: number,@Headers('language') language:string):Promise<CommonResponseModel>{
        return this.locationService.areaAdminList(user,Number(page),Number(limit),language)
    }
     
}
