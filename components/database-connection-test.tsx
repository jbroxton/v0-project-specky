"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, AlertTriangle, Database } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Define a comprehensive state model for the test
interface TestState {
  status: "idle" | "running" | "success" | "error"
  message: string
  details?: any
  stages?: {
    connection: { status: "idle" | "running" | "success" | "error"; message?: string }
    schema: { status: "idle" | "running" | "success" | "error"; message?: string }
    write: { status: "idle" | "running" | "success" | "error"; message?: string }
  }
  error?: {
    message: string
    code?: string
    stage?: string
  }
}

export function DatabaseConnectionTest() {
  // Initialize with a clean state
  const [testState, setTestState] = useState<TestState>({
    status: "idle",
    message: "Test not started",
    stages: {
      connection: { status: "idle" },
      schema: { status: "idle" },
      write: { status: "idle" },
    },
  })

  const runTest = async () => {
    // Reset state and start test
    setTestState({
      status: "running",
      message: "Testing database connection...",
      stages: {
        connection: { status: "running", message: "Checking connection..." },
        schema: { status: "idle" },
        write: { status: "idle" },
      },
    })

    try {
      // Call the API endpoint
      const response = await fetch("/api/test-database-connection")

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text()
        let errorData

        try {
          // Try to parse as JSON
          errorData = JSON.parse(errorText)
        } catch (e) {
          // If not JSON, use text as message
          errorData = { error: errorText }
        }

        setTestState({
          status: "error",
          message: `HTTP Error: ${response.status} ${response.statusText}`,
          error: {
            message: errorData.error || "Unknown error",
            code: errorData.code,
            stage: errorData.stage,
          },
          details: errorData,
        })

        toast({
          title: "Connection Test Failed",
          description: `HTTP Error: ${response.status} ${response.statusText}`,
          variant: "destructive",
        })

        return
      }

      // Parse the response
      const data = await response.json()

      if (data.success) {
        // Update state with success
        setTestState({
          status: "success",
          message: "Database connection is working properly",
          details: data.results,
          stages: {
            connection: {
              status: "success",
              message: "Connected successfully",
            },
            schema: {
              status: "success",
              message: `Found ${data.results.schema.tables.join(", ")} table`,
            },
            write: {
              status: data.results.write.success ? "success" : "error",
              message: data.results.write.success
                ? "Write permissions confirmed"
                : `Write test failed: ${data.results.write.error?.message}`,
            },
          },
        })

        toast({
          title: "Connection Test Successful",
          description: "Database connection is working properly",
        })
      } else {
        // Handle API-level errors
        setTestState({
          status: "error",
          message: data.error || "Unknown error occurred",
          error: {
            message: data.error,
            code: data.code,
            stage: data.stage,
          },
          details: data.details,
        })

        toast({
          title: "Connection Test Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Handle client-side errors
      console.error("Error running database test:", error)

      setTestState({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      })

      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  // Render the test component
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Test
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Overall status indicator */}
          <div className="flex items-center gap-3 p-4 rounded-md bg-zinc-100 dark:bg-zinc-800">
            {testState.status === "idle" && <div className="w-5 h-5 rounded-full border border-zinc-300" />}
            {testState.status === "running" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
            {testState.status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
            {testState.status === "error" && <XCircle className="w-5 h-5 text-red-500" />}

            <span
              className={
                testState.status === "running"
                  ? "font-medium text-blue-500"
                  : testState.status === "success"
                    ? "font-medium text-green-500"
                    : testState.status === "error"
                      ? "font-medium text-red-500"
                      : "font-medium text-zinc-500"
              }
            >
              {testState.message}
            </span>
          </div>

          {/* Test stages */}
          {testState.stages && (
            <div className="space-y-2">
              {Object.entries(testState.stages).map(
                ([stage, state]) =>
                  state.status !== "idle" && (
                    <div key={stage} className="flex items-center gap-2 text-sm">
                      {state.status === "running" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                      {state.status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {state.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}

                      <span className="capitalize">{stage}:</span>
                      <span
                        className={
                          state.status === "running"
                            ? "text-blue-500"
                            : state.status === "success"
                              ? "text-green-500"
                              : state.status === "error"
                                ? "text-red-500"
                                : "text-zinc-500"
                        }
                      >
                        {state.message || state.status}
                      </span>
                    </div>
                  ),
              )}
            </div>
          )}

          {/* Error details */}
          {testState.status === "error" && testState.error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  {testState.error.stage ? `Error in ${testState.error.stage} stage` : "Error"}
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {testState.error.message}
                  {testState.error.code && ` (Code: ${testState.error.code})`}
                </p>
              </div>
            </div>
          )}

          {/* Detailed results */}
          {testState.details && (
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm">View Detailed Results</AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-zinc-100 dark:bg-zinc-900 p-3 rounded overflow-auto max-h-60">
                    {JSON.stringify(testState.details, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={runTest} disabled={testState.status === "running"} className="w-full">
          {testState.status === "running" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : testState.status === "success" ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Test Again
            </>
          ) : testState.status === "error" ? (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Retry Test
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Test Database Connection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
