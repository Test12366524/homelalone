export interface User {
  id: number;
  role_id: number;
  anggota: null | {
    id: number;
    reference: string | null;
  };
  email_verified_at: string | null;
  name: string;
  email: string;
  phone: string;
  status: number;
  sales_category_id?: number;
  sales_type_id?: number;
  created_at: string;
  updated_at: string;
  roles: { id: number; name: string }[];
  shop: null | Array<{
    id: number;
    user_id: number;
    name: string;
    slug: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
    rating: string;
    total_reviews: number;
    status: boolean;
    created_at: string;
    updated_at: string;
    rajaongkir_province_id: number;
    rajaongkir_city_id: number;
    rajaongkir_district_id: string;
    logo: string;
    banner: string;
  }>;
}

export interface CreateUserPayload {
  role_id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  image: File | string | null;
  status: number;
  sales_category_id?: number;
  sales_type_id?: number;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface FormCreateRoleProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  initialData?: Role;
  roleName: string;
  setRoleName: (name: string) => void;
  isSubmitting: boolean;
}

export interface AuthenticatedUser extends User {
  token: string;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  expires: string;
}
