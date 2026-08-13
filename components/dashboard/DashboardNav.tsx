import Link from "next/link";
export function DashboardNav() {
  return <div className="dashboardNav container">
    <Link href="/dashboard" className="logo"><span>VOLT</span> & VROOM <small>OS</small></Link>
    <nav>
      <Link href="/dashboard">Overzicht</Link>
      <Link href="/dashboard/voorraad">Voorraad</Link>
      <Link href="/dashboard/leads">Leads</Link>
      <Link href="/dashboard/afspraken">Afspraken</Link>
      <Link href="/dashboard/offertes">Offertes</Link>
      <Link href="/dashboard/afleveringen">Afleveringen</Link>
      <Link href="/dashboard/werkplaats">Werkplaats</Link>
      <Link href="/dashboard/garantie">Garantie</Link>
      <Link href="/dashboard/finance">Finance</Link>
      <Link href="/dashboard/facturen">Facturen</Link>
      <Link href="/dashboard/kasstromen">Kasstromen</Link>
      <Link href="/dashboard/voorraadfinanciering">Financiering</Link>
      <Link href="/dashboard/management">Management</Link>
      <Link href="/dashboard/klantportaal">Klantportaal</Link>
      <Link href="/dashboard/automatisering">Automation</Link>
      <Link href="/dashboard/integraties">Integraties</Link>
      <Link href="/dashboard/audit">Audit</Link>
      <Link href="/" target="_blank">Website ↗</Link>
    </nav>
  </div>;
}
