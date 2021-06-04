import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {CommonResponseModel, globalConfig} from '../utils/app-service-data';
import {UsersDTO, UsersUpdateDTO} from '../users/users.model';
import {CartDataModel, CartDTO, CartModel, DeleteCartProductDTO, UpdateCartDTO} from './cart.model';
import {ProductsDTO} from '../products/products.model';
import {CouponsDTO,CouponCodeDTO} from '../coupons/coupons.model';
import {UploadService} from '../upload/upload.service';
import {DeliveryTaxDTO,DeliveryTypeEnum} from '../delivery-tax-info/delivery-tax.model';

@Injectable()
export class CartService {
    constructor(
        @InjectModel('Cart') private readonly cartModel: Model<any>,
        @InjectModel('Products') private readonly productsModel: Model<any>, 
        @InjectModel('Coupons') private readonly couponModel: Model<any>,
        @InjectModel('Users') private readonly usersModel: Model<any>,
        @InjectModel('DeliveryTaxSettings') private readonly deliveryModel: Model<any>,
        @InjectModel('Address') private readonly addressModel: Model<any>,
        @InjectModel('Locations') private readonly locationModel: Model<any>,
        private utilsService: UploadService,

        ) {

    }
    // get's user's cart list
    public async getUsersCartList(userId: string,query:any,language:string): Promise<CommonResponseModel> {
        console.log("QUERY MAIN HOME PAGE",query)

        if(!query.location){
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
        }
        const cartData = await this.cartModel.findOne({user: userId,isOrderLinked: false}).populate('coupon').populate('cart.productId').populate('product');
        if(cartData){
            if(cartData && cartData.location && cartData.location.toString()!==query.location.toString()){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "FIRST_REMOVE_LOCATION") ? await this.utilsService.sendResMsg(language, "FIRST_REMOVE_LOCATION") : "It appears that you have products of another location added to cart, By adding this item you cart will be reset." : 'It appears that you have products of another location added to cart, By adding this item you cart will be reset.'
                return {response_code: 403,response_data: {message:resMsg,cartId:cartData._id}};
            }
            return {response_code: HttpStatus.OK, response_data:cartData};
        }else{
            let resMsg=language?await this.utilsService.sendResMsg(language,"CART_ITEM_NOT_FOUND")?await this.utilsService.sendResMsg(language,"CART_ITEM_NOT_FOUND"):"You have not added items to cart":'You have not added items to cart'
            return {response_code: HttpStatus.OK, response_data: resMsg};
        }
    } 

    // saves cart info
    public async saveCartData(user: UsersDTO,query:any, cartData: CartDTO,language:string): Promise<CommonResponseModel> {
        console.log("QUERY saveCartData",query)
        if (user.role !== 'User') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        } else {
            if(!query.location){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
            }
            const check = await this.cartModel.findOne({user: user._id, isOrderLinked: false});
            console.log("check................",check)
            if(check && check.location && check.location.toString()!==query.location.toString()){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "FIRST_REMOVE_LOCATION") ? await this.utilsService.sendResMsg(language, "FIRST_REMOVE_LOCATION") : "It appears that you have products of another location added to cart, By adding this item you cart will be reset." : 'It appears that you have products of another location added to cart, By adding this item you cart will be reset.'
                return {response_code: 403,response_data: {message:resMsg,cartId:check._id}};
            }
            let cartInfo: CartDataModel = {
                isFreeDelivery:false,
                cart: [],
                subTotal: 0,
                tax: 0,
                grandTotal: 0,
                deliveryCharges: 0,
                isOrderLinked: false,
                user: user._id,
                location:query.location,
                products: check ? (check.products ? check.products : []) : [],

            };
            console.log("cartInfo................",cartInfo)

            if (!check) {
                console.log("INSIDE NOT CHECKED")

                const productInfo = await this.productsModel.findById(cartData.productId) as ProductsDTO;
                if (productInfo) {
                    if(productInfo && productInfo.variant && productInfo.variant.length){
                        const productIndex = productInfo.variant.findIndex(val => val.unit == cartData["unit"]);
                        if (productIndex === -1) {
                        } else {
                            if(productInfo.variant[productIndex].productstock<cartData.quantity){
                                let resMsg=language?await this.utilsService.sendResMsg(language,"CART_ITEM_LEFT")?await this.utilsService.sendResMsg(language,"CART_ITEM_LEFT"):"Quantity Only left":'Quantity Only left'
                                return {
                                    response_code: 400,
                                    response_data: `${productInfo.variant[productIndex].productstock} ${resMsg}`,
                                };
                            }
                        }
                    }else{
                        let resMsg=language?await this.utilsService.sendResMsg(language,"CART_ITEM_OUT_OF_STOCK")?await this.utilsService.sendResMsg(language,"CART_ITEM_OUT_OF_STOCK"):"Product out of stock":'Product out of stock'
                        return {
                            response_code: 400,
                            response_data: resMsg,
                        };
                    }
                    const data = this.setCartInfo(productInfo, cartData);
                    cartInfo.cart.push(data);
                    cartInfo.products.push(data.productId);
                    const response = await this.calculateTotalAndSaveCart(cartInfo, 'save', null);
                    console.log("final cartInfo",cartInfo)

                    if (response._id) {
                        const updatedCart = await this.cartModel.findOne({user: user._id,isOrderLinked: false,}).populate('coupon');
                        return {response_code: HttpStatus.OK, response_data: updatedCart, extra: response._id};
                    } else {
                        let resMsg=language?await this.utilsService.sendResMsg(language,"CART_ITEM_NOT_ADDED")?await this.utilsService.sendResMsg(language,"CART_ITEM_NOT_ADDED"):"Could not add product to cart":'Could not add product to cart'
                        return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
                    }
                }
            } else {
                cartInfo =check;
                const productInfo = await this.productsModel.findById(cartData.productId) as ProductsDTO;
                if (productInfo) {
                    if(productInfo && productInfo.variant && productInfo.variant.length){
                        const index = productInfo.variant.findIndex(val => val.unit == cartData["unit"]);
                        if (index === -1) {
                        } else {
                            if(productInfo.variant[index].productstock<cartData.quantity){
                                let resMsg=language?await this.utilsService.sendResMsg(language,"CART_ITEM_LEFT")?await this.utilsService.sendResMsg(language,"CART_ITEM_LEFT"):"Quantity Only left":'Quantity Only left'
                                return {
                                    response_code: 400,
                                    response_data: `${productInfo.variant[index].productstock} ${resMsg}`,
                                };
                            }
                        }
                    }else{
                        let resMsg=language?await this.utilsService.sendResMsg(language,"CART_ITEM_OUT_OF_STOCK")?await this.utilsService.sendResMsg(language,"CART_ITEM_OUT_OF_STOCK"):"Product out of stock":'Product out of stock'
                        return {
                            response_code: 400,
                            response_data: resMsg,
                        };
                    }
                    const productIndex = cartInfo.cart.findIndex(val => val.productId == cartData.productId);
                    if (productIndex === -1) {
                        const data = this.setCartInfo(productInfo, cartData);
                        cartInfo.cart.push(data);
                        cartInfo.products.push(data.productId);
                    } else {
                        cartInfo.cart[productIndex].quantity = cartData.quantity;
                    }
                    const response = await this.calculateTotalAndSaveCart(cartInfo, 'update', check._id);
                    const updatedCart = await this.cartModel.findOne({user: user._id, isOrderLinked: false}).populate('coupon');
                    return {response_code: HttpStatus.OK, response_data: updatedCart};
                }
            }
        }
    }
    private async deliveryChargeCalculation(cart,storeDeliverySettings,userLatLng) {
        let deliveryCharge=0
        if(storeDeliverySettings.minimumOrderAmount && cart.subTotal>=storeDeliverySettings.minimumOrderAmount){
            deliveryCharge=0;
        }else{
            if(storeDeliverySettings.deliveryType === DeliveryTypeEnum.flexible){
                let location=await this.locationModel.findById(cart.location,'location');
                if(location && location.location && location.location.coordinates && location.location.coordinates.length){
                    const adminLocation= {latitude: location.location.coordinates[1], longitude: location.location.coordinates[0]};
                    const userLocation= {latitude: userLatLng.location.lat, longitude: userLatLng.location.long};
                    const preciseDistance = this.utilsService.calculateDistance(adminLocation, userLocation);
                    deliveryCharge = Number((storeDeliverySettings.deliveryChargePerKm * preciseDistance).toFixed(2)); 
                }
            }else{
                deliveryCharge = Number((storeDeliverySettings.fixedDeliveryCharges).toFixed(2));
            }
        }

        return deliveryCharge
    }
    private taxCalculation(cart,deliveryAndTaxSetting) {
        let tax=Number((cart.subTotal*deliveryAndTaxSetting.taxAmount/100).toFixed(2));
        console.log("taxxxxxxxxxxxxx",tax)
        return tax;
    }
    // calculate cart sub total and grand total and save cart ObjectId("")
    private async calculateTotalAndSaveCart(cartInfo: CartDataModel, type: string, cartId: string) {
        const adminSettings=await this.deliveryModel.findOne({})
        cartInfo.subTotal = 0;
        cartInfo.grandTotal = 0;
        cartInfo.cart.forEach(cart => {
            cart.dealTotalAmount = (cart.dealAmountOneProd) * cart.quantity;
            cart.productTotal = Number(((cart.price-cart.dealAmountOneProd) * cart.quantity).toFixed(2));
            cartInfo.subTotal +=Number((cart.productTotal).toFixed(2));//Ampil
        });
        cartInfo.subTotal=Number(cartInfo.subTotal.toFixed(2));
        cartInfo.tax = this.taxCalculation(cartInfo,adminSettings);
        cartInfo.taxInfo={taxName:adminSettings.taxName?adminSettings.taxName:"GST",amount:adminSettings.taxAmount}
        if(cartInfo.deliveryAddress){
            let address=await this.addressModel.findById(cartInfo.deliveryAddress,'location')
            if(address && address["location"]){
                cartInfo.deliveryCharges= await this.deliveryChargeCalculation(cartInfo,adminSettings,address)
            }
        }
        cartInfo.isFreeDelivery=false;
        if(cartInfo.deliveryCharges===0 && cartInfo.deliveryAddress){
            cartInfo.isFreeDelivery=true;
        }
        let couponCharge=0;
        if(cartInfo && cartInfo.couponInfo && cartInfo.couponInfo["couponDiscountAmount"]){
            couponCharge= cartInfo.couponInfo["couponDiscountAmount"];
        }
        cartInfo.grandTotal = Number((cartInfo.subTotal + cartInfo.tax + cartInfo.deliveryCharges-couponCharge).toFixed(2));
        
        if (type === 'save') {
            const res = await this.cartModel.create(cartInfo);
            return res;
        } else {
            const response = await this.cartModel.findByIdAndUpdate(cartId, cartInfo,{new:true});
            return response;
        }
    }
    private async calculateTotalAndUpdateMultiCart(cartInfo: CartDataModel, type: string, cartId: string) {
        const list = await this.deliveryModel.find();
        const adminSettings: DeliveryTaxDTO = list[0];
        cartInfo.subTotal = 0;
        cartInfo.grandTotal = 0;
        cartInfo.cart.forEach(cart => {
            cart.dealTotalAmount = (cart.dealAmountOneProd) * cart.quantity;
            cart.productTotal = Number(((cart.price-cart.dealAmountOneProd) * cart.quantity).toFixed(2));
            cartInfo.subTotal += cart.productTotal;
        });
        cartInfo.subTotal=Number(cartInfo.subTotal.toFixed(2));
        cartInfo.tax = this.taxCalculation(cartInfo,adminSettings);
        cartInfo.taxInfo={taxName:adminSettings["taxName"]?adminSettings["taxName"]:"GST",amount:adminSettings.taxAmount}
        if(cartInfo.deliveryAddress){
            let address=this.addressModel.findById(cartInfo.deliveryAddress,'location')
            if(address && address["location"]){
                cartInfo.deliveryCharges= await this.deliveryChargeCalculation(cartInfo,adminSettings,address)
            }
        }
        cartInfo.isFreeDelivery=false;
        if(cartInfo.deliveryCharges===0 && cartInfo.deliveryAddress){
            cartInfo.isFreeDelivery=true;
        }
        if(cartInfo && cartInfo.couponInfo && cartInfo.couponInfo["couponDiscountAmount"]){
            cartInfo.coupon=null;
            cartInfo.couponInfo=null;
        }
        cartInfo.grandTotal = Number((cartInfo.subTotal + cartInfo.tax+ cartInfo.deliveryCharges).toFixed(2));
        const response = await this.cartModel.findByIdAndUpdate(cartId, cartInfo,{new:true});
        return response
    }

    // sets product information and returns cart data
    private setCartInfo(productInfo: ProductsDTO, cartData: CartDTO): CartModel {
        //finding price here
        let price;
        let originalPrice;
        for (let i = 0; i < productInfo.variant.length; i++) {
            if (productInfo.variant[i]['unit'] == cartData['unit']) {
                price = Number(productInfo.variant[i]['price']);
            }
        }
        //unit finding
        let unit; 
        for (let j = 0; j < productInfo.variant.length; j++) {
            if (productInfo.variant[j]['title'] == cartData.variantsName) {
                unit = productInfo.variant[j]['unit'];
            }
        }
        originalPrice = price;

        let delaPercent=0,dealAmount=0,isDealAvailable=false;
        if (productInfo.isDealAvailable) {
            delaPercent=productInfo.delaPercent;
            isDealAvailable=true;
            dealAmount=Number((Number(productInfo.delaPercent)*(Number(originalPrice))/100).toFixed(2))
        }
        //dscription
        let cartInfo: CartModel = {
            productId: productInfo._id,
            title: productInfo.title,
            variantsName: productInfo.title,
            productName: productInfo.title,
            filePath: productInfo.filePath,
            quantity: Number(cartData.quantity),
            imageUrl:productInfo.imageUrl,
            price: originalPrice,
            productTotal: Number(originalPrice) * cartData.quantity,
            description: productInfo.description,
            unit: cartData['unit'],
            // weight: productInfo.weight,
            dealAmountOneProd:dealAmount,
            delaPercent:delaPercent,
            dealTotalAmount:dealAmount *cartData.quantity,
            isDealAvailable:isDealAvailable


        };


        return cartInfo;

    }

    // updates cart item
    public async updateCartItem(user: UsersDTO,query:any, cartData: UpdateCartDTO,language:string): Promise<CommonResponseModel> {
        console.log("QUERY updateCartItem",query)
        if (user.role !== 'User') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        } else {
            if(!query.location){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
            }
            const cartInfo = await this.cartModel.findOne({_id: cartData.cartId, isOrderLinked: false}) as CartDataModel;
            if(cartInfo && cartInfo.location && cartInfo.location.toString()!==query.location.toString()){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "FIRST_REMOVE_LOCATION") ? await this.utilsService.sendResMsg(language, "FIRST_REMOVE_LOCATION") : "It appears that you have products of another location added to cart, By adding this item you cart will be reset." : 'It appears that you have products of another location added to cart, By adding this item you cart will be reset.'
                return {response_code: 403,response_data: {message:resMsg,cartId:cartInfo._id}};
            }
            if (cartInfo) {
                const index = cartInfo.cart.findIndex(val => val.productId == cartData.productId);
                if (index !== -1) {
                    const product = await this.productsModel.findOne({_id:cartData.productId,status:1});
                    if(product && product.variant && product.variant.length){
                        const productIndex = product.variant.findIndex(val => val.unit == cartInfo.cart[index].unit);
                        if (productIndex === -1) {
                        } else {
                            if(product.variant[productIndex].productstock<cartData.quantity){
                                let resMsg=language?await this.utilsService.sendResMsg(language,"CART_ITEM_LEFT")?await this.utilsService.sendResMsg(language,"CART_ITEM_LEFT"):"Quantity Only left":'Quantity Only left'
                                return {response_code: 400,response_data: `${product.variant[productIndex].productstock} ${resMsg}`,};
                            }
                        }
                    }else{
                        let resMsg=language?await this.utilsService.sendResMsg(language,"CART_ITEM_OUT_OF_STOCK")?await this.utilsService.sendResMsg(language,"CART_ITEM_OUT_OF_STOCK"):"Product out of stock":'Product out of stock'
                        return {response_code: 400,response_data: resMsg,};
                    }
                    cartInfo.cart[index].quantity = cartData.quantity;
                    await this.calculateTotalAndSaveCart(cartInfo, 'update', cartData.cartId);
                    const updatedCart = await this.cartModel.findOne({user: user._id, isOrderLinked: false}).populate('coupon');
                    return {response_code: HttpStatus.OK, response_data: updatedCart};
                } else {
                    let resMsg=language?await this.utilsService.sendResMsg(language,"CART_ITEM_OUT_OF_STOCK")?await this.utilsService.sendResMsg(language,"CART_ITEM_OUT_OF_STOCK"):"Product out of stock":'Product out of stock'
                    return {response_code: 400,response_data: resMsg};
                }
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"CART_NOT_FOUND")?await this.utilsService.sendResMsg(language,"CART_NOT_FOUND"):"Cart not found":'Cart not found'
                return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
            }
        }
    }

    // deletes product from cart
    public async deleteProductFromCart(user: UsersDTO, query:any,cartData: DeleteCartProductDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'User') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        } else {
            console.log("QUERY deleteProductFromCart",query)
            if(!query.location){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
            }
            const cartInfo = await this.cartModel.findById(cartData.cartId) as CartDataModel;
            if (cartInfo) {
                const productIndex = cartInfo.cart.findIndex(list => list.productId == cartData.productId);
                if (productIndex !== -1) {
                    cartInfo.cart.splice(productIndex, 1);
                    const pIndex = cartInfo.products.findIndex(p => p == cartData.productId);
                    if (pIndex !== -1) {
                        cartInfo.products.splice(pIndex, 1);
                    }
                    if (cartInfo.cart.length > 0) {
                        await this.calculateTotalAndSaveCart(cartInfo, 'update', cartData.cartId);
                        const updatedCart = await this.cartModel.findOne({user: user._id,isOrderLinked: false,}).populate('coupon');
                        return {response_code: HttpStatus.OK, response_data: updatedCart};
                    } else {
                        await this.cartModel.findByIdAndDelete(cartData.cartId);
                        let resMsg=language?await this.utilsService.sendResMsg(language,"CART_EMPTY")?await this.utilsService.sendResMsg(language,"CART_EMPTY"):"Your cart is empty":'Your cart is empty'
                        return {response_code: HttpStatus.OK, response_data: resMsg};
                    }
                }
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"CART_NOT_FOUND")?await this.utilsService.sendResMsg(language,"CART_NOT_FOUND"):"Cart not found":'Cart not found'
                return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
            }
        }
    }
    // deletes MULTIPLE ITEM from cart
    public async deleteMultiProductFromCart(user: UsersDTO,query:any, cartData,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'User') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        } else {
            console.log("QUERY deleteMultiProductFromCart",query)

            if(!query.location){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
            }
            const cartInfo = await this.cartModel.findById(cartData.cartId) as CartDataModel;
            if (cartInfo) {
                if(cartData.cart.length){
                    for(let product of cartData.cart){
                        const productIndex = cartInfo.cart.findIndex(list => list.productId == product.productId);
                        if (productIndex !== -1) {
                            cartInfo.cart.splice(productIndex, 1);
                            const pIndex = cartInfo.products.findIndex(p => p == product.productId);
                            if (pIndex !== -1) {
                                cartInfo.products.splice(pIndex, 1);
                            }
                        }
                    }
                    if(cartInfo.coupon){
                        cartInfo.coupon=null;
                        cartInfo.couponInfo=null;
                    }
                    const res = await this.calculateTotalAndUpdateMultiCart(cartInfo, 'update', cartData.cartId);
                    if(res && res.cart.length==0){
                        await this.cartModel.findByIdAndRemove(cartData.cartId);
                        let resMsg=language?await this.utilsService.sendResMsg(language,"CART_DELETE")?await this.utilsService.sendResMsg(language,"CART_DELETE"):"Cart deleted successfully":'Cart deleted successfully'
                        return {response_code: HttpStatus.OK, response_data: resMsg};
                    }else{
                        return {response_code: HttpStatus.OK, response_data: res};
                    }
                }
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"CART_NOT_FOUND")?await this.utilsService.sendResMsg(language,"CART_NOT_FOUND"):"Cart not found":'Cart not found'
                return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
            }
        }
    }

    // applies coupon to cart
    public async applyCoupon(user: UsersDTO,query:any, id: string,couponCodeDTO:CouponCodeDTO,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'User') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        } else {
            console.log("QUERY applyCoupon",query)
            if(!query.location){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
            }
            const couponInfo = await this.couponModel.findOne({couponCode: couponCodeDTO.couponCode,status:1,location:query.location}) as CouponsDTO;
            if (couponInfo) {
                const currentDate = Date.now();
                if (couponInfo.startDate < currentDate && couponInfo.expiryDate>currentDate) {
                    const cartInfo = await this.cartModel.findOne({_id: id, isOrderLinked: false}) as CartDataModel;
                    if (cartInfo) {
                        if(cartInfo.coupon){
                            let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_APPLIED")?await this.utilsService.sendResMsg(language,"COUPON_APPLIED"):"Coupon already applied, first remove":'Coupon already applied, first remove'
                            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
                        }else{
                            let couponDiscountAmount=0;
                            if (couponInfo.couponType === 'PERCENTAGE') {
                                couponDiscountAmount = Number((cartInfo.subTotal * (couponInfo.offerValue / 100)).toFixed(2));
                            } else {
                                couponDiscountAmount = Number(couponInfo.offerValue);
                            }
                            cartInfo.coupon=couponInfo._id;
                            cartInfo.couponInfo={
                                couponCode:couponCodeDTO.couponCode,
                                couponDiscountAmount:couponDiscountAmount
                            }
                            cartInfo.grandTotal=Number((cartInfo.grandTotal-couponDiscountAmount).toFixed(2));
                            const res = await this.cartModel.findByIdAndUpdate(cartInfo._id, cartInfo,{new:true});
                            return {response_code: HttpStatus.OK, response_data: res}; 
                        }
                        
                    } else {
                        let resMsg=language?await this.utilsService.sendResMsg(language,"CART_NOT_FOUND")?await this.utilsService.sendResMsg(language,"CART_NOT_FOUND"):"Cart not found":'Cart not found'
                        return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
                    }
                }else{
                    let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_EXPIRED")?await this.utilsService.sendResMsg(language,"COUPON_EXPIRED"):"Coupon has been expired, Enter a valid coupon":'Coupon has been expired, Enter a valid coupon'
                    return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
                }
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_NOT_EXIST")?await this.utilsService.sendResMsg(language,"COUPON_NOT_EXIST"):" Code does not exist. Enter a valid coupon.":' Code does not exist. Enter a valid coupon.'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: `${couponCodeDTO.couponCode} ${resMsg}`,};
            }
        } 
    }

    // removes coupon
    public async removeCoupon(user: UsersDTO,query:any,id:string,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'User') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        } else {
            console.log("QUERY removeCoupon",query)

            if(!query.location){
                let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
                return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
            }
            const cartInfo = await this.cartModel.findOne({_id:id, isOrderLinked: false}) as CartDataModel;
            if (cartInfo ) {
                if(cartInfo.coupon){
                    const list = await this.deliveryModel.find();
                    const adminSettings=list[0];
                    cartInfo.subTotal=Number(cartInfo.subTotal.toFixed(2));
                    cartInfo.tax = this.taxCalculation(cartInfo,adminSettings);
                    cartInfo.taxInfo={taxName:adminSettings["taxName"]?adminSettings["taxName"]:"GST",amount:adminSettings.taxAmount}
                    if(cartInfo.deliveryAddress){
                        let address=this.addressModel.findById(cartInfo.deliveryAddress,'location')
                        if(address && address["location"]){
                            cartInfo.deliveryCharges= await this.deliveryChargeCalculation(cartInfo,adminSettings,address)
                        }
                    }
                    cartInfo.isFreeDelivery=false;
                    if(cartInfo.deliveryCharges===0 && cartInfo.deliveryAddress){
                        cartInfo.isFreeDelivery=true;
                    }
                    cartInfo.grandTotal = Number((cartInfo.subTotal + cartInfo.tax+cartInfo.deliveryCharges).toFixed(2));
                    cartInfo.couponInfo=null;
                    cartInfo.coupon=null;
                    const res = await this.cartModel.findByIdAndUpdate(cartInfo._id, cartInfo,{new:true});
                    return {response_code: HttpStatus.OK, response_data: res};
                }else{
                    let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_NOT_EXIST")?await this.utilsService.sendResMsg(language,"COUPON_NOT_EXIST"):" Code does not exist. Enter a valid coupon.":' Code does not exist. Enter a valid coupon.'
                    return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
                }
            } else {
                let resMsg=language?await this.utilsService.sendResMsg(language,"CART_NOT_FOUND")?await this.utilsService.sendResMsg(language,"CART_NOT_FOUND"):"Cart not found":'Cart not found'
                return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
            }
        }
    }

    // deletes cart item
    public async deleteCartItem(user: UsersDTO,query:any, cartId: string,language:string): Promise<CommonResponseModel> {
        if (user.role !== 'User') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
        console.log("QUERY deleteCartItem",query)

        if(!query.location){
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
        }
        const cartInfo: CartDataModel = await this.cartModel.findById(cartId);
        if (!cartInfo) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG")?await this.utilsService.sendResMsg(language,"SOMETHING_WRONG"):"Something went wrong , please try again":'Something went wrong , please try again'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
        if (cartInfo.isOrderLinked) {
            let resMsg=language?await this.utilsService.sendResMsg(language,"CART_LINKED_ORDER")?await this.utilsService.sendResMsg(language,"CART_LINKED_ORDER"):"This cart is linked to an order, you cannot delete this cart":'This cart is linked to an order, you cannot delete this cart'
            return {response_code: HttpStatus.BAD_REQUEST,response_data:resMsg };
        }
        await this.cartModel.findByIdAndDelete(cartId);
        let resMsg=language?await this.utilsService.sendResMsg(language,"CART_DELETE")?await this.utilsService.sendResMsg(language,"CART_DELETE"):"Cart deleted successfully":'Cart deleted successfully'
        return {response_code: HttpStatus.OK, response_data: resMsg};
    }

    // COUPON LIST
    public async couponList(user: UsersDTO,query:any,language:string): Promise<CommonResponseModel> {
        console.log("QUERY couponList",query)
        if (user.role !== 'User') {
            let resMsg=language?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE")?await this.utilsService.sendResMsg(language,"UNAUTHORIZED_RESPONSE"):"You are not authorized to access this api":'You are not authorized to access this api'
            return {response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg};
        }
        if(!query.location){
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return {response_code: HttpStatus.BAD_REQUEST,response_data: resMsg};
        }
        const currentDate = Date.now();
        let filterQuery={status:1,location:query.location,startDate: { $lt: currentDate },expiryDate: { $gt:currentDate}}
        const coupons = await this.couponModel.find(filterQuery,'couponCode offerValue couponType description') ;
        if(coupons.length){
            return {response_code: HttpStatus.OK,response_data: coupons};
        }else{
            let resMsg=language?await this.utilsService.sendResMsg(language,"COUPON_NOT_FOUND")?await this.utilsService.sendResMsg(language,"COUPON_NOT_FOUND"):"Coupon not found":'Coupon not found'
            return {response_code: HttpStatus.BAD_REQUEST, response_data: resMsg};
        }
    }
}

