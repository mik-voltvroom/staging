import { Header } from "@/components/Header";
import { InventoryBrowser } from "@/components/InventoryBrowser";
import { listPublicVehicles } from "@/lib/repositories/public-vehicle-repository";
import styles from "./inventory.module.css";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const vehicles = await listPublicVehicles(100);

  return <div className={styles.page}>
    <Header />
    <main className={styles.main}>
      <header className={styles.intro}>
        <div><p>Volt &amp; Vroom selectie</p><h1>Vind de auto die<br />bij uw gebruik past.</h1></div>
        <p>Filter de actuele voorraad op wat voor u telt. Per auto tonen we alleen bekende gegevens en leggen we uit wat nog niet beschikbaar is.</p>
      </header>
      <InventoryBrowser vehicles={vehicles} />
    </main>
  </div>;
}
