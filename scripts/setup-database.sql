-- Create documents table without anonymous_id
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

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- Simplified RLS policy for documents
DROP POLICY IF EXISTS "Users can access their own documents" ON documents;
CREATE POLICY "Users can access their own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id);

-- Create document_versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);

-- Simplified RLS policy for document_versions
DROP POLICY IF EXISTS "Users can access their own document versions" ON document_versions;
CREATE POLICY "Users can access their own document versions"
  ON document_versions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = document_versions.document_id
    AND documents.user_id = auth.uid()
  ));

-- Create comments table without anonymous_id
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  position JSONB NOT NULL,
  text TEXT NOT NULL,
  highlighted_text TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_document_id ON comments(document_id);

-- Simplified RLS policy for comments
DROP POLICY IF EXISTS "Users can access comments on their documents" ON comments;
CREATE POLICY "Users can access comments on their documents"
  ON comments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = comments.document_id
    AND documents.user_id = auth.uid()
  ));

-- Create fixes table
CREATE TABLE IF NOT EXISTS fixes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  description TEXT,
  position JSONB NOT NULL,
  suggested_replacement TEXT,
  fix_type TEXT CHECK (fix_type IN ('edit', 'insert', 'remove')),
  error_number INTEGER,
  applied BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fixes_document_id ON fixes(document_id);

-- Simplified RLS policy for fixes
DROP POLICY IF EXISTS "Users can access fixes on their documents" ON fixes;
CREATE POLICY "Users can access fixes on their documents"
  ON fixes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = fixes.document_id
    AND documents.user_id = auth.uid()
  ));

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

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- RLS policy for profiles
DROP POLICY IF EXISTS "Users can access their own profile" ON profiles;
CREATE POLICY "Users can access their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = user_id);

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

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_document_id ON conversations(document_id);

-- RLS policy for conversations
DROP POLICY IF EXISTS "Users can access their own conversations" ON conversations;
CREATE POLICY "Users can access their own conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id);

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

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- RLS policy for messages
DROP POLICY IF EXISTS "Users can access messages in their conversations" ON messages;
CREATE POLICY "Users can access messages in their conversations"
  ON messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  ));
