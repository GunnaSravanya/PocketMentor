import mongoose from "mongoose";

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pocket_mentor";

  try {
    console.log("[Database] Connecting to MongoDB...");
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000, // 5s timeout prevents infinite hangs
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Warning] Primary connection failed: ${error.message}`);

    // If Atlas/remote timed out, fallback to local MongoDB
    if (primaryUri && !primaryUri.includes("127.0.0.1") && !primaryUri.includes("localhost")) {
      console.warn(
        "\n[Database Alert] Remote MongoDB Atlas connection timed out (ETIMEDOUT)." +
        "\n💡 Hint: Whitelist your IP in MongoDB Atlas: Network Access -> Add IP Address -> 'Allow Access From Anywhere' (0.0.0.0/0)." +
        "\n⚡ Seamlessly connecting to local MongoDB (mongodb://127.0.0.1:27017/pocket_mentor) so your app continues working...\n"
      );

      try {
        const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/pocket_mentor", {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[Database] Connected to local MongoDB: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.error("[Database Error] Local MongoDB fallback also failed:", localErr.message);
      }
    }

    process.exit(1);
  }
};
