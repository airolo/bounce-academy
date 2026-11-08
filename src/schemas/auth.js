import { z } from 'zod'

const passwordRequirements = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[0-9]/, 'Password must include a number.')

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name.'),
    email: z.string().trim().email('Enter a valid email address.'),
    password: passwordRequirements,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
})

export const resetPasswordSchema = z
  .object({
    password: passwordRequirements,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  phone: z.string().trim().max(30, 'Phone number is too long.'),
})

export const addressSchema = z.object({
  label: z.string().trim().min(1, 'Enter an address label.'),
  recipientName: z.string().trim().min(2, 'Enter the recipient name.'),
  phone: z.string().trim().min(7, 'Enter a valid phone number.'),
  line1: z.string().trim().min(3, 'Enter your address.'),
  line2: z.string().trim(),
  city: z.string().trim().min(2, 'Enter your city.'),
  province: z.string().trim().min(2, 'Enter your province.'),
  region: z.string().trim().min(2, 'Enter your region.'),
  postalCode: z.string().trim().min(3, 'Enter your postal code.'),
})
