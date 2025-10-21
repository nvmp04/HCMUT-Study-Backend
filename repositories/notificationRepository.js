import { notificationClient } from "../config/db.js";

export class NotificationRepository {
  async create(notification) {
    return await notificationClient.insertOne(notification);
  }
  async getById(id){
    return await notificationClient.find({ id })
      .sort({ time: -1 })
      .toArray();;
  }
  async readById(_id){
    return await notificationClient.findOneAndUpdate(
      { _id },
      { $set: { read: true } },
      { returnDocument: "after" }
    );
  }
  async deleteById(_id){
    return await notificationClient.deleteOne({ _id });
  }
  async
}

export const notificationRepository = new NotificationRepository();