const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://jeaen:jp2583462@cluster0.bqe9c.mongodb.net/planificacion?retryWrites=true&w=majority";

async function testConnection() {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Conexión exitosa a MongoDB");
    await client.close();
  } catch (error) {
    console.error("Error conectándose a MongoDB:", error);
  }
}

testConnection();
