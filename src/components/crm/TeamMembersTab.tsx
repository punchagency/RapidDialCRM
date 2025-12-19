import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, ShieldAlert, Users } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/lib/UserRoleContext";
import type { User } from "@/lib/types";
import { TeamMemberModal, type TeamMemberFormState } from "@/components/crm/TeamMemberModal";
import { useMutation } from "@tanstack/react-query";
import { CustomServerApi } from "@/integrations/custom-server/api";


export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CREATED = 'created',
}


type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string | null;
  inviteStatus?: string;
};

type ModalMode = "add" | "edit";
const DEFAULT_PASSWORD = "Password123!";
const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "inside_sales_rep", label: "Inside Sales" },
  { value: "field_sales_rep", label: "Field Sales" },
  { value: "data_loader", label: "Data Loader" },
];

const fallbackMembers: Member[] = [
  {
    id: "m1",
    name: "Alex Johnson",
    email: "alex@quantumpunch.com",
    role: "Admin",
    isActive: true,
    avatar: null,
  },
  {
    id: "m2",
    name: "Sarah Miller",
    email: "sarah@quantumpunch.com",
    role: "Manager",
    isActive: true,
    avatar: null,
  },
  {
    id: "m3",
    name: "Sam Wilson",
    email: "sam@quantumpunch.com",
    role: "Inside Sales",
    isActive: false,
    avatar: null,
  },
];

const getInitials = (value?: string, fallback?: string) => {
  const source = value && value.trim().length > 0 ? value : fallback || "";
  const initials = source
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "TM";
};

const normalizeUsers = (users: User[] | undefined): Member[] => {
  if (!users || users.length === 0) {
    return fallbackMembers;
  }

  return users.map((user) => {
    const status =
      user.inviteStatus == InviteStatus.PENDING || user.inviteStatus == InviteStatus.REJECTED
        ? user.inviteStatus
        : user.isActive
          ? "Active"
          : "Inactive";

    return {
      id: user.id,
      name: user.name || user.email || "Unknown User",
      email: user.email || "No email",
      role: user.role || "Team Member",
      isActive: user.isActive ?? true,
      avatar: null,
      inviteStatus: status
    };
  });
};

const statusCheck = (inviteStatus: string): boolean => {
  switch (inviteStatus) {
    case InviteStatus.PENDING:
    case InviteStatus.REJECTED:
    case "Inactive":
      return false;
    case InviteStatus.ACCEPTED:
    case InviteStatus.CREATED:
    case "Active":
      return true;
    default:
      return false;
  }
}

export function TeamMembersTab() {
  const { userRole } = useUserRole();
  const { toast } = useToast();
  const { data: users, isLoading, error, refetch, isFetching } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [formState, setFormState] = useState<TeamMemberFormState>({
    name: "",
    email: "",
    role: roleOptions[2].value,
    isActive: true,
    password: DEFAULT_PASSWORD,
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const passwordToUse = formState.password?.trim() || DEFAULT_PASSWORD;
      const payload = {
        name: formState.name,
        email: formState.email,
        password: passwordToUse,
        role: formState.role,
        isActive: formState.isActive,
      };
      const { data, error: apiError } = await CustomServerApi.register(payload);
      if (apiError) throw new Error(apiError);
      if (!data) throw new Error("User registration failed");
      return data;
    },
    onSuccess: async () => {
      await refetch();
      toast({
        title: "Member created",
        description: `Account for ${formState.email} created with default password.`,
      });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: "Unable to create member",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const members = useMemo(() => normalizeUsers(users), [users]);

  const resetForm = (member?: Member | null, mode: ModalMode = "add") => {
    if (member) {
      setFormState({
        name: member.name,
        email: member.email,
        role: member.role || roleOptions[2].value,
        isActive: statusCheck(member.inviteStatus || (member.isActive ? "Active" : "Inactive")),
        password: DEFAULT_PASSWORD,
      });
    } else {
      setFormState({
        name: "",
        email: "",
        role: roleOptions[2].value,
        isActive: true,
        password: DEFAULT_PASSWORD,
      });
    }
    setModalMode(mode);
    setEditingMemberId(member?.id || null);
    setIsModalOpen(true);
  };

  const handleFormChange = (update: Partial<TeamMemberFormState>) => {
    setFormState((prev) => ({ ...prev, ...update }));
  };

  const handleEdit = (member: Member) => {
    resetForm(member, "edit");
  };

  const handleAdd = () => {
    resetForm(null, "add");
  };

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!editingMemberId) throw new Error("Missing user id for update");
      const payload = {
        name: formState.name,
        email: formState.email,
        role: formState.role,
        isActive: formState.isActive,
      };
      const { data, error: apiError } = await CustomServerApi.updateUser(editingMemberId, payload);
      if (apiError) throw new Error(apiError);
      if (!data) throw new Error("User update failed");
      return data;
    },
    onSuccess: async () => {
      await refetch();
      toast({
        title: "Member updated",
        description: `Changes to ${formState.email} saved.`,
      });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: "Unable to update member",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (modalMode === "add") {
      createUserMutation.mutate();
    } else {
      updateUserMutation.mutate();
    }
  };

  if (userRole !== "admin") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-base">Admins Only</CardTitle>
          </div>
          <CardDescription>
            Team member management is restricted to administrators.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-professional touch-manipulation border shadow-sm">
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Team Members
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage user access, roles, and availability across the organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          {isLoading || isFetching ? (
            <div className="space-y-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
              <ShieldAlert className="h-4 w-4 text-destructive mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Unable to load team members</p>
                <p className="text-xs text-destructive/80">
                  {(error as Error)?.message || "An unexpected error occurred."}
                </p>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar || ""} />
                      <AvatarFallback className="text-sm">
                        {getInitials(member.name, member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-semibold">{member.name || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Badge variant="outline">{member.role || "No Role"}</Badge>
                    <Badge
                      className={
                        statusCheck(member.inviteStatus || (member.isActive ? "Active" : "Inactive"))
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }
                    >
                      {member.inviteStatus || (member.isActive ? "Active" : "Inactive")}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto sm:ml-0 min-h-[44px] touch-manipulation"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full min-h-[44px] touch-manipulation"
                onClick={handleAdd}
              >
                Add Team Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <TeamMemberModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        formState={formState}
        roleOptions={roleOptions}
        defaultPassword={DEFAULT_PASSWORD}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        isSubmitting={createUserMutation.isPending || updateUserMutation.isPending}
      />
    </>
  );
}
