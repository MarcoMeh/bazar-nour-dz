export interface PageBackground {
    id: string;
    page_key: string;
    page_name: string;
    image_url: string | null;
    created_at?: string;
    updated_at?: string;
}

// Helper to type casting for Supabase
export type TableName = "page_backgrounds";
