"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { supabase } from "@/lib/supabase";
import { Check, ArrowLeft, Copy, ExternalLink, ShieldCheck, Wallet } from "lucide-react";
import { PaymentConfig } from "@/lib/types";
import { DATA_MODE, LS, lsGet, lsSet } from "@/lib/config";

const DEFAULT_PAYMENT: PaymentConfig = {
  paypalUsername: "",
  paypalEmail: "",
  usdtAddress: "",
  usdtNetwork: "TRC-20 (Tron Network)",
};

export default function CheckoutPage() {
  const { state, total, dispatch } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [method, setMethod] = useState<"paypal" | "usdt">("paypal");
  const [copied, setCopied] = useState(false);
  const [payment, setPayment] = useState<PaymentConfig>(DEFAULT_PAYMENT);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", postalCode: "", country: "",
  });
  const shipping = total >= 200 ? 0 : 25;

  useEffect(() => {
    if (DATA_MODE === "local") {
      const stored = lsGet<PaymentConfig>(LS.payment);
      if (stored) setPayment({ ...DEFAULT_PAYMENT, ...stored });
      return;
    }
    supabase.from("payment_settings").select("*").limit(1).maybeSingle().then(({ data, error }) => {
      if (!error && data) {
        setPayment({
          paypalUsername: data.paypal_username || "",
          paypalEmail: data.paypal_email || "",
          usdtAddress: data.usdt_address || "",
          usdtNetwork: data.usdt_network || DEFAULT_PAYMENT.usdtNetwork,
        });
      }
    });
  }, []);

  const upd = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  if (state.items.length === 0 && !submitted) {
    return (
      <div className="page-padding py-32 text-center max-w-lg mx-auto">
        <h1 className="font-serif text-2xl mb-4">Your bag is empty</h1>
        <p className="text-smoke mb-8">Add some warm pieces to get started.</p>
        <Link href="/shop" className="btn-primary">Browse Collection</Link>
      </div>
    );
  }

  const copyAddress = () => {
    if (!payment.usdtAddress) return;
    navigator.clipboard?.writeText(payment.usdtAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const grandTotal = total + shipping;

  const placeOrder = async (m: "paypal" | "usdt") => {
    setError("");
    if (!form.firstName.trim() || !form.email.trim() || !form.address.trim() || !form.city.trim() || !form.country.trim()) {
      setError("Please complete all required shipping fields.");
      setStep("shipping");
      return;
    }
    setSaving(true);
    const orderRow = {
      id: "MM" + Date.now().toString().slice(-8),
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      postal_code: form.postalCode.trim(),
      country: form.country.trim(),
      items: state.items.map((item) => ({
        name: item.product.name,
        slug: item.product.slug,
        color: item.color || "",
        size: item.size || "",
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal: total,
      shipping,
      total: grandTotal,
      status: "pending",
      payment_method: m,
      created_at: new Date().toISOString(),
    };

    // 本地模式：写入 localStorage
    if (DATA_MODE === "local") {
      const all = lsGet<any[]>(LS.orders) || [];
      lsSet(LS.orders, [orderRow, ...all]);
      setOrder(orderRow);
      setSubmitted(true);
      dispatch({ type: "CLEAR_CART" });
      setSaving(false);
      // PayPal：直接跳转收银台；USDT：停留在本站展示收款地址
      if (m === "paypal" && payment.paypalUsername) {
        window.open(`https://www.paypal.me/${payment.paypalUsername}/${grandTotal.toFixed(2)}`, "_blank");
      }
      return;
    }

    // 云模式：写入 Supabase，再跳转/展示
    try {
      const { error: err } = await supabase.from("orders").insert({
        ...orderRow,
        id: undefined,
      });
      if (err) {
        console.error("[checkout] insert error:", err.message);
        setError("We could not place your order. Please contact us via WhatsApp and we will assist you.");
        setSaving(false);
        return;
      }
      setOrder(orderRow);
      setSubmitted(true);
      dispatch({ type: "CLEAR_CART" });
      setSaving(false);
      if (m === "paypal" && payment.paypalUsername) {
        window.open(`https://www.paypal.me/${payment.paypalUsername}/${grandTotal.toFixed(2)}`, "_blank");
      }
    } catch (e: any) {
      console.error("[checkout] fatal error:", e?.message || e);
      setError("We could not place your order. Please contact us via WhatsApp and we will assist you.");
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-line bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal";

  // ── 支付完成/指引页 ──
  if (submitted && order) {
    return (
      <div className="page-padding py-32 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-gold" />
        </div>
        <h1 className="font-serif text-2xl mb-3">
          {order.payment_method === "paypal" ? "Order Placed" : "Payment Instructions"}
        </h1>
        <p className="text-smoke mb-2">
          {order.payment_method === "paypal"
            ? "You have been redirected to PayPal to complete your payment. Your order is reserved."
            : "Complete your USDT transfer to confirm your order."}
        </p>
        <p className="text-xs text-smoke/60 mb-6">Order #{order.id} · Total ${order.total.toLocaleString()}</p>

        {order.payment_method === "usdt" && (
          <div className="text-left border border-line p-6 mb-6 bg-ivory/30">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-gold" />
              <p className="text-xs tracking-label uppercase text-smoke">Send USDT to this address</p>
            </div>
            {payment.usdtAddress ? (
              <>
                <p className="text-[11px] text-smoke/60 mb-1.5">Network: {payment.usdtNetwork}</p>
                <div className="flex items-center gap-2 mb-4">
                  <code className="flex-1 bg-paper border border-line px-3 py-2.5 text-xs break-all font-mono">{payment.usdtAddress}</code>
                  <button onClick={copyAddress} className="btn-outline text-[10px] py-2.5 px-3 flex-shrink-0">
                    <Copy size={12} className="mr-1" />{copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3 p-3 bg-paper border border-gold/20 text-xs text-smoke">
                  <ShieldCheck size={14} className="text-gold flex-shrink-0" />
                  <span>Send exactly <b className="text-charcoal">${order.total.toLocaleString()} USDT</b>. After transfer, notify us via WhatsApp with your order number.</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-smoke bg-paper border border-dashed border-line p-3 mb-4">
                USDT address not configured yet. Please contact us via WhatsApp to complete your order.
              </p>
            )}
            <p className="text-[11px] text-smoke/50">Never send funds to anyone other than the address above. We will confirm within 24 hours.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {order.payment_method === "paypal" && payment.paypalUsername && (
            <a href={`https://www.paypal.me/${payment.paypalUsername}/${order.total.toFixed(2)}`} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
              <ExternalLink size={14} className="mr-2" /> Open PayPal Checkout
            </a>
          )}
          <Link href="/shop" className="btn-outline w-full">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-padding py-14 md:py-20 max-w-5xl mx-auto">
      <h1 className="section-title mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-14">
        <div>
          {/* Steps */}
          <div className="flex gap-6 mb-10">
            <button onClick={() => setStep("shipping")} className={`text-xs tracking-label uppercase pb-2 border-b-2 transition-colors ${step === "shipping" ? "border-charcoal text-charcoal" : "border-transparent text-smoke/40"}`}>Shipping</button>
            <button onClick={() => setStep("payment")} className={`text-xs tracking-label uppercase pb-2 border-b-2 transition-colors ${step === "payment" ? "border-charcoal text-charcoal" : "border-transparent text-smoke/40"}`}>Payment</button>
          </div>

          {step === "shipping" ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-1.5">First Name</label>
                  <input value={form.firstName} onChange={(e) => upd("firstName", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-1.5">Last Name</label>
                  <input value={form.lastName} onChange={(e) => upd("lastName", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-1.5">Phone / WhatsApp</label>
                  <input value={form.phone} onChange={(e) => upd("phone", e.target.value)} placeholder="+1 555 000 0000" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-1.5">Address</label>
                <input value={form.address} onChange={(e) => upd("address", e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-1.5">City</label>
                  <input value={form.city} onChange={(e) => upd("city", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-1.5">Postal Code</label>
                  <input value={form.postalCode} onChange={(e) => upd("postalCode", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-1.5">Country</label>
                <input value={form.country} onChange={(e) => upd("country", e.target.value)} className={inputClass} />
              </div>
              <button onClick={() => setStep("payment")} className="btn-primary w-full mt-4">
                Continue to Payment
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* 支付方式选择 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setMethod("paypal")}
                  className={`border p-6 text-left transition-colors ${method === "paypal" ? "border-charcoal bg-charcoal text-paper" : "border-line hover:border-charcoal/40"}`}
                >
                  <p className="font-serif text-lg mb-1">PayPal</p>
                  <p className={`text-xs ${method === "paypal" ? "text-paper/60" : "text-smoke"}`}>Pay by card or PayPal balance. Instant confirmation.</p>
                </button>
                <button
                  onClick={() => setMethod("usdt")}
                  className={`border p-6 text-left transition-colors ${method === "usdt" ? "border-charcoal bg-charcoal text-paper" : "border-line hover:border-charcoal/40"}`}
                >
                  <p className="font-serif text-lg mb-1">USDT</p>
                  <p className={`text-xs ${method === "usdt" ? "text-paper/60" : "text-smoke"}`}>Crypto payment (TRC-20). 5% discount applied at checkout manually.</p>
                </button>
              </div>

              {method === "paypal" && (
                <div className="border border-line p-6">
                  <p className="text-sm text-smoke mb-5">You will be redirected to PayPal to complete your payment securely.</p>
                  <div className="flex items-center gap-2 text-xs text-smoke/60">
                    <ShieldCheck size={14} className="text-gold" />
                    <span>PayPal Buyer Protection included on every order.</span>
                  </div>
                </div>
              )}

              {method === "usdt" && (
                <div className="border border-line p-6">
                  <p className="text-sm text-smoke mb-3">After placing your order, we will show you our USDT (TRC-20) wallet address to send payment to.</p>
                  <div className="flex items-center gap-2 text-xs text-smoke/60">
                    <ShieldCheck size={14} className="text-gold" />
                    <span>Order confirmed manually within 24h after transfer.</span>
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-red-500 bg-red-50 p-3">{error}</p>}
              <div className="flex gap-4">
                <button onClick={() => setStep("shipping")} className="btn-outline flex-1"><ArrowLeft size={14} className="mr-2" /> Back</button>
                <button onClick={() => placeOrder(method)} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                  {saving ? "Processing..." : method === "paypal" ? `Pay with PayPal — $${grandTotal.toLocaleString()}` : `Place Order (USDT) — $${grandTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-ivory/30 p-8 h-fit">
          <h2 className="text-xs tracking-label uppercase text-smoke/50 mb-5">Order Summary</h2>
          <div className="flex flex-col gap-3 mb-6">
            {state.items.map((item) => (
              <div key={`${item.product.id}-${item.size || ""}-${item.color || ""}`} className="flex justify-between text-sm">
                <span className="truncate mr-4 text-smoke">{item.product.name}{item.size ? ` (${item.size})` : ""}{item.color ? ` · ${item.color}` : ""} × {item.quantity}</span>
                <span className="flex-shrink-0">${(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-smoke"><span>Subtotal</span><span>${total.toLocaleString()}</span></div>
            <div className="flex justify-between text-smoke"><span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping}`}</span></div>
            <div className="flex justify-between font-medium pt-3 border-t border-line"><span>Total</span><span>${grandTotal.toLocaleString()}</span></div>
          </div>
          {shipping === 0 && <p className="text-xs text-gold mt-3">Free worldwide shipping unlocked</p>}
        </div>
      </div>
    </div>
  );
}
