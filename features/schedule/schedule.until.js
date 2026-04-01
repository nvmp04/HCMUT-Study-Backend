export const DateUtils = {
    // Format thứ (Chủ Nhật, Thứ Hai, ....)
    getDayFormat: (date) => date.toLocaleDateString("vi-VN", { weekday: "long" }),
    
    // Format ngày tháng VN (30/03/2026)
    getDateFormat: (date) => date.toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
    }),

    // Chuyển index ngày sang key của weekMap
    getWeekKey: (date) => ["sun", "mon", "tues", "wed", "thur", "fri", "sat"][date.getDay()]
};

/**
 * Tạo bảng băm cho những slot được đặt
 * Mục đích để thay O(7 * n_appt * slots_per_day) -> O(n_appt + 7 * slots_per_day)
 */
export const buildSlotsStatusHash = (appointments) => {
    const slotsStatus = {};
    appointments.forEach((appt) => {
        if (!slotsStatus[appt.date]) {
            slotsStatus[appt.date] = {};
        }
        slotsStatus[appt.date][appt.time] = {
            appointment: appt,
            status: appt.status
        };
    });
    return slotsStatus;
};