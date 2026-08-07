---
title: "Bayesian vs. Frequentist Inference — Key Takeaways"
description: "Where Bayesian and frequentist estimates agree numerically, why hypothesis testing diverges even when estimation agrees, and MAP vs. posterior mean."
pubDate: 2026-08-07
tags: ["bayesian-inference", "frequentist-inference", "statistics"]
---

## 1. Where Bayesian and frequentist point/interval estimates agree

- **Exact, finite-n**: flat prior + regular likelihood → MAP = MLE always. In pivotal models (Gaussian location, Jeffreys-prior linear regression) flat priors also make credible intervals numerically equal to confidence intervals — but this only works because a pivotal quantity exists (a statistic whose sampling distribution is parameter-free), and "flatness" itself is parametrization-dependent (flat in θ ≠ flat in g(θ)).
- **Asymptotic**: Bernstein–von Mises — for *any fixed, non-degenerate* prior (positive density at θ₀, not shrinking with n), the posterior converges to N(θ̂_MLE, I(θ₀)⁻¹/n). Informativeness only slows convergence, it doesn't break it — degeneracy (zero density at θ₀, or a prior that sharpens with n) is what breaks it.

## 2. Why hypothesis testing disagrees even when estimation agrees

- Estimation is a shared location problem; testing compares a point null against a diffuse alternative, and Bayes factors marginalize over a prior on H₁, incurring an automatic Occam penalty p-values never pay.
- **Lindley's paradox** (worked with BF₀₁ = √(1+τ²/s²)·exp[−z²/2 · (τ²/s²)/(1+τ²/s²)]): at n=1000, z=1.96 (p=0.05), BF₀₁≈4.6 → P(H₀|x)≈0.82, the opposite conclusion from rejecting at 5%. As n→∞ at fixed z, BF₀₁→∞.
- Correction: it's wrong to say "frequentist tests ignore H₁" as a blanket claim — Fisherian p-values do, but **Neyman–Pearson** tests are explicitly built around a stated alternative via the likelihood ratio f(x;θ₁)/f(x;θ₀)>k, optimizing power at fixed size α (Neyman–Pearson lemma); under monotone likelihood ratio this extends to a single **UMP** test across a whole composite alternative (Karlin–Rubin). Worked example: N(θ,1), n=25, rejection region x̄>0.329 (from c=1.645×SE) is simultaneously optimal for every θ>0.

## 3. MAP vs. posterior mean

- MAP is the estimator structurally parallel to the MLE (same argmax operation); mean and mode only coincide exactly in symmetric posteriors (e.g., Beta(x+1,n−x+1): MAP = x/n matches MLE exactly at any n; mean = (x+1)/(n+2) doesn't, though both converge under BvM).
- "Mean is better" only holds under **squared-error loss** — a modeling choice, not a mathematical necessity. Absolute loss → posterior median; 0–1 loss → MAP. Mean can be a poor summary under skew (Inverse-Gamma example: mode 1/3 vs. mean 1) and destroys sparsity under Laplace priors (MAP recovers exact zeros à la LASSO; mean never does). Median is the only one of the three invariant under monotonic reparametrization.
