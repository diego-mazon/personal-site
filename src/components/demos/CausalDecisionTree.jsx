import React, { useState } from "react";
import { ChevronRight, ArrowLeft, RotateCcw, Circle, GitBranch } from "lucide-react";

const TREE = {
  q_random: {
    type: "question",
    text: "Can you assign treatment randomly?",
    options: [
      { label: "Yes, I can randomize", next: "q_level" },
      { label: "No, I can't randomize", next: "q_iv" },
    ],
  },
  q_level: {
    type: "question",
    text: "At what level can you randomize?",
    options: [
      { label: "Individual or cluster (group, store, market...)", next: "r_rct" },
      { label: "Time blocks: the same unit alternates between treatment and control", next: "r_switchback" },
    ],
  },
  r_rct: {
    type: "result",
    category: "experimental",
    estimator: "Difference in means (+ ANCOVA / CUPED)",
    title: "RCT / A-B Test",
    assumption:
      "Randomization guarantees balance in observable and unobservable covariates between groups.",
    whenToUse: "You can directly control treatment assignment.",
    limitation:
      "Cost and time to implement. Watch out for SUTVA violations (network effects in marketplaces or ads).",
    note: "Apply ANCOVA (regressing the outcome on the treatment indicator + pre-treatment covariates) to reduce variance at no extra cost. CUPED is a special case of this same principle, using the pre-period metric as the covariate.",
  },
  r_switchback: {
    type: "result",
    category: "experimental",
    tag: "Carryover risk",
    estimator: "TWFE (unit and time fixed effects)",
    title: "RCT — Switchback (time blocks)",
    assumption:
      "The same unit randomly alternates between treatment and control across successive time blocks: D ⊥ (Y(1),Y(0)) still holds, but now at the unit-period level.",
    whenToUse:
      "Randomizing at the individual level isn't feasible (e.g. two-sided marketplaces, pricing, logistics), but you can alternate treatment over time for the same unit.",
    limitation:
      "Carryover: one period's treatment can contaminate the next because it's the same unit. Requires washout periods between blocks and standard errors clustered at the time-block level, or the effect is biased and the SEs understated.",
    note: "Analyzed as a panel — the same estimator (TWFE) as DiD and Fixed Effects — but here D_it is randomized, not observed or assumed. That's why it stays experimental, not quasi-experimental, even though it shares a formula with them.",
  },
  q_iv: {
    type: "question",
    text: "Is there a valid instrumental variable? (affects treatment but not the outcome, except through it)",
    options: [
      { label: "Yes, I have a valid instrument", next: "r_iv" },
      { label: "No, I don't have a clear instrument", next: "q_cutoff" },
    ],
  },
  r_iv: {
    type: "result",
    category: "quasi",
    estimator: "2SLS",
    title: "Instrumental Variables (IV / 2SLS)",
    assumption:
      "Exclusion restriction: the instrument only affects the outcome through the treatment.",
    whenToUse:
      "There's a source of exogenous variation in treatment (policy, lottery, distance, etc.).",
    limitation:
      "Weak instruments bias the estimates; the exclusion restriction isn't directly testable, only arguable.",
    source:
      "Angrist (1990): the Vietnam draft lottery number, as an instrument for military service.\nAngrist & Krueger (1991): quarter of birth as an instrument for years of schooling (compulsory schooling laws).",
    note: "Fuzzy RDD uses this same estimator (2SLS): crossing the threshold acts as an instrument for actual treatment receipt. Same estimator, different source of variation.",
  },
  q_cutoff: {
    type: "question",
    text: "Is there a threshold or cutoff rule that determines treatment?",
    options: [
      { label: "Yes, there's a clear cutoff", next: "q_compliance" },
      { label: "No cutoff", next: "q_time" },
    ],
  },
  q_compliance: {
    type: "question",
    text: "Is the cutoff rule strictly followed, or is there partial non-compliance?",
    options: [
      { label: "Strict compliance: all units receive treatment exactly as the threshold dictates", next: "r_rdd_sharp" },
      { label: "Partial non-compliance: some units don't follow the rule", next: "r_rdd_fuzzy" },
    ],
  },
  r_rdd_sharp: {
    type: "result",
    category: "quasi",
    estimator: "Local polynomial regression",
    title: "Regression Discontinuity — Sharp RDD",
    assumption: "Continuity of potential outcomes around the threshold.",
    whenToUse:
      "Assignment depends on a continuous variable (running variable) with a clear cutoff, and all units comply.",
    limitation:
      "Only identifies a local effect (LATE) near the threshold; low power if there are few observations near the cutoff.",
    source:
      "Thistlethwaite & Campbell (1960): the National Merit Scholarship cutoff score — the original RDD paper.\nLee (2008): U.S. House elections decided by a narrow vote-share margin, used to study incumbency effects.",
    note: "Z = 1{X≥c} is the same deterministic crossing indicator in sharp and fuzzy RDD — it's never what's 'fuzzy'. Here D_i = Z_i exactly, so there's no first stage to speak of (π̂₁=1) and the reduced-form jump in Y at c is already τ̂, with nothing to divide by.",
  },
  r_rdd_fuzzy: {
    type: "result",
    category: "quasi",
    tag: "Shares estimator with IV",
    estimator: "2SLS (local IV)",
    title: "Regression Discontinuity — Fuzzy RDD",
    assumption:
      "Continuity of potential outcomes around the threshold + crossing the threshold predicts treatment probability (relevance), like an instrument.",
    whenToUse:
      "There's a threshold, but compliance is imperfect: some units don't receive the treatment they're 'supposed to' get according to the cutoff.",
    limitation:
      "Inherits IV's limitations (weak instrument if the jump in treatment probability is small) plus RDD's (only local LATE).",
    source:
      "Angrist & Lavy (1999): 'Maimonides' Rule' — enrollment thresholds that trigger an extra class split (max 40 students), not perfectly enforced.\nvan der Klaauw (2002): financial-aid offers based on a threshold index that shifted admission probability without fully determining it.",
    note: "It's literally a local IV: crossing the threshold instruments actual treatment receipt. That's why it shares an estimator (2SLS) with Instrumental Variables, even though the source of variation — a cutoff, not an external instrument — is different. Sharp vs. fuzzy is a compliance distinction, not a difference in Z: here D_i ≠ Z_i (some units above c go untreated, some below get treated anyway), so π̂₁<1 and τ̂ needs the ratio γ̂₁/π̂₁ instead of reading the jump off directly.",
  },
  q_time: {
    type: "question",
    text: "Do you have measurements over time, before and after the intervention?",
    options: [
      { label: "Yes, I have a pre/post time series", next: "q_control" },
      { label: "No, I only have a cross-sectional snapshot", next: "q_confound" },
    ],
  },
  q_control: {
    type: "question",
    text: "Do you have comparison units with a different level or timing of treatment exposure, in those same periods?",
    options: [
      { label: "Yes, I have comparison units", next: "q_ttype" },
      { label: "No, I only have the treated unit's own series", next: "r_its" },
    ],
  },
  r_its: {
    type: "result",
    category: "quasi",
    tag: "No control group",
    estimator: "Segmented trend regression (level + slope)",
    title: "Interrupted Time Series",
    assumption:
      "The pre-intervention trend (level and slope) reasonably defines the post-intervention counterfactual.",
    whenToUse:
      "Long time series, with a clear intervention point, with no comparison unit available.",
    limitation:
      "Vulnerable to concurrent shocks unrelated to the treatment — it's the weakest identification among quasi-experimental designs, precisely because it lacks a control group.",
    note: "It differs from a simple pre-post design in that ITS uses multiple time points before and after (not just one on each side) to explicitly model the trend's level and slope, separating the treatment effect from a pre-existing trend. A single-measurement pre-post can't distinguish the treatment effect from the natural trend or from regression to the mean.",
  },
  q_ttype: {
    type: "question",
    text: "Is the treatment a discrete event at a single point in time, or continuous / variable-intensity across the panel?",
    options: [
      { label: "Discrete event, at a single point in time", next: "q_nunits" },
      { label: "Continuous or variable-intensity", next: "r_fe" },
    ],
  },
  r_fe: {
    type: "result",
    category: "quasi",
    tag: "With control group",
    estimator: "TWFE (unit and time fixed effects)",
    title: "Fixed Effects (Unit and Time Fixed Effects)",
    assumption:
      "Strict exogeneity conditional on unit and time fixed effects: no confounders vary over time and correlate with the treatment level, beyond common shocks already absorbed by the time effects.",
    whenToUse:
      "Panel with many periods and a continuous or variable-intensity treatment (dose, spend, exposure), not a single binary event.",
    limitation:
      "Doesn't correct for confounders that vary over time at the unit level. With variable treatment intensity and heterogeneous effects, TWFE can misweight some comparisons — the same weighting problem that affects staggered DiD.",
    source:
      "Duflo (2001): Indonesia's INPRES school-construction program, whose intensity varied by region and birth cohort.\nCurrie & Gruber (1996): state-level Medicaid eligibility expansions, varying in scope and timing, and their effect on child health.",
    note: "DiD is, formally, a special case of Fixed Effects with binary treatment in two periods: they share the same fixed-effects regression estimator (TWFE).",
  },
  q_nunits: {
    type: "question",
    text: "How many treated units are there?",
    options: [
      { label: "One or few, with a good donor pool", next: "r_scm" },
      { label: "Many, with plausible parallel trends", next: "r_did" },
    ],
  },
  r_scm: {
    type: "result",
    category: "quasi",
    tag: "With control group",
    estimator: "Synthetic weights (convex optimization)",
    title: "Synthetic Control Method",
    assumption:
      "A weighted combination of control units closely replicates the treated unit's pre-treatment trajectory.",
    whenToUse:
      "Few treated units (sometimes just one), with long time series and several potential control units.",
    limitation:
      "Statistical inference requires placebo tests; sensitive to the quality of the pre-treatment fit.",
    note: "Can be combined with DiD (Synthetic DiD, Arkhangelsky et al. 2021) to gain robustness against partial violations of parallel trends.",
  },
  r_did: {
    type: "result",
    category: "quasi",
    tag: "With control group",
    estimator: "TWFE (unit and time fixed effects)",
    title: "Difference-in-Differences",
    assumption: "Parallel trends between treated and control groups in the absence of treatment.",
    whenToUse: "Panel with several units and periods, and a reasonable control group.",
    limitation:
      "Classic TWFE is biased if treatment is staggered: use Callaway & Sant'Anna (2021) or Sun & Abraham (2021).",
    source:
      "Card & Krueger (1994): New Jersey's minimum wage increase vs. neighboring Pennsylvania (no change), fast-food employment.\nCard (1990): the Mariel Boatlift — a sudden surge of Cuban immigrants to Miami, compared to other cities.",
  },
  q_confound: {
    type: "question",
    text: "Are all confounding variables observable? (selection on observables)",
    options: [
      { label: "Yes, I can measure them all", next: "q_dim" },
      { label: "No, I suspect unobserved confounding", next: "r_reconsider" },
    ],
  },
  q_dim: {
    type: "question",
    text: "Do you have high-dimensional covariates?",
    options: [
      { label: "Yes, many covariates", next: "r_psm" },
      { label: "No, few known covariates", next: "r_match" },
    ],
  },
  r_psm: {
    type: "result",
    category: "observational",
    estimator: "Weighting / propensity matching / ML",
    title: "Propensity Score: Matching / IPW / AIPW / Double ML",
    assumption: "Selection on observables + overlap (common support) between groups.",
    whenToUse:
      "Many observable covariates, and you can reasonably model P(treatment | X).",
    limitation:
      "Doesn't correct for unobserved confounding; sensitive to the propensity model's specification (Double ML partially mitigates this).",
  },
  r_match: {
    type: "result",
    category: "observational",
    estimator: "Distance (Mahalanobis / NN) or OLS (ANCOVA)",
    title: "Distance Matching / Stratified Regression (ANCOVA)",
    assumption: "Selection on observables, with a reasonably known functional relationship.",
    whenToUse: "Few key covariates, and you want direct, interpretable comparability.",
    limitation:
      "Curse of dimensionality with many covariates; extrapolation outside common support.",
  },
  r_reconsider: {
    type: "result",
    category: "caution",
    estimator: "— (sensitivity analysis / bounds)",
    title: "Unobserved confounding: reconsider the design",
    assumption: "—",
    whenToUse: "No observable-adjustment method is valid if there are unmeasured confounders.",
    limitation:
      "Go back and look for an instrument, a discontinuity, or a panel design. If that's not possible, at least run a sensitivity analysis (Rosenbaum bounds) to quantify how much unobserved confounding would be needed to invalidate the result.",
  },
};

const RESULT_IDS = [
  "r_rct", "r_switchback", "r_iv", "r_rdd_sharp", "r_rdd_fuzzy", "r_its",
  "r_fe", "r_scm", "r_did", "r_psm", "r_match", "r_reconsider",
];

const ESTIMATORS = [
  {
    name: "Difference in means / ANCOVA",
    designs: "RCT (precision) · Selection on observables (identification)",
    description: "Compares means between groups; ANCOVA adds covariates to reduce variance (RCT) or to try to close identification (observational).",
    formula: "τ = Ȳ_treat − Ȳ_control\nY_i = β0 + τ·D_i + γ·X_i + ε_i",
  },
  {
    name: "2SLS",
    designs: "IV · Fuzzy RDD (threshold crossing as instrument)",
    description: "Uses the portion of D predicted by instrument Z (clean of confounding) to estimate the effect on Y.",
    formula: "1st stage: D_i = π0 + π1·Z_i + η_i\n2nd stage: Y_i = β0 + τ·D̂_i + ε_i\nWald: τ = Cov(Y,Z) / Cov(D,Z)",
  },
  {
    name: "Local polynomial regression",
    designs: "Sharp RDD",
    description: "Fits a regression (or local kernel) on each side of the threshold and measures the jump right at the cutoff.",
    formula: "τ = lim(x→c⁺) E[Y|X=x] − lim(x→c⁻) E[Y|X=x]",
  },
  {
    name: "TWFE (fixed effects)",
    designs: "DiD · Fixed Effects (continuous/variable-intensity treatment) · RCT-Switchback (time-block randomization)",
    description: "Absorbs everything constant by unit (α_i) and by period (λ_t); τ is identified from the remaining within-unit variation.",
    formula: "Y_it = α_i + λ_t + τ·D_it + ε_it",
  },
  {
    name: "Synthetic weights",
    designs: "Synthetic Control (combinable with DiD → Synthetic DiD)",
    description: "Builds a counterfactual as a weighted combination of control units that replicates the treated unit's pre-trend.",
    formula: "min_w Σ(X₁ − Σⱼ wⱼXⱼ)²  s.t. wⱼ≥0, Σwⱼ=1\nτ_t = Y₁ₜ − Σⱼ wⱼYⱼₜ",
  },
  {
    name: "Matching / IPW / AIPW / Double ML",
    designs: "Selection on observables (combinable with DiD → conditional DiD, or with RCT for precision)",
    description: "Reweight or match units by their propensity score e(X) to simulate balance between groups.",
    formula: "e(X) = P(D=1 | X)\nIPW: τ = (1/n)Σ[ D·Y/e(X) − (1−D)·Y/(1−e(X)) ]",
  },
  {
    name: "Segmented trend regression",
    designs: "Interrupted Time Series",
    description: "Models level and slope before and after the intervention point within the series itself.",
    formula: "Y_t = β0 + β1·t + β2·D_t + β3·(t−t0)·D_t + ε_t",
  },
];

const DESIGNS = [
  {
    name: "RCT — Randomization",
    description: "Treatment is assigned via a random mechanism, independent of potential outcomes.",
    formula: "D ⊥ (Y(1), Y(0))\nATE = E[Y|D=1] − E[Y|D=0]",
  },
  {
    name: "RCT — Switchback",
    description: "Randomization in time blocks: the same unit alternates between treatment and control. Still D ⊥ (Y(1),Y(0)), but now the mechanism operates over periods, not units — introducing carryover that classic RCTs don't have.",
    formula: "D_it ⊥ (Y_it(1),Y_it(0)) | i\nY_it = α_i + λ_t + τ·D_it + ε_it",
  },
  {
    name: "IV — Instrumental Variable",
    description: "There's a Z that moves D (relevance) but doesn't affect Y except through D (exclusion restriction).",
    formula: "Cov(Z,D) ≠ 0        Cov(Z,ε) = 0",
  },
  {
    name: "RDD — Discontinuity",
    description: "Treatment changes at a threshold c of a continuous variable (running variable). Sharp: jump from 0 to 1. Fuzzy: partial jump in treatment probability.",
    formula: "Sharp: D_i = 1{X_i ≥ c}\nFuzzy: P(D=1|X) discontinuous at c",
  },
  {
    name: "DiD — Difference-in-Differences",
    description: "Treated and control groups, before and after; the counterfactual assumes their trends would have been parallel.",
    formula: "τ = (Ȳtreat,post − Ȳtreat,pre) − (Ȳcontrol,post − Ȳcontrol,pre)",
  },
  {
    name: "Fixed Effects — Panel",
    description: "Generalizes DiD to continuous or variable-intensity treatment, using within-unit variation over time.",
    formula: "Y_it = α_i + λ_t + τ·D_it + ε_it",
  },
  {
    name: "Synthetic Control",
    description: "For one or a few treated units: the counterfactual is a weighted combination of control units that mimics their pre-trend.",
    formula: "τ_t = Y₁ₜ − Σⱼ wⱼYⱼₜ",
  },
  {
    name: "ITS — Interrupted Time Series",
    description: "A single series, with no comparison unit: the counterfactual comes from projecting its own pre-intervention trend.",
    formula: "Y_t = β0+β1t+β2D_t+β3(t−t0)D_t+ε_t",
  },
  {
    name: "Selection on observables",
    description: "Conditioning on X, treatment is 'as good as' random: no confounding is left unmeasured.",
    formula: "D ⊥ (Y(1),Y(0)) | X\n0 < P(D=1|X) < 1  (overlap)",
  },
];

const TWO_STEP_METHODS = [
  {
    name: "2SLR — Two-Step Linear Regression",
    accent: "cyan",
    problem: "Confounding by known, linear covariates X",
    operation: "Residualize both Y and D on X (Frisch–Waugh–Lovell), then regress residual on residual — symmetric: subtract the projection, keep the residual, for both variables.",
    formula: "Ỹ = Y − X'β̂_Y\nD̃ = D − X'β̂_D\nτ̂ = Cov(Ỹ,D̃) / Var(D̃)",
    requires: "Correct linear functional form for E[Y|X] and E[D|X]. No instrument needed.",
    designs: "Selection on observables (few, known covariates) · RCT with ANCOVA/CUPED — D̃ is trivial since D⊥X by randomization, so only Y gets residualized, purely for variance reduction.",
  },
  {
    name: "2SLS — Two-Stage Least Squares",
    accent: "amber",
    problem: "Confounding by unknown or unobserved factors — X can't fix this, no matter how flexibly you model it",
    operation: "Project D onto the instrument Z, keep the fitted value D̂ — the opposite move from 2SLR: subtract the residual, keep the projection, applied only to D, never to Y.",
    formula: "First stage: D_i = π₀ + π₁Z_i + η_i\nSecond stage: Y_i = β₀ + τD̂_i + ε_i\nSingle instrument: τ̂ = γ̂₁ / π̂₁  (Wald ratio)",
    requires: "A valid instrument: relevance (Cov(Z,D)≠0) + exclusion restriction (Cov(Z,ε)=0).",
    designs: "Instrumental Variables (external Z, whole-sample variation) · Fuzzy RDD (Z=1{X≥c} as a local instrument, only near the cutoff).",
  },
  {
    name: "DML — Double Machine Learning",
    accent: "violet",
    problem: "Confounding by known covariates X that are high-dimensional or whose relationship to Y, D is nonlinear",
    operation: "Same skeleton as 2SLR — residualize both Y and D on X, then residual on residual — but ĝ(X), m̂(X) are fit with flexible learners instead of ordinary least squares, using cross-fitting.",
    formula: "Ỹ = Y − ĝ(X)\nD̃ = D − m̂(X)\nτ̂ = Cov(Ỹ,D̃) / Var(D̃)",
    requires: "Neyman-orthogonal moment condition + K-fold cross-fitting + ‖ĝ−g‖·‖m̂−m‖ = o(n^-1/2).",
    designs: "Selection on observables (high-dim X) · DML-IV / partially linear IV model (X partialled out via DML, then ordinary 2SLS on the residuals — Z̃ still projects, never residualizes against itself) · Doubly-robust DiD · Panel Fixed Effects with high-dim time-varying controls.",
  },
];

const TWO_STEP_ACCENTS = {
  cyan: { text: "text-cyan-300", border: "border-cyan-900/60" },
  amber: { text: "text-amber-300", border: "border-amber-900/60" },
  violet: { text: "text-violet-300", border: "border-violet-900/60" },
};

const CATEGORY_STYLES = {
  experimental: { badge: "bg-cyan-950 text-cyan-300 border-cyan-700", dot: "bg-cyan-400", label: "Experimental" },
  quasi: { badge: "bg-amber-950 text-amber-300 border-amber-700", dot: "bg-amber-400", label: "Quasi-experimental" },
  observational: { badge: "bg-violet-950 text-violet-300 border-violet-700", dot: "bg-violet-400", label: "Observational" },
  caution: { badge: "bg-rose-950 text-rose-300 border-rose-700", dot: "bg-rose-400", label: "Caution" },
};

const MONO = { fontFamily: "'IBM Plex Mono', monospace" };
const DISPLAY = { fontFamily: "'Space Grotesk', sans-serif" };

function MapOutline({ nodeId }) {
  const n = TREE[nodeId];
  if (n.type === "result") {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CATEGORY_STYLES[n.category].dot}`}></span>
        <span className="text-sm text-slate-200">
          {n.title}
          {n.tag && <span className="text-slate-500 text-xs"> — {n.tag}</span>}
        </span>
      </div>
    );
  }
  return (
    <div className="py-1">
      <div className="flex items-start gap-2 text-sm text-slate-400 mb-2">
        <Circle size={9} className="mt-1 text-slate-600 flex-shrink-0" />
        <span>{n.text}</span>
      </div>
      <div className="border-l border-slate-800 pl-4 ml-1 space-y-2.5">
        {n.options.map((opt, i) => (
          <div key={i}>
            <div className="text-[11px] text-slate-500 mb-1" style={MONO}>
              {opt.label}
            </div>
            <MapOutline nodeId={opt.next} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CausalDecisionTree() {
  const [path, setPath] = useState([]);
  const [currentId, setCurrentId] = useState("q_random");
  const node = TREE[currentId];

  function answer(opt) {
    setPath([...path, { nodeId: currentId, label: opt.label }]);
    setCurrentId(opt.next);
  }

  function back() {
    if (path.length === 0) return;
    const last = path[path.length - 1];
    setPath(path.slice(0, -1));
    setCurrentId(last.nodeId);
  }

  function reset() {
    setPath([]);
    setCurrentId("q_random");
  }

  return (
    <div className="min-h-screen bg-slate-950" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <div
            className="flex items-center gap-2 text-cyan-400 text-xs tracking-widest uppercase mb-3"
            style={MONO}
          >
            <GitBranch size={14} />
            Decision Map · Causal Inference
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white leading-tight" style={DISPLAY}>
            Find your method
          </h1>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            The tree first sorts by design — where your causal identification comes from — and
            at the end you'll see which estimator goes with each one. Several designs share an
            estimator.
          </p>
        </div>

        {/* Breadcrumb trace */}
        {path.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-6">
            {path.map((p, i) => (
              <React.Fragment key={i}>
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 border border-cyan-800 text-cyan-300"
                  style={MONO}
                >
                  {p.label}
                </span>
                <ChevronRight size={12} className="text-slate-700 flex-shrink-0" />
              </React.Fragment>
            ))}
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full border ${
                node.type === "result"
                  ? CATEGORY_STYLES[node.category].badge
                  : "bg-slate-900 border-slate-700 text-slate-400"
              }`}
              style={MONO}
            >
              {node.type === "result" ? node.title : "…"}
            </span>
          </div>
        )}

        {/* Main card */}
        {node.type === "question" ? (
          <div className="rounded-xl border-2 border-slate-800 bg-slate-900/60 p-6 sm:p-8 mb-6">
            <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider" style={MONO}>
              Question {path.length + 1}
            </div>
            <h2 className="text-xl sm:text-2xl text-white font-medium mb-6 leading-snug" style={DISPLAY}>
              {node.text}
            </h2>
            <div className="flex flex-col gap-3">
              {node.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answer(opt)}
                  className="group text-left px-5 py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 transition-colors text-slate-100 flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={`rounded-xl border-2 p-6 sm:p-8 mb-6 ${CATEGORY_STYLES[node.category].badge}`}>
            <div className="flex items-center gap-2 flex-wrap text-xs uppercase tracking-wider mb-3" style={MONO}>
              <span className={`w-2 h-2 rounded-full ${CATEGORY_STYLES[node.category].dot}`}></span>
              {CATEGORY_STYLES[node.category].label}
              {node.tag && (
                <span className="border border-current rounded-full px-2 py-0.5 text-[10px] opacity-80 normal-case tracking-normal">
                  {node.tag}
                </span>
              )}
            </div>
            <h2 className="text-2xl text-white font-semibold mb-1.5" style={DISPLAY}>
              {node.title}
            </h2>
            <div className="text-xs text-slate-500 mb-4" style={MONO}>
              Estimator: <span className="text-slate-300">{node.estimator}</span>
            </div>
            {node.assumption !== "—" && (
              <div className="mb-3">
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1" style={MONO}>
                  Key assumption
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{node.assumption}</p>
              </div>
            )}
            <div className="mb-3">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1" style={MONO}>
                When to use it
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{node.whenToUse}</p>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1" style={MONO}>
                Limitation
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{node.limitation}</p>
            </div>
            {node.source && (
              <div className="mt-3">
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1" style={MONO}>
                  Source · classic examples
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{node.source}</p>
              </div>
            )}
            {node.note && (
              <div className="mt-4 pt-4 border-t border-slate-700/60">
                <p className="text-slate-400 text-sm italic">{node.note}</p>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3 mb-12">
          {path.length > 0 && (
            <button
              onClick={back}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Full map */}
        <div className="mb-12 pt-8 border-t border-slate-800">
          <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2" style={MONO}>
            Full map
          </div>
          <h3 className="text-lg text-white font-medium mb-4" style={DISPLAY}>
            Every branch of the tree
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
            {Object.entries(CATEGORY_STYLES).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${val.dot}`}></span>
                {val.label}
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <MapOutline nodeId="q_random" />
          </div>
        </div>

        {/* Reference sheet */}
        <div className="mb-12 pt-8 border-t border-slate-800">
          <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2" style={MONO}>
            Reference sheet
          </div>
          <h3 className="text-lg text-white font-medium mb-4" style={DISPLAY}>
            All {RESULT_IDS.length} methods at a glance
          </h3>
          <div className="space-y-3">
            {RESULT_IDS.map((id) => {
              const n = TREE[id];
              return (
                <div key={id} className={`rounded-lg border p-4 ${CATEGORY_STYLES[n.category].badge}`}>
                  <div className="text-white font-medium mb-1 flex items-center gap-2 flex-wrap" style={DISPLAY}>
                    {n.title}
                    {n.tag && (
                      <span
                        className="border border-current rounded-full px-2 py-0.5 text-[10px] opacity-80"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400 }}
                      >
                        {n.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-[11px] mb-2" style={MONO}>
                    Estimator: {n.estimator}
                  </div>
                  <div className="text-slate-400 text-xs leading-relaxed">
                    <span className="text-slate-500">When:</span> {n.whenToUse}
                  </div>
                  <div className="text-slate-400 text-xs leading-relaxed mt-1">
                    <span className="text-slate-500">Limit:</span> {n.limitation}
                  </div>
                  {n.source && (
                    <div className="text-slate-500 text-xs leading-relaxed mt-1 whitespace-pre-line">
                      <span className="text-slate-500">Source:</span> {n.source}
                    </div>
                  )}
                  {n.note && (
                    <div className="text-slate-500 text-xs leading-relaxed mt-1 italic">{n.note}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Three dimensions */}
        <div className="mb-12 pt-8 border-t border-slate-800">
          <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2" style={MONO}>
            Three dimensions
          </div>
          <h3 className="text-lg text-white font-medium mb-2" style={DISPLAY}>
            Source, design, and estimator aren't the same thing
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Every method actually answers three independent questions:
          </p>
          <div className="space-y-2.5 mb-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5">
              <div className="text-slate-200 text-sm font-medium mb-1" style={DISPLAY}>Source</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Who generated the exogenous variation? A researcher (RCT) or the world itself —
                a law, an administrative lottery, a border, a disaster. The latter is what we
                usually call a "natural experiment."
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5">
              <div className="text-slate-200 text-sm font-medium mb-1" style={DISPLAY}>Design</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                What structure makes that variation exploitable? IV, RDD, DiD, Fixed Effects...
                This is the question that orders the tree.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5">
              <div className="text-slate-200 text-sm font-medium mb-1" style={DISPLAY}>Estimator</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                How do you compute the number once you have the design? 2SLS, TWFE, local
                regression...
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            A natural experiment doesn't determine the design or the estimator — it only tells
            you the exogeneity came from historical happenstance, not from a researcher. That's
            why it isn't a branch of the tree: look for "Source · classic examples" on the IV,
            RDD, DiD, and Fixed Effects cards in the reference sheet above.
          </p>
        </div>

        {/* Design vs Estimator */}
        <div className="pt-8 border-t border-slate-800">
          <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2" style={MONO}>
            Design vs. estimator
          </div>
          <h3 className="text-lg text-white font-medium mb-2" style={DISPLAY}>
            The same design can have more than one estimator
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">
            The design (where the exogenous variation comes from) defines what assumption you
            need. The estimator (how you compute the number) is a separate choice, and several
            designs share an estimator — that's why the tree takes you to the design first, and
            below is the reverse map: from estimator to designs.
          </p>
          <div className="space-y-2.5">
            {ESTIMATORS.map((e, i) => (
              <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5">
                <div className="text-slate-200 text-sm font-medium mb-1" style={DISPLAY}>
                  {e.name}
                </div>
                <div className="text-slate-500 text-xs leading-relaxed">{e.designs}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cheatsheet */}
        <div className="pt-8 mt-8 border-t border-slate-800">
          <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2" style={MONO}>
            Cheatsheet
          </div>
          <h3 className="text-lg text-white font-medium mb-2" style={DISPLAY}>
            Definition and formula for each piece
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Design = identification assumption (not fixed by more data). Estimator = computation
            procedure, conditional on the design being valid.
          </p>

          <div className="text-sm text-white font-medium mb-3" style={DISPLAY}>
            Designs
          </div>
          <div className="space-y-3 mb-8">
            {DESIGNS.map((d, i) => (
              <div key={i} className="rounded-lg border border-cyan-900/60 bg-slate-900/40 p-4">
                <div className="text-cyan-300 text-sm font-medium mb-1" style={DISPLAY}>
                  {d.name}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-2.5">{d.description}</p>
                <div
                  className="whitespace-pre-line text-[11px] leading-relaxed text-slate-300 bg-slate-950 border border-slate-800 rounded-md px-3 py-2.5"
                  style={MONO}
                >
                  {d.formula}
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-white font-medium mb-3" style={DISPLAY}>
            Estimators
          </div>
          <div className="space-y-3">
            {ESTIMATORS.map((e, i) => (
              <div key={i} className="rounded-lg border border-amber-900/60 bg-slate-900/40 p-4">
                <div className="text-amber-300 text-sm font-medium mb-1" style={DISPLAY}>
                  {e.name}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-2.5">{e.description}</p>
                <div
                  className="whitespace-pre-line text-[11px] leading-relaxed text-slate-300 bg-slate-950 border border-slate-800 rounded-md px-3 py-2.5"
                  style={MONO}
                >
                  {e.formula}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2SLR vs 2SLS vs DML */}
        <div className="pt-8 mt-8 border-t border-slate-800">
          <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2" style={MONO}>
            Three "two-step" methods, not one
          </div>
          <h3 className="text-lg text-white font-medium mb-2" style={DISPLAY}>
            2SLR vs. 2SLS vs. DML
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            All three involve two regression steps, which invites conflating them — but 2SLR and DML
            share one operation (residualize both Y and D on X, symmetrically), while 2SLS does the
            mirror opposite (keep D's fitted value, discard its residual, applied only to D). DML is
            best understood as 2SLR's nonlinear generalization, not as a relative of 2SLS — 2SLS only
            enters when a design (DML-IV, fuzzy RDD) composes both operations in sequence.
          </p>
          <div className="space-y-3 mb-6">
            {TWO_STEP_METHODS.map((m, i) => (
              <div
                key={i}
                className={`rounded-lg border bg-slate-900/40 p-4 ${TWO_STEP_ACCENTS[m.accent].border}`}
              >
                <div className={`text-sm font-medium mb-2 ${TWO_STEP_ACCENTS[m.accent].text}`} style={DISPLAY}>
                  {m.name}
                </div>
                <div className="mb-2">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-0.5" style={MONO}>
                    Problem solved
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{m.problem}</p>
                </div>
                <div className="mb-2">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-0.5" style={MONO}>
                    Core operation
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{m.operation}</p>
                </div>
                <div
                  className="whitespace-pre-line text-[11px] leading-relaxed text-slate-300 bg-slate-950 border border-slate-800 rounded-md px-3 py-2.5 mb-2"
                  style={MONO}
                >
                  {m.formula}
                </div>
                <div className="mb-2">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-0.5" style={MONO}>
                    Requires
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{m.requires}</p>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-0.5" style={MONO}>
                    Designs
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{m.designs}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <div className="text-slate-200 text-sm font-medium mb-2" style={DISPLAY}>
              Sharp vs. fuzzy RDD: a compliance distinction, not a Z distinction
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Z = 1{"{X≥c}"} is the identical deterministic crossing indicator in both sharp and fuzzy
              RDD — it's always "sharp" as a rule. What differs is whether D_i = Z_i (sharp: perfect
              compliance, π̂₁=1, the reduced-form jump γ̂₁ is already τ̂) or D_i ≠ Z_i (fuzzy: partial
              compliance, π̂₁&lt;1, so τ̂ = γ̂₁/π̂₁ — the same 2SLS ratio used in classic Instrumental
              Variables).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
