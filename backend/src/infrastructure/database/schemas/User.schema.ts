import mongoose, { Schema, Document } from 'mongoose';
import { UserEntity } from '@entities/User.entity';

export interface UserDocument extends Omit<UserEntity, 'id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    image: {
      type: String,
      default: null
    },
    emailVerified: {
      type: Date,
      default: null
    },
    monthlyBudgetLimit: {
      type: Number,
      default: 0,
      min: [0, 'Budget limit cannot be negative']
    },
    preferences: {
      darkMode: {
        type: Boolean,
        default: false
      },
      currency: {
        type: String,
        default: 'INR',
        enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY']
      },
      notifications: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes - email index is already created via unique: true, so we only add createdAt
UserSchema.index({ createdAt: -1 });

// Virtual for checking if user has verified email
UserSchema.virtual('isEmailVerified').get(function (this: UserDocument) {
  return this.emailVerified !== null;
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
