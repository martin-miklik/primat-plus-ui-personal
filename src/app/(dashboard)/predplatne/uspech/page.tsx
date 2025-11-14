"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const status = searchParams.get("status");
  const isMock = searchParams.get("mock");

  const isSuccess = status === "success";

  useEffect(() => {
    // Invalidate billing queries to refresh subscription status
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_LIMITS });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.BILLING_SUBSCRIPTION,
    });
  }, [queryClient]);

  return (
    <div className="container max-w-2xl py-12">
      <Card className="p-8 text-center">
        {isSuccess ? (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Platba úspěšná!</h1>
            <p className="text-muted-foreground mb-6">
              Vaše prémiové předplatné bylo aktivováno. Nyní máte přístup ke
              všem funkcím Primát Plus.
            </p>
            {isMock && (
              <p className="text-sm text-yellow-600 mb-4">
                (Toto je mock platba pro testování)
              </p>
            )}
            <div className="space-y-3">
              <p className="text-sm">
                <strong>Zkušební období:</strong> 14 dní zdarma
              </p>
              <p className="text-sm">
                Po skončení zkušebního období bude vaše předplatné automaticky
                obnoveno.
              </p>
            </div>
            <Button
              size="lg"
              className="mt-6"
              onClick={() => router.push("/")}
            >
              Přejít na dashboard
            </Button>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Platba se nezdařila</h1>
            <p className="text-muted-foreground mb-6">
              Při zpracování platby došlo k chybě. Zkuste to prosím znovu nebo
              kontaktujte podporu.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
              >
                Zpět na dashboard
              </Button>
              <Button onClick={() => router.push("/predplatne")}>
                Zkusit znovu
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

