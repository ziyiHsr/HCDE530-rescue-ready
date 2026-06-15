# Reflection

## What did you build?

I built Rescue Ready, a mobile-first emergency response application designed to help bystanders respond to sudden cardiac arrest events. The application combines CPR guidance, AED location search, and emergency response workflows into a single experience. Users can enter Emergency Mode and follow a structured sequence of actions, including calling emergency services, beginning chest compressions, locating an AED, and using the AED. The application also includes an interactive AED map, a CPR Quick Guide, and a rescue summary screen.

The project was motivated by the idea that many people know they should help during a cardiac emergency but do not know what to do in the moment. Rather than functioning as an educational website, Rescue Ready was designed as a decision-support tool that minimizes uncertainty and helps users take immediate action under stress.

## What decisions did you make?

One of the most important decisions was narrowing the scope of the project. Early ideas included broader CPR education and emergency information, but I focused the final product on the first few minutes after a cardiac arrest event. This allowed me to create a more coherent user experience and deliver a fully functional prototype.

I also chose a mobile-first approach because emergency situations are more likely to involve a phone than a desktop computer. Instead of designing a traditional information site, I prioritized guided workflows that tell users what to do next. Throughout development, I repeatedly simplified navigation, removed unnecessary features, and strengthened the connection between Emergency Mode and the AED map. These decisions helped maintain context and reduce cognitive load during stressful situations.

## What would you do differently?

If I continued developing the project, I would improve the reliability and coverage of AED location data. The current version uses demonstration data to support the prototype experience, but a production version would require access to verified AED databases and more comprehensive location coverage.

I would also expand the emergency support features. For example, the application could provide CPR pacing assistance through audio, vibration, or visual feedback. Another improvement would be offline functionality. In real emergencies, internet access may be unreliable, so storing critical CPR guidance locally would improve resilience and accessibility. Finally, I would conduct user testing with CPR-trained individuals and potential bystanders to better understand how the workflow performs under realistic conditions.

## What does this work demonstrate?

This project demonstrates C1 (Vibecoding and Rapid Prototyping), C4 (APIs and Data Acquisition), and C8 (Building and Deploying a Complete Tool).

For C1, I used Bolt to rapidly prototype and iterate on Rescue Ready. Rather than accepting the first generated version, I repeatedly refined the interface and workflow, including AED map interactions, emergency-mode navigation, the CPR guide, and the transition from a web-style layout to a mobile-app experience.

For C4, I integrated external AED location and mapping data into the application. This allowed users to search locations, view nearby AEDs, calculate distances, and navigate between emergency response steps and real-world AED information.

For C8, Rescue Ready was developed as a complete, deployable tool that addresses a real HCD problem. The final application combines emergency guidance, AED discovery, CPR instructions, and rescue summaries into a single user experience. Together, these features demonstrate my ability to design, build, iterate, and deploy a functional tool for a real-world use case.
