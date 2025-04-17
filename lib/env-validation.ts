/**
 * Required environment variables for the application
 */
export const REQUIRED_ENV_VARS = [
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number]

/**
 * Validates that all required environment variables are set
 * @returns Object containing validation results
 */
export function validateEnv(): {
  valid: boolean
  missing: string[]
  variables: Record<RequiredEnvVar, string | undefined>
} {
  const variables = {} as Record<RequiredEnvVar, string | undefined>
  const missing: string[] = []

  // Check each required environment variable
  REQUIRED_ENV_VARS.forEach((varName) => {
    const value = process.env[varName]
    variables[varName] = value

    if (!value) {
      missing.push(varName)
    }
  })

  return {
    valid: missing.length === 0,
    missing,
    variables,
  }
}

/**
 * Gets a required environment variable, throwing an error if it's not set
 * @param name The name of the environment variable
 * @returns The value of the environment variable
 */
export function getRequiredEnv(name: RequiredEnvVar): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`)
  }
  return value
}
