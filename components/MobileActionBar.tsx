export function MobileActionBar() {
  const routeHref = "https://www.google.com/maps/dir/?api=1&destination=Euvelgunnerweg%2050%2C%209723%20CW%20Groningen&travelmode=driving";
  return <div className="mobileActionBar" aria-label="Snelle acties">
    <a href="tel:+31502113883" data-vv-event="phone_click">Bel</a>
    <a href="/#advies" data-vv-event="chat_click">Chat</a>
    <a href={routeHref} target="_blank" rel="noopener noreferrer" data-vv-event="route_click">Route</a>
  </div>;
}
