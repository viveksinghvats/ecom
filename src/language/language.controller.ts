import {Controller,Headers,Query, Body, Post, Put, Param, Delete, Get, UseGuards} from '@nestjs/common';
import {LanguageService} from './language.service';
import {LanguageDTO,StatusUpdateDTO} from './language.model';
import {CommonResponseModel} from '../utils/app-service-data';
import {UsersDTO} from '../users/users.model';
import {GetUser} from '../utils/user.decorator';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth} from '@nestjs/swagger';

@Controller('language')

export class LanguageController {
    constructor(private languageService: LanguageService) {
    }

    // ADD 
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/')
    public create(@GetUser() user: UsersDTO, @Body() languageData: LanguageDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.languageService.create(user, languageData,language);
    }

    // LIST
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()   
    @Get('/')
    public index(@GetUser() user: UsersDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.languageService.index(user,language);
    }

    // GET EN DATA ONLY
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/en/info')
    public getEngilshJson(@GetUser() user: UsersDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.languageService.getEngilshJson(user,language);
    }

    // SHOW
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()   
    @Get('/:id')
    public show(@GetUser() user: UsersDTO,@Param('id') id: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.languageService.show(user,id,language);
    }

    // UPDATE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Put('/:id')
    public upsert(@GetUser() user: UsersDTO, @Param('id') id: string, @Body() languageData: LanguageDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.languageService.upsert(user, id, languageData,language);
    }

    // STATUS UPDATE 
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Put('/status/:id')
    public statusUpdate(@GetUser() user: UsersDTO, @Param('id') id: string, @Body() statusUpdateDTO: StatusUpdateDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.languageService.statusUpdate(user, id, statusUpdateDTO,language);
    }
    
    
    // SET DEFAULT LANGUAGE
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth() 
    @Get('/default/:id')
    public setDefault(@GetUser() user: UsersDTO, @Param('id') id: string,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.languageService.setDefault(user, id,language);
    }

    //       ***************APIS FOR ALL NOT AUTHORIZE

    // LANGUAGE FOR USER APP, DELIVEY APP
    @Get('/user/info')
    public languageInfo(@Query() query,@Headers('language') language:string): Promise<CommonResponseModel> {
        return this.languageService.languageInfo(query,language);
    }
    
    // LANGUAGE JSON CMS AND WEB APP 
    @Get('/cms/web/json')
    public webCmsJson(@Headers() header:string):Promise<CommonResponseModel>{
        return this.languageService.webCmsJson(header);
    }

    // LANGUAGE LIST CMS AND WEB APP 
    @Get('/cms/web')
    public languageList(@Headers('language') language:string):Promise<CommonResponseModel>{
        return this.languageService.languageList(language);
    }
    // LANGUAGE LIST CMS AND WEB APP 
    @Get('/test/test/test')
    public jsonToFile():Promise<CommonResponseModel>{
        return this.languageService.jsonToFile();
    }

    
}
