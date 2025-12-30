import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type TeamMemberFormState = {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  password: string;
  territory: string;
};

type RoleOption = { value: string; label: string };
type TerritoryOption = Array<string>;

type TeamMemberModalProps = {
  open: boolean;
  mode: "add" | "edit";
  defaultPassword: string;
  formState: TeamMemberFormState;
  roleOptions: RoleOption[];
  territoryOptions: TerritoryOption;
  onOpenChange: (open: boolean) => void;
  onChange: (update: Partial<TeamMemberFormState>) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

export function TeamMemberModal({
  open,
  mode,
  defaultPassword,
  formState,
  roleOptions,
  territoryOptions,
  onOpenChange,
  onChange,
  onSubmit,
  isSubmitting = false,
}: TeamMemberModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Team Member" : "Edit Team Member"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new team member. A default password will be applied."
              : "Update member details. Leaving password blank keeps the default applied here."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formState.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formState.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formState.role}
              onValueChange={(value) => onChange({ role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Territory</Label>
            <Select
              value={formState.territory}
              onValueChange={(value) => onChange({ territory: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a territory" />
              </SelectTrigger>
              <SelectContent>
                {territoryOptions.map((territory,i) => (
                  <SelectItem key={i} value={territory}>
                    {territory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <div className="space-y-1">
              <Label>Active Status</Label>
              <p className="text-xs text-muted-foreground">Toggle to set the account active or inactive.</p>
            </div>
            <Switch
              checked={formState.isActive}
              onCheckedChange={(checked) => onChange({ isActive: checked })}
            />
          </div>

          <div className="space-y-2 hidden">
            <Label>Password (default applied)</Label>
            <Input
              type="password"
              value={formState.password}
              onChange={(e) => onChange({ password: e.target.value })}
              placeholder={defaultPassword}
            />
            <p className="text-xs text-muted-foreground">
              If left unchanged, password will be set to <span className="font-medium">{defaultPassword}</span>.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {mode === "add" ? "Create Member" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

