export const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);

const safe=(n:number)=>Math.max(0,Number.isFinite(Number(n))?Number(n):0);
const monthlyRate=(annualPct:number)=>Math.pow(1+Math.max(0,annualPct)/100,1/12)-1;

export const contribution=(target:number,annualPct:number,months:number)=>{
  const t=safe(target),n=Math.max(0,Math.floor(Number(months)||0)),r=monthlyRate(annualPct);
  if(!n)return 0;
  return r===0?t/n:t*r/(Math.pow(1+r,n)-1);
};

export const futureValue=(monthly:number,annualPct:number,months:number)=>{
  const m=safe(monthly),n=Math.max(0,Math.floor(Number(months)||0)),r=monthlyRate(annualPct);
  return r===0?m*n:m*(Math.pow(1+r,n)-1)/r;
};

export const mortgage=(principal:number,annualPct:number,years:number)=>{
  const p=safe(principal),n=Math.max(0,Number(years)||0)*12,r=monthlyRate(annualPct);
  return n<=0?0:r===0?p/n:p*r/(1-Math.pow(1+r,-n));
};

export type FinancialCheckupInput={
  income:number; expense:number; debtPayment:number; emergencyFund:number;
  liquidAssets:number; investments:number; totalAssets:number; totalDebt:number;
  protection:number; dependents:number;
};

export type CheckupMetric={
  key:string; label:string; value:number; unit:string; score:number;
  status:'healthy'|'watch'|'priority'; note:string;
};

export type CheckupResult={
  score:number; grade:string; metrics:CheckupMetric[];
  priorities:{title:string;reason:string;action:string}[];
  surplus:number; emergencyMonths:number; debtRatio:number; savingRatio:number;
  investmentRatio:number; debtToAsset:number; netWorth:number; protectionGap:number;
};

const band=(value:number,good:number,watch:number,invert=false)=>{
  if(invert){
    if(value<=good)return 100;
    if(value<=watch)return 70;
    if(value<=watch+10)return 40;
    return 15;
  }
  if(value>=good)return 100;
  if(value>=watch)return 70;
  if(value>=watch*0.5)return 40;
  return 15;
};

const status=(score:number):CheckupMetric['status']=>score>=80?'healthy':score>=60?'watch':'priority';

export function financialCheckup(input:FinancialCheckupInput):CheckupResult{
  const income=safe(input.income),expense=safe(input.expense),debtPayment=safe(input.debtPayment);
  const emergencyFund=safe(input.emergencyFund),investments=safe(input.investments);
  const totalAssets=safe(input.totalAssets),totalDebt=safe(input.totalDebt),protection=safe(input.protection);
  const dependents=Math.max(0,Math.floor(safe(input.dependents)));
  const surplus=income-expense-debtPayment;
  const savingRatio=income?Math.max(0,surplus/income*100):0;
  const debtRatio=income?debtPayment/income*100:0;
  const emergencyMonths=expense?emergencyFund/expense:0;
  const investmentRatio=income?investments/income*100:0;
  const debtToAsset=totalAssets?totalDebt/totalAssets*100:0;
  const netWorth=totalAssets-totalDebt;

  const metrics:CheckupMetric[]=[
    {key:'cashflow',label:'Cash Flow',value:savingRatio,unit:'%',score:band(savingRatio,20,10),status:'healthy',note:''},
    {key:'debt',label:'Debt Service',value:debtRatio,unit:'%',score:band(debtRatio,20,30,true),status:'healthy',note:''},
    {key:'emergency',label:'Dana Darurat',value:emergencyMonths,unit:' bulan',score:band(emergencyMonths,6,3),status:'healthy',note:''},
    {key:'investment',label:'Investasi',value:investmentRatio,unit:'%',score:band(investmentRatio,15,10),status:'healthy',note:''},
    {key:'leverage',label:'Debt to Asset',value:debtToAsset,unit:'%',score:band(debtToAsset,30,50,true),status:'healthy',note:''},
  ];
  metrics.forEach(m=>{
    m.status=status(m.score);
    if(m.key==='cashflow')m.note=m.status==='healthy'?'Surplus bulanan sudah kuat.':'Sisihkan surplus lebih konsisten sebelum menambah target baru.';
    if(m.key==='debt')m.note=m.status==='healthy'?'Beban cicilan masih terkendali.':'Prioritaskan pengendalian cicilan agar cash flow lebih longgar.';
    if(m.key==='emergency')m.note=m.status==='healthy'?'Dana darurat sudah mendekati target 6 bulan.':'Tambah dana darurat sebelum mengejar investasi yang lebih agresif.';
    if(m.key==='investment')m.note=m.status==='healthy'?'Porsi investasi sudah cukup untuk mulai membangun aset.':'Naikkan investasi bertahap setelah cash flow dan dana darurat aman.';
    if(m.key==='leverage')m.note=m.status==='healthy'?'Utang relatif proporsional terhadap aset.':'Evaluasi utang berbunga tinggi dan percepat pelunasannya.';
  });

  const annualIncome=income*12;
  const protectionTarget=Math.max(annualIncome*5,annualIncome*10,dependents*annualIncome*3);
  const protectionGap=Math.max(0,protectionTarget-protection);
  const protectionScore=protectionTarget===0?100:protection>=protectionTarget?100:protection>=protectionTarget*0.5?60:25;
  metrics.push({key:'protection',label:'Proteksi',value:protectionTarget?protection/protectionTarget*100:0,unit:'% target',score:protectionScore,status:status(protectionScore),note:protectionScore>=80?'Proteksi mendekati kebutuhan indikatif.':'Ada gap proteksi yang perlu dievaluasi.'});

  const weights={cashflow:.2,debt:.15,emergency:.2,investment:.15,leverage:.1,protection:.2} as Record<string,number>;
  const score=Math.round(metrics.reduce((sum,m)=>sum+m.score*(weights[m.key]||0),0));
  const grade=score>=85?'Sehat':score>=70?'Cukup Sehat':score>=55?'Perlu Perhatian':'Perlu Perbaikan';

  const priorities=[
    {key:'emergency',title:'Perkuat dana darurat',reason:'Saat ini '+emergencyMonths.toFixed(1)+' bulan pengeluaran.',action:'Target awal 3 bulan, lalu tingkatkan menuju 6 bulan.'},
    {key:'debt',title:'Kendalikan cicilan',reason:'Debt service ratio '+debtRatio.toFixed(1)+'%.',action:'Jaga rasio cicilan dan prioritaskan utang berbunga tinggi.'},
    {key:'cashflow',title:'Perbaiki cash flow',reason:'Saving ratio '+savingRatio.toFixed(1)+'%.',action:'Naikkan surplus bulanan sebelum menambah kewajiban baru.'},
    {key:'protection',title:'Evaluasi proteksi',reason:'Gap proteksi indikatif '+money(protectionGap)+'.',action:'Sesuaikan proteksi dengan income, utang, dan tanggungan.'},
    {key:'investment',title:'Tingkatkan investasi',reason:'Investment ratio '+investmentRatio.toFixed(1)+'%.',action:'Bangun investasi secara bertahap setelah fondasi cash flow aman.'},
  ];
  const ordered=priorities.map(p=>({...p,score:metrics.find(m=>m.key===p.key)?.score??100}))
    .sort((a,b)=>a.score-b.score).filter(p=>p.score<80).slice(0,3)
    .map(({key,score,...p})=>p);

  return {score,grade,metrics,priorities:ordered,surplus,emergencyMonths,debtRatio,savingRatio,investmentRatio,debtToAsset,netWorth,protectionGap};
}

export type BudgetInput={
  fixed:number; variable:number; goldPrice:number;
  iswaf:number; productiveDebt:number; consumerDebt:number;
  insurance:number; futureFund:number; currentSpending:number;
};

export type BudgetResult={
  fixed:number;variable:number;totalIncome:number;goldPrice:number;
  zakat:number;iswaf:number;productiveDebt:number;consumerDebt:number;totalDebt:number;
  insurance:number;futureFund:number;currentSpending:number;totalBudget:number;surplus:number;
  limits:{iswafMax:number;productiveDebtMin:number;consumerDebtMax:number;totalDebtMax:number;insuranceMin:number;futureFundMin:number;currentSpendingMax:number};
};

export function financialBudget(input:BudgetInput):BudgetResult{
  const fixed=safe(input.fixed),variable=safe(input.variable),totalIncome=fixed+variable;
  const iswafMax=totalIncome*.075;
  const productiveDebtMin=totalIncome*.20;
  const consumerDebtMax=totalIncome*.15;
  const totalDebtMax=totalIncome*.35;
  const insuranceMin=totalIncome*.10;
  const futureFundMin=totalIncome*.10;
  const zakat=totalIncome*.025;

  const iswaf=Math.min(safe(input.iswaf),iswafMax);
  const productiveDebt=Math.min(Math.max(safe(input.productiveDebt),productiveDebtMin),totalDebtMax);
  const consumerDebt=Math.min(safe(input.consumerDebt),consumerDebtMax,Math.max(0,totalDebtMax-productiveDebt));
  const totalDebt=productiveDebt+consumerDebt;
  const insurance=Math.max(safe(input.insurance),insuranceMin);
  const futureFund=Math.max(safe(input.futureFund),futureFundMin);

  const allocatedBeforeCurrent=zakat+iswaf+totalDebt+insurance+futureFund;
  const currentSpendingMax=Math.max(0,totalIncome-allocatedBeforeCurrent);
  const currentSpending=Math.min(safe(input.currentSpending),currentSpendingMax);
  const totalBudget=allocatedBeforeCurrent+currentSpending;

  return {
    fixed,variable,totalIncome,goldPrice:safe(input.goldPrice),
    zakat,iswaf,productiveDebt,consumerDebt,totalDebt,insurance,futureFund,currentSpending,
    totalBudget,surplus:Math.max(0,totalIncome-totalBudget),
    limits:{iswafMax,productiveDebtMin,consumerDebtMax,totalDebtMax,insuranceMin,futureFundMin,currentSpendingMax}
  };
}
