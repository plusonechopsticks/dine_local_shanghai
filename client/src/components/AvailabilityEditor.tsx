import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES: ("lunch" | "dinner")[] = ["lunch", "dinner"];

interface AvailabilityEditorProps {
  currentAvailability?: Record<string, string[]>;
  hostId: number;
  onSave?: () => void;
}

export default function AvailabilityEditor({
  currentAvailability = {},
  hostId,
  onSave,
}: AvailabilityEditorProps) {
  const [availability, setAvailability] = useState<Record<string, ("lunch" | "dinner")[]>>((currentAvailability || {}) as Record<string, ("lunch" | "dinner")[]>);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAvailability((currentAvailability || {}) as Record<string, ("lunch" | "dinner")[]>);
  }, [currentAvailability]);

  const handleToggleMeal = (day: string, meal: "lunch" | "dinner") => {
    setAvailability((prev) => {
      const dayAvailability = prev[day] || [];
      const newDayAvailability = dayAvailability.includes(meal)
        ? dayAvailability.filter((m) => m !== meal)
        : [...dayAvailability, meal];

      return {
        ...prev,
        [day]: newDayAvailability,
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call update availability mutation
      const response = await fetch("/api/trpc/host.updateAvailability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostId,
          availability,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update availability");
      }

      toast.success("Availability updated successfully");
      setIsEditing(false);
      onSave?.();
    } catch (error) {
      toast.error("Failed to update availability");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setAvailability((currentAvailability || {}) as Record<string, ("lunch" | "dinner")[]>);
    setIsEditing(false);
  };

  const getAvailabilityText = () => {
    const availableDays = DAYS_OF_WEEK.filter((day) => availability[day]?.length > 0);
    if (availableDays.length === 0) return "No availability set";
    return availableDays.join(", ");
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Weekly Availability</CardTitle>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center justify-between">
                <span className="font-medium">{day}</span>
                <span className="text-sm text-gray-600">
                  {availability[day]?.length > 0
                    ? availability[day].map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")
                    : "Not available"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Weekly Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="space-y-2">
              <h3 className="font-semibold text-sm">{day}</h3>
              <div className="flex gap-4 ml-4">
                {MEAL_TYPES.map((meal: "lunch" | "dinner") => (
                  <div key={meal} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${day}-${meal}`}
                      checked={availability[day]?.includes(meal) || false}
                      onCheckedChange={() => handleToggleMeal(day, meal)}
                    />
                    <Label
                      htmlFor={`${day}-${meal}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="bg-burgundy-600 hover:bg-burgundy-700">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
