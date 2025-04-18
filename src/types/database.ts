export type UserRole = 'consultant' | 'client' | 'target';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  category_id: string;
  question: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Response {
  id: string;
  question_id: string;
  user_id: string;
  response: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  response_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  response_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      project_members: {
        Row: ProjectMember;
        Insert: Omit<ProjectMember, 'id' | 'created_at'>;
        Update: Partial<Omit<ProjectMember, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Question, 'id' | 'created_at' | 'updated_at'>>;
      };
      responses: {
        Row: Response;
        Insert: Omit<Response, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Response, 'id' | 'created_at' | 'updated_at'>>;
      };
      attachments: {
        Row: Attachment;
        Insert: Omit<Attachment, 'id' | 'created_at'>;
        Update: Partial<Omit<Attachment, 'id' | 'created_at'>>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Comment, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}