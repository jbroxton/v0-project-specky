import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Create a Supabase client directly
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Check if the required environment variables are available
    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Missing Supabase URL or service role key",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection first
    console.log("Testing Supabase connection...")
    const { error: connectionError } = await supabase.from("_test_connection").select("*").limit(1).maybeSingle()

    if (connectionError && connectionError.code !== "PGRST116") {
      console.error("Error connecting to Supabase:", connectionError)
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: `Error connecting to Supabase: ${connectionError.message}`,
          code: connectionError.code,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("Connection successful, creating tables...")

    // Create profiles table
    console.log("Creating profiles table...")
    const { error: profilesError } = await supabase.sql(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
        full_name TEXT,
        email TEXT,
        avatar_url TEXT,
        job_title TEXT,
        company TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `)

    if (profilesError) {
      console.error("Error creating profiles table:", profilesError)
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: `Error creating profiles table: ${profilesError.message}`,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Create conversations table
    console.log("Creating conversations table...")
    const { error: conversationsError } = await supabase.sql(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT,
        user_id UUID REFERENCES auth.users(id),
        document_id UUID,
        document_title TEXT,
        model TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        is_archived BOOLEAN DEFAULT false,
        metadata JSONB
      );
    `)

    if (conversationsError) {
      console.error("Error creating conversations table:", conversationsError)
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: `Error creating conversations table: ${conversationsError.message}`,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Create messages table
    console.log("Creating messages table...")
    const { error: messagesError } = await supabase.sql(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
        role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
        content TEXT NOT NULL,
        tokens_used INTEGER,
        model TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `)

    if (messagesError) {
      console.error("Error creating messages table:", messagesError)
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: `Error creating messages table: ${messagesError.message}`,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Success response
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Database setup completed successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error setting up database:", error)

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
