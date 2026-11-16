import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const args=process.argv.slice(2),dry=args.includes('--dry-run');
const portfolio=resolve(args.find(x=>!x.startsWith('--'))||join(root,'../holynova.github.io'));
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8'}).trim();
for(const [cwd,branch] of [[root,'main'],[portfolio,'master']]){
 if(git(cwd,'branch','--show-current')!==branch||git(cwd,'status','--porcelain','--untracked-files=no'))throw new Error(`Commit changes on ${branch} before publishing: ${cwd}`);
 if(git(cwd,'rev-parse','HEAD')!==git(cwd,'rev-parse',`origin/${branch}`))throw new Error('Push the source commit before publishing');
}
function verify(relative=''){
 for(const entry of readdirSync(join(root,'dist',relative),{withFileTypes:true})){
  const path=join(relative,entry.name);
  if(entry.isDirectory())verify(path);
  else if(!readFileSync(join(root,'dist',path)).equals(readFileSync(join(portfolio,'shanghai-metro-night',path))))throw new Error(`Portfolio asset differs: ${path}`);
 }
}
verify();
const config=JSON.parse(readFileSync(join(portfolio,'wrangler.jsonc'),'utf8'));
if(config.name!=='xiaosang-portfolio')throw new Error('Unexpected shared Worker');
execFileSync(process.execPath,['scripts/stage-cloudflare.mjs','--portfolio-only'],{cwd:portfolio,stdio:'inherit'});
execFileSync(join(root,'node_modules/.bin/wrangler'),['deploy','--config','wrangler.jsonc',...(dry?['--dry-run']:[])],{cwd:portfolio,stdio:'inherit'});
