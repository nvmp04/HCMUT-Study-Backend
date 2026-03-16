import { MongoClient } from "mongodb";
import dotenv from 'dotenv'

dotenv.config();
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri);

export let accountClient, studentClient, tutorClient, tutorScheduleClient, appointmentClient, notificationClient, unsuccessfulClient, reportClient, roadmapClient, documentClient;
let database;
export async function connectDB() {
  try {
    await client.connect();
    console.log(" Connected to MongoDB Atlas");

    database = client.db("HCMUT-Study");
    accountClient = database.collection("account");
    studentClient = database.collection("student");
    tutorClient = database.collection("tutor");
    tutorScheduleClient = database.collection("tutorSchedule");
    appointmentClient = database.collection("appointment")
    notificationClient = database.collection("notification");
    unsuccessfulClient = database.collection('weeklyUnsuccessfulSchedules');
    reportClient = database.collection('report');
    roadmapClient = database.collection('roadmap');
    documentClient = database.collection('document');
  } catch (err) {
    console.log(` Can't connect to MongoDB: ${err}`);
  }
}
