import { tutorClient } from '../config/db.js';
import { genAI, model } from '../config/genAI.js'

export class AIservice{
    async genarateRoadmap(field, interests, level, hours, goal){
        const prompt = `QUAN TRỌNG: 
        - Chỉ trả về văn bản Markdown thuần túy
        - KHÔNG tạo bảng phức tạp, KHÔNG đề xuất export
        - Dùng danh sách và heading thay vì table
        - Không thêm bất kỳ metadata hay suggestion nào
        **Thông tin:**
        - Lĩnh vực: ${field}
        - Công nghệ: ${interests}
        - Trình độ: ${level}
        - Thời gian/tuần: ${hours} giờ
        - Mục tiêu: ${goal}
        **Cấu trúc yêu cầu:**
        # Lộ trình học ${field}
        ## Tổng quan
        - Tổng thời gian: [X tháng]
        - Thời gian học trong tuần: ${hours} giờ/tuần
        ## Giai đoạn 1: [Tên giai đoạn] (Tuần 1-X)
        ### Mục tiêu
        - [Mục tiêu cụ thể]
        ### Nội dung học
        - [Chủ đề 1]
        - [Chủ đề 2]
        ### Tài nguyên
        - [Khóa học/Sách/Link]
        ### Dự án thực hành
        - [Dự án đề xuất]
        [Lặp lại cho các giai đoạn tiếp theo]
        ## Lộ trình tổng thể
        [Timeline hoặc danh sách theo thời gian]
        ## Lời khuyên
        [Tips quan trọng]`
        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    async generateSubjectRoadmap(subjectName, level, hoursPerWeek, goal) {
        const prompt = `QUAN TRỌNG:
        - Chỉ trả về văn bản Markdown THUẦN TÚY.
        - Không dùng bảng, không chèn metadata, không thêm ghi chú dư thừa.
        - Tổng thời gian KHÔNG VƯỢT QUÁ 12 tuần.
        - Dùng danh sách gạch đầu dòng và tiêu đề rõ ràng.

        **Thông tin môn học:**
        - Tên môn học: ${subjectName}
        - Trình độ: ${level}
        - Thời gian học mỗi tuần: ${hoursPerWeek}
        - Mục tiêu: ${goal}

        **Yêu cầu đầu ra:**
        # Lộ trình học ${subjectName}
        ## Tổng quan
        - Tổng thời gian: số tuần hoàn thành (tối đa 12 tuần)
        - Thời gian học trong tuần: ${hoursPerWeek}/tuần
        - Mục tiêu chính: ${goal}

        ## Giai đoạn học
        Chia nội dung thành 3–5 giai đoạn (tương ứng khoảng 2–3 tuần mỗi giai đoạn):
        ### Giai đoạn [số]: [Tên giai đoạn]
        - **Mục tiêu:** [Mục tiêu cụ thể của giai đoạn]
        - **Nội dung học:** 
        - [Chủ đề 1]
        - [Chủ đề 2]
        - **Bài tập hoặc dự án nhỏ:**
        - [Mô tả ngắn]

        [Tiếp tục cho các giai đoạn còn lại, đảm bảo tổng thời gian ≤ 12 tuần]

        ## Ôn tập & Đánh giá
        - Tổng hợp kiến thức quan trọng.
        - Gợi ý bài tập ôn tập hoặc project tổng kết.

        ## Lời khuyên học hiệu quả
        - [Tips ngắn gọn, thực tế để học tốt môn này]
        `;
        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    async convertRoadmapToJSON(markdownRoadmap) {
        const prompt = `Convert lộ trình Markdown sau sang JSON.

        MARKDOWN:
        ${markdownRoadmap}

        OUTPUT: Chỉ JSON thuần, không giải thích, không code block.

        CẤU TRÚC(HOÀN TOÀN TUÂN THEO):
        {
        "title": "Lộ trình học X",
        "overview": {
            "totalDuration": "6 tháng",
            "hoursPerWeek": 10,
            "finalGoal": "..."
        },
        "stages": [
            {
            "id": 1,
            "name": "Foundation",
            "duration": "Tháng 1-2",
            "objectives": ["obj1", "obj2"],
            "topics": ["topic1", "topic2"],
            "resources"(tài liệu học tập): [
                "title1", "title2",...
            ],
            "project": "Mô tả dự án"
            }
        ],
        "overallTimeline": ["", ""],
        "tips": ["tip1", "tip2"]
        }
        QUAN TRỌNG:
        -TUYỆT ĐỐI TUÂN THEO CẤU TRÚC ĐƯỢC GỬI, KHÔNG THÊM KHÔNG BỚT.
        -Chỉ trả về object bắt đầu bằng { và kết thúc bằng }
        `;
        const result = await model.generateContent(prompt);
        const rawText = result.response.text();
        const jsonMatch = rawText.match(/```json\s*([\s\S]+?)```/);
        if (jsonMatch) {
            const jsonString = jsonMatch[1];
            const data = JSON.parse(jsonString);
            return data;
        }
        return rawText;
    }

    async findTutor(markdownRoadmap){
        let tutors = await tutorClient.find({department: 'Khoa học và Kỹ thuật máy tính'}).toArray();
        tutors = tutors.map(tutor => ({
            id: tutor.id,
            subjects: tutor.subjects
        }));

        const tutorsJSON = JSON.stringify(tutors);

        const prompt = `
        OUTPUT: Chỉ JSON thuần, không giải thích, không code block.
        Tôi có markdown sau và list các giảng viên
        MARKDOWN:
        ${markdownRoadmap}
        Giảng viên:
        ${tutorsJSON}
        Trả về cho tôi file JSON array gồm nhiều nhất 4 phần tử(ít hơn nếu độ tương thích không phù hợp, mảng rỗng nếu không có ai phù hợp, PHẢI SÀNG LỌC KĨ CÀNG) [{id: (id của giảng viên phù hợp)}, ....]
        `
        const result = await model.generateContent(prompt);
        const rawText = result.response.text();
        const jsonMatch = rawText.match(/```json\s*([\s\S]+?)```/);
        if (jsonMatch) {
            const jsonString = jsonMatch[1];
            const data = JSON.parse(jsonString);
            return data;
        }
        return rawText;
    }
    
}
export const aiService = new AIservice();