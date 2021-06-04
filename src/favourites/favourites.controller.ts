import {Body, Headers,Controller,Query, Delete, Get, Param, Post, UseGuards} from '@nestjs/common';
import {FavouritesService} from './favourites.service';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';
import {CommonResponseModel} from '../utils/app-service-data';
import {GetUser} from '../utils/user.decorator';
import {UsersDTO} from '../users/users.model';
import {FavouritesDTO} from './favourites.model';

@Controller('favourites')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class FavouritesController {
    constructor(private favouritesService: FavouritesService) {

    }

    // sends request to get list of user favourites
    @Get('/user') 
    public getUserFavourites(@GetUser() user: UsersDTO,@Query() query,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.favouritesService.getUserFavourites(user._id,query,language);
    }

    // sends request to get favourite information app not used
    @Get('/:favouriteId')
    public getFavouriteInfo(@Param('favouriteId') favouriteId: string,@Query() query,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.favouritesService.getFavouriteInfo(favouriteId,query,language);
    }

    // sends request to add product to favourites
    @Post('')
    public addProductToFavourite(@GetUser() user: UsersDTO,@Query() query, @Body() favouriteData: FavouritesDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.favouritesService.saveFavourite(user, favouriteData,query,language);
    }

    // sends request to delete favourite
    @Delete('/:favouriteId')
    public deleteFavourite(@GetUser() user: UsersDTO,@Query() query, @Param('favouriteId') favouriteId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.favouritesService.deleteFavourite(user, favouriteId,query,language);
    }

    // sends request to get favourite based on user id and product id
    @Get('/check/:productId')
    public checkIfProductIsAddedToFavourite(@GetUser() user: UsersDTO,@Query() query, @Param('productId') productId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.favouritesService.checkIfUserHasAddedProductToFavourite(user, productId,query,language);
    }
}
