'use client'

import { useState, useCallback, ChangeEvent } from 'react'

type ValidationRule = {
  required?: boolean | string
  minLength?: { value: number; message: string }
  maxLength?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
  validate?: (value: unknown, values: Record<string, unknown>) => string | true
}

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule
}

type FormErrors<T> = {
  [K in keyof T]?: string
}

type FormTouched<T> = {
  [K in keyof T]?: boolean
}

interface UseFormReturn<T extends object> {
  values: T
  errors: FormErrors<T>
  touched: FormTouched<T>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  handleChange: (name: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (name: keyof T) => () => void
  setFieldValue: (name: keyof T, value: unknown) => void
  setFieldError: (name: keyof T, error: string | undefined) => void
  setValue: (name: keyof T, value: unknown) => void
  setValues: (values: Partial<T>) => void
  validate: () => boolean
  validateField: (name: keyof T) => string | null
  reset: (newValues?: T) => void
  setIsSubmitting: (value: boolean) => void
  getFieldProps: (name: keyof T) => {
    name: keyof T
    value: unknown
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    onBlur: () => void
    error: string | undefined
  }
}

export function useForm<T extends object>(
  initialValues: T,
  validationRules: ValidationRules<T> = {}
): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [touched, setTouched] = useState<FormTouched<T>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialState] = useState(initialValues)

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialState)

  const validateField = useCallback(
    (name: keyof T): string | null => {
      const rules = validationRules[name]
      const value = values[name]

      if (!rules) return null

      // Required
      if (rules.required) {
        const isEmpty = value === undefined || value === null || value === ''
        if (isEmpty) {
          return typeof rules.required === 'string'
            ? rules.required
            : 'Este campo e obrigatorio'
        }
      }

      // MinLength
      if (rules.minLength && typeof value === 'string') {
        if (value.length < rules.minLength.value) {
          return rules.minLength.message
        }
      }

      // MaxLength
      if (rules.maxLength && typeof value === 'string') {
        if (value.length > rules.maxLength.value) {
          return rules.maxLength.message
        }
      }

      // Pattern
      if (rules.pattern && typeof value === 'string') {
        if (!rules.pattern.value.test(value)) {
          return rules.pattern.message
        }
      }

      // Custom validate
      if (rules.validate) {
        const result = rules.validate(value, values as Record<string, unknown>)
        if (result !== true) {
          return result
        }
      }

      return null
    },
    [values, validationRules]
  )

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {}
    let isValid = true

    Object.keys(validationRules).forEach((key) => {
      const error = validateField(key as keyof T)
      if (error) {
        newErrors[key as keyof T] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [validationRules, validateField])

  const isValid = Object.keys(errors).length === 0

  const handleChange = useCallback(
    (name: keyof T) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { value, type } = e.target
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

        setValuesState((prev) => ({ ...prev, [name]: newValue }))

        // Clear error on change if field was touched
        if (touched[name]) {
          const error = validateField(name)
          setErrors((prev) => ({ ...prev, [name]: error || undefined }))
        }
      },
    [touched, validateField]
  )

  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [name]: true }))
      const error = validateField(name)
      setErrors((prev) => ({ ...prev, [name]: error || undefined }))
    },
    [validateField]
  )

  const setFieldValue = useCallback((name: keyof T, value: unknown) => {
    setValuesState((prev) => ({ ...prev, [name]: value }))
  }, [])

  const setValue = setFieldValue

  const setFieldError = useCallback((name: keyof T, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [])

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }))
  }, [])

  const reset = useCallback(
    (newValues?: T) => {
      setValuesState(newValues || initialValues)
      setErrors({})
      setTouched({})
      setIsSubmitting(false)
    },
    [initialValues]
  )

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      name,
      value: values[name],
      onChange: handleChange(name),
      onBlur: handleBlur(name),
      error: touched[name] ? errors[name] : undefined,
    }),
    [values, errors, touched, handleChange, handleBlur]
  )

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setValue,
    setValues,
    validate,
    validateField,
    reset,
    setIsSubmitting,
    getFieldProps,
  }
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/,
  url: /^https?:\/\/.+/,
}

// Common validation rules
export const commonRules = {
  required: (message = 'Este campo e obrigatorio') => ({
    required: message,
  }),
  email: (message = 'Email invalido') => ({
    pattern: { value: validationPatterns.email, message },
  }),
  phone: (message = 'Formato: (XX) XXXXX-XXXX') => ({
    pattern: { value: validationPatterns.phone, message },
  }),
  minLength: (value: number, message?: string) => ({
    minLength: { value, message: message || `Minimo ${value} caracteres` },
  }),
  maxLength: (value: number, message?: string) => ({
    maxLength: { value, message: message || `Maximo ${value} caracteres` },
  }),
}
