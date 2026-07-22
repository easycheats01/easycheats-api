// =============================================================================
// EASYCHEATS — API com sistema de Revendedores
// =============================================================================

const express = require('express');
const cors    = require('cors');
const crypto  = require('crypto');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
console.log('Porta configurada:', PORT);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'EASYCHEATS@2024';

// Usa /data se disponível (Square Cloud com volume), senão usa __dirname
const DATA_DIR = (() => {
  try {
    if (!fs.existsSync('/data')) fs.mkdirSync('/data', { recursive: true });
    // Testa se consegue escrever
    fs.writeFileSync('/data/.test', '1');
    fs.unlinkSync('/data/.test');
    console.log('Usando /data para persistência.');
    return '/data';
  } catch (e) {
    console.warn('Aviso: /data indisponível, usando __dirname:', e.message);
    return __dirname;
  }
})();

const DB_FILE        = path.join(DATA_DIR, 'db.json');
const DB_BACKUP_FILE = path.join(DATA_DIR, 'db.backup.json');

// ── DB helpers ───────────────────────────────────────────────────────────────
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Tenta restaurar do backup
      if (fs.existsSync(DB_BACKUP_FILE)) {
        console.log('Restaurando db.json do backup...');
        fs.copyFileSync(DB_BACKUP_FILE, DB_FILE);
      } else {
        // Cria novo banco
        const initialData = {
          keys: [], nextKeyId: 1,
          resellers: [], nextResellerId: 1
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        console.log('db.json criado com sucesso!');
      }
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (error) {
    console.error('Erro ao carregar db.json:', error);
    // Tenta restaurar do backup
    if (fs.existsSync(DB_BACKUP_FILE)) {
      console.log('Tentando restaurar do backup...');
      fs.copyFileSync(DB_BACKUP_FILE, DB_FILE);
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
    // Retorna estrutura vazia se tudo falhar
    return {
      keys: [], nextKeyId: 1,
      resellers: [], nextResellerId: 1
    };
  }
}

function saveDB(data) {
  try {
    // Salva o arquivo principal
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    // Cria backup automaticamente
    fs.writeFileSync(DB_BACKUP_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao salvar db.json:', error);
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve painel e revendedor como páginas estáticas
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Rotas diretas para os painéis
app.get('/painel.html', (req, res) => {
  const f1 = path.join(__dirname, 'public', 'painel.html');
  const f2 = path.join(__dirname, 'painel.html');
  if (fs.existsSync(f1)) return res.sendFile(f1);
  if (fs.existsSync(f2)) return res.sendFile(f2);
  res.status(404).send('painel.html não encontrado');
});

app.get('/revendedor.html', (req, res) => {
  const f1 = path.join(__dirname, 'public', 'revendedor.html');
  const f2 = path.join(__dirname, 'revendedor.html');
  if (fs.existsSync(f1)) return res.sendFile(f1);
  if (fs.existsSync(f2)) return res.sendFile(f2);
  res.status(404).send('revendedor.html não encontrado');
});

function adminAuth(req, res, next) {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD)
    return res.status(401).json({ status: 'error', reason: 'unauthorized' });
  next();
}

function resellerAuth(req, res, next) {
  const username = req.headers['x-reseller-user'];
  const password = req.headers['x-reseller-pass'];
  if (!username || !password)
    return res.status(401).json({ status: 'error', reason: 'missing_credentials' });

  const db = loadDB();
  const reseller = db.resellers.find(r => r.username === username && r.password === password && r.active);
  if (!reseller)
    return res.status(401).json({ status: 'error', reason: 'invalid_credentials' });

  // Verifica se conta do revendedor expirou
  if (reseller.expires_at && new Date() > new Date(reseller.expires_at)) {
    return res.status(403).json({ status: 'error', reason: 'reseller_expired' });
  }

  req.reseller = reseller;
  next();
}

// ── Gera key aleatória ────────────────────────────────────────────────────────
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg(2)}-${seg(4)}-${seg(4)}-${seg(4)}-${seg(4)}`;
}

// =============================================================================
// ROTA PÚBLICA — valida key (chamada pelo APK)
// =============================================================================
app.post('/api/auth', (req, res) => {
  const { key, device_id } = req.body;
  if (!key || !device_id)
    return res.json({ status: 'error', reason: 'missing_fields' });

  const db  = loadDB();
  const row = db.keys.find(k => k.key_value === key);

  if (!row) return res.json({ status: 'error', reason: 'invalid_key' });
  if (row.status === 'revoked') return res.json({ status: 'revoked' });
  if (row.status === 'paused')  return res.json({ status: 'paused' });

  if (row.expires_at && new Date() > new Date(row.expires_at)) {
    row.status = 'expired'; saveDB(db);
    return res.json({ status: 'expired' });
  }

  if (row.status === 'expired') return res.json({ status: 'expired' });

  if (!row.device_id) {
    row.device_id = device_id; saveDB(db);
  } else if (row.device_id !== device_id) {
    return res.json({ status: 'error', reason: 'device_mismatch', message: 'Key vinculada a outro celular.' });
  }

  return res.json({ status: 'ok' });
});

// =============================================================================
// ROTAS ADMIN — gestão completa
// =============================================================================

// ── Keys ──────────────────────────────────────────────────────────────────────
app.get('/admin/keys', adminAuth, (req, res) => {
  const db = loadDB();
  res.json({ status: 'ok', keys: db.keys.slice().reverse() });
});

app.post('/admin/keys/add', adminAuth, (req, res) => {
  const { key_value, label, expires_at } = req.body;
  if (!key_value) return res.status(400).json({ status: 'error', reason: 'missing_key' });

  const db = loadDB();
  if (db.keys.find(k => k.key_value === key_value))
    return res.status(409).json({ status: 'error', reason: 'key_already_exists' });

  const newKey = {
    id: db.nextKeyId++, key_value, label: label || '',
    status: 'active', device_id: null,
    created_at: new Date().toISOString(),
    expires_at: expires_at || null,
    created_by: 'admin'
  };
  db.keys.push(newKey); saveDB(db);
  res.json({ status: 'ok', key: newKey });
});

app.patch('/admin/keys/:id/status', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (!['active','paused','revoked','expired'].includes(status))
    return res.status(400).json({ status: 'error', reason: 'invalid_status' });

  const db  = loadDB();
  const row = db.keys.find(k => k.id === id);
  if (!row) return res.status(404).json({ status: 'error', reason: 'not_found' });

  row.status = status; saveDB(db);
  res.json({ status: 'ok' });
});

app.delete('/admin/keys/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const db = loadDB();
  const idx = db.keys.findIndex(k => k.id === id);
  if (idx === -1) return res.status(404).json({ status: 'error', reason: 'not_found' });

  db.keys.splice(idx, 1); saveDB(db);
  res.json({ status: 'ok' });
});

app.patch('/admin/keys/:id/reset-device', adminAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = loadDB();
  const row = db.keys.find(k => k.id === id);
  if (!row) return res.status(404).json({ status: 'error', reason: 'not_found' });

  row.device_id = null; saveDB(db);
  res.json({ status: 'ok' });
});

// ── Revendedores ──────────────────────────────────────────────────────────────

// Lista revendedores
app.get('/admin/resellers', adminAuth, (req, res) => {
  const db = loadDB();
  // Não retorna senha
  const safe = db.resellers.map(r => ({ ...r, password: '***' }));
  res.json({ status: 'ok', resellers: safe.slice().reverse() });
});

// Cria revendedor
app.post('/admin/resellers', adminAuth, (req, res) => {
  const { username, password, key_limit, expires_at, label } = req.body;
  if (!username || !password)
    return res.status(400).json({ status: 'error', reason: 'missing_fields' });

  const db = loadDB();
  if (db.resellers.find(r => r.username === username))
    return res.status(409).json({ status: 'error', reason: 'username_taken' });

  const reseller = {
    id: db.nextResellerId++,
    username, password,
    label:      label || '',
    key_limit:  key_limit || 10,   // máx de keys que pode gerar
    keys_used:  0,                 // quantas já gerou
    expires_at: expires_at || null,
    active:     true,
    created_at: new Date().toISOString()
  };
  db.resellers.push(reseller); saveDB(db);
  res.json({ status: 'ok', reseller: { ...reseller, password: '***' } });
});

// Atualiza revendedor
app.patch('/admin/resellers/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const db = loadDB();
  const r  = db.resellers.find(r => r.id === id);
  if (!r) return res.status(404).json({ status: 'error', reason: 'not_found' });

  const { key_limit, expires_at, active, password, label } = req.body;
  if (key_limit  !== undefined) r.key_limit  = key_limit;
  if (expires_at !== undefined) r.expires_at = expires_at;
  if (active     !== undefined) r.active     = active;
  if (password   !== undefined && password !== '') r.password = password;
  if (label      !== undefined) r.label      = label;

  saveDB(db);
  res.json({ status: 'ok' });
});

// Deleta revendedor
app.delete('/admin/resellers/:id', adminAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = loadDB();
  const idx = db.resellers.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ status: 'error', reason: 'not_found' });

  db.resellers.splice(idx, 1); saveDB(db);
  res.json({ status: 'ok' });
});

// Keys criadas por um revendedor específico
app.get('/admin/resellers/:id/keys', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const db = loadDB();
  const r  = db.resellers.find(r => r.id === id);
  if (!r) return res.status(404).json({ status: 'error', reason: 'not_found' });

  const keys = db.keys.filter(k => k.created_by === r.username);
  res.json({ status: 'ok', keys });
});

// =============================================================================
// ROTAS REVENDEDOR — painel do revendedor
// =============================================================================

// Info do revendedor
app.get('/reseller/me', resellerAuth, (req, res) => {
  const r = req.reseller;
  res.json({
    status:     'ok',
    id:         r.id,
    username:   r.username,
    label:      r.label,
    key_limit:  r.key_limit,
    keys_used:  r.keys_used,
    keys_left:  r.key_limit - r.keys_used,
    expires_at: r.expires_at,
    active:     r.active
  });
});

// Keys do revendedor
app.get('/reseller/keys', resellerAuth, (req, res) => {
  const db   = loadDB();
  const keys = db.keys.filter(k => k.created_by === req.reseller.username);
  res.json({ status: 'ok', keys: keys.slice().reverse() });
});

// Gera key (revendedor)
app.post('/reseller/keys/add', resellerAuth, (req, res) => {
  const { key_value, label, expires_at } = req.body;
  if (!key_value) return res.status(400).json({ status: 'error', reason: 'missing_key' });

  const db = loadDB();
  const r  = db.resellers.find(r => r.id === req.reseller.id);

  if (r.keys_used >= r.key_limit)
    return res.status(403).json({ status: 'error', reason: 'key_limit_reached', message: 'Limite de keys atingido.' });

  if (db.keys.find(k => k.key_value === key_value))
    return res.status(409).json({ status: 'error', reason: 'key_already_exists' });

  const newKey = {
    id:         db.nextKeyId++,
    key_value,
    label:      label || '',
    status:     'active',
    device_id:  null,
    created_at: new Date().toISOString(),
    expires_at: expires_at || null,
    created_by: r.username
  };

  db.keys.push(newKey);
  r.keys_used++;
  saveDB(db);
  res.json({ status: 'ok', key: newKey });
});

// Reset device (revendedor só pode resetar as próprias keys)
app.patch('/reseller/keys/:id/reset-device', resellerAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = loadDB();
  const row = db.keys.find(k => k.id === id && k.created_by === req.reseller.username);
  if (!row) return res.status(404).json({ status: 'error', reason: 'not_found' });

  row.device_id = null; saveDB(db);
  res.json({ status: 'ok' });
});

// Pausar key (revendedor)
app.patch('/reseller/keys/:id/pause', resellerAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = loadDB();
  const row = db.keys.find(k => k.id === id && k.created_by === req.reseller.username);
  if (!row) return res.status(404).json({ status: 'error', reason: 'not_found' });
  row.status = 'paused'; saveDB(db);
  res.json({ status: 'ok' });
});

// Ativar key (revendedor)
app.patch('/reseller/keys/:id/activate', resellerAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = loadDB();
  const row = db.keys.find(k => k.id === id && k.created_by === req.reseller.username);
  if (!row) return res.status(404).json({ status: 'error', reason: 'not_found' });

  row.status = 'active'; saveDB(db);
  res.json({ status: 'ok' });
});

// Revogar key (revendedor)
app.patch('/reseller/keys/:id/revoke', resellerAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = loadDB();
  const row = db.keys.find(k => k.id === id && k.created_by === req.reseller.username);
  if (!row) return res.status(404).json({ status: 'error', reason: 'not_found' });

  row.status = 'revoked'; saveDB(db);
  res.json({ status: 'ok' });
});

// Deletar key (revendedor só pode deletar as próprias)
app.delete('/reseller/keys/:id', resellerAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const db  = loadDB();
  const idx = db.keys.findIndex(k => k.id === id && k.created_by === req.reseller.username);
  if (idx === -1) return res.status(404).json({ status: 'error', reason: 'not_found' });

  // Decrementa o contador do revendedor ao deletar
  const r = db.resellers.find(r => r.username === req.reseller.username);
  if (r && r.keys_used > 0) r.keys_used--;

  db.keys.splice(idx, 1);
  saveDB(db);
  res.json({ status: 'ok' });
});

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', message: 'EASYCHEATS API running' }));

app.listen(PORT, () => {
  console.log(`EASYCHEATS API na porta ${PORT}`);
  console.log(`Arquivo de banco: ${DB_FILE}`);
  
  // Verifica se o banco existe e mostra estatísticas
  const db = loadDB();
  console.log(`Keys cadastradas: ${db.keys.length}`);
  console.log(`Revendedores cadastrados: ${db.resellers.length}`);
  console.log('Servidor pronto para uso!');
});
