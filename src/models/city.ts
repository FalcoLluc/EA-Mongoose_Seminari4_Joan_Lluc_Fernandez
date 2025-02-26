import {Types, Schema, model } from 'mongoose';
import { IRestaurant } from './restaurant.js';

export interface ICity {
    name: string;
    country: string;
    restaurants?: Types.ObjectId[];
}

const  CitySchema = new Schema<ICity>({
    name: { type: String, required: true },
    country: { type: String, required: true },
    restaurants: [{ type: Schema.Types.ObjectId, ref: 'Restaurant'}]
});

export const CityModel = model<ICity>('City', CitySchema);