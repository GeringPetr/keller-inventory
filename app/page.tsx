"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const objectsSeed = [
  ["Rosenau", "Rosenau 4"],
  ["AM Mainflecklein + Hohenzollern", "Hohenzollernring 42"],
  ["App21", "Stuckberg 19"],
  ["SM9, SM13", "Schleiermacher 13"],
  ["LM1", "Lise-Meitner 1"],
  ["Wahnfried (W)", "Rathstraße 2"],
  ["FL", "Dilcherstraße 3"],
  ["Easy Sleep", "Rathenaustraße 42"],
];

const itemsSeed = [
  ["Toilettenpapier", "Туалетная бумага", "Toilet paper", "P", 2, 5],
  ["Küchenpapier", "Кухонная бумага", "Kitchen paper", "P", 2, 5],
  ["Blaues Papier", "Синяя бумага", "Blue paper", "P", 2, 3],
  ["Pergamentpapier", "Пергамент", "Parchment paper", "P", 2, 3],
  ["Spülschwämme", "Губки для посуды", "Dish sponges", "P", 2, 2],
  ["Gelbe Waschlappen", "Желтые тряпки", "Yellow cloths", "P", 2, 3],
  ["Schwarzer Tee", "Черный чай", "Black tea", "P", 2, 3],
  ["Grüner Tee", "Зеленый чай", "Green tea", "P", 2, 3],
  ["Früchte Tee", "Фруктовый чай", "Fruit tea", "P", 2, 3],
  ["Kräuter Tee", "Травяной чай", "Herbal tea", "P", 2, 3],
  ["Kaffeepulver", "Кофейный порошок", "Coffee powder", "P", 2, 4],
  ["Zucker", "Сахар", "Sugar", "P", 2, 3],
  ["Salz", "Соль", "Salt", "P", 2, 3],
  ["Spülmaschinenkapseln", "Капсулы для посудомойки", "Dishwasher capsules", "P", 2, 1],
  ["Waschpulver", "Стиральный порошок", "Washing powder", "P", 2, 1],
  ["Kaffeefilter", "Кофейный фильтр", "Coffee filter", "P", 2, 4],
  ["Handschuhe", "Перчатки", "Gloves", "P", 2, 2],
  ["Toilettenstein", "Туалетный блок", "Toilet block", "P", 2, 4],
  ["Spülmaschinen Salz", "Соль для посудомойки", "Dishwasher salt", "P", 2, 1],
  ["Klarspüler", "Ополаскиватель", "Rinse aid", "P", 2, 1],
  ["Gelbe Säcke", "Желтые пакеты", "Yellow bags", "P", 2, 5],
  ["WC Reiniger", "Средство для туалета", "Toilet cleaner", "St", 2, 4],
  ["Chlor", "Хлор", "Chlorine", "St", 2, 2],
  ["Rohrreiniger", "Средство для канализации", "Drain cleaner", "St", 2, 5],
  ["Backofenreiniger", "Средство для духовки", "Oven cleaner", "St", 2, 4],
  ["Waschmittel Eccolab", "Моющее средство Eccolab", "Detergent Eccolab", "St", 2, 5],
  ["Boden blau", "Для пола голубой", "Floor cleaner blue", "St", 2, 5],
  ["Bad rosa", "Для ванны розовый", "Bathroom cleaner pink", "St", 2, 5],
  ["Multi gelb", "Мульти желтый", "Multi cleaner yellow", "St", 2, 5],
  ["Duschtuch", "Банное полотенце", "Bath towel", "St", 5, 100],
  ["Handtücher", "Полотенца для рук", "Hand towels", "St", 5, 100],
  ["Spannbettlaken 90", "Простыня 90", "Fitted sheet 90", "St", 5, 100],
  ["Spannbettlaken 160", "Простыня 160", "Fitted sheet 160", "St", 5, 100],
  ["Deckenbezug", "Пододеяльник", "Duvet cover", "St", 5, 100],
  ["Kissenbezug 80x80", "Наволочка 80x80", "Pillowcase 80x80", "St", 5, 100],
  ["Kissenbezug 40x80", "Наволочка 40x80", "Pillowcase 40x80", "St", 5, 100],
  ["Geschirrtuch", "Кухонное полотенце", "Kitchen towel", "St", 5, 100],
  ["Badvorleger", "Коврик/полотенце для ванной", "Bath mat", "St", 5, 100],
  ["Müllsäcke 60L", "Мешки 60L", "Trash bags 60L", "P", 2, 5],
  ["Müllsäcke 10L", "Мешки 10L", "Trash bags 10L", "P", 2, 5],
];

const tr: any = {
  ru: { title: "Keller Inventory", obj: "Объект", item: "Товар", qty: "Количество", take: "Списать", add: "Пополнить", stock: "Остатки", buy: "Нужно купить", hist: "История", role: "Роль", cleaner: "Уборщица", responsible: "Ответственный", saved: "Сохранено", low: "Пополнить", ok: "ОК" },
  de: { title: "Keller Inventory", obj: "Objekt", item: "Artikel", qty: "Menge", take: "Entnehmen", add: "Nachfüllen", stock: "Bestand", buy: "Einkaufsliste", hist: "Historie", role: "Rolle", cleaner: "Reinigungskraft", responsible: "Verantwortlich", saved: "Gespeichert", low: "Nachfüllen", ok: "OK" },
  en: { title: "Keller Inventory", obj: "Object", item: "Item", qty: "Quantity", take: "Remove", add: "Refill", stock: "Stock", buy: "Need to buy", hist: "History", role: "Role", cleaner: "Cleaner", responsible: "Responsible", saved: "Saved", low: "Refill", ok: "OK" },
};

export default function Home() {
  const [lang, setLang] = useState("ru");
  const [role, setRole] = useState("cleaner");
  const [page, setPage] = useState("move");
  const [objects, setObjects] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [objectId, setObjectId] = useState<number | null>(null);
  const [itemId, setItemId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");

  const t = tr[lang];

  async function seedIfEmpty() {
    const { data: existing } = await supabase.from("objects").select("id").limit(1);
    if (existing && existing.length) return;

    const { data: objs } = await supabase
      .from("objects")
      .insert(objectsSeed.map(([name, address]) => ({ name, address })))
      .select();

    const { data: its } = await supabase
      .from("items")
      .insert(itemsSeed.map(([name_de, name_ru, name_en, unit, minimum_stock]) => ({
        name_de, name_ru, name_en, unit, minimum_stock
      })))
      .select();

    if (objs && its) {
      const rows: any[] = [];
      objs.forEach((o) => {
        its.forEach((it, index) => {
          rows.push({ object_id: o.id, item_id: it.id, quantity: itemsSeed[index][5] });
        });
      });
      await supabase.from("stock").insert(rows);
    }
  }

  async function loadData() {
    await seedIfEmpty();
    const { data: objs, error: oErr } = await supabase.from("objects").select("*").order("id");
const { data: its, error: iErr } = await supabase.from("items").select("*").order("id");
const { data: st, error: sErr } = await supabase.from("stock").select("*");
const { data: mov, error: mErr } = await supabase
  .from("movements")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(50);

console.log("OBJECTS", objs, oErr);
console.log("ITEMS", its, iErr);
console.log("STOCK", st, sErr);
console.log("MOVEMENTS", mov, mErr);
    setObjects(objs || []);
    setItems(its || []);
    setStock(st || []);
    setHistory(mov || []);
    if (objs?.[0]) setObjectId(objs[0].id);
    if (its?.[0]) setItemId(its[0].id);
  }

  useEffect(() => {
    loadData();
  }, []);

  const currentStock = useMemo(() => {
    return stock.find((s) => s.object_id === objectId && s.item_id === itemId);
  }, [stock, objectId, itemId]);

  const lowStock = useMemo(() => {
    return stock
      .map((s) => {
        const item = items.find((i) => i.id === s.item_id);
        const obj = objects.find((o) => o.id === s.object_id);
        return { ...s, item, obj };
      })
      .filter((s) => s.item && s.obj && s.quantity <= s.item.minimum_stock);
  }, [stock, items, objects]);

  async function move(type: "take" | "add") {
    setMsg("");
    if (!objectId || !itemId || !currentStock) return;

    if (type === "add" && role !== "responsible") {
      setMsg("Пополнение доступно только ответственному.");
      return;
    }

    const amount = Number(qty);
    if (amount <= 0) return;

    if (type === "take" && amount > currentStock.quantity) {
      setMsg("Нельзя списать больше, чем есть.");
      return;
    }

    const newQty = type === "take" ? currentStock.quantity - amount : currentStock.quantity + amount;

    await supabase.from("stock").update({ quantity: newQty }).eq("id", currentStock.id);

    await supabase.from("movements").insert({
      object_id: objectId,
      item_id: itemId,
      user_name: role === "cleaner" ? t.cleaner : t.responsible,
      action_type: type,
      quantity: amount,
    });

    setMsg(t.saved);
    await loadData();
  }

  function itemName(item: any) {
    if (!item) return "";
    if (lang === "de") return item.name_de;
    if (lang === "en") return item.name_en;
    return item.name_ru;
  }

  const box = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 1px 4px #ddd" };
  const btn = { padding: "12px 16px", borderRadius: 12, border: "1px solid #ddd", background: "#111827", color: "white", fontWeight: 700, cursor: "pointer" };
  const input = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginTop: 6 };

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 16, fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 }}>
        <div style={box}>
          <h1>{t.title}</h1>
          <p>8 Objekte · RU / DE / EN · Supabase</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <select style={input} value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="ru">Русский</option>
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>

            <select style={input} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="cleaner">{t.cleaner}</option>
              <option value="responsible">{t.responsible}</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={btn} onClick={() => setPage("move")}>{t.take}</button>
          <button style={btn} onClick={() => setPage("stock")}>{t.stock}</button>
          <button style={btn} onClick={() => setPage("buy")}>{t.buy}</button>
          <button style={btn} onClick={() => setPage("history")}>{t.hist}</button>
        </div>

        {page === "move" && (
          <div style={box}>
            <h2>{t.take}</h2>

            <label>{t.obj}</label>
            <select style={input} value={objectId || ""} onChange={(e) => setObjectId(Number(e.target.value))}>
              {objects.map((o) => <option key={o.id} value={o.id}>{o.name} — {o.address}</option>)}
            </select>

            <br /><br />

            <label>{t.item}</label>
            <select style={input} value={itemId || ""} onChange={(e) => setItemId(Number(e.target.value))}>
              {items.map((i) => <option key={i.id} value={i.id}>{itemName(i)}</option>)}
            </select>

            <br /><br />

            <label>{t.qty}</label>
            <input style={input} type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} />

            <p><b>Bestand:</b> {currentStock?.quantity ?? 0}</p>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={btn} onClick={() => move("take")}>{t.take}</button>
              <button style={{ ...btn, background: role === "responsible" ? "#2563eb" : "#94a3b8" }} disabled={role !== "responsible"} onClick={() => move("add")}>{t.add}</button>
            </div>

            {msg && <p>{msg}</p>}
          </div>
        )}

        {page === "stock" && (
          <div style={box}>
            <h2>{t.stock}</h2>
            {objects.map((o) => (
              <div key={o.id} style={{ borderTop: "1px solid #ddd", paddingTop: 12, marginTop: 12 }}>
                <h3>{o.name}</h3>
                <p>{o.address}</p>
                {items.map((i) => {
                  const s = stock.find((x) => x.object_id === o.id && x.item_id === i.id);
                  const low = (s?.quantity || 0) <= i.minimum_stock;
                  return (
                    <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                      <span>{itemName(i)}</span>
                      <b style={{ color: low ? "#b45309" : "#15803d" }}>{s?.quantity ?? 0} {i.unit} · {low ? t.low : t.ok}</b>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {page === "buy" && (
          <div style={box}>
            <h2>{t.buy}</h2>
            {lowStock.map((s) => (
              <p key={s.id}>
                <b>{s.obj.name}</b> — {itemName(s.item)}: {s.quantity} {s.item.unit}
              </p>
            ))}
          </div>
        )}

        {page === "history" && (
          <div style={box}>
            <h2>{t.hist}</h2>
            {history.map((h) => {
              const o = objects.find((x) => x.id === h.object_id);
              const i = items.find((x) => x.id === h.item_id);
              return (
                <p key={h.id}>
                  <b>{h.action_type}</b> — {o?.name} — {itemName(i)} — {h.quantity} · {h.user_name}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
