/**
 * AI Context types for context-aware voice assistant
 */

/**
 * Available page contexts where AI can be used
 */
export type AIPageContext =
  | "notes"
  | "costs"
  | "contacts"
  | "scenarios"
  | "documents"
  | "general"
  | "funerals";

/**
 * Scope defines what actions are available in the current context
 */
export type AIScope =
  | "create" // Can only create new entities
  | "edit" // Can edit a specific entity
  | "view" // Can only view/read entities
  | "manage"; // Full CRUD access

/**
 * Funeral conversation modes
 * Determines the AI's behavior and instructions on the funerals page
 */
export type FuneralMode =
  | "create_new" // Mode 1: Nieuwe uitvaart aanmaken via spraak
  | "edit_existing" // Mode 2: Bestaande uitvaart bewerken
  | "wishes_listener"; // Mode 3: Meeluisteren tijdens wensengesprek

/**
 * Complete metadata about the current AI context
 */
export interface AIContextMetadata {
  /** The page/section where AI is being used */
  page: AIPageContext;

  /** The funeral ID for context */
  funeralId?: string;

  /** Optional: specific entity being worked on (e.g., specific note ID) */
  entityId?: string;

  /** What actions are allowed in this context */
  scope: AIScope;

  /** Funeral-specific conversation mode (only applicable when page === 'funerals') */
  funeralMode?: FuneralMode;

  /** Optional: additional context data */
  metadata?: {
    entityType?: string;
    entityName?: string;
    [key: string]: any;
  };
}

/**
 * Configuration for each context type
 */
export interface AIContextConfig {
  /** List of allowed tool names for this context */
  allowedTools: string[];

  /** Additional context-specific capabilities */
  capabilities: string[];

  /** Default scope if not specified */
  defaultScope: AIScope;
}

/**
 * Helper type for context-specific tool handlers
 */
export interface AIToolHandler {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  handler: (args: any, context: any) => Promise<any>;
}
