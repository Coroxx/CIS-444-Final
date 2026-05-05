"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Wallet,
  Activity,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

interface Profile {
  email: string;
  displayName: string;
  balance: number;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, checkAuth, logout } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tradesCount, setTradesCount] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setProfile(d.user);
          setDisplayName(d.user.displayName);
        }
      });
    fetch("/api/trades")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setTradesCount(d.length));
  }, [user]);

  const saveDisplayName = async () => {
    if (!displayName.trim() || displayName === profile?.displayName) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Update failed");
        return;
      }
      const d = await res.json();
      setProfile(d.user);
      await checkAuth();
      toast.success("Display name updated");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Update failed");
        return;
      }
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSavingPassword(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/me", { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete account");
        return;
      }
      await logout();
      toast.success("Account deleted");
      router.push("/");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-cyan" />
          Profile & Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, security, and preferences
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-5 space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
          Account
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{profile.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Joined {format(new Date(profile.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber" />
            <span className="font-mono">
              ${profile.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
              cash
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan" />
            <span>{tradesCount ?? "…"} trades executed</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-5 space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
          Display name
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            className="flex-1"
          />
          <Button
            onClick={saveDisplayName}
            disabled={
              savingProfile ||
              !displayName.trim() ||
              displayName === profile.displayName
            }
            className="bg-cyan text-navy hover:bg-cyan/90"
          >
            {savingProfile ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
          Change password
        </h2>
        <div className="space-y-3">
          <div>
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={changePassword}
            disabled={
              savingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="bg-cyan text-navy hover:bg-cyan/90"
          >
            {savingPassword ? "Updating..." : "Update password"}
          </Button>
        </div>
      </div>

      <div className="border border-loss/40 bg-loss/5 rounded-xl p-5 space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-loss">
          Danger zone
        </h2>
        <p className="text-sm text-muted-foreground">
          Deleting your account is permanent. All trades, watchlist entries,
          chat messages, and price alerts will be removed.
        </p>
        <AlertDialog>
          <AlertDialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-loss text-white text-sm font-semibold hover:bg-loss/90 transition">
            <Trash2 className="h-4 w-4" />
            Delete account
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete account?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Your account ({profile.email}),
                trades, watchlist, alerts and chat messages will be permanently
                deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteAccount}
                disabled={deleting}
                className="bg-loss text-white hover:bg-loss/90"
              >
                {deleting ? "Deleting..." : "Delete forever"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
