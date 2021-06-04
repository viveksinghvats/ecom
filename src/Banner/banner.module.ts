import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {BannerSchema} from './banner.model';
import {PassportModule} from '@nestjs/passport';
import {BannerController} from './banner.controller';
import {BannerService} from './banner.service';
import {UploadService} from '../upload/upload.service';

@Module({
    imports: [MongooseModule.forFeature([{name: 'Banner', schema: BannerSchema}]), PassportModule.register({defaultStrategy: 'jwt'})],
    controllers: [BannerController],
    providers: [BannerService,UploadService]
})
export class BannerModule {

}
