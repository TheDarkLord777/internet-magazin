import mongoose, { Schema, model, models } from "mongoose";

export interface IUser extends mongoose.Document {
  email: string; // user email
  phoneE164?: string; // optional legacy phone field
  passwordHash?: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  firstName?: string;
  lastName?: string;
  phone?: string;
  locations?: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    placeId: string;
  }[];
  google?: {
    sub?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    phoneE164: { type: String, required: false, unique: false, index: true },
    passwordHash: { type: String },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    locations: [{
      name: { type: String },
      address: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      },
      placeId: { type: String }
    }],
    google: {
      sub: { type: String },
      accessToken: { type: String },
      refreshToken: { type: String },
      tokenExpiresAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);

// Cleanup helper for legacy unique index on phoneE164
export async function dropLegacyPhoneUniqueIndexIfExists(): Promise<void> {
  try {
    const indexes = await User.collection.indexes();
    const legacy = indexes.find((i) => i.name === "phoneE164_1");
    if (legacy) {
      await User.collection.dropIndex("phoneE164_1");
    }
  } catch (err) {
    // ignore if not found or cannot drop
  }
}


