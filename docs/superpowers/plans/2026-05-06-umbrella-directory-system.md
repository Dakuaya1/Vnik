# Umbrella Directory System - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static React webapp into a growable property directory with an admin panel for daily property additions, with the UI automatically reflecting new entries.

**Architecture:** Separate the hardcoded `PROPS` array into a JSON data file + admin panel. The React app reads from the data file (bundled at build time for Vite). Add a `/admin` route for property management with image upload to `/public/uploads`.

**Tech Stack:** React 18 + Vite, Lucide React, Framer Motion (existing), Node.js fs for build-time data compilation

---

## File Structure

```
/Users/priyanshu-ai/Desktop/Umbrella/
├── data/
│   └── properties.json        # All property data (source of truth)
├── public/
│   └── uploads/               # Property images
├── src/
│   ├── data/
│   │   └── properties.js      # Auto-generated from data/properties.json at build
│   ├── components/
│   │   ├── PropertyCard.jsx    # Extract from App.jsx
│   │   ├── PropertyRow.jsx     # Extract from App.jsx
│   │   └── AdminPropertyForm.jsx  # NEW: Add/Edit property form
│   ├── pages/
│   │   ├── HomePage.jsx        # Extract from App.jsx
│   │   ├── ExplorePage.jsx      # Extract from App.jsx
│   │   ├── SavedPage.jsx       # Extract from App.jsx
│   │   ├── ComparePage.jsx     # Extract from App.jsx
│   │   ├── ChatPage.jsx        # Extract from App.jsx
│   │   └── AdminPage.jsx       # NEW: Admin panel
│   ├── App.jsx                 # Simplified, routes to pages
│   └── main.jsx                # (unchanged)
├── scripts/
│   └── compile-data.js         # NEW: Node script to generate properties.js from JSON
├── admin.html                  # NEW: Standalone admin panel (simple HTML/JS)
└── vite.config.js              # (modified for data compilation)
```

---

## Task 1: Create Property Data Schema & Sample Data

**Files:**
- Create: `data/properties.json`
- Modify: `vite.config.js` (add copy plugin)

- [ ] **Step 1: Create data directory and properties.json**

Run: `mkdir -p /Users/priyanshu-ai/Desktop/Umbrella/data`

Create `data/properties.json` with your existing 50 properties converted to JSON format:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-05-06T00:00:00.000Z",
  "properties": [
    {
      "id": 1,
      "title": "Skyline Residences",
      "loc": "Baner, Pune",
      "price": "₹1.45 Cr",
      "priceSub": "3 BHK · 1680 sq.ft",
      "type": "buy",
      "bhk": 3,
      "sqft": 1680,
      "img": "/uploads/property-1.jpg",
      "gallery": [
        "/uploads/property-1.jpg",
        "/uploads/property-1a.jpg"
      ],
      "tags": ["featured"],
      "amenities": ["Furnished", "Parking", "Lift", "Security", "Swimming Pool", "Gym", "Clubhouse"],
      "desc": "Spacious 3 BHK with modern amenities...",
      "yield": 4.5,
      "agent": {
        "name": "Sarah Kapoor",
        "phone": "+91 98765 43210",
        "img": "https://i.pravatar.cc/100?img=44"
      },
      "features": ["Vastu Compliant", "Sea View", "Corner Unit", "High Floor"],
      "addedDate": "2026-05-01"
    }
    // ... remaining 49 properties
  ]
}
```

- [ ] **Step 2: Update vite.config.js to copy data folder**

Install: `cd /Users/priyanshu-ai/Desktop/Umbrella && npm install vite-plugin-static-copy -D`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'data/properties.json', dest: 'data' },
        { src: 'public', dest: '.' }
      ]
    })
  ],
})
```

- [ ] **Step 3: Commit**

```bash
cd /Users/priyanshu-ai/Desktop/Umbrella
git add data/properties.json vite.config.js package.json package-lock.json
git commit -m "feat: add properties data schema and static copy plugin"
```

---

## Task 2: Create Data Compilation Script

**Files:**
- Create: `scripts/compile-data.js`

- [ ] **Step 1: Create scripts directory and compile script**

Create `scripts/compile-data.js`:

```javascript
import fs from 'fs';
import path from 'path';

const dataPath = path.resolve('./data/properties.json');
const outputPath = path.resolve('./src/data/properties.js');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const jsContent = `// AUTO-GENERATED - Do not edit manually
// Generated at: ${new Date().toISOString()}

export const DATA_VERSION = '${data.version}';
export const LAST_UPDATED = '${data.lastUpdated}';

export const PROPS = ${JSON.stringify(data.properties, null, 2)};

export default PROPS;
`;

fs.writeFileSync(outputPath, jsContent);
console.log(`✓ Generated ${outputPath} with ${data.properties.length} properties`);
```

- [ ] **Step 2: Update package.json scripts**

Add to package.json scripts:
```json
"scripts": {
  "dev": "node scripts/compile-data.js && vite",
  "build": "node scripts/compile-data.js && vite build",
  "compile-data": "node scripts/compile-data.js"
}
```

- [ ] **Step 3: Run compilation and verify**

Run: `cd /Users/priyanshu-ai/Desktop/Umbrella && node scripts/compile-data.js`
Expected: Creates `src/data/properties.js` with export

- [ ] **Step 4: Commit**

```bash
git add scripts/compile-data.js package.json src/data/
git commit -m "feat: add data compilation script"
```

---

## Task 3: Extract Pages from App.jsx

**Files:**
- Create: `src/pages/HomePage.jsx`
- Create: `src/pages/ExplorePage.jsx`
- Create: `src/pages/SavedPage.jsx`
- Create: `src/pages/ComparePage.jsx`
- Create: `src/pages/ChatPage.jsx`
- Create: `src/pages/DetailPage.jsx`
- Create: `src/components/PropertyCard.jsx`
- Create: `src/components/PropertyRow.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create PropertyCard component**

Create `src/components/PropertyCard.jsx`:

```jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin } from 'lucide-react';

function PropertyCard({ p, wide = false, onClick, savedIds = [], onSaveToggle }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const isSaved = savedIds.includes(p.id);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      className={`prop-card ${wide ? 'prop-card-wide' : ''}`}
      whileHover={{ y: -10 }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      style={{ '--mouse-x': `${mousePos.x}%`, '--mouse-y': `${mousePos.y}%` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ... rest of property card JSX from App.jsx lines 266-319 */}
    </motion.div>
  );
}

export default PropertyCard;
```

- [ ] **Step 2: Create PropertyRow component**

Create `src/components/PropertyRow.jsx`:

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import PropertyCard from './PropertyCard';

function PropertyRow({ title, properties, onSelect, savedIds, onSaveToggle }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <motion.div
        className="row-header"
        style={{ padding: '0 4px' }}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="row-title">{title}</div>
        <button className="row-view-all">View all</button>
      </motion.div>
      <div className="row-scroll">
        {properties.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              type: 'spring',
              stiffness: 100,
              damping: 15
            }}
          >
            <PropertyCard
              p={p}
              wide={true}
              onClick={() => onSelect(p)}
              savedIds={savedIds}
              onSaveToggle={onSaveToggle}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default PropertyRow;
```

- [ ] **Step 3: Create HomePage**

Create `src/pages/HomePage.jsx` - extract from App.jsx lines 368-516

- [ ] **Step 4: Create ExplorePage, SavedPage, ComparePage, ChatPage, DetailPage**

Each extracted from App.jsx, importing PropertyCard, PropertyRow, and PROPS from `../data/properties.js`

- [ ] **Step 5: Update App.jsx to use extracted pages**

```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import SavedPage from './pages/SavedPage';
import ComparePage from './pages/ComparePage';
import ChatPage from './pages/ChatPage';
import SwipeMode from './components/SwipeMode';
import MatchScreen from './components/MatchScreen';
import DetailPage from './pages/DetailPage';
import { PROPS } from './data/properties';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [savedIds, setSavedIds] = useState([1, 2]);
  // ... rest of state and handlers
}

export default App;
```

- [ ] **Step 6: Run dev server and verify**

Run: `npm run dev`
Expected: App works exactly as before, no visual changes

- [ ] **Step 7: Commit**

```bash
git add src/pages/ src/components/PropertyCard.jsx src/components/PropertyRow.jsx src/App.jsx
git commit -m "refactor: extract pages and components from App.jsx"
```

---

## Task 4: Create Admin Panel

**Files:**
- Create: `public/uploads/.gitkeep`
- Create: `admin.html`
- Create: `src/pages/AdminPage.jsx` (optional, for in-app admin)

- [ ] **Step 1: Create public/uploads directory**

Run: `mkdir -p /Users/priyanshu-ai/Desktop/Umbrella/public/uploads && touch /Users/priyanshu-ai/Desktop/Umbrella/public/uploads/.gitkeep`

- [ ] **Step 2: Create standalone admin.html**

Create `admin.html` - a complete standalone page for adding/editing properties:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Umbrella Admin - Property Management</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --gold: #C9A84C;
      --bg: #050505;
      --bg2: #0A0A0C;
      --text: #F0EDE8;
      --text2: #9A9490;
      --border: rgba(255,255,255,0.08);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      padding: 40px;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }
    .brand { font-size: 24px; font-weight: 700; color: var(--gold); }
    .stats { display: flex; gap: 24px; }
    .stat { background: var(--bg2); padding: 16px 24px; border-radius: 12px; border: 1px solid var(--border); }
    .stat-value { font-size: 32px; font-weight: 700; color: var(--gold); }
    .stat-label { font-size: 12px; color: var(--text2); text-transform: uppercase; letter-spacing: 1px; }
    .container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 350px 1fr; gap: 32px; }
    .form-section { background: var(--bg2); padding: 32px; border-radius: 20px; border: 1px solid var(--border); }
    .section-title { font-size: 18px; font-weight: 600; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
    .form-group { margin-bottom: 20px; }
    .form-label { display: block; font-size: 13px; color: var(--text2); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      color: var(--text);
      font-family: inherit;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--gold);
    }
    .form-textarea { min-height: 100px; resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .amenities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .amenity-tag {
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .amenity-tag.selected { background: rgba(201,168,76,0.15); border-color: var(--gold); color: var(--gold); }
    .btn-primary {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, var(--gold), #E8C97A);
      color: #000;
      border: none;
      border-radius: 14px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.3); }
    .properties-section { background: var(--bg2); border-radius: 20px; border: 1px solid var(--border); overflow: hidden; }
    .properties-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .properties-list { max-height: 600px; overflow-y: auto; }
    .property-item {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 16px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border);
      align-items: center;
    }
    .property-item:last-child { border-bottom: none; }
    .property-thumb { width: 80px; height: 60px; border-radius: 8px; object-fit: cover; background: var(--bg3); }
    .property-info h3 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .property-info p { font-size: 12px; color: var(--text2); }
    .property-price { font-size: 16px; font-weight: 600; color: var(--gold); }
    .property-actions { display: flex; gap: 8px; }
    .btn-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text2); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon:hover { background: var(--gold); color: #000; }
    .upload-zone {
      border: 2px dashed var(--border);
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .upload-zone:hover { border-color: var(--gold); }
    .upload-zone input { display: none; }
    .image-preview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px; }
    .image-preview img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="admin-header">
    <div class="brand">UMBRELLA ADMIN</div>
    <div class="stats">
      <div class="stat">
        <div class="stat-value" id="totalCount">50</div>
        <div class="stat-label">Total Properties</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="rentCount">35</div>
        <div class="stat-label">For Rent</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="buyCount">15</div>
        <div class="stat-label">For Sale</div>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="form-section">
      <div class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Add New Property
      </div>

      <form id="propertyForm">
        <div class="form-group">
          <label class="form-label">Property Title *</label>
          <input type="text" class="form-input" id="title" placeholder="e.g., Skyline Residences" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Location *</label>
            <input type="text" class="form-input" id="loc" placeholder="e.g., Baner, Pune" required>
          </div>
          <div class="form-group">
            <label class="form-label">Type *</label>
            <select class="form-select" id="type" required>
              <option value="rent">For Rent</option>
              <option value="buy">For Sale</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Price *</label>
            <input type="text" class="form-input" id="price" placeholder="e.g., ₹45 L or ₹30,000" required>
          </div>
          <div class="form-group">
            <label class="form-label">Price Subtext</label>
            <input type="text" class="form-input" id="priceSub" placeholder="e.g., 3 BHK · 1680 sq.ft">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">BHK</label>
            <select class="form-select" id="bhk">
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
              <option value="4.5">4.5 BHK</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sq. Ft</label>
            <input type="number" class="form-input" id="sqft" placeholder="e.g., 1200">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Tags</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <label style="cursor: pointer;"><input type="checkbox" id="tagFeatured" style="margin-right: 6px;">Featured</label>
            <label style="cursor: pointer;"><input type="checkbox" id="tagNew" style="margin-right: 6px;">New</label>
            <label style="cursor: pointer;"><input type="checkbox" id="tagPremium" style="margin-right: 6px;">Premium</label>
            <label style="cursor: pointer;"><input type="checkbox" id="tagHot" style="margin-right: 6px;">Hot</label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" id="desc" placeholder="Property description..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Amenities</label>
          <div class="amenities-grid">
            <div class="amenity-tag" data-amenity="Furnished">Furnished</div>
            <div class="amenity-tag" data-amenity="Parking">Parking</div>
            <div class="amenity-tag" data-amenity="Security">Security</div>
            <div class="amenity-tag" data-amenity="Lift">Lift</div>
            <div class="amenity-tag" data-amenity="Gym">Gym</div>
            <div class="amenity-tag" data-amenity="Pool">Pool</div>
            <div class="amenity-tag" data-amenity="Garden">Garden</div>
            <div class="amenity-tag" data-amenity="CCTV">CCTV</div>
            <div class="amenity-tag" data-amenity="Power Backup">Power Backup</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Property Images</label>
          <div class="upload-zone" id="uploadZone">
            <input type="file" id="images" accept="image/*" multiple>
            <p style="color: var(--text2); margin-bottom: 8px;">Click or drag images here</p>
            <p style="font-size: 12px; color: var(--text2);">PNG, JPG up to 5MB each</p>
          </div>
          <div class="image-preview" id="imagePreview"></div>
        </div>

        <button type="submit" class="btn-primary">Add Property</button>
      </form>
    </div>

    <div class="properties-section">
      <div class="properties-header">
        <h2 style="font-size: 18px; font-weight: 600;">All Properties</h2>
        <input type="text" class="form-input" style="width: 200px;" placeholder="Search..." id="searchProps">
      </div>
      <div class="properties-list" id="propertiesList">
        <!-- Populated by JS -->
      </div>
    </div>
  </div>

  <script>
    let properties = JSON.parse(localStorage.getItem('umbrella_properties') || '[]');
    let selectedAmenities = [];

    // Amenity tag selection
    document.querySelectorAll('.amenity-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const amenity = tag.dataset.amenity;
        if (selectedAmenities.includes(amenity)) {
          selectedAmenities = selectedAmenities.filter(a => a !== amenity);
          tag.classList.remove('selected');
        } else {
          selectedAmenities.push(amenity);
          tag.classList.add('selected');
        }
      });
    });

    // Image upload preview
    const uploadZone = document.getElementById('uploadZone');
    const imageInput = document.getElementById('images');
    const imagePreview = document.getElementById('imagePreview');

    uploadZone.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', (e) => {
      imagePreview.innerHTML = '';
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });

    // Form submit
    document.getElementById('propertyForm').addEventListener('submit', (e) => {
      e.preventDefault();

      const newProperty = {
        id: Date.now(),
        title: document.getElementById('title').value,
        loc: document.getElementById('loc').value,
        price: document.getElementById('price').value,
        priceSub: document.getElementById('priceSub').value,
        type: document.getElementById('type').value,
        bhk: parseInt(document.getElementById('bhk').value),
        sqft: parseInt(document.getElementById('sqft').value) || 0,
        img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        gallery: [],
        tags: [
          document.getElementById('tagFeatured').checked ? 'featured' : '',
          document.getElementById('tagNew').checked ? 'new' : '',
          document.getElementById('tagPremium').checked ? 'premium' : '',
          document.getElementById('tagHot').checked ? 'hot' : ''
        ].filter(t => t),
        amenities: selectedAmenities,
        desc: document.getElementById('desc').value,
        yield: 5.0,
        agent: { name: 'Umbrella Agent', phone: '+91 98765 43210', img: 'https://i.pravatar.cc/100?img=33' },
        features: [],
        addedDate: new Date().toISOString().split('T')[0]
      };

      properties.unshift(newProperty);
      localStorage.setItem('umbrella_properties', JSON.stringify(properties));
      renderProperties();
      updateStats();
      e.target.reset();
      selectedAmenities = [];
      document.querySelectorAll('.amenity-tag').forEach(t => t.classList.remove('selected'));
      imagePreview.innerHTML = '';

      alert('Property added successfully!');
    });

    function renderProperties(filter = '') {
      const list = document.getElementById('propertiesList');
      const filtered = properties.filter(p =>
        p.title.toLowerCase().includes(filter.toLowerCase()) ||
        p.loc.toLowerCase().includes(filter.toLowerCase())
      );

      list.innerHTML = filtered.map(p => `
        <div class="property-item">
          <img src="${p.img}" class="property-thumb" alt="${p.title}">
          <div class="property-info">
            <h3>${p.title}</h3>
            <p>${p.loc} · ${p.bhk} BHK · ${p.sqft} sq.ft</p>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="property-price">${p.price}</div>
            <div class="property-actions">
              <button class="btn-icon" onclick="editProperty(${p.id})">✏️</button>
              <button class="btn-icon" onclick="deleteProperty(${p.id})">🗑️</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    function updateStats() {
      document.getElementById('totalCount').textContent = properties.length;
      document.getElementById('rentCount').textContent = properties.filter(p => p.type === 'rent').length;
      document.getElementById('buyCount').textContent = properties.filter(p => p.type === 'buy').length;
    }

    function deleteProperty(id) {
      if (confirm('Delete this property?')) {
        properties = properties.filter(p => p.id !== id);
        localStorage.setItem('umbrella_properties', JSON.stringify(properties));
        renderProperties();
        updateStats();
      }
    }

    document.getElementById('searchProps').addEventListener('input', (e) => {
      renderProperties(e.target.value);
    });

    // Initial render
    renderProperties();
    updateStats();
  </script>
</body>
</html>
```

- [ ] **Step 3: Test admin panel**

Run: `open /Users/priyanshu-ai/Desktop/Umbrella/admin.html`
Expected: Admin panel loads, can add properties that save to localStorage

- [ ] **Step 4: Add export functionality to sync with data file**

Add export button to admin.html that downloads `data/properties.json`:

```javascript
function exportProperties() {
  const data = JSON.stringify({ version: '1.0.0', lastUpdated: new Date().toISOString(), properties }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'properties.json';
  a.click();
}
```

- [ ] **Step 5: Commit**

```bash
git add admin.html public/uploads/.gitkeep
git commit -m "feat: add admin panel for property management"
```

---

## Task 5: Add "New Properties" Highlight

**Files:**
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/data/properties.js` (generated)

- [ ] **Step 1: Update HomePage to show "Recently Added" row**

In HomePage.jsx, add a row that shows properties sorted by `addedDate` (newest first):

```jsx
// Add this to HomePage after the other rows
<PropertyRow
  title="Recently Added"
  properties={[...PROPS].sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate)).slice(0, 4)}
  onSelect={onSelect}
  savedIds={savedIds}
  onSaveToggle={onSaveToggle}
/>
```

- [ ] **Step 2: Run dev server and verify**

Run: `npm run dev`
Expected: "Recently Added" row appears on home page with newest properties first

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.jsx
git commit -m "feat: add recently added properties row on home page"
```

---

## Task 6: Fix Missing CSS and Add props-grid

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add props-grid and any missing styles**

Add to `src/index.css`:

```css
/* Missing grid for saved/compare pages */
.props-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .props-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
}

/* Fix for row-scroll spacing on mobile */
@media (max-width: 576px) {
  .row-scroll {
    gap: 12px;
  }
  .row-scroll .prop-card {
    width: 200px;
  }
}
```

- [ ] **Step 2: Run dev server and verify**

Run: `npm run dev`
Expected: Saved page displays grid correctly

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "fix: add missing props-grid styles"
```

---

## Task 7: Daily Workflow Documentation

**Files:**
- Create: `ADMIN_WORKFLOW.md`

- [ ] **Step 1: Create workflow documentation**

Create `ADMIN_WORKFLOW.md`:

```markdown
# Umbrella Property Directory - Admin Workflow

## Daily Property Addition Process

### Step 1: Open Admin Panel
```
Open /Users/priyanshu-ai/Desktop/Umbrella/admin.html
```

### Step 2: Add New Property
1. Fill in property details (title, location, price, BHK, etc.)
2. Select amenities by clicking tags
3. Add description
4. Click "Add Property"

### Step 3: Export Data
1. Click "Export JSON" button (add this to admin panel)
2. Save `properties.json` to `/Users/priyanshu-ai/Desktop/Umbrella/data/`

### Step 4: Rebuild Frontend
```bash
cd /Users/priyanshu-ai/Desktop/Umbrella
npm run build
```

### Step 5: Deploy
Copy `dist/` folder to your hosting (Vercel, Netlify, etc.)

## Quick Add (Without Rebuild)

For testing without rebuilding, the admin uses localStorage:
1. Add properties in admin.html → saves to localStorage
2. Run dev server → reads from `src/data/properties.js`

For production, always export + rebuild.

## Property Data Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | auto | Unique ID (timestamp) |
| title | string | yes | Property name |
| loc | string | yes | Location (Area, City) |
| price | string | yes | Price with ₹ symbol |
| priceSub | string | no | e.g., "3 BHK · 1200 sq.ft" |
| type | string | yes | "rent" or "buy" |
| bhk | number | yes | 1, 2, 3, 4, 4.5 |
| sqft | number | yes | Carpet area |
| img | string | yes | Main image URL |
| gallery | array | no | Additional image URLs |
| tags | array | no | "featured", "new", "premium", "hot" |
| amenities | array | no | List of amenities |
| desc | string | no | Full description |
| yield | number | no | Rental yield % |
| agent | object | no | Agent info |
| features | array | no | Property features |
| addedDate | string | auto | YYYY-MM-DD format |
```

- [ ] **Step 2: Commit**

```bash
git add ADMIN_WORKFLOW.md
git commit -m "docs: add admin workflow documentation"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create JSON data schema + copy plugin | data/properties.json, vite.config.js |
| 2 | Build data compilation script | scripts/compile-data.js |
| 3 | Extract App.jsx into pages | src/pages/*.jsx, src/components/*.jsx |
| 4 | Create admin panel | admin.html |
| 5 | Add "Recently Added" row | src/pages/HomePage.jsx |
| 6 | Fix missing CSS | src/index.css |
| 7 | Document workflow | ADMIN_WORKFLOW.md |

**Total: 7 tasks**

---

## Execution Options

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**