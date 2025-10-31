"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Globe, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WebsiteUrlInputProps {
  onUrlChange: (url: string, isValid: boolean) => void;
}

export function WebsiteUrlInput({ onUrlChange }: WebsiteUrlInputProps) {
  const t = useTranslations("upload");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateWebsiteUrl = (url: string): boolean => {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);

    if (!value) {
      setError(null);
      onUrlChange("", false);
      return;
    }

    const isValid = validateWebsiteUrl(value);
    if (!isValid) {
      setError(t("errors.invalidWebsiteUrl"));
      onUrlChange(value, false);
    } else {
      setError(null);
      onUrlChange(value, true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="website-url" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {t("website.label")}
        </Label>
        <Input
          id="website-url"
          type="url"
          placeholder={t("website.placeholder")}
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          className={error ? "border-destructive" : ""}
        />
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm font-medium mb-2">{t("website.notesTitle")}</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>{t("website.note1")}</li>
          <li>{t("website.note2")}</li>
        </ul>
      </div>
    </div>
  );
}






