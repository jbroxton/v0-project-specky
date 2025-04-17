"use client"

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

type TestStatus = "idle" | "running" | "success" | "error"

interface TestResult {
  id: string
  name: string
  status: TestStatus
  message?: string
  details?: any
}

async function runDatabaseTest(): Promise<TestResult> {
  const response = await fetch("/api/database-test", { method: "POST" })
  return await response.json()
}

function TestCard({ test }: { test: TestResult }) {
  const [isRunning, setIsRunning] = useState(test.status === "running")

  useEffect(() => {
    setIsRunning(test.status === "running")
  }, [test.status])

  return (
    <div className="border rounded p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{test.name}</h3>
      <div className="mt-2">
        {test.status === "idle" && <p className="text-sm text-zinc-500">Test not run yet</p>}
        {test.status === "running" && <p className="text-sm text-blue-500">Running test...</p>}
        {test.status === "success" && <p className="text-sm text-green-500">{test.message || "Test passed"}</p>}
        {test.status === "error" && <p className="text-sm text-red-500">{test.message || "Test failed"}</p>}
      </div>
    </div>
  )
}

export default function TestSuitePage() {
  const [databaseTest, setDatabaseTest] = useState<TestResult>({
    id: "database-connection",
    name: "Database Connection",
    status: "idle",
  })

  const handleRunDatabaseTest = async () => {
    setDatabaseTest((prev) => ({ ...prev, status: "running" }))
    const result = await runDatabaseTest()
    setDatabaseTest(result)
  }

  const [dbConnectionTest, setDbConnectionTest] = useState<TestResult>({
    id: "database-connection",
    name: "Database Connection",
    status: "idle",
  })

  const testDbConnection = async () => {
    setDbConnectionTest({ ...dbConnectionTest, status: "running" })

    try {
      const response = await fetch("/api/test-supabase-connection")

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      // Use try/catch specifically for JSON parsing
      try {
        const data = await response.json()

        if (data.success) {
          setDbConnectionTest({
            name: "Database Connection",
            status: "success",
            message: data.message || "Successfully connected to the database",
            details: data.data || data.details,
          })
          toast({
            title: "Database Connection",
            description: "Successfully connected to the database",
          })
        } else {
          setDbConnectionTest({
            name: "Database Connection",
            status: "error",
            message: data.error || "Failed to connect to database",
            details: data,
          })
          toast({
            title: "Database Connection Error",
            description: data.error || "Failed to connect to database",
            variant: "destructive",
          })
        }
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError)
        setDbConnectionTest({
          name: "Database Connection",
          status: "error",
          message: "Invalid response format from server",
          details: { parseError: "Could not parse JSON response" },
        })
        toast({
          title: "Database Connection Error",
          description: "Invalid response format from server",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Network or fetch error:", error)
      setDbConnectionTest({
        name: "Database Connection",
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: { fetchError: String(error) },
      })
      toast({
        title: "Test Failed",
        description: "Could not test database connection",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Suite</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TestCard test={databaseTest} />
      </div>
      <div className="mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          onClick={handleRunDatabaseTest}
          disabled={databaseTest.status === "running"}
        >
          Run Database Test
        </button>
      </div>
    </div>
  )
}
