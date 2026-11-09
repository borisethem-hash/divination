"use client";

export default function DemoLogin({ email, password }: { email: string; password: string }) {
  return (
    <button
      type="button"
      className="btn btn-sm btn-outline"
      onClick={() => {
        const e = document.getElementById("login-email") as HTMLInputElement | null;
        const p = document.getElementById("login-password") as HTMLInputElement | null;
        if (e && p) { e.value = email; p.value = password; e.form?.requestSubmit(); }
      }}
    >
      この情報でログイン
    </button>
  );
}
