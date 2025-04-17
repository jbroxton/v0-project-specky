"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatabaseConnectionTest } from "@/components/database-connection-test"
import { DatabaseSetup } from "@/components/database-setup"
import { ProfileTester } from "@/components/profile-tester"
import { EnvVarsTest } from "@/components/env-vars-test"
import { DeepInfraTest } from "@/components/deepinfra-test"

export default function TestSuitePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Test Suite</h1>

      <Tabs defaultValue="quick-tests">
        <TabsList className="mb-4">
          <TabsTrigger value="quick-tests">Quick Tests</TabsTrigger>
          <TabsTrigger value="database-setup">Database Setup</TabsTrigger>
          <TabsTrigger value="profile-tests">Profile Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-tests" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <EnvVarsTest />
            <DatabaseConnectionTest />
            <DeepInfraTest />
          </div>
        </TabsContent>

        <TabsContent value="database-setup">
          <DatabaseSetup />
        </TabsContent>

        <TabsContent value="profile-tests">
          <ProfileTester />
        </TabsContent>
      </Tabs>
    </div>
  )
}
