import { Response } from 'express'

export class AppError extends Error {
  public statusCode: number
  public errors?: any

  constructor(message: string, statusCode = 500, errors?: any) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export const sendSuccess = (
  res: Response,
  data: any,
  message?: string,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  })
}

