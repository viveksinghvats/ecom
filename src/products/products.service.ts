import { HttpStatus, Injectable } from '@nestjs/common';
import { ProductsDTO, PuductStatusDTO } from './products.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonResponseModel } from '../utils/app-service-data';
import { UsersDTO } from '../users/users.model';
import { UploadService } from '../upload/upload.service';
const fs = require('fs');
const appRoot = require('app-root-path');
const csvjson = require('csvjson');

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel('Products') private readonly productModel: Model<any>,
        @InjectModel('deals') private readonly dealsModel: Model<any>,
        @InjectModel('Cart') private readonly cartModel: Model<any>,
        @InjectModel('Categories') private readonly categoryModel: Model<any>,
        @InjectModel('Subcategories') private readonly subcategoryModel: Model<any>,
        @InjectModel('Users') private readonly userModel: Model<any>,
        @InjectModel('Locations') private readonly locationModel: Model<any>,

        private utilsService: UploadService) {
    }

    // LIST
    public async index(user: UsersDTO, page: number, limit: number, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                let query = {}
                if (user.role === 'Manager') {
                    query["location"] = user.locationId
                }
                const product = await this.productModel.find(query).limit(limit).populate('category', 'title').populate('location', 'locationName').skip((page * limit) - limit).sort('createdAt');
                const total = await this.productModel.countDocuments(query);
                return { response_code: HttpStatus.OK, response_data: { data: product, total } };
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    // SHOW
    public async show(user: UsersDTO, id: string, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                const product = await this.productModel.findById(id, {});
                return { response_code: HttpStatus.OK, response_data: product };
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    // CREATE
    public async create(user: UsersDTO, productData: ProductsDTO, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                if (user.role === 'Admin') {
                    productData.addedBy = user.role;
                    let product = productData;
                    let catId = productData.category;
                    let subCatId = productData.subcategory;
                    console.log("PRODUCT ADD REQUEST", JSON.stringify(productData))
                    if (productData.location.length) {
                        for (let item of productData.location) {
                            let category = await this.categoryModel.findOne({ refrenceCategory: catId, location: item }, '_id');
                            console.log("category ...........", JSON.stringify(category))

                            if (!category) {
                                let refrenceCategory = await this.categoryModel.findById(catId, '-__v');
                                refrenceCategory.refrenceCategory = refrenceCategory._id;
                                refrenceCategory.location = item;
                                refrenceCategory = JSON.parse(JSON.stringify(refrenceCategory))
                                delete refrenceCategory._id
                                console.log("REFRENCE PRODUCT ADD REQUEST", JSON.stringify(refrenceCategory))

                                category = await this.categoryModel.create(refrenceCategory)
                            }
                            product.category = category._id;
                            product.location = item;
                            if (productData.subcategory) {
                                let subcategory = await this.subcategoryModel.findOne({ refrenceSubCategory: subCatId, location: item }, '_id');
                                console.log("SUBCATEGORY", JSON.stringify(subcategory))
                                if (!subcategory) {
                                    let refrenceSubCategory = await this.subcategoryModel.findById(subCatId, '-__v');
                                    refrenceSubCategory.refrenceSubCategory = refrenceSubCategory._id;
                                    refrenceSubCategory.location = item;
                                    refrenceSubCategory = JSON.parse(JSON.stringify(refrenceSubCategory))
                                    delete refrenceSubCategory._id
                                    console.log("REFRENCE SSSSSSSUUUUUUUUUUUUU ADD REQUEST", JSON.stringify(refrenceSubCategory))
                                    subcategory = await this.subcategoryModel.create(refrenceSubCategory)
                                }
                                product.subcategory = subcategory._id;
                            }
                            await this.productModel.create(product);
                        }
                    }
                    let resMsg = language ? await this.utilsService.sendResMsg(language, "PRODUCT_SAVED") ? await this.utilsService.sendResMsg(language, "PRODUCT_SAVED") : "Product saved successfully" : 'Product saved successfully'
                    return { response_code: HttpStatus.CREATED, response_data: resMsg };
                } else {
                    await this.productModel.create(productData);
                    let resMsg = language ? await this.utilsService.sendResMsg(language, "PRODUCT_SAVED") ? await this.utilsService.sendResMsg(language, "PRODUCT_SAVED") : "Product saved successfully" : 'Product saved successfully'
                    return { response_code: HttpStatus.CREATED, response_data: resMsg };
                }
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            console.log("errrrrrrrrrrrrr", e)
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    // UPDATE
    public async upsert(user: UsersDTO, id: string, productData: ProductsDTO, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                await this.productModel.findByIdAndUpdate(id, productData, { new: true });
                let resMsg = language ? await this.utilsService.sendResMsg(language, "PRODUCT_UPDATE") ? await this.utilsService.sendResMsg(language, "PRODUCT_UPDATE") : "Product updated successfully" : 'Product updated successfully'
                return { response_code: HttpStatus.OK, response_data: resMsg };
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    // STATUS UPDATE
    public async statusUpdate(user: UsersDTO, id: string, productStatusData: PuductStatusDTO, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                await this.productModel.findByIdAndUpdate(id, productStatusData, { new: true });
                let resMsg = language ? await this.utilsService.sendResMsg(language, "PRODUCT_STATUS_UPDATE") ? await this.utilsService.sendResMsg(language, "PRODUCT_STATUS_UPDATE") : "Product status update succesfully" : 'Product status update succesfully'
                return { response_code: HttpStatus.OK, response_data: resMsg };
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    //********************** */ user apis list*************************************
    //function used for user
    public async ProductDataCustomize(cart, products) {
        for (let item of cart.cart) {
            let unit = item.unit;
            let quantity = item.quantity
            const productIndex = products.findIndex(val => val._id.toString() == item.productId.toString());
            if (productIndex === -1) {
            } else {
                console.log("productIndex", productIndex)
                let obj = products[productIndex].toJSON();
                if (obj && obj.variant.length > 1) {
                    const unitIndex = obj.variant.findIndex(val => val.unit == unit);
                    if (unitIndex > 0) {
                        console.log("unitIndex", obj.variant[unitIndex])
                        let tempVariant = obj.variant[unitIndex];
                        obj.variant.splice(unitIndex, 1)
                        obj.variant.unshift(tempVariant)
                    }
                }
                obj.cartAddedQuantity = quantity;
                obj.cartId = cart._id;
                obj.cartAdded = true;
                products.splice(productIndex, 1, obj)
            }
        }
        return products
    }
    //product info by id user
    public async productInfo(id: string, query: any, language: string): Promise<CommonResponseModel> {
        console.log("QUERY productInfo", query)
        let product = await this.productModel.findById(id);
        if (query && query.userId && product) {
            let tempProduct = [product]
            let cart = await this.cartModel.findOne({ user: query.userId, isOrderLinked: false }, 'cart');
            if (cart && cart.cart && cart.cart.length) {
                tempProduct = await this.ProductDataCustomize(cart, tempProduct)
            }
            product = tempProduct[0];
        }
        return {
            response_code: HttpStatus.OK,
            response_data: product
        };
    }
    //enable disable  home page user not used have to remove
    public async homePage(query: any, language: string): Promise<CommonResponseModel> {
        console.log("QUERY MAIN HOME PAGE", query)

        if (!query.location) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
        }
        let limit = 4, catLimit = 8, topLimit = 4
        if (query && query.limit) {
            limit = Number(query.limit);
            catLimit = Number(query.limit);
            topLimit = 6
        }
        let products = await this.productModel.find({ status: 1, location: query.location }, 'title filePath imageUrl isDealAvailable delaPercent category variant averageRating').limit(limit).sort({ createdAt: -1 });
        // console.log("deeeeeeeeeeeeeeeeeeeeeeeeeee",products)
        // this condition not used in app side till
        if (query && query.userId && products && products.length) {
            let cart = await this.cartModel.findOne({ user: query.userId, isOrderLinked: false }, 'cart');
            if (cart && cart.cart && cart.cart.length) {
                products = await this.ProductDataCustomize(cart, products)
            }
        }
        const categories = await this.categoryModel.find({ status: 1, location: query.location }, 'title filePath imageUrl category isSubCategoryAvailable').limit(catLimit).sort({ createdAt: -1 });
        const dealsOfDay = await this.dealsModel.find({ status: 1, location: query.location }, 'name filePath delaPercent imageUrl delalType category product').limit(topLimit).sort({ createdAt: +1 });
        const topDeals = await this.dealsModel.find({ status: 1, topDeal: true, location: query.location }, 'name filePath imageUrl delaPercent delalType category product').limit(topLimit).sort({ createdAt: -1 });
        return {
            response_code: HttpStatus.OK,
            response_data: { products, categories, dealsOfDay, topDeals }
        };
    }
    public async homePageTopDeal(query: any, language: string): Promise<CommonResponseModel> {
        console.log("QUERY homePageTopDeal", query)

        if (!query.location) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
        }
        const topDeals = await this.dealsModel.find({ status: 1, topDeal: true, location: query.location }, 'name imageUrl filePath delaPercent delalType category product').sort({ createdAt: -1 });
        return {
            response_code: HttpStatus.OK,
            response_data: topDeals
        };
    }
    public async homePageDealsOfDay(query: any, language: string): Promise<CommonResponseModel> {
        console.log("QUERY homePageDealsOfDay", query)
        if (!query.location) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
        }
        const topDeals = await this.dealsModel.find({ status: 1, location: query.location }, 'name filePath imageUrl delaPercent delalType category product').sort({ createdAt: -1 });
        return {
            response_code: HttpStatus.OK,
            response_data: topDeals
        };
    }
    public async homePageCategory(query: any, language: string): Promise<CommonResponseModel> {
        console.log("QUERY CATEGORY", query)
        if (!query.location) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
        }
        const categories = await this.categoryModel.find({ status: 1, location: query.location }, 'title filePath imageUrl category').sort({ createdAt: -1 });
        return {
            response_code: HttpStatus.OK,
            response_data: categories
        };
    }
    public async homePageProduct(query: any, language: string): Promise<CommonResponseModel> {
        console.log("QUERY homePageProduct", query)
        if (!query.location) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
        }
        let products;
        if (query && query.page) {
            products = await this.productModel.find({ status: 1, location: query.location }, 'title filePath imageUrl category isDealAvailable delaPercent variant averageRating').skip(Number(query.page)).limit(8).sort({ createdAt: -1 });
            //console.log("111111111111111111111",products)
        } else {
            products = await this.productModel.find({ status: 1, location: query.location }, 'title filePath imageUrl category isDealAvailable delaPercent variant averageRating').sort({ createdAt: -1 });
            //console.log("2222222222222222222",products)
        }
        if (query && query.userId && products && products.length) {
            let cart = await this.cartModel.findOne({ user: query.userId, isOrderLinked: false }, 'cart');
            if (cart && cart.cart && cart.cart.length) {
                products = await this.ProductDataCustomize(cart, products)
            }
        }
        let total = await this.productModel.countDocuments({ status: 1, location: query.location });
        return {
            response_code: HttpStatus.OK,
            response_data: { products, total }
        };
    }
    // product search user
    public async searchProduct(search_key: string, query, language: string): Promise<CommonResponseModel> {
        console.log("QUERY SEARCH PRODUCT", query, search_key)
        if (!query.location) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
        }
        let products = await this.productModel.find({ title: { $regex: search_key, $options: 'i' }, status: 1, location: query.location }, 'title filePath imageUrl isDealAvailable delaPercent category variant averageRating');
        if (query && query.userId && products && products.length) {
            let cart = await this.cartModel.findOne({ user: query.userId, isOrderLinked: false }, 'cart');
            if (cart && cart.cart && cart.cart.length) {
                products = await this.ProductDataCustomize(cart, products)
            }
        }
        return { response_code: HttpStatus.OK, response_data: products };
    }
    public async searchCategory(search_key: string, query, language: string): Promise<CommonResponseModel> {
        console.log("QUERY SEARCH PRODUCT", query, search_key)
        if (!query.location) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
        }
        let products = await this.categoryModel.find({ title: { $regex: search_key, $options: 'i' }, status: 1, location: query.location }, 'title filePath imageUrl isDealAvailable delaPercent category variant averageRating');
        if (query && query.userId && products && products.length) {
            let cart = await this.cartModel.findOne({ user: query.userId, isOrderLinked: false }, 'cart');
            if (cart && cart.cart && cart.cart.length) {
                products = await this.ProductDataCustomize(cart, products)
            }
        }
        return { response_code: HttpStatus.OK, response_data: products };
    }

    // returns products of a particular category
    public async getProductsByCategory(categoryId: string, query: any, language: string): Promise<CommonResponseModel> {
        console.log("QUERY CATEGORY", query, categoryId)
        if (!query.location) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
        }
        let products = await this.productModel.find({ category: categoryId, status: 1, location: query.location }, 'title imageUrl filePath category isDealAvailable delaPercent variant averageRating').sort({ createdAt: -1 });
        let subCategory = await this.subcategoryModel.find({ category: categoryId, status: 1, location: query.location }, 'title').sort({ createdAt: -1 });
        if (query && query.userId && products && products.length) {
            let cart = await this.cartModel.findOne({ user: query.userId, isOrderLinked: false }, 'cart');
            if (cart && cart.cart && cart.cart.length) {
                products = await this.ProductDataCustomize(cart, products)
            }
        }
        return { response_code: HttpStatus.OK, response_data: { products, subCategory } };
    }
    // returns products of a particular category
    public async getProductsBySubCategory(subCategoryId: string, query: any, language: string): Promise<CommonResponseModel> {
        console.log("QUERY SUB CATEGORY", query, subCategoryId)
        if (!query.location) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") ? await this.utilsService.sendResMsg(language, "LOCATION_REQUIRED") : "First select your location" : 'First select your location'
            return { response_code: HttpStatus.BAD_REQUEST, response_data: resMsg };
        }
        let products = await this.productModel.find({ subcategory: subCategoryId, status: 1, location: query.location }, 'title imageUrl filePath category subcategory isDealAvailable delaPercent variant averageRating').sort({ createdAt: -1 });
        if (query && query.userId && products && products.length) {
            let cart = await this.cartModel.findOne({ user: query.userId, isOrderLinked: false }, 'cart');
            if (cart && cart.cart && cart.cart.length) {
                products = await this.ProductDataCustomize(cart, products)
            }
        }
        return { response_code: HttpStatus.OK, response_data: products };
    }

    //PRODUCT EXPORT TO CSV
    public async dataManupulation(jsonObj) {
        try {
            let products = [];
            for(let productItem of jsonObj){
                let obj = Object.assign({});
                obj['ID'] = productItem._id.toString();
                obj['TITLE'] = productItem.title;
                obj['IMAGE URL'] = productItem.imageUrl;
                obj['SKU'] = productItem.SKU ? productItem.SKU : "" ;
                obj['DESCRIPTION'] = productItem.description;
                obj['CATEGORY ID'] = productItem.category.toString();
                obj['SUB-CATEGORY ID'] = productItem.subcategory ? productItem.subcategory.toString() : "";
                for(let i = 1; i <= productItem.variant.length ; i++){
                    obj[`UNIT-${i}`] = productItem.variant[i-1]['unit'] ? productItem.variant[i-1]['unit'] : '';
                    obj[`MRP-${i}`] = productItem.variant[i-1]['MRP'] ? productItem.variant[i-1]['MRP'] : '';
                    obj[`DISCOUNT-${i}`] = productItem.variant[i-1]['discount'] ? productItem.variant[i-1]['discount'] : '';
                    obj[`PRICE-${i}`] = productItem.variant[i-1]['price'] ? productItem.variant[i-1]['price'] : '';
                    obj[`PRODUCTSTOCK-${i}`] = productItem.variant[i-1]['productstock'] ? productItem.variant[i-1]['productstock'] : '';
                }
                products.push(obj)
            }
            return products
           
        } catch (e) {
            console.log("err",e)
        }
        
    }
    public async pageCreation(count) {
        let limit = 1000, arr = [];
        let noOfPage = Math.ceil(count / limit);
        for (let i = 1; i <= noOfPage; i++) {
            let p = (Number(i) - 1) * limit;
            arr.push({ skip: p, limit: limit })
        }
        return arr
    }
    public async jsonToCsv(json, fileName) {
        const csvData = await csvjson.toCSV(json, {
            headers: 'key'
        });
        await fs.writeFileSync(fileName, csvData, 'utf8');
        let path = appRoot.path + "/" + fileName;
        let base64 = await fs.readFileSync(path, { encoding: 'base64' });
        let uploadRes = await this.utilsService.xlsUploadToImageKit(base64, fileName);
        await fs.unlinkSync(path);
        return uploadRes
    }
    public async dataFetch(pageArr, query, id) {
        let mergeArr = [];
        for (let item of pageArr) {
            const data = await this.productModel.find(query, {}).skip(Number(item.skip)).limit(Number(item.limit)).sort("-createdAt");
            mergeArr.push(...data)
        }
        let formateData = await this.dataManupulation(mergeArr)
        let fileName = "product_data_export.csv"
        let fileRes = await this.jsonToCsv(formateData, fileName)
        console.log(fileRes)
        let obj = { url: fileRes.url, status: "Completed", publicId: fileRes.key }
        await this.userModel.findByIdAndUpdate(id, { productExportedFile: obj }, { new: true });
        return true;
    }
    public async productExport(user: UsersDTO, query: any, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                let filterQuery = { location: query.location };
                const count = await this.productModel.countDocuments(filterQuery);
                if (!count) {
                    let resMsg = language ? await this.utilsService.sendResMsg(language, "PRODUCT_NOT_FOUND") ? await this.utilsService.sendResMsg(language, "PRODUCT_NOT_FOUND") : "Product not found" : 'Product not found'
                    return { response_code: 400, response_data: resMsg };
                }
                let pageArr = await this.pageCreation(count)
                if (pageArr && pageArr.length) {
                    this.dataFetch(pageArr, filterQuery, user._id).then(function (d) { console.log("Data fetched") })
                }
                let obj = { url: null, status: "Processing", publicId: null }
                await this.userModel.findByIdAndUpdate(user._id, { productExportedFile: obj }, { new: true });
                return {
                    response_code: HttpStatus.OK,
                    response_data: obj
                };
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    public async getExportFile(user: UsersDTO, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                const userInfo = await this.userModel.findById(user._id, 'productExportedFile');
                return {
                    response_code: HttpStatus.OK,
                    response_data: userInfo
                }
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    public async orderExportDelete(user: UsersDTO, deleteKey: string, language: string): Promise<CommonResponseModel> {
        try {
            if (user.role === 'Admin' || user.role === 'Manager') {
                await this.utilsService.deleteUplodedFile(deleteKey)
                let obj = { url: null, status: "Pending", publicId: null }
                await this.userModel.findByIdAndUpdate(user._id, { productExportedFile: obj }, { new: true });
                return {
                    response_code: HttpStatus.OK,
                    response_data: obj
                }
            } else {
                let resMsg = language ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") ? await this.utilsService.sendResMsg(language, "UNAUTHORIZED_RESPONSE") : "You are not authorized to access this api" : 'You are not authorized to access this api'
                return { response_code: HttpStatus.UNAUTHORIZED, response_data: resMsg };
            }
        } catch (e) {
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }
    
    public async productCheckAndUpdate(id : string , data : any) {
        let checkProductExist = await this.productModel.findById(id, '_id') ;
        if(checkProductExist){
            await this.productModel.findByIdAndUpdate(id, data , {new : true}) ;
        } else {
            await this.productModel.create(data) ;
        }
    }
    public async dataCreateAndUpdate(jsonObj, loccation) {
        try {
            let importedDataToCreate = [];
            for(let productItem of jsonObj){
                let keys = Object.keys(productItem);
                let obj = {
                    title: productItem['TITLE'],
                    description: productItem['DESCRIPTION'],
                    imageUrl: productItem['IMAGE URL'],
                    SKU : productItem['SKU'] ? productItem['SKU'] : null,
                    location: loccation,
                    category: productItem['CATEGORY ID'],
                    subcategory: productItem['SUB-CATEGORY ID'] ? productItem['SUB-CATEGORY ID']: null,
                    variant : [],
                    status : 1
                }
                let totalLengthOfKeys = Math.ceil((keys.length-8)/5);
                for(let i = 1; i <= totalLengthOfKeys ; i++){
                    if(productItem[`UNIT-${i}`]){
                        let variant = {
                            unit : productItem[`UNIT-${i}`] ,
                            MRP : Number(productItem[`MRP-${i}`]),
                            discount : Number(productItem[`DISCOUNT-${i}`]) ? Number(productItem[`DISCOUNT-${i}`]) : null,
                            price : Number(productItem[`PRICE-${i}`]),
                            enable : true,
                            productstock : Number(productItem[`PRODUCTSTOCK-${i}`]) ? Number(productItem[`PRODUCTSTOCK-${i}`]) : null,
                        }
                        obj.variant.push(variant)
                    }
                }
                if(productItem["ID"]) {
                    await this.productCheckAndUpdate(productItem["ID"], obj )
                }else importedDataToCreate.push(obj)
            }
            if(importedDataToCreate.length) await this.productModel.create(importedDataToCreate) ;
           
        } catch (e) {
            console.log("err",e)
        }
    }
    public async createProductByCsvImport(user: UsersDTO, file, query: any, language: string): Promise<CommonResponseModel> {
        try {
            console.log("query.loccation",query.location);
            if (user.role === 'Admin' || user.role === 'Manager') {
                if (file.mimetype !== 'text/csv') {
                    let resMsg = language ? await this.utilsService.sendResMsg(language, "FILE_TYPE_ERROR") ? await this.utilsService.sendResMsg(language, "FILE_TYPE_ERROR") : "File type must be csv." : 'File type must be csv.'
                    return { response_code: 400, response_data: resMsg };
                }
                const jsonObj = await csvjson.toObject(file.buffer.toString());
                this.dataCreateAndUpdate(jsonObj, query.location).then(data => console.log("Data created or updated by csv-import successfully"))
                let resMsg = language ? await this.utilsService.sendResMsg(language, "DATA_IMPORT_MSG") ? await this.utilsService.sendResMsg(language, "DATA_IMPORT_MSG") : "Data import start to process" : 'Data import start to process'
                return { response_code: HttpStatus.OK, response_data: resMsg };
            }
        } catch (e) {
            console.log("errrrrrrrrrrrrrrr", e)
            let resMsg = language ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") ? await this.utilsService.sendResMsg(language, "INTERNAL_SERVER_ERR") : "Internal server error" : 'Internal server error'
            return { response_code: 500, response_data: resMsg };
        }
    }


}

 