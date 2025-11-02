import { ObjectId } from "mongodb";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { createNotification } from "../utils/createNotification.js";

export class NotificationService {
  /**
   * Tạo notification cho appointment
   */
  async createAppointmentNotification(id, title, slotId, studentName, reason, type) {
    const notification = createNotification(
      id,
      title,
      slotId,
      studentName,
      reason,
      type
    );
    return await notificationRepository.create(notification);
  }
  /**
   * Tạo notification từ admin
   */
  async createNotification(id, title, message) {
    const notification = {
      id,
      title,
      message,
      time: new Date(),
      read: false 
    };
    return await notificationRepository.create(notification);
  }
  /***
    * Lấy tất cả notification của user
  */
  async getNotificationById(id){
    return await notificationRepository.getById(id); 
  }
  /***
    * Đọc thông báo
  */
  async readNotification(_id){
    return await notificationRepository.readById(new ObjectId(_id));
  }
  async deleteNotification(_id){
    return await notificationRepository.deleteById(new ObjectId(_id));
  }
  /**
   * Emit socket event for notification
   */
  emitNotification(io, id) {
    if (io) {
      io.to(id).emit('notification', { notifId: id });
    }
  }
}

export const notificationService = new NotificationService();