import jwt, { SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  // Allow build to succeed; runtime will throw if used without secret
}

export type JwtPayload = {
  uid: string;
  email: string;
};

export function signAuthToken(payload: JwtPayload): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  const secret: Secret = JWT_SECRET as Secret;
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN } as SignOptions;
  return jwt.sign(payload as object, secret, options);
}

export function verifyAuthToken(token: string): JwtPayload {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  const secret: Secret = JWT_SECRET as Secret;
  return jwt.verify(token, secret) as JwtPayload;
}


