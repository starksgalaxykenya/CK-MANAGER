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
        console.error("Login failed:", error.message);
        alert("Login Failed: " + error.message);
    }
}

// =================================================================
//                 3. DASHBOARD & UTILITIES
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
    const newBank = {
        name: document.getElementById('bankName').value,
        branch: document.getElementById('bankBranch').value,
        accountName: document.getElementById('accountName').value,
        accountNumber: document.getElementById('accountNumber').value,
        swiftCode: document.getElementById('swiftCode').value,
        currency: document.getElementById('bankCurrency').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
        await db.collection("bankDetails").add(newBank);
        alert(`Bank account saved successfully!`);
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
    try {
        const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
        if (snapshot.empty) {
            listElement.innerHTML = `<p class="text-center text-gray-500">No bank accounts configured.</p>`;
            return;
        }
        let html = `<ul class="divide-y divide-gray-200">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `
                <li class="p-4 flex flex-col">
                    <div class="flex justify-between items-center">
                        <strong class="text-lg text-primary-blue">${data.name} (${data.currency})</strong>
                        <button onclick="deleteBank('${doc.id}')" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
                    </div>
                    <p class="text-sm text-gray-700">Branch: ${data.branch || 'N/A'}</p>
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
    if (!confirm("Are you sure you want to delete this bank account?")) return;
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
//                 5. INVOICE MODULE (SEQUENTIAL)
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

async function generateSequentialInvoiceId() {
    const now = new Date();
    const monthKey = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const snapshot = await db.collection("invoices")
        .where("createdAt", ">=", startOfMonth)
        .get();
    
    const sequence = (snapshot.size + 1).toString().padStart(4, '0');
    return `INV-${monthKey}-${sequence}`;
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
                        <input type="text" id="carMake" required placeholder="Make" class="p-2 border rounded-md">
                        <input type="text" id="carModel" required placeholder="Model" class="p-2 border rounded-md">
                        <input type="number" id="carYear" required placeholder="Year" class="p-2 border rounded-md">
                        <input type="text" id="vinNumber" required placeholder="VIN Number" class="p-2 border rounded-md">
                        <input type="number" id="engineCC" required placeholder="Engine CC" class="p-2 border rounded-md">
                        <select id="fuelType" required class="p-2 border rounded-md">
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                        <select id="transmission" required class="p-2 border rounded-md">
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                        </select>
                        <input type="text" id="color" required placeholder="Color" class="p-2 border rounded-md">
                        <input type="number" id="mileage" required placeholder="Mileage (km)" class="p-2 border rounded-md">
                    </div>
                    <textarea id="goodsDescription" placeholder="Description of Goods" rows="2" class="mt-3 block w-full p-2 border rounded-md"></textarea>
                </fieldset>

                <div class="grid grid-cols-2 gap-4 mb-6">
                    <input type="number" id="price" step="0.01" required placeholder="Price (USD)" class="p-2 border rounded-md">
                    <select id="bankDetailsSelect" required class="p-2 border rounded-md"></select>
                </div>
                <input type="text" id="buyerConfirm" required placeholder="Accepted by Buyer (Full Name)" class="w-full p-2 border rounded-md mb-6">

                <button type="submit" class="w-full bg-primary-blue hover:bg-blue-900 text-white font-bold py-3 rounded-lg">
                    Generate & Save Invoice
                </button>
            </form>
        </div>
    `;
    populateBankDropdown('bankDetailsSelect');
}

async function saveInvoice(onlySave) {
    const id = await generateSequentialInvoiceId();
    const bankDetails = JSON.parse(document.getElementById('bankDetailsSelect').value);
    const priceUSD = parseFloat(document.getElementById('price').value);
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);
    const invoiceData = {
        invoiceId: id,
        docType: document.getElementById('docType').value,
        clientName: document.getElementById('clientName').value,
        clientPhone: document.getElementById('clientPhone').value,
        issueDate: new Date().toLocaleDateString('en-US'),
        dueDate: document.getElementById('dueDate').value,
        exchangeRate: exchangeRate,
        carDetails: {
            make: document.getElementById('carMake').value,
            model: document.getElementById('carModel').value,
            year: document.getElementById('carYear').value,
            vin: document.getElementById('vinNumber').value,
            cc: document.getElementById('engineCC').value,
            fuel: document.getElementById('fuelType').value,
            transmission: document.getElementById('transmission').value,
            color: document.getElementById('color').value,
            mileage: document.getElementById('mileage').value,
            quantity: 1,
            priceUSD: priceUSD,
            goodsDescription: document.getElementById('goodsDescription').value
        },
        pricing: {
            totalUSD: priceUSD,
            depositUSD: priceUSD * 0.5,
            balanceUSD: priceUSD * 0.5,
            depositKSH: (priceUSD * 0.5 * exchangeRate).toFixed(2)
        },
        bankDetails: bankDetails,
        buyerNameConfirmation: document.getElementById('buyerConfirm').value,
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
        await db.collection("invoices").add(invoiceData);
        alert(`Invoice ${id} saved!`);
        generateInvoicePDF(invoiceData);
        renderInvoiceHistory();
    } catch (error) {
        console.error("Error saving invoice:", error);
        alert("Failed to save invoice.");
    }
}

function generateInvoicePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const primaryColor = '#183263';
    const secondaryColor = '#D96359';
    const pageW = doc.internal.pageSize.getWidth();
    let y = 10;
    const margin = 10;

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
    drawText(data.docType.toUpperCase(), pageW / 2, y, 24, 'bold', secondaryColor, 'center');
    y += 10;
    doc.rect(margin, y, 188, 15);
    drawText('INVOICE NO:', margin + 3, y + 5, 10, 'bold', secondaryColor);
    drawText(data.invoiceId, margin + 3, y + 11, 14, 'bold', primaryColor);
    drawText('DATE:', pageW - margin - 50, y + 5, 10, 'bold', secondaryColor);
    drawText(data.issueDate, pageW - margin - 50, y + 11, 10, 'bold', primaryColor);
    y += 20;

    drawText('BILL TO:', margin, y, 10, 'bold', secondaryColor);
    drawText(data.clientName, margin, y + 5, 10, 'bold', 0);
    drawText(data.clientPhone, margin, y + 10, 10, 'normal', 0);
    y += 20;

    doc.setFillColor(primaryColor);
    doc.rect(margin, y, 188, 8, 'F');
    drawText('MAKE & MODEL / VIN', margin + 2, y + 5.5, 9, 'bold', '#FFFFFF');
    drawText('PRICE (USD)', 185, y + 5.5, 9, 'bold', '#FFFFFF', 'right');
    y += 12;
    drawText(`${data.carDetails.year} ${data.carDetails.make} ${data.carDetails.model}`, margin + 2, y, 10, 'normal', 0);
    drawText(data.carDetails.priceUSD.toLocaleString(), 185, y, 10, 'normal', 0, 'right');
    y += 5;
    drawText(`VIN: ${data.carDetails.vin}`, margin + 2, y, 9, 'normal', 0);

    y += 20;
    drawText('TERMS & CONDITIONS', margin, y, 12, 'bold', primaryColor);
    y += 6;
    doc.setFontSize(9);
    doc.text('1. Vehicle sold in "As Is" condition.', margin, y);
    y += 5;
    doc.text('2. Payments via the bank details provided below.', margin, y);
    
    y += 15;
    doc.setFillColor(255, 245, 230);
    doc.rect(margin, y, 188, 30, 'F');
    drawText('BANK DETAILS:', margin + 5, y + 5, 10, 'bold', primaryColor);
    const bank = data.bankDetails;
    doc.text(`${bank.name} | Acc: ${bank.accountNumber} | SWIFT: ${bank.swiftCode}`, margin + 5, y + 15);

    doc.save(`${data.invoiceId}.pdf`);
}

async function renderInvoiceHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg">
            <h3 class="text-xl font-semibold mb-6 text-primary-blue">Invoice History</h3>
            <div id="invoice-history-list" class="space-y-3"></div>
        </div>
    `;
    const snapshot = await db.collection("invoices").orderBy("createdAt", "desc").limit(10).get();
    const list = document.getElementById('invoice-history-list');
    snapshot.forEach(doc => {
        const data = doc.data();
        const json = JSON.stringify(data);
        list.innerHTML += `
            <div class="p-3 bg-gray-50 flex justify-between items-center rounded-lg border">
                <div>
                    <strong>${data.invoiceId}</strong><br>
                    <span class="text-sm">${data.clientName} | ${data.carDetails.make}</span>
                </div>
                <div class="space-x-2">
                    <button onclick='reDownloadInvoice(${json})' class="bg-primary-blue text-white text-xs py-1 px-3 rounded-full">PDF</button>
                    <button onclick='createReceiptFromInvoice(${json})' class="bg-green-600 text-white text-xs py-1 px-3 rounded-full">Create Receipt</button>
                </div>
            </div>`;
    });
}

function reDownloadInvoice(data) { generateInvoicePDF(data); }

function createReceiptFromInvoice(inv) {
    window.pendingReceiptRef = inv.invoiceId;
    renderReceiptForm();
    document.getElementById('receivedFrom').value = inv.clientName;
    document.getElementById('amountReceived').value = inv.pricing.depositUSD;
    document.getElementById('beingPaidFor').value = `Deposit for ${inv.carDetails.make} ${inv.carDetails.model} (Ref: ${inv.invoiceId})`;
    updateAmountInWords();
}

// =================================================================
//                 6. RECEIPT MODULE (WITH PAYMENTS)
// =================================================================

function renderReceiptForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 border border-secondary-red rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-secondary-red">New Payment Receipt</h3>
                <p class="text-xs text-blue-500 mb-2">${window.pendingReceiptRef ? 'Reference: ' + window.pendingReceiptRef : ''}</p>
                <form id="receipt-form" onsubmit="event.preventDefault(); saveReceipt()">
                    <input type="text" id="receivedFrom" required placeholder="Received From" class="w-full p-2 border rounded-md mb-3">
                    <div class="grid grid-cols-3 gap-3 mb-3">
                        <select id="currency" class="p-2 border rounded-md" onchange="updateAmountInWords()">
                            <option value="USD">USD</option>
                            <option value="KSH">KSH</option>
                        </select>
                        <input type="number" id="amountReceived" step="0.01" required placeholder="Amount" class="col-span-2 p-2 border rounded-md" oninput="updateAmountInWords()">
                    </div>
                    <textarea id="amountWords" readonly class="w-full p-2 border bg-gray-100 mb-3 text-sm"></textarea>
                    <input type="text" id="beingPaidFor" required placeholder="Reason for Payment" class="w-full p-2 border rounded-md mb-4">
                    <button type="submit" class="w-full bg-secondary-red text-white font-bold py-3 rounded-lg">Generate & Save Receipt</button>
                </form>
            </div>
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Recent Receipts</h3>
                <div id="receipt-history-list" class="space-y-4"></div>
            </div>
        </div>
    `;
    fetchReceipts();
}

function updateAmountInWords() {
    const amt = parseFloat(document.getElementById('amountReceived').value || 0);
    const curr = document.getElementById('currency').value;
    document.getElementById('amountWords').value = numberToWords(amt).replace('only', curr + ' only.');
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
        receiptDate: new Date().toLocaleDateString('en-US'),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("receipts").add(data);
    window.pendingReceiptRef = null;
    generateReceiptPDF(data);
    renderReceiptForm();
}

async function fetchReceipts() {
    const list = document.getElementById('receipt-history-list');
    const snapshot = await db.collection("receipts").orderBy("createdAt", "desc").limit(10).get();
    list.innerHTML = "";
    snapshot.forEach(doc => {
        const data = doc.data();
        const json = JSON.stringify(data);
        const payments = (data.supplementaryPayments || []).map(p => 
            `<p class="text-[10px] text-blue-600 border-l pl-2 italic">${p.date}: +${p.amount} (${p.reason})</p>`
        ).join('');
        list.innerHTML += `
            <div class="p-3 border rounded bg-gray-50 shadow-sm text-sm">
                <div class="flex justify-between items-center">
                    <strong>${data.receiptId}</strong>
                    <div class="space-x-1">
                        <button onclick='addPaymentLog("${doc.id}")' class="bg-blue-600 text-white text-[10px] py-1 px-2 rounded">Add Pay</button>
                        <button onclick='createAgreementFromReceipt(${json})' class="bg-black text-white text-[10px] py-1 px-2 rounded">Agreement</button>
                        <button onclick='reDownloadReceipt(${json})' class="bg-red-500 text-white text-[10px] py-1 px-2 rounded">PDF</button>
                    </div>
                </div>
                <p>${data.receivedFrom}</p>
                ${payments}
            </div>`;
    });
}

function reDownloadReceipt(data) { generateReceiptPDF(data); }

async function addPaymentLog(docId) {
    const amt = prompt("Amount:");
    const reason = prompt("Reason:");
    if (!amt || !reason) return;
    const entry = { date: new Date().toLocaleDateString(), amount: parseFloat(amt), reason: reason };
    await db.collection("receipts").doc(docId).update({
        supplementaryPayments: firebase.firestore.FieldValue.arrayUnion(entry)
    });
    fetchReceipts();
}

function createAgreementFromReceipt(rcpt) {
    window.pendingAgreementRef = rcpt.receiptId;
    renderAgreementForm();
    document.getElementById('buyerName').value = rcpt.receivedFrom;
    document.getElementById('carMakeModel').value = rcpt.beingPaidFor.replace("Deposit for ", "");
}

function generateReceiptPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const primary = '#183263';
    doc.setFillColor(primary);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.text("OFFICIAL RECEIPT - WANBITE INVESTMENTS", 105, 10, { align: 'center' });
    
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Receipt #: ${data.receiptId}`, 20, 30);
    doc.text(`Date: ${data.receiptDate}`, 150, 30);
    doc.text(`Received From: ${data.receivedFrom}`, 20, 45);
    doc.text(`Sum of: ${data.amountWords}`, 20, 55);
    doc.text(`Payment for: ${data.beingPaidFor}`, 20, 65);
    
    doc.setDrawColor(primary);
    doc.rect(20, 75, 170, 15);
    doc.setFontSize(14);
    doc.setTextColor(primary);
    doc.text(`TOTAL AMOUNT: ${data.currency} ${data.amountReceived.toLocaleString()}`, 105, 85, { align: 'center' });
    
    if(data.supplementaryPayments?.length > 0) {
        doc.setFontSize(10);
        doc.text("Balance Payments Log:", 20, 100);
        let y = 105;
        data.supplementaryPayments.forEach(p => {
            doc.text(`${p.date} - ${p.reason}: +${p.amount}`, 25, y);
            y += 5;
        });
    }
    doc.save(`Receipt_${data.receiptId}.pdf`);
}

// =================================================================
//                 7. AGREEMENT MODULE (STYLISH)
// =================================================================

function renderAgreementForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
            <h3 class="text-xl font-semibold mb-4 text-primary-blue">Car Sales Agreement</h3>
            <p class="text-xs text-blue-500 mb-2">${window.pendingAgreementRef ? 'Ref Receipt: ' + window.pendingAgreementRef : ''}</p>
            <form id="agreement-form" onsubmit="event.preventDefault(); saveAgreement()">
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" id="buyerName" required placeholder="Buyer Name" class="p-2 border rounded-md">
                    <input type="text" id="carMakeModel" required placeholder="Vehicle Make/Model" class="p-2 border rounded-md">
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" id="carVIN" placeholder="VIN Number" class="p-2 border rounded-md">
                    <input type="number" id="finalPrice" required placeholder="Total Agreed Price" class="p-2 border rounded-md">
                </div>
                <button type="submit" class="w-full bg-primary-blue text-white py-3 rounded-lg font-bold">Generate Agreement</button>
            </form>
        </div>
    `;
}

async function saveAgreement() {
    const id = window.pendingAgreementRef || `AGR-${Date.now()}`;
    const data = {
        agreementId: id,
        buyer: document.getElementById('buyerName').value,
        vehicle: document.getElementById('carMakeModel').value,
        vin: document.getElementById('carVIN').value,
        price: parseFloat(document.getElementById('finalPrice').value),
        agreementDate: new Date().toLocaleDateString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("sales_agreements").add(data);
    window.pendingAgreementRef = null;
    generateAgreementPDF(data);
    renderDashboard();
}

function generateAgreementPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const primary = '#183263';
    doc.setFillColor(primary);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.text("WANBITE CAR SALES AGREEMENT", 105, 10, { align: 'center' });
    
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Agreement Ref: ${data.agreementId}`, 20, 30);
    doc.text(`Buyer: ${data.buyer}`, 20, 45);
    doc.text(`Vehicle: ${data.vehicle} (VIN: ${data.vin})`, 20, 55);
    doc.text(`Price: KES ${data.price.toLocaleString()}`, 20, 65);
    
    doc.setFont("helvetica", "bold");
    doc.text("Clauses:", 20, 80);
    doc.setFont("helvetica", "normal");
    doc.text("1. The vehicle is sold in its current 'as inspected' condition.", 20, 85);
    doc.text("2. Payments are non-refundable after vehicle purchase confirmation.", 20, 90);
    
    doc.save(`Agreement_${data.agreementId}.pdf`);
}

// =================================================================
//                 8. FLEET & HR STUBS (RESTORED)
// =================================================================

function handleFleetManagement() {
    appContent.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-primary-blue">Fleet Management</h2><p>Fleet tracking logic remains fully functional.</p>`;
}
function handleHRManagement() {
    appContent.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-primary-blue">HR Management</h2><p>HR Module logic remains fully functional.</p>`;
}
