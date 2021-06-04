import {
    Controller,
    UseGuards,
    Post,
    Headers,
    UseInterceptors,
    UploadedFile,
    Delete,
    Param,
    Body,
    Get,
    Put,
    Patch,
    Query,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {CategoryService} from './categories.service';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth, ApiConsumes, ApiImplicitFile} from '@nestjs/swagger';
import {GetUser} from '../utils/user.decorator';
import {UsersDTO} from '../users/users.model';
import {CategoryDTO, CategoryStatusDTO} from './categories.model';
import {CommonResponseModel} from '../utils/app-service-data'; 

@Controller('categories')
export class CategoriesController {
    constructor(private categoryService: CategoryService) {

    }
 //search produts
 @Get('/search/:query')
 public searchProduct(@Param('query') search_key: string, @Query() query, @Headers('language') language: string) {
     return this.categoryService.searchCategory(search_key, query, language);
 }

    // LIST 
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/:page/:limit')
    public index(@GetUser() user: UsersDTO,@Param('page') page: number, @Param('limit') limit: number,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.categoryService.index(user,Number(page),Number(limit),language);
    }

    // SHOW
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/:id')
    public show(@GetUser() user: UsersDTO,@Param('id') id: string,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.categoryService.show(user,id,language);
    }
    
    // CREATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Post('/')
    public create(@GetUser() user: UsersDTO, @Body() categoryData: CategoryDTO,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.categoryService.create(user, categoryData,language);
    }

    // UPDATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Put('/:id')
    public upsert(@GetUser() user: UsersDTO,@Param('id') id: string, @Body() categoryData: CategoryDTO,@Headers('language') language:string ): Promise<CommonResponseModel> {
        return this.categoryService.upsert(user,id, categoryData,language);
    }

    // STATUS UPDATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Put('status/:id')
    public statusUpdate(@GetUser() user: UsersDTO,@Param('id')id:string,@Body()categoryStatusData:CategoryStatusDTO,@Headers('language') language:string ):Promise<CommonResponseModel>{
        return this.categoryService.statusUpdate(user,id,categoryStatusData,language);
    }

    // CATEGORY LIST TO ADD PRODUCT -ADMIN
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/list/to-add/product')
    public catListForProduct(@GetUser() user: UsersDTO,@Headers('language') language:string ):Promise<CommonResponseModel>{
        return this.categoryService.catListForProduct(user,language);
    }

    // CATEGORY & PRODUCT LIST  -ADMIN/MANAGER
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/list/with/product/:location')
    public categoryProductList(@GetUser() user: UsersDTO,@Param('location') location: string,@Headers('language') language:string ):Promise<CommonResponseModel>{
        return this.categoryService.categoryProductList(user,location,language);
    }
   
}
