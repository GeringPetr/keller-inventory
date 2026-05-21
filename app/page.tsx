"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

type ObjectRow = {
  id: number;
  name: string;
  address: string;
};

type ItemRow = {
  id: number;
  name_de: string;
  name_ru: string;
  name_en: string;
  unit: string;
  minimum_stock: number;
};

type StockRow = {
  id: number;
  object_id: number;
  item_id: number;
  quantity: number;
};

type MovementRow = {
  id: number;
  object_id: number;
  item_id: number;
  user_name: string;
  action_type: string;
  quantity: number;
  created_at: string;
};

const tr = {
  ru: {
    title: "Keller Inventory",
    subtitle: "8 объектов · RU / DE / EN · Supabase",
    object: "Объект",
    item: "Товар",
    quantity: "Количество",
    remove: "Списать",
    refill: "Пополнить",
    stock: "Остатки",
    shopping: "Нужно купить",
    history: "История",
    cleaner: "Уборщица",
    responsible: "Ответственный",
    saved: "Сохранено",
    noStock: "Нельзя списать больше, чем есть.",
    refillBlocked: "Пополнение доступно только ответственному.",
    current: "Bestand",
    ok: "ОК",
    low: "Пополнить",
  },
  de: {
    title: "Keller Inventory",
    subtitle: "8 Objekte · RU / DE / EN · Supabase",
    object: "Objekt",
    item: "Artikel",
    quantity: "Menge",
    remove: "Entnehmen",
    refill: "Nachfüllen",
    stock: "Bestand",
    shopping: "Einkaufsliste",
    history: "Historie",
    cleaner: "Reinigungskraft",
    responsible: "Verantwortlich",
    saved: "Gespeichert",
    noStock: "Es kann nicht mehr entnommen werden als vorhanden ist.",
    refillBlocked: "Nachfüllen ist nur für Verantwortliche möglich.",
    current: "Bestand",
    ok: "OK",
    low: "Nachfüllen",
  },
  en: {
    title: "Keller Inventory",
    subtitle: "8 objects · RU / DE / EN · Supabase",
    object: "Object",
    item: "Item",
    quantity: "Quantity",
    remove: "Remove",
    refill: "Refill",
    stock: "Stock",
    shopping: "Need to buy",
    history: "History",
    cleaner: "Cleaner",
    responsible: "Responsible",
    saved: "Saved",
    noStock: "You cannot remove more than available.",
    refillBlocked: "Refill is only available for responsible users.",
    current: "Stock",
    ok: "OK",
    low: "Refill",
  },
};

export default function Home() {
  const [lang, setLang] = useState<"ru" | "de" | "en">("ru");
  const [role, setRole] = useState<"cleaner" | "responsible">("cleaner");
  const [page, setPage] = useState<"move" | "stock" | "shopping" | "history">("move");

  const [objects, setObjects] = useState<ObjectRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [stock, setStock] = useState<StockRow[]>([]);
  const [history, setHistory] = useState<MovementRow[]>([]);

  const [objectId, setObjectId] = useState<number | null>(null);
  const [itemId, setItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState("");

  const t = tr[lang];

  function itemName(item?: ItemRow) {
    if (!item) return "";
    if (lang === "de") return item.name_de;
    if (lang === "en") return item.name_en;
    return item.name_ru;
  }

  async function loadData() {
    const { data: objData } = await supabase.from("objects").select("*").order("id");
    const { data: itemData } = await supabase.from("items").select("*").order("id");
    const { data: stockData } = await supabase.from("stock").select("*").order("id");
    const { data: movementData } = await supabase
      .from("movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const objRows = objData || [];
    const itemRows = itemData || [];

    setObjects(objRows);
    setItems(itemRows);
    setStock(stockData || []);
    setHistory(movementData || []);

    if (objRows.length > 0) setObjectId((prev) => prev || objRows[0].id);
    if (itemRows.length > 0) setItemId((prev) => prev || itemRows[0].id);
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
        const object = objects.find((o) => o.id === s.object_id);
        const item = items.find((i) => i.id === s.item_id);
        return { ...s, object, item };
      })
      .filter((row) => row.object && row.item && row.quantity <= row.item.minimum_stock);
  }, [stock, objects, items]);

  async function makeMovement(type: "take" | "add") {
    setMessage("");

    if (!objectId || !itemId || !currentStock) return;

    const amount = Number(quantity);

    if (type === "add" && role !== "responsible") {
      setMessage(t.refillBlocked);
      return;
    }

    if (type === "take" && amount > currentStock.quantity) {
      setMessage(t.noStock);
      return;
    }

    const newQuantity =
      type === "take"
        ? currentStock.quantity - amount
        : currentStock.quantity + amount;

    await supabase
      .from("stock")
      .update({ quantity: newQuantity })
      .eq("id", currentStock.id);

    await supabase.from("movements").insert({
      object_id: objectId,
      item_id: itemId,
      user_name: role === "cleaner" ? t.cleaner : t.responsible,
      action_type: type,
      quantity: amount,
    });

    setMessage(t.saved);
    await loadData();
  }

  const box = {
    background: "white",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 1px 5px #ddd",
  };

  const input = {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    marginTop: 6,
  };

  const button = {
    padding: "12px 16px",
    borderRadius: 12,
    border: "0",
    background: "#111827",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 16, fontFamily: "Arial" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 }}>
        <div style={box}>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <select style={input} value={lang} onChange={(e) => setLang(e.target.value as any)}>
              <option value="ru">Русский</option>
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>

            <select style={input} value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="cleaner">{t.cleaner}</option>
              <option value="responsible">{t.responsible}</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={button} onClick={() => setPage("move")}>{t.remove}</button>
          <button style={button} onClick={() => setPage("stock")}>{t.stock}</button>
          <button style={button} onClick={() => setPage("shopping")}>{t.shopping}</button>
          <button style={button} onClick={() => setPage("history")}>{t.history}</button>
        </div>

        {page === "move" && (
          <div style={box}>
            <h2>{t.remove}</h2>

            <label>{t.object}</label>
            <select style={input} value={objectId || ""} onChange={(e) => setObjectId(Number(e.target.value))}>
              {objects.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} — {o.address}
                </option>
              ))}
            </select>

            <br /><br />

            <label>{t.item}</label>
            <select style={input} value={itemId || ""} onChange={(e) => setItemId(Number(e.target.value))}>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {itemName(i)}
                </option>
              ))}
            </select>

            <br /><br />

            <label>{t.quantity}</label>
            <input
              style={input}
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            <p>
              <b>{t.current}:</b> {currentStock?.quantity ?? 0}
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={button} onClick={() => makeMovement("take")}>
                {t.remove}
              </button>

              <button
                style={{
                  ...button,
                  background: role === "responsible" ? "#2563eb" : "#94a3b8",
                }}
                disabled={role !== "responsible"}
                onClick={() => makeMovement("add")}
              >
                {t.refill}
              </button>
            </div>

            {message && <p>{message}</p>}
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
                  const value = s?.quantity ?? 0;
                  const isLow = value <= i.minimum_stock;

                  return (
                    <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                      <span>{itemName(i)}</span>
                      <b style={{ color: isLow ? "#b45309" : "#15803d" }}>
                        {value} {i.unit} · {isLow ? t.low : t.ok}
                      </b>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {page === "shopping" && (
          <div style={box}>
            <h2>{t.shopping}</h2>

            {lowStock.map((row) => (
              <p key={row.id}>
                <b>{row.object?.name}</b> — {itemName(row.item)}: {row.quantity} {row.item?.unit}
              </p>
            ))}
          </div>
        )}

        {page === "history" && (
          <div style={box}>
            <h2>{t.history}</h2>

            {history.map((h) => {
              const object = objects.find((o) => o.id === h.object_id);
              const item = items.find((i) => i.id === h.item_id);

              return (
                <p key={h.id}>
                  <b>{h.action_type}</b> — {object?.name} — {itemName(item)} — {h.quantity} · {h.user_name}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
