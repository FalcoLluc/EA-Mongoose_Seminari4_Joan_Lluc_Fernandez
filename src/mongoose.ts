import mongoose from 'mongoose';
import { UserModel, IUser } from './models/user.js';

async function main() {
  mongoose.set('strictQuery', true); // Mantiene el comportamiento actual

  await mongoose.connect('mongodb://127.0.0.1:27017/test')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar:', err));

  const user1:  IUser = {
    "name": 'Bill',
    "email": 'bill@initech.com',
    "avatar": 'https://i.imgur.com/dM7Thhn.png'
  };

  console.log("user1", user1); 
  const newUser= new UserModel(user1);
  const user2: IUser = await newUser.save();
  console.log("user2",user2);

  // findById devuelve un objeto usando el _id.
  const user3: IUser | null = await UserModel.findById(user2._id);
  console.log("user3",user3);

  // findOne devuelve un objeto usando un filtro.
  const user4: IUser | null = await UserModel.findOne({name: 'Bill'});
  console.log("user4",user4);

  // Partial<IUser> Indica que el objeto puede tener solo algunos campos de IUser.
  // select('name email') solo devuelve name y email.
  // lean() devuelve un objeto plano de JS en lugar de un documento de Mongoose.
  const user5: Partial<IUser> | null  = await UserModel.findOne({ name: 'Bill' })
    .select('name email').lean();
  console.log("user5",user5);
}

main()