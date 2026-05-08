import { useState, useRef } from "react";

const CENTRAL_CATEGORIES = [
  "General / UR",
  "OBC-NCL",
  "SC",
  "ST",
  "EWS",
  "PWD / PH",
];

/* floating background words for hero */
const BG_WORDS: {
  text: string; fontSize: string; top: string; left: string;
  anim: string; dur: string; delay: string; op: number;
}[] = [
  { text: "MBBS",          fontSize: "7rem",  top: "8%",  left: "2%",   anim: "floatA", dur: "7s",  delay: "0s",    op: 0.07 },
  { text: "BDS",           fontSize: "4rem",  top: "60%", left: "1%",   anim: "floatC", dur: "9s",  delay: "1.2s",  op: 0.05 },
  { text: "NEET",          fontSize: "5rem",  top: "15%", left: "72%",  anim: "floatB", dur: "8s",  delay: "0.5s",  op: 0.06 },
  { text: "MCC",           fontSize: "3.5rem",top: "70%", left: "78%",  anim: "floatD", dur: "6s",  delay: "2s",    op: 0.055 },
  { text: "AIQ",           fontSize: "4.5rem",top: "40%", left: "88%",  anim: "floatA", dur: "10s", delay: "0.8s",  op: 0.05 },
  { text: "BAMS",          fontSize: "3rem",  top: "78%", left: "35%",  anim: "floatB", dur: "7.5s",delay: "1.8s",  op: 0.045 },
  { text: "Medical",       fontSize: "3.8rem",top: "5%",  left: "38%",  anim: "floatC", dur: "11s", delay: "0.3s",  op: 0.04 },
  { text: "BHMS",          fontSize: "2.8rem",top: "50%", left: "55%",  anim: "floatD", dur: "8.5s",delay: "2.5s",  op: 0.04 },
  { text: "Doctor",        fontSize: "5.5rem",top: "30%", left: "-2%",  anim: "floatB", dur: "9.5s",delay: "1s",    op: 0.05 },
  { text: "Counselling",   fontSize: "2.5rem",top: "85%", left: "58%",  anim: "floatA", dur: "12s", delay: "3s",    op: 0.04 },
  { text: "State Quota",   fontSize: "2.2rem",top: "22%", left: "52%",  anim: "floatC", dur: "10s", delay: "1.5s",  op: 0.035 },
  { text: "MBBS",          fontSize: "4rem",  top: "88%", left: "10%",  anim: "floatD", dur: "8s",  delay: "0.7s",  op: 0.045 },
];

/* ─── helpers ─── */
const WEBHOOK = import.meta.env.VITE_SHEETS_URL as string | undefined;

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli & Daman & Diu",
  "Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];


const BUDGETS = [
  "Under ₹5 Lakh / Year",
  "₹5 – ₹10 Lakh / Year",
  "₹10 – ₹20 Lakh / Year",
  "₹20 – ₹50 Lakh / Year",
  "₹50 Lakh+ / Year",
  "Government College Only",
];

const COURSES = ["MBBS", "BDS", "BAMS", "BHMS", "BUMS", "BPT", "B.Sc Nursing", "Other"];

type Form = {
  name: string;
  phone: string;
  estimatedRank: string;
  domicileState: string;
  educationState: string;
  domicileCategory: string;
  centralCategory: string;
  budget: string;
  preferredStates: string[];
  preferredCourse: string;
};

type FormErrors = {
  name?: string;
  phone?: string;
  estimatedRank?: string;
  domicileState?: string;
  educationState?: string;
  domicileCategory?: string;
  centralCategory?: string;
  budget?: string;
  preferredStates?: string;
  preferredCourse?: string;
};

const EMPTY: Form = {
  name: "",
  phone: "",
  estimatedRank: "",
  domicileState: "",
  educationState: "",
  domicileCategory: "",
  centralCategory: "",
  budget: "",
  preferredStates: [],
  preferredCourse: "",
};

function PhoneIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function CollegePredictorPage() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  function set(field: keyof FormErrors, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function togglePreferredState(state: string) {
    setForm((f) => {
      const list = f.preferredStates.includes(state)
        ? f.preferredStates.filter((s) => s !== state)
        : [...f.preferredStates, state];
      return { ...f, preferredStates: list };
    });
    setErrors((e) => ({ ...e, preferredStates: "" }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim())           e.name           = "Name is required.";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone    = "Enter a valid 10-digit mobile number.";
    const rank = Number(form.estimatedRank);
    if (!form.estimatedRank || isNaN(rank) || rank < 1 || rank > 720) e.estimatedRank = "Enter a valid NEET score between 1 and 720.";
    if (!form.domicileState)         e.domicileState  = "Select your home / domicile state.";
    if (!form.educationState)        e.educationState = "Select your education (12th) state.";
    if (!form.domicileCategory)      e.domicileCategory = "Select your state quota category.";
    if (!form.centralCategory)       e.centralCategory  = "Select your AIQ / central category.";
    if (!form.budget)                e.budget         = "Select a budget range.";
    if (form.preferredStates.length === 0) e.preferredStates = "Select at least one preferred state.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (WEBHOOK) {
        await fetch(WEBHOOK, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "college-predictor",
            name: form.name.trim(),
            phone: form.phone.trim(),
            estimatedRank: Number(form.estimatedRank),
            domicileState: form.domicileState,
            educationState: form.educationState,
            domicileCategory: form.domicileCategory,
            centralCategory: form.centralCategory,
            budget: form.budget,
            preferredStates: form.preferredStates.join(", "),
            preferredCourse: form.preferredCourse,
            submittedAt: new Date().toISOString(),
          }),
        });
      }
    } catch {
      // no-cors swallows errors; submission still counts
    }
    setLoading(false);
    setSubmitted(true);
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <Header />
        {/* Success */}
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="modal-pop card max-w-md w-full p-8 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckIcon />
            </div>
            <h2 className="headline text-2xl font-black text-[#0a2844]">
              We've Got Your Details!
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Our counselling experts will analyse your rank, domicile, and preferences and
              call you shortly with your personalised college list.
            </p>
            <p className="mt-5 text-sm font-semibold text-[#123d63]">
              Or call us directly:
            </p>
            <a
              href="tel:+919311483555"
              className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-[#f26430] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#e0481a] transition-colors"
            >
              <PhoneIcon /> +91 93114 83555
            </a>
            <button
              onClick={() => { setForm(EMPTY); setSubmitted(false); }}
              className="mt-4 block w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Submit another enquiry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-20 text-white"
        style={{ background: "linear-gradient(155deg, #061e35 0%, #0a2844 35%, #123d63 70%, #0d3558 100%)" }}>

        {/* ── dynamic coloured blobs ── */}
        <div className="hero-blob" style={{ width:"520px", height:"520px", top:"-140px", right:"-100px",
          background:"radial-gradient(circle, rgba(18,90,138,0.55) 0%, rgba(10,40,68,0) 70%)",
          animationDelay:"0s", animationDuration:"8s" }} />
        <div className="hero-blob" style={{ width:"400px", height:"400px", bottom:"-80px", left:"-60px",
          background:"radial-gradient(circle, rgba(26,60,100,0.5) 0%, rgba(6,30,53,0) 70%)",
          animationDelay:"3s", animationDuration:"10s" }} />
        <div className="hero-blob" style={{ width:"300px", height:"300px", top:"30%", left:"40%",
          background:"radial-gradient(circle, rgba(242,100,48,0.08) 0%, transparent 70%)",
          animationDelay:"1.5s", animationDuration:"7s" }} />

        {/* ── floating MBBS background words ── */}
        {BG_WORDS.map((w, i) => (
          <span
            key={i}
            className="hero-bg-word"
            style={{
              fontSize: w.fontSize,
              top: w.top,
              left: w.left,
              "--op": w.op,
              opacity: w.op,
              animation: `${w.anim} ${w.dur} ${w.delay} ease-in-out infinite`,
            } as React.CSSProperties}
          >
            {w.text}
          </span>
        ))}


        <div className="relative mx-auto max-w-3xl text-center fade-up">
          <p className="text-xs font-black uppercase tracking-[.35em] text-[#ffb06d] mb-3">
            TAB India — College Predictor
          </p>
          <h1 className="headline text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Find Your Best-Fit
            <br className="hidden sm:block" />
            <span className="text-[#ffb06d]"> Medical College</span>
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg max-w-xl mx-auto">
            Enter your NEET rank, domicile &amp; preferences — our experts will
            match you with the right colleges across state &amp; central quotas.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={scrollToForm} className="btn-orange w-full sm:w-auto">
              Predict My College &rarr;
            </button>
            <a
              href="tel:+919311483555"
              className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
            >
              <PhoneIcon /> +91 93114 83555
            </a>
          </div>
        </div>

        {/* stats strip */}
        <div className="relative mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4 sm:gap-8 fade-up-1">
          {[
            { v: "2,800+", l: "Medical Colleges" },
            { v: "AIQ+State", l: "Quota Coverage" },
            { v: "Free", l: "Expert Counselling" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="headline text-2xl font-black text-[#ffb06d] sm:text-3xl">{s.v}</p>
              <p className="mt-0.5 text-xs text-slate-300">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form Section ── */}
      <section ref={formRef} className="mx-auto w-full max-w-3xl px-4 py-14 sm:py-18">
        <div className="mb-8 text-center fade-up">
          <h2 className="headline text-3xl font-black text-[#0a2844] sm:text-4xl">
            Tell Us About Yourself
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Fill in the details below and our counsellors will reach out with a personalised college list.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="card p-6 sm:p-8 space-y-6 fade-up-1">

            {/* ── Personal ── */}
            <SectionTitle>Personal Details</SectionTitle>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full Name *" error={errors.name}>
                <input
                  className="input-field"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </Field>
              <Field label="Mobile Number *" error={errors.phone}>
                <input
                  className="input-field"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  maxLength={10}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                />
              </Field>
            </div>

            {/* ── Rank ── */}
            <SectionTitle>NEET Score</SectionTitle>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Estimated NEET Score * (1 – 720)" error={errors.estimatedRank}>
                <input
                  className="input-field"
                  type="number"
                  min={1}
                  max={720}
                  placeholder="e.g. 550"
                  value={form.estimatedRank}
                  onChange={(e) => set("estimatedRank", e.target.value)}
                />
              </Field>
              <Field label="Preferred Course" error={errors.preferredCourse}>
                <select
                  className="input-field"
                  value={form.preferredCourse}
                  onChange={(e) => set("preferredCourse", e.target.value)}
                >
                  <option value="">Select course</option>
                  {COURSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            {/* ── Domicile & Education ── */}
            <SectionTitle>Domicile &amp; Education State</SectionTitle>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Home / Domicile State *"
                hint="State where you are a permanent resident"
                error={errors.domicileState}
              >
                <select
                  className="input-field"
                  value={form.domicileState}
                  onChange={(e) => set("domicileState", e.target.value)}
                >
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field
                label="Education State *"
                hint="State where you appeared for Class 12"
                error={errors.educationState}
              >
                <select
                  className="input-field"
                  value={form.educationState}
                  onChange={(e) => set("educationState", e.target.value)}
                >
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            {/* ── Categories ── */}
            <SectionTitle>Category</SectionTitle>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="State Quota Category *"
                hint="e.g. General, OBC, SC, ST, EWS, PWD"
                error={errors.domicileCategory}
              >
                <input
                  className="input-field"
                  placeholder="Type your category"
                  value={form.domicileCategory}
                  onChange={(e) => set("domicileCategory", e.target.value)}
                />
              </Field>
              <Field
                label="AIQ / Central Quota Category *"
                hint="Your category for All India Quota (MCC counselling)"
                error={errors.centralCategory}
              >
                <select
                  className="input-field"
                  value={form.centralCategory}
                  onChange={(e) => set("centralCategory", e.target.value)}
                >
                  <option value="">Select category</option>
                  {CENTRAL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            {/* ── Budget ── */}
            <SectionTitle>Budget</SectionTitle>
            <Field label="Annual Fee Budget *" error={errors.budget}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => set("budget", b)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold text-left transition-all ${
                      form.budget === b
                        ? "border-[#f26430] bg-[#fff4e7] text-[#e0481a]"
                        : "border-[#123d63]/15 bg-white/60 text-slate-600 hover:border-[#f26430]/50"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget}</p>}
            </Field>

            {/* ── Preferred States ── */}
            <SectionTitle>Preferred States for College</SectionTitle>
            <Field
              label="Select Preferred States * (choose all that apply)"
              error={errors.preferredStates}
            >
              <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                {STATES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => togglePreferredState(s)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      form.preferredStates.includes(s)
                        ? "border-[#123d63] bg-[#123d63] text-white"
                        : "border-[#123d63]/20 bg-white/70 text-slate-600 hover:border-[#123d63]/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {form.preferredStates.length > 0 && (
                <p className="mt-2 text-xs text-[#123d63] font-medium">
                  {form.preferredStates.length} state{form.preferredStates.length > 1 ? "s" : ""} selected
                </p>
              )}
            </Field>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              className="btn-orange w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting…" : "Get My College List →"}
            </button>

            <p className="text-center text-xs text-slate-400">
              By submitting, you agree to be contacted by TAB India counsellors.
            </p>
          </div>
        </form>
      </section>

      {/* ── Why TAB India ── */}
      <section className="bg-brand-gradient py-14 px-4 text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="headline text-center text-3xl font-black sm:text-4xl mb-10 fade-up">
            Why Choose <span className="text-[#ffb06d]">TAB India?</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-3 fade-up-1">
            {[
              { icon: "🎯", title: "Accurate College Matching", body: "Based on real NEET 2025 data covering 600+ medical colleges across state & central quotas." },
              { icon: "🧑‍🏫", title: "Expert Counsellors", body: "Our team of NEET counselling experts guides you through every round of counselling — state & AIQ." },
              { icon: "🆓", title: "100% Free Session", body: "No hidden charges. Book a free one-on-one session with our expert and plan your admission strategy." },
            ].map((f) => (
              <div key={f.title} className="rounded-3xl border border-white/10 bg-white/8 p-6">
                <p className="text-3xl mb-3">{f.icon}</p>
                <p className="font-bold text-sm mb-2">{f.title}</p>
                <p className="text-xs leading-5 text-slate-300">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── Sub-components ─── */

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#123d63]/10 glass-panel px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <img src="/brand/logo.png" alt="TAB India" className="h-10 w-auto object-contain" />
        <a
          href="tel:+919311483555"
          className="flex items-center gap-1.5 rounded-2xl bg-brand-orange-gradient px-4 py-2 text-xs font-bold text-white shadow"
          style={{ backgroundImage: "linear-gradient(135deg, #ff9155 0%, #f26430 60%, #e0481a 100%)" }}
        >
          <PhoneIcon /> +91 93114 83555
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#123d63]/10 bg-[#0a2844] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center">
            <img src="/brand/logo.png" alt="TAB India" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <p className="font-bold text-sm">TAB India</p>
            <p className="text-xs text-slate-400">Expert NEET Counselling</p>
          </div>
        </div>
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>C-190, Vivek Vihar, Delhi — 110095</p>
          <p>
            <a href="tel:+919311483555" className="hover:text-white transition-colors">+91 93114 83555</a>
          </p>
        </div>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} TAB India. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[#123d63]/10" />
      <p className="text-[0.65rem] font-black uppercase tracking-[.3em] text-[#f26430]">{children}</p>
      <div className="h-px flex-1 bg-[#123d63]/10" />
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {hint && <p className="text-[0.65rem] text-slate-400 mb-1.5 -mt-1">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
