import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import User from "./src/models/User.js";
import Client from "./src/models/client.js";
import Freelancer from "./src/models/Freelancer.js";
import Gig from "./src/models/Gig.js";
import Proposal from "./src/models/Proposal.js";
import Review from "./src/models/Review.js";

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Client.deleteMany();
    await Freelancer.deleteMany();
    await Gig.deleteMany();
    await Proposal.deleteMany();
    await Review.deleteMany();

    // 1. Create Users
    const usersData = [
      { name: "Admin User", email: "admin@example.com", password: "password123", role: "admin", isVerified: true },
      { name: "John Tech Client", email: "john@example.com", password: "password123", role: "client", isVerified: true },
      { name: "Jane Pro Freelancer", email: "jane@example.com", password: "password123", role: "freelancer", isVerified: true },
      { name: "Bob Startup Client", email: "bob@example.com", password: "password123", role: "client", isVerified: true },
      { name: "Alice Dev Freelancer", email: "alice@example.com", password: "password123", role: "freelancer", isVerified: true },
    ];

    const users = await User.create(usersData);

    const adminUser = users[0];
    const clientUser1 = users[1];
    const freelancerUser1 = users[2];
    const clientUser2 = users[3];
    const freelancerUser2 = users[4];

    // 2. Create Clients
    const clientsData = [
      {
        user: clientUser1._id,
        companyName: "Tech Innovations Inc.",
        companyWebsite: "https://techinnovations.example.com",
        industry: "Information Technology",
        companySize: "11-50",
        description: "A leading tech innovation company.",
        location: "New York, USA",
        verified: true,
      },
      {
        user: clientUser2._id,
        companyName: "NextGen Startups",
        companyWebsite: "https://nextgen.example.com",
        industry: "Finance",
        companySize: "1-10",
        description: "Fintech startup looking for fresh talent.",
        location: "San Francisco, USA",
        verified: true,
      }
    ];

    const clients = await Client.create(clientsData);

    // 3. Create Freelancers
    const freelancersData = [
      {
        user: freelancerUser1._id,
        title: "Senior Full Stack Developer",
        bio: "I am a full stack developer with 5 years of experience in MERN stack.",
        skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
        hourlyRate: 50,
        experience: 5,
        availability: "Available",
        languages: ["English", "Spanish"],
        profileCompleted: true,
        averageRating: 4.8,
        totalReviews: 12
      },
      {
        user: freelancerUser2._id,
        title: "UI/UX Designer & Frontend Dev",
        bio: "Passionate about creating beautiful and functional user interfaces.",
        skills: ["Figma", "React", "CSS", "Tailwind"],
        hourlyRate: 35,
        experience: 3,
        availability: "Available",
        languages: ["English"],
        profileCompleted: true,
        averageRating: 4.5,
        totalReviews: 8
      }
    ];

    const freelancers = await Freelancer.create(freelancersData);

    // 4. Create Gigs
    const gigsData = [
      {
        client: clients[0]._id,
        title: "Build an E-commerce Platform",
        description: "We need a full-stack developer to build a modern e-commerce platform using the MERN stack.",
        category: "Web Development",
        skills: ["React", "Node.js", "MongoDB"],
        budget: 5000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
        experienceLevel: "Expert",
        status: "Open",
        milestones: [
          { title: "Frontend Design", amount: 1500 },
          { title: "Backend API", amount: 1500 },
          { title: "Integration & Testing", amount: 2000 }
        ]
      },
      {
        client: clients[1]._id,
        title: "Design a Mobile App UI",
        description: "Looking for an experienced UI/UX designer to create screens for our new fintech app.",
        category: "Design",
        skills: ["Figma", "UI/UX"],
        budget: 1000,
        deadline: new Date(new Date().setDate(new Date().getDate() + 14)), // 14 days from now
        experienceLevel: "Intermediate",
        status: "Open",
        milestones: [
          { title: "Wireframing", amount: 300 },
          { title: "Final Design", amount: 700 }
        ]
      }
    ];

    const gigs = await Gig.create(gigsData);

    // 5. Create Proposals
    const proposalsData = [
      {
        gig: gigs[0]._id,
        freelancer: freelancers[0]._id,
        coverLetter: "I have extensive experience building e-commerce platforms and would love to work on this project.",
        bidAmount: 4800,
        estimatedDays: 30,
        status: "Pending"
      },
      {
        gig: gigs[1]._id,
        freelancer: freelancers[1]._id,
        coverLetter: "I specialize in fintech UI/UX design and can deliver modern, clean screens for your app.",
        bidAmount: 950,
        estimatedDays: 10,
        status: "Pending"
      }
    ];

    await Proposal.create(proposalsData);

    console.log("Dummy data successfully imported!");
    process.exit();
  } catch (error) {
    console.error("Error importing dummy data:", error);
    process.exit(1);
  }
};

importData();
