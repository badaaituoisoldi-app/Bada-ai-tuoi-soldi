const mesi = [0,1,2,3,4,5,6,7,8,9,10,11];
const prefs = {
  onboardingCompleted: true, language: 'it', theme: 'light', currency: 'EUR',
  recurringIncomes: [{ id: 'ri1', descrizione: 'Stipendio', importo: 1850, tipo: 'fissa', mesi, anno: 2026 }],
  safetyMarginType: 'percent', safetyMarginValue: 8,
  fixedExpenses: [
    { id: 'fe1', categoria: 'Affitto / Mutuo', categoriaId: 'home.rent_mortgage', importo: 620, mesi, anno: 2026 },
    { id: 'fe2', categoria: 'Utenze casa', categoriaId: 'home.utilities', importo: 95, mesi, anno: 2026 },
    { id: 'fe3', categoria: 'Internet e telefono casa', categoriaId: 'home.internet_phone', importo: 26.9, mesi, anno: 2026 },
    { id: 'fe4', categoria: 'Abbonamenti digitali', categoriaId: 'personal.digital_subscriptions', importo: 14.98, mesi, anno: 2026 },
  ],
  goals: [
    { id: 'g1', tipo: 'target', nome: 'Vacanza in Grecia', importoTarget: 1600, quotaMensile: 160, accumulato: 960, mesi: 10, attivo: true, dataCreazione: '2026-04-05',
      movements: [0,1,2,3,4,5].map(i => ({ id: 'm'+i, type: 'deposit', amount: 160, date: `2026-0${4+i > 9 ? 9 : 4+i}-05`.replace('2026-010','2026-10'), source: 'monthly-confirmation' })) },
    { id: 'g2', tipo: 'target', nome: 'Fondo emergenze', importoTarget: 3000, quotaMensile: 100, accumulato: 1400, mesi: 16, attivo: true, dataCreazione: '2026-09-10',
      movements: [{ id: 'n1', type: 'deposit', amount: 1400, date: '2026-09-09', source: 'manual' }] },
  ],
};
const d = (day, desc, cat, catId, imp) => ({ id: `${day}-${desc}`, data: `2026-10-${String(day).padStart(2,'0')}`, descrizione: desc, categoria: cat, categoriaId: catId, importo: imp });
const oct = {
  entrateList: [{ id: 'e1', data: '2026-10-01', descrizione: 'Stipendio', importo: 1850, tipo: 'fissa', auto: true }],
  speseFisseByCategoryId: { 'home.rent_mortgage': 620, 'home.utilities': 95, 'home.internet_phone': 26.9, 'personal.digital_subscriptions': 14.98 },
  registro: [
    d(2, 'Spesa Esselunga', 'Spesa', 'food.groceries', 64.3), d(4, 'Cena da Luca', 'Cena', 'food.dinner', 35.84),
    d(6, 'Palestra', 'Sport e fitness', 'health.sport_fitness', 50.4), d(8, 'Cinema', 'Cinema, teatro e musei', 'leisure.cinema_theater_museums', 21.28),
    d(14, 'Spesa Coop', 'Spesa', 'food.groceries', 48.7),
    d(16, 'Farmacia', 'Farmaci', 'health.medicines', 18.4), d(18, 'Aperitivo', 'Aperitivi e snack fuori', 'food.aperitifs_snacks', 22),
  ],
  safetyMarginApplied: true, safetyMarginType: 'percent', safetyMarginValue: 148, safetyMarginManual: false,
};
module.exports = { 'budget-prefs': JSON.stringify(prefs), 'budget-2026': JSON.stringify({ 9: oct, _schemaVersion: 1 }) };
