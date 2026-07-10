import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductCategory {
  COFFEE = 'COFFEE',
  TEA = 'TEA',
  FOOD = 'FOOD',
  SNACK = 'SNACK',
}

@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, enum: ProductCategory, index: true })
  category!: ProductCategory;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ min: 0 })
  originalPrice?: number;

  @Prop({ default: '🍽️' })
  icon!: string;

  @Prop({ default: '#ead7bd' })
  color!: string;

  @Prop()
  image?: string;

  @Prop({ default: true })
  isAvailable!: boolean;

  @Prop({ default: false })
  isFeatured!: boolean;

  @Prop({ default: 0, min: 0 })
  soldCount!: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
