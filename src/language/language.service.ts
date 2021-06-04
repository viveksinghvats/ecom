import {Injectable, HttpStatus} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {UsersDTO} from '../users/users.model';
import {LanguageDTO,StatusUpdateDTO} from './language.model';
import {CommonResponseModel} from '../utils/app-service-data';
import { UploadService } from '../upload/upload.service'; 
const appRoot = require('app-root-path');
const fs =require('fs');




@Injectable()
export class LanguageService {
    constructor(
        @InjectModel('Language') private readonly languageModel: Model<any>,
        private utilsService: UploadService) {
    }
    // CHECK JSON
    public async checkJson(sourceKey,inputKey){
        let allFounded = sourceKey.filter( ai => !inputKey.includes(ai) );  
        if(allFounded && allFounded.length){
            let str=""
            allFounded.forEach((element,index) => {
                if(index>0){
                    str+=","+element
                }else{
                    str+=element
                }
            });
            return {isValid:false,message:str}
        }else{
            return {isValid:true,message:"Success"}
        }  
    }
    // VALIDATION
    public async validateJson(sourcData,inputData,type){
        let sourceKey,inputKey;
        if(type==="backendJson"){
            sourceKey=Object.keys(sourcData.backendJson)
            inputKey=Object.keys(inputData.backendJson)
        }if(type==="deliveyAppJson"){
            sourceKey=Object.keys(sourcData.deliveyAppJson)
            inputKey=Object.keys(inputData.deliveyAppJson)
        }if(type==="webJson"){
            sourceKey=Object.keys(sourcData.webJson)
            inputKey=Object.keys(inputData.webJson)
        }if(type==="mobAppJson"){
            sourceKey=Object.keys(sourcData.mobAppJson)
            inputKey=Object.keys(inputData.mobAppJson)
        }if(type==="cmsJson"){
            sourceKey=Object.keys(sourcData.cmsJson)
            inputKey=Object.keys(inputData.cmsJson)
        }
        console.log(sourceKey)
        console.log(inputKey)
        let isValidated=await this.checkJson(sourceKey,inputKey)
        return isValidated
    }
    // PARSE TO JSON
    public parseJson(sourcData){
        sourcData.webJson=JSON.parse(sourcData.webJson);
        sourcData.deliveyAppJson=JSON.parse(sourcData.deliveyAppJson);
        sourcData.mobAppJson=JSON.parse(sourcData.mobAppJson);
        sourcData.cmsJson=JSON.parse(sourcData.cmsJson);
        sourcData.backendJson=JSON.parse(sourcData.backendJson);
        return sourcData
    }

    // PARSE TO JSON
    public async jsonToFile(){ 
        try{
            let resData = await this.languageModel.find({status:1},'languageCode languageName backendJson isDefault');
            if(resData.length){
                let path =`${appRoot.path}/language/backend.json`
                await fs.writeFileSync(path,JSON.stringify(resData),'utf8');
                console.log("JSON WRITE DONE........")
            }
            return {response_code: HttpStatus.OK, response_data: "ok"};
        }catch(e){
            console.log("JSON_WRITE ERR",e.message)
            return {response_code: HttpStatus.OK, response_data: "ok"};
        }
    }


    // SAVE
    public async create(user: UsersDTO, languageData: LanguageDTO,language:string): Promise<CommonResponseModel> {
        languageData=await this.parseJson(languageData)
        let validatedRes;
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
        }
        let check =await this.languageModel.findOne({languageCode:languageData.languageCode},'_id');
        if(check){
            let resMsg=language?await this.utilsService.sendResMsg(language,"LANGUAGE_EXIST")?await this.utilsService.sendResMsg(language,"LANGUAGE_EXIST"):"Language already exist":'Language already exist'
            return {response_code: 400, response_data: resMsg};
        }
        let validate =await this.languageModel.findOne({languageCode:"en"});
        if(validate){
            validatedRes=await this.validateJson(validate,languageData,"backendJson");
            let resMsg=language?await this.utilsService.sendResMsg(language,"LANGUAGE_VALIDATE")?await this.utilsService.sendResMsg(language,"LANGUAGE_VALIDATE"):"Required fields":'Required fields'
            if(!validatedRes.isValid){
                return {response_code: 400, response_data: `${validatedRes.message} ${resMsg}`};
            }
            validatedRes=await this.validateJson(validate,languageData,"deliveyAppJson");
            if(!validatedRes.isValid){
                return {response_code: 400, response_data: `${validatedRes.message} ${resMsg}`};
            }
            validatedRes=await this.validateJson(validate,languageData,"webJson");
            if(!validatedRes.isValid){
                return {response_code: 400, response_data: `${validatedRes.message} ${resMsg}`};
            }
            validatedRes=await this.validateJson(validate,languageData,"mobAppJson");
            if(!validatedRes.isValid){
                return {response_code: 400, response_data: `${validatedRes.message} ${resMsg}`};
            }
            validatedRes=await this.validateJson(validate,languageData,"cmsJson");
            if(!validatedRes.isValid){
                return {response_code: 400, response_data: `${validatedRes.message} ${resMsg}`};
            }
            const res = await this.languageModel.create(languageData);
            await this.jsonToFile()
            resMsg=language?await this.utilsService.sendResMsg(language,"LANGUAGE_SAVED")?await this.utilsService.sendResMsg(language,"LANGUAGE_SAVED"):"Language added successfully":'Language added successfully'
            return {response_code: HttpStatus.CREATED, response_data: resMsg};
        }else{
            let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
            return {response_code: 400, response_data: resMsg};
        }
    }

    // LIST
    public async index(user: UsersDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
        }
        const resData = await this.languageModel.find({});
        return {response_code: HttpStatus.OK, response_data: resData};
    }

    // GET EN JSON 
    public async getEngilshJson(user: UsersDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
        const resData = await this.languageModel.findOne({languageCode:"en"});
        return {response_code: HttpStatus.OK, response_data: resData};
    }

    // SHOW
    public async show(user: UsersDTO,id:string,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
        }
        const resData = await this.languageModel.findById(id);
        return {response_code: HttpStatus.OK, response_data: resData};
    }

    // UPSERT
    public async upsert(user: UsersDTO,id:string, languageData: LanguageDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
        }
        languageData=await this.parseJson(languageData)
        if(languageData.languageCode=="en"){
            await this.languageModel.findByIdAndUpdate(id, languageData,{new:true});
            let resMsg=language?await this.utilsService.sendResMsg(language,"LANGUAGE_UPDATED")?await this.utilsService.sendResMsg(language,"LANGUAGE_UPDATED"):"Language updated successfully":'Language updated successfully'
            return {response_code: HttpStatus.OK,response_data: resMsg};
        }else{
            let validate =await this.languageModel.findOne({languageCode:"en"});
            let validatedRes;
            if(validate){
                let resMsg=language?await this.utilsService.sendResMsg(language,"LANGUAGE_VALIDATE")?await this.utilsService.sendResMsg(language,"LANGUAGE_VALIDATE"):"Required fields":'Required fields'
                validatedRes=await this.validateJson(validate,languageData,"backendJson");
                if(!validatedRes.isValid){
                    return {response_code: 400, response_data: `${validatedRes.message} ${resMsg}`};
                }
                validatedRes=await this.validateJson(validate,languageData,"deliveyAppJson");
                if(!validatedRes.isValid){
                    return {response_code: 400, response_data: `${validatedRes.message} ${resMsg}`};
                }
                validatedRes=await this.validateJson(validate,languageData,"webJson");
                if(!validatedRes.isValid){
                    return {response_code: 400, response_data: `${validatedRes.message} ${resMsg}`};
                }
                validatedRes=await this.validateJson(validate,languageData,"mobAppJson");
                if(!validatedRes.isValid){
                    return {response_code: 400, response_data: `${validatedRes.message} ${resMsg}`};
                }
                validatedRes=await this.validateJson(validate,languageData,"cmsJson");
                if(!validatedRes.isValid){
                    return {response_code: 400, response_data: `${validatedRes.message} ${resMsg}`};
                }
                await this.languageModel.findByIdAndUpdate(id, languageData,{new:true});
                await this.jsonToFile()
                resMsg=language?await this.utilsService.sendResMsg(language,"LANGUAGE_UPDATED")?await this.utilsService.sendResMsg(language,"LANGUAGE_UPDATED"):"Language updated successfully":'Language updated successfully'
                return {response_code: HttpStatus.OK,response_data: resMsg};
            }else{
                let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
                return {response_code: 400, response_data: resMsg};            
            }
         }
        
    }

    // STATUS UPDATE
    public async statusUpdate(user: UsersDTO,id:string,statusDto: StatusUpdateDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
        }
        await this.languageModel.findByIdAndUpdate(id,statusDto,{new:true});
        await this.jsonToFile()
        let resMsg=language?await this.utilsService.sendResMsg(language,"LANGUAGE_STATUS_UPDATED")?await this.utilsService.sendResMsg(language,"LANGUAGE_STATUS_UPDATED"):"Language status updated successfully":'Language status updated successfully'
        return {response_code: HttpStatus.OK,response_data: resMsg};
    }

    // SET DEFAULT
    public async setDefault(user: UsersDTO,id:string,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'Admin') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg}; 
        }
        await this.languageModel.updateMany({}, {isDefault:0});
        await this.languageModel.findByIdAndUpdate(id,{isDefault:1},{new:true});
        await this.jsonToFile()
        let resMsg=language?await this.utilsService.sendResMsg(language,"LANGUAGE_SET_DEFAULT")?await this.utilsService.sendResMsg(language,"LANGUAGE_SET_DEFAULT"):"Your selected language set as default":'Your selected language set as default'
        return {response_code: HttpStatus.OK,response_data: resMsg};
    }
    
    // LANGUAGE LIST WEB CMS
    public async languageList(language:string):Promise<CommonResponseModel>{
        const languageList=await this.languageModel.find({status:1},'languageCode languageName isDefault');
        return{response_code:200,response_data:languageList}
    }
    // LANGUAGE  APP ,DELIVERY APP
    public async languageInfo(query,language:string):Promise<CommonResponseModel>{
        console.log("query",query)
        if(query && query.req_from){
            let filterQuery={}
            if(query.language_code){
                filterQuery["languageCode"]=query.language_code
            }else{
                filterQuery["isDefault"]=1
            }
            console.log("filterQuery",filterQuery)
            let language=await this.languageModel.findOne(filterQuery,`${query.req_from} languageCode`) as any;
            let newObj=new Object();
            newObj[`${language.languageCode}`]=language[`${query.req_from}`];
            const languageList=await this.languageModel.find({status:1},'languageCode languageName isDefault');
            let langCode=languageList.map(d=>d.languageCode)
            let langName=languageList.map(d=>d.languageName)
            let defaultCode=languageList.filter(d=>d.isDefault==true);
            return{response_code:200,response_data:{defaultCode:defaultCode[0],json:newObj,langCode,langName}}
        }else{
            let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
            return {response_code: 400, response_data: resMsg};        
        }
    }
    //LANGUAGE  WEB APP ,CMS
    public async webCmsJson(header){
        if(header && header.req_from){
            let filterQuery={}
            if(header.language && header.language!=='nil'){
                filterQuery["languageCode"]=header.language
            }else{
                filterQuery["isDefault"]=1
            }
            console.log("filterQuery",filterQuery)
            const language=await this.languageModel.findOne(filterQuery,`${header.req_from}`);
            return language[`${header.req_from}`]
        }else{
            return "Something went wrong"
        }
    }
        
}
