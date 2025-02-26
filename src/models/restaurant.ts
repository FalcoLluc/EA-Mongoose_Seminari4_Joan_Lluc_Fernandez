import { Types, Schema, model } from "mongoose";
import { ICity } from "./city.js";

export interface IRestaurant {
    name: string;
    address: string;
    city: Types.ObjectId;
}

const RestaurantSchema = new Schema<IRestaurant>({
    name: { type: String, required: true },
    address: { type: String},
    city : {type: Schema.Types.ObjectId, ref: 'City', required: true}
});

export const RestaurantModel = model<IRestaurant>("Restaurant", RestaurantSchema)