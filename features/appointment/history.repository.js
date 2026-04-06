import { historyClient } from "../../config/db.js"; // Import đúng client bạn yêu cầu
import { ObjectId } from "mongodb";

export class HistoryRepository {
    /**
     * Lấy lịch sử cho một User (Student hoặc Tutor)
     * Chỉ lấy những bản ghi mà User đó chưa ẩn (visible = true)
     */
    async findByUserId(id, role) {
        const query = role === 'student' 
            ? { studentId: id, visibleToStudent: true }
            : { tutorId: id, visibleToTutor: true };

        return await historyClient
            .find(query)
            .sort({ archivedAt: -1 }) // Sắp xếp theo thời gian lưu vào lịch sử
            .toArray();
    }

    /**
     * Tạo mới bản ghi lịch sử (Copy từ Appointment qua)
     */
    async create(historyData) {
        // Đảm bảo có các flag hiển thị mặc định khi khởi tạo
        const data = {
            ...historyData,
            visibleToStudent: true,
            visibleToTutor: true,
            archivedAt: new Date()
        };
        return await historyClient.insertOne(data);
    }

    /**
     * Cập nhật Flag ẩn/hiện cho từng phía (Student hoặc Tutor)
     */
    async updateVisibility(_id, updateData) {
        return await historyClient.findOneAndUpdate(
            { _id: new ObjectId(_id) },
            { $set: updateData },
            { returnDocument: 'after' } // Trả về bản ghi sau khi update để check flag
        );
    }

    /**
     * Tìm bản ghi lịch sử theo ID
     */
    async findById(id) {
        return await historyClient.findOne({ _id: new ObjectId(id) });
    }

    /**
     * Xóa vĩnh viễn bản ghi khi cả 2 bên cùng ẩn
     */
    async deletePermanently(id) {
        return await historyClient.deleteOne({ _id: new ObjectId(id) });
    }
}

export const historyRepository = new HistoryRepository();