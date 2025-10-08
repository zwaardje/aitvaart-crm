/**
 * Centralized instruction exports
 *
 * This file re-exports all instruction functions to keep the main
 * instruction-builder.ts clean and maintainable.
 */

// Funeral modes
export { getFuneralCreateNewInstructions } from "./modes/funeral-create-new";
export { getFuneralEditExistingInstructions } from "./modes/funeral-edit-existing";
export { getFuneralWishesListenerInstructions } from "./modes/funeral-wishes-listener";
export { getFuneralModeSelectionInstructions } from "./modes/funeral-mode-selection";

// Page contexts
export { getNotesContextInstructions } from "./contexts/notes";
export { getCostsContextInstructions } from "./contexts/costs";
export { getContactsContextInstructions } from "./contexts/contacts";
export { getScenariosContextInstructions } from "./contexts/scenarios";
export { getDocumentsContextInstructions } from "./contexts/documents";
export { getGeneralContextInstructions } from "./contexts/general";
