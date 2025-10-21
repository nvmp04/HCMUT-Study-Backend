import { reportClient } from "../config/db.js";

export class ReportService{
    async createReport(studentId, tutorName, title, slotId, report){
        const {attendance, summary, notes} = report;
        await reportClient.insertOne({studentId, tutorName, title, slotId, attendance, summary, notes})
    }
}
export const reportService = new ReportService();