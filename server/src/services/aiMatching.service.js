const calculateScore = (gig, freelancer) => {
  let score = 0;

  // Skill Matching
  const matchedSkills = freelancer.skills.filter(skill =>
    gig.skills.includes(skill)
  );

  score += matchedSkills.length * 20;

  // Experience
  score += freelancer.experience * 5;

  // Rating
  score += freelancer.averageRating * 10;

  // Availability
  if (freelancer.availability === "Available") {
    score += 10;
  }

  return score;
};

export default calculateScore;