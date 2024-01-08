import config from "../course.json";

const DEFAULT_CONFIG = {
  author: {
    name: "ThePrimeagen",
    company: "Netflix",
  },
  title: "A Light Introduction Into HTMX",
  subtitle: "The greatest not frontend frontend framework of all time",
  frontendMastersLink: "https://frontendmasters.com/courses/htmx",
  description: "HTMX... is it just a horse head library or is it more?",
  keywords: ["ThePrimeagen", "Live Coding", "HTMX", "Golang", "Go"],
  social: {
    twitter: "ThePrimeagen",
    twitch: "ThePrimeagen",
    youtube: "ThePrimeagen",
  },
  productionBaseUrl: "/",
};

export default function getCourseConfig() {
  return Object.assign({}, DEFAULT_CONFIG, config);
}
