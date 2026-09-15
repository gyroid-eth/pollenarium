import{resolveHeightView,PROFILE_HEIGHT_MAPPING}from'./wall-profile.mjs';
const DEFAULT_REPOSITORY='gyroid-eth/pollenarium';

function compact(value,max=64){
 const text=String(value||'').replace(/\s+/g,' ').trim();
 return text.length<=max?text:text.slice(0,max-1)+'…';
}
function filenamePart(value){
 const text=String(value||'specimen').normalize('NFKC').toLocaleLowerCase()
   .replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
 return (text||'specimen').slice(0,64);
}
function assertReportable(record,repository){
 if(!record||typeof record!=='object'||typeof record.state?.model!=='string'||!Array.isArray(record.state?.coefficients))throw Error('再現可能な保存標本ではありません');
 if(typeof record.previewPng!=='string'||!record.previewPng.startsWith('data:image/png;base64,'))throw Error('保存された生成PNGがありません');
 if(!/^[\w.-]+\/[\w.-]+$/.test(repository))throw Error('GitHub repository は owner/name で指定してください');
}
function markdownValue(value){return value==null||value===''?'—':String(value)}

/**
 * Build a complete, non-mutating report package from one saved specimen.
 * The GitHub URL intentionally carries only a compact prefill. The readable
 * body identifies the complete JSON attachment as the coefficient source.
 */
export function buildReportDraft(record,{similarities='',differences='',repository=DEFAULT_REPOSITORY}={}){
 assertReportable(record,repository);
 const reference=record.reference||null,state=record.state,view=resolveHeightView(record.view,record.rendering);
 const wallMeaning=view.heightMappingVersion===PROFILE_HEIGHT_MAPPING?'足場を領域ごとに正規化した外壁形状。幅は半高位置、先端はメッシュ依存。沈着や成長の物理予測ではありません。':'旧方式の単調な場→半径表示。保存時の見え方を保持。';
 const taxon=reference?.species||'観察標本なし';
 const title=`Pollenarium reproduction candidate — ${compact(reference?.species||state.model)}`;
 const relationship=reference?.paperPreset
   ?`Table 1 row ${reference.paperPreset.row} との分類名対応あり（${reference.paperPreset.matchClass||'区分不明'}）。写真への形態フィットを意味しません。`
   :'論文Table 1 presetとは独立した探索候補です。';
 const readableState={...state,coefficients:`[all ${state.coefficients.length} coefficients are in the attached JSON]`};
 const safeRecord={...record,state:readableState,previewPng:'[generated PNG: attach the separately downloaded file]'};
 const fullBody=[
  '# Pollenarium 再現候補',
  '',
  '> 採点・自動同定ではありません。保存した計算結果を、似ている点と異なる点の両方を添えて共有するための報告です。',
  '',
  '## 保存標本',
  '',
  `- タイトル: ${markdownValue(record.title)}`,
  `- 保存日時: ${markdownValue(record.createdAt)}`,
  `- 対象花粉: ${taxon}`,
  `- モデルID: \`${state.model}\``,
  `- 計算の由来: ${markdownValue(record.origin)}`,
  `- presetとの関係: ${relationship}`,
  `- 係数数: ${state.coefficients.length}`,
  `- 外壁表示方式: ${view.heightMappingVersion}`,
  `- 形状の意味: ${wallMeaning}`,
  '',
  '## 似ていると思うところ',
  '',
  similarities.trim()||'（ここに記入）',
  '',
  '## 違うと思うところ',
  '',
  differences.trim()||'（ここに記入）',
  '',
  '## 観察メモ',
  '',
  record.observation?.trim()||'（なし）',
  '',
  '## 参照情報（SEM画素は含みません）',
  '',
  `- PalDat publication: ${reference?.publicationUrl||'—'}`,
  `- PalDat image reference: ${reference?.imageUrl||'—'}`,
  `- Credit: ${reference?.requiredCredit||'—'}`,
  '',
  '## 再現データ',
  '',
  '以下は保存時のモデル状態、全条件、seed、実時刻・診断、表示条件を保持した読みやすい要約です。実際の係数は省略せず元の保存標本JSONへ全件保持しています。生成PNGとJSONを添付してください。',
  '',
  '```json',
  JSON.stringify(safeRecord,null,2),
  '```',
  '',
  '## 添付チェック',
  '',
  '- [ ] 生成画像 PNG（アプリからダウンロード）',
  '- [ ] 保存標本 JSON（`pollen-specimen/2`互換、アプリからダウンロード）',
  '',
  'JSONには生成画像と計算状態が含まれますが、PalDatのSEM画像データは含まれません。'
 ].join('\n');
 const issuePrefillBody=[
  'Pollenarium saved-result reproduction candidate.',
  '',
  `Target: ${compact(taxon,60)}`,
  `Model: ${compact(state.model,70)}`,
  '',
  'Paste the full report and attach the generated PNG and specimen JSON.',
  'This is not a score or a claim of fit to a paper preset.'
 ].join('\n');
 const params=new URLSearchParams({title,body:issuePrefillBody});
 const base=filenamePart(record.title||reference?.species||record.id);
 return {
  title,fullBody,issuePrefillBody,
  issueUrl:`https://github.com/${repository}/issues/new?${params}`,
  files:{
   json:{filename:`pollenarium-${base}.json`,mimeType:'application/json',text:JSON.stringify(record,null,2)},
   png:{filename:`pollenarium-${base}.png`,mimeType:'image/png',dataUrl:record.previewPng}
  }
 };
}
