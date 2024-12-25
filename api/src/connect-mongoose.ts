import mongoose from "mongoose";

export async function connectMongoose() {
  console.log("Connecting to MongoDB");

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
  });

  console.log("Connected to MongoDB");
}
