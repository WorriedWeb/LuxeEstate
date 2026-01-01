import jwt from 'jsonwebtoken';
import { User, Agent } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'luxe-secret-key-change-this';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check both User and Agent collections
      let user = await User.findOne({ id: decoded.id });
      if (!user) {
          user = await Agent.findOne({ id: decoded.id });
      }

      if (!user) {
          return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};