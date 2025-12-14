// =================================================================
//                 1. FIREBASE CONFIGURATION & INIT
// =================================================================

// !!! IMPORTANT: REPLACE WITH YOUR ACTUAL FIREBASE CONFIG !!!
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

/**
 * The central listener that controls the app's state (logged in vs. logged out).
 */
auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        // User is signed in.
        authStatus.innerHTML = `<span class="mr-3 text-sm">Hello, ${user.email}</span>
                                <button onclick="handleLogout()" class="bg-secondary-red hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                                    Logout
                                </button>`;
        renderDashboard();
    } else {
        // User is signed out.
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
    
    // Update navigation links
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

// =================================================================
//                 4. DOCUMENT GENERATOR ROUTING (UPDATED)
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
// -----------------------------------------------------------------
// NOTE: renderAgreementForm() is fully defined in Section 10 now
// -----------------------------------------------------------------


// =================================================================
//                 5. RECEIPT/PAYMENT LOGIC (COMPREHENSIVELY REVISED)
// =================================================================

/**
 * Helper function to convert a number to words (for KES amounts).
 * This is a simplified function and may not handle extremely large numbers perfectly.
 */
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


/**
 * Renders the new comprehensive Receipt form.
 */
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

/**
 * Updates the amount in words field dynamically.
 */
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
    } else { // KSH
        words = words.replace('only', 'Kenya Shillings only.');
    }

    wordsField.value = words;
}

/**
 * Generates a custom receipt ID based on date, type, and name.
 */
function generateReceiptId(type, name) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const typePart = type.split(' ')[0].toUpperCase().substring(0, 3);
    const namePart = name.split(' ')[0].toUpperCase().substring(0, 3);
    return `RCPT-${datePart}-${typePart}-${namePart}`;
}

/**
 * Saves the new receipt details to Firestore.
 */
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
        fetchReceipts(); // Refresh history
    } catch (error) {
        console.error("Error saving receipt:", error);
        alert("Failed to save receipt: " + error.message);
    }
}

/**
 * Fetches and displays recent receipts.
 */
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
                // Ensure Timestamp is handled for JSON stringify
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

/**
 * Re-downloads the PDF for a selected receipt document from history.
 * @param {object} data - The receipt data object retrieved from Firestore.
 */
function reDownloadReceipt(data) {
    // Ensure data.receiptDate is set (should be from the save logic)
    if (!data.receiptDate) {
         data.receiptDate = new Date().toLocaleDateString('en-US'); // Fallback
    }
    generateReceiptPDF(data);
}

/**
 * Generates and downloads a custom PDF for the comprehensive receipt. (SPACING ADJUSTED)
 */
function generateReceiptPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 

    const primaryColor = '#183263'; // WanBite Blue
    const secondaryColor = '#D96359'; // Red
    
    const pageW = doc.internal.pageSize.getWidth();
    let y = 10; 
    const margin = 10;
    const boxW = pageW - (2 * margin);
    // Increased base line height for better spacing
    const lineHeight = 7; 

    // --- HELPER FUNCTION ---
    const drawText = (text, x, y, size, style = 'normal', color = primaryColor, align = 'left') => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(color);
        doc.text(text, x, y, { align: align });
    };

    // =================================================================
    // HEADER SECTION
    // =================================================================
    
    // Top Bar (Color #183263)
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageW, 15, 'F');
    
    drawText('WanBite Investments Co. Ltd.', pageW / 2, 8, 18, 'bold', '#FFFFFF', 'center');
    drawText('carskenya.co.ke', pageW / 2, 13, 10, 'normal', '#FFFFFF', 'center');
    
    y = 25;

    // RECEIPT TITLE
    doc.setTextColor(primaryColor);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL RECEIPT", pageW / 2, y, null, null, "center");
    y += 12; // Increased space after title
    
    // Receipt Metadata Box (ID and Date)
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, boxW, 15);
    
    drawText('RECEIPT NO:', margin + 3, y + 5, 10, 'bold', secondaryColor);
    drawText(data.receiptId, margin + 3, y + 11, 14, 'bold', primaryColor);
    
    drawText('DATE:', pageW - margin - 3, y + 5, 10, 'bold', secondaryColor, 'right');
    drawText(data.receiptDate, pageW - margin - 3, y + 11, 14, 'bold', primaryColor, 'right');
    y += 20; // Increased space below the box

    // =================================================================
    // MAIN BODY
    // =================================================================

    // Received From
    doc.setTextColor(primaryColor);
    drawText('RECEIVED FROM:', margin, y, 10, 'bold');
    doc.setDrawColor(0);
    doc.line(margin + 35, y, pageW - margin, y);
    drawText(data.receivedFrom, margin + 35, y - 0.5, 12, 'bold', 0);
    y += lineHeight + 2; // Increased space

    // The Sum of Money (Words)
    drawText('THE SUM OF:', margin, y + 3, 10, 'bold');
    doc.setFillColor(240, 240, 240); 
    doc.rect(margin + 35, y, boxW - 35, lineHeight * 2.5, 'F'); // Box for words
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(margin + 35, y, boxW - 35, lineHeight * 2.5);
    
    doc.setTextColor(0);
    doc.setFontSize(11);
    // Use splitTextToSize to wrap the words nicely within the box
    const wrappedWords = doc.splitTextToSize(data.amountWords, boxW - 37);
    doc.text(wrappedWords, margin + 36, y + 4);
    y += lineHeight * 2.5 + 5; // Increased space below the box

    // Being Paid For
    drawText('BEING PAID FOR:', margin, y, 10, 'bold', primaryColor);
    doc.line(margin + 35, y, pageW - margin, y);
    drawText(data.beingPaidFor, margin + 35, y - 0.5, 12, 'bold', 0);
    y += lineHeight + 4; // Increased space

    // Payment References Section
    doc.setTextColor(primaryColor);
    drawText('PAYMENT DETAILS:', margin, y, 10, 'bold');
    y += 4; // Increased space after title

    doc.setFontSize(10);
    doc.setTextColor(0);

    // Row 1: Cheque and RTGS/TT
    doc.rect(margin, y, boxW * 0.45, lineHeight); // Cheque Box
    doc.text(`Cheque No: ${data.paymentDetails.chequeNo || 'N/A'}`, margin + 2, y + 4.5);
    doc.rect(margin + boxW * 0.55, y, boxW * 0.45, lineHeight); // RTGS/TT Box
    doc.text(`RTGS/TT No: ${data.paymentDetails.rtgsTtNo || 'N/A'}`, margin + boxW * 0.55 + 2, y + 4.5);
    y += lineHeight + 2; // Increased space

    // Row 2: Bank Used and Receipt Type
    doc.rect(margin, y, boxW * 0.45, lineHeight); // Bank Used Box
    doc.text(`Bank Used: ${data.paymentDetails.bankUsed || 'N/A'}`, margin + 2, y + 4.5);
    doc.rect(margin + boxW * 0.55, y, boxW * 0.45, lineHeight); // Receipt Type Box
    doc.text(`Receipt Type: ${data.receiptType}`, margin + boxW * 0.55 + 2, y + 4.5);
    y += lineHeight + 6; // Increased space

    // =================================================================
    // AMOUNT FIGURE (BIG BOX)
    // =================================================================
    const amountBoxH = 15;
    const amountBoxY = y + 5;
    
    // Total Amount Box (Right Side)
    doc.setFillColor(secondaryColor);
    doc.rect(pageW - margin - 70, amountBoxY, 70, amountBoxH, 'F');
    
    doc.setTextColor(255);
    drawText('AMOUNT FIGURE', pageW - margin - 65, amountBoxY + 4, 8, 'bold', 255);
    drawText(`${data.currency} ${data.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 5, amountBoxY + 11, 18, 'bold', 255, 'right');
    
    // Balance Details (Left Side)
    doc.setTextColor(primaryColor);
    drawText('BALANCE DETAILS', margin, amountBoxY + 4, 10, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0);

    const balanceText = data.balanceDetails.balanceRemaining > 0 
        ? `${data.currency} ${data.balanceDetails.balanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
        : 'ZERO';
    
    drawText(`Balance Remaining: ${balanceText}`, margin, amountBoxY + 10, 10);
    drawText(`Due On/Before: ${data.balanceDetails.balanceDueDate || 'N/A'}`, margin, amountBoxY + 14, 10);
    
    y = amountBoxY + amountBoxH + 7; // Increased space after the box

    // =================================================================
    // FOOTER/SIGNATURES
    // =================================================================

    doc.setTextColor(primaryColor);
    drawText('... With thanks', margin, y + 10, 12, 'italic', secondaryColor);
    
    doc.line(pageW - margin - 50, y + 15, pageW - margin, y + 15);
    drawText('For WanBite Investment Co. LTD', pageW - margin - 50, y + 19, 10, 'normal', primaryColor);
    y += 25;


    // --- Global Footer ---
    doc.setFillColor(primaryColor);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(9);
    const footerText = `Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`;
    doc.text(footerText, pageW / 2, doc.internal.pageSize.getHeight() - 4, null, null, "center");

    doc.save(`Receipt_${data.receiptId}.pdf`);
      }

// =================================================================
//                 7. BANK MANAGEMENT MODULE (NEW)
// =================================================================

/**
 * Renders the interface for adding and managing bank accounts.
 */
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

/**
 * Saves new bank details to the 'bankDetails' Firestore collection.
 */
async function addBankDetails() {
    const bankName = document.getElementById('bankName').value;
    const bankBranch = document.getElementById('bankBranch').value; // <-- NEW FIELD
    const accountName = document.getElementById('accountName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const swiftCode = document.getElementById('swiftCode').value;
    const currency = document.getElementById('currency').value;

    const newBank = {
        name: bankName,
        branch: bankBranch, // <-- NEW FIELD SAVED TO FIRESTORE
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
        fetchAndDisplayBankDetails(); // Refresh the list
    } catch (error) {
        console.error("Error saving bank details:", error);
        alert("Failed to save bank details: " + error.message);
    }
}

/**
 * Fetches and displays all saved bank details in the list.
 * (Updated to display the branch)
 */
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
/**
 * Deletes a bank document from Firestore.
 * @param {string} bankId - The Firestore document ID of the bank.
 */
async function deleteBank(bankId) {
    if (!confirm("Are you sure you want to delete this bank account?")) {
        return;
    }
    try {
        await db.collection("bankDetails").doc(bankId).delete();
        alert("Bank account deleted successfully!");
        fetchAndDisplayBankDetails(); // Refresh the list
    } catch (error) {
        console.error("Error deleting bank:", error);
        alert("Failed to delete bank account.");
    }
}


// =================================================================
//                 6. INVOICE/PROFORMA LOGIC (UPDATED)
// =================================================================

// --- Fetch Bank Details Helper ---
async function fetchBankDetails() {
    const bankSelect = document.getElementById('bankDetailsSelect');
    if (!bankSelect) return; 

    // ... (rest of the function remains the same) ...

    try {
        const snapshot = await db.collection("bankDetails").get();
        // ... (check for empty snapshot) ...

        let options = '<option value="" disabled selected>Select Bank Account</option>';
        snapshot.forEach(doc => {
            const data = doc.data();
            const detailsJson = JSON.stringify(data);
            // UPDATED LINE: Include branch name in the displayed option text
            options += `<option value='${detailsJson}'>${data.name} - ${data.branch || 'No Branch'} (${data.currency})</option>`;
        });
        bankSelect.innerHTML = options;

    } catch (error) {
        // ... (error handling remains the same) ...
    }
}


/**
 * Renders the Invoice/Proforma form.
 */
function renderInvoiceForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg">
            <h3 class="text-xl font-semibold mb-4 text-primary-blue">Create Sales Invoice/Proforma</h3>
            <form id="invoice-form" onsubmit="event.preventDefault();">
                
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
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" id="clientName" required placeholder="Client Name (Invoice To)" class="mt-1 block w-full p-2 border rounded-md">
                        <input type="tel" id="clientPhone" required placeholder="Client Phone Number" class="mt-1 block w-full p-2 border rounded-md">
                    </div>
                </fieldset>

                <fieldset class="border p-4 rounded-lg mb-6">
                    <legend class="text-base font-semibold text-secondary-red px-2">Vehicle Details</legend>
                    <p class="mb-4 text-sm italic text-gray-600">Referring to used Motor Vehicle(s); We hereby confirm the following sale to you</p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <input type="text" id="carMake" required placeholder="Make (e.g., Toyota)" class="p-2 border rounded-md col-span-2 md:col-span-1">
                        <input type="text" id="carModel" required placeholder="Model (e.g., Land Cruiser)" class="p-2 border rounded-md col-span-2 md:col-span-1">
                        <input type="text" id="vinNumber" required placeholder="VIN Number" class="p-2 border rounded-md col-span-2">
                        <input type="number" id="carYear" required placeholder="Year" class="p-2 border rounded-md">
                        <input type="number" id="engineCC" required placeholder="Engine CC" class="p-2 border rounded-md">
                        <select id="fuelType" required class="p-2 border rounded-md">
                            <option value="" disabled selected>Fuel Type</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel Hybrid">Diesel Hybrid</option>
                            <option value="Petrol Hybrid">Petrol Hybrid</option>
                            <option value="Electric">Electric</option>
                        </select>
                        <select id="transmission" required class="p-2 border rounded-md">
                            <option value="" disabled selected>Transmission</option>
                            <option value="Manual">Manual</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Automatic With Clutch">Automatic With Clutch</option>
                            <option value="Manual Without Clutch">Manual Without Clutch</option>
                            <option value="Auto-Manual">Auto-Manual</option>
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
                    <p class="mt-4 text-sm text-gray-500">Seller: WANBITE INVESTMENTS COMPANY LIMITED</p>
                </fieldset>

                <div class="flex justify-end space-x-4">
                    <button type="button" onclick="saveInvoice(true)" class="bg-secondary-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150">
                        Commit & Save Invoice
                    </button>
                    <button type="button" onclick="saveInvoice(false)" class="bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-lg transition duration-150">
                        Download PDF
                    </button>
                </div>
            </form>
        </div>
    `;
    fetchBankDetails();
}

/**
 * Handles generating data, saving to Firestore, and optionally triggering PDF download.
 * @param {boolean} onlySave - True to only save, false to save and download.
 */
async function saveInvoice(onlySave = false) {
    // 1. Collect Data
    const form = document.getElementById('invoice-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Quick and dirty form serialization for required fields
    const docType = document.getElementById('docType').value;
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);
    const dueDate = document.getElementById('dueDate').value;
    const clientName = document.getElementById('clientName').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const carMake = document.getElementById('carMake').value;
    const carModel = document.getElementById('carModel').value;
    const vinNumber = document.getElementById('vinNumber').value;
    const carYear = document.getElementById('carYear').value;
    const engineCC = document.getElementById('engineCC').value;
    const fuelType = document.getElementById('fuelType').value;
    const transmission = document.getElementById('transmission').value;
    const color = document.getElementById('color').value;
    const mileage = document.getElementById('mileage').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const priceUSD = parseFloat(document.getElementById('price').value);
    const goodsDescription = document.getElementById('goodsDescription').value;
    const bankDetailsValue = document.getElementById('bankDetailsSelect').value;
    const buyerNameConfirmation = document.getElementById('buyerNameConfirmation').value;

    // ... Validation checks ...
    if (isNaN(priceUSD) || priceUSD <= 0) {
        alert("Please enter a valid Purchase Price.");
        return;
    }

    // Parse Bank Details from JSON string
    const bankDetails = JSON.parse(bankDetailsValue);

    // 2. Calculate values
    const totalPriceUSD = priceUSD * quantity;
    const depositUSD = totalPriceUSD * 0.50;
    const balanceUSD = totalPriceUSD * 0.50;
    const depositKSH = depositUSD * exchangeRate;
    
    // 3. Construct Invoice Data Object
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

    // 4. Save to Firestore
    try {
        const docRef = await db.collection("invoices").add(invoiceData);
        alert(`${docType} ${generatedInvoiceId} saved successfully!`);
        
        // 5. Download PDF if requested
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
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const namePart = clientName.split(' ')[0].toUpperCase().substring(0, 3);
    const modelPart = carModel.toUpperCase().substring(0, 3);
    return `${datePart}-${namePart}-${modelPart}${carYear}`;
}


/**
 * Generates a beautifully designed, one-page PDF for the invoice/proforma. (FIXED LAYOUT)
 */
function generateInvoicePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, mm, A4

    const primaryColor = '#183263'; 
    const secondaryColor = '#D96359';
    
    const pageW = doc.internal.pageSize.getWidth();
    let y = 10; 
    const margin = 10;
    const termIndent = 5; // Indent for the list text (25mm)

    // --- HELPER FUNCTIONS ---
    const drawText = (text, x, y, size, style = 'normal', color = primaryColor, align = 'left') => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(color);
        doc.text(text, x, y, { align: align });
    };

    /**
     * Draws a numbered/bulleted term, handling line wrapping and applying bold/color to specific price elements.
     * @param {object} doc - jsPDF instance.
     * @param {number} yStart - Current Y position.
     * @param {string} bullet - The bullet point (e.g., 'a.', '•').
     * @param {string} text - The clause text containing price strings to highlight.
     * @returns {number} The new Y position after the text.
     */
    const drawTerm = (doc, yStart, bullet, text) => {
        const textWidth = 188 - margin - termIndent; // Max width for text (188 - 15 = 173mm)
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor);
        doc.text(bullet, margin, yStart);
        
        doc.setFont("helvetica", "normal");
        let lines = doc.splitTextToSize(text, textWidth);
        let currentY = yStart;
        const lineHeight = 4.5;
        
        lines.forEach(line => {
            let currentX = margin + termIndent;
            
            // Check for USD price pattern in the line
            const regex = /(USD\s[0-9,.]+|KSH\s[0-9,.]+)/g;
            let match;
            let lastIndex = 0;

            doc.setTextColor(primaryColor); // Default color
            doc.setFont("helvetica", "normal");

            while ((match = regex.exec(line)) !== null) {
                // Draw text before the price
                let preText = line.substring(lastIndex, match.index);
                doc.text(preText, currentX, currentY);
                currentX += doc.getStringUnitWidth(preText) * doc.getFontSize() / doc.internal.scaleFactor;
                
                // Draw the price in bold red
                let priceText = match[0];
                doc.setTextColor(secondaryColor);
                doc.setFont("helvetica", "bold");
                doc.text(priceText, currentX, currentY);
                currentX += doc.getStringUnitWidth(priceText) * doc.getFontSize() / doc.internal.scaleFactor;
                
                // Reset font and color
                doc.setTextColor(primaryColor);
                doc.setFont("helvetica", "normal");
                lastIndex = match.index + priceText.length;
            }

            // Draw remaining text after the last price (or the whole line if no price was found)
            let postText = line.substring(lastIndex);
            doc.text(postText, currentX, currentY);
            
            currentY += lineHeight;
        });

        return currentY + 1; // Advance Y position by a little extra padding
    };

    // =================================================================
    // HEADER SECTION
    // =================================================================
    
    // Top Bar (Color #183263)
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageW, 15, 'F');
    
    drawText('WanBite Investments Co. Ltd.', pageW / 2, 8, 18, 'bold', '#FFFFFF', 'center');
    drawText('carskenya.co.ke', pageW / 2, 13, 10, 'normal', '#FFFFFF', 'center');
    
    y = 25;

    // Document Type and Invoice ID
    drawText(data.docType.toUpperCase(), margin, y, 26, 'bold', primaryColor);
    y += 10;

    drawText(`Invoice ID: ${data.invoiceId}`, margin, y, 14);
    y += 10;

    // =================================================================
    // METADATA (Client & Dates)
    // =================================================================

    doc.setFillColor(240, 240, 240); 
    doc.rect(margin, y, 188, 30, 'F');
    doc.setTextColor(primaryColor);

    drawText('INVOICE TO:', 15, y + 5, 10, 'bold');
    drawText(data.clientName, 15, y + 10, 14, 'bold');
    drawText(`Phone: ${data.clientPhone}`, 15, y + 15, 10);
    
    drawText('DATE ISSUED:', 120, y + 5, 10, 'bold');
    drawText(data.issueDate, 120, y + 10, 12);
    
    drawText('DUE DATE:', 160, y + 5, 10, 'bold');
    drawText(data.dueDate, 160, y + 10, 12, 'bold', secondaryColor);
    
    y += 35; 

    // =================================================================
    // VEHICLE DETAILS TABLE
    // =================================================================
    
    drawText('DESCRIPTION OF GOODS', margin, y, 14, 'bold', primaryColor);
    y += 5;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Referring to used Motor Vehicle(s); We hereby confirm the following sale to you:", margin, y + 2);
    y += 8;

    // Table Header
    doc.setFillColor(primaryColor);
    doc.rect(margin, y, 188, 8, 'F');
    doc.setTextColor(255);
    drawText('Make/Model', 12, y + 5.5, 9, 'bold');
    drawText('VIN / Year', 50, y + 5.5, 9, 'bold');
    drawText('Specs (CC/Fuel/Trans)', 85, y + 5.5, 9, 'bold');
    drawText('Mileage/Color', 135, y + 5.5, 9, 'bold');
    drawText('QTY', 160, y + 5.5, 9, 'bold');
    drawText('PRICE (USD)', 185, y + 5.5, 9, 'bold', 255, 'right');
    y += 8;

    // Table Row
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
    
    // Description of Goods
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.text(`Description: ${data.carDetails.goodsDescription}`, 12, y + 4);
    y += 8;
    
    // Totals Box
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(140, y, 58, 20); 
    
    drawText('TOTAL PRICE (C&F MSA):', 145, y + 5, 10, 'bold', primaryColor);
    
    drawText(`USD ${data.pricing.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 185, y + 15, 16, 'bold', secondaryColor, 'right');
    y += 25;
    
    // =================================================================
    // TERMS OF PURCHASE (FIXED TEXT WRAPPING AND BOLD PRICE)
    // =================================================================

    drawText('TERMS OF PURCHASE PRICE (C&F TO MSA)', margin, y, 14, 'bold', primaryColor);
    y += 5;
    
    // Term 1: Currency Clause
    y = drawTerm(doc, y, '•', 'All payments due under this contract shall be made in USD. In the event that payments are made in any other currency the same shall be subject to the current forex exchange rate.');

    // Term 2: Price and Payment Schedule (The intro line)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(primaryColor);
    let priceTextIntro = `Purchase Price in the sum of USD ${data.pricing.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} shall be paid as follows on/by the DUE DATE:`;
    // Using drawTerm logic to wrap the intro line as well
    let priceLinesIntro = doc.splitTextToSize(priceTextIntro, 188);
    doc.text(priceLinesIntro, margin, y);
    y += (priceLinesIntro.length * 4.5) + 1;

    // Term 2a: Deposit (Price bolded and red by drawTerm)
    let depositText = `A deposit of USD ${data.pricing.depositUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} being fifty percent (50%) of the purchase price on execution of the contract.`;
    y = drawTerm(doc, y, 'a.', depositText);

    // Term 2b: Balance (Price bolded and red by drawTerm)
    let balanceText = `The balance of USD ${data.pricing.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} within ten (10) days after the date of Bill of Lading. The seller shall promptly notify the buyer of the date for due compliance.`;
    y = drawTerm(doc, y, 'b.', balanceText);

    // Term 2c: BOL Release
    y = drawTerm(doc, y, 'c.', 'The original Bill of Lading will be issued to the buyer upon confirmation of full receipt of the purchase price.');

    // Term 2d: Cancellation/Forfeiture
    y = drawTerm(doc, y, 'd.', 'If you cancel to buy before or after shipment after purchase is confirmed, your deposit is to be forfeited.');

    // Term 2e: As Is Condition
    y = drawTerm(doc, y, 'e.', 'All the vehicles are subject to AS IS CONDITION.');

    // Term 2f: Third Party Payment
    y = drawTerm(doc, y, 'f.', 'Payment will be made by the invoiced person. If a third party makes a payment, please kindly inform us the relationship due to security reasons.');
    y += 5;
    
    // =================================================================
    // PAYMENT INSTRUCTIONS (FIXED TO NEW LAYOUT)
    // =================================================================
    
    doc.setFillColor(255, 245, 230); 
    doc.rect(margin, y, 188, 40, 'F'); // Increased height for more lines
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, 188, 40);
    
    let currentY_bank = y + 5;
    const padding = 6;
    const rightX = 190 - margin;
    
    // Title
    drawText('KINDLY PAY USD / KSH TO THE FOLLOWING BANK ACCOUNT:', 15, currentY_bank, 11, 'bold', primaryColor);
    currentY_bank += 5; // Move down after the title

    // Exchange Rate Note - far right
    doc.setFontSize(8);
    doc.setTextColor(primaryColor);
    doc.text(`Exchange rate used USD 1 = KES ${data.exchangeRate}`, rightX, y + 5, null, null, "right");
    doc.text(`NOTE: Due date is ${data.dueDate}`, rightX, y + 10, null, null, "right");
    
    // Deposit amount display
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(secondaryColor);
    doc.text(`USD ${data.pricing.depositUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 15, currentY_bank);
    doc.text(`/ KSH ${data.pricing.depositKSH.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 70, currentY_bank);
    currentY_bank += 7;

    // Bank Details - Each on its own line
    doc.setFontSize(9);
    doc.setTextColor(0); // Black for details

    doc.text(`Bank Name: ${data.bankDetails.name}`, 15, currentY_bank);
    currentY_bank += padding;
    
    doc.text(`Branch Name: ${data.bankDetails.branch || 'N/A'}`, 15, currentY_bank);
    currentY_bank += padding;
    
    doc.text(`Account Name: ${data.bankDetails.accountName}`, 15, currentY_bank);
    currentY_bank += padding;

    doc.text(`Account No: ${data.bankDetails.accountNumber} (${data.bankDetails.currency})`, 15, currentY_bank);
    currentY_bank += padding;

    doc.text(`SWIFT/BIC Code: ${data.bankDetails.swiftCode}`, 15, currentY_bank);
    currentY_bank += padding - 5; // Less padding before attention clause

    y += 40; // The total height of the instruction box

    // Attention Clause
    doc.setTextColor(secondaryColor);
    drawText('[ATTENTION] The Buyer Should bear the cost of Bank Charge when remitting T/T', margin, y + 5, 9, 'bold');
    y += 10;
    
    // =================================================================
    // CONFIRMATION SIGNATURES
    // =================================================================

    doc.setDrawColor(primaryColor);
    doc.line(margin, y + 15, 90, y + 15);
    drawText(`Accepted and Confirmed by Buyer: ${data.buyerNameConfirmation}`, margin, y + 19, 10);

    doc.line(110, y + 15, 190, y + 15);
    drawText('Seller: WANBITE INVESTMENTS COMPANY LIMITED', 110, y + 19, 10);
    y += 30;

    // =================================================================
    // FOOTER
    // =================================================================

    doc.setFillColor(primaryColor);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(9);
    const footerText = `Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`;
    doc.text(footerText, pageW / 2, doc.internal.pageSize.getHeight() - 4, null, null, "center");

    doc.save(`${data.docType}_${data.invoiceId}.pdf`);
                  }


// =================================================================
//                 8. INVOICE HISTORY MODULE (NEW)
// =================================================================

/**
 * Renders the container for the Invoice History list.
 */
function renderInvoiceHistory() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg">
            <h3 class="text-xl font-semibold mb-6 text-primary-blue">Previously Saved Invoices</h3>
            <div id="invoice-history-list">
                <p class="text-center text-gray-500">Loading invoices...</p>
            </div>
        </div>
    `;
    fetchInvoiceHistory();
}

/**
 * Fetches all invoices from Firestore and displays them in a list.
 */
async function fetchInvoiceHistory() {
    const listElement = document.getElementById('invoice-history-list');
    listElement.innerHTML = `<p class="text-center text-gray-500">Fetching data...</p>`;
    let html = ``;

    try {
        // Order by creation date descending
        const snapshot = await db.collection("invoices").orderBy("createdAt", "desc").limit(50).get();
        if (snapshot.empty) {
            listElement.innerHTML = `<p class="text-center text-gray-500">No invoices found.</p>`;
            return;
        }

        html = `<ul class="divide-y divide-gray-200">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            // Store the entire data object as a JSON string to easily pass to the PDF function
            // Note: We need to handle Firebase Timestamp when stringifying
            const invoiceDataForRedownload = { 
                ...data, 
                firestoreId: doc.id,
                // Ensure Timestamp is converted for JSON.stringify to work correctly
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString() 
            };
            const invoiceDataJson = JSON.stringify(invoiceDataForRedownload); 
            
            html += `
                <li class="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 hover:bg-white transition duration-100">
                    <div class="flex-1 min-w-0">
                        <strong class="text-primary-blue">${data.docType} ${data.invoiceId}</strong> 
                        <span class="text-sm text-gray-600 block sm:inline-block sm:ml-4">
                            Client: ${data.clientName} | Car: ${data.carDetails.model}
                        </span>
                    </div>
                    <div class="mt-2 sm:mt-0">
                        <button onclick='reDownloadInvoice(${invoiceDataJson})' 
                                class="bg-primary-blue hover:bg-blue-900 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                            Re-Download PDF
                        </button>
                    </div>
                </li>
            `;
        });
        html += `</ul>`;
        listElement.innerHTML = html;

    } catch (error) {
        console.error("Error fetching invoice history:", error);
        listElement.innerHTML = `<p class="text-red-500">Error loading invoice history. Check console for details.</p>`;
    }
}

/**
 * Re-downloads the PDF for a selected invoice document.
 * @param {object} data - The invoice data object retrieved from Firestore.
 */
function reDownloadInvoice(data) {
    // The issueDate is stored as a string in Firestore and should be available directly in data.
    // If it was stored as a date object in the history fetch, it needs conversion back to a string for consistency
    if (data.issueDate) {
        // Assume it's already a formatted string from the original save/history fetch
    } else if (data.createdAt && typeof data.createdAt === 'string') {
        // If we serialized the Firestore Timestamp as ISO string, use that date
        data.issueDate = new Date(data.createdAt).toLocaleDateString('en-US');
    }
    generateInvoicePDF(data);
}


// =================================================================
//                 9. CAR SALES AGREEMENT BANK HELPER (FROM bankDetails)
// =================================================================

/**
 * Helper to fetch raw bank details from Firestore (for Agreement PDF generation).
 * Uses the 'bankDetails' collection.
 */
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

/**
 * Populates the bank account dropdown list in the agreement form.
 */
async function populateBankDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    
    const banks = await _getBankDetailsData();
    dropdown.innerHTML = '<option value="" disabled selected>Select Bank Account for Payment</option>';
    
    if (banks.length === 0) {
        dropdown.innerHTML += '<option value="" disabled>No bank accounts configured in bankDetails collection.</option>';
        return;
    }

    banks.forEach(bank => {
        dropdown.innerHTML += `<option value="${bank.id}" data-currency="${bank.currency}">
            ${bank.name} (${bank.accountNumber}) - ${bank.currency}
        </option>`;
    });
}


// =================================================================
//                 10. CAR SALES AGREEMENT LOGIC
// =================================================================

let agreementPaymentCounter = 0; // Global counter for unique payment row IDs

/**
 * Renders the Car Sales Agreement form and history area. (Replaces renderAgreementForm stub in Section 4)
 */
function renderAgreementForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 border border-primary-blue rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">New Car Sales Agreement</h3>
                <form id="agreement-form" onsubmit="event.preventDefault(); saveAgreement()">
                    
                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Agreement Details</legend>
                        <p class="text-sm italic mb-3">This Car Sales Agreement is made on the **<span id="agreement-date">${new Date().toLocaleDateString('en-US')}</span>** between:</p>
                        
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
                            <option value="Petrol Hybrid">Petrol Hybrid</option>
                            <option value="Diesel Hybrid">Diesel Hybrid</option>
                            <option value="Electric">Electric</option>
                        </select>
                    </fieldset>

                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-secondary-red px-2">Sales Terms & Payment Plan</legend>
                        
                        <select id="paymentBankId" required class="block w-full p-2 border rounded-md mb-3"></select>
                        <script>populateBankDropdown('paymentBankId');</script>

                        <div class="space-y-2">
                            <div class="grid grid-cols-4 gap-2 text-xs font-bold text-gray-600 border-b pb-1">
                                <span class="col-span-2">Description / Notes</span>
                                <span>Amount (USD/KSH)</span>
                                <span>Date Due</span>
                            </div>
                            <div id="payment-schedule-rows">
                                <div class="grid grid-cols-4 gap-2 payment-row" data-id="1">
                                    <input type="text" required placeholder="e.g. Deposit" class="p-2 border rounded-md col-span-2 text-sm">
                                    <input type="number" step="0.01" required placeholder="Amount" oninput="calculatePaymentTotal()" class="payment-amount p-2 border rounded-md text-sm">
                                    <input type="date" required class="payment-date p-2 border rounded-md text-sm">
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-between items-center mt-3 pt-3 border-t">
                            <div class="space-x-2">
                                <button type="button" onclick="addPaymentRow()" class="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Add Payment</button>
                                <button type="button" onclick="deletePaymentRow()" class="text-sm bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded">Delete Last</button>
                            </div>
                            <div class="font-bold text-lg text-primary-blue">
                                TOTAL: <span id="payment-total">0.00</span>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset class="border p-4 rounded-lg mb-6">
                        <legend class="text-base font-semibold text-primary-blue px-2">Signatories</legend>
                        <div class="grid grid-cols-2 gap-4">
                            <div><input type="text" id="sellerWitness" required placeholder="Seller Witness Name" class="block w-full p-2 border rounded-md text-sm"></div>
                            <div><input type="text" id="buyerWitness" required placeholder="Buyer Witness Name" class="block w-full p-2 border rounded-md text-sm"></div>
                        </div>
                    </fieldset>

                    <button type="submit" class="w-full bg-primary-blue hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-150">
                        Generate & Save Sales Agreement PDF
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
  // Call the function to populate the dropdown
    populateBankDropdown('agreementBankDetailsSelect'); // <<< CORRECTION 2: ADD THIS CALL
    calculatePaymentTotal();
    fetchAgreements();
}
    // Initialize with a single row if needed, but the HTML already has one.
    calculatePaymentTotal(); 
    fetchAgreements();
}

/**
 * Adds a new payment row to the schedule table.
 */
function addPaymentRow() {
    agreementPaymentCounter++;
    const container = document.getElementById('payment-schedule-rows');
    const newRow = document.createElement('div');
    newRow.className = 'grid grid-cols-4 gap-2 payment-row';
    newRow.dataset.id = agreementPaymentCounter;
    newRow.innerHTML = `
        <input type="text" required placeholder="e.g. Balance" class="p-2 border rounded-md col-span-2 text-sm">
        <input type="number" step="0.01" required placeholder="Amount" oninput="calculatePaymentTotal()" class="payment-amount p-2 border rounded-md text-sm">
        <input type="date" required class="payment-date p-2 border rounded-md text-sm">
        <button type="button" onclick="deletePaymentRow(${agreementPaymentCounter})" class="text-red-500 hover:text-red-700 text-sm">X</button>
    `;
    container.appendChild(newRow);
}

/**
 * Deletes a specific or the last payment row from the schedule table.
 */
function deletePaymentRow(idToDelete) {
    const container = document.getElementById('payment-schedule-rows');
    const rows = container.querySelectorAll('.payment-row');
    
    if (rows.length === 1) {
        alert("The agreement must have at least one payment row.");
        return;
    }

    let rowToRemove;
    if (idToDelete) {
        rowToRemove = container.querySelector(`.payment-row[data-id="${idToDelete}"]`);
    } else {
        rowToRemove = rows[rows.length - 1];
    }

    if (rowToRemove) {
        rowToRemove.remove();
        calculatePaymentTotal();
    }
}

/**
 * Calculates the total of all amounts in the payment schedule.
 */
function calculatePaymentTotal() {
    const amounts = document.querySelectorAll('.payment-amount');
    let total = 0;
    amounts.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
            total += value;
        }
    });
    document.getElementById('payment-total').textContent = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

/**
 * Collects data and saves the Car Sales Agreement to Firestore.
 */
/**
 * Handles form submission and saves the sales agreement to Firestore.
 */
async function saveAgreement() {
    const form = document.getElementById('agreement-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // --- CORRECTION 3: READ THE DATE INPUT VALUE ---
    const agreementDate = document.getElementById('agreementDateInput').value;

    // 1. Collect Buyer Details
    const buyerName = document.getElementById('buyerName').value;
    const buyerPhone = document.getElementById('buyerPhone').value;
    // ... (rest of variable declarations) ...
    // ...

    // 4. Construct Agreement Data Object
    const agreementData = {
        // --- Use the date from the input ---
        agreementDate: agreementDate,
        buyer: {
            name: buyerName,
            phone: buyerPhone,
            address: document.getElementById('buyerAddress').value
        },
    
    // 2. Build Agreement Data
    const agreementData = {
        agreementDate: new Date().toLocaleDateString('en-US'),
        seller: {
            name: "WanBite Investments Company Limited",
            address: document.getElementById('sellerAddress').value,
            phone: document.getElementById('sellerPhone').value
        },
        buyer: {
            name: document.getElementById('buyerName').value,
            address: document.getElementById('buyerAddress').value,
            phone: document.getElementById('buyerPhone').value
        },
        vehicle: {
            makeModel: document.getElementById('carMakeModel').value,
            year: document.getElementById('carYear').value,
            color: document.getElementById('carColor').value,
            vin: document.getElementById('carVIN').value,
            fuelType: document.getElementById('carFuelType').value,
        },
        salesTerms: {
            price: totalAmount,
            currency: currency,
            bankId: selectedBank.value,
            paymentSchedule: paymentSchedule,
        },
        signatures: {
            sellerWitness: document.getElementById('sellerWitness').value,
            buyerWitness: document.getElementById('buyerWitness').value,
            // Signatures and Dates will be added manually on the printed copy
        },
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await db.collection("sales_agreements").add(agreementData);
        alert(`Sales Agreement for ${agreementData.buyer.name} saved successfully!`);
        
        // Fetch bank details for PDF generation
        const banks = await _getBankDetailsData();
        const selectedBankDetails = banks.find(b => b.id === agreementData.salesTerms.bankId);

        agreementData.firestoreId = docRef.id;
        agreementData.bankDetails = selectedBankDetails;

        generateAgreementPDF(agreementData);
        
        form.reset();
        calculatePaymentTotal();
        fetchAgreements(); // Refresh history
    } catch (error) {
        console.error("Error saving sales agreement:", error);
        alert("Failed to save sales agreement: " + error.message);
    }
}

/**
 * Fetches and displays recent sales agreements.
 */
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
                            <strong class="text-gray-800">${data.buyer.name}</strong><br>
                            <span class="text-sm text-gray-600">${data.vehicle.makeModel} | Price: ${data.salesTerms.currency} ${data.salesTerms.price.toFixed(2)}</span>
                        </div>
                        <div class="mt-2 sm:mt-0 space-x-2">
                            <button onclick='openPaymentUpdateModal(${agreementDataJson})' 
                                    class="bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                Edit Payment
                            </button>
                            <button onclick='reDownloadAgreement(${agreementDataJson})' 
                                    class="bg-secondary-red hover:bg-red-600 text-white text-xs py-1 px-3 rounded-full transition duration-150">
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

/**
 * Re-downloads the PDF for a selected agreement document from history.
 * @param {object} data - The agreement data object retrieved from Firestore.
 */
async function reDownloadAgreement(data) {
    // Re-fetch bank details which are not saved directly in the agreement data
    const banks = await _getBankDetailsData();
    const selectedBankDetails = banks.find(b => b.id === data.salesTerms.bankId);
    
    data.bankDetails = selectedBankDetails || { name: 'Bank Not Found', accountNumber: 'N/A', swiftCode: 'N/A', currency: data.salesTerms.currency };
    generateAgreementPDF(data);
}

/**
 * Generates and downloads the single-page Car Sales Agreement PDF.
 */
async function generateAgreementPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 

    const primaryColor = '#183263'; // WanBite Blue
    const secondaryColor = '#D96359'; // Red
    
    const pageW = doc.internal.pageSize.getWidth();
    let y = 10; 
    const margin = 10;
    const lineSpacing = 6;
    const textIndent = 5;

    // --- HELPER FUNCTION ---
    const drawText = (text, x, y, size, style = 'normal', color = primaryColor, align = 'left') => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(color);
        doc.text(text, x, y, { align: align });
    };

    // =================================================================
    // HEADER SECTION
    // =================================================================
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageW, 15, 'F');
    drawText('WanBite Investments Co. Ltd.', pageW / 2, 8, 18, 'bold', '#FFFFFF', 'center');
    drawText('carskenya.co.ke', pageW / 2, 13, 10, 'normal', '#FFFFFF', 'center');
    y = 25;

    // TITLE
    doc.setTextColor(primaryColor);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CAR SALES AGREEMENT", pageW / 2, y, null, null, "center");
    y += 10;

    // =================================================================
    // PARTIES DETAILS
    // =================================================================
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(primaryColor);
    doc.text(`This Car Sales Agreement is made on the ${data.agreementDate}, between;`, margin, y);
    y += lineSpacing;

    // Seller Info
    doc.setFont("helvetica", "bold");
    doc.text("THE SELLER:", margin, y);
    doc.text(data.seller.name, margin + 25, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Address: ${data.seller.address}`, margin + textIndent, y + lineSpacing);
    doc.text(`Phone: ${data.seller.phone}`, margin + textIndent, y + lineSpacing * 2);
    y += lineSpacing * 3;

    // Buyer Info
    doc.setFont("helvetica", "bold");
    doc.text("THE BUYER:", margin, y);
    doc.text(data.buyer.name, margin + 25, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Address: ${data.buyer.address}`, margin + textIndent, y + lineSpacing);
    doc.text(`Phone: ${data.buyer.phone}`, margin + textIndent, y + lineSpacing * 2);
    y += lineSpacing * 3 + 2;


    // =================================================================
    // VEHICLE DETAILS
    // =================================================================
    doc.setFillColor(240, 240, 240); 
    doc.rect(margin, y, pageW - 20, 32, 'F');
    
    drawText('VEHICLE DETAILS', margin + 3, y + 4, 12, 'bold', primaryColor);
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    doc.text(`Make and Model: ${data.vehicle.makeModel}`, margin + 3, y + lineSpacing);
    doc.text(`Year of Manufacture: ${data.vehicle.year}`, pageW / 2 + 5, y + lineSpacing);

    doc.text(`Color: ${data.vehicle.color}`, margin + 3, y + lineSpacing * 2);
    doc.text(`Fuel Type: ${data.vehicle.fuelType}`, pageW / 2 + 5, y + lineSpacing * 2);

    doc.text(`VIN Number: ${data.vehicle.vin}`, margin + 3, y + lineSpacing * 3);
    y += 32;


    // =================================================================
    // SALES TERMS & PAYMENT
    // =================================================================
    drawText('SALES TERMS & PAYMENT PLAN', margin, y, 12, 'bold', primaryColor);
    y += lineSpacing;

    // Price Clause
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("The Purchase Price of ", margin, y);
    doc.setTextColor(secondaryColor);
    doc.setFont("helvetica", "bold");
    const totalText = `${data.salesTerms.currency} ${data.salesTerms.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    doc.text(totalText, margin + doc.getStringUnitWidth("The Purchase Price of ") * doc.getFontSize() / doc.internal.scaleFactor, y);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    const trailingText = ` is to be paid to the bank account below:`;
    doc.text(trailingText, margin + doc.getStringUnitWidth("The Purchase Price of " + totalText) * doc.getFontSize() / doc.internal.scaleFactor, y);
    y += lineSpacing;

    // Bank Details Box
    doc.setFillColor(255, 245, 230); 
    doc.rect(margin, y, pageW - 20, 20, 'F');
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, pageW - 20, 20);

    doc.setFontSize(9);
    doc.setTextColor(primaryColor);
    doc.text(`Bank Name: ${data.bankDetails ? data.bankDetails.name : 'N/A'}`, margin + 3, y + 4);
    doc.text(`Account Name: ${data.bankDetails ? data.bankDetails.accountName : 'N/A'}`, margin + 90, y + 4);
    doc.text(`Account No: ${data.bankDetails ? data.bankDetails.accountNumber : 'N/A'}`, margin + 3, y + 9);
    doc.text(`SWIFT/BIC: ${data.bankDetails ? data.bankDetails.swiftCode : 'N/A'}`, margin + 90, y + 9);
    doc.text(`Currency: ${data.salesTerms.currency}`, margin + 3, y + 14);
    y += 22;


    // Payment Schedule Table
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.2);
    // Header
    doc.setFillColor(primaryColor);
    doc.rect(margin, y, pageW - 20, 6, 'F');
    drawText('Description / Notes', margin + 3, y + 4, 9, 'bold', '#FFFFFF');
    drawText(`Amount (${data.salesTerms.currency})`, margin + 120, y + 4, 9, 'bold', '#FFFFFF');
    drawText('Date Due', margin + 170, y + 4, 9, 'bold', '#FFFFFF');
    y += 6;

    // Rows
    let totalPaid = 0;
    data.salesTerms.paymentSchedule.forEach((payment, index) => {
        doc.setFillColor(index % 2 === 0 ? 255 : 248);
        doc.rect(margin, y, pageW - 20, 5, 'F');
        doc.setTextColor(0);
        drawText(payment.description, margin + 3, y + 3.5, 9);
        drawText(payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), margin + 120, y + 3.5, 9);
        doc.text(payment.dateDue, margin + 170, y + 3.5, { align: 'left' }); // Use left align for date field
        y += 5;
        totalPaid += payment.amount;
    });

    // Total Row
    y += 2;
    drawText('TOTAL PURCHASE PRICE:', margin + 100, y + 3, 10, 'bold', primaryColor);
    drawText(`${data.salesTerms.currency} ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 3, y + 3, 10, 'bold', secondaryColor, 'right');
    y += 8;

    // =================================================================
    // WARRANTIES & TRANSFER
    // =================================================================
    drawText('WARRANTIES AND REPRESENTATION', margin, y, 12, 'bold', primaryColor);
    y += lineSpacing;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('• The Seller confirms that the vehicle is free from any encumbrance or third-party claims.', margin + textIndent, y);
    doc.text('• The Buyer confirms that they have inspected and accepted the vehicle is in its current condition.', margin + textIndent, y + lineSpacing);
    doc.text('• The sale is as-is, and the Seller does not provide any warranty unless otherwise agreed in writing.', margin + textIndent, y + lineSpacing * 2);
    y += lineSpacing * 3 + 2;
    
    drawText('OWNERSHIP TRANSFER', margin, y, 12, 'bold', primaryColor);
    y += lineSpacing;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('• The Seller agrees collection of the physical number plates and the logbook after purchase of the vehicle.', margin + textIndent, y);
    y += lineSpacing + 6;

    // =================================================================
    // SIGNATURES
    // =================================================================
    drawText('AGREED AND ACCEPTED', margin, y, 12, 'bold', primaryColor);
    y += lineSpacing;

    const sigY = y + 10;
    const sigDateY = sigY + 5;
    const sigNameY = sigY + 10;
    
    // Buyer
    doc.line(margin, sigY, margin + 70, sigY);
    drawText('Buyer Signature', margin + 35, sigY + 2, 8, 'normal', 0, 'center');
    doc.line(margin, sigDateY + 1, margin + 70, sigDateY + 1);
    drawText('Date', margin + 35, sigDateY + 3, 8, 'normal', 0, 'center');
    drawText(`Buyer Name: ${data.buyer.name}`, margin, sigNameY + 3, 10, 'bold', primaryColor);
    drawText(`Witness: ${data.signatures.buyerWitness}`, margin, sigNameY + 7, 10, 'normal', 0);
    
    // Seller
    const sellerX = pageW - margin - 70;
    doc.line(sellerX, sigY, pageW - margin, sigY);
    drawText('Seller Signature', sellerX + 35, sigY + 2, 8, 'normal', 0, 'center');
    doc.line(sellerX, sigDateY + 1, pageW - margin, sigDateY + 1);
    drawText('Date', sellerX + 35, sigDateY + 3, 8, 'normal', 0, 'center');
    drawText(`Seller Name: ${data.seller.name}`, sellerX, sigNameY + 3, 10, 'bold', primaryColor);
    drawText(`Witness: ${data.signatures.sellerWitness}`, sellerX, sigNameY + 7, 10, 'normal', 0);
    
    y = sigNameY + 15;


    // --- Global Footer ---
    doc.setFillColor(primaryColor);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(9);
    const footerText = `Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`;
    doc.text(footerText, pageW / 2, doc.internal.pageSize.getHeight() - 4, null, null, "center");

    doc.save(`Sales_Agreement_${data.buyer.name.replace(/\s/g, '_')}.pdf`);
}

// --- Payment Update Modal Logic ---

/**
 * Opens a modal to allow the user to add a new payment installment to an existing agreement.
 */
async function openPaymentUpdateModal(agreementData) {
    const banks = await _getBankDetailsData();
    const bankDetails = banks.find(b => b.id === agreementData.salesTerms.bankId) || { name: 'N/A', currency: 'N/A' };

    let paymentListHtml = agreementData.salesTerms.paymentSchedule.map(p => 
        `<li class="text-sm border-b py-1">
            ${p.description}: <strong>${agreementData.salesTerms.currency} ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> (Due: ${p.dateDue})
        </li>`
    ).join('');

    // Total price calculation
    const currentTotal = agreementData.salesTerms.paymentSchedule.reduce((sum, p) => sum + p.amount, 0);

    const modalHtml = `
        <div id="payment-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 class="text-lg font-semibold text-primary-blue mb-4">Add Payment to Agreement</h3>
                
                <p class="text-sm mb-3">
                    <strong>Buyer:</strong> ${agreementData.buyer.name}<br>
                    <strong>Vehicle:</strong> ${agreementData.vehicle.makeModel}<br>
                    <strong>Current Total:</strong> <span class="text-secondary-red font-bold">${agreementData.salesTerms.currency} ${currentTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </p>

                <div class="mb-4">
                    <h4 class="font-semibold text-sm">Existing Payments:</h4>
                    <ul class="list-disc pl-5">${paymentListHtml}</ul>
                </div>

                <form id="add-payment-form">
                    <input type="text" id="newPaymentDescription" required placeholder="Description (e.g., Final Payment)" class="block w-full p-2 border rounded-md mb-2 text-sm">
                    <input type="number" step="0.01" id="newPaymentAmount" required placeholder="Amount (${agreementData.salesTerms.currency})" class="block w-full p-2 border rounded-md mb-2 text-sm">
                    <input type="date" id="newPaymentDate" required class="block w-full p-2 border rounded-md mb-4 text-sm">
                    
                    <div class="flex justify-end space-x-2">
                        <button type="button" onclick="document.getElementById('payment-modal').remove()" class="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-primary-blue text-white text-sm rounded-md">Add & Update Agreement</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Attach event listener for form submission
    document.getElementById('add-payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addPaymentToAgreement(agreementData);
    });
}

/**
 * Updates the Firestore document with the new payment and regenerates the PDF.
 * @param {object} agreementData - The existing agreement data.
 */
async function addPaymentToAgreement(agreementData) {
    const description = document.getElementById('newPaymentDescription').value;
    const amount = parseFloat(document.getElementById('newPaymentAmount').value);
    const date = document.getElementById('newPaymentDate').value;
    
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    
    const newPayment = { description, amount, dateDue: date };
    
    // Update the payment schedule locally
    const updatedSchedule = [...agreementData.salesTerms.paymentSchedule, newPayment];
    
    // Recalculate total price
    const newTotal = updatedSchedule.reduce((sum, p) => sum + p.amount, 0);

    // Prepare data for Firestore update
    const updateData = {
        'salesTerms.paymentSchedule': updatedSchedule,
        'salesTerms.price': newTotal // Update the total price
    };
    
    try {
        // *** This collection name is correct: "sales_agreements" ***
        await db.collection("sales_agreements").doc(agreementData.firestoreId).update(updateData);
        alert("Payment added and agreement updated successfully!");
        
        // Close modal
        document.getElementById('payment-modal').remove();
        
        // Update the agreementData object and regenerate PDF
        agreementData.salesTerms.paymentSchedule = updatedSchedule;
        agreementData.salesTerms.price = newTotal;

        await reDownloadAgreement(agreementData); // Regenerate and download PDF
        fetchAgreements(); // Refresh history list
        
    } catch (error) {
        console.error("Error updating agreement:", error);
        alert("Failed to update agreement: " + error.message);
    }
}


// =================================================================
//                 11. STUBS FOR OTHER MODULES
// =================================================================

function handleFleetManagement() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">Fleet Management Module</h2>
        <div class="p-6 bg-yellow-50 rounded-xl border border-yellow-300">
            <p class="text-gray-800 font-semibold">Implementation Note:</p>
            <p>This module requires a 'cars' collection in Firestore. The UI would display a table fetched from Firestore, allowing status updates (Ship to Mombasa, Clearing, In Transit, etc.) which would update the 'currentStatus' and add an entry to the 'statusHistory' array in the car document.</p>
        </div>
    `;
}

function handleHRManagement() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">HR & Requisitions Module</h2>
        <div class="p-6 bg-secondary-red/10 rounded-xl border border-secondary-red">
            <p class="text-gray-800 font-semibold">Implementation Note:</p>
            <p>Forms for Requisition and Leave Applications would save data to 'requisitions' and 'leave_applications' collections in Firestore. Remember, for external notifications (Email/WhatsApp) for approval, you'll need **Firebase Cloud Functions**.</p>
        </div>
    `;
}
