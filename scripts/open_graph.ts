import { exec } from 'node:child_process';
import * as http from 'node:http';
import type { AddressInfo } from 'node:net';

let input = '';

process.stdin.on('data', (chunk: Buffer) => {
  input += chunk;
});

process.stdin.on('end', () => {
  const dotIndex = input.indexOf('digraph');
  if (dotIndex === -1) {
    console.error('No DOT graph found in Turborepo output');
    return;
  }

  const dot = input.slice(dotIndex);

  const server = http.createServer((req, res) => {
    if (req.url === '/dot') {
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(dot, 'utf-8');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(buildHtml(), 'utf-8');
  });

  server.listen(0, () => {
    const { port } = server.address() as AddressInfo;
    exec(`open "http://localhost:${port}"`);
  });
});

function buildHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Dependency Graph</title>
  <script src="https://cdn.jsdelivr.net/npm/cytoscape@3.30.0/dist/cytoscape.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dagre@0.8.5/dist/dagre.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cytoscape-dagre@2.5.0/cytoscape-dagre.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #f8fafc;
      --surface: #ffffff;
      --surface2:#f1f5f9;
      --border:  #e2e8f0;
      --muted:   #cbd5e1;
      --subtle:  #94a3b8;
      --text3:   #64748b;
      --text2:   #334155;
      --text:    #0f172a;
      --blue:    #2563eb;
      --blue-bg: rgba(37,99,235,0.07);
    }

    html, body { height: 100%; overflow: hidden; background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { display: flex; }

    /* ── Sidebar ─────────────────────────────── */
    #sidebar {
      width: 268px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border-right: 1px solid var(--border);
      overflow: hidden;
    }

    .s-header {
      padding: 14px 16px 12px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .s-title { font-weight: 700; font-size: 14px; color: var(--text); margin-bottom: 3px; }
    .s-meta  { font-size: 11px; color: var(--text3); }

    .s-search {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    #search {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 7px 10px;
      color: var(--text);
      font-size: 12px;
      outline: none;
    }
    #search:focus { border-color: var(--blue); }
    #search::placeholder { color: var(--subtle); }

    #node-list { flex: 1; overflow-y: auto; padding: 4px 0; }

    .ni {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 16px;
      cursor: pointer;
      user-select: none;
      border-left: 2px solid transparent;
    }
    .ni:hover { background: var(--surface2); }
    .ni.active { background: var(--blue-bg); border-left-color: var(--blue); }

    .ni-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      color: var(--text3);
    }
    .ni.active .ni-name { color: var(--text); font-weight: 500; }

    .badge {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 100px;
      flex-shrink: 0;
      letter-spacing: 0.02em;
    }
    .b-app  { background: #fef3c7; color: #92400e; }
    .b-pkg  { background: #dbeafe; color: #1e40af; }
    .b-leaf { background: #d1fae5; color: #065f46; }

    /* ── Detail panel ────────────────────────── */
    #detail {
      border-top: 1px solid var(--border);
      padding: 12px 14px;
      font-size: 12px;
      display: none;
      max-height: 250px;
      overflow-y: auto;
      flex-shrink: 0;
      background: var(--surface2);
    }
    #detail.open { display: block; }

    .d-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 10px;
      word-break: break-all;
      line-height: 1.4;
    }
    .d-section { margin-bottom: 10px; }
    .d-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text3);
      margin-bottom: 4px;
      font-weight: 600;
    }
    .d-dep {
      color: var(--text3);
      padding: 2px 0;
      cursor: pointer;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .d-dep:hover { color: var(--blue); }
    .d-none { color: var(--subtle); font-style: italic; }

    /* ── Graph ───────────────────────────────── */
    #graph-wrap { flex: 1; position: relative; overflow: hidden; }
    #cy { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }

    /* Toolbar */
    #toolbar {
      position: absolute;
      top: 14px;
      right: 14px;
      display: flex;
      gap: 6px;
    }
    .tb-group {
      display: flex;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 7px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .tb-btn {
      padding: 6px 12px;
      font-size: 12px;
      color: var(--text3);
      cursor: pointer;
      background: none;
      border: none;
      border-right: 1px solid var(--border);
      line-height: 1;
      transition: background 0.1s, color 0.1s;
      white-space: nowrap;
    }
    .tb-btn:last-child { border-right: none; }
    .tb-btn:hover { background: var(--surface2); color: var(--text); }
    .tb-btn.active { background: var(--blue-bg); color: var(--blue); font-weight: 600; }
    .tb-icon { font-size: 15px; padding: 5px 10px; }

    /* Zoom */
    #zoom {
      position: absolute;
      bottom: 20px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .z-btn {
      width: 32px;
      height: 32px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text3);
      font-size: 17px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      transition: background 0.1s, color 0.1s;
      line-height: 1;
    }
    .z-btn:hover { background: var(--surface2); color: var(--text); }

    /* Legend */
    #legend {
      position: absolute;
      bottom: 16px;
      left: 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 7px;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .l-row { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--text3); font-weight: 500; }
    .l-dot { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }

    /* Tooltip */
    #tooltip {
      position: fixed;
      background: var(--text);
      color: #fff;
      border-radius: 5px;
      padding: 5px 10px;
      font-size: 11px;
      pointer-events: none;
      display: none;
      z-index: 9999;
      max-width: 320px;
      word-break: break-all;
    }

    /* Hint */
    #hint {
      position: absolute;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      color: var(--subtle);
      pointer-events: none;
      white-space: nowrap;
    }
    kbd {
      font-size: 10px;
      background: var(--surface2);
      padding: 1px 5px;
      border-radius: 3px;
      border: 1px solid var(--border);
      color: var(--text3);
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--subtle); }
  </style>
</head>
<body>

<div id="sidebar">
  <div class="s-header">
    <div class="s-title">Dependency Graph</div>
    <div class="s-meta" id="meta">Loading…</div>
  </div>
  <div class="s-search">
    <input id="search" type="text" placeholder="Search packages  (/)" autocomplete="off" spellcheck="false">
  </div>
  <div id="node-list"></div>
  <div id="detail">
    <div class="d-name" id="d-name"></div>
    <div class="d-section">
      <div class="d-label">Depends on</div>
      <div id="d-deps"></div>
    </div>
    <div class="d-section">
      <div class="d-label">Used by</div>
      <div id="d-users"></div>
    </div>
  </div>
</div>

<div id="graph-wrap">
  <div id="cy"></div>

  <div id="toolbar">
    <div class="tb-group" id="dir-group">
      <button class="tb-btn active" data-dir="LR">Left → Right</button>
      <button class="tb-btn" data-dir="TB">Top → Bottom</button>
    </div>
    <div class="tb-group">
      <button class="tb-btn tb-icon" id="btn-fit" title="Fit to screen">⊞</button>
    </div>
  </div>

  <div id="zoom">
    <button class="z-btn" id="z-in"  title="Zoom in">+</button>
    <button class="z-btn" id="z-out" title="Zoom out">−</button>
  </div>

  <div id="legend">
    <div class="l-row"><div class="l-dot" style="background:#d97706"></div>App</div>
    <div class="l-row"><div class="l-dot" style="background:#2563eb"></div>Package</div>
    <div class="l-row"><div class="l-dot" style="background:#059669"></div>Leaf</div>
  </div>

  <div id="hint">Click a node \xb7 Scroll to zoom \xb7 Drag to pan \xb7 <kbd>Esc</kbd> to reset</div>
</div>

<div id="tooltip"></div>

<script>
(function () {
  var metaEl    = document.getElementById('meta');
  var listEl    = document.getElementById('node-list');
  var searchEl  = document.getElementById('search');
  var detailEl  = document.getElementById('detail');
  var dNameEl   = document.getElementById('d-name');
  var dDepsEl   = document.getElementById('d-deps');
  var dUsersEl  = document.getElementById('d-users');
  var tooltipEl = document.getElementById('tooltip');

  // ── Parse DOT ─────────────────────────────────────────────────────────────
  // Turbo v2 format: "[root] @repo/package#task" -> "[root] @repo/other#task"
  function parseDot(raw) {
    var nodes = new Map();
    var edges = [];
    var seen  = new Set();
    var re    = /"([^"]+)"\\s*->\\s*"([^"]+)"/g;
    var m;

    function clean(id) {
      id = id.replace(/^\\[root\\]\\s*/, '');
      var h = id.indexOf('#');
      if (h !== -1) id = id.substring(0, h);
      return id.trim();
    }

    while ((m = re.exec(raw)) !== null) {
      var s = clean(m[1]);
      var t = clean(m[2]);
      if (!s || !t || s === t) continue;
      if (s === '___ROOT___' || t === '___ROOT___') continue;
      var key = s + '|' + t;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!nodes.has(s)) nodes.set(s, { id: s });
      if (!nodes.has(t)) nodes.set(t, { id: t });
      edges.push({ source: s, target: t });
    }
    return { nodes: Array.from(nodes.values()), edges: edges };
  }

  function shortName(id) {
    return id.startsWith('@') ? id.split('/').slice(1).join('/') : id;
  }

  function typeOf(id, inDeg, outDeg) {
    return inDeg[id]  === 0 ? 'app'  :
           outDeg[id] === 0 ? 'leaf' : 'pkg';
  }

  var COLORS = {
    app:  { bg: '#d97706', border: '#b45309' },
    pkg:  { bg: '#2563eb', border: '#1d4ed8' },
    leaf: { bg: '#059669', border: '#047857' },
  };

  function initGraph(dot) {
    var parsed = parseDot(dot);
    var nodes  = parsed.nodes;
    var edges  = parsed.edges;

    var inDeg  = {};
    var outDeg = {};
    nodes.forEach(function(n) { inDeg[n.id] = 0; outDeg[n.id] = 0; });
    edges.forEach(function(e) {
      outDeg[e.source] = (outDeg[e.source] || 0) + 1;
      inDeg[e.target]  = (inDeg[e.target]  || 0) + 1;
    });

    var elements = nodes.map(function(n) {
      var t = typeOf(n.id, inDeg, outDeg);
      return { data: { id: n.id, label: shortName(n.id), type: t, color: COLORS[t].bg, border: COLORS[t].border } };
    }).concat(edges.map(function(e, i) {
      return { data: { id: 'e' + i, source: e.source, target: e.target } };
    }));

    // ── Cytoscape ──────────────────────────────────────────────────────────
    var cy = cytoscape({
      container: document.getElementById('cy'),
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color':     'data(color)',
            'border-color':         'data(border)',
            'border-width':         1.5,
            'label':                'data(label)',
            'color':                '#fff',
            'font-size':            '11px',
            'font-family':          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            'font-weight':          600,
            'text-valign':          'center',
            'text-halign':          'center',
            'shape':                'roundrectangle',
            'width':                'label',
            'height':               '28px',
            'padding-left':         '14px',
            'padding-right':        '14px',
            'padding-top':          '8px',
            'padding-bottom':       '8px',
            'min-zoomed-font-size': 6,
            'transition-property':  'opacity, border-color, border-width',
            'transition-duration':  '150ms',
          }
        },
        { selector: 'node:selected', style: { 'border-color': '#7c3aed', 'border-width': 2.5 } },
        { selector: 'node.neighbor', style: { 'border-color': '#4f46e5', 'border-width': 2   } },
        { selector: 'node.faded',    style: { 'opacity': 0.2 } },
        {
          selector: 'edge',
          style: {
            'width':               1,
            'line-color':          '#cbd5e1',
            'target-arrow-color':  '#cbd5e1',
            'target-arrow-shape':  'triangle',
            'curve-style':         'bezier',
            'arrow-scale':         0.7,
            'transition-property': 'opacity, line-color, target-arrow-color, width',
            'transition-duration': '150ms',
          }
        },
        { selector: 'edge.active', style: { 'line-color': '#6366f1', 'target-arrow-color': '#6366f1', 'width': 2 } },
        { selector: 'edge.faded',  style: { 'opacity': 0.06 } },
      ],
      boxSelectionEnabled: false,
      autounselectify:     false,
    });

    function runLayout(rankDir, animate) {
      cy.layout({
        name:                        'dagre',
        rankDir:                     rankDir || 'LR',
        nodeSep:                     40,
        rankSep:                     110,
        nodeDimensionsIncludeLabels: true,
        animate:                     !!animate,
        animationDuration:           400,
        animationEasing:             'ease-in-out-cubic',
        stop: function() { cy.resize(); cy.fit(40); },
      }).run();
    }

    cy.ready(function() { cy.resize(); runLayout('LR', false); });

    metaEl.textContent = nodes.length + ' packages \\xb7 ' + edges.length + ' dependencies';

    var activeId   = null;
    var filterText = '';

    function renderList() {
      var q = filterText.toLowerCase();
      var filtered = nodes.filter(function(n) {
        return !q || n.id.toLowerCase().indexOf(q) !== -1;
      }).slice().sort(function(a, b) {
        var o = { app: 0, pkg: 1, leaf: 2 };
        var diff = o[typeOf(a.id, inDeg, outDeg)] - o[typeOf(b.id, inDeg, outDeg)];
        return diff !== 0 ? diff : a.id.localeCompare(b.id);
      });

      listEl.innerHTML = '';
      filtered.forEach(function(n) {
        var t   = typeOf(n.id, inDeg, outDeg);
        var div = document.createElement('div');
        div.className = 'ni' + (n.id === activeId ? ' active' : '');
        var label = t === 'app' ? 'App' : t === 'leaf' ? 'Leaf' : 'Pkg';
        div.innerHTML =
          '<span class="ni-name" title="' + n.id + '">' + shortName(n.id) + '</span>' +
          '<span class="badge b-' + t + '">' + label + '</span>';
        div.addEventListener('click', function() { selectNode(n.id); });
        listEl.appendChild(div);
      });
    }

    function selectNode(id) {
      activeId = id;
      var node      = cy.getElementById(id);
      var neighbors = node.neighborhood('node');
      var connEdges = node.connectedEdges();

      cy.nodes().addClass('faded').removeClass('neighbor');
      cy.edges().addClass('faded').removeClass('active');
      node.removeClass('faded');
      neighbors.removeClass('faded').addClass('neighbor');
      connEdges.removeClass('faded').addClass('active');
      cy.nodes().unselect();
      node.select();

      cy.animate({ center: { eles: node } }, { duration: 300, easing: 'ease-in-out-cubic' });

      renderList();
      renderDetail(id, node);
    }

    function renderDetail(id, node) {
      dNameEl.textContent = id;

      var deps  = node.outgoers('node').map(function(n) { return n.id(); });
      var users = node.incomers('node').map(function(n) { return n.id(); });

      function depLinks(ids) {
        if (!ids.length) return '<span class="d-none">None</span>';
        return ids.map(function(d) {
          return '<a class="d-dep" data-id="' + d + '" title="' + d + '">' + shortName(d) + '</a>';
        }).join('');
      }

      dDepsEl.innerHTML  = depLinks(deps);
      dUsersEl.innerHTML = depLinks(users);
      detailEl.classList.add('open');

      detailEl.querySelectorAll('.d-dep[data-id]').forEach(function(a) {
        a.addEventListener('click', function() { selectNode(a.dataset.id); });
      });
    }

    function clearSelection() {
      activeId = null;
      cy.nodes().removeClass('faded neighbor').unselect();
      cy.edges().removeClass('faded active');
      detailEl.classList.remove('open');
      renderList();
    }

    cy.on('tap', 'node', function(e) { selectNode(e.target.id()); });
    cy.on('tap', function(e) { if (e.target === cy) clearSelection(); });

    cy.on('mouseover', 'node', function(e) {
      tooltipEl.textContent = e.target.id();
      tooltipEl.style.display = 'block';
    });
    cy.on('mousemove', function(e) {
      if (tooltipEl.style.display === 'none') return;
      var orig = e.originalEvent;
      if (orig) {
        tooltipEl.style.left = (orig.clientX + 14) + 'px';
        tooltipEl.style.top  = (orig.clientY - 36) + 'px';
      }
    });
    cy.on('mouseout', 'node', function() { tooltipEl.style.display = 'none'; });

    searchEl.addEventListener('input', function() {
      filterText = searchEl.value.trim();
      renderList();
      if (!activeId) {
        if (filterText) {
          var q = filterText.toLowerCase();
          cy.nodes().forEach(function(n) {
            n.id().toLowerCase().indexOf(q) !== -1 ? n.removeClass('faded') : n.addClass('faded');
          });
          cy.edges().addClass('faded');
        } else {
          cy.nodes().removeClass('faded');
          cy.edges().removeClass('faded');
        }
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        clearSelection();
        filterText = '';
        searchEl.value = '';
        cy.nodes().removeClass('faded');
        cy.edges().removeClass('faded');
        searchEl.blur();
      }
      if (e.key === '/' && document.activeElement !== searchEl) {
        e.preventDefault();
        searchEl.focus();
        searchEl.select();
      }
    });

    document.getElementById('z-in').addEventListener('click', function() {
      cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    });
    document.getElementById('z-out').addEventListener('click', function() {
      cy.zoom({ level: cy.zoom() / 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    });
    document.getElementById('btn-fit').addEventListener('click', function() {
      cy.animate({ fit: { eles: cy.elements(), padding: 40 } }, { duration: 350, easing: 'ease-in-out-cubic' });
    });

    document.querySelectorAll('[data-dir]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('[data-dir]').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        runLayout(btn.dataset.dir, true);
      });
    });

    window.addEventListener('resize', function() { cy.resize(); cy.fit(40); });

    renderList();
  }

  // Fetch the DOT data from the server — avoids all embedding/escaping issues.
  fetch('/dot')
    .then(function(r) { return r.text(); })
    .then(function(dot) {
      if (!dot || dot.indexOf('digraph') === -1) {
        metaEl.textContent = 'Error: no graph data received';
        return;
      }
      initGraph(dot);
    })
    .catch(function(err) {
      metaEl.textContent = 'Error loading graph: ' + err.message;
    });
})();
</script>
</body>
</html>`;
}
