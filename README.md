# Rescue Ready

Rescue Ready is a mobile-first emergency response application designed to help bystanders respond quickly during a sudden cardiac arrest event.

Live Demo:
https://emergency-aed-locato-u064.bolt.host/

---

## Overview

When cardiac arrest occurs, every second counts. Many bystanders are unsure what to do, where to find an Automated External Defibrillator (AED), or how to perform CPR correctly under pressure.

Rescue Ready provides:
- A guided Emergency Mode for real-time response
- Nearby AED location search and visualization
- CPR quick-reference instructions
- Live emergency timer
- AED route guidance
- Rescue session summary

The goal is to reduce hesitation and support faster intervention during emergencies.

---

## Key Features

### Emergency Mode

A step-by-step emergency workflow that guides users through critical actions:

1. Call emergency services
2. Begin chest compressions
3. Locate the nearest AED
4. Use the AED safely

The emergency timer remains active throughout the workflow to reinforce time-sensitive decision making.

### AED Locator

Users can:
- Search any location
- View nearby AED locations on an interactive map
- Identify the closest AED
- View estimated distance
- Follow a route from the selected location to the nearest AED

### CPR Quick Guide

A fast-reference CPR guide that includes:
- Recognition of cardiac arrest
- Compression instructions
- Recommended compression rate
- Compression depth
- AED usage reminders

### Rescue Summary

At the end of a rescue session, users can review a summary of actions taken during the emergency.

---

## Design Goals

This project was designed around three principles:

### Speed

Critical information should be accessible within seconds.

### Clarity

Users may be under stress and panic. The interface prioritizes simple language, clear hierarchy, and large touch targets.

### Mobile-First Experience

The application is designed to function like a native emergency response app rather than a traditional website.

---

## Target Users

- General public
- Students
- Office workers
- Community volunteers
- Anyone who may witness a cardiac arrest event

No prior CPR certification is required to use the application.

---

## Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet
- OpenStreetMap
- Bolt.new

---

## Running Locally

Clone the repository:

```bash
git clone <repository-url>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Live Deployment

Application URL:
https://emergency-aed-locato-u064.bolt.host/

---

## Disclaimer

Rescue Ready is an educational and decision-support tool.
It does not replace professional medical training, emergency medical services, CPR certification, or AED certification.
In a real emergency, always call emergency services immediately.
