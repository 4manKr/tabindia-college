import { useState, useRef } from "react";

/* ─── webhook ─── */
const WEBHOOK = import.meta.env.VITE_SHEETS_URL as string | undefined;

/* ─── AIQ categories ─── */
const CENTRAL_CATEGORIES = ["General / UR", "OBC-NCL", "SC", "ST", "EWS", "PWD / PH"];

/* ─── courses ─── */
const COURSES = ["MBBS", "BDS", "BAMS", "BHMS", "BUMS", "BVSc", "B.Sc Nursing", "Other"];

/* ─── budget options ─── */
const BUDGETS = [
  "Under ₹5 Lakh / Year",
  "₹5 – ₹10 Lakh / Year",
  "₹10 – ₹20 Lakh / Year",
  "₹20 – ₹50 Lakh / Year",
  "₹50 Lakh+ / Year",
  "Government College Only",
];

/* ─── states by region ─── */
const REGIONS: { label: string; emoji: string; states: string[] }[] = [
  {
    label: "North India",
    emoji: "🏔️",
    states: [
      "Chandigarh", "Delhi", "Haryana", "Himachal Pradesh",
      "Jammu & Kashmir", "Ladakh", "Punjab", "Rajasthan",
      "Uttar Pradesh", "Uttarakhand",
    ],
  },
  {
    label: "Central & West India",
    emoji: "🌾",
    states: [
      "Chhattisgarh", "Dadra & Nagar Haveli & Daman & Diu",
      "Goa", "Gujarat", "Madhya Pradesh", "Maharashtra",
    ],
  },
  {
    label: "South India",
    emoji: "🌴",
    states: [
      "Andhra Pradesh", "Karnataka", "Kerala",
      "Lakshadweep", "Puducherry", "Tamil Nadu", "Telangana",
    ],
  },
  {
    label: "East & North-East India",
    emoji: "🌿",
    states: [
      "Andaman & Nicobar Islands", "Arunachal Pradesh", "Assam",
      "Bihar", "Jharkhand", "Manipur", "Meghalaya", "Mizoram",
      "Nagaland", "Odisha", "Sikkim", "Tripura", "West Bengal",
    ],
  },
];

const ALL_STATES = [...REGIONS.flatMap((r) => r.states)].sort((a, b) => a.localeCompare(b));

/* ─── floating hero background words ─── */
const BG_WORDS: {
  text: string; fontSize: string; top: string; left: string;
  anim: string; dur: string; delay: string; op: number;
}[] = [
  { text: "MBBS",        fontSize: "7rem",  top: "8%",  left: "2%",  anim: "floatA", dur: "7s",   delay: "0s",   op: 0.16  },
  { text: "BDS",         fontSize: "4rem",  top: "60%", left: "1%",  anim: "floatC", dur: "9s",   delay: "1.2s", op: 0.13  },
  { text: "NEET",        fontSize: "5rem",  top: "15%", left: "72%", anim: "floatB", dur: "8s",   delay: "0.5s", op: 0.14  },
  { text: "MCC",         fontSize: "3.5rem",top: "70%", left: "78%", anim: "floatD", dur: "6s",   delay: "2s",   op: 0.13  },
  { text: "AIQ",         fontSize: "4.5rem",top: "40%", left: "88%", anim: "floatA", dur: "10s",  delay: "0.8s", op: 0.12  },
  { text: "BAMS",        fontSize: "3rem",  top: "78%", left: "35%", anim: "floatB", dur: "7.5s", delay: "1.8s", op: 0.11  },
  { text: "Medical",     fontSize: "3.8rem",top: "5%",  left: "38%", anim: "floatC", dur: "11s",  delay: "0.3s", op: 0.10  },
  { text: "BHMS",        fontSize: "2.8rem",top: "50%", left: "55%", anim: "floatD", dur: "8.5s", delay: "2.5s", op: 0.10  },
  { text: "Doctor",      fontSize: "5.5rem",top: "30%", left: "-2%", anim: "floatB", dur: "9.5s", delay: "1s",   op: 0.12  },
  { text: "Counselling", fontSize: "2.5rem",top: "85%", left: "58%", anim: "floatA", dur: "12s",  delay: "3s",   op: 0.10  },
  { text: "State Quota", fontSize: "2.2rem",top: "22%", left: "52%", anim: "floatC", dur: "10s",  delay: "1.5s", op: 0.09  },
  { text: "MBBS",        fontSize: "4rem",  top: "88%", left: "10%", anim: "floatD", dur: "8s",   delay: "0.7s", op: 0.11  },
];

/* ─── types ─── */
type Step1 = { name: string; phone: string };
type Step1Errors = { name?: string; phone?: string };

type Step2 = {
  estimatedRank: string;
  preferredCourse: string;
  domicileState: string;
  educationState: string;
  domicileCategory: string;
  centralCategory: string;
  budget: string;
  preferredStates: string[];
};
type Step2Errors = {
  estimatedRank?: string;
  preferredCourse?: string;
  domicileState?: string;
  educationState?: string;
  domicileCategory?: string;
  centralCategory?: string;
  budget?: string;
  preferredStates?: string;
};

const EMPTY1: Step1 = { name: "", phone: "" };
const EMPTY2: Step2 = {
  estimatedRank: "", preferredCourse: "",
  domicileState: "", educationState: "",
  domicileCategory: "", centralCategory: "",
  budget: "", preferredStates: [],
};

/* ════════════════════════════════════════════════ icons ══ */
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

/* ════════════════════════════════════════════════ main ══ */
export default function CollegePredictorPage() {
  const [step, setStep]       = useState<1 | 2 | "done">(1);
  const [s1, setS1]           = useState<Step1>(EMPTY1);
  const [s1Err, setS1Err]     = useState<Step1Errors>({});
  const [s2, setS2]           = useState<Step2>(EMPTY2);
  const [s2Err, setS2Err]     = useState<Step2Errors>({});
  const [loading, setLoading] = useState(false);
  const formRef               = useRef<HTMLDivElement>(null);

  /* helpers */
  function setF1(k: keyof Step1, v: string) {
    setS1((p) => ({ ...p, [k]: v }));
    setS1Err((e) => ({ ...e, [k]: "" }));
  }
  function setF2(k: keyof Step2Errors, v: string) {
    setS2((p) => ({ ...p, [k]: v }));
    setS2Err((e) => ({ ...e, [k]: "" }));
  }
  function toggleState(st: string) {
    setS2((p) => ({
      ...p,
      preferredStates: p.preferredStates.includes(st)
        ? p.preferredStates.filter((x) => x !== st)
        : [...p.preferredStates, st],
    }));
    setS2Err((e) => ({ ...e, preferredStates: "" }));
  }

  function post(payload: object) {
    if (!WEBHOOK) return;
    fetch(WEBHOOK, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  /* ── Step 1 submit → record lead → advance ── */
  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    const err: Step1Errors = {};
    if (!s1.name.trim())                      err.name  = "Name is required.";
    if (!/^[6-9]\d{9}$/.test(s1.phone))      err.phone = "Enter a valid 10-digit mobile number.";
    setS1Err(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    post({ type: "college-lead", name: s1.name.trim(), phone: s1.phone.trim(), submittedAt: new Date().toISOString() });
    await new Promise((r) => setTimeout(r, 400)); // brief pause for UX
    setLoading(false);
    setStep(2);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  /* ── Step 2 submit → record full details ── */
  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    const err: Step2Errors = {};
    const score = Number(s2.estimatedRank);
    if (!s2.estimatedRank || isNaN(score) || score < 1 || score > 720)
      err.estimatedRank = "Enter a valid NEET score (1 – 720).";
    if (!s2.domicileState)    err.domicileState    = "Select your domicile state.";
    if (!s2.educationState)   err.educationState   = "Select your education state.";
    if (!s2.domicileCategory) err.domicileCategory = "Enter your state quota category.";
    if (!s2.centralCategory)  err.centralCategory  = "Select your AIQ category.";
    if (!s2.budget)           err.budget           = "Select a budget range.";
    if (s2.preferredStates.length === 0) err.preferredStates = "Select at least one preferred state.";
    setS2Err(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    post({
      type: "college-predictor",
      name: s1.name.trim(), phone: s1.phone.trim(),
      estimatedRank: score,
      preferredCourse: s2.preferredCourse,
      domicileState: s2.domicileState, educationState: s2.educationState,
      domicileCategory: s2.domicileCategory, centralCategory: s2.centralCategory,
      budget: s2.budget,
      preferredStates: s2.preferredStates.join(", "),
      submittedAt: new Date().toISOString(),
    });
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setStep("done");
  }

  /* ── success screen ── */
  if (step === "done") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="modal-pop card max-w-md w-full p-8 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckIcon />
            </div>
            <h2 className="headline text-2xl font-black text-[#0a2844]">We've Got Your Details!</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Our counselling experts will analyse your score, domicile &amp; preferences and
              call you shortly with a personalised college list.
            </p>
            <p className="mt-5 text-sm font-semibold text-[#123d63]">Or call us directly:</p>
            <a href="tel:+919311483555"
              className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-[#f26430] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#e0481a] transition-colors">
              <PhoneIcon /> +91 93114 83555
            </a>
            <button onClick={() => { setS1(EMPTY1); setS2(EMPTY2); setStep(1); }}
              className="mt-4 block w-full text-xs text-slate-400 hover:text-slate-600 transition-colors">
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

      {/* ══ Hero ══ */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-20 text-white"
        style={{ background: "linear-gradient(155deg, #061e35 0%, #0a2844 35%, #123d63 70%, #0d3558 100%)" }}>

        {/* blobs */}
        <div className="hero-blob" style={{ width:"520px",height:"520px",top:"-140px",right:"-100px",
          background:"radial-gradient(circle,rgba(18,90,138,.55) 0%,rgba(10,40,68,0) 70%)",
          animationDelay:"0s",animationDuration:"8s" }} />
        <div className="hero-blob" style={{ width:"400px",height:"400px",bottom:"-80px",left:"-60px",
          background:"radial-gradient(circle,rgba(26,60,100,.5) 0%,rgba(6,30,53,0) 70%)",
          animationDelay:"3s",animationDuration:"10s" }} />
        <div className="hero-blob" style={{ width:"300px",height:"300px",top:"30%",left:"40%",
          background:"radial-gradient(circle,rgba(242,100,48,.08) 0%,transparent 70%)",
          animationDelay:"1.5s",animationDuration:"7s" }} />

        {/* floating words */}
        {BG_WORDS.map((w, i) => (
          <span key={i} className="hero-bg-word"
            style={{ fontSize:w.fontSize, top:w.top, left:w.left, "--op":w.op, opacity:w.op,
              animation:`${w.anim} ${w.dur} ${w.delay} ease-in-out infinite` } as React.CSSProperties}>
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
            <span className="text-[#ffb06d]"> College</span>
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg max-w-xl mx-auto">
            Enter your NEET score, domicile &amp; preferences — our experts will
            match you with the right colleges across state &amp; central quotas.
          </p>

          {/* ── Inline Step-1 form in hero ── */}
          {step === 1 && (
            <form onSubmit={handleStep1} noValidate className="mt-8 w-full max-w-xl mx-auto fade-up-1">
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 text-left">
                  <div>
                    <label className="block text-[0.68rem] font-bold uppercase tracking-[.2em] text-white/60 mb-1.5">Full Name *</label>
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/35 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f26430]/70 focus:border-[#f26430]/70 transition-all"
                      placeholder="Your full name"
                      value={s1.name} onChange={(e) => setF1("name", e.target.value)} />
                    {s1Err.name && <p className="mt-1 text-xs text-red-400">{s1Err.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[0.68rem] font-bold uppercase tracking-[.2em] text-white/60 mb-1.5">Mobile Number *</label>
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/35 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f26430]/70 focus:border-[#f26430]/70 transition-all"
                      type="tel" placeholder="10-digit mobile number"
                      value={s1.phone} maxLength={10}
                      onChange={(e) => setF1("phone", e.target.value.replace(/\D/g, ""))} />
                    {s1Err.phone && <p className="mt-1 text-xs text-red-400">{s1Err.phone}</p>}
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="btn-orange w-full disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? "Please wait…" : "Get My College List →"}
                </button>
                <p className="text-center text-[0.65rem] text-white/40">
                  By continuing, you agree to be contacted by TAB India counsellors.
                </p>
              </div>
            </form>
          )}

          {/* ── After step 1: phone link ── */}
          {step === 2 && (
            <div className="mt-8 flex items-center justify-center">
              <a href="tel:+919311483555"
                className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors">
                <PhoneIcon /> +91 93114 83555
              </a>
            </div>
          )}
        </div>

        <div className="relative mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4 sm:gap-8 fade-up-1">
          {[
            { v: "2,800+", l: "Colleges" },
            { v: "AIQ+State", l: "Quota Coverage" },
            { v: "Expert", l: "Counselling Support" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="headline text-2xl font-black text-[#ffb06d] sm:text-3xl">{s.v}</p>
              <p className="mt-0.5 text-xs text-slate-300">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ Form (Step 2 only) ══ */}
      <section ref={formRef} className="mx-auto w-full max-w-2xl px-4 py-6">

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <div className="mb-4 text-center fade-up">
              <h2 className="headline text-2xl font-black text-[#0a2844] sm:text-3xl">
                Hi {s1.name.split(" ")[0]}! 👋
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Fill in your details and we'll build your personalised college list.
              </p>
            </div>
            <form onSubmit={handleStep2} noValidate>
              <div className="card p-4 sm:p-6 space-y-4 fade-up-1">

                {/* NEET Score */}
                <SectionTitle>NEET Score &amp; Course</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Estimated NEET Score * (1 – 720)" error={s2Err.estimatedRank}>
                    <input className="input-field" type="number" min={1} max={720} placeholder="e.g. 550"
                      value={s2.estimatedRank} onChange={(e) => setF2("estimatedRank", e.target.value)} />
                  </Field>
                  <Field label="Preferred Course">
                    <select className="input-field" value={s2.preferredCourse}
                      onChange={(e) => setF2("preferredCourse", e.target.value)}>
                      <option value="">Select course</option>
                      {COURSES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>

                {/* Domicile, Category & Education */}
                <SectionTitle>Domicile, Category &amp; Education</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Home / Domicile State *" hint="State of permanent residence" error={s2Err.domicileState}>
                    <select className="input-field" value={s2.domicileState}
                      onChange={(e) => setF2("domicileState", e.target.value)}>
                      <option value="">Select state</option>
                      {ALL_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="State Quota Category *" hint="e.g. General, OBC, SC, ST, EWS, PWD" error={s2Err.domicileCategory}>
                    <input className="input-field" placeholder="Type your category"
                      value={s2.domicileCategory} onChange={(e) => setF2("domicileCategory", e.target.value)} />
                  </Field>
                  <Field label="AIQ / Central Quota Category *" hint="For MCC All India Quota counselling" error={s2Err.centralCategory}>
                    <select className="input-field" value={s2.centralCategory}
                      onChange={(e) => setF2("centralCategory", e.target.value)}>
                      <option value="">Select category</option>
                      {CENTRAL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Education State *" hint="State where you appeared for Class 12" error={s2Err.educationState}>
                    <select className="input-field" value={s2.educationState}
                      onChange={(e) => setF2("educationState", e.target.value)}>
                      <option value="">Select state</option>
                      {ALL_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>

                {/* Budget */}
                <SectionTitle>Budget</SectionTitle>
                <Field label="Annual Fee Budget *" error={s2Err.budget}>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {BUDGETS.map((b) => (
                      <button key={b} type="button" onClick={() => setF2("budget", b)}
                        className={`rounded-xl border px-2.5 py-2 text-xs font-semibold text-left transition-all ${
                          s2.budget === b
                            ? "border-[#f26430] bg-[#fff4e7] text-[#e0481a]"
                            : "border-[#123d63]/15 bg-white/60 text-slate-600 hover:border-[#f26430]/50"}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                  {s2Err.budget && <p className="mt-1 text-xs text-red-600">{s2Err.budget}</p>}
                </Field>

                {/* Preferred States — 4 region boxes */}
                <SectionTitle>Preferred States for College</SectionTitle>
                {s2Err.preferredStates && (
                  <p className="text-xs text-red-600 -mt-2">{s2Err.preferredStates}</p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {REGIONS.map((region) => (
                    <div key={region.label}
                      className="rounded-2xl border border-[#123d63]/10 bg-white/60 p-3">
                      <p className="mb-2 text-[0.6rem] font-black uppercase tracking-[.2em] text-[#123d63] flex items-center gap-1">
                        <span>{region.emoji}</span> {region.label}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {region.states.map((st) => (
                          <button key={st} type="button" onClick={() => toggleState(st)}
                            className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold transition-all ${
                              s2.preferredStates.includes(st)
                                ? "border-[#123d63] bg-[#123d63] text-white"
                                : "border-[#123d63]/20 bg-white/70 text-slate-600 hover:border-[#123d63]/50"}`}>
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {s2.preferredStates.length > 0 && (
                  <p className="text-xs text-[#123d63] font-medium -mt-2">
                    {s2.preferredStates.length} state{s2.preferredStates.length > 1 ? "s" : ""} selected
                  </p>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="btn-orange w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? "Submitting…" : "Get My College List →"}
                </button>
                <p className="text-center text-xs text-slate-400">
                  By submitting, you agree to be contacted by TAB India counsellors.
                </p>
              </div>
            </form>
          </>
        )}
      </section>

      {/* ══ Why TAB India ══ */}
      <section className="bg-brand-gradient py-14 px-4 text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="headline text-center text-3xl font-black sm:text-4xl mb-10 fade-up">
            Why Choose <span className="text-[#ffb06d]">TAB India?</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-3 fade-up-1">
            {[
              { icon: "🎯", title: "Accurate College Matching",  body: "Based on real NEET 2025 data covering 2,800+ colleges across state & central quotas." },
              { icon: "🧑‍🏫", title: "Expert Counsellors",       body: "Our team guides you through every round of counselling — state & AIQ — so you never miss a seat." },
              { icon: "🤝", title: "Personalised Guidance",        body: "Get a dedicated one-on-one session with our experts and build a clear MBBS admission strategy." },
            ].map((f) => (
              <div key={f.title} className="rounded-3xl border border-white/10 p-6" style={{ background:"rgba(255,255,255,0.08)" }}>
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

/* ════════════════════════════════════════════════ sub-components ══ */
function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#123d63]/10 glass-panel px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <img src="/brand/logo.png" alt="TAB India" className="h-10 w-auto object-contain" />
        <a href="tel:+919311483555"
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold text-white shadow"
          style={{ backgroundImage:"linear-gradient(135deg,#ff9155 0%,#f26430 60%,#e0481a 100%)" }}>
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
          <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white flex items-center justify-center">
            <img src="/brand/logo.png" alt="TAB India" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <p className="font-bold text-sm">TAB India</p>
            <p className="text-xs text-slate-400">Expert NEET Counselling</p>
          </div>
        </div>
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>C-190, Vivek Vihar, Delhi — 110095</p>
          <p><a href="tel:+919311483555" className="hover:text-white transition-colors">+91 93114 83555</a></p>
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} TAB India. All rights reserved.</p>
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

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode;
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
