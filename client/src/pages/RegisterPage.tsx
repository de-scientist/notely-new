"use client"

import type { FormEvent, Dispatch, SetStateAction } from "react"
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "../lib/api"

import { Button } from "../components/ui/button"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Separator } from "../components/ui/separator"

import { Loader2, UserPlus, AlertTriangle, CheckCircle, User, Mail, Lock, Eye, EyeOff, X, Check } from "lucide-react"
import { supabase } from "../lib/supabase"

const PRIMARY_COLOR_CLASS = "text-primary"
const GRADIENT_CLASS =
  "bg-foreground text-background hover:bg-foreground/90 shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
const INPUT_RING_CLASS = "focus:ring-ring focus:border-input"

const GITHUB_BUTTON_CLASS =
  "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"

const icons: Record<string, React.ReactElement> = {
  firstName: <User className="h-5 w-5" />,
  lastName: <User className="h-5 w-5" />,
  username: <User className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  password: <Lock className="h-5 w-5" />,
  confirmPassword: <Lock className="h-5 w-5" />,
}

type FieldProps = {
  label: string
  value: string
  setter: Dispatch<SetStateAction<string>>
  field: string
  type?: string
  show?: boolean
  toggle?: Dispatch<SetStateAction<boolean>>
}

export function RegisterPage() {
  const navigate = useNavigate()

  const loadFromStorage = (key: string) => localStorage.getItem(key) ?? ""

  const handleOAuth = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "http://localhost:5173/auth/callback",
      },
    })

    if (error) {
      toast.error("OAuth failed", { description: error.message })
    }
  }

  const [firstName, setFirstName] = useState(loadFromStorage("firstName"))
  const [lastName, setLastName] = useState(loadFromStorage("lastName"))
  const [username, setUsername] = useState(loadFromStorage("username"))
  const [email, setEmail] = useState(loadFromStorage("email"))
  const [password, setPassword] = useState(loadFromStorage("password"))
  const [confirmPassword, setConfirmPassword] = useState(loadFromStorage("confirmPassword"))
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const passwordsMismatch = password && confirmPassword && password !== confirmPassword

  const passwordCriteria = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[\W_]/.test(password),
  }

  useEffect(() => {
    localStorage.setItem("firstName", firstName)
  }, [firstName])
  useEffect(() => {
    localStorage.setItem("lastName", lastName)
  }, [lastName])
  useEffect(() => {
    localStorage.setItem("username", username)
  }, [username])
  useEffect(() => {
    localStorage.setItem("email", email)
  }, [email])
  useEffect(() => {
    localStorage.setItem("password", password)
  }, [password])
  useEffect(() => {
    localStorage.setItem("confirmPassword", confirmPassword)
  }, [confirmPassword])

  useEffect(() => {
    let strength = 0
    if (passwordCriteria.minLength) strength += 1
    if (passwordCriteria.hasUppercase) strength += 1
    if (passwordCriteria.hasNumber) strength += 1
    if (passwordCriteria.hasSymbol) strength += 1
    setPasswordStrength(strength)
  }, [password])

  useEffect(() => {
    if (!username) return setUsernameAvailable(null)
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/
    setUsernameAvailable(usernameRegex.test(username))
  }, [username])

  useEffect(() => {
    if (!email) return setEmailValid(null)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setEmailValid(emailRegex.test(email))
  }, [email])

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/register", { firstName, lastName, username, email, password })
      return res.data.user
    },
    onSuccess: (user) => {
      setSuccess("Account created successfully. Redirecting to login...")
      setError(null)
      toast.success(`Welcome, ${user.firstName}!`, {
        description: "Check your email to verify your account before logging in.",
      })
      setTimeout(() => {
        localStorage.clear()
        navigate("/login")
      }, 3000)
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Unable to register.")
      setSuccess(null)
      toast.error("Registration Failed", { description: err?.response?.data?.message ?? "Error" })
    },
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword)
      return setError("All fields are required.")
    if (passwordsMismatch) return setError("Passwords do not match.")
    if (usernameAvailable === false) return setError("Username is invalid or taken.")
    if (emailValid === false) return setError("Email is invalid.")
    if (passwordStrength < 4) return setError("Password is too weak.")

    mutation.mutate()
  }

  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-400", "bg-green-500"]

  const fields: FieldProps[][] = [
    [
      { label: "First name", value: firstName, setter: setFirstName, field: "firstName" },
      { label: "Last name", value: lastName, setter: setLastName, field: "lastName" },
    ],
    [{ label: "Username", value: username, setter: setUsername, field: "username" }],
    [{ label: "Email", value: email, setter: setEmail, field: "email", type: "email" }],
    [
      {
        label: "Password",
        value: password,
        setter: setPassword,
        field: "password",
        type: "password",
        show: showPassword,
        toggle: setShowPassword,
      },
    ],
    [
      {
        label: "Confirm Password",
        value: confirmPassword,
        setter: setConfirmPassword,
        field: "confirmPassword",
        type: "password",
        show: showConfirmPassword,
        toggle: setShowConfirmPassword,
      },
    ],
  ]

  return (
    <div className="mx-auto mt-10 mb-10 max-w-lg">
      <Card className="shadow-2xl rounded-xl overflow-hidden border border-border">
        <CardHeader className="text-center space-y-3 bg-accent/30 p-6">
          <UserPlus className={`h-10 w-10 ${PRIMARY_COLOR_CLASS} mx-auto`} />
          <CardTitle className="text-3xl font-bold">Join Notely</CardTitle>
          <CardDescription>Capture, organize, and share your thoughts with ease.</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {fields.map((row, rowIdx) => (
              <div key={rowIdx} className={`flex gap-4 ${row.length > 1 ? "" : "flex-col"}`}>
                {row.map(({ label, value, setter, field, type = "text", show = false, toggle = () => {} }) => {
                  const isPassword = type === "password"
                  const isUsername = field === "username"
                  const isEmail = field === "email"

                  const getAutocompleteValue = (fieldName: string) => {
                    switch (fieldName) {
                      case "firstName":
                        return "given-name"
                      case "lastName":
                        return "family-name"
                      case "username":
                        return "username"
                      case "email":
                        return "email"
                      case "password":
                      case "confirmPassword":
                        return "new-password"
                      default:
                        return "off"
                    }
                  }

                  let validationIcon = null
                  let validationColor = ""

                  if (isUsername && usernameAvailable !== null && value) {
                    validationIcon = usernameAvailable ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )
                    validationColor = usernameAvailable ? "border-green-500" : "border-red-500"
                  } else if (isEmail && emailValid !== null && value) {
                    validationIcon = emailValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )
                    validationColor = emailValid ? "border-green-500" : "border-red-500"
                  } else if (field === "confirmPassword" && value) {
                    validationIcon = passwordsMismatch ? (
                      <X className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )
                    validationColor = passwordsMismatch ? "border-red-500" : "border-green-500"
                  }

                  return (
                    <div key={field} className={`relative flex-1 ${row.length > 1 ? "min-w-0" : "w-full"}`}>
                      {icons[field] && (
                        <div className="absolute left-3 top-3 text-muted-foreground pointer-events-none z-10">
                          {icons[field]}
                        </div>
                      )}

                      <Input
                        type={isPassword ? (show ? "text" : "password") : type || "text"}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        required
                        placeholder={label}
                        autoComplete={getAutocompleteValue(field)}
                        className={`peer pl-10 pr-10 rounded-lg shadow-sm transition h-12 text-base ${INPUT_RING_CLASS} ${validationColor}`}
                      />

                      {isPassword && (
                        <div
                          onClick={() => toggle(!show)}
                          className="absolute right-3 top-3 cursor-pointer hover:text-primary transition-transform active:scale-95 z-10"
                        >
                          {show ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                          )}
                        </div>
                      )}

                      {!isPassword && validationIcon && (
                        <div className="absolute right-3 top-3 z-10">{validationIcon}</div>
                      )}

                      {isUsername && value && usernameAvailable !== null && (
                        <p className={`text-xs mt-1 px-1 ${usernameAvailable ? "text-green-500" : "text-red-500"}`}>
                          {usernameAvailable ? "Username is valid." : "Username must be 3-15 alphanumeric characters."}
                        </p>
                      )}
                      {isEmail && value && emailValid !== null && (
                        <p className={`text-xs mt-1 px-1 ${emailValid ? "text-green-500" : "text-red-500"}`}>
                          {emailValid ? "Valid email format." : "Please enter a valid email address."}
                        </p>
                      )}
                      {field === "password" && value && (
                        <div className="space-y-2 mt-3">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${strengthColor[passwordStrength - 1] || "bg-red-400"} transition-all duration-300`}
                              style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs font-medium text-foreground">
                            Strength:{" "}
                            {passwordStrength === 4
                              ? "Strong"
                              : passwordStrength > 2
                                ? "Medium"
                                : password.length > 0
                                  ? "Weak"
                                  : ""}
                          </p>
                          <ul className="text-xs text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(passwordCriteria).map(([key, passed]) => (
                              <li
                                key={key}
                                className={`flex items-center gap-1.5 ${passed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                              >
                                {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                <span>
                                  {key === "minLength" && "8+ characters"}
                                  {key === "hasUppercase" && "Uppercase"}
                                  {key === "hasNumber" && "Number"}
                                  {key === "hasSymbol" && "Symbol"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {field === "confirmPassword" && passwordsMismatch && (
                        <p className="text-sm text-red-500 flex items-center gap-1 animate-pulse mt-1">
                          <AlertTriangle className="h-4 w-4" /> Passwords do not match.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-500 text-green-700 bg-green-50/50 dark:bg-green-900/30 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={
                mutation.isPending ||
                passwordsMismatch ||
                usernameAvailable === false ||
                emailValid === false ||
                passwordStrength < 4
              }
              className={`w-full text-lg font-semibold ${GRADIENT_CLASS} flex items-center justify-center gap-2 h-12 transition-transform active:scale-[0.97] rounded-lg`}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" /> Sign up
                </>
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={() => handleOAuth("google")}
              className={`w-full text-lg font-semibold ${GRADIENT_CLASS} flex items-center justify-center gap-2 h-12 transition-transform active:scale-[0.97] rounded-lg`}
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                className="h-5 w-5 mr-2"
                alt="Google"
              />
              Continue with Google
            </Button>

            <Button
              type="button"
              onClick={() => handleOAuth("github")}
              className={`w-full h-12 ${GITHUB_BUTTON_CLASS}`}
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                className="h-5 w-5 mr-2"
                alt="GitHub"
              />
              Continue with GitHub
            </Button>
          </div>

          <Separator className="my-6" />
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className={`font-semibold ${PRIMARY_COLOR_CLASS} hover:underline transition-colors`}>
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
