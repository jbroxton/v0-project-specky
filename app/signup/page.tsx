import { SignupForm } from "@/components/auth/signup-form"
import { Header } from "@/components/header"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto py-12">
        <SignupForm />
      </main>
    </div>
  )
}
