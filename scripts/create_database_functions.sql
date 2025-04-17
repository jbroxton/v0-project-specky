-- Function to create documents table
CREATE OR REPLACE FUNCTION create_documents_table()
RETURNS void AS $$
BEGIN
  -- Create documents table
  CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content JSONB,
    version TEXT DEFAULT '1.0',
    user_id UUID REFERENCES auth.users(id),
    document_type TEXT DEFAULT 'prd',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_archived BOOLEAN DEFAULT false,
    description TEXT,
    status TEXT DEFAULT 'draft',
    is_public BOOLEAN DEFAULT false
  );
  
  -- Create index
  CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
  
  -- Create RLS policy
  DROP POLICY IF EXISTS "Users can access their own documents" ON documents;
  CREATE POLICY "Users can access their own documents"
    ON documents FOR ALL
    USING (auth.uid() = user_id);
    
  -- Enable RLS
  ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql;

-- Function to create profiles table
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void AS $$
BEGIN
  -- Create profiles table
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
  
  -- Create index
  CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
  
  -- Create RLS policy
  DROP POLICY IF EXISTS "Users can access their own profile" ON profiles;
  CREATE POLICY "Users can access their own profile"
    ON profiles FOR ALL
    USING (auth.uid() = user_id);
    
  -- Enable RLS
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql;

-- Function to create conversations table
CREATE OR REPLACE FUNCTION create_conversations_table()
RETURNS void AS $$
BEGIN
  -- Create conversations table
  CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    user_id UUID REFERENCES auth.users(id),
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    document_title TEXT,
    model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_archived BOOLEAN DEFAULT false,
    metadata JSONB
  );
  
  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_document_id ON conversations(document_id);
  
  -- Create RLS policy
  DROP POLICY IF EXISTS "Users can access their own conversations" ON conversations;
  CREATE POLICY "Users can access their own conversations"
    ON conversations FOR ALL
    USING (auth.uid() = user_id);
    
  -- Enable RLS
  ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql;

-- Function to create messages table
CREATE OR REPLACE FUNCTION create_messages_table()
RETURNS void AS $$
BEGIN
  -- Create messages table
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
  
  -- Create index
  CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
  
  -- Create RLS policy
  DROP POLICY IF EXISTS "Users can access messages in their conversations" ON messages;
  CREATE POLICY "Users can access messages in their conversations"
    ON messages FOR ALL
    USING (EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    ));
    
  -- Enable RLS
  ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql;
