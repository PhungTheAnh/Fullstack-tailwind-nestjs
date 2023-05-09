import * as mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    percent: { type: Number, required: false },
    discount: { type: Number, required: false },
    image: { type: String, required: false },
  },
  // eslint-disable-next-line
  { versionKey: false },
);

export interface Product extends mongoose.Document {
  id: string;
  title: string;
  description: string;
  price: number;
  percent: number;
  discount: number;
  image: string;
}
