"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Coins } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, displayName);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-bg min-h-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-cyan flex items-center justify-center mx-auto">
            <TrendingUp className="h-7 w-7 text-navy" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Start trading with simulated currency
          </p>
        </div>

        <div className="bg-amber/5 border border-amber/20 rounded-xl p-4 flex items-center gap-3">
          <Coins className="h-8 w-8 text-amber shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber">10,000 $PAUL</p>
            <p className="text-xs text-muted-foreground">
              You&apos;ll receive 10k in simulated currency to start trading!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-loss/10 border border-loss/20 rounded-lg px-4 py-2.5 text-sm text-loss">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your trader name"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-cyan text-navy hover:bg-cyan/90 font-semibold"
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
