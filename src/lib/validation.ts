import { z } from "zod";

// Common validation schemas
export const commonSchemas = {
  email: z.string().email("validation.email.invalid"),
  password: z
    .string()
    .min(6, "validation.password.minLength")
    .max(100, "validation.password.maxLength"),
  phone: z
    .string()
    .regex(/^[\+]?[0-9\s\-\(\)]{10,}$/, "validation.phone.invalid")
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .regex(/^[0-9]{4}\s?[A-Z]{2}$/i, "validation.postalCode.invalid")
    .optional()
    .or(z.literal("")),
  kvkNumber: z
    .string()
    .regex(/^[0-9]{8}$/, "validation.kvkNumber.invalid")
    .optional()
    .or(z.literal("")),
  btwNumber: z
    .string()
    .regex(/^NL[0-9]{9}B[0-9]{2}$/, "validation.btwNumber.invalid")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("validation.website.invalid")
    .optional()
    .or(z.literal("")),
  requiredString: (fieldName: string) =>
    z.string().min(1, "validation.required"),
  optionalString: z.string().optional(),
  date: z.string().optional().or(z.literal("")),
  time: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "validation.time.invalid")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  maritalStatus: z
    .enum([
      "single",
      "married",
      "divorced",
      "widowed",
      "registered_partnership",
    ])
    .optional(),
  title: z
    .string()
    .min(1, "validation.required")
    .max(200, "validation.title.maxLength"),
  content: z
    .string()
    .min(1, "validation.required")
    .max(5000, "validation.content.maxLength"),
  productName: z
    .string()
    .min(1, "validation.required")
    .max(200, "validation.productName.maxLength"),
  supplierName: z
    .string()
    .min(1, "validation.required")
    .max(200, "validation.supplierName.maxLength"),
  description: z
    .string()
    .max(500, "validation.description.maxLength")
    .optional(),
  quantity: z
    .string()
    .min(1, "validation.required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0.01, "validation.quantity.min")
    .refine((val) => val <= 999999, "validation.quantity.max"),
  unitPrice: z
    .string()
    .min(1, "validation.required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, "validation.unitPrice.min")
    .refine((val) => val <= 999999, "validation.unitPrice.max"),
  extraField: z.string().max(200, "validation.extraField.maxLength").optional(),
};

// Auth schemas
export const authSchemas = {
  signIn: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, "auth.errors.required"),
  }),

  signUp: z
    .object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  forgotPassword: z.object({
    email: commonSchemas.email,
  }),
};

// Profile schemas
export const profileSchemas = {
  basic: z.object({
    full_name: z.string().min(1, "validation.fullName.required"),
    company_name: commonSchemas.optionalString,
    phone_number: commonSchemas.phone,
    avatar_url: commonSchemas.optionalString,
  }),

  onboarding: z.object({
    full_name: z.string().min(1, "validation.fullName.required"),
    company_name: z.string().min(1, "validation.companyName.required"),
    phone: commonSchemas.phone,
    address: z.string().min(1, "validation.address.required"),
    city: z.string().min(1, "validation.city.required"),
    postal_code: commonSchemas.postalCode,
    kvk_number: commonSchemas.kvkNumber,
    btw_number: commonSchemas.btwNumber,
    website: commonSchemas.website,
    description: commonSchemas.optionalString,
  }),

  update: z.object({
    full_name: z.string().min(1, "validation.fullName.required"),
    phone: commonSchemas.phone,
    email: commonSchemas.email.optional().or(z.literal("")),
  }),
};

// Organization schemas
export const organizationSchemas = {
  update: z.object({
    name: z.string().min(1, "validation.companyName.required"),
    email: commonSchemas.email.optional().or(z.literal("")),
    phone_number: commonSchemas.phone,
    address: commonSchemas.optionalString,
    city: commonSchemas.optionalString,
    postal_code: commonSchemas.postalCode,
    kvk_number: commonSchemas.kvkNumber,
    btw_number: commonSchemas.btwNumber,
    website: commonSchemas.website,
    description: commonSchemas.optionalString,
    wish_intake_notes: commonSchemas.optionalString,
    cost_estimate_notes: commonSchemas.optionalString,
  }),
};

// Client schemas
const clientCreateSchema = z.object({
  first_names: commonSchemas.optionalString,
  preferred_name: z.string().min(1, "validation.preferredName.required"),
  last_name: z.string().min(1, "validation.lastName.required"),
  gender: commonSchemas.gender,
  date_of_birth: commonSchemas.date,
  place_of_birth: commonSchemas.optionalString,
  marital_status: commonSchemas.maritalStatus,
  street: commonSchemas.optionalString,
  house_number: commonSchemas.optionalString,
  house_number_addition: commonSchemas.optionalString,
  postal_code: commonSchemas.postalCode,
  city: commonSchemas.optionalString,
  phone_number: commonSchemas.phone,
  email: commonSchemas.email.optional().or(z.literal("")),
});

export const clientSchemas = {
  create: clientCreateSchema,
  update: clientCreateSchema.partial(),
};

// Deceased schemas
const deceasedCreateSchema = z.object({
  first_names: z.string().min(1, "validation.firstNames.required"),
  preferred_name: commonSchemas.optionalString,
  last_name: z.string().min(1, "validation.lastName.required"),
  date_of_birth: commonSchemas.date,
  place_of_birth: commonSchemas.optionalString,
  gender: commonSchemas.gender,
  social_security_number: commonSchemas.optionalString,
  marital_status: commonSchemas.maritalStatus,
  date_of_death: commonSchemas.date,
  place_of_death: commonSchemas.optionalString,
  street: commonSchemas.optionalString,
  house_number: commonSchemas.optionalString,
  house_number_addition: commonSchemas.optionalString,
  postal_code: commonSchemas.postalCode,
  city: commonSchemas.optionalString,
  coffin_registration_number: commonSchemas.optionalString,
  insurance_company: commonSchemas.optionalString,
  policy_number: commonSchemas.optionalString,
});

export const deceasedSchemas = {
  create: deceasedCreateSchema,
  update: deceasedCreateSchema.partial(),
};

// Funeral schemas
const funeralCreateSchema = z
  .object({
    deceased_id: z.string().uuid("validation.deceased.required"),
    client_id: z.string().uuid("validation.client.required"),
    location: commonSchemas.optionalString,
    signing_date: commonSchemas.date,
    funeral_time: commonSchemas.time,
    funeral_director: commonSchemas.optionalString,
    deceased_death_date: commonSchemas.date,
  })
  .refine(
    (data) =>
      data.deceased_death_date &&
      data.signing_date &&
      data.deceased_death_date < data.signing_date,
    {
      message:
        "De overlijdensdatum moet voor de datum van ondertekening liggen",
      path: ["deceased_death_date"],
    }
  )
  .refine(
    (data) =>
      data.signing_date &&
      data.deceased_death_date &&
      data.signing_date > data.deceased_death_date,
    {
      message: "De datum van ondertekening moet na de overlijdensdatum liggen",
      path: ["deceased_death_date"],
    }
  );

export const funeralSchemas = {
  create: funeralCreateSchema,
  update: funeralCreateSchema,
};

// Intake form schema
const intakeDeceasedSchema = z.object({
  first_names: z.string().min(1, "validation.required"),
  last_name: z.string().min(1, "validation.required"),
  date_of_birth: z.string().min(1, "validation.required"),
  place_of_birth: z.string().min(1, "validation.required"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "validation.required" }),
  }),
  social_security_number: z.string().min(1, "validation.required"),
  coffin_registration_number: z.string().min(1, "validation.required"),
  street: z.string().min(1, "validation.required"),
  house_number: z.string().min(1, "validation.required"),
  house_number_addition: z.string().optional(),
  postal_code: z
    .string()
    .regex(/^[0-9]{4}\s?[A-Z]{2}$/i, "validation.postalCode.invalid"),
  city: z.string().min(1, "validation.required"),
  date_of_death: z.string().min(1, "validation.required"),
});

const intakeClientSchema = z.object({
  preferred_name: z.string().min(1, "validation.required"),
  last_name: z.string().min(1, "validation.required"),
  phone_number: z
    .string()
    .regex(/^[\+]?[0-9\s\-\(\)]{10,}$/, "validation.phone.invalid"),
  email: z.string().email("validation.email.invalid"),
});

const intakeFuneralSchema = z.object({
  funeral_director: z.string().min(1, "validation.required"),
  location: z.string().min(1, "validation.required"),
  signing_date: z.string().min(1, "validation.required"),
});

export const intakeSchemas = {
  form: z
    .object({
      deceased: intakeDeceasedSchema,
      client: intakeClientSchema,
      funeral: intakeFuneralSchema,
    })
    .refine(
      (data) =>
        data.deceased.date_of_death &&
        data.funeral.signing_date &&
        new Date(data.deceased.date_of_death) <=
          new Date(data.funeral.signing_date),
      {
        message:
          "De datum van ondertekening moet na de overlijdensdatum liggen",
        path: ["funeral", "signing_date"],
      }
    ),
};

// Supplier schemas
const supplierCreateSchema = z.object({
  name: z.string().min(1, "validation.supplierName.required"),
  contact_person: commonSchemas.optionalString,
  phone_number: commonSchemas.phone,
  email: commonSchemas.email.optional().or(z.literal("")),
  address: commonSchemas.optionalString,
  postal_code: commonSchemas.postalCode,
  city: commonSchemas.optionalString,
  type: commonSchemas.optionalString,
  notes: commonSchemas.optionalString,
});

export const supplierSchemas = {
  create: supplierCreateSchema,
  update: supplierCreateSchema.partial(),
};

// Document schemas
const documentCreateSchema = z.object({
  funeral_id: z.string().uuid("validation.funeral.required"),
  file_name: z.string().min(1, "validation.fileName.required"),
  file_type: commonSchemas.optionalString,
  file_size: z.number().positive("validation.fileSize.positive").optional(),
  storage_path: z.string().min(1, "validation.storagePath.required"),
  description: commonSchemas.optionalString,
});

export const documentSchemas = {
  create: documentCreateSchema,
  update: documentCreateSchema.partial(),
};

// Invoice schemas
const invoiceCreateSchema = z.object({
  funeral_id: z.string().uuid("validation.funeral.required"),
  invoice_number: z.string().min(1, "validation.invoiceNumber.required"),
  issue_date: commonSchemas.date,
  due_date: commonSchemas.date,
  total_amount: z
    .number()
    .positive("validation.totalAmount.positive")
    .optional(),
  notes: commonSchemas.optionalString,
});

export const invoiceSchemas = {
  create: invoiceCreateSchema,
  update: invoiceCreateSchema.partial(),
};

// Estimate schemas
const estimateCreateSchema = z.object({
  funeral_id: z.string().uuid("validation.funeral.required"),
  version: z.number().int().positive("validation.version.positive").optional(),
  valid_until: commonSchemas.date,
  notes: commonSchemas.optionalString,
});

export const estimateSchemas = {
  create: estimateCreateSchema,
  update: estimateCreateSchema.partial(),
};

// Branding schemas
const brandingCreateSchema = z.object({
  logo_url: commonSchemas.optionalString,
  primary_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "validation.color.hexFormat")
    .optional()
    .or(z.literal("")),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "validation.color.hexFormat")
    .optional()
    .or(z.literal("")),
  accent_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "validation.color.hexFormat")
    .optional()
    .or(z.literal("")),
  header_font: commonSchemas.optionalString,
  body_font: commonSchemas.optionalString,
  footer_text: commonSchemas.optionalString,
  letterhead_template_url: commonSchemas.optionalString,
});

export const brandingSchemas = {
  create: brandingCreateSchema,
  update: brandingCreateSchema.partial(),
};

// Export all schemas
export const schemas = {
  auth: authSchemas,
  profile: profileSchemas,
  organization: organizationSchemas,
  client: clientSchemas,
  deceased: deceasedSchemas,
  funeral: funeralSchemas,
  supplier: supplierSchemas,
  document: documentSchemas,
  invoice: invoiceSchemas,
  estimate: estimateSchemas,
  branding: brandingSchemas,
  common: commonSchemas,
  pricelistItem: {
    create: z.object({
      title: z.string().min(1, "validation.required"),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      default_quantity: z.number().int().min(1).optional(),
      price_incl: z.number().min(0),
      vat_rate: z.number().optional(),
      unit: z.string().optional(),
    }),
    update: z.object({
      title: z.string().min(1, "validation.required").optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      default_quantity: z.number().int().min(1).optional(),
      price_incl: z.number().min(0).optional(),
      vat_rate: z.number().optional(),
      unit: z.string().optional(),
    }),
  },
  notes: {
    create: z.object({
      funeral_id: z.string().uuid("validation.uuid.invalid"),
      title: commonSchemas.title,
      content: commonSchemas.content,
      is_important: z.boolean().optional(),
    }),
    update: z.object({
      title: commonSchemas.title,
      content: commonSchemas.content,
      is_important: z.boolean().optional(),
    }),
  },
  scenarios: {
    create: z.object({
      funeral_id: z.string().uuid("validation.uuid.invalid"),
      section: z.string().min(1, "validation.required"),
      item_type: z.string().min(1, "validation.required"),
      title: commonSchemas.title,
      description: commonSchemas.content.optional(),
      extra_field_label: z.string().optional(),
      extra_field_value: z.string().optional(),
      order_in_section: z.number().int().min(0).optional(),
      is_active: z.boolean().optional(),
    }),
    update: z.object({
      section: z.string().min(1, "validation.required").optional(),
      item_type: z.string().min(1, "validation.required").optional(),
      title: commonSchemas.title.optional(),
      description: commonSchemas.content.optional(),
      extra_field_label: z.string().optional(),
      extra_field_value: z.string().optional(),
      order_in_section: z.number().int().min(0).optional(),
      is_active: z.boolean().optional(),
    }),
  },
  costs: {
    create: z.object({
      funeral_id: z.string().uuid("validation.uuid.invalid"),
      supplier_id: z.string().min(1, "validation.required"),
      product_name: commonSchemas.productName,
      quantity: commonSchemas.quantity,
      unit_price: commonSchemas.unitPrice,
      notes: z.string().max(500, "validation.notes.maxLength").optional(),
    }),
    update: z.object({
      supplier_id: z.string().uuid("validation.uuid.invalid").optional(),
      product_name: commonSchemas.productName.optional(),
      quantity: commonSchemas.quantity.optional(),
      unit_price: commonSchemas.unitPrice.optional(),
      notes: z.string().max(500, "validation.notes.maxLength").optional(),
    }),
  },
} as const;

// Type inference helpers
export type SignInFormData = z.infer<typeof authSchemas.signIn>;
export type SignUpFormData = z.infer<typeof authSchemas.signUp>;
export type ForgotPasswordFormData = z.infer<typeof authSchemas.forgotPassword>;
export type ProfileFormData = z.infer<typeof profileSchemas.basic>;
export type OnboardingFormData = z.infer<typeof profileSchemas.onboarding>;
export type ClientFormData = z.infer<typeof clientSchemas.create>;
export type DeceasedFormData = z.infer<typeof deceasedSchemas.create>;
export type FuneralFormData = z.infer<typeof funeralSchemas.create>;
export type SupplierFormData = z.infer<typeof supplierSchemas.create>;
export type DocumentFormData = z.infer<typeof documentSchemas.create>;
export type InvoiceFormData = z.infer<typeof invoiceSchemas.create>;
export type EstimateFormData = z.infer<typeof estimateSchemas.create>;
export type BrandingFormData = z.infer<typeof brandingSchemas.create>;
export type NoteFormData = z.infer<typeof schemas.notes.create>;
export type NoteUpdateFormData = z.infer<typeof schemas.notes.update>;
export type ScenarioFormData = z.infer<typeof schemas.scenarios.create>;
export type ScenarioUpdateFormData = z.infer<typeof schemas.scenarios.update>;
export type CostFormData = z.infer<typeof schemas.costs.create>;
export type CostUpdateFormData = z.infer<typeof schemas.costs.update>;
export type IntakeFormData = z.infer<typeof intakeSchemas.form>;
