import { Request, Response, NextFunction } from 'express'
import { AppError, sendError } from '../utils/apiResponse'
import { logger } from '../utils/logger'

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let errors = err.errors

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue || {})[0] || 'Resource'
    message = `A record with that ${field} already exists.`
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation failed'
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }))
  }

  // Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }

  if (statusCode >= 500) {
    logger.error('Unhandled Server Error:', err)
  }

  return sendError(res, message, statusCode, errors)
}

