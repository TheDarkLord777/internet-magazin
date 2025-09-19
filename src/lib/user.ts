import mongoose, { Schema, model, models } from "mongoose";

export interface IUser extends mongoose.Document {
  phoneE164: string; // +998... format
  passwordHash?: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phoneE164: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);


