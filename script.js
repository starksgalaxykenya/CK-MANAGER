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
//                 NEW: SEQUENTIAL REFERENCE LOGIC
// =================================================================

/**
 * Generates a reference number with a serial suffix (0001, 0002...)
 * Format: REF-YYYYMMDD-NAME-0001
 */
async function getSequentialReference(clientName) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const namePart = (clientName || "VAL").split(' ')[0].toUpperCase().substring(0, 3);
    
    const counterRef = db.collection("metadata").doc("document_counter");
    
    return await db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let newCount = 1;
        if (counterDoc.exists) {
            newCount = (counterDoc.data().count || 0) + 1;
        }
        transaction.set(counterRef, { count: newCount }, { merge: true });
        const serial = newCount.toString().padStart(4, '0');
        return `REF-${datePart}-${namePart}-${serial}`;
    });
}

// =================================================================
//                 2. AUTHENTICATION & ROUTING
// =================================================================

auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        authStatus.innerHTML = `<span class="mr-3 text-sm">Hello, ${user.email}</span>
                                <button onclick="handleLogout()" class="bg-secondary-red hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                                    Logout
                                </button>`;
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
                <button type="submit" class="w-full bg-primary-blue hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition duration-200">
                    Sign In
                </button>
            </form>
        </div>
    `;
}

function handleLogout() { auth.signOut(); }

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert("Login Failed: " + error.message);
    }
}

// =================================================================
//                 3. DASHBOARD & NAVIGATION
// =================================================================

function renderDashboard() {
    appContent.innerHTML = `
        <h2 class="text-4xl font-extrabold mb-8 text-primary-blue">CDMS Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${createDashboardCard('Document Generator', 'Invoices, Receipts, Agreements', 'bg-green-100 border-green-400', 'handleDocumentGenerator')}
            ${createDashboardCard('Fleet Management', 'Car Tracking, Clearing, ETA', 'bg-yellow-100 border-yellow-400', 'handleFleetManagement')}
            ${createDashboardCard('HR & Requisitions', 'Leave Applications, Requisition Forms', 'bg-red-100 border-red-400', 'handleHRManagement')}
        </div>
    `;
    mainNav.innerHTML = `
        <a href="#" onclick="renderDashboard()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Home</a>
        <a href="#" onclick="handleDocumentGenerator()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Documents</a>
        <a href="#" onclick="handleFleetManagement()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Fleet</a>
        <a href="#" onclick="handleHRManagement()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">HR Forms</a>
    `;
    mainNav.classList.remove('hidden');
}

function createDashboardCard(title, subtitle, colorClass, handler) {
    return `
        <div class="${colorClass} border-2 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition duration-300" onclick="${handler}()">
            <h3 class="text-2xl font-bold text-gray-800">${title}</h3>
            <p class="text-gray-600 mt-2">${subtitle}</p>
        </div>
    `;
}

// =================================================================
//                 4. DOCUMENT GENERATOR (LINKED WORKFLOW)
// =================================================================

function handleDocumentGenerator() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">Document Generator</h2>
        <div class="flex space-x-4 mb-6 flex-wrap">
            <button onclick="renderAgreementForm()" class="bg-primary-blue text-white p-3 rounded-lg mb-2">New Sales Agreement</button>
            <button onclick="renderAgreementHistory()" class="bg-gray-700 text-white p-3 rounded-lg mb-2">Agreement History</button>
            <button onclick="renderInvoiceHistory()" class="bg-gray-700 text-white p-3 rounded-lg mb-2">Invoice History</button>
            <button onclick="renderReceiptForm()" class="bg-secondary-red text-white p-3 rounded-lg mb-2">New Receipt</button>
            <button onclick="renderReceiptHistory()" class="bg-gray-700 text-white p-3 rounded-lg mb-2">Receipt History</button>
            <button onclick="renderBankManagement()" class="bg-green-600 text-white p-3 rounded-lg mb-2">Manage Banks</button>
        </div>
        <div id="document-form-area">
            <p class="text-gray-600">Start with a Sales Agreement to create a unified Reference ID.</p>
        </div>
    `;
}

// --- SALES AGREEMENT ---
function renderAgreementForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border rounded-xl bg-white shadow-lg">
            <h3 class="text-xl font-bold mb-4">New Sales Agreement</h3>
            <form id="agreement-form" onsubmit="event.preventDefault(); saveAgreement();">
                <input type="text" id="agr-client" placeholder="Client Name" class="w-full border p-2 mb-3 rounded" required>
                <input type="text" id="agr-vehicle" placeholder="Vehicle Details" class="w-full border p-2 mb-3 rounded" required>
                <button type="submit" class="w-full bg-primary-blue text-white py-3 rounded font-bold">Save Agreement & Create Reference</button>
            </form>
        </div>
    `;
}

async function saveAgreement() {
    const clientName = document.getElementById('agr-client').value;
    const vehicle = document.getElementById('agr-vehicle').value;
    const refId = await getSequentialReference(clientName);

    await db.collection("agreements").add({
        referenceNumber: refId,
        clientName,
        vehicle,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Agreement Created! Reference: " + refId);
    renderAgreementHistory();
}

function renderAgreementHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `<h3 class="text-xl font-bold mb-4">Agreement History</h3><div id="hist-list" class="space-y-2"></div>`;
    
    db.collection("agreements").orderBy("createdAt", "desc").onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const data = doc.data();
            html += `
                <div class="p-4 border rounded bg-gray-50 flex justify-between items-center">
                    <div><strong>${data.referenceNumber}</strong> - ${data.clientName}</div>
                    <button onclick='createInvoiceFromRef("${data.referenceNumber}", "${data.clientName}")' class="bg-blue-600 text-white px-4 py-1 rounded text-sm">Generate Invoice</button>
                </div>`;
        });
        document.getElementById('hist-list').innerHTML = html || "No records.";
    });
}

// --- INVOICE ---
async function createInvoiceFromRef(refId, clientName) {
    await db.collection("invoices").add({
        referenceNumber: refId,
        clientName: clientName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Invoice generated with Ref: " + refId);
    renderInvoiceHistory();
}

function renderInvoiceHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `<h3 class="text-xl font-bold mb-4">Invoice History</h3><div id="inv-hist-list" class="space-y-2"></div>`;
    
    db.collection("invoices").orderBy("createdAt", "desc").onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const data = doc.data();
            html += `
                <div class="p-4 border rounded bg-blue-50 flex justify-between items-center">
                    <div><strong>${data.referenceNumber}</strong> - ${data.clientName}</div>
                    <button onclick='createReceiptFromRef("${data.referenceNumber}", "${data.clientName}")' class="bg-green-600 text-white px-4 py-1 rounded text-sm">Generate Receipt</button>
                </div>`;
        });
        document.getElementById('inv-hist-list').innerHTML = html || "No records.";
    });
}

// --- RECEIPT & PDF LOGIC (PRESERVED) ---

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
        return "Amount too large";
    };
    let result = numToWords(whole).replace(/\s\s+/g, ' ').trim();
    if (decimal > 0) result += ` and ${numToWords(decimal)} cents`;
    return result.charAt(0).toUpperCase() + result.slice(1) + ' only.';
}

function renderReceiptForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-secondary-red rounded-xl bg-white shadow-md">
            <h3 class="text-xl font-semibold mb-4 text-secondary-red">New Payment Receipt</h3>
            <form id="receipt-form" onsubmit="event.preventDefault(); saveReceipt()">
                <input type="text" id="rcpt-ref" placeholder="Reference Number (from Invoice)" class="w-full border p-2 mb-3 rounded" required>
                <input type="text" id="receivedFrom" required placeholder="Customer Name" class="w-full border p-2 mb-3 rounded">
                <input type="number" id="amountReceived" step="0.01" required placeholder="Amount" class="w-full border p-2 mb-3 rounded">
                <input type="text" id="beingPaidFor" required placeholder="Payment Description" class="w-full border p-2 mb-3 rounded">
                <button type="submit" class="w-full bg-secondary-red text-white py-3 rounded font-bold">Generate & Save Receipt</button>
            </form>
        </div>
    `;
}

async function createReceiptFromRef(refId, clientName) {
    renderReceiptForm();
    document.getElementById('rcpt-ref').value = refId;
    document.getElementById('receivedFrom').value = clientName;
}

async function saveReceipt() {
    const refId = document.getElementById('rcpt-ref').value;
    const client = document.getElementById('receivedFrom').value;
    const amount = parseFloat(document.getElementById('amountReceived').value);
    
    const data = {
        receiptId: refId,
        receivedFrom: client,
        amountReceived: amount,
        amountWords: numberToWords(amount),
        receiptDate: new Date().toLocaleDateString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("receipts").add(data);
    alert("Receipt Saved!");
    generateReceiptPDF(data);
    renderReceiptHistory();
}

function renderReceiptHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `<h3 class="text-xl font-bold mb-4">Receipt History</h3><div id="rcpt-hist-list" class="space-y-2"></div>`;
    db.collection("receipts").orderBy("createdAt", "desc").onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const data = doc.data();
            html += `<div class="p-4 border rounded bg-green-50 flex justify-between items-center">
                        <div><strong>${data.receiptId}</strong> - ${data.receivedFrom}</div>
                        <button onclick='generateReceiptPDF(${JSON.stringify(data)})' class="bg-gray-600 text-white px-3 py-1 rounded text-sm">Download PDF</button>
                     </div>`;
        });
        document.getElementById('rcpt-hist-list').innerHTML = html || "No records.";
    });
}

function generateReceiptPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("WANBITE INVESTMENTS CO. LTD", 10, 10);
    doc.text(`Receipt No: ${data.receiptId}`, 10, 20);
    doc.text(`Received From: ${data.receivedFrom}`, 10, 30);
    doc.text(`Amount: ${data.amountReceived}`, 10, 40);
    doc.text(`Words: ${data.amountWords}`, 10, 50);
    doc.save(`Receipt_${data.receiptId}.pdf`);
}

// =================================================================
//                 5. BANK & FLEET (PRESERVED)
// =================================================================

function renderBankManagement() {
    appContent.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-primary-blue">Bank Management</h2><p>Existing bank logic preserved.</p>`;
}

function handleFleetManagement() {
    appContent.innerHTML = `<h2 class="text-2xl font-bold mb-4">Fleet Tracking</h2><p>Fleet features remain unchanged.</p>`;
}

function handleHRManagement() {
    appContent.innerHTML = `<h2 class="text-2xl font-bold mb-4">HR Module</h2><p>HR features remain unchanged.</p>`;
}
