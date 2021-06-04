import {Controller, Post, UseInterceptors, UploadedFile, Delete, Param, UseGuards, Body, Req, Res} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiConsumes, ApiImplicitFile} from '@nestjs/swagger';
import {UploadService} from './upload.service';
import {UploadFileDTO,} from '../users/users.model';
import {CommonResponseModel} from '../utils/app-service-data';

@Controller('utils')
export class UploadController {
    constructor(private uploadService: UploadService) {

    }

    @Delete('/imgaeKit/delete/:fileId')
    public deletdImgageKitFile(@Param('fileId')fileId:string):Promise<CommonResponseModel>{
        return this.uploadService.deleteUplodedFile(fileId)
    }
    // File upload to ImgeKit API 
    @Post('/upload/file/imagekit')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiImplicitFile({name: 'file', required: true, description: 'Profile picture upload'})
    public imageKitProfileupload(@UploadedFile() file, @Body() data: UploadFileDTO):Promise<CommonResponseModel>{
        return this.uploadService.imgeUploadtionViaImageKit(file, data.type)
    }
}
