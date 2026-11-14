import React,{useMemo,useState}from'react';
import{money,contribution,futureValue,mortgage,financialCheckup}from'./calc';

const items=[['check','Financial Check-Up','Cek cash flow, cicilan, dana darurat, investasi, dan proteksi.'],['kpr','KPR','Estimasi cicilan rumah.'],['edu','Dana Pendidikan','Target biaya dan setoran bulanan.'],['pension','Dana Pensiun','Kebutuhan pensiun dan tabungan.'],['inherit','Perencanaan Warisan','Petakan aset dan kewajiban.'],['hajj','Haji & Umrah','Target biaya dan setoran.'],['zakat','Zakat & Wakaf','Simulasi awal zakat dan wakaf.'],['invest','Investasi','Setoran berkala untuk target.'],['insurance','Kebutuhan Asuransi','Estimasi kebutuhan proteksi.']] as const;

export default function App(){
  const[id,S]=useState('check');
  const[target,T]=useState(250000000),[years,Y]=useState(15),[rate,R]=useState(6),[infl,I]=useState(4);
  const[price,P]=useState(1000000000),[dp,D]=useState(200000000);
  const[income,N]=useState(15000000),[expense,E]=useState(9000000),[debtPayment,DP]=useState(2000000);
  const[emergency,EF]=useState(30000000),[liquid,L]=useState(50000000),[investments,IV]=useState(30000000);
  const[assets,A]=useState(300000000),[debt,B]=useState(100000000),[protection,PR]=useState(1000000000),[dependents,DE]=useState(1),[monthly,M]=useState(2000000);

  const checkup=useMemo(()=>financialCheckup({income,expense,debtPayment,emergencyFund:emergency,liquidAssets:liquid,investments,totalAssets:assets,totalDebt:debt,protection,dependents}),[income,expense,debtPayment,emergency,liquid,investments,assets,debt,protection,dependents]);
  const months=years*12,annual=rate/100,goal=target*Math.pow(1+infl/100,years);
  let title='',value='',sub='Estimasi indikatif berdasarkan asumsi input.';

  if(id==='kpr'){title='Estimasi cicilan bulanan';value=money(mortgage(Math.max(0,price-dp),annual,years));}
  else if(id==='check'){title='Financial Health Score';value=checkup.score+'/100';sub=checkup.grade+' · Prioritas ditentukan oleh rule-based DSS.';}
  else if(id==='invest'){title='Estimasi nilai akhir';value=money(futureValue(monthly,annual,months));}
  else if(id==='inherit'){title='Estimasi aset bersih';value=money(Math.max(0,liquid+price-debt));sub='Bukan penetapan pembagian faraid.'}
  else if(id==='zakat'){title='Estimasi zakat maal 2,5%';value=money(liquid*.025);sub='Periksa nisab, haul, jenis aset, dan ketentuan yang diikuti.'}
  else if(id==='insurance'){title='Estimasi kebutuhan proteksi';value=money(Math.max(0,expense*12*years+debt-liquid));}
  else if(id==='pension'){title='Target modal pensiun sederhana';value=money(expense*Math.pow(1+infl/100,years)*12*20);}
  else{title='Target dana masa depan';value=money(goal);sub='Estimasi setoran bulanan: '+money(contribution(goal,annual,months));}

  const field=(label:string,v:number,set:(n:number)=>void)=><label>{label}<input type="number" min="0" value={v} onChange={e=>set(Number(e.target.value))}/></label>;
  const statusLabel=(s:string)=>s==='healthy'?'Sehat':s==='watch'?'Perhatian':'Prioritas';

  return <main>
    <aside><h2>🟩 wealthplanner</h2><p>KALKULATOR</p>{items.map(x=><button key={x[0]} className={id===x[0]?'active':''} onClick={()=>S(x[0])}>{x[1]}</button>)}</aside>
    <section><small>FINANCIAL PLANNING</small><h1>Rencanakan tujuan keuanganmu</h1><p>Simulasikan tujuan dan lihat kondisi finansialmu secara lebih terarah.</p>
      <div className="layout">
        <article>
          <h2>{items.find(x=>x[0]===id)?.[1]}</h2><p>{items.find(x=>x[0]===id)?.[2]}</p>
          <div className="fields">
            {id==='check'?<>
              {field('Penghasilan bulanan',income,N)}{field('Pengeluaran bulanan',expense,E)}
              {field('Cicilan / utang bulanan',debtPayment,DP)}{field('Dana darurat',emergency,EF)}
              {field('Investasi',investments,IV)}{field('Total aset',assets,A)}
              {field('Total utang',debt,B)}{field('Proteksi / uang pertanggungan',protection,PR)}
              {field('Jumlah tanggungan',dependents,DE)}
            </>:id==='kpr'?<>{field('Harga rumah (Rp)',price,P)}{field('DP (Rp)',dp,D)}{field('Tenor (tahun)',years,Y)}{field('Asumsi imbal hasil %',rate,R)}</>
            :id==='invest'?<>{field('Setoran bulanan',monthly,M)}{field('Jangka waktu (tahun)',years,Y)}{field('Asumsi imbal hasil %',rate,R)}</>
            :id==='inherit'?<>{field('Aset likuid',liquid,L)}{field('Aset lain',price,P)}{field('Kewajiban',debt,B)}</>
            :id==='zakat'?field('Harta simulasi zakat',liquid,L)
            :id==='insurance'?<>{field('Pengeluaran bulanan',expense,E)}{field('Tahun dukungan',years,Y)}{field('Kewajiban',debt,B)}{field('Aset likuid',liquid,L)}</>
            :<>{field('Biaya / target saat ini',target,T)}{field('Jangka waktu (tahun)',years,Y)}{field('Inflasi %',infl,I)}{field('Asumsi imbal hasil %',rate,R)}</>}
          </div>
          {id==='check'&&<div className="dss-note"><strong>Decision Support System</strong><span>Rule-based untuk versi awal. Threshold dibuat eksplisit agar bisa dikalibrasi ketika data pengguna sudah tersedia.</span></div>}
        </article>
        <article className="result"><small>HASIL SIMULASI</small><h3>{title}</h3><strong>{value}</strong><p>{sub}</p>
          {id==='check'&&<div className="metric-list">{checkup.metrics.map(m=><div className="metric" key={m.key}><div><b>{m.label}</b><span>{m.value.toFixed(1)}{m.unit}</span></div><em className={m.status}>{statusLabel(m.status)}</em></div>)}</div>}
          <button onClick={()=>window.print()}>Cetak / Simpan PDF</button>
        </article>
      </div>
      {id==='check'&&<article className="recommendation"><small>REKOMENDASI DSS</small><h2>Prioritas tindakan</h2>{checkup.priorities.length?checkup.priorities.map((p,i)=><div className="priority" key={p.title}><strong>{i+1}. {p.title}</strong><span>{p.reason}</span><p>{p.action}</p></div>):<p>Fondasi keuanganmu sudah cukup baik. Pertahankan kebiasaan yang ada dan review secara berkala.</p>}</article>}
      <footer>Simulasi edukasi, bukan jaminan imbal hasil, nasihat hukum/pajak/fatwa, atau rekomendasi produk. Rule dan asumsi Financial Check-Up dapat dikalibrasi seiring tersedianya data yang memadai.</footer>
    </section>
  </main>
}
