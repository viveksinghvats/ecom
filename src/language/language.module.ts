import { Module } from '@nestjs/common';
import { LanguageService } from './language.service';
import { LanguageController } from './language.controller';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { LanguageSchema } from './language.model';
import {UploadService} from '../upload/upload.service';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Language', schema: LanguageSchema}]),
  PassportModule.register({defaultStrategy: 'jwt'})],
  providers: [LanguageService,UploadService],
  controllers: [LanguageController]
})
export class LanguageModule {}


// import { Module } from '@nestjs/common';
// import { BusinessService } from './business.service';
// import { BusinessController } from './business.controller';
// import { BusinessSchema } from './business.model';
// import { PassportModule } from '@nestjs/passport';
// import { MongooseModule } from '@nestjs/mongoose';

// @Module({
  // imports: [MongooseModule.forFeature([{name: 'Business', schema: BusinessSchema}]),
  //  PassportModule.register({defaultStrategy: 'jwt'})],
//   providers: [BusinessService],
//   controllers: [BusinessController]
// })
// export class BusinessModule {}

