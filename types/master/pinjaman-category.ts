export interface PinjamanCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface PinjamanCategoryResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: PinjamanCategory[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface CreatePinjamanCategoryRequest {
  code: string;
  name: string;
  description: string;
  status: number;
}

export interface UpdatePinjamanCategoryRequest {
  code?: string;
  name?: string;
  description?: string;
  status?: number;
}
