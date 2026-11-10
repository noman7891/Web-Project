import jwt from 'jsonwebtoken'
import { config } from '../config/env'
import { IUserPayload } from '../types'

export const signToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions)
}

export const verifyToken = (token: string): IUserPayload => {
  return jwt.verify(token, config.jwtSecret) as IUserPayload
}

