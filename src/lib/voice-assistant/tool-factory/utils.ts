/**
 * Utility functions for tool factory
 */

/**
 * Helper function to parse NextResponse to JSON
 */
export async function parseHandlerResponse(response: any): Promise<any> {
  if (response instanceof Response) {
    return await response.json();
  }
  return response;
}
