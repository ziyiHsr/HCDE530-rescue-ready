# MP2 Competency Claims

## C1 – Vibecoding and Rapid Prototyping

**Claim**

I demonstrated competency in vibecoding and rapid prototyping by using Bolt to design, build, iterate, and deploy Rescue Ready, a mobile-first emergency response application.

**Evidence**

The final deployed application is available at:

https://emergency-aed-locato-u064.bolt.host/

Throughout development, I used Bolt to generate and refine the application while making product and design decisions myself. The project went through multiple iterations, including redesigning the relationship between Emergency Mode and the AED map, simplifying navigation, removing redundant homepage actions, creating a CPR Guide page, improving AED visibility on the map, and refining emergency-state behavior across screens. Rather than accepting generated output as-is, I continuously adjusted prompts and specifications until the application matched the intended user experience.

---

## C4 – APIs and Data Acquisition

**Claim**

I demonstrated competency in APIs and data acquisition by integrating location-based data and external mapping services into Rescue Ready.

**Evidence**

The application uses browser geolocation to determine a user's position and retrieve location-specific information. I also incorporated OpenStreetMap-based AED location data to populate the AED map and support AED discovery workflows. Users can search locations, view nearby AEDs, and identify the closest AED relative to a selected location.

To support the experience, I had to understand how location data is represented, how search results are returned, and how external geographic data could be incorporated into a user-facing workflow. The API-derived information is used throughout the application to support emergency decision making rather than simply displaying raw data.

---

## C7 – Critical Evaluation and Professional Judgment

**Claim**

I demonstrated competency in critical evaluation and professional judgment by repeatedly evaluating, correcting, and refining AI-generated output during development.

**Evidence**

Several generated solutions did not align with the intended emergency-response workflow. For example, early versions treated the AED map and Emergency Mode as completely separate experiences, which caused users to lose context while navigating between screens. I redesigned the interaction so users could access AED information while maintaining an active emergency session.

I also removed redundant homepage actions, simplified navigation, improved the visibility of AED markers, and revised location-search behavior when generated implementations did not adequately support the user scenario. These decisions required evaluating whether AI-generated solutions actually met user needs rather than accepting them by default.

---

## C8 – Building and Deploying a Complete Tool

**Claim**

I demonstrated competency in building and deploying a complete tool by creating and publishing a functional emergency-response application for a real human-centered design use case.

**Evidence**

Rescue Ready is a deployed application that supports AED discovery, CPR guidance, emergency workflows, and rescue-session tracking. The project progressed from an initial concept to a publicly accessible prototype with multiple connected features and a complete user flow.

The most significant challenge was balancing project scope with implementation feasibility. I initially explored broader emergency and CPR education concepts but ultimately narrowed the project to the critical first minutes of a cardiac arrest response. This decision allowed me to deliver a cohesive, usable, and deployed application rather than a collection of partially implemented features.
