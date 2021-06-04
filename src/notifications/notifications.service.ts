import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonResponseModel } from '../utils/app-service-data';
import { UsersDTO } from '../users/users.model';
import { NotificationsModel, NotificationsDTO } from './notifications.model';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel('Notifications') private readonly notificationModel: Model<any>) {
  }

  // get's user based notifications
  public async getUserBasedNotifications(user: UsersDTO,language:string): Promise<CommonResponseModel> {
    if (user.role !== 'User') {
      return {
        response_code: HttpStatus.UNAUTHORIZED,
        response_data: 'Sorry !!. You are not allowed to access this api',
      };
    }
    const notifications = await this.notificationModel.find({ user: user._id });
    return { response_code: HttpStatus.OK, response_data: notifications };
  }
  //create notification 
  public async createNotication(notificationData:NotificationsDTO,language:string):Promise<CommonResponseModel>{
    const res=await this.notificationModel.create(notificationData);
    return{
      response_code:HttpStatus.OK,
      response_data:{messsage:"successfully created Notification ",res}
    }
  }
  //get All Notification
  public async showAllNotification(language:string):Promise<CommonResponseModel>{
    const res=await this.notificationModel.find({});
    return{
      response_code:HttpStatus.OK,
      response_data:res
    }
  }
  //show single notification by ID.
  public async showNotificationById(id:string,language:string):Promise<CommonResponseModel>{
    const res=await this.notificationModel.findById(id);
    return{
      response_code:HttpStatus.OK,
      response_data:res
    }
  }
  //delete notification
  public async deleteNotification(id:string,language:string):Promise<CommonResponseModel>{
    const res=await this.notificationModel.findByIdAndDelete(id);
    return{
      response_code:HttpStatus.OK,
      response_data:"Notification Deleted successfully"
    }
  }
}
