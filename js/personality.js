// ============================================
// PERSONALITY - Gaya Bicara SimSimi (155 Template)
// ============================================

const PERSONALITY = {
  // ===== QUOTE INSPIRASIONAL =====
  quotes: [
    "Hemat pangkal kaya! 💪",
    "Sedikit-sedikit lama-lama jadi bukit! 🏔️",
    "Rezeki nggak kemana, asal usaha nggak berhenti! 🚀",
    "Jangan tunda menabung, nanti nyesel! 💸",
    "Orang kaya bukan yang punya banyak, tapi yang cukup! ✨",
    "Uang bukan segalanya, tapi segalanya butuh uang! 😅",
    "Jangan takut miskin, takutlah boros! 🫣",
    "Rezeki itu seperti putaran roda, kadang di atas kadang di bawah! 🔄",
    "Hari ini hemat, besok bisa senyum! 😊",
    "Menabung itu investasi buat masa depan! 📈",
    "Jangan pernah remehkan uang receh, lama-lama jadi bukit! 🪙",
    "Hidup itu singkat, jangan dihabiskan buat bayar utang! ⏳",
    "Uang itu hanya alat, bukan tujuan! 🛠️",
    "Kalau bisa dihemat, kenapa harus boros? 🤔",
    "Saya dukung kamu buat sukses finansial! 🎯",
    "Kunci sukses: kerja keras + doa + hemat! 🙏",
    "Orang bijak menghabiskan uang untuk investasi, bukan konsumsi! 📊",
    "Uang bisa dicari, tapi waktu nggak bisa diulang! ⏰",
    "Hidup sederhana itu keren! 😎",
    "Rencanakan keuanganmu, jangan biarkan keuangan merencanakanmu! 📋"
  ],

  // ===== TEMPLATE BALANCE ===== (20 template)
  balance: [
    "Saldo kamu {amount}. Jangan diborong buat beli kopi terus ya! ☕",
    "Saldo {amount}? Lumayan! Tapi ingat, jajanan di pinggir jalan itu menggoda... 😋",
    "Kamu punya {amount} di dompet. Kalau mau naik haji, makin semangat! 🕋",
    "Saldo {amount}? Kamu kaya raya! *kidding* 😄",
    "Dompetmu {amount}? Awas jajan mulu ya! 🛍️",
    "{amount} di rekening! Mau diapain nih? Beli gadget atau nabung? 🤔",
    "Saldo {amount}! Lumayan buat makan sebulan! 🍱",
    "Kamu punya {amount}. Cukup buat hidup hari ini, besok cari lagi! 💪",
    "Saldo {amount}? Jangan-jangan ini hasil nabung dari tahun lalu? 🫣",
    "Wah {amount}! Kamu mulai kaya nih! Tapi jangan sombong ya! 😏",
    "{amount} di dompet. Ingat, lebih baik punya banyak daripada kurang! 💡",
    "Saldo {amount}! Jangan lupa sisihkan buat sedekah ya! 🤲",
    "Kamu punya {amount}. Cukup buat hidup tenang hari ini! 😌",
    "Saldo {amount}! Semoga nambah terus ya, doakan! 🙏",
    "{amount}? Jangan kebanyakan mikir, yang penting cukup! ✨",
    "Saldo {amount}! Hayoo, mau diapain nih? Beli apa? 🛒",
    "Punya {amount}! Lumayan lah buat jajan hari ini! 🍭",
    "Saldo {amount}! Tapi ingat, esok masih ada hari! 😊",
    "{amount} di dompet! Semoga berkah ya! 🤲",
    "Kamu punya {amount}. Jangan sampai habis sebelum gajian ya! 😅"
  ],

  // ===== TEMPLATE EXPENSE ===== (20 template)
  expense: [
    "Hari ini kamu keluar {amount} buat {category}. Masih aman kok! 💸",
    "Wah, {category} {amount}! Semoga perut kenyang, dompet tetap aman! 🍽️",
    "Kamu baru aja ngeluarin {amount} buat {category}. Jangan sedih, rezeki masih ada! ✨",
    "{category} {amount}? Hmm... semoga sepadan! 😏",
    "Duit {amount} hilang buat {category}. Tapi tenang, besok kamu bisa ganti! 💪",
    "{amount} buat {category}! Hayoo, enak apa tadi? 🍜",
    "Kamu keluar {amount} untuk {category}. Padahal tadi mau hemat! 😅",
    "{category} {amount}? Jangan-jangan ini karena kamu laper banget? 🫣",
    "Hari ini {category} makan {amount}. Besok jangan terlalu sering ya! 😋",
    "{amount} untuk {category}! Semoga sebanding dengan kepuasan! ✨",
    "{category} {amount}? Coba kurangi sedikit, biar dompet awet! 💡",
    "Kamu baru belanja {category} sebesar {amount}. Besok lebih hemat ya! 😊",
    "{amount} buat {category}! Jangan lupa, esok masih perlu makan! 🍚",
    "Hari ini {category} {amount}. Jangan sampai kebiasaan ini berlanjut! 🫣",
    "{category} {amount}? Sudah, anggap saja investasi buat perut! 😄",
    "Wah {category} {amount}! Kayaknya enak banget tuh! 🍽️",
    "{amount} buat {category}! Hayoo, bagi dong! 🤭",
    "Kamu keluar {amount} untuk {category}. Jangan lupa besok ganti! 💪",
    "{category} {amount}! Masih murah kok daripada yang lain! 😉",
    "Hari ini {category} {amount}. Semoga kenyang dan happy! 😊"
  ],

  // ===== TEMPLATE INCOME ===== (20 template)
  income: [
    "Hore! Kamu dapat {amount} dari {category}! Jangan langsung dibelanjain semua ya... 🎉",
    "Pemasukan {amount}? Mantap! Ini saatnya investasi atau nabung! 📈",
    "Kerja bagus! {amount} masuk ke dompet. Semangat terus! 💪",
    "Duit {amount} masuk! Rasanya kayak menang lotre! 🏆",
    "{category} {amount}? Wah, makin kaya nih! Tapi ingat, jangan lupa sedekah! 🤲",
    "{amount} dari {category}! Hayoo, mau diapain? Beli apa? 🛍️",
    "Pemasukan {amount}! Kamu hebat! Lanjutkan! 🚀",
    "{category} {amount}! Jangan-jangan ini bonus? 🤔",
    "Kamu dapat {amount} dari {category}! Langsung tabung ya! 💰",
    "{amount} masuk! Ini bukti usaha kamu nggak sia-sia! 🎯",
    "{amount} dari {category}! Ingat, lebih baik ditabung daripada dihabiskan! 💡",
    "Pemasukan {amount}! Jangan lupa sisihkan buat masa depan! 📈",
    "{category} {amount}! Coba investasikan sebagian, biar berkembang! 🌱",
    "Kamu dapat {amount}! Ini saatnya memikirkan keuangan jangka panjang! 🏦",
    "{amount} masuk! Jangan tergoda buat belanja online ya! 😅",
    "Wah {amount} dari {category}! Kamu hebat! 🎉",
    "{amount} masuk! Ayo kita rayakan! Tapi jangan berlebihan ya! 🥳",
    "Pemasukan {amount}! Semoga terus bertambah! 💪",
    "{category} {amount}! Ini pertanda baik buat masa depan! ✨",
    "Kamu dapat {amount}! Jangan lupa bersyukur dan tetap semangat! 🙏"
  ],

  // ===== TEMPLATE PLAN ===== (20 template)
  plan: [
    "Rencana {title} sebesar {amount}? Oke! Jangan lupa bayar tepat waktu ya! 📅",
    "Catet! {title} {amount}. Kalau lupa bayar, bisa-bisa tagihan numpuk! 🧺",
    "Oke, {title} {amount}. Aku catet ya, jangan sampe lupa! 📝",
    "Tagihan {title} {amount}? Ingat, bayar sebelum jatuh tempo! ⏰",
    "{title} {amount}! Jangan sampai kelewat ya! 🔔",
    "{title} {amount}! Ini tagihan apa nih? Listrik? Internet? 🏠",
    "Rencana {title} {amount}! Semoga budget masih cukup ya! 💸",
    "{title} {amount}! Ingat, lebih baik bayar sekarang daripada nanti! 😅",
    "Kamu catet {title} {amount}! Aku ingetin nanti ya! 🔔",
    "{title} {amount}! Kalau lupa, aku yang ingetin! 😉",
    "{title} {amount}! Bayar tepat waktu biar nggak ada denda! 💡",
    "Rencana {title} {amount}! Sisihkan uangnya sekarang ya! 💰",
    "{title} {amount}! Jangan sampai kelewat, nanti ribet! 🫣",
    "Tagihan {title} {amount}! Lebih baik bayar sekarang! 😊",
    "{title} {amount}! Kalau bisa, bayar lebih awal biar tenang! ✨",
    "{title} {amount}! Hayoo, bayar nggak nih? 😄",
    "Rencana {title} {amount}! Jangan lupa ya, nanti aku tanyain lagi! 🤭",
    "{title} {amount}! Tagihan lagi? Semoga masih kuat! 💪",
    "Kamu rencanain {title} {amount}! Aku dukung! 🚀",
    "{title} {amount}! Semoga lancar bayarnya! 🙏"
  ],

  // ===== TEMPLATE PAID ===== (20 template)
  paid: [
    "{title} lunas! Hore! Sekarang kamu bebas! 🎉",
    "Kamu lunasi {title}! Jangan sampe keinget lagi ya! 😄",
    "{title} berhasil dibayar. Mantap! Dompet aman! 😊",
    "Selamat! {title} lunas. Semoga tagihan lainnya juga cepat lunas! 🎉",
    "{title} sudah lunas! Satu beban hilang! ✨",
    "{title} lunas! Enak ya rasanya bebas dari tagihan! 😌",
    "Kamu bayar {title}! Sekarang tinggal berapa tagihan lagi? 🤔",
    "{title} lunas! Ayo semangat bayar yang lain! 💪",
    "Selamat! {title} sudah lunas. Kamu hebat! 🏆",
    "{title} lunas! Jangan sampai telat lagi ya! 😅",
    "{title} lunas! Mulai nabung buat tagihan berikutnya! 💡",
    "{title} berhasil dibayar! Coba lebih disiplin lagi! 📋",
    "Lunas! {title} sudah selesai. Jangan ngutang lagi ya! 😏",
    "{title} lunas! Semoga keuanganmu semakin sehat! 📈",
    "Kamu bayar {title}! Coba kurangi tagihan yang nggak perlu! 🤔",
    "{title} lunas! Hore! Sekarang bisa fokus ke yang lain! 🎯",
    "Kamu lunasi {title}! Mantap! 🚀",
    "{title} berhasil dibayar! Kamu keren! 😎",
    "Selamat! {title} lunas. Semoga rezeki makin lancar! 🙏",
    "{title} lunas! Kamu berhasil! 🏆"
  ],

  // ===== TEMPLATE DEFAULT ===== (20 template)
  default: [
    "Siap, bos! {text} 👍",
    "Oke! {text} 😊",
    "Mantap! {text} 🚀",
    "Siap! {text} ✨",
    "Done! {text} 🙌",
    "Baik, {text}! 😄",
    "Siap dilaksanakan! {text} 💪",
    "Oke banget! {text} 🔥",
    "Gaskeun! {text} 🏍️",
    "Sip! {text} 👌",
    "Mantul! {text} 😎",
    "Jalan! {text} 🚶",
    "Siap, siap! {text} 🙋",
    "Oke oke! {text} 😉",
    "Done banget! {text} ✅",
    "Siap, bos! {text} 🤝",
    "Oke cuy! {text} 😄",
    "Mantap jiwa! {text} ✨",
    "Siap-siap! {text} 🚀",
    "Gas terus! {text} 🔥"
  ],

  // ===== TEMPLATE KHUSUS KATEGORI =====
  categorySpecific: {
    "Makan": [
      "Makan {amount}? Enak banget tuh! 🍽️",
      "{amount} buat makanan! Jangan lupa sayur ya! 🥗",
      "Makan {amount}! Semoga kenyang! 😋",
      "Kamu habiskan {amount} buat makan! Porsi jumbo? 🍚",
      "Makan {amount}! Jangan lupa minumnya! 🥤"
    ],
    "Transport": [
      "Transport {amount}! Naik apa nih? 🚗",
      "{amount} buat transport! Semoga sampai tujuan! 🚌",
      "Transport {amount}! Jarak jauh ya? 🛵",
      "Kamu keluar {amount} buat transport! Semoga cepat sampai! 🚀",
      "Transport {amount}! Bensin atau online? ⛽"
    ],
    "Kebutuhan Rumah": [
      "Kebutuhan rumah {amount}! Belanja bulanan? 🏠",
      "{amount} buat rumah! Semoga nyaman! ✨",
      "Kebutuhan rumah {amount}! Jangan lupa listriknya! ⚡",
      "Rumah tangga {amount}! Hemat-hemat ya! 😄",
      "Kebutuhan rumah {amount}! Semoga semua beres! 🛠️"
    ],
    "Tagihan": [
      "Tagihan {amount}! Bayar tepat waktu ya! 📅",
      "{amount} buat tagihan! Semoga lancar! ⚡",
      "Tagihan {amount}! Jangan sampai mati lampu! 💡",
      "Kamu bayar tagihan {amount}! Semoga berkah! 🙏",
      "Tagihan {amount}! Sudah, anggap saja investasi! 📊"
    ],
    "Hiburan": [
      "Hiburan {amount}! Kamu pasti senang! 🎮",
      "{amount} buat hiburan! Jangan lupa istirahat! 😴",
      "Hiburan {amount}! Seru banget pasti! 🎉",
      "Kamu keluar {amount} buat hiburan! Semoga happy! 😊",
      "Hiburan {amount}! Sesekali boleh, asal nggak tiap hari! 😅"
    ],
    "Tabungan": [
      "Tabungan {amount}! Kamu hebat! 💰",
      "{amount} masuk tabungan! Keren! 🏆",
      "Tabungan {amount}! Semakin dekat dengan mimpi! ✨",
      "Kamu nabung {amount}! Jangan diambil ya! 😄",
      "Tabungan {amount}! Terus semangat! 💪"
    ],
    "Saldo Awal": [
      "Saldo awal {amount}! Awal yang baik! 🚀",
      "{amount} saldo awal! Semoga berkembang! 📈",
      "Saldo awal {amount}! Siap memulai! 💪",
      "Kamu mulai dengan {amount}! Sukses selalu! ✨",
      "Saldo awal {amount}! Jangan habiskan ya! 😄"
    ]
  },

  // ===== FUNGSI: GET RANDOM TEMPLATE =====
  getRandomTemplate: function(templates) {
    return templates[Math.floor(Math.random() * templates.length)];
  },

  // ===== FUNGSI: GET QUOTE RANDOM =====
  getQuote: function() {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)];
  },

  // ===== FUNGSI: REAKSI BERDASARKAN JUMLAH =====
  reactionByAmount: function(amount) {
    if (amount > 100000000) {
      const reactions = [
        "KAMU KAYA RAYA! 🤑",
        "Saldo gila nih! Bangun usaha dong! 🏢",
        "Kaya raya! Jangan lupa sedekah ya! 🤲",
        "Saldo melimpah! Ayo investasi! 📈",
        "Wah, saldo segini bisa beli rumah! 🏠"
      ];
      return reactions[Math.floor(Math.random() * reactions.length)];
    } else if (amount > 50000000) {
      const reactions = [
        "Saldo gede nih! Jangan lupa investasi! 📈",
        "Lumayan besar! Semoga bertambah terus! 💪",
        "Saldo 50 juta+! Kamu hebat! 🏆",
        "Saldo segini udah bisa jalan-jalan ke luar negeri! ✈️",
        "Mantap! Saldo 50 juta! Terus semangat! 🚀"
      ];
      return reactions[Math.floor(Math.random() * reactions.length)];
    } else if (amount > 10000000) {
      const reactions = [
        "Saldo lumayan! Bisa buat liburan nih! 🏖️",
        "10 juta+! Lumayan buat dana darurat! 🛡️",
        "Saldo segini udah cukup buat hidup beberapa bulan! 😌",
        "Mantap! Terus nabung ya! 💰",
        "Saldo 10 juta! Kamu hebat! 🎉"
      ];
      return reactions[Math.floor(Math.random() * reactions.length)];
    } else if (amount > 5000000) {
      const reactions = [
        "Saldo aman! Tapi jangan boros ya! 😉",
        "5 juta+! Cukup buat kebutuhan bulan ini! 📋",
        "Saldo segini udah lumayan! Jaga terus! 🛡️",
        "Mantap! Semoga cepat naik! 🚀",
        "Saldo 5 juta! Ayo tambah terus! 💪"
      ];
      return reactions[Math.floor(Math.random() * reactions.length)];
    } else if (amount > 1000000) {
      const reactions = [
        "Saldo masih aman, tapi mulai hemat yuk! 💡",
        "1 juta+! Cukup buat darurat! 🛡️",
        "Saldo segini aman, tapi jangan lengah! 😉",
        "Mantap! Jaga terus saldomu! 💰",
        "Saldo 1 juta! Mulai nabung lebih giat! 📈"
      ];
      return reactions[Math.floor(Math.random() * reactions.length)];
    } else {
      const reactions = [
        "Saldo mepet! Saatnya cari tambahan cuan! 🏃",
        "Saldo di bawah 1 juta! Ayo cari penghasilan tambahan! 💪",
        "Saldo segini masih aman, tapi harus lebih hemat! 😅",
        "Saldo kecil! Jangan putus asa, terus berusaha! 🙏",
        "Saldo habis? Semangat, besok rezeki datang! ✨"
      ];
      return reactions[Math.floor(Math.random() * reactions.length)];
    }
  },

  // ===== FUNGSI: REAKSI BERDASARKAN KATEGORI =====
  reactionByCategory: function(category, amount) {
    const expensive = amount > 100000;
    const cheap = amount < 20000;
    
    if (category === 'Makan' && expensive) {
      const reacts = [
        "Makan mahal nih! Jangan-jangan di resto fancy? 😋",
        "Wah, makan {amount}! Kayaknya enak banget! 🍽️",
        "Makan sampai {amount}! Kamu pasti puas! 😊",
        "Makan mahal! Tapi sesekali boleh lah! 🍜"
      ];
      return reacts[Math.floor(Math.random() * reacts.length)];
    } else if (category === 'Makan' && cheap) {
      const reacts = [
        "Makan murah! Nasi warteg ya? Mantap! 🍛",
        "Makan {amount}! Masih murah kok! 😄",
        "Makan hemat! Kamu pintar mengatur keuangan! 💡",
        "Makan murah! Tapi tetap bergizi ya! 🥗"
      ];
      return reacts[Math.floor(Math.random() * reacts.length)];
    } else if (category === 'Transport' && expensive) {
      const reacts = [
        "Transport mahal? Naik apa nih, pesawat? ✈️",
        "Transport {amount}! Jarak jauh ya? 🚗",
        "Mahal amat transportnya! 🛵",
        "Transport segini! Semoga nyaman! 😊"
      ];
      return reacts[Math.floor(Math.random() * reacts.length)];
    } else if (category === 'Hiburan' && expensive) {
      const reacts = [
        "Hiburan mahal! Nonton konser? Atau main game? 🎮",
        "Hiburan {amount}! Kamu pasti senang! 🎉",
        "Hiburan mahal! Tapi happy kan? 😊",
        "Keluar duit {amount} buat hiburan! Asal happy! ✨"
      ];
      return reacts[Math.floor(Math.random() * reacts.length)];
    }
    return null;
  },

  // ===== FUNGSI: ENHANCE (FUNGSI UTAMA) =====
  // PERBAIKAN: gunakan this[type] bukan this.templates[type]
  enhance: function(text, type, data) {
    let templates = this[type] || this.default;
    let template = this.getRandomTemplate(templates);
    
    if (data.category && this.categorySpecific[data.category]) {
      const specificTemplates = this.categorySpecific[data.category];
      if (Math.random() < 0.4) {
        template = this.getRandomTemplate(specificTemplates);
      }
    }
    
    let result = template
      .replace(/{amount}/g, data.amount || 'Rp0')
      .replace(/{category}/g, data.category || '')
      .replace(/{title}/g, data.title || '')
      .replace(/{text}/g, data.text || '');
    
    if (Math.random() < 0.3) {
      result += '\n\n💡 ' + this.getQuote();
    }
    
    if (type === 'balance' && data.amount) {
      const numAmount = parseInt(data.amount.replace(/[^0-9]/g, ''));
      if (!isNaN(numAmount)) {
        result += '\n\n' + this.reactionByAmount(numAmount);
      }
    }
    
    if ((type === 'expense' || type === 'income') && data.category && data.amount) {
      const numAmount = parseInt(data.amount.replace(/[^0-9]/g, ''));
      if (!isNaN(numAmount)) {
        const categoryReaction = this.reactionByCategory(data.category, numAmount);
        if (categoryReaction) {
          result += '\n\n' + categoryReaction;
        }
      }
    }
    
    return result;
  }
};

console.log('✅ Personality module loaded with fix');