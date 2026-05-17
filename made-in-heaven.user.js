// ==UserScript==
// @name         made in heaven
// @namespace    https://github.com/omegapaopao/made-in-heaven
// @version      1.1.0
// @description  网页视频倍速控制 — 自动识别视频，精致面板，快捷键操控。
// @author       omegapaopao
// @match        *://*/*
// @grant        none
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  // ── 设置 ──────────────────────────────────
  var CFG = {
    speed: 1.0,
    skip: 5,        // 快进秒数
    longSkip: 15,   // 长快进秒数
    mute: false,
    panelVisible: true,
  };

  // ── 状态 ──────────────────────────────────
  var videos = [];
  var curIdx = 0;
  var panel = null;
  var drag = { on: false, sx: 0, sy: 0, px: 0, py: 0 };

  // ── 工具 ──────────────────────────────────
  function log() {
    var a = ['[MiH]'];
    for (var i = 0; i < arguments.length; i++) a.push(arguments[i]);
    console.log.apply(console, a);
  }

  function fmt(t) {
    if (!isFinite(t) || t < 0) return '--:--';
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function cur() {
    return videos[curIdx] || null;
  }

  function curEl() {
    var v = cur();
    return (v && v.tagName === 'VIDEO') ? v : null;
  }

  function isVisible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 40 && r.height > 40;
  }

  // ── 视频检测 ──────────────────────────────
  function scan() {
    var found = [];
    var all = document.querySelectorAll('video');
    for (var i = 0; i < all.length; i++) {
      if (isVisible(all[i])) found.push(all[i]);
    }

    // 合并新旧列表
    var merged = [];
    for (var j = 0; j < videos.length; j++) {
      try { if (videos[j].parentNode) merged.push(videos[j]); } catch (_) {}
    }
    for (var k = 0; k < found.length; k++) {
      if (merged.indexOf(found[k]) === -1) merged.push(found[k]);
    }

    var isNew = found.length > 0 && videos.length === 0;
    videos = merged;
    if (curIdx >= videos.length) curIdx = Math.max(0, videos.length - 1);

    if (isNew && found.length > 0) {
      setTimeout(function () {
        var v = found[0];
        var idx = videos.indexOf(v);
        if (idx >= 0) play(v, idx);
      }, 500);
    }

    refresh();
  }

  function play(v, idx) {
    if (!v) return;
    curIdx = idx;
    try { v.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
    v.play().catch(function () {});
    if (CFG.mute) v.muted = true;
    if (CFG.speed !== 1) v.playbackRate = CFG.speed;
    refresh();
  }

  // ── 倍速控制 ──────────────────────────────
  function setSpeed(r) {
    r = Math.round(r * 100) / 100;
    r = Math.max(0.1, Math.min(16, r));
    CFG.speed = r;
    var el = curEl();
    if (el) el.playbackRate = r;
    refresh();
  }

  function speedPreset(r) { setSpeed(r); }

  function speedUp() { setSpeed(CFG.speed + 0.25); }
  function speedDown() { setSpeed(CFG.speed - 0.25); }

  // ── 操作 ──────────────────────────────────
  function act(action) {
    var el = curEl();
    if (!el) return;

    switch (action) {
      case 'play':  el.play().catch(function () {}); break;
      case 'pause': el.pause(); break;
      case 'toggle':
        if (el.paused) el.play().catch(function () {});
        else el.pause();
        break;
      case 'fwd':   el.currentTime = Math.min(el.duration || Infinity, el.currentTime + CFG.skip); break;
      case 'bwd':   el.currentTime = Math.max(0, el.currentTime - CFG.skip); break;
      case 'lfwd':  el.currentTime = Math.min(el.duration || Infinity, el.currentTime + CFG.longSkip); break;
      case 'lbwd':  el.currentTime = Math.max(0, el.currentTime - CFG.longSkip); break;
      case 'fs':
        if (document.fullscreenElement) document.exitFullscreen();
        else el.requestFullscreen().catch(function () {});
        break;
      case 'pip':
        if (document.pictureInPictureElement) document.exitPictureInPicture();
        else if (document.pictureInPictureEnabled) el.requestPictureInPicture().catch(function () {});
        break;
      case 'mute':
        CFG.mute = !CFG.mute;
        el.muted = CFG.mute;
        break;
    }
    refresh();
  }

  // ── 键盘快捷键 ────────────────────────────
  function keys(e) {
    var tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.activeElement && document.activeElement.isContentEditable) return;

    var ctrl = e.ctrlKey || e.metaKey;
    var shift = e.shiftKey;
    var h = false;

    if (e.key === ' ' && !ctrl && !shift)           { h = true; act('toggle'); }

    if (e.key === 'ArrowRight' && !ctrl && !shift)  { h = true; act('fwd'); }
    if (e.key === 'ArrowLeft'  && !ctrl && !shift)  { h = true; act('bwd'); }
    if (e.key === 'ArrowRight' && ctrl)             { h = true; act('lfwd'); }
    if (e.key === 'ArrowLeft'  && ctrl)             { h = true; act('lbwd'); }

    if (e.key === 'ArrowUp'    && !ctrl)            { h = true; speedUp(); }
    if (e.key === 'ArrowDown'  && !ctrl)            { h = true; speedDown(); }

    if ((e.key === 'f' || e.key === 'F') && !ctrl)  { h = true; act('fs'); }
    if ((e.key === 'p' || e.key === 'P') && !ctrl)  { h = true; act('pip'); }
    if ((e.key === 'm' || e.key === 'M') && !ctrl)  { h = true; act('mute'); }
    if ((e.key === 'r' || e.key === 'R') && !ctrl)  { h = true; setSpeed(1); }

    // 数字键快速倍速
    if (!ctrl && !shift) {
      if (e.key === '1') { h = true; setSpeed(1); }
      if (e.key === '2') { h = true; setSpeed(2); }
      if (e.key === '3') { h = true; setSpeed(3); }
      if (e.key === '5') { h = true; setSpeed(5); }
    }

    if (h) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  // ╔══════════════════════════════════════════╗
  // ║           🎨  UI 面板                    ║
  // ╚══════════════════════════════════════════╝

  function buildPanel() {
    if (panel && document.body.contains(panel)) return;

    var old = document.getElementById('mih-root');
    if (old) old.remove();

    panel = document.createElement('div');
    panel.id = 'mih-root';

    // 预设倍速按钮
    var presets = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 5];
    var presetBtns = '';
    for (var i = 0; i < presets.length; i++) {
      presetBtns += '<button class="mih-sp" data-rate="' + presets[i] + '">' +
        (presets[i] === 1 ? '1×' : presets[i].toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + '×') +
        '</button>';
    }

    panel.innerHTML =
      '<div id="mih-card">' +
        // 头部
        '<div id="mih-head">' +
          '<span id="mih-logo">made in heaven</span>' +
          '<span id="mih-by">by omegapaopao</span>' +
          '<button id="mih-min" title="折叠">─</button>' +
          '<button id="mih-close" title="关闭">✕</button>' +
        '</div>' +
        // 主体
        '<div id="mih-body">' +
          // 视频信息
          '<div id="mih-info">等待视频...</div>' +
          // 进度条
          '<div id="mih-track"><div id="mih-bar"></div></div>' +
          // 播放控制行
          '<div class="mih-row">' +
            '<button class="mih-ctrl" data-act="bwd" title="后退' + CFG.skip + 's">⏪</button>' +
            '<button class="mih-ctrl mih-big" data-act="toggle" title="播放/暂停">▶</button>' +
            '<button class="mih-ctrl" data-act="fwd" title="前进' + CFG.skip + 's">⏩</button>' +
            '<button class="mih-ctrl" data-act="mute" title="静音">🔇</button>' +
            '<button class="mih-ctrl" data-act="fs" title="全屏">⛶</button>' +
            '<button class="mih-ctrl" data-act="pip" title="画中画">🖼</button>' +
          '</div>' +
          // 倍速显示
          '<div id="mih-speed-row">' +
            '<button class="mih-sp-adj" id="mih-spdn">−</button>' +
            '<span id="mih-speed">1.00×</span>' +
            '<button class="mih-sp-adj" id="mih-spup">+</button>' +
            '<button class="mih-sp-adj" id="mih-reset" title="重置1倍速">↺</button>' +
          '</div>' +
          // 预设倍速
          '<div class="mih-row" id="mih-presets">' + presetBtns + '</div>' +
          // 自定义倍速输入
          '<div id="mih-custom-row">' +
            '<input id="mih-custom" type="number" step="0.01" min="0.1" max="16" placeholder="输入任意倍速后回车..." title="输入任意倍速后按回车确认">' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(panel);

    // 事件绑定
    panel.querySelector('#mih-min').addEventListener('click', function () {
      var body = panel.querySelector('#mih-body');
      body.style.display = body.style.display === 'none' ? '' : 'none';
    });

    panel.querySelector('#mih-close').addEventListener('click', function () {
      CFG.panelVisible = false;
      panel.style.display = 'none';
      showDot();
    });

    // 倍速调节
    panel.querySelector('#mih-spdn').addEventListener('click', function () { speedDown(); });
    panel.querySelector('#mih-spup').addEventListener('click', function () { speedUp(); });
    panel.querySelector('#mih-reset').addEventListener('click', function () { setSpeed(1); });

    // 预设倍速
    var spBtns = panel.querySelectorAll('.mih-sp');
    for (var b = 0; b < spBtns.length; b++) {
      spBtns[b].addEventListener('click', function () {
        speedPreset(parseFloat(this.dataset.rate));
      });
    }

    // 自定义倍速输入
    panel.querySelector('#mih-custom').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var val = parseFloat(this.value);
        if (isFinite(val) && val >= 0.1 && val <= 16) {
          setSpeed(val);
        }
        this.value = '';
        e.preventDefault();
      }
    });

    // 控制按钮
    var ctrls = panel.querySelectorAll('.mih-ctrl');
    for (var c = 0; c < ctrls.length; c++) {
      ctrls[c].addEventListener('click', function () {
        act(this.dataset.act);
      });
    }

    // 进度条点击
    panel.querySelector('#mih-track').addEventListener('click', function (e) {
      var el = curEl();
      if (!el || !el.duration) return;
      var rect = this.getBoundingClientRect();
      el.currentTime = el.duration * ((e.clientX - rect.left) / rect.width);
    });

    // 拖拽
    var head = panel.querySelector('#mih-head');
    head.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      drag.on = true;
      var rect = panel.getBoundingClientRect();
      drag.sx = e.clientX;
      drag.sy = e.clientY;
      drag.px = rect.left;
      drag.py = rect.top;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      panel.style.left = drag.px + 'px';
      panel.style.top = drag.py + 'px';
      e.preventDefault();
    });

    log('made in heaven 准备就绪');
  }

  document.addEventListener('mousemove', function (e) {
    if (!drag.on) return;
    panel.style.left = (drag.px + e.clientX - drag.sx) + 'px';
    panel.style.top  = (drag.py + e.clientY - drag.sy) + 'px';
  });

  document.addEventListener('mouseup', function () { drag.on = false; });

  // 小圆点 (面板关闭后显示)
  function showDot() {
    if (document.getElementById('mih-dot')) return;
    var dot = document.createElement('div');
    dot.id = 'mih-dot';
    dot.title = 'made in heaven — 点击打开面板';
    dot.addEventListener('click', function () {
      CFG.panelVisible = true;
      panel.style.display = '';
      dot.remove();
    });
    document.body.appendChild(dot);
  }

  // ── 刷新 UI ───────────────────────────────
  function refresh() {
    if (!panel) return;

    var info = panel.querySelector('#mih-info');
    var pp   = panel.querySelector('.mih-big');
    var bar  = panel.querySelector('#mih-bar');
    var spd  = panel.querySelector('#mih-speed');
    var mute = panel.querySelector('[data-act="mute"]');

    if (!videos.length) {
      if (info) info.textContent = '未检测到视频';
      if (pp) pp.textContent = '▶';
      if (bar) bar.style.width = '0%';
      return;
    }

    var el = curEl();
    if (el) {
      if (info) info.textContent = (curIdx + 1) + '/' + videos.length +
        '  ' + fmt(el.currentTime) + ' / ' + fmt(el.duration);
      if (pp) pp.textContent = el.paused ? '▶' : '⏸';
      if (bar) bar.style.width = el.duration ? ((el.currentTime / el.duration) * 100) + '%' : '0%';
      if (spd) spd.textContent = (el.playbackRate || 1).toFixed(2) + '×';
      if (mute) mute.textContent = el.muted ? '🔈' : '🔇';

      // 高亮当前预设
      var curRate = el.playbackRate || 1;
      var spBtns = panel.querySelectorAll('.mih-sp');
      for (var sb = 0; sb < spBtns.length; sb++) {
        var btnRate = parseFloat(spBtns[sb].dataset.rate);
        if (Math.abs(btnRate - curRate) < 0.01) {
          spBtns[sb].classList.add('active');
        } else {
          spBtns[sb].classList.remove('active');
        }
      }
    } else {
      if (info) info.textContent = (curIdx + 1) + '/' + videos.length + '  iframe/其他';
      if (pp) pp.textContent = '▶';
    }
  }

  // ── 循环 ──────────────────────────────────
  function tick() {
    refresh();
    setTimeout(tick, 800);
  }

  // ╔══════════════════════════════════════════╗
  // ║           🚀  启动                       ║
  // ╚══════════════════════════════════════════╝

  function init() {
    log('made in heaven v1.1.0 — by omegapaopao');

    // 注入样式
    var css = document.createElement('style');
    css.textContent =
      // 面板容器
      '#mih-root{' +
        'position:fixed;bottom:20px;right:20px;z-index:2147483647;' +
        'font-family:"Segoe UI",system-ui,-apple-system,sans-serif;font-size:12px;' +
        'user-select:none;' +
      '}' +
      // 卡片
      '#mih-card{' +
        'background:linear-gradient(135deg,rgba(30,27,38,0.96) 0%,rgba(20,18,28,0.96) 100%);' +
        'backdrop-filter:blur(24px) saturate(180%);' +
        '-webkit-backdrop-filter:blur(24px) saturate(180%);' +
        'border:1px solid rgba(255,255,255,0.08);' +
        'border-radius:16px;padding:0;overflow:hidden;' +
        'min-width:248px;max-width:280px;' +
        'box-shadow:0 8px 40px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.03) inset;' +
        'transition:box-shadow 0.3s;' +
      '}' +
      '#mih-card:hover{box-shadow:0 12px 48px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05) inset;}' +
      // 头部
      '#mih-head{' +
        'display:flex;align-items:center;padding:10px 14px;' +
        'background:rgba(255,255,255,0.02);' +
        'border-bottom:1px solid rgba(255,255,255,0.05);' +
        'cursor:grab;gap:6px;' +
      '}' +
      '#mih-head:active{cursor:grabbing;}' +
      '#mih-logo{' +
        'font-size:13px;font-weight:700;' +
        'background:linear-gradient(135deg,#c084fc,#a78bfa,#818cf8);' +
        '-webkit-background-clip:text;-webkit-text-fill-color:transparent;' +
        'background-clip:text;' +
        'flex:1;' +
      '}' +
      '#mih-by{' +
        'font-size:9px;color:rgba(255,255,255,0.25);' +
        'font-style:italic;' +
      '}' +
      '#mih-head button{' +
        'background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;' +
        'font-size:14px;padding:0 4px;line-height:1;border-radius:4px;transition:all 0.15s;' +
      '}' +
      '#mih-head button:hover{color:#fff;background:rgba(255,255,255,0.08);}' +
      // 主体
      '#mih-body{padding:10px 14px 14px;}' +
      // 视频信息
      '#mih-info{' +
        'font-size:11px;color:rgba(255,255,255,0.5);' +
        'margin-bottom:8px;text-align:center;' +
        'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' +
      '}' +
      // 进度条
      '#mih-track{' +
        'width:100%;height:4px;background:rgba(255,255,255,0.06);' +
        'border-radius:2px;margin-bottom:10px;cursor:pointer;overflow:hidden;' +
        'transition:height 0.15s;' +
      '}' +
      '#mih-track:hover{height:6px;}' +
      '#mih-bar{' +
        'height:100%;border-radius:2px;width:0%;' +
        'background:linear-gradient(90deg,#a78bfa,#818cf8,#22d3ee);' +
        'transition:width 0.3s;' +
      '}' +
      // 行
      '.mih-row{display:flex;gap:4px;margin-bottom:6px;justify-content:center;flex-wrap:wrap;}' +
      // 控制按钮
      '.mih-ctrl{' +
        'width:34px;height:30px;border-radius:8px;' +
        'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);' +
        'color:rgba(255,255,255,0.6);cursor:pointer;font-size:13px;' +
        'display:flex;align-items:center;justify-content:center;' +
        'transition:all 0.2s;' +
      '}' +
      '.mih-ctrl:hover{background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.15);}' +
      '.mih-ctrl:active{transform:scale(0.93);}' +
      '.mih-big{width:44px;font-size:16px;}' +
      // 倍速行
      '#mih-speed-row{' +
        'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;' +
      '}' +
      '#mih-speed{' +
        'font-size:26px;font-weight:700;min-width:80px;text-align:center;' +
        'background:linear-gradient(135deg,#e0e7ff,#c4b5fd,#67e8f9);' +
        '-webkit-background-clip:text;-webkit-text-fill-color:transparent;' +
        'background-clip:text;' +
        'font-variant-numeric:tabular-nums;font-family:"SF Mono","Cascadia Code",monospace;' +
      '}' +
      '.mih-sp-adj{' +
        'width:30px;height:30px;border-radius:50%;' +
        'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);' +
        'color:rgba(255,255,255,0.5);cursor:pointer;font-size:16px;' +
        'display:flex;align-items:center;justify-content:center;' +
        'transition:all 0.2s;' +
      '}' +
      '.mih-sp-adj:hover{background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.2);}' +
      '.mih-sp-adj:active{transform:scale(0.9);}' +
      // 预设倍速
      '.mih-sp{' +
        'padding:4px 10px;border-radius:6px;' +
        'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);' +
        'color:rgba(255,255,255,0.5);cursor:pointer;font-size:11px;' +
        'transition:all 0.2s;font-weight:500;' +
      '}' +
      '.mih-sp:hover{' +
        'background:rgba(167,139,250,0.15);color:#c4b5fd;border-color:rgba(167,139,250,0.3);' +
        'transform:translateY(-1px);' +
      '}' +
      '.mih-sp.active{' +
        'background:linear-gradient(135deg,rgba(167,139,250,0.3),rgba(129,140,248,0.3));' +
        'color:#fff;border-color:rgba(167,139,250,0.5);' +
        'box-shadow:0 0 12px rgba(167,139,250,0.2);' +
      '}' +
      // 自定义倍速输入
      '#mih-custom-row{' +
        'display:flex;justify-content:center;margin-bottom:4px;' +
      '}' +
      '#mih-custom{' +
        'width:100%;padding:6px 10px;border-radius:6px;' +
        'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);' +
        'color:rgba(255,255,255,0.6);font-size:11px;text-align:center;' +
        'outline:none;transition:all 0.2s;font-family:inherit;' +
        'box-sizing:border-box;' +
      '}' +
      '#mih-custom:focus{' +
        'background:rgba(255,255,255,0.08);border-color:rgba(167,139,250,0.4);' +
        'color:#fff;box-shadow:0 0 8px rgba(167,139,250,0.15);' +
      '}' +
      '#mih-custom::placeholder{' +
        'color:rgba(255,255,255,0.2);' +
      '}' +
      // 小圆点
      '#mih-dot{' +
        'position:fixed;bottom:20px;right:20px;z-index:2147483647;' +
        'width:38px;height:38px;border-radius:50%;cursor:pointer;' +
        'background:linear-gradient(135deg,rgba(30,27,38,0.9),rgba(20,18,28,0.9));' +
        'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
        'border:1px solid rgba(255,255,255,0.1);' +
        'box-shadow:0 4px 16px rgba(0,0,0,0.4);' +
        'transition:all 0.3s;display:flex;align-items:center;justify-content:center;' +
      '}' +
      '#mih-dot::after{' +
        'content:"⚡";font-size:16px;' +
      '}' +
      '#mih-dot:hover{' +
        'transform:scale(1.1);' +
        'box-shadow:0 6px 24px rgba(167,139,250,0.3);' +
        'border-color:rgba(167,139,250,0.4);' +
      '}';

    document.head.appendChild(css);

    buildPanel();
    scan();
    tick();

    // 定期扫描 (SPA路由变化)
    setInterval(function () {
      if (CFG.panelVisible && (!panel || !document.body.contains(panel))) {
        buildPanel();
      }
      scan();
    }, 2000);

    // 键盘
    document.addEventListener('keydown', keys, true);

    // 启动徽标
    var badge = document.createElement('div');
    badge.textContent = 'made in heaven';
    badge.style.cssText =
      'position:fixed;top:16px;right:16px;z-index:2147483647;' +
      'background:linear-gradient(135deg,#a78bfa,#818cf8);color:#fff;' +
      'padding:7px 16px;border-radius:20px;' +
      'font-size:13px;font-weight:700;font-family:system-ui,sans-serif;' +
      'box-shadow:0 4px 20px rgba(167,139,250,0.4);' +
      'transition:opacity 0.6s;pointer-events:none;';
    document.body.appendChild(badge);
    setTimeout(function () { badge.style.opacity = '0'; }, 2500);
    setTimeout(function () { badge.remove(); }, 3200);

    log('快捷键: 空格=暂停 ←→=快进 ↑↓=倍速 1/2/3/5=预设倍速 F=全屏 P=画中画 M=静音 R=1倍速');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
