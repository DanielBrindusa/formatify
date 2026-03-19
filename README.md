# Formatify --- Universal File Converter

A modern, browser-based file converter that runs **entirely
client-side**, supporting images, PDFs, and Office files --- with a
clean UI, preview system, and flexible output options.

------------------------------------------------------------------------

## Overview

Formatify is a **privacy-friendly, front-end-only file converter**
designed to:

-   Convert files instantly in the browser\
-   Avoid server uploads (everything stays local)\
-   Provide a clean, guided UX (Step 1 → Step 3 flow)\
-   Support multiple formats including **PDF, DOCX, XLSX, PNG, JPG,
    ICO**

------------------------------------------------------------------------

## Key Features

### Client-side processing

-   No backend required\
-   No file uploads\
-   Faster and more secure

### Smart conversion system

-   Output formats adapt dynamically based on input\
-   Built-in conversion matrix

### File preview

-   Image preview\
-   PDF first-page rendering\
-   DOCX & XLSX HTML preview

### Batch & advanced options

-   Convert to multiple formats at once\
-   Download all results as ZIP\
-   Preserve transparency\
-   Choose output size\
-   Adjust PDF render quality

### Progress & status feedback

-   Live progress bar\
-   Conversion states (idle / busy / success / error)

### Built-in monetization system

-   Configurable ad slots via JSON\
-   Admin panel (password protected)

------------------------------------------------------------------------

## Project Structure

    /project-root
    │
    ├── index.html
    ├── style.css
    ├── script.js
    ├── formatify.png
    ├── favicon.ico
    ├── ads-config.json
    └── README.md

------------------------------------------------------------------------

## Supported Conversions

### Images & Icons

-   PNG ⇄ JPG / JPEG / ICO / PDF\
-   JPG / JPEG ⇄ PNG / ICO / PDF\
-   ICO → PNG / JPG / JPEG / PDF

### PDF

-   PDF → PNG / JPG / JPEG\
-   PDF → TXT\
-   Images → PDF

### Office Files

-   DOCX → PDF / TXT\
-   XLSX → PDF / CSV / TXT

------------------------------------------------------------------------

## Limitations

-   DOCX/XLSX → PDF is not identical to Microsoft Office rendering\
-   Complex layouts may be simplified

------------------------------------------------------------------------

## How to Use

1.  Upload a file\
2.  Select output format\
3.  Configure options\
4.  Click Convert\
5.  Download results

------------------------------------------------------------------------

## Embed in Your Website

### Option 1 --- iframe

Steps:
1.  Deploy your app Upload the project to a hosting service (e.g. GitHubPages, your server, Netlify)
    -  Example URL: https://danielbrindusa.github.io/formatify/
2.  Copy the iframe code
3.  Paste it into your website
    -   Shopify → Custom Liquid section
    -   WordPress → HTML block
    -   Any website → inside your page HTML
4.  Adjust height if needed Example: height=“1000px”
5.  When to use:
    -   Fastest setup
    -   No risk of breaking your site 
6.  This entails
    -   Less customization

``` html
<iframe 
  src="https://danielbrindusa.github.io/formatify/"
  width="100%" 
  height="900px"
  style="border:none;">
</iframe>
```

### Option 2 --- Full integration

Steps:
1.  Copy project files into your website
Upload:
    -   index.html
    -   style.css
    -   script.js
    -   formatify.png
    -   favicon.ico
    -   ads-config.json
2.  Move HTML content into your page
    -   Open index.html
    -   Copy ONLY content inside
    ```<body>...</body>```
    -   Paste into your website page
    -   Do NOT copy ```<html>```, ```<head>```, ```<body>```
3.  Include CSS
Add this to your ```<head>```:
``` html
<link rel="stylesheet" href="/formatify/style.css">
```
4.  Include JavaScript
Add before closing ```<body>```:
``` html
<script src="/formatify/script.js" defer></script>
```
5.  Ensure dependencies load correctly
THe app already uses CDN libraries (like PDF.js, jsPDF inside script.js), so:
    -   No backend needed
    -   Just make sure internet access is allowed
6.  Test the integration
    -   Upload a file
    -   Check preview + conversion
    -   Verify downloads work

7.  When to use this:
    -   Full design control
    -   Better SEO (content is part of page)
    -   Can customize UI deeply

8.  This entails
    -   More setup effort

``` html
<link rel="stylesheet" href="/formatify/style.css">
<script src="/formatify/script.js" defer></script>
```

------------------------------------------------------------------------

## Customization
After embeding Formatify in your website using "Option 2 --- Full integration", the WebApp is fully customizable using CSS variables defined in style.css.
These variables control colors, backgrounds, UI accents, and overall theme.

How to customize
1. Open style.css
2. Find this section at the top
``` CSS
:root {
  /* variables here */
}
```
3. Change any value
4. Save and refresh your website

All available variables (explained)
1. Background colors
    -   Main app background colors
        ``` CSS
        --bg: #161239; /* dark blue */
        ```
    -   Used in gradients and base UI
        ``` CSS
        --bg-2: #251b57; /* dark purple */
        ```

2. Panels (cards, containers)
    -   Control the look of cards and sections
    -   Transparent glass effect
        ``` CSS
        --panel: rgba(30, 24, 74, 0.76);
        --panel-strong: rgba(28, 21, 66, 0.9);
        --panel-soft: rgba(255, 255, 255, 0.07);
        ```
To make it more solid
``` CSS
--panel: rgba(20, 20, 20, 0.95);
```

3. Borders
    -   Subtle UI outlines
        ``` CSS
        --border: rgba(255, 196, 132, 0.2);
        --border-strong: rgba(255, 196, 132, 0.34);
        ```
To make borders sharper
``` CSS
--border: rgba(255,255,255,0.3);
```

4. Text colors
``` CSS
--text: #f8f8ff; /* main text */
--muted: #d7d3ef; /* secondary text */
```

5. Accent colors
    -   Used for buttons, highlights, gradients
    -   These define your brand look
        ``` CSS
        --accent: #ff9b71;
        --accent-2: #76e5c6;
        --accent-3: #b08cff;
        ```
Example in Shopify-style blue
``` CSS
--accent: #5c6ac4;
--accent-2: #36c5f0;
--accent-3: #7f5af0;
```

6. Status colors
    -   Used for:
        -   success messages
        -   warnings
        -   errors
        ``` CSS
        --success: #85ebc7;
        --warning: #ffd66e;
        --danger: #ff9ca8;
        ```

7. Shadows
    -   Controls depth and elevation
        ``` CSS
        --shadow: 0 24px 70px rgba(12, 8, 35, 0.34);
        ```
Softer shadow
``` CSS
--shadow: 0 10px 30px rgba(0,0,0,0.2);
```

------------------------------------------------------------------------

### Ready-Made Themes for Formatify

Default (Enhanced Dark – polished version)
``` CSS
:root {
  --bg: #161239;
  --bg-2: #251b57;

  --panel: rgba(30, 24, 74, 0.85);
  --panel-strong: rgba(28, 21, 66, 0.95);
  --panel-soft: rgba(255, 255, 255, 0.08);

  --text: #f8f8ff;
  --muted: #cfcaf5;

  --accent: #ff9b71;
  --accent-2: #76e5c6;
  --accent-3: #b08cff;

  --success: #6ee7b7;
  --warning: #facc15;
  --danger: #fb7185;

  --border: rgba(255, 196, 132, 0.25);
  --border-strong: rgba(255, 196, 132, 0.4);

  --shadow: 0 24px 70px rgba(10, 8, 40, 0.45);
}
```

Minimal Dark (SaaS style)
``` CSS
:root {
  --bg: #0f172a;
  --bg-2: #020617;

  --panel: rgba(15, 23, 42, 0.9);
  --panel-strong: rgba(2, 6, 23, 0.95);
  --panel-soft: rgba(255,255,255,0.05);

  --text: #f1f5f9;
  --muted: #94a3b8;

  --accent: #38bdf8;
  --accent-2: #22c55e;
  --accent-3: #818cf8;

  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;

  --border: rgba(255,255,255,0.1);
  --border-strong: rgba(255,255,255,0.2);

  --shadow: 0 10px 40px rgba(0,0,0,0.5);
}
```

Light Theme (Clean & modern)
``` CSS
:root {
  --bg: #f9fafb;
  --bg-2: #e5e7eb;

  --panel: rgba(255,255,255,0.95);
  --panel-strong: rgba(255,255,255,1);
  --panel-soft: rgba(0,0,0,0.04);

  --text: #111827;
  --muted: #6b7280;

  --accent: #3b82f6;
  --accent-2: #10b981;
  --accent-3: #8b5cf6;

  --success: #16a34a;
  --warning: #f59e0b;
  --danger: #dc2626;

  --border: rgba(0,0,0,0.1);
  --border-strong: rgba(0,0,0,0.2);

  --shadow: 0 10px 30px rgba(0,0,0,0.08);
}
```

Shopify Style
``` CSS
:root {
  --bg: #0b0f0c;
  --bg-2: #111827;

  --panel: rgba(17, 24, 39, 0.95);
  --panel-strong: rgba(17, 24, 39, 1);
  --panel-soft: rgba(255,255,255,0.04);

  --text: #f9fafb;
  --muted: #9ca3af;

  --accent: #5c6ac4;
  --accent-2: #00a47c;
  --accent-3: #7f5af0;

  --success: #16a34a;
  --warning: #f59e0b;
  --danger: #ef4444;

  --border: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.15);

  --shadow: 0 20px 50px rgba(0,0,0,0.5);
}
```

Apple Style (Clean + soft)
``` CSS
:root {
  --bg: #f5f5f7;
  --bg-2: #e5e5ea;

  --panel: rgba(255,255,255,0.85);
  --panel-strong: rgba(255,255,255,1);
  --panel-soft: rgba(0,0,0,0.03);

  --text: #1d1d1f;
  --muted: #6e6e73;

  --accent: #0071e3;
  --accent-2: #34c759;
  --accent-3: #af52de;

  --success: #34c759;
  --warning: #ff9f0a;
  --danger: #ff3b30;

  --border: rgba(0,0,0,0.08);
  --border-strong: rgba(0,0,0,0.15);

  --shadow: 0 10px 25px rgba(0,0,0,0.08);
}
```

Neon / Cyber
``` CSS
:root {
  --bg: #0b0014;
  --bg-2: #14002b;

  --panel: rgba(20, 0, 50, 0.85);
  --panel-strong: rgba(15, 0, 40, 0.95);
  --panel-soft: rgba(255,255,255,0.06);

  --text: #f0f0ff;
  --muted: #b8b8ff;

  --accent: #ff00ff;
  --accent-2: #00ffff;
  --accent-3: #ffcc00;

  --success: #00ffcc;
  --warning: #ffcc00;
  --danger: #ff3366;

  --border: rgba(255,255,255,0.15);
  --border-strong: rgba(255,255,255,0.3);

  --shadow: 0 0 40px rgba(255, 0, 255, 0.25);
}
```

You can:
- Copy one of the ready-made themes
- Replace the `:root` section in style.css
- Instantly change the entire look of the app

No JavaScript or advanced knowledge required.


------------------------------------------------------------------------

## Ad System

Configured via `ads-config.json`

Default password: formatify-admin

------------------------------------------------------------------------

## Privacy

-   100% client-side\
-   No uploads

------------------------------------------------------------------------

## License

This project is proprietary software.

All rights reserved. Unauthorized copying, modification, or distribution is strictly prohibited.
