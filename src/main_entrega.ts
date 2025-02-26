import mongoose, { Schema, Document, model, ObjectId } from 'mongoose';
import { CityModel, ICity } from './models/city.js';
import { RestaurantModel, IRestaurant } from './models/restaurant.js';

async function main () {
  mongoose.set('strictQuery', true); // Mantiene el comportamiento actual

  await mongoose.connect('mongodb://127.0.0.1:27017/test')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar:', err));

  //CREATE
  const city1: ICity = {
    "name": "Madrid",
    "country": "Spain",
  }
  const city2: ICity = {
    "name": "Barcelona",
    "country": "Spain",
  }
  const city3: ICity = {
    "name": "Milano",
    "country": "Italy",
  }
  const newCity1 = new CityModel(city1);
  await newCity1.save()
    .then(() => console.log('City created:', newCity1))
    .catch(err => console.error('Error creating city:', err));
  const newCity2 = new CityModel(city2);
  await newCity2.save()
    .then(() => console.log('City created:', newCity2))
    .catch(err => console.error('Error creating city:', err));
  const newCity3 = new CityModel(city3);
  await newCity3.save()
    .then(() => console.log('City created:', newCity3))
    .catch(err => console.error('Error creating city:', err));

  // Insert restaurants
  const newRestaurant1 = new RestaurantModel({name: "La Giralda", address: "Calle Betis", city: newCity1._id});
  await newRestaurant1.save()
    .then(() => console.log('Restaurant created:', newRestaurant1))
    .catch(err => console.error('Error creating restaurant:', err));

  const restaurant2: IRestaurant = {
    "name": 'La Rambla',
    "address": 'La Rambla 45',
    "city": newCity1._id
  };

  const newRestaurant2 = new RestaurantModel(restaurant2);
  await newRestaurant2.save()
    .then(restaurant => console.log('Restaurant 2 Inserted: ' + restaurant._id))
    .catch(error => console.log(error));

  // Actualizar ciudad
  try {
    await CityModel.findByIdAndUpdate(newCity1._id, {$addToSet: {restaurants: newRestaurant1._id}});
    await CityModel.findByIdAndUpdate(newCity1._id, {$addToSet: {restaurants: newRestaurant2._id}});
  }
  catch (error) {
    console.log(error);
  }

  const cityMilano= await CityModel.findOne({name: 'Milano'})
  if(cityMilano){
    const newRestaurant3 = new RestaurantModel({name: "Pizza di la mama", address: "Calle Macarroni", city: cityMilano._id});
    await newRestaurant3.save()
      .then(() => console.log('Restaurant created:', newRestaurant3))
      .catch(err => console.error('Error creating restaurant:', err));
    await CityModel.findByIdAndUpdate(cityMilano._id, {$addToSet: {restaurants: newRestaurant3._id}});
  }

  //READ
  await CityModel.find({}).exec()
    .then(cities => console.log('Cities:', cities))
    .catch(err => console.error('Error reading cities:', err));

  // Populate
  // Sin populate
  await RestaurantModel.findOne({ name: 'La Giralda' }).exec()
  .then(restaurant => console.log('Restaurant without Populate: ', restaurant))
  .catch(error => console.log(error));

  // Consultar un restaurante con el uso de `populate` para ver la ciudad a la que está asociado
  await RestaurantModel.findOne({ name: 'La Giralda' }).populate('city').exec()
    .then(restaurant => console.log('Restaurant with Populate: ', restaurant))
    .catch(error => console.log(error));

  // **Aggregation Pipeline: contar restaurantes por ciudad**
  await RestaurantModel.aggregate([
    {
      $group: {
        _id: "$city",  // Agrupa por ciudad
        totalRestaurants: { $sum: 1 } // Cuenta el número de restaurantes
      }
    },
    {
      $lookup: {
        from: "cities", // Nombre de la colección de ciudades
        localField: "_id", // Campo de la ciudad en los restaurantes
        foreignField: "_id", // Campo _id en ciudades
        as: "cityInfo" // El resultado poblado se almacenará aquí
      }
    },
    {
      $unwind: "$cityInfo" // Despliega la información de la ciudad para usarla
    },
    {
      $project: {
        _id: 0, // No mostrar el _id
        cityName: "$cityInfo.name", // Mostrar nombre de la ciudad
        country: "$cityInfo.country", // Mostrar el país
        totalRestaurants: 1 // Mostrar la cuenta de restaurantes
      }
    }
  ])
  .then(results => {
    console.log("Aggregation Results - Total Restaurants per City:", results);
  })
  .catch(error => console.log("Error in aggregation:", error));


  // DELETE
  // Eliminar una ciudad y actualizar los restaurantes a null
  const deletedCity=await CityModel.findOneAndDelete({ name: 'Milano' }).exec()
  if (deletedCity){
    await RestaurantModel.deleteMany({ city: deletedCity._id })
      .then(() => console.log("Restaurants associated with the city deleted."))
      .catch((error) => console.log(error));
  }

  // Quitar un Restaurante de la ciudad
  await CityModel.findByIdAndUpdate(newCity1._id, { $pull: { restaurants: newRestaurant2._id } });

  // Eliminar todos los restaurantes
  await RestaurantModel.deleteMany({}).exec()
    .then(() => console.log('All Restaurants deleted'))
    .catch(error => console.log(error));

  // Eliminar todas las ciudades
  await CityModel.deleteMany({}).exec()
    .then(() => console.log('All Cities deleted'))
    .catch(error => console.log(error));

  await mongoose.connection.close()
  .then(() => console.log('Conexión a MongoDB cerrada'))
  .catch(err => console.error('Error al cerrar la conexión:', err));

}

main()