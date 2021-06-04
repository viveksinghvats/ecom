import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingSchema } from './setting.model';
import {UploadService} from '../upload/upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Setting', schema: SettingSchema}])],
  providers: [SettingService,UploadService],
  controllers: [SettingController]
})
export class SettingModule {}
