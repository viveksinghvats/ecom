import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ChatSchema} from './chat.model';
import {LocationsSchema} from '../locations/locations.model'
import {ChatService} from './chat.service';
import {ChatController} from './chat.controller';
import {UploadService} from '../upload/upload.service';
import { from } from 'rxjs';

@Module({
    imports: [MongooseModule.forFeature([
        {name: 'Chat', schema: ChatSchema},
        {name: 'Locations', schema: LocationsSchema},

    ])],
    controllers: [ChatController],
    providers: [ChatService,UploadService]
})
export class ChatModule {

}
