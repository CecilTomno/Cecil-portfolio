# Cecil Portfolio

A one-page portfolio for a web and app developer. Black and white, set like an 1820s printed broadside, with a lamp switch for dark mode, floating ink-dust particles, skills that light up in their brand colors, and a tutorial player for YouTube videos.

No build step and no dependencies. It is plain HTML, CSS and JavaScript.

## Run it

Open `index.html` in a browser. For a closer match to the live site, serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project layout

```
index.html            All the page text and structure
css/
  tokens.css          Colors and fonts (start here to restyle)
  base.css            Reset, shared helpers, buttons
  effects.css         Particles, loader, scroll rule
  header.css          Floating pill header
  theme-switch.css    Lamp button, reveal animation, lantern glow
  hero.css            Hero, engraved plate, typed line, ticker
  about.css           About, numbers, skills, process steps, maxim
  services.css        Services cards and FAQ
  work.css            Selected work and the tutorials player
  footer.css          Call to action and footer
js/
  config.js           Tutorials, channel link, embed switch (edit this)
  theme-init.js       Picks light or dark before first paint
  loader.js           Typeset loader
  skills.js           Tap-to-pin colors on touch screens
  contact.js          Copy email button
  tutorials.js        Tutorial player and filters
  particles.js        Floating particles
  motion.js           Typed line, scroll rule, count-up, process steps
  theme-switch.js     Light and dark switch
```

## What to edit

| To change | Open |
| --- | --- |
| Colors, fonts, dark mode palette | `css/tokens.css` |
| Name, headline, about text, services, FAQ, process steps | `index.html` |
| Email address and profile links | `index.html` (search for `EDIT`) |
| Selected work (the four specimen plates) | `index.html` (search for `Replace these specimen entries`) |
| Tutorials, YouTube channel link, video embedding | `js/config.js` |
| Skill names and colors | `index.html` (search for `skill-grid`) |
| Particle count and speed | `js/particles.js` (the `LAYERS` list at the top) |

### Add a tutorial

Add an entry to `videos` in `js/config.js`. The `id` is the part of the YouTube link after `v=`.

```js
{
  id: "dQw4w9WgXcQ",
  title: "Your lesson title",
  topic: "Websites",
  level: "Beginner",
  length: "12 min",
  summary: "One or two sentences about what the video covers.",
  points: ["First thing learned", "Second thing", "Third thing"]
}
```

Videos play inside the page once `embed` is set to `true`. Do that after the site is hosted on your own domain. Embedded YouTube players are often blocked when `index.html` is opened straight from your computer.

### Add a skill

Copy one `<li>` inside `.skill-grid` in `index.html`. `--c` is the brand color shown on hover and `--t` is the text color on top of it.

```html
<li><button class="skill" type="button" aria-pressed="false" style="--c:#3178C6;--t:#ffffff">
  <span class="top"><span class="cat">Language</span><i class="dot"></i></span>
  <span class="nm">TypeScript</span>
</button></li>
```

## Publish with GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then pick `main` and `/ (root)`.
4. Save. The site appears at `https://<your-username>.github.io/<repository-name>/` after a minute or two.

Vercel and Netlify also work. Import the repository and leave the build command empty.

## Accessibility and motion

- Every animation is skipped when the visitor's device is set to reduce motion.
- The theme follows the saved choice first, then the device setting, and the lamp button changes it.
- Skills, buttons and links all have visible keyboard focus.
