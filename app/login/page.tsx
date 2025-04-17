import { LoginForm } from "@/components/auth/login-form"
import { Header } from "@/components/header"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto py-12">
        <LoginForm />
      </main>
    </div>
  )
}
