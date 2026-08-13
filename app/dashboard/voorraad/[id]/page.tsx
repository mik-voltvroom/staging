"use client";
import { useEffect, useState, use } from "react";
import { VehicleForm } from "@/components/dashboard/VehicleForm";
import { getVehicles } from "@/lib/demo-store";
import type { Vehicle } from "@/types";
export default function EditVehiclePage({ params }: { params: Promise<{id:string}> }) { const {id}=use(params); const [vehicle,setVehicle]=useState<Vehicle|null|undefined>(undefined); useEffect(()=>setVehicle(getVehicles().find(v=>v.id===id)??null),[id]); if(vehicle===undefined)return <main className="container dashboardPage">Laden…</main>; if(!vehicle)return <main className="container dashboardPage"><h1>Auto niet gevonden</h1></main>; return <main className="container dashboardPage"><VehicleForm initial={vehicle}/></main>; }
