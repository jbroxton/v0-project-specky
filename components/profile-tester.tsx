"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Profile {
  id?: string
  user_id?: string
  full_name?: string
  email?: string
  avatar_url?: string
  job_title?: string
  company?: string
}

export function ProfileTester() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Profile>({
    full_name: "",
    email: "",
    avatar_url: "",
    job_title: "",
    company: "",
  })

  // Fetch the current profile
  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-profile")
      const data = await response.json()

      if (data.success) {
        setProfile(data.profile)
        // Update form data with profile data
        if (data.profile) {
          setFormData({
            full_name: data.profile.full_name || "",
            email: data.profile.email || "",
            avatar_url: data.profile.avatar_url || "",
            job_title: data.profile.job_title || "",
            company: data.profile.company || "",
          })
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update the profile
  const updateProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          profile: formData,
        }),
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        // Refresh the profile
        fetchProfile()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  return (
    <div className="space-y-6 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Profile Tester</h2>
        <p className="text-sm text-zinc-400">Test the profile functionality</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Current Profile</h3>
              {profile ? (
                <div className="mt-2 p-3 bg-zinc-800 rounded-md">
                  <pre className="text-xs overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No profile found</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Update Profile</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={fetchProfile} disabled={loading}>
                  Refresh
                </Button>
                <Button onClick={updateProfile} disabled={loading}>
                  Update Profile
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
