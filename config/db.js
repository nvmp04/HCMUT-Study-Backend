import { MongoClient } from "mongodb";

const uri = "mongodb+srv://minhphu2462004_db_user:phudeptrai04@clouddata.n345wgk.mongodb.net/?retryWrites=true&w=majority&appName=CloudData";
const client = new MongoClient(uri);

export let accountClient, studentClient, tutorClient, tutorScheduleClient, appointmentClient, notificationClient;
let database;
export async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    database = client.db("HCMUT-Study");
    accountClient = database.collection("account");
    studentClient = database.collection("student");
    tutorClient = database.collection("tutor");
    tutorScheduleClient = database.collection("tutorSchedule");
    appointmentClient = database.collection("appointment")
    notificationClient = database.collection("notification");
  } catch (err) {
    console.log(`❌ Can't connect to MongoDB: ${err}`);
  }
}
