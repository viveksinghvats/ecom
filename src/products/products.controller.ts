import { ApiBearerAuth, ApiConsumes, ApiImplicitFile } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Body, Controller, UseInterceptors, Headers, UploadedFile, Delete, Get, Param, Patch, Post, Put, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { ProductsDTO, PuductStatusDTO } from './products.model';
import { GetUser } from '../utils/user.decorator';
import { UsersDTO } from '../users/users.model';
import { CommonResponseModel } from '../utils/app-service-data';

@Controller('products')

export class ProductsController {
    constructor(private productService: ProductsService) {

    }
    //*******************USER APIS ********************//

    // product detail by id for user 
    @Get('/info/:id')
    public productInfo(@Param('id') id: string, @Query() query, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.productInfo(id, query, language);
    }

    // home page apis list *
    @Get('/home/page')
    public homePage(@Query() query, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.homePage(query, language);
    }
    //home top deal list
    @Get('/home/top/deal')
    public homePageTopDeal(@Query() query, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.homePageTopDeal(query, language);
    }
    //  page apis list
    @Get('/home/deal/of/day')
    public homePageDealsOfDay(@Query() query, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.homePageDealsOfDay(query, language);
    }
    //  page apis list *
    @Get('/home/category')
    public homePageCategory(@Query() query, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.homePageCategory(query, language);
    }
    //  page apis list
    @Get('/home/product')
    public homePageProduct(@Query() query, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.homePageProduct(query, language);
    }
    // sends request to search products
    @Get('/search/:query')
    public searchProduct(@Param('query') search_key: string, @Query() query, @Headers('language') language: string) {
        return this.productService.searchProduct(search_key, query, language);
    }
     // sends request to search Category
     @Get('/search/category/:query')
     public searchCategory(@Param('query') search_key: string, @Query() query, @Headers('language') language: string) {
         return this.productService.searchCategory(search_key, query, language);
     }

    @Get('/by/category/:categoryId')
    public getProductsByCategory(@Param('categoryId') categoryId: string, @Query() query, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.getProductsByCategory(categoryId, query, language);
    }
    // sends request to get products by category
    @Get('/by/subcategory/:subCategoryId')
    public getProductsBySubCategory(@Param('subCategoryId') subCategoryId: string, @Query() query, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.getProductsBySubCategory(subCategoryId, query, language);
    }

    //*******************ADMIN/MANAGER APIS ********************//

    // EXPORT CSV
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('export/csv')
    public productExport(@GetUser() user: UsersDTO,@Query() query, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.productExport(user,query, language);
    }

    // GET EXPORTED FILE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/export/file/download')
    public getExportFile(@GetUser() user: UsersDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.getExportFile(user, language);
    }

    // DELETE EXPORTED FILE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Delete('/export/file/delete/:deleteKey')
    public orderExportDelete(@GetUser() user: UsersDTO, @Param('deleteKey') deleteKey: string, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.orderExportDelete(user, deleteKey, language);
    }
    
    // LIST 
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/:page/:limit')
    public index(@GetUser() user: UsersDTO, @Param('page') page: number, @Param('limit') limit: number, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.index(user, Number(page), Number(limit), language);
    }

    // SHOW
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('/:id')
    public show(@GetUser() user: UsersDTO, @Param('id') id: string, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.show(user, id, language);
    }

    // CREATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/')
    public create(@GetUser() user: UsersDTO, @Body() productData: ProductsDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.create(user, productData, language);
    }

    // UPDATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put('/:id')
    public upsert(@GetUser() user: UsersDTO, @Param('id') id: string, @Body() productData: ProductsDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.upsert(user, id, productData, language);
    }

    // STATUS UPDATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put('status/:id')
    public statusUpdate(@GetUser() user: UsersDTO, @Param('id') id: string, @Body() productStatusData: PuductStatusDTO, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.statusUpdate(user, id, productStatusData, language);
    }

    // IMPORT CSV
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/create/by-csv/import')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiImplicitFile({ name: 'file', required: true, description: 'Only csv file accepted' })
    public createProductByCsvImport(@UploadedFile() file,@GetUser() user: UsersDTO,@Query() query, @Headers('language') language: string): Promise<CommonResponseModel> {
        return this.productService.createProductByCsvImport(user,file,query, language);
    }
}
