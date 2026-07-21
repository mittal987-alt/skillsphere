import { Mistral } from "@mistralai/mistralai";

const client = process.env.MISTRAL_API_KEY
  ? new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
  : null;

/**
 * Safely parse JSON from AI responses, handling markdown code fences and surrounding text.
 */
const cleanAndParseJson = (text) => {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI JSON response:", err.message, "Original text:", text);
    return null;
  }
};

/**
 * Enhanced AI-powered freelancer scoring using semantic analysis.
 * Uses Mistral's chat capabilities to reason about fit.
 * 
 * @param {Object} gig - The gig document
 * @param {Array} freelancers - Array of freelancer documents
 * @returns {Array} Scored and sorted freelancers with explanations
 */
export const rankFreelancersWithAI = async (gig, freelancers) => {
  if (!client || !process.env.MISTRAL_API_KEY) {
    throw new Error("Mistral API key is not configured.");
  }

  const freelancerSummaries = freelancers.map((f, idx) => ({
    idx,
    id: f._id.toString(),
    title: f.title || "Unknown",
    skills: f.skills || [],
    experience: f.experience || 0,
    rating: f.averageRating || 0,
    availability: f.availability || "Unknown",
    hourlyRate: f.hourlyRate || 0,
    bio: (f.bio || "").slice(0, 150),
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
Weigh factors: skill match (50%), experience & rating (30%), availability & rate fit (20%).

Respond ONLY in strict, valid JSON format without markdown ticks if possible:
{
  "scores": [
    { "id": "<freelancer_id>", "score": <number>, "reason": "<1-sentence personalized explanation why they fit>" }
  ]
}
`;

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  const parsed = cleanAndParseJson(content);

  if (!parsed || !Array.isArray(parsed.scores)) {
    throw new Error("Invalid structure returned by Mistral AI");
  }

  const scoreMap = new Map(parsed.scores.map((s) => [s.id, s]));

  return freelancers
    .map((f) => {
      const aiScore = scoreMap.get(f._id.toString());
      return {
        freelancer: f,
        score: aiScore?.score ?? calculateDeterministicScore(gig, f),
        reason: aiScore?.reason ?? "Matched based on skill overlap and experience level.",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
};

/**
 * Recommend gigs for a freelancer using AI-powered semantic matching.
 * 
 * @param {Object} freelancer - Freelancer document
 * @param {Array} gigs - Array of open gig documents
 * @returns {Array} Scored and sorted gigs with explanations
 */
export const rankGigsForFreelancerWithAI = async (freelancer, gigs) => {
  if (!client || !process.env.MISTRAL_API_KEY) {
    throw new Error("Mistral API key is not configured.");
  }

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
- Hourly Rate: $${freelancer.hourlyRate || 0}/hr
- Availability: ${freelancer.availability}

And the following list of OPEN GIGS (JSON format):
${JSON.stringify(gigSummaries.slice(0, 20), null, 2)}

Please score each gig from 0 to 100 based on how good a fit it is for this freelancer.
Weigh factors: skill overlap (50%), budget fit for rate (25%), seniority match (25%).

Respond ONLY in strict, valid JSON format without markdown ticks if possible:
{
  "scores": [
    { "id": "<gig_id>", "score": <number>, "reason": "<1-sentence explanation of why this gig fits the freelancer>" }
  ]
}
`;

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  const parsed = cleanAndParseJson(content);

  if (!parsed || !Array.isArray(parsed.scores)) {
    throw new Error("Invalid structure returned by Mistral AI");
  }

  const scoreMap = new Map(parsed.scores.map((s) => [s.id, s]));

  return gigs
    .map((g) => {
      const aiScore = scoreMap.get(g._id.toString());
      return {
        gig: g,
        score: aiScore?.score ?? calculateDeterministicScore(g, freelancer),
        reason: aiScore?.reason ?? "Matched based on skill overlap and budget fit.",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
};

/**
 * Generate a compelling AI proposal / cover letter for a freelancer applying to a gig.
 */
export const generateAICoverLetter = async (gig, freelancer) => {
  if (!client || !process.env.MISTRAL_API_KEY) {
    // Fallback template
    return `Hello! I am very interested in your gig "${gig.title}". With my background in ${freelancer.skills?.join(", ") || "relevant technologies"} and ${freelancer.experience || 1}+ years of hands-on experience, I am confident I can deliver high-quality work within your timeline. Looking forward to discussing how I can assist with this project!`;
  }

  const prompt = `
You are an expert freelance proposal writer for SkillSphere.

Write a concise, high-converting 3-paragraph proposal / cover letter for a freelancer applying to this gig:

GIG:
- Title: "${gig.title}"
- Description: "${gig.description}"
- Required Skills: ${gig.skills?.join(", ") || "General"}
- Budget: $${gig.budget}

FREELANCER:
- Title: "${freelancer.title || "Freelancer"}"
- Skills: ${freelancer.skills?.join(", ") || "Skills"}
- Experience: ${freelancer.experience || 1} years
- Bio: "${freelancer.bio || ""}"

Write directly in the freelancer's voice. Be persuasive, professional, and highlight how their specific skills solve the client's needs. Do NOT include placeholder headers like "[Your Name]". Start directly with a warm greeting.
`;

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || "Failed to generate cover letter.";
};

/**
 * Enhance gig title, description, and extract recommended skill tags for clients.
 */
export const enhanceGigDescription = async (title, roughDescription, category) => {
  if (!client || !process.env.MISTRAL_API_KEY) {
    return {
      enhancedDescription: roughDescription,
      recommendedSkills: ["Development", "Design"],
    };
  }

  const prompt = `
You are an AI hiring assistant for SkillSphere.

A client wants to post a gig with:
- Title: "${title}"
- Category: "${category || "General"}"
- Rough Description: "${roughDescription}"

Tasks:
1. Polish the description into a clear, attractive project listing with bullet points for Key Responsibilities and Deliverables.
2. Extract 3 to 6 essential technical/professional skill tags as a list of strings.

Respond ONLY in strict, valid JSON format:
{
  "enhancedDescription": "<formatted string with markdown headings/bullet points>",
  "recommendedSkills": ["<skill1>", "<skill2>", "<skill3>"]
}
`;

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const content = response.choices[0]?.message?.content;
  const parsed = cleanAndParseJson(content);

  if (parsed && parsed.enhancedDescription && Array.isArray(parsed.recommendedSkills)) {
    return parsed;
  }

  return {
    enhancedDescription: roughDescription,
    recommendedSkills: [],
  };
};

/**
 * Simple deterministic scoring for fallback when Mistral is unavailable.
 * Bi-directional compatibility.
 */
export const calculateDeterministicScore = (itemA, itemB) => {
  let score = 20; // Base score

  const skillsA = (itemA.skills || []).map((s) => s.toLowerCase());
  const skillsB = (itemB.skills || []).map((s) => s.toLowerCase());

  const matchedSkills = skillsA.filter((s) => skillsB.includes(s));
  score += Math.min(50, matchedSkills.length * 15);

  const exp = itemA.experience ?? itemB.experience ?? 0;
  score += Math.min(20, exp * 4);

  const rating = itemA.averageRating ?? itemB.averageRating ?? 0;
  score += Math.min(10, rating * 2);

  return Math.min(98, score);
};