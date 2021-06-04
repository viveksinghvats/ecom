import {Body, Controller, Query,Delete, Headers,Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {BannerService} from './banner.service';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';
import {GetUser} from '../utils/user.decorator';
import {UsersDTO} from '../users/users.model';
import {BannerDTO} from './banner.model';
import {CommonResponseModel} from '../utils/app-service-data';

@Controller('banner')

export class BannerController {
    constructor(private bannerService: BannerService) {
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/pagination/:pageNume/:limit')
    public getBannerByPagination(@GetUser() user: UsersDTO, @Param('pageNume') pageNume: number, @Param('limit') limit: number,@Headers('language') language:string) {
        return this.bannerService.getBannerByPagination(user, Number(pageNume), Number(limit),language);
    }
    @UseGuards(AuthGuard('jwt')) 
    @ApiBearerAuth()
    @Post('/save')
    public saveBanner(@GetUser() user: UsersDTO, @Body() bannerData: BannerDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.bannerService.saveBanner(user, bannerData,language);
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put('/update/:bannerId')
    public updateBanner(@GetUser() user: UsersDTO, @Param('bannerId') bannerId: string, @Body() bannerData: BannerDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.bannerService.updateBanner(user, bannerId, bannerData,language);
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Delete('/delete/:bannerId')
    public deleteBanner(@GetUser() user: UsersDTO, @Param('bannerId') bannerId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.bannerService.deleteBanner(user, bannerId,language);
    }

    //user api get banner list home page
    @Get('/')
    public getBanners(@Query() query,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.bannerService.getBanner(query,language);
    }
}
