import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullname, email, password, adminPasskey } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 3) {
      return res
        .status(400)
        .json({ message: "Password must be at least 3 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (adminPasskey == process.env.ADMIN_PASSKEY) {
      const newUser = new User({
        fullname,
        email,
        password: hashedPassword,
        role: "admin",
      });
      if (newUser) {
        generateToken(newUser._id, res);
        await newUser.save();
        res.status(201).json(newUser);
      } else {
        res.status(400).json({ message: "Invalid user data" });
      }
    } else {
      const newUser = new User({
        fullname,
        email,
        password: hashedPassword,
        role: "user"
      });
      if (newUser) {
        generateToken(newUser._id, res);
        await newUser.save();
        res.status(201).json(newUser);
      } else {
        res.status(400).json({ message: "Invalid user data" });
      }
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).lean(); //.lean() converts user(a mongoose document) to a js object as i was destructuring it below and removing password field form it.

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    const { password: userPassword, ...userWithoutPassword } = user; // password ka naam userPassword de diya, as it was creating problem as req.body se bhi password mil rha hai, so ye usse confuse kr rha tha.
    res.status(200).send(userWithoutPassword);
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    // console.log("chechAuth function in backend: ", req.user);
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
