import bcrypt from 'bcryptjs';
import {User} from '../models/index.js';

export const setAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD missing in env');
  }

  const existingAdmin = await User.findOne({ role: 'ADMIN' });

  if (existingAdmin) {
    console.log('✅ Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await User.create({
    name: 'Super Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'ADMIN',
    isActive: true,
  });

  console.log('🔥 Admin user created');
};
