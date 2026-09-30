# NEXUS — Browsing, Redefined

A responsive, single-page concept website for NEXUS, a browser experience with three browsing modes and a connected set of privacy, productivity, and research tools. The page uses a cinematic dark visual style and includes interactive previews of the product concept.

## Preview locally

This is a static site with no build step or package dependencies. From the project directory, start a local server:

```bash
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173).

## What’s on the page

- **Browsing modes:** switch between Default, Balanced, and Performance to update the product mockup and page accents.
- **Product concepts:** previews for NEXUS Shield, Notes, Intelligence, Markets, and VPN.
- **Responsive layout:** navigation and page sections adapt to smaller screens.
- **Reduced motion support:** animations respect the operating system’s reduced-motion preference.

The interface is a visual concept. Product screens and status indicators are illustrative and do not connect to a live browser or services.

## Project files

- `index.html` — page content and product previews
- `styles.css` — layout, styling, responsive rules, and mode themes
- `script.js` — navigation and interactive previews
- `assets/` — NEXUS logo and mode emblem images

## License

This project is licensed under the [MIT License](LICENSE).
