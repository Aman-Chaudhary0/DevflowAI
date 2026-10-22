import mongoose from "mongoose";

const isConnected = () => mongoose.connection.readyState === 1;

//  connectDB is an asynchronous function that establishes a connection to a MongoDB database using the Mongoose library. It checks for the presence of the MONGO_URI environment variable, sets Mongoose's strict query mode, and logs the connection host upon successful connection.
export async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  if (isConnected()) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    autoIndex: true,
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection.connection;
}

// disconnectDB is an asynchronous function that gracefully closes the connection to the MongoDB database if it is currently connected, and logs a message indicating the disconnection.
export async function disconnectDB() {
  if (isConnected()) {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}
