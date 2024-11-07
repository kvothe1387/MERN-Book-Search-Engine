import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import dotenv from 'dotenv';
dotenv.config();

interface DecodedUser extends JwtPayload {
  _id: string;
  username: string;
  email: string;
}

export const authMiddleware = async ({ req }: { req: Request }) => {
  let token = req.body.token || req.query.token || req.headers.authorization;
  const secretKey = process.env.JWT_SECRET_KEY || '';

  if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return req;
  }
  try {
    const { data } = jwt.verify(token, secretKey) as DecodedUser;
    req.user = data;
  } catch (error) {
    return req;
  }
  return req;
};

export const signToken = (username: string, email: string, _id: string): string => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign({ data: payload }, secretKey, { expiresIn: '1h' });
};

