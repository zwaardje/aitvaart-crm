export interface ContactInfo {
  name: string;
  phone?: string;
  email?: string;
  relationship?: string;
}

export interface CostInfo {
  amount: number;
  description: string;
}

/**
 * Extract contact information from voice transcript
 */
export function extractContactFromTranscript(
  transcript: string
): ContactInfo | null {
  const lowerTranscript = transcript.toLowerCase();

  // Try multiple patterns for name extraction
  let name = null;

  // Pattern 1: "voeg contact toe: [naam]"
  const pattern1 = lowerTranscript.match(
    /voeg\s+contact\s+toe\s*:?\s*(.+?)(?:\s+telefoon|\s+email|\s+tel|\s*$)/i
  );
  if (pattern1) {
    name = pattern1[1].trim();
  }

  // Pattern 2: "contact: [naam]"
  if (!name) {
    const pattern2 = lowerTranscript.match(
      /contact\s*:?\s*(.+?)(?:\s+telefoon|\s+email|\s+tel|\s*$)/i
    );
    if (pattern2) {
      name = pattern2[1].trim();
    }
  }

  // Pattern 3: "naam [naam]"
  if (!name) {
    const pattern3 = lowerTranscript.match(
      /(?:naam|name)\s+([a-zA-Z\s]+?)(?:\s|$|telefoon|phone|email)/i
    );
    if (pattern3) {
      name = pattern3[1].trim();
    }
  }

  // Pattern 4: Just look for words that could be names (fallback)
  if (!name) {
    const words = transcript.split(/\s+/);
    // Take first 2-3 words as potential name
    if (words.length >= 1) {
      name = words.slice(0, Math.min(3, words.length)).join(" ").trim();
    }
  }

  if (!name) return null;

  // Look for phone patterns (multiple formats)
  const phonePatterns = [
    /(?:telefoon|phone|tel|mobiel|mobile)\s*:?\s*([0-9\s\-\+\(\)]+)/i,
    /(\+31\s*[0-9\s\-\(\)]+)/i, // Dutch phone numbers
    /(0[0-9]{1,2}\s*[0-9\s\-\(\)]{8,})/i, // Dutch phone numbers without country code
  ];

  let phone = undefined;
  for (const pattern of phonePatterns) {
    const phoneMatch = lowerTranscript.match(pattern);
    if (phoneMatch) {
      phone = phoneMatch[1].trim();
      break;
    }
  }

  // Look for email patterns
  const emailPatterns = [
    /(?:email|e-mail|mail)\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i, // Just email pattern
  ];

  let email = undefined;
  for (const pattern of emailPatterns) {
    const emailMatch = lowerTranscript.match(pattern);
    if (emailMatch) {
      email = emailMatch[1].trim();
      break;
    }
  }

  return { name, phone, email };
}

/**
 * Extract cost information from voice transcript
 */
export function extractCostFromTranscript(transcript: string): CostInfo | null {
  const lowerTranscript = transcript.toLowerCase();

  // Look for patterns like "€50", "50 euro", "50 euro's", etc.
  const amountMatch = lowerTranscript.match(
    /(?:€|euro|euro's?)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:€|euro|euro's?)/
  );

  if (!amountMatch) return null;

  const amount = parseFloat(
    (amountMatch[1] || amountMatch[2]).replace(",", ".")
  );

  // Extract description - look for "voor" or "for"
  const descriptionMatch = lowerTranscript.match(/(?:voor|for)\s+(.+)/);
  const description = descriptionMatch
    ? descriptionMatch[1].trim()
    : "Onbekende kosten";

  return { amount, description };
}

/**
 * Extract note content from transcript
 */
export function extractContentFromTranscript(
  transcript: string,
  keywords: string[]
): string | null {
  const lowerTranscript = transcript.toLowerCase();

  for (const keyword of keywords) {
    const index = lowerTranscript.indexOf(keyword);
    if (index !== -1) {
      // Extract content after the keyword
      const afterKeyword = transcript.substring(index + keyword.length).trim();
      // Remove common prefixes and clean up
      const content = afterKeyword
        .replace(/^(toe|add|:|\s*:|\s*toe\s*:)/i, "")
        .trim();
      if (content.length > 0) {
        return content;
      }
    }
  }

  return null;
}

/**
 * Check if transcript contains specific command patterns
 */
export function hasCommandPattern(
  transcript: string,
  patterns: string[]
): boolean {
  const lowerTranscript = transcript.toLowerCase();
  return patterns.some((pattern) => lowerTranscript.includes(pattern));
}

/**
 * Get deceased name from funeral context
 */
export function getDeceasedName(deceased: any): string {
  if (Array.isArray(deceased)) {
    return (
      deceased[0]?.preferred_name || deceased[0]?.first_names || "overledene"
    );
  }
  return deceased?.preferred_name || deceased?.first_names || "overledene";
}

/**
 * Get client name from funeral context
 */
export function getClientName(client: any): string {
  if (Array.isArray(client)) {
    return client[0]?.preferred_name || "Onbekend";
  }
  return client?.preferred_name || "Onbekend";
}
