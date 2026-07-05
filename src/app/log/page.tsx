"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { HeaderControls } from "@/components/HeaderControls";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/components/useToast";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick } from "@/lib/i18n/dictionary";
import { getSupabaseClient } from "@/lib/supabase/client";

const logDict = { ja: { ttl: "今日の記録", sleep: "睡眠", sleepHours: "時間", sleepQuality: "睡眠の質", food: "食事", meal: "食べたもの", mealType: "食事の種類", breakfast: "朝食", lunch: "昼食", dinner: "夕食", snack: "間食", calories: "カロリー", move: "運動", duration: "時間（分）", bodyParts: "部位", weight: "体重", kg: "kg", bowel: "排便状態", mood: "気分", submit: "記録する", success: "記録しました", error: "エラーが発生しました" } };

export default function LogPage() {
  const { locale } = useLocale();
  const d = pick(logDict, locale);
  const { show, ToastView } = useToast();
  const router = useRouter();
  const [sleepMinutes, setSleepMinutes] = useState("");
  const [sleepQuality, setSleepQuality] = useState("3");
  const [moveMinutes, setMoveMinutes] = useState("");
  const [weight, setWeight] = useState("");
  const [bowelState, setBowelState] = useState("2");
  const [mood, setMood] = useState("3");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const supabase = getSupabaseClient();
    if (!supabase) { show(d.error); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { show(d.error); return; }
    const today = new Date().toISOString().slice(0, 10);
    setSubmitting(true);
    try {
      const { error } = await supabase.from("daily_logs").upsert({
        user_id: user.id, log_date: today,
        sleep_minutes: sleepMinutes ? parseInt(sleepMinutes) * 60 : null,
        sleep_quality: sleepQuality ? parseInt(sleepQuality) : null,
        move_minutes: moveMinutes ? parseInt(moveMinutes) : null,
        bowel_state: bowelState ? parseInt(bowelState) : null,
        mood: mood ? parseInt(mood) : null,
        weight_kg: weight ? parseFloat(weight) : null,
      });
      if (error) { show(error.message); setSubmitting(false); return; }
      show(d.success);
      setTimeout(() => router.push("/home"), 1000);
    } catch (err) { show(d.error); } finally { setSubmitting(false); }
  }

  return (
    <div className="rf-screen">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
        <button className="rf-icon-btn" style={{ background: "transparent", border: "none" }} onClick={() => router.back()}><IconArrowLeft size={20} /></button>
        <HeaderControls />
      </div>
      <div style={{ padding: "12px 20px", flex: 1, overflowY: "auto" }}>
        <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 20px" }}>{d.ttl}</p>
        <div style={{ marginBottom: 20 }}><label style={{ display: "block", marginBottom: 8 }}>{d.sleep}</label><input type="number" value={sleepMinutes} onChange={(e) => setSleepMinutes(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", marginBottom: 8 }} /><select value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc" }}><option value="1">悪い</option><option value="3">普通</option><option value="5">良い</option></select></div>
        <div style={{ marginBottom: 20 }}><label style={{ display: "block", marginBottom: 8 }}>{d.move}</label><input type="number" value={moveMinutes} onChange={(e) => setMoveMinutes(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc" }} /></div>
        <div style={{ marginBottom: 20 }}><label style={{ display: "block", marginBottom: 8 }}>{d.weight}</label><input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc" }} /></div>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}><div style={{ flex: 1 }}><label style={{ display: "block", marginBottom: 8 }}>{d.bowel}</label><select value={bowelState} onChange={(e) => setBowelState(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc" }}><option value="1">悪い</option><option value="2">普通</option><option value="3">良い</option></select></div><div style={{ flex: 1 }}><label style={{ display: "block", marginBottom: 8 }}>{d.mood}</label><select value={mood} onChange={(e) => setMood(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc" }}><option value="1">悪い</option><option value="3">普通</option><option value="5">良い</option></select></div></div>
        <button className="rf-btn-primary" onClick={handleSubmit} disabled={submitting} style={{ marginBottom: 20 }}><IconPlus size={18} /><span>{d.submit}</span></button>
      </div>
      <BottomNav labels={["", "", "", "", ""]} activeIndex={3} />
      {ToastView}
    </div>
  );
}
