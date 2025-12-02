# OptiCalc.Quant - Black-Scholes Visualizer

A high-precision, interactive options pricing terminal designed for quantitative analysis. This web application visualizes European Call and Put option prices and Greeks using the Black-Scholes model, featuring real-time heatmaps and risk analysis tools.

## 🚀 Features

### Core Pricing & Risk
- **Real-time Black-Scholes Pricing**: Instant calculation of European Call and Put prices.
- **The Greeks**: Live computation of Delta, Gamma, Theta, Vega, and Rho.
- **Risk Metrics**: Probability ITM (In-The-Money) and Breakeven price calculation.

### Interactive Visualization
- **Dual Heatmaps**: Side-by-side visualization for Call and Put surfaces.
- **Dynamic Axes**: X-axis (Spot Price) and Y-axis (Volatility) with adjustable grid scales.
- **Precision Crosshairs**: Hover over heatmaps to see exact Spot, Volatility, and Metric values with a dynamic HUD.

### Analysis Modes
- **Pricing Mode**: Visualize theoretical values across the volatility/spot surface.
- **P&L Mode**: Switch to Profit & Loss view with diverging color scales (Red/Green) to visualize risk relative to a specific cost basis.

### Professional UI
- **Quant-Terminal Aesthetic**: Dark mode interface designed for data density and readability.
- **JetBrains Mono**: Monospace typography for numerical precision.
- **Copy Analysis**: One-click export of current scenario parameters to clipboard.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Inter (UI), JetBrains Mono (Data)
- **Math**: Custom Black-Scholes implementation in TypeScript (Standard Normal CDF/PDF).

## 📖 Usage

### 1. Market Parameters
Adjust the inputs in the sidebar to simulate different market conditions:
- **Spot Price ($)**: Current price of the underlying asset.
- **Strike Price ($)**: Exercise price of the option.
- **Time to Maturity (Years)**: Time until expiration.
- **Volatility (σ)**: Annualized standard deviation of returns.
- **Risk-free Rate (%)**: Theoretical return of an investment with zero risk.

### 2. Analysis Mode
Toggle between **Pricing** and **P&L** in the sidebar.
- In **P&L Mode**, the app snapshots the current theoretical price as the "Cost Basis". You can manually adjust the "Call Cost" and "Put Cost" to simulate different entry prices.

### 3. Heatmap Navigation
- **Hover**: Move mouse over the grid to inspect specific scenarios.
- **Grid Scale**: Use the sliders at the bottom of the sidebar to zoom in/out on the Spot Price range (±%) and Volatility range (±σ).

## 🧮 Mathematical Model

The application uses the standard Black-Scholes-Merton formulas:

$$ C(S, t) = N(d_1)S - N(d_2)Ke^{-r(T-t)} $$
$$ P(S, t) = N(-d_2)Ke^{-r(T-t)} - N(-d_1)S $$

Where:
- $d_1 = \frac{\ln(S/K) + (r + \sigma^2/2)(T-t)}{\sigma\sqrt{T-t}}$
- $d_2 = d_1 - \sigma\sqrt{T-t}$

## 👨‍💻 Credits

**Built by Carl Stauffer**
