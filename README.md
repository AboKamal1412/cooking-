AL-TABIKH — Redesigned Website
=================================

FOLDER STRUCTURE:
-----------------
project/
├── HTML/
│   ├── home.html                      ← Open this to start!
│   ├── upload.html                    ← Submit a new recipe
│   ├── recipe.html                    ← Auto-generated page for community recipes
│   ├── Grilled_Salmon.html
│   ├── Vegetable_Pasta.html
│   ├── Chicken_Curry.html
│   ├── Chocolate_Cake.html
│   ├── Chocolate_Lava_Cake.html
│   ├── Creamy_Mushroom_Risotto.html
│   ├── Lemon_Garlic_Roast_Chicken.html
│   ├── Tofu_Larb.html
│   └── Vietnamese_Coffee_Smoothie.html
│
├── CSS/
│   ├── styles.css                     ← Main site styles
│   └── styles2.css                    ← Recipe page styles
│
├── javascript/
│   ├── script.js                      ← Main site JS
│   └── script2.js                     ← Recipe page JS
│
└── image/                             ← Your existing image folder (keep as-is)
    ├── Grilled Salmon.jpg
    ├── Chicken Curry.jpg
    └── ...

HOW IT WORKS — COMMUNITY RECIPES:
----------------------------------
1. A visitor goes to upload.html and fills in their recipe
2. On submit → recipe saved to browser localStorage instantly
3. Page auto-redirects to recipe.html?id=<timestamp>
4. recipe.html reads the ID from the URL, loads the recipe data,
   and renders a FULL recipe page dynamically — timer, reviews, everything
5. Back on home.html, the community recipe appears in the grid
   under a "🌟 Community Recipes" label

TO OPEN:
--------
Place the project/ folder anywhere on your computer.
Open HTML/home.html in your browser. No server needed!

FEATURES:
---------
Dark Mode (saved between visits)
Search + filter by category + cook time
Save/bookmark favourite recipes (persists in browser)
Recipe upload form → instantly creates full recipe page
Star ratings + written reviews on every recipe
Clickable ingredient checklists
Pause/resume cooking timer
Community recipes shown on homepage
Responsive on all screen sizes
Smooth scroll animations
