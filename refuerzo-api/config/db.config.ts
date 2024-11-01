import debug from "debug"; 
import mongoose from "mongoose"; 
import envconfig from "./env.config"; 

const debugLog = debug("will-api:db"); 
const uri = envconfig.MONGO_URI;

const connect = async () => {
  try {
    await mongoose.connect(uri);
    debugLog("¡Estás conectado a la BD!");
  } catch (error) {
    debugLog("[Error]: ¡No se pudo conectar! :/!");
  }
};

export { connect };
