import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Agent } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'luxe-secret-key-change-this';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);
  try {
    // Check Agents first
    let user = await Agent.findOne({ email });
    let isAgent = true;

    // If not agent, check Users
    if (!user) {
        user = await User.findOne({ email }).select('+password');
        isAgent = false;
    }

    if (user) {
        let isMatch = false;
        if (isAgent && !user.password) {
             // Fallback for mock agents
             isMatch = password === 'Agent123'; 
        } else if (user.password) {
             isMatch = await bcrypt.compare(password, user.password);
        }

        if (isMatch) {
            if (user.status === 'BLOCKED' || (user.name && user.name.includes('BLOCKED'))) {
                return res.status(403).json({ error: 'Account suspended' });
            }

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: generateToken(user.id),
            });
            return;
        }
    }

    res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    const agentExists = await Agent.findOne({ email });

    if (userExists || agentExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = Math.random().toString(36).substr(2, 9);

    const user = await User.create({
      id,
      name,
      email,
      password: hashedPassword,
      role: 'USER',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
    const user = req.user;
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
    });
};