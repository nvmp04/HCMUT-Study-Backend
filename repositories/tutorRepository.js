import { tutorClient } from "../config/db.js";

export class TutorRepository {
  async findById(tutorId) {
    return await tutorClient.findOne({ id: tutorId });
  }

  async findAll() {
    return await tutorClient.find({}).toArray();
  }

  async findBanned(){
    return await tutorClient.find({banned: true}).toArray();
  }
  ;
  async updateRating(tutorId, ratingData) {
    return await tutorClient.updateOne(
      { id: tutorId },
      { $set: ratingData }
    );
  }
  async updateBanStatus(tutorId, status) {
    return await tutorClient.updateOne(
      { id: tutorId },
      { $set: {banned: status} }
    );
  }
}

export const tutorRepository = new TutorRepository();