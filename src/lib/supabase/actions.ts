"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./server";

export type AuthState = { error: string } | null;

// ── Sign in ──────────────────────────────────────────────────
export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ── Sign up ──────────────────────────────────────────────────
export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  // Guard: catch missing / placeholder env vars before making any network call
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || supabaseUrl.includes("placeholder") || supabaseUrl.includes("YOUR_PROJECT_REF")) {
    return { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL in .env.local." };
  }
  if (!anonKey || anonKey.includes("placeholder")) {
    return { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local." };
  }

  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const orgName = formData.get("orgName") as string;

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  let signUpResult: Awaited<ReturnType<typeof supabase.auth.signUp>>;
  try {
    signUpResult = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, org_name: orgName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("fetch")) {
      return { error: `Cannot reach Supabase. Check that NEXT_PUBLIC_SUPABASE_URL is correct (got: ${supabaseUrl}).` };
    }
    return { error: `Unexpected error: ${msg}` };
  }

  if (signUpResult.error) return { error: signUpResult.error.message };

  // If email confirmation is disabled (e.g. dev mode), session is created immediately
  if (signUpResult.data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // Supabase sent a confirmation email
  redirect("/auth/check-email");
}

// ── Sign out ─────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// ── Forgot password ──────────────────────────────────────────
export async function forgotPassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get("email") as string,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password` }
  );

  if (error) return { error: error.message };
  redirect("/forgot-password?sent=1");
}

// ── Reset password ───────────────────────────────────────────
export async function resetPassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ── Update profile ────────────────────────────────────────────
export async function updateProfile(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const fullName = formData.get("fullName") as string;
  const jobTitle = formData.get("jobTitle") as string;
  const timezone = formData.get("timezone") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, job_title: jobTitle, timezone })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings/profile");
  return null;
}

// ── Update email ─────────────────────────────────────────────
export async function updateEmail(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    email: formData.get("email") as string,
  });

  if (error) return { error: error.message };
  return null;
}

// ── Change password ───────────────────────────────────────────
export async function changePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const current = formData.get("currentPassword") as string;
  const next = formData.get("newPassword") as string;
  const confirm = formData.get("confirmPassword") as string;

  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "Passwords do not match." };

  const supabase = await createClient();
  // Verify current password by re-signing in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated." };

  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (verifyErr) return { error: "Current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message };

  return null;
}
