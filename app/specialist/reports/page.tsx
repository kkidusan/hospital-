import HisReportButton from './HisReportButton';

export default function ReportsPage() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">HIS Reporting Module</h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Generate UNHCR Standard v0.9.30 Forms (Sections 1.0 - 10.5)</p>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 flex items-center justify-between text-white shadow-2xl">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Period</p>
            <h2 className="text-3xl font-black">{now.toLocaleString('default', { month: 'long' })} {y}</h2>
          </div>
          <HisReportButton month={m} year={y} />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 text-xs font-bold text-slate-400 uppercase">
          <div className="p-4 border border-slate-100 rounded-xl">✓ Sec 1.0 - 3.0: Population & Morbidity</div>
          <div className="p-4 border border-slate-100 rounded-xl">✓ Sec 4.0 - 6.0: IPD & Lab Services</div>
          <div className="p-4 border border-slate-100 rounded-xl">✓ Sec 7.0 - 8.0: EPI & Nutrition</div>
          <div className="p-4 border border-slate-100 rounded-xl">✓ Sec 9.0 - 10.5: RH & HIV/AIDS</div>
        </div>
      </div>
    </div>
  );
}