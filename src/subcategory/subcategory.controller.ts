import { Controller, Body,Headers, Post, Get, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { SubcategoryService } from './subcategory.service';
import { SubCategoryDTO, EnambleDisableStatusDTO } from './subcategory.model';
import { CommonResponseModel } from 'src/utils/app-service-data';
import {UsersDTO} from '../users/users.model';
import {GetUser} from '../utils/user.decorator';

import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { identity } from 'rxjs';

@Controller('subcategory')
export class SubcategoryController {
    constructor(private subcategoryService: SubcategoryService) {


    }

    // LIST 
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/:page/:limit')
    public index(@GetUser() user: UsersDTO,@Param('page') page: number, @Param('limit') limit: number,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.subcategoryService.index(user,Number(page),Number(limit),language);
    }

    // SHOW
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/:id')
    public show(@GetUser() user: UsersDTO,@Param('id') id: string,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.subcategoryService.show(user,id,language);
    }
    
    // CREATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Post('/')
    public create(@GetUser() user: UsersDTO, @Body() subCategoryData: SubCategoryDTO,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.subcategoryService.create(user, subCategoryData,language);
    }

    // UPDATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Put('/:id')
    public upsert(@GetUser() user: UsersDTO,@Param('id') id: string, @Body() subCategoryData: SubCategoryDTO,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.subcategoryService.upsert(user,id, subCategoryData,language);
    }

    // STATUS UPDATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Put('status/:id')
    public statusUpdate(@GetUser() user: UsersDTO,@Param('id')id:string,@Body()subCategoryStatusData:EnambleDisableStatusDTO,@Headers('language') language:string ):Promise<CommonResponseModel>{
        return this.subcategoryService.statusUpdate(user,id,subCategoryStatusData,language);
    }

    // CATEGORY LIST TO ADD PRODUCT -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/list/to-add/product/:category')
    public subCatListForProduct(@GetUser() user: UsersDTO,@Param('category')category:string,@Headers('language') language:string ):Promise<CommonResponseModel>{
        return this.subcategoryService.subCatListForProduct(user,category,language);
    }
}
