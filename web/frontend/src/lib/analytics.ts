import ReactGA from "react-ga4";

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initAnalytics = (): void => {
  if (!GA_ID) {
    console.warn("Google Analytics ID is missing");
    return;
  }

  ReactGA.initialize(GA_ID);
};

export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void => {
  if (!GA_ID) return;

  ReactGA.event(eventName, params);
};
