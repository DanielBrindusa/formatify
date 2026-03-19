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

``` html
<iframe 
  src="https://your-domain.com/formatify/index.html"
  width="100%" 
  height="900px"
  style="border:none;">
</iframe>
```

### Option 2 --- Full integration

``` html
<link rel="stylesheet" href="/formatify/style.css">
<script src="/formatify/script.js" defer></script>
```

------------------------------------------------------------------------

## Customization

Edit CSS variables:

``` css
:root {
  --accent: #ff9b71;
}
```

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

Free to use and modify.
