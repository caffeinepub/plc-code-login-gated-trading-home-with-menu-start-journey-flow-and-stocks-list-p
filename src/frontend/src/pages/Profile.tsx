import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, Copy } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { type FscUser, getCurrentUser, saveUser } from "../types/fsc";

interface ProfileProps {
  onBack: () => void;
}

export default function Profile({ onBack }: ProfileProps) {
  const [user, setUser] = useState<FscUser | null>(() => getCurrentUser());
  const [idCopied, setIdCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleProfilePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const updated: FscUser = { ...user, profilePic: base64 };
      saveUser(updated);
      setUser(updated);
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
  }

  function handleCopyId() {
    if (!user?.uniqueId) return;
    navigator.clipboard.writeText(user.uniqueId).then(() => {
      setIdCopied(true);
      toast.success("User ID copied!");
      setTimeout(() => setIdCopied(false), 2000);
    });
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "transparent",
              border: "1px solid oklch(0.65 0.22 220 / 0.3)",
              borderRadius: 10,
              padding: "8px",
              cursor: "pointer",
              color: "oklch(0.65 0.22 220)",
            }}
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <p
            className="font-display font-bold text-primary"
            style={{ fontSize: "1.1rem" }}
          >
            Profile Settings
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* Profile Picture */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            {/* Avatar with blue gradient border */}
            <div
              style={{
                padding: 3,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 220), oklch(0.72 0.18 195))",
                display: "inline-block",
                boxShadow: "0 0 24px oklch(0.55 0.22 220 / 0.35)",
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "oklch(0.13 0.05 240)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "2.5rem",
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontWeight: 800,
                      color: "white",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {initial}
                  </span>
                )}
              </div>
            </div>
            <label
              htmlFor="profile-pic-input"
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, oklch(0.62 0.24 218), oklch(0.52 0.26 232))",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 2px 10px oklch(0.55 0.22 220 / 0.5)",
                border: "2px solid oklch(0.07 0.035 240)",
              }}
            >
              <Camera style={{ width: 14, height: 14 }} />
            </label>
          </div>
          <input
            id="profile-pic-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleProfilePicChange}
          />
          {/* Name display */}
          {user?.name && (
            <p
              className="font-display font-bold mt-3"
              style={{
                fontSize: "1.2rem",
                background:
                  "linear-gradient(135deg, oklch(0.88 0.12 198), oklch(0.72 0.20 215))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {user.name}
            </p>
          )}
          <p
            className="font-sans text-sm mt-1"
            style={{ color: "oklch(0.45 0.06 220)" }}
          >
            Tap the camera icon to change photo
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label
              htmlFor="profile-name"
              className="font-sans text-sm font-semibold"
              style={{
                display: "block",
                marginBottom: 8,
                color: "oklch(0.72 0.10 215)",
              }}
            >
              Full Name
            </label>
            <Input
              id="profile-name"
              value={user?.name ?? ""}
              readOnly
              className="bg-secondary border-border text-foreground opacity-70 cursor-default"
            />
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="font-sans text-sm font-semibold"
              style={{
                display: "block",
                marginBottom: 8,
                color: "oklch(0.72 0.10 215)",
              }}
            >
              Phone Number
            </label>
            <Input
              id="profile-phone"
              value={user?.phone ?? ""}
              readOnly
              className="bg-secondary border-border text-foreground opacity-70 cursor-default"
            />
          </div>

          <div>
            <label
              htmlFor="profile-uid"
              className="font-sans text-sm font-semibold"
              style={{
                display: "block",
                marginBottom: 8,
                color: "oklch(0.72 0.10 215)",
              }}
            >
              User ID
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <Input
                id="profile-uid"
                value={user?.uniqueId ?? ""}
                readOnly
                className="bg-secondary border-border text-foreground opacity-70 cursor-default flex-1"
              />
              <button
                type="button"
                onClick={handleCopyId}
                style={{
                  background: idCopied
                    ? "oklch(0.65 0.2 145 / 0.15)"
                    : "oklch(0.65 0.22 220 / 0.12)",
                  border: `1px solid ${
                    idCopied
                      ? "oklch(0.65 0.2 145 / 0.5)"
                      : "oklch(0.65 0.22 220 / 0.35)"
                  }`,
                  borderRadius: 10,
                  padding: "0 14px",
                  cursor: "pointer",
                  color: idCopied
                    ? "oklch(0.68 0.18 145)"
                    : "oklch(0.72 0.20 215)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                <Copy style={{ width: 14, height: 14 }} />
                {idCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
