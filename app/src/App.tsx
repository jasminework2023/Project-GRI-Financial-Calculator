import React,{useMemo,useState}from'react';
import{money,contribution,futureValue,mortgage,financialCheckup,financialBudget}from'./calc';

const items=[['check','Financial Check-Up','Cek cash flow, cicilan, dana darurat, investasi, dan proteksi.'],['budget','Anggaran Keuangan','Susun anggaran berdasarkan prioritas keuangan.'],['kpr','KPR','Estimasi cicilan rumah.'],['edu','Dana Pendidikan','Target biaya dan setoran bulanan.'],['pension','Dana Pensiun','Kebutuhan pensiun dan tabungan.'],['inherit','Perencanaan Warisan','Petakan aset dan kewajiban.'],['hajj','Haji & Umrah','Target biaya dan setoran.'],['zakat','Zakat & Wakaf','Simulasi awal zakat dan wakaf.'],['invest','Investasi','Setoran berkala untuk target.'],['insurance','Kebutuhan Asuransi','Estimasi kebutuhan proteksi.']] as const;

type BudgetStep={key:'name'|'age'|'fixed'|'variable'|'gold';label:string;hint:string};
const budgetSteps:BudgetStep[]=[
  {key:'name',label:'Siapa nama kamu?',hint:'Data ini hanya untuk laporan simulasi.'},
  {key:'age',label:'Berapa usia kamu?',hint:'Masukkan usia saat ini.'},
  {key:'fixed',label:'Berapa pemasukan tetap per tahun?',hint:'Gaji, honor tetap, atau penghasilan rutin yang relatif pasti.'},
  {key:'variable',label:'Berapa pemasukan tidak tetap per tahun?',hint:'Bonus, komisi, freelance, THR, atau penghasilan yang tidak selalu diterima.'},
  {key:'gold',label:'Berapa harga emas per gram saat ini?',hint:'Dicatat sebagai referensi laporan anggaran.'}
];

export default function App(){
  const[id,S]=useState('check');
  const[target,T]=useState(250000000),[years,Y]=useState(15),[rate,R]=useState(6),[infl,I]=useState(4);
  const[price,P]=useState(1000000000),[dp,D]=useState(200000000);
  const[income,N]=useState(15000000),[expense,E]=useState(9000000),[debtPayment,DP]=useState(2000000);
  const[emergency,EF]=useState(30000000),[liquid,L]=useState(50000000),[investments,IV]=useState(30000000);
  const[assets,A]=useState(300000000),[debt,B]=useState(100000000),[protection,PR]=useState(1000000000),[dependents,DE]=useState(1),[monthly,M]=useState(2000000);
  const[budgetStep,BS]=useState(0),[budgetName,BN]=useState(''),[budgetAge,BA]=useState(0),[fixedIncome,FI]=useState(0),[variableIncome,VI]=useState(0),[goldPrice,GP]=useState(0);
  const[iswaf,IW]=useState(0),[productiveDebt,PD]=useState(0),[consumerDebt,CD]=useState(0),[insurance,INS]=useState(0),[futureFund,FF]=useState(0),[currentSpending,CS]=useState(0);

  const checkup=useMemo(()=>financialCheckup({income,expense,debtPayment,emergencyFund:emergency,liquidAssets:liquid,investments,totalAssets:assets,totalDebt:debt,protection,dependents}),[income,expense,debtPayment,emergency,liquid,investments,assets,debt,protection,dependents]);
  const budget=useMemo(()=>financialBudget({fixed:fixedIncome,variable:variableIncome,goldPrice,iswaf,productiveDebt,consumerDebt,insurance,futureFund,currentSpending}),[fixedIncome,variableIncome,goldPrice,iswaf,productiveDebt,consumerDebt,insurance,futureFund,currentSpending]);
  const months=years*12,annual=rate/100,goal=target*Math.pow(1+infl/100,years);
  let title='',value='',sub='Estimasi indikatif berdasarkan asumsi input.';

  if(id==='budget'){title='Total pemasukan tahunan';value=money(budget.totalIncome);sub='Pemasukan tetap + tidak tetap.';}
  else if(id==='kpr'){title='Estimasi cicilan bulanan';value=money(mortgage(Math.max(0,price-dp),annual,years));}
  else if(id==='check'){title='Financial Health Score';value=checkup.score+'/100';sub=checkup.grade+' · Prioritas ditentukan oleh rule-based DSS.';}
  else if(id==='invest'){title='Estimasi nilai akhir';value=money(futureValue(monthly,annual,months));}
  else if(id==='inherit'){title='Estimasi aset bersih';value=money(Math.max(0,liquid+price-debt));sub='Bukan penetapan pembagian faraid.'}
  else if(id==='zakat'){title='Estimasi zakat maal 2,5%';value=money(liquid*.025);sub='Periksa nisab, haul, jenis aset, dan ketentuan yang diikuti.'}
  else if(id==='insurance'){title='Estimasi kebutuhan proteksi';value=money(Math.max(0,expense*12*years+debt-liquid));}
  else if(id==='pension'){title='Target modal pensiun sederhana';value=money(expense*Math.pow(1+infl/100,years)*12*20);}
  else{title='Target dana masa depan';value=money(goal);sub='Estimasi setoran bulanan: '+money(contribution(goal,annual,months));}

  const field=(label:string,v:number,set:(n:number)=>void)=><label>{label}<input type="number" min="0" value={v} onChange={e=>set(Math.max(0,Number(e.target.value)||0))}/></label>;
  const statusLabel=(s:string)=>s==='healthy'?'Sehat':s==='watch'?'Perhatian':'Prioritas';
  const budgetDone=budgetStep>=budgetSteps.length;
  const currentBudgetStep=budgetSteps[Math.min(budgetStep,budgetSteps.length-1)];
  const parseIDR=(raw:string)=>Number((raw||'').replace(/\\D/g,''))||0;
  const formatIDRInput=(n:number)=>n?Math.round(n).toLocaleString('id-ID'):'';
  const budgetStepValid=()=>{
    if(currentBudgetStep.key==='name') return budgetName.trim().length>=2;
    if(currentBudgetStep.key==='age') return budgetAge>=1&&budgetAge<=120;
    if(currentBudgetStep.key==='fixed') return fixedIncome>0;
    if(currentBudgetStep.key==='variable') return variableIncome>=0&&fixedIncome>0;
    return goldPrice>0;
  };
  const budgetInput=()=>{
    const s=currentBudgetStep;
    if(s.key==='name')return <input className="big-input" type="text" value={budgetName} placeholder="Tulis nama kamu" onChange={e=>BN(e.target.value)}/>;
    if(s.key==='age')return <input className="big-input" type="number" min="1" max="120" value={budgetAge||''} placeholder="Contoh: 30" onChange={e=>BA(e.target.value===''?0:Math.min(120,Math.max(1,Number(e.target.value)||0)))}/>;
    if(s.key==='fixed')return <input className="big-input" type="text" inputMode="numeric" value={formatIDRInput(fixedIncome)} placeholder="Rp 0" onChange={e=>FI(Math.min(100000000000,parseIDR(e.target.value)))}/>;
    if(s.key==='variable')return <input className="big-input" type="text" inputMode="numeric" value={formatIDRInput(variableIncome)} placeholder="Rp 0" onChange={e=>VI(Math.min(100000000000,parseIDR(e.target.value)))}/>;
    return <input className="big-input" type="text" inputMode="numeric" value={formatIDRInput(goldPrice)} placeholder="Rp 0" onChange={e=>GP(Math.min(100000000,parseIDR(e.target.value)))}/>;
  };

  const budgetMoneyField=(label:string,v:number,set:(n:number)=>void,min:number,max:number,helper:string)=><label className="budget-money-field"><div><b>{label}</b><span>{helper}</span></div><input type="text" inputMode="numeric" value={formatIDRInput(v)} placeholder="Rp 0" onChange={e=>set(Math.min(max,Math.max(min,parseIDR(e.target.value))))}/></label>;

  const downloadBudgetPDF=()=>{
    const oldTitle=document.title;
    document.title=`Laporan Anggaran Keuangan - ${budgetName||'Wealthplanner'}`;
    window.print();
    window.setTimeout(()=>{document.title=oldTitle},500);
  };

  return <main>
    <aside><h2>🟩 wealthplanner</h2><p>KALKULATOR</p>{items.map(x=><button key={x[0]} className={id===x[0]?'active':''} onClick={()=>{S(x[0]);BS(0)}}>{x[1]}</button>)}</aside>
    <section><small>FINANCIAL PLANNING</small><h1>Rencanakan tujuan keuanganmu</h1><p>Simulasikan tujuan dan lihat kondisi finansialmu secara lebih terarah.</p>
      {id==='budget'?<>
        {!budgetDone&&<div className="budget-shell">
          <article className="budget-form">
            <div className="progress"><span style={{width:((budgetStep+1)/budgetSteps.length*100)+'%'}}/></div>
            <div className="step-count">LANGKAH {budgetStep+1} DARI {budgetSteps.length}</div>
            <h2>{budgetSteps[budgetStep].label}</h2><p>{budgetSteps[budgetStep].hint}</p>
            {budgetInput()}
            <div className="step-actions">{budgetStep>0&&<button className="secondary" onClick={()=>BS(budgetStep-1)}>Kembali</button>}<button className="primary" disabled={!budgetStepValid()} onClick={()=>{
              if(budgetStep<budgetSteps.length-1){BS(budgetStep+1);return}
              const ti=fixedIncome+variableIncome;
              PD(Math.round(ti*.20)); CD(Math.round(ti*.15)); INS(Math.round(ti*.10)); FF(Math.round(ti*.10));
              CS(Math.max(0,ti-Math.round(ti*.20)-Math.round(ti*.15)-Math.round(ti*.10)-Math.round(ti*.10)));
              BS(budgetSteps.length);
            }}>{budgetStep<budgetSteps.length-1?'Lanjut':'Lihat Anggaran'}</button></div>
          </article>
          <article className="budget-preview"><small>ANGGARAN SEMENTARA</small><h3>{budgetName||'Anggaran kamu'}</h3><strong>{money(budget.totalIncome)}</strong><p>Total pemasukan tahunan</p><div className="budget-mini"><div><span>Tetap</span><b>{money(budget.fixed)}</b></div><div><span>Tidak tetap</span><b>{money(budget.variable)}</b></div></div></article>
        </div>}
        {budgetDone&&<article className="budget-report"><small>MENYUSUN ANGGARAN KEUANGAN</small><h2>Susunan anggaran tahunan</h2>
          <div className="budget-report-section"><h3>Data Diri</h3><div className="budget-data"><div><span>Nama</span><b>{budgetName}</b></div><div><span>Usia</span><b>{budgetAge} tahun</b></div></div></div>
          <div className="budget-report-section"><h3>Pemasukan Tahunan</h3><p>Pemasukan kamu dibedakan antara pemasukan yang tetap dan tidak tetap untuk menjadi acuan pengeluaran yang ideal.</p><div className="budget-data"><div><span>Tetap</span><b>{money(budget.fixed)}</b></div><div><span>Tidak Tetap</span><b>{money(budget.variable)}</b></div><div className="highlight"><span>Total Pemasukan</span><b>{money(budget.totalIncome)}</b></div><div><span>Harga Per Gram Emas Saat Ini</span><b>{money(budget.goldPrice)}</b></div></div></div>
          <div className="budget-report-section"><h3>Pengeluaran Tahunan</h3><p>Pengeluaran tahunan ini merupakan pengeluaran yang dibagi dalam pos sesuai prioritas pengelolaan keuangan.</p>
          <div className="budget-table">
            <div><b>Pos Zakat</b><span>2,5% dari pemasukan</span><strong>{money(budget.zakat)}</strong></div>
            {budgetMoneyField('Pos ISWAF',budget.iswaf,IW,0,budget.limits.iswafMax,'Maks. 7,5% dari total pemasukan')}
            {budgetMoneyField('Utang Produktif',budget.productiveDebt,PD,budget.limits.productiveDebtMin,budget.limits.totalDebtMax,'Min. 20% dari pemasukan')}
            {budgetMoneyField('Utang Konsumtif',budget.consumerDebt,CD,0,Math.min(budget.limits.consumerDebtMax,Math.max(0,budget.limits.totalDebtMax-budget.productiveDebt)),'Maks. 15% dan total utang maks. 35%')}
            {budgetMoneyField('Pos Kontribusi Asuransi Syariah',budget.insurance,INS,budget.limits.insuranceMin,budget.totalIncome,'Min. 10% dari pemasukan')}
            {budgetMoneyField('Pos Dana Masa Depan',budget.futureFund,FF,budget.limits.futureFundMin,budget.totalIncome,'Min. 10% dari pemasukan')}
            {budgetMoneyField('Pos Belanja Sekarang',budget.currentSpending,CS,0,budget.limits.currentSpendingMax,'Sisa anggaran setelah pos prioritas')}
            <div className="total"><b>Total Anggaran</b><strong>{money(budget.totalBudget)}</strong></div>
            <div className="surplus"><b>Surplus</b><strong>{money(budget.surplus)}</strong></div>
          </div></div>
          <p className="gold-note">Harga emas saat ini: {money(budget.goldPrice)}/gram. Nilai ini menjadi referensi laporan dan tidak mengubah total anggaran.</p>
          <div className="budget-report-actions">
            <button className="secondary" onClick={()=>BS(budgetSteps.length-1)}>Kembali</button>
            <button className="primary" onClick={downloadBudgetPDF}>Unduh PDF</button>
            <a className="consult-button" href="https://www.wealthplanner.id/konsultasiasuransi" target="_blank" rel="noreferrer">Konsultasikan Kebutuhan Anda</a>
          </div>
        </article>}
      </>:<div className="layout">
        <article><h2>{items.find(x=>x[0]===id)?.[1]}</h2><p>{items.find(x=>x[0]===id)?.[2]}</p><div className="fields">
          {id==='check'?<>{field('Penghasilan bulanan',income,N)}{field('Pengeluaran bulanan',expense,E)}{field('Cicilan / utang bulanan',debtPayment,DP)}{field('Dana darurat',emergency,EF)}{field('Investasi',investments,IV)}{field('Total aset',assets,A)}{field('Total utang',debt,B)}{field('Proteksi / uang pertanggungan',protection,PR)}{field('Jumlah tanggungan',dependents,DE)}</>:id==='kpr'?<>{field('Harga rumah (Rp)',price,P)}{field('DP (Rp)',dp,D)}{field('Tenor (tahun)',years,Y)}{field('Asumsi imbal hasil %',rate,R)}</>:id==='invest'?<>{field('Setoran bulanan',monthly,M)}{field('Jangka waktu (tahun)',years,Y)}{field('Asumsi imbal hasil %',rate,R)}</>:id==='inherit'?<>{field('Aset likuid',liquid,L)}{field('Aset lain',price,P)}{field('Kewajiban',debt,B)}</>:id==='zakat'?field('Harta simulasi zakat',liquid,L):id==='insurance'?<>{field('Pengeluaran bulanan',expense,E)}{field('Tahun dukungan',years,Y)}{field('Kewajiban',debt,B)}{field('Aset likuid',liquid,L)}</>:<>{field('Biaya / target saat ini',target,T)}{field('Jangka waktu (tahun)',years,Y)}{field('Inflasi %',infl,I)}{field('Asumsi imbal hasil %',rate,R)}</>}
        </div>{id==='check'&&<div className="dss-note"><strong>Decision Support System</strong><span>Rule-based untuk versi awal. Threshold dibuat eksplisit agar bisa dikalibrasi ketika data pengguna sudah tersedia.</span></div>}</article>
        <article className="result"><small>HASIL SIMULASI</small><h3>{title}</h3><strong>{value}</strong><p>{sub}</p>{id==='check'&&<div className="metric-list">{checkup.metrics.map(m=><div className="metric" key={m.key}><div><b>{m.label}</b><span>{m.value.toFixed(1)}{m.unit}</span></div><em className={m.status}>{statusLabel(m.status)}</em></div>)}</div>}<button onClick={()=>window.print()}>Cetak / Simpan PDF</button></article>
      </div>}
      {id==='check'&&<article className="recommendation"><small>REKOMENDASI DSS</small><h2>Prioritas tindakan</h2>{checkup.priorities.length?checkup.priorities.map((p,i)=><div className="priority" key={p.title}><strong>{i+1}. {p.title}</strong><span>{p.reason}</span><p>{p.action}</p></div>):<p>Fondasi keuanganmu sudah cukup baik. Pertahankan kebiasaan yang ada dan review secara berkala.</p>}</article>}
      <footer>Simulasi edukasi, bukan jaminan imbal hasil, nasihat hukum/pajak/fatwa, atau rekomendasi produk. Rule dan asumsi Financial Check-Up dapat dikalibrasi seiring tersedianya data yang memadai.</footer>
    </section>
  </main>
}
