export const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n||0);
const mr=(a:number)=>Math.pow(1+a,1/12)-1;
export const contribution=(target:number,annual:number,months:number)=>{const r=mr(annual);return months<=0?0:r===0?target/months:target*r/(Math.pow(1+r,months)-1)};
export const futureValue=(monthly:number,annual:number,months:number)=>{const r=mr(annual);return r===0?monthly*months:monthly*(Math.pow(1+r,months)-1)/r};
export const mortgage=(p:number,annual:number,years:number)=>{const n=years*12,r=mr(annual);return n<=0?0:r===0?p/n:p*r/(1-Math.pow(1+r,-n))};
