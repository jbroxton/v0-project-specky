"use server"

import { cookies } from "next/headers"
import { getSupabaseClient, getSupabaseAdmin } from "@/lib/supabase"
import { generateCompletion, DEFAULT_MODEL } from "@/lib/deepinfra"
import { getOrCreateAnonymousId } from "@/lib/anonymous-id"
import { setSessionVariable } from "@/lib/session-helpers"
import { revalidatePath } from "next/cache"

// Types
interface Message {
  id?: string
  role: "user" | "assistant" | "system"
  content: string
  created_at?: string
}

interface Conversation {
  id?: string
  title?: string
  user_id?: string | null
  anonymous_id?: string | null
  document_id?: string | null
  document_title?: string | null
  model?: string
  created_at?: string
  updated_at?: string
}

// Create a new conversation
export async function createConversation(data: {
  title?: string
  document_id?: string
  document_title?: string
  model?: string
}): Promise<{ conversation_id: string; error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const adminClient = getSupabaseAdmin()

    // Get current user (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // For anonymous users, get or create an anonymous ID
    let anonymousId = null
    if (!user) {
      anonymousId = getOrCreateAnonymousId()

      // Set the anonymous ID in a cookie for RLS policies
      cookies().set("anonymous_id", anonymousId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: "strict",
      })

      // Set the anonymous ID in the database session to persist across transactions
      try {
        await setSessionVariable(supabase, "app.anonymous_id", anonymousId)
      } catch (error) {
        console.error("Error setting anonymous ID:", error)
      }
    }

    try {
      // Create the conversation using the admin client to bypass RLS
      const { data: conversation, error } = await adminClient
        .from("conversations")
        .insert({
          title: data.title || "New Conversation",
          user_id: user?.id || null,
          anonymous_id: anonymousId,
          document_id: data.document_id || null,
          document_title: data.document_title || null,
          model: data.model || DEFAULT_MODEL,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Database error:", error)
        return { conversation_id: "", error: "Failed to create conversation in database" }
      }

      return { conversation_id: conversation.id, error: null }
    } catch (dbError) {
      console.error("Database error creating conversation:", dbError)
      return { conversation_id: "", error: "Database error: Failed to create conversation" }
    }
  } catch (error) {
    console.error("Error in createConversation:", error)
    return { conversation_id: "", error: "Failed to create conversation" }
  }
}

// Add a message to a conversation
export async function addMessage(
  conversation_id: string,
  message: Message,
): Promise<{ message_id: string; error: string | null }> {
  try {
    // Validate conversation ID format
    if (!conversation_id || conversation_id === "") {
      return { message_id: "", error: "Invalid conversation ID" }
    }

    const supabase = getSupabaseClient()
    const adminClient = getSupabaseAdmin()

    // Get current user (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // For anonymous users, get the anonymous ID and set it in the session
    if (!user) {
      const anonymousId = getOrCreateAnonymousId()

      // Set the anonymous ID in a cookie for RLS policies
      cookies().set("anonymous_id", anonymousId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: "strict",
      })

      // Set the anonymous ID in the database session to persist across transactions
      try {
        await setSessionVariable(supabase, "app.anonymous_id", anonymousId)
      } catch (error) {
        console.error("Error setting anonymous ID:", error)
      }
    }

    try {
      // Insert the message using the admin client to bypass RLS
      const { data, error } = await adminClient
        .from("messages")
        .insert({
          conversation_id,
          role: message.role,
          content: message.content,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Database error:", error)
        return { message_id: "", error: "Failed to add message to database" }
      }

      // Revalidate the conversation page to update UI
      revalidatePath(`/chat/${conversation_id}`)

      return { message_id: data.id, error: null }
    } catch (dbError) {
      console.error("Database error adding message:", dbError)
      return { message_id: "", error: "Database error: Failed to add message" }
    }
  } catch (error) {
    console.error("Error in addMessage:", error)
    return { message_id: "", error: "Failed to add message" }
  }
}

// Generate a response from the AI
export async function generateResponse(
  conversation_id: string,
  messages: Message[],
  model: string = DEFAULT_MODEL,
): Promise<{ response: string; error: string | null }> {
  try {
    // Call the DeepInfra API
    const completion = await generateCompletion({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      max_tokens: 1024,
    })

    const responseContent = completion.choices[0]?.message?.content || ""

    // Add the assistant's response to the conversation
    if (responseContent) {
      await addMessage(conversation_id, {
        role: "assistant",
        content: responseContent,
      })
    }

    return { response: responseContent, error: null }
  } catch (error) {
    console.error("Error generating response:", error)
    return { response: "", error: "Failed to generate response" }
  }
}

// Get conversation history
export async function getConversation(
  conversation_id: string,
): Promise<{ conversation: Conversation | null; messages: Message[]; error: string | null }> {
  try {
    // Validate conversation ID
    if (!conversation_id || conversation_id === "") {
      return { conversation: null, messages: [], error: "Invalid conversation ID" }
    }

    const supabase = getSupabaseClient()
    const adminClient = getSupabaseAdmin()

    // Get current user (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // For anonymous users, get the anonymous ID and set it in the session
    if (!user) {
      const anonymousId = getOrCreateAnonymousId()

      // Set the anonymous ID in a cookie for RLS policies
      cookies().set("anonymous_id", anonymousId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: "strict",
      })

      // Set the anonymous ID in the database session to persist across transactions
      try {
        await setSessionVariable(supabase, "app.anonymous_id", anonymousId)
      } catch (error) {
        console.error("Error setting anonymous ID:", error)
      }
    }

    try {
      // Get the conversation using the admin client to bypass RLS
      const { data: conversation, error: conversationError } = await adminClient
        .from("conversations")
        .select("*")
        .eq("id", conversation_id)
        .single()

      if (conversationError) {
        console.error("Error fetching conversation:", conversationError)
        return { conversation: null, messages: [], error: "Failed to fetch conversation" }
      }

      // Get the messages for this conversation using the admin client to bypass RLS
      const { data: messages, error: messagesError } = await adminClient
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: true })

      if (messagesError) {
        console.error("Error fetching messages:", messagesError)
        return { conversation, messages: [], error: "Failed to fetch messages" }
      }

      return { conversation, messages: messages || [], error: null }
    } catch (dbError) {
      console.error("Database error fetching conversation:", dbError)
      return { conversation: null, messages: [], error: "Database error: Failed to fetch conversation" }
    }
  } catch (error) {
    console.error("Error in getConversation:", error)
    return { conversation: null, messages: [], error: "Failed to fetch conversation" }
  }
}

// Get all conversations for the current user
export async function getUserConversations(): Promise<{ conversations: Conversation[]; error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const adminClient = getSupabaseAdmin()

    try {
      // Get current user (if authenticated)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let query = adminClient.from("conversations").select("*").order("updated_at", { ascending: false })

      if (user) {
        // For authenticated users, get their conversations
        query = query.eq("user_id", user.id)
      } else {
        // For anonymous users, get conversations by anonymous_id
        const anonymousId = getOrCreateAnonymousId()

        // Set the anonymous ID in a cookie for RLS policies
        cookies().set("anonymous_id", anonymousId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
          httpOnly: true,
          sameSite: "strict",
        })

        // Set the anonymous ID in the database session to persist across transactions
        try {
          await setSessionVariable(supabase, "app.anonymous_id", anonymousId)
        } catch (error) {
          console.error("Error setting anonymous ID:", error)
        }

        query = query.eq("anonymous_id", anonymousId)
      }

      const { data: conversations, error } = await query

      if (error) {
        throw error
      }

      return { conversations: conversations || [], error: null }
    } catch (dbError) {
      console.error("Database error fetching conversations:", dbError)

      // FALLBACK: Return an empty array of conversations
      return { conversations: [], error: null }
    }
  } catch (error) {
    console.error("Error in getUserConversations:", error)
    return { conversations: [], error: "Failed to fetch conversations" }
  }
}

// Test function to verify DeepInfra API connectivity
export async function testDeepInfraAPI(): Promise<{ success: boolean; message: string }> {
  try {
    const completion = await generateCompletion({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, are you working?" },
      ],
      max_tokens: 10,
    })

    return {
      success: true,
      message: `API connection successful. Response: ${completion.choices[0]?.message?.content || ""}`,
    }
  } catch (error) {
    // Simplified error logging
    return {
      success: false,
      message: `API connection failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
