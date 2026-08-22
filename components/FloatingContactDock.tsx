export function FloatingContactDock() {
  const routeHref = "https://www.google.com/maps/dir/?api=1&destination=Euvelgunnerweg%2050%2C%209723%20CW%20Groningen&travelmode=driving";

  return (
    <aside className="floatingContactDock" aria-label="Snel contact">
      <a href="tel:+31502113883" data-vv-event="phone_click" aria-label="Bel Volt & Vroom">
        <span className="dockIcon" aria-hidden="true">☎</span><span>Bel</span>
      </a>
      <a href="/#advies" data-vv-event="chat_click" aria-label="Start een bericht aan Volt & Vroom">
        <span className="dockIcon" aria-hidden="true">◎</span><span>Chat</span>
      </a>
      <a href={routeHref} target="_blank" rel="noopener noreferrer" data-vv-event="route_click" aria-label="Plan route naar Volt & Vroom">
        <span className="dockIcon" aria-hidden="true">⌖</span><span>Route</span>
      </a>
    </aside>
  );
}
