---
title: "Causal Inference Designs — Full Diagnostic Reference"
description: "A rule-based selection procedure across thirteen causal inference designs, ranked by assumption credibility, with per-design diagnostics."
pubDate: 2026-08-06
tags: ["causal-inference", "econometrics", "reference"]
---

## Contents

- **Legend** — what the seven labels mean
- **Rule-based selection procedure** (order matters)
- **Experimental**
  1. RCT / A-B Test
  2. RCT — Switchback
- **Quasi-experimental**
  - *Instrument-based:* 3. Instrumental Variables
  - *Threshold-based:* 4. Regression Discontinuity — Sharp · 5. Regression Discontinuity — Fuzzy
  - *Panel and time-series-based:* 6. Interrupted Time Series · 7. Fixed Effects · 8. Synthetic Control · 9. Difference-in-Differences
- **Observational** — Selection on observables
  10. Propensity-Score methods · 11. Double Machine Learning · 12. Distance Matching · 13. ANCOVA / Stratified Regression
- **Reference definitions**
  - Formal definitions
  - Cross-cutting clarifications

---

## Legend — what the seven labels mean

- **Robustness to approximate conditions** — how much the causal estimate degrades if the identifying assumption is only *approximately*, not exactly, satisfied (or, when the assumption can't be directly tested at all, how exposed the design is to a silent, undetectable violation). High = small violations cause small bias. Low = small violations cause large bias, or there's no internal signal that anything went wrong.
- **Robustness to researcher choices** — how little the point estimate moves under reasonable, defensible changes to the specification choices a researcher has to make (bandwidth, model class, donor set, matching algorithm, trimming rule). High = the estimate is stable regardless of these choices. Low = many "researcher degrees of freedom" exist that can swing the answer.
- **Operational difficulty** — how hard it is to find or engineer a setting where this design's basic data/access requirements exist at all, independent of whether the identifying assumption then holds.
- **Assumption credibility** — how arguable or testable the identifying assumption is, once the operational requirements are met.
- **Precision** — how tight the estimator's sampling variance is *if the identifying assumption holds exactly*, with no misspecification and no approximation — i.e., statistical efficiency under ideal conditions, independent of any bias risk. High = low variance, tight confidence intervals for a given sample size. Low = the design inherently discards information (a small local sample, weak identifying variation) even when everything about it is done right.
- **Small-N behavior** — how the design fares specifically when the number of units, or the number of *treated* units, is small. This is distinct from Precision: Precision asks how tight the estimate is at a given (unspecified) sample size; Small-N behavior asks what happens as that size shrinks toward the low end — some designs degrade gracefully (lose only power), others break down structurally (biased inference, undefined diagnostics), and a few are specifically *built* for this regime.
- **Data structure** — whether the design requires cross-sectional data (many units, one time point), time-series data (one unit, many time points), panel/longitudinal data (many units tracked over many of the same time points), or can work with more than one of these.

Robustness to approximate conditions and Assumption credibility are related but distinct: credibility asks "can I defend this assumption in the first place," robustness to approximate conditions asks "if I'm slightly wrong about it, how bad is the damage." Precision is a separate axis again — it says nothing about bias or credibility, only about how much a *correctly identified* estimate would still bounce around from sample to sample. Small-N behavior is separate again from Precision — a design can have Low Precision in general (Regression Discontinuity) while also degrading further at small N, or have High Precision in general (Difference-in-Differences) while still requiring a minimum cluster count for valid inference.

---

## Rule-based selection procedure (order matters)

**Ranking principle:** designs are ordered by Assumption credibility first, then Robustness to approximate conditions, then Precision, then Robustness to researcher choices as the final tiebreaker — in that order of priority. Operational difficulty is *not* part of the ranking: it only determines whether a step's condition can be satisfied at all, not how good the design is once it can be. This is a different order from the earlier draft, which mirrored the project's decision tree — a flowchart built for checking *availability* efficiently, not for ranking *quality*. That's why Instrumental Variables sat second before: it was simply the next availability check after randomization, not a claim that it's the second-best design. Evaluate top to bottom; stop at the first rule whose condition is met.

1. **Can you assign treatment randomly?**
   - At the individual or cluster level → **RCT / A-B Test**. Estimator: difference in means (+ ANCOVA/CUPED). Highest on every axis.
   - Only by alternating the same unit across time blocks → **RCT-Switchback**. Estimator: Two-Way Fixed Effects. Ranks just below plain RCT solely because of carryover exposure (Robustness to approximate conditions: Medium vs. High) — everything else about it is still design-based, not asymptotic.
   - Neither → go to 2.
2. **Is there a credible threshold/cutoff rule that determines treatment?**
   - Yes, strictly enforced → **Sharp Regression Discontinuity**. Estimator: local polynomial regression. Essentially tied with the randomized designs on credibility — continuity near a cutoff is often treated in the literature as "as good as random" — even though its local sample makes it far less precise.
   - Yes, but compliance is partial → **Fuzzy Regression Discontinuity**. Estimator: 2SLS (local instrument). A notch below sharp once compliance is imperfect, but still ranked ahead of a generic instrument (step 5) — the threshold-crossing "instrument" here is usually more credible than an arbitrary external one. *(Judgment call, not a mechanical score: a strict mechanical score across each entry's five ranking labels — High=3, Medium=2, Low=1, summed — actually places Fuzzy Regression Discontinuity slightly behind Difference-in-Differences/Fixed Effects, not ahead of Instrumental Variables as written here. I overrode the mechanical score because the applied-econometrics literature — Lee & Lemieux 2010; Imbens & Lemieux 2008 — generally treats regression-discontinuity designs, sharp or fuzzy, as a single higher-credibility category distinct from, and above, generic instrumental variables, on the grounds that threshold-crossing is a locally quasi-random source of variation in a way an arbitrary external instrument usually isn't. This is a real judgment call, not a settled fact.)*
   - No → go to 3.
3. **Do you have panel data with a comparison group (units/periods with different treatment exposure)?**
   - Treatment is a discrete event, many treated units, plausible parallel trends → **Difference-in-Differences**. Estimator: Two-Way Fixed Effects (or Callaway & Sant'Anna / Sun & Abraham if adoption is staggered).
   - Treatment is continuous/variable-intensity → **Fixed Effects (panel)**. Estimator: Two-Way Fixed Effects.
   - Treatment is a discrete event, one or few treated units, good donor pool → **Synthetic Control**. Estimator: synthetic weights (or a Bayesian structural time-series model, e.g. CausalImpact).
   - These three don't compete for the same problem — the sub-condition (event vs. continuous vs. few-unit) picks between them, not a further quality ranking. As a tier, Medium credibility, generally High precision (DiD/Fixed Effects use full-panel differencing, not a local sample).
   - None apply → go to 4.
4. **Is there a variable that moves treatment but affects the outcome only through treatment (a valid instrument)?**
   - Yes → **Instrumental Variables**. Estimator: 2SLS. Low credibility — the exclusion restriction is fundamentally untestable — but Medium robustness and precision once it holds.
   - No → go to 5.
5. **(Cross-sectional, or rich enough covariates) Do you have high-dimensional or nonlinear covariates you're confident capture all confounders?**
   - Yes → **Double Machine Learning**. Estimator: Neyman-orthogonal residual-on-residual with cross-fitting. Same Low credibility tier as Instrumental Variables (unconfoundedness is equally untestable) — this is a genuine tie, not an oversight; the two solve different problems (exogenous variation vs. observed confounders), so treat step 4 and step 5 as parallel checks rather than a strict order if both conditions happen to hold in your setting.
   - No, but the covariates are still rich/high-dimensional → **Propensity-Score methods** (Matching / Inverse-Propensity Weighting / Augmented Inverse-Propensity Weighting). Same credibility tier, but ranks a notch below Double Machine Learning on Robustness to researcher choices (propensity-model specification, trimming rule) unless you specifically use Augmented Inverse-Propensity Weighting.
   - Few, known covariates only → go to 6.
6. **Few covariates: do you trust a linear functional form for the outcome and treatment models?**
   - Yes → **ANCOVA / Stratified Regression**. Estimator: Ordinary Least Squares with covariates. Same Low credibility tier as the rest of this branch, but fewer researcher degrees of freedom than raw matching.
   - No → **Distance Matching**. Estimator: Mahalanobis or nearest-neighbor matching. Same credibility tier, but the metric/caliper choice makes it the most sensitive to researcher choices in the whole Selection-on-observables family.
7. **None of the above — only a single unit's own time series, no comparison group at all** → **Interrupted Time Series**. Estimator: segmented trend regression. Last resort: lowest on every quality axis except Operational difficulty, which is exactly why the original availability-ordered tree checked it first — cheapest to attempt is not the same as best once attempted.

**If, at whichever step you land on, the identifying assumption still isn't defensible** (most commonly: you're in the Selection-on-observables tier and still suspect an unmeasured confounder) — stop. Either search harder for a design further up this list (a natural experiment, a discontinuity, a panel structure you hadn't considered), or report a sensitivity/bounds analysis (Rosenbaum bounds, E-value, Cinelli–Hazlett — mechanics in the Observational section's shared diagnostic) instead of a point estimate you can't defend.

---

## Experimental

### 1. RCT / A-B Test
**Main estimator(s):** Difference in means (+ ANCOVA/CUPED for variance reduction).
**Small-N behavior:** Neutral — stays unbiased at any n by construction; a small trial only means wide confidence intervals, not a wrong answer. The cleanest case in the whole reference: no systematic degradation, only power loss.
**Data structure:** Cross-sectional (a single post-treatment measurement). Panel/repeated-measures optional and beneficial — a pre-treatment period lets ANCOVA/CUPED cut variance, but isn't required for identification.
**Formula:** D ⊥ (Y(1), Y(0)); τ̂ = Ȳ_treat − Ȳ_control, i.e. ATE = E[Y|D=1] − E[Y|D=0].
**Python:** `statsmodels` (difference-in-means, ANCOVA via `ols`), `scipy.stats` (t-tests), `statsmodels.stats.power` (power analysis).

- **a) Applicability:** You control the assignment mechanism at the unit or cluster level.
- **b) How to check:** Balance table on pre-treatment covariates (mean differences + joint F-test); confirm realized assignment shares match the design (e.g., exactly 50/50).
- **c) What can go wrong anyway:** SUTVA violations (Stable Unit Treatment Value Assumption: one unit's treatment shouldn't affect another unit's outcome, and there's only one "version" of the treatment — violated by network effects or two-sided marketplaces); differential attrition (participants dropping out non-randomly, at different rates by arm, after assignment); non-compliance (the treatment a unit actually *receives* differs from what it was *assigned*).
- **d) How to check that:** Map the unit network and compare individual- vs. cluster-randomized estimates for interference; compare attrition rates and covariates by arm; report both intent-to-treat (effect of *assignment*, ignoring compliance) and treatment-on-the-treated (effect of *actually receiving* treatment) alongside compliance rates by arm.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | High |
| Robustness to researcher choices | High |
| Operational difficulty | High |
| Assumption credibility | High |
| Precision | High |

### 2. RCT — Switchback
**Main estimator(s):** Two-Way Fixed Effects.
**Small-N behavior:** Good — specifically suited to a small number of units, since it trades units for time blocks: the same unit provides its own comparison across periods, so power comes from many time blocks (T) rather than many units (N).
**Data structure:** Panel (required) — the same units must be tracked across successive time blocks.
**Formula:** D_it ⊥ (Y_it(1), Y_it(0)) | i; Y_it = α_i + λ_t + τ·D_it + ε_it (identical estimating equation to entries 7 and 9 — mechanics in Reference definitions).
**Python:** `linearmodels.PanelOLS` (clustered standard errors at the block level), `statsmodels` for the underlying regression.

- **a) Applicability:** The same unit can feasibly alternate treatment/control across time blocks, with block order randomized.
- **b) How to check:** Verify the block sequence is genuinely randomized (no systematic ordering); confirm block length was fixed before seeing the data (pre-registered), not chosen afterward.
- **c) What can go wrong anyway:** Carryover/contamination between adjacent blocks (this period's treatment effect leaks into the next); blocks too short to reach a steady state; time trends that happen to coincide with block switches.
- **d) How to check that:** Regress Y_it on lagged treatment D_{i,t-1} controlling for D_it — a significant lag coefficient signals carryover; compare τ̂ with vs. without washout periods; re-estimate at longer block lengths and check stability.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Medium |
| Robustness to researcher choices | Medium |
| Operational difficulty | High |
| Assumption credibility | High |
| Precision | High |

---

## Quasi-experimental

**What distinguishes this category from Observational (entries 10–13) is the source of the identifying variation, not data structure or technique.** Here, there's an external source of variation in treatment — a lottery, an eligibility cutoff, differential policy timing, a border, a disaster — that the researcher didn't design but that plausibly behaves *as if* randomized, at least locally (near the cutoff, among compliers, within the comparison window): the exogenous shock does the identification work. In the Observational entries below, no such external source exists at all — identification rests entirely on having measured and correctly modeled every confounder, with covariate adjustment doing 100% of the work. This is reflected directly in each entry's Assumption credibility label: Medium-to-High across this quasi-experimental group, but uniformly Low across entries 10–13, because a quasi-experimental design's untestable piece is narrow and specific (an exclusion restriction, continuity, parallel trends), while an observational design's untestable piece — that no unmeasured confounder exists at all — is maximally broad. In practice the line blurs at the edges (choosing a Difference-in-Differences comparison group is itself a covariate-based judgment call; a weak instrument starts to resemble adjustment dressed up as exogeneity), but the principle is a genuine distinction, not just a category label.

### Instrument-based

#### 3. Instrumental Variables (IV / 2SLS)
**Main estimator(s):** Two-Stage Least Squares (2SLS).
**Small-N behavior:** Bad — weak-instrument bias and variance are already a live concern at moderate samples, and both worsen substantially as n shrinks; the finite-sample bias toward the Ordinary Least Squares estimate is directly a small-sample phenomenon that vanishes only asymptotically.
**Data structure:** Cross-sectional or panel — either works, as long as the instrument, treatment, and outcome are jointly measured; panel Instrumental Variables is common when using a time-varying instrument.
**Formula:** relevance Cov(Z,D)≠0, exclusion Cov(Z,ε)=0; first stage D_i=π₀+π₁Z_i+η_i, second stage Y_i=β₀+τD̂_i+ε_i, single-instrument Wald ratio τ̂=Cov(Y,Z)/Cov(D,Z).
**Classic examples:** Angrist (1990) — the Vietnam draft lottery number as an instrument for military service. Angrist & Krueger (1991) — quarter of birth as an instrument for years of schooling, via compulsory schooling laws.
**Python:** `linearmodels.iv.IV2SLS` (actively maintained, preferred over the older `statsmodels` IV tools).

- **a) Applicability:** A variable Z exists that moves D (relevance) and affects Y only through D (exclusion restriction).
- **b) How to check:** Relevance — first-stage F-statistic (classic rule of thumb >10; recent guidance, e.g. Lee et al. 2022, argues for stricter thresholds). Exclusion is *not* directly testable — only argued institutionally, or probed with falsification tests (Z shouldn't predict pre-treatment outcomes or outcomes it has no plausible channel to affect).
- **c) What can go wrong anyway:** Weak-instrument bias toward the Ordinary Least Squares estimate even at F>10 in finite samples; violation of monotonicity (the assumption that no one is a "defier" — someone who does the opposite of what the instrument nudges them toward) breaks the Local Average Treatment Effect interpretation; the Local Average Treatment Effect only describes compliers (units whose treatment status the instrument actually moves) — may not generalize to the population you care about.
- **d) How to check that:** Report Anderson–Rubin confidence intervals (valid even under weak instruments, unlike standard 2SLS intervals); with multiple instruments, an overidentification test (Sargan/Hansen J — checks whether the instruments agree with each other, not true exogeneity); describe complier characteristics to assess how representative they are.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Medium |
| Robustness to researcher choices | Medium |
| Operational difficulty | High |
| Assumption credibility | Low |
| Precision | Medium |

### Threshold-based

**Note — Z is identical in both Regression Discontinuity variants below.** Z = 1{X≥c} is the same deterministic crossing indicator in sharp and fuzzy Regression Discontinuity; it's never itself what's "fuzzy." What differs is compliance: sharp has D_i=Z_i exactly (perfect compliance, π̂₁=1 — there's no first stage to speak of, so the reduced-form jump in Y at c is already τ̂). Fuzzy has D_i≠Z_i (partial compliance, π̂₁<1 — some units above c go untreated, some below get treated anyway), so τ̂ needs the ratio γ̂₁/π̂₁ instead of reading the jump off directly — the same 2SLS Wald ratio used in Instrumental Variables above.

#### 4. Regression Discontinuity — Sharp
**Main estimator(s):** Local polynomial regression.
**Small-N behavior:** Bad — arguably the most fragile design here to small samples: even with abundant total data, the estimator only uses the *local* window near the cutoff, so a small overall n shrinks that effective window further still; this is why Precision is already Low even at generous sample sizes.
**Data structure:** Cross-sectional (running variable and outcome measured once per unit); panel extensions exist but aren't the base case.
**Formula:** D_i = 1{X_i≥c}; τ = lim_{x→c⁺} E[Y|X=x] − lim_{x→c⁻} E[Y|X=x].
**Classic examples:** Thistlethwaite & Campbell (1960) — the National Merit Scholarship cutoff score, the original Regression Discontinuity paper. Lee (2008) — U.S. House elections decided by a narrow vote-share margin, used to study incumbency effects.
**Python:** `rdrobust` (Python port of the Calonico–Cattaneo–Titiunik package, the field standard for bandwidth selection and robust inference).

- **a) Applicability:** A continuous running variable with a known, strictly enforced cutoff; D_i = 1{X_i ≥ c} deterministically.
- **b) How to check:** Confirm 100% compliance with the rule; confirm units can't precisely manipulate X near the cutoff (e.g., self-report a score just above the threshold).
- **c) What can go wrong anyway:** Manipulation/sorting around the cutoff even absent formal discretion (anticipation effects); another policy changing exactly at the same threshold; bandwidth or polynomial-order choice driving the result.
- **d) How to check that:** McCrary density test (checks for a suspicious jump in how many units sit just above vs. just below the cutoff — a sign of manipulation), or the newer Cattaneo–Jansson–Ma version; covariate-balance tests on pre-determined variables at the cutoff; scan for co-occurring policies at the same threshold; bandwidth-sensitivity analysis and placebo cutoffs away from the real one.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Medium |
| Robustness to researcher choices | Low |
| Operational difficulty | High |
| Assumption credibility | High |
| Precision | Low |

#### 5. Regression Discontinuity — Fuzzy
**Main estimator(s):** 2SLS (local instrument: threshold-crossing instruments actual treatment receipt).
**Small-N behavior:** Bad, and worse than sharp — stacks sharp Regression Discontinuity's shrinking-local-window problem with weak-instrument variance from the compliance first stage; the two small-sample penalties compound.
**Data structure:** Cross-sectional (same as sharp).
**Formula:** Z = 1{X≥c} as instrument, D_i≠Z_i, π̂₁<1; τ̂ = γ̂₁/π̂₁ (the reduced-form jump divided by the first-stage compliance jump — see the shared note above).
**Classic examples:** Angrist & Lavy (1999) — "Maimonides' Rule," enrollment thresholds triggering an extra class split (max 40 students), not perfectly enforced. van der Klaauw (2002) — financial-aid offers based on a threshold index that shifted admission probability without fully determining it.
**Python:** `rdrobust` (same package, supports fuzzy designs natively via the `fuzzy` argument).

- **a) Applicability:** Same running-variable/cutoff structure as sharp, but crossing c only shifts P(D=1|X) discontinuously rather than determining D exactly.
- **b) How to check:** Same density and balance tests as sharp, plus a visible, statistically significant jump in treatment probability at the cutoff (the fuzzy first stage).
- **c) What can go wrong anyway:** A weak first stage (small jump in P(D=1)) inflates bias and variance the same way a weak instrument does; the local complier population may differ meaningfully from sharp-RDD settings, narrowing what the estimate generalizes to; same co-occurring-policy risk as sharp.
- **d) How to check that:** Report the first-stage jump magnitude and its significance; Anderson–Rubin-type robust confidence intervals; characterize who the local compliers are.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Low |
| Robustness to researcher choices | Low |
| Operational difficulty | High |
| Assumption credibility | Medium |
| Precision | Low |

### Panel and time-series-based

#### 6. Interrupted Time Series
**Main estimator(s):** Segmented trend regression (level + slope shift at the intervention date).
**Small-N behavior:** Especially good — literally designed for a single unit and no comparison group at all; it substitutes many time periods for many units, so power comes from a long time series (T) rather than a large N.
**Data structure:** Time series (required) — one unit, many periods; not applicable to cross-sectional or standard panel data.
**Formula:** Y_t = β₀ + β₁t + β₂D_t + β₃(t−t₀)D_t + ε_t.
**Python:** `statsmodels` (segmented regression via `ols` with level/slope interaction terms; `cov_type='HAC'` for autocorrelation-robust standard errors).

- **a) Applicability:** A long single-unit series with a clear, single intervention date; no comparison unit required.
- **b) How to check:** Enough pre/post observations to estimate level and slope reliably (a common rule of thumb is 8–12+ points on each side); confirm the pre-period trend is stable, with no prior structural breaks.
- **c) What can go wrong anyway:** Any other event coinciding with the intervention date is statistically indistinguishable from the treatment effect (the concurrent-shock problem — no internal check can rule this out); autocorrelated errors understate uncertainty; the true trend may be nonlinear where a linear segment was assumed.
- **d) How to check that:** Search for other known contemporaneous events or policies; use falsification/placebo outcomes — series that shouldn't respond to this particular treatment — as a check; test residuals for autocorrelation (Durbin–Watson statistic, or just use Newey–West standard errors throughout); compare linear vs. flexible/spline trend fits for stability.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Low |
| Robustness to researcher choices | Low |
| Operational difficulty | Low |
| Assumption credibility | Low |
| Precision | Low |

#### 7. Fixed Effects (panel, continuous/variable intensity)
**Main estimator(s):** Two-Way Fixed Effects.
**Small-N behavior:** Mixed — point estimates stay unbiased with any number of units in principle, and a long panel on few units is workable, but valid cluster-robust inference conventionally needs roughly 40+ units/clusters; below that, standard errors need a wild cluster bootstrap or similar finite-sample correction, or they're simply wrong.
**Data structure:** Panel (required) — many units, tracked over many of the same periods, with treatment intensity varying within units.
**Formula:** Y_it = α_i + λ_t + τ·D_it + ε_it (identical estimating equation to entries 2 and 9 — mechanics in Reference definitions).
**Classic examples:** Duflo (2001) — Indonesia's INPRES school-construction program, whose intensity varied by region and birth cohort. Currie & Gruber (1996) — state-level Medicaid eligibility expansions, varying in scope and timing, and their effect on child health.
**Python:** `pyfixest` (fast, `fixest`-style estimation with multi-way clustering — increasingly the default choice), `linearmodels.PanelOLS`.

- **a) Applicability:** Panel data, many periods, treatment intensity varies continuously within units over time.
- **b) How to check:** Confirm meaningful within-unit variation in D_it, not just cross-sectional variation; run an event-study-style check for pre-trends before intensity changes.
- **c) What can go wrong anyway:** Time-varying confounders correlated with treatment intensity (strict exogeneity fails); reverse causality (past outcomes driving future intensity, not the other way around); with staggered timing and heterogeneous effects, the same Goodman-Bacon-type negative-weighting problem that affects Difference-in-Differences (see entry 9 and Reference definitions).
- **d) How to check that:** Include leads and lags of D_it (an event-study regression) — a significant lead coefficient flags pre-trends or reverse causality; compare classic Two-Way Fixed Effects against heterogeneity-robust estimators (Callaway & Sant'Anna, de Chaisemartin & D'Haultfœuille) — a large gap between them signals a weighting problem.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Medium |
| Robustness to researcher choices | Medium |
| Operational difficulty | Medium |
| Assumption credibility | Medium |
| Precision | High |

#### 8. Synthetic Control
**Main estimator(s):** Synthetic weights (constrained convex optimization); Bayesian structural time-series regression as the CausalImpact-style alternative (see Python note below).
**Small-N behavior:** Especially good on the *treated* side — this is its entire reason for existing: one or a few treated units, borrowing precision from a large donor pool of untreated units. It does, however, need a reasonably deep donor pool and a long pre-treatment window to work well; a small donor pool undermines the pre-trend fit the whole method depends on.
**Data structure:** Panel (required) — a long pre-treatment time series for the treated unit plus a panel of comparable donor units over the same periods.
**Formula:** min_w Σ(X₁ − Σⱼwⱼ Xⱼ)² s.t. wⱼ≥0, Σⱼwⱼ=1; τ_t = Y₁ₜ − Σⱼwⱼ Yⱼₜ.
**Python:** `pysyncon` implements Abadie's method literally — convex-optimization donor weights (non-negative, summing to 1) fit to match the pre-treatment path, with placebo-based inference. `causalimpact` (a Python port of Google's R package, by WillianFuks) is a **related but genuinely different method**, not a Synthetic Control implementation: it fits a Bayesian structural time-series model, uses spike-and-slab priors to select which control series to include as regressors, and reports Bayesian credible intervals rather than Abadie's permutation-based placebo inference — it drops the convex-weights constraint entirely. In practice `causalimpact` is often easier to use and gives well-calibrated uncertainty out of the box, so for the general problem ("one treated series, several candidate control series, want a counterfactual") it's a legitimate and popular choice — arguably the more practical default. But it answers a different question than Abadie's "Synthetic Control Method"; if what you specifically want is the donor-pool-and-weights construction (e.g. to match published methodology), `pysyncon` is the direct match. `SparseSC` is a third option, useful when the donor pool is large and you want the donor weights themselves regularized.

- **a) Applicability:** Few (often one) treated units, a long pre-treatment panel, and a donor pool (a set of untreated units similar enough to combine into a weighted stand-in for the treated unit) of comparable untreated units.
- **b) How to check:** Pre-treatment fit quality (root mean squared prediction error of the synthetic path vs. the actual pre-period path); confirm the treated unit's predictor values aren't outside the donor pool's convex hull (i.e., you're not extrapolating beyond what the donors can represent).
- **c) What can go wrong anyway:** A good pre-treatment fit can come from overfitting noise, especially with many donors relative to few pre-periods — spurious precision that doesn't generalize; a post-treatment shock specific to the treated unit, unrelated to the actual treatment and uncorrelated with the predictors used to build the weights.
- **d) How to check that:** Placebo-in-space test (rerun the identical procedure on every untreated donor, treating each as if it were "treated," and compare the real treated unit's gap to that distribution — the standard Abadie et al. inference procedure); placebo-in-time test (assign a fake treatment date before the real one and confirm no effect appears); leave-one-out robustness across donors.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Medium |
| Robustness to researcher choices | Low |
| Operational difficulty | Medium |
| Assumption credibility | Medium |
| Precision | Medium |

#### 9. Difference-in-Differences
**Main estimator(s):** Two-Way Fixed Effects (classic 2×2 or many-period); Callaway & Sant'Anna (2021) or Sun & Abraham (2021) estimators when adoption is staggered.
**Small-N behavior:** Mixed — many treated and control units is the ideal case; with very few clusters, the same cluster-robust-inference problem as Fixed Effects applies (need ~40+ clusters, or a wild bootstrap). With just one or two treated units specifically, switch to Synthetic Control instead — that design is purpose-built for exactly that regime.
**Data structure:** Panel or pooled cross-section — genuine panel data (same units tracked over time) is ideal since it allows unit fixed effects; repeated cross-sections of a *different* sample each period also work for the parallel-trends logic, but lose the ability to difference out unit-level unobservables via fixed effects, since there's no "same unit" to track.
**Formula:** τ = (Ȳtreat,post − Ȳtreat,pre) − (Ȳcontrol,post − Ȳcontrol,pre); equivalently Y_it = α_i + λ_t + τ·D_it + ε_it (identical estimating equation to entries 2 and 7 — mechanics in Reference definitions).
**Classic examples:** Card & Krueger (1994) — New Jersey's minimum wage increase vs. neighboring Pennsylvania (no change), fast-food employment. Card (1990) — the Mariel Boatlift, a sudden surge of Cuban immigrants to Miami, compared to other cities.
**Python:** `pyfixest` or `linearmodels.PanelOLS` for classic Two-Way Fixed Effects; `differences` (Python implementation of Callaway & Sant'Anna 2021) for staggered-adoption-robust estimation. *Note: the staggered-DiD Python tooling is newer and less battle-tested than R's `did` package — worth cross-checking results if this matters for a real decision.*

- **a) Applicability:** Panel or repeated cross-section with treated and control groups observed pre/post.
- **b) How to check:** Event-study plot of the treatment−control gap in pre-periods (should be flat, not significantly trending); check for anticipation effects before the formal treatment date.
- **c) What can go wrong anyway:** Parallel trends can hold pre-treatment yet diverge post-treatment for reasons unrelated to treatment; with staggered adoption timing, classic Two-Way Fixed Effects suffers the negative-weighting aggregation bias described in Reference definitions, even when every individual pairwise comparison is valid; compositional changes within groups over time.
- **d) How to check that:** Compare naive Two-Way Fixed Effects against heterogeneity-robust estimators (Callaway & Sant'Anna 2021, Sun & Abraham 2021); use placebo outcomes that shouldn't respond to treatment; run a triple-difference design if a plausible unaffected sub-group exists.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Medium |
| Robustness to researcher choices | Medium |
| Operational difficulty | Low |
| Assumption credibility | Medium |
| Precision | High |

---

## Observational — Selection on observables (one identifying assumption, four estimator routes, kept separate as requested)

All four entries below share the identical identifying assumption — unconfoundedness (no factor other than the measured covariates X drives both treatment assignment and the outcome — i.e., every relevant confounder was actually measured) plus overlap (every unit, given its covariates, could plausibly have ended up either treated or untreated). Formally: D ⊥ (Y(1),Y(0)) | X, and 0 < P(D=1|X) < 1 (overlap). What differs across the four entries is only the estimator, and how exposed each one is to functional-form or dimensionality problems layered on top of that shared assumption.

**Shared diagnostic — sensitivity/bounds analysis for unobserved confounding.** Because unconfoundedness can't be verified directly from the data, this diagnostic applies identically to all four entries, not just one of them: posit a hypothetical unmeasured confounder U, parametrize its strength, and find the threshold at which it would erase the result — then judge whether a confounder that strong is plausible. Three standard versions, each suited to a different entry below: **Rosenbaum bounds** (matched studies — fits entry 12 most naturally) report Γ*, the odds-ratio strength at which significance is lost (Γ*≈1.2 is fragile; Γ*≈4 is robust). The **E-value** (Vanderweele & Ding 2017 — works off any risk ratio, so it applies to any of the four) converts an observed risk ratio RR into E-value = RR + √(RR·(RR−1)) — the minimum risk ratio U would need with *both* treatment and outcome to fully explain the effect away (e.g. RR=2 → E-value≈3.41). **Cinelli & Hazlett (2020)** (regression-based estimates — fits entry 13 most naturally, and applies to entry 11's linear/partially-linear score too) reports a robustness value in partial-R² terms and can benchmark it against your actual measured covariates ("U would need to be Nx as strong as your strongest observed confounder"). **Python:** `sensemakr` (Cinelli–Hazlett) for the regression-based bounds; Rosenbaum-bounds tooling is thinner in Python (`rbounds`/`sensitivitymv` in R are more mature — bridge via `rpy2` if you specifically need the matched-study version). Alongside any of these, negative-control outcome tests (an outcome the treatment shouldn't plausibly affect — a nonzero estimated "effect" there flags residual confounding) work the same way across all four entries.

### 10. Propensity-Score methods — Matching / Inverse-Propensity Weighting / Augmented Inverse-Propensity Weighting
**Main estimator(s):** Augmented Inverse-Propensity Weighting is the recommended default (double robustness); plain Matching or Inverse-Propensity Weighting as simpler, less protected alternatives.
**Small-N behavior:** Bad — overlap diagnostics become unreliable with few units per group (hard to tell true non-overlap from sampling noise), and Inverse-Propensity Weighting's variance, already driven by extreme weights near 0/1, is inflated further in small samples.
**Data structure:** Cross-sectional is the base case; panel data works too if pooling periods or using time-invariant confounders, but doesn't change the fundamental cross-sectional logic of the propensity model.
**Formula:** e(X) = P(D=1|X); Inverse-Propensity Weighting τ̂ = (1/n)Σ[D·Y/e(X) − (1−D)·Y/(1−e(X))]. Augmented Inverse-Propensity Weighting: ψ = m₁(X) − m₀(X) + D(Y−m₁(X))/e(X) − (1−D)(Y−m₀(X))/(1−e(X)) − τ, solved via E[ψ]=0 (see Reference definitions for why this specific form is doubly robust).
**Python:** `econml.dr.DRLearner` (Augmented Inverse-Propensity Weighting), `causalml`, `DoWhy` for the general workflow, `scikit-learn.LogisticRegression` for the propensity model itself.

- **a) Applicability:** Rich, high-dimensional covariate set X believed to capture all confounders, with overlap in propensity scores across groups.
- **b) How to check:** Overlap — plot propensity-score densities by group and trim/discard extreme values; covariate balance after weighting/matching (standardized mean difference — the difference in covariate means between groups, scaled by pooled standard deviation — under roughly 0.1 is a common rule of thumb).
- **c) What can go wrong anyway:** An omitted confounder despite a rich X — unconfoundedness fails silently, with no internal signal that anything is wrong; plain Matching/Inverse-Propensity Weighting (unlike Augmented Inverse-Propensity Weighting) need the propensity model itself to be well-specified, with no fallback; extreme weights near propensities of 0 or 1 inflate variance even after trimming.
- **d) How to check that:** Sensitivity/bounds analysis (see the shared diagnostic above — E-value is usually the simplest fit here); compare matching vs. Inverse-Propensity Weighting vs. Augmented Inverse-Propensity Weighting estimates — large divergence signals overlap or specification problems.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Medium (Augmented Inverse-Propensity Weighting) / Low (plain Matching or Inverse-Propensity Weighting) |
| Robustness to researcher choices | Low |
| Operational difficulty | Medium |
| Assumption credibility | Low |
| Precision | Medium |

### 11. Double Machine Learning
**Main estimator(s):** Neyman-orthogonal residual-on-residual regression (partially linear score) with flexible learners and K-fold cross-fitting; the Augmented Inverse-Propensity Weighting-based score if double robustness, not just orthogonality, is the goal.
**Small-N behavior:** Bad — cross-fitting splits the sample into K folds, and flexible learners need real data volume to fit well; small n starves every fold simultaneously, and the asymptotic guarantees the method leans on (the rate condition in Reference definitions) stop being trustworthy.
**Data structure:** Cross-sectional is the base case; panel extensions exist (e.g. Panel Fixed Effects with high-dimensional time-varying controls, noted in Reference definitions), so several structures are possible depending on the specific implementation.
**Formula:** Ỹ = Y − ĝ(X), D̃ = D − m̂(X), τ̂ = Cov(Ỹ,D̃)/Var(D̃) — see Reference definitions for how this relates to entry 13's Two-Step Linear Regression and entry 3's 2SLS.
**Python:** `doubleml` (the official package implementing Chernozhukov et al. 2018 directly), `econml.dml` (LinearDML, CausalForestDML, and variants).

- **a) Applicability:** Same unconfoundedness + overlap assumption as above, but specifically when X is high-dimensional or its relationship to Y and D is nonlinear — the setting flexible learners are meant for.
- **b) How to check:** Same overlap/balance diagnostics as entry 10; additionally confirm you have enough data to support K-fold cross-fitting (splitting the sample, fitting nuisance models on one fold and estimating on a held-out fold, to avoid overfitting bias) without starving any one fold.
- **c) What can go wrong anyway:** Same omitted-confounder blind spot as any Selection-on-observables method — Neyman-orthogonality (small errors in the nuisance models don't leak into the bias at first order) protects against *slow convergence* of the nuisance models, not against an *entirely missing* confounder; poor cross-fitting fold choice or too few folds relative to model complexity can still leave overfitting bias.
- **d) How to check that:** Sensitivity/bounds analysis (see the shared diagnostic above — Cinelli–Hazlett is usually the best fit for this linear/partially-linear score) and negative-control outcome tests; vary the number of cross-fitting folds and the underlying machine-learning model class (e.g., gradient boosting vs. random forest) and check τ̂ stability.

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Medium |
| Robustness to researcher choices | Medium |
| Operational difficulty | Medium-High (needs enough data to support flexible nuisance models plus cross-fitting) |
| Assumption credibility | Low |
| Precision | Medium |

### 12. Distance Matching
**Main estimator(s):** Mahalanobis distance or nearest-neighbor matching.
**Small-N behavior:** Bad — a small candidate pool means fewer units close enough to form good matches, so match quality deteriorates and usable matched pairs shrink further; this compounds, rather than substitutes for, the curse-of-dimensionality problem in (c) below.
**Data structure:** Cross-sectional is the base case; matching on pre-treatment trends in a panel setting is also used in practice, but the core method is cross-sectional.
**Python:** Ecosystem is thin here — `scikit-learn.neighbors.NearestNeighbors` with a Mahalanobis metric is the usual DIY route; for a full matching workflow (calipers, exact-match-then-nearest-neighbor, matching diagnostics) bridging to R's `MatchIt` via `rpy2` is still common in practice.

- **a) Applicability:** Same unconfoundedness + overlap assumption, but with few, well-understood covariates and a trusted distance metric.
- **b) How to check:** Same overlap/balance diagnostics as entry 10, simpler to inspect visually with few covariates; confirm no matched pairs sit outside common support (the region of covariate space where both treated and control units actually exist).
- **c) What can go wrong anyway:** Curse of dimensionality (as the number of covariates grows, exact or close matches become exponentially rarer, so "matched" units are only approximately comparable) even with what feels like "few" covariates; the choice of distance metric or caliper (the maximum allowed distance for a match to count) can materially change the matched sample and the result.
- **d) How to check that:** Re-run matching under alternative metrics/calipers and check stability of τ̂; sensitivity/bounds analysis (see the shared diagnostic above — Rosenbaum bounds is the natural fit for this matched-study setting).

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Low |
| Robustness to researcher choices | Low |
| Operational difficulty | Low |
| Assumption credibility | Low |
| Precision | Medium |

### 13. ANCOVA / Stratified Regression (as an identification strategy)
**Main estimator(s):** Ordinary Least Squares with covariates: Y_i = β₀ + τ·D_i + γ·X_i + ε_i. By the Frisch–Waugh–Lovell theorem this is numerically identical to residualizing both Y and D on X and regressing residual-on-residual — the "Two-Step Linear Regression" formulation compared against 2SLS and Double Machine Learning in Reference definitions.
**Small-N behavior:** Relatively good among the Selection-on-observables methods — a simple linear model needs comparatively little data to estimate reliably compared to flexible-model alternatives (matching, Double Machine Learning), though at very small n exact/permutation inference is safer than relying on asymptotic normality.
**Data structure:** Cross-sectional is the base case; the same formula is also used inside a Randomized Controlled Trial with panel/pre-period data for variance reduction (entry 1), though that's a different job for the identical equation.
**Python:** `statsmodels.formula.api.ols`.

- **a) Applicability:** Same unconfoundedness + overlap assumption, few key covariates, and — critically — a linear functional form for E[Y|X] and E[D|X] that you're willing to trust (this is the design-as-identification use of ANCOVA, distinct from its variance-reduction use inside a Randomized Controlled Trial, discussed earlier in this project).
- **b) How to check:** Same overlap/balance diagnostics as entry 10; residual plots and specification tests (e.g., Ramsey RESET) for gross functional-form violations.
- **c) What can go wrong anyway:** Functional-form misspecification biases τ̂ directly — there's no double-robustness cushion here, unlike Augmented Inverse-Propensity Weighting or Double Machine Learning; the same omitted-confounder blind spot as every Selection-on-observables method.
- **d) How to check that:** Re-estimate with a more flexible specification (polynomials, interaction terms) and check τ̂ stability; sensitivity/bounds analysis (see the shared diagnostic above — Cinelli–Hazlett is the natural fit for this regression setting).

| Label | Rating |
|---|---|
| Robustness to approximate conditions | Low |
| Robustness to researcher choices | Medium |
| Operational difficulty | Low |
| Assumption credibility | Low |
| Precision | Medium |

---

## Reference definitions

Formal material referenced conceptually in the entries above but not spelled out there.

### Formal definitions

**Moment condition.** E[ψ(W; τ, η)] = 0 — an expectation-zero equation that pins down the parameter τ given nuisance function(s) η (e.g., the propensity score and outcome regressions in entries 10 and 11). Estimation solves the sample analog (1/n)Σψ = 0 for τ̂.

**Neyman-orthogonal moment condition.** ∂/∂η E[ψ(W; τ, η)] |_{η=η₀} = 0 — the first-order derivative of the moment condition with respect to the nuisance function vanishes at the truth, so small nuisance-model errors don't leak into τ̂'s bias at first order. This is the formal property behind "Neyman-orthogonality" referenced in entries 10 and 11 — it buys tolerance for *slow convergence* of both nuisance models, not tolerance for either one being *entirely wrong*. Entry 10's Augmented Inverse-Propensity Weighting formula is the concrete instantiation of this abstract definition.

### Cross-cutting clarifications

**Two-Way Fixed Effects, precisely.** Mechanically a double-demeaning (Frisch–Waugh–Lovell theorem) of the equation given in entries 2, 7, and 9: remove each unit's own mean and each period's own mean, then regress the doubly-demeaned outcome on the doubly-demeaned treatment. The identical formula underlies all three entries — they differ only in *where D_it's variation comes from* (randomization vs. observed/assumed exogeneity), not in the estimating equation itself.

**Fixed Effects ≡ Difference-in-Differences — only under one condition.** The two give numerically identical τ̂ only with a single treatment date, regardless of the number of units or periods. This breaks under staggered adoption with heterogeneous effects: plain Two-Way Fixed Effects implicitly averages many pairwise 2×2 comparisons, some of which use already-treated units as controls and can receive negative weights (that particular comparison enters the aggregate with a flipped sign — Goodman-Bacon 2021) — an aggregation failure, not an identification failure. This is exactly why the heterogeneity-robust estimators referenced in entries 7 and 9 (Callaway & Sant'Anna 2021; Sun & Abraham 2021) exist.

**Augmented Inverse-Propensity Weighting vs. Double Machine Learning — double robustness vs. mere orthogonality.** Entry 10's moment condition is what makes that estimator doubly robust — consistent if *either* the propensity model e(X) *or* the outcome models m₀(X), m₁(X) is correct, a strictly stronger guarantee than orthogonality alone. Entry 11's default partially-linear score (Ỹ = Y−ĝ(X), D̃ = D−m̂(X)) is orthogonal but *not* doubly robust: both nuisance models must be asymptotically correct. Plugging entry 10's Augmented Inverse-Propensity Weighting score into the Double Machine Learning framework (cross-fitting + flexible learners) instead yields an estimator that is both orthogonal and doubly robust — the alternative flagged in entry 11's estimator line.

**Two-Step Linear Regression vs. 2SLS vs. Double Machine Learning — three two-step methods, not one.** All three involve two regression steps, which invites conflating them — but Two-Step Linear Regression and Double Machine Learning share one operation (residualize both Y and D on X, symmetrically, via the Frisch–Waugh–Lovell theorem), while 2SLS does the mirror opposite (keep D's fitted value, discard its residual, applied only to D, never to Y). Double Machine Learning is best understood as Two-Step Linear Regression's nonlinear generalization, not as a relative of 2SLS — 2SLS only enters when a design composes both operations in sequence (DML-IV, Fuzzy Regression Discontinuity).

- *Two-Step Linear Regression* (entry 13's Ordinary Least Squares approach, restated). Problem solved: confounding by known, linear covariates X. Core operation: residualize both Y and D on X, then regress residual on residual. Formula: Ỹ = Y − X'β̂_Y; D̃ = D − X'β̂_D; τ̂ = Cov(Ỹ,D̃)/Var(D̃) — numerically identical to entry 13's τ̂ by Frisch–Waugh–Lovell. Requires the correct linear functional form for E[Y|X] and E[D|X]; no instrument needed. Applies to entry 13 (Selection on observables, few known covariates) and, in a degenerate form, to entry 1's Randomized Controlled Trial with ANCOVA/CUPED — there D̃ is trivial since D⊥X by randomization, so only Y gets residualized, purely for variance reduction rather than identification.
- *2SLS* (entry 3, restated with this framing). Problem solved: confounding by unknown or unobserved factors — X can't fix this, no matter how flexibly it's modeled. Core operation: project D onto the instrument Z, keep the fitted value D̂ — the opposite move from Two-Step Linear Regression: subtract the residual, keep the projection, applied only to D. Formula: as in entry 3. Requires a valid instrument (relevance + exclusion). Applies to entry 3 (Instrumental Variables, whole-sample variation) and entry 5 (Fuzzy Regression Discontinuity, Z=1{X≥c} as a local instrument near the cutoff).
- *Double Machine Learning* (entry 11, restated with this framing). Problem solved: confounding by known covariates X that are high-dimensional or whose relationship to Y, D is nonlinear. Core operation: same skeleton as Two-Step Linear Regression — residualize both Y and D on X, then residual on residual — but ĝ(X), m̂(X) are fit with flexible learners instead of Ordinary Least Squares, using cross-fitting. Formula: as in entry 11. Requires the Neyman-orthogonal moment condition above, K-fold cross-fitting, and the rate condition ‖ĝ−g‖·‖m̂−m‖ = o(n^-1/2). Applies to entry 11 (Selection on observables, high-dimensional X) and extends to a DML-IV / partially linear IV model (X partialled out via Double Machine Learning, then ordinary 2SLS on the residuals) and doubly robust Difference-in-Differences.

**Is Two-Step Linear Regression a particular case of Double Machine Learning?** Yes, with one caveat. Both share the identical partially-linear, Neyman-orthogonal moment condition — Two-Step Linear Regression is simply the special case where ĝ, m̂ are fit by Ordinary Least Squares on a correctly-specified linear model instead of a flexible learner. The caveat is cross-fitting: Chernozhukov et al. (2018) build cross-fitting into the Double Machine Learning recipe specifically because flexible learners can overfit the sample used to estimate τ, and only sample-splitting removes that bias. Ordinary Least Squares on a fixed, correctly-specified linear model doesn't have this problem — it's already √n-consistent, so ‖ĝ−g‖ = O_p(n^-1/2) individually, and the product of two such terms is O_p(n^-1) = o(n^-1/2), trivially satisfying the rate condition without needing to split the sample. So entry 13's Two-Step Linear Regression is a valid, non-degenerate special case of entry 11's Double Machine Learning, but it lands there by *not needing* the ingredient (cross-fitting) that makes Double Machine Learning necessary in the first place.

**Other doubly robust estimators, beyond Augmented Inverse-Propensity Weighting.** Targeted Maximum Likelihood Estimation (van der Laan & Rubin 2006) — doubly robust and efficient, built via a targeting fluctuation step on an initial outcome-model fit rather than an additive augmentation term. Doubly robust Difference-in-Differences (Sant'Anna & Zhao 2020) — the doubly robust analogue of entry 9. Bang & Robins (2005) — generalizes the same augmentation idea to longitudinal/time-varying treatment. Doubly robust Instrumental Variables (Okui et al. 2012) — an analogous construction for the local average treatment effect under partial instrument-model misspecification; flagged as more niche, worth checking the source directly.

**On cross-sectional vs. time-series vs. panel/longitudinal — a note on terminology.** "Longitudinal" (biostatistics/epidemiology/psychology usage) and "panel" (econometrics usage) refer to the identical data structure — the same units tracked over multiple periods — not two different structures. The two genuinely distinct dimensions are: how many units (N), and how many time periods (T). Cross-sectional is many units, one period. Time series is one unit, many periods. Panel/longitudinal is many units, many periods, the *same* units tracked throughout. A fourth structure worth distinguishing from panel, since it's easy to conflate: pooled cross-section — many units, many periods, but a different sample of units drawn each period (e.g. repeated surveys). Difference-in-Differences (entry 9) works with either genuine panel data or pooled cross-sections, since the parallel-trends logic doesn't require tracking the same unit — but pooled cross-sections lose the ability to control for unit-level unobservables via fixed effects, since there's no "same unit" to difference against itself.
