import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  Upload,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { backendSubmitKyc } from "../lib/backendStore";
import {
  type KycData,
  getCurrentUser,
  getKycData,
  saveKycData,
} from "../types/fsc";

interface KYCProps {
  onBack: () => void;
}

export default function KYC({ onBack }: KYCProps) {
  const user = getCurrentUser();
  const [kyc, setKyc] = useState<KycData | null>(() =>
    user ? getKycData(user.uniqueId) : null,
  );
  const [docType, setDocType] = useState<"aadhaar" | "pan">("aadhaar");
  const [docNumber, setDocNumber] = useState("");
  const [docImage, setDocImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDocImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !docNumber.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const data: KycData = {
        docType,
        docNumber: docNumber.trim(),
        status: "pending",
        submittedDate: new Date().toLocaleDateString("en-IN"),
        docImage: docImage ?? undefined,
      };
      saveKycData(user.uniqueId, data);
      backendSubmitKyc(user.uniqueId, data).catch(() => {});
      setKyc(data);
      setSubmitting(false);
      toast.success("KYC submitted for verification!");
    }, 1200);
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "oklch(0.78 0.18 82)",
      bg: "oklch(0.78 0.18 82 / 0.1)",
      label: "Under Review",
    },
    verified: {
      icon: CheckCircle2,
      color: "oklch(0.65 0.2 145)",
      bg: "oklch(0.65 0.2 145 / 0.1)",
      label: "Verified",
    },
    rejected: {
      icon: XCircle,
      color: "oklch(0.65 0.22 22)",
      bg: "oklch(0.65 0.22 22 / 0.1)",
      label: "Rejected",
    },
  };

  const sc = kyc ? statusConfig[kyc.status] : null;

  return (
    <div className="page-wrapper bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn-glass rounded-xl p-2"
            data-ocid="kyc.back.button"
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <Shield
            style={{ width: 20, height: 20, color: "oklch(0.78 0.18 82)" }}
          />
          <h1 className="font-display font-bold text-foreground text-lg">
            KYC Verification
          </h1>
        </div>
      </header>

      <main className="px-4 pt-5 pb-8">
        {/* Status Banner */}
        {kyc && sc && (
          <div
            className="animate-scale-in rounded-2xl p-4 mb-5 flex items-center gap-3"
            style={{ background: sc.bg, border: `1px solid ${sc.color}33` }}
            data-ocid="kyc.status.panel"
          >
            <sc.icon
              style={{ width: 28, height: 28, color: sc.color, flexShrink: 0 }}
            />
            <div>
              <p className="font-bold text-sm" style={{ color: sc.color }}>
                KYC {sc.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {kyc.docType === "aadhaar" ? "Aadhaar" : "PAN"} ending ····
                {kyc.docNumber.slice(-4)}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted: {kyc.submittedDate}
              </p>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="glass-card p-4 mb-5 animate-fade-in-up">
          <h2 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
            <FileText
              style={{ width: 18, height: 18, color: "oklch(0.78 0.18 82)" }}
            />
            Why KYC?
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex items-center gap-2">
              <CheckCircle2
                style={{ width: 14, height: 14, color: "oklch(0.65 0.2 145)" }}
              />{" "}
              Unlock higher withdrawal limits
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2
                style={{ width: 14, height: 14, color: "oklch(0.65 0.2 145)" }}
              />{" "}
              Get verified badge on profile
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2
                style={{ width: 14, height: 14, color: "oklch(0.65 0.2 145)" }}
              />{" "}
              Priority support & VIP perks
            </li>
          </ul>
        </div>

        {/* Form */}
        {(!kyc || kyc.status === "rejected") && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 animate-fade-in-up"
          >
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">
                Document Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {(["aadhaar", "pan"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDocType(t)}
                    className="rounded-xl p-3 text-sm font-semibold transition-all capitalize"
                    style={{
                      background:
                        docType === t
                          ? "oklch(0.78 0.18 82 / 0.15)"
                          : "oklch(0.14 0.025 265)",
                      border: `1px solid ${docType === t ? "oklch(0.78 0.18 82 / 0.5)" : "oklch(0.25 0.04 265)"}`,
                      color:
                        docType === t
                          ? "oklch(0.78 0.18 82)"
                          : "oklch(0.8 0.01 80)",
                    }}
                    data-ocid={`kyc.${t}.button`}
                  >
                    {t === "aadhaar" ? "Aadhaar Card" : "PAN Card"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">
                {docType === "aadhaar" ? "Aadhaar Number" : "PAN Number"}
              </Label>
              <Input
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder={
                  docType === "aadhaar" ? "XXXX XXXX XXXX" : "ABCDE1234F"
                }
                className="rounded-xl"
                style={{
                  background: "oklch(0.15 0.025 265)",
                  border: "1px solid oklch(0.25 0.04 265)",
                }}
                data-ocid="kyc.docnumber.input"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">
                Upload Document
              </Label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl p-4 flex flex-col items-center gap-2 transition-all"
                style={{
                  background: "oklch(0.14 0.025 265)",
                  border: `2px dashed ${docImage ? "oklch(0.65 0.2 145 / 0.5)" : "oklch(0.25 0.04 265)"}`,
                }}
                data-ocid="kyc.upload_button"
              >
                {docImage ? (
                  <img
                    src={docImage}
                    alt="doc"
                    className="w-full max-h-32 object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <Upload
                      style={{
                        width: 24,
                        height: 24,
                        color: "oklch(0.55 0.02 265)",
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      Tap to upload document photo
                    </span>
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <button
              type="submit"
              className="btn-gold w-full rounded-xl py-3.5 font-bold text-base"
              disabled={submitting || !docNumber.trim()}
              data-ocid="kyc.submit_button"
            >
              {submitting ? "Submitting..." : "Submit KYC"}
            </button>
          </form>
        )}

        {kyc && kyc.status === "pending" && (
          <div
            className="text-center py-8 animate-fade-in"
            data-ocid="kyc.pending.panel"
          >
            <Clock
              style={{
                width: 48,
                height: 48,
                color: "oklch(0.78 0.18 82)",
                margin: "0 auto 12px",
              }}
            />
            <p className="font-display font-bold text-foreground text-lg">
              Verification in Progress
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Your documents are being reviewed. This usually takes 24-48 hours.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
