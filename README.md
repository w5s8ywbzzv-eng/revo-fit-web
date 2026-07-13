<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.7.0/dist/tabler-icons.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400;500;600&display=swap" rel="stylesheet">
<div style="background:#F1EFEA; border-radius:14px; padding:12px; display:flex; justify-content:center;">
<div id="screen" style="background:#16140F; border-radius:20px; font-family:var(--font-sans); max-width:390px; width:100%; margin:0 auto; overflow:hidden; position:relative; transition:background 0.35s;">

  <h2 style="position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0;">使いたいアプリを選ぶと、まとめ割の価格が出るプラン選択画面。fit・life・running から複数選ぶと、2つで10パーセント、3つで15パーセント割引。running は近日登場で今は選べない。言語と明暗を切り替えられる。</h2>

  <div id="hdr" style="display:flex; align-items:center; justify-content:space-between; padding:16px 18px; border-bottom:0.5px solid #2A2620; transition:border-color 0.35s;">
    <div style="display:flex; align-items:center; gap:11px;">
      <i class="ti ti-arrow-left" style="font-size:21px; color:#8A7E68;" aria-hidden="true"></i>
      <p id="hdrTtl" style="font-size:16px; font-weight:500; color:#F0EBE2; margin:0; transition:color 0.35s;">プランを組み立てる</p>
    </div>
    <div style="display:flex; align-items:center; gap:9px;">
      <button id="langBtn" aria-label="言語" style="width:32px; height:32px; border-radius:50%; background:#1F1C16; border:0.5px solid #3A352A; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.35s;"><i class="ti ti-world" style="font-size:16px; color:#B0A488;" aria-hidden="true"></i></button>
      <button id="themeBtn" aria-label="明るさ" style="width:32px; height:32px; border-radius:50%; background:#1F1C16; border:0.5px solid #3A352A; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.35s;"><i id="themeIcon" class="ti ti-sun" style="font-size:16px; color:#E3C56A;" aria-hidden="true"></i></button>
    </div>
    <div id="langMenu" style="display:none; position:absolute; top:54px; right:18px; width:206px; max-height:300px; overflow-y:auto; background:#1F1C16; border:0.5px solid #3A352A; border-radius:14px; padding:6px; box-shadow:0 18px 40px -12px rgba(0,0,0,0.7); z-index:30;"></div>
  </div>

  <div style="padding:20px 18px 24px; max-height:660px; overflow-y:auto;">

    <p id="leadTtl" style="font-size:19px; color:#F0EBE2; margin:0 0 5px; font-weight:500; line-height:1.4;">どのアプリを使いますか？</p>
    <p id="leadSub" style="font-size:12px; color:#8A7E68; margin:0 0 20px; line-height:1.6;">2つ選ぶと 10%、3つで 15% おトクになります。</p>

    <!-- アプリ選択カード -->
    <div id="appCards" style="display:flex; flex-direction:column; gap:10px; margin:0 0 20px;"></div>

    <!-- 集計 -->
    <div id="sumCard" style="background:#1A1814; border:0.5px solid #2A2620; border-radius:16px; padding:18px; margin:0 0 16px;">
      <div id="sumRows" style="display:flex; flex-direction:column; gap:9px; margin:0 0 12px;"></div>
      <div id="discountRow" style="display:none; align-items:center; justify-content:space-between; padding:10px 0 0; border-top:0.5px dashed #3A352A; margin:0 0 12px;">
        <span id="discTag" style="font-size:11px; font-weight:700; color:#16140F; background:#E3C56A; padding:3px 10px; border-radius:6px; letter-spacing:0.03em;">まとめ割 -10%</span>
        <span id="discAmt" style="font-size:12px; color:#5DCAA5; font-family:Jost;">-¥220</span>
      </div>
      <div style="display:flex; align-items:baseline; justify-content:space-between; padding:12px 0 0; border-top:0.5px solid #3A352A;">
        <span id="totalLbl" style="font-size:13px; color:#B0A488;">お支払い（月）</span>
        <div style="text-align:right;">
          <span id="listVal" style="display:none; font-size:13px; color:#6E6555; text-decoration:line-through; margin-right:7px; font-family:Jost;">¥2,180</span>
          <span id="totalVal" style="font-size:24px; color:#F0EBE2; font-weight:600; font-family:Jost;">¥0</span>
          <span id="perLbl" style="font-size:12px; color:#8A7E68;">/ 月</span>
        </div>
      </div>
    </div>

    <button id="submitBtn" style="width:100%; background:#E3C56A; border:none; color:#16140F; font-size:15px; font-weight:600; padding:15px; border-radius:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; opacity:0.5;" disabled><span id="submitLbl">アプリを選んでください</span></button>
    <p id="noteTxt" style="font-size:10px; color:#6E6555; margin:12px 0 0; text-align:center; line-height:1.6;">最初の14日間は、合わなければ全額返金します。</p>

  </div>

</div>
</div>
<script>
  (function(){
    var langs=["日本語","English","简体中文","繁體中文","한국어","Français","Español","Deutsch","Italiano","Português","ภาษาไทย","हिन्दी","Tiếng Việt","Bahasa Indonesia"];
    var langSub={"English":"英語","简体中文":"中国語（簡体）","繁體中文":"中国語（繁体）","한국어":"韓国語","Français":"フランス語","Español":"スペイン語","Deutsch":"ドイツ語","Italiano":"イタリア語","Português":"ポルトガル語","ภาษาไทย":"タイ語","हिन्दी":"ヒンディー語","Tiếng Việt":"ベトナム語","Bahasa Indonesia":"インドネシア語"};
    var cur="日本語", dark=true;
    var sel={fit:false, life:false, running:false};

    // 単体価格（各言語・数値と表示）: fit, life, running
    var PRICE={
      "日本語":{fit:1200,life:980,running:1200,cur:"¥",fmt:function(n){return "¥"+n.toLocaleString('ja-JP');}},
      "English":{fit:7.99,life:6.49,running:7.99,cur:"$",fmt:function(n){return "$"+n.toFixed(2);}},
      "简体中文":{fit:58,life:48,running:58,cur:"¥",fmt:function(n){return "¥"+n;}},
      "繁體中文":{fit:250,life:200,running:250,cur:"NT$",fmt:function(n){return "NT$"+n;}},
      "한국어":{fit:10900,life:8900,running:10900,cur:"₩",fmt:function(n){return "₩"+n.toLocaleString('en-US');}},
      "ภาษาไทย":{fit:199,life:159,running:199,cur:"฿",fmt:function(n){return "฿"+n;}},
      "Français":{fit:7.99,life:6.49,running:7.99,cur:"€",fmt:function(n){return n.toFixed(2).replace('.',',')+" €";}},
      "Español":{fit:7.99,life:6.49,running:7.99,cur:"€",fmt:function(n){return n.toFixed(2).replace('.',',')+" €";}},
      "Deutsch":{fit:7.99,life:6.49,running:7.99,cur:"€",fmt:function(n){return n.toFixed(2).replace('.',',')+" €";}},
      "Italiano":{fit:7.99,life:6.49,running:7.99,cur:"€",fmt:function(n){return n.toFixed(2).replace('.',',')+" €";}},
      "Português":{fit:39.90,life:32.90,running:39.90,cur:"R$",fmt:function(n){return "R$"+n.toFixed(2).replace('.',',');}},
      "हिन्दी":{fit:599,life:499,running:599,cur:"₹",fmt:function(n){return "₹"+n.toLocaleString('en-IN');}},
      "Tiếng Việt":{fit:199000,life:159000,running:199000,cur:"₫",fmt:function(n){return n.toLocaleString('vi-VN').replace(/,/g,'.')+"₫";}},
      "Bahasa Indonesia":{fit:119000,life:99000,running:119000,cur:"Rp",fmt:function(n){return "Rp"+n.toLocaleString('id-ID').replace(/,/g,'.');}}
    };
    // 割引タグ（言語ごとに最適化）
    var TAG={
      "日本語":"まとめ割","English":"SAVE","简体中文":"套餐","繁體中文":"套餐","한국어":"묶음","ภาษาไทย":"แพ็กเกจ",
      "Français":"PACK","Español":"PACK","Deutsch":"SET","Italiano":"PACK","Português":"COMBO","हिन्दी":"बंडल","Tiếng Việt":"COMBO","Bahasa Indonesia":"PAKET"
    };
    var T={
      dark:{bg:"#16140F",title:"#F0EBE2",txt:"#F0EBE2",sub:"#8A7E68",muted:"#6E6555",lbl:"#B0A488",card:"#1A1814",cardBd:"#2A2620",accent:"#E3C56A",iconBg:"#1F1C16",iconBd:"#3A352A",iconCol:"#B0A488",dash:"#3A352A",selBd:"#E3C56A",selBg:"#1F1C15"},
      light:{bg:"#FFFFFF",title:"#2E2A24",txt:"#2E2A24",sub:"#8A7E68",muted:"#B7A98F",lbl:"#7A7060",card:"#FBF7F1",cardBd:"#F0EAE0",accent:"#BA7517",iconBg:"#FFFFFF",iconBd:"#E8E0CE",iconCol:"#9A8E78",dash:"#E0D6C4",selBd:"#BA7517",selBg:"#FBF3E0"}
    };
    var D={
      "日本語":{hdr:"プランを組み立てる",lead:"どのアプリを使いますか？",leadSub:"2つ選ぶと 10%、3つで 15% おトクになります。",
        apps:{fit:["revo fit","鍛える・記録する","ti-barbell"],life:["revo life","暮らしを運動に","ti-heart"],running:["revo running","走る・世界のコース","ti-run"]},
        soon:"近日",per:"/ 月",discAmt:"割引",totalLbl:"お支払い（月）",perLbl:"/ 月",
        pick:"アプリを選んでください",one:"もう1つ選ぶと 10% 割引",go:"このプランで申し込む",
        note:"最初の14日間は、合わなければ全額返金します。",off10:"-10%",off15:"-15%"},
      "English":{hdr:"Build your plan",lead:"Which apps will you use?",leadSub:"Pick 2 for 10% off, all 3 for 15% off.",
        apps:{fit:["revo fit","Train & track","ti-barbell"],life:["revo life","Life as movement","ti-heart"],running:["revo running","Run the world's routes","ti-run"]},
        soon:"Soon",per:"/mo",discAmt:"Discount",totalLbl:"You pay (monthly)",perLbl:"/mo",
        pick:"Choose your apps",one:"Add 1 more for 10% off",go:"Continue with this plan",
        note:"Full refund within the first 14 days.",off10:"10%",off15:"15%"},
      "简体中文":{hdr:"组建套餐",lead:"你要使用哪些应用？",leadSub:"选2个省10%，选3个省15%。",
        apps:{fit:["revo fit","锻炼·记录","ti-barbell"],life:["revo life","把生活变成运动","ti-heart"],running:["revo running","跑遍世界路线","ti-run"]},
        soon:"即将",per:"/月",discAmt:"优惠",totalLbl:"应付（每月）",perLbl:"/月",
        pick:"请选择应用",one:"再选1个省10%",go:"用此套餐订阅",
        note:"前14天内不满意可全额退款。",off10:"-10%",off15:"-15%"},
      "繁體中文":{hdr:"組建方案",lead:"你要使用哪些應用？",leadSub:"選2個省10%，選3個省15%。",
        apps:{fit:["revo fit","鍛鍊·記錄","ti-barbell"],life:["revo life","把生活變成運動","ti-heart"],running:["revo running","跑遍世界路線","ti-run"]},
        soon:"即將",per:"/月",discAmt:"優惠",totalLbl:"應付（每月）",perLbl:"/月",
        pick:"請選擇應用",one:"再選1個省10%",go:"用此方案訂閱",
        note:"前14天內不滿意可全額退款。",off10:"-10%",off15:"-15%"},
      "한국어":{hdr:"플랜 구성",lead:"어떤 앱을 쓰시나요?",leadSub:"2개 선택 시 10%, 3개면 15% 할인.",
        apps:{fit:["revo fit","단련·기록","ti-barbell"],life:["revo life","생활을 운동으로","ti-heart"],running:["revo running","세계의 코스를 달리다","ti-run"]},
        soon:"곧",per:"/월",discAmt:"할인",totalLbl:"결제 (월)",perLbl:"/월",
        pick:"앱을 선택하세요",one:"1개 더 담으면 10% 할인",go:"이 플랜으로 신청",
        note:"첫 14일간 맞지 않으면 전액 환불.",off10:"-10%",off15:"-15%"},
      "ภาษาไทย":{hdr:"จัดแพ็กเกจ",lead:"คุณจะใช้แอปไหนบ้าง?",leadSub:"เลือก 2 ลด 10% เลือก 3 ลด 15%",
        apps:{fit:["revo fit","ฝึก·บันทึก","ti-barbell"],life:["revo life","ชีวิตคือการเคลื่อนไหว","ti-heart"],running:["revo running","วิ่งเส้นทางทั่วโลก","ti-run"]},
        soon:"เร็วๆนี้",per:"/เดือน",discAmt:"ส่วนลด",totalLbl:"ยอดชำระ (เดือน)",perLbl:"/เดือน",
        pick:"เลือกแอป",one:"เพิ่มอีก 1 ลด 10%",go:"สมัครด้วยแพ็กเกจนี้",
        note:"14 วันแรก คืนเงินเต็มถ้าไม่ถูกใจ",off10:"-10%",off15:"-15%"},
      "Français":{hdr:"Composez votre offre",lead:"Quelles apps utiliserez-vous ?",leadSub:"2 apps : -10 %, les 3 : -15 %.",
        apps:{fit:["revo fit","S'entraîner et suivre","ti-barbell"],life:["revo life","La vie en mouvement","ti-heart"],running:["revo running","Courir le monde","ti-run"]},
        soon:"Bientôt",per:"/mois",discAmt:"Remise",totalLbl:"Vous payez (mois)",perLbl:"/mois",
        pick:"Choisissez vos apps",one:"Ajoutez-en 1 pour -10 %",go:"Continuer avec cette offre",
        note:"Remboursement intégral sous 14 jours.",off10:"-10%",off15:"-15%"},
      "Español":{hdr:"Arma tu plan",lead:"¿Qué apps usarás?",leadSub:"2 apps: -10 %, las 3: -15 %.",
        apps:{fit:["revo fit","Entrena y registra","ti-barbell"],life:["revo life","La vida en movimiento","ti-heart"],running:["revo running","Corre el mundo","ti-run"]},
        soon:"Pronto",per:"/mes",discAmt:"Descuento",totalLbl:"Pagas (mes)",perLbl:"/mes",
        pick:"Elige tus apps",one:"Añade 1 más para -10 %",go:"Continuar con este plan",
        note:"Reembolso total en los primeros 14 días.",off10:"-10%",off15:"-15%"},
      "Deutsch":{hdr:"Stell dein Paket zusammen",lead:"Welche Apps nutzt du?",leadSub:"2 Apps: -10 %, alle 3: -15 %.",
        apps:{fit:["revo fit","Trainieren & tracken","ti-barbell"],life:["revo life","Leben als Bewegung","ti-heart"],running:["revo running","Laufe die Welt","ti-run"]},
        soon:"Bald",per:"/Mon.",discAmt:"Rabatt",totalLbl:"Du zahlst (mtl.)",perLbl:"/Mon.",
        pick:"Wähle deine Apps",one:"1 mehr für -10 %",go:"Mit diesem Paket weiter",
        note:"Volle Rückerstattung in den ersten 14 Tagen.",off10:"-10%",off15:"-15%"},
      "Italiano":{hdr:"Componi il tuo piano",lead:"Quali app userai?",leadSub:"2 app: -10%, tutte e 3: -15%.",
        apps:{fit:["revo fit","Allena e traccia","ti-barbell"],life:["revo life","La vita in movimento","ti-heart"],running:["revo running","Corri il mondo","ti-run"]},
        soon:"Presto",per:"/mese",discAmt:"Sconto",totalLbl:"Paghi (mese)",perLbl:"/mese",
        pick:"Scegli le tue app",one:"Aggiungine 1 per -10%",go:"Continua con questo piano",
        note:"Rimborso totale nei primi 14 giorni.",off10:"-10%",off15:"-15%"},
      "Português":{hdr:"Monte seu plano",lead:"Quais apps você vai usar?",leadSub:"2 apps: -10%, os 3: -15%.",
        apps:{fit:["revo fit","Treine e registre","ti-barbell"],life:["revo life","A vida em movimento","ti-heart"],running:["revo running","Corra o mundo","ti-run"]},
        soon:"Em breve",per:"/mês",discAmt:"Desconto",totalLbl:"Você paga (mês)",perLbl:"/mês",
        pick:"Escolha seus apps",one:"Adicione +1 para -10%",go:"Continuar com este plano",
        note:"Reembolso total nos primeiros 14 dias.",off10:"-10%",off15:"-15%"},
      "हिन्दी":{hdr:"अपना प्लान बनाएं",lead:"आप कौन-से ऐप इस्तेमाल करेंगे?",leadSub:"2 चुनें: 10%, तीनों: 15% छूट।",
        apps:{fit:["revo fit","ट्रेन करें·रिकॉर्ड","ti-barbell"],life:["revo life","जीवन ही व्यायाम","ti-heart"],running:["revo running","दुनिया के रूट दौड़ें","ti-run"]},
        soon:"जल्द",per:"/माह",discAmt:"छूट",totalLbl:"भुगतान (माह)",perLbl:"/माह",
        pick:"ऐप चुनें",one:"1 और चुनें, 10% छूट",go:"इस प्लान से जारी रखें",
        note:"पहले 14 दिन में पूरा रिफंड।",off10:"-10%",off15:"-15%"},
      "Tiếng Việt":{hdr:"Tạo gói của bạn",lead:"Bạn sẽ dùng app nào?",leadSub:"2 app: -10%, cả 3: -15%.",
        apps:{fit:["revo fit","Tập & ghi lại","ti-barbell"],life:["revo life","Cuộc sống là vận động","ti-heart"],running:["revo running","Chạy khắp thế giới","ti-run"]},
        soon:"Sắp",per:"/tháng",discAmt:"Giảm",totalLbl:"Bạn trả (tháng)",perLbl:"/tháng",
        pick:"Chọn app của bạn",one:"Thêm 1 để giảm 10%",go:"Tiếp tục với gói này",
        note:"Hoàn tiền đầy đủ trong 14 ngày đầu.",off10:"-10%",off15:"-15%"},
      "Bahasa Indonesia":{hdr:"Susun paketmu",lead:"App mana yang akan kamu pakai?",leadSub:"Pilih 2: -10%, ketiganya: -15%.",
        apps:{fit:["revo fit","Latih & catat","ti-barbell"],life:["revo life","Hidup sebagai gerak","ti-heart"],running:["revo running","Lari rute dunia","ti-run"]},
        soon:"Segera",per:"/bln",discAmt:"Diskon",totalLbl:"Kamu bayar (bln)",perLbl:"/bln",
        pick:"Pilih app-mu",one:"Tambah 1 untuk -10%",go:"Lanjut dengan paket ini",
        note:"Refund penuh dalam 14 hari pertama.",off10:"-10%",off15:"-15%"}
    };
    var $=function(id){return document.getElementById(id);};

    function renderApps(){
      var d=D[cur]||D["English"], t=dark?T.dark:T.light, pr=PRICE[cur]||PRICE["English"];
      $('appCards').innerHTML="";
      ["fit","life","running"].forEach(function(key){
        var info=d.apps[key], soon=(key==="running"), on=sel[key];
        var card=document.createElement('div');
        card.style.cssText="display:flex; align-items:center; gap:13px; border-radius:14px; padding:14px; cursor:"+(soon?"default":"pointer")+"; background:"+(on?t.selBg:t.card)+"; border:1px solid "+(on?t.selBd:t.cardBd)+"; opacity:"+(soon?"0.55":"1")+"; transition:all 0.2s;";
        // アイコン（正式な金帯：上revo＋下サービス名）
        var iconBox='<div style="width:40px; height:40px; border-radius:10px; background:#16140F; overflow:hidden; display:flex; flex-direction:column; border:0.5px solid #2A2620; flex-shrink:0;"><div style="flex:1; display:flex; align-items:center; justify-content:center;"><span style="font-family:Jost; font-weight:200; font-size:11px; color:#F0EBE2; letter-spacing:0.5px;">revo</span></div><div style="height:13px; background:#E3C56A; display:flex; align-items:center; justify-content:center;"><span style="font-family:Jost; font-weight:500; font-size:7px; color:#16140F;">'+key+'</span></div></div>';
        // チェック
        var check = soon
          ? '<span style="font-size:10px; color:'+t.accent+'; background:'+(dark?"#221E14":"#FBF3E0")+'; padding:3px 9px; border-radius:6px; flex-shrink:0;">'+d.soon+'</span>'
          : '<div style="width:24px; height:24px; border-radius:7px; border:1.5px solid '+(on?t.accent:t.cardBd)+'; background:'+(on?t.accent:"transparent")+'; display:flex; align-items:center; justify-content:center; flex-shrink:0;">'+(on?'<i class="ti ti-check" style="font-size:15px; color:#16140F;"></i>':'')+'</div>';
        card.innerHTML=iconBox+
          '<div style="flex:1; min-width:0;"><p style="font-size:14px; color:'+t.title+'; margin:0 0 2px; font-weight:600; font-family:Jost; display:flex; align-items:center; gap:6px;">'+info[0]+'<i class="ti '+info[2]+'" style="font-size:14px; color:'+t.accent+';"></i></p><p style="font-size:11px; color:'+t.sub+'; margin:0;">'+info[1]+'</p></div>'+
          '<span style="font-size:12px; color:'+t.lbl+'; font-family:Jost; margin-right:2px; flex-shrink:0;">'+pr.fmt(pr[key])+'</span>'+
          check;
        if(!soon){ card.onclick=function(){ sel[key]=!sel[key]; renderApps(); renderSummary(); }; }
        $('appCards').appendChild(card);
      });
    }

    function renderSummary(){
      var d=D[cur]||D["English"], t=dark?T.dark:T.light, pr=PRICE[cur]||PRICE["English"];
      var chosen=["fit","life","running"].filter(function(k){ return sel[k]; });
      var n=chosen.length;
      // 明細行
      $('sumRows').innerHTML="";
      if(n===0){
        $('sumRows').innerHTML='<p style="font-size:12px; color:'+t.muted+'; text-align:center; padding:6px 0;">'+d.pick+'</p>';
      } else {
        chosen.forEach(function(k){
          var row=document.createElement('div');
          row.style.cssText="display:flex; justify-content:space-between; align-items:baseline;";
          row.innerHTML='<span style="font-size:12px; color:'+t.lbl+'; font-family:Jost;">revo '+k+'</span><span style="font-size:12px; color:'+t.txt+'; font-family:Jost;">'+pr.fmt(pr[k])+'</span>';
          $('sumRows').appendChild(row);
        });
      }
      // 合計計算
      var listSum=0; chosen.forEach(function(k){ listSum+=pr[k]; });
      var rate = n>=3?0.15:(n===2?0.10:0);
      var discounted = Math.round(listSum*(1-rate));
      // 端数整理（日本語・韓国語などは10/100単位に丸め）
      if(cur==="日本語") discounted=Math.round(discounted/10)*10;
      if(cur==="한국어") discounted=Math.round(discounted/100)*100;
      var discAmt = listSum - discounted;

      // 割引タグ行
      if(n>=2){
        $('discountRow').style.display="flex";
        var offTxt = n>=3?d.off15:d.off10;
        $('discTag').textContent = (TAG[cur]||"SAVE")+" "+offTxt;
        $('discAmt').textContent = "-"+pr.fmt(discAmt);
      } else {
        $('discountRow').style.display="none";
      }
      // 合計表示
      if(n>=2){ $('listVal').style.display="inline"; $('listVal').textContent=pr.fmt(listSum); }
      else { $('listVal').style.display="none"; }
      $('totalVal').textContent = n===0 ? pr.fmt(0) : pr.fmt(discounted);
      $('totalLbl').textContent=d.totalLbl; $('perLbl').textContent=d.perLbl;

      // ボタン
      var btn=$('submitBtn');
      if(n===0){ btn.disabled=true; btn.style.opacity="0.5"; $('submitLbl').textContent=d.pick; }
      else if(n===1){ btn.disabled=false; btn.style.opacity="1"; $('submitLbl').textContent=d.one; }
      else { btn.disabled=false; btn.style.opacity="1"; $('submitLbl').textContent=d.go; }
    }

    function applyUI(){
      var d=D[cur]||D["English"];
      $('hdrTtl').textContent=d.hdr; $('leadTtl').textContent=d.lead; $('leadSub').textContent=d.leadSub;
      $('noteTxt').textContent=d.note;
      renderApps(); renderSummary();
    }
    function applyTheme(){
      var t=dark?T.dark:T.light;
      $('screen').style.background=t.bg;
      $('hdr').style.borderColor=t.cardBd; $('hdrTtl').style.color=t.title;
      $('leadTtl').style.color=t.title; $('leadSub').style.color=t.sub;
      $('sumCard').style.background=t.card; $('sumCard').style.borderColor=t.cardBd;
      $('totalLbl').style.color=t.lbl; $('totalVal').style.color=t.title; $('perLbl').style.color=t.sub;
      $('listVal').style.color=t.muted;
      $('discountRow').style.borderColor=t.dash;
      $('discTag').style.background=t.accent; $('discTag').style.color= dark?"#16140F":"#FFFFFF";
      $('submitBtn').style.background=t.accent; $('submitBtn').style.color= dark?"#16140F":"#FFFFFF";
      $('noteTxt').style.color=t.muted;
      [$('langBtn'),$('themeBtn')].forEach(function(b){ b.style.background=t.iconBg; b.style.borderColor=t.iconBd; });
      $('langBtn').querySelector('i').style.color=t.iconCol;
      $('themeIcon').className= dark? "ti ti-sun":"ti ti-moon"; $('themeIcon').style.color= dark? "#E3C56A":"#9A7B16";
      $('langMenu').style.background= dark?"#1F1C16":"#FFFFFF"; $('langMenu').style.borderColor=t.iconBd;
      applyUI();
    }
    function renderMenu(){
      var titleCol= dark?"#F0EBE2":"#2E2A24", subCol="#8A7E68", acc= dark?"#E3C56A":"#BA7517";
      $('langMenu').innerHTML="";
      langs.forEach(function(l){
        var on=(l===cur);
        var row=document.createElement('div');
        row.style.cssText="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:10px; cursor:pointer;";
        row.onmouseenter=function(){ row.style.background=dark?"#26231C":"#F4EFE6"; };
        row.onmouseleave=function(){ row.style.background="transparent"; };
        row.innerHTML='<div><p style="font-size:13px; color:'+(on?acc:titleCol)+'; margin:0; font-weight:'+(on?"500":"400")+';">'+l+'</p>'+(langSub[l]?'<p style="font-size:10px; color:'+subCol+'; margin:1px 0 0;">'+langSub[l]+'</p>':'')+'</div>'+(on?'<i class="ti ti-check" style="font-size:16px; color:'+acc+';"></i>':'');
        row.onclick=function(){ cur=l; $('langMenu').style.display="none"; applyTheme(); };
        $('langMenu').appendChild(row);
      });
    }
    $('langBtn').onclick=function(e){ e.stopPropagation(); renderMenu(); var m=$('langMenu'); m.style.display=(m.style.display==="none"||!m.style.display)?"block":"none"; };
    $('themeBtn').onclick=function(){ dark=!dark; applyTheme(); };
    document.addEventListener('click', function(){ $('langMenu').style.display="none"; });
    $('langMenu').onclick=function(e){ e.stopPropagation(); };
    applyTheme();
  })();
</script>
</div>
Commit changes
