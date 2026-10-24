// Demo data. Companies, products, prices and platform figures are fictional samples.
// National figures (window.MIJ.national) are real and sourced. Text lives in i18n/*.js.
window.MIJ = {
  usdPerJod: 1.41,

  national: {
    exports: 8.9e9,          // JD, industrial exports 2025 (Jordan Chamber of Industry)
    exportsShare: 92,        // % of national exports (JCI)
    establishments: 18000,   // industrial establishments incl. craft workshops (JCI)
    workers: 261000,         // industrial workers 2025 (JCI)
    estates: 10,             // JIEC industrial estates
    estateCompanies: 937,    // companies operating in JIEC estates (JIEC, 2024)
    estateInvestment: 3.235e9,
    estateJobs: 60000
  },

  sectors: [
    { id: 'food', hue: 96, listings: 3900 },
    { id: 'pharma', hue: 188, listings: 1650 },
    { id: 'chemicals', hue: 160, listings: 1480 },
    { id: 'mining', hue: 32, listings: 310 },
    { id: 'machinery', hue: 210, listings: 1720 },
    { id: 'electrical', hue: 48, listings: 1560 },
    { id: 'plastics', hue: 176, listings: 2240 },
    { id: 'textiles', hue: 340, listings: 2050 },
    { id: 'building', hue: 28, listings: 1380 },
    { id: 'furniture', hue: 22, listings: 920 },
    { id: 'cosmetics', hue: 300, listings: 870 },
    { id: 'paper', hue: 40, listings: 520 }
  ],

  // JIEC estates. lon/lat for the map; listed = sample listed factories at year-2 scale.
  estates: [
    { id: 'irbid', lon: 35.93, lat: 32.50, listed: 168 },
    { id: 'jerash', lon: 35.90, lat: 32.27, listed: 19 },
    { id: 'zarqa', lon: 36.09, lat: 32.07, listed: 26 },
    { id: 'salt', lon: 35.72, lat: 32.05, listed: 18 },
    { id: 'sahab', lon: 35.995, lat: 31.872, listed: 210 },
    { id: 'muwaqqar', lon: 36.10, lat: 31.80, listed: 74 },
    { id: 'madaba', lon: 35.79, lat: 31.72, listed: 22 },
    { id: 'karak', lon: 35.70, lat: 31.15, listed: 31 },
    { id: 'tafila', lon: 35.60, lat: 30.84, listed: 12 },
    { id: 'aqaba', lon: 35.02, lat: 29.47, listed: 46 }
  ],
  outsideEstates: 614,

  // Natural Earth outline of Jordan (lon, lat)
  outline: [[35.546, 32.394], [35.720, 32.709], [36.834, 32.313], [38.792, 33.379], [39.195, 32.161], [39.005, 32.010], [37.002, 31.508], [37.999, 30.509], [37.668, 30.339], [37.504, 30.004], [36.741, 29.865], [36.501, 29.505], [36.069, 29.197], [34.956, 29.357], [34.923, 29.501], [35.421, 31.100], [35.398, 31.489], [35.545, 31.783]],

  factories: [
    { id: 'f01', name: { en: 'Zeituna Agro-Foods', ar: 'زيتونة للصناعات الغذائية' }, sector: 'food', estate: 'irbid', founded: 1998, employees: 240, area: 18000, lines: 6, use: 72, rating: 4.8, plan: 'export', open: 'oem', certs: ['ISO 22000', 'HACCP', 'Halal', 'FDA reg.', 'JS'], markets: ['SA', 'AE', 'KW', 'QA', 'US', 'DE', 'GB', 'CA', 'IQ'] },
    { id: 'f02', name: { en: 'Nabatea Life Pharma', ar: 'أنباط لايف للأدوية' }, sector: 'pharma', estate: 'sahab', founded: 2004, employees: 620, area: 32000, lines: 9, use: 81, rating: 4.9, plan: 'export', open: 'expansion', certs: ['EU-GMP', 'ISO 9001', 'JFDA', 'SFDA'], markets: ['SA', 'IQ', 'DZ', 'KE', 'YE', 'SD', 'LY', 'AE'] },
    { id: 'f03', name: { en: 'Lisan Minerals & Cosmetics', ar: 'اللسان للمعادن ومستحضرات التجميل' }, sector: 'cosmetics', estate: 'karak', founded: 2011, employees: 85, area: 6500, lines: 3, use: 58, rating: 4.6, plan: 'growth', open: 'oem', certs: ['ISO 22716', 'GMP', 'Halal'], markets: ['DE', 'FR', 'GB', 'AE', 'SA', 'RU', 'CN', 'JP'] },
    { id: 'f04', name: { en: 'Basalt Line Engineering', ar: 'بازلت لاين للهندسة' }, sector: 'machinery', estate: 'muwaqqar', founded: 2001, employees: 310, area: 24000, lines: 5, use: 77, rating: 4.8, plan: 'export', open: null, certs: ['ISO 9001', 'CE', 'Eurovent'], markets: ['SA', 'AE', 'QA', 'IQ', 'EG', 'KW', 'OM'] },
    { id: 'f05', name: { en: 'Karak Agri-Machinery', ar: 'الكرك للآلات الزراعية' }, sector: 'machinery', estate: 'karak', founded: 1993, employees: 140, area: 12000, lines: 4, use: 61, rating: 4.7, plan: 'growth', open: 'expansion', certs: ['ISO 9001', 'CE'], markets: ['TN', 'MA', 'DZ', 'PS', 'IQ', 'SA'] },
    { id: 'f06', name: { en: 'Sahab Switchgear & Cables', ar: 'سحاب للوحات الكهربائية والكوابل' }, sector: 'electrical', estate: 'sahab', founded: 1996, employees: 450, area: 28000, lines: 7, use: 84, rating: 4.8, plan: 'export', open: null, certs: ['ISO 9001', 'IEC 61439', 'KEMA'], markets: ['SA', 'IQ', 'AE', 'PS', 'LB', 'EG', 'YE'] },
    { id: 'f07', name: { en: 'Zarqa Polymers', ar: 'الزرقاء للبوليمرات' }, sector: 'plastics', estate: 'zarqa', founded: 2015, employees: 190, area: 15000, lines: 6, use: 69, rating: 4.7, plan: 'growth', open: 'oem', certs: ['ISO 9001', 'FDA food contact', 'JS'], markets: ['IQ', 'SA', 'PS', 'LB'] },
    { id: 'f08', name: { en: 'Ramtha Apparel', ar: 'الرمثا للألبسة' }, sector: 'textiles', estate: 'irbid', founded: 2002, employees: 1100, area: 21000, lines: 14, use: 96, rating: 4.8, plan: 'export', open: 'partner', certs: ['WRAP', 'OEKO-TEX', 'ISO 9001'], markets: ['US', 'CA', 'DE', 'GB', 'NL'] },
    { id: 'f09', name: { en: 'Ajloun Stone & Gypsum', ar: 'عجلون للحجر والجبس' }, sector: 'building', estate: 'jerash', founded: 1989, employees: 210, area: 40000, lines: 5, use: 66, rating: 4.8, plan: 'growth', open: null, certs: ['ISO 9001', 'EN 520', 'CE', 'JS'], markets: ['SA', 'AE', 'QA', 'KW', 'IQ', 'US'] },
    { id: 'f10', name: { en: 'Madaba Contract Furniture', ar: 'مادبا للأثاث التعاقدي' }, sector: 'furniture', estate: 'madaba', founded: 2008, employees: 260, area: 19000, lines: 6, use: 70, rating: 4.8, plan: 'growth', open: 'oem', certs: ['ISO 9001', 'FSC', 'BS 7176'], markets: ['SA', 'AE', 'QA', 'IQ', 'KW'] },
    { id: 'f11', name: { en: 'Aqaba Paper & Pack', ar: 'العقبة للورق والتغليف' }, sector: 'paper', estate: 'aqaba', founded: 2012, employees: 160, area: 22000, lines: 4, use: 63, rating: 4.6, plan: 'growth', open: null, certs: ['ISO 9001', 'FSC', 'BRCGS'], markets: ['SA', 'EG', 'IQ', 'PS', 'DJ'] },
    { id: 'f12', name: { en: 'Tafila Silica & Minerals', ar: 'الطفيلة للسيليكا والمعادن' }, sector: 'mining', estate: 'tafila', founded: 2017, employees: 70, area: 120000, lines: 2, use: 54, rating: 4.6, plan: 'starter', open: 'expansion', certs: ['ISO 9001'], markets: ['SA', 'AE', 'TR', 'IN', 'IT'] },
    { id: 'f13', name: { en: 'Salt Chemical Industries', ar: 'السلط للصناعات الكيماوية' }, sector: 'chemicals', estate: 'salt', founded: 2006, employees: 130, area: 14000, lines: 5, use: 74, rating: 4.7, plan: 'growth', open: 'oem', certs: ['ISO 9001', 'ISO 14001', 'JS'], markets: ['IQ', 'PS', 'SA', 'YE', 'LB'] }
  ],

  // price: JD per unit (null = on request). moq / cap: { q, u } with u a unit id. cap is per month.
  // specs: [labelKey, value]; a value starting with @ is a translation key, {k, n} fills a number.
  products: [
    { id: 'p01', f: 'f01', sector: 'food', hs: '1509.20', price: [4.2, 5.1, 'l'], moq: [2000, 'l'], cap: [300000, 'l'], lead: 14, rating: [4.8, 62], certs: ['ISO 22000', 'HACCP', 'FDA reg.', 'Halal'], trade: ['US FTA', 'EU', 'GAFTA'], markets: ['SA', 'AE', 'US', 'DE', 'CA', 'KW'], tags: 'olive oil evoo extra virgin nabali food', specs: [['acidity', '≤ 0.5%'], ['peroxide', '≤ 15 meq O₂/kg'], ['packSizes', '1 L · 5 L · 16 L'], ['harvest', '2026/27'], ['shelf', { k: 'v.months', n: 24 }]] },
    { id: 'p02', f: 'f01', sector: 'food', hs: '2008.19', price: [2.1, 2.6, 'kg'], moq: [1, 't'], cap: [120, 't'], lead: 10, rating: [4.7, 41], certs: ['ISO 22000', 'Halal', 'HACCP'], trade: ['EU', 'GAFTA'], markets: ['SA', 'IQ', 'PS', 'GB', 'US'], tags: 'tahini sesame paste halawa food', specs: [['ingredients', '@v.sesame'], ['texture', '@v.stoneground'], ['packSizes', '400 g · 800 g · 18 kg'], ['shelf', { k: 'v.months', n: 18 }]] },
    { id: 'p03', f: 'f02', sector: 'pharma', hs: '3004.10', price: null, moq: [50000, 'pc'], cap: [6000000, 'pc'], lead: 45, rating: [4.9, 23], certs: ['EU-GMP', 'JFDA', 'SFDA'], trade: ['GAFTA', 'EU'], markets: ['SA', 'IQ', 'YE', 'SD', 'KE'], tags: 'amoxicillin antibiotic capsules generic medicine pharmaceutical', specs: [['strength', '500 mg'], ['packCaps', '16 · 20 · 100'], ['standard', 'BP / USP'], ['shelf', { k: 'v.months', n: 36 }]] },
    { id: 'p04', f: 'f02', sector: 'pharma', hs: '3004.90', price: [3.8, 4.6, 'ktab'], moq: [500000, 'pc'], cap: [40000000, 'pc'], lead: 30, rating: [4.8, 19], certs: ['EU-GMP', 'JFDA'], trade: ['GAFTA'], markets: ['IQ', 'YE', 'LY', 'DZ', 'SD'], tags: 'paracetamol acetaminophen tablets painkiller medicine pharmaceutical', specs: [['strength', '500 mg'], ['packTabs', '20 · 24 · 1,000'], ['standard', 'BP / Ph. Eur.'], ['shelf', { k: 'v.months', n: 48 }]] },
    { id: 'p05', f: 'f03', sector: 'cosmetics', hs: '3304.99', price: [1.35, 1.9, 'pc'], moq: [3000, 'pc'], cap: [80000, 'pc'], lead: 21, rating: [4.6, 37], certs: ['ISO 22716', 'GMP', 'Halal'], trade: ['EU', 'UK', 'GAFTA'], markets: ['DE', 'FR', 'GB', 'RU', 'CN', 'AE'], tags: 'dead sea mud mask skincare cosmetics private label', specs: [['net', '250 g'], ['origin', '@v.deadsea'], ['skin', '@v.allSkin'], ['privateLabel', '@v.yes'], ['shelf', { k: 'v.months', n: 36 }]] },
    { id: 'p06', f: 'f03', sector: 'cosmetics', hs: '2501.00', price: [0.7, 1.1, 'kg'], moq: [2, 't'], cap: [200, 't'], lead: 14, rating: [4.7, 28], certs: ['ISO 22716', 'Halal'], trade: ['EU', 'UK', 'GAFTA'], markets: ['DE', 'JP', 'GB', 'SA', 'AE'], tags: 'dead sea bath salt spa minerals', specs: [['packSizes', '500 g · 1 kg · 25 kg'], ['grain', '1–3 mm'], ['origin', '@v.deadsea'], ['privateLabel', '@v.yes']] },
    { id: 'p07', f: 'f04', sector: 'machinery', hs: '8418.69', price: [21500, 26000, 'unit'], moq: [1, 'unit'], cap: [25, 'unit'], lead: 60, rating: [4.8, 17], certs: ['CE', 'Eurovent', 'ISO 9001'], trade: ['GAFTA', 'EU'], markets: ['SA', 'AE', 'QA', 'IQ', 'EG'], tags: 'industrial water chiller cooling hvac air cooled machine', specs: [['cooling', '120 kW'], ['refrigerant', 'R-454B'], ['compressors', '4 × scroll'], ['power', '400 V · 3 ph · 50 Hz'], ['efficiency', 'EER 3.1'], ['ambient', '52 °C']] },
    { id: 'p08', f: 'f04', sector: 'machinery', hs: '8415.83', price: null, moq: [1, 'unit'], cap: [60, 'unit'], lead: 45, rating: [4.7, 12], certs: ['Eurovent', 'CE'], trade: ['GAFTA'], markets: ['SA', 'QA', 'KW', 'IQ'], tags: 'air handling unit ahu hvac ventilation cleanroom hospital machine', specs: [['airflow', '2,000–40,000 m³/h'], ['panel', '50 mm'], ['filtration', 'ISO ePM1 70%'], ['recovery', '≤ 78%']] },
    { id: 'p09', f: 'f05', sector: 'machinery', hs: '8479.20', price: [145000, 190000, 'set'], moq: [1, 'set'], cap: [3, 'set'], lead: 120, rating: [4.9, 9], certs: ['CE', 'ISO 9001'], trade: ['GAFTA', 'EU', 'Agadir'], markets: ['TN', 'MA', 'PS', 'IQ', 'SA'], tags: 'olive oil mill press decanter line machine equipment', specs: [['throughput', '3 t/h'], ['phases', '2 / 3'], ['contactParts', 'AISI 304'], ['power', '55 kW'], ['yield', '≥ 89%']] },
    { id: 'p10', f: 'f05', sector: 'machinery', hs: '8422.30', price: [18000, 24000, 'unit'], moq: [1, 'unit'], cap: [8, 'unit'], lead: 75, rating: [4.6, 11], certs: ['CE'], trade: ['GAFTA', 'Agadir'], markets: ['IQ', 'SA', 'EG', 'DZ'], tags: 'packaging machine vffs form fill seal bagging snacks machine', specs: [['speed', '≤ 80'], ['bagWidth', '80–300 mm'], ['film', 'PE · PP · laminate'], ['power', '3.5 kW · 230 V']] },
    { id: 'p11', f: 'f06', sector: 'electrical', hs: '8537.10', price: null, moq: [1, 'unit'], cap: [150, 'unit'], lead: 40, rating: [4.8, 26], certs: ['IEC 61439', 'ISO 9001', 'KEMA'], trade: ['GAFTA'], markets: ['SA', 'IQ', 'AE', 'PS', 'LB'], tags: 'switchgear panel low voltage mcc distribution board electrical', specs: [['current', '≤ 4,000 A'], ['voltage', '690 V'], ['standard', 'IEC 61439-1/2'], ['protection', 'IP54'], ['separation', 'Form 4b']] },
    { id: 'p12', f: 'f06', sector: 'electrical', hs: '8544.49', price: [2.4, 38, 'm'], moq: [1000, 'm'], cap: [900000, 'm'], lead: 21, rating: [4.7, 33], certs: ['IEC 60502-1', 'ISO 9001'], trade: ['GAFTA', 'EU'], markets: ['SA', 'IQ', 'AE', 'EG', 'YE'], tags: 'power cable xlpe copper aluminium wire electrical cables', specs: [['voltage', '0.6/1 kV'], ['cores', '1–4 × 16–300 mm²'], ['conductor', 'Cu / Al'], ['standard', 'IEC 60502-1']] },
    { id: 'p13', f: 'f06', sector: 'electrical', hs: '7308.90', price: [38, 52, 'kwp'], moq: [100, 'kwp'], cap: [60000, 'kwp'], lead: 21, rating: [4.6, 14], certs: ['ISO 9001', 'EN 1090'], trade: ['GAFTA', 'EU'], markets: ['IQ', 'SA', 'PS', 'LB'], tags: 'solar pv mounting structure racking photovoltaic steel', specs: [['material', 'S350GD + ZM310'], ['wind', '45 m/s'], ['tilt', '10°–35°'], ['warranty', { k: 'v.years', n: 25 }]] },
    { id: 'p14', f: 'f07', sector: 'plastics', hs: '3923.30', price: [18, 34, 'kpc'], moq: [500000, 'pc'], cap: [60000000, 'pc'], lead: 14, rating: [4.7, 31], certs: ['ISO 9001', 'FDA food contact'], trade: ['GAFTA'], markets: ['IQ', 'SA', 'PS', 'LB'], tags: 'pet preforms bottles water juice plastic packaging', specs: [['neck', 'PCO 1881 · 28 mm'], ['weight', '9–52 g'], ['cavities', '72'], ['foodContact', 'FDA · EU 10/2011']] },
    { id: 'p15', f: 'f07', sector: 'plastics', hs: '3925.10', price: [95, 120, 'unit'], moq: [50, 'unit'], cap: [6000, 'unit'], lead: 7, rating: [4.8, 58], certs: ['JS', 'ISO 9001'], trade: ['GAFTA'], markets: ['IQ', 'PS', 'SA'], tags: 'water tank hdpe plastic rooftop storage', specs: [['volume', '2,000 L'], ['layers', '3'], ['uv', '@v.yes'], ['warranty', { k: 'v.years', n: 10 }]] },
    { id: 'p16', f: 'f08', sector: 'textiles', hs: '6203.42', price: [6.5, 8.9, 'pc'], moq: [3000, 'pc'], cap: [250000, 'pc'], lead: 60, rating: [4.8, 21], certs: ['WRAP', 'OEKO-TEX'], trade: ['US FTA', 'EU', 'UK', 'CA FTA'], markets: ['US', 'CA', 'DE', 'GB'], tags: 'chinos trousers pants garments apparel cotton clothing', specs: [['fabric', '@v.cottonEla'], ['fabricWeight', '280 g/m²'], ['sizes', '28–44']] },
    { id: 'p17', f: 'f08', sector: 'textiles', hs: '6211.33', price: [7.2, 9.4, 'set'], moq: [1000, 'set'], cap: [80000, 'set'], lead: 35, rating: [4.7, 16], certs: ['OEKO-TEX', 'ISO 9001'], trade: ['US FTA', 'EU', 'GAFTA'], markets: ['US', 'SA', 'AE', 'NL'], tags: 'medical scrubs uniforms hospital garments apparel clothing', specs: [['fabric', '@v.polyCotton'], ['fabricWeight', '180 g/m²'], ['sizes', 'XS–3XL'], ['wash', '75 °C']] },
    { id: 'p18', f: 'f09', sector: 'building', hs: '6802.92', price: [14, 22, 'm2'], moq: [200, 'm2'], cap: [30000, 'm2'], lead: 21, rating: [4.9, 44], certs: ['CE', 'JS'], trade: ['GAFTA', 'US FTA'], markets: ['SA', 'AE', 'QA', 'KW', 'US'], tags: 'limestone stone cladding facade marble building materials', specs: [['finish', '@v.finishes'], ['thickness', '2–5 cm'], ['density', '2,450 kg/m³'], ['absorption', '≤ 3%']] },
    { id: 'p19', f: 'f09', sector: 'building', hs: '6809.11', price: [2.9, 3.6, 'board'], moq: [1000, 'board'], cap: [400000, 'board'], lead: 7, rating: [4.6, 22], certs: ['EN 520', 'CE', 'JS'], trade: ['GAFTA'], markets: ['IQ', 'SA', 'PS'], tags: 'gypsum board drywall plasterboard ceiling building materials', specs: [['thickness', '9.5 · 12.5 · 15 mm'], ['boardSize', '1200 × 2400 mm'], ['standard', 'EN 520'], ['types', '@v.boardTypes']] },
    { id: 'p20', f: 'f10', sector: 'furniture', hs: '9403.30', price: [180, 420, 'unit'], moq: [20, 'unit'], cap: [3000, 'unit'], lead: 30, rating: [4.7, 19], certs: ['ISO 9001', 'FSC'], trade: ['GAFTA', 'EU'], markets: ['SA', 'AE', 'IQ'], tags: 'office desk workstation furniture', specs: [['desktop', '@v.desktop'], ['deskSize', '1200–1800 × 800 mm'], ['frame', '@v.steelFrame'], ['warranty', { k: 'v.years', n: 5 }]] },
    { id: 'p21', f: 'f10', sector: 'furniture', hs: '9403.50', price: null, moq: [50, 'room'], cap: [400, 'room'], lead: 90, rating: [4.9, 13], certs: ['BS 7176', 'FSC'], trade: ['GAFTA'], markets: ['SA', 'AE', 'QA', 'KW'], tags: 'hotel furniture bedroom fit-out ff&e contract furniture', specs: [['scope', '@v.hotelScope'], ['finishes', 'HPL · veneer · lacquer'], ['fire', 'BS 7176']] },
    { id: 'p22', f: 'f11', sector: 'paper', hs: '4819.10', price: [0.22, 0.65, 'pc'], moq: [10000, 'pc'], cap: [3500000, 'pc'], lead: 10, rating: [4.6, 27], certs: ['FSC', 'BRCGS'], trade: ['GAFTA'], markets: ['SA', 'EG', 'IQ', 'PS'], tags: 'corrugated cartons boxes packaging paper', specs: [['flute', 'B · C · BC · E'], ['printing', '@v.flexo'], ['ect', '≤ 14 kN/m'], ['sizes', '@v.custom']] },
    { id: 'p23', f: 'f11', sector: 'paper', hs: '4823.69', price: [28, 46, 'kpc'], moq: [50000, 'pc'], cap: [20000000, 'pc'], lead: 18, rating: [4.5, 18], certs: ['FSC', 'ISO 9001'], trade: ['GAFTA', 'EU'], markets: ['SA', 'EG', 'IQ', 'DJ'], tags: 'paper cups coffee cups double wall disposable', specs: [['cupSizes', '4 · 8 · 12 · 16 oz'], ['wall', '@v.doubleWall'], ['lining', 'PE / aqueous'], ['printing', '@v.flexo']] },
    { id: 'p24', f: 'f12', sector: 'mining', hs: '2505.10', price: [28, 41, 't'], moq: [500, 't'], cap: [25000, 't'], lead: 14, rating: [4.6, 8], certs: ['ISO 9001'], trade: ['GAFTA', 'EU'], markets: ['SA', 'TR', 'IN', 'IT', 'AE'], tags: 'silica sand quartz glass minerals', specs: [['sio2', '≥ 99.5%'], ['fe2o3', '≤ 0.02%'], ['grain', '0.1–0.6 mm'], ['uses', '@v.silicaUse']] },
    { id: 'p25', f: 'f12', sector: 'mining', hs: '2530.90', price: [55, 80, 't'], moq: [25, 't'], cap: [6000, 't'], lead: 10, rating: [4.5, 6], certs: ['ISO 9001'], trade: ['GAFTA', 'EU'], markets: ['SA', 'AE', 'IN'], tags: 'zeolite minerals agriculture water treatment', specs: [['cec', '≥ 150 meq/100 g'], ['grain', '0–1 · 1–3 · 3–5 mm'], ['uses', '@v.zeoliteUse']] },
    { id: 'p26', f: 'f13', sector: 'chemicals', hs: '3402.50', price: [1.1, 1.6, 'l'], moq: [5000, 'l'], cap: [900000, 'l'], lead: 14, rating: [4.6, 24], certs: ['ISO 9001', 'JS'], trade: ['GAFTA'], markets: ['IQ', 'PS', 'YE', 'LB'], tags: 'liquid detergent laundry cleaning chemicals private label', specs: [['packSizes', '1 L · 3 L · 4 L'], ['active', '15%'], ['ph', 'pH 7–8'], ['privateLabel', '@v.yes']] },
    { id: 'p27', f: 'f13', sector: 'chemicals', hs: '3105.20', price: [1150, 1380, 't'], moq: [5, 't'], cap: [2400, 't'], lead: 10, rating: [4.7, 15], certs: ['ISO 9001', 'ISO 14001'], trade: ['GAFTA', 'EU'], markets: ['IQ', 'SA', 'PS', 'YE', 'LB'], tags: 'npk fertilizer fertiliser water soluble agriculture chemicals', specs: [['grade', '20-20-20 + TE'], ['solubility', '100%'], ['packSizes', '1 kg · 10 kg · 25 kg'], ['chloride', '< 0.5%']] }
  ],

  // Investment opportunities. f = related factory (fills {f} in the text).
  opportunities: [
    { id: 'o1', type: 'new', sector: 'mining', estate: 'tafila', ticket: 18000000, jobs: 260 },
    { id: 'o2', type: 'new', sector: 'electrical', estate: 'muwaqqar', ticket: 7500000, jobs: 140 },
    { id: 'o3', type: 'expansion', sector: 'pharma', estate: 'sahab', ticket: 6500000, jobs: 90, f: 'f02' },
    { id: 'o4', type: 'new', sector: 'pharma', estate: 'irbid', ticket: 4200000, jobs: 120 },
    { id: 'o5', type: 'jv', sector: 'textiles', estate: 'irbid', ticket: 3000000, jobs: 450, f: 'f08' },
    { id: 'o6', type: 'expansion', sector: 'machinery', estate: 'karak', ticket: 2200000, jobs: 35, f: 'f05' }
  ],

  // Market insights (sample, year-2 scale)
  insights: {
    factories: 1240, products: 18600, quotes: 3420, countries: 64,
    trend: [610, 780, 940, 1120, 1390, 1600, 1880, 2150, 2420, 2760, 3050, 3420],
    byCountry: [['SA', 720], ['IQ', 540], ['AE', 410], ['US', 330], ['PS', 260], ['EG', 190], ['KW', 170], ['DE', 120], ['GB', 110], ['QA', 100], ['other', 470]],
    demand: [['glass', 4210, 1], ['inverter', 3180, 0], ['oliveoil', 2940, 38], ['syringes', 2450, 2], ['rebar', 2210, 9], ['pet', 1980, 14], ['lithium', 1640, 0], ['hotel', 1420, 21]]
  },

  plans: [
    { id: 'starter', price: 250, subs: 720 },
    { id: 'growth', price: 750, subs: 410 },
    { id: 'export', price: 1800, subs: 110 }
  ],

  queue: [
    { id: 'q1', type: 'newFactory', who: 'Azraq Steel Fabrication', what: 'est.muwaqqar', mins: 25 },
    { id: 'q2', type: 'newProduct', who: 'Zeituna Agro-Foods', what: 'adm.q2', mins: 70 },
    { id: 'q3', type: 'priceChange', who: 'Sahab Switchgear & Cables', what: 'adm.q3', mins: 140 },
    { id: 'q4', type: 'certificate', who: 'Zarqa Polymers', what: 'adm.q4', mins: 210 },
    { id: 'q5', type: 'newFactory', who: 'Dana Natural Soap', what: 'est.tafila', mins: 320 }
  ],

  recentQuotes: [
    { p: 'p07', from: 'SA', mins: 6 },
    { p: 'p18', from: 'AE', mins: 18 },
    { p: 'p01', from: 'DE', mins: 41 },
    { p: 'p12', from: 'IQ', mins: 65 },
    { p: 'p16', from: 'US', mins: 120 }
  ],

  // Search chips: key + English match term
  chips: [['oliveoil', 'olive oil'], ['chiller', 'chiller'], ['cables', 'cable'], ['antibiotics', 'antibiotic'], ['hotel', 'hotel'], ['pet', 'pet preforms']],

  languages: [
    ['ar', 'العربية'], ['en', 'English'], ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'],
    ['it', 'Italiano'], ['tr', 'Türkçe'], ['ru', 'Русский'], ['zh', '中文'], ['ja', '日本語']
  ]
};
