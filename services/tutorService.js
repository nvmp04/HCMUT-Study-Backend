import { tutorRepository } from "../repositories/tutorRepository.js";

export class TutorService {
  async getAllTutors() {
    return await tutorRepository.findAll();
  }

  async getBannedTutor(){
    return await tutorRepository.findBanned();
  }

  async getTutorById(tutorId) {
    return await tutorRepository.findById(tutorId);
  }

  async updateRating(tutorId, newRating) {
    const tutor = await tutorRepository.findById(tutorId);
    
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    const updatedRating = (
      (tutor.rating * tutor.totalReviews + newRating) /
      (tutor.totalReviews + 1)
    ).toFixed(1);

    await tutorRepository.updateRating(tutorId, {
      rating: parseFloat(updatedRating),
      totalReviews: tutor.totalReviews + 1
    });

    return {
      tutorId,
      newRating: parseFloat(updatedRating),
      totalReviews: tutor.totalReviews + 1
    };
  }
  async updateBanStatus(id, status){
    await tutorRepository.updateBanStatus(id, status);
  }
}

export const tutorService = new TutorService();