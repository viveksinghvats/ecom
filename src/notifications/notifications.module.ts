import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsSchema } from './notifications.model';
import {UploadService} from '../upload/upload.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: 'Notifications', schema: NotificationsSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService,UploadService],
})
export class NotificationsModule {
}
