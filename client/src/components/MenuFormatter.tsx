import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

interface MenuFormatterProps {
  value: MenuSection[];
  onChange: (sections: MenuSection[]) => void;
}

export function MenuFormatter({ value, onChange }: MenuFormatterProps) {
  const [sections, setSections] = useState<MenuSection[]>(value || []);

  const addSection = () => {
    const newSection: MenuSection = {
      id: Date.now().toString(),
      title: "",
      items: [],
    };
    const updated = [...sections, newSection];
    setSections(updated);
    onChange(updated);
  };

  const updateSection = (id: string, title: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, title } : s));
    setSections(updated);
    onChange(updated);
  };

  const removeSection = (id: string) => {
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);
    onChange(updated);
  };

  const addItem = (sectionId: string) => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
    };
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
    );
    setSections(updated);
    onChange(updated);
  };

  const updateItem = (sectionId: string, itemId: string, field: string, value: string) => {
    const updated = sections.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            items: s.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item
            ),
          }
        : s
    );
    setSections(updated);
    onChange(updated);
  };

  const removeItem = (sectionId: string, itemId: string) => {
    const updated = sections.map((s) =>
      s.id === sectionId
        ? { ...s, items: s.items.filter((item) => item.id !== itemId) }
        : s
    );
    setSections(updated);
    onChange(updated);
  };

  // Generate formatted text output
  const generateFormattedText = () => {
    return sections
      .map((section) => {
        const items = section.items
          .map((item) => `• ${item.name}${item.description ? ` - ${item.description}` : ""}`)
          .join("\n");
        return `${section.title}\n${items}`;
      })
      .join("\n\n");
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <Card className="bg-muted/50 border-border/50">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <p className="text-sm whitespace-pre-wrap font-mono text-foreground/80">
            {generateFormattedText() || "Your formatted menu will appear here..."}
          </p>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} className="border-border/50">
            <CardContent className="pt-6 space-y-4">
              {/* Section Title */}
              <div className="flex gap-2">
                <Input
                  placeholder="Section title (e.g., Appetizers, Main Courses)"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(section.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Menu Items */}
              <div className="space-y-3 pl-4 border-l-2 border-border/50">
                {section.items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Dish name"
                        value={item.name}
                        onChange={(e) => updateItem(section.id, item.id, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(section.id, item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Description (optional)"
                      value={item.description || ""}
                      onChange={(e) => updateItem(section.id, item.id, "description", e.target.value)}
                      className="text-sm resize-none"
                      rows={2}
                    />
                  </div>
                ))}

                {/* Add Item Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addItem(section.id)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Dish
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Section Button */}
      <Button onClick={addSection} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Menu Section
      </Button>
    </div>
  );
}
