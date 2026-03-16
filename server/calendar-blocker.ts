import { invokeLLM } from "./_core/llm";

interface BlockedDateRange {
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  reason: string;
}

/**
 * Parse availability comments using AI to extract blocked date ranges
 * Returns array of blocked date ranges in YYYY-MM-DD format
 */
export async function parseAvailabilityComments(
  comments: string,
  currentYear: number = new Date().getFullYear()
): Promise<BlockedDateRange[]> {
  if (!comments || comments.trim() === "") {
    return [];
  }

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a calendar date parser. Extract blocked date ranges from natural language text.
Current year is ${currentYear}. If no year is specified, assume current year.
Return ONLY a valid JSON array of objects with this exact format:
[{"startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "reason": "brief reason"}]

Rules:
- Convert all dates to YYYY-MM-DD format
- For single dates, startDate and endDate should be the same
- For recurring patterns (e.g., "every Monday"), generate dates for the next 6 months
- If month name without year is given, use current year if month hasn't passed, otherwise next year
- Keep reasons brief (under 30 characters)
- Return empty array [] if no dates found`,
        },
        {
          role: "user",
          content: `Parse these availability comments and extract blocked dates:\n\n${comments}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "blocked_dates",
          strict: true,
          schema: {
            type: "object",
            properties: {
              blockedRanges: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    startDate: {
                      type: "string",
                      description: "Start date in YYYY-MM-DD format",
                    },
                    endDate: {
                      type: "string",
                      description: "End date in YYYY-MM-DD format",
                    },
                    reason: {
                      type: "string",
                      description: "Brief reason for unavailability",
                    },
                  },
                  required: ["startDate", "endDate", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["blockedRanges"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : "{}";

    const parsed = JSON.parse(content);
    return parsed.blockedRanges || [];
  } catch (error) {
    console.error("[Calendar Blocker] Failed to parse availability comments:", error);
    return [];
  }
}

/**
 * Check if a given date is blocked based on availability comments
 */
export function isDateBlocked(
  dateStr: string, // YYYY-MM-DD format
  blockedRanges: BlockedDateRange[]
): boolean {
  const checkDate = new Date(dateStr);
  checkDate.setHours(0, 0, 0, 0);

  for (const range of blockedRanges) {
    const startDate = new Date(range.startDate);
    const endDate = new Date(range.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (checkDate >= startDate && checkDate <= endDate) {
      return true;
    }
  }

  return false;
}

/**
 * Get all blocked dates for a host listing
 * This can be called when displaying the booking calendar
 */
export async function getBlockedDatesForHost(
  availabilityComments: string | null
): Promise<BlockedDateRange[]> {
  if (!availabilityComments) {
    return [];
  }

  return parseAvailabilityComments(availabilityComments);
}
