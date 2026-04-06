import { appointmentRepository } from "./apointment.repository.js"
import {historyRepository} from "./history.repository.js"
import { notificationService } from "../../services/notificationService.js";

import { ObjectId } from "mongodb";

export class AppointmentService {
  async getUserAppointments(id) {
    return await appointmentRepository.findByUserId(id);
  }
  async getUserFullSchedule(userId, role) {
    const [activeAppointments, historyAppointments] = await Promise.all([
      appointmentRepository.findByUserId(userId),
      historyRepository.findByUserId(userId, role) 
    ]);

    return {
      active: activeAppointments || [],
      history: historyAppointments || []
    };
  }
  async acceptAppointment(tutorId, _id, slotId, type, detail) {
    const appt = await appointmentRepository.updateAppointment(
      _id,
      {
        status: 'accepted',
        type: type,
        link: type === 'online' ? detail : '',
        location: type === 'offline' ? detail : ''
      }
    );

    if (!appt) {
      throw new Error('Appointment not found');
    }

    const studentId = appt.studentId;

    // Create notification
    await notificationService.createAppointmentNotification(
      studentId,
      appt.title,
      slotId,
      null,
      null,
      'accepted'
    );

    return {
      appointment: appt,
      studentId,
      tutorId,
      eventType: 'accepted'
    };
  }

  

  async declineAppointment(_id, tutorId,  reason) {
    const appt = await appointmentRepository.deleteById(new ObjectId(_id));
    if (!appt) {
      throw new Error('Appointment not found');
    }

    const {studentId} = appt;
    // Tạo thông báo từ chối
    await notificationService.createAppointmentNotification(
      studentId,
      appt.title,
      null,
      reason,
      'declined'
    );

    return {
      appointment: appt,
      studentId,
      tutorId,
      eventType: 'declined',
      reason
    };
  }
  /**
   * Book new appointment (Student tạo appointment mới)
   */
  async bookAppointment(appointmentData) {
    const {
      studentId,
      tutorId,
      status,
      studentName,
      studentPhone,
      tutorName,
      tutorPhone,
      date,
      time,
      title,
      type,
      location,
      link,
      reason
    } = appointmentData;

    // Create appointment
    const appointment = {
      studentId, 
      tutorId,
      status,
      studentName,
      studentPhone,
      tutorName,
      tutorPhone,
      date,
      time,
      title,
      type,
      location,
      link,
      reason,
      rating: 0,
      report: {}
    };

    await appointmentRepository.create(appointment);
    // Create notification for tutor
    await notificationService.createAppointmentNotification(
      tutorId,
      title,
      studentName,
      reason,
      'booked'
    );

    return {
      appointment,
      tutorId,
      studentId,
      eventType: 'booked'
    };
  }
  async reschedule(appointment, timeSlot) {
    const { tutorId } = appointment;
    const { time, date } = timeSlot;

    const conflict = await appointmentRepository.checkConflictSlot(tutorId, time, date);
    
    if (conflict) {
      return {
        success: false,
        message: 'Rất tiếc, khung giờ này vừa có người nhanh tay hơn đặt mất rồi!'
      };
    }
    const new_appointment = await appointmentRepository.updateAppointment(appointment._id, {
      time, 
      date
    });

    return {
      success: true,
      message: "Đổi lịch thành công!",
      appointment: new_appointment
    };
  }
  async cancelAndArchive(id, cancellerId, role, reason, slotId) {
    const appt = await appointmentRepository.findById(new ObjectId(id));
    if (!appt) {
      throw new Error('Appointment not found');
    }
    const historyData = {
      ...appt,
      originalId: appt._id, 
      status: 'cancelled',
      reason: reason,
      cancelledBy: cancellerId,
      cancelledRole: role, 
      visibleToStudent: true,
      visibleToTutor: true,
      archivedAt: new Date()
    };
    delete historyData._id;
    await historyRepository.create(historyData);
    await appointmentRepository.deleteById(new ObjectId(id));
    const receiverId = role === 'student' ? appt.tutorId : appt.studentId;
    await notificationService.createAppointmentNotification(
      receiverId,
      appt.title,
      slotId,
      role === 'student' ? appt.studentName : appt.tutorName,
      reason,
      'cancelled'
    );

    return {
      appointment: appt,
      tutorId: appt.tutorId,
      studentId: appt.studentId,
      eventType: 'cancelled',
      reason
    };
  }

  
  async hideHistory(historyId, role) {
    const updateField = role === 'student' ? { visibleToStudent: false } : { visibleToTutor: false };
    
    const updated = await historyRepository.updateVisibility(historyId, updateField);
    if (!updated.visibleToStudent && !updated.visibleToTutor) {
      await historyRepository.deletePermanently(historyId);
    }
    return updated;
  }
  async cancelBeforeAccept(_id, studentId, slotId) {
    const appt = await appointmentRepository.deleteById(new ObjectId(_id));
    if (!appt) {
      throw new Error('Appointment not found');
    }
    const {tutorId} = appt;
    return {
      appointment: appt,
      tutorId,
      studentId,
      slotId,
      eventType: 'cancelBeforeAccept'
    };
  }
  async deleteCancelledAppointment(appointmentId) {
    return await appointmentRepository.deleteById(new ObjectId(appointmentId));
  }
  async rateAppointment(appointmentId, rating) {
    return await appointmentRepository.updateAppointment(
      new ObjectId(appointmentId),
      { rating: rating }
    );
  }
  async reportAppointment(appointmentId, report){
    const apptDoc = await appointmentRepository.findById(new ObjectId(appointmentId));
    if (!apptDoc) {
      throw new Error('Appointment not found');
    }
    const {studentId} = apptDoc;
    await notificationService.createAppointmentNotification(
      studentId,
      apptDoc.title,
      null,
      null,
      null,
      'report'
    );
    return await appointmentRepository.updateAppointment(
      new ObjectId(appointmentId), 
      {report: report}
    )
  };
}

export const appointmentService = new AppointmentService();