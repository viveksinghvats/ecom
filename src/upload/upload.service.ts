import {Injectable, HttpStatus, HttpService, Req, Res} from '@nestjs/common';
import {CommonResponseModel, globalConfig} from '../utils/app-service-data';
import * as geoLib from 'geolib';
const ImageKit = require("imagekit");
const ejs = require('ejs');
const appRoot = require('app-root-path');
var pdf = require('html-pdf')
const fs=require('fs');
const sgMail = require('@sendgrid/mail');
let imagekit;
@Injectable()
export class UploadService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_KEY);
        imagekit = new ImageKit({
            publicKey : process.env.ImageKitPublicKey,
            privateKey : process.env.ImageKitPrivateKey,
            urlEndpoint : process.env.ImageKitUrlEndpoint
        });
    }
    
    // seprate API for image uplodation via ImageKit
    public async imgeUploadtionViaImageKit(file, type: string):Promise<CommonResponseModel>{
        let buff = new Buffer(file.buffer);
        let base64data = buff.toString('base64');
        let fileName= Date.now()+'_original_'+file.originalname
        let imageURL=await imagekit.upload({
            file : base64data,
            fileName : fileName,
        })
        return{
            response_code: HttpStatus.OK,
            response_data: [{
                originalImage: {
                    url: `${process.env.ImageKitUrlEndpoint}tr:dpr-auto,tr:w-auto${imageURL.filePath}`,
                    key: imageURL.fileId,
                    filePath:imageURL.filePath
                }
            },  {
                thumbImage: {
                    url:imageURL.thumbnailUrl,
                    key: imageURL.fileId,
                    filePath:imageURL.filePath
                }
            }]
        }
    }
    public async xlsUploadToImageKit(base64data,fileName){
        let imageURL=await imagekit.upload({
            file : base64data,
            fileName : fileName,
        })
        return{
            url: imageURL.url,
            key: imageURL.fileId
        }
    }
    //delete imageKit uloded file
    public async deleteUplodedFile(fileId:string):Promise<CommonResponseModel>{
        try{
            console.log("res",fileId)
            const res=await imagekit.deleteFile(fileId);
            if(res){
                return{
                    response_code:HttpStatus.OK,
                    response_data:"deletd succesfully"
                }

            }else{
                return{
                    response_code:HttpStatus.OK,
                    response_data:"deletd succesfully"
                }
            }
            
        }catch(e){
            return{
                response_code:HttpStatus.OK,
                response_data:"deletd succesfully"
            }
        }
        
    }
    // sends email to the recipient
    public async sendEmail(email: string, subject: string, body: string, html?: string): Promise<any> {
        const msg = {
            to: email,
            from: process.env.SendGrid_from,
            subject: subject,
            text: body,
            html: html,
        };
        const response = await sgMail.send(msg);
        console.log("email response",response)
        return response;
    }
    
    // calculates the distance between two co-ordinates
    public calculateDistance(userLocation, storeLocation): number {
        const preciseDistance = geoLib.getPreciseDistance(storeLocation, userLocation);
        return preciseDistance / 1000;
    }
    //  ************MAIL AND INVOICE
    public async dataRenderToTemplate(orderData,businessInfo,currencyCode) {
        let dateSplit=orderData.deliveryDate.split("-");
        let originalDate=orderData.deliveryDate;
        if(dateSplit.length>2){
            if(dateSplit && dateSplit[2]){
                let z=dateSplit[2];
                let d=z[z.length-2]+z[z.length-1];
                originalDate=`${dateSplit[0]}/${dateSplit[1]}/${d}`
            }
        }
        var myMessage = {
            storeName:  businessInfo.storeName,
            logo:businessInfo.iconLogo.imageUrl,
            address:businessInfo.address,
            officeEmail:businessInfo.email,
            officeContact:businessInfo.phoneNumber,
            InvoiceID:orderData.orderID,
            deliveryDate:originalDate,
            paymentType:orderData.paymentType,
            userName:orderData.user.firstName,
            fullAddress:orderData.deliveryAddress.address,
            userContact:orderData.user.mobileNumber,
            userEmail:orderData.user.email,
            cart:orderData.cart.cart,
            subTotal: orderData.subTotal,
            deliveryCharges:orderData.deliveryCharges ,
            tax: orderData.tax,
            couponDiscount:orderData.cart.couponInfo?orderData.cart.couponInfo.couponDiscountAmount:0,
            grandTotal:orderData.grandTotal ,
            currency:currencyCode
        };
        let templatePath =`${appRoot.path}/components/order_invoice.ejs`
        let templateHtml =await fs.readFileSync(templatePath,'utf-8');
        let html_body = await ejs.render(templateHtml, myMessage);
        return html_body
    }
    public async invoicePdfGenerate(order,businessInfo,currencyCode){
        let html_body_pdf=await this.dataRenderToTemplate(order,businessInfo,currencyCode)
        let p=new Promise(function(resolve){
          var options = { "format": "Letter" };
          pdf.create(html_body_pdf, options).toFile("invoice.pdf", function (err, pdfRes) {
            if (err) {
              console.log("err.........." + err)
            }else {
              resolve(pdfRes.filename)
            }
          })
        })
        return p
    }
    public async sendOrderMail(orderData,businessInfo,currencyCode) {
        try{
            let pathToAttachment=await this.invoicePdfGenerate(orderData,businessInfo,currencyCode);
            console.log("inpathToAttachmentvoice-file" + JSON.stringify(pathToAttachment))
            let attachment = await fs.readFileSync(pathToAttachment).toString("base64");
            var myMessage = {
                name:  orderData.user.firstName,
                logo:businessInfo.iconLogo.imageUrl,
                image:businessInfo.webApp.imageUrl,
                banner:businessInfo.webApp.imageUrl,
                status: orderData.orderStatus,
                add:businessInfo.address
            };
            let templatePath =`${appRoot.path}/components/order.ejs`
            let templateHtml =await fs.readFileSync(templatePath,'utf-8');
            let html_body = await ejs.render(templateHtml, myMessage);
            const msg = {
                to:
                //"kumarsujeetraj68@gmail.com",
                orderData.user.email,
                from: process.env.SendGrid_from,
                subject: "Order Invoice",
                text: "Order Invoice",
                html: html_body,
                attachments: [
                    {
                      content: attachment,
                      filename: "invoice.pdf",
                      type: "application/pdf",
                      disposition: "attachment"
                    }
                ]
            };
            const response = await sgMail.send(msg);
            return response;

        }catch(e){
            console.log("MAIL SEND ERRRRRRRRRRRRRR",e)
        }
    }
    public async sendResMsg(languageCode,key) {
        let path =`${appRoot.path}/language/backend.json`
        let data = await fs.readFileSync(path, {encoding:'utf8', flag:'r'});
        data=JSON.parse(data);
        let msg="";
        let json=data.find(d=>d.languageCode===languageCode);
        if(json && json['backendJson']){
            if(json['backendJson'][key]){
                msg=json['backendJson'][key]
            }
        }
        console.log("msg..........",msg)
        return msg;
    }
    public async pushResMsg(languageCode,status) {
        console.log("push...........",languageCode,status)
        let path =`${appRoot.path}/language/backend.json`
        let data = await fs.readFileSync(path, {encoding:'utf8', flag:'r'});
        data=JSON.parse(data);
        let json=data.find(d=>d.languageCode===languageCode);
        if(!json){
            json=data.find(d=>d.isDefault===true);
        }
        if(json && json['backendJson']){
            let msg,title,text;
            if(status=="Pending"){
                msg=json['backendJson']["ORDER_PENDING_MSG"]?json['backendJson']["ORDER_PENDING_MSG"]:"Thank you for placing new order. we will keep you updated.";
                title=json['backendJson']["ORDER_PENDING_TITLE"]?json['backendJson']["ORDER_PENDING_TITLE"]:"Order has been placed";
                text=json['backendJson']["ORDER"]?json['backendJson']["ORDER"]:"Order";
            }else if(status=="Confirmed"){
                msg=json['backendJson']["ORDER_CONFIRMED_MSG"]?json['backendJson']["ORDER_CONFIRMED_MSG"]:"Your order has been confirmed. It will be delivered soon";
                title=json['backendJson']["ORDER_CONFIRMED_TITLE"]?json['backendJson']["ORDER_CONFIRMED_TITLE"]:"Order has been confirmed";
                text=json['backendJson']["ORDER"]?json['backendJson']["ORDER"]:"Order";
            }else if(status=="Out for delivery"){
                msg=json['backendJson']["ORDER_OUT_FOR_DELIVERY_MSG"]?json['backendJson']["ORDER_OUT_FOR_DELIVERY_MSG"]:"Our delivery person is on its way to deliver your order. we will contact you soon.";
                title=json['backendJson']["ORDER_OUT_FOR_DELIVERY_TITLE"]?json['backendJson']["ORDER_OUT_FOR_DELIVERY_TITLE"]:"Order is out for delivery";
                text=json['backendJson']["ORDER"]?json['backendJson']["ORDER"]:"Order";
            }else if(status=="DELIVERED"){
                msg=json['backendJson']["ORDER_DELIVERED_MSG"]?json['backendJson']["ORDER_DELIVERED_MSG"]:"We have delivered your order";
                title=json['backendJson']["ORDER_DELIVERED_TITLE"]?json['backendJson']["ORDER_DELIVERED_TITLE"]:"Thank you for choosing us";
                text=json['backendJson']["ORDER"]?json['backendJson']["ORDER"]:"Order";
                
            }else if(status=="Cancelled"){ 
                msg=json['backendJson']["ORDER_CANCELLED_MSG"]?json['backendJson']["ORDER_CANCELLED_MSG"]:"We will not be able to deliver your order. Our sincere apologies.";
                title=json['backendJson']["ORDER_CANCELLED_TITLE"]?json['backendJson']["ORDER_CANCELLED_TITLE"]:"Order has been cancelled";
                text=json['backendJson']["ORDER"]?json['backendJson']["ORDER"]:"Order";
            }else if(status=="Delivry Boy Order Assigned"){ 
                msg=json['backendJson']["ORDER_ASSIGNED_TO_DELIVERY_BOY_MSG"]?json['backendJson']["ORDER_ASSIGNED_TO_DELIVERY_BOY_MSG"]:"has been assigned to you.";
                title=json['backendJson']["ORDER_ASSIGNED_TO_DELIVERY_BOY_TITLE"]?json['backendJson']["ORDER_ASSIGNED_TO_DELIVERY_BOY_TITLE"]:"New Order Assigned";
                text=json['backendJson']["ORDER"]?json['backendJson']["ORDER"]:"Order";
            }
            return {text,title,msg}
        }
    }
}
