# Volatility & Cannibalization Formulas

## 1. Enhanced Volatility Index (EVI)

**Objective**: Quantify SERP stability using a robust, multi-factor model (Perplexity AI Recommendation).

**Formula**: `EVI = (0.50 × Norm_StdDev) + (0.35 × Drift_Factor) + (0.15 × Anomaly_Score)`

### Components:

#### A. Normalized Standard Deviation (50%)
*   **Formula**: $Norm\_StdDev = \frac{StdDev(\Delta_{7d})}{Max(1, MAD(\Delta_{7d}))}$
*   **Purpose**: Measures fluctuation intensity normalized by "typical" volatility (MAD). Robust to outliers.

#### B. Drift Factor (35%)
*   **Formula**: $Drift = |Slope(Ranks_{7d})| \times Sign\_Consistency$
*   **Sign Consistency**: $(\frac{\text{# days consistent direction}}{7}) - 0.5$
*   **Purpose**: Detects gradual, consistent ranking decline or improvement (not just random noise).

#### C. Anomaly Score (15%)
*   **Formula**: Count of days where $|\Delta_t - \bar{\Delta}| > 2.5 \times \sigma$
*   **Purpose**: Penalizes sudden, extreme shocks (e.g., dropping 50 spots in one day).

### Interpretation:
*   **EVI < 1.5**: Stable.
*   **1.5 <= EVI < 4.0**: Moderate (Normal shifts).
*   **EVI >= 4.0**: High (Algorithm Update or Penalty).

---

## 2. Cannibalization Overlap Score

**Objective**: Quantify the degree to which multiple pages from the same domain compete for the same keyword.

**Formula**: `Weighted Overlap Ratio`

### Variables:
*   $K$: Target Keyword.
*   $U_1, U_2$: Two different URLs from the same domain ranking for $K$.
*   $D$: Analysis period (e.g., 30 days).
*   $C_{simul}$: Count of days where BOTH $U_1$ and $U_2$ ranked in Top 100 simultaneously.
*   $R_{avg1}, R_{avg2}$: Average rank of $U_1$ and $U_2$ on overlap days.

### Calculation Steps:
1.  **Identify Pairs**: Find all pairs $(U_1, U_2)$ that ranked for $K$ in period $D$.
2.  **Overlap Frequency**: Calculate % of days they co-existed.
    *   $Freq = \frac{C_{simul}}{D}$
3.  **Rank Proximity Penalty**: Cannibalization is worse if ranks are close (e.g., Pos 5 and Pos 6 vs. Pos 5 and Pos 90).
    *   $Prox = \frac{1}{1 + |R_{avg1} - R_{avg2}|}$
4.  **Cannibalization Score (CS)**:
    *   $CS = Freq \times (0.7 + 0.3 \times Prox) \times 100$

### Interpretation:
*   **CS > 80**: Critical Cannibalization (Merge immediately).
*   **50 < CS <= 80**: Moderate Competition (Differentiate content).
*   **CS <= 50**: Incidental Overlap (Monitor).

---

## 3. Global Market Volatility (SERP Weather)

**Objective**: Detect broad Google Algorithm Updates.

**Formula**: Average VI across ALL tracked keywords.
*   $Global\_VI = \frac{1}{M} \sum_{j=1}^{M} VI_j$
    *   Where $M$ is total count of keywords tracked.
