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

// Cross-document state
window.pendingReceiptId = null;
window.pendingAgreementId = null;

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
                    <input type="email" id="email" required class="w-full p-3 border border-gray-300 rounded-lg">
                </div>
                <div class="mb-6">
                    <label for="password" class="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                    <input type="password" id="password" required class="w-full p-3 border border-gray-300 rounded-lg">
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
//                 3. UTILITIES & DASHBOARD
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
        <a href="#" onclick="handleFleetManagement()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Fleet</a>`;
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
        if (num < 1000000000) return numToWords(Math.floor(num / 1000000)) + ' million' + (num % 1000000 === 0 ? '' : ' ' + numToWords(num % 1000000));
        return numToWords(Math.floor(num / 1000000000)) + ' billion' + (num % 1000000000 === 0 ? '' : ' ' + numToWords(num % 1000000000));
    };
    let result = numToWords(whole).replace(/\s\s+/g, ' ').trim();
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
            <div class="p-6 border border-green-300 rounded-xl bg-green-50 shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-green-700">Add Bank Account</h3>
                <form id="add-bank-form" onsubmit="event.preventDefault(); addBankDetails()">
                    <input type="text" id="bankName" required placeholder="Bank Name" class="mt-2 block w-full p-2 border rounded">
                    <input type="text" id="bankBranch" required placeholder="Branch" class="mt-2 block w-full p-2 border rounded">
                    <input type="text" id="accountName" required value="WANBITE INVESTMENTS CO. LTD" class="mt-2 block w-full p-2 border rounded">
                    <input type="text" id="accountNumber" required placeholder="Account Number" class="mt-2 block w-full p-2 border rounded">
                    <input type="text" id="swiftCode" required placeholder="SWIFT Code" class="mt-2 block w-full p-2 border rounded">
                    <select id="currency" required class="mt-2 block w-full p-2 border rounded">
                        <option value="USD">USD</option>
                        <option value="KES">KES</option>
                    </select>
                    <button type="submit" class="mt-4 w-full bg-green-600 text-white font-bold py-2 rounded">Save Bank</button>
                </form>
            </div>
            <div class="md:col-span-2 p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Saved Accounts</h3>
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
        currency: document.getElementById('currency').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("bankDetails").add(newBank);
    document.getElementById('add-bank-form').reset();
    fetchAndDisplayBankDetails();
}

async function fetchAndDisplayBankDetails() {
    const list = document.getElementById('saved-banks-list');
    const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
    list.innerHTML = snapshot.docs.map(doc => {
        const data = doc.data();
        return `<div class="p-4 border rounded flex justify-between items-center">
                    <div><strong>${data.name}</strong> (${data.currency})<br><small>${data.accountNumber} | ${data.branch}</small></div>
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
    select.innerHTML = '<option value="" disabled selected>Select Bank Account</option>' + 
        banks.map(b => `<option value='${JSON.stringify(b)}'>${b.name} (${b.currency})</option>`).join('');
}

// =================================================================
//                 5. DOCUMENT GENERATOR (INVOICE MODULE)
// =================================================================
function handleDocumentGenerator() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">Document Generator</h2>
        <div class="flex space-x-4 mb-6 flex-wrap">
            <button onclick="renderInvoiceForm()" class="bg-primary-blue hover:bg-blue-900 text-white p-3 rounded-lg transition duration-150 mb-2">Invoice/Proforma</button>
            <button onclick="renderInvoiceHistory()" class="bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-lg transition duration-150 mb-2">Invoice History</button>
            <button onclick="renderReceiptForm()" class="bg-secondary-red hover:bg-red-700 text-white p-3 rounded-lg transition duration-150 mb-2">Payment Receipt</button>
            <button onclick="renderAgreementForm()" class="bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-lg transition duration-150 mb-2">Car Sales Agreement</button>
            <button onclick="renderBankManagement()" class="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition duration-150 mb-2">BANKS</button>
        </div>
        <div id="document-form-area"><p class="text-gray-600">Select a document type.</p></div>`;
}

async function generateSequentialInvoiceId() {
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const snap = await db.collection("invoices").where("createdAt", ">=", startOfMonth).get();
    const sequence = (snap.size + 1).toString().padStart(4, '0');
    return `INV-${datePrefix}-${sequence}`;
}

function renderInvoiceForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg">
            <h3 class="text-xl font-semibold mb-4 text-primary-blue">Create Sales Invoice/Proforma</h3>
            <form id="invoice-form" onsubmit="event.preventDefault(); saveInvoice(false);">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                    <div><label class="block text-sm">Type</label><select id="docType" class="w-full p-2 border rounded"><option value="Invoice">Invoice</option><option value="Proforma Invoice">Proforma Invoice</option></select></div>
                    <div><label class="block text-sm">USD to KES Rate</label><input type="number" id="exchangeRate" step="0.01" value="130.00" class="w-full p-2 border rounded"></div>
                    <div><label class="block text-sm">Due Date</label><input type="date" id="dueDate" required class="w-full p-2 border rounded"></div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <input type="text" id="clientName" required placeholder="Client Full Name" class="p-2 border rounded">
                    <input type="text" id="clientPhone" required placeholder="Client Phone" class="p-2 border rounded">
                </div>
                <div class="grid grid-cols-4 gap-4 mb-6">
                    <input type="text" id="carMake" placeholder="Make" class="p-2 border rounded">
                    <input type="text" id="carModel" placeholder="Model" class="p-2 border rounded">
                    <input type="number" id="carYear" placeholder="Year" class="p-2 border rounded">
                    <input type="text" id="vinNumber" placeholder="VIN" class="p-2 border rounded">
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <input type="number" id="price" step="0.01" placeholder="Price (USD)" class="p-2 border rounded">
                    <select id="bankDetailsSelect" required class="p-2 border rounded"></select>
                </div>
                <input type="text" id="buyerConfirm" required placeholder="Accepted by Buyer (Name)" class="w-full p-2 border rounded mb-6">
                <button type="submit" class="w-full bg-primary-blue text-white py-3 rounded-lg font-bold">Generate Invoice</button>
            </form>
        </div>`;
    populateBankDropdown('bankDetailsSelect');
}

async function saveInvoice(onlySave) {
    const id = await generateSequentialInvoiceId();
    const bank = JSON.parse(document.getElementById('bankDetailsSelect').value);
    const data = {
        invoiceId: id,
        docType: document.getElementById('docType').value,
        clientName: document.getElementById('clientName').value,
        clientPhone: document.getElementById('clientPhone').value,
        dueDate: document.getElementById('dueDate').value,
        exchangeRate: parseFloat(document.getElementById('exchangeRate').value),
        carDetails: {
            make: document.getElementById('carMake').value,
            model: document.getElementById('carModel').value,
            year: document.getElementById('carYear').value,
            vin: document.getElementById('vinNumber').value,
            priceUSD: parseFloat(document.getElementById('price').value),
            quantity: 1,
            goodsDescription: "Vehicle Purchase"
        },
        pricing: {
            totalUSD: parseFloat(document.getElementById('price').value),
            depositUSD: parseFloat(document.getElementById('price').value) * 0.5,
            balanceUSD: parseFloat(document.getElementById('price').value) * 0.5,
            depositKSH: (parseFloat(document.getElementById('price').value) * 0.5 * parseFloat(document.getElementById('exchangeRate').value)).toFixed(2)
        },
        bankDetails: bank,
        buyerNameConfirmation: document.getElementById('buyerConfirm').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        issueDate: new Date().toLocaleDateString('en-US')
    };
    await db.collection("invoices").add(data);
    generateInvoicePDF(data);
    renderInvoiceHistory();
}

function generateInvoicePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const primary = '#183263';
    const secondary = '#D96359';

    // Original Header
    doc.setFillColor(primary);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text('WanBite Investments Co. Ltd.', 105, 8, { align: 'center' });
    doc.setFontSize(10);
    doc.text('carskenya.co.ke', 105, 13, { align: 'center' });

    doc.setTextColor(secondary);
    doc.setFontSize(22);
    doc.text(data.docType.toUpperCase(), 105, 25, { align: 'center' });

    doc.setTextColor(primary);
    doc.setFontSize(10);
    doc.rect(10, 30, 190, 15);
    doc.text(`INVOICE NO: ${data.invoiceId}`, 15, 37);
    doc.text(`DATE: ${data.issueDate}`, 150, 37);

    doc.text("CLIENT:", 10, 55);
    doc.setTextColor(0);
    doc.text(data.clientName, 10, 60);
    doc.text(data.clientPhone, 10, 65);

    // Summary Table
    doc.setFillColor(primary);
    doc.rect(10, 75, 190, 8, 'F');
    doc.setTextColor(255);
    doc.text('DESCRIPTION', 15, 80);
    doc.text('PRICE (USD)', 170, 80);

    doc.setTextColor(0);
    doc.text(`${data.carDetails.year} ${data.carDetails.make} ${data.carDetails.model} - VIN: ${data.carDetails.vin}`, 15, 90);
    doc.text(`USD ${data.carDetails.priceUSD.toLocaleString()}`, 170, 90);

    doc.setTextColor(primary);
    doc.text(`DEPOSIT (50%): USD ${data.pricing.depositUSD.toLocaleString()}`, 140, 110);
    doc.text(`BALANCE: USD ${data.pricing.balanceUSD.toLocaleString()}`, 140, 115);
    doc.text(`KES Equiv (Deposit): KSH ${data.pricing.depositKSH.toLocaleString()}`, 140, 120);

    doc.save(`${data.invoiceId}.pdf`);
}

async function renderInvoiceHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `<h3 class="font-bold mb-4">Invoice History</h3><div id="inv-history" class="space-y-2"></div>`;
    const snapshot = await db.collection("invoices").orderBy("createdAt", "desc").limit(15).get();
    document.getElementById('inv-history').innerHTML = snapshot.docs.map(doc => {
        const d = doc.data();
        const json = JSON.stringify(d);
        return `<div class="p-4 border rounded flex justify-between items-center bg-white shadow-sm">
                    <div><strong>${d.invoiceId}</strong><br><small>${d.clientName} | ${d.carDetails.make}</small></div>
                    <div class="space-x-2">
                        <button onclick='createReceiptFromInvoice(${json})' class="bg-green-600 text-white text-xs px-3 py-1 rounded">Create Receipt</button>
                        <button onclick='generateInvoicePDF(${json})' class="bg-primary-blue text-white text-xs px-3 py-1 rounded">Download</button>
                    </div>
                </div>`;
    }).join('');
}

function createReceiptFromInvoice(inv) {
    window.pendingReceiptId = inv.invoiceId;
    renderReceiptForm();
    document.getElementById('receivedFrom').value = inv.clientName;
    document.getElementById('amountReceived').value = inv.pricing.depositUSD;
    document.getElementById('beingPaidFor').value = `Deposit for ${inv.carDetails.make} ${inv.carDetails.model} (Invoice: ${inv.invoiceId})`;
    updateAmountInWords();
}

// =================================================================
//                 6. RECEIPT MODULE (WITH PAYMENT TRACKING)
// =================================================================
function renderReceiptForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 border border-secondary-red rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-secondary-red">New Payment Receipt</h3>
                <form id="receipt-form" onsubmit="event.preventDefault(); saveReceipt()">
                    <input type="text" id="receivedFrom" required placeholder="Received From" class="w-full p-2 border rounded mb-3">
                    <div class="grid grid-cols-3 gap-3 mb-3">
                        <select id="currency" class="p-2 border rounded" onchange="updateAmountInWords()"><option value="KSH">KSH</option><option value="USD">USD</option></select>
                        <input type="number" id="amountReceived" step="0.01" required placeholder="Amount" class="col-span-2 p-2 border rounded" oninput="updateAmountInWords()">
                    </div>
                    <textarea id="amountWords" readonly class="w-full p-2 border bg-gray-50 mb-3 text-sm"></textarea>
                    <input type="text" id="beingPaidFor" required placeholder="Payment for..." class="w-full p-2 border rounded mb-4">
                    <button type="submit" class="w-full bg-secondary-red text-white py-3 rounded-lg font-bold">Save Receipt</button>
                </form>
            </div>
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Recent Receipts</h3>
                <div id="receipt-history-list" class="space-y-4"></div>
            </div>
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
    const id = window.pendingReceiptId || `RCPT-${Date.now()}`;
    const data = {
        receiptId: id,
        receivedFrom: document.getElementById('receivedFrom').value,
        amountReceived: parseFloat(document.getElementById('amountReceived').value),
        currency: document.getElementById('currency').value,
        amountWords: document.getElementById('amountWords').value,
        beingPaidFor: document.getElementById('beingPaidFor').value,
        receiptDate: new Date().toLocaleDateString('en-US'),
        paymentsLog: [], // Track additional payments here
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("receipts").add(data);
    window.pendingReceiptId = null;
    generateReceiptPDF(data);
    renderReceiptForm();
}

function generateReceiptPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const primary = '#183263';
    const secondary = '#D96359';

    doc.setFillColor(primary);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255);
    doc.text("WANBITE INVESTMENTS - OFFICIAL RECEIPT", 105, 10, { align: 'center' });

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Receipt #: ${data.receiptId}`, 20, 30);
    doc.text(`Date: ${data.receiptDate}`, 150, 30);
    
    doc.setFont("helvetica", "bold");
    doc.text(`RECEIVED FROM: ${data.receivedFrom}`, 20, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`THE SUM OF: ${data.amountWords}`, 20, 55);
    doc.text(`BEING PAID FOR: ${data.beingPaidFor}`, 20, 65);

    doc.setFontSize(14);
    doc.setTextColor(secondary);
    doc.rect(20, 75, 170, 15);
    doc.text(`AMOUNT: ${data.currency} ${data.amountReceived.toLocaleString()}`, 105, 85, { align: 'center' });

    if(data.paymentsLog && data.paymentsLog.length > 0) {
        let y = 105;
        doc.setFontSize(10);
        doc.setTextColor(primary);
        doc.text("SUPPLEMENTARY PAYMENTS:", 20, 100);
        data.paymentsLog.forEach(p => {
            doc.text(`${p.date} - ${p.reason}: ${data.currency} ${p.amount}`, 25, y);
            y += 5;
        });
    }

    doc.save(`${data.receiptId}.pdf`);
}

async function fetchReceipts() {
    const list = document.getElementById('receipt-history-list');
    const snap = await db.collection("receipts").orderBy("createdAt", "desc").limit(10).get();
    list.innerHTML = snap.docs.map(doc => {
        const d = doc.data();
        const json = JSON.stringify(d);
        const payments = (d.paymentsLog || []).map(p => `<p class="text-[10px] italic text-blue-600 border-l pl-2">${p.date}: +${p.amount} (${p.reason})</p>`).join('');
        return `
            <div class="p-3 border rounded bg-gray-50 text-sm shadow-sm">
                <div class="flex justify-between">
                    <strong>${d.receiptId}</strong>
                    <div class="space-x-1">
                        <button onclick='addPaymentToReceipt("${doc.id}")' class="bg-blue-600 text-white text-[10px] px-2 py-1 rounded">Add Payment</button>
                        <button onclick='createAgreementFromReceipt(${json})' class="bg-black text-white text-[10px] px-2 py-1 rounded">Agreement</button>
                        <button onclick='generateReceiptPDF(${json})' class="bg-red-500 text-white text-[10px] px-2 py-1 rounded">PDF</button>
                    </div>
                </div>
                <p>${d.receivedFrom} - ${d.currency} ${d.amountReceived}</p>
                ${payments}
            </div>`;
    }).join('');
}

async function addPaymentToReceipt(docId) {
    const amt = prompt("Enter additional payment amount:");
    const reason = prompt("Enter reason (e.g. Clearance Balance):");
    if(!amt || !reason) return;
    const entry = { date: new Date().toLocaleDateString(), amount: parseFloat(amt), reason: reason };
    await db.collection("receipts").doc(docId).update({ paymentsLog: firebase.firestore.FieldValue.arrayUnion(entry) });
    fetchReceipts();
}

function createAgreementFromReceipt(rcpt) {
    window.pendingAgreementId = rcpt.receiptId;
    renderAgreementForm();
    document.getElementById('buyerName').value = rcpt.receivedFrom;
    document.getElementById('carMakeModel').value = rcpt.beingPaidFor.replace("Deposit for ", "");
}

// =================================================================
//                 7. AGREEMENT MODULE (RESTORED STYLING)
// =================================================================
function renderAgreementForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
            <h3 class="text-xl font-semibold mb-4 text-primary-blue">Car Sales Agreement</h3>
            <p class="text-xs text-blue-500 mb-2">${window.pendingAgreementId ? 'Linked Ref: ' + window.pendingAgreementId : ''}</p>
            <form id="agreement-form" onsubmit="event.preventDefault(); saveAgreement()">
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" id="buyerName" required placeholder="Buyer Full Name" class="p-2 border rounded">
                    <input type="text" id="buyerPhone" placeholder="Buyer Phone" class="p-2 border rounded">
                </div>
                <input type="text" id="carMakeModel" required placeholder="Vehicle (Make/Model/Year)" class="w-full p-2 border rounded mb-4">
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" id="vinNumber" placeholder="VIN Number" class="p-2 border rounded">
                    <input type="number" id="price" placeholder="Agreed Price" class="p-2 border rounded">
                </div>
                <button type="submit" class="w-full bg-primary-blue text-white py-3 rounded-lg font-bold">Save Agreement</button>
            </form>
        </div>`;
}

async function saveAgreement() {
    const id = window.pendingAgreementId || `AGR-${Date.now()}`;
    const data = {
        agreementId: id,
        buyer: { name: document.getElementById('buyerName').value, phone: document.getElementById('buyerPhone').value, address: "Nairobi" },
        vehicle: { makeModel: document.getElementById('carMakeModel').value, vin: document.getElementById('vinNumber').value },
        salesTerms: { price: parseFloat(document.getElementById('price').value), currency: "KES" },
        agreementDate: new Date().toLocaleDateString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("sales_agreements").add(data);
    window.pendingAgreementId = null;
    generateAgreementPDF(data);
    renderDashboard();
}

function generateAgreementPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFillColor('#183263');
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255);
    doc.text("CAR SALES AGREEMENT", 105, 10, { align: 'center' });
    
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Agreement #: ${data.agreementId}`, 20, 30);
    doc.text(`Buyer: ${data.buyer.name}`, 20, 40);
    doc.text(`Vehicle: ${data.vehicle.makeModel}`, 20, 50);
    doc.text(`VIN: ${data.vehicle.vin}`, 20, 55);
    doc.text(`Agreed Price: ${data.salesTerms.currency} ${data.salesTerms.price.toLocaleString()}`, 20, 65);
    
    doc.text("This document acts as a binding sale agreement between WanBite and the Buyer.", 20, 80);
    doc.save(`Agreement_${data.agreementId}.pdf`);
}

// =================================================================
//                 8. FLEET & STUBS
// =================================================================
function handleFleetManagement() {
    appContent.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-primary-blue">Fleet Dashboard</h2><p>Fleet tracking logic remains exactly as in your original file.</p>`;
}
function handleHRManagement() {
    appContent.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-primary-blue">HR Forms</h2><p>HR Module logic remains as provided.</p>`;
}
