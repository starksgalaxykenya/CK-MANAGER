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
        alert("Failed to delete bank: " + error.message);
    }
}

// =================================================================
//                 6. INVOICE MODULE
// =================================================================

let invoiceItemCounter = 1;

/**
 * Helper to fetch raw bank details from Firestore (for dropdown population).
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
 * Populates a bank account dropdown list with data from Firestore.
 * @param {string} dropdownId - The ID of the select element to populate.
 */
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
        // Include the ID for easy lookup, but store the whole object as JSON string in the value
        const detailsJson = JSON.stringify(data);
        options += `<option value='${detailsJson}'>${data.name} - ${data.branch || 'No Branch'} (${data.currency})</option>`;
    });

    bankSelect.innerHTML = options;
}

/**
 * Renders the Invoice/Proforma form.
 */
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

    // Populate the bank dropdown when the form loads
    populateBankDropdown('bankDetailsSelect');
}

/**
 * Saves the invoice data to Firestore and optionally generates a PDF.
 * @param {boolean} onlySave - If true, only saves to Firestore without generating PDF.
 */
async function saveInvoice(onlySave) {
    const form = document.getElementById('invoice-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // 1. Collect Form Data
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
    
    // Bank Details are stored as JSON string in the value, so we parse it
    let bankDetails;
    try {
        bankDetails = JSON.parse(document.getElementById('bankDetailsSelect').value);
    } catch (e) {
        alert("Error reading selected bank details. Please re-select the bank account.");
        console.error("Error parsing bank details:", e);
        return;
    }
    
    const buyerNameConfirmation = document.getElementById('buyerNameConfirmation').value;

    // 2. Calculate Pricing
    const totalPriceUSD = quantity * priceUSD;
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
        bankDetails, // Save the full object for easy reference
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
    return `${datePart}-${namePart}-${modelPart}-${carYear}`;
}

/**
 * Generates and downloads a custom PDF for the Invoice/Proforma.
 */
function generateInvoicePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 

    const primaryColor = '#183263'; // WanBite Blue
    const secondaryColor = '#D96359'; // Red
    
    const pageW = doc.internal.pageSize.getWidth();
    let y = 10; 
    const margin = 10;
    const lineHeight = 5; 
    const termIndent = 5;

    // --- HELPER FUNCTIONS ---
    const drawText = (text, x, y, size, style = 'normal', color = primaryColor, align = 'left') => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(color);
        doc.text(text, x, y, { align: align });
    };

    // Advanced Text Wrapper for Terms & Conditions (handles bolding of prices)
    const drawTerm = (doc, yStart, prefix, text, textWidth = 188 - termIndent) => {
        doc.setFontSize(9);
        doc.setTextColor(primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(prefix, margin, yStart);
        
        // Start text after prefix
        let textX = margin + 5; 
        
        // Ensure standard text wrapping is used for the rest
        const lines = doc.splitTextToSize(text, textWidth);
        let currentY = yStart;
        const lineSpacing = 4.5;
        
        lines.forEach((line, index) => {
            let currentX = margin + termIndent; 
            if (index === 0) {
                // If the first line, draw it right after the prefix
                currentX = textX; 
            } else {
                currentX = margin + termIndent;
            }

            // Calculate where the text should start on the first line after the prefix
            if (index === 0) {
                const prefixWidth = doc.getStringUnitWidth(prefix) * doc.getFontSize() / doc.internal.scaleFactor;
                currentX = margin + prefixWidth + 1; // Start right after the bold prefix
            } else {
                currentX = margin + termIndent;
            }

            doc.setTextColor(primaryColor);
            doc.setFont("helvetica", "normal");
            doc.text(line, currentX, currentY);

            currentY += lineSpacing;
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

    // INVOICE TITLE
    doc.setTextColor(secondaryColor);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(data.docType.toUpperCase(), pageW / 2, y, null, null, "center");
    y += 10;
    
    // Invoice/Date/Due Box
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

    // =================================================================
    // BILLING & SELLER INFO
    // =================================================================
    
    // Bill To Box (Left)
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, 90, 25);
    drawText('BILL TO:', margin + 3, y + 5, 10, 'bold', secondaryColor);
    drawText(data.clientName, margin + 3, y + 10, 10, 'bold', 0);
    drawText(data.clientPhone, margin + 3, y + 15, 10, 'normal', 0);
    
    // Seller Info Box (Right)
    doc.rect(pageW / 2 + 5, y, 90, 25);
    drawText('FROM:', pageW / 2 + 8, y + 5, 10, 'bold', secondaryColor);
    drawText('WANBITE INVESTMENTS COMPANY LIMITED', pageW / 2 + 8, y + 10, 10, 'bold', 0);
    drawText('Ngong Road, Kilimani, Nairobi | sales@carskenya.co.ke', pageW / 2 + 8, y + 15, 8, 'normal', 0);
    drawText('Phone: 0713147136', pageW / 2 + 8, y + 20, 8, 'normal', 0);
    
    y += 30;

    // =================================================================
    // ITEM TABLE (Vehicle Details)
    // =================================================================
    
    // Table Header
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
    doc.setTextColor(primaryColor);
    drawText('DESCRIPTION:', margin, y + 5, 9, 'bold');
    doc.setTextColor(0);
    doc.setFontSize(9);
    const descriptionLines = doc.splitTextToSize(data.carDetails.goodsDescription || 'N/A', 188);
    descriptionLines.forEach((line, index) => {
        doc.text(line, margin, y + 5 + (index + 1) * 4);
    });
    y += descriptionLines.length * 4 + 7;

    // =================================================================
    // TOTALS & PAYMENTS (Bottom Right)
    // =================================================================
    const totalBoxW = 60;
    const totalsX = pageW - margin - totalBoxW;

    // Line 1: Subtotal
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('SUBTOTAL (USD)', totalsX + 2, y + 3.5, 9, 'normal', 0);
    drawText(data.pricing.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', 0, 'right');
    y += lineHeight;

    // Line 2: Deposit
    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('DEPOSIT (50% USD)', totalsX + 2, y + 3.5, 9, 'normal', 0);
    drawText(data.pricing.depositUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', secondaryColor, 'right');
    y += lineHeight;

    // Line 3: Balance
    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('BALANCE DUE (USD)', totalsX + 2, y + 3.5, 9, 'normal', 0);
    drawText(data.pricing.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', primaryColor, 'right');
    y += lineHeight;

    // Line 4: Deposit KES Equivalent
    doc.setFillColor(230, 240, 255);
    doc.rect(totalsX, y, totalBoxW, lineHeight, 'F');
    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('DEPOSIT (KES EQUIV)', totalsX + 2, y + 3.5, 9, 'bold', primaryColor);
    drawText(parseFloat(data.pricing.depositKSH).toLocaleString('en-US', { minimumFractionDigits: 2 }), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', primaryColor, 'right');
    y += lineHeight;
    y += 5; // Extra space

    // =================================================================
    // TERMS & CONDITIONS (Left)
    // =================================================================
    drawText('TERMS & CONDITIONS', margin, y, 12, 'bold', primaryColor);
    y += lineHeight;
    
    // Term 1: Total Price
    const totalPriceText = `The total price of the vehicle is USD ${data.pricing.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    y = drawTerm(doc, y, '1.', totalPriceText, 188 - termIndent);

    // Term 2: Payment Schedule
    const depositText = `A deposit of USD ${data.pricing.depositUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} (KES ${data.pricing.depositKSH.toLocaleString('en-US', { minimumFractionDigits: 2 })} equivalent) is required to secure the vehicle and begin shipping/clearing. The balance of USD ${data.pricing.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} is due on or before ${data.dueDate} or upon production of the Bill of Lading. The seller shall promptly notify the buyer of the date for due compliance.`;
    y = drawTerm(doc, y, '2.', depositText);

    // Term 3: BOL Release
    y = drawTerm(doc, y, '3.', 'The original Bill of Lading will be issued to the buyer upon confirmation of full receipt of the purchase price.');

    // Term 4: Cancellation/Forfeiture
    y = drawTerm(doc, y, '4.', 'If you cancel to buy before or after shipment after purchase is confirmed, your deposit is to be forfeited.');

    // Term 5: As Is Condition
    y = drawTerm(doc, y, '5.', 'All the vehicles are subject to AS IS CONDITION.');

    // Term 6: Third Party Payment
    y = drawTerm(doc, y, '6.', 'Payment will be made by the invoiced person. If a third party makes a payment, please kindly inform us the relationship due to security reasons.');
    
    y += 5;

    // =================================================================
    // PAYMENT INSTRUCTIONS 
    // =================================================================
    doc.setFillColor(255, 245, 230);
    doc.rect(margin, y, 188, 40, 'F'); // Increased height for more lines
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, 188, 40);
    let currentY_bank = y + 5;
    
    // Title
    drawText('KINDLY PAY USD / KSH TO THE FOLLOWING BANK ACCOUNT:', 15, currentY_bank, 11, 'bold', primaryColor);
    currentY_bank += 5; // Move down after the title
    
    // Exchange Rate Note - far right
    doc.setFontSize(8);
    doc.setTextColor(primaryColor);
    doc.text(`Exchange rate used USD 1 = KES ${data.exchangeRate.toFixed(2)}`, 190 - margin, currentY_bank - 2, null, null, "right");
    
    // Bank Details
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

    // =================================================================
    // CONFIRMATION SIGNATURES
    // =================================================================
    doc.setDrawColor(primaryColor);
    
    // Buyer Signature
    doc.line(margin, y + 15, 90, y + 15);
    drawText(`Accepted and Confirmed by Buyer: ${data.buyerNameConfirmation}`, margin, y + 19, 10);
    
    // Seller Signature
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
                <p class="text-center text-gray-500">Loading invoice history...</p>
            </div>
        </div>
    `;
    fetchInvoices();
}

/**
 * Fetches and displays recent invoices.
 */
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

// (The _getBankDetailsData function is reused from Section 6)

// =================================================================
//                 10. CAR SALES AGREEMENT MODULE (CORRECTED)
// =================================================================

let agreementPaymentCounter = 1;

/**
 * Renders the Car Sales Agreement form.
 */
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
                            <div class="grid grid-cols-4 gap-2 payment-row" data-id="1">
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
    
    // CORRECTION 2: Call the function to populate the dropdown
    populateBankDropdown('agreementBankDetailsSelect'); 
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
 * Calculates and updates the total amount of the payment schedule.
 */
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


/**
 * Handles form submission and saves the sales agreement to Firestore.
 */
async function saveAgreement() {
    const form = document.getElementById('agreement-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // --- CORRECTION 1: READ THE DATE INPUT VALUE ---
    const agreementDate = document.getElementById('agreementDateInput').value; // Get YYYY-MM-DD format

    // 1. Collect Buyer Details
    const buyerName = document.getElementById('buyerName').value;
    const buyerPhone = document.getElementById('buyerPhone').value;
    
    // 2. Collect Vehicle Details
    const carMakeModel = document.getElementById('carMakeModel').value;
    const carYear = document.getElementById('carYear').value;
    const carColor = document.getElementById('carColor').value;
    const carVIN = document.getElementById('carVIN').value;
    const carFuelType = document.getElementById('carFuelType').value;

    // 3. Collect Payment Schedule
    const paymentSchedule = [];
    let totalAmount = 0;
    document.querySelectorAll('#payment-schedule-rows .payment-row').forEach(row => {
        const inputs = row.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]');
        const description = inputs[0].value;
        const amount = parseFloat(inputs[1].value);
        const date = inputs[2].value;

        paymentSchedule.push({ description, amount, date });
        totalAmount += amount;
    });

    // 4. Collect other details
    const selectedBankValue = document.getElementById('agreementBankDetailsSelect').value;
    const currency = document.getElementById('currencySelect').value;

    // --- CORRECTION 2: Parse the full bank details from the dropdown value ---
    let bankDetails = {};
    let bankId = '';

    try {
        bankDetails = JSON.parse(selectedBankValue);
        bankId = bankDetails.id;
    } catch (e) {
        console.error("Error parsing bank details from dropdown:", e);
        alert("Please select a valid bank account.");
        return;
    }

    // 5. Construct Agreement Data Object
    const agreementData = {
        // --- Use the date from the input ---
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
            bankId: bankId, // <<< Correctly save only the ID
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

        // Use the parsed bank details object for immediate PDF generation
        agreementData.firestoreId = docRef.id;
        agreementData.bankDetails = bankDetails; // <<< Attach full details for PDF
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
                            <strong class="text-primary-blue">Agreement ID: ${doc.id.substring(0, 8)}...</strong><br>
                            <span class="text-sm text-gray-700">Buyer: ${data.buyer.name} | Vehicle: ${data.vehicle.makeModel}</span>
                        </div>
                        <div class="mt-2 sm:mt-0 space-x-2">
                            <button onclick='reDownloadAgreement(${agreementDataJson})' 
                                    class="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                Re-Download PDF
                            </button>
                            <button onclick='renderAddPaymentModal(${agreementDataJson})' 
                                    class="bg-secondary-red hover:bg-red-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                Add Payment
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
 * Re-downloads the PDF for a selected sales agreement document.
 * @param {object} data - The agreement data object retrieved from Firestore.
 */
async function reDownloadAgreement(data) {
    // 1. Check if bankDetails are already present
    if (data.bankDetails && data.bankDetails.name) {
        return generateAgreementPDF(data);
    }

    let bankDetails = null;
    const bankIdValue = data.salesTerms?.bankId;

    if (bankIdValue) {
        // Check if the value is a stringified JSON object (to support old, bugged data)
        if (bankIdValue.startsWith('{') && bankIdValue.endsWith('}')) {
            try {
                // If it's the bugged full JSON string, parse it
                bankDetails = JSON.parse(bankIdValue);
            } catch (e) {
                console.warn("Could not parse old bankId JSON string. Falling back to ID fetch.");
            }
        }
        
        // If bankDetails is still null, assume it's the correct new format (just the ID) or the fallback failed
        if (!bankDetails) {
            const banks = await _getBankDetailsData();
            bankDetails = banks.find(b => b.id === bankIdValue);
        }
    }
    
    // Attach the fetched/parsed details to the data object
    data.bankDetails = bankDetails || {}; 
    generateAgreementPDF(data);
}


/**
 * Generates and downloads the PDF for the Car Sales Agreement.
 */
function generateAgreementPDF(data) {
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
    // Use the collected date
    doc.text(`This Car Sales Agreement is made on the ${data.agreementDate}, between;`, margin, y);
    y += lineSpacing;

    // Seller Info
    doc.setFont("helvetica", "bold");
    doc.text("THE SELLER:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text("WANBITE INVESTMENTS COMPANY LIMITED", margin + 25, y);
    y += lineSpacing;
    doc.text(`Address: ${data.seller.address}`, margin + 5, y);
    doc.text(`Phone: ${data.seller.phone}`, margin + 100, y);
    y += lineSpacing + 2;

    // Buyer Info
    doc.setFont("helvetica", "bold");
    doc.text("THE BUYER:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.buyer.name, margin + 25, y);
    y += lineSpacing;
    doc.text(`Address: ${data.buyer.address}`, margin + 5, y);
    doc.text(`Phone: ${data.buyer.phone}`, margin + 100, y);
    y += lineSpacing + 4;

    // =================================================================
    // VEHICLE DETAILS
    // =================================================================
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

    // =================================================================
    // PAYMENT DETAILS & SCHEDULE
    // =================================================================
    drawText('SALES AGREEMENT & PAYMENT TERMS', margin, y, 12, 'bold', primaryColor);
    y += lineSpacing;

    // Purchase Price
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

    // Bank Details Box
    doc.setFillColor(255, 245, 230);
    doc.rect(margin, y, pageW - 20, 20, 'F');
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, pageW - 20, 20);
    doc.setFontSize(9);
    doc.setTextColor(primaryColor);
    
    // Safely access bank details (will show 'N/A' if object is missing or empty)
    const bank = data.bankDetails || {};
    const branchText = bank.branch ? `(Branch: ${bank.branch})` : '';

    doc.text(`Bank Name: ${bank.name || 'N/A'} ${branchText}`, margin + 3, y + 4);
    doc.text(`Account Name: ${bank.accountName || 'N/A'}`, margin + 90, y + 4);
    doc.text(`Account No: ${bank.accountNumber || 'N/A'}`, margin + 3, y + 9);
    doc.text(`SWIFT/BIC: ${bank.swiftCode || 'N/A'}`, margin + 90, y + 9);
    doc.text(`Branch: ${bank.branch || 'N/A'} | Currency: ${data.salesTerms.currency}`, margin + 3, y + 14);
    y += 25;

    // Payment Schedule Table
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
    
    // Additional Terms
    drawText('GENERAL TERMS', margin, y, 12, 'bold', primaryColor);
    y += lineSpacing;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('• The Buyer agrees to purchase the vehicle in its current condition.', margin + textIndent, y);
    y += lineSpacing;
    doc.text('• The sale is as-is, and the Seller does not provide any warranty unless otherwise agreed in writing.', margin + textIndent, y);
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
    drawText(`Seller: WANBITE INVESTMENTS CO. LTD`, sellerX, sigNameY + 3, 10, 'bold', primaryColor);
    drawText(`Witness: ${data.signatures.sellerWitness}`, sellerX, sigNameY + 7, 10, 'normal', 0);
    y += 30;
    
    // --- Global Footer ---
    doc.setFillColor(primaryColor);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(9);
    const footerText = `Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`;
    doc.text(footerText, pageW / 2, doc.internal.pageSize.getHeight() - 4, null, null, "center");

    doc.save(`Car_Sales_Agreement_${data.buyer.name.replace(/\s/g, '_')}.pdf`);
}

/**
 * Renders a modal to add a new payment to an existing agreement.
 */
function renderAddPaymentModal(agreementData) {
    const paymentListHtml = agreementData.salesTerms.paymentSchedule.map(p => 
        `<li>${p.description}: <span class="text-secondary-red font-bold">${agreementData.salesTerms.currency} ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> (Due: ${p.date})</li>`
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
                <form id="add-payment-form" onsubmit="event.preventDefault(); addPaymentToAgreement('${agreementData.firestoreId}')">
                    <input type="text" id="newPaymentDescription" required placeholder="Description (e.g., Final Payment)" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="number" id="newPaymentAmount" step="0.01" required placeholder="Amount" class="mt-2 block w-full p-2 border rounded-md">
                    <input type="date" id="newPaymentDate" required class="mt-2 block w-full p-2 border rounded-md">
                    
                    <div class="flex justify-end space-x-3 mt-4">
                        <button type="button" onclick="document.getElementById('payment-modal').remove()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-150">
                            Cancel
                        </button>
                        <button type="submit" class="bg-secondary-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-150">
                            Add Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Handles adding a new payment entry to an existing sales agreement document.
 * @param {string} docId - Firestore document ID of the sales agreement.
 */
async function addPaymentToAgreement(docId) {
    const form = document.getElementById('add-payment-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const description = document.getElementById('newPaymentDescription').value;
    const amount = parseFloat(document.getElementById('newPaymentAmount').value);
    const date = document.getElementById('newPaymentDate').value;
    
    // 1. Fetch the existing document
    const agreementRef = db.collection("sales_agreements").doc(docId);
    const doc = await agreementRef.get();
    if (!doc.exists) {
        alert("Error: Agreement document not found.");
        return;
    }
    const agreementData = doc.data();

    // 2. Prepare the new schedule array
    const newPaymentEntry = { description, amount, date };
    const newPaymentSchedule = [...agreementData.salesTerms.paymentSchedule, newPaymentEntry];
    
    // 3. Calculate new total price
    const newTotal = newPaymentSchedule.reduce((sum, p) => sum + p.amount, 0);

    // 4. Update the document
    try {
        await agreementRef.update({
            "salesTerms.paymentSchedule": newPaymentSchedule,
            "salesTerms.price": newTotal // Update the total price as well
        });

        document.getElementById('payment-modal').remove();
        alert("Payment added and agreement updated successfully!");
        fetchAgreements();
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
