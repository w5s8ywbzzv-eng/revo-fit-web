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

const logDict = {
  ja: { ttl: "今日の記録", sleep: "睡眠", sleepHours: "時間", sleepQuality: "睡眠の質", food: "食事", meal: "食べたもの", mealType: "食事の種類", breakfast: "朝食", lunch: "昼食", dinner: "夕食", snack: "間食", calories: "カロリー", move: "運動", duration: "時間（分）", bodyParts: "部位", weight: "体重", kg: "kg", bowel: "排便状態", mood: "気分", submit: "記録する", success: "記録しました", error: "エラーが発生しました" },
  en: { ttl: "Log", sleep: "Sleep", sleepHours: "Hours", sleepQuality: "Quality", food: "Food", meal: "What you ate", mealType: "Meal type", breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack", calories: "Calories", move: "Move", duration: "Minutes", bodyParts: "Body parts", weight: "Weight", kg: "kg", bowel: "Bowel", mood: "Mood", submit: "Submit", success: "Saved", error: "Error" },
  ko: { ttl: "기록", sleep: "수면", sleepHours: "시간", sleepQuality: "품질", food: "음식", meal: "먹은것", mealType: "식사 유형", breakfast: "아침", lunch: "점심", dinner: "저녁", snack: "간식", calories: "칼로리", move: "운동", duration: "분", bodyParts: "부위", weight: "체중", kg: "kg", bowel: "배변", mood: "기분", submit: "제출", success: "저장됨", error: "오류" },
  "zh-Hans": { ttl: "记录", sleep: "睡眠", sleepHours: "小时", sleepQuality: "质量", food: "食物", meal: "吃什么", mealType: "饭菜类型", breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "零食", calories: "卡路里", move: "运动", duration: "分钟", bodyParts: "身体部位", weight: "重量", kg: "kg", bowel: "排便", mood: "心情", submit: "提交", success: "已保存", error: "错误" },
  "zh-Hant": { ttl: "記錄", sleep: "睡眠", sleepHours: "小時", sleepQuality: "品質", food: "食物", meal: "吃什麼", mealType: "飯菜類型", breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "零食", calories: "卡路里", move: "運動", duration: "分鐘", bodyParts: "身體部位", weight: "重量", kg: "kg", bowel: "排便", mood: "心情", submit: "提交", success: "已保存", error: "錯誤" },
  es: { ttl: "Registro", sleep: "Sueño", sleepHours: "Horas", sleepQuality: "Calidad", food: "Comida", meal: "Qué comiste", mealType: "Tipo de comida", breakfast: "Desayuno", lunch: "Almuerzo", dinner: "Cena", snack: "Refrigerio", calories: "Calorías", move: "Movimiento", duration: "Minutos", bodyParts: "Partes del cuerpo", weight: "Peso", kg: "kg", bowel: "Evacuación", mood: "Estado de ánimo", submit: "Enviar", success: "Guardado", error: "Error" },
  de: { ttl: "Protokoll", sleep: "Schlaf", sleepHours: "Stunden", sleepQuality: "Qualität", food: "Essen", meal: "Was du gegessen hast", mealType: "Essenstyp", breakfast: "Frühstück", lunch: "Mittagessen", dinner: "Abendessen", snack: "Snack", calories: "Kalorien", move: "Bewegung", duration: "Minuten", bodyParts: "Körperteile", weight: "Gewicht", kg: "kg", bowel: "Stuhlgang", mood: "Stimmung", submit: "Einreichen", success: "Gespeichert", error: "Fehler" },
  fr: { ttl: "Enregistrement", sleep: "Sommeil", sleepHours: "Heures", sleepQuality: "Qualité", food: "Nourriture", meal: "Ce que tu as mangé", mealType: "Type de repas", breakfast: "Petit-déjeuner", lunch: "Déjeuner", dinner: "Dîner", snack: "Collation", calories: "Calories", move: "Mouvement", duration: "Minutes", bodyParts: "Parties du corps", weight: "Poids", kg: "kg", bowel: "Selle", mood: "Humeur", submit: "Soumettre", success: "Enregistré", error: "Erreur" },
  it: { ttl: "Registro", sleep: "Sonno", sleepHours: "Ore", sleepQuality: "Qualità", food: "Cibo", meal: "Cosa hai mangiato", mealType: "Tipo di pasto", breakfast: "Colazione", lunch: "Pranzo", dinner: "Cena", snack: "Snack", calories: "Calorie", move: "Movimento", duration: "Minuti", bodyParts: "Parti del corpo", weight: "Peso", kg: "kg", bowel: "Evacuazione", mood: "Umore", submit: "Invia", success: "Salvato", error: "Errore" },
  pt: { ttl: "Registro", sleep: "Sono", sleepHours: "Horas", sleepQuality: "Qualidade", food: "Comida", meal: "O que você comeu", mealType: "Tipo de refeição", breakfast: "Café da manhã", lunch: "Almoço", dinner: "Jantar", snack: "Lanche", calories: "Calorias", move: "Movimento", duration: "Minutos", bodyParts: "Partes do corpo", weight: "Peso", kg: "kg", bowel: "Evacuação", mood: "Humor", submit: "Enviar", success: "Salvo", error: "Erro" },
  ru: { ttl: "Запись", sleep: "Сон", sleepHours: "Часы", sleepQuality: "Качество", food: "Еда", meal: "Что ты ел", mealType: "Тип еды", breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Закуска", calories: "Калории", move: "Движение", duration: "Минуты", bodyParts: "Части тела", weight: "Вес", kg: "kg", bowel: "Дефекация", mood: "Настроение", submit: "Отправить", success: "Сохранено", error: "Ошибка" },
  ar: { ttl: "السجل", sleep: "النوم", sleepHours: "ساعات", sleepQuality: "الجودة", food: "الطعام", meal: "ما أكلته", mealType: "نوع الوجبة", breakfast: "الإفطار", lunch: "الغداء", dinner: "العشاء", snack: "وجبة خفيفة", calories: "السعرات الحرارية", move: "الحركة", duration: "دقائق", bodyParts: "أجزاء الجسم", weight: "الوزن", kg: "kg", bowel: "حركة الأمعاء", mood: "المزاج", submit: "إرسال", success: "محفوظ", error: "خطأ" },
  hi: { ttl: "रिकॉर्ड", sleep: "नींद", sleepHours: "घंटे", sleepQuality: "गुणवत्ता", food: "खाना", meal: "तुमने क्या खाया", mealType: "भोजन का प्रकार", breakfast: "नाश्ता", lunch: "दोपहर का भोजन", dinner: "रात का खाना", snack: "नाश्ता", calories: "कैलोरी", move: "आंदोलन", duration: "मिनट", bodyParts: "शरीर के अंग", weight: "वजन", kg: "kg", bowel: "मल त्याग", mood: "मानसिकता", submit: "जमा करें", success: "सहेजा गया", error: "त्रुटि" },
  th: { ttl: "บันทึก", sleep: "การนอน", sleepHours: "ชั่วโมง", sleepQuality: "คุณภาพ", food: "อาหาร", meal: "คุณกินอะไร", mealType: "ประเภทอาหาร", breakfast: "อาหารเช้า", lunch: "อาหารกลางวัน", dinner: "อาหารเย็น", snack: "ขนมขบเคี้ยว", calories: "แคลอรี่", move: "การเคลื่อนไหว", duration: "นาที", bodyParts: "ส่วนของร่างกาย", weight: "น้ำหนัก", kg: "kg", bowel: "การขับถ่าย", mood: "อารมณ์", submit: "ส่ง", success: "บันทึกแล้ว", error: "ข้อผิดพลาด" },
  vi: { ttl: "Bản ghi", sleep: "Giấc ngủ", sleepHours: "Giờ", sleepQuality: "Chất lượng", food: "Thực phẩm", meal: "Bạn đã ăn gì", mealType: "Loại bữa ăn", breakfast: "Bữa sáng", lunch: "Bữa trưa", dinner: "Bữa tối", snack: "Đồ ăn nhẹ", calories: "Calo", move: "Chuyển động", duration: "Phút", bodyParts: "Bộ phận cơ thể", weight: "Cân nặng", kg: "kg", bowel: "Đại tiện", mood: "Tâm trạng", submit: "Gửi", success: "Đã lưu", error: "Lỗi" },
};

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
