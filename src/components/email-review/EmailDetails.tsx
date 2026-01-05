import React from "react";
import { EmailLog } from "@/lib/types";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface EmailDetailsProps {
  email: EmailLog;
}

export function EmailDetails({ email }: EmailDetailsProps) {
  return (
    <Card className="h-full flex flex-col border-none shadow-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl">
              {email.subject || "No Subject"}
            </CardTitle>
            <CardDescription>Title: {email.title}</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(email.createdAt), "PPP p")}
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid gap-4 text-sm">
          <div className="grid grid-cols-[100px_1fr] items-center">
            <span className="font-semibold text-muted-foreground">To:</span>
            <span>{email.to}</span>
          </div>
          {email.from && (
            <div className="grid grid-cols-[100px_1fr] items-center">
              <span className="font-semibold text-muted-foreground">From:</span>
              <span>{email.from}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap font-sans">{email.body}</div>
        </div>
      </CardContent>
    </Card>
  );
}
