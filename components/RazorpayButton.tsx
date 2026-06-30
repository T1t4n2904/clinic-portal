"use client";

import { useState } from "react";

type RazorpayButtonProps = {
  appointmentId: string;
  amount: number;
  disabled?: boolean;
  setupMessage?: string;
  isTestMode?: boolean;
};

export function RazorpayButton({
  appointmentId,
  amount,
  disabled = false,
  setupMessage,
  isTestMode = false,
}: RazorpayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!loaded) {
        setStatusMessage({
          type: "error",
          text: "Failed to load payment SDK. Please check your internet connection.",
        });
        setIsLoading(false);
        return;
      }

      setStatusMessage({ type: "info", text: "Preparing secure checkout..." });

      const response = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        setStatusMessage({
          type: "error",
          text: `Checkout setup failed: ${errMsg}`,
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setStatusMessage(null);

      const options = {
        key: data.keyId,
        amount: data.amount * 100,
        currency: "INR",
        name: "AyurClinic",
        description: "Ayurvedic Consultation Booking",
        order_id: data.orderId,
        handler: async function (checkoutRes: any) {
          setIsLoading(true);
          setStatusMessage({ type: "info", text: "Verifying transaction..." });
          try {
            const verifyResponse = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointmentId,
                paymentId: checkoutRes.razorpay_payment_id,
                orderId: checkoutRes.razorpay_order_id,
                signature: checkoutRes.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              setStatusMessage({
                type: "success",
                text: "Payment verified successfully. Redirecting...",
              });
              window.location.href = `/dashboard/appointments/${appointmentId}?paid=1`;
            } else {
              setStatusMessage({
                type: "error",
                text: "Signature verification failed. Payment was rejected by server.",
              });
              setIsLoading(false);
            }
          } catch (verifyErr) {
            console.error("Verification connection error:", verifyErr);
            setStatusMessage({
              type: "error",
              text: "Network error connecting to payment verification server.",
            });
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setStatusMessage({
              type: "error",
              text: "Payment was cancelled. You can try again.",
            });
          },
        },
        prefill: {
          name: data.patientName,
          email: data.patientEmail || "",
          contact: data.patientPhone,
        },
        theme: {
          color: "#064e3b",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Setup error:", err);
      setStatusMessage({
        type: "error",
        text: "Failed to open checkout window.",
      });
      setIsLoading(false);
    }
  };

  const isDev = process.env.NODE_ENV === "development";
  const showTestLabel = isTestMode && isDev;

  if (disabled) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          disabled
          title={setupMessage || "Online payment disabled"}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-450 cursor-not-allowed"
        >
          Pay consultation fee (Disabled)
        </button>
        {setupMessage && (
          <p className="text-[10px] text-slate-500 max-w-xs">{setupMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-800 hover:bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay consultation fee (₹${amount})`
        )}
      </button>

      {/* Subtle test mode label, displayed only in dev/local */}
      {showTestLabel && (
        <span className="block text-[10px] text-slate-400 font-medium tracking-wide text-center">
          Test payment mode active
        </span>
      )}

      {/* Success/Error/Info status messages */}
      {statusMessage && (
        <p
          className={`text-[10px] font-semibold text-center mt-1 leading-normal ${
            statusMessage.type === "success"
              ? "text-emerald-700"
              : statusMessage.type === "error"
              ? "text-rose-650"
              : "text-slate-500 animate-pulse"
          }`}
        >
          {statusMessage.text}
        </p>
      )}
    </div>
  );
}
