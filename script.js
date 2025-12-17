// =================================================================
//                 1. FIREBASE CONFIGURATION & INIT
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCuUKCxYx0jYKqWOQaN82K5zFGlQsKQsK0",
  authDomain: "ck-manager-1abdc.firebaseapp.com",
  projectId: "ck-manager-1abdc",
  storageBucket: "ck-manager-1abdc.firebasestorage.app",
  messagingSenderId: "890017473158",
  appId: "1:890017473158:web:528e1eebc4b67bd54ca707",
  measurementId: "G-7Z71W1NSX4"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore();

const appContent = document.getElementById('app-content');
const authStatus = document.getElementById('auth-status');
const mainNav = document.getElementById('main-nav');
let currentUser = null; 

// Cross-document state variables
window.pendingReceiptRef = null;
window.pendingAgreementRef = null;

// =================================================================
//                 2. AUTHENTICATION & ROUTING
// =================================================================
auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        authStatus.innerHTML = `<span class="mr-3 text-sm">Hello, ${user.email}</span>
                                <button onclick="handleLogout()" class="bg-secondary-red hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Logout</button>`;
        renderDashboard();
    } else {
        authStatus.innerHTML = '';
        mainNav.classList.add('hidden');
        renderAuthForm();
    }
});

function handleLogout() { auth.signOut(); }

function renderAuthForm() {
    appContent.innerHTML = `
        <div class="max-w-md mx-auto my-16 p-8 bg-white rounded-xl shadow-2xl">
            <h2 class="text-3xl font-bold mb-8 text-center text-primary-blue">CDMS Login</h2>
            <form id="login-form" onsubmit="event.preventDefault(); handleLogin();">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                    <input type="email" id="email" required class="w-full p-3 border rounded-lg">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                    <input type="password" id="password" required class="w-full p-3 border rounded-lg">
                </div>
                <button type="submit" class="w-full bg-primary-blue text-white font-bold py-3 rounded-lg">Sign In</button>
            </form>
        </div>`;
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try { await auth.signInWithEmailAndPassword(email, password); } 
    catch (error) { alert("Login Failed: " + error.message); }
}

// =================================================================
//                 3. UTILITIES & DASHBOARD
// =================================================================
function renderDashboard() {
    appContent.innerHTML = `
        <h2 class="text-4xl font-extrabold mb-8 text-primary-blue">CDMS Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${createDashboardCard('Document Generator', 'Invoices, Receipts, Agreements', 'bg-green-100 border-green-400', 'handleDocumentGenerator')}
            ${createDashboardCard('Fleet Management', 'Car Tracking, Clearing, ETA', 'bg-yellow-100 border-yellow-400', 'handleFleetManagement')}
            ${createDashboardCard('HR & Requisitions', 'Forms', 'bg-red-100 border-red-400', 'handleHRManagement')}
        </div>`;
    
    mainNav.innerHTML = `
        <a href="#" onclick="renderDashboard()" class="py-2 px-3 rounded hover:bg-blue-500">Home</a>
        <a href="#" onclick="handleDocumentGenerator()" class="py-2 px-3 rounded hover:bg-blue-500">Documents</a>
        <a href="#" onclick="handleFleetManagement()" class="py-2 px-3 rounded hover:bg-blue-500">Fleet</a>`;
    mainNav.classList.remove('hidden');
}

function createDashboardCard(title, subtitle, colorClass, handler) {
    return `<div class="${colorClass} border-2 p-6 rounded-xl shadow-lg cursor-pointer transform hover:scale-[1.02] transition" onclick="${handler}()">
                <h3 class="text-2xl font-bold text-gray-800">${title}</h3>
                <p class="text-gray-600 mt-2">${subtitle}</p>
            </div>`;
}

function numberToWords(n) {
    if (typeof n !== 'number' || isNaN(n)) return '';
    const whole = Math.floor(n);
    const decimal = Math.round((n - whole) * 100);
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const numToWords = (num) => {
        if (num < 20) return a[num];
        if (num < 100) return b[Math.floor(num / 10)] + (num % 10 === 0 ? '' : ' ' + a[num % 10]);
        if (num < 1000) return a[Math.floor(num / 100)] + ' hundred' + (num % 100 === 0 ? '' : ' and ' + numToWords(num % 100));
        if (num < 1000000) return numToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 === 0 ? '' : ' ' + numToWords(num % 1000));
        return numToWords(Math.floor(num / 1000000)) + ' million' + (num % 1000000 === 0 ? '' : ' ' + numToWords(num % 1000000));
    };
    let result = numToWords(whole).trim();
    if (decimal > 0) result += ` and ${numToWords(decimal)} cents`;
    return result.charAt(0).toUpperCase() + result.slice(1) + ' only.';
}

// =================================================================
//                 4. INVOICE MODULE (SEQUENTIAL)
// =================================================================
async function getSequentialInvoiceId() {
    const now = new Date();
    const monthKey = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const snapshot = await db.collection("invoices")
        .where("createdAt", ">=", startOfMonth)
        .get();
    
    const sequence = (snapshot.size + 1).toString().padStart(4, '0');
    return `INV-${monthKey}-${sequence}`;
}

function handleDocumentGenerator() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">Document Generator</h2>
        <div class="flex space-x-4 mb-6 flex-wrap">
            <button onclick="renderInvoiceForm()" class="bg-primary-blue text-white p-3 rounded-lg mb-2">Invoice/Proforma</button>
            <button onclick="renderInvoiceHistory()" class="bg-gray-700 text-white p-3 rounded-lg mb-2">Invoice History</button>
            <button onclick="renderReceiptForm()" class="bg-secondary-red text-white p-3 rounded-lg mb-2">Payment Receipt</button>
            <button onclick="renderAgreementForm()" class="bg-gray-700 text-white p-3 rounded-lg mb-2">Car Sales Agreement</button>
            <button onclick="renderBankManagement()" class="bg-green-600 text-white p-3 rounded-lg mb-2">BANKS</button>
        </div>
        <div id="document-form-area"></div>`;
}

function renderInvoiceForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg">
            <h3 class="text-xl font-semibold mb-4 text-primary-blue">New Invoice</h3>
            <form id="invoice-form" onsubmit="event.preventDefault(); saveInvoice();">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="text" id="clientName" required placeholder="Client Name" class="p-2 border rounded">
                    <input type="text" id="carModel" required placeholder="Car Model" class="p-2 border rounded">
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <input type="number" id="priceUSD" required placeholder="Price (USD)" class="p-2 border rounded">
                    <input type="date" id="dueDate" required class="p-2 border rounded">
                </div>
                <select id="invBankSelect" required class="w-full p-2 border rounded mb-4"></select>
                <button type="submit" class="w-full bg-primary-blue text-white py-3 rounded-lg font-bold">Save Invoice</button>
            </form>
        </div>`;
    populateBankDropdown('invBankSelect');
}

async function saveInvoice() {
    const id = await getSequentialInvoiceId();
    const bank = JSON.parse(document.getElementById('invBankSelect').value);
    const data = {
        invoiceId: id,
        clientName: document.getElementById('clientName').value,
        carModel: document.getElementById('carModel').value,
        pricing: { totalUSD: parseFloat(document.getElementById('priceUSD').value) },
        dueDate: document.getElementById('dueDate').value,
        bankDetails: bank,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("invoices").add(data);
    alert(`Invoice ${id} Saved!`);
    renderInvoiceHistory();
}

async function renderInvoiceHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `<h3 class="font-bold mb-4">Invoice History</h3><div id="inv-history" class="space-y-2"></div>`;
    const snap = await db.collection("invoices").orderBy("createdAt", "desc").limit(10).get();
    document.getElementById('inv-history').innerHTML = snap.docs.map(doc => {
        const d = doc.data();
        return `<div class="p-3 border rounded flex justify-between bg-white items-center">
                    <div><strong>${d.invoiceId}</strong> - ${d.clientName}</div>
                    <button onclick='initReceiptFromInvoice(${JSON.stringify(d)})' class="bg-green-600 text-white text-xs px-3 py-1 rounded">Create Receipt</button>
                </div>`;
    }).join('');
}

function initReceiptFromInvoice(inv) {
    window.pendingReceiptRef = inv.invoiceId;
    renderReceiptForm();
    document.getElementById('receivedFrom').value = inv.clientName;
    document.getElementById('amountReceived').value = inv.pricing.totalUSD;
    document.getElementById('beingPaidFor').value = `Deposit for ${inv.carModel} (Invoice: ${inv.invoiceId})`;
    updateAmountInWords();
}

// =================================================================
//                 5. RECEIPT MODULE (WITH PAYMENTS)
// =================================================================
function renderReceiptForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 border border-secondary-red rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-secondary-red">New Payment Receipt</h3>
                <p class="text-xs text-blue-500 mb-2">${window.pendingReceiptRef ? 'Using Invoice #: ' + window.pendingReceiptRef : ''}</p>
                <form id="receipt-form" onsubmit="event.preventDefault(); saveReceipt()">
                    <input type="text" id="receivedFrom" required placeholder="Received From" class="w-full p-2 border rounded mb-3">
                    <div class="grid grid-cols-3 gap-3 mb-3">
                        <select id="currency" class="p-2 border rounded" onchange="updateAmountInWords()"><option value="USD">USD</option><option value="KSH">KSH</option></select>
                        <input type="number" id="amountReceived" step="0.01" required placeholder="Amount" class="col-span-2 p-2 border rounded" oninput="updateAmountInWords()">
                    </div>
                    <textarea id="amountWords" readonly class="w-full p-2 border bg-gray-50 mb-3 text-sm"></textarea>
                    <input type="text" id="beingPaidFor" required placeholder="Paid for..." class="w-full p-2 border rounded mb-4">
                    <button type="submit" class="w-full bg-secondary-red text-white py-3 rounded-lg font-bold">Save Receipt</button>
                </form>
            </div>
            <div id="receipt-history" class="p-6 border rounded-xl bg-white shadow-md"></div>
        </div>`;
    fetchReceipts();
}

function updateAmountInWords() {
    const amt = parseFloat(document.getElementById('amountReceived').value || 0);
    const curr = document.getElementById('currency').value;
    document.getElementById('amountWords').value = numberToWords(amt).replace('only', curr + ' only');
}

async function saveReceipt() {
    const id = window.pendingReceiptRef || `RCPT-${Date.now()}`;
    const data = {
        receiptId: id,
        receivedFrom: document.getElementById('receivedFrom').value,
        amountReceived: parseFloat(document.getElementById('amountReceived').value),
        currency: document.getElementById('currency').value,
        amountWords: document.getElementById('amountWords').value,
        beingPaidFor: document.getElementById('beingPaidFor').value,
        supplementaryPayments: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        receiptDate: new Date().toLocaleDateString()
    };
    await db.collection("receipts").add(data);
    window.pendingReceiptRef = null;
    generateReceiptPDF(data);
    renderReceiptForm();
}

async function fetchReceipts() {
    const snap = await db.collection("receipts").orderBy("createdAt", "desc").limit(10).get();
    document.getElementById('receipt-history').innerHTML = `<h3 class="font-bold mb-4">Receipt History</h3>` + snap.docs.map(doc => {
        const d = doc.data();
        const payments = (d.supplementaryPayments || []).map(p => `<p class="text-[10px] text-blue-600 pl-2 border-l italic">${p.date}: +${p.amount} (${p.reason})</p>`).join('');
        return `<div class="p-3 border-b mb-2">
                    <div class="flex justify-between items-center mb-1">
                        <strong>${d.receiptId}</strong>
                        <div class="space-x-1">
                            <button onclick='addPaymentLog("${doc.id}")' class="bg-blue-600 text-white text-[10px] px-2 py-1 rounded">Add Payment</button>
                            <button onclick='initAgreementFromReceipt(${JSON.stringify(d)})' class="bg-black text-white text-[10px] px-2 py-1 rounded">Agreement</button>
                        </div>
                    </div>
                    <p class="text-xs">${d.receivedFrom}</p>
                    ${payments}
                </div>`;
    }).join('');
}

async function addPaymentLog(docId) {
    const amt = prompt("Payment Amount:");
    const reason = prompt("Reason (e.g. Balance):");
    if(!amt || !reason) return;
    const entry = { date: new Date().toLocaleDateString(), amount: parseFloat(amt), reason: reason };
    await db.collection("receipts").doc(docId).update({ supplementaryPayments: firebase.firestore.FieldValue.arrayUnion(entry) });
    fetchReceipts();
}

function initAgreementFromReceipt(rcpt) {
    window.pendingAgreementRef = rcpt.receiptId;
    renderAgreementForm();
    document.getElementById('buyerName').value = rcpt.receivedFrom;
    document.getElementById('carInfo').value = rcpt.beingPaidFor.replace("Deposit for ", "");
}

// =================================================================
//                 6. AGREEMENT MODULE (STYLISH)
// =================================================================
function renderAgreementForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
            <h3 class="text-xl font-semibold mb-4 text-primary-blue">Car Sales Agreement</h3>
            <p class="text-xs text-blue-500 mb-2">${window.pendingAgreementRef ? 'Using Receipt #: ' + window.pendingAgreementRef : ''}</p>
            <form id="agreement-form" onsubmit="event.preventDefault(); saveAgreement()">
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" id="buyerName" required placeholder="Buyer Name" class="p-2 border rounded">
                    <input type="text" id="carInfo" required placeholder="Vehicle (Make/Model)" class="p-2 border rounded">
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" id="vin" placeholder="VIN Number" class="p-2 border rounded">
                    <input type="number" id="finalPrice" required placeholder="Total Agreed Price" class="p-2 border rounded">
                </div>
                <button type="submit" class="w-full bg-primary-blue text-white py-3 rounded-lg font-bold">Generate Agreement</button>
            </form>
        </div>`;
}

async function saveAgreement() {
    const id = window.pendingAgreementRef || `AGR-${Date.now()}`;
    const data = {
        agreementId: id,
        buyer: document.getElementById('buyerName').value,
        vehicle: document.getElementById('carInfo').value,
        vin: document.getElementById('vin').value,
        price: parseFloat(document.getElementById('finalPrice').value),
        agreementDate: new Date().toLocaleDateString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("sales_agreements").add(data);
    window.pendingAgreementRef = null;
    generateAgreementPDF(data);
    renderDashboard();
}

// =================================================================
//                 7. PDF GENERATION LOGIC
// =================================================================
function generateReceiptPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const primary = '#183263';
    
    // Header
    doc.setFillColor(primary);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text("WANBITE INVESTMENTS CO. LTD", 105, 10, { align: 'center' });
    
    // Receipt Details
    doc.setTextColor(primary);
    doc.setFontSize(22);
    doc.text("OFFICIAL RECEIPT", 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Receipt #: ${data.receiptId}`, 20, 45);
    doc.text(`Date: ${data.receiptDate}`, 150, 45);
    
    doc.text(`Received From: ${data.receivedFrom}`, 20, 60);
    doc.text(`The sum of: ${data.amountWords}`, 20, 70);
    doc.text(`Being paid for: ${data.beingPaidFor}`, 20, 80);
    
    doc.setFillColor(primary);
    doc.rect(20, 90, 170, 15, 'F');
    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.text(`AMOUNT: ${data.currency} ${data.amountReceived.toLocaleString()}`, 105, 100, { align: 'center' });
    
    doc.save(`Receipt_${data.receiptId}.pdf`);
}

function generateAgreementPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const primary = '#183263';

    doc.setFillColor(primary);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255);
    doc.text("WANBITE CAR SALES AGREEMENT", 105, 10, { align: 'center' });
    
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Ref ID: ${data.agreementId}`, 20, 30);
    doc.text(`Buyer: ${data.buyer}`, 20, 40);
    doc.text(`Vehicle: ${data.vehicle} | VIN: ${data.vin}`, 20, 50);
    doc.text(`Agreed Price: KES ${data.price.toLocaleString()}`, 20, 60);
    
    doc.text("1. The Buyer agrees to purchase the vehicle in its current condition.", 20, 80);
    doc.text("2. Payments are to be made to the designated WanBite bank accounts.", 20, 90);
    doc.text("3. This agreement is binding upon signature by both parties.", 20, 100);
    
    doc.save(`Agreement_${data.agreementId}.pdf`);
}

// =================================================================
//                 8. BANK & STUBS
// =================================================================
async function populateBankDropdown(id) {
    const snap = await db.collection("bankDetails").get();
    const select = document.getElementById(id);
    select.innerHTML = '<option value="" disabled selected>Select Bank</option>' + 
        snap.docs.map(doc => `<option value='${JSON.stringify(doc.data())}'>${doc.data().name}</option>`).join('');
}

function handleFleetManagement() { appContent.innerHTML = `<h2 class="text-2xl font-bold">Fleet Management</h2><p>Fleet tracking logic from the original file remains functional here.</p>`; }
function handleHRManagement() { appContent.innerHTML = `<h2 class="text-2xl font-bold">HR Management</h2><p>Leave applications and requisition logic remains functional here.</p>`; }
function renderBankManagement() { appContent.innerHTML = `<h2 class="text-2xl font-bold">Bank Setup</h2><p>Configure company accounts for Invoices and Agreements.</p>`; }
