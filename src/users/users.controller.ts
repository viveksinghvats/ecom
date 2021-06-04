import { Controller, Post, Body, Get, UseGuards, Headers, Req, Param, Put, Patch, HttpStatus, Res, Delete, } from '@nestjs/common';
import * as path from 'path';
import { UsersDTO, CredentialsDTO, ChangePasswordDTO, VerifyEmailDTO, OTPVerificationDTO, PasswordResetDTO, UsersUpdateDTO, DeliverBoyStatusDTO, PushNotificationDTO, } from './users.model';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommonResponseModel } from '../utils/app-service-data';
import { GetUser } from '../utils/user.decorator';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {

    }
    
    
     // location based Mini Admin list
     @UseGuards(AuthGuard('jwt'))
     @ApiBearerAuth()
     @Get('/location-based-mini-admin/:location')
     public locationBasedMiniAdmin(@GetUser() user: UsersDTO,@Param('location') location: string, @Headers('language')language:string):Promise<CommonResponseModel>{
         return this.userService.locationbasedMiniAdmin(user,location,language)
     }
    // sends request to get user's information
    @Get('/me')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    public getUserInformation(@GetUser() user: UsersDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.getUserInformation(user, language);
    }


    // sends request to verify user email
    @Get('/verify/email/:verificationId')
    public async verifyUserAccount(@Param('verificationId') verificationId: string, @Res() res, @Headers('language') language: string) {
        const response = await this.userService.verifyEmail(verificationId, language);
        if (response.response_code === 200) {
            res.sendFile(path.resolve('src/templates/success.html'));
        } else {
            res.sendFile(path.resolve('src/templates/error.html'));
        }
    }

    // sends request to verify token
    @Get('/verify/token')
    public async verifyToken(@Headers() headers, @Res() res) {
        this.userService.verifyToken(headers.authorization).then(data => {
            res.status(HttpStatus.OK).json({
                response_code: 200, response_data: { tokenVerify: true }
            });
        }).catch(error => {
            res.status(HttpStatus.UNAUTHORIZED).json({
                response_code: 200, response_data: { tokenVerify: false }
            });
        });
    }

    // sends request to register new user
    @Post('/register')
    public registerNewUser(@Body() userData: UsersDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.registerNewUser(userData, language);
    }

    // sends request to validate user's credentials
    @Post('/login')
    public validateUserCredentials(@Body() credentials: CredentialsDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.validateUserCredentials(credentials, language);
    }


    // sends request to change password
    @Post('/change-password')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    public changePassword(@GetUser() user: UsersDTO, @Body() passwordData: ChangePasswordDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.changePassword(user, passwordData, language);
    }

    // sends request to reset password
    @Post('/verify/email')
    public verifiesUsersEmail(@Body() emailData: VerifyEmailDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.validateEmail(emailData.email, language);
    }

    // sends request to verify OTP
    @Post('/verify/OTP')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    public verifyOTP(@GetUser() user: UsersDTO, @Body() otp: OTPVerificationDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.verifyOTP(user._id, Number(otp.otp), language);
    }

    // sends request to reset password
    @Post('/reset-password')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    public resetPassword(@GetUser() user: UsersDTO, @Body() passwordData: PasswordResetDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.resetPassword(user._id, passwordData, language);
    }


    // sends request to update profile
    @Patch('/update/profile')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    public updateProfile(@GetUser() user: UsersDTO, @Body() userInfo: UsersUpdateDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.updateUserInfo(user._id, userInfo, language);
    }

   

    //veify OTP Of Mobile Number
    @Post('/mobile/OTP')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    public verifyOTPofMobileNo(@GetUser() user: UsersDTO, @Body() otp: OTPVerificationDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.verifyOTP(user._id, Number(otp.otp), language);
    }

    // one signal push notifiction all
    @Post('/send/pushnotification/all')
    public sendPushNotificationtToAlluser(@Body() data: PushNotificationDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.pushNotificatioalToAllusers(data, language);
    }



    // LANGUAGE SET
    @Get('/language/set')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    public updateLanguage(@GetUser() user: UsersDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.updateLanguage(user, language);
    }



    // **************************MANAGER APIS****************************


     // USER LIST  -ADMIN/MANAGER
     @UseGuards(AuthGuard('jwt'))
     @ApiBearerAuth()
     @Get('/list/access/admin-manager/:page/:limit')
     public userList(@GetUser() user: UsersDTO,@Param('page') page: string, @Param('limit') limit: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.userService.userList(user, Number(page) , Number(limit),language)
     }

    // ADD MANAGER -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/add/manager')
    public adminCreateNewRoleManger(@GetUser() user: UsersDTO, @Body() managerData: UsersDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.addManager(user, managerData, language)
    }

    // MANAGER LIST -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/manager/:page/:limit')
    public findAllMangerList(@GetUser() user: UsersDTO, @Param('page') page: number, @Param('limit') limit: number, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.mangerList(user, Number(page), Number(limit), language)
    }
    
    // UPDATE MANAGER -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put('/update/manager/:id')
    public updateManager(@GetUser() user: UsersDTO, @Param('id') id: string, @Body() managerData: UsersDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.updateManager(user, id, managerData, language)
    }

    // **************************DELIVERY BOY APIS****************************

    // ADD DELIVERY BOY -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/add/delivery-boy')
    public addDeliverBoy(@GetUser() user: UsersDTO, @Body() deliveryBoyData: UsersDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.addDeliveryBoy(user, deliveryBoyData, language)
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('all/delivery-boy/enable/list/for/area-admin')
     public deliveryBoyListBasedOnAreaAdminId(@GetUser() user: UsersDTO, @Param('page') page: number, @Param('limit') limit: number, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.deliveryBoyListBasedOnAreaAdminId(user, Number(page), Number(limit), language)
     }

    // DELIVERY BOY LIST -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/delivery-boy/:page/:limit')
    public deliveryBoyList(@GetUser() user: UsersDTO, @Param('page') page: number, @Param('limit') limit: number, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.deliveryBoyList(user, Number(page), Number(limit), language)
    }
    
    // UPDATE DELIVERY BOY -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put('/update/delivery-boy/:id')
    public updateDeliveryBooy(@GetUser() user: UsersDTO, @Param('id') id: string, @Body() deliveryBoyData: UsersDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.updateDeliveryBooy(user, id, deliveryBoyData, language)
    }

    // UPDATE DELIVERY BOY STATUS -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put('/update/status/delivery-boy/:id')
    public updateStatusDeliveryBooy(@GetUser() user: UsersDTO, @Param('id') id: string, @Body() deliverBoyStatusData: DeliverBoyStatusDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.updateStatusDeliveryBooy(user, id, deliverBoyStatusData, language)
    }

    // DELIVERY BOY LIST FOR ASSIGNED ORDER -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/delivery-boy/list-to/assign/:location')
    public deliveryBoyListByLocation(@GetUser() user: UsersDTO,@Param('location') location: string, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.deliveryBoyListByLocation(user,location,  language)
    }

    // DELIVERY BOY INFO FOR DELIVERY-BOY
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/delivery-boy/info')
    public deliveryBoyInfo(@GetUser() user: UsersDTO,@Param('location') location: string, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.userService.deliveryBoyInfo(user,location,  language)
    }
    //all mini Admin list 
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/mini-admin')
    public getMiniAdminList(@GetUser() user:UsersDTO,@Headers('language') language: string):Promise<CommonResponseModel>{
        return this.userService.minAdminList(user,language)
    }
    
    //all mini Admin list 
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/enable/disable/mini-admin/:page/:limit')
    public allListEnableAndDisable(@GetUser() user:UsersDTO,@Param('page') page: number, @Param('limit') limit: number,@Headers('language') language: string):Promise<CommonResponseModel>{
        return this.userService.allListEnableAndDisable(user,Number(page), Number(limit),language)
    }
    //view by id mini admin
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/mini-admin/:id')
    public viewByIdMiniAdmin(@Param('id')id:string,user:UsersDTO,@Headers('language') language: string):Promise<CommonResponseModel>{
        return this.userService.viewMiniAdmin(id,user,language)
    }
   
    //area Admin updated
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put('area-admin/:id')
    public updateAreaAdmin(@GetUser() user: UsersDTO, @Param('id') id: string, @Body() deliverBoyStatusData: UsersUpdateDTO, @Headers('language') language: string):Promise<CommonResponseModel>{
        return this.userService.updateAreaAdmin(user,id,deliverBoyStatusData,language)
    }
    //add new Area Admin
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/create-area-admin')
    public addnewAreaAdmin(@GetUser() user: UsersDTO, @Body() managerData: UsersDTO, @Headers('language') language: string):Promise<CommonResponseModel>{
        return this.userService.addnewAreaAdmin(user,managerData,language)
    }

    //get All  Area Admin list 
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/all/area/admin/list/:locationId')
    public allAreaAdminList(@GetUser() user: UsersDTO,@Param('locationId') locationId: string,@Headers('language') language: string):Promise<CommonResponseModel>{
        return this.userService.allAreaAdminList(user,locationId,language)
    }
    // location based delivery boy list
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/location-based-delivery-boy/:locationId')
    public locationBasedDeliveryBoy(@Param('locationId') locationId:string,@GetUser() user: UsersDTO,@Headers('language') language: string):Promise<CommonResponseModel>{
        return this.userService.locationBasedDeliveryBoY(locationId,user,language)
    }

    //when login show all the list of delivery boy
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/delivery/boy/list/based/areaadmin')
    public loginAreaAdminshow(@GetUser() user:UsersDTO,@Headers('language') language: string):Promise<CommonResponseModel>{
        return this.userService.loginAreaAdminshow(user,language)
    }
}
