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

// Invoice counter storage
let invoiceCounter = null;

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

// Add this function at the top level (after the authentication section)
// =================================================================
//                 GLOBAL SEARCH FUNCTION (NEW)
// =================================================================

/**
 * Global search function that can be called from any page
 */
function performGlobalSearch(searchTerm = '', filter = 'all') {
    // Navigate to document generator first
    handleDocumentGenerator();
    
    // Wait for DOM to update, then set search values
    setTimeout(() => {
        const searchInput = document.getElementById('document-search');
        const filterSelect = document.getElementById('document-type-filter');
        
        if (searchInput && searchTerm) {
            searchInput.value = searchTerm;
        }
        
        if (filterSelect && filter) {
            filterSelect.value = filter;
        }
        
        // If search term was provided, perform the search
        if (searchTerm) {
            setTimeout(() => {
                const searchButton = document.querySelector('button[onclick="searchDocuments()"]');
                if (searchButton) {
                    searchButton.click();
                }
            }, 200);
        }
    }, 100);
}

// =================================================================
//                 13. DOCUMENT SEARCH FUNCTIONALITY (NEW)
// =================================================================

/**
 * Searches across all document types
 */
async function searchDocuments() {
    const searchTerm = document.getElementById('document-search')?.value.trim().toLowerCase();
    const docTypeFilter = document.getElementById('document-type-filter')?.value;
    
    if (!searchTerm) {
        alert("Please enter a search term");
        return;
    }
    
    // Get references to DOM elements
    const resultsList = document.getElementById('search-results-list');
    const searchResultsDiv = document.getElementById('search-results');
    const docCreationArea = document.getElementById('document-creation-area');
    
    // If we're not on the document generator page, navigate to it first
    if (!resultsList || !searchResultsDiv || !docCreationArea) {
        // Navigate to document generator first
        handleDocumentGenerator();
        
        // Wait for DOM to update, then search again
        setTimeout(() => {
            // Set the search term in the input
            const searchInput = document.getElementById('document-search');
            if (searchInput) {
                searchInput.value = searchTerm;
            }
            
            // Set the filter if it was specified
            const filterSelect = document.getElementById('document-type-filter');
            if (filterSelect && docTypeFilter) {
                filterSelect.value = docTypeFilter;
            }
            
            // Perform the search
            performSearch(searchTerm, docTypeFilter || 'all');
        }, 100);
        return;
    }
    
    // We're already on the document generator page, perform search
    await performSearch(searchTerm, docTypeFilter || 'all');
}

/**
 * Helper function to perform the actual search
 */
async function performSearch(searchTerm, docTypeFilter) {
    // Get references to DOM elements again (they should exist now)
    const resultsList = document.getElementById('search-results-list');
    const searchResultsDiv = document.getElementById('search-results');
    const docCreationArea = document.getElementById('document-creation-area');
    
    // Double-check elements exist
    if (!resultsList || !searchResultsDiv || !docCreationArea) {
        console.error("Required DOM elements not found");
        alert("Error: Unable to perform search. Please try again.");
        return;
    }
    
    // Show loading state
    resultsList.innerHTML = '<p class="text-center text-gray-500">Searching documents...</p>';
    searchResultsDiv.classList.remove('hidden');
    docCreationArea.classList.add('hidden');
    
    let allResults = [];
    
    try {
        // Search Receipts if applicable
        if (docTypeFilter === 'all' || docTypeFilter === 'receipt') {
            const receiptResults = await searchReceipts(searchTerm);
            allResults = allResults.concat(receiptResults.map(r => ({...r, type: 'receipt'})));
        }
        
        // Search Invoices if applicable
        if (docTypeFilter === 'all' || docTypeFilter === 'invoice') {
            const invoiceResults = await searchInvoices(searchTerm);
            allResults = allResults.concat(invoiceResults.map(i => ({...i, type: 'invoice'})));
        }
        
        // Search Agreements if applicable
        if (docTypeFilter === 'all' || docTypeFilter === 'agreement') {
            const agreementResults = await searchAgreements(searchTerm);
            allResults = allResults.concat(agreementResults.map(a => ({...a, type: 'agreement'})));
        }
        
        // Sort by date (newest first)
        allResults.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB - dateA;
        });
        
        // Display results
        if (resultsList) {
            displaySearchResults(allResults, searchTerm);
        }
        
    } catch (error) {
        console.error("Error searching documents:", error);
        if (resultsList) {
            resultsList.innerHTML = '<p class="text-red-500 text-center">Error searching documents. Please try again.</p>';
        }
    }
}

/**
 * Helper function to display search results
 */
function displaySearchResults(results, searchTerm) {
    const resultsList = document.getElementById('search-results-list');
    
    if (!resultsList) return;
    
    if (results.length === 0) {
        resultsList.innerHTML = `
            <div class="text-center p-8 bg-gray-50 rounded-lg">
                <p class="text-gray-600">No documents found for "<span class="font-semibold">${searchTerm}</span>"</p>
                <p class="text-sm text-gray-500 mt-2">Try searching with different terms</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="mb-4">
            <p class="text-gray-600">Found <span class="font-bold text-primary-blue">${results.length}</span> documents for "<span class="font-semibold">${searchTerm}</span>"</p>
        </div>
    `;
    
    results.forEach(doc => {
        const docJson = JSON.stringify({
            ...doc,
            firestoreId: doc.id,
            createdAt: doc.createdAt ? (doc.createdAt.toDate ? doc.createdAt.toDate().toISOString() : doc.createdAt) : new Date().toISOString()
        });
        
        if (doc.type === 'receipt') {
            html += renderReceiptSearchResult(doc, docJson);
        } else if (doc.type === 'invoice') {
            html += renderInvoiceSearchResult(doc, docJson);
        } else if (doc.type === 'agreement') {
            html += renderAgreementSearchResult(doc, docJson);
        }
    });
    
    resultsList.innerHTML = html;
}

/**
 * Renders a receipt search result card
 */
function renderReceiptSearchResult(doc, docJson) {
    const date = doc.receiptDate || (doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : 'N/A');
    
    return `
        <div class="p-4 border border-secondary-red/30 rounded-lg bg-white shadow-sm hover:shadow-md transition duration-200">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-secondary-red text-white text-xs font-bold px-2 py-1 rounded">RECEIPT</span>
                        <span class="text-sm text-gray-500">${date}</span>
                    </div>
                    <h4 class="font-bold text-gray-800">${doc.receiptId}</h4>
                    <p class="text-sm text-gray-700 mt-1"><strong>From:</strong> ${doc.receivedFrom}</p>
                    <p class="text-sm text-gray-600"><strong>For:</strong> ${doc.beingPaidFor || 'N/A'}</p>
                    <p class="text-sm text-gray-600"><strong>Amount:</strong> ${doc.currency} ${doc.amountReceived?.toFixed(2) || '0.00'}</p>
                    ${doc.invoiceReference ? `<p class="text-sm text-gray-600"><strong>Invoice Ref:</strong> ${doc.invoiceReference}</p>` : ''}
                </div>
                <div class="flex flex-col gap-2 ml-4">
                    <button onclick='reDownloadReceipt(${docJson})' 
                            class="bg-secondary-red hover:bg-red-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                        Download
                    </button>
                    <button onclick='addPaymentToReceipt(${docJson})' 
                            class="bg-primary-blue hover:bg-blue-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                        Add Payment
                    </button>
                    <button onclick='viewReceiptBalances(${docJson})' 
                            class="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                        View Balances
                    </button>
                    <button onclick='createAgreementFromReceipt(${docJson})' 
                            class="bg-gray-700 hover:bg-gray-900 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                        Create Agreement
                    </button>
                    <button onclick='revokeReceipt(${docJson})' 
                            class="bg-red-600 hover:bg-red-800 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                        REVOKE
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders an invoice search result card
 */
function renderInvoiceSearchResult(doc, docJson) {
    const date = doc.issueDate || (doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : 'N/A');
    
    return `
        <div class="p-4 border border-primary-blue/30 rounded-lg bg-white shadow-sm hover:shadow-md transition duration-200">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-primary-blue text-white text-xs font-bold px-2 py-1 rounded">${doc.docType || 'INVOICE'}</span>
                        <span class="text-sm text-gray-500">${date}</span>
                    </div>
                    <h4 class="font-bold text-gray-800">${doc.invoiceId}</h4>
                    <p class="text-sm text-gray-700 mt-1"><strong>Client:</strong> ${doc.clientName}</p>
                    <p class="text-sm text-gray-600"><strong>Vehicle:</strong> ${doc.carDetails?.make || ''} ${doc.carDetails?.model || ''} ${doc.carDetails?.year || ''}</p>
                    <p class="text-sm text-gray-600"><strong>Total:</strong> USD ${doc.pricing?.totalUSD?.toFixed(2) || '0.00'}</p>
                    <p class="text-sm text-gray-600"><strong>Phone:</strong> ${doc.clientPhone || 'N/A'}</p>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                    <button onclick='reDownloadInvoice(${docJson})' 
                            class="bg-primary-blue hover:bg-blue-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                        Download
                    </button>
                    <button onclick='createReceiptFromInvoice(${docJson})' 
                            class="bg-secondary-red hover:bg-red-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                        Create Receipt
                    </button>
                    <button onclick='markInvoiceDepositPaid(${docJson})' 
                            class="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                        Deposit Paid
                    </button>
                    <button onclick='createAdditionalInvoice(${docJson})' 
                            class="bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                        Add Invoice
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders an agreement search result card
 */
function renderAgreementSearchResult(doc, docJson) {
    const date = doc.agreementDate || (doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : 'N/A');
    
    return `
        <div class="p-4 border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition duration-200">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">AGREEMENT</span>
                        <span class="text-sm text-gray-500">${date}</span>
                    </div>
                    <h4 class="font-bold text-gray-800">Agreement #${doc.id.substring(0, 8)}...</h4>
                    <p class="text-sm text-gray-700 mt-1"><strong>Buyer:</strong> ${doc.buyer?.name || 'N/A'}</p>
                    <p class="text-sm text-gray-600"><strong>Vehicle:</strong> ${doc.vehicle?.makeModel || 'N/A'}</p>
                    <p class="text-sm text-gray-600"><strong>Total:</strong> ${doc.salesTerms?.currency || 'KES'} ${doc.salesTerms?.price?.toFixed(2) || '0.00'}</p>
                    <p class="text-sm text-gray-600"><strong>Phone:</strong> ${doc.buyer?.phone || 'N/A'}</p>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                    <button onclick='reDownloadAgreement(${docJson})' 
                            class="bg-gray-700 hover:bg-gray-800 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                        Download
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Clears search and shows the default view
 */
function clearSearch() {
    // Get elements with null checks
    const searchInput = document.getElementById('document-search');
    const filterSelect = document.getElementById('document-type-filter');
    const searchResultsDiv = document.getElementById('search-results');
    const docCreationArea = document.getElementById('document-creation-area');
    
    if (searchInput) searchInput.value = '';
    if (filterSelect) filterSelect.value = 'all';
    
    if (searchResultsDiv) searchResultsDiv.classList.add('hidden');
    if (docCreationArea) docCreationArea.classList.remove('hidden');
}

// Add event listener for Enter key in search
document.addEventListener('DOMContentLoaded', function() {

  function setupSearchEnterKey() {
    const searchInput = document.getElementById('document-search');
    if (searchInput) {
        // Remove any existing listeners to avoid duplicates
        searchInput.removeEventListener('keypress', handleSearchEnterKey);
        searchInput.addEventListener('keypress', handleSearchEnterKey);
    }
}

function handleSearchEnterKey(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchDocuments();
    }
}

// Then update the handleDocumentGenerator function to call setupSearchEnterKey:
function handleDocumentGenerator() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">Document Generator</h2>
        
        <!-- Search and Filter Section -->
        <div class="mb-6 p-4 bg-white rounded-xl shadow-md border border-gray-200">
            <div class="flex flex-wrap gap-4 items-end">
                <div class="flex-1 min-w-[300px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Search Documents</label>
                    <div class="flex gap-2">
                        <input type="text" id="document-search" placeholder="Search by client name, reference number, or car make/model..." class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue">
                        <button onclick="searchDocuments()" class="bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-lg transition duration-150">
                            Search
                        </button>
                        <button onclick="clearSearch()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150">
                            Clear
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <select id="document-type-filter" class="p-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue">
                        <option value="all">All Documents</option>
                        <option value="receipt">Receipts Only</option>
                        <option value="invoice">Invoices Only</option>
                        <option value="agreement">Sales Agreements Only</option>
                    </select>
                </div>
            </div>
            <div class="mt-3 text-sm text-gray-600">
                <p>Search by: Client Name, Reference Number, Car Make/Model, Phone Number, or VIN</p>
            </div>
        </div>

        <div class="flex space-x-4 mb-6 flex-wrap">
            <button onclick="renderInvoiceForm()" class="bg-primary-blue hover:bg-blue-900 text-white p-3 rounded-lg transition duration-150 mb-2">Invoice/Proforma</button>
            <button onclick="renderInvoiceHistory()" class="bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-lg transition duration-150 mb-2">Invoice History</button>
            <button onclick="renderReceiptForm()" class="bg-secondary-red hover:bg-red-700 text-white p-3 rounded-lg transition duration-150 mb-2">Payment Receipt</button>
            <button onclick="renderAgreementForm()" class="bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-lg transition duration-150 mb-2">Car Sales Agreement</button>
            <button onclick="renderBankManagement()" class="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition duration-150 mb-2">BANKS</button>
        </div>
        
        <div id="document-form-area">
            <div id="search-results" class="hidden">
                <h3 class="text-xl font-bold mb-4 text-primary-blue">Search Results</h3>
                <div id="search-results-list" class="space-y-4">
                    <!-- Search results will appear here -->
                </div>
            </div>
            <div id="document-creation-area">
                <p class="text-gray-600">Select a document type or manage bank accounts.</p>
            </div>
        </div>
    `;
    
    // Setup enter key listener
    setTimeout(() => {
        setupSearchEnterKey();
    }, 100);
}
    // This will be initialized when handleDocumentGenerator is called
});

// =================================================================
//                 3. DASHBOARD & NAVIGATION (UPDATED)
// =================================================================

function renderDashboard() {
    appContent.innerHTML = `
        <h2 class="text-4xl font-extrabold mb-8 text-primary-blue">CDMS Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${createDashboardCard('Document Generator', 'Invoices, Receipts, Agreements', 'bg-green-100 border-green-400', 'handleDocumentGenerator')}
            ${createDashboardCard('Fleet Management', 'Car Tracking, Clearing, ETA', 'bg-yellow-100 border-yellow-400', 'handleFleetManagement')}
        </div>
    `;
    
    // Update navigation links
    mainNav.innerHTML = `
        <a href="#" onclick="renderDashboard()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Home</a>
        <a href="#" onclick="handleDocumentGenerator()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Documents</a>
        <a href="#" onclick="handleFleetManagement()" class="py-2 px-3 rounded hover:bg-blue-500 transition duration-150">Fleet</a>
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

// New Utility for Shared Reference & Serial Generation
async function generateSharedRefId(clientName, carModel, carYear, collectionName) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const namePart = clientName.split(' ')[0].toUpperCase().substring(0, 3);
    const modelPart = carModel.toUpperCase().substring(0, 3);
    const baseId = `${datePart}-${namePart}-${modelPart}-${carYear}`;
    
    // Fetch current count to determine the serial suffix (0001, 0002, etc.)
    const snapshot = await db.collection(collectionName).get();
    const serial = (snapshot.size + 1).toString().padStart(4, '0');
    
    return `${baseId}-${serial}`;
}

// =================================================================
//                 4. DOCUMENT GENERATOR ROUTING (UPDATED)
// =================================================================

function handleDocumentGenerator() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-primary-blue">Document Generator</h2>
        
        <!-- Search and Filter Section -->
        <div class="mb-6 p-4 bg-white rounded-xl shadow-md border border-gray-200">
            <div class="flex flex-wrap gap-4 items-end">
                <div class="flex-1 min-w-[300px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Search Documents</label>
                    <div class="flex gap-2">
                        <input type="text" id="document-search" placeholder="Search by client name, reference number, or car make/model..." class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue">
                        <button onclick="searchDocuments()" class="bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-lg transition duration-150">
                            Search
                        </button>
                        <button onclick="clearSearch()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150">
                            Clear
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <select id="document-type-filter" class="p-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue">
                        <option value="all">All Documents</option>
                        <option value="receipt">Receipts Only</option>
                        <option value="invoice">Invoices Only</option>
                        <option value="agreement">Sales Agreements Only</option>
                    </select>
                </div>
            </div>
            <div class="mt-3 text-sm text-gray-600">
                <p>Search by: Client Name, Reference Number, Car Make/Model, Phone Number, or VIN</p>
            </div>
        </div>

        <div class="flex space-x-4 mb-6 flex-wrap">
            <button onclick="renderInvoiceForm()" class="bg-primary-blue hover:bg-blue-900 text-white p-3 rounded-lg transition duration-150 mb-2">Invoice/Proforma</button>
            <button onclick="renderInvoiceHistory()" class="bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-lg transition duration-150 mb-2">Invoice History</button>
            <button onclick="renderReceiptForm()" class="bg-secondary-red hover:bg-red-700 text-white p-3 rounded-lg transition duration-150 mb-2">Payment Receipt</button>
            <button onclick="renderAgreementForm()" class="bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-lg transition duration-150 mb-2">Car Sales Agreement</button>
            <button onclick="renderBankManagement()" class="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition duration-150 mb-2">BANKS</button>
        </div>
        
        <div id="document-form-area">
            <div id="search-results" class="hidden">
                <h3 class="text-xl font-bold mb-4 text-primary-blue">Search Results</h3>
                <div id="search-results-list" class="space-y-4">
                    <!-- Search results will appear here -->
                </div>
            </div>
            <div id="document-creation-area">
                <p class="text-gray-600">Select a document type or manage bank accounts.</p>
            </div>
        </div>
    `;
    
    // Add event listener for Enter key
    const searchInput = document.getElementById('document-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchDocuments();
            }
        });
    }
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
        if (num < 1000) return a[Math.floor(num / 100)] + ' hundred' + (num % 100 === 0 ? '' : ' ' + numToWords(num % 100));
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

// NEW FUNCTION: Fetch invoice amount based on invoice number
async function fetchInvoiceAmount(invoiceNumber) {
    try {
        const snapshot = await db.collection("invoices")
            .where("invoiceId", "==", invoiceNumber)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return null;
        }
        
        const invoiceDoc = snapshot.docs[0];
        const invoiceData = invoiceDoc.data();
        
        return {
            totalUSD: invoiceData.pricing.totalUSD,
            depositUSD: invoiceData.pricing.depositUSD,
            balanceUSD: invoiceData.pricing.balanceUSD,
            depositKSH: invoiceData.pricing.depositKSH,
            exchangeRate: invoiceData.exchangeRate,
            clientName: invoiceData.clientName,
            vehicleInfo: `${invoiceData.carDetails.make} ${invoiceData.carDetails.model} ${invoiceData.carDetails.year}`
        };
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return null;
    }
}

// NEW FUNCTION: Calculate payment history and balances - FIXED CALCULATION
async function calculateReceiptBalances(receiptId) {
    try {
        // Get all payments for this receipt (including additional payments)
        const snapshot = await db.collection("receipt_payments")
            .where("receiptId", "==", receiptId)
            .orderBy("paymentDate", "asc")
            .get();
        
        let totalPaidUSD = 0;
        let totalPaidKSH = 0;
        const payments = [];
        
        snapshot.forEach(doc => {
            const payment = doc.data();
            payments.push(payment);
            
            // FIXED: Use amountUSD and amountKSH if available, otherwise calculate
            if (payment.amountUSD !== undefined) {
                totalPaidUSD += payment.amountUSD;
            } else if (payment.currency === 'USD') {
                totalPaidUSD += payment.amount;
                if (payment.exchangeRate) {
                    totalPaidKSH += payment.amount * payment.exchangeRate;
                }
            }
            
            if (payment.amountKSH !== undefined) {
                totalPaidKSH += payment.amountKSH;
            } else if (payment.currency === 'KSH') {
                totalPaidKSH += payment.amount;
                if (payment.exchangeRate) {
                    totalPaidUSD += payment.amount / payment.exchangeRate;
                }
            }
        });
        
        return {
            payments,
            totalPaidUSD,
            totalPaidKSH,
            paymentCount: payments.length
        };
    } catch (error) {
        console.error("Error calculating receipt balances:", error);
        return {
            payments: [],
            totalPaidUSD: 0,
            totalPaidKSH: 0,
            paymentCount: 0
        };
    }
}

/**
 * Renders the new comprehensive Receipt form.
 */
function renderReceiptForm(invoiceReference = '') {
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

                    <div class="mb-4">
                        <label for="invoiceReference" class="block text-gray-700 font-medium mb-1">Invoice Reference (Optional)</label>
                        <div class="flex gap-2">
                            <input type="text" id="invoiceReference" placeholder="Enter Invoice Number" value="${invoiceReference}" class="flex-1 p-2 border rounded-md">
                            <button type="button" onclick="fetchInvoiceDetails()" class="bg-primary-blue hover:bg-blue-900 text-white px-3 py-2 rounded-md text-sm">
                                Fetch Invoice
                            </button>
                        </div>
                    </div>

                    <div id="invoice-details" class="hidden mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 class="font-bold text-primary-blue mb-2">Invoice Details:</h4>
                        <p id="invoice-client" class="text-sm"></p>
                        <p id="invoice-vehicle" class="text-sm"></p>
                        <p id="invoice-total" class="text-sm"></p>
                        <p id="invoice-deposit" class="text-sm"></p>
                        <p id="invoice-balance" class="text-sm"></p>
                        <p id="invoice-rate" class="text-sm"></p>
                    </div>

                    <!-- NEW SECTION FOR MANUAL TOTAL PAYMENT INPUT -->
                    <div id="manual-total-section" class="hidden mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 class="font-bold text-green-700 mb-2">Total Payment Information (For receipts without invoice)</h4>
                        <div class="grid grid-cols-2 gap-3 mb-2">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Total Payment Amount</label>
                                <input type="number" id="manualTotalAmount" step="0.01" placeholder="0.00" class="w-full p-2 border rounded-md" oninput="updateManualBalanceCalculation()">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Currency</label>
                                <select id="manualTotalCurrency" class="w-full p-2 border rounded-md" onchange="updateManualBalanceCalculation()">
                                    <option value="KSH">KSH</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                        </div>
                        <p id="manual-total-display" class="text-sm text-gray-600"></p>
                        <button type="button" onclick="applyManualTotalToBalances()" class="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-md transition duration-150">
                            Apply to Balance Calculation
                        </button>
                    </div>

                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Amount Received</legend>
                        <div class="grid grid-cols-3 gap-3">
                            <select id="currency" required class="p-2 border rounded-md">
                                <option value="KSH">KSH</option>
                                <option value="USD">USD</option>
                            </select>
                            <input type="number" id="amountReceived" step="0.01" required placeholder="Amount Figure" class="p-2 border rounded-md col-span-2" oninput="updateAmountInWords(); checkForManualTotal();">
                        </div>
                        <div class="mt-2">
                            <label for="amountWords" class="block text-sm font-medium text-gray-700">Amount in Words:</label>
                            <textarea id="amountWords" rows="2" readonly class="mt-1 block w-full p-2 border rounded-md bg-gray-100 text-gray-800"></textarea>
                        </div>
                    </fieldset>

                    <!-- ADD BUTTON TO OPEN MANUAL TOTAL SECTION -->
                    <div class="mb-4">
                        <button type="button" onclick="toggleManualTotalSection()" class="text-primary-blue hover:text-blue-900 text-sm underline">
                            + Add total payment information (for receipts without invoice)
                        </button>
                    </div>

                    <input type="text" id="beingPaidFor" required placeholder="Being Paid For (e.g., Toyota Vitz 2018 Deposit)" value="${invoiceReference}" class="mb-4 block w-full p-2 border rounded-md">

                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Payment Details</legend>
                        <div class="mb-3">
                            <label for="exchangeRate" class="block text-sm font-medium text-gray-700">Exchange Rate (USD 1 = KES)</label>
                            <input type="number" id="exchangeRate" step="0.01" value="130.00" required class="w-full p-2 border rounded-md">
                        </div>
                        <div class="mb-3">
                            <label for="bankUsed" class="block text-sm font-medium text-gray-700">Bank Used</label>
                            <select id="bankUsed" required class="w-full p-2 border rounded-md">
                                <option value="" disabled selected>Select Bank</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" id="chequeNo" placeholder="Cheque No. (Optional)" class="p-2 border rounded-md">
                            <input type="text" id="rtgsTtNo" placeholder="RTGS/TT No. (Optional)" class="p-2 border rounded-md">
                        </div>
                    </fieldset>

                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <input type="number" id="balanceRemaining" step="0.01" placeholder="Balance Remaining (Auto-calculated)" readonly class="block w-full p-2 border rounded-md bg-gray-100">
                        <input type="date" id="balanceDueDate" placeholder="To be paid on or before" class="block w-full p-2 border rounded-md">
                    </div>

                    <div class="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 class="font-bold text-secondary-red mb-2">Auto-Calculated Balances:</h4>
                        <p id="calculated-balance-kes" class="text-sm">KES Balance: --</p>
                        <p id="calculated-balance-usd" class="text-sm">USD Balance: --</p>
                    </div>

                    <button type="submit" class="w-full bg-secondary-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-150">
                        Generate & Save Receipt
                    </button>
                </form>
            </div>

            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Recent Receipts</h3>
                <div class="mb-4">
                    <button onclick="renderReceiptBalancesView()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-150">
                        View All Receipt Balances
                    </button>
                </div>
                <div id="recent-receipts">
                    <p class="text-center text-gray-500">Loading payments...</p>
                </div>
            </div>
        </div>
    `;
    
    // If invoice reference was provided, try to fetch details automatically
    if (invoiceReference) {
        setTimeout(() => {
            fetchInvoiceDetails();
        }, 500);
    }
    
    // Load bank dropdown options
    populateBankDropdownForReceipt();
    fetchReceipts();
    
    // Add event listener for invoice reference to hide manual section when invoice is found
    const invoiceRefInput = document.getElementById('invoiceReference');
    if (invoiceRefInput) {
        invoiceRefInput.addEventListener('input', function() {
            if (this.value.trim()) {
                document.getElementById('manual-total-section').classList.add('hidden');
            }
        });
    }
}

// New functions for manual total handling:
function toggleManualTotalSection() {
    const manualSection = document.getElementById('manual-total-section');
    const invoiceRef = document.getElementById('invoiceReference').value;
    
    if (invoiceRef.trim()) {
        alert("You already have an invoice reference. Remove it first to use manual total payment.");
        return;
    }
    
    manualSection.classList.toggle('hidden');
}

function checkForManualTotal() {
    const amountReceived = parseFloat(document.getElementById('amountReceived').value) || 0;
    const invoiceRef = document.getElementById('invoiceReference').value;
    
    // If no invoice reference and amount is entered, show manual total option
    if (!invoiceRef.trim() && amountReceived > 0) {
        // Show suggestion to add manual total
        if (!document.getElementById('manual-total-suggestion')) {
            const suggestion = document.createElement('div');
            suggestion.id = 'manual-total-suggestion';
            suggestion.className = 'mb-3 p-2 bg-yellow-50 rounded text-sm text-yellow-700';
            suggestion.innerHTML = `
                <p>No invoice reference provided. Consider adding total payment amount for accurate balance calculation.</p>
                <button type="button" onclick="toggleManualTotalSection()" class="mt-1 text-blue-600 hover:text-blue-800 underline">
                    Add total payment information
                </button>
            `;
            const beingPaidForField = document.getElementById('beingPaidFor');
            beingPaidForField.parentNode.insertBefore(suggestion, beingPaidForField);
        }
    }
}

function updateManualBalanceCalculation() {
    const manualTotal = parseFloat(document.getElementById('manualTotalAmount').value) || 0;
    const manualCurrency = document.getElementById('manualTotalCurrency').value;
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 130;
    
    if (manualTotal > 0) {
        let totalUSD = manualTotal;
        let totalKSH = manualTotal;
        
        if (manualCurrency === 'KSH') {
            totalUSD = manualTotal / exchangeRate;
            totalKSH = manualTotal;
        } else {
            totalUSD = manualTotal;
            totalKSH = manualTotal * exchangeRate;
        }
        
        document.getElementById('manual-total-display').innerHTML = 
            `Total: ${manualCurrency} ${manualTotal.toFixed(2)} (USD ${totalUSD.toFixed(2)} / KES ${totalKSH.toFixed(2)})`;
    }
}

function applyManualTotalToBalances() {
    const manualTotal = parseFloat(document.getElementById('manualTotalAmount').value) || 0;
    const manualCurrency = document.getElementById('manualTotalCurrency').value;
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 130;
    
    if (manualTotal <= 0) {
        alert("Please enter a valid total payment amount");
        return;
    }
    
    // Calculate totals
    let totalUSD = manualTotal;
    let totalKSH = manualTotal;
    
    if (manualCurrency === 'KSH') {
        totalUSD = manualTotal / exchangeRate;
        totalKSH = manualTotal;
    } else {
        totalUSD = manualTotal;
        totalKSH = manualTotal * exchangeRate;
    }
    
    // Store in dataset for calculations
    const invoiceRefElement = document.getElementById('invoiceReference');
    invoiceRefElement.dataset.totalUSD = totalUSD;
    invoiceRefElement.dataset.balanceUSD = totalUSD; // Initial balance equals total
    invoiceRefElement.dataset.exchangeRate = exchangeRate;
    
    // Update calculations
    updateReceiptCalculations();
    
    alert(`Total payment of ${manualCurrency} ${manualTotal.toFixed(2)} applied. Balance calculations will now use this total.`);
}

/**
 * Populates the bank dropdown in receipt form with saved banks
 */
async function populateBankDropdownForReceipt() {
    const bankSelect = document.getElementById('bankUsed');
    if (!bankSelect) return;

    // Clear existing options except the first one
    while (bankSelect.options.length > 1) {
        bankSelect.remove(1);
    }

    try {
        const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
        
        if (snapshot.empty) {
            // Add a placeholder if no banks are configured
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No banks configured. Add banks first.";
            option.disabled = true;
            bankSelect.appendChild(option);
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = `${data.name} - ${data.branch || 'No Branch'} (${data.currency})`;
            option.textContent = `${data.name} - ${data.branch || 'No Branch'} (${data.currency})`;
            bankSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading banks for receipt:", error);
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Error loading banks";
        option.disabled = true;
        bankSelect.appendChild(option);
    }
}

/**
 * Fetches invoice details and auto-populates receipt form
 */
async function fetchInvoiceDetails() {
    const invoiceRef = document.getElementById('invoiceReference').value;
    if (!invoiceRef) {
        alert("Please enter an invoice reference number");
        return;
    }
    
    const invoiceDetails = await fetchInvoiceAmount(invoiceRef);
    if (!invoiceDetails) {
        alert("Invoice not found. Please check the invoice number.");
        return;
    }
    
    // Show invoice details section
    const detailsDiv = document.getElementById('invoice-details');
    detailsDiv.classList.remove('hidden');
    
    // Populate invoice details
    document.getElementById('invoice-client').textContent = `Client: ${invoiceDetails.clientName}`;
    document.getElementById('invoice-vehicle').textContent = `Vehicle: ${invoiceDetails.vehicleInfo}`;
    document.getElementById('invoice-total').textContent = `Total Price: USD ${invoiceDetails.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('invoice-deposit').textContent = `Deposit Required: USD ${invoiceDetails.depositUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} (KES ${parseFloat(invoiceDetails.depositKSH).toLocaleString('en-US', { minimumFractionDigits: 2 })})`;
    document.getElementById('invoice-balance').textContent = `Balance Due: USD ${invoiceDetails.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('invoice-rate').textContent = `Exchange Rate: USD 1 = KES ${invoiceDetails.exchangeRate}`;
    
    // Auto-populate receipt form
    document.getElementById('receivedFrom').value = invoiceDetails.clientName;
    document.getElementById('beingPaidFor').value = `${invoiceDetails.vehicleInfo} Deposit`;
    document.getElementById('exchangeRate').value = invoiceDetails.exchangeRate;
    
    // Store exchange rate in hidden field for calculations
    document.getElementById('invoiceReference').dataset.exchangeRate = invoiceDetails.exchangeRate;
    document.getElementById('invoiceReference').dataset.totalUSD = invoiceDetails.totalUSD;
    document.getElementById('invoiceReference').dataset.balanceUSD = invoiceDetails.balanceUSD;
    
    // Calculate initial balances
    updateReceiptCalculations();
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
    updateReceiptCalculations();
}

/**
 * Updates receipt calculations based on amount entered and invoice details - FIXED CALCULATION
 */
function updateReceiptCalculations() {
    const amountReceived = parseFloat(document.getElementById('amountReceived').value) || 0;
    const currency = document.getElementById('currency').value;
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 130;
    const invoiceRef = document.getElementById('invoiceReference');
    const totalUSD = parseFloat(invoiceRef.dataset.totalUSD) || 0;
    const initialBalanceUSD = parseFloat(invoiceRef.dataset.balanceUSD) || totalUSD;
    
    // Calculate amounts in different currencies - FIXED CALCULATION
    let amountReceivedUSD = amountReceived;
    let amountReceivedKSH = amountReceived;
    
    if (currency === 'KSH') {
        amountReceivedUSD = amountReceived / exchangeRate;
        amountReceivedKSH = amountReceived;
    } else if (currency === 'USD') {
        amountReceivedUSD = amountReceived;
        amountReceivedKSH = amountReceived * exchangeRate;
    }
    
    // Calculate remaining balances - FIXED: Use proper subtraction
    const remainingUSD = Math.max(0, initialBalanceUSD - amountReceivedUSD);
    const remainingKSH = remainingUSD * exchangeRate;
    
    // Update display fields
    document.getElementById('balanceRemaining').value = remainingUSD.toFixed(2);
    
    const balanceKES = document.getElementById('calculated-balance-kes');
    const balanceUSD = document.getElementById('calculated-balance-usd');
    
    if (totalUSD > 0) {
        const totalPaidUSD = totalUSD - remainingUSD;
        const totalPaidKSH = totalPaidUSD * exchangeRate;
        
      drawText(`KES Balance: ${formatAmount(remainingKSH)} (Paid: ${formatAmount(totalPaidKSH)})`, margin, amountBoxY + 10, 10);
drawText(`USD Balance: ${formatAmount(remainingUSD)} (Paid: ${formatAmount(totalPaidUSD)})`, margin, amountBoxY + 14, 10);
    } else {
        balanceKES.textContent = `KES Balance: ${remainingKSH.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        balanceUSD.textContent = `USD Balance: ${remainingUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
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
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 130;
    const balanceRemaining = parseFloat(document.getElementById('balanceRemaining').value) || 0;
    const balanceDueDate = document.getElementById('balanceDueDate').value;
    const invoiceReference = document.getElementById('invoiceReference').value;
    const invoiceRefElement = document.getElementById('invoiceReference');
    const invoiceExchangeRate = invoiceRefElement && invoiceRefElement.dataset.exchangeRate 
        ? parseFloat(invoiceRefElement.dataset.exchangeRate) 
        : exchangeRate;

    if (isNaN(amountReceived) || amountReceived <= 0) {
        alert("Please enter a valid amount received.");
        return;
    }

    const receiptId = generateReceiptId(receiptType, receivedFrom);
    const receiptDate = new Date().toLocaleDateString('en-US');

    // Calculate amounts in both currencies - FIXED: Store both currencies properly
    let amountReceivedUSD = amountReceived;
    let amountReceivedKSH = amountReceived;
    
    if (currency === 'KSH') {
        amountReceivedUSD = amountReceived / exchangeRate;
        amountReceivedKSH = amountReceived;
    } else if (currency === 'USD') {
        amountReceivedUSD = amountReceived;
        amountReceivedKSH = amountReceived * exchangeRate;
    }

    // Check if a receipt with the same invoice reference already exists
    let existingReceipt = null;
    let existingReceiptId = null;
    
    if (invoiceReference) {
        try {
            const existingReceipts = await db.collection("receipts")
                .where("invoiceReference", "==", invoiceReference)
                .limit(1)
                .get();
            
            if (!existingReceipts.empty) {
                existingReceipt = existingReceipts.docs[0].data();
                existingReceiptId = existingReceipts.docs[0].id;
            }
        } catch (error) {
            console.error("Error checking for existing receipt:", error);
        }
    }

    // If existing receipt found, ask user if they want to add payment to it
    if (existingReceipt && existingReceiptId) {
        const shouldAddToExisting = confirm(`A receipt already exists for invoice reference: ${invoiceReference}\n\nDo you want to add this payment to the existing receipt (${existingReceipt.receiptId}) instead of creating a new one?`);
        
        if (shouldAddToExisting) {
            // Add payment to existing receipt
            await addPaymentToExistingReceiptFromForm(
                existingReceiptId,
                existingReceipt.receiptId,
                existingReceipt.receivedFrom,
                existingReceipt.exchangeRate || exchangeRate,
                {
                    amount: amountReceived,
                    currency: currency,
                    amountUSD: amountReceivedUSD,
                    amountKSH: amountReceivedKSH,
                    chequeNo,
                    rtgsTtNo,
                    bankUsed,
                    description: `Additional payment for: ${beingPaidFor}`,
                    paymentMethod: bankUsed !== 'Cash' ? `Bank: ${bankUsed}` : (chequeNo ? `Cheque: ${chequeNo}` : (rtgsTtNo ? `RTGS/TT: ${rtgsTtNo}` : "Cash"))
                }
            );
            
            // Show payment history for the receipt
            viewReceiptPaymentDetails(existingReceiptId, existingReceipt.receiptId, existingReceipt.receivedFrom);
            
            // Reset form
            document.getElementById('receipt-form').reset();
            document.getElementById('amountWords').value = '';
            document.getElementById('invoice-details').classList.add('hidden');
            const bankSelect = document.getElementById('bankUsed');
            if (bankSelect) bankSelect.value = "";
            
            fetchReceipts(); // Refresh history
            return;
        }
    }

    // If no existing receipt or user chose to create new, create new receipt
    const receiptData = {
        receiptId,
        receiptType,
        receivedFrom,
        currency,
        amountReceived,
        amountReceivedUSD, // FIXED: Store USD amount
        amountReceivedKSH, // FIXED: Store KSH amount
        amountWords,
        beingPaidFor,
        paymentDetails: {
            chequeNo,
            rtgsTtNo,
            bankUsed
        },
        balanceDetails: {
            balanceRemaining,
            balanceDueDate,
            balanceRemainingUSD: balanceRemaining,
            balanceRemainingKSH: balanceRemaining * exchangeRate
        },
        invoiceReference,
        exchangeRate,
        receiptDate,
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        revoked: false // Add revoked flag
    };

    try {
        const docRef = await db.collection("receipts").add(receiptData);
        
        // Also save as first payment in receipt_payments collection
        const paymentData = {
            receiptId: docRef.id,
            receiptNumber: receiptId,
            paymentNumber: 1,
            paymentDate: receiptDate,
            amount: amountReceived,
            currency: currency,
            amountUSD: amountReceivedUSD,
            amountKSH: amountReceivedKSH,
            exchangeRate: exchangeRate,
            description: "Initial Payment",
            paymentMethod: bankUsed !== 'Cash' ? `Bank: ${bankUsed}` : (chequeNo ? `Cheque: ${chequeNo}` : (rtgsTtNo ? `RTGS/TT: ${rtgsTtNo}` : "Cash")),
            createdBy: currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection("receipt_payments").add(paymentData);
        
        alert(`Receipt ${receiptId} saved successfully!`);
        
        receiptData.firestoreId = docRef.id;
        receiptData.totalPaidUSD = amountReceivedUSD;
        receiptData.totalPaidKSH = amountReceivedKSH;
        receiptData.paymentCount = 1;
        receiptData.paymentHistory = [{
            paymentDate: receiptDate,
            amount: amountReceived,
            currency: currency,
            amountUSD: amountReceivedUSD,
            amountKSH: amountReceivedKSH,
            paymentMethod: bankUsed !== 'Cash' ? `Bank: ${bankUsed}` : (chequeNo ? `Cheque: ${chequeNo}` : (rtgsTtNo ? `RTGS/TT: ${rtgsTtNo}` : "Cash")),
            description: "Initial Payment"
        }];
        
        generateReceiptPDF(receiptData);
        
        document.getElementById('receipt-form').reset();
        document.getElementById('amountWords').value = '';
        document.getElementById('invoice-details').classList.add('hidden');
        
        // Reset bank dropdown to default
        const bankSelect = document.getElementById('bankUsed');
        if (bankSelect) {
            bankSelect.value = "";
        }
        
        fetchReceipts(); // Refresh history
    } catch (error) {
        console.error("Error saving receipt:", error);
        alert("Failed to save receipt: " + error.message);
    }
}

/**
 * Helper function to add payment to existing receipt from receipt form
 */
async function addPaymentToExistingReceiptFromForm(receiptDocId, receiptNumber, clientName, exchangeRate, paymentDetails) {
    const { amount, currency, amountUSD, amountKSH, chequeNo, rtgsTtNo, bankUsed, description, paymentMethod } = paymentDetails;
    
    // Get next payment number
    const paymentsSnapshot = await db.collection("receipt_payments")
        .where("receiptId", "==", receiptDocId)
        .get();
    
    const nextPaymentNumber = paymentsSnapshot.size + 1;
    
    // Save payment record
    const paymentData = {
        receiptId: receiptDocId,
        receiptNumber: receiptNumber,
        paymentNumber: nextPaymentNumber,
        paymentDate: new Date().toLocaleDateString('en-US'),
        amount: amount,
        currency: currency,
        amountUSD: amountUSD,
        amountKSH: amountKSH,
        exchangeRate: exchangeRate,
        description: description,
        paymentMethod: paymentMethod,
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection("receipt_payments").add(paymentData);
        
        // Update receipt balance
        const receiptDoc = await db.collection("receipts").doc(receiptDocId).get();
        const receiptData = receiptDoc.data();
        
        const currentBalanceUSD = receiptData.balanceDetails?.balanceRemainingUSD || 0;
        const newBalanceUSD = Math.max(0, currentBalanceUSD - amountUSD);
        const newBalanceKSH = newBalanceUSD * exchangeRate;
        
        await db.collection("receipts").doc(receiptDocId).update({
            "balanceDetails.balanceRemaining": newBalanceUSD,
            "balanceDetails.balanceRemainingUSD": newBalanceUSD,
            "balanceDetails.balanceRemainingKSH": newBalanceKSH,
            "amountReceived": (receiptData.amountReceived || 0) + amount,
            "amountReceivedUSD": (receiptData.amountReceivedUSD || 0) + amountUSD,
            "amountReceivedKSH": (receiptData.amountReceivedKSH || 0) + amountKSH
        });
        
        alert(`Additional payment of ${currency} ${amount.toFixed(2)} added to receipt ${receiptNumber} successfully!`);
        
        return true;
    } catch (error) {
        console.error("Error saving additional payment:", error);
        alert("Failed to save payment: " + error.message);
        return false;
    }
}

/**
 * Fetches and displays recent receipts with payment history button
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
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            
            // Calculate balances for this receipt
            const balances = await calculateReceiptBalances(doc.id);
            const totalPaidUSD = balances.totalPaidUSD;
            const totalPaidKSH = balances.totalPaidKSH;
            
            const receiptDataJson = JSON.stringify({
                ...data, 
                firestoreId: doc.id,
                totalPaidUSD: totalPaidUSD,
                totalPaidKSH: totalPaidKSH,
                paymentCount: balances.paymentCount,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            });

            const isRevoked = data.revoked || false;
            
            html += `<li class="p-3 border rounded-lg ${isRevoked ? 'bg-red-50' : 'bg-gray-50'} flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div class="flex-1">
                            ${isRevoked ? `<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">REVOKED</span><br>` : ''}
                            <strong class="text-gray-800">${data.receiptId}</strong><br>
                            <span class="text-sm text-gray-600">From: ${data.receivedFrom}</span><br>
                            <span class="text-sm text-gray-600">Amount: ${data.currency} ${data.amountReceived.toFixed(2)}</span><br>
                            ${data.invoiceReference ? `<span class="text-xs text-primary-blue">Invoice Ref: ${data.invoiceReference}</span><br>` : ''}
                            <span class="text-xs text-secondary-red">Payments: ${balances.paymentCount} | Total Paid: USD ${totalPaidUSD.toFixed(2)} / KES ${totalPaidKSH.toFixed(2)}</span>
                        </div>
                        <div class="mt-2 sm:mt-0 space-x-2">
                            <button onclick='reDownloadReceipt(${receiptDataJson})' 
                                    class="bg-secondary-red hover:bg-red-600 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                Download PDF
                            </button>
                            ${!isRevoked ? `
                            <button onclick='addPaymentToReceipt(${receiptDataJson})' 
                                    class="bg-primary-blue hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                Add Payment
                            </button>
                            ` : ''}
                            <button onclick='viewReceiptPaymentDetails("${doc.id}", "${data.receiptId}", "${data.receivedFrom}")' 
                                    class="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                View History
                            </button>
                            ${!isRevoked ? `
                            <button onclick='revokeReceipt(${receiptDataJson})' 
                                    class="bg-red-600 hover:bg-red-800 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                REVOKE
                            </button>
                            ` : ''}
                        </div>
                    </li>`;
        }
        html += `</ul>`;
        receiptList.innerHTML = html;
    } catch (error) {
        console.error("Error fetching receipts:", error);
        receiptList.innerHTML = `<p class="text-red-500">Error loading receipts. Check console for details.</p>`;
    }
}

/**
 * View detailed payment history for a specific receipt
 */
async function viewReceiptPaymentDetails(receiptDocId, receiptNumber, clientName) {
    const balances = await calculateReceiptBalances(receiptDocId);
    
    let paymentDetailsHtml = `<h4 class="font-bold text-primary-blue mb-3">Payment History for ${receiptNumber}</h4>`;
    paymentDetailsHtml += `<p class="text-sm text-gray-600 mb-4">Client: ${clientName}</p>`;
    
    if (balances.payments.length === 0) {
        paymentDetailsHtml += `<p class="text-gray-500">No payment history found.</p>`;
    } else {
        paymentDetailsHtml += `<div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Payment #</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">USD Equivalent</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">KES Equivalent</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Method</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">`;
        
        balances.payments.forEach((payment, index) => {
            paymentDetailsHtml += `<tr>
                <td class="px-4 py-2 text-sm">${index + 1}</td>
                <td class="px-4 py-2 text-sm">${payment.paymentDate || 'N/A'}</td>
                <td class="px-4 py-2 text-sm font-bold">${payment.currency} ${payment.amount.toFixed(2)}</td>
                <td class="px-4 py-2 text-sm">USD ${payment.amountUSD?.toFixed(2) || (payment.currency === 'USD' ? payment.amount.toFixed(2) : (payment.amount / (payment.exchangeRate || 130)).toFixed(2))}</td>
                <td class="px-4 py-2 text-sm">KES ${payment.amountKSH?.toFixed(2) || (payment.currency === 'KSH' ? payment.amount.toFixed(2) : (payment.amount * (payment.exchangeRate || 130)).toFixed(2))}</td>
                <td class="px-4 py-2 text-sm">${payment.paymentMethod || 'N/A'}</td>
                <td class="px-4 py-2 text-sm">${payment.description || 'N/A'}</td>
            </tr>`;
        });
        
        paymentDetailsHtml += `</tbody></table>`;
        
        // Add summary
        paymentDetailsHtml += `<div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 class="font-bold text-primary-blue mb-2">Payment Summary</h5>
            <p class="text-sm">Total Payments: ${balances.payments.length}</p>
            <p class="text-sm">Total Paid (USD): <span class="font-bold">${balances.totalPaidUSD.toFixed(2)}</span></p>
            <p class="text-sm">Total Paid (KES): <span class="font-bold">${balances.totalPaidKSH.toFixed(2)}</span></p>
        </div>`;
    }
    
    const modalHtml = `
        <div id="payment-details-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-primary-blue">Payment Details - ${receiptNumber}</h3>
                    <div class="flex space-x-2">
                        <button onclick='downloadReceiptWithHistory("${receiptDocId}")' 
                                class="bg-secondary-red hover:bg-red-700 text-white text-xs py-1 px-3 rounded-md transition duration-150">
                            Download Receipt with History
                        </button>
                        <button onclick="document.getElementById('payment-details-modal').remove()" class="text-gray-500 hover:text-gray-700">
                            &times;
                        </button>
                    </div>
                </div>
                ${paymentDetailsHtml}
                <div class="mt-4 flex justify-end">
                    <button onclick="document.getElementById('payment-details-modal').remove()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Downloads receipt PDF with full payment history
 */
async function downloadReceiptWithHistory(receiptDocId) {
    try {
        // Get receipt data
        const receiptDoc = await db.collection("receipts").doc(receiptDocId).get();
        if (!receiptDoc.exists) {
            alert("Receipt not found!");
            return;
        }
        
        const receiptData = receiptDoc.data();
        receiptData.firestoreId = receiptDocId;
        
        // Get payment history
        const balances = await calculateReceiptBalances(receiptDocId);
        
        // Add payment history to receipt data for PDF generation
        receiptData.totalPaidUSD = balances.totalPaidUSD;
        receiptData.totalPaidKSH = balances.totalPaidKSH;
        receiptData.paymentCount = balances.payments.length;
        receiptData.paymentHistory = balances.payments;
        
        // Generate enhanced PDF
        generateReceiptPDF(receiptData);
        
    } catch (error) {
        console.error("Error downloading receipt with history:", error);
        alert("Failed to download receipt with history: " + error.message);
    }
}

// =================================================================
//                 6. INVOICE MODULE (UPDATED WITH SEQUENTIAL NUMBERING)
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
 * Generates a sequential invoice number that resets on the 1st of each month
 */
async function generateSequentialInvoiceNumber(clientName, carModel, carYear) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Get the first day of current month
    const firstDayOfMonth = new Date(year, now.getMonth(), 1);
    
    // Query invoices from this month
    const monthStart = firebase.firestore.Timestamp.fromDate(firstDayOfMonth);
    const snapshot = await db.collection("invoices")
        .where("createdAt", ">=", monthStart)
        .get();
    
    // Calculate next sequential number
    const nextNumber = (snapshot.size + 1).toString().padStart(4, '0');
    
    // Get name and model parts for reference
    const namePart = clientName.split(' ')[0].toUpperCase().substring(0, 3);
    const modelPart = carModel.toUpperCase().substring(0, 3);
    
    return `${year}${month}-${nextNumber}-${namePart}-${modelPart}-${carYear}`;
}

/**
 * Populates a bank account dropdown list with data from Firestore.
 * @param {string} dropdownId - The ID of the select element to populate.
 */
async function populateBankDropdown(dropdownId, isMultiSelect = false) {
    const bankSelect = document.getElementById(dropdownId);
    if (!bankSelect) return;

    bankSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';

    const banks = await _getBankDetailsData();
    let options = isMultiSelect ? '' : '<option value="" disabled selected>Select Bank Account</option>';

    if (banks.length === 0) {
        bankSelect.innerHTML = '<option value="" disabled>No bank accounts configured.</option>';
        return;
    }

    banks.forEach(data => {
        // Properly escape JSON for HTML attribute
        const detailsJson = JSON.stringify(data)
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
        if (isMultiSelect) {
            options += `<option value="${detailsJson}">${data.name} - ${data.branch || 'No Branch'} (${data.currency})</option>`;
        } else {
            options += `<option value="${detailsJson}">${data.name} - ${data.branch || 'No Branch'} (${data.currency})</option>`;
        }
    });

    bankSelect.innerHTML = options;
    if (isMultiSelect) {
        bankSelect.setAttribute('multiple', 'multiple');
        bankSelect.size = 3; // Show 3 options at once
    }
}

/**
 * Auto-fills the buyer confirmation field when client name is entered
 */
function autoFillBuyerConfirmation() {
    const clientName = document.getElementById('clientName');
    const buyerConfirmation = document.getElementById('buyerNameConfirmation');
    
    if (clientName && buyerConfirmation) {
        // Set up event listener for input changes
        clientName.addEventListener('input', function() {
            // Only auto-fill if buyer confirmation is empty OR matches the beginning of client name
            if (clientName.value && (!buyerConfirmation.value || 
                buyerConfirmation.value === clientName.value.substring(0, buyerConfirmation.value.length))) {
                buyerConfirmation.value = clientName.value;
            }
        });
        
        // Also auto-fill on page load if client name is already filled
        if (clientName.value && !buyerConfirmation.value) {
            buyerConfirmation.value = clientName.value;
        }
    }
}

// =================================================================
//                 6. INVOICE MODULE (UPDATED WITH DEPOSIT PERCENTAGE & AUCTION INVOICE & TWO BANKS)
// =================================================================

/**
 * Renders the Invoice/Proforma form.
 */
function renderInvoiceForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg">
            <h3 class="text-xl font-semibold mb-4 text-primary-blue">Create Sales Invoice/Proforma</h3>
            <form id="invoice-form" onsubmit="event.preventDefault(); saveInvoice(false);">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Document Type</label>
                        <select id="docType" required class="mt-1 block w-full p-2 border rounded-md" onchange="toggleAuctionFields()">
                            <option value="Invoice">Invoice</option>
                            <option value="Proforma Invoice">Proforma Invoice</option>
                            <option value="Auction Invoice">Auction Invoice</option>
                        </select>
                    </div>
                    <div>
                        <label for="exchangeRate" class="block text-sm font-medium text-gray-700">USD 1 = KES</label>
                        <input type="number" id="exchangeRate" step="1" required value="130" class="mt-1 block w-full p-2 border rounded-md">
                    </div>
                    <div>
                        <label for="dueDate" class="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
                        <input type="date" id="dueDate" class="mt-1 block w-full p-2 border rounded-md">
                    </div>
                    <div>
                        <label for="depositType" class="block text-sm font-medium text-gray-700">Deposit Type</label>
                        <select id="depositType" required class="mt-1 block w-full p-2 border rounded-md" onchange="toggleDepositInput()">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount</option>
                        </select>
                    </div>
                </div>
                
                <!-- Percentage Deposit Input -->
                <div id="percentage-deposit-field" class="mb-4">
                    <label for="depositPercentage" class="block text-sm font-medium text-gray-700">Deposit Percentage (%)</label>
                    <input type="number" id="depositPercentage" step="1" required value="50" min="0" max="100" class="mt-1 block w-full p-2 border rounded-md">
                </div>
                
                <!-- Fixed Deposit Input -->
                <div id="fixed-deposit-field" class="hidden mb-4">
                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label for="fixedDepositCurrency" class="block text-sm font-medium text-gray-700">Currency</label>
                            <select id="fixedDepositCurrency" class="mt-1 block w-full p-2 border rounded-md">
                                <option value="USD">USD</option>
                                <option value="KSH">KES</option>
                                <option value="EURO">EURO</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label for="fixedDepositAmount" class="block text-sm font-medium text-gray-700">Deposit Amount (Whole number only)</label>
                            <input type="number" id="fixedDepositAmount" step="1" placeholder="Enter whole number amount" class="mt-1 block w-full p-2 border rounded-md">
                        </div>
                    </div>
                    <p class="text-xs text-gray-600 mt-2">Note: Enter amount without decimals. System will convert to USD for calculations.</p>
                </div>
                
               <div id="auction-price-field" class="hidden mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
    <div class="grid grid-cols-2 gap-3">
        <div>
            <label for="auctionPriceCurrency" class="block text-sm font-medium text-gray-700 mb-2">Auction Price Currency</label>
            <select id="auctionPriceCurrency" class="w-full p-2 border rounded-md">
                <option value="USD">USD</option>
                <option value="KSH">KES</option>
            </select>
        </div>
        <div>
            <label for="auctionPrice" class="block text-sm font-medium text-gray-700 mb-2">Auction Price</label>
            <input type="number" id="auctionPrice" step="1" placeholder="Enter auction price (whole number)" class="w-full p-2 border rounded-md">
        </div>
    </div>
    <p class="text-xs text-gray-600 mt-2">Note: For auction invoices, this is the bid security deposit amount.</p>
</div>
                
                <fieldset class="border p-4 rounded-lg mb-6">
                    <legend class="text-base font-semibold text-secondary-red px-2">Client Details</legend>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="text" id="clientName" required placeholder="Client Full Name" class="p-2 border rounded-md" oninput="autoFillBuyerConfirmation()">
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
                        <input type="number" id="price" step="1" required placeholder="Unit Price (USD C&F MSA) - Whole number" class="p-2 border rounded-md">
                    </div>
                </fieldset>

                <fieldset class="border p-4 rounded-lg mb-6">
                    <legend class="text-base font-semibold text-secondary-red px-2">Payment/Confirmation</legend>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Select Bank Accounts for Payment (Multiple)</label>
                            <select id="bankDetailsSelect" multiple required class="mt-1 block w-full p-2 border rounded-md"></select>
                            <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple banks</p>
                        </div>
                        <div>
                            <label for="buyerNameConfirmation" class="block text-sm font-medium text-gray-700">Buyer's Full Name (for signature)</label>
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

    // Populate the bank dropdown when the form loads (multi-select)
    populateBankDropdown('bankDetailsSelect', true);
    
    // Call autoFill function after form renders
    setTimeout(() => {
        autoFillBuyerConfirmation();
        toggleAuctionFields(); // Initial check
        toggleDepositInput(); // Initial check for deposit type
    }, 100);
}

/**
 * Toggles between percentage and fixed deposit input
 */
function toggleDepositInput() {
    const depositType = document.getElementById('depositType').value;
    const percentageField = document.getElementById('percentage-deposit-field');
    const fixedField = document.getElementById('fixed-deposit-field');
    
    if (depositType === 'percentage') {
        percentageField.classList.remove('hidden');
        fixedField.classList.add('hidden');
    } else {
        percentageField.classList.add('hidden');
        fixedField.classList.remove('hidden');
    }
}

/**
 * Toggles auction-specific fields based on document type
 */
// In the toggleAuctionFields() function, modify it to hide the pricing section:
function toggleAuctionFields() {
    const docType = document.getElementById('docType').value;
    const auctionField = document.getElementById('auction-price-field');
    const priceField = document.getElementById('price');
    const depositTypeField = document.getElementById('depositType');
    const pricingSection = document.querySelector('fieldset:has(legend:text-secondary-red):has(input#price)');
    
    if (docType === 'Auction Invoice') {
        auctionField.classList.remove('hidden');
        if (priceField) priceField.placeholder = "Not used for auction invoices";
        if (priceField) priceField.disabled = true;
        if (priceField) priceField.value = "";
        if (pricingSection) pricingSection.style.display = 'none';
        document.getElementById('depositPercentage').value = "100"; // Auction invoices are 100% deposit
        if (depositTypeField) {
            depositTypeField.value = "percentage";
            depositTypeField.disabled = true;
            toggleDepositInput();
        }
    } else {
        auctionField.classList.add('hidden');
        if (priceField) priceField.placeholder = "Unit Price (USD C&F MSA) - Whole number";
        if (priceField) priceField.disabled = false;
        if (pricingSection) pricingSection.style.display = '';
        document.getElementById('depositPercentage').value = "50";
        if (depositTypeField) {
            depositTypeField.disabled = false;
        }
    }
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
    const depositType = document.getElementById('depositType').value;
    
    // Get deposit details based on type
    let depositPercentage, fixedDepositCurrency, fixedDepositAmount;
    
    if (depositType === 'percentage') {
        depositPercentage = parseFloat(document.getElementById('depositPercentage').value);
        fixedDepositCurrency = 'USD'; // Default for percentage calculations
        fixedDepositAmount = null;
    } else {
        depositPercentage = null;
        fixedDepositCurrency = document.getElementById('fixedDepositCurrency').value;
        fixedDepositAmount = parseFloat(document.getElementById('fixedDepositAmount').value);
        
        if (!fixedDepositAmount || fixedDepositAmount <= 0) {
            alert("Please enter a valid fixed deposit amount.");
            return;
        }
    }
    
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
    
    // Auction price for auction invoices
  let auctionPrice = 0;
let auctionPriceCurrency = 'USD';
if (docType === 'Auction Invoice') {
    auctionPrice = parseFloat(document.getElementById('auctionPrice').value) || 0;
    auctionPriceCurrency = document.getElementById('auctionPriceCurrency').value || 'USD';
}
    
    // Bank Details - multiple selection
    const bankSelect = document.getElementById('bankDetailsSelect');
    const selectedBanks = [];
    const bankIds = [];
    
    for (let i = 0; i < bankSelect.options.length; i++) {
        if (bankSelect.options[i].selected) {
            try {
                const bankValue = bankSelect.options[i].value;
                const decodedValue = bankValue
                    .replace(/&apos;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&');
                
                const bankData = JSON.parse(decodedValue);
                selectedBanks.push(bankData);
                bankIds.push(bankData.id);
            } catch (e) {
                console.error("Error parsing bank details:", e);
            }
        }
    }
    
    if (selectedBanks.length === 0) {
        alert("Please select at least one bank account.");
        return;
    }
    
    const buyerNameConfirmation = document.getElementById('buyerNameConfirmation').value;

    // 2. Calculate Pricing based on document type - FIXED PERCENTAGE CALCULATION
    let totalPriceUSD, depositUSD, balanceUSD;
    
   if (docType === 'Auction Invoice') {
    // Convert auction price to USD if in KSH
    if (auctionPriceCurrency === 'KSH') {
        totalPriceUSD = Math.round(auctionPrice / exchangeRate);
    } else {
        totalPriceUSD = Math.round(auctionPrice);
    }
    
    depositUSD = totalPriceUSD; // 100% deposit for auction invoices
    balanceUSD = 0;
    depositKSH = Math.round(depositUSD * exchangeRate);
}
        
        // Calculate deposit based on deposit type
        if (depositType === 'percentage') {
            depositUSD = Math.round(totalPriceUSD * (depositPercentage / 100)); // Rounded to whole number
        } else {
            // Convert fixed deposit to USD if needed
            let depositInUSD = fixedDepositAmount;
            if (fixedDepositCurrency === 'KSH') {
                depositInUSD = Math.round(fixedDepositAmount / exchangeRate);
            } else if (fixedDepositCurrency === 'EURO') {
                // Assuming EURO to USD conversion rate (you might want to make this configurable)
                const euroToUsdRate = 1.07; // Example rate
                depositInUSD = Math.round(fixedDepositAmount * euroToUsdRate);
            }
            depositUSD = depositInUSD;
        }
        
        balanceUSD = Math.round(totalPriceUSD - depositUSD);
    }
    
    // Round all amounts to whole numbers with .00
    totalPriceUSD = Math.round(totalPriceUSD);
    depositUSD = Math.round(depositUSD);
    balanceUSD = Math.round(balanceUSD);
    const depositKSH = Math.round(depositUSD * exchangeRate);
    
    // 3. Generate sequential invoice number
    const generatedInvoiceId = await generateSequentialInvoiceNumber(clientName, carModel, carYear);
    
    // 4. Construct Invoice Data Object
    const invoiceData = {
        docType,
        clientName,
        clientPhone,
        issueDate: new Date().toLocaleDateString('en-US'),
        dueDate: dueDate || null, // Make due date optional
        exchangeRate,
        depositType,
        depositPercentage: depositType === 'percentage' ? depositPercentage : null,
        fixedDepositAmount: depositType === 'fixed' ? fixedDepositAmount : null,
        fixedDepositCurrency: depositType === 'fixed' ? fixedDepositCurrency : null,
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
            depositKSH: depositKSH,
            depositPaid: false,
            remainingBalance: totalPriceUSD,
            depositPercentage: depositPercentage
        },
        bankDetails: selectedBanks, // Save array of bank objects
        bankIds: bankIds, // Save array of bank IDs
        buyerNameConfirmation,
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        invoiceId: generatedInvoiceId,
        revoked: false, // Add revoked flag
        isAuctionInvoice: docType === 'Auction Invoice',
        auctionPrice: docType === 'Auction Invoice' ? auctionPrice : null,
        auctionPriceCurrency: docType === 'Auction Invoice' ? auctionPriceCurrency : null
    };

    // 5. Save to Firestore
    try {
        const docRef = await db.collection("invoices").add(invoiceData);
        alert(`${docType} ${generatedInvoiceId} saved successfully!`);

        // 6. Download PDF if requested
        if (!onlySave) {
            invoiceData.firestoreId = docRef.id;
            generateInvoicePDF(invoiceData);
        }
    } catch (error) {
        console.error("Error saving invoice:", error);
        alert("Failed to save invoice: " + error.message);
    }
}
// =================================================================
//                 8. INVOICE HISTORY MODULE (UPDATED WITH REVOKE)
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

            const isRevoked = data.revoked || false;
            
            html += `<li class="p-3 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center ${isRevoked ? 'bg-red-50 border-l-4 border-red-500' : ''}">
                        <div>
                            ${isRevoked ? `<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">REVOKED</span><br>` : ''}
                            <strong class="text-primary-blue">${data.docType} ${data.invoiceId}</strong><br>
                            <span class="text-sm text-gray-700">Client: ${data.clientName} | Vehicle: ${data.carDetails.make} ${data.carDetails.model}</span><br>
                            <span class="text-xs text-gray-600">Total: USD ${data.pricing.totalUSD.toFixed(2)}</span>
                            ${data.pricing.depositPaid ? `<br><span class="text-xs text-green-600">✓ Deposit Paid</span>` : `<br><span class="text-xs text-secondary-red">Deposit Pending</span>`}
                        </div>
                        <div class="mt-2 sm:mt-0 space-x-2">
                            <button onclick='reDownloadInvoice(${invoiceDataJson})' 
                                    class="bg-primary-blue hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                Re-Download PDF
                            </button>
                            ${!isRevoked ? `
                                ${!data.pricing.depositPaid ? `
                                <button onclick='markInvoiceDepositPaid(${invoiceDataJson})' 
                                        class="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                    Deposit Paid
                                </button>
                                ` : ''}
                                <button onclick='createReceiptFromInvoice(${invoiceDataJson})' 
                                        class="bg-secondary-red hover:bg-red-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                    Create Receipt
                                </button>
                                <button onclick='createAgreementFromInvoice(${invoiceDataJson})' 
                                        class="bg-green-600 hover:bg-green-800 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                    Create Agreement
                                </button>
                                <button onclick='createAdditionalInvoice(${invoiceDataJson})' 
                                        class="bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                    Add Invoice
                                </button>
                                <button onclick='revokeInvoice(${invoiceDataJson})' 
                                        class="bg-red-600 hover:bg-red-800 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                    REVOKE
                                </button>
                            ` : `
                                <button onclick='unrevokeInvoice(${invoiceDataJson})' 
                                        class="bg-gray-600 hover:bg-gray-800 text-white text-xs py-1 px-3 rounded-full transition duration-150">
                                    UNREVOKE
                                </button>
                            `}
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

// Add revoke function:
async function revokeInvoice(invoiceData) {
    if (!confirm(`Are you sure you want to REVOKE invoice ${invoiceData.invoiceId}?\n\nThis will mark it as invalid and disable creation of receipts/agreements.`)) {
        return;
    }
    
    try {
        await db.collection("invoices").doc(invoiceData.firestoreId).update({
            revoked: true,
            revokedAt: firebase.firestore.FieldValue.serverTimestamp(),
            revokedBy: currentUser.email
        });
        
        alert(`Invoice ${invoiceData.invoiceId} has been revoked.`);
        fetchInvoices(); // Refresh the list
    } catch (error) {
        console.error("Error revoking invoice:", error);
        alert("Failed to revoke invoice: " + error.message);
    }
}

// Add unrevoke function:
async function unrevokeInvoice(invoiceData) {
    if (!confirm(`Are you sure you want to UNREVOKE invoice ${invoiceData.invoiceId}?`)) {
        return;
    }
    
    try {
        await db.collection("invoices").doc(invoiceData.firestoreId).update({
            revoked: false,
            unrevokedAt: firebase.firestore.FieldValue.serverTimestamp(),
            unrevokedBy: currentUser.email
        });
        
        alert(`Invoice ${invoiceData.invoiceId} has been unrevoked.`);
        fetchInvoices(); // Refresh the list
    } catch (error) {
        console.error("Error unrevoking invoice:", error);
        alert("Failed to unrevoke invoice: " + error.message);
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
//                 10. CAR SALES AGREEMENT MODULE (UPDATED - REMOVED ADD PAYMENT)
// =================================================================

let agreementPaymentCounter = 1;

/**
 * Renders the Car Sales Agreement form.
 */
function renderAgreementForm(receiptReference = '') {
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
                            <select id="currencySelect" required class="block w-full p-2 border rounded-md">
                                <option value="KES">KES - Kenya Shillings</option>
                                <option value="USD">USD - US Dollars</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="agreementBankDetailsSelect" class="block text-sm font-medium text-gray-700">Select Bank Account for Payment</label>
                            <select id="agreementBankDetailsSelect" required class="mt-1 block w-full p-2 border rounded-md"></select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="totalPrice" class="block text-sm font-medium text-gray-700">Total Price</label>
                            <input type="number" id="totalPrice" step="0.01" required placeholder="Total Price" class="w-full p-2 border rounded-md">
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
    
    // Populate the dropdown
    populateBankDropdown('agreementBankDetailsSelect'); 
    calculatePaymentTotal();
    fetchAgreements();
    
    // Add event listener for total price input
    const totalPriceInput = document.getElementById('totalPrice');
    if (totalPriceInput) {
        totalPriceInput.addEventListener('input', calculatePaymentTotal);
    }
}

/**
 * Calculates and updates the total amount of the payment schedule.
 */
function calculatePaymentTotal() {
    const currency = document.getElementById('currencySelect').value;
    const totalPriceInput = document.getElementById('totalPrice');
    const totalSpan = document.getElementById('total-amount');
    
    let total = 0;
    if (totalPriceInput) {
        total = parseFloat(totalPriceInput.value) || 0;
    }

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

    // 3. Collect Payment Details (removed payment schedule)
    const totalPrice = parseFloat(document.getElementById('totalPrice').value);

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
            price: totalPrice,
            currency: currency,
            bankId: bankId, // <<< Correctly save only the ID
        },
        signatures: {
            sellerWitness: document.getElementById('sellerWitness').value,
            buyerWitness: document.getElementById('buyerWitness').value,
            // Signatures and Dates will be added manually on the printed copy
        },
        // ADD THESE LINES FOR INVOICE REFERENCE
        invoiceReference: document.getElementById('agreement-form')?.dataset.invoiceReference || '',
        invoiceId: document.getElementById('agreement-form')?.dataset.invoiceId || '',
        // ADD THESE LINES FOR RECEIPT REFERENCE
        receiptReference: document.getElementById('agreement-form')?.dataset.receiptReference || '',
        receiptId: document.getElementById('agreement-form')?.dataset.receiptId || '',
        // END OF ADDED LINES
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
                            ${data.invoiceReference ? `<br><span class="text-xs text-green-600">Invoice Ref: ${data.invoiceReference}</span>` : ''}
                            ${data.receiptReference ? `<br><span class="text-xs text-blue-600">Receipt Ref: ${data.receiptReference}</span>` : ''}
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

// =================================================================
//                 7. BANK MANAGEMENT MODULE (UPDATED WITH PAYBILL)
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
                    <input type="text" id="paybillNumber" placeholder="Paybill Number (Optional)" class="mt-2 block w-full p-2 border rounded-md">
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
    const bankBranch = document.getElementById('bankBranch').value;
    const accountName = document.getElementById('accountName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const paybillNumber = document.getElementById('paybillNumber').value;
    const swiftCode = document.getElementById('swiftCode').value;
    const currency = document.getElementById('currency').value;

    const newBank = {
        name: bankName,
        branch: bankBranch,
        accountName,
        accountNumber,
        paybillNumber,
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
                    ${data.paybillNumber ? `<p class="text-sm text-gray-600">Paybill: ${data.paybillNumber}</p>` : ''}
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
//                 PDF GENERATION FUNCTIONS (MOVED TO TOP)
// =================================================================

/**
 * Generates and downloads a custom PDF for the comprehensive receipt. (WITH PAYMENT HISTORY)
 */
function generateReceiptPDF(data) {

  // Add this helper function near the top of generateReceiptPDF function, after the drawText function:
// Helper to format amounts without decimals (with .00)
const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '0.00';
    const rounded = Math.round(amount);
    return rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 

    const primaryColor = '#183263'; // WanBite Blue
    const secondaryColor = '#D96359'; // Red
    
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    let y = 10; 
    const margin = 10;
    const boxW = pageW - (2 * margin);
    const lineHeight = 7; 

    // --- HELPER FUNCTION WITH BETTER LINE HEIGHT CALCULATION ---
    const drawText = (text, x, y, size, style = 'normal', color = primaryColor, align = 'left') => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(color);
        doc.text(text, x, y, { align: align });
        return size / 3; // Return approximate line height in mm
    };

    const getTextHeight = (text, fontSize, maxWidth) => {
        const lineHeightFactor = 1.15;
        const lines = doc.splitTextToSize(text, maxWidth);
        return lines.length * fontSize * lineHeightFactor / doc.internal.scaleFactor;
    };

    // =================================================================
    // HEADER SECTION
    // =================================================================
    
    // Top Bar
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
    y += 12;

    // Receipt Metadata Box
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, boxW, 15);
    
    drawText('RECEIPT NO:', margin + 3, y + 5, 10, 'bold', secondaryColor);
    drawText(data.receiptId, margin + 3, y + 11, 14, 'bold', primaryColor);
    
    drawText('DATE:', pageW - margin - 3, y + 5, 10, 'bold', secondaryColor, 'right');
    drawText(data.receiptDate, pageW - margin - 3, y + 11, 14, 'bold', primaryColor, 'right');
    y += 20;

    // =================================================================
    // MAIN BODY WITH BETTER SPACING
    // =================================================================

    // Received From
    const receivedFromHeight = drawText('RECEIVED FROM:', margin, y, 10, 'bold');
    doc.setDrawColor(0);
    doc.line(margin + 35, y, pageW - margin, y);
    drawText(data.receivedFrom, margin + 35, y - 0.5, 12, 'bold', 0);
    y += lineHeight;

    // The Sum of Money (Words) - FIXED OVERLAPPING
    drawText('THE SUM OF:', margin, y + 3, 10, 'bold');
    doc.setFillColor(240, 240, 240); 
    const wordsBoxHeight = lineHeight * 2.5;
    doc.rect(margin + 35, y, boxW - 35, wordsBoxHeight, 'F');
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(margin + 35, y, boxW - 35, wordsBoxHeight);
    
    doc.setTextColor(0);
    doc.setFontSize(11);
    const wrappedWords = doc.splitTextToSize(data.amountWords || '', boxW - 37);
    
    // Calculate vertical position for centered text
    const textHeight = wrappedWords.length * 4; // Approximate height in mm
    const verticalOffset = y + (wordsBoxHeight - textHeight) / 2 + 3;
    
    doc.text(wrappedWords, margin + 36, Math.max(verticalOffset, y + 4));
    y += wordsBoxHeight + 5;

    // Being Paid For
    drawText('BEING PAID FOR:', margin, y, 10, 'bold', primaryColor);
    doc.line(margin + 35, y, pageW - margin, y);
    drawText(data.beingPaidFor, margin + 35, y - 0.5, 12, 'bold', 0);
    y += lineHeight + 4;

    // =================================================================
    // PAYMENT REFERENCES SECTION
    // =================================================================
    drawText('PAYMENT DETAILS:', margin, y, 10, 'bold');
    y += 4;

    doc.setFontSize(10);
    doc.setTextColor(0);

    // Parse bank details
    let bankName = data.paymentDetails?.bankUsed || 'N/A';
    let branchName = '';
    
    if (bankName.includes(' - ')) {
        const parts = bankName.split(' - ');
        bankName = parts[0];
        if (parts[1]) {
            branchName = parts[1].replace(/\s*\([^)]*\)$/, '');
        }
    }

    // Row 1: Cheque and RTGS/TT
    doc.rect(margin, y, boxW * 0.45, lineHeight);
    doc.text(`Cheque No: ${data.paymentDetails?.chequeNo || 'N/A'}`, margin + 2, y + 4.5);
    doc.rect(margin + boxW * 0.55, y, boxW * 0.45, lineHeight);
    doc.text(`RTGS/TT No: ${data.paymentDetails?.rtgsTtNo || 'N/A'}`, margin + boxW * 0.55 + 2, y + 4.5);
    y += lineHeight + 2;

    // Row 2: Bank Name Only
    doc.rect(margin, y, boxW * 0.45, lineHeight);
    doc.text(`Bank Name: ${bankName}`, margin + 2, y + 4.5);
    
    // Row 2: Receipt Type
    doc.rect(margin + boxW * 0.55, y, boxW * 0.45, lineHeight);
    doc.text(`Receipt Type: ${data.receiptType}`, margin + boxW * 0.55 + 2, y + 4.5);
    y += lineHeight + 2;

    // Row 3: Bank Branch (if exists)
    if (branchName) {
        doc.rect(margin, y, boxW * 0.45, lineHeight);
        doc.text(`Bank Branch: ${branchName}`, margin + 2, y + 4.5);
        y += lineHeight + 2;
    }

    // =================================================================
    // AMOUNT FIGURE SECTION WITH DYNAMIC POSITIONING - FIXED CALCULATIONS
    // =================================================================
    const amountBoxH = 15;
    const amountBoxY = y + 5;
    
    // Check if we need to add a page
    if (amountBoxY + amountBoxH > pageH - 30) {
        doc.addPage();
        y = 10;
    }
    
    // Total Amount Box
    doc.setFillColor(secondaryColor);
    doc.rect(pageW - margin - 70, amountBoxY, 70, amountBoxH, 'F');
    
    doc.setTextColor(255);
    drawText('AMOUNT FIGURE', pageW - margin - 65, amountBoxY + 4, 8, 'bold', 255);
    drawText(`${data.currency} ${formatAmount(data.amountReceived)}`, 
         pageW - margin - 5, amountBoxY + 11, 18, 'bold', 255, 'right');
    
    // Balance Details - FIXED: Use stored USD/KSH amounts
    doc.setTextColor(primaryColor);
    drawText('BALANCE DETAILS', margin, amountBoxY + 4, 10, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0);

  // Calculate proper balances
const totalPaidUSD = data.totalPaidUSD || (data.amountReceivedUSD || (data.currency === 'USD' ? data.amountReceived : data.amountReceived / (data.exchangeRate || 130)));
const totalPaidKSH = data.totalPaidKSH || (data.amountReceivedKSH || (data.currency === 'KSH' ? data.amountReceived : data.amountReceived * (data.exchangeRate || 130)));

const remainingUSD = data.balanceDetails?.balanceRemainingUSD || data.balanceDetails?.balanceRemaining || 0;
const remainingKSH = data.balanceDetails?.balanceRemainingKSH || remainingUSD * (data.exchangeRate || 130);

// Show balance in both USD and KSH - UPDATED
drawText(`Balance Remaining (USD): ${formatAmount(remainingUSD)}`, margin, amountBoxY + 10, 10);
drawText(`Balance Remaining (KES): ${formatAmount(remainingKSH)}`, margin, amountBoxY + 14, 10);
drawText(`Due On/Before: ${data.balanceDetails?.balanceDueDate || 'N/A'}`, margin, amountBoxY + 18, 10);

// Add paid amounts
drawText(`Paid (USD): ${formatAmount(totalPaidUSD)}`, margin, amountBoxY + 22, 10);
drawText(`Paid (KES): ${formatAmount(totalPaidKSH)}`, margin, amountBoxY + 26, 10);
    
    y = amountBoxY + amountBoxH + 10;

    // =================================================================
    // PAYMENT HISTORY SECTION (IF EXISTS)
    // =================================================================
    const paymentHistory = data.paymentHistory || [];
    const paymentCount = data.paymentCount || paymentHistory.length || 0;
    
    if (paymentCount > 0 && paymentHistory.length > 0) {
        // Check page space
        const historyHeight = 20 + (paymentHistory.length * 5);
        if (y + historyHeight > pageH - 20) {
            doc.addPage();
            y = 10;
        }
        
        y += 5;
        drawText('PAYMENT HISTORY', margin, y, 12, 'bold', primaryColor);
        y += 8;
        
        // Summary Box
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y, boxW, 10, 'F');
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(0.3);
        doc.rect(margin, y, boxW, 10);
        
        doc.setFontSize(9);
        doc.setTextColor(primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Payments: ${paymentCount}`, margin + 5, y + 6);
        doc.text(`Total Paid (USD): ${totalPaidUSD.toFixed(2)}`, margin + 60, y + 6);
        doc.text(`Total Paid (KES): ${totalPaidKSH.toFixed(2)}`, margin + 120, y + 6);
        y += 12;
        
        // Table Header
        doc.setFillColor(primaryColor);
        doc.rect(margin, y, boxW, 6, 'F');
        doc.setTextColor(255);
        drawText('#', margin + 2, y + 4, 8, 'bold', 255);
        drawText('Date', margin + 10, y + 4, 8, 'bold', 255);
        drawText('Amount', margin + 40, y + 4, 8, 'bold', 255);
        drawText('USD', margin + 75, y + 4, 8, 'bold', 255);
        drawText('KES', margin + 105, y + 4, 8, 'bold', 255);
        drawText('Method', margin + 135, y + 4, 8, 'bold', 255);
        drawText('Description', margin + 170, y + 4, 8, 'bold', 255);
        y += 6;
        
        // Payment Rows
        doc.setFontSize(8);
        doc.setTextColor(0);
        
       paymentHistory.forEach((payment, index) => {
    // Check page boundary
    if (y > pageH - 20) {
        doc.addPage();
        y = 10;
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y, boxW, 5, 'F');
    }
    
    doc.rect(margin, y, boxW, 5);
    drawText(`${index + 1}`, margin + 2, y + 3.5, 8);
    drawText(payment.paymentDate || 'N/A', margin + 10, y + 3.5, 8);
    drawText(`${payment.currency} ${formatAmount(payment.amount)}`, margin + 40, y + 3.5, 8);
    drawText(`USD ${formatAmount(payment.amountUSD || (payment.currency === 'USD' ? payment.amount : (payment.amount / (payment.exchangeRate || 130))))}`, margin + 75, y + 3.5, 8);
    drawText(`KES ${formatAmount(payment.amountKSH || (payment.currency === 'KSH' ? payment.amount : (payment.amount * (payment.exchangeRate || 130))))}`, margin + 105, y + 3.5, 8);
    
    const method = payment.paymentMethod || 'N/A';
    const shortMethod = method.length > 15 ? method.substring(0, 12) + '...' : method;
    drawText(shortMethod, margin + 135, y + 3.5, 8);
    
    const description = payment.description || 'Payment';
    const shortDesc = description.length > 20 ? description.substring(0, 17) + '...' : description;
    drawText(shortDesc, margin + 170, y + 3.5, 8);
    
    y += 5;
});
        
        y += 3;
    } else if (paymentCount === 1) {
        // Single payment note
        y += 5;
        doc.setFontSize(9);
        doc.setTextColor(secondaryColor);
        doc.setFont("helvetica", "italic");
        doc.text(`Note: This is the initial payment for this receipt.`, margin, y);
        doc.setTextColor(0);
        y += 5;
    }

    // =================================================================
    // FOOTER/SIGNATURES WITH SIGNATURE STAMP
    // =================================================================
    
    // Check if we need a new page for signatures
    if (y > pageH - 40) {
        doc.addPage();
        y = 10;
    }
    
    doc.setTextColor(primaryColor);
    drawText('... With thanks', margin, y + 10, 12, 'italic', secondaryColor);
    
    // Signature line
    const sigX = pageW - margin - 50;
    doc.line(sigX, y + 15, pageW - margin, y + 15);
    
    // Add stamp with date OVERLAY - UPDATED WITH RED TEXT AND SIZE 14
    const stampDate = data.receiptDate || new Date().toLocaleDateString('en-US');
    try {
        // Calculate position for 500x500 image to fit properly
        const stampWidth = 30; // Reduced width for better scaling
        const stampHeight = 30; // Maintain aspect ratio for 500x500
        
        // Add stamp image first
        doc.addImage('STAMP.png', 'JPEG', sigX, y + 18, stampWidth, stampHeight);
        
        // Add date text OVER the stamp image (centered) - RED with size 14
        doc.setFontSize(14); // LARGER FONT SIZE AS REQUESTED
        doc.setTextColor(255, 0, 0); // RED COLOR AS REQUESTED
        doc.setFont("helvetica", "bold");
        
        // Calculate text position to be centered over the stamp
        const textX = sigX + (stampWidth/2);
        const textY = y + 18 + (stampHeight/2) + 2; // Center vertically
        
        doc.text(stampDate, textX, textY, null, null, "center");
        
        // Add company text below stamp
        doc.setFontSize(10);
        doc.setTextColor(primaryColor);
        doc.text('For WanBite Investment Co. LTD', textX, y + 18 + stampHeight + 8, null, null, "center");
    } catch (error) {
        console.error("Error adding stamp:", error);
        // Fallback to text only
        doc.setFontSize(14); // Larger fallback
        doc.setTextColor(255, 0, 0); // Red fallback
        doc.text(stampDate, sigX + 25, y + 19, null, null, "center");
        doc.setFontSize(10);
        doc.setTextColor(primaryColor);
        doc.text('For WanBite Investment Co. LTD', sigX + 25, y + 23, null, null, "center");
    }
    
    y += 30;

    // =================================================================
    // GLOBAL FOOTER
    // =================================================================
    doc.setFillColor(primaryColor);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(9);
    const footerText = `Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`;
    doc.text(footerText, pageW / 2, pageH - 4, null, null, "center");

    doc.save(`Receipt_${data.receiptId}.pdf`);
}

/**
 * Generates and downloads a custom PDF for the Invoice/Proforma with TWO BANKS.
 */
function generateInvoicePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 

    const primaryColor = '#183263'; // WanBite Blue
    const secondaryColor = '#D96359'; // Red
    
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    let y = 10; 
    const margin = 10;
    const lineHeight = 5; 
    const termIndent = 5;

    // Add REVOKED watermark if invoice is revoked
    if (data.revoked) {
        doc.setFontSize(60);
        doc.setTextColor(255, 0, 0, 30); // Red with transparency
        doc.setFont("helvetica", "bold");
        doc.text('REVOKED', pageW / 2, pageH / 2, null, null, "center");
        doc.setTextColor(255, 0, 0, 30);
        doc.text('INVALID', pageW / 2, pageH / 2 + 20, null, null, "center");
        doc.setTextColor(0); // Reset text color
    }

    // --- HELPER FUNCTIONS ---
    const drawText = (text, x, y, size, style = 'normal', color = primaryColor, align = 'left') => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(color);
        doc.text(text, x, y, { align: align });
    };
    
    // Helper to format amounts without decimals (with .00)
    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) return '0.00';
        const rounded = Math.round(amount);
        return rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Function to add stamp image with date OVERLAY - UPDATED WITH RED TEXT AND SIZE 14
    const addStampWithDate = (x, y, dateText) => {
        try {
            // Calculate position for 500x500 image to fit properly
            const stampWidth = 30; // Reduced width for better scaling
            const stampHeight = 30; // Maintain aspect ratio for 500x500
            
            // Add stamp image first
            doc.addImage('STAMP.png', 'JPEG', x - (stampWidth/2), y, stampWidth, stampHeight);
            
            // Add date text OVER the stamp image (centered) - RED with size 14
            doc.setFontSize(14); // LARGER FONT SIZE AS REQUESTED
            doc.setTextColor(255, 0, 0); // RED COLOR AS REQUESTED
            doc.setFont("helvetica", "bold");
            
            // Calculate text position to be centered over the stamp
            const textX = x;
            const textY = y + (stampHeight/2) + 2; // Center vertically
            
            doc.text(dateText, textX, textY, null, null, "center");
            
            // Add company text below stamp
            doc.setFontSize(10);
            doc.setTextColor(primaryColor);
            doc.text('For WanBite Investment Co. LTD', x, y + stampHeight + 8, null, null, "center");
            
        } catch (error) {
            console.error("Error adding stamp:", error);
            // Fallback to text only if image fails
            doc.setFontSize(14); // Larger fallback
            doc.setTextColor(255, 0, 0); // Red fallback
            doc.text(dateText, x, y - 2, null, null, "center");
            doc.setFontSize(10);
            doc.setTextColor(primaryColor);
            doc.text('For WanBite Investment Co. LTD', x, y + 5, null, null, "center");
        }
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
    
    // Invoice/Date/Due Box - FIXED OVERLAPPING
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, 188, 18); // Increased height
    
    drawText('INVOICE NO:', margin + 3, y + 6, 10, 'bold', secondaryColor);
    drawText(data.invoiceId, margin + 3, y + 13, 12, 'bold', primaryColor); // Smaller font
    
    drawText('ISSUE DATE:', pageW - margin - 80, y + 6, 10, 'bold', secondaryColor);
    drawText(data.issueDate, pageW - margin - 80, y + 13, 10, 'bold', primaryColor);
    
    drawText('DUE DATE:', pageW - margin - 15, y + 6, 10, 'bold', secondaryColor, 'right');
    drawText(data.dueDate || 'N/A', pageW - margin - 15, y + 13, 10, 'bold', primaryColor, 'right');
    y += 23;

    // =================================================================
    // BILLING & SELLER INFO - UPDATED WITH TEXT WRAPPING
    // =================================================================
    
    // Bill To Box (Left) - IMPROVED TEXT WRAPPING
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, 90, 15);
    drawText('BILL TO:', margin + 3, y + 5, 10, 'bold', secondaryColor);

    // Split client name into multiple lines if too long
    const maxNameWidth = 80; // Maximum width in mm for the name
    const clientNameLines = doc.splitTextToSize(data.clientName, maxNameWidth);
    let nameY = y + 11;
    clientNameLines.forEach(line => {
        drawText(line, margin + 3, nameY, 10, 'bold', 0);
        nameY += 4; // Line height
    });

    // Seller Info Box (Right) - IMPROVED TEXT WRAPPING
    doc.rect(pageW / 2 + 5, y, 90, 15);
    drawText('FROM:', pageW / 2 + 8, y + 5, 10, 'bold', secondaryColor);

    // Split seller name into multiple lines
    const sellerName = 'WANBITE INVESTMENTS COMPANY LIMITED';
    const sellerLines = doc.splitTextToSize(sellerName, 80);
    let sellerY = y + 11;
    sellerLines.forEach(line => {
        drawText(line, pageW / 2 + 8, sellerY, 8, 'bold', 0);
        sellerY += 4;
    });

    // Adjust y position based on number of lines
    y += Math.max(clientNameLines.length * 4, sellerLines.length * 4) + 10;

    // =================================================================
    // ITEM TABLE (Vehicle Details) - UPDATED WITH VIN BELOW MAKE & MODEL
    // =================================================================
    
    // Table Header with better column distribution
    doc.setFillColor(primaryColor);
    doc.rect(margin, y, 188, 8, 'F');
    doc.setTextColor(255);
    drawText('MAKE & MODEL / VIN', 12, y + 5.5, 9, 'bold', 255);
    drawText('YEAR', 70, y + 5.5, 9, 'bold', 255); // Adjusted to left
    drawText('SPECS', 90, y + 5.5, 9, 'bold', 255); // Shorter label
    drawText('MILEAGE/COLOR', 130, y + 5.5, 9, 'bold', 255); // Adjusted position
    drawText('PRICE (USD)', 185, y + 5.5, 9, 'bold', 255, 'right');
    y += 8;

    // Table Row with adjusted positions
    doc.setFillColor(255);
    doc.rect(margin, y, 188, 16, 'F');
    doc.setTextColor(0);

    // Make & Model and VIN
    drawText(`${data.carDetails.make} ${data.carDetails.model}`, 12, y + 5.5, 10);
    drawText(`VIN: ${data.carDetails.vin}`, 12, y + 12, 8, 'normal', '#666');

    // Year - centered
    drawText(`${data.carDetails.year}`, 70, y + 9, 10, 'normal', 0, 'center');

    // Specs - slightly smaller font
    const specsText = `${data.carDetails.cc} CC / ${data.carDetails.fuel} / ${data.carDetails.transmission}`;
    const specsLines = doc.splitTextToSize(specsText, 25); // Allow wrapping
    if (specsLines.length > 1) {
        specsLines.forEach((line, index) => {
            drawText(line, 90, y + 7 + (index * 4), 7, 'normal', 0, 'center');
        });
    } else {
        drawText(specsText, 90, y + 9, 8, 'normal', 0, 'center');
    }

    // Mileage/Color - allow wrapping
const mileageColorText = `${data.carDetails.mileage}km / ${data.carDetails.color}`;
const mileageLines = doc.splitTextToSize(mileageColorText, 30);
if (mileageLines.length > 1) {
    mileageLines.forEach((line, index) => {
        drawText(line, 130, y + 7 + (index * 4), 7, 'normal', 0, 'center');
    });
} else {
    drawText(mileageColorText, 130, y + 9, 8, 'normal', 0, 'center');
}

// Price - right aligned with .00 format
if (data.docType === 'Auction Invoice' && data.auctionPrice) {
    // Show auction price with currency
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.auctionPriceCurrency || 'USD'} ${data.auctionPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 185, y + 9, 10, 'normal', secondaryColor, "right");
} else {
    drawText(`${formatAmount(data.carDetails.priceUSD)}`, 185, y + 9, 10, 'normal', 0, "right");
}

y += 16;

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
    // TOTALS & PAYMENTS (Bottom Right) - FIXED PERCENTAGE CALCULATIONS
    // =================================================================
    const totalBoxW = 60;
    const totalsX = pageW - margin - totalBoxW;

    // Line 1: Subtotal
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('SUBTOTAL (USD)', totalsX + 2, y + 3.5, 9, 'normal', 0);
    drawText(formatAmount(data.pricing.totalUSD), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', 0, 'right');
    y += lineHeight;

    // Line 2: Deposit
    doc.rect(totalsX, y, totalBoxW, lineHeight);
    let depositLabel = 'DEPOSIT (USD)';
    if (data.depositType === 'percentage' && data.depositPercentage) {
        depositLabel = `DEPOSIT (${data.depositPercentage}% USD)`;
    } else if (data.depositType === 'fixed' && data.fixedDepositCurrency) {
        depositLabel = `DEPOSIT (${data.fixedDepositCurrency})`;
    }
    drawText(depositLabel, totalsX + 2, y + 3.5, 9, 'normal', 0);
    drawText(formatAmount(data.pricing.depositUSD), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', secondaryColor, 'right');
    y += lineHeight;

    // Line 3: Balance
    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('BALANCE DUE (USD)', totalsX + 2, y + 3.5, 9, 'normal', 0);
    drawText(formatAmount(data.pricing.balanceUSD), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', primaryColor, 'right');
    y += lineHeight;

    // Line 4: Deposit KES Equivalent
    doc.setFillColor(230, 240, 255);
    doc.rect(totalsX, y, totalBoxW, lineHeight, 'F');
    doc.rect(totalsX, y, totalBoxW, lineHeight);
    drawText('DEPOSIT (KES EQUIV)', totalsX + 2, y + 3.5, 9, 'bold', primaryColor);
    drawText(formatAmount(data.pricing.depositKSH), totalsX + totalBoxW - 2, y + 3.5, 9, 'bold', primaryColor, 'right');
    y += lineHeight;
    y += 5; // Extra space

    // =================================================================
    // TERMS & CONDITIONS (Left) - NOW UNDERLINED WITH NEW CLAUSES
    // =================================================================
    drawText('TERMS & CONDITIONS', margin, y, 12, 'bold', primaryColor);
    // Add underline
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    const textWidth = doc.getStringUnitWidth('TERMS & CONDITIONS') * 12 / doc.internal.scaleFactor;
    doc.line(margin, y + 1, margin + textWidth, y + 1);
    y += lineHeight + 2;
    
    // Check if it's an auction invoice
   if (data.docType === 'Auction Invoice') {
    // AUCTION INVOICE TERMS
    const auctionPrice = data.auctionPrice || data.pricing.totalUSD;
    const auctionCurrency = data.auctionPriceCurrency || 'USD';
    
    // Term 1: Currency Clause
    const term1 = `All payments under this contract shall be made in USD. If payments are made in any other currency, the amount will be converted at the prevailing exchange rate of the seller's bank on the date of payment.`;
    y = drawTerm(doc, y, '1.', term1);

    // Term 2: Auction Bid Security - UPDATED WITH CURRENCY
    const term2 = `WanBite Investments Ltd will arrange the auction bid once the Buyer deposits ${auctionCurrency} ${auctionPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} as bid security. This deposit is refundable.`;
    y = drawTerm(doc, y, '2.', term2);

        // Term 3: Balance Payment - NEW CLAUSE
        const term3 = `The remaining balance must be paid within Ten (10) days of the Bill of Landing issuance date.`;
        y = drawTerm(doc, y, '3.', term3);

        // Term 4: BOL Release
        const term4 = `The original Bill of Landing will be sent to the Buyer within 20 business days after full payment is received.`;
        y = drawTerm(doc, y, '4.', term4);

        // Term 5: As Is Condition
        const term5 = `All vehicles are sold on an "AS IS" basis, with no warranties, expressed or implied. Shipment booking will be arranged once the AGREED PAYMENT amount is paid by the Buyer.`;
        y = drawTerm(doc, y, '5.', term5);

        // Term 6: Third Party Payment
        const term6 = `If a third party makes the payment, the Buyer must inform the Seller in writing of the relationship before the payment is made, for security reasons.`;
        y = drawTerm(doc, y, '6.', term6);

        // Term 7: Import Responsibility
        const term7 = `The Seller is not responsible for any losses arising from the Buyer's failure to comply with import regulations and/or restrictions in the Buyer's country.`;
        y = drawTerm(doc, y, '7.', term7);
        
    } else {
        // REGULAR INVOICE TERMS
        // Term 1: Total Price
        const totalPriceText = `The total price of the vehicle is USD ${formatAmount(data.pricing.totalUSD)}`;
        y = drawTerm(doc, y, '1.', totalPriceText, 188 - termIndent);

        // Term 2: Payment Schedule - FIXED PERCENTAGE CALCULATION
        let depositText;
        if (data.depositType === 'percentage' && data.depositPercentage) {
            depositText = `A deposit of USD ${formatAmount(data.pricing.depositUSD)} (KES ${formatAmount(data.pricing.depositKSH)} equivalent) is required to secure the vehicle and begin shipping/clearing. The balance of USD ${formatAmount(data.pricing.balanceUSD)} is due ${data.dueDate ? `on or before ${data.dueDate}` : 'upon production of the Bill of Landing'}. The seller shall promptly notify the buyer of the date for due compliance.`;
        } else {
            depositText = `A deposit of ${data.fixedDepositCurrency} ${formatAmount(data.fixedDepositAmount)} (USD ${formatAmount(data.pricing.depositUSD)} / KES ${formatAmount(data.pricing.depositKSH)} equivalent) is required to secure the vehicle and begin shipping/clearing. The balance of USD ${formatAmount(data.pricing.balanceUSD)} is due ${data.dueDate ? `on or before ${data.dueDate}` : 'upon production of the Bill of Landing'}. The seller shall promptly notify the buyer of the date for due compliance.`;
        }
        y = drawTerm(doc, y, '2.', depositText);

        // Term 3: BOL Release
        y = drawTerm(doc, y, '3.', 'The original Bill of Landing will be issued to the buyer upon confirmation of full receipt of the purchase price.');

        // Term 4: Cancellation/Forfeiture
        y = drawTerm(doc, y, '4.', 'If you cancel to buy before or after shipment after purchase is confirmed, your deposit is to be forfeited.');

        // Term 5: As Is Condition
        y = drawTerm(doc, y, '5.', 'All the vehicles are subject to AS IS CONDITION.');

        // Term 6: Third Party Payment
        y = drawTerm(doc, y, '6.', 'Payment will be made by the invoiced person. If a third party makes a payment, please kindly inform us the relationship due to security reasons.');
    }
    
    y += 5;

    // Add revocation note if revoked
    if (data.revoked) {
        y += 10;
        doc.setFontSize(12);
        doc.setTextColor(255, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text('*** THIS INVOICE HAS BEEN REVOKED AND IS NO LONGER VALID ***', pageW / 2, y, null, null, "center");
        doc.setTextColor(0);
        y += 10;
    }

    // =================================================================
    // PAYMENT INSTRUCTIONS WITH TWO BANKS
    // =================================================================
    doc.setFillColor(255, 245, 230);
    doc.rect(margin, y, 188, data.bankDetails?.length > 1 ? 55 : 40, 'F'); // Increased height for multiple banks
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, 188, data.bankDetails?.length > 1 ? 55 : 40);
    let currentY_bank = y + 5;
    
    // Title
    drawText('KINDLY PAY USD / KSH TO THE FOLLOWING BANK ACCOUNT(S):', 15, currentY_bank, 11, 'bold', primaryColor);
    currentY_bank += 5; // Move down after the title
    
    // Exchange Rate Note - far right
    doc.setFontSize(8);
    doc.setTextColor(primaryColor);
    doc.text(`Exchange rate used USD 1 = KES ${formatAmount(data.exchangeRate)}`, 190 - margin, currentY_bank - 2, null, null, "right");
    
    // Bank Details - handle multiple banks
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    if (data.bankDetails && Array.isArray(data.bankDetails)) {
        data.bankDetails.forEach((bank, index) => {
            const branchText = bank.branch ? `(Branch: ${bank.branch})` : '';
            const bankTitle = data.bankDetails.length > 1 ? `Bank ${index + 1}: ` : '';
            
            doc.text(`${bankTitle}${bank.name || 'N/A'} ${branchText}`, margin + 5, currentY_bank);
            currentY_bank += 4;
            doc.text(`Account Name: ${bank.accountName || 'N/A'}`, margin + 5, currentY_bank);
            currentY_bank += 4;
            doc.text(`Account Number: ${bank.accountNumber || 'N/A'}`, margin + 5, currentY_bank);
            currentY_bank += 4;
            if (bank.paybillNumber) {
                doc.text(`Paybill Number: ${bank.paybillNumber || 'N/A'}`, margin + 5, currentY_bank);
                currentY_bank += 4;
            }
            doc.text(`SWIFT/BIC Code: ${bank.swiftCode || 'N/A'} | Currency: ${bank.currency || 'N/A'}`, margin + 5, currentY_bank);
            currentY_bank += 4;
            
            // Add separator between multiple banks
            if (index < data.bankDetails.length - 1) {
                doc.setDrawColor(200);
                doc.setLineWidth(0.2);
                doc.line(margin + 5, currentY_bank - 2, margin + 180, currentY_bank - 2);
                currentY_bank += 3;
            }
        });
    } else {
        // Fallback for old data structure
        const bank = data.bankDetails || {};
        const branchText = bank.branch ? `(Branch: ${bank.branch})` : '';

        doc.text(`Bank Name: ${bank.name || 'N/A'} ${branchText}`, margin + 5, currentY_bank);
        currentY_bank += 4;
        doc.text(`Account Name: ${bank.accountName || 'N/A'}`, margin + 5, currentY_bank);
        currentY_bank += 4;
        doc.text(`Account Number: ${bank.accountNumber || 'N/A'}`, margin + 5, currentY_bank);
        currentY_bank += 4;
        if (bank.paybillNumber) {
            doc.text(`Paybill Number: ${bank.paybillNumber || 'N/A'}`, margin + 5, currentY_bank);
            currentY_bank += 4;
        }
        doc.text(`SWIFT/BIC Code: ${bank.swiftCode || 'N/A'} | Currency: ${bank.currency || 'N/A'}`, margin + 5, currentY_bank);
    }

    drawText('**NOTE: Buyer Should bear the cost of Bank Charge when remitting T/T', margin, y + (data.bankDetails?.length > 1 ? 55 : 40) - 5, 9, 'bold', secondaryColor);
    y += (data.bankDetails?.length > 1 ? 60 : 45);

   // =================================================================
// CONFIRMATION SIGNATURES WITH STAMP - UPDATED FOR BETTER LAYOUT
// =================================================================
doc.setDrawColor(primaryColor);

// Buyer Signature Section - UPDATED WITH TEXT WRAPPING
// Split buyer name into multiple lines if needed
const maxBuyerWidth = 70; // Width of the signature box
const buyerNameLines = doc.splitTextToSize(data.buyerNameConfirmation, maxBuyerWidth);
let buyerNameY = y + 5;

// Draw each line of the buyer's name
buyerNameLines.forEach((line, index) => {
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(line, margin + 35, buyerNameY, null, null, "center");
    buyerNameY += 4;
});

// Line for signature
doc.line(margin, buyerNameY, 90, buyerNameY);
drawText('Accepted and Confirmed by Buyer', margin + 35, buyerNameY + 4, 8, 'normal', 0, "center");

// Adjust Y position based on number of name lines
y = buyerNameY + 10;

// Seller Signature with stamp - POSITION ADJUSTED TO BE JUST BELOW BANKING DETAILS
const sellerSigX = 110;

// Use document creation date (issueDate) instead of current date
let stampDate = data.issueDate; // This is already stored when invoice was created

// If issueDate is in a different format, convert it
if (stampDate) {
    try {
        // Try to format the date properly
        const dateObj = new Date(stampDate);
        if (!isNaN(dateObj.getTime())) {
            stampDate = dateObj.toLocaleDateString('en-US');
        }
    } catch (e) {
        // Fallback to original date
        console.log("Using original issue date format");
    }
} else {
    // Fallback to today's date
    stampDate = new Date().toLocaleDateString('en-US');
}

// Calculate stamp position - position it just below banking details with proper spacing
// Banking details section ends at 'y', so we need to add a small gap
const stampY = y + -15; // Reduced from y + 5 to y + 8 for better positioning
addStampWithDate(sellerSigX + 40, stampY, stampDate);

y += 32; // Adjusted from y += 30 to maintain proper footer spacing

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

    // Function to add stamp image with date OVERLAY - UPDATED WITH RED TEXT AND SIZE 14
    const addStampWithDate = (x, y, dateText) => {
        try {
            // Calculate position for 500x500 image to fit properly
            const stampWidth = 30; // Reduced width for better scaling
            const stampHeight = 30; // Maintain aspect ratio for 500x500
            
            // Add stamp image first
            doc.addImage('STAMP.png', 'JPEG', x - (stampWidth/2), y, stampWidth, stampHeight);
            
            // Add date text OVER the stamp image (centered) - RED with size 14
            doc.setFontSize(14); // LARGER FONT SIZE AS REQUESTED
            doc.setTextColor(255, 0, 0); // RED COLOR AS REQUESTED
            doc.setFont("helvetica", "bold");
            
            // Calculate text position to be centered over the stamp
            const textX = x;
            const textY = y + (stampHeight/2) + 2; // Center vertically
            
            doc.text(dateText, textX, textY, null, null, "center");
            
            // Add company text below stamp
            doc.setFontSize(10);
            doc.setTextColor(primaryColor);
            doc.text('For WanBite Investment Co. LTD', x, y + stampHeight + 8, null, null, "center");
            
        } catch (error) {
            console.error("Error adding stamp:", error);
            // Fallback to text only
            doc.setFontSize(14); // Larger fallback
            doc.setTextColor(255, 0, 0); // Red fallback
            doc.text(dateText, x, y - 2, null, null, "center");
            doc.setFontSize(10);
            doc.setTextColor(primaryColor);
            doc.text('For WanBite Investment Co. LTD', x, y + 5, null, null, "center");
        }
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
    // Add underline
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    const vehicleTitleWidth = doc.getStringUnitWidth('VEHICLE DETAILS') * 12 / doc.internal.scaleFactor;
    doc.line(margin, y + 1, margin + vehicleTitleWidth, y + 1);
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
    
    // ADD THESE LINES FOR INVOICE REFERENCE
    if (data.invoiceReference) {
        y += lineSpacing;
        doc.text(`Invoice Reference: ${data.invoiceReference}`, margin + textIndent, y);
    }
    
    // ADD THESE LINES FOR RECEIPT REFERENCE
    if (data.receiptReference) {
        y += lineSpacing;
        doc.text(`Receipt Reference: ${data.receiptReference}`, margin + textIndent, y);
    }
    // END OF ADDED LINES
    
    y += lineSpacing + 4;

    // =================================================================
    // PAYMENT DETAILS & SCHEDULE
    // =================================================================
    drawText('SALES AGREEMENT & PAYMENT TERMS', margin, y, 12, 'bold', primaryColor);
    // Add underline
    const paymentTitleWidth = doc.getStringUnitWidth('SALES AGREEMENT & PAYMENT TERMS') * 12 / doc.internal.scaleFactor;
    doc.line(margin, y + 1, margin + paymentTitleWidth, y + 1);
    y += lineSpacing;

    // Purchase Price
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("The Purchase Price of ", margin, y);
    doc.setFont("helvetica", "bold");
   let totalText = `${data.salesTerms.currency} ${formatAmount(data.salesTerms.price)}`;
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
    if (bank.paybillNumber) {
        doc.text(`Paybill No: ${bank.paybillNumber}`, margin + 3, y + 14);
    }
    doc.text(`Branch: ${bank.branch || 'N/A'} | Currency: ${data.salesTerms.currency}`, margin + (bank.paybillNumber ? 90 : 3), y + (bank.paybillNumber ? 14 : 14));
    y += 25;

    // Additional Terms
    drawText('GENERAL TERMS', margin, y, 12, 'bold', primaryColor);
    // Add underline
    const generalTermsWidth = doc.getStringUnitWidth('GENERAL TERMS') * 12 / doc.internal.scaleFactor;
    doc.line(margin, y + 1, margin + generalTermsWidth, y + 1);
    y += lineSpacing;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('• The Buyer agrees to purchase the vehicle in its current condition.', margin + textIndent, y);
    y += lineSpacing;
    doc.text('• The sale is as-is, and the Seller does not provide any warranty unless otherwise agreed in writing.', margin + textIndent, y);
    y += lineSpacing + 6;

    // =================================================================
    // SIGNATURES WITH STAMP
    // =================================================================
    drawText('AGREED AND ACCEPTED', margin, y, 12, 'bold', primaryColor);
    // Add underline
    const agreedWidth = doc.getStringUnitWidth('AGREED AND ACCEPTED') * 12 / doc.internal.scaleFactor;
    doc.line(margin, y + 1, margin + agreedWidth, y + 1);
    y += lineSpacing;

    const sigY = y + 10;
    const sigNameY = sigY + 10;
    
    // Buyer - UPDATED LAYOUT (REMOVED DATE)
    // Buyer Name above the line (in bold)
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.buyer.name}`, margin + 35, sigY - 5, null, null, "center");
    
    // Line for signature
    doc.line(margin, sigY, margin + 70, sigY);
    drawText('Buyer Signature', margin + 35, sigY + 2, 8, 'normal', 0, "center");
    
    // REMOVED DATE LINE AND DATE TEXT
    
    drawText(`Witness: ${data.signatures.buyerWitness}`, margin, sigNameY + 3, 10, 'normal', 0);

    // Seller with stamp
    const sellerX = pageW - margin - 70;
    
    // Use agreement creation date instead of current date
    let stampDate = data.agreementDate; // This should be stored when agreement was created

    // If agreementDate is in YYYY-MM-DD format, convert it
    if (stampDate && stampDate.includes('-')) {
        try {
            const [year, month, day] = stampDate.split('-');
            const dateObj = new Date(year, month - 1, day);
            stampDate = dateObj.toLocaleDateString('en-US');
        } catch (e) {
            // Keep original format
        }
    }

    // Adjust stamp position to be just below payment terms section
const stampYPosition = sigY; // Position at same Y as buyer signature line
addStampWithDate(sellerX + 35, stampYPosition, stampDate);

doc.setFontSize(8);
doc.setTextColor(0);
doc.text(`Witness: ${data.signatures.sellerWitness}`, sellerX + 35, sigY + 15, null, null, "center");

y += 28; // Adjusted for better spacing
    
    // --- Global Footer ---
    doc.setFillColor(primaryColor);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(9);
    const footerText = `Location: Ngong Road, Kilimani, Nairobi. | Email: sales@carskenya.co.ke | Phone: 0713147136`;
    doc.text(footerText, pageW / 2, doc.internal.pageSize.getHeight() - 4, null, null, "center");

    doc.save(`Car_Sales_Agreement_${data.buyer.name.replace(/\s/g, '_')}.pdf`);
}
// =================================================================
//                 ADDITIONAL FUNCTIONS
// =================================================================

/**
 * Creates a receipt from invoice data
 */
function createReceiptFromInvoice(invoiceData) {
    // Check if invoice is revoked
    if (invoiceData.revoked) {
        alert("Cannot create receipt from a revoked invoice.");
        return;
    }
    
    // Navigate to receipt form with invoice reference
    renderReceiptForm(invoiceData.invoiceId);
    
    // Auto-populate fields from invoice data
    setTimeout(() => {
        const receivedFromField = document.getElementById('receivedFrom');
        const beingPaidForField = document.getElementById('beingPaidFor');
        const invoiceRefField = document.getElementById('invoiceReference');
        const exchangeRateField = document.getElementById('exchangeRate');
        
        if (receivedFromField) receivedFromField.value = invoiceData.clientName;
        if (beingPaidForField) beingPaidForField.value = `${invoiceData.carDetails.make} ${invoiceData.carDetails.model} ${invoiceData.carDetails.year}`;
        if (invoiceRefField) {
            invoiceRefField.value = invoiceData.invoiceId;
            // Store exchange rate for calculations
            invoiceRefField.dataset.exchangeRate = invoiceData.exchangeRate;
            invoiceRefField.dataset.totalUSD = invoiceData.pricing.totalUSD;
            invoiceRefField.dataset.balanceUSD = invoiceData.pricing.balanceUSD;
        }
        if (exchangeRateField) exchangeRateField.value = invoiceData.exchangeRate;
        
        // Trigger fetch invoice details
        fetchInvoiceDetails();
    }, 100);
}

/**
 * Creates a car sales agreement from invoice data
 */
function createAgreementFromInvoice(invoiceData) {
    // Check if invoice is revoked
    if (invoiceData.revoked) {
        alert("Cannot create agreement from a revoked invoice.");
        return;
    }
    
    // Navigate to agreement form
    renderAgreementForm();
    
    // Auto-populate fields from invoice data
    setTimeout(() => {
        const buyerNameField = document.getElementById('buyerName');
        const buyerPhoneField = document.getElementById('buyerPhone');
        const carMakeModelField = document.getElementById('carMakeModel');
        const carYearField = document.getElementById('carYear');
        const carColorField = document.getElementById('carColor');
        const carVINField = document.getElementById('carVIN');
        const carFuelTypeField = document.getElementById('carFuelType');
        const agreementDateInput = document.getElementById('agreementDateInput');
        
        // Set basic information
        if (buyerNameField) buyerNameField.value = invoiceData.clientName;
        if (buyerPhoneField) buyerPhoneField.value = invoiceData.clientPhone || '';
        
        // Set vehicle details
        if (carMakeModelField) carMakeModelField.value = `${invoiceData.carDetails.make} ${invoiceData.carDetails.model}`;
        if (carYearField) carYearField.value = invoiceData.carDetails.year || '';
        if (carColorField) carColorField.value = invoiceData.carDetails.color || '';
        if (carVINField) carVINField.value = invoiceData.carDetails.vin || '';
        if (carFuelTypeField) carFuelTypeField.value = invoiceData.carDetails.fuel || '';
        
        // Set agreement date to today
        if (agreementDateInput) agreementDateInput.value = new Date().toISOString().slice(0, 10);
        
        // Set payment details based on invoice pricing
        const totalAmount = invoiceData.pricing.totalUSD || 0;
        const depositAmount = invoiceData.pricing.depositUSD || (totalAmount * 0.5);
        const balanceAmount = invoiceData.pricing.balanceUSD || (totalAmount * 0.5);
        
        // Set currency to USD (since invoice is in USD)
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) currencySelect.value = 'USD';
        
        // Clear existing payment rows
        const paymentRows = document.getElementById('payment-schedule-rows');
        if (paymentRows) {
            paymentRows.innerHTML = '';
            
            // Add deposit payment row
            const depositRow = document.createElement('div');
            depositRow.className = 'grid grid-cols-4 gap-2 payment-row';
            depositRow.dataset.id = '1';
            depositRow.innerHTML = `
                <input type="text" required placeholder="e.g. Deposit" value="Deposit" class="p-2 border rounded-md col-span-2 text-sm">
                <input type="number" step="0.01" required placeholder="Amount" value="${depositAmount.toFixed(2)}" oninput="calculatePaymentTotal()" class="payment-amount p-2 border rounded-md text-sm">
                <input type="date" required value="${new Date().toISOString().slice(0, 10)}" class="payment-date p-2 border rounded-md text-sm">
            `;
            paymentRows.appendChild(depositRow);
            
            // Add balance payment row
            if (balanceAmount > 0) {
                const dueDate = invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                const balanceRow = document.createElement('div');
                balanceRow.className = 'grid grid-cols-4 gap-2 payment-row';
                balanceRow.dataset.id = '2';
                balanceRow.innerHTML = `
                    <input type="text" required placeholder="e.g. Balance" value="Balance" class="p-2 border rounded-md col-span-2 text-sm">
                    <input type="number" step="0.01" required placeholder="Amount" value="${balanceAmount.toFixed(2)}" oninput="calculatePaymentTotal()" class="payment-amount p-2 border rounded-md text-sm">
                    <input type="date" required value="${dueDate}" class="payment-date p-2 border rounded-md text-sm">
                    <button type="button" onclick="deletePaymentRow(2)" class="text-red-500 hover:text-red-700 text-sm">X</button>
                `;
                paymentRows.appendChild(balanceRow);
            }
        }
        
        // Update the total
        calculatePaymentTotal();
        
        // Store the invoice reference in a hidden field or data attribute
        const agreementForm = document.getElementById('agreement-form');
        if (agreementForm) {
            agreementForm.dataset.invoiceReference = invoiceData.invoiceId;
            agreementForm.dataset.invoiceId = invoiceData.firestoreId;
        }
        
        // Show notification
        setTimeout(() => {
            alert(`Invoice ${invoiceData.invoiceId} data has been loaded into the agreement form. The invoice number will be used as the agreement reference.`);
        }, 300);
        
    }, 100);
}

/**
 * Creates an agreement from receipt data
 */
function createAgreementFromReceipt(receiptData) {
    // Navigate to agreement form
    renderAgreementForm();
    
    // Wait for form to render, then auto-populate fields
    setTimeout(() => {
        const buyerNameField = document.getElementById('buyerName');
        const buyerPhoneField = document.getElementById('buyerPhone');
        const carMakeModelField = document.getElementById('carMakeModel');
        const totalPriceField = document.getElementById('totalPrice');
        
        // Extract client name from receipt
        if (buyerNameField) buyerNameField.value = receiptData.receivedFrom || '';
        
        // Extract vehicle information from "Being Paid For" field
        if (receiptData.beingPaidFor && carMakeModelField) {
            // Try to extract vehicle info from the description
            const vehicleText = receiptData.beingPaidFor;
            // Remove common prefixes
            let cleanText = vehicleText
                .replace(/deposit|payment|for|being paid for/gi, '')
                .trim();
            
            carMakeModelField.value = cleanText;
        }
        
        // Set total price based on receipt amount
        if (totalPriceField && receiptData.amountReceived) {
            // For receipts without invoice, use amount received as starting point
            // Multiply by 2 assuming deposit is 50% (common for vehicle purchases)
            const estimatedTotal = receiptData.amountReceived * 2;
            totalPriceField.value = estimatedTotal.toFixed(2);
            
            // Set currency based on receipt
            const currencySelect = document.getElementById('currencySelect');
            if (currencySelect && receiptData.currency) {
                currencySelect.value = receiptData.currency;
            }
        }
        
        // Store receipt reference in form dataset
        const agreementForm = document.getElementById('agreement-form');
        if (agreementForm) {
            agreementForm.dataset.receiptReference = receiptData.receiptId;
            agreementForm.dataset.receiptId = receiptData.firestoreId;
        }
        
        // Calculate and update totals
        calculatePaymentTotal();
        
        // Show notification
        setTimeout(() => {
            alert(`Receipt ${receiptData.receiptId} data has been loaded into the agreement form. Please verify and complete the remaining details.`);
        }, 300);
        
    }, 100);
}

/**
 * Re-downloads the PDF for a selected receipt document from history.
 * @param {object} data - The receipt data object retrieved from Firestore.
 */
async function reDownloadReceipt(data) {
    // Ensure data.receiptDate is set (should be from the save logic)
    if (!data.receiptDate) {
         data.receiptDate = new Date().toLocaleDateString('en-US'); // Fallback
    }
    
    // If we have the firestoreId, fetch payment history
    if (data.firestoreId) {
        try {
            const balances = await calculateReceiptBalances(data.firestoreId);
            data.totalPaidUSD = balances.totalPaidUSD;
            data.totalPaidKSH = balances.totalPaidKSH;
            data.paymentCount = balances.paymentCount;
            data.paymentHistory = balances.payments;
        } catch (error) {
            console.error("Error fetching payment history for PDF:", error);
        }
    }
    
    // Now generate the PDF with all the data
    generateReceiptPDF(data);
}

/**
 * View balances for a specific receipt
 */
function viewReceiptBalances(data) {
    const modalHtml = `
        <div id="balances-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 class="text-lg font-semibold text-primary-blue mb-4">Receipt Balances</h3>
                <p class="text-sm mb-3">
                    <strong>Receipt:</strong> ${data.receiptId}<br>
                    <strong>Client:</strong> ${data.receivedFrom}<br>
                    <strong>Exchange Rate:</strong> USD 1 = KES ${data.exchangeRate || 130}
                </p>
                <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 class="font-bold text-primary-blue mb-2">Payment Summary</h4>
                    <p class="text-sm"><strong>Total Payments:</strong> ${data.paymentCount || 1}</p>
                    <p class="text-sm"><strong>Total Paid (USD):</strong> <span class="font-bold text-green-600">${data.totalPaidUSD?.toFixed(2) || data.amountReceivedUSD?.toFixed(2) || (data.currency === 'USD' ? data.amountReceived.toFixed(2) : (data.amountReceived / (data.exchangeRate || 130)).toFixed(2))}</span></p>
                    <p class="text-sm"><strong>Total Paid (KES):</strong> <span class="font-bold text-green-600">${data.totalPaidKSH?.toFixed(2) || data.amountReceivedKSH?.toFixed(2) || (data.currency === 'KSH' ? data.amountReceived.toFixed(2) : (data.amountReceived * (data.exchangeRate || 130)).toFixed(2))}</span></p>
                </div>
                <div class="mb-4 p-3 ${data.balanceDetails?.balanceRemaining > 0 ? 'bg-red-50' : 'bg-green-50'} rounded-lg">
                    <h4 class="font-bold ${data.balanceDetails?.balanceRemaining > 0 ? 'text-secondary-red' : 'text-green-600'} mb-2">
                        ${data.balanceDetails?.balanceRemaining > 0 ? 'Remaining Balance' : 'Fully Paid'}
                    </h4>
                    <p class="text-sm"><strong>USD Balance:</strong> <span class="font-bold">${data.balanceDetails?.balanceRemainingUSD?.toFixed(2) || data.balanceDetails?.balanceRemaining?.toFixed(2) || '0.00'}</span></p>
                    <p class="text-sm"><strong>KES Balance:</strong> <span class="font-bold">${data.balanceDetails?.balanceRemainingKSH?.toFixed(2) || (data.balanceDetails?.balanceRemaining * (data.exchangeRate || 130)).toFixed(2) || '0.00'}</span></p>
                    ${data.balanceDetails?.balanceDueDate ? `<p class="text-sm"><strong>Due Date:</strong> ${data.balanceDetails.balanceDueDate}</p>` : ''}
                </div>
                <div class="flex justify-end space-x-3">
                    <button onclick="addPaymentToReceipt(${JSON.stringify(data)})" 
                            class="bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md">
                        Add Payment
                    </button>
                    <button onclick="document.getElementById('balances-modal').remove()" 
                            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Add payment to receipt from receipt history
 */
function addPaymentToReceipt(receiptData) {
    addPaymentToExistingReceipt(
        receiptData.firestoreId,
        receiptData.receiptId,
        receiptData.receivedFrom,
        receiptData.exchangeRate || 130
    );
}

/**
 * Marks invoice deposit as paid
 */
function markInvoiceDepositPaid(invoiceData) {
    // Check if invoice is revoked
    if (invoiceData.revoked) {
        alert("Cannot mark deposit as paid on a revoked invoice.");
        return;
    }
    
    const modalHtml = `
        <div id="deposit-paid-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 class="text-lg font-semibold text-primary-blue mb-4">Mark Deposit as Paid</h3>
                <p class="text-sm mb-3">
                    <strong>Invoice:</strong> ${invoiceData.invoiceId}<br>
                    <strong>Client:</strong> ${invoiceData.clientName}<br>
                    <strong>Deposit Required:</strong> USD ${invoiceData.pricing.depositUSD.toFixed(2)} (KES ${invoiceData.pricing.depositKSH})
                </p>
                <form id="deposit-paid-form" onsubmit="event.preventDefault(); saveDepositPayment('${invoiceData.firestoreId}', ${invoiceData.pricing.depositUSD}, ${invoiceData.exchangeRate})">
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Payment Date</label>
                        <input type="date" id="depositDate" required value="${new Date().toISOString().slice(0, 10)}" class="mt-1 block w-full p-2 border rounded-md">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Amount</label>
                        <div class="grid grid-cols-3 gap-2">
                            <select id="depositCurrency" required class="p-2 border rounded-md">
                                <option value="USD">USD</option>
                                <option value="KSH">KSH</option>
                            </select>
                            <input type="number" id="depositAmount" step="0.01" required placeholder="Amount" class="col-span-2 p-2 border rounded-md">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Exchange Rate (USD 1 = KES)</label>
                        <input type="number" id="depositExchangeRate" step="0.01" required value="${invoiceData.exchangeRate || 130}" class="w-full p-2 border rounded-md">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Bank Used</label>
                        <select id="depositBankUsed" required class="mt-1 block w-full p-2 border rounded-md">
                            <option value="" disabled selected>Select Bank</option>
                            <option value="Cash">Cash</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Reference/Description</label>
                        <input type="text" id="depositDescription" required placeholder="e.g., Deposit Payment for Invoice ${invoiceData.invoiceId}" class="mt-1 block w-full p-2 border rounded-md">
                    </div>
                    <div class="mb-4 p-2 bg-yellow-50 rounded">
                        <p class="text-xs text-gray-600">
                            <strong>Note:</strong> This will create a receipt for the deposit payment.
                        </p>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="(() => { const modal = document.getElementById('deposit-paid-modal'); if (modal) modal.remove(); })()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md">
                            Cancel
                        </button>
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">
                            Save Deposit Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Set default amount based on currency
    const depositCurrency = document.getElementById('depositCurrency');
    const depositAmount = document.getElementById('depositAmount');
    
    if (depositCurrency && depositAmount) {
        depositCurrency.addEventListener('change', function() {
            if (this.value === 'USD') {
                depositAmount.value = invoiceData.pricing.depositUSD.toFixed(2);
            } else if (this.value === 'KSH') {
                depositAmount.value = invoiceData.pricing.depositKSH;
            }
        });
        
        // Set initial value
        depositAmount.value = invoiceData.pricing.depositUSD.toFixed(2);
    }
    
    // Populate bank dropdown in the modal
    populateBankDropdownForModal('depositBankUsed');
}

/**
 * Saves deposit payment and creates receipt
 */
async function saveDepositPayment(invoiceDocId, depositAmountUSD, exchangeRate) {
    const form = document.getElementById('deposit-paid-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const depositDate = document.getElementById('depositDate').value;
    const depositCurrency = document.getElementById('depositCurrency').value;
    const depositAmount = parseFloat(document.getElementById('depositAmount').value);
    const depositExchangeRate = parseFloat(document.getElementById('depositExchangeRate').value);
    const depositBankUsed = document.getElementById('depositBankUsed').value;
    const depositDescription = document.getElementById('depositDescription').value;
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
        alert("Please enter a valid deposit amount.");
        return;
    }
    
    // Get invoice data
    const invoiceDoc = await db.collection("invoices").doc(invoiceDocId).get();
    if (!invoiceDoc.exists) {
        alert("Invoice not found!");
        return;
    }
    
    const invoiceData = invoiceDoc.data();
    
    // Calculate amounts in both currencies
    let amountUSD = depositAmount;
    let amountKSH = depositAmount;
    
    if (depositCurrency === 'KSH') {
        amountUSD = depositAmount / depositExchangeRate;
        amountKSH = depositAmount;
    } else if (depositCurrency === 'USD') {
        amountUSD = depositAmount;
        amountKSH = depositAmount * depositExchangeRate;
    }
    
    // Generate receipt ID
    const receiptId = generateReceiptId("Deposit", invoiceData.clientName);
    const receiptDate = depositDate || new Date().toLocaleDateString('en-US');
    
    // Create receipt data
    const receiptData = {
        receiptId,
        receiptType: "Invoice Deposit",
        receivedFrom: invoiceData.clientName,
        currency: depositCurrency,
        amountReceived: depositAmount,
        amountReceivedUSD: amountUSD,
        amountReceivedKSH: amountKSH,
        amountWords: numberToWords(depositAmount).replace('only', depositCurrency === 'USD' ? 'US Dollars only.' : 'Kenya Shillings only.'),
        beingPaidFor: `${invoiceData.carDetails.make} ${invoiceData.carDetails.model} ${invoiceData.carDetails.year} Deposit`,
        paymentDetails: {
            chequeNo: "",
            rtgsTtNo: "",
            bankUsed: depositBankUsed
        },
        balanceDetails: {
            balanceRemaining: invoiceData.pricing.balanceUSD,
            balanceDueDate: invoiceData.dueDate,
            balanceRemainingUSD: invoiceData.pricing.balanceUSD,
            balanceRemainingKSH: invoiceData.pricing.balanceUSD * depositExchangeRate
        },
        invoiceReference: invoiceData.invoiceId,
        exchangeRate: depositExchangeRate,
        receiptDate,
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        revoked: false // Add revoked flag
    };
    
    try {
        // Save receipt
        const receiptRef = await db.collection("receipts").add(receiptData);
        
        // Save payment record
        const paymentData = {
            receiptId: receiptRef.id,
            receiptNumber: receiptId,
            paymentNumber: 1,
            paymentDate: receiptDate,
            amount: depositAmount,
            currency: depositCurrency,
            amountUSD: amountUSD,
            amountKSH: amountKSH,
            exchangeRate: depositExchangeRate,
            description: depositDescription,
            paymentMethod: depositBankUsed !== 'Cash' ? `Bank: ${depositBankUsed}` : "Cash",
            createdBy: currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection("receipt_payments").add(paymentData);
        
        // Update invoice to mark deposit as paid
        await db.collection("invoices").doc(invoiceDocId).update({
            "pricing.depositPaid": true,
            "pricing.depositPaidDate": receiptDate,
            "pricing.depositPaidAmount": depositAmount,
            "pricing.depositPaidCurrency": depositCurrency,
            "pricing.remainingBalance": invoiceData.pricing.balanceUSD
        });
        
        const modal = document.getElementById('deposit-paid-modal');
        if (modal) {
            modal.remove();
        }
        
        alert(`Deposit payment of ${depositCurrency} ${depositAmount.toFixed(2)} saved successfully! Receipt ${receiptId} created.`);
        
        // Navigate to receipt form with the invoice reference
        renderReceiptForm(invoiceData.invoiceId);
        
    } catch (error) {
        console.error("Error saving deposit payment:", error);
        alert("Failed to save deposit payment: " + error.message);
    }
}

// =================================================================
//                 11. FLEET MANAGEMENT MODULE (SIMPLIFIED)
// =================================================================

function handleFleetManagement() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-8 text-primary-blue">Fleet Management Dashboard</h2>
        <div class="p-6 bg-yellow-50 rounded-xl border border-yellow-400">
            <p class="text-gray-800 font-semibold mb-4">Fleet Management Features:</p>
            <ul class="list-disc pl-5 space-y-2 text-gray-700">
                <li>Track vehicles from shipment to delivery</li>
                <li>Monitor ETA (Estimated Time of Arrival)</li>
                <li>Update status and add comments for each stage</li>
                <li>View status history for each vehicle</li>
                <li>Real-time updates using Firestore</li>
            </ul>
            <p class="mt-4 text-sm text-gray-600">Use the navigation to manage your fleet operations.</p>
        </div>
    `;
}

// =================================================================
//                 SEARCH FUNCTIONS (ADDED - WERE MISSING)
// =================================================================

/**
* Search receipts by various fields
*/
async function searchReceipts(searchTerm) {
    try {
        // Convert to lowercase for case-insensitive search
        searchTerm = searchTerm.toLowerCase();
        
        const receiptsSnapshot = await db.collection("receipts").get();
        const results = [];
        
        receiptsSnapshot.forEach(doc => {
            const data = doc.data();
            
            // Check multiple fields for matches
            const matches = 
                (data.receivedFrom && data.receivedFrom.toLowerCase().includes(searchTerm)) ||
                (data.receiptId && data.receiptId.toLowerCase().includes(searchTerm)) ||
                (data.beingPaidFor && data.beingPaidFor.toLowerCase().includes(searchTerm)) ||
                (data.invoiceReference && data.invoiceReference.toLowerCase().includes(searchTerm)) ||
                (data.amountWords && data.amountWords.toLowerCase().includes(searchTerm));
            
            if (matches) {
                results.push({ id: doc.id, ...data });
            }
        });
        
        return results;
    } catch (error) {
        console.error("Error searching receipts:", error);
        return [];
    }
}

/**
 * Improved search invoices by various fields (case-insensitive)
 */
async function searchInvoices(searchTerm) {
    try {
        searchTerm = searchTerm.toLowerCase();
        
        const invoicesSnapshot = await db.collection("invoices").get();
        const results = [];
        
        invoicesSnapshot.forEach(doc => {
            const data = doc.data();
            
            // Check multiple fields
            const matches = 
                (data.clientName && data.clientName.toLowerCase().includes(searchTerm)) ||
                (data.invoiceId && data.invoiceId.toLowerCase().includes(searchTerm)) ||
                (data.clientPhone && data.clientPhone.includes(searchTerm)) ||
                (data.carDetails.make && data.carDetails.make.toLowerCase().includes(searchTerm)) ||
                (data.carDetails.model && data.carDetails.model.toLowerCase().includes(searchTerm)) ||
                (data.carDetails.vin && data.carDetails.vin.toLowerCase().includes(searchTerm));
            
            if (matches) {
                results.push({ id: doc.id, ...data });
            }
        });
        
        return results;
    } catch (error) {
        console.error("Error searching invoices:", error);
        return [];
    }
}

/**
 * Improved search agreements by various fields (case-insensitive)
 */
async function searchAgreements(searchTerm) {
    try {
        searchTerm = searchTerm.toLowerCase();
        
        const agreementsSnapshot = await db.collection("sales_agreements").get();
        const results = [];
        
        agreementsSnapshot.forEach(doc => {
            const data = doc.data();
            
            // Check multiple fields
            const matches = 
                (data.buyer.name && data.buyer.name.toLowerCase().includes(searchTerm)) ||
                (data.buyer.phone && data.buyer.phone.includes(searchTerm)) ||
                (data.vehicle.makeModel && data.vehicle.makeModel.toLowerCase().includes(searchTerm)) ||
                (data.vehicle.vin && data.vehicle.vin.toLowerCase().includes(searchTerm)) ||
                (data.invoiceReference && data.invoiceReference.toLowerCase().includes(searchTerm)) ||
                (data.receiptReference && data.receiptReference.toLowerCase().includes(searchTerm));
            
            if (matches) {
                results.push({ id: doc.id, ...data });
            }
        });
        
        return results;
    } catch (error) {
        console.error("Error searching agreements:", error);
        return [];
    }
}

// Also, update the searchDocuments function to handle empty results better:
async function searchDocuments() {
    const searchTerm = document.getElementById('document-search')?.value.trim();
    const docTypeFilter = document.getElementById('document-type-filter')?.value;
    
    if (!searchTerm || searchTerm.length < 2) {
        alert("Please enter at least 2 characters to search");
        return;
    }
    
    // Get references to DOM elements
    const resultsList = document.getElementById('search-results-list');
    const searchResultsDiv = document.getElementById('search-results');
    const docCreationArea = document.getElementById('document-creation-area');
    
    // If we're not on the document generator page, navigate to it first
    if (!resultsList || !searchResultsDiv || !docCreationArea) {
        handleDocumentGenerator();
        
        setTimeout(() => {
            const searchInput = document.getElementById('document-search');
            const filterSelect = document.getElementById('document-type-filter');
            
            if (searchInput) searchInput.value = searchTerm;
            if (filterSelect && docTypeFilter) filterSelect.value = docTypeFilter;
            
            setTimeout(() => {
                performSearch(searchTerm, docTypeFilter || 'all');
            }, 300);
        }, 200);
        return;
    }
    
    await performSearch(searchTerm, docTypeFilter || 'all');
}

// Update the performSearch function to show better messages:
async function performSearch(searchTerm, docTypeFilter) {
    const resultsList = document.getElementById('search-results-list');
    const searchResultsDiv = document.getElementById('search-results');
    const docCreationArea = document.getElementById('document-creation-area');
    
    if (!resultsList || !searchResultsDiv || !docCreationArea) {
        console.error("Required DOM elements not found");
        alert("Error: Please try searching again.");
        return;
    }
    
    resultsList.innerHTML = '<div class="text-center p-8"><p class="text-gray-500">Searching documents...</p><div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-blue"></div></div>';
    searchResultsDiv.classList.remove('hidden');
    docCreationArea.classList.add('hidden');
    
    let allResults = [];
    
    try {
        console.log(`Searching for: "${searchTerm}" in ${docTypeFilter}`);
        
        if (docTypeFilter === 'all' || docTypeFilter === 'receipt') {
            const receiptResults = await searchReceipts(searchTerm);
            console.log(`Found ${receiptResults.length} receipts`);
            allResults = allResults.concat(receiptResults.map(r => ({...r, type: 'receipt'})));
        }
        
        if (docTypeFilter === 'all' || docTypeFilter === 'invoice') {
            const invoiceResults = await searchInvoices(searchTerm);
            console.log(`Found ${invoiceResults.length} invoices`);
            allResults = allResults.concat(invoiceResults.map(i => ({...i, type: 'invoice'})));
        }
        
        if (docTypeFilter === 'all' || docTypeFilter === 'agreement') {
            const agreementResults = await searchAgreements(searchTerm);
            console.log(`Found ${agreementResults.length} agreements`);
            allResults = allResults.concat(agreementResults.map(a => ({...a, type: 'agreement'})));
        }
        
        console.log(`Total results: ${allResults.length}`);
        
        // Sort by date (newest first)
        allResults.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB - dateA;
        });
        
        displaySearchResults(allResults, searchTerm);
        
    } catch (error) {
        console.error("Error searching documents:", error);
        resultsList.innerHTML = `
            <div class="text-center p-8 bg-red-50 rounded-lg">
                <p class="text-red-600 font-semibold">Search Error</p>
                <p class="text-sm text-gray-600 mt-2">${error.message}</p>
                <button onclick="clearSearch()" class="mt-4 bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md">
                    Return to Document Generator
                </button>
            </div>
        `;
    }
}

// =================================================================
//                 ADDITIONAL HELPER FUNCTIONS
// =================================================================

/**
 * Populates bank dropdown for modal
 */
async function populateBankDropdownForModal(dropdownId) {
    const bankSelect = document.getElementById(dropdownId);
    if (!bankSelect) return;

    // Clear existing options except the first one
    while (bankSelect.options.length > 1) {
        bankSelect.remove(1);
    }

    try {
        const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
        
        if (snapshot.empty) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No banks configured. Add banks first.";
            option.disabled = true;
            bankSelect.appendChild(option);
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = `${data.name} - ${data.branch || 'No Branch'} (${data.currency})`;
            option.textContent = `${data.name} - ${data.branch || 'No Branch'} (${data.currency})`;
            bankSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading banks for modal:", error);
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Error loading banks";
        option.disabled = true;
        bankSelect.appendChild(option);
    }
}

/**
 * Adds a payment to an existing receipt
 */
function addPaymentToExistingReceipt(receiptDocId, receiptNumber, clientName, exchangeRate = 130) {
    const modalHtml = `
        <div id="add-payment-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 class="text-lg font-semibold text-primary-blue mb-4">Add Payment to Receipt</h3>
                <p class="text-sm mb-3">
                    <strong>Receipt:</strong> ${receiptNumber}<br>
                    <strong>Client:</strong> ${clientName}<br>
                    <strong>Exchange Rate:</strong> USD 1 = KES ${exchangeRate}
                </p>
                <form id="add-payment-form" onsubmit="event.preventDefault(); saveAdditionalPayment('${receiptDocId}', '${receiptNumber}', ${exchangeRate})">
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Payment Date</label>
                        <input type="date" id="paymentDate" required value="${new Date().toISOString().slice(0, 10)}" class="mt-1 block w-full p-2 border rounded-md">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Amount</label>
                        <div class="grid grid-cols-3 gap-2">
                            <select id="paymentCurrency" required class="p-2 border rounded-md">
                                <option value="KSH">KSH</option>
                                <option value="USD">USD</option>
                            </select>
                            <input type="number" id="paymentAmount" step="0.01" required placeholder="Amount" class="col-span-2 p-2 border rounded-md">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Exchange Rate (USD 1 = KES)</label>
                        <input type="number" id="paymentExchangeRate" step="0.01" required value="${exchangeRate}" class="w-full p-2 border rounded-md">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Bank Used</label>
                        <select id="paymentBankUsed" required class="mt-1 block w-full p-2 border rounded-md">
                            <option value="" disabled selected>Select Bank</option>
                            <option value="Cash">Cash</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Reference/Description</label>
                        <input type="text" id="paymentDescription" required placeholder="e.g., Balance Payment, Additional Payment" class="mt-1 block w-full p-2 border rounded-md">
                    </div>
                    <div class="mb-4 p-2 bg-yellow-50 rounded">
                        <p class="text-xs text-gray-600">
                            <strong>Note:</strong> Amount will be auto-converted using exchange rate: USD 1 = KES ${exchangeRate}
                        </p>
                    </div>
                    <div class="flex justify-end space-x-3">
                       <button type="button" onclick="(() => { const modal = document.getElementById('add-payment-modal'); if (modal) modal.remove(); })()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md">
    Cancel
</button>
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">
                            Add Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Populate bank dropdown in the modal
    populateBankDropdownForModal('paymentBankUsed');
}

/**
 * Saves an additional payment to an existing receipt
 */
async function saveAdditionalPayment(receiptDocId, receiptNumber, exchangeRate) {
    const form = document.getElementById('add-payment-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentCurrency = document.getElementById('paymentCurrency').value;
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentExchangeRate = parseFloat(document.getElementById('paymentExchangeRate').value);
    const paymentBankUsed = document.getElementById('paymentBankUsed').value;
    const paymentDescription = document.getElementById('paymentDescription').value;
    
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        alert("Please enter a valid payment amount.");
        return;
    }
    
    // Calculate amounts in both currencies
    let amountUSD = paymentAmount;
    let amountKSH = paymentAmount;
    
    if (paymentCurrency === 'KSH') {
        amountUSD = paymentAmount / paymentExchangeRate;
        amountKSH = paymentAmount;
    } else if (paymentCurrency === 'USD') {
        amountUSD = paymentAmount;
        amountKSH = paymentAmount * paymentExchangeRate;
    }
    
    // Get next payment number
    const paymentsSnapshot = await db.collection("receipt_payments")
        .where("receiptId", "==", receiptDocId)
        .get();
    
    const nextPaymentNumber = paymentsSnapshot.size + 1;
    
    // Save payment record
    const paymentData = {
        receiptId: receiptDocId,
        receiptNumber: receiptNumber,
        paymentNumber: nextPaymentNumber,
        paymentDate: paymentDate,
        amount: paymentAmount,
        currency: paymentCurrency,
        amountUSD: amountUSD,
        amountKSH: amountKSH,
        exchangeRate: paymentExchangeRate,
        description: paymentDescription,
        paymentMethod: paymentBankUsed !== 'Cash' ? `Bank: ${paymentBankUsed}` : "Cash",
        createdBy: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection("receipt_payments").add(paymentData);
        
        // Update receipt balance
        const receiptDoc = await db.collection("receipts").doc(receiptDocId).get();
        const receiptData = receiptDoc.data();
        
        const currentBalanceUSD = receiptData.balanceDetails?.balanceRemainingUSD || 0;
        const newBalanceUSD = Math.max(0, currentBalanceUSD - amountUSD);
        const newBalanceKSH = newBalanceUSD * paymentExchangeRate;
        
        await db.collection("receipts").doc(receiptDocId).update({
            "balanceDetails.balanceRemaining": newBalanceUSD,
            "balanceDetails.balanceRemainingUSD": newBalanceUSD,
            "balanceDetails.balanceRemainingKSH": newBalanceKSH
        });
        
        const modal = document.getElementById('add-payment-modal');
        if (modal) {
            modal.remove();
        }
        
        alert(`Additional payment of ${paymentCurrency} ${paymentAmount.toFixed(2)} added successfully!`);
        
        // Refresh the view
        if (document.getElementById('receipt-balances-list')) {
            fetchAllReceiptBalances();
        } else {
            fetchReceipts();
        }
        
    } catch (error) {
        console.error("Error saving additional payment:", error);
        alert("Failed to save payment: " + error.message);
    }
}

// =================================================================
//                 NEW FUNCTIONS FOR REQUESTED FEATURES
// =================================================================

/**
 * Revokes a receipt and deletes it from Firestore
 */
async function revokeReceipt(receiptData) {
    if (!confirm(`Are you sure you want to REVOKE receipt ${receiptData.receiptId}?\n\nThis will mark it as invalid and delete it from the system.`)) {
        return;
    }
    
    try {
        // Mark as revoked
        await db.collection("receipts").doc(receiptData.firestoreId).update({
            revoked: true,
            revokedAt: firebase.firestore.FieldValue.serverTimestamp(),
            revokedBy: currentUser.email
        });
        
        // Also delete associated payments
        const paymentsSnapshot = await db.collection("receipt_payments")
            .where("receiptId", "==", receiptData.firestoreId)
            .get();
        
        const deletePromises = [];
        paymentsSnapshot.forEach(doc => {
            deletePromises.push(db.collection("receipt_payments").doc(doc.id).delete());
        });
        
        await Promise.all(deletePromises);
        
        alert(`Receipt ${receiptData.receiptId} has been revoked and associated payments deleted.`);
        
        // Refresh the view
        if (document.getElementById('recent-receipts')) {
            fetchReceipts();
        }
        
    } catch (error) {
        console.error("Error revoking receipt:", error);
        alert("Failed to revoke receipt: " + error.message);
    }
}

/**
 * Creates an additional invoice based on an existing invoice
 */
function createAdditionalInvoice(invoiceData) {
    // Check if invoice is revoked
    if (invoiceData.revoked) {
        alert("Cannot create additional invoice from a revoked invoice.");
        return;
    }
    
    // Navigate to invoice form and pre-populate with existing data
    renderInvoiceForm();
    
    // Auto-populate fields from existing invoice
    setTimeout(() => {
        const docTypeField = document.getElementById('docType');
        const clientNameField = document.getElementById('clientName');
        const clientPhoneField = document.getElementById('clientPhone');
        const exchangeRateField = document.getElementById('exchangeRate');
        const dueDateField = document.getElementById('dueDate');
        const depositPercentageField = document.getElementById('depositPercentage');
        
        const carMakeField = document.getElementById('carMake');
        const carModelField = document.getElementById('carModel');
        const carYearField = document.getElementById('carYear');
        const vinNumberField = document.getElementById('vinNumber');
        const engineCCField = document.getElementById('engineCC');
        const fuelTypeField = document.getElementById('fuelType');
        const transmissionField = document.getElementById('transmission');
        const colorField = document.getElementById('color');
        const mileageField = document.getElementById('mileage');
        const quantityField = document.getElementById('quantity');
        const priceField = document.getElementById('price');
        const goodsDescriptionField = document.getElementById('goodsDescription');
        
        // Pre-populate with existing invoice data
        if (docTypeField) docTypeField.value = invoiceData.docType;
        if (clientNameField) clientNameField.value = invoiceData.clientName;
        if (clientPhoneField) clientPhoneField.value = invoiceData.clientPhone || '';
        if (exchangeRateField) exchangeRateField.value = invoiceData.exchangeRate || 130;
        if (dueDateField) dueDateField.value = invoiceData.dueDate || '';
        if (depositPercentageField) depositPercentageField.value = invoiceData.depositPercentage || 50;
        
        if (carMakeField) carMakeField.value = invoiceData.carDetails.make || '';
        if (carModelField) carModelField.value = invoiceData.carDetails.model || '';
        if (carYearField) carYearField.value = invoiceData.carDetails.year || '';
        if (vinNumberField) vinNumberField.value = invoiceData.carDetails.vin || '';
        if (engineCCField) engineCCField.value = invoiceData.carDetails.cc || '';
        if (fuelTypeField) fuelTypeField.value = invoiceData.carDetails.fuel || '';
        if (transmissionField) transmissionField.value = invoiceData.carDetails.transmission || '';
        if (colorField) colorField.value = invoiceData.carDetails.color || '';
        if (mileageField) mileageField.value = invoiceData.carDetails.mileage || '';
        if (quantityField) quantityField.value = invoiceData.carDetails.quantity || 1;
        if (priceField) priceField.value = invoiceData.carDetails.priceUSD || '';
        if (goodsDescriptionField) goodsDescriptionField.value = invoiceData.carDetails.goodsDescription || '';
        
        // Handle bank selection
        const bankSelect = document.getElementById('bankDetailsSelect');
        if (bankSelect && invoiceData.bankDetails) {
            // Clear existing selections
            for (let i = 0; i < bankSelect.options.length; i++) {
                bankSelect.options[i].selected = false;
            }
            
            // Select the same banks as the original invoice
            if (Array.isArray(invoiceData.bankDetails)) {
                invoiceData.bankDetails.forEach(bank => {
                    for (let i = 0; i < bankSelect.options.length; i++) {
                        try {
                            const optionValue = bankSelect.options[i].value;
                            const decodedValue = optionValue
                                .replace(/&apos;/g, "'")
                                .replace(/&quot;/g, '"')
                                .replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>')
                                .replace(/&amp;/g, '&');
                            
                            const bankData = JSON.parse(decodedValue);
                            if (bankData.id === bank.id) {
                                bankSelect.options[i].selected = true;
                            }
                        } catch (e) {
                            console.error("Error parsing bank option:", e);
                        }
                    }
                });
            }
        }
        
        // Trigger any dependent functions
        if (invoiceData.docType === 'Auction Invoice') {
            toggleAuctionFields();
            const auctionPriceField = document.getElementById('auctionPrice');
            if (auctionPriceField) auctionPriceField.value = invoiceData.auctionPrice || invoiceData.pricing.totalUSD || '';
        }
        
        autoFillBuyerConfirmation();
        
        // Show notification
        setTimeout(() => {
            alert(`Invoice ${invoiceData.invoiceId} data has been loaded. You can now modify and save as a new invoice.`);
        }, 300);
        
    }, 100);
}
