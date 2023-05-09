import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Product } from './product.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { json } from 'stream/consumers';

@Injectable()
export class ProductsService {
  private products: Product[] = [];
  constructor(
    private cloudinary: CloudinaryService,
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async insertProduct(
    title: string,
    desc: string,
    price: number,
    perc: number,
    disc: number,
    img: string,
  ) {
    if (perc > 100) {
      throw new NotFoundException('Cant discount more than 100%');
    }
    if (disc > price) {
      throw new NotFoundException('Discount cant bigger than price');
    }
    if (!perc) {
      if (!disc) {
        perc = 0;
        disc = 0;
      } else {
        perc = (price - disc) / (price / 100);
        perc = JSON.parse(perc.toFixed(0));
      }
    } else {
      perc = JSON.parse(perc.toFixed(0));
      disc = price - (price / 100) * perc;
    }

    if (!img) {
      img = '';
    }

    const newProduct = await new this.productModel({
      title,
      description: desc,
      price,
      percent: perc,
      discount: disc,
      image: img,
    });

    const result = await newProduct.save();

    return {
      id: result.id,
      title: result.title,
      description: result.description,
      price: result.price,
      percent: result.percent,
      discount: result.discount,
      image: result.image,
    };
  }

  async uploadImageToCloudinary(file: Express.Multer.File, productId: string) {
    const uploadedImageToCloudinary = await this.findProduct(productId);
    const { url } = await this.cloudinary.uploadImage(file).catch(() => {
      throw new BadRequestException('Invalid file type.');
    });
    uploadedImageToCloudinary.image = url;
    uploadedImageToCloudinary.save();

    return uploadedImageToCloudinary;
  }

  async getProducts() {
    const products = await this.productModel.find().exec();
    return products.map((prod) => ({
      id: prod.id,
      title: prod.title,
      description: prod.description,
      price: prod.price,
      percent: prod.percent,
      discount: prod.discount,
      image: prod.image,
    }));
  }

  async getSingleProduct(productId: string) {
    const product = await this.findProduct(productId);
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      percent: product.percent,
      discount: product.discount,
      image: product.image,
    };
  }

  async updateProduct(
    productId: string,
    title: string,
    desc: string,
    price: number,
    perc: number,
    disc: number,
    img: string,
  ) {
    const updatedProduct = await this.findProduct(productId);
    if (title) {
      updatedProduct.title = title;
    }
    if (desc) {
      updatedProduct.description = desc;
    }
    if (price) {
      updatedProduct.price = price;
    }
    if (perc) {
      updatedProduct.percent = perc;
    }
    if (disc) {
      updatedProduct.discount = disc;
    }
    if (img) {
      updatedProduct.image = img;
    }
    // const result = updatedProduct.save();
    return {
      id: updatedProduct.id,
      title: updatedProduct.title,
      description: updatedProduct.description,
      price: updatedProduct.price,
      percent: updatedProduct.percent,
      discount: updatedProduct.discount,
      image: updatedProduct.image,
    };
  }

  async deleteProduct(prodId: string) {
    const result = await this.productModel.deleteOne({ _id: prodId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Could not find product!');
    }
  }

  private async findProduct(id: string): Promise<Product> {
    let product;
    try {
      product = await this.productModel.findById(id);
    } catch (error) {
      throw new NotFoundException('Could not find product!');
    }
    if (!product) {
      throw new NotFoundException('Could not find product!');
    }
    return product;
  }
}
