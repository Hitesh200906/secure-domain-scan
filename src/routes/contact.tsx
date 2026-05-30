import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Nexus Security" },
      {
        name: "description",
        content:
          "Talk to our security team. Request a custom audit or get answers about pricing, integrations, and compliance.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Request a security audit"
        description="Tell us about your stack. Our team will reply within one business day with a tailored plan."
      />

      <section className="relative py-12 pb-32">
        <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-[1fr_1.4fr] gap-10">
          <aside className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "security@nexus.io" },
              { icon: Phone, label: "Phone", value: "+91 80 4567 1200" },
              { icon: MapPin, label: "HQ", value: "Bengaluru · San Francisco" },
            ].map((c) => (
              <div key={c.label} className="glass rounded-2xl p-5 flex items-start gap-4">
                <div className="size-10 rounded-xl glass grid place-items-center text-primary">
                  <c.icon className="size-4" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {c.label}
                  </div>
                  <div className="text-sm mt-0.5">{c.value}</div>
                </div>
              </div>
            ))}

            <div className="glass rounded-2xl p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                SLA
              </div>
              <div className="mt-1.5 text-sm leading-relaxed text-white/85">
                Enterprise customers get a dedicated security engineer and a 1-hour
                response SLA for critical findings.
              </div>
            </div>
          </aside>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="glass-strong rounded-3xl p-8 sm:p-10 space-y-5"
          >
            {submitted ? (
              <div className="text-center py-16">
                <div className="size-12 mx-auto rounded-full grid place-items-center glass text-primary text-2xl">
                  ✓
                </div>
                <h3 className="mt-5 text-xl font-medium">Request received</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Our security team will reach out within one business day to schedule
                  your audit.
                </p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Company" name="company" required />
                  <Field label="Website" name="website" placeholder="https://" />
                </div>
                <Field
                  label="How can we help?"
                  name="message"
                  textarea
                  required
                  placeholder="Tell us about your stack, scope, and timelines."
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.7)] transition"
                >
                  Request Security Audit →
                </button>
                <p className="text-[11px] text-muted-foreground text-center">
                  By submitting, you agree to our Privacy Policy and Terms.
                </p>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
}) {
  const cls =
    "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition";
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={5}
          className={`${cls} mt-2 resize-none`}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          maxLength={255}
          className={`${cls} mt-2`}
        />
      )}
    </label>
  );
}
