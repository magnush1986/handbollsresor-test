export default function Packlista() {
  const lillaVaskan = [
    'Skor till handbollen',
    'Strumpor att spela i (flera par)',
    'Överdragskläder (HHF)',
    'VATTENFLASKA',
    'Kläder efter duschen',
    'Underkläder',
    'Schampo, tvål, balsam',
    'Deo mm.',
    'Hårsnoddar'
  ];

  const storaVaskan = [
    'Underkläder',
    'Vanliga kläder',
    'Norden cup tröjan',
    'Kudde',
    'Sovsäck / täcke / filt',
    'Lakan',
    'Madrass',
    'Tofflor',
    'Sköna skor (vi kommer att gå mellan skolan och hallarna)',
    'Jacka',
    'Paraply ☂️',
    'Skarvsladd',
    'Bars / frukt / riskakor eller annat att fylla på med',
    'Ett glatt humör 😎⭐️'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Packlista</h1>
      <p className="text-lg text-gray-700 font-semibold mb-8">
        (packa i en egen liten väska så den är klar inför fredagens match)
      </p>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-primary text-white px-6 py-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span>👜</span>
              <span>Lilla väskan</span>
            </h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {lillaVaskan.map((item, idx) => (
              <li key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-primary text-white px-6 py-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span>🧳</span>
              <span>Stora väskan</span>
            </h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {storaVaskan.map((item, idx) => (
              <li key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
