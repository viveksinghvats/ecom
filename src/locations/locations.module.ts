import {Module} from '@nestjs/common';
import {LocationsController} from './locations.controller';
import {LocationsService} from './locations.service';
import {PassportModule} from '@nestjs/passport';
import {MongooseModule} from '@nestjs/mongoose';
import {LocationsSchema} from './locations.model';
import {ProductsSchema} from '../products/products.model';
import {UploadService} from '../upload/upload.service';
import {UsersSchema} from '../users/users.model'

@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'jwt'}),
        MongooseModule.forFeature([
            {name: 'Locations', schema: LocationsSchema},
            {name: 'Products', schema: ProductsSchema}, 
            {name: 'Users', schema: UsersSchema }, 
        ])
    ],
    controllers: [LocationsController],
    providers: [LocationsService, UploadService]
})
export class LocationsModule {
}
