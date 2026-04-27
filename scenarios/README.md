# scenarios folder

This folder is for separating the social-scenario system into smaller files.

## Current files

- `scenario-visuals.js`  
  Manages background images for each scenario.

- `background-flow.js`  
  Manages the background-first flow: students read the background first, then start answering questions.

## Still kept for safety

- `../extra-scenarios.js`  
  Still keeps the actual extra scenario data and registration logic for now. This avoids breaking the website while the project is being reorganised.

## Suggested next step

Later, split `extra-scenarios.js` into:

- `scenario-data.js` — scenario content only
- `scenario-register.js` — registration and card rendering only
