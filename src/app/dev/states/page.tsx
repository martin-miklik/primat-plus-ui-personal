"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ErrorState,
  NetworkErrorState,
  NotFoundState,
  EmptyState,
  NoDataState,
  NoResultsState,
  NoFilesState,
  ResourceNotFoundState,
  CardSkeleton,
  ListItemSkeleton,
  GridSkeleton,
  FormSkeleton,
  StatsSkeleton,
  PageHeaderSkeleton,
} from "@/components/states";
import { Spinner } from "@/components/ui/spinner";
import { Trophy, Upload } from "lucide-react";

export default function StatesPage() {
  const [loadingButton, setLoadingButton] = useState(false);

  const handleLoadingDemo = () => {
    setLoadingButton(true);
    setTimeout(() => setLoadingButton(false), 2000);
  };

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-4xl font-bold">UI States Showcase</h1>
        <p className="text-muted-foreground mt-2">
          Complete examples of loading, error, and empty states
        </p>
      </div>

      <Tabs defaultValue="loading" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="loading">Loading States</TabsTrigger>
          <TabsTrigger value="error">Error States</TabsTrigger>
          <TabsTrigger value="empty">Empty States</TabsTrigger>
        </TabsList>

        {/* Loading States */}
        <TabsContent value="loading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spinner (Inline Loading)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleLoadingDemo} disabled={loadingButton}>
                {loadingButton && <Spinner />}
                {loadingButton ? "Loading..." : "Click to Load"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <CardSkeleton />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>List Item Skeletons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grid Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <GridSkeleton count={6} columns={3} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <FormSkeleton fields={4} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stats Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsSkeleton count={3} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Page Header Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <PageHeaderSkeleton />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error States */}
        <TabsContent value="error" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generic Error State</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorState
                title="Failed to load data"
                message="An unexpected error occurred while fetching your data."
                onRetry={() => alert("Retrying...")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Network Error State</CardTitle>
            </CardHeader>
            <CardContent>
              <NetworkErrorState onRetry={() => alert("Reconnecting...")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Not Found State</CardTitle>
            </CardHeader>
            <CardContent>
              <NotFoundState
                title="Subject Not Found"
                message="The subject you're looking for doesn't exist or has been deleted."
                onBack={() => alert("Going back...")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error State (No Retry)</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorState
                title="Permission Denied"
                message="You don't have permission to access this resource."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Empty States */}
        <TabsContent value="empty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>No Data State</CardTitle>
            </CardHeader>
            <CardContent>
              <NoDataState
                entityName="subjects"
                onCreate={() => alert("Creating subject...")}
                createLabel="Create Subject"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>No Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <NoResultsState
                searchQuery="advanced mathematics"
                onClear={() => alert("Clearing search...")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>No Files State</CardTitle>
            </CardHeader>
            <CardContent>
              <NoFilesState
                onUpload={() => alert("Opening file picker...")}
                accept=".pdf, .docx, .txt"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceNotFoundState
                resourceType="Material"
                onBack={() => alert("Going back...")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Empty State</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Trophy />}
                title="No Achievements Yet"
                description="Complete tests and flashcards to earn achievements and track your progress."
                action={{
                  label: "Start Learning",
                  onClick: () => alert("Starting..."),
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Empty State (Outline)</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                className="border border-dashed"
                icon={<Upload />}
                title="Upload Materials"
                description="Drag and drop your study materials here or click to browse."
                action={{
                  label: "Browse Files",
                  onClick: () => alert("Browsing..."),
                  variant: "outline",
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

