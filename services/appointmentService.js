import { appointmentRepository } from "../repositories/appointmentRepository.js";
import { notificationService } from "./notificationService.js";
import { ObjectId } from "mongodb";

export class AppointmentService {
  //Lấy appointments của tutor theo status
  async getAppointmentsByTutor(tutorId, status = null) {
    return await appointmentRepository.findByTutorId(tutorId, status);
  }
  async getAppointmentsByStudent(StudentId, status = null) {
    return await appointmentRepository.findByStudentId(StudentId, status);
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

  /**
   * Cancel appointment by tutor
   */
  async cancelAppointment(tutorId, _id, slotId, reason) {
    const apptDoc = await appointmentRepository.findById(new ObjectId(_id));
    if (!apptDoc) {
      throw new Error('Appointment not found');
    }
    const {studentId} = apptDoc;
    await notificationService.createAppointmentNotification(
      studentId,
      apptDoc.title,
      slotId,
      null,
      reason,
      'cancelled'
    );
    const appt = await appointmentRepository.updateAppointment(
      _id,
      {
        tutorId: '',
        status: 'cancelled',
        reason: reason
      }
    );
    return {
      appointment: appt,
      studentId,
      tutorId,
      eventType: 'cancelled',
      reason
    };
  }

  async declineAppointment(_id, tutorId, slotId, reason) {
    const appt = await appointmentRepository.deleteById(new ObjectId(_id));
    if (!appt) {
      throw new Error('Appointment not found');
    }

    const {studentId} = appt;
    // Tạo thông báo từ chối
    await notificationService.createAppointmentNotification(
      studentId,
      appt.title,
      slotId,
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
      slotId,
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
      slotId,
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
      slotId,
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

  async cancelByStudent(studentId, _id, slotId, reason) {
    const appt = await appointmentRepository.updateAppointment(
      _id,
      {
        id: studentId,
        status: 'cancelled',
        reason: reason
      }
    );
    if (!appt) {
      throw new Error('Appointment not found');
    }
    const tutorId = appt.tutorId;
    await notificationService.createAppointmentNotification(
      tutorId,
      appt.title,
      slotId,
      appt.studentName,
      reason,
      'cancelled'
    );

    return {
      appointment: appt,
      tutorId,
      studentId,
      eventType: 'cancelled',
      reason
    };
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
  async getScheduleStatus(tutorId) {
    const appointments = await appointmentRepository.findByTutorId(tutorId);
    return appointments.map((appt) => ({
      slotId: appt.slotId,
      status: appt.status,
    }));
  }
}

export const appointmentService = new AppointmentService();