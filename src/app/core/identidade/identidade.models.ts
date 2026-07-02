export interface ModuloItem {
  codigo: string;
  label: string;
  rota: string;
  grupo?: string;
}

export interface ModulosResponse {
  modulos: ModuloItem[];
}

export interface AuthUsuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  cargo?: string | null;
}

export interface AuthTenant {
  id: string;
  slug: string;
  razao_social: string;
  status: string;
  subscription_status: string;
  trial_ends_at?: string | null;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  expires_in: number;
  usuario: AuthUsuario;
  tenant: AuthTenant;
  portal_url?: string;
}

export interface CadastroPayload {
  razao_social: string;
  cnpj: string;
  slug?: string | null;
  nome: string;
  email: string;
  password: string;
  password_confirmation: string;
  cargo?: string | null;
}

export interface SlugDisponivelResponse {
  disponivel: boolean;
  slug: string;
  sugestao: string | null;
}

export interface PerfilResponse {
  usuario: AuthUsuario & { status: string };
  tenant: AuthTenant & {
    nome_fantasia?: string | null;
    trial_starts_at?: string | null;
  };
}
