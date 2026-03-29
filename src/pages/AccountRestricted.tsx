import { ShieldAlert, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const AccountRestricted = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-4xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
          Account restricted
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your SpotAI account is currently restricted from using the platform.
        </p>
        {profile?.platform_ban_reason ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-left text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
            <p className="font-semibold">Reason</p>
            <p className="mt-1">{profile.platform_ban_reason}</p>
          </div>
        ) : null}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
          >
            Return to landing
          </Button>
          <Button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountRestricted;
