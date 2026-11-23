// ============================================================
//  Secure Bank Account Management System — app.js
//  All logic using localStorage as database simulation
// ============================================================

const SAMPLE_DATA = {
  customers: [
    { id: 1, name: 'John Doe',   email: 'john@bank.com',  phone: '9876543210', password: 'john123',  role: 'customer', createdAt: '2024-01-10' },
    { id: 2, name: 'Jane Smith', email: 'jane@bank.com',  phone: '8765432109', password: 'jane123',  role: 'customer', createdAt: '2024-01-15' },
    { id: 3, name: 'Ravi Kumar', email: 'ravi@bank.com',  phone: '7654321098', password: 'ravi123',  role: 'customer', createdAt: '2024-02-01' },
    { id: 4, name: 'Admin User', email: 'admin@bank.com', phone: '9999999999', password: 'admin123', role: 'admin',    createdAt: '2024-01-01' }
  ],
  accounts: [
    { id: 1, customerId: 1, accountNumber: 'ACC0000000001', accountType: 'Savings', balance: 50000, status: 'Active', createdAt: '2024-01-10' },
    { id: 2, customerId: 2, accountNumber: 'ACC0000000002', accountType: 'Current', balance: 75000, status: 'Active', createdAt: '2024-01-15' },
    { id: 3, customerId: 3, accountNumber: 'ACC0000000003', accountType: 'Savings', balance: 30000, status: 'Active', createdAt: '2024-02-01' }
  ],
  transactions: [
    { id:1,  accountId:1, type:'Deposit',    amount:20000, balanceAfter:20000, description:'Initial deposit',           date:'2024-01-10T10:00:00', status:'Success' },
    { id:2,  accountId:1, type:'Deposit',    amount:30000, balanceAfter:50000, description:'Salary credit',             date:'2024-02-01T09:00:00', status:'Success' },
    { id:3,  accountId:1, type:'Withdrawal', amount:5000,  balanceAfter:45000, description:'ATM withdrawal',            date:'2024-02-05T14:00:00', status:'Success' },
    { id:4,  accountId:1, type:'Transfer',   amount:10000, balanceAfter:35000, description:'Transfer to ACC0000000002', date:'2024-02-10T11:00:00', status:'Success' },
    { id:5,  accountId:1, type:'Deposit',    amount:15000, balanceAfter:50000, description:'Bonus received',            date:'2024-03-01T08:30:00', status:'Success' },
    { id:6,  accountId:2, type:'Deposit',    amount:75000, balanceAfter:75000, description:'Initial deposit',           date:'2024-01-15T10:00:00', status:'Success' },
    { id:7,  accountId:2, type:'Deposit',    amount:10000, balanceAfter:85000, description:'Received transfer',         date:'2024-02-10T11:05:00', status:'Success' },
    { id:8,  accountId:2, type:'Withdrawal', amount:20000, balanceAfter:65000, description:'Bill payment',              date:'2024-02-20T16:00:00', status:'Success' },
    { id:9,  accountId:3, type:'Deposit',    amount:30000, balanceAfter:30000, description:'Initial deposit',           date:'2024-02-01T10:00:00', status:'Success' },
    { id:10, accountId:3, type:'Withdrawal', amount:5000,  balanceAfter:25000, description:'Shopping',                  date:'2024-02-15T13:00:00', status:'Success' },
    { id:11, accountId:3, type:'Deposit',    amount:10000, balanceAfter:35000, description:'Freelance payment',         date:'2024-03-05T10:00:00', status:'Success' }
  ],
  auditLogs: [
    { id:1, customerId:1, email:'john@bank.com',  action:'LOGIN',      details:'User logged in',       timestamp:'2024-03-10T09:00:00' },
    { id:2, customerId:1, email:'john@bank.com',  action:'MFA_VERIFY', details:'OTP verified',         timestamp:'2024-03-10T09:01:00' },
    { id:3, customerId:1, email:'john@bank.com',  action:'DEPOSIT',    details:'Deposited 15000',      timestamp:'2024-03-10T09:05:00' },
    { id:4, customerId:2, email:'jane@bank.com',  action:'LOGIN',      details:'User logged in',       timestamp:'2024-03-10T10:00:00' },
    { id:5, customerId:2, email:'jane@bank.com',  action:'WITHDRAWAL', details:'Withdrew 20000',       timestamp:'2024-03-10T10:10:00' },
    { id:6, customerId:1, email:'john@bank.com',  action:'TRANSFER',   details:'Transferred 10000',    timestamp:'2024-03-10T09:30:00' },
    { id:7, customerId:1, email:'john@bank.com',  action:'LOGOUT',     details:'User logged out',      timestamp:'2024-03-10T10:00:00' }
  ]
};

// ---- DB ----
const DB = {
  init() {
    if (!localStorage.getItem('sbams_initialized')) {
      localStorage.setItem('sbams_customers',    JSON.stringify(SAMPLE_DATA.customers));
      localStorage.setItem('sbams_accounts',     JSON.stringify(SAMPLE_DATA.accounts));
      localStorage.setItem('sbams_transactions', JSON.stringify(SAMPLE_DATA.transactions));
      localStorage.setItem('sbams_auditlogs',    JSON.stringify(SAMPLE_DATA.auditLogs));
      localStorage.setItem('sbams_initialized',  'true');
    }
  },
  get(key)       { return JSON.parse(localStorage.getItem('sbams_' + key) || '[]'); },
  set(key, data) { localStorage.setItem('sbams_' + key, JSON.stringify(data)); },
  nextId(key)    { const a = this.get(key); return a.length > 0 ? Math.max(...a.map(x => x.id)) + 1 : 1; }
};

// ---- Auth ----
const Auth = {
  login(email, password) { return DB.get('customers').find(c => c.email===email && c.password===password) || null; },
  register(name, email, phone, password) {
    const customers = DB.get('customers');
    if (customers.find(c => c.email===email)) return { success:false, msg:'Email already registered.' };
    const id = DB.nextId('customers');
    const nc = { id, name, email, phone, password, role:'customer', createdAt: new Date().toISOString().split('T')[0] };
    customers.push(nc);
    DB.set('customers', customers);
    const accounts = DB.get('accounts');
    const accId = DB.nextId('accounts');
    accounts.push({ id:accId, customerId:id, accountNumber:'ACC'+String(id).padStart(10,'0'), accountType:'Savings', balance:0, status:'Active', createdAt: nc.createdAt });
    DB.set('accounts', accounts);
    return { success:true, customer:nc };
  },
  setSession(c) { sessionStorage.setItem('sbams_user', JSON.stringify(c)); },
  getSession()  { return JSON.parse(sessionStorage.getItem('sbams_user')||'null'); },
  clearSession(){ sessionStorage.removeItem('sbams_user'); },
  requireAuth() { const u=this.getSession(); if(!u){window.location.href='index.html';return null;} return u; },
  requireAdmin(){ const u=this.getSession(); if(!u||u.role!=='admin'){window.location.href='index.html';return null;} return u; }
};

// ---- Accounts ----
const AccountOps = {
  getByCustomer(cid)  { return DB.get('accounts').find(a=>a.customerId===cid)||null; },
  getByNumber(num)    { return DB.get('accounts').find(a=>a.accountNumber===num)||null; },
  deposit(accountId, amount, desc) {
    const accounts = DB.get('accounts');
    const acc = accounts.find(a=>a.id===accountId);
    if (!acc) return {success:false,msg:'Account not found.'};
    if (amount<=0) return {success:false,msg:'Amount must be greater than zero.'};
    acc.balance += amount;
    DB.set('accounts', accounts);
    TxnOps.add(accountId,'Deposit',amount,acc.balance,desc||'Deposit');
    return {success:true,balance:acc.balance};
  },
  withdraw(accountId, amount, desc) {
    const accounts = DB.get('accounts');
    const acc = accounts.find(a=>a.id===accountId);
    if (!acc) return {success:false,msg:'Account not found.'};
    if (amount<=0) return {success:false,msg:'Amount must be greater than zero.'};
    if (acc.balance<amount) return {success:false,msg:'Insufficient balance.'};
    acc.balance -= amount;
    DB.set('accounts', accounts);
    TxnOps.add(accountId,'Withdrawal',amount,acc.balance,desc||'Withdrawal');
    return {success:true,balance:acc.balance};
  },
  transfer(fromId, toNum, amount, desc) {
    const accounts = DB.get('accounts');
    const from = accounts.find(a=>a.id===fromId);
    const to   = accounts.find(a=>a.accountNumber===toNum);
    if (!from) return {success:false,msg:'Your account not found.'};
    if (!to)   return {success:false,msg:'Recipient account not found.'};
    if (from.id===to.id) return {success:false,msg:'Cannot transfer to same account.'};
    if (amount<=0) return {success:false,msg:'Amount must be greater than zero.'};
    if (from.balance<amount) return {success:false,msg:'Insufficient balance.'};
    from.balance -= amount;
    to.balance   += amount;
    DB.set('accounts', accounts);
    TxnOps.add(from.id,'Transfer',amount,from.balance,`Transfer to ${toNum}`);
    TxnOps.add(to.id,  'Deposit', amount,to.balance,  `Received from ${from.accountNumber}`);
    return {success:true,balance:from.balance};
  }
};

// ---- Transactions ----
const TxnOps = {
  add(accountId,type,amount,balanceAfter,description) {
    const txns = DB.get('transactions');
    txns.push({id:DB.nextId('transactions'),accountId,type,amount,balanceAfter,description,date:new Date().toISOString(),status:'Success'});
    DB.set('transactions',txns);
  },
  getByAccount(accountId,limit) {
    let t = DB.get('transactions').filter(x=>x.accountId===accountId).sort((a,b)=>new Date(b.date)-new Date(a.date));
    return limit?t.slice(0,limit):t;
  },
  getAll() { return DB.get('transactions').sort((a,b)=>new Date(b.date)-new Date(a.date)); }
};

// ---- Audit Log ----
const AuditLog = {
  add(cid,email,action,details) {
    const logs = DB.get('auditlogs');
    logs.push({id:DB.nextId('auditlogs'),customerId:cid,email,action,details,timestamp:new Date().toISOString()});
    DB.set('auditlogs',logs);
  },
  getAll() { return DB.get('auditlogs').sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); }
};

// ---- MFA ----
const MFA = {
  generateOTP() { return Math.floor(100000+Math.random()*900000).toString(); },
  storeOTP(otp) { sessionStorage.setItem('sbams_otp',otp); sessionStorage.setItem('sbams_otp_time',Date.now()); },
  verifyOTP(input) {
    const s=sessionStorage.getItem('sbams_otp');
    const t=parseInt(sessionStorage.getItem('sbams_otp_time')||'0');
    if(!s) return false;
    if(Date.now()-t>5*60*1000) return false;
    return s===input.trim();
  },
  clearOTP() { sessionStorage.removeItem('sbams_otp'); sessionStorage.removeItem('sbams_otp_time'); }
};

// ---- Toast ----
function showToast(message, type='info') {
  let c = document.querySelector('.toast-container');
  if (!c) { c=document.createElement('div'); c.className='toast-container'; document.body.appendChild(c); }
  const icons = {success:'fa-check-circle',error:'fa-times-circle',info:'fa-info-circle',warning:'fa-exclamation-triangle'};
  const t = document.createElement('div');
  t.className=`toast toast-${type}`;
  t.innerHTML=`<i class="fas ${icons[type]} toast-icon"></i><span class="toast-msg">${message}</span><button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
  c.appendChild(t);
  setTimeout(()=>{ t.classList.add('removing'); setTimeout(()=>t.remove(),300); },3500);
}

// ---- Helpers ----
function formatCurrency(n) { return '&#8377;'+Number(n).toLocaleString('en-IN',{minimumFractionDigits:2}); }
function formatDate(s) {
  if(!s) return '-';
  const d=new Date(s);
  return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
}
function getTypeBadge(t) {
  if(t==='Deposit')    return '<span class="badge badge-success">Deposit</span>';
  if(t==='Withdrawal') return '<span class="badge badge-danger">Withdrawal</span>';
  if(t==='Transfer')   return '<span class="badge badge-info">Transfer</span>';
  return `<span class="badge badge-secondary">${t}</span>`;
}

// ---- Sidebar ----
function renderSidebar(activePage) {
  const user = Auth.getSession();
  if (!user || !document.getElementById('sidebar')) return;
  const initials = user.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  const isAdmin = user.role==='admin';
  const navHtml = isAdmin
    ? `<div class="nav-section"><div class="nav-section-label">Admin</div>
        <a href="admin.html" class="nav-item ${activePage==='admin'?'active':''}"><i class="fas fa-shield-alt"></i><span>Admin Panel</span></a>
       </div>`
    : `<div class="nav-section"><div class="nav-section-label">Menu</div>
        <a href="dashboard.html" class="nav-item ${activePage==='dashboard'?'active':''}"><i class="fas fa-th-large"></i><span>Dashboard</span></a>
        <a href="deposit.html"   class="nav-item ${activePage==='deposit'?'active':''}"><i class="fas fa-plus-circle"></i><span>Deposit</span></a>
        <a href="withdraw.html"  class="nav-item ${activePage==='withdraw'?'active':''}"><i class="fas fa-minus-circle"></i><span>Withdraw</span></a>
        <a href="transfer.html"  class="nav-item ${activePage==='transfer'?'active':''}"><i class="fas fa-exchange-alt"></i><span>Transfer</span></a>
        <a href="history.html"   class="nav-item ${activePage==='history'?'active':''}"><i class="fas fa-history"></i><span>History</span></a>
       </div>`;
  document.getElementById('sidebar').innerHTML=`
    <div class="sidebar-logo"><div class="s-icon"><i class="fas fa-university"></i></div><span>SecureBank</span></div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">${initials}</div>
        <div><div class="user-name">${user.name}</div><div class="user-role">${isAdmin?'Administrator':'Customer'}</div></div>
      </div>
      <button class="btn btn-secondary btn-sm" style="width:100%;margin-top:8px" onclick="logout()">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>`;
}

function logout() {
  const u = Auth.getSession();
  if (u) AuditLog.add(u.id, u.email, 'LOGOUT', 'User logged out');
  Auth.clearSession();
  window.location.href='index.html';
}

DB.init();
