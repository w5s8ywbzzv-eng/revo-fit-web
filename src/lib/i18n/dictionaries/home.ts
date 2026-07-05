import { Dict } from "../dictionary";

export interface HomeDict {
  greet: string;
  ringLbl: string;
  state: string;
  factors: { sleep: string; food: string; move: string; recover: string };
  nextLbl: string;
  nextTtl: string;
  nextSub: string;
  record: string;
  more: string;
  nav: [string, string, string, string, string];
  /** Empty-state copy shown to brand-new accounts with zero data yet (roadmap §13).
   * Hand-translated for ja/en; other locales currently fall back to the English
   * copy below and should get a proper pass before launch — everything else in
   * this file is verbatim from the approved mockups, this block is new. */
  empty?: { state: string; nextTtl: string; nextSub: string; recordHint: string };
}

export const EMPTY_STATE_FALLBACK = {
  state: "No records yet — let's log your first one.",
  nextTtl: "Log your first day",
  nextSub: "Once you start recording, your score and today's one step will show up here.",
  recordHint: "Nothing here yet"
};

// Score-driving factors shown as small gauges on the home screen.
// (This will move to real Supabase-derived data; kept as a static shape for now.)
export const FACTORS: { key: "sleep" | "food" | "move" | "recover"; icon: string }[] = [
  { key: "sleep", icon: "IconMoon" },
  { key: "food", icon: "IconSalad" },
  { key: "move", icon: "IconFlame" },
  { key: "recover", icon: "IconHeart" }
];

export const homeDict: Dict<HomeDict> = {
  ja: { greet: "おはようございます", ringLbl: "rf score", state: "いい調子です。食事だけ、あと一歩。", factors: { sleep: "睡眠", food: "食事", move: "運動", recover: "回復" }, nextLbl: "だから、きょうの一手", nextTtl: "夜は、たんぱく質を少し多めに", nextSub: "食事スコアが低め。あと卵2個ぶん（たんぱく質 約14g）で、今日は整います。", record: "記録する", more: "くわしい分析を見る", nav: ["ホーム", "次の一手", "未来予測", "記録", "メダル"], empty: { state: "まだ記録がありません。最初の記録をつけてみましょう。", nextTtl: "最初の記録をつけよう", nextSub: "記録をはじめると、ここにスコアと今日の一手が表示されます。", recordHint: "まだ何もありません" } },
  en: { greet: "Good morning", ringLbl: "rf score", state: "You're doing well. Just food, one more step.", factors: { sleep: "Sleep", food: "Food", move: "Exercise", recover: "Recovery" }, nextLbl: "So, today's one step", nextTtl: "A bit more protein tonight", nextSub: "Food score is low. About 2 eggs (≈14g protein) and today balances out.", record: "Log it", more: "See detailed analysis", nav: ["Home", "Next Step", "Forecast", "Log", "Medals"], empty: { state: "No records yet — let's log your first one.", nextTtl: "Log your first day", nextSub: "Once you start recording, your score and today's one step will show up here.", recordHint: "Nothing here yet" } },
  "zh-Hans": { greet: "早上好", ringLbl: "rf score", state: "状态不错。只差饮食再加把劲。", factors: { sleep: "睡眠", food: "饮食", move: "运动", recover: "恢复" }, nextLbl: "所以，今天这一步", nextTtl: "晚上多补点蛋白质", nextSub: "饮食评分偏低。再加约2个鸡蛋（约14g蛋白质），今天就平衡了。", record: "记录", more: "查看详细分析", nav: ["首页", "下一步", "未来预测", "记录", "足迹"] },
  "zh-Hant": { greet: "早安", ringLbl: "rf score", state: "狀態不錯。只差飲食再加把勁。", factors: { sleep: "睡眠", food: "飲食", move: "運動", recover: "恢復" }, nextLbl: "所以，今天這一步", nextTtl: "晚上多補點蛋白質", nextSub: "飲食評分偏低。再加約2顆蛋（約14g蛋白質），今天就平衡了。", record: "記錄", more: "查看詳細分析", nav: ["首頁", "下一步", "未來預測", "記錄", "足跡"] },
  ko: { greet: "좋은 아침이에요", ringLbl: "rf score", state: "좋은 흐름이에요. 식사만 한 걸음 더.", factors: { sleep: "수면", food: "식사", move: "운동", recover: "회복" }, nextLbl: "그래서, 오늘의 한 걸음", nextTtl: "저녁엔 단백질을 조금 더", nextSub: "식사 점수가 낮아요. 달걀 2개(단백질 약 14g)면 오늘은 균형이 맞아요.", record: "기록하기", more: "자세한 분석 보기", nav: ["홈", "다음 한 수", "미래 예측", "기록", "메달"] },
  fr: { greet: "Bonjour", ringLbl: "rf score", state: "Vous êtes sur la bonne voie. Plus qu'un pas côté repas.", factors: { sleep: "Sommeil", food: "Repas", move: "Sport", recover: "Récup" }, nextLbl: "Donc, le pas du jour", nextTtl: "Un peu plus de protéines ce soir", nextSub: "Score repas bas. L'équivalent de 2 œufs (≈14g de protéines), et la journée s'équilibre.", record: "Enregistrer", more: "Voir l'analyse détaillée", nav: ["Accueil", "Étape", "Prévision", "Journal", "Médailles"] },
  es: { greet: "Buenos días", ringLbl: "rf score", state: "Vas muy bien. Solo la comida, un paso más.", factors: { sleep: "Sueño", food: "Comida", move: "Ejercicio", recover: "Recup." }, nextLbl: "Por eso, el paso de hoy", nextTtl: "Un poco más de proteína esta noche", nextSub: "Comida con puntuación baja. Unos 2 huevos (≈14g de proteína), y el día se equilibra.", record: "Registrar", more: "Ver análisis detallado", nav: ["Inicio", "Paso", "Previsión", "Registro", "Medallas"] },
  de: { greet: "Guten Morgen", ringLbl: "rf score", state: "Du bist auf einem guten Weg. Nur beim Essen ein Schritt noch.", factors: { sleep: "Schlaf", food: "Essen", move: "Sport", recover: "Erholung" }, nextLbl: "Also, der heutige Schritt", nextTtl: "Heute Abend etwas mehr Protein", nextSub: "Ernährungswert niedrig. Etwa 2 Eier (≈14g Protein), und der Tag ist im Gleichgewicht.", record: "Eintragen", more: "Detailanalyse ansehen", nav: ["Start", "Schritt", "Prognose", "Log", "Medaillen"] },
  it: { greet: "Buongiorno", ringLbl: "rf score", state: "Stai andando bene. Manca solo un passo sui pasti.", factors: { sleep: "Sonno", food: "Cibo", move: "Sport", recover: "Recupero" }, nextLbl: "Quindi, il passo di oggi", nextTtl: "Stasera un po' più di proteine", nextSub: "Punteggio cibo basso. Circa 2 uova (≈14g di proteine) e la giornata si bilancia.", record: "Registra", more: "Vedi analisi dettagliata", nav: ["Home", "Passo", "Previsione", "Diario", "Medaglie"] },
  pt: { greet: "Bom dia", ringLbl: "rf score", state: "Você vai bem. Só a alimentação, mais um passo.", factors: { sleep: "Sono", food: "Comida", move: "Exercício", recover: "Recup." }, nextLbl: "Por isso, o passo de hoje", nextTtl: "Um pouco mais de proteína à noite", nextSub: "Pontuação de comida baixa. Cerca de 2 ovos (≈14g de proteína), e o dia se equilibra.", record: "Registrar", more: "Ver análise detalhada", nav: ["Início", "Passo", "Previsão", "Registro", "Medalhas"] },
  th: { greet: "อรุณสวัสดิ์", ringLbl: "rf score", state: "กำลังดีเลย ขาดแค่มื้ออาหารอีกนิด", factors: { sleep: "การนอน", food: "อาหาร", move: "ออกกำลัง", recover: "ฟื้นตัว" }, nextLbl: "ดังนั้น ก้าวของวันนี้", nextTtl: "มื้อเย็นเพิ่มโปรตีนอีกหน่อย", nextSub: "คะแนนอาหารต่ำ เพิ่มประมาณไข่ 2 ฟอง (โปรตีน ~14 ก.) วันนี้ก็สมดุล", record: "บันทึก", more: "ดูการวิเคราะห์ละเอียด", nav: ["หน้าแรก", "ก้าวต่อไป", "พยากรณ์", "บันทึก", "เหรียญ"] },
  hi: { greet: "सुप्रभात", ringLbl: "rf score", state: "आप अच्छा कर रहे हैं। बस खाने में एक कदम और।", factors: { sleep: "नींद", food: "खाना", move: "कसरत", recover: "रिकवरी" }, nextLbl: "इसलिए, आज का एक कदम", nextTtl: "रात में थोड़ा ज़्यादा प्रोटीन", nextSub: "खाने का स्कोर कम है। क़रीब 2 अंडे (प्रोटीन ~14g), और आज संतुलित।", record: "दर्ज करें", more: "विस्तृत विश्लेषण देखें", nav: ["होम", "अगला कदम", "भविष्यवाणी", "रिकॉर्ड", "मेडल"] },
  vi: { greet: "Chào buổi sáng", ringLbl: "rf score", state: "Bạn đang rất tốt. Chỉ còn một bước ở bữa ăn.", factors: { sleep: "Giấc ngủ", food: "Ăn uống", move: "Vận động", recover: "Phục hồi" }, nextLbl: "Vậy nên, bước hôm nay", nextTtl: "Tối nay thêm chút đạm", nextSub: "Điểm ăn uống thấp. Khoảng 2 quả trứng (~14g đạm) là hôm nay cân bằng.", record: "Ghi lại", more: "Xem phân tích chi tiết", nav: ["Trang chủ", "Bước tiếp", "Dự báo", "Ghi", "Huy chương"] },
  id: { greet: "Selamat pagi", ringLbl: "rf score", state: "Kamu berjalan baik. Tinggal makan, satu langkah lagi.", factors: { sleep: "Tidur", food: "Makan", move: "Olahraga", recover: "Pemulihan" }, nextLbl: "Maka, langkah hari ini", nextTtl: "Malam ini protein sedikit lebih", nextSub: "Skor makan rendah. Sekitar 2 telur (~14g protein), dan hari ini seimbang.", record: "Catat", more: "Lihat analisis detail", nav: ["Beranda", "Langkah", "Prakiraan", "Catat", "Medali"] }
};
