import dotenv from "dotenv";

dotenv.config();

const envconfig = {
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/will-api", 
  PORT: process.env.PORT || "3000",
};

export default envconfig;
