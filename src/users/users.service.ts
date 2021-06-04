import {Injectable, HttpStatus} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import { UsersDTO, CredentialsDTO, ChangePasswordDTO, PasswordResetDTO, UsersUpdateDTO, DeliverBoyStatusDTO,PushNotificationDTO,} from './users.model';
import {CommonResponseModel, globalConfig} from '../utils/app-service-data';
import {JwtService} from '@nestjs/jwt';
import {AuthService} from '../utils/auth.service';
import * as uuid from 'uuid/v1';
import {UploadService} from '../upload/upload.service';
const GeneralService = require('../utils/general-service');
@Injectable()
export class UsersService {
    constructor(
        @InjectModel('Users') private readonly userModel: Model<any>,
        private jwtService: JwtService,
        private authService: AuthService, 
        private utilsService: UploadService,
        @InjectModel('Products') private readonly productsModel: Model<any>,
        @InjectModel('Categories') private readonly categoryModel: Model<any>,
        @InjectModel('Orders') private readonly orderModel: Model<any>,
        @InjectModel('Locations') private readonly locationModel: Model<any>, 

    ) {
    }
    // get's own info user/ manager/admin
    public async getUserInformation(user: UsersDTO,language:string): Promise<CommonResponseModel> {
        if (user.role === 'User' || user.role === 'Manager'|| user.role === 'Admin') {
            const userInfo = await this.userModel.findById(user._id, '-password -salt');
            if (userInfo) {
                return {response_code: HttpStatus.OK,response_data: {userInfo}};
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"USER_NOT_FOUND")?await this.utilsService.sendResMsg(language,"USER_NOT_FOUND"):"User not found":'User not found'
                return {response_code: 400,response_data: resMsg};
            }
        }else{
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
    }
    
    // registers a new user
    public async registerNewUser(userData: UsersDTO,language:string): Promise<CommonResponseModel> {
        console.log("nnnnnnnnn",userData)
        try{
        if (userData.role === 'User') {
            console.log('111111111111111111111')
            userData.email=userData.email.toLowerCase();
            const check = await this.userModel.findOne({email: userData.email});
            if (check) {
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: `User with email ${userData.email} is already registered`};
            }
            const {salt, hashedPassword} = await this.authService.hashPassword(userData.password);
            userData.salt = salt;
            userData.password = hashedPassword;
            userData.registrationDate = Date.now();
            userData.emailVerified = userData.role === 'User' ? false : true;
            userData.totalLoyaltyPoints = 0;
            userData.loyaltyPoints=[];
            userData.loyaltyPoints.push({point: 0});
            const verificationId = uuid();
            userData.verificationId = verificationId;
            const response = await this.userModel.create(userData);
            if (response._id) {
                const {body, subject, htmlData} = await this.getEmailVerificationFields(verificationId,language);
                const emailRes = await this.utilsService.sendEmail(userData.email, subject, body, htmlData);
                if (emailRes && emailRes.length > 0) {
                    let resMsg=language?await this.utilsService.sendResMsg(language,"REGISTRATION_WITH_MAIL_SUCCESS")?await this.utilsService.sendResMsg(language,"REGISTRATION_WITH_MAIL_SUCCESS"):"Account created successfully. A verification link is sent your email, Please verify your email":'Account created successfully. A verification link is sent your email, Please verify your email'
                    return {
                        response_code: HttpStatus.CREATED,
                        response_data:resMsg,
                    };
                } else {
                    let resMsg=language?await this.utilsService.sendResMsg(language,"REGISTRATION_SUCCESS")?await this.utilsService.sendResMsg(language,"REGISTRATION_SUCCESS"):"Account created successfully":'Account created successfully'
                    return {
                        response_code: HttpStatus.CREATED,
                        response_data: {message: resMsg},
                    };
                }
            }
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"REGISTRATION_ROLE_EXIST")?await this.utilsService.sendResMsg(language,"REGISTRATION_ROLE_EXIST"):"Invalid role":'Invalid role'
            return {
                response_code: HttpStatus.BAD_REQUEST,
                response_data: resMsg
            };
        }
    }catch(e){
        return{
            
                response_code: HttpStatus.BAD_REQUEST,
                response_data: e.message
            };
    }
    }
    // updates user information user 
    public async updateUserInfo(userId: string,userData: UsersUpdateDTO,language:string): Promise<CommonResponseModel> {
        await this.userModel.findByIdAndUpdate(userId, userData,{new:true});
        let resMsg=language?await this.utilsService.sendResMsg(language,"USER_PROFILE_UPDATE")?await this.utilsService.sendResMsg(language,"USER_PROFILE_UPDATE"):"Profile updated successfully":'Profile updated successfully'
        return {
            response_code: HttpStatus.OK,
            response_data: resMsg,
        };
    }
    // get email verification fields
    public async getEmailVerificationFields(verificationId: string,language:string) {
        let resMsg=language? await this.utilsService.sendResMsg(language,"USER_EMAIL_VERIFY_MSG")?await this.utilsService.sendResMsg(language,"USER_EMAIL_VERIFY_MSG"):"Registration has been successful. Please follow the link to verify your email":'Registration has been successful. Please follow the link to verify your email'
        const body=resMsg
        const subject: string = 'Account verification';
        let htmlData: string = '';
        let url: string = '';
        if (process.env.NODE_ENV === 'production') {
            url=process.env.BASE_URL_PRODUCTION+`/users/verify/email/${verificationId}`
            htmlData = `    <p>${body}</p><br>
                            <a href="${url}" target="_blank">VERIFY ACCOUNT</a>
                        `;
        } else {
            url=process.env.BASE_URL_TESTING+`/users/verify/email/${verificationId}`
            htmlData = `    <p>${body}</p><br>
                            <a href="${url}" target="_blank">VERIFY ACCOUNT</a>
                        `;
        }
        return {body, subject, htmlData};
    }

    // validates user's credential and sends token and id as response
    public async validateUserCredentials(credentials: CredentialsDTO,language:string): Promise<CommonResponseModel> {
        try{
            console.log("credentials",credentials)
            credentials.email=credentials.email.toLowerCase();
            const userData: UsersDTO = await this.userModel.findOne({email: credentials.email});
            if (!userData) {
                let resMsg=language?await this.utilsService.sendResMsg(language,"USER_NOT_FOUND")?await this.utilsService.sendResMsg(language,"USER_NOT_FOUND"):"User not found":'User not found'
                return {
                    response_code: HttpStatus.UNAUTHORIZED,
                    response_data: resMsg,
                };
            }
            const passwordMatch = await this.authService.verifyPassword(credentials.password, userData.password);
            const body = {
                token: null,
                _id: null,
                role: null,
                language:null,
                locationId:null,
                firstName:null
            };
            if (passwordMatch) {
                if (passwordMatch && userData.emailVerified) {
                    body._id = userData._id;
                    body.token = await this.authService.generateAccessToken(userData._id);
                    body.role = userData.role;
                    body.firstName = userData.firstName;
                    body.locationId = userData.locationId?userData.locationId:null;
                    const userInfo = await this.userModel.findOne({email: credentials.email});
                    userInfo.playerId = credentials.playerId;
                    if(!userInfo.language){
                        userInfo.language = language;
                    }
                    body.language = userInfo.language;
                    const res = await this.userModel.findByIdAndUpdate(userInfo._id, userInfo);
                    return {response_code: HttpStatus.OK, response_data: body};
                } else {
                    const verificationId = uuid();
                    userData.verificationId = verificationId;
                    const setVerificationId = await this.userModel.findByIdAndUpdate(userData._id, userData);
                    const {body, subject, htmlData} = await this.getEmailVerificationFields(verificationId,language);
                    const emailRes = await this.utilsService.sendEmail(userData.email, subject, body, htmlData);
                    if (emailRes && emailRes.length > 0) {
                        let resMsg=language?await this.utilsService.sendResMsg(language,"ACCOUNT_NOT_VERIFIED")?await this.utilsService.sendResMsg(language,"ACCOUNT_NOT_VERIFIED"):"Your account is not verified. A verification link is sent your email, Please verify your email":'Your account is not verified. A verification link is sent your email, Please verify your email'
                        return {
                            response_code: HttpStatus.UNAUTHORIZED,
                            response_data:resMsg,
                        };
                    } else {
                        let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                        return {
                            response_code: 400,
                            response_data: resMsg,
                        };
                    }
                }
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"PASSWORD_WRONG")?await this.utilsService.sendResMsg(language,"PASSWORD_WRONG"):"Enter a valid password":'Enter a valid password'
                return {
                    response_code: HttpStatus.UNAUTHORIZED,
                    response_data: resMsg,
                };
            }
        }catch(e){
            console.log("login errr......",e)
            let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
            return {response_code: 400,response_data: resMsg};
        }
    }
    
    // verifies user's email
    public async verifyEmail(verificationId: string,language:string): Promise<CommonResponseModel> {
        const userInfo = (await this.userModel.findOne({verificationId})) as UsersDTO;
        if (userInfo) {
            userInfo.emailVerified = true;
            const res = await this.userModel.findByIdAndUpdate(
                userInfo._id,
                userInfo,
            );
            let resMsg=language?await this.utilsService.sendResMsg(language,"EMAIL_VERIFIED")?await this.utilsService.sendResMsg(language,"EMAIL_VERIFIED"):"Email verified successfully":'Email verified successfully'
            return {
                response_code: HttpStatus.OK,
                response_data: resMsg,
            };
        } else {
            let resMsg=language?await this.utilsService.sendResMsg(language,"EMAIL_NOT_VERIFIED")?await this.utilsService.sendResMsg(language,"EMAIL_NOT_VERIFIED"):"Could not verify user. Email was expired. Please try login again":'Could not verify user. Email was expired. Please try login again'
            return {
                response_code: HttpStatus.UNAUTHORIZED,
                response_data: resMsg,
            };
        }
    }
    // change password 
    public async changePassword(user: UsersDTO, passwordData: ChangePasswordDTO,language:string): Promise<CommonResponseModel> {
        const passwordMatch = await this.authService.verifyPassword(passwordData.currentPassword, user.password);
        if (!passwordMatch) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"CURRENT_PASSWORD_INCORRECT")?await this.utilsService.sendResMsg(language,"CURRENT_PASSWORD_INCORRECT"):"You have entered an incorrect current password":'You have entered an incorrect current password'
            return {
                response_code: HttpStatus.UNAUTHORIZED,
                response_data: resMsg,
            };
        } else {
            const {salt, hashedPassword} = await this.authService.hashPassword(passwordData.newPassword);
            user.salt = salt;
            user.password = hashedPassword;
            const response = await this.userModel.findByIdAndUpdate(user._id, user);
            let resMsg=language?await this.utilsService.sendResMsg(language,"PASSWORD_CHANGED")?await this.utilsService.sendResMsg(language,"PASSWORD_CHANGED"):"You have successfully changed your password":'You have successfully changed your password'
            return {
                response_code: HttpStatus.OK,
                response_data: resMsg,
            };
        }
    }

    // checks email exist or not, if exist sends OTP to the email
    public async validateEmail(email: string,language:string): Promise<CommonResponseModel> {
        email=email.toLowerCase();
        const userData = (await this.userModel.findOne({email})) as UsersDTO;
        if (!userData) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"USER_EMAIL_NOT_EXIST")?await this.utilsService.sendResMsg(language,"USER_EMAIL_NOT_EXIST"):"User with this email doesnt exist":'User with this email doesnt exist'
            return {
                response_code: HttpStatus.UNAUTHORIZED,
                response_data: resMsg,
            };
        } else {
            const randomNumber = Math.floor(9000 * Math.random()) + 1000;
            userData.otp = randomNumber;
            console.log('OTP', randomNumber);
            const res = await this.userModel.findByIdAndUpdate(userData._id, userData);
            const body = `Dear user, your One time Password (OTP) to reset your password is ${randomNumber}. The OTP is valid for 5 minutes.`;
            const subject = 'Password reset OTP';
            const emailRes = await this.utilsService.sendEmail(userData.email, subject, body);
            if (emailRes && emailRes.length > 0) {
                const token = await this.authService.generateAccessToken(userData._id, 'email');
                let resMsg=language?await this.utilsService.sendResMsg(language,"OTP_SENT_EMAIL")?await this.utilsService.sendResMsg(language,"OTP_SENT_EMAIL"):"We have sent an OTP to your email. Please verify the OTP to reset your password":'We have sent an OTP to your email. Please verify the OTP to reset your password'
                return {
                    response_code: HttpStatus.OK,
                    response_data: {
                        message:resMsg ,
                        token,
                    },
                };
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                return {
                    response_code: HttpStatus.BAD_REQUEST,
                    response_data:resMsg
                };
            }
        }
    }

    // verifies OTP
    public async verifyOTP(userId: string, otp: number,language:string): Promise<CommonResponseModel> {
        const userInfo = await this.userModel.findById(userId);
        if (userInfo.otp !== otp) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"OTP_WRONG")?await this.utilsService.sendResMsg(language,"OTP_WRONG"):"You have entered an incorrect OTP":'You have entered an incorrect OTP'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        } else {
            const token = await this.authService.generateAccessToken(userInfo._id, 'otp',);
            let resMsg=language?await this.utilsService.sendResMsg(language,"OTP_VERIFY")?await this.utilsService.sendResMsg(language,"OTP_VERIFY"):"OTP verified successfully":'OTP verified successfully'
            return {response_code: HttpStatus.OK,response_data: {message: resMsg, token}};
        }
    }

    // resets password
    public async resetPassword(userId: string, passwordData: PasswordResetDTO,language:string): Promise<CommonResponseModel> {
        const userInfo = (await this.userModel.findById(userId)) as UsersDTO;
        const {salt, hashedPassword} = await this.authService.hashPassword(passwordData.password);
        userInfo.salt = salt;
        userInfo.password = hashedPassword;
        const res = await this.userModel.findByIdAndUpdate(userId, userInfo);
        let resMsg=language?await this.utilsService.sendResMsg(language,"PAASWORD_RESET_SUCCESS")?await this.utilsService.sendResMsg(language,"PAASWORD_RESET_SUCCESS"):"Password has been reset successfully":'Password has been reset successfully'
        return {response_code: HttpStatus.OK,response_data: resMsg};
    }
    // checks whether the token is valid or not
    public async verifyToken(token: string): Promise<any> {
        return this.jwtService.verifyAsync(token);
    }
    // LANGUGE UPDATE IN DB
    public async updateLanguage( user: UsersDTO,language:string):Promise<CommonResponseModel>{
        if (!user._id) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
            return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
        }
        await this.userModel.findByIdAndUpdate(user._id,{language},{new:true});
        let resMsg=language?await this.utilsService.sendResMsg(language,"LANGUAGE_CODE_UPDATED")?await this.utilsService.sendResMsg(language,"LANGUAGE_CODE_UPDATED"):"Language updated successfully":'Language updated successfully'
        return{
            response_code:HttpStatus.OK,
            response_data:resMsg
        }
    }

    // ******************ALL OWNER   APIS****************************

    public async  pageCreation(count){ 
        let limit=1000,arr=[];
        let noOfPage=Math.ceil(count/limit);
        for(let i=1;i<=noOfPage;i++){
            let p = (Number(i) - 1) * limit;
            arr.push({skip:p,limit:limit})
        }
        return arr
    }
    public async fetchPlayerId(count,data,query){
        let pageArr =await this.pageCreation(count)
        if(pageArr && pageArr.length){
            for(let item of pageArr){
                const userData=await this.userModel.find(query,'playerId').skip(Number(item.skip)).limit(Number(item.limit)).sort("-createdAt");
                let deviceArr:any=[]
                deviceArr= userData.map(element => element.playerId)
                await GeneralService.orderPushNotification(deviceArr, data.mssg, data.title);
            }
        }
        return true
    }
    
    //send pushNotification to All users.
    public async pushNotificatioalToAllusers(data:PushNotificationDTO,language:string): Promise<CommonResponseModel> {
        try{
            let query={role:"User",playerId: { $exists: true }}
            const count=await this.userModel.countDocuments(query);
            if(count){
                this.fetchPlayerId(count,data,query)
            }
            let resMsg=language?await this.utilsService.sendResMsg(language,"USER_PUSH_NOTIFICATION")?await this.utilsService.sendResMsg(language,"USER_PUSH_NOTIFICATION"):"Push notification send to all users":'Push notification send to all users'
            return {
                response_code: HttpStatus.OK,
                response_data:resMsg
            };
        }catch(e){
            return{
                response_code:HttpStatus.BAD_REQUEST,
                response_data:e.message
            }
        }
    }


   


    // ******************ALL MANAGER  APIS****************************
     // USER LIST -ADMIN/MANAGER
     public async userList(user:UsersDTO,page:number,limit:number,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const userList = await this.userModel.find({role:"User"},'firstName lastName email mobileNumber emailVerified status registrationDate language').limit(limit).skip((page * limit) - limit).sort('-createdAt');
                const total = await this.userModel.countDocuments({});
                let newArr=[];
                if(userList.length){
                    for(let item of userList){
                        const count = await this.orderModel.countDocuments({user:item._id,orderStatus:"DELIVERED"});
                        newArr.push({user:item,orderCount:count})
                    }
                }
                return { response_code: HttpStatus.OK, response_data: { data:newArr, total } };
                
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }

    // ADD MANAGER
    public async addManager(user:UsersDTO,userData: UsersDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role !== 'Admin') {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            if (userData.role === 'Manager') {
                const check = await this.userModel.findOne({ $or: [{ email: userData.email }, { mobileNumber: userData.mobileNumber }] });
                if (check) {
                    let resMsg = language ? await this.utilsService.sendResMsg(language, "EMAIL_OR_MOBILE_NUMBER_EXIST") ? await this.utilsService.sendResMsg(language, "EMAIL_OR_MOBILE_NUMBER_EXIST") : "Email or Mobile number alraedy exist" : 'Email or Mobile number alraedy exist'
                    return { response_code: 400, response_data: resMsg };
                }
                const { salt, hashedPassword } = await this.authService.hashPassword(userData.password);
                userData.salt = salt;
                userData.password = hashedPassword;
                userData.registrationDate = Date.now();
                userData.emailVerified = true;
                const verificationId = uuid();
                userData.verificationId = verificationId;
                const response = await this.userModel.create(userData);
                if (response._id) {
                    let res = await this.locationModel.findById(userData.locationId,'managerId')
                    if(res.managerId && res.managerId.length){
            
                        res.managerId.push(response._id)
                    }else{
                
                        res.managerId=[response._id];
                    }
                    await res.save()
                }
                let resMsg=language?await this.utilsService.sendResMsg(language,"REGISTRATION_SUCCESS")?await this.utilsService.sendResMsg(language,"REGISTRATION_SUCCESS"):"Account created successfully":'Account created successfully'
                return {response_code: HttpStatus.CREATED,response_data: {message: resMsg},};
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"REGISTRATION_ROLE_EXIST")?await this.utilsService.sendResMsg(language,"REGISTRATION_ROLE_EXIST"):"Invalid role":'Invalid role'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // UPDATE MANAGER
    public async updateManager(user:UsersDTO,id:string,managerData: UsersDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role !== 'Admin') {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            console.log("manager ",JSON.stringify(managerData))
            await this.userModel.findByIdAndUpdate(id, managerData,{new:true});
            let location=await this.locationModel.findById(managerData.locationId,'managerId');
            if(location){
                const index = location.managerId.findIndex(list => list.toString() == managerData.locationId.toString());
                if (index === -1) {
                    location.managerId.push(id);
                    await location.save()
                }
            }
            let resMsg=language?await this.utilsService.sendResMsg(language,"MANAGER_UPDATE")?await this.utilsService.sendResMsg(language,"MANAGER_UPDATE"):"Manager updated successfully":'Manager updated successfully'
            return {response_code: 200, response_data: resMsg};
            
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // MANAGER LIST
    public async mangerList(user: UsersDTO,page:number,limit:number,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role !== 'Admin') {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            const res = await this.userModel.find({ role: 'Manager' }).limit(limit).skip((page * limit) - limit).populate('locationId', 'locationName');
            const total = await this.userModel.countDocuments({ role: 'Manager' });
            return {response_code: HttpStatus.OK,response_data: {data:res,total}}
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }


    // ******************ALL DELIVERY BOY APIS****************************
    // ADD DELIVERY BOY
    public async addDeliveryBoy(user:UsersDTO,userData: UsersDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin'|| user.role ==='Manager'||user.role ==='Area Admin') {
              
            if (userData.role === 'Delivery Boy') {
                const check = await this.userModel.findOne({ $or: [{ email: userData.email }, { mobileNumber: userData.mobileNumber }] });
                if (check) {
                    let resMsg = language ? await this.utilsService.sendResMsg(language, "EMAIL_OR_MOBILE_NUMBER_EXIST") ? await this.utilsService.sendResMsg(language, "EMAIL_OR_MOBILE_NUMBER_EXIST") : "Email or Mobile number alraedy exist" : 'Email or Mobile number alraedy exist'
                    return { response_code: 400, response_data: resMsg };
                }
                const { salt, hashedPassword } = await this.authService.hashPassword(userData.password);
                userData.salt = salt;
                userData.password = hashedPassword;
                userData.registrationDate = Date.now();
                userData.emailVerified = true;
                userData.noOfOrderAccepted = 0;
                userData.noOfOrderDelivered = 0;
                userData.areaAdminId=user._id
                const verificationId = uuid();
                userData.verificationId = verificationId;
                const response = await this.userModel.create(userData);
                let resMsg=language?await this.utilsService.sendResMsg(language,"REGISTRATION_SUCCESS")?await this.utilsService.sendResMsg(language,"REGISTRATION_SUCCESS"):"Account created successfully":'Account created successfully'
                return {response_code: HttpStatus.CREATED,response_data: {message: resMsg},};
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"REGISTRATION_ROLE_EXIST")?await this.utilsService.sendResMsg(language,"REGISTRATION_ROLE_EXIST"):"Invalid role":'Invalid role'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
            }
        }else {let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
        return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
      
    }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    } 
    // UPDATE DELIVERY BOY
    public async updateDeliveryBooy(user:UsersDTO,id:string,managerData: UsersDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role=== 'Admin' ||user.role === 'Manager'||user.role ==='Area Admin') {
               
            await this.userModel.findByIdAndUpdate(id, managerData,{new:true});
            let resMsg=language?await this.utilsService.sendResMsg(language,"DELIVERY_BOY_UPDATE")?await this.utilsService.sendResMsg(language,"DELIVERY_BOY_UPDATE"):"Delivey boy updated successfully":'Delivey boy updated successfully'
            return {response_code: 200, response_data: resMsg};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    // LIST DELIVERY BOY 
    public async deliveryBoyList(user: UsersDTO,page:number,limit:number,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager'||user.role ==='Area Admin') {
              
            const res = await this.userModel.find({ role: 'Delivery Boy' }).limit(limit).skip((page * limit) - limit).populate('locationId', 'locationName');
            const total = await this.userModel.countDocuments({role:'Delivery Boy'});
            return {response_code: HttpStatus.OK,response_data: {data:res,total}}
            }
            else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
      // LIST DELIVERY BOY  based on Area-AdminId
    public async deliveryBoyListBasedOnAreaAdminId(user: UsersDTO,page:number,limit:number,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role ==='Area Admin') {
            
            const res = await this.userModel.find({areaAdminId:user._id, role: 'Delivery Boy',status:true }).limit(limit).skip((page * limit) - limit).populate('locationId', 'locationName');
            const total = await this.userModel.countDocuments();
            console.log("zzzzzzzzzzzzzzzzzzz",res)
            return {response_code: HttpStatus.OK,response_data: {data:res,total}}
            }
            else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }


    // UPDATE DELIVERY BOY STATUS
    public async updateStatusDeliveryBooy(user:UsersDTO,id:string,deliverBoyStatusData: DeliverBoyStatusDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role == 'Admin'|| user.role==='Manager'|| user.role ==='Area Admin') {
                console.log("AreaAdminnnnnn",user)
            await this.userModel.findByIdAndUpdate(id, deliverBoyStatusData,{new:true});
            let resMsg=language?await this.utilsService.sendResMsg(language,"DELIVERY_BOY_STATUS_UPDATE")?await this.utilsService.sendResMsg(language,"DELIVERY_BOY_STATUS_UPDATE"):"Delivey boy status updated successfully":'Delivey boy status updated successfully'
            return {response_code: 200, response_data: resMsg};
            }else{let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
        }  
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }

    // DELIVERY BOY LIST TO ASSIGNED ORDER
    public async deliveryBoyListByLocation(user:UsersDTO,location: string,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role === 'Admin' || user.role === 'Manager'||user.role ==='Area Admin') {
                const res = await this.userModel.find({ role: 'Delivery Boy',status:1,locationId:location},'firstName noOfOrderAccepted').sort('noOfOrderAccepted');
                return {response_code: HttpStatus.OK, response_data: res};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    
     // DELIVERY BOY INFO
     public async deliveryBoyInfo(user:UsersDTO,location: string,language:string): Promise<CommonResponseModel> {
        try{
            if ( user && user.role === 'Delivery Boy') {
                const res = await this.userModel.findById(user._id,'-password -salt -location').populate('locationId','locationName address location');
                return {response_code: HttpStatus.OK, response_data: res};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
     //all mini admin list here
    public async minAdminList(user:UsersDTO,language:string):Promise<CommonResponseModel>{
       if(user.role==="Admin" ||user.role==='Manager'){
       
       const listData=await this.userModel.find({role:"Area Admin",status:1},).populate('locationId', 'locationName location');
       const total = await this.userModel.countDocuments();
       return{
           response_code:HttpStatus.OK,
           response_data:{data:listData,total}
       }
    }else{
        let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
        return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
       }

   }
    //all mini admin list here enable
    public async allListEnableAndDisable(user:UsersDTO,page:number,limit:number,language:string):Promise<CommonResponseModel>{
        if(user.role==="Admin" ||user.role==='Manager'){
        
        const listData=await this.userModel.find({role:"Area Admin",/*status:true*/}).limit(limit).skip((page * limit) - limit).populate('locationId', 'locationName location');
        const total = await this.userModel.countDocuments({role:"Area Admin"});
        return{
            response_code:HttpStatus.OK,
            response_data:{data:listData,total}
        }
     }else{
         let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
         return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
        }
    
    }
       //mini admin view
    public async viewMiniAdmin(id:string,user:UsersDTO,language:string):Promise<CommonResponseModel>{
        if(user.role==="Admin" || user.role ==='Manager'){
           const viewdata=await this.userModel.findById(id);
           return{
               response_code:HttpStatus.OK,
               response_data:viewdata
           }
        }
        let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
        return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
       }
    //location baseed mini-Admin
    public async locationbasedMiniAdmin(user:UsersDTO,location: string,language:string):Promise<CommonResponseModel>{
        try{
            if (user.role === 'Admin' || user.role === 'Manager') {
                const res = await this.userModel.find({ role: 'Area Admin',status:1,locationId:location},'firstName lastName  email mobileNumber locationArea',).populate('locationId','locationName',)
                // console.log("eeeeeeee",res)
                return {response_code: HttpStatus.OK, response_data: res};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }

    }
    //Area manger Update
    public async updateAreaAdmin(user:UsersDTO,id:string,araAdmin: UsersUpdateDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role !== 'Admin' && user.role !== 'Manager') {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            await this.userModel.findByIdAndUpdate(id, araAdmin,{new:true});
            let resMsg=language?await this.utilsService.sendResMsg(language,"Area_Admin_UPDATE")?await this.utilsService.sendResMsg(language,"Area_Admin_UPDATE"):"Area Admin updated successfully":'Area Admin updated successfully'
            return {response_code: 200, response_data: resMsg};
            
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
   // add new Area Admin
    public async addnewAreaAdmin(user:UsersDTO,userData: UsersDTO,language:string): Promise<CommonResponseModel> {
        try{
            if (user.role !== 'Admin'&& user.role !== 'Manager') {
                let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
                return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
            }
            if (userData.role === 'Area Admin') {
                const check = await this.userModel.findOne({ $or: [{ email: userData.email }, { mobileNumber: userData.mobileNumber }] });
                if (check) {
                    let resMsg = language ? await this.utilsService.sendResMsg(language, "EMAIL_OR_MOBILE_NUMBER_EXIST") ? await this.utilsService.sendResMsg(language, "EMAIL_OR_MOBILE_NUMBER_EXIST") : "Email or Mobile number alraedy exist" : 'Email or Mobile number alraedy exist'
                    return { response_code: 400, response_data: resMsg };
                }
                const { salt, hashedPassword } = await this.authService.hashPassword(userData.password);
                userData.salt = salt;
                userData.password = hashedPassword;
                userData.registrationDate = Date.now();
                userData.emailVerified = true;
                const verificationId = uuid();
                userData.verificationId = verificationId;
                const response = await this.userModel.create(userData);
                if (response._id) {
                   // console.log(1111111111111111,userData.locationId)
                    let res = await this.locationModel.findById(userData.locationId,'areaAdminId')
                    if(res.areaAdminId && res.areaAdminId.length){
        
                        res.areaAdminId.push(response._id)
                    }else{
                    
                        res.areaAdminId=[response._id];
                    }
                    await res.save()
                    
                }
                let resMsg=language?await this.utilsService.sendResMsg(language,"REGISTRATION_SUCCESS")?await this.utilsService.sendResMsg(language,"REGISTRATION_SUCCESS"):"Account created successfully":'Account created successfully'
                return {response_code: HttpStatus.CREATED,response_data: {message: resMsg},};
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"REGISTRATION_ROLE_EXIST")?await this.utilsService.sendResMsg(language,"REGISTRATION_ROLE_EXIST"):"Invalid role":'Invalid role'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
            }
        }catch(e){
            let resMsg=language?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR")?await this.utilsService.sendResMsg(language,"INTERNAL_SERVER_ERR"):"Internal server error":'Internal server error'
            return {response_code: 500, response_data: resMsg}; 
        }
    }
    //This API for when Manger login get All Area Admin lis
    public async  allAreaAdminList(user:UsersDTO,locationId: string,language:string):Promise<CommonResponseModel>{
        if(user.role==='Admin'|| user.role==='Manager'){

            const res=await this.userModel.find({role:'Area Admin',locationId:locationId}).populate('locationId','locationName')
           
            return {response_code: HttpStatus.OK,response_data:res,}
        }
        else{
        let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
        return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
       }
     }
     //This API  for location based delivery-boy
     public async locationBasedDeliveryBoY(locationId:string,user:UsersDTO,language:string):Promise<CommonResponseModel>{
         if(user.role==='Manager'||user.role=='Area Admin'){
            const res=await this.userModel.find({locationId:locationId,role:'Delivery Boy'}).populate('locationId','locationName')
           // const total = await this.userModel.countDocuments();
            return {response_code: HttpStatus.OK,response_data: res}
        }
        else{
        let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
        return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
       }
    }

    //when login Area Admin show all the delivery boy list
    public async loginAreaAdminshow(user:UsersDTO,language:string):Promise<CommonResponseModel>{
        if(user.role==='Area Admin'){
            const res=await this.userModel.find({areaAdminId:user._id,role:'Delivery Boy'}).populate('locationId','locationName')
            return{
                response_code:HttpStatus.OK,
                response_data:res
            }
        }
        else{
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
        return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
    }
     
}
