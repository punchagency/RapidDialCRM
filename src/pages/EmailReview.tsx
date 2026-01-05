import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEmailHistory } from "@/hooks/useEmailHistory";
import { EmailListItem } from "@/components/email-review/EmailListItem";
import { EmailDetails } from "@/components/email-review/EmailDetails";

export default function EmailReview() {
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(0);
      if (document.activeElement === searchInputRef.current) {
        searchInputRef.current?.focus();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    emails,
    loading,
    error,
    selectedEmail,
    activeEmailId,
    setActiveEmailId,
    total,
  } = useEmailHistory({
    offset: currentPage * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
  });

  if (loading && emails.length === 0) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading email history...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-heading font-semibold text-foreground">
              Email Review
            </h1>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search emails..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 px-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Page
                </span>
                <Input
                  type="number"
                  min="1"
                  max={Math.ceil(total / ITEMS_PER_PAGE)}
                  value={currentPage + 1}
                  onChange={(e) => {
                    const page = parseInt(e.target.value) - 1;
                    const maxPage = Math.ceil(total / ITEMS_PER_PAGE) - 1;
                    if (!isNaN(page) && page >= 0 && page <= maxPage) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 h-8 text-center"
                  disabled={loading}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  of {Math.ceil(total / ITEMS_PER_PAGE)}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={
                  (currentPage + 1) * ITEMS_PER_PAGE >= total || loading
                }
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {emails.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>No Emails Found</CardTitle>
                <CardDescription>
                  There are no recorded emails to review yet.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-h-[calc(100vh-140px)]">
              {/* Left: Email List */}
              <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2">
                {emails.map((email) => (
                  <EmailListItem
                    key={email.id}
                    email={email}
                    isActive={activeEmailId === email.id}
                    onClick={() => setActiveEmailId(email.id)}
                  />
                ))}
              </div>

              {/* Right: Email Details */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {selectedEmail && <EmailDetails email={selectedEmail} />}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
