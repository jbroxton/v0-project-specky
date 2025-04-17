"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, AlertTriangle, Brain } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface TestState {
  status: "idle" | "running" | "success" | "error"
  message: string
  details?: any
  error?: {
    message: string
    code?: string
  }
  response?: string
}

export function DeepInfraTest() {
  const [testState, setTestState] = useState<TestState>({
    status: "idle",
    message: "Test not started",
  })

  const runTest = async () => {
    setTestState({
      status: "running",
      message: "Testing DeepInfra API connection...",
    })

    try {
      const response = await fetch("/api/test-deepinfra")

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
            code: errorData.code,
          },
          details: errorData,
        })

        toast({
          title: "DeepInfra API Test Failed",
          description: `HTTP Error: ${response.status} ${response.statusText}`,
          variant: "destructive",
        })

        return
      }

      const data = await response.json()

      if (data.success) {
        setTestState({
          status: "success",
          message: "DeepInfra API connection successful",
          response: data.message,
          details: data,
        })

        toast({
          title: "DeepInfra API Test Successful",
          description: "API connection is working properly",
        })
      } else {
        setTestState({
          status: "error",
          message: data.message || "Failed to connect to DeepInfra API",
          error: {
            message: data.message || "Unknown error",
          },
          details: data,
        })

        toast({
          title: "DeepInfra API Test Failed",
          description: data.message || "Failed to connect to DeepInfra API",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing DeepInfra API:", error)

      setTestState({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      })

      toast({
        title: "DeepInfra API Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          DeepInfra API Test
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

          {testState.status === "success" && testState.response && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>AI Response:</strong> {testState.response}
              </p>
            </div>
          )}

          {testState.status === "error" && testState.error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">API Error</p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {testState.error.message}
                  {testState.error.code && ` (Code: ${testState.error.code})`}
                </p>
              </div>
            </div>
          )}

          {testState.details && (
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm">View API Response Details</AccordionTrigger>
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
              Testing API...
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
              <Brain className="mr-2 h-4 w-4" />
              Test DeepInfra API
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
