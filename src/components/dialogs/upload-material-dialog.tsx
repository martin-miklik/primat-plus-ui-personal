"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FileText, Youtube, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { YoutubeUrlInput } from "@/components/upload/youtube-url-input";
import { WebsiteUrlInput } from "@/components/upload/website-url-input";
import { useDialog } from "@/hooks/use-dialog";

interface UploadMaterialDialogProps {
  topicId: string;
  onUpload?: () => void;
}

type SourceType = "file" | "youtube" | "website";

export function UploadMaterialDialog({
  topicId,
  onUpload,
}: UploadMaterialDialogProps) {
  const t = useTranslations("upload");
  const dialog = useDialog("upload-material");

  const [activeTab, setActiveTab] = useState<SourceType>("file");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isYoutubeValid, setIsYoutubeValid] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isWebsiteValid, setIsWebsiteValid] = useState(false);

  // Reset state when dialog closes
  useEffect(() => {
    if (!dialog.isOpen) {
      setActiveTab("file");
      setSelectedFiles([]);
      setYoutubeUrl("");
      setIsYoutubeValid(false);
      setWebsiteUrl("");
      setIsWebsiteValid(false);
    }
  }, [dialog.isOpen]);

  const handleUpload = () => {
    // Pass data to parent
    if (onUpload) {
      onUpload();
    }

    // Store upload data for the hook to pick up
    if (activeTab === "file" && selectedFiles.length > 0) {
      // Files will be handled by useUpload hook
      window.dispatchEvent(
        new CustomEvent("upload:files", {
          detail: { files: selectedFiles, topicId },
        })
      );
    } else if (activeTab === "youtube" && isYoutubeValid) {
      window.dispatchEvent(
        new CustomEvent("upload:youtube", {
          detail: { url: youtubeUrl, topicId },
        })
      );
    } else if (activeTab === "website" && isWebsiteValid) {
      window.dispatchEvent(
        new CustomEvent("upload:website", {
          detail: { url: websiteUrl, topicId },
        })
      );
    }

    // Close dialog
    dialog.close();
  };

  const canUpload = () => {
    if (activeTab === "file") return selectedFiles.length > 0;
    if (activeTab === "youtube") return isYoutubeValid;
    if (activeTab === "website") return isWebsiteValid;
    return false;
  };

  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) => (open ? dialog.open() : dialog.close())}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as SourceType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file" className="gap-2">
              <FileText className="h-4 w-4" />
              {t("dialog.files")}
            </TabsTrigger>
            <TabsTrigger value="youtube" className="gap-2">
              <Youtube className="h-4 w-4" />
              {t("dialog.youtube")}
            </TabsTrigger>
            <TabsTrigger value="website" className="gap-2">
              <Globe className="h-4 w-4" />
              {t("dialog.website")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-6">
            <FileDropzone onFilesSelected={setSelectedFiles} />
          </TabsContent>

          <TabsContent value="youtube" className="mt-6">
            <YoutubeUrlInput
              onUrlChange={(url, isValid) => {
                setYoutubeUrl(url);
                setIsYoutubeValid(isValid);
              }}
            />
          </TabsContent>

          <TabsContent value="website" className="mt-6">
            <WebsiteUrlInput
              onUrlChange={(url, isValid) => {
                setWebsiteUrl(url);
                setIsWebsiteValid(isValid);
              }}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={dialog.close}>
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleUpload} disabled={!canUpload()}>
            {t("dialog.upload")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
