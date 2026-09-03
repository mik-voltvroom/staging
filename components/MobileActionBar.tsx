"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MobileActionBar() {
  const routeHref = "https://www.google.com/maps/dir/?api=1&destination=Euvelgunnerweg%2050%2C%209723%20CW%20Groningen&travelmode=driving";
  const pathname = usePathname();
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const form = document.querySelector(".contactForm, [data-mobile-action-anchor]");
    if (!form) {
      setFormInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [pathname]);

  return <div className={`mobileActionBar${formInView ? " isHidden" : ""}`} aria-label="Snelle acties" aria-hidden={formInView || undefined}>
    <a href="tel:+31502113883" data-vv-event="phone_click">Bel</a>
    <a href="/#advies" data-vv-event="chat_click">Chat</a>
    <a href={routeHref} target="_blank" rel="noopener noreferrer" data-vv-event="route_click">Route</a>
  </div>;
}
