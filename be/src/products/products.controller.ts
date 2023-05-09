import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpException,
  Put,
} from '@nestjs/common';
import { log } from 'console';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('add')
  async addProduct(
    @Body('title') prodTitle: string,
    @Body('description') prodDesc: string,
    @Body('price') prodPrice: number,
    @Body('percent') prodPerc: number,
    @Body('discount') prodDisc: number,
    @Body('image') prodImg: string,
  ) {
    const product_added = await this.productsService.insertProduct(
      prodTitle,
      prodDesc,
      prodPrice,
      prodPerc,
      prodDisc,
      prodImg,
    );
    try {
      return {
        status: 200,
        'product has been added': product_added,
      };
    } catch (error) {
      throw new HttpException(
        { status: 302, error: 'Error' },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Put('upload/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') prodId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.productsService
      .uploadImageToCloudinary(file, prodId)
      .then((img) => {
        return img;
      });

    return url;
  }

  @Get()
  async getAllProducts() {
    const products = await this.productsService.getProducts();
    return {
      status: 200,
      data: products,
    };
  }

  @Get(':id')
  getProduct(@Param('id') prodId: string) {
    return this.productsService.getSingleProduct(prodId);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') prodId: string,
    @Body('title') prodTitle: string,
    @Body('description') prodDesc: string,
    @Body('price') prodPrice: number,
    @Body('discount') prodPerc: number,
    @Body('discount') prodDisc: number,
    @Body('image') prodImg: string,
  ) {
    const new_product = await this.productsService.updateProduct(
      prodId,
      prodTitle,
      prodDesc,
      prodPrice,
      prodPerc,
      prodDisc,
      prodImg,
    );
    try {
      return {
        status: 200,
        message: 'UPDATE SUCCESS',
        'new product': new_product,
      };
    } catch (error) {
      throw new HttpException(
        { status: 303, error: 'Error' },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Delete(':id')
  async removeProduct(@Param('id') prodId: string) {
    await this.productsService.deleteProduct(prodId);

    return {
      status: 200,
      message: 'Deleted Success',
    };
  }
}
