"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, AlertCircle, Info } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type SetupStep = {
  name: string
  status: "pending" | "running" | "success" | "error"
  error?: string
  details?: any
}

export function DatabaseSetup() {
  const [steps, setSteps] = useState<SetupStep[]>([
    { name: "Check environment variables", status: "pending" },
    { name: "Test database connection", status: "pending" },
    { name: "Create setup log table", status: "pending" },
    { name: "Create profiles table", status: "pending" },
    { name: "Create documents table", status: "pending" },
    { name: "Create conversations table", status: "pending" },
    { name: "Create messages table", status: "pending" },
    { name: "Setup RLS policies", status: "pending" },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [setupResults, setSetupResults] = useState<any>(null)

  const runSetup = async () => {
    setIsRunning(true)
    setSetupError(null)
    setSetupComplete(false)
    setSetupResults(null)

    // Reset all steps to pending
    setSteps(steps.map((step) => ({ ...step, status: "pending", error: undefined, details: undefined })))

    // Step 1: Check environment variables
    setCurrentStepIndex(0)
    updateStepStatus(0, "running")

    try {
      const envResponse = await fetch("/api/check-env")
      const envData = await envResponse.json()

      if (!envData.success) {
        updateStepStatus(0, "error", envData.error, envData)
        setSetupError(`Environment variables check failed: ${envData.error}`)
        setIsRunning(false)
        return
      }

      updateStepStatus(0, "success", undefined, envData)

      // Step 2: Test database connection
      setCurrentStepIndex(1)
      updateStepStatus(1, "running")

      const connectionResponse = await fetch("/api/test-supabase-connection")
      const connectionData = await connectionResponse.json()

      if (!connectionData.success) {
        updateStepStatus(1, "error", connectionData.error, connectionData)
        setSetupError(`Database connection failed: ${connectionData.error}`)
        setIsRunning(false)
        return
      }

      updateStepStatus(1, "success", undefined, connectionData)

      // Step 3-8: Run database setup
      setCurrentStepIndex(2)
      updateStepStatus(2, "running")

      const setupResponse = await fetch("/api/setup-database")
      const setupData = await setupResponse.json()
      setSetupResults(setupData)

      if (!setupData.success) {
        // Find which steps failed
        if (setupData.results) {
          setupData.results.forEach((result: any, index: number) => {
            if (!result.success) {
              updateStepStatus(index + 2, "error", result.error, result)
            } else {
              updateStepStatus(index + 2, "success", undefined, result)
            }
          })
        }

        setSetupError(`Database setup failed: ${setupData.error || "See individual steps for details"}`)
        setIsRunning(false)
        return
      }

      // All steps succeeded
      for (let i = 2; i < steps.length; i++) {
        const stepResult = setupData.results?.[i - 2]
        updateStepStatus(i, "success", undefined, stepResult)
      }

      setSetupComplete(true)
      toast({
        title: "Setup Complete",
        description: "All database tables and policies have been set up successfully.",
      })
    } catch (error) {
      console.error("Setup error:", error)
      updateStepStatus(currentStepIndex, "error", error instanceof Error ? error.message : "Unknown error")
      setSetupError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsRunning(false)
    }
  }

  const updateStepStatus = (index: number, status: SetupStep["status"], error?: string, details?: any) => {
    setSteps((prevSteps) => prevSteps.map((step, i) => (i === index ? { ...step, status, error, details } : step)))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Setup</CardTitle>
        <CardDescription>Set up the database tables and policies required for the application</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  {step.status === "pending" && <div className="w-5 h-5 rounded-full border border-zinc-300" />}
                  {step.status === "running" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                  {step.status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {step.status === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                  <span
                    className={
                      step.status === "running"
                        ? "font-medium text-blue-500"
                        : step.status === "success"
                          ? "text-green-500"
                          : step.status === "error"
                            ? "text-red-500"
                            : ""
                    }
                  >
                    {step.name}
                  </span>
                </div>
              </div>

              {step.error && <div className="ml-8 mt-1 text-xs text-red-500">{step.error}</div>}

              {step.details && step.status !== "pending" && (
                <Accordion type="single" collapsible className="ml-8">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-xs py-1">
                      <span className="flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        View Details
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="text-xs bg-zinc-100 dark:bg-zinc-900 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(step.details, null, 2)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          ))}
        </div>

        {setupError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Setup Error</p>
              <p className="text-sm text-red-700">{setupError}</p>
            </div>
          </div>
        )}

        {setupComplete && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Setup Complete</p>
              <p className="text-sm text-green-700">All database tables and policies have been set up successfully.</p>
            </div>
          </div>
        )}

        {setupResults && (
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="results">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  View Complete Setup Results
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <pre className="text-xs bg-zinc-100 dark:bg-zinc-900 p-3 rounded overflow-auto max-h-60">
                  {JSON.stringify(setupResults, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runSetup} disabled={isRunning} className="w-full">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up database...
            </>
          ) : setupComplete ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Run Setup Again
            </>
          ) : (
            "Run Database Setup"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
