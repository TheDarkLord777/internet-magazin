import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

let globalWithMongoose = global as unknown as {
  mongooseConn?: typeof mongoose;
  mongoosePromise?: Promise<typeof mongoose>;
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (globalWithMongoose.mongooseConn) return globalWithMongoose.mongooseConn;

  if (!globalWithMongoose.mongoosePromise) {
    console.log("[DB] Connecting to MongoDB...", { db: process.env.MONGODB_DB });
    globalWithMongoose.mongoosePromise = mongoose
      .connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined })
      .then((conn) => {
        console.log("[DB] Connected", { host: conn.connection.host, name: conn.connection.name });
        return conn;
      })
      .catch((err) => {
        console.error("[DB] Connection error", err);
        throw err;
      });
  }

  globalWithMongoose.mongooseConn = await globalWithMongoose.mongoosePromise;
  return globalWithMongoose.mongooseConn;
}


