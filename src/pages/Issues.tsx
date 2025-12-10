import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bug, ExternalLink, Trash2, Clock, AlertTriangle, 
  CheckCircle2, Circle, ArrowUp, ArrowDown, Minus,
  Image as ImageIcon, Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IssueTracker } from "@/components/crm/IssueTracker";
import { format } from "date-fns";

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  screenshotData: string | null;
  screenshotUrl: string | null;
  pagePath: string | null;
  linearIssueId: string | null;
  linearIssueUrl: string | null;
  labels: string[] | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  backlog: { label: "Backlog", color: "bg-gray-100 text-gray-700", icon: <Circle className="h-3 w-3" /> },
  todo: { label: "To Do", color: "bg-blue-100 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700", icon: <AlertTriangle className="h-3 w-3" /> },
  in_review: { label: "In Review", color: "bg-purple-100 text-purple-700", icon: <Circle className="h-3 w-3" /> },
  done: { label: "Done", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: <Circle className="h-3 w-3" /> },
};

const PRIORITY_CONFIG: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  0: { label: "Urgent", color: "text-red-600", icon: <ArrowUp className="h-3 w-3" /> },
  1: { label: "High", color: "text-orange-600", icon: <ArrowUp className="h-3 w-3" /> },
  2: { label: "Medium", color: "text-yellow-600", icon: <Minus className="h-3 w-3" /> },
  3: { label: "Low", color: "text-blue-600", icon: <ArrowDown className="h-3 w-3" /> },
  4: { label: "None", color: "text-gray-400", icon: <Minus className="h-3 w-3" /> },
};

export default function Issues() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: issues, isLoading, error } = useQuery<Issue[]>({
    queryKey: ["/api/issues", filterStatus],
    queryFn: async () => {
      const url = filterStatus === "all" 
        ? "/api/issues" 
        : `/api/issues?status=${filterStatus}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch issues");
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update issue");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({ title: "Issue Updated", description: "Status changed successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/issues/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete issue");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      setSelectedIssue(null);
      toast({ title: "Issue Deleted", description: "Issue removed successfully" });
    },
  });

  const groupedIssues = React.useMemo(() => {
    if (!issues) return {};
    return issues.reduce((acc, issue) => {
      const status = issue.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(issue);
      return acc;
    }, {} as Record<string, Issue[]>);
  }, [issues]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Failed to load issues</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="h-6 w-6" />
            Issues
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track bugs and feature requests
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40" data-testid="filter-status-select">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issues</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={() => setIsCreateOpen(true)} data-testid="create-issue-button">
            <Bug className="h-4 w-4 mr-2" />
            New Issue
          </Button>
        </div>
      </div>

      {filterStatus === "all" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <Badge className={config.color}>
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {groupedIssues[status]?.length || 0}
                </span>
              </div>
              
              <div className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2">
                {groupedIssues[status]?.map(issue => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue} 
                    onClick={() => setSelectedIssue(issue)}
                  />
                ))}
                {(!groupedIssues[status] || groupedIssues[status].length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No issues
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {issues?.map(issue => (
            <IssueCard 
              key={issue.id} 
              issue={issue} 
              onClick={() => setSelectedIssue(issue)}
            />
          ))}
          {issues?.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No issues found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <IssueDetailDialog 
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdateStatus={(status) => {
          if (selectedIssue) {
            updateStatusMutation.mutate({ id: selectedIssue.id, status });
          }
        }}
        onDelete={() => {
          if (selectedIssue) {
            deleteMutation.mutate(selectedIssue.id);
          }
        }}
      />

      <IssueTracker isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}

function IssueCard({ issue, onClick }: { issue: Issue; onClick: () => void }) {
  const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.backlog;
  const priorityConfig = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG[2];

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      data-testid={`issue-card-${issue.id}`}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm line-clamp-2">{issue.title}</h3>
          {issue.screenshotData && (
            <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1 ${priorityConfig.color}`}>
            {priorityConfig.icon}
            <span className="text-xs">{priorityConfig.label}</span>
          </div>
          
          {issue.linearIssueUrl && (
            <Badge variant="outline" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Linear
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(issue.createdAt), "MMM d, yyyy")}
        </div>
      </CardContent>
    </Card>
  );
}

function IssueDetailDialog({ 
  issue, 
  onClose, 
  onUpdateStatus,
  onDelete 
}: { 
  issue: Issue | null; 
  onClose: () => void;
  onUpdateStatus: (status: string) => void;
  onDelete: () => void;
}) {
  if (!issue) return null;

  const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.backlog;
  const priorityConfig = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG[2];

  return (
    <Dialog open={!!issue} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            {issue.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={issue.status} onValueChange={onUpdateStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className={`flex items-center gap-1 ${priorityConfig.color}`}>
              {priorityConfig.icon}
              <span className="text-sm">{priorityConfig.label} Priority</span>
            </div>
            
            {issue.linearIssueUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={issue.linearIssueUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View in Linear
                </a>
              </Button>
            )}
          </div>

          {issue.description && (
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {issue.description}
              </p>
            </div>
          )}

          {issue.screenshotData && (
            <div>
              <h4 className="text-sm font-medium mb-2">Screenshot</h4>
              <div className="border rounded-lg overflow-hidden bg-muted/20">
                <img 
                  src={issue.screenshotData} 
                  alt="Issue screenshot" 
                  className="max-w-full"
                />
              </div>
            </div>
          )}

          {issue.pagePath && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Page:</span>
              <code className="bg-muted px-2 py-0.5 rounded">{issue.pagePath}</code>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Created {format(new Date(issue.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

