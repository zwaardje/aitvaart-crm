// Multi-user support types
export type OrganizationRole = "owner" | "admin" | "editor" | "viewer";
export type MemberStatus = "active" | "pending" | "suspended";
export type PlanType = "basic" | "premium" | "enterprise";
export type FuneralTeamRole = "assigned" | "primary" | "backup";
export type Permission = "view" | "edit" | "delete" | "manage";

// ============================================
// PERMISSIONS SYSTEM TYPES
// ============================================

export interface PermissionDefinition {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  name: string;
  display_name: string;
  description?: string | null;
  category: string;
  is_system_permission: boolean | null;
  is_active: boolean | null;
}

export interface PermissionGroup {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  display_name: string;
  description?: string;
  category: string;
  is_active: boolean;
  permissions?: PermissionDefinition[];
}

export interface RolePermission {
  id: string;
  created_at: string;
  role: OrganizationRole;
  permission_id: string;
  context?: string;
  permission?: PermissionDefinition;
}

export interface UserPermission {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  organization_id: string;
  permission_id: string;
  granted: boolean;
  context?: string;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  permission?: PermissionDefinition;
  granted_by_user?: {
    id: string;
    full_name?: string;
    company_name?: string;
  };
}

export interface PermissionGroupMembership {
  id: string;
  created_at: string;
  group_id: string;
  permission_id: string;
  permission?: PermissionDefinition;
}

export interface Organization {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  website?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country: string;
  billing_email?: string;
  billing_address?: string;
  billing_postal_code?: string;
  billing_city?: string;
  plan_type: PlanType;
  max_users: number;
  is_active: boolean;
  kvk_number?: string;
  btw_number?: string;
}

export interface OrganizationMember {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  status: MemberStatus;
  can_manage_users: boolean;
  can_manage_funerals: boolean;
  can_manage_clients: boolean;
  can_manage_suppliers: boolean;
  can_view_financials: boolean;
  can_manage_settings: boolean;
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;
  // Relations
  user?: {
    id: string;
    full_name?: string;
    company_name?: string;
    avatar_url?: string;
  };
  organization?: Organization;
}

export interface FuneralTeamAssignment {
  id: string;
  created_at: string;
  updated_at: string;
  funeral_id: string;
  user_id: string;
  role: FuneralTeamRole;
  permissions: Permission[];
  assigned_by?: string;
  assigned_at: string;
  // Relations
  user?: {
    id: string;
    full_name?: string;
    company_name?: string;
    avatar_url?: string;
  };
  funeral?: {
    id: string;
    location?: string;
    signing_date?: string;
    funeral_director?: string;
  };
}

export interface UserPermissions {
  can_manage_users: boolean;
  can_manage_funerals: boolean;
  can_manage_clients: boolean;
  can_manage_suppliers: boolean;
  can_view_financials: boolean;
  can_manage_settings: boolean;
}

export interface OrganizationInvite {
  organizationId: string;
  email: string;
  role: OrganizationRole;
  permissions: Partial<UserPermissions>;
  invited_by: string;
}

// Extended types for existing entities with organization support
export interface ExtendedProfile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name?: string;
  company_name?: string;
  phone_number?: string;
  avatar_url?: string;
  organization_id?: string;
  // Relations
  organization?: Organization;
  organization_membership?: OrganizationMember;
}

export interface ExtendedFuneral {
  id: string;
  created_at: string;
  updated_at: string;
  entrepreneur_id: string;
  organization_id?: string;
  deceased_id: string;
  client_id: string;
  location?: string;
  signing_date?: string;
  funeral_director?: string;
  // Relations
  deceased?: any;
  client?: any;
  team_assignments?: FuneralTeamAssignment[];
}
