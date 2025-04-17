"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, AlertTriangle, FileKey } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface TestState {
  status: "idle" | "running" | "success" | "error"
  message: string
  details?: any
  error?: {
    message: string
    missing?: string[]
  }
}

export function EnvVarsTest() {
  const [testState, setTestState] = useState<TestState>({
    status: "idle",
    message: "Test not started",
  })

  const runTest = async () => {
    setTestState({
      status: "running",
      message: "Checking environment variables...",
    })

    try {
      const response = await fetch("/api/check-env")

      if (!response.ok) {
        const errorText = await response.text()
        let errorData

        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { error: errorText }
        }

        setTestState({
          status: "error",
          message: `HTTP Error: ${response.status} ${response.statusText}`,
          error: {
            message: errorData.error || "Unknown error",
            missing: errorData.missing,
          },
          details: errorData,
        })

        toast({
          title: "Environment Variables Test Failed",
          description: `HTTP Error: ${response.status} ${response.statusText}`,
          variant: "destructive",
        })

        return
      }

      const data = await response.json()

      if (data.success) {
        setTestState({
          status: "success",
          message: "All required environment variables are set",
          details: data.variables,
        })

        toast({
          title: "Environment Variables Test Successful",
          description: "All required environment variables are set",
        })
      } else {
        setTestState({
          status: "error",
          message: data.error || "Missing required environment variables",
          error: {
            message: data.error,
            missing: data.missing,
          },
          details: data.variables,
        })

        toast({
          title: "Environment Variables Test Failed",
          description: data.error || "Missing required environment variables",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking environment variables:", error)

      setTestState({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      })

      toast({
        title: "Environment Variables Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileKey className="h-5 w-5" />
          Environment Variables
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
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

          {testState.status === "error" && testState.error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">Missing Environment Variables</p>
                {testState.error.missing && testState.error.missing.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 mt-1">
                    {testState.error.missing.map((variable) => (
                      <li key={variable}>{variable}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {testState.details && (
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm">View Environment Variables</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {Object.entries(testState.details).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between border-b border-zinc-200 dark:border-zinc-700 pb-1"
                      >
                        <span className="font-mono">{key}</span>
                        <span className={value === "Not set" ? "text-red-500" : "text-green-500"}>
                          {value as string}
                        </span>
                      </div>
                    ))}
                  </div>
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
              Checking Variables...
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
              <FileKey className="mr-2 h-4 w-4" />
              Check Environment Variables
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
