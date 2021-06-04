import { Body,Query, Controller,Headers, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CommonResponseModel } from '../utils/app-service-data';
import { GetUser } from '../utils/user.decorator';
import { UsersDTO } from '../users/users.model';
import { CartDTO, DeleteCartProductDTO, UpdateCartDTO } from './cart.model';
import { CouponCodeDTO} from '../coupons/coupons.model';


import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CartController {
  constructor(private cartService: CartService) {

  }

  // sends request to get user's cart list
  @Get('/user/items')
  public getUsersCartList(@GetUser() user: UsersDTO,@Query() query,@Headers('language') language:string): Promise<CommonResponseModel> {
    return this.cartService.getUsersCartList(user._id,query,language);
  }

  // sends request to apply coupon on cart item id=cart_id
  @Post('/apply/coupon/:id')
  public applyCoupon(@GetUser() user: UsersDTO,@Query() query, @Param('id') id: string,@Body() couponCodeDTO: CouponCodeDTO,@Headers('language') language:string) {
    return this.cartService.applyCoupon(user,query, id,couponCodeDTO,language);
  }

  // removes coupon applied to cart id=cart_id
  @Get('/remove/coupon/:id')
  public removeCoupon(@GetUser() user: UsersDTO,@Query() query,@Param('id') id: string,@Headers('language') language:string): Promise<CommonResponseModel> {
    return this.cartService.removeCoupon(user,query,id,language);
  }

  // sends request to add item to the cart
  @Post('/add/product')
  public addItem(@GetUser() user: UsersDTO,@Query() query, @Body() cart: CartDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
    return this.cartService.saveCartData(user,query, cart,language);
  }

  // sends request to update cart
  @Put('/update/product')
  public updateCart(@GetUser() user: UsersDTO,@Query() query, @Body() cart: UpdateCartDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
    return this.cartService.updateCartItem(user,query, cart,language);
  }

  // sends request to delete product from cart
  @Put('/delete/product')
  public removeProductFromCart(@GetUser() user: UsersDTO,@Query() query, @Body() cartData: DeleteCartProductDTO,@Headers('language') language:string): Promise<CommonResponseModel> {
    return this.cartService.deleteProductFromCart(user,query, cartData,language);
  }
  // sends request to delete product from cart
  @Put('/remove/multi/product')
  public deleteMultiProductFromCart(@GetUser() user: UsersDTO,@Query() query, @Body() cartData: any,@Headers('language') language:string): Promise<CommonResponseModel> {
    return this.cartService.deleteMultiProductFromCart(user,query, cartData,language);
  }



  // sends request to delete all products in cart
  @Delete('/all/items/:cartId')
  public deleteAllProducts(@GetUser() user: UsersDTO,@Query() query, @Param('cartId') cartId: string,@Headers('language') language:string): Promise<CommonResponseModel> {
    return this.cartService.deleteCartItem(user,query, cartId,language);
  }

  // USER COUPON LIST
  @Get('/coupon/list')
  public couponList(@GetUser() user: UsersDTO,@Query() query,@Headers('language') language:string): Promise<CommonResponseModel> {
    return this.cartService.couponList(user,query,language);
  }

}
