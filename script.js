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

function handleLogout() {
    auth.signOut();
}

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
//                 3. DASHBOARD (UPDATED: REMOVED FLEET/HR)
// =================================================================

function renderDashboard() {
    appContent.innerHTML = `
        <h2 class="text-4xl font-extrabold mb-8 text-primary-blue">CDMS Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-1 gap-8">
            ${createDashboardCard('Document Generator', 'Invoices, Receipts, Agreements', 'bg-green-100 border-green-400', 'handleDocumentGenerator')}
        </div>
    `;
    
    mainNav.innerHTML = `
        <a href="#" onclick="renderDashboard()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Home</a>
        <a href="#" onclick="handleDocumentGenerator()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Documents</a>
    `;
    mainNav.classList.remove('hidden');
}

function createDashboardCard(title, subtitle, colorClass, handler) {
    return `
        <div class="${colorClass} border-2 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition duration-300 transform" onclick="${handler}()">
            <h3 class="text-2xl font-bold text-gray-800">${title}</h3>
            <p class="text-gray-600 mt-2">${subtitle}</p>
        </div>
    `;
}

// =================================================================
//                 4. SEQUENTIAL NUMBERING UTILITY
// =================================================================

async function generateSequentialId(collectionName, prefix) {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Fetch documents created in the current month to determine count
    const snapshot = await db.collection(collectionName)
        .where("createdAt", ">=", startOfMonth)
        .get();
    
    const serial = (snapshot.size + 1).toString().padStart(4, '0');
    return `${prefix}-${yearMonth}-${serial}`;
}

// =================================================================
//                 5. DOCUMENT GENERATOR ROUTING
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
        <div id="document-form-area">
            <p class="text-gray-600">Select a document type or manage bank accounts.</p>
        </div>
    `;
}

// =================================================================
//                 6. RECEIPT LOGIC
// =================================================================

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

function renderReceiptForm() {
    const formArea = document.getElementById('document-form-area');
    // Pre-fill reference if coming from Invoice History
    const displayRef = window.pendingReceiptRef || "";

    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 border border-secondary-red rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-secondary-red">New Payment Receipt</h3>
                <form id="receipt-form" onsubmit="event.preventDefault(); saveReceipt()">
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <select id="receiptType" required class="block w-full p-2 border rounded-md">
                            <option value="" disabled selected>Select Receipt Type</option>
                            <option value="Auction Imports">Auction Imports</option>
                            <option value="BeForward">BeForward</option>
                            <option value="Local Sales">Local Sales</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="text" id="receivedFrom" required placeholder="Received From (Customer Name)" class="block w-full p-2 border rounded-md">
                    </div>
                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Amount Received</legend>
                        <div class="grid grid-cols-3 gap-3">
                            <select id="currency" required class="p-2 border rounded-md">
                                <option value="KSH">KSH</option>
                                <option value="USD">USD</option>
                            </select>
                            <input type="number" id="amountReceived" step="0.01" required placeholder="Amount Figure" class="p-2 border rounded-md col-span-2" oninput="updateAmountInWords()">
                        </div>
                        <div class="mt-2">
                            <label for="amountWords" class="block text-sm font-medium text-gray-700">Amount in Words:</label>
                            <textarea id="amountWords" rows="2" readonly class="mt-1 block w-full p-2 border rounded-md bg-gray-100 text-gray-800"></textarea>
                        </div>
                    </fieldset>
                    <input type="text" id="beingPaidFor" required placeholder="Being Paid For" class="mb-4 block w-full p-2 border rounded-md">
                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Payment References</legend>
                        <div class="grid grid-cols-3 gap-3">
                            <input type="text" id="chequeNo" placeholder="Cheque No." class="p-2 border rounded-md">
                            <input type="text" id="rtgsTtNo" placeholder="RTGS/TT No." class="p-2 border rounded-md">
                            <input type="text" id="bankUsed" placeholder="Bank Used" class="p-2 border rounded-md">
                        </div>
                    </fieldset>
                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <input type="number" id="balanceRemaining" step="0.01" placeholder="Balance Remaining" class="block w-full p-2 border rounded-md">
                        <input type="date" id="balanceDueDate" class="block w-full p-2 border rounded-md">
                    </div>
                    <p class="text-xs text-blue-600 mb-2">${displayRef ? 'Ref: ' + displayRef : ''}</p>
                    <button type="submit" class="w-full bg-secondary-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-150">
                        Generate & Save Receipt
                    </button>
                </form>
            </div>
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Recent Receipts</h3>
                <div id="recent-receipts">
                    <p class="text-center text-gray-500">Loading payments...</p>
                </div>
            </div>
        </div>
    `;
    fetchReceipts();
}

function updateAmountInWords() {
    const amountField = document.getElementById('amountReceived');
    const currencyField = document.getElementById('currency');
    const wordsField = document.getElementById('amountWords');
    const amount = parseFloat(amountField.value);
    const currency = currencyField.value;

    if (isNaN(amount) || amount <= 0) {
        wordsField.value = '';
        return;
    }

    let words = numberToWords(amount);
    words = currency === 'USD' ? words.replace('only', 'US Dollars only.') : words.replace('only', 'Kenya Shillings only.');
    wordsField.value = words;
}

async function saveReceipt() {
    const form = document.getElementById('receipt-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const receiptType = document.getElementById('receiptType').value;
    const receivedFrom = document.getElementById('receivedFrom').value;
    // Use manual reference if provided, else generate sequential
    const receiptId = window.pendingReceiptRef || await generateSequentialId("receipts", "RCPT");
    const receiptDate = new Date().toLocaleDateString('en-US');

    const receiptData = {
        receiptId,
        receiptType,
        receivedFrom,
        currency: document.getElementById('currency').value,
        amountReceived: parseFloat(document.getElementById('amountReceived').value),
        amountWords: document.getElementById('amountWords').value,
        beingPaidFor: document.getElementById('beingPaidFor').value,
        paymentDetails: {
            chequeNo: document.getElementById('chequeNo').value,
            rtgsTtNo: document.getElementById('rtgsTtNo').value,
            bankUsed: document.getElementById('bankUsed').value
        },
        balanceDetails: {
            balanceRemaining: parseFloat(document.getElementById('balanceRemaining').value) || 0,
            balanceDueDate: document.getElementById('balanceDueDate').value
        },
        receiptDate,
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("receipts").add(receiptData);
        alert(`Receipt ${receiptId} saved!`);
        generateReceiptPDF(receiptData);
        window.pendingReceiptRef = null; // Clear ref
        document.getElementById('receipt-form').reset();
        fetchReceipts();
    } catch (error) {
        alert("Error saving receipt: " + error.message);
    }
}

async function fetchReceipts() {
    const receiptList = document.getElementById('recent-receipts');
    try {
        const snapshot = await db.collection("receipts").orderBy("createdAt", "desc").limit(10).get();
        if (snapshot.empty) {
            receiptList.innerHTML = `<p class="text-gray-500">No recent receipts found.</p>`;
            return;
        }
        
        let html = `<ul class="space-y-3">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            const receiptDataJson = JSON.stringify({
                ...data, firestoreId: doc.id,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            });

            html += `<li class="p-3 border rounded-lg bg-gray-50 flex flex-col justify-between items-start">
                        <div class="w-full flex justify-between">
                            <strong>${data.receiptId}</strong>
                            <span class="text-sm font-bold text-primary-blue">${data.currency} ${data.amountReceived.toFixed(2)}</span>
                        </div>
                        <span class="text-xs text-gray-600">From: ${data.receivedFrom}</span>
                        <div class="mt-2 flex space-x-2">
                            <button onclick='reDownloadReceipt(${receiptDataJson})' 
                                    class="bg-secondary-red hover:bg-red-600 text-white text-[10px] py-1 px-3 rounded-full transition duration-150">
                                PDF
                            </button>
                            <button onclick='initAgreementFromReceipt(${receiptDataJson})' 
                                    class="bg-primary-blue hover:bg-blue-600 text-white text-[10px] py-1 px-3 rounded-full transition duration-150">
                                Create Agreement
                            </button>
                        </div>
                    </li>`;
        });
        html += `</ul>`;
        receiptList.innerHTML = html;
    } catch (error) {
        receiptList.innerHTML = `<p class="text-red-500">Error loading receipts.</p>`;
    }
}

function reDownloadReceipt(data) {
    if (!data.receiptDate) data.receiptDate = new Date().toLocaleDateString('en-US');
    generateReceiptPDF(data);
}

function initAgreementFromReceipt(data) {
    window.pendingAgreementRef = data.receiptId;
    renderAgreementForm();
    // Pre-fill Buyer and Vehicle from receipt data
    document.getElementById('buyerName').value = data.receivedFrom;
    document.getElementById('carMakeModel').value = data.beingPaidFor;
}

function generateReceiptPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 
    const primaryColor = '#183263';
    const secondaryColor = '#D96359';
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 10;
    const boxW = pageW - (2 * margin);
    const drawText = (text, x, y, size, style = 'normal', color = primaryColor, align = 'left') => {
        doc.setFontSize(size); doc.setFont("helvetica", style); doc.setTextColor(color);
        doc.text(text, x, y, { align: align });
    };
    doc.setFillColor(primaryColor); doc.rect(0, 0, pageW, 15, 'F');
    drawText('WanBite Investments Co. Ltd.', pageW / 2, 8, 18, 'bold', '#FFFFFF', 'center');
    drawText('carskenya.co.ke', pageW / 2, 13, 10, 'normal', '#FFFFFF', 'center');
    let y = 25; drawText("OFFICIAL RECEIPT", pageW / 2, y, 24, "bold", primaryColor, "center");
    y += 12; doc.setDrawColor(primaryColor); doc.setLineWidth(0.5); doc.rect(margin, y, boxW, 15);
    drawText('RECEIPT NO:', margin + 3, y + 5, 10, 'bold', secondaryColor);
    drawText(data.receiptId, margin + 3, y + 11, 14, 'bold', primaryColor);
    drawText('DATE:', pageW - margin - 3, y + 5, 10, 'bold', secondaryColor, 'right');
    drawText(data.receiptDate, pageW - margin - 3, y + 11, 14, 'bold', primaryColor, 'right');
    y += 20; drawText('RECEIVED FROM:', margin, y, 10, 'bold');
    doc.setDrawColor(0); doc.line(margin + 35, y, pageW - margin, y);
    drawText(data.receivedFrom, margin + 35, y - 0.5, 12, 'bold', 0);
    y += 9; drawText('THE SUM OF:', margin, y + 3, 10, 'bold');
    doc.setFillColor(240, 240, 240); doc.rect(margin + 35, y, boxW - 35, 17.5, 'F');
    doc.setDrawColor(0); doc.setLineWidth(0.2); doc.rect(margin + 35, y, boxW - 35, 17.5);
    doc.setTextColor(0); doc.setFontSize(11);
    const wrappedWords = doc.splitTextToSize(data.amountWords, boxW - 37);
    doc.text(wrappedWords, margin + 36, y + 4);
    y += 22; drawText('BEING PAID FOR:', margin, y, 10, 'bold', primaryColor);
    doc.line(margin + 35, y, pageW - margin, y);
    drawText(data.beingPaidFor, margin + 35, y - 0.5, 12, 'bold', 0);
    y += 11; drawText('PAYMENT DETAILS:', margin, y, 10, 'bold'); y += 4;
    doc.setFontSize(10); doc.setTextColor(0); doc.rect(margin, y, boxW * 0.45, 7);
    doc.text(`Cheque No: ${data.paymentDetails.chequeNo || 'N/A'}`, margin + 2, y + 4.5);
    doc.rect(margin + boxW * 0.55, y, boxW * 0.45, 7);
    doc.text(`RTGS/TT No: ${data.paymentDetails.rtgsTtNo || 'N/A'}`, margin + boxW * 0.55 + 2, y + 4.5);
    y += 9; doc.rect(margin, y, boxW * 0.45, 7);
    doc.text(`Bank Used: ${data.paymentDetails.bankUsed || 'N/A'}`, margin + 2, y + 4.5);
    doc.rect(margin + boxW * 0.55, y, boxW * 0.45, 7);
    doc.text(`Receipt Type: ${data.receiptType}`, margin + boxW * 0.55 + 2, y + 4.5);
    y += 13; const amountBoxY = y + 5;
    doc.setFillColor(secondaryColor); doc.rect(pageW - margin - 70, amountBoxY, 70, 15, 'F');
    doc.setTextColor(255); drawText('AMOUNT FIGURE', pageW - margin - 65, amountBoxY + 4, 8, 'bold', 255);
    drawText(`${data.currency} ${data.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 5, amountBoxY + 11, 18, 'bold', 255, 'right');
    doc.setTextColor(primaryColor); drawText('BALANCE DETAILS', margin, amountBoxY + 4, 10, 'bold');
    doc.setFontSize(12); doc.setTextColor(0);
    const balanceText = data.balanceDetails.balanceRemaining > 0 ? `${data.currency} ${data.balanceDetails.balanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'ZERO';
    drawText(`Balance Remaining: ${balanceText}`, margin, amountBoxY + 10, 10);
    drawText(`Due On/Before: ${data.balanceDetails.balanceDueDate || 'N/A'}`, margin, amountBoxY + 14, 10);
    y = amountBoxY + 22; drawText('... With thanks', margin, y + 10, 12, 'italic', secondaryColor);
    doc.line(pageW - margin - 50, y + 15, pageW - margin, y + 15);
    drawText('For WanBite Investment Co. LTD', pageW - margin - 50, y + 19, 10, 'normal', primaryColor);
    doc.setFillColor(primaryColor); doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
    doc.setTextColor(255); doc.setFontSize(9);
    doc.text(`Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`, pageW / 2, doc.internal.pageSize.getHeight() - 4, null, null, "center");
    doc.save(`Receipt_${data.receiptId}.pdf`);
}

// =================================================================
//                 7. BANK MANAGEMENT
// =================================================================

function renderBankManagement() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-1 p-6 border border-green-300 rounded-xl bg-green-50 shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-green-700">Add New Bank Account</h3>
                <form id="add-bank-form" onsubmit="event.preventDefault(); addBankDetails()">
                    <input type="text" id="bankName" required placeholder="Bank Name" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="bankBranch" required placeholder="Bank Branch" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="accountName" required value="WANBITE INVESTMENTS CO. LTD" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="accountNumber" required placeholder="Account Number" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="swiftCode" required placeholder="SWIFT/BIC Code" class="mt-2 block w-full p-2 border rounded-md">
                    <select id="currency" required class="mt-2 block w-full p-2 border rounded-md">
                        <option value="USD">USD</option>
                        <option value="KES">KES</option>
                    </select>
                    <button type="submit" class="mt-4 w-full bg-green-600 text-white font-bold py-2 rounded-md">Save Bank</button>
                </form>
            </div>
            <div class="md:col-span-2 p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Saved Banks</h3>
                <div id="saved-banks-list" class="space-y-3"></div>
            </div>
        </div>
    `;
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
    try {
        await db.collection("bankDetails").add(newBank);
        document.getElementById('add-bank-form').reset();
        fetchAndDisplayBankDetails();
    } catch (error) { alert(error.message); }
}

async function fetchAndDisplayBankDetails() {
    const listElement = document.getElementById('saved-banks-list');
    try {
        const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
        if (snapshot.empty) { listElement.innerHTML = `<p class="text-center text-gray-500">No bank accounts.</p>`; return; }
        let html = `<ul class="divide-y divide-gray-200">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `<li class="p-4 flex flex-col">
                        <div class="flex justify-between items-center">
                            <strong class="text-primary-blue">${data.name} (${data.currency})</strong>
                            <button onclick="deleteBank('${doc.id}')" class="text-red-500 text-sm">Delete</button>
                        </div>
                        <p class="text-xs text-gray-600">Acc: ${data.accountNumber} | Branch: ${data.branch}</p>
                    </li>`;
        });
        listElement.innerHTML = html + `</ul>`;
    } catch (error) { listElement.innerHTML = `<p class="text-red-500">Error.</p>`; }
}

async function deleteBank(id) { if (confirm("Delete?")) { await db.collection("bankDetails").doc(id).delete(); fetchAndDisplayBankDetails(); } }

// =================================================================
//                 8. INVOICE MODULE
// =================================================================

async function populateBankDropdown(dropdownId) {
    const bankSelect = document.getElementById(dropdownId);
    if (!bankSelect) return;
    const snapshot = await db.collection("bankDetails").get();
    let options = '<option value="" disabled selected>Select Bank Account</option>';
    snapshot.forEach(doc => {
        options += `<option value='${JSON.stringify(doc.data())}'>${doc.data().name} (${doc.data().currency})</option>`;
    });
    bankSelect.innerHTML = options;
}

function renderInvoiceForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg">
            <h3 class="text-xl font-semibold mb-4 text-primary-blue">Create Sales Invoice/Proforma</h3>
            <form id="invoice-form" onsubmit="event.preventDefault(); saveInvoice(false);">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                    <select id="docType" required class="p-2 border rounded-md">
                        <option value="Invoice">Invoice</option>
                        <option value="Proforma Invoice">Proforma Invoice</option>
                    </select>
                    <input type="number" id="exchangeRate" step="0.01" required value="130.00" class="p-2 border rounded-md">
                    <input type="date" id="dueDate" required class="p-2 border rounded-md">
                </div>
                <fieldset class="border p-4 rounded-lg mb-6">
                    <legend class="text-base font-semibold text-secondary-red px-2">Client Details</legend>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="text" id="clientName" required placeholder="Client Full Name" class="p-2 border rounded-md">
                        <input type="text" id="clientPhone" required placeholder="Phone Number" class="p-2 border rounded-md">
                    </div>
                </fieldset>
                <fieldset class="border p-4 rounded-lg mb-6">
                    <legend class="text-base font-semibold text-primary-blue px-2">Vehicle Specification</legend>
                    <div class="grid grid-cols-4 gap-4">
                        <input type="text" id="carMake" required placeholder="Make" class="p-2 border rounded-md">
                        <input type="text" id="carModel" required placeholder="Model" class="p-2 border rounded-md">
                        <input type="number" id="carYear" required placeholder="Year" class="p-2 border rounded-md">
                        <input type="text" id="vinNumber" required placeholder="VIN Number" class="p-2 border rounded-md">
                        <input type="number" id="engineCC" required placeholder="CC" class="p-2 border rounded-md">
                        <select id="fuelType" required class="p-2 border rounded-md"><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option></select>
                        <select id="transmission" required class="p-2 border rounded-md"><option value="Automatic">Automatic</option><option value="Manual">Manual</option></select>
                        <input type="text" id="color" required placeholder="Color" class="p-2 border rounded-md">
                    </div>
                    <textarea id="goodsDescription" placeholder="Description of Goods" rows="2" class="mt-3 block w-full p-2 border rounded-md"></textarea>
                </fieldset>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <input type="number" id="price" step="0.01" required placeholder="Price (USD)" class="p-2 border rounded-md">
                    <select id="bankDetailsSelect" required class="p-2 border rounded-md"></select>
                </div>
                <input type="text" id="buyerConfirm" required placeholder="Accepted by Buyer" class="w-full p-2 border rounded-md mb-6">
                <button type="submit" class="w-full bg-primary-blue text-white font-bold py-3 rounded-lg">Save Invoice</button>
            </form>
        </div>
    `;
    populateBankDropdown('bankDetailsSelect');
}

async function saveInvoice(onlySave) {
    const clientName = document.getElementById('clientName').value;
    const carModel = document.getElementById('carModel').value;
    const invoiceId = await generateSequentialId("invoices", "INV");
    const bankDetails = JSON.parse(document.getElementById('bankDetailsSelect').value);
    const priceUSD = parseFloat(document.getElementById('price').value);
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);

    const invoiceData = {
        invoiceId,
        docType: document.getElementById('docType').value,
        clientName,
        clientPhone: document.getElementById('clientPhone').value,
        issueDate: new Date().toLocaleDateString('en-US'),
        dueDate: document.getElementById('dueDate').value,
        exchangeRate: exchangeRate,
        carDetails: {
            make: document.getElementById('carMake').value, model: carModel, year: document.getElementById('carYear').value,
            vin: document.getElementById('vinNumber').value, cc: document.getElementById('engineCC').value,
            fuel: document.getElementById('fuelType').value, transmission: document.getElementById('transmission').value,
            color: document.getElementById('color').value, quantity: 1, priceUSD: priceUSD,
            goodsDescription: document.getElementById('goodsDescription').value
        },
        pricing: { totalUSD: priceUSD, depositUSD: priceUSD * 0.5, balanceUSD: priceUSD * 0.5, depositKSH: (priceUSD * 0.5 * exchangeRate).toFixed(2) },
        bankDetails, buyerNameConfirmation: document.getElementById('buyerConfirm').value,
        createdBy: currentUser.email, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("invoices").add(invoiceData);
        alert(`Invoice ${invoiceId} saved!`);
        generateInvoicePDF(invoiceData);
        renderInvoiceHistory();
    } catch (e) { alert(e.message); }
}

function generateInvoicePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 
    const primaryColor = '#183263';
    const secondaryColor = '#D96359';
    const pageW = doc.internal.pageSize.getWidth();
    const drawText = (text, x, y, size, style = 'normal', color = primaryColor, align = 'left') => {
        doc.setFontSize(size); doc.setFont("helvetica", style); doc.setTextColor(color); doc.text(text, x, y, { align: align });
    };
    doc.setFillColor(primaryColor); doc.rect(0, 0, pageW, 15, 'F');
    drawText('WanBite Investments Co. Ltd.', pageW / 2, 8, 18, 'bold', '#FFFFFF', 'center');
    drawText('carskenya.co.ke', pageW / 2, 13, 10, 'normal', '#FFFFFF', 'center');
    let y = 25; drawText(data.docType.toUpperCase(), pageW / 2, y, 24, "bold", secondaryColor, "center");
    y += 10; doc.setDrawColor(primaryColor); doc.setLineWidth(0.5); doc.rect(10, y, 188, 15);
    drawText('INVOICE NO:', 13, y + 5, 10, 'bold', secondaryColor); drawText(data.invoiceId, 13, y + 11, 14, 'bold', primaryColor);
    drawText('DATE:', pageW - 60, y + 5, 10, 'bold', secondaryColor); drawText(data.issueDate, pageW - 60, y + 11, 10, 'bold', primaryColor);
    y += 20; doc.setLineWidth(0.2); doc.rect(10, y, 90, 25);
    drawText('BILL TO:', 13, y + 5, 10, 'bold', secondaryColor); drawText(data.clientName, 13, y + 10, 10, 'bold', 0); drawText(data.clientPhone, 13, y + 15, 10, 'normal', 0);
    doc.rect(pageW / 2 + 5, y, 90, 25); drawText('FROM:', pageW / 2 + 8, y + 5, 10, 'bold', secondaryColor);
    drawText('WANBITE INVESTMENTS COMPANY LIMITED', pageW / 2 + 8, y + 10, 10, 'bold', 0);
    y += 30; doc.setFillColor(primaryColor); doc.rect(10, y, 188, 8, 'F');
    drawText('MAKE & MODEL', 12, y + 5.5, 9, 'bold', 255); drawText('VIN', 50, y + 5.5, 9, 'bold', 255); drawText('PRICE (USD)', 185, y + 5.5, 9, 'bold', 255, 'right');
    y += 8; doc.setTextColor(0); doc.text(`${data.carDetails.make} ${data.carDetails.model}`, 12, y + 6); doc.text(data.carDetails.vin, 50, y + 6);
    drawText(data.pricing.totalUSD.toLocaleString(), 185, y + 6, 10, 'normal', 0, 'right');
    doc.save(`${data.invoiceId}.pdf`);
}

async function renderInvoiceHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `<div class="p-6 border rounded-xl bg-white shadow-lg"><h3 class="text-xl font-semibold mb-6">Invoice History</h3><div id="inv-list"></div></div>`;
    const snap = await db.collection("invoices").orderBy("createdAt", "desc").limit(10).get();
    const list = document.getElementById('inv-list');
    if (snap.empty) { list.innerHTML = `<p>No invoices.</p>`; return; }
    let html = `<ul class="space-y-3">`;
    snap.forEach(doc => {
        const data = doc.data();
        const json = JSON.stringify(data);
        html += `<li class="p-3 bg-gray-50 flex justify-between items-center rounded border">
                    <div><strong>${data.invoiceId}</strong><br><span class="text-xs">${data.clientName}</span></div>
                    <div class="flex space-x-2">
                        <button onclick='generateInvoicePDF(${json})' class="bg-primary-blue text-white text-[10px] py-1 px-3 rounded-full">PDF</button>
                        <button onclick='initReceiptFromInvoice(${json})' class="bg-green-600 text-white text-[10px] py-1 px-3 rounded-full">Create Receipt</button>
                    </div>
                </li>`;
    });
    list.innerHTML = html + `</ul>`;
}

function initReceiptFromInvoice(data) {
    window.pendingReceiptRef = data.invoiceId;
    renderReceiptForm();
    document.getElementById('receivedFrom').value = data.clientName;
    document.getElementById('beingPaidFor').value = `Payment for ${data.carDetails.model} (Invoice ${data.invoiceId})`;
}

// =================================================================
//                 10. CAR SALES AGREEMENT MODULE
// =================================================================

function renderAgreementForm() {
    const formArea = document.getElementById('document-form-area');
    const displayRef = window.pendingAgreementRef || "";

    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">New Car Sales Agreement</h3>
                <form id="agreement-form" onsubmit="event.preventDefault(); saveAgreement()">
                    <fieldset class="border p-4 rounded-lg mb-4 bg-blue-50">
                        <legend class="text-base font-semibold text-primary-blue px-2">Parties & Date</legend>
                        <input type="date" id="agreementDateInput" required value="${new Date().toISOString().slice(0, 10)}" class="mb-4 block w-full p-2 border rounded-md">
                        <input type="text" id="buyerName" required placeholder="Buyer Name" class="mb-2 block w-full p-2 border rounded-md">
                        <input type="text" id="buyerPhone" required placeholder="Buyer Phone" class="mb-2 block w-full p-2 border rounded-md">
                        <input type="text" id="buyerAddress" required placeholder="Buyer Address" class="block w-full p-2 border rounded-md">
                    </fieldset>
                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Vehicle</legend>
                        <input type="text" id="carMakeModel" required placeholder="Make and Model" class="mb-2 block w-full p-2 border rounded-md">
                        <input type="text" id="carVIN" required placeholder="VIN/Chassis No" class="block w-full p-2 border rounded-md">
                    </fieldset>
                    <fieldset class="border p-4 rounded-lg mb-4 bg-yellow-50">
                        <legend class="text-base font-semibold text-secondary-red px-2">Payments</legend>
                        <select id="currencySelect" class="w-full p-2 border rounded-md mb-2">
                            <option value="KES">KES</option><option value="USD">USD</option>
                        </select>
                        <div id="payment-schedule-rows" class="space-y-2">
                            <div class="grid grid-cols-3 gap-2 payment-row">
                                <input type="text" required value="Deposit" class="p-2 border rounded-md text-xs">
                                <input type="number" step="0.01" required placeholder="Amount" class="p-2 border rounded-md text-xs payment-amount">
                                <input type="date" required class="p-2 border rounded-md text-xs">
                            </div>
                        </div>
                        <button type="button" onclick="addAgreementRow()" class="mt-2 text-xs font-bold text-blue-600">+ Add Row</button>
                    </fieldset>
                    <p class="text-xs text-blue-600 mb-2">${displayRef ? 'Agreement Reference: ' + displayRef : ''}</p>
                    <button type="submit" class="w-full bg-primary-blue text-white font-bold py-3 rounded-lg">Save Agreement</button>
                </form>
            </div>
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">History</h3>
                <div id="ag-list"></div>
            </div>
        </div>
    `;
    fetchAgreements();
}

function addAgreementRow() {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-3 gap-2 payment-row mt-2';
    row.innerHTML = `<input type="text" required placeholder="Description" class="p-2 border rounded-md text-xs">
                     <input type="number" step="0.01" required placeholder="Amount" class="p-2 border rounded-md text-xs payment-amount">
                     <input type="date" required class="p-2 border rounded-md text-xs">`;
    document.getElementById('payment-schedule-rows').appendChild(row);
}

async function saveAgreement() {
    const buyerName = document.getElementById('buyerName').value;
    const agreementId = window.pendingAgreementRef || await generateSequentialId("sales_agreements", "AGR");
    
    const schedule = [];
    document.querySelectorAll('.payment-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        schedule.push({ description: inputs[0].value, amount: parseFloat(inputs[1].value), date: inputs[2].value });
    });

    const data = {
        agreementId,
        buyer: { name: buyerName, phone: document.getElementById('buyerPhone').value, address: document.getElementById('buyerAddress').value },
        seller: { address: "Ngong Road, Nairobi", phone: "0713147136" },
        vehicle: { makeModel: document.getElementById('carMakeModel').value, vin: document.getElementById('carVIN').value },
        salesTerms: { currency: document.getElementById('currencySelect').value, paymentSchedule: schedule, price: schedule.reduce((s,p) => s+p.amount,0) },
        agreementDate: document.getElementById('agreementDateInput').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("sales_agreements").add(data);
    generateAgreementPDF(data);
    window.pendingAgreementRef = null;
    fetchAgreements();
}

async function fetchAgreements() {
    const list = document.getElementById('ag-list');
    const snap = await db.collection("sales_agreements").orderBy("createdAt", "desc").limit(10).get();
    let html = `<ul class="space-y-3">`;
    snap.forEach(doc => {
        const d = doc.data();
        html += `<li class="p-3 border rounded bg-gray-50 flex justify-between items-center">
                    <div><strong>${d.agreementId}</strong><br><span class="text-xs">${d.buyer.name}</span></div>
                    <button onclick='generateAgreementPDF(${JSON.stringify(d)})' class="bg-primary-blue text-white text-[10px] py-1 px-3 rounded-full">PDF</button>
                </li>`;
    });
    list.innerHTML = html + "</ul>";
}

function generateAgreementPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const primaryColor = '#183263';
    doc.setFillColor(primaryColor); doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255); doc.setFontSize(18); doc.text("WANBITE CAR SALES AGREEMENT", 105, 10, {align: 'center'});
    doc.setTextColor(0); doc.setFontSize(10);
    doc.text(`Agreement Ref: ${data.agreementId}`, 10, 25);
    doc.text(`Buyer: ${data.buyer.name}`, 10, 35);
    doc.text(`Vehicle: ${data.vehicle.makeModel}`, 10, 45);
    doc.text(`Total Price: ${data.salesTerms.currency} ${data.salesTerms.price.toLocaleString()}`, 10, 55);
    let y = 70; doc.text("Payment Schedule:", 10, y);
    data.salesTerms.paymentSchedule.forEach(p => {
        y += 7; doc.text(`${p.description}: ${data.salesTerms.currency} ${p.amount.toLocaleString()} (Due: ${p.date})`, 15, y);
    });
    doc.save(`Agreement_${data.agreementId}.pdf`);
}

// STUBS FOR HR/FLEET (Removed from dashboard as requested)
function handleHRManagement() { renderDashboard(); }
function handleFleetManagement() { renderDashboard(); }
