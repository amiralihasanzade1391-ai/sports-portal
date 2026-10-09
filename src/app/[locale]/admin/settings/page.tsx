"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Save, ShieldAlert } from "lucide-react";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("Sports Portal");
  const [description, setDescription] = useState(
    "Your one-stop destination for all sports content, live scores, and community highlights."
  );
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Portal configuration parameters successfully updated.",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portal Configuration & Settings"
        description="Configure branding metadata, maintenance toggles, and system preferences."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <Card className="border bg-card shadow-xs">
          <CardHeader>
            <CardTitle>Brand & Identity</CardTitle>
            <CardDescription>
              Public portal identity parameters and metadata shown across search engines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Portal Title</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Meta Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Maintenance & Diagnostics
            </CardTitle>
            <CardDescription>
              Emergency controls to manage public access during scheduled database migrations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
              <div className="space-y-0.5">
                <p className="font-semibold text-sm">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">
                  When enabled, non-admin users see a temporary maintenance notice.
                </p>
              </div>
              <Button
                type="button"
                variant={maintenanceMode ? "destructive" : "outline"}
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                size="sm"
              >
                {maintenanceMode ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" /> Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
