# CoffeeTech Decoded - 3-Day MVP Sprint Plan

**Version:** 2.0 (Feasibility Adjustment)
**Date:** February 2026
**Status:** Execution Phase - 3-Day Sprint
**Target:** Functional Prototype

---

## 1. EXECUTIVE SUMMARY

**Goal:** Build a high-impact web prototype demonstrating the core value of "CoffeeTech Decoded": interactive 3D equipment exploration.
**Scope:** A single-page application (SPA) featuring one detailed coffee equipment model (e.g., Moka Pot or Espresso Machine). Users can rotate the model, click components to learn about them, and toggle a simple "exploded" view.
**Constraint:** 3-Day Development Cycle.
**Removed:** User accounts, payments, backend database, quizzes, community features, multiple equipment categories.

---

## 2. CORE FEATURES (MVP)

### 2.1 Interactive 3D Viewer
*   **Tech:** React Three Fiber (Three.js).
*   **Controls:** Orbit controls (Rotate, Zoom, Pan).
*   **Lighting:** Studio lighting setup for realistic presentation.
*   **Model:** Single high-quality GLB/GLTF model.

### 2.2 Component Interaction
*   **Selection:** Click on specific mesh parts (e.g., "Handle", "Lid", "Filter").
*   **Feedback:** Selected part highlights (color change or outline).
*   **Info Panel:** Sidebar/Overlay displays static data:
    *   Part Name
    *   Function Description
    *   Maintenance Tip

### 2.3 Visual Modes
*   **Standard View:** Assembled model.
*   **Exploded View (Lite):** Simple animation moving parts along a specific axis to show assembly (using GSAP or React Spring).

---

## 3. TECHNICAL SPECIFICATIONS

### 3.1 Technology Stack (Simplified)
| Component | Technology | Reasoning |
|-----------|------------|-----------|
| **Frontend** | React + Vite + TypeScript | Fast setup, type safety. |
| **Styling** | Tailwind CSS | Rapid UI development. |
| **3D Engine** | React Three Fiber (R3F) | Declarative Three.js for React. |
| **Animations** | Framer Motion or GSAP | Smooth UI and 3D transitions. |
| **State** | React Context or Zustand | Simple local state management. |
| **Data** | Hardcoded JSON | No backend required. |
| **Hosting** | Vercel / Netlify | Free, instant deployment. |

### 3.2 Performance Targets
*   < 2s Initial Load.
*   60 FPS interaction.
*   Mobile responsive canvas.

---

## 4. DEVELOPMENT ROADMAP (3 DAYS)

### Day 1: Foundation & 3D Setup
*   **Morning:** Initialize project (Vite, Tailwind, R3F).
*   **Afternoon:** Source/Create a suitable GLB model (Must have separate meshes for parts).
*   **Evening:** Implement basic Scene (Lights, Camera, OrbitControls) and load the Model.

### Day 2: Interaction Logic
*   **Morning:** Implement Raycasting (Click detection on meshes).
*   **Afternoon:** Build the UI Overlay (Info Panel, Title). Connect 3D clicks to UI state.
*   **Evening:** Create the "Data Store" (JSON file with descriptions for each part).

### Day 3: Polish & "Explode"
*   **Morning:** Implement "Exploded View" logic (animating mesh positions).
*   **Afternoon:** UI Polish (Fonts, Colors, Transitions).
*   **Evening:** Mobile responsiveness check and Vercel Deployment.

---

## 5. REMOVED FEATURES (For Future V2)
*   Authentication / User Profiles.
*   Stripe Payments / Subscriptions.
*   Backend API / Database.
*   Quizzes & Gamification.
*   Video Tutorials.
*   Multiple Models (Start with one).

---

## 6. NEXT STEPS
1.  **Confirm:** Does this reduced scope meet your expectations?
2.  **Asset:** Do you have a GLB model, or should we use a placeholder/open-source one?
3.  **Start:** Initialize the codebase.