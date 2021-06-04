import {Body,Query, Controller,Headers, Get, Param, Patch, Post,Delete, UseGuards,Res, Put} from '@nestjs/common';
import {OrderService} from './order.service';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';
import {GetUser} from '../utils/user.decorator';
import {UsersDTO} from '../users/users.model';
import { OrdersDTO, OrderStatusDTO, NewOderModel, AssignOrderDTO,StartEndDTO} from './order.model';
import {CommonResponseModel} from '../utils/app-service-data';

@Controller('orders') 

export class OrderController {
    constructor(private orderService: OrderService) {

    }
    //oder assigned to area Adminn
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/list/mini/admin/to/all')
    public getAllOrderListWhichAssigedToMiniAdmin(@GetUser() user:UsersDTO,@Headers('language') language:string):Promise<CommonResponseModel>{
        return this.orderService.getAllOrderListWhichAssigedToMiniAdmin(user,language)
    }
    // USER ORDER INFO
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/info/:orderId')
    public getOrderDetails(@GetUser() user: UsersDTO,@Param('orderId') orderId: string,@Headers('language') language:string) {
        return this.orderService.getOrderDetails(user,orderId,language);
    }

    // USER HISTORY
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/history')
    public orderHistery(@GetUser() user: UsersDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.orderService.orderUserHitory(user,language);
    }

    // LIST -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get(':page/:limit')
    public index(@GetUser() user: UsersDTO,@Query() query,@Param('page') page: string, @Param('limit') limit: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.orderService.index(user,query,parseInt(page), parseInt(limit),language);
    }
    // ORDER-INFO -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/detail/admin/:orderId')
    public orderDetails(@GetUser() user: UsersDTO,@Param('orderId') orderId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.orderService.orderDetails(user,orderId,language);
    }


    // PLACE NEW ORDER
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/place/order')
    public placeOrder(@GetUser() user: UsersDTO, @Body() orderData: OrdersDTO,@Headers('language') language:string) {
        return this.orderService.cartVerify(user, orderData,language);
    }
    

    // ORDER STATUS UPDATE -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put('/update/status/by-admin/manager')
    public updateOrderStatus(@GetUser() user: UsersDTO, @Body() orderData: OrderStatusDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.orderService.updateOrderStatusByAdmin(user, orderData,language);
    }

    // GRAPH ORDER
    @Get('/graph')
    public oderGraph(@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.orderService.getOrderEarnings(language);
    }
    // ORDER ASSIGNED TO DELIVERY BOY
    @Post('/assign/order')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    public assignOrder(@GetUser() user: UsersDTO, @Body() assignData: AssignOrderDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.orderService.assignOrder(user, assignData,language);
    }
    //ORDER ASSIGNED TO AREA ADMIN
    @Post('/assign/to/area/admin')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    public assignOrderToAreaAdmin(@GetUser() user: UsersDTO, @Body() assignData: AssignOrderDTO,@Headers('language') language:string):Promise<CommonResponseModel>{
        return this.orderService.assignOrderToAreaAdmin(user,assignData,language)
    }
    // ORDER EXPORT
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/export')
    public orderExport(@GetUser() user: UsersDTO, @Body() startEndDTO: StartEndDTO,@Headers('language') language:string):Promise<CommonResponseModel>{
    return this.orderService.orderExport(user,startEndDTO,language);
    }
    // GET ORDER EXPORT
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/export/file/download')
    public getExportFile(@GetUser() user: UsersDTO,@Headers('language') language:string):Promise<CommonResponseModel>{
    return this.orderService.getExportFile(user,language);
    }
    // DELETE ORDER EXPORT FILE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Delete('/export/file/delete/:deleteKey')
    public orderExportDelete(@GetUser() user: UsersDTO,@Param('deleteKey')deleteKey: string,@Headers('language') language:string):Promise<CommonResponseModel>{
    return this.orderService.orderExportDelete(user,deleteKey,language);
    }
    // DOWNLOAD ORDER-INVOICE  ADMIN
    @Get('/invoic/pdf/download/:id')
    public async invoiceDownload(@Res() res,@Param('id')id: string,@Headers('language') language:string){
        return this.orderService.invoiceDownload(res,id,language)
    }
    
    // ORDER cancel By user
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put('/cancel/by/user')
    public cancelOrder(@GetUser() user: UsersDTO, @Body() orderData: OrderStatusDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.orderService.cancelOrder(user, orderData,language);
    }

    
}
