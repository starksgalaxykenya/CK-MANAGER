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

function renderAuthForm() {
    appContent.innerHTML = `
        <div class="max-w-md mx-auto my-16 p-8 bg-white rounded-xl shadow-2xl">
            <h2 class="text-3xl font-bold mb-8 text-center text-primary-blue">CDMS Login</h2>
            <form id="login-form" onsubmit="event.preventDefault(); handleLogin();">
                <div class="mb-4">
                    <label for="email" class="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                    <input type="email" id="email" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue">
                </div>
                <div class="mb-6">
                    <label for="password" class="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                    <input type="password" id="password" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue">
                </div>
                <button type="submit" class="w-full bg-primary-blue hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition duration-200">Sign In</button>
            </form>
        </div>`;
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try { await auth.signInWithEmailAndPassword(email, password); } 
    catch (error) { alert("Login Failed: " + error.message); }
}

function handleLogout() { auth.signOut(); }

// =================================================================
//                 3. DASHBOARD & UTILS
// =================================================================
function renderDashboard() {
    appContent.innerHTML = `
        <h2 class="text-4xl font-extrabold mb-8 text-primary-blue">CDMS Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${createDashboardCard('Document Generator', 'Invoices, Receipts, Agreements', 'bg-green-100 border-green-400', 'handleDocumentGenerator')}
            ${createDashboardCard('Fleet Management', 'Car Tracking, Clearing, ETA', 'bg-yellow-100 border-yellow-400', 'handleFleetManagement')}
            ${createDashboardCard('HR & Requisitions', 'Leave Applications, Requisition Forms', 'bg-red-100 border-red-400', 'handleHRManagement')}
        </div>`;
    
    mainNav.innerHTML = `
        <a href="#" onclick="renderDashboard()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Home</a>
        <a href="#" onclick="handleDocumentGenerator()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Documents</a>
        <a href="#" onclick="handleFleetManagement()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Fleet</a>
        <a href="#" onclick="handleHRManagement()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">HR Forms</a>`;
    mainNav.classList.remove('hidden');
}

function createDashboardCard(title, subtitle, colorClass, handler) {
    return `<div class="${colorClass} border-2 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition duration-300 transform" onclick="${handler}()">
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
//                 4. BANK MANAGEMENT
// =================================================================
function renderBankManagement() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-1 p-6 border border-green-300 rounded-xl bg-green-50 shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-green-700">Add New Bank Account</h3>
                <form id="add-bank-form" onsubmit="event.preventDefault(); addBankDetails()">
                    <input type="text" id="bankName" required placeholder="Bank Name" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="bankBranch" required placeholder="Branch" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="accountName" required value="WANBITE INVESTMENTS CO. LTD" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="accountNumber" required placeholder="Account Number" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="swiftCode" required placeholder="SWIFT Code" class="mt-2 block w-full p-2 border rounded-md">
                    <select id="bankCurrency" required class="mt-2 block w-full p-2 border rounded-md">
                        <option value="USD">USD</option>
                        <option value="KES">KES</option>
                    </select>
                    <button type="submit" class="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md">Save Bank</button>
                </form>
            </div>
            <div class="md:col-span-2 p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Saved Bank Accounts</h3>
                <div id="saved-banks-list" class="space-y-3"></div>
            </div>
        </div>`;
    fetchAndDisplayBankDetails();
}

async function addBankDetails() {
    const newBank = {
        name: document.getElementById('bankName').value,
        branch: document.getElementById('bankBranch').value,
        accountName: document.getElementById('accountName').value,
        accountNumber: document.getElementById('accountNumber').value,
        swiftCode: document.getElementById('swiftCode').value,
        currency: document.getElementById('bankCurrency').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("bankDetails").add(newBank);
    fetchAndDisplayBankDetails();
    document.getElementById('add-bank-form').reset();
}

async function fetchAndDisplayBankDetails() {
    const list = document.getElementById('saved-banks-list');
    const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
    list.innerHTML = snapshot.docs.map(doc => {
        const d = doc.data();
        return `<div class="p-4 border rounded flex justify-between items-center">
            <div><strong>${d.name}</strong> (${d.currency})<br><small>${d.accountNumber} | ${d.branch}</small></div>
            <button onclick="deleteBank('${doc.id}')" class="text-red-500 text-sm">Delete</button>
        </div>`;
    }).join('');
}

async function deleteBank(id) { if(confirm("Delete bank?")) { await db.collection("bankDetails").doc(id).delete(); fetchAndDisplayBankDetails(); } }

async function _getBankDetailsData() {
    const snapshot = await db.collection("bankDetails").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function populateBankDropdown(dropdownId) {
    const select = document.getElementById(dropdownId);
    if (!select) return;
    const banks = await _getBankDetailsData();
    select.innerHTML = '<option value="" disabled selected>Select Bank</option>' + 
        banks.map(b => `<option value='${JSON.stringify(b)}'>${b.name} (${b.currency})</option>`).join('');
}

// =================================================================
//                 5. DOCUMENT GENERATOR (INVOICE & RECEIPT)
// =================================================================
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
        <div id="document-form-area"><p class="text-gray-600">Select a document type.</p></div>`;
}

// --- Invoice Module ---
function renderInvoiceForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg">
            <h3 class="text-xl font-semibold mb-4 text-primary-blue">Create Sales Invoice/Proforma</h3>
            <form id="invoice-form" onsubmit="event.preventDefault(); saveInvoice(false);">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                    <div><label class="block text-sm">Type</label><select id="docType" class="w-full p-2 border rounded"><option value="Invoice">Invoice</option><option value="Proforma Invoice">Proforma Invoice</option></select></div>
                    <div><label class="block text-sm">Exchange Rate (USD-KES)</label><input type="number" id="exchangeRate" step="0.01" value="130.00" class="w-full p-2 border rounded"></div>
                    <div><label class="block text-sm">Due Date</label><input type="date" id="dueDate" required class="w-full p-2 border rounded"></div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4"><input type="text" id="clientName" required placeholder="Client Name" class="p-2 border rounded"><input type="text" id="clientPhone" required placeholder="Client Phone" class="p-2 border rounded"></div>
                <div class="grid grid-cols-3 gap-4 mb-4">
                    <input type="text" id="carMake" placeholder="Make" class="p-2 border rounded">
                    <input type="text" id="carModel" placeholder="Model" class="p-2 border rounded">
                    <input type="number" id="carYear" placeholder="Year" class="p-2 border rounded">
                    <input type="text" id="vinNumber" placeholder="VIN" class="p-2 border rounded col-span-2">
                    <input type="number" id="price" step="0.01" placeholder="Price (USD)" class="p-2 border rounded">
                </div>
                <div class="mb-4"><label class="block text-sm">Bank</label><select id="invBankSelect" required class="w-full p-2 border rounded"></select></div>
                <input type="text" id="buyerConfirm" placeholder="Accepted by (Name)" class="w-full p-2 border rounded mb-4">
                <button type="submit" class="w-full bg-primary-blue text-white py-3 rounded-lg">Save & Download PDF</button>
            </form>
        </div>`;
    populateBankDropdown('invBankSelect');
}

async function saveInvoice(onlySave) {
    const bank = JSON.parse(document.getElementById('invBankSelect').value);
    const data = {
        docType: document.getElementById('docType').value,
        clientName: document.getElementById('clientName').value,
        issueDate: new Date().toLocaleDateString(),
        dueDate: document.getElementById('dueDate').value,
        carDetails: { make: document.getElementById('carMake').value, model: document.getElementById('carModel').value, year: document.getElementById('carYear').value, vin: document.getElementById('vinNumber').value, priceUSD: parseFloat(document.getElementById('price').value), quantity: 1, goodsDescription: "Vehicle Purchase" },
        pricing: { totalUSD: parseFloat(document.getElementById('price').value), depositUSD: parseFloat(document.getElementById('price').value)*0.5, balanceUSD: parseFloat(document.getElementById('price').value)*0.5, depositKSH: (parseFloat(document.getElementById('price').value)*0.5 * parseFloat(document.getElementById('exchangeRate').value)).toFixed(2) },
        bankDetails: bank,
        exchangeRate: parseFloat(document.getElementById('exchangeRate').value),
        buyerNameConfirmation: document.getElementById('buyerConfirm').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        invoiceId: `INV-${Date.now()}`
    };
    const docRef = await db.collection("invoices").add(data);
    if(!onlySave) { data.firestoreId = docRef.id; generateInvoicePDF(data); }
    alert("Invoice Saved");
}

function generateInvoicePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFillColor('#183263'); doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255); doc.text("WanBite Investments", 105, 10, {align:'center'});
    doc.setTextColor(0); doc.text(data.docType, 105, 25, {align:'center'});
    doc.setFontSize(10);
    doc.text(`Invoice #: ${data.invoiceId}`, 20, 35);
    doc.text(`Client: ${data.clientName}`, 20, 45);
    doc.text(`Vehicle: ${data.carDetails.make} ${data.carDetails.model} (${data.carDetails.year})`, 20, 55);
    doc.text(`Total Price: USD ${data.pricing.totalUSD.toLocaleString()}`, 20, 65);
    doc.save(`${data.invoiceId}.pdf`);
}

async function renderInvoiceHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `<h3 class="font-bold mb-4">Invoice History</h3><div id="inv-history" class="space-y-2"></div>`;
    const snap = await db.collection("invoices").orderBy("createdAt", "desc").limit(10).get();
    document.getElementById('inv-history').innerHTML = snap.docs.map(doc => {
        const d = doc.data();
        return `<div class="p-3 border flex justify-between"><span>${d.invoiceId} - ${d.clientName}</span><button onclick='generateInvoicePDF(${JSON.stringify(d)})' class="text-blue-500">PDF</button></div>`;
    }).join('');
}

// --- Receipt Module ---
function renderReceiptForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 border border-secondary-red rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-secondary-red">New Payment Receipt</h3>
                <form id="receipt-form" onsubmit="event.preventDefault(); saveReceipt()">
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <select id="receiptType" class="p-2 border rounded"><option value="Auction Imports">Auction Imports</option><option value="Local Sales">Local Sales</option></select>
                        <input type="text" id="receivedFrom" required placeholder="Received From" class="p-2 border rounded">
                    </div>
                    <div class="grid grid-cols-3 gap-3 mb-4">
                        <select id="currency" class="p-2 border rounded" onchange="updateAmountInWords()"><option value="KSH">KSH</option><option value="USD">USD</option></select>
                        <input type="number" id="amountReceived" step="0.01" required placeholder="Amount" class="col-span-2 p-2 border rounded" oninput="updateAmountInWords()">
                    </div>
                    <textarea id="amountWords" readonly class="w-full p-2 border bg-gray-50 mb-4 text-sm"></textarea>
                    <input type="text" id="beingPaidFor" placeholder="Being paid for..." class="w-full p-2 border rounded mb-4">
                    <button type="submit" class="w-full bg-secondary-red text-white py-3 rounded-lg font-bold">Generate Receipt</button>
                </form>
            </div>
            <div id="recent-receipts" class="p-6 border rounded-xl bg-white shadow-md"></div>
        </div>`;
    fetchReceipts();
}

function updateAmountInWords() {
    const amt = parseFloat(document.getElementById('amountReceived').value || 0);
    const curr = document.getElementById('currency').value;
    let words = numberToWords(amt);
    document.getElementById('amountWords').value = words.replace('only', (curr === 'USD' ? 'US Dollars only' : 'Kenya Shillings only'));
}

async function saveReceipt() {
    const data = {
        receiptId: `RCPT-${Date.now()}`,
        receivedFrom: document.getElementById('receivedFrom').value,
        amountReceived: parseFloat(document.getElementById('amountReceived').value),
        currency: document.getElementById('currency').value,
        amountWords: document.getElementById('amountWords').value,
        beingPaidFor: document.getElementById('beingPaidFor').value,
        receiptDate: new Date().toLocaleDateString(),
        paymentDetails: { bankUsed: "WanBite Account" },
        balanceDetails: { balanceRemaining: 0 },
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("receipts").add(data);
    generateReceiptPDF(data);
    renderReceiptForm();
}

async function fetchReceipts() {
    const snap = await db.collection("receipts").orderBy("createdAt", "desc").limit(10).get();
    document.getElementById('recent-receipts').innerHTML = snap.docs.map(doc => {
        const d = doc.data();
        return `<div class="p-2 border-b flex justify-between text-sm"><span>${d.receivedFrom} (${d.currency} ${d.amountReceived})</span><button onclick='generateReceiptPDF(${JSON.stringify(d)})' class="text-red-500">PDF</button></div>`;
    }).join('');
}

function generateReceiptPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFillColor('#183263'); doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255); doc.text("OFFICIAL RECEIPT", 105, 10, {align:'center'});
    doc.setTextColor(0); doc.setFontSize(10);
    doc.text(`Receipt #: ${data.receiptId}`, 20, 30);
    doc.text(`Received From: ${data.receivedFrom}`, 20, 40);
    doc.text(`The Sum of: ${data.amountWords}`, 20, 50);
    doc.text(`Being paid for: ${data.beingPaidFor}`, 20, 60);
    doc.setFontSize(14); doc.text(`Amount: ${data.currency} ${data.amountReceived.toLocaleString()}`, 105, 80, {align:'center'});
    doc.save(`${data.receiptId}.pdf`);
}

// =================================================================
//                 6. CAR SALES AGREEMENT (REVISED - NO ADD PAYMENT)
// =================================================================
function renderAgreementForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">New Car Sales Agreement</h3>
                <form id="agreement-form" onsubmit="event.preventDefault(); saveAgreement()">
                    <input type="date" id="agreementDateInput" required value="${new Date().toISOString().slice(0, 10)}" class="mb-4 block w-full p-2 border rounded-md">
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <input type="text" id="buyerName" required placeholder="Buyer Name" class="p-2 border rounded-md">
                        <input type="text" id="buyerPhone" required placeholder="Buyer Phone" class="p-2 border rounded-md">
                        <input type="text" id="buyerAddress" required placeholder="Buyer Address" class="p-2 border rounded-md col-span-2">
                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <input type="text" id="carMakeModel" required placeholder="Vehicle Make/Model" class="p-2 border rounded-md col-span-2">
                        <input type="text" id="carVIN" required placeholder="VIN/Chassis" class="p-2 border rounded-md">
                        <input type="number" id="carYear" required placeholder="Year" class="p-2 border rounded-md">
                    </div>
                    <div class="p-4 bg-yellow-50 rounded mb-4">
                        <select id="currencySelect" class="w-full p-2 border mb-2" onchange="calculatePaymentTotal()"><option value="KES">KES</option><option value="USD">USD</option></select>
                        <select id="agreementBankDetailsSelect" required class="w-full p-2 border mb-4"></select>
                        <div id="payment-schedule-rows" class="space-y-2">
                            <div class="grid grid-cols-4 gap-2 payment-row">
                                <input type="text" required placeholder="Deposit" value="Deposit" class="p-2 border rounded-md col-span-2 text-sm">
                                <input type="number" step="0.01" required placeholder="Amount" oninput="calculatePaymentTotal()" class="payment-amount p-2 border rounded-md text-sm">
                                <input type="date" required class="payment-date p-2 border rounded-md text-sm">
                            </div>
                        </div>
                        <button type="button" onclick="addPaymentRow()" class="mt-2 text-primary-blue text-sm font-bold">+ Add Payment Line</button>
                        <div class="mt-4 font-bold text-secondary-red">Total: <span id="total-amount">0.00 KES</span></div>
                    </div>
                    <button type="submit" class="w-full bg-primary-blue text-white py-3 rounded-lg font-bold">Generate Agreement</button>
                </form>
            </div>
            <div id="recent-agreements" class="p-6 border rounded-xl bg-white shadow-md"></div>
        </div>`;
    populateBankDropdown('agreementBankDetailsSelect');
    fetchAgreements();
}

function addPaymentRow() {
    const div = document.createElement('div');
    div.className = 'grid grid-cols-4 gap-2 payment-row mt-2';
    div.innerHTML = `
        <input type="text" required placeholder="Balance" class="p-2 border rounded-md col-span-2 text-sm">
        <input type="number" step="0.01" required placeholder="Amount" oninput="calculatePaymentTotal()" class="payment-amount p-2 border rounded-md text-sm">
        <input type="date" required class="payment-date p-2 border rounded-md text-sm">
        <button type="button" onclick="this.parentElement.remove(); calculatePaymentTotal();" class="text-red-500">X</button>`;
    document.getElementById('payment-schedule-rows').appendChild(div);
}

function calculatePaymentTotal() {
    let t = 0; const c = document.getElementById('currencySelect').value;
    document.querySelectorAll('.payment-amount').forEach(i => t += parseFloat(i.value || 0));
    document.getElementById('total-amount').textContent = `${t.toLocaleString()} ${c}`;
}

async function saveAgreement() {
    const schedule = [];
    document.querySelectorAll('.payment-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        schedule.push({ description: inputs[0].value, amount: parseFloat(inputs[1].value), date: inputs[2].value });
    });
    const bank = JSON.parse(document.getElementById('agreementBankDetailsSelect').value);
    const data = {
        agreementDate: document.getElementById('agreementDateInput').value,
        buyer: { name: document.getElementById('buyerName').value, phone: document.getElementById('buyerPhone').value, address: document.getElementById('buyerAddress').value },
        vehicle: { makeModel: document.getElementById('carMakeModel').value, vin: document.getElementById('carVIN').value, year: document.getElementById('carYear').value, color: "As Inspected" },
        salesTerms: { price: schedule.reduce((a,b)=>a+b.amount,0), currency: document.getElementById('currencySelect').value, paymentSchedule: schedule, bankId: bank.id },
        signatures: { sellerWitness: "WanBite Admin", buyerWitness: "Customer Witness" },
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("sales_agreements").add(data);
    data.bankDetails = bank;
    generateAgreementPDF(data);
    renderAgreementForm();
}

async function fetchAgreements() {
    const snap = await db.collection("sales_agreements").orderBy("createdAt", "desc").limit(10).get();
    document.getElementById('recent-agreements').innerHTML = snap.docs.map(doc => {
        const d = doc.data();
        return `<div class="p-3 border-b flex justify-between items-center bg-gray-50 mb-2 rounded">
            <span class="text-sm font-semibold">${d.buyer.name} - ${d.vehicle.makeModel}</span>
            <button onclick='reDownloadAgreement(${JSON.stringify(d)})' class="bg-primary-blue text-white text-xs px-3 py-1 rounded">Download PDF</button>
        </div>`;
    }).join('');
}

async function reDownloadAgreement(data) {
    const banks = await _getBankDetailsData();
    data.bankDetails = banks.find(b => b.id === data.salesTerms.bankId) || {};
    generateAgreementPDF(data);
}

function generateAgreementPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFillColor('#183263'); doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255); doc.text("CAR SALES AGREEMENT", 105, 10, {align:'center'});
    doc.setTextColor(0); doc.setFontSize(10);
    doc.text(`Date: ${data.agreementDate}`, 20, 30);
    doc.text(`Buyer: ${data.buyer.name}`, 20, 40);
    doc.text(`Vehicle: ${data.vehicle.makeModel} (${data.vehicle.year})`, 20, 50);
    let y = 70; doc.text("Payment Schedule:", 20, 60);
    data.salesTerms.paymentSchedule.forEach(p => {
        doc.text(`${p.description}: ${data.salesTerms.currency} ${p.amount.toLocaleString()} (Due: ${p.date})`, 30, y);
        y += 8;
    });
    const b = data.bankDetails || {};
    doc.text(`Bank: ${b.name} | Acc: ${b.accountNumber}`, 20, y + 10);
    doc.save(`Agreement_${data.buyer.name}.pdf`);
}

// =================================================================
//                 7. FLEET MANAGEMENT
// =================================================================
const FLEET_STATUSES = [
    { id: "ship_to_mombasa", name: "On Ship to Mombasa", color: "bg-blue-100", border: "border-blue-400", button: "bg-blue-600" },
    { id: "clearing_mombasa", name: "In Mombasa being cleared", color: "bg-yellow-100", border: "border-yellow-400", button: "bg-yellow-600" },
    { id: "taken_to_carrier", name: "In Mombasa taken to the carrier", color: "bg-orange-100", border: "border-orange-400", button: "bg-orange-600" },
    { id: "transit_to_nairobi", name: "In transit from Mombasa to Nairobi", color: "bg-purple-100", border: "border-purple-400", button: "bg-purple-600" },
    { id: "in_nairobi", name: "In Nairobi and picked from carrier", color: "bg-green-100", border: "border-green-400", button: "bg-green-600" },
    { id: "delivered_client", name: "Delivered to the client", color: "bg-teal-100", border: "border-teal-400", button: "bg-teal-600" }
];

function handleFleetManagement() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">Fleet Management Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2" id="fleet-columns">
            ${FLEET_STATUSES.map(s => `
                <div class="p-2 border rounded bg-gray-50">
                    <h4 class="text-xs font-bold mb-2 uppercase">${s.name}</h4>
                    <div id="fleet-column-${s.id}" class="space-y-2"></div>
                </div>`).join('')}
        </div>
        <button onclick="showAddCarModal()" class="mt-6 bg-green-600 text-white px-4 py-2 rounded">Add Car to Tracking</button>`;
    renderFleetDashboard();
}

function renderFleetDashboard() {
    db.collection("cars").onSnapshot(snap => {
        FLEET_STATUSES.forEach(s => document.getElementById(`fleet-column-${s.id}`).innerHTML = '');
        snap.forEach(doc => {
            const car = doc.data();
            const statusObj = FLEET_STATUSES.find(s => s.name === car.currentStatus);
            if(statusObj) {
                document.getElementById(`fleet-column-${statusObj.id}`).innerHTML += `
                    <div class="p-2 bg-white border rounded shadow-sm text-xs">
                        <strong>${car.makeModel}</strong><br>
                        ETA: ${car.eta}<br>
                        <button onclick="showUpdateStatusModal('${doc.id}', '${car.makeModel}', '${car.currentStatus}')" class="text-blue-500 mt-1">Update</button>
                    </div>`;
            }
        });
    });
}

function showAddCarModal() {
    const modalHtml = `
        <div id="fleet-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg w-96">
                <h3 class="font-bold mb-4">Add Fleet Car</h3>
                <input type="text" id="fleetMake" placeholder="Make/Model" class="w-full p-2 border mb-2">
                <input type="date" id="fleetEta" class="w-full p-2 border mb-2">
                <input type="text" id="fleetSales" placeholder="Sales Person" class="w-full p-2 border mb-4">
                <button onclick="addFleetCar()" class="bg-green-600 text-white w-full py-2 rounded">Save</button>
                <button onclick="document.getElementById('fleet-modal').remove()" class="text-gray-500 w-full mt-2">Cancel</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function addFleetCar() {
    const data = {
        makeModel: document.getElementById('fleetMake').value,
        eta: document.getElementById('fleetEta').value,
        salesPerson: document.getElementById('fleetSales').value,
        currentStatus: FLEET_STATUSES[0].name,
        statusHistory: [{ status: FLEET_STATUSES[0].name, date: new Date(), comment: "Added to fleet" }],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("cars").add(data);
    document.getElementById('fleet-modal').remove();
}

function showUpdateStatusModal(id, model, current) {
    const options = FLEET_STATUSES.map(s => `<option value="${s.name}" ${s.name === current ? 'selected' : ''}>${s.name}</option>`).join('');
    const modalHtml = `
        <div id="fleet-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg w-96">
                <h3 class="font-bold mb-4">Update: ${model}</h3>
                <select id="newFleetStatus" class="w-full p-2 border mb-4">${options}</select>
                <button onclick="updateFleetStatus('${id}')" class="bg-blue-600 text-white w-full py-2 rounded">Update Status</button>
                <button onclick="document.getElementById('fleet-modal').remove()" class="text-gray-500 w-full mt-2">Cancel</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function updateFleetStatus(id) {
    const newStatus = document.getElementById('newFleetStatus').value;
    await db.collection("cars").doc(id).update({ currentStatus: newStatus });
    document.getElementById('fleet-modal').remove();
}

// --- HR Module ---
function handleHRManagement() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">HR & Requisitions</h2>
        <div class="p-6 bg-red-50 border border-red-200 rounded">
            <p>HR Module for Leave Applications and Requisitions.</p>
        </div>`;
}
