import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {MongooseModule} from '@nestjs/mongoose';
import {DeliveryTaxSchema} from './delivery-tax.model';
import {DeliveryTaxController} from './delivery-tax.controller';
import {DeliveryTaxService} from './delivery-tax.service';
import {UploadService} from '../upload/upload.service';
import {CartSchema} from '../cart/cart.model';
import {LocationsSchema} from '../locations/locations.model'

@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'jwt'}),
        MongooseModule.forFeature([
            {name: 'DeliveryTaxSettings', schema: DeliveryTaxSchema}, 
            {name: 'Cart', schema: CartSchema},
            {name: 'Locations', schema: LocationsSchema},

        ])
    ],
    controllers: [DeliveryTaxController],
    providers: [DeliveryTaxService, UploadService]
})
export class DeliveryTaxModule {

}
