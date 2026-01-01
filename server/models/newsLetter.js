import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email']
    },
    status: {
      type: String,
      enum: ['SUBSCRIBED', 'UNSUBSCRIBED'],
      default: 'SUBSCRIBED'
    }
  },
  { timestamps: true }
);

export const Newsletter = mongoose.model('Newsletter', newsletterSchema);
    