import {Body, Controller,Headers, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';
import {CouponsService} from './coupons.service';
import {CommonResponseModel} from '../utils/app-service-data';
import {GetUser} from '../utils/user.decorator';
import {UsersDTO} from '../users/users.model';
import {CouponsDTO, CouponStatusDTO} from './coupons.model';

@Controller('coupons')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CouponsController {
    constructor(private couponService: CouponsService) {

    }
    
    // sends request to get coupon information
    @Get('/info/:couponId')
    public couponInfo(@GetUser() user: UsersDTO,@Param('couponId') couponId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.couponService.couponInfo(user,couponId,language);
    }

    // sends request to get coupons by pagination
    @Get('/:page/:limit')
    public couponsListByPagination(@GetUser() user: UsersDTO,@Param('page') page: string, @Param('limit') limit: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.couponService.couponsListByPagination(user,parseInt(page), parseInt(limit),language);
    }

    // sends request to save coupon
    @Post('/save')
    public saveCoupon(@GetUser() user: UsersDTO, @Body() couponData: CouponsDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.couponService.saveCoupon(user, couponData,language);
    }

    // sends request to update coupon
    @Put('/update/:couponId')
    public updateCoupon(@GetUser() user: UsersDTO, @Param('couponId') couponId: string, @Body() couponData: CouponsDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.couponService.updateCoupon(user, couponId, couponData,language);
    }

    // sends request to delete coupon
    @Delete('/delete/:couponId')
    public deleteCoupon(@GetUser() user: UsersDTO, @Param('couponId') couponId: string,@Headers('language') language:string) {
        return this.couponService.deleteCoupon(user, couponId,language);
    }

    // update status coupon
    @Put('status/update/:id')
    public updateCouponStatus(@GetUser() user: UsersDTO,@Param('id')id: string, @Body()couponStatusData: CouponStatusDTO,@Headers('language') language:string) {
        return this.couponService.couponStatusUpdate(user,id, couponStatusData,language);
    }

}
