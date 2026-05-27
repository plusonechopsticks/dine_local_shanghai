import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, CalendarX, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Language = "zh" | "en";

const DAYS = [
  { key: "monday",    label: "Monday" },
  { key: "tuesday",   label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday",  label: "Thursday" },
  { key: "friday",    label: "Friday" },
  { key: "saturday",  label: "Saturday" },
  { key: "sunday",    label: "Sunday" },
];

const MEALS = ["lunch", "dinner"] as const;

type AvailabilityGrid = Record<string, { lunch: boolean; dinner: boolean }>;

function parseAvailability(raw: Record<string, string[]> | null | undefined): AvailabilityGrid {
  const grid: AvailabilityGrid = {};
  for (const day of DAYS) {
    const meals = raw?.[day.key] || [];
    grid[day.key] = {
      lunch: meals.includes("lunch"),
      dinner: meals.includes("dinner"),
    };
  }
  return grid;
}

function gridToAvailability(grid: AvailabilityGrid): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const day of DAYS) {
    const meals: string[] = [];
    if (grid[day.key]?.lunch) meals.push("lunch");
    if (grid[day.key]?.dinner) meals.push("dinner");
    if (meals.length > 0) result[day.key] = meals;
  }
  return result;
}

function formatBlockDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function HostCalendarTab({
  hostId,
  listing,
  language,
}: {
  hostId: number;
  listing: { id: number; availability: Record<string, string[]> } | undefined;
  language: Language;
}) {
  const hostListingId = listing?.id ?? hostId;

  // ── Weekly availability grid ──
  // Initialise from listing prop; re-sync when listing data arrives (async load)
  const [grid, setGrid] = useState<AvailabilityGrid>(() =>
    parseAvailability(listing?.availability)
  );
  const [gridDirty, setGridDirty] = useState(false);

  // Re-populate grid when listing data loads (fixes blank checkboxes on first load)
  useEffect(() => {
    if (listing?.availability) {
      setGrid(parseAvailability(listing.availability));
      setGridDirty(false);
    }
  }, [listing?.id, JSON.stringify(listing?.availability)]);

  const updateAvailability = trpc.hostAuth.updateWeeklyAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability saved");
      setGridDirty(false);
    },
    onError: () => toast.error("Failed to save availability"),
  });

  function toggleCell(day: string, meal: "lunch" | "dinner") {
    setGrid(prev => ({
      ...prev,
      [day]: { ...prev[day], [meal]: !prev[day]?.[meal] },
    }));
    setGridDirty(true);
  }

  function handleSaveGrid() {
    updateAvailability.mutate({ hostListingId, availability: gridToAvailability(grid) });
  }

  // ── Blocked dates ──
  const blocksQuery = trpc.hostAuth.getAvailabilityBlocks.useQuery(
    { hostListingId },
    { enabled: !!hostListingId }
  );
  const utils = trpc.useUtils();

  const today = todayStr();
  const [blockStart, setBlockStart] = useState<string>(today);
  const [blockEnd, setBlockEnd] = useState<string>(today);
  const [blockMeal, setBlockMeal] = useState<"lunch" | "dinner" | "both">("both");

  const addBlockRange = trpc.hostAuth.addBlockRange.useMutation({
    onSuccess: (data) => {
      const days = (data as any).count ?? 1;
      toast.success(days === 1 ? "Date blocked" : `${days} dates blocked`);
      utils.hostAuth.getAvailabilityBlocks.invalidate({ hostListingId });
    },
    onError: () => toast.error("Failed to block dates"),
  });

  const removeBlock = trpc.hostAuth.removeBlockDate.useMutation({
    onSuccess: () => {
      toast.success("Block removed");
      utils.hostAuth.getAvailabilityBlocks.invalidate({ hostListingId });
    },
    onError: () => toast.error("Failed to remove block"),
  });

  const dateBlocks = useMemo(
    () => (blocksQuery.data || []).filter((b: any) => b.blockType === "date"),
    [blocksQuery.data]
  );

  return (
    <div className="space-y-6">
      {/* ── Section 1: Weekly availability grid ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Schedule</CardTitle>
          <CardDescription>
            Check the meals you are available for each day. Uncheck to mark as unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground w-32">Day</th>
                  <th className="text-center py-2 px-4 font-medium text-muted-foreground">Lunch</th>
                  <th className="text-center py-2 px-4 font-medium text-muted-foreground">Dinner</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, i) => (
                  <tr key={day.key} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="py-3 pr-4 font-medium">{day.label}</td>
                    {MEALS.map(meal => (
                      <td key={meal} className="py-3 px-4 text-center">
                        <Checkbox
                          checked={!!grid[day.key]?.[meal]}
                          onCheckedChange={() => toggleCell(day.key, meal)}
                          className="mx-auto"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSaveGrid}
              disabled={!gridDirty || updateAvailability.isPending}
              size="sm"
            >
              {updateAvailability.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Schedule</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Block specific dates ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Block Specific Dates</CardTitle>
          <CardDescription>
            Override your weekly schedule by blocking a date or a range of dates (e.g. holidays, travel).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add block form */}
          <div className="flex flex-col gap-3">
            {/* Date range row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <input
                  type="date"
                  value={blockStart}
                  onChange={e => {
                    setBlockStart(e.target.value);
                    // If end is before new start, snap end to start
                    if (blockEnd < e.target.value) setBlockEnd(e.target.value);
                  }}
                  className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <input
                  type="date"
                  value={blockEnd}
                  min={blockStart}
                  onChange={e => setBlockEnd(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Meal selector + submit */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Block</label>
                <div className="flex gap-2">
                  {(["both", "lunch", "dinner"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setBlockMeal(m)}
                      className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                        blockMeal === m
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      {m === "both" ? "All day" : m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => addBlockRange.mutate({
                  hostListingId,
                  startDate: blockStart,
                  endDate: blockEnd,
                  mealType: blockMeal,
                })}
                disabled={!blockStart || !blockEnd || addBlockRange.isPending}
                size="sm"
                className="shrink-0"
              >
                {addBlockRange.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Block Dates"}
              </Button>
            </div>
          </div>

          {/* Blocked dates list */}
          {blocksQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading blocked dates…
            </div>
          ) : dateBlocks.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <CalendarX className="h-4 w-4" />
              No specific dates blocked
            </div>
          ) : (
            <div className="space-y-2">
              {dateBlocks.map((block: any) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatBlockDate(block.blockDate)}</span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {block.mealType === "both" ? "All day" : block.mealType}
                    </Badge>
                    {block.reason && (
                      <span className="text-xs text-muted-foreground">{block.reason}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeBlock.mutate({ blockId: block.id })}
                    disabled={removeBlock.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
