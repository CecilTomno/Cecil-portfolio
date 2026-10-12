/* Settings you are most likely to change.
   Page text lives in index.html. Colors and fonts live in css/tokens.css. */
window.SITE_CONFIG = {
  /* Set to true once the site is hosted on your own domain (GitHub Pages, Vercel, Netlify).
     Videos then play inside the page. Leave false while opening the file straight from your computer. */
  embed: false,

  /* Your YouTube channel link, for example "https://www.youtube.com/@yourchannel".
     Leave it empty to hide the "Visit the channel" button. */
  channelUrl: "",

  /* One entry per tutorial, in the order you want them listed.
     id      the part after v= in the YouTube link (leave "" until the video exists)
     topic   Websites, Mobile apps or Web systems. A new topic gets its own filter button.
     length  optional, for example "12 min"
     points  up to three short bullets shown under the summary */
  videos: [
    {
      id: "",
      title: "Build a fast, responsive portfolio page",
      topic: "Websites",
      level: "Beginner",
      length: "",
      summary: "Start from an empty folder and finish with a clean one-page site that reads well on any screen.",
      points: ["Structure the page with semantic HTML", "Lay it out with grid and flexbox", "Test it at phone width"]
    },
    {
      id: "",
      title: "Make any layout work on a phone",
      topic: "Websites",
      level: "Beginner",
      length: "",
      summary: "Take a desktop-only layout and make it comfortable to use with one thumb.",
      points: ["Choose breakpoints from the content", "Size type and tap targets", "Stop sideways scrolling for good"]
    },
    {
      id: "",
      title: "Your first Flutter screen in one sitting",
      topic: "Mobile apps",
      level: "Beginner",
      length: "",
      summary: "Go from a blank project to a working screen running on a real phone.",
      points: ["Set up the project", "Build a list screen from widgets", "Run it on a device"]
    },
    {
      id: "",
      title: "Add mobile money payments to an app",
      topic: "Mobile apps",
      level: "Intermediate",
      length: "",
      summary: "Wire a payment request into an app and handle success and failure cleanly.",
      points: ["Plan the payment flow", "Call the payment service", "Confirm and record the result"]
    },
    {
      id: "",
      title: "A simple API with Node and PostgreSQL",
      topic: "Web systems",
      level: "Intermediate",
      length: "",
      summary: "Build a small API with a real database behind it, from the first route to the first query.",
      points: ["Create the routes", "Design the tables", "Return clear errors"]
    },
    {
      id: "",
      title: "Add sign-in with Firebase",
      topic: "Web systems",
      level: "Intermediate",
      length: "",
      summary: "Let people create an account and sign in, then protect what only they should see.",
      points: ["Set up the project", "Build the sign-in form", "Guard private pages"]
    }
  ]
};
