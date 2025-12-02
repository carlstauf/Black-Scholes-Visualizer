# Black Scholes Visualizer

An interactive options pricing visualizer built with **Next.js**, **TypeScript**, and the **Black Scholes model**.  
The app lets you explore how call and put prices and Greeks respond to changes in spot price, volatility, time to maturity, and the risk free rate through live heatmaps and metrics.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Screens](#screens)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [How the pricing works](#how-the-pricing-works)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Market parameter controls

- Spot price `S`
- Strike price `K`
- Time to maturity `T`
- Volatility `σ`
- Risk free rate `r`
- Sliders and numeric inputs with instant feedback

### Analysis and metrics

- Call and put values from the Black Scholes formula
- Greeks:
  - Delta
  - Gamma
  - Theta
  - Vega
  - Rho
- Breakeven levels and in the money / out of the money indication
- Pricing and P&L analysis modes (if enabled in your build)

### Visualization

- Dual panel layout for **call** and **put** surfaces
- 2D heatmaps for price vs spot price and volatility
- Adjustable grid resolution for both axes
- Color gradients chosen to keep the surfaces readable even at high resolutions
- Smooth transitions when parameters are updated

---

## Tech stack

- **Framework**: Next.js (React, TypeScript)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts and rendering**: Canvas or SVG based heatmaps
- **Build tool**: Next.js toolchain with `npm`

If you are not using Next.js, the general structure still applies. Adjust the sections below to match your actual setup.

---

## Screens

The core screen is a single page that includes:

- Left panel with all market parameter inputs
- Top bar with call and put headline values plus Greeks
- Large central call heatmap
- Large central put heatmap


---

## Getting started

### Prerequisites

- **Node.js** version 18 or later  
  Check your version:

  ```bash
  node -v
