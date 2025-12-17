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

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore();

// Global Elements & State
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
        console.error("Login failed:", error.message);
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
        <div class="${colorClass} border-2 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition duration-300 transform" onclick="${handler}()">
            <h3 class="text-2xl font-bold text-gray-800">${title}</h3>
            <p class="text-gray-600 mt-2">${subtitle}</p>
        </div>
    `;
}

async function generateSharedRefId(clientName, carModel, carYear, collectionName) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const namePart = clientName.split(' ')[0].toUpperCase().substring(0, 3);
    const modelPart = carModel.toUpperCase().substring(0, 3);
    const baseId = `${datePart}-${namePart}-${modelPart}-${carYear}`;
    
    const snapshot = await db.collection(collectionName).get();
    const serial = (snapshot.size + 1).toString().padStart(4, '0');
    
    return `${baseId}-${serial}`;
}

// =================================================================
//                 4. DOCUMENT GENERATOR ROUTING
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
//                 5. RECEIPT/PAYMENT LOGIC
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

    if (decimal > 0) {
        result += ` and ${numToWords(decimal)} cents`;
    }

    return result.charAt(0).toUpperCase() + result.slice(1) + ' only.';
}

function renderReceiptForm() {
    const formArea = document.getElementById('document-form-area');
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

function generateReceiptId(type, name) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const typePart = type.split(' ')[0].toUpperCase().substring(0, 3);
    const namePart = name.split(' ')[0].toUpperCase().substring(0, 3);
    return `RCPT-${datePart}-${typePart}-${namePart}`;
}

async function saveReceipt() {
    const form = document.getElementById('receipt-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const receiptType = document.getElementById('receiptType').value;
    const receivedFrom = document.getElementById('receivedFrom').value;
    const currency = document.getElementById('currency').value;
    const amountReceived = parseFloat(document.getElementById('amountReceived').value);
    const amountWords = document.getElementById('amountWords').value;
    const beingPaidFor = document.getElementById('beingPaidFor').value;
    const chequeNo = document.getElementById('chequeNo').value;
    const rtgsTtNo = document.getElementById('rtgsTtNo').value;
    const bankUsed = document.getElementById('bankUsed').value;
    const balanceRemaining = parseFloat(document.getElementById('balanceRemaining').value) || 0;
    const balanceDueDate = document.getElementById('balanceDueDate').value;

    const receiptId = generateReceiptId(receiptType, receivedFrom);
    const receiptDate = new Date().toLocaleDateString('en-US');

    const receiptData = {
        receiptId, receiptType, receivedFrom, currency, amountReceived, amountWords, beingPaidFor,
        paymentDetails: { chequeNo, rtgsTtNo, bankUsed },
        balanceDetails: { balanceRemaining, balanceDueDate },
        receiptDate, createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await db.collection("receipts").add(receiptData);
        alert(`Receipt ${receiptId} saved successfully!`);
        receiptData.firestoreId = docRef.id;
        generateReceiptPDF(receiptData);
        document.getElementById('receipt-form').reset();
        document.getElementById('amountWords').value = '';
        fetchReceipts();
    } catch (error) {
        console.error("Error saving receipt:", error);
        alert("Failed to save receipt: " + error.message);
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

            html += `<li class="p-3 border rounded-lg bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <strong class="text-gray-800">${data.receiptId}</strong><br>
                            <span class="text-sm text-gray-600">From: ${data.receivedFrom} | Amount: ${data.currency} ${data.amountReceived.toFixed(2)}</span>
                        </div>
                        <div class="mt-2 sm:mt-0 space-x-2">
                            <button onclick='reDownloadReceipt(${receiptDataJson})' 
                                    class="bg-secondary-red hover:bg-red-600 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                Re-Download PDF
                            </button>
                        </div>
                    </li>`;
        });
        html += `</ul>`;
        receiptList.innerHTML = html;
    } catch (error) {
        console.error("Error fetching receipts:", error);
        receiptList.innerHTML = `<p class="text-red-500">Error loading receipts.</p>`;
    }
}

function reDownloadReceipt(data) {
    if (!data.receiptDate) data.receiptDate = new Date().toLocaleDateString('en-US');
    generateReceiptPDF(data);
}

function generateReceiptPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 

    const primaryColor = '#183263';
    const secondaryColor = '#D96359';
    const pageW = doc.internal.pageSize.getWidth();
    let y = 10; 
    const margin = 10;
    const boxW = pageW - (2 * margin);
    const lineHeight = 7; 

    const drawText = (text, x, y, size, style = 'normal', color = primaryColor, align = 'left') => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(color);
        doc.text(text, x, y, { align: align });
    };

    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageW, 15, 'F');
    drawText('WanBite Investments Co. Ltd.', pageW / 2, 8, 18, 'bold', '#FFFFFF', 'center');
    drawText('carskenya.co.ke', pageW / 2, 13, 10, 'normal', '#FFFFFF', 'center');
    
    y = 25;
    drawText("OFFICIAL RECEIPT", pageW / 2, y, 24, "bold", primaryColor, "center");
    y += 12;
    
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, boxW, 15);
    drawText('RECEIPT NO:', margin + 3, y + 5, 10, 'bold', secondaryColor);
    drawText(data.receiptId, margin + 3, y + 11, 14, 'bold', primaryColor);
    drawText('DATE:', pageW - margin - 3, y + 5, 10, 'bold', secondaryColor, 'right');
    drawText(data.receiptDate, pageW - margin - 3, y + 11, 14, 'bold', primaryColor, 'right');
    y += 20;

    drawText('RECEIVED FROM:', margin, y, 10, 'bold');
    doc.setDrawColor(0);
    doc.line(margin + 35, y, pageW - margin, y);
    drawText(data.receivedFrom, margin + 35, y - 0.5, 12, 'bold', 0);
    y += lineHeight + 2;

    drawText('THE SUM OF:', margin, y + 3, 10, 'bold');
    doc.setFillColor(240, 240, 240); 
    doc.rect(margin + 35, y, boxW - 35, lineHeight * 2.5, 'F');
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(margin + 35, y, boxW - 35, lineHeight * 2.5);
    doc.setTextColor(0);
    doc.setFontSize(11);
    const wrappedWords = doc.splitTextToSize(data.amountWords, boxW - 37);
    doc.text(wrappedWords, margin + 36, y + 4);
    y += lineHeight * 2.5 + 5;

    drawText('BEING PAID FOR:', margin, y, 10, 'bold', primaryColor);
    doc.line(margin + 35, y, pageW - margin, y);
    drawText(data.beingPaidFor, margin + 35, y - 0.5, 12, 'bold', 0);
    y += lineHeight + 4;

    drawText('PAYMENT DETAILS:', margin, y, 10, 'bold');
    y += 4;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.rect(margin, y, boxW * 0.45, lineHeight);
    doc.text(`Cheque No: ${data.paymentDetails.chequeNo || 'N/A'}`, margin + 2, y + 4.5);
    doc.rect(margin + boxW * 0.55, y, boxW * 0.45, lineHeight);
    doc.text(`RTGS/TT No: ${data.paymentDetails.rtgsTtNo || 'N/A'}`, margin + boxW * 0.55 + 2, y + 4.5);
    y += lineHeight + 2;
    doc.rect(margin, y, boxW * 0.45, lineHeight);
    doc.text(`Bank Used: ${data.paymentDetails.bankUsed || 'N/A'}`, margin + 2, y + 4.5);
    doc.rect(margin + boxW * 0.55, y, boxW * 0.45, lineHeight);
    doc.text(`Receipt Type: ${data.receiptType}`, margin + boxW * 0.55 + 2, y + 4.5);
    y += lineHeight + 6;

    const amountBoxY = y + 5;
    doc.setFillColor(secondaryColor);
    doc.rect(pageW - margin - 70, amountBoxY, 70, 15, 'F');
    doc.setTextColor(255);
    drawText('AMOUNT FIGURE', pageW - margin - 65, amountBoxY + 4, 8, 'bold', 255);
    drawText(`${data.currency} ${data.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 5, amountBoxY + 11, 18, 'bold', 255, 'right');
    
    doc.setTextColor(primaryColor);
    drawText('BALANCE DETAILS', margin, amountBoxY + 4, 10, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0);
    const balanceText = data.balanceDetails.balanceRemaining > 0 ? `${data.currency} ${data.balanceDetails.balanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'ZERO';
    drawText(`Balance Remaining: ${balanceText}`, margin, amountBoxY + 10, 10);
    drawText(`Due On/Before: ${data.balanceDetails.balanceDueDate || 'N/A'}`, margin, amountBoxY + 14, 10);
    
    y = amountBoxY + 15 + 7;
    drawText('... With thanks', margin, y + 10, 12, 'italic', secondaryColor);
    doc.line(pageW - margin - 50, y + 15, pageW - margin, y + 15);
    drawText('For WanBite Investment Co. LTD', pageW - margin - 50, y + 19, 10, 'normal', primaryColor);

    doc.setFillColor(primaryColor);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.text(`Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`, pageW / 2, doc.internal.pageSize.getHeight() - 4, null, null, "center");
    doc.save(`Receipt_${data.receiptId}.pdf`);
}

// =================================================================
//                 7. BANK MANAGEMENT MODULE
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
                        <option value="" disabled selected>Select Currency</option>
                        <option value="USD">USD</option>
                        <option value="KES">KES</option>
                    </select>
                    <button type="submit" class="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md transition duration-150">
                        Save Bank Account
                    </button>
                </form>
            </div>

            <div class="md:col-span-2 p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Saved Bank Accounts</h3>
                <div id="saved-banks-list" class="space-y-3">
                    <p class="text-center text-gray-500">Loading banks...</p>
                </div>
            </div>
        </div>
    `;
    fetchAndDisplayBankDetails();
}

async function addBankDetails() {
    const bankName = document.getElementById('bankName').value;
    const bankBranch = document.getElementById('bankBranch').value;
    const accountName = document.getElementById('accountName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const swiftCode = document.getElementById('swiftCode').value;
    const currency = document.getElementById('currency').value;

    const newBank = {
        name: bankName, branch: bankBranch, accountName, accountNumber, swiftCode, currency,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("bankDetails").add(newBank);
        alert(`Bank account saved successfully!`);
        document.getElementById('add-bank-form').reset();
        fetchAndDisplayBankDetails();
    } catch (error) {
        alert("Failed to save bank details.");
    }
}

async function fetchAndDisplayBankDetails() {
    const listElement = document.getElementById('saved-banks-list');
    try {
        const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
        if (snapshot.empty) {
            listElement.innerHTML = `<p class="text-center text-gray-500">No bank accounts.</p>`;
            return;
        }

        let html = `<ul class="divide-y divide-gray-200">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `<li class="p-4 flex flex-col">
                        <div class="flex justify-between items-center">
                            <strong class="text-lg text-primary-blue">${data.name} (${data.currency})</strong>
                            <button onclick="deleteBank('${doc.id}')" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
                        </div>
                        <p class="text-sm text-gray-700">Branch: ${data.branch || 'N/A'}</p>
                        <p class="text-sm text-gray-600">No: ${data.accountNumber} | SWIFT: ${data.swiftCode}</p>
                    </li>`;
        });
        html += `</ul>`;
        listElement.innerHTML = html;
    } catch (error) {
        listElement.innerHTML = `<p class="text-red-500">Error loading bank accounts.</p>`;
    }
}

async function deleteBank(bankId) {
    if (confirm("Are you sure?")) {
        try {
            await db.collection("bankDetails").doc(bankId).delete();
            fetchAndDisplayBankDetails();
        } catch (error) {
            alert("Delete failed.");
        }
    }
}

// =================================================================
//                 8. INVOICE MODULE
// =================================================================

async function populateBankDropdown(dropdownId) {
    const bankSelect = document.getElementById(dropdownId);
    if (!bankSelect) return;
    bankSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';
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
                <input type="text" id="clientName" required placeholder="Client Full Name" class="w-full p-2 border rounded-md mb-4">
                <input type="text" id="carModel" required placeholder="Vehicle Model" class="w-full p-2 border rounded-md mb-4">
                <input type="number" id="price" required placeholder="Price (USD)" class="w-full p-2 border rounded-md mb-4">
                <select id="bankDetailsSelect" required class="w-full p-2 border rounded-md mb-4"></select>
                <button type="submit" class="w-full bg-primary-blue text-white font-bold py-3 rounded-lg">Generate & Save Invoice</button>
            </form>
        </div>
    `;
    populateBankDropdown('bankDetailsSelect');
}

async function saveInvoice(onlySave) {
    const clientName = document.getElementById('clientName').value;
    const carModel = document.getElementById('carModel').value;
    const invoiceId = await generateSharedRefId(clientName, carModel, "2024", "invoices");
    const invoiceData = {
        invoiceId, docType: document.getElementById('docType').value, clientName,
        carDetails: { model: carModel }, pricing: { totalUSD: parseFloat(document.getElementById('price').value) },
        issueDate: new Date().toLocaleDateString('en-US'), createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("invoices").add(invoiceData);
    generateInvoicePDF(invoiceData);
}

function generateInvoicePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(`INVOICE: ${data.invoiceId}`, 10, 10);
    doc.text(`Client: ${data.clientName}`, 10, 20);
    doc.save(`${data.invoiceId}.pdf`);
}

function renderInvoiceHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `<div class="p-6 bg-white rounded-xl shadow-md border"><h3 class="text-xl mb-4">Invoice History</h3><div id="invoice-history-list"></div></div>`;
    db.collection("invoices").orderBy("createdAt", "desc").limit(10).get().then(snap => {
        let html = `<ul class="space-y-2">`;
        snap.forEach(doc => {
            const d = doc.data();
            html += `<li class="p-2 border rounded flex justify-between">
                        <span>${d.invoiceId} - ${d.clientName}</span>
                        <button onclick='generateInvoicePDF(${JSON.stringify(d)})' class="text-blue-500 text-sm">Download</button>
                    </li>`;
        });
        document.getElementById('invoice-history-list').innerHTML = html + "</ul>";
    });
}

// =================================================================
//                 10. CAR SALES AGREEMENT MODULE
// =================================================================

function renderAgreementForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">New Car Sales Agreement</h3>
                <form id="agreement-form" onsubmit="event.preventDefault(); saveAgreement()">
                    <fieldset class="border p-4 rounded-lg mb-4 bg-blue-50">
                        <legend class="text-base font-semibold text-primary-blue px-2">Agreement Parties & Date</legend>
                        <input type="date" id="agreementDateInput" required value="${new Date().toISOString().slice(0, 10)}" class="mb-4 block w-full p-2 border rounded-md">
                        <input type="text" id="buyerName" required placeholder="Buyer Name" class="w-full p-2 border rounded-md mb-2">
                        <input type="text" id="buyerPhone" required placeholder="Buyer Phone" class="w-full p-2 border rounded-md">
                    </fieldset>
                    
                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Vehicle Details</legend>
                        <input type="text" id="carMakeModel" required placeholder="Make and Model" class="w-full p-2 border rounded-md mb-2">
                        <input type="text" id="carVIN" required placeholder="VIN Number" class="w-full p-2 border rounded-md">
                    </fieldset>

                    <fieldset class="border p-4 rounded-lg mb-4 bg-yellow-50">
                        <legend class="text-base font-semibold text-secondary-red px-2">Payment Details</legend>
                        <select id="currencySelect" class="w-full p-2 border rounded-md mb-4">
                            <option value="KES">KES</option>
                            <option value="USD">USD</option>
                        </select>
                        <div id="payment-schedule-rows" class="space-y-2 mb-3">
                            <div class="grid grid-cols-3 gap-2 payment-row">
                                <input type="text" value="Deposit" class="p-2 border rounded-md col-span-1">
                                <input type="number" step="0.01" placeholder="Amount" class="payment-amount p-2 border rounded-md col-span-1">
                                <input type="date" class="p-2 border rounded-md col-span-1">
                            </div>
                        </div>
                        <button type="button" onclick="addPaymentRow()" class="text-blue-600 font-bold">+ Add Payment</button>
                    </fieldset>

                    <button type="submit" class="w-full bg-primary-blue text-white font-bold py-3 rounded-lg">Generate & Save Agreement</button>
                </form>
            </div>
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Recent Agreements</h3>
                <div id="recent-agreements"></div>
            </div>
        </div>
    `;
    fetchAgreements();
}

function addPaymentRow() {
    const container = document.getElementById('payment-schedule-rows');
    const newRow = document.createElement('div');
    newRow.className = 'grid grid-cols-3 gap-2 payment-row';
    newRow.innerHTML = `<input type="text" placeholder="Description" class="p-2 border rounded-md col-span-1">
                        <input type="number" step="0.01" placeholder="Amount" class="payment-amount p-2 border rounded-md col-span-1">
                        <input type="date" class="p-2 border rounded-md col-span-1">`;
    container.appendChild(newRow);
}

async function saveAgreement() {
    const buyerName = document.getElementById('buyerName').value;
    const carMakeModel = document.getElementById('carMakeModel').value;
    const agreementId = await generateSharedRefId(buyerName, carMakeModel, "2024", "sales_agreements");

    const schedule = [];
    document.querySelectorAll('.payment-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        schedule.push({ description: inputs[0].value, amount: parseFloat(inputs[1].value) || 0, date: inputs[2].value });
    });

    const agreementData = {
        agreementId, buyer: { name: buyerName, phone: document.getElementById('buyerPhone').value },
        vehicle: { makeModel: carMakeModel, vin: document.getElementById('carVIN').value },
        salesTerms: { paymentSchedule: schedule, currency: document.getElementById('currencySelect').value },
        agreementDate: document.getElementById('agreementDateInput').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("sales_agreements").add(agreementData);
        alert(`Agreement ${agreementId} saved!`);
        generateAgreementPDF(agreementData);
        fetchAgreements();
    } catch (e) { alert("Save failed."); }
}

async function fetchAgreements() {
    const list = document.getElementById('recent-agreements');
    const snap = await db.collection("sales_agreements").orderBy("createdAt", "desc").limit(10).get();
    let html = snap.empty ? `<p class="text-gray-500">No agreements.</p>` : `<ul class="space-y-3">`;
    snap.forEach(doc => {
        const d = doc.data();
        html += `<li class="p-3 border rounded-lg bg-gray-50 flex justify-between">
                    <span>${d.agreementId} - ${d.buyer.name}</span>
                    <button onclick='generateAgreementPDF(${JSON.stringify(d)})' class="text-secondary-red text-xs px-3 py-1 rounded-full border border-secondary-red">PDF</button>
                </li>`;
    });
    list.innerHTML = html + "</ul>";
}

function generateAgreementPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(`CAR SALES AGREEMENT: ${data.agreementId}`, 10, 10);
    doc.text(`Buyer: ${data.buyer.name}`, 10, 20);
    doc.save(`Agreement_${data.agreementId}.pdf`);
}

// =================================================================
//                 11. FLEET MANAGEMENT
// =================================================================

const FLEET_STATUSES = [
    { id: "ship_to_mombasa", name: "On Ship to Mombasa" },
    { id: "clearing_mombasa", name: "In Mombasa being cleared" },
    { id: "taken_to_carrier", name: "In Mombasa taken to the carrier" },
    { id: "transit_to_nairobi", name: "In transit from Mombasa to Nairobi" },
    { id: "in_nairobi", name: "In Nairobi and picked from carrier" },
    { id: "delivered_client", name: "Delivered to the client" }
];

function handleFleetManagement() {
    if (!currentUser) return;
    appContent.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-primary-blue">Fleet Management</h2><div id="fleet-columns" class="flex gap-4 overflow-x-auto"></div>`;
    renderFleetDashboard();
}

function renderFleetDashboard() {
    const container = document.getElementById('fleet-columns');
    container.innerHTML = FLEET_STATUSES.map(s => `<div class="w-64 border rounded p-2 bg-gray-50"><h3 class="font-bold text-sm mb-2">${s.name}</h3><div id="fleet-column-${s.id}" class="space-y-2"></div></div>`).join('');
    db.collection("cars").onSnapshot(snap => {
        FLEET_STATUSES.forEach(s => document.getElementById(`fleet-column-${s.id}`).innerHTML = '');
        snap.forEach(doc => {
            const car = doc.data();
            const col = FLEET_STATUSES.find(s => s.name === car.currentStatus);
            if (col) document.getElementById(`fleet-column-${col.id}`).innerHTML += `<div class="p-2 bg-white border rounded text-xs"><strong>${car.makeModel}</strong></div>`;
        });
    });
}

function handleHRManagement() {
    appContent.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-primary-blue">HR Management</h2><p class="text-gray-600">Leave and requisition management interface.</p>`;
}
