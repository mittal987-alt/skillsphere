import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import {sendEmail} from "../services/email.service.js";
import welcomeEmail from "../../templates/welcomeEmail.js";
import Client from "../models/client.js";
import Freelancer from "../models/Freelancer.js";



// @desc Register User
// @route POST /api/auth/register
// @access Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role,
    });
    if (role === "client") {
  await Client.create({
    user: user._id,
    companyName: `${name}'s Company`,
  });
}

if (role === "freelancer") {
  await Freelancer.create({
    user: user._id,
  });
}

    try {
  await sendEmail({
    to: user.email,
    subject: "Welcome to SkillSphere 🎉",
    html: welcomeEmail(user.name),
  });
} catch (err) {
  console.error("Email Error:", err.message);
}
    // Generate Token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Login User
// @route POST /api/auth/login
// @access Public

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check Fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }

    // Get Password also
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Compare Password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Generate JWT
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Current User
// @route GET /api/auth/me
// @access Private

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};


// @desc Logout
// @route POST /api/auth/logout

export const logoutUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};