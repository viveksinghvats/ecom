import {Module} from '@nestjs/common';
import {ProductsController} from './products.controller';
import {ProductsService} from './products.service';
import {MongooseModule} from '@nestjs/mongoose';
import {ProductsSchema} from './products.model';
import {DealsSchema} from '../deals/deals.model';
import {FavouritesSchema} from '../favourites/favourites.model';
import {CartSchema} from '../cart/cart.model';
import {CategoriesSchema} from '../categories/categories.model';
import {SubCategoryScema} from '../subcategory/subcategory.model';
import { SettingSchema } from '../setting/setting.model';
import {UploadService} from '../upload/upload.service';
import {UsersSchema} from '../users/users.model';
import{LocationsSchema} from '../locations/locations.model'

import {CouponsSchema} from '../coupons/coupons.model';

@Module({
    imports: [MongooseModule.forFeature([
        {name: 'Products', schema: ProductsSchema}, 
        {name: 'Locations', schema: LocationsSchema},

        {name: 'deals',schema: DealsSchema,}, 
        {name: 'Favourites',schema: FavouritesSchema,},
        {name: 'Cart',schema: CartSchema},
        {name: 'Categories', schema: CategoriesSchema},
        {name: 'Subcategories', schema: SubCategoryScema},
        {name: 'Setting', schema: SettingSchema},
        {name: 'Coupons', schema: CouponsSchema},
        {name: 'Users', schema: UsersSchema},
    ]),
    ],
    controllers: [ProductsController],
    providers: [ProductsService,UploadService],
    exports: [ProductsService]
})
export class ProductsModule {

}
