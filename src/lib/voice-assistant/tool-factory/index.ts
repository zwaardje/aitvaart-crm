/**
 * AI Tool Factory - Generates context-aware tools based on page and permissions
 */

import { AIContextMetadata, AIToolHandler } from "@/types/ai-context";
import { FuneralContext } from "../database";

// Import tool creators
import {
  createAddNoteTool,
  createUpdateNoteTool,
  createUpdateNoteByQueryTool,
  createDeleteNoteTool,
  createDeleteNoteByQueryTool,
  createListNotesTool,
} from "./notes-tools";

import {
  createAddCostTool,
  createUpdateCostTool,
  createUpdateCostByQueryTool,
  createDeleteCostTool,
  createDeleteCostByQueryTool,
  createListCostsTool,
} from "./costs-tools";

import {
  createAddContactTool,
  createUpdateContactTool,
  createUpdateContactByQueryTool,
  createDeleteContactTool,
  createDeleteContactByQueryTool,
  createListContactsTool,
} from "./contacts-tools";

import {
  createGetFuneralInfoTool,
  createCreateFuneralTool,
  createSearchFuneralTool,
} from "./general-tools";

/**
 * Main Tool Factory class
 */
export class AIToolFactory {
  /**
   * Generate tools based on context metadata
   */
  async generateTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): Promise<AIToolHandler[]> {
    const tools: AIToolHandler[] = [];

    // Always include basic info tool
    tools.push(createGetFuneralInfoTool(funeralContext));

    // Page-specific tools
    switch (metadata.page) {
      case "funerals":
        tools.push(...this.generateFuneralsTools(metadata, funeralContext));
        break;
      case "notes":
        tools.push(...this.generateNotesTools(metadata, funeralContext));
        break;
      case "costs":
        tools.push(...this.generateCostsTools(metadata, funeralContext));
        break;
      case "contacts":
        tools.push(...this.generateContactsTools(metadata, funeralContext));
        break;
      case "scenarios":
        tools.push(...this.generateScenariosTools(metadata, funeralContext));
        break;
      case "documents":
        tools.push(...this.generateDocumentsTools(metadata, funeralContext));
        break;
      case "general":
        tools.push(...this.generateGeneralTools(metadata, funeralContext));
        break;
    }

    // Always include search capability
    tools.push(createSearchFuneralTool());

    return tools;
  }

  /**
   * Generate tools for funerals page
   */
  private generateFuneralsTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];

    // If no mode is selected yet, don't add specific tools
    // The set_funeral_mode tool is added in stream-client.ts
    if (!metadata.funeralMode) {
      return tools;
    }

    // Mode-specific tools
    switch (metadata.funeralMode) {
      case "create_new":
        // Tools for creating a new funeral
        tools.push(createCreateFuneralTool(funeralContext));
        tools.push(createAddNoteTool(funeralContext));
        tools.push(createAddCostTool(funeralContext));
        tools.push(createAddContactTool(funeralContext));
        break;

      case "edit_existing":
        // Tools for editing existing funeral
        tools.push(createAddNoteTool(funeralContext));
        tools.push(createListNotesTool(funeralContext));
        tools.push(createAddCostTool(funeralContext));
        tools.push(createListCostsTool(funeralContext));
        tools.push(createAddContactTool(funeralContext));
        tools.push(createListContactsTool(funeralContext));
        // Add update tools as needed
        break;

      case "wishes_listener":
        // Tools for wishes conversation - passive listening with data capture
        tools.push(createAddNoteTool(funeralContext));
        tools.push(createAddCostTool(funeralContext));
        tools.push(createAddContactTool(funeralContext));
        // Add scenario/wishes tools
        break;
    }

    return tools;
  }

  /**
   * Generate tools for notes context
   */
  private generateNotesTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];

    // List notes is always available
    tools.push(createListNotesTool(funeralContext));

    // Create permission
    if (metadata.scope === "create" || metadata.scope === "manage") {
      tools.push(createAddNoteTool(funeralContext));
    }

    // Edit/Delete permissions
    if (
      metadata.entityId &&
      (metadata.scope === "edit" || metadata.scope === "manage")
    ) {
      tools.push(createUpdateNoteTool(metadata.entityId, funeralContext));
      tools.push(createDeleteNoteTool(metadata.entityId, funeralContext));
    }

    // Manage scope gets all operations even without specific entity
    if (metadata.scope === "manage" && !metadata.entityId) {
      tools.push(createUpdateNoteByQueryTool(funeralContext));
      tools.push(createDeleteNoteByQueryTool(funeralContext));
    }

    return tools;
  }

  /**
   * Generate tools for costs context
   */
  private generateCostsTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];

    tools.push(createListCostsTool(funeralContext));

    if (metadata.scope === "create" || metadata.scope === "manage") {
      tools.push(createAddCostTool(funeralContext));
    }

    if (
      metadata.entityId &&
      (metadata.scope === "edit" || metadata.scope === "manage")
    ) {
      tools.push(createUpdateCostTool(metadata.entityId, funeralContext));
      tools.push(createDeleteCostTool(metadata.entityId, funeralContext));
    }

    if (metadata.scope === "manage" && !metadata.entityId) {
      tools.push(createUpdateCostByQueryTool(funeralContext));
      tools.push(createDeleteCostByQueryTool(funeralContext));
    }

    return tools;
  }

  /**
   * Generate tools for contacts context
   */
  private generateContactsTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];

    tools.push(createListContactsTool(funeralContext));

    if (metadata.scope === "create" || metadata.scope === "manage") {
      tools.push(createAddContactTool(funeralContext));
    }

    if (
      metadata.entityId &&
      (metadata.scope === "edit" || metadata.scope === "manage")
    ) {
      tools.push(createUpdateContactTool(metadata.entityId, funeralContext));
      tools.push(createDeleteContactTool(metadata.entityId, funeralContext));
    }

    if (metadata.scope === "manage" && !metadata.entityId) {
      tools.push(createUpdateContactByQueryTool(funeralContext));
      tools.push(createDeleteContactByQueryTool(funeralContext));
    }

    return tools;
  }

  /**
   * Generate tools for scenarios context
   */
  private generateScenariosTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];
    // TODO: Implement scenario-specific tools
    return tools;
  }

  /**
   * Generate tools for documents context
   */
  private generateDocumentsTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];
    // TODO: Implement document-specific tools
    return tools;
  }

  /**
   * Generate tools for general context
   */
  private generateGeneralTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];

    // General context has all basic operations
    tools.push(createAddNoteTool(funeralContext));
    tools.push(createAddCostTool(funeralContext));
    tools.push(createAddContactTool(funeralContext));

    return tools;
  }
}

/**
 * Singleton instance
 */
export const toolFactory = new AIToolFactory();
