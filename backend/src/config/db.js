import mongoose from "mongoose";

//  connectDB is an asynchronous function that establishes a connection to a MongoDB database using the Mongoose library. It checks for the presence of the MONGO_URI environment variable, sets Mongoose's strict query mode, and logs the connection host upon successful connection.
export async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${connection.connection.host}`);
}
