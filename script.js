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

                    <input type="text" id="beingPaidFor" required placeholder="Being Paid For (e.g., Toyota Vitz 2018 Deposit)" class="mb-4 block w-full p-2 border rounded-md">

                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Payment References</legend>
                        <div class="grid grid-cols-3 gap-3">
                            <input type="text" id="chequeNo" placeholder="Cheque No. (Optional)" class="p-2 border rounded-md">
                            <input type="text" id="rtgsTtNo" placeholder="RTGS/TT No. (Optional)" class="p-2 border rounded-md">
                            <input type="text" id="bankUsed" placeholder="Bank Used (e.g., KCB, NCBA)" class="p-2 border rounded-md">
                        </div>
                    </fieldset>

                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <input type="number" id="balanceRemaining" step="0.01" placeholder="Balance Remaining (Optional)" class="block w-full p-2 border rounded-md">
                        <input type="date" id="balanceDueDate" placeholder="To be paid on or before" class="block w-full p-2 border rounded-md">
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
    
    if (currency === 'USD') {
        words = words.replace('only', 'US Dollars only.');
    } else {
        words = words.replace('only', 'Kenya Shillings only.');
    }

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

    if (isNaN(amountReceived) || amountReceived <= 0) {
        alert("Please enter a valid amount received.");
        return;
    }

    const receiptId = generateReceiptId(receiptType, receivedFrom);
    const receiptDate = new Date().toLocaleDateString('en-US');

    const receiptData = {
        receiptId,
        receiptType,
        receivedFrom,
        currency,
        amountReceived,
        amountWords,
        beingPaidFor,
        paymentDetails: {
            chequeNo,
            rtgsTtNo,
            bankUsed
        },
        balanceDetails: {
            balanceRemaining,
            balanceDueDate
        },
        receiptDate,
        createdBy: currentUser.email,
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
    let html = ``;
    try {
        const snapshot = await db.collection("receipts").orderBy("createdAt", "desc").limit(10).get();
        if (snapshot.empty) {
            receiptList.innerHTML = `<p class="text-gray-500">No recent receipts found.</p>`;
            return;
        }
        
        html = `<ul class="space-y-3">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            const receiptDataJson = JSON.stringify({
                ...data, 
                firestoreId: doc.id,
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
        receiptList.innerHTML = `<p class="text-red-500">Error loading receipts. Check console for details.</p>`;
    }
}

function reDownloadReceipt(data) {
    if (!data.receiptDate) {
         data.receiptDate = new Date().toLocaleDateString('en-US');
    }
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

    doc.setTextColor(primaryColor);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL RECEIPT", pageW / 2, y, null, null, "center");
    y += 12;
    
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, boxW, 15);
    
    drawText('RECEIPT NO:', margin + 3, y + 5, 10, 'bold', secondaryColor);
    drawText(data.receiptId, margin + 3, y + 11, 14, 'bold', primaryColor);
    
    drawText('DATE:', pageW - margin - 3, y + 5, 10, 'bold', secondaryColor, 'right');
    drawText(data.receiptDate, pageW - margin - 3, y + 11, 14, 'bold', primaryColor, 'right');
    y += 20;

    doc.setTextColor(primaryColor);
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

    doc.setTextColor(primaryColor);
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

    const amountBoxH = 15;
    const amountBoxY = y + 5;
    
    doc.setFillColor(secondaryColor);
    doc.rect(pageW - margin - 70, amountBoxY, 70, amountBoxH, 'F');
    
    doc.setTextColor(255);
    drawText('AMOUNT FIGURE', pageW - margin - 65, amountBoxY + 4, 8, 'bold', 255);
    drawText(`${data.currency} ${data.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 5, amountBoxY + 11, 18, 'bold', 255, 'right');
    
    doc.setTextColor(primaryColor);
    drawText('BALANCE DETAILS', margin, amountBoxY + 4, 10, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0);

    const balanceText = data.balanceDetails.balanceRemaining > 0 
        ? `${data.currency} ${data.balanceDetails.balanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
        : 'ZERO';
    
    drawText(`Balance Remaining: ${balanceText}`, margin, amountBoxY + 10, 10);
    drawText(`Due On/Before: ${data.balanceDetails.balanceDueDate || 'N/A'}`, margin, amountBoxY + 14, 10);
    
    y = amountBoxY + amountBoxH + 7;

    doc.setTextColor(primaryColor);
    drawText('... With thanks', margin, y + 10, 12, 'italic', secondaryColor);
    
    doc.line(pageW - margin - 50, y + 15, pageW - margin, y + 15);
    drawText('For WanBite Investment Co. LTD', pageW - margin - 50, y + 19, 10, 'normal', primaryColor);
    y += 25;

    doc.setFillColor(primaryColor);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(9);
    const footerText = `Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`;
    doc.text(footerText, pageW / 2, doc.internal.pageSize.getHeight() - 4, null, null, "center");

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
                    <input type="text" id="bankName" required placeholder="Bank Name (e.g., KCB Bank)" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="bankBranch" required placeholder="Bank Branch (e.g., Kilimani Branch)" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="accountName" required placeholder="Account Name" value="WANBITE INVESTMENTS CO. LTD" class="mt-2 block w-full p-2 border rounded-md">
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
        name: bankName,
        branch: bankBranch,
        accountName,
        accountNumber,
        swiftCode,
        currency,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("bankDetails").add(newBank);
        alert(`Bank account for ${bankName} (${bankBranch}) saved successfully!`);
        document.getElementById('add-bank-form').reset();
        fetchAndDisplayBankDetails();
    } catch (error) {
        console.error("Error saving bank details:", error);
        alert("Failed to save bank details: " + error.message);
    }
}

async function fetchAndDisplayBankDetails() {
    const listElement = document.getElementById('saved-banks-list');
    if (!listElement) return;

    listElement.innerHTML = `<p class="text-center text-gray-500">Fetching data...</p>`;
    let html = ``;

    try {
        const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
        if (snapshot.empty) {
            listElement.innerHTML = `<p class="text-center text-gray-500">No bank accounts have been configured yet.</p>`;
            return;
        }

        html = `<ul class="divide-y divide-gray-200">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `
                <li class="p-4 flex flex-col">
                    <div class="flex justify-between items-center">
                        <strong class="text-lg text-primary-blue">${data.name} (${data.currency})</strong>
                        <button onclick="deleteBank('${doc.id}')" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
                    </div>
                    <p class="text-sm text-gray-700">Branch: ${data.branch || 'N/A'}</p>
                    <p class="text-sm text-gray-700">Account: ${data.accountName}</p>
                    <p class="text-sm text-gray-600">No: ${data.accountNumber} | SWIFT: ${data.swiftCode}</p>
                </li>
            `;
        });
        html += `</ul>`;
        listElement.innerHTML = html;

    } catch (error) {
        console.error("Error fetching banks:", error);
        listElement.innerHTML = `<p class="text-red-500">Error loading bank accounts.</p>`;
    }
}

async function deleteBank(bankId) {
    if (!confirm("Are you sure you want to delete this bank account?")) {
        return;
    }
    try {
        await db.collection("bankDetails").doc(bankId).delete();
        alert("Bank account deleted successfully!");
        fetchAndDisplayBankDetails();
    } catch (error) {
        console.error("Error deleting bank:", error);
        alert("Failed to delete bank: " + error.message);
    }
}

// =================================================================
//                 8. INVOICE MODULE
// =================================================================

async function _getBankDetailsData() {
    try {
        const snapshot = await db.collection("bankDetails").get();
        const banks = [];
        snapshot.forEach(doc => {
            banks.push({ id: doc.id, ...doc.data() });
        });
        return banks;
    } catch (error) {
        console.error("Error fetching bank details:", error);
        return [];
    }
}

async function populateBankDropdown(dropdownId) {
    const bankSelect = document.getElementById(dropdownId);
    if (!bankSelect) return;

    bankSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';

    const banks = await _getBankDetailsData();
    let options = '<option value="" disabled selected>Select Bank Account</option>';

    if (banks.length === 0) {
        bankSelect.innerHTML = '<option value="" disabled>No bank accounts configured.</option>';
        return;
    }

    banks.forEach(data => {
        const detailsJson = JSON.stringify(data);
        options += `<option value='${detailsJson}'>${data.name} - ${data.branch || 'No Branch'} (${data.currency})</option>`;
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
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Document Type</label>
                        <select id="docType" required class="mt-1 block w-full p-2 border rounded-md">
                            <option value="Invoice">Invoice</option>
                            <option value="Proforma Invoice">Proforma Invoice</option>
                        </select>
                    </div>
                    <div>
                        <label for="exchangeRate" class="block text-sm font-medium text-gray-700">USD 1 = KES</label>
                        <input type="number" id="exchangeRate" step="0.01" required value="130.00" class="mt-1 block w-full p-2 border rounded-md">
                    </div>
                    <div>
                        <label for="dueDate" class="block text-sm font-medium text-gray-700">Due Date</label>
                        <input type="date" id="dueDate" required class="mt-1 block w-full p-2 border rounded-md">
                    </div>
                </div>
                
                <fieldset class="border p-4 rounded-lg mb-6">
                    <legend class="text-base font-semibold text-secondary-red px-2">Client Details</legend>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="text" id="clientName" required placeholder="Client Full Name" class="p-2 border rounded-md">
                        <input type="text" id="clientPhone" required placeholder="Client Phone Number" class="p-2 border rounded-md">
                    </div>
                </fieldset>

                <fieldset class="border p-4 rounded-lg mb-6">
                    <legend class="text-base font-semibold text-primary-blue px-2">Vehicle Specification</legend>
                    <div class="grid grid-cols-4 gap-4">
                        <input type="text" id="carMake" required placeholder="Make (e.g., Toyota)" class="p-2 border rounded-md">
                        <input type="text" id="carModel" required placeholder="Model (e.g., Vitz)" class="p-2 border rounded-md">
                        <input type="number" id="carYear" required placeholder="Year" class="p-2 border rounded-md">
                        <input type="text" id="vinNumber" required placeholder="VIN Number" class="p-2 border rounded-md">
                        <input type="number" id="engineCC" required placeholder="Engine CC" class="p-2 border rounded-md">
                        <select id="fuelType" required class="p-2 border rounded-md">
                            <option value="" disabled selected>Fuel Type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                        <select id="transmission" required class="p-2 border rounded-md">
                            <option value="" disabled selected>Transmission</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                        </select>
                        <input type="text" id="color" required placeholder="Color" class="p-2 border rounded-md">
                        <input type="number" id="mileage" required placeholder="Mileage (km)" class="p-2 border rounded-md">
                    </div>
                    <textarea id="goodsDescription" placeholder="Description of Goods (e.g., Accessories, specific features)" rows="2" class="mt-3 block w-full p-2 border rounded-md"></textarea>
                </fieldset>

                <fieldset class="border p-4 rounded-lg mb-6">
                    <legend class="text-base font-semibold text-secondary-red px-2">Pricing</legend>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="number" id="quantity" required value="1" min="1" placeholder="Quantity" class="p-2 border rounded-md">
                        <input type="number" id="price" step="0.01" required placeholder="Unit Price (USD C&F MSA)" class="p-2 border rounded-md">
                    </div>
                </fieldset>

                <fieldset class="border p-4 rounded-lg mb-6">
                    <legend class="text-base font-semibold text-secondary-red px-2">Payment/Confirmation</legend>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Select Bank Account for Payment</label>
                            <select id="bankDetailsSelect" required class="mt-1 block w-full p-2 border rounded-md"></select>
                        </div>
                        <div>
                            <label for="buyerNameConfirmation" class="block text-sm font-medium text-gray-700">Accepted & Confirmed by Buyer (Full Name)</label>
                            <input type="text" id="buyerNameConfirmation" required placeholder="Buyer's Full Name" class="mt-1 block w-full p-2 border rounded-md">
                        </div>
                    </div>
                    <p class="mt-4 text-sm text-gray-500">Seller: WANBITE INVESTMENTS COMPANY LIMITED. This acts as a confirmation of acceptance.</p>
                </fieldset>

                <div class="flex space-x-4">
                    <button type="submit" class="flex-1 bg-primary-blue hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition duration-150">
                        Generate & Save Invoice
                    </button>
                    <button type="button" onclick="saveInvoice(true)" class="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition duration-150">
                        Save Only (No PDF)
                    </button>
                </div>
            </form>
        </div>
    `;

    populateBankDropdown('bankDetailsSelect');
}

async function saveInvoice(onlySave) {
    const form = document.getElementById('invoice-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const docType = document.getElementById('docType').value;
    const clientName = document.getElementById('clientName').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const dueDate = document.getElementById('dueDate').value;
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);
    
    const carMake = document.getElementById('carMake').value;
    const carModel = document.getElementById('carModel').value;
    const carYear = document.getElementById('carYear').value;
    const vinNumber = document.getElementById('vinNumber').value;
    const engineCC = document.getElementById('engineCC').value;
    const fuelType = document.getElementById('fuelType').value;
    const transmission = document.getElementById('transmission').value;
    const color = document.getElementById('color').value;
    const mileage = document.getElementById('mileage').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const priceUSD = parseFloat(document.getElementById('price').value);
    const goodsDescription = document.getElementById('goodsDescription').value;
    
    let bankDetails;
    try {
        bankDetails = JSON.parse(document.getElementById('bankDetailsSelect').value);
    } catch (e) {
        alert("Error reading selected bank details. Please re-select the bank account.");
        return;
    }
    
    const buyerNameConfirmation = document.getElementById('buyerNameConfirmation').value;

    const totalPriceUSD = quantity * priceUSD;
    const depositUSD = totalPriceUSD * 0.50;
    const balanceUSD = totalPriceUSD * 0.50;
    const depositKSH = depositUSD * exchangeRate;
    
    const generatedInvoiceId = generateInvoiceId(clientName, carModel, carYear);
    const invoiceData = {
        docType,
        clientName,
        clientPhone,
        issueDate: new Date().toLocaleDateString('en-US'),
        dueDate,
        exchangeRate,
        carDetails: {
            make: carMake,
            model: carModel,
            vin: vinNumber,
            cc: engineCC,
            year: carYear,
            fuel: fuelType,
            transmission,
            color,
            mileage,
            quantity,
            priceUSD,
            goodsDescription
        },
        pricing: {
            totalUSD: totalPriceUSD,
            depositUSD,
            balanceUSD,
            depositKSH: depositKSH.toFixed(2),
        },
        bankDetails,
        buyerNameConfirmation,
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        invoiceId: generatedInvoiceId
    };

    try {
        const docRef = await db.collection("invoices").add(invoiceData);
        alert(`${docType} ${generatedInvoiceId} saved successfully!`);

        if (!onlySave) {
            invoiceData.firestoreId = docRef.id;
            generateInvoicePDF(invoiceData);
        }
    } catch (error) {
        console.error("Error saving invoice:", error);
        alert("Failed to save invoice: " + error.message);
    }
}

function generateInvoiceId(clientName, carModel, carYear) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const namePart = clientName.split(' ')[0].toUpperCase().substring(0, 3);
    const modelPart = carModel.toUpperCase().substring(0, 3);
    return `${datePart}-${namePart}-${modelPart}-${carYear}`;
}

function generateInvoicePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 

    const primaryColor = '#183263';
    const secondaryColor = '#D96359';
    
    const pageW = doc.internal.pageSize.getWidth();
    let y = 10; 
    const margin = 10;
    const lineHeight = 5; 
    const termIndent = 5;

    const drawText = (text, x, y, size, style = 'normal', color = primaryColor, align = 'left') => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(color);
        doc.text(text, x, y, { align: align });
    };

    const drawTerm = (doc, yStart, prefix, text, textWidth = 188 - termIndent) => {
        doc.setFontSize(9);
        doc.setTextColor(primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(prefix, margin, yStart);
        
        let textX = margin + 5; 
        
        const lines = doc.splitTextToSize(text, textWidth);
        let currentY = yStart;
        const lineSpacing = 4.5;
        
        lines.forEach((line, index) => {
            let currentX = margin + termIndent; 
            if (index === 0) {
                currentX = textX; 
            } else {
                currentX = margin + termIndent;
            }

            if (index === 0) {
                const prefixWidth = doc.getStringUnitWidth(prefix) * doc.getFontSize() / doc.internal.scaleFactor;
                currentX = margin + prefixWidth + 1;
            } else {
                currentX = margin + termIndent;
            }

            doc.setTextColor(primaryColor);
            doc.setFont("helvetica", "normal");
            doc.text(line, currentX, currentY);

            currentY += lineSpacing;
        });
        
        return currentY + 1;
    };

    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageW, 15, 'F');
    
    drawText('WanBite Investments Co. Ltd.', pageW / 2, 8, 18, 'bold', '#FFFFFF', 'center');
    drawText('carskenya.co.ke', pageW / 2, 13, 10, 'normal', '#FFFFFF', 'center');
    
    y = 25;

    doc.setTextColor(secondaryColor);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(data.docType.toUpperCase(), pageW / 2, y, null, null, "center");
    y += 10;
    
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, 188, 15);
    
    drawText('INVOICE NO:', margin + 3, y + 5, 10, 'bold', secondaryColor);
    drawText(data.invoiceId, margin + 3, y + 11, 14, 'bold', primaryColor);
    
    drawText('ISSUE DATE:', pageW - margin - 50, y + 5, 10, 'bold', secondaryColor);
    drawText(data.issueDate, pageW - margin - 50, y + 11, 10, 'bold', primaryColor);
    
    drawText('DUE DATE:', pageW - margin - 15, y + 5, 10, 'bold', secondaryColor, 'right');
    drawText(data.dueDate, pageW - margin - 15, y + 11, 10, 'bold', primaryColor, 'right');
    y += 20;

    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, 90, 25);
    drawText('BILL TO:', margin + 3, y + 5, 10, 'bold', secondaryColor);
    drawText(data.clientName, margin + 3, y + 10, 10, 'bold', 0);
    drawText(data.clientPhone, margin + 3, y + 15, 10, 'normal', 0);
    
    doc.rect(pageW / 2 + 5, y, 90, 25);
    drawText('FROM:', pageW / 2 + 8, y + 5, 10, 'bold', secondaryColor);
    drawText('WANBITE INVESTMENTS COMPANY LIMITED', pageW / 2 + 8, y + 10, 10, 'bold', 0);
    drawText('Ngong Road, Kilimani, Nairobi | sales@carskenya.co.ke', pageW / 2 + 8, y + 15, 8, 'normal', 0);
    drawText('Phone: 0713147136', pageW / 2 + 8, y + 20, 8, 'normal', 0);
    
    y += 30;

    doc.setFillColor(primaryColor);
    doc.rect(margin, y, 188, 8, 'F');
    doc.setTextColor(255);
    drawText('MAKE & MODEL', 12, y + 5.5, 9, 'bold', 255);
    drawText('VIN / YEAR', 50, y + 5.5, 9, 'bold', 255);
    drawText('Specs (CC/Fuel/Trans)', 85, y + 5.5, 9, 'bold', 255);
    drawText('Mileage/Color', 135, y + 5.5, 9, 'bold', 255);
    drawText('QTY', 160, y + 5.5, 9, 'bold', 255);
    drawText('PRICE (USD)', 185, y + 5.5, 9, 'bold', 255, 'right');
    y += 8;

    doc.setFillColor(255);
    doc.rect(margin, y, 188, 8, 'F');
    doc.setTextColor(0);
    drawText(`${data.carDetails.make} ${data.carDetails.model}`, 12, y + 5.5, 10);
    drawText(`${data.carDetails.vin} / ${data.carDetails.year}`, 50, y + 5.5, 10);
    drawText(`${data.carDetails.cc} CC / ${data.carDetails.fuel} / ${data.carDetails.transmission}`, 85, y + 5.5, 10);
    drawText(`${data.carDetails.mileage}km / ${data.carDetails.color}`, 135, y + 5.5, 10);
    drawText(`${data.carDetails.quantity}`, 160, y + 5.5, 10);
    drawText(`${data.carDetails.priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 185, y + 5.5, 10, 'normal', 0, "right");
    y += 8;

    doc.setTextColor(primaryColor);
    drawText('DESCRIPTION:', margin, y + 5, 9, 'bold');
    doc.setTextColor(0);
    doc.setFontSize(9);
    const descriptionLines = doc.splitTextToSize(data.carDetails.goodsDescription || 'N/A', 188);
    descriptionLines.forEach((line, index) => {
        doc.text(line, margin, y + 5 + (index + 1) * 4);
    });
    y += descriptionLines.length * 4 + 7;

    const totalBoxW = 60;
    const totalsX = pageW - margin - totalBoxW;

    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('SUBTOTAL (USD)', totalsX + 2, y + 3.5, 9, 'normal', 0);
    drawText(data.pricing.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', 0, 'right');
    y += lineHeight;

    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('DEPOSIT (50% USD)', totalsX + 2, y + 3.5, 9, 'normal', 0);
    drawText(data.pricing.depositUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', secondaryColor, 'right');
    y += lineHeight;

    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('BALANCE DUE (USD)', totalsX + 2, y + 3.5, 9, 'normal', 0);
    drawText(data.pricing.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', primaryColor, 'right');
    y += lineHeight;

    doc.setFillColor(230, 240, 255);
    doc.rect(totalsX, y, totalBoxW, lineHeight, 'F');
    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('DEPOSIT (KES EQUIV)', totalsX + 2, y + 3.5, 9, 'bold', primaryColor);
    drawText(parseFloat(data.pricing.depositKSH).toLocaleString('en-US', { minimumFractionDigits: 2 }), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', primaryColor, 'right');
    y += lineHeight;
    y += 5;

    drawText('TERMS & CONDITIONS', margin, y, 12, 'bold', primaryColor);
    y += lineHeight;
    
    const totalPriceText = `The total price of the vehicle is USD ${data.pricing.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    y = drawTerm(doc, y, '1.', totalPriceText, 188 - termIndent);

    const depositText = `A deposit of USD ${data.pricing.depositUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} (KES ${data.pricing.depositKSH.toLocaleString('en-US', { minimumFractionDigits: 2 })} equivalent) is required to secure the vehicle and begin shipping/clearing. The balance of USD ${data.pricing.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} is due on or before ${data.dueDate} or upon production of the Bill of Lading. The seller shall promptly notify the buyer of the date for due compliance.`;
    y = drawTerm(doc, y, '2.', depositText);

    y = drawTerm(doc, y, '3.', 'The original Bill of Lading will be issued to the buyer upon confirmation of full receipt of the purchase price.');
    y = drawTerm(doc, y, '4.', 'If you cancel to buy before or after shipment after purchase is confirmed, your deposit is to be forfeited.');
    y = drawTerm(doc, y, '5.', 'All the vehicles are subject to AS IS CONDITION.');
    y = drawTerm(doc, y, '6.', 'Payment will be made by the invoiced person. If a third party makes a payment, please kindly inform us the relationship due to security reasons.');
    
    y += 5;

    doc.setFillColor(255, 245, 230);
    doc.rect(margin, y, 188, 40, 'F');
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, 188, 40);
    let currentY_bank = y + 5;
    
    drawText('KINDLY PAY USD / KSH TO THE FOLLOWING BANK ACCOUNT:', 15, currentY_bank, 11, 'bold', primaryColor);
    currentY_bank += 5;
    
    doc.setFontSize(8);
    doc.setTextColor(primaryColor);
    doc.text(`Exchange rate used USD 1 = KES ${data.exchangeRate.toFixed(2)}`, 190 - margin, currentY_bank - 2, null, null, "right");
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    const bank = data.bankDetails;
    const branchText = bank.branch ? `(Branch: ${bank.branch})` : '';

    doc.text(`Bank Name: ${bank.name || 'N/A'} ${branchText}`, margin + 5, currentY_bank);
    currentY_bank += 4;
    doc.text(`Account Name: ${bank.accountName || 'N/A'}`, margin + 5, currentY_bank);
    currentY_bank += 4;
    doc.text(`Account Number: ${bank.accountNumber || 'N/A'}`, margin + 5, currentY_bank);
    currentY_bank += 4;
    doc.text(`SWIFT/BIC Code: ${bank.swiftCode || 'N/A'} | Currency: ${bank.currency || 'N/A'}`, margin + 5, currentY_bank);

    drawText('**NOTE: Buyer Should bear the cost of Bank Charge when remitting T/T', margin, y + 40 - 5, 9, 'bold', secondaryColor);
    y += 45;

    doc.setDrawColor(primaryColor);
    doc.line(margin, y + 15, 90, y + 15);
    drawText(`Accepted and Confirmed by Buyer: ${data.buyerNameConfirmation}`, margin, y + 19, 10);
    
    doc.line(110, y + 15, 190, y + 15);
    drawText('Seller: WANBITE INVESTMENTS COMPANY LIMITED', 110, y + 19, 10);
    y += 30;

    doc.setFillColor(primaryColor);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
    doc.setTextColor(255);
    doc.setFontSize(9);
    const footerText = `Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`;
    doc.text(footerText, pageW / 2, doc.internal.pageSize.getHeight() - 4, null, null, "center");

    doc.save(`${data.docType}_${data.invoiceId}.pdf`);
}

// =================================================================
//                 9. INVOICE HISTORY MODULE
// =================================================================

function renderInvoiceHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg">
            <h3 class="text-xl font-semibold mb-6 text-primary-blue">Previously Saved Invoices</h3>
            <div id="invoice-history-list">
                <p class="text-center text-gray-500">Loading invoice history...</p>
            </div>
        </div>
    `;
    fetchInvoices();
}

async function fetchInvoices() {
    const listElement = document.getElementById('invoice-history-list');
    let html = ``;
    try {
        const snapshot = await db.collection("invoices").orderBy("createdAt", "desc").limit(10).get();
        if (snapshot.empty) {
            listElement.innerHTML = `<p class="text-gray-500">No recent invoices found.</p>`;
            return;
        }
        
        html = `<ul class="space-y-3 divide-y divide-gray-200">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            const invoiceDataJson = JSON.stringify({
                ...data, 
                firestoreId: doc.id,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            });

            html += `<li class="p-3 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <strong class="text-primary-blue">${data.docType} ${data.invoiceId}</strong><br>
                            <span class="text-sm text-gray-700">Client: ${data.clientName} | Vehicle: ${data.carDetails.make} ${data.carDetails.model}</span>
                        </div>
                        <div class="mt-2 sm:mt-0 space-x-2">
                            <button onclick='reDownloadInvoice(${invoiceDataJson})' 
                                    class="bg-primary-blue hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                Re-Download PDF
                            </button>
                        </div>
                    </li>`;
        });
        html += `</ul>`;
        listElement.innerHTML = html;
    } catch (error) {
        console.error("Error fetching invoices:", error);
        listElement.innerHTML = `<p class="text-red-500">Error loading invoice history. Check console for details.</p>`;
    }
}

function reDownloadInvoice(data) {
    if (data.issueDate) {
    } else if (data.createdAt && typeof data.createdAt === 'string') {
        data.issueDate = new Date(data.createdAt).toLocaleDateString('en-US');
    }
    generateInvoicePDF(data);
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
                        
                        <label for="agreementDateInput" class="block text-sm font-medium text-gray-700 mb-2">Agreement Date:</label>
                        <input type="date" id="agreementDateInput" required value="${new Date().toISOString().slice(0, 10)}" class="mb-4 block w-full p-2 border rounded-md">
                        
                        <h4 class="font-bold text-sm mt-2 text-secondary-red">SELLER: WanBite Investments Company Limited</h4>
                        <div class="grid grid-cols-2 gap-3 mt-1 mb-4">
                            <input type="text" id="sellerAddress" value="Ngong Road, Kilimani, Nairobi" required placeholder="Seller Address" class="p-2 border rounded-md text-sm">
                            <input type="text" id="sellerPhone" value="0713147136" required placeholder="Seller Phone" class="p-2 border rounded-md text-sm">
                        </div>
                        
                        <h4 class="font-bold text-sm mt-2 text-primary-blue">BUYER:</h4>
                        <div class="grid grid-cols-2 gap-3 mt-1">
                            <input type="text" id="buyerName" required placeholder="Buyer Name" class="p-2 border rounded-md">
                            <input type="text" id="buyerPhone" required placeholder="Buyer Phone" class="p-2 border rounded-md">
                            <input type="text" id="buyerAddress" required placeholder="Buyer Address" class="p-2 border rounded-md col-span-2">
                        </div>
                    </fieldset>
                    
                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Vehicle Details</legend>
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" id="carMakeModel" required placeholder="Make and Model (e.g., Toyota Vitz)" class="p-2 border rounded-md">
                            <input type="number" id="carYear" required placeholder="Year of Manufacture" class="p-2 border rounded-md">
                            <input type="text" id="carColor" required placeholder="Color" class="p-2 border rounded-md">
                            <input type="text" id="carVIN" required placeholder="VIN Number" class="p-2 border rounded-md">
                        </div>
                        <select id="carFuelType" required class="block w-full p-2 border rounded-md mt-3">
                            <option value="" disabled selected>Select Fuel Type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </fieldset>

                    <fieldset class="border p-4 rounded-lg mb-4 bg-yellow-50">
                        <legend class="text-base font-semibold text-secondary-red px-2">Payment Details</legend>
                        <div class="mb-3">
                            <label for="currencySelect" class="block text-sm font-medium text-gray-700">Currency</label>
                            <select id="currencySelect" required class="block w-full p-2 border rounded-md" onchange="calculatePaymentTotal()">
                                <option value="KES">KES - Kenya Shillings</option>
                                <option value="USD">USD - US Dollars</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="agreementBankDetailsSelect" class="block text-sm font-medium text-gray-700">Select Bank Account for Payment</label>
                            <select id="agreementBankDetailsSelect" required class="mt-1 block w-full p-2 border rounded-md"></select>
                        </div>
                        
                        <div class="flex justify-between items-center mb-2">
                            <strong class="text-md text-gray-700">Payment Schedule</strong>
                            <button type="button" onclick="addPaymentRow()" class="text-primary-blue hover:text-blue-700 font-bold text-sm">+ Add Payment</button>
                        </div>
                        
                        <div id="payment-schedule-rows" class="space-y-2 mb-3">
                            <div class="grid grid-cols-4 gap-2 payment-row">
                                <input type="text" required placeholder="e.g. Deposit" value="Deposit" class="p-2 border rounded-md col-span-2 text-sm">
                                <input type="number" step="0.01" required placeholder="Amount" oninput="calculatePaymentTotal()" class="payment-amount p-2 border rounded-md text-sm">
                                <input type="date" required class="payment-date p-2 border rounded-md text-sm">
                            </div>
                        </div>

                        <div class="mt-4 p-2 bg-yellow-200 rounded-md">
                            <strong class="text-secondary-red">Total Price: </strong> 
                            <span id="total-amount" class="font-bold text-lg text-secondary-red">0.00 KES</span>
                        </div>
                    </fieldset>

                    <fieldset class="border p-4 rounded-lg mb-6">
                        <legend class="text-base font-semibold text-primary-blue px-2">Witnesses</legend>
                        <input type="text" id="sellerWitness" required placeholder="Seller Witness Name" class="mt-2 block w-full p-2 border rounded-md">
                        <input type="text" id="buyerWitness" required placeholder="Buyer Witness Name" class="mt-2 block w-full p-2 border rounded-md">
                    </fieldset>

                    <button type="submit" class="w-full bg-primary-blue hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition duration-150">
                        Generate & Save Agreement
                    </button>
                </form>
            </div>
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Recent Sales Agreements</h3>
                <div id="recent-agreements">
                    <p class="text-center text-gray-500">Loading agreements...</p>
                </div>
            </div>
        </div>
    `; 
    
    populateBankDropdown('agreementBankDetailsSelect'); 
    calculatePaymentTotal();
    fetchAgreements();
}

function addPaymentRow() {
    const container = document.getElementById('payment-schedule-rows');
    const newRow = document.createElement('div');
    newRow.className = 'grid grid-cols-4 gap-2 payment-row';
    newRow.innerHTML = `
        <input type="text" required placeholder="e.g. Balance" class="p-2 border rounded-md col-span-2 text-sm">
        <input type="number" step="0.01" required placeholder="Amount" oninput="calculatePaymentTotal()" class="payment-amount p-2 border rounded-md text-sm">
        <input type="date" required class="payment-date p-2 border rounded-md text-sm">
        <button type="button" onclick="this.parentElement.remove(); calculatePaymentTotal();" class="text-red-500 hover:text-red-700 text-sm">X</button>
    `;
    container.appendChild(newRow);
}

function calculatePaymentTotal() {
    const paymentAmounts = document.querySelectorAll('.payment-amount');
    const currency = document.getElementById('currencySelect').value;
    const totalSpan = document.getElementById('total-amount');
    
    let total = 0;
    paymentAmounts.forEach(input => {
        total += parseFloat(input.value) || 0;
    });

    totalSpan.textContent = `${total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`;
}


async function saveAgreement() {
    const form = document.getElementById('agreement-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const agreementDate = document.getElementById('agreementDateInput').value;
    const buyerName = document.getElementById('buyerName').value;
    const buyerPhone = document.getElementById('buyerPhone').value;
    
    const carMakeModel = document.getElementById('carMakeModel').value;
    const carYear = document.getElementById('carYear').value;
    const carColor = document.getElementById('carColor').value;
    const carVIN = document.getElementById('carVIN').value;
    const carFuelType = document.getElementById('carFuelType').value;

    const paymentSchedule = [];
    let totalAmount = 0;
    document.querySelectorAll('#payment-schedule-rows .payment-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const description = inputs[0].value;
        const amount = parseFloat(inputs[1].value);
        const date = inputs[2].value;

        paymentSchedule.push({ description, amount, date });
        totalAmount += amount;
    });

    const selectedBankValue = document.getElementById('agreementBankDetailsSelect').value;
    const currency = document.getElementById('currencySelect').value;

    let bankDetails = {};
    let bankId = '';

    try {
        bankDetails = JSON.parse(selectedBankValue);
        bankId = bankDetails.id;
    } catch (e) {
        alert("Please select a valid bank account.");
        return;
    }

    const agreementData = {
        agreementDate: agreementDate, 
        buyer: {
            name: buyerName,
            phone: buyerPhone,
            address: document.getElementById('buyerAddress').value
        },
        seller: {
            address: document.getElementById('sellerAddress').value,
            phone: document.getElementById('sellerPhone').value
        },
        vehicle: {
            makeModel: carMakeModel,
            year: carYear,
            color: carColor,
            vin: carVIN,
            fuelType: carFuelType,
        },
        salesTerms: {
            price: totalAmount,
            currency: currency,
            bankId: bankId,
            paymentSchedule: paymentSchedule,
        },
        signatures: {
            sellerWitness: document.getElementById('sellerWitness').value,
            buyerWitness: document.getElementById('buyerWitness').value,
        },
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await db.collection("sales_agreements").add(agreementData);
        alert(`Sales Agreement for ${agreementData.buyer.name} saved successfully!`);

        agreementData.firestoreId = docRef.id;
        agreementData.bankDetails = bankDetails;
        generateAgreementPDF(agreementData);

        form.reset();
        calculatePaymentTotal();
        fetchAgreements();
    } catch (error) {
        console.error("Error saving sales agreement:", error);
        alert("Failed to save sales agreement: " + error.message);
    }
}

async function fetchAgreements() {
    const agreementList = document.getElementById('recent-agreements');
    let html = ``;
    try {
        const snapshot = await db.collection("sales_agreements").orderBy("createdAt", "desc").limit(10).get();
        if (snapshot.empty) {
            agreementList.innerHTML = `<p class="text-gray-500">No recent agreements found.</p>`;
            return;
        }
        
        html = `<ul class="space-y-3">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            const agreementDataJson = JSON.stringify({
                ...data, 
                firestoreId: doc.id,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            });

            html += `<li class="p-3 border rounded-lg bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <strong class="text-primary-blue">Agreement ID: ${doc.id.substring(0, 8)}...</strong><br>
                            <span class="text-sm text-gray-700">Buyer: ${data.buyer.name} | Vehicle: ${data.vehicle.makeModel}</span>
                        </div>
                        <div class="mt-2 sm:mt-0 space-x-2">
                            <button onclick='reDownloadAgreement(${agreementDataJson})' 
                                    class="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                Re-Download PDF
                            </button>
                        </div>
                    </li>`;
        });
        html += `</ul>`;
        agreementList.innerHTML = html;
    } catch (error) {
        console.error("Error fetching agreements:", error);
        agreementList.innerHTML = `<p class="text-red-500">Error loading agreements. Check console for details.</p>`;
    }
}

async function reDownloadAgreement(data) {
    if (data.bankDetails && data.bankDetails.name) {
        return generateAgreementPDF(data);
    }

    let bankDetails = null;
    const bankIdValue = data.salesTerms?.bankId;

    if (bankIdValue) {
        if (bankIdValue.startsWith('{') && bankIdValue.endsWith('}')) {
            try {
                bankDetails = JSON.parse(bankIdValue);
            } catch (e) {
                console.warn("Could not parse old bankId JSON string. Falling back to ID fetch.");
            }
        }
        
        if (!bankDetails) {
            const banks = await _getBankDetailsData();
            bankDetails = banks.find(b => b.id === bankIdValue);
        }
    }
    
    data.bankDetails = bankDetails || {}; 
    generateAgreementPDF(data);
}


function generateAgreementPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 

    const primaryColor = '#183263';
    const secondaryColor = '#D96359';
    
    const pageW = doc.internal.pageSize.getWidth();
    let y = 10; 
    const margin = 10;
    const lineSpacing = 6;
    const textIndent = 5;

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

    doc.setTextColor(primaryColor);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CAR SALES AGREEMENT", pageW / 2, y, null, null, "center");
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(primaryColor);
    doc.text(`This Car Sales Agreement is made on the ${data.agreementDate}, between;`, margin, y);
    y += lineSpacing;

    doc.setFont("helvetica", "bold");
    doc.text("THE SELLER:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text("WANBITE INVESTMENTS COMPANY LIMITED", margin + 25, y);
    y += lineSpacing;
    doc.text(`Address: ${data.seller.address}`, margin + 5, y);
    doc.text(`Phone: ${data.seller.phone}`, margin + 100, y);
    y += lineSpacing + 2;

    doc.setFont("helvetica", "bold");
    doc.text("THE BUYER:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.buyer.name, margin + 25, y);
    y += lineSpacing;
    doc.text(`Address: ${data.buyer.address}`, margin + 5, y);
    doc.text(`Phone: ${data.buyer.phone}`, margin + 100, y);
    y += lineSpacing + 4;

    drawText('VEHICLE DETAILS', margin, y, 12, 'bold', primaryColor);
    y += lineSpacing;
    doc.setFontSize(10);
    doc.setTextColor(0);

    doc.text(`Make & Model: ${data.vehicle.makeModel}`, margin + textIndent, y);
    doc.text(`Year of Manufacture: ${data.vehicle.year}`, margin + 90, y);
    y += lineSpacing;
    doc.text(`VIN/Chassis No: ${data.vehicle.vin}`, margin + textIndent, y);
    doc.text(`Color: ${data.vehicle.color}`, margin + 90, y);
    y += lineSpacing;
    doc.text(`Fuel Type: ${data.vehicle.fuelType}`, margin + textIndent, y);
    y += lineSpacing + 4;

    drawText('SALES AGREEMENT & PAYMENT TERMS', margin, y, 12, 'bold', primaryColor);
    y += lineSpacing;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("The Purchase Price of ", margin, y);
    doc.setFont("helvetica", "bold");
    let totalText = `${data.salesTerms.currency} ${data.salesTerms.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    doc.text(totalText, margin + doc.getStringUnitWidth("The Purchase Price of ") * doc.getFontSize() / doc.internal.scaleFactor, y);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    const trailingText = ` is to be paid to the bank account below:`;
    doc.text(trailingText, margin + doc.getStringUnitWidth("The Purchase Price of " + totalText) * doc.getFontSize() / doc.internal.scaleFactor, y);
    y += lineSpacing;

    doc.setFillColor(255, 245, 230);
    doc.rect(margin, y, pageW - 20, 20, 'F');
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, pageW - 20, 20);
    doc.setFontSize(9);
    doc.setTextColor(primaryColor);
    
    const bank = data.bankDetails || {};
    const branchText = bank.branch ? `(Branch: ${bank.branch})` : '';

    doc.text(`Bank Name: ${bank.name || 'N/A'} ${branchText}`, margin + 3, y + 4);
    doc.text(`Account Name: ${bank.accountName || 'N/A'}`, margin + 90, y + 4);
    doc.text(`Account No: ${bank.accountNumber || 'N/A'}`, margin + 3, y + 9);
    doc.text(`SWIFT/BIC: ${bank.swiftCode || 'N/A'}`, margin + 90, y + 9);
    doc.text(`Branch: ${bank.branch || 'N/A'} | Currency: ${data.salesTerms.currency}`, margin + 3, y + 14);
    y += 25;

    drawText('Payment Schedule:', margin, y, 10, 'bold', primaryColor);
    y += 4;
    
    doc.setFillColor(230);
    doc.rect(margin, y, pageW - 20, 6, 'F');
    doc.setDrawColor(0);
    doc.rect(margin, y, pageW - 20, 6);
    drawText('Description', margin + 2, y + 4, 9, 'bold', 0);
    drawText('Amount', margin + 110, y + 4, 9, 'bold', 0);
    drawText('Due Date', margin + 160, y + 4, 9, 'bold', 0);
    y += 6;

    doc.setFontSize(9);
    data.salesTerms.paymentSchedule.forEach(payment => {
        doc.rect(margin, y, pageW - 20, 5);
        doc.text(payment.description, margin + 2, y + 3.5);
        doc.text(`${data.salesTerms.currency} ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, margin + 110, y + 3.5);
        doc.text(payment.date, margin + 160, y + 3.5);
        y += 5;
    });

    y += 4;
    
    drawText('GENERAL TERMS', margin, y, 12, 'bold', primaryColor);
    y += lineSpacing;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('• The Buyer agrees to purchase the vehicle in its current condition.', margin + textIndent, y);
    y += lineSpacing;
    doc.text('• The sale is as-is, and the Seller does not provide any warranty unless otherwise agreed in writing.', margin + textIndent, y);
    y += lineSpacing + 6;

    drawText('AGREED AND ACCEPTED', margin, y, 12, 'bold', primaryColor);
    y += lineSpacing;

    const sigY = y + 10;
    const sigDateY = sigY + 5;
    const sigNameY = sigY + 10;
    
    doc.line(margin, sigY, margin + 70, sigY);
    drawText('Buyer Signature', margin + 35, sigY + 2, 8, 'normal', 0, 'center');
    doc.line(margin, sigDateY + 1, margin + 70, sigDateY + 1);
    drawText('Date', margin + 35, sigDateY + 3, 8, 'normal', 0, 'center');
    drawText(`Buyer Name: ${data.buyer.name}`, margin, sigNameY + 3, 10, 'bold', primaryColor);
    drawText(`Witness: ${data.signatures.buyerWitness}`, margin, sigNameY + 7, 10, 'normal', 0);

    const sellerX = pageW - margin - 70;
    doc.line(sellerX, sigY, pageW - margin, sigY);
    drawText('Seller Signature', sellerX + 35, sigY + 2, 8, 'normal', 0, 'center');
    doc.line(sellerX, sigDateY + 1, pageW - margin, sigDateY + 1);
    drawText('Date', sellerX + 35, sigDateY + 3, 8, 'normal', 0, 'center');
    drawText(`Seller: WANBITE INVESTMENTS CO. LTD`, sellerX, sigNameY + 3, 10, 'bold', primaryColor);
    drawText(`Witness: ${data.signatures.sellerWitness}`, sellerX, sigNameY + 7, 10, 'normal', 0);
    y += 30;
    
    doc.setFillColor(primaryColor);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(9);
    const footerText = `Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`;
    doc.text(footerText, pageW / 2, doc.internal.pageSize.getHeight() - 4, null, null, "center");

    doc.save(`Car_Sales_Agreement_${data.buyer.name.replace(/\s/g, '_')}.pdf`);
}

// =================================================================
//                 11. FLEET MANAGEMENT MODULE
// =================================================================

const FLEET_STATUSES = [
    { id: "ship_to_mombasa", name: "On Ship to Mombasa", color: "bg-blue-100", border: "border-blue-400", button: "bg-blue-600 hover:bg-blue-700" },
    { id: "clearing_mombasa", name: "In Mombasa being cleared", color: "bg-yellow-100", border: "border-yellow-400", button: "bg-yellow-600 hover:bg-yellow-700" },
    { id: "taken_to_carrier", name: "In Mombasa taken to the carrier", color: "bg-orange-100", border: "border-orange-400", button: "bg-orange-600 hover:bg-orange-700" },
    { id: "transit_to_nairobi", name: "In transit from Mombasa to Nairobi", color: "bg-purple-100", border: "border-purple-400", button: "bg-purple-600 hover:bg-purple-700" },
    { id: "in_nairobi", name: "In Nairobi and picked from carrier", color: "bg-green-100", border: "border-green-400", button: "bg-green-600 hover:bg-green-700" },
    { id: "delivered_client", name: "Delivered to the client", color: "bg-teal-100", border: "border-teal-400", button: "bg-teal-600 hover:bg-teal-700" }
];

function getStatusInfo(statusName) {
    return FLEET_STATUSES.find(s => s.name === statusName) || { id: "unknown", name: statusName, color: "bg-gray-100", border: "border-gray-400", button: "bg-gray-600 hover:bg-gray-700" };
}

function handleFleetManagement() {
    if (!currentUser) {
        appContent.innerHTML = `
            <h2 class="text-3xl font-bold mb-6 text-secondary-red">Access Denied</h2>
            <p class="text-gray-800">Please sign in to access the Fleet Management dashboard.</p>
        `;
        return;
    }
    
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">Fleet Management Dashboard</h2>
        <div id="fleet-cars-list" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
            ${FLEET_STATUSES.map(status => `
                <div class="flex flex-col">
                    <h3 class="font-bold text-xs mb-2 text-primary-blue uppercase text-center border-b pb-1">${status.name}</h3>
                    <div id="fleet-column-${status.id}" class="space-y-2 flex-grow min-h-[200px] bg-gray-50 p-2 rounded">
                        <p class="text-center text-gray-400 text-xs mt-4">Loading...</p>
                    </div>
                </div>
            `).join('')}
        </div>
        <button onclick="showAddCarModal()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-6">Add New Vehicle</button>
    `;
    renderFleetDashboard();
}

function renderFleetDashboard() {
    db.collection("cars").orderBy("eta", "asc").onSnapshot(snapshot => {
        FLEET_STATUSES.forEach(status => {
            const column = document.getElementById(`fleet-column-${status.id}`);
            if (column) column.innerHTML = '';
        });

        if (snapshot.empty) {
            FLEET_STATUSES.forEach(status => {
                const column = document.getElementById(`fleet-column-${status.id}`);
                if (column) column.innerHTML = `<p class="text-center text-gray-500 text-sm">No cars.</p>`;
            });
            return;
        }

        const carCounts = {};
        snapshot.forEach(doc => {
            const car = { id: doc.id, ...doc.data() };
            const statusInfo = getStatusInfo(car.currentStatus);
            const column = document.getElementById(`fleet-column-${statusInfo.id}`);
            if (column) {
                column.innerHTML += renderCarCard(car);
                carCounts[statusInfo.id] = (carCounts[statusInfo.id] || 0) + 1;
            }
        });

        FLEET_STATUSES.forEach(status => {
            if (!carCounts[status.id]) {
                const column = document.getElementById(`fleet-column-${status.id}`);
                if (column) column.innerHTML = `<p class="text-center text-gray-500 text-xs mt-4">Empty</p>`;
            }
        });
    }, error => {
        console.error("Error fetching fleet cars:", error);
    });
}

function renderCarCard(car) {
    const statusInfo = getStatusInfo(car.currentStatus);
    const latestComment = car.statusHistory.length > 0 ? car.statusHistory[car.statusHistory.length - 1].comment : 'No recent comment.';
    
    return `
        <div class="car-card p-2 border ${statusInfo.border} ${statusInfo.color} rounded shadow-sm">
            <h4 class="text-xs font-bold text-gray-800 truncate">${car.makeModel}</h4>
            <p class="text-[10px] text-gray-700"><strong>Sales:</strong> ${car.salesPerson}</p>
            <p class="text-[10px] text-gray-700"><strong>ETA:</strong> <span class="text-secondary-red">${car.eta}</span></p>
            <button onclick="showUpdateStatusModal('${car.id}', '${car.makeModel}', '${car.currentStatus}', '${latestComment.replace(/'/g, "\\'")}')" 
                    class="mt-1 w-full text-white font-bold py-1 px-1 rounded text-[10px] transition duration-150 ${statusInfo.button}">
                Update
            </button>
        </div>
    `;
}

function showAddCarModal() {
    const initialStatus = FLEET_STATUSES[0].name;
    const modalHtml = `
        <div id="fleet-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
                <h3 class="text-xl font-semibold text-primary-blue mb-4">Add New Fleet Car</h3>
                <form id="add-car-form" onsubmit="event.preventDefault(); addFleetCar()">
                    <input type="text" id="carMakeModel" required placeholder="Make and Model" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="carVIN" required placeholder="VIN Number" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="date" id="carETA" required class="mt-2 block w-full p-2 border rounded-md">
                    <input type="text" id="salesPerson" required placeholder="Sales Person Responsible" class="mt-2 block w-full p-2 border rounded-md">
                    <h4 class="font-semibold text-sm mt-4 mb-2 text-primary-blue">Initial Status: ${initialStatus}</h4>
                    <textarea id="initialComment" required placeholder="Initial Comment" rows="2" class="mt-1 block w-full p-2 border rounded-md"></textarea>
                    <div class="flex justify-end space-x-3 mt-4">
                        <button type="button" onclick="document.getElementById('fleet-modal').remove()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-150">Cancel</button>
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-150">Add Car</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function addFleetCar() {
    const makeModel = document.getElementById('carMakeModel').value;
    const vin = document.getElementById('carVIN').value;
    const eta = document.getElementById('carETA').value;
    const salesPerson = document.getElementById('salesPerson').value;
    const initialComment = document.getElementById('initialComment').value;
    const initialStatus = FLEET_STATUSES[0].name;

    const newCar = {
        makeModel,
        vin,
        eta,
        salesPerson,
        currentStatus: initialStatus,
        statusHistory: [{
            status: initialStatus,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            comment: initialComment
        }],
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("cars").add(newCar);
        document.getElementById('fleet-modal').remove();
    } catch (error) {
        alert("Failed to add car: " + error.message);
    }
}

function showUpdateStatusModal(carId, makeModel, currentStatus, latestComment) {
    const statusOptionsHtml = FLEET_STATUSES
        .map(s => `<option value="${s.name}" ${s.name === currentStatus ? 'selected disabled' : ''}>${s.name}</option>`).join('');

    const modalHtml = `
        <div id="fleet-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
                <h3 class="text-xl font-semibold text-primary-blue mb-4">Update Status: ${makeModel}</h3>
                <form id="update-status-form" onsubmit="event.preventDefault(); updateCarStatus('${carId}')">
                    <label class="block text-sm font-medium text-gray-700 mt-2">New Status:</label>
                    <select id="newStatus" required class="mt-1 block w-full p-2 border rounded-md">
                        ${statusOptionsHtml}
                    </select>
                    <label class="block text-sm font-medium text-gray-700 mt-4">Logistics Note:</label>
                    <textarea id="newComment" required rows="3" class="mt-1 block w-full p-2 border rounded-md">${latestComment}</textarea>
                    <div class="flex justify-end space-x-3 mt-4">
                        <button type="button" onclick="document.getElementById('fleet-modal').remove()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-150">Cancel</button>
                        <button type="submit" class="bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md transition duration-150">Update</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function updateCarStatus(carId) {
    const newStatus = document.getElementById('newStatus').value;
    const newComment = document.getElementById('newComment').value;

    const newLogEntry = {
        status: newStatus,
        date: firebase.firestore.FieldValue.serverTimestamp(),
        comment: newComment
    };

    try {
        await db.collection("cars").doc(carId).update({
            currentStatus: newStatus,
            statusHistory: firebase.firestore.FieldValue.arrayUnion(newLogEntry)
        });
        document.getElementById('fleet-modal').remove();
    } catch (error) {
        alert("Failed to update status: " + error.message);
    }
}

// =================================================================
//                 12. HR MODULE
// =================================================================

function handleHRManagement() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">HR & Requisitions Module</h2>
        <div class="p-6 bg-secondary-red/10 rounded-xl border border-secondary-red">
            <p class="text-gray-800 font-semibold">Implementation Note:</p>
            <p>Forms for Requisition and Leave Applications would save data to 'requisitions' and 'leave_applications' collections.</p>
        </div>
    `;
}
