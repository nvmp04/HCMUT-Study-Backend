export const notificationType = {
  accepted: "Giảng viên đã chấp nhận lịch học!",
  cancelled: "Buổi học đã bị hủy!",
  declined: "Giảng viên đã từ chối lịch học.",
  booked: "Thông báo đặt lịch mới!"
};

export const createMessage = (title, slotId, name, reason, type) => {
  const messages = {
    accepted: `Lịch học "${title}" vào lúc ${slotId} đã được xác nhận.`,
    cancelled: `Buổi học "${title}" vào lúc ${slotId} đã bị hủy với lý do: "${reason}".`,
    declined: `Giảng viên đã từ chối lịch học "${title}" vào lúc ${slotId} với lý do: "${reason}".`,
    booked: `Bạn có yêu cầu đặt lịch mới từ ${name} vào lúc ${slotId}.`,
    report: `Biên bản buổi học ${title} đã được cập nhật`
  };

  return messages[type] || "Thông báo mới.";
};

export function createNotification(id, title, slotId, name, reason, type) {
  const message = createMessage(title, slotId, name, reason, type);
  const notification = { 
        id,
        title: notificationType[type] || "Thông báo mới",
        message,
        time: new Date(),
        read: false 
    };
    return notification;
}
