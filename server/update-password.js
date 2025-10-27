const { MongoClient } = require('mongodb');

// Подключение к MongoDB
const uri = "mongodb+srv://oklick2006_db_user:Phd50G5YIzaN+mG9iynrmETn2EA4hX8T0PSXFs3AdxAnivSPphNN4sbDIZWjTRi2@cluster0.hate6nv.mongodb.net/?appName=Cluster0";

async function updatePassword() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    // Проверка подключения
    await client.db("admin").command({ ping: 1 });
    console.log("Database connection verified");
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

updatePassword().catch(console.error);