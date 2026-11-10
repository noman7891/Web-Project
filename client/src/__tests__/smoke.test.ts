import { describe, it, expect } from 'vitest'
import { extractErrorMessage } from '../services/api'

describe('Frontend Utilities and API Service', () => {
  it('extractErrorMessage handles standard string error', () => {
    const error = new Error('Standard network failure')
    expect(extractErrorMessage(error)).toBe('Standard network failure')
  })

  it('extractErrorMessage handles Axios-like response payload with message', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        data: {
          success: false,
          message: 'Invalid email or password credentials',
        },
      },
    }
    // Directly testing fallback or structured error
    expect(extractErrorMessage(axiosError)).toBe('Invalid email or password credentials')
  })

  it('extractErrorMessage handles validation error array', () => {
    const validationError = {
      isAxiosError: true,
      response: {
        data: {
          success: false,
          errors: [
            { field: 'email', message: 'Invalid email address' },
            { field: 'password', message: 'Password too short' },
          ],
        },
      },
    }
    expect(extractErrorMessage(validationError)).toBe(
      'Invalid email address, Password too short'
    )
  })
})

