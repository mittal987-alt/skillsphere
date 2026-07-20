import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

/**
 * Enhanced AI-powered freelancer scoring using semantic analysis.
 * Uses Mistral's embedding/chat capabilities to reason about fit.
 * 
 * @param {Object} gig - The gig document
 * @param {Array} freelancers - Array of freelancer documents
 * @returns {Array} Scored and sorted freelancers with explanations
 */
export const rankFreelancersWithAI = async (gig, freelancers) => {
  // Build a prompt asking Mistral to score each freelancer
  const freelancerSummaries = freelancers.map((f, idx) => ({
    idx,
    id: f._id.toString(),
    title: f.title || "Unknown",
    skills: f.skills || [],
    experience: f.experience || 0,
    rating: f.averageRating || 0,
    availability: f.availability || "Unknown",
    bio: f.bio || "",
  }));

  const prompt = `
You are a talent-matching AI for a freelance marketplace called SkillSphere.

Given the following GIG requirement:
- Title: "${gig.title}"
- Description: "${gig.description}"
- Required Skills: ${gig.skills?.join(", ") || "None specified"}
- Budget: $${gig.budget}
- Experience Level: ${gig.experienceLevel || "Any"}

And the following list of FREELANCERS (JSON format):
${JSON.stringify(freelancerSummaries.slice(0, 20), null, 2)}

Please score each freelancer from 0 to 100 based on how well they fit this gig. 
Weigh factors: skill match (50%), experience & rating (30%), availability (20%).

Respond in ONLY valid JSON format:
{
  "scores": [
    { "id": "<freelancer_id>", "score": <number>, "reason": "<1-sentence explanation>" }
  ]
}
`;

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
    responseFormat: { type: "json_object" },
    temperature: 0.2,
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);

  // Merge AI scores back into freelancer list
  const scoreMap = new Map(parsed.scores.map((s) => [s.id, s]));

  return freelancers
    .map((f) => {
      const aiScore = scoreMap.get(f._id.toString());
      return {
        freelancer: f,
        score: aiScore?.score ?? 0,
        reason: aiScore?.reason ?? "No explanation provided.",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
};

/**
 * Recommend gigs for a freelancer using AI-powered semantic matching.
 * 
 * @param {Object} freelancer - Freelancer document
 * @param {Array} gigs - Array of open gig documents
 * @returns {Array} Scored and sorted gigs with explanations
 */
export const rankGigsForFreelancerWithAI = async (freelancer, gigs) => {
  const gigSummaries = gigs.map((g, idx) => ({
    idx,
    id: g._id.toString(),
    title: g.title,
    description: g.description?.slice(0, 200) || "",
    skills: g.skills || [],
    budget: g.budget,
    experienceLevel: g.experienceLevel || "Any",
  }));

  const prompt = `
You are a talent-matching AI for a freelance marketplace called SkillSphere.

Given the following FREELANCER profile:
- Title: "${freelancer.title || "No title"}"
- Bio: "${freelancer.bio?.slice(0, 200) || "No bio"}"
- Skills: ${freelancer.skills?.join(", ") || "None listed"}
- Experience: ${freelancer.experience || 0} years
- Rating: ${freelancer.averageRating || 0}/5
- Availability: ${freelancer.availability}

And the following list of OPEN GIGS (JSON format):
${JSON.stringify(gigSummaries.slice(0, 20), null, 2)}

Please score each gig from 0 to 100 based on how good a fit it is for this freelancer.
Weigh factors: skill overlap (50%), budget fit for experience (25%), seniority match (25%).

Respond in ONLY valid JSON format:
{
  "scores": [
    { "id": "<gig_id>", "score": <number>, "reason": "<1-sentence explanation>" }
  ]
}
`;

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
    responseFormat: { type: "json_object" },
    temperature: 0.2,
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);

  const scoreMap = new Map(parsed.scores.map((s) => [s.id, s]));

  return gigs
    .map((g) => {
      const aiScore = scoreMap.get(g._id.toString());
      return {
        gig: g,
        score: aiScore?.score ?? 0,
        reason: aiScore?.reason ?? "No explanation provided.",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
};

/**
 * Simple deterministic scoring for fallback when Mistral is unavailable.
 */
export const calculateDeterministicScore = (gig, freelancer) => {
  let score = 0;

  // Skill matching (50 pts max)
  const gigSkillsLower = (gig.skills || []).map((s) => s.toLowerCase());
  const freelancerSkillsLower = (freelancer.skills || []).map((s) => s.toLowerCase());
  const matchedSkills = freelancerSkillsLower.filter((s) => gigSkillsLower.includes(s));
  score += Math.min(50, matchedSkills.length * 15);

  // Experience (30 pts max)
  score += Math.min(30, (freelancer.experience || 0) * 5);

  // Rating (20 pts max)
  score += (freelancer.averageRating || 0) * 4;

  // Availability bonus
  if (freelancer.availability === "Available") score += 5;

  return Math.min(100, score);
};