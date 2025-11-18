"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Youtube, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface YoutubeUrlInputProps {
  onUrlChange: (url: string, isValid: boolean) => void;
}

export function YoutubeUrlInput({ onUrlChange }: YoutubeUrlInputProps) {
  const t = useTranslations("upload");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateYoutubeUrl = (url: string): boolean => {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      const isYoutube =
        urlObj.hostname === "www.youtube.com" ||
        urlObj.hostname === "youtube.com" ||
        urlObj.hostname === "youtu.be" ||
        urlObj.hostname === "m.youtube.com";

      return isYoutube;
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

    const isValid = validateYoutubeUrl(value);
    if (!isValid) {
      setError(t("errors.invalidYoutubeUrl"));
      onUrlChange(value, false);
    } else {
      setError(null);
      onUrlChange(value, true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="youtube-url" className="flex items-center gap-2">
          <Youtube className="h-4 w-4" />
          {t("youtube.label")}
        </Label>
        <Input
          id="youtube-url"
          type="url"
          placeholder={t("youtube.placeholder")}
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
        <p className="text-sm font-medium mb-2">{t("youtube.notesTitle")}</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>{t("youtube.note1")}</li>
          <li>{t("youtube.note2")}</li>
          <li>{t("youtube.note3")}</li>
        </ul>
      </div>
    </div>
  );
}




















