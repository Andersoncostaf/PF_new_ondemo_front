export interface ModuloItem {
  codigo: string;
  label: string;
  rota: string;
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
}

export interface PerfilResponse {
  usuario: AuthUsuario & { status: string };
  tenant: AuthTenant & {
    nome_fantasia?: string | null;
    trial_starts_at?: string | null;
  };
}
