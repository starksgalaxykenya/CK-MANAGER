// =================================================================
//                 0. LOADING ANIMATIONS & UI UTILITIES
// =================================================================

// Modern loading spinner component
function showLoadingOverlay(message = "Processing...") {
    // Remove existing overlay if any
    hideLoadingOverlay();
    
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm';
    overlay.innerHTML = `
        <div class="relative">
            <!-- Outer spinning ring -->
            <div class="w-20 h-20 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin"></div>
            
            <!-- Inner pulsing dot -->
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-8 h-8 bg-primary-blue rounded-full animate-pulse"></div>
            </div>
            
            <!-- Glowing effect -->
            <div class="absolute inset-0 animate-ping opacity-20">
                <div class="w-20 h-20 border-4 border-primary-blue rounded-full"></div>
            </div>
        </div>
        
        <!-- Loading text with fade animation -->
        <p class="mt-6 text-white font-semibold text-lg animate-pulse">${message}</p>
        
        <!-- Optional: Progress dots -->
        <div class="mt-4 flex space-x-2">
            <div class="w-2 h-2 bg-secondary-red rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-secondary-red rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-secondary-red rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    return overlay;
}

function hideLoadingOverlay() {
    const existingOverlay = document.getElementById('loading-overlay');
    if (existingOverlay) {
        // Add fade out animation before removing
        existingOverlay.style.opacity = '0';
        existingOverlay.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
            if (existingOverlay.parentNode) {
                existingOverlay.parentNode.removeChild(existingOverlay);
            }
        }, 300);
    }
}

// Shimmer loading effect for lists
function createShimmerLoader(count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="animate-pulse space-y-3 p-4 border rounded-lg bg-white">
                <div class="flex justify-between items-start">
                    <div class="flex-1 space-y-2">
                        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div class="h-3 bg-gray-100 rounded w-3/4"></div>
                        <div class="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                    <div class="flex flex-col gap-2 ml-4">
                        <div class="h-8 bg-gray-200 rounded-full w-20"></div>
                        <div class="h-8 bg-gray-200 rounded-full w-20"></div>
                    </div>
                </div>
            </div>
        `;
    }
    return html;
}

// Success toast notification
function showSuccessToast(message, duration = 3000) {
    showToast(message, 'success', duration);
}

// Error toast notification
function showErrorToast(message, duration = 5000) {
    showToast(message, 'error', duration);
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
    
    const toast = document.createElement('div');
    toast.className = `custom-toast fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out translate-x-0`;
    
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-secondary-red' : 
                   'bg-primary-blue';
    
    toast.innerHTML = `
        <div class="${bgColor} text-white p-4 rounded-lg shadow-2xl flex items-center space-x-3 animate-fade-in">
            <div class="flex-shrink-0">
                ${type === 'success' ? 
                    '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : 
                    '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'}
            </div>
            <div class="flex-1">
                <p class="font-semibold">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }
    }, duration);
}

// Add CSS for animations
function addAnimationStyles() {
    if (!document.getElementById('animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes shimmer {
                0% { background-position: -200px 0; }
                100% { background-position: calc(200px + 100%) 0; }
            }
            
            .animate-fade-in {
                animation: fade-in 0.3s ease-out;
            }
            
            .shimmer {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200px 100%;
                animation: shimmer 1.5s infinite;
            }
            
            /* Custom bounce animation for dots */
            @keyframes custom-bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            .animate-bounce {
                animation: custom-bounce 0.6s infinite;
            }
        `;
        document.head.appendChild(style);
    }
}

// =================================================================
//                 SECRET BACKDATING FEATURE
// =================================================================

// Global variables for backdating
let backdateMode = false;
let backdateDate = null;
let backdateButton = null;
let backdatePanel = null;
let backdateIndicator = null;

// Initialize secret backdating feature
function initBackdateFeature() {
    // Create secret feature elements
    createBackdateElements();
    
    // Listen for secret key combination (Ctrl+Shift+D)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            toggleBackdatePanel();
        }
    });
    
    // Listen for clicks outside the panel
    document.addEventListener('click', function(e) {
        if (backdatePanel && backdatePanel.style.display === 'block') {
            if (!backdatePanel.contains(e.target) && e.target !== backdateButton) {
                hideBackdatePanel();
            }
        }
    });
}

// Create the secret feature UI elements
function createBackdateElements() {
    // Create toggle button
    backdateButton = document.createElement('div');
    backdateButton.className = 'backdate-toggle-btn';
    backdateButton.innerHTML = '⚡ BACKDATE MODE ⚡';
    backdateButton.onclick = toggleBackdatePanel;
    document.body.appendChild(backdateButton);
    
    // Create indicator
    backdateIndicator = document.createElement('div');
    backdateIndicator.className = 'secret-feature-indicator';
    backdateIndicator.innerHTML = '⚡ BACKDATE ACTIVE ⚡';
    document.body.appendChild(backdateIndicator);
    
    // Create panel
    backdatePanel = document.createElement('div');
    backdatePanel.className = 'backdate-panel';
    backdatePanel.innerHTML = `
        <button class="close-btn" onclick="hideBackdatePanel()">&times;</button>
        <h3>⚡ SECRET BACKDATE FEATURE ⚡</h3>
        <div class="form-group">
            <label>Backdate Date</label>
            <input type="date" id="backdate-date-input" class="backdate-input" value="${new Date().toISOString().slice(0, 10)}">
        </div>
        <div class="form-group">
            <label>Time (Optional)</label>
            <input type="time" id="backdate-time-input" class="backdate-input" value="09:00">
        </div>
        <div class="button-group">
            <button class="apply-btn" onclick="applyBackdate()">APPLY BACKDATE</button>
            <button class="clear-btn" onclick="clearBackdate()">CLEAR</button>
        </div>
        <p style="font-size: 11px; color: #666; text-align: center; margin-top: 15px;">
            All documents created will use this date<br>
            <span style="color: #ffd700; font-weight: bold;">Ctrl+Shift+D</span> to toggle
        </p>
    `;
    document.body.appendChild(backdatePanel);
}

// Toggle the backdate panel
function toggleBackdatePanel() {
    if (!backdatePanel) return;
    
    if (backdatePanel.style.display === 'block') {
        hideBackdatePanel();
    } else {
        showBackdatePanel();
    }
}

// Show the backdate panel
function showBackdatePanel() {
    if (backdatePanel) {
        backdatePanel.style.display = 'block';
        
        // Set current backdate in input if exists
        if (backdateDate) {
            const dateInput = document.getElementById('backdate-date-input');
            if (dateInput) {
                dateInput.value = backdateDate.toISOString().slice(0, 10);
            }
        }
    }
}

// Hide the backdate panel
function hideBackdatePanel() {
    if (backdatePanel) {
        backdatePanel.style.display = 'none';
    }
}

// Apply backdate
function applyBackdate() {
    const dateInput = document.getElementById('backdate-date-input');
    const timeInput = document.getElementById('backdate-time-input');
    
    if (!dateInput || !dateInput.value) {
        showErrorToast('Please select a backdate');
        return;
    }
    
    const dateStr = dateInput.value;
    const timeStr = timeInput.value || '09:00';
    
    // Create date object
    backdateDate = new Date(`${dateStr}T${timeStr}:00`);
    
    // Activate backdate mode
    backdateMode = true;
    
    // Update UI
    if (backdateButton) {
        backdateButton.classList.add('visible');
        backdateButton.style.background = '#ffd700';
        backdateButton.style.color = '#183263';
        backdateButton.innerHTML = '⚡ BACKDATE ACTIVE ⚡';
    }
    
    if (backdateIndicator) {
        backdateIndicator.classList.add('visible');
    }
    
    // Highlight all date fields
    highlightDateFields(true);
    
    hideBackdatePanel();
    showSuccessToast(`Backdate activated: ${formatBackdateDate(backdateDate)}`);
}

// Clear backdate
function clearBackdate() {
    backdateMode = false;
    backdateDate = null;
    
    // Update UI
    if (backdateButton) {
        backdateButton.classList.remove('visible');
        backdateButton.style.background = '#183263';
        backdateButton.style.color = 'white';
        backdateButton.innerHTML = '⚡ BACKDATE MODE ⚡';
    }
    
    if (backdateIndicator) {
        backdateIndicator.classList.remove('visible');
    }
    
    // Remove highlights
    highlightDateFields(false);
    
    hideBackdatePanel();
    showSuccessToast('Backdate deactivated - using current date');
}

// Helper function to format backdate date
function formatBackdateDate(date) {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Highlight all date fields when backdate is active
function highlightDateFields(active) {
    const dateFields = document.querySelectorAll('input[type="date"]');
    dateFields.forEach(field => {
        if (active) {
            field.classList.add('backdate-active');
            // Add backdate badge
            const parent = field.parentElement;
            if (parent && !parent.querySelector('.backdate-badge')) {
                const badge = document.createElement('span');
                badge.className = 'backdate-badge';
                badge.innerHTML = 'BACKDATED';
                parent.style.position = 'relative';
                badge.style.position = 'absolute';
                badge.style.right = '10px';
                badge.style.top = '50%';
                badge.style.transform = 'translateY(-50%)';
                parent.appendChild(badge);
            }
        } else {
            field.classList.remove('backdate-active');
            // Remove backdate badge
            const badge = field.parentElement?.querySelector('.backdate-badge');
            if (badge) badge.remove();
        }
    });
}

// Override date functions for receipts and invoices
function getCurrentDateForDocument() {
    if (backdateMode && backdateDate) {
        return backdateDate.toLocaleDateString('en-US');
    }
    return new Date().toLocaleDateString('en-US');
}

function getCurrentDateForStamp() {
    if (backdateMode && backdateDate) {
        return backdateDate.toLocaleDateString('en-US');
    }
    return new Date().toLocaleDateString('en-US');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initBackdateFeature, 1000);
});

// Initialize animation styles when DOM is ready
document.addEventListener('DOMContentLoaded', addAnimationStyles);

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
                <button type="submit" id="login-button" class="w-full bg-primary-blue hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <svg id="login-spinner" class="hidden w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </button>
            </form>
        </div>
    `;
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Show loading state on button
    const loginButton = document.getElementById('login-button');
    const loginSpinner = document.getElementById('login-spinner');
    
    if (loginButton && loginSpinner) {
        loginButton.disabled = true;
        loginSpinner.classList.remove('hidden');
        loginButton.innerHTML = '<span>Signing In...</span>' + loginSpinner.outerHTML;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Success will be handled by authStateChanged
    } catch (error) {
        console.error("Login failed:", error.message);
        showErrorToast("Login Failed: " + error.message);
        
        // Reset button state
        if (loginButton && loginSpinner) {
            loginButton.disabled = false;
            loginSpinner.classList.add('hidden');
            loginButton.innerHTML = '<span>Sign In</span>' + loginSpinner.outerHTML;
        }
    }
}

function handleLogout() {
    const loadingOverlay = showLoadingOverlay("Logging out...");
    setTimeout(() => {
        auth.signOut();
        hideLoadingOverlay();
        showSuccessToast("Logged out successfully");
    }, 500);
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
        showErrorToast("Please enter a search term");
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
        showErrorToast("Error: Unable to perform search. Please try again.");
        return;
    }
    
    // Show loading state with shimmer effect
    resultsList.innerHTML = createShimmerLoader(3);
    searchResultsDiv.classList.remove('hidden');
    docCreationArea.classList.add('hidden');
    
    let allResults = [];
    
    try {
        // Show loading overlay for search
        const searchOverlay = showLoadingOverlay("Searching documents...");
        
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
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        // Display results
        if (resultsList) {
            displaySearchResults(allResults, searchTerm);
        }
        
        // Show success message
        if (allResults.length > 0) {
            showSuccessToast(`Found ${allResults.length} documents`);
        }
        
    } catch (error) {
        console.error("Error searching documents:", error);
        hideLoadingOverlay();
        
        if (resultsList) {
            resultsList.innerHTML = `
                <div class="text-center p-8 bg-red-50 rounded-lg border border-red-200 animate-fade-in">
                    <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-red-600 font-semibold mb-2">Search Error</p>
                    <p class="text-sm text-gray-600">${error.message}</p>
                    <button onclick="clearSearch()" class="mt-4 bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md transition duration-150">
                        Return to Document Generator
                    </button>
                </div>
            `;
        }
        showErrorToast("Error searching documents. Please try again.");
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
            <div class="text-center p-8 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-gray-600 mb-2">No documents found for</p>
                <p class="font-semibold text-primary-blue text-lg mb-1">"${searchTerm}"</p>
                <p class="text-sm text-gray-500 mt-2">Try searching with different terms</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="mb-6 p-4 bg-gradient-to-r from-primary-blue/5 to-blue-50 rounded-lg border border-primary-blue/20 animate-fade-in">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-600">Found <span class="font-bold text-primary-blue text-xl">${results.length}</span> documents for</p>
                    <p class="font-semibold text-lg text-primary-blue">"${searchTerm}"</p>
                </div>
                <div class="bg-primary-blue text-white text-xs font-bold px-3 py-1 rounded-full">
                    ${results.length} Results
                </div>
            </div>
        </div>
    `;
    
    results.forEach((doc, index) => {
        // Add delay for staggered animation
        const animationDelay = index * 50;
        
        const docJson = JSON.stringify({
            ...doc,
            firestoreId: doc.id,
            createdAt: doc.createdAt ? (doc.createdAt.toDate ? doc.createdAt.toDate().toISOString() : doc.createdAt) : new Date().toISOString()
        });
        
        let resultHtml = '';
        if (doc.type === 'receipt') {
            resultHtml = renderReceiptSearchResult(doc, docJson);
        } else if (doc.type === 'invoice') {
            resultHtml = renderInvoiceSearchResult(doc, docJson);
        } else if (doc.type === 'agreement') {
            resultHtml = renderAgreementSearchResult(doc, docJson);
        }
        
        // Wrap each result with animation
        html += `
            <div class="animate-fade-in" style="animation-delay: ${animationDelay}ms">
                ${resultHtml}
            </div>
        `;
    });
    
    resultsList.innerHTML = html;
}

/**
 * Renders a receipt search result card
 */
function renderReceiptSearchResult(doc, docJson) {
    const date = doc.receiptDate || (doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : 'N/A');
    
    return `
        <div class="p-4 border border-secondary-red/30 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-secondary-red/50 group">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-gradient-to-r from-secondary-red to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" clip-rule="evenodd"/></svg>
                            RECEIPT
                        </span>
                        <span class="text-sm text-gray-500">${date}</span>
                    </div>
                    <h4 class="font-bold text-gray-800 text-lg mb-1">${doc.receiptId}</h4>
                    <p class="text-sm text-gray-700 mb-1"><strong>From:</strong> ${doc.receivedFrom}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>For:</strong> ${doc.beingPaidFor || 'N/A'}</p>
                    <div class="flex items-center gap-4 mt-2">
                        <span class="text-sm font-bold text-secondary-red">
                            ${doc.currency} ${doc.amountReceived?.toFixed(2) || '0.00'}
                        </span>
                        ${doc.invoiceReference ? `
                            <span class="text-xs bg-blue-50 text-primary-blue px-2 py-1 rounded">
                                Invoice: ${doc.invoiceReference}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                    <button onclick='reDownloadReceipt(${docJson})' 
                            class="bg-secondary-red hover:bg-red-700 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download
                    </button>
                    ${!doc.revoked ? `
                    <button onclick='addPaymentToReceipt(${docJson})' 
                            class="bg-primary-blue hover:bg-blue-700 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add Payment
                    </button>
                    <button onclick='viewReceiptBalances(${docJson})' 
                            class="bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Balances
                    </button>
                    <button onclick='createAgreementFromReceipt(${docJson})' 
                            class="bg-gray-700 hover:bg-gray-900 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Agreement
                    </button>
                    <button onclick='revokeReceipt(${docJson})' 
                            class="bg-red-600 hover:bg-red-800 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        REVOKE
                    </button>
                    ` : ''}
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
    const docTypeColor = doc.docType === 'Auction Invoice' ? 'bg-yellow-500' : 'bg-primary-blue';
    
    return `
        <div class="p-4 border border-primary-blue/30 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-primary-blue/50 group">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="${docTypeColor} text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5z" clip-rule="evenodd"/></svg>
                            ${doc.docType || 'INVOICE'}
                        </span>
                        <span class="text-sm text-gray-500">${date}</span>
                    </div>
                    <h4 class="font-bold text-gray-800 text-lg mb-1">${doc.invoiceId}</h4>
                    <p class="text-sm text-gray-700 mb-1"><strong>Client:</strong> ${doc.clientName}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>Vehicle:</strong> ${doc.carDetails?.make || ''} ${doc.carDetails?.model || ''} ${doc.carDetails?.year || ''}</p>
                    <div class="flex items-center gap-4 mt-2">
                        <span class="text-sm font-bold text-primary-blue">
                            USD ${doc.pricing?.totalUSD?.toFixed(2) || '0.00'}
                        </span>
                        <span class="text-xs text-gray-500">${doc.clientPhone || 'N/A'}</span>
                    </div>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                    <button onclick='reDownloadInvoice(${docJson})' 
                            class="bg-primary-blue hover:bg-blue-700 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download
                    </button>
                    ${!doc.revoked ? `
                    <button onclick='createReceiptFromInvoice(${docJson})' 
                            class="bg-secondary-red hover:bg-red-700 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Create Receipt
                    </button>
                    ${!doc.pricing?.depositPaid ? `
                    <button onclick='markInvoiceDepositPaid(${docJson})' 
                            class="bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Deposit Paid
                    </button>
                    ` : ''}
                    <button onclick='createAdditionalInvoice(${docJson})' 
                            class="bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Invoice
                    </button>
                    <button onclick='revokeInvoice(${docJson})' 
                            class="bg-red-600 hover:bg-red-800 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        REVOKE
                    </button>
                    ` : `
                    <button onclick='unrevokeInvoice(${docJson})' 
                            class="bg-gray-600 hover:bg-gray-800 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        UNREVOKE
                    </button>
                    `}
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
        <div class="p-4 border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-gray-400 group">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z" clip-rule="evenodd"/></svg>
                            AGREEMENT
                        </span>
                        <span class="text-sm text-gray-500">${date}</span>
                    </div>
                    <h4 class="font-bold text-gray-800 text-lg mb-1">Agreement #${doc.id.substring(0, 8)}...</h4>
                    <p class="text-sm text-gray-700 mb-1"><strong>Buyer:</strong> ${doc.buyer?.name || 'N/A'}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>Vehicle:</strong> ${doc.vehicle?.makeModel || 'N/A'}</p>
                    <div class="flex items-center gap-4 mt-2">
                        <span class="text-sm font-bold text-gray-700">
                            ${doc.salesTerms?.currency || 'KES'} ${doc.salesTerms?.price?.toFixed(2) || '0.00'}
                        </span>
                        <span class="text-xs text-gray-500">${doc.buyer?.phone || 'N/A'}</span>
                    </div>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                    <button onclick='reDownloadAgreement(${docJson})' 
                            class="bg-gray-700 hover:bg-gray-800 text-white text-xs py-2 px-4 rounded-full transition-all duration-150 flex items-center gap-1 group-hover:scale-105">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
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
    
    if (searchResultsDiv) {
        searchResultsDiv.style.opacity = '0';
        searchResultsDiv.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
            searchResultsDiv.classList.add('hidden');
            searchResultsDiv.style.opacity = '1';
        }, 300);
    }
    
    if (docCreationArea) {
        docCreationArea.classList.remove('hidden');
        docCreationArea.style.animation = 'fade-in 0.3s ease-out';
    }
    
    showSuccessToast("Search cleared");
}

// Add event listener for Enter key in search
document.addEventListener('DOMContentLoaded', function() {
    function setupSearchEnterKey() {
        const searchInput = document.getElementById('document-search');
        if (searchInput) {
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
            <h2 class="text-3xl font-bold mb-6 text-primary-blue animate-fade-in">Document Generator</h2>
            
            <!-- Search and Filter Section -->
            <div class="mb-6 p-4 bg-white rounded-xl shadow-md border border-gray-200 animate-fade-in" style="animation-delay: 100ms">
                <div class="flex flex-wrap gap-4 items-end">
                    <div class="flex-1 min-w-[300px]">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Search Documents</label>
                        <div class="flex gap-2">
                            <input type="text" id="document-search" placeholder="Search by client name, reference number, or car make/model..." class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue transition duration-200">
                            <button onclick="searchDocuments()" class="bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-lg transition duration-150 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                Search
                            </button>
                            <button onclick="clearSearch()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                Clear
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                        <select id="document-type-filter" class="p-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue transition duration-200">
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

            <div class="flex space-x-4 mb-6 flex-wrap animate-fade-in" style="animation-delay: 200ms">
                <button onclick="renderInvoiceForm()" class="bg-primary-blue hover:bg-blue-900 text-white p-3 rounded-lg transition duration-150 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Invoice/Proforma
                </button>
                <button onclick="renderInvoiceHistory()" class="bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-lg transition duration-150 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Invoice History
                </button>
                <button onclick="renderReceiptForm()" class="bg-secondary-red hover:bg-red-700 text-white p-3 rounded-lg transition duration-150 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Payment Receipt
                </button>
                <button onclick="renderAgreementForm()" class="bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-lg transition duration-150 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Car Sales Agreement
                </button>
                <button onclick="renderBankManagement()" class="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition duration-150 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    BANKS
                </button>
            </div>
            
            <div id="document-form-area" class="animate-fade-in" style="animation-delay: 300ms">
                <div id="search-results" class="hidden">
                    <h3 class="text-xl font-bold mb-4 text-primary-blue">Search Results</h3>
                    <div id="search-results-list" class="space-y-4">
                        <!-- Search results will appear here -->
                    </div>
                </div>
                <div id="document-creation-area">
                    <div class="text-center p-8 bg-gradient-to-r from-primary-blue/5 to-blue-50 rounded-xl border border-dashed border-primary-blue/30">
                        <svg class="w-16 h-16 text-primary-blue/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p class="text-gray-600 text-lg">Select a document type or manage bank accounts</p>
                        <p class="text-sm text-gray-500 mt-2">Create invoices, receipts, agreements, or search existing documents</p>
                    </div>
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
        <h2 class="text-4xl font-extrabold mb-8 text-primary-blue animate-fade-in">CDMS Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${createDashboardCard('Document Generator', 'Invoices, Receipts, Agreements', 'bg-gradient-to-br from-green-50 to-green-100 border-green-400', 'handleDocumentGenerator', 0)}
            ${createDashboardCard('Fleet Management', 'Car Tracking, Clearing, ETA', 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400', 'handleFleetManagement', 100)}
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

function createDashboardCard(title, subtitle, colorClass, handler, delay = 0) {
    return `
        <div class="${colorClass} border-2 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 transform animate-fade-in" 
             onclick="${handler}()" 
             style="animation-delay: ${delay}ms">
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm mr-4">
                    ${title.includes('Document') ? 
                        '<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' :
                        '<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>'}
                </div>
                <h3 class="text-2xl font-bold text-gray-800">${title}</h3>
            </div>
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
        <h2 class="text-3xl font-bold mb-6 text-primary-blue animate-fade-in">Document Generator</h2>
        
        <!-- Search and Filter Section -->
        <div class="mb-6 p-4 bg-white rounded-xl shadow-md border border-gray-200 animate-fade-in" style="animation-delay: 100ms">
            <div class="flex flex-wrap gap-4 items-end">
                <div class="flex-1 min-w-[300px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Search Documents</label>
                    <div class="flex gap-2">
                        <input type="text" id="document-search" placeholder="Search by client name, reference number, or car make/model..." class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue transition duration-200">
                        <button onclick="searchDocuments()" class="bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-lg transition duration-150 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            Search
                        </button>
                        <button onclick="clearSearch()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            Clear
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <select id="document-type-filter" class="p-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue transition duration-200">
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

        <div class="flex space-x-4 mb-6 flex-wrap animate-fade-in" style="animation-delay: 200ms">
            <button onclick="renderInvoiceForm()" class="bg-primary-blue hover:bg-blue-900 text-white p-3 rounded-lg transition duration-150 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Invoice/Proforma
            </button>
            <button onclick="renderInvoiceHistory()" class="bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-lg transition duration-150 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Invoice History
            </button>
            <button onclick="renderReceiptForm()" class="bg-secondary-red hover:bg-red-700 text-white p-3 rounded-lg transition duration-150 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Payment Receipt
            </button>
            <button onclick="renderAgreementForm()" class="bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-lg transition duration-150 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Car Sales Agreement
            </button>
            <button onclick="renderBankManagement()" class="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition duration-150 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                BANKS
            </button>
        </div>
        
        <div id="document-form-area" class="animate-fade-in" style="animation-delay: 300ms">
            <div id="search-results" class="hidden">
                <h3 class="text-xl font-bold mb-4 text-primary-blue">Search Results</h3>
                <div id="search-results-list" class="space-y-4">
                    <!-- Search results will appear here -->
                </div>
            </div>
            <div id="document-creation-area">
                <div class="text-center p-8 bg-gradient-to-r from-primary-blue/5 to-blue-50 rounded-xl border border-dashed border-primary-blue/30">
                    <svg class="w-16 h-16 text-primary-blue/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="text-gray-600 text-lg">Select a document type or manage bank accounts</p>
                    <p class="text-sm text-gray-500 mt-2">Create invoices, receipts, agreements, or search existing documents</p>
                </div>
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div class="p-6 border border-secondary-red rounded-xl bg-white shadow-md animate-fade-in" style="animation-delay: 100ms">
                <h3 class="text-xl font-semibold mb-4 text-secondary-red">New Payment Receipt</h3>
                <form id="receipt-form" onsubmit="event.preventDefault(); saveReceipt()">
                    
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <select id="receiptType" required class="block w-full p-2 border rounded-md transition duration-200">
                            <option value="" disabled selected>Select Receipt Type</option>
                            <option value="Auction Imports">Auction Imports</option>
                            <option value="BeForward">BeForward</option>
                            <option value="Local Sales">Local Sales</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="text" id="receivedFrom" required placeholder="Received From (Customer Name)" class="block w-full p-2 border rounded-md transition duration-200">
                    </div>

                    <div class="mb-4">
                        <label for="invoiceReference" class="block text-gray-700 font-medium mb-1">Invoice Reference (Optional)</label>
                        <div class="flex gap-2">
                            <input type="text" id="invoiceReference" placeholder="Enter Invoice Number" value="${invoiceReference}" class="flex-1 p-2 border rounded-md transition duration-200">
                            <button type="button" onclick="fetchInvoiceDetails()" class="bg-primary-blue hover:bg-blue-900 text-white px-3 py-2 rounded-md text-sm transition duration-150 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                Fetch Invoice
                            </button>
                        </div>
                    </div>

                    <div id="invoice-details" class="hidden mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
                        <h4 class="font-bold text-primary-blue mb-2">Invoice Details:</h4>
                        <p id="invoice-client" class="text-sm"></p>
                        <p id="invoice-vehicle" class="text-sm"></p>
                        <p id="invoice-total" class="text-sm"></p>
                        <p id="invoice-deposit" class="text-sm"></p>
                        <p id="invoice-balance" class="text-sm"></p>
                        <p id="invoice-rate" class="text-sm"></p>
                    </div>

                    <!-- NEW SECTION FOR MANUAL TOTAL PAYMENT INPUT -->
                    <div id="manual-total-section" class="hidden mb-4 p-3 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                        <h4 class="font-bold text-green-700 mb-2">Total Payment Information (For receipts without invoice)</h4>
                        <div class="grid grid-cols-2 gap-3 mb-2">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Total Payment Amount</label>
                                <input type="number" id="manualTotalAmount" step="0.01" placeholder="0.00" class="w-full p-2 border rounded-md transition duration-200" oninput="updateManualBalanceCalculation()">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Currency</label>
                                <select id="manualTotalCurrency" class="w-full p-2 border rounded-md transition duration-200" onchange="updateManualBalanceCalculation()">
                                    <option value="KSH">KSH</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                        </div>
                        <p id="manual-total-display" class="text-sm text-gray-600"></p>
                        <button type="button" onclick="applyManualTotalToBalances()" class="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-md transition duration-150 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Apply to Balance Calculation
                        </button>
                    </div>

                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Amount Received</legend>
                        <div class="grid grid-cols-3 gap-3">
                            <select id="currency" required class="p-2 border rounded-md transition duration-200">
                                <option value="KSH">KSH</option>
                                <option value="USD">USD</option>
                            </select>
                            <input type="number" id="amountReceived" step="0.01" required placeholder="Amount Figure" class="p-2 border rounded-md col-span-2 transition duration-200" oninput="updateAmountInWords(); checkForManualTotal();">
                        </div>
                        <div class="mt-2">
                            <label for="amountWords" class="block text-sm font-medium text-gray-700">Amount in Words:</label>
                            <textarea id="amountWords" rows="2" readonly class="mt-1 block w-full p-2 border rounded-md bg-gray-100 text-gray-800 transition duration-200"></textarea>
                        </div>
                    </fieldset>

                    <!-- ADD BUTTON TO OPEN MANUAL TOTAL SECTION -->
                    <div class="mb-4">
                        <button type="button" onclick="toggleManualTotalSection()" class="text-primary-blue hover:text-blue-900 text-sm underline transition duration-150">
                            + Add total payment information (for receipts without invoice)
                        </button>
                    </div>

                    <input type="text" id="beingPaidFor" required placeholder="Being Paid For (e.g., Toyota Vitz 2018 Deposit)" value="${invoiceReference}" class="mb-4 block w-full p-2 border rounded-md transition duration-200">

                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Payment Details</legend>
                        <div class="mb-3">
                            <label for="exchangeRate" class="block text-sm font-medium text-gray-700">Exchange Rate (USD 1 = KES)</label>
                            <input type="number" id="exchangeRate" step="0.01" value="130.00" required class="w-full p-2 border rounded-md transition duration-200">
                        </div>
                        <div class="mb-3">
                            <label for="bankUsed" class="block text-sm font-medium text-gray-700">Bank Used</label>
                            <select id="bankUsed" required class="w-full p-2 border rounded-md transition duration-200">
                                <option value="" disabled selected>Select Bank</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" id="chequeNo" placeholder="Cheque No. (Optional)" class="p-2 border rounded-md transition duration-200">
                            <input type="text" id="rtgsTtNo" placeholder="RTGS/TT No. (Optional)" class="p-2 border rounded-md transition duration-200">
                        </div>
                    </fieldset>

                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <input type="number" id="balanceRemaining" step="0.01" placeholder="Balance Remaining (Auto-calculated)" readonly class="block w-full p-2 border rounded-md bg-gray-100">
                        <input type="date" id="balanceDueDate" placeholder="To be paid on or before" class="block w-full p-2 border rounded-md transition duration-200">
                    </div>

                    <div class="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 class="font-bold text-secondary-red mb-2">Auto-Calculated Balances:</h4>
                        <p id="calculated-balance-kes" class="text-sm">KES Balance: --</p>
                        <p id="calculated-balance-usd" class="text-sm">USD Balance: --</p>
                    </div>

                    <button type="submit" id="save-receipt-btn" class="w-full bg-secondary-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-150 flex items-center justify-center gap-2">
                        <span>Generate & Save Receipt</span>
                        <svg id="receipt-spinner" class="hidden w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </button>
                </form>
            </div>

            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md animate-fade-in" style="animation-delay: 200ms">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Recent Receipts</h3>
                <div class="mb-4">
                    <button onclick="renderReceiptBalancesView()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-150 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        View All Receipt Balances
                    </button>
                </div>
                <div id="recent-receipts">
                    ${createShimmerLoader(2)}
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
        showErrorToast("You already have an invoice reference. Remove it first to use manual total payment.");
        return;
    }
    
    manualSection.classList.toggle('hidden');
    if (!manualSection.classList.contains('hidden')) {
        manualSection.style.animation = 'fade-in 0.3s ease-out';
    }
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
            suggestion.className = 'mb-3 p-2 bg-yellow-50 rounded text-sm text-yellow-700 animate-fade-in';
            suggestion.innerHTML = `
                <p>No invoice reference provided. Consider adding total payment amount for accurate balance calculation.</p>
                <button type="button" onclick="toggleManualTotalSection()" class="mt-1 text-blue-600 hover:text-blue-800 underline transition duration-150">
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
        showErrorToast("Please enter a valid total payment amount");
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
    
    showSuccessToast(`Total payment of ${manualCurrency} ${manualTotal.toFixed(2)} applied. Balance calculations will now use this total.`);
}

/**
 * Populates the bank dropdown in receipt form with saved banks
 */
async function populateBankDropdownForReceipt() {
    const bankSelect = document.getElementById('bankUsed');
    if (!bankSelect) return;

    // Show loading state in dropdown
    bankSelect.innerHTML = '<option value="" disabled selected>Loading banks...</option>';

    try {
        const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
        
        // Clear existing options
        bankSelect.innerHTML = '<option value="" disabled selected>Select Bank</option>';
        
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

        // Add cash option
        const cashOption = document.createElement('option');
        cashOption.value = "Cash";
        cashOption.textContent = "Cash";
        bankSelect.appendChild(cashOption);

    } catch (error) {
        console.error("Error loading banks for receipt:", error);
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Error loading banks";
        option.disabled = true;
        bankSelect.innerHTML = '';
        bankSelect.appendChild(option);
    }
}

/**
 * Fetches invoice details and auto-populates receipt form
 */
async function fetchInvoiceDetails() {
    const invoiceRef = document.getElementById('invoiceReference').value;
    if (!invoiceRef) {
        showErrorToast("Please enter an invoice reference number");
        return;
    }
    
    // Show loading state
    const detailsDiv = document.getElementById('invoice-details');
    detailsDiv.classList.remove('hidden');
    detailsDiv.innerHTML = `
        <div class="flex items-center justify-center p-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-blue"></div>
            <span class="ml-2 text-sm text-gray-600">Fetching invoice details...</span>
        </div>
    `;
    
    const invoiceDetails = await fetchInvoiceAmount(invoiceRef);
    
    if (!invoiceDetails) {
        detailsDiv.innerHTML = `
            <div class="text-center p-2">
                <svg class="w-6 h-6 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <p class="text-sm text-red-600">Invoice not found</p>
            </div>
        `;
        return;
    }
    
    // Populate invoice details
    detailsDiv.innerHTML = `
        <h4 class="font-bold text-primary-blue mb-2">Invoice Details:</h4>
        <p id="invoice-client" class="text-sm"><strong>Client:</strong> ${invoiceDetails.clientName}</p>
        <p id="invoice-vehicle" class="text-sm"><strong>Vehicle:</strong> ${invoiceDetails.vehicleInfo}</p>
        <p id="invoice-total" class="text-sm"><strong>Total Price:</strong> USD ${invoiceDetails.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        <p id="invoice-deposit" class="text-sm"><strong>Deposit Required:</strong> USD ${invoiceDetails.depositUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} (KES ${parseFloat(invoiceDetails.depositKSH).toLocaleString('en-US', { minimumFractionDigits: 2 })})</p>
        <p id="invoice-balance" class="text-sm"><strong>Balance Due:</strong> USD ${invoiceDetails.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        <p id="invoice-rate" class="text-sm"><strong>Exchange Rate:</strong> USD 1 = KES ${invoiceDetails.exchangeRate}</p>
    `;
    detailsDiv.style.animation = 'fade-in 0.3s ease-out';
    
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
    
    showSuccessToast("Invoice details loaded successfully");
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
        
        balanceKES.textContent = `KES Balance: ${remainingKSH.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Paid: ${totalPaidKSH.toLocaleString('en-US', { minimumFractionDigits: 2 })})`;
        balanceUSD.textContent = `USD Balance: ${remainingUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Paid: ${totalPaidUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })})`;
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
    
    // Show loading state
    const saveButton = document.getElementById('save-receipt-btn');
    const spinner = document.getElementById('receipt-spinner');
    if (saveButton && spinner) {
        saveButton.disabled = true;
        spinner.classList.remove('hidden');
        saveButton.innerHTML = `<span>Saving Receipt...</span>${spinner.outerHTML}`;
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
        showErrorToast("Please enter a valid amount received.");
        resetSaveButton();
        return;
    }

    const receiptId = generateReceiptId(receiptType, receivedFrom);
    // Use backdated date if active
const receiptDate = getCurrentDateForDocument();

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
            
            resetSaveButton();
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
        
        showSuccessToast(`Receipt ${receiptId} saved successfully!`);
        
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
        
        // Reset button
        resetSaveButton();
        
        // Generate PDF
        generateReceiptPDF(receiptData);
        
        // Reset form
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
        showErrorToast("Failed to save receipt: " + error.message);
        resetSaveButton();
    }
}

// Helper function to reset save button state
function resetSaveButton() {
    const saveButton = document.getElementById('save-receipt-btn');
    const spinner = document.getElementById('receipt-spinner');
    if (saveButton && spinner) {
        saveButton.disabled = false;
        spinner.classList.add('hidden');
        saveButton.innerHTML = `<span>Generate & Save Receipt</span>${spinner.outerHTML}`;
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
        
        showSuccessToast(`Additional payment of ${currency} ${amount.toFixed(2)} added to receipt ${receiptNumber} successfully!`);
        
        return true;
    } catch (error) {
        console.error("Error saving additional payment:", error);
        showErrorToast("Failed to save payment: " + error.message);
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
            receiptList.innerHTML = `
                <div class="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="text-gray-500">No recent receipts found.</p>
                </div>
            `;
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
            
            html += `<li class="p-3 border rounded-lg ${isRevoked ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} flex flex-col sm:flex-row justify-between items-start sm:items-center animate-fade-in">
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
                                    class="bg-secondary-red hover:bg-red-600 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                PDF
                            </button>
                            ${!isRevoked ? `
                            <button onclick='addPaymentToReceipt(${receiptDataJson})' 
                                    class="bg-primary-blue hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add Payment
                            </button>
                            ` : ''}
                            <button onclick='viewReceiptPaymentDetails("${doc.id}", "${data.receiptId}", "${data.receivedFrom}")' 
                                    class="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                                History
                            </button>
                            ${!isRevoked ? `
                            <button onclick='revokeReceipt(${receiptDataJson})' 
                                    class="bg-red-600 hover:bg-red-800 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
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
        receiptList.innerHTML = `
            <div class="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 font-semibold">Error loading receipts</p>
                <p class="text-xs text-gray-600 mt-1">${error.message}</p>
            </div>
        `;
    }
}

/**
 * View detailed payment history for a specific receipt
 */
async function viewReceiptPaymentDetails(receiptDocId, receiptNumber, clientName) {
    // Show loading overlay
    const loadingOverlay = showLoadingOverlay("Loading payment history...");
    
    const balances = await calculateReceiptBalances(receiptDocId);
    
    // Hide loading overlay
    hideLoadingOverlay();
    
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
            paymentDetailsHtml += `<tr class="hover:bg-gray-50 transition duration-150">
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
        paymentDetailsHtml += `<div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h5 class="font-bold text-primary-blue mb-2">Payment Summary</h5>
            <p class="text-sm">Total Payments: ${balances.payments.length}</p>
            <p class="text-sm">Total Paid (USD): <span class="font-bold">${balances.totalPaidUSD.toFixed(2)}</span></p>
            <p class="text-sm">Total Paid (KES): <span class="font-bold">${balances.totalPaidKSH.toFixed(2)}</span></p>
        </div>`;
    }
    
    const modalHtml = `
        <div id="payment-details-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white animate-fade-in">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-primary-blue">Payment Details - ${receiptNumber}</h3>
                    <div class="flex space-x-2">
                        <button onclick='downloadReceiptWithHistory("${receiptDocId}")' 
                                class="bg-secondary-red hover:bg-red-700 text-white text-xs py-1 px-3 rounded-md transition duration-150 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            Download with History
                        </button>
                        <button onclick="document.getElementById('payment-details-modal').remove()" class="text-gray-500 hover:text-gray-700 transition duration-150">
                            &times;
                        </button>
                    </div>
                </div>
                ${paymentDetailsHtml}
                <div class="mt-4 flex justify-end">
                    <button onclick="document.getElementById('payment-details-modal').remove()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-150">
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
        // Show loading overlay
        const loadingOverlay = showLoadingOverlay("Preparing receipt with history...");
        
        // Get receipt data
        const receiptDoc = await db.collection("receipts").doc(receiptDocId).get();
        if (!receiptDoc.exists) {
            hideLoadingOverlay();
            showErrorToast("Receipt not found!");
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
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        // Generate enhanced PDF
        generateReceiptPDF(receiptData);
        
    } catch (error) {
        console.error("Error downloading receipt with history:", error);
        hideLoadingOverlay();
        showErrorToast("Failed to download receipt with history: " + error.message);
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

    bankSelect.innerHTML = '<option value="" disabled selected>Loading banks...</option>';

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
            .replace(/'/g, '&apos;')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
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

/**
 * Renders the Invoice/Proforma form.
 */
function renderInvoiceForm() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg animate-fade-in">
            <h3 class="text-xl font-semibold mb-4 text-primary-blue">Create Sales Invoice/Proforma</h3>
            <form id="invoice-form" onsubmit="event.preventDefault(); saveInvoice(false);">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg animate-fade-in" style="animation-delay: 100ms">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Document Type</label>
                        <select id="docType" required class="mt-1 block w-full p-2 border rounded-md transition duration-200" onchange="toggleAuctionFields()">
                            <option value="Invoice">Invoice</option>
                            <option value="Proforma Invoice">Proforma Invoice</option>
                            <option value="Auction Invoice">Auction Invoice</option>
                        </select>
                    </div>
                    <div>
                        <label for="exchangeRate" class="block text-sm font-medium text-gray-700">USD 1 = KES</label>
                        <input type="number" id="exchangeRate" step="1" required value="130" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                    </div>
                    <div>
                        <label for="dueDate" class="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
                        <input type="date" id="dueDate" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                    </div>
                    <div>
                        <label for="depositType" class="block text-sm font-medium text-gray-700">Deposit Type</label>
                        <select id="depositType" required class="mt-1 block w-full p-2 border rounded-md transition duration-200" onchange="toggleDepositInput()">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount</option>
                        </select>
                    </div>
                </div>
                
                <!-- Percentage Deposit Input -->
                <div id="percentage-deposit-field" class="mb-4 animate-fade-in" style="animation-delay: 150ms">
                    <label for="depositPercentage" class="block text-sm font-medium text-gray-700">Deposit Percentage (%)</label>
                    <input type="number" id="depositPercentage" step="1" required value="50" min="0" max="100" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                </div>
                
                <!-- Fixed Deposit Input -->
                <div id="fixed-deposit-field" class="hidden mb-4 animate-fade-in">
                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label for="fixedDepositCurrency" class="block text-sm font-medium text-gray-700">Currency</label>
                            <select id="fixedDepositCurrency" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                                <option value="USD">USD</option>
                                <option value="KSH">KES</option>
                                <option value="EURO">EURO</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label for="fixedDepositAmount" class="block text-sm font-medium text-gray-700">Deposit Amount (Whole number only)</label>
                            <input type="number" id="fixedDepositAmount" step="1" placeholder="Enter whole number amount" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                        </div>
                    </div>
                    <p class="text-xs text-gray-600 mt-2">Note: Enter amount without decimals. System will convert to USD for calculations.</p>
                </div>
                
                <div id="auction-price-field" class="hidden mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-300 animate-fade-in">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label for="auctionPriceCurrency" class="block text-sm font-medium text-gray-700">Currency</label>
                            <select id="auctionPriceCurrency" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                                <option value="USD">USD</option>
                                <option value="KSH">KES</option>
                            </select>
                        </div>
                        <div>
                            <label for="auctionPrice" class="block text-sm font-medium text-gray-700">Auction Price (Whole number only)</label>
                            <input type="number" id="auctionPrice" step="1" placeholder="Enter auction price" class="w-full p-2 border rounded-md transition duration-200">
                        </div>
                    </div>
                    <p class="text-xs text-gray-600 mt-2">Note: For auction invoices, this is the bid security deposit amount. System will convert to USD for calculations.</p>
                </div>
                
                <fieldset class="border p-4 rounded-lg mb-6 animate-fade-in" style="animation-delay: 200ms">
                    <legend class="text-base font-semibold text-secondary-red px-2">Client Details</legend>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="text" id="clientName" required placeholder="Client Full Name" class="p-2 border rounded-md transition duration-200" oninput="autoFillBuyerConfirmation()">
                        <input type="text" id="clientPhone" required placeholder="Client Phone Number" class="p-2 border rounded-md transition duration-200">
                    </div>
                </fieldset>

                <fieldset class="border p-4 rounded-lg mb-6 animate-fade-in" style="animation-delay: 250ms">
                    <legend class="text-base font-semibold text-primary-blue px-2">Vehicle Specification</legend>
                    <div class="grid grid-cols-4 gap-4">
                        <input type="text" id="carMake" required placeholder="Make (e.g., Toyota)" class="p-2 border rounded-md transition duration-200">
                        <input type="text" id="carModel" required placeholder="Model (e.g., Vitz)" class="p-2 border rounded-md transition duration-200">
                        <input type="number" id="carYear" required placeholder="Year" class="p-2 border rounded-md transition duration-200">
                        <input type="text" id="vinNumber" required placeholder="VIN Number" class="p-2 border rounded-md transition duration-200">
                        <input type="number" id="engineCC" required placeholder="Engine CC" class="p-2 border rounded-md transition duration-200">
                        <select id="fuelType" required class="p-2 border rounded-md transition duration-200">
                            <option value="" disabled selected>Fuel Type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                        <select id="transmission" required class="p-2 border rounded-md transition duration-200">
                            <option value="" disabled selected>Transmission</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                        </select>
                        <input type="text" id="color" required placeholder="Color" class="p-2 border rounded-md transition duration-200">
                        <input type="number" id="mileage" placeholder="Mileage (km) - Optional" class="p-2 border rounded-md transition duration-200"> <!-- Removed required attribute -->
                    </div>
                    <textarea id="goodsDescription" placeholder="Description of Goods (e.g., Accessories, specific features)" rows="2" class="mt-3 block w-full p-2 border rounded-md transition duration-200"></textarea>
                </fieldset>

                <fieldset class="border p-4 rounded-lg mb-6 animate-fade-in" style="animation-delay: 300ms">
                    <legend class="text-base font-semibold text-secondary-red px-2">Pricing</legend>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="number" id="quantity" required value="1" min="1" placeholder="Quantity" class="p-2 border rounded-md transition duration-200">
                        <input type="number" id="price" step="1" placeholder="Unit Price (USD C&F MSA) - Whole number" class="p-2 border rounded-md transition duration-200">
                    </div>
                </fieldset>

                <fieldset class="border p-4 rounded-lg mb-6 animate-fade-in" style="animation-delay: 350ms">
                    <legend class="text-base font-semibold text-secondary-red px-2">Payment/Confirmation</legend>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Select Bank Accounts for Payment (Multiple)</label>
                            <select id="bankDetailsSelect" multiple required class="mt-1 block w-full p-2 border rounded-md transition duration-200"></select>
                            <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple banks</p>
                        </div>
                        <div>
                            <label for="buyerNameConfirmation" class="block text-sm font-medium text-gray-700">Buyer's Full Name (for signature)</label>
                            <input type="text" id="buyerNameConfirmation" required placeholder="Buyer's Full Name" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                        </div>
                    </div>
                    <p class="mt-4 text-sm text-gray-500">Seller: WANBITE INVESTMENTS COMPANY LIMITED. This acts as a confirmation of acceptance.</p>
                </fieldset>

                <div class="flex space-x-4 animate-fade-in" style="animation-delay: 400ms">
                    <button type="submit" id="save-invoice-btn" class="flex-1 bg-primary-blue hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition duration-150 flex items-center justify-center gap-2">
                        <span>Generate & Save Invoice</span>
                        <svg id="invoice-spinner" class="hidden w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </button>
                    <button type="button" onclick="saveInvoice(true)" id="save-only-btn" class="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition duration-150 flex items-center justify-center gap-2">
                        <span>Save Only (No PDF)</span>
                        <svg id="save-only-spinner" class="hidden w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
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
        fixedField.style.animation = 'fade-in 0.3s ease-out';
    }
}

/**
 * Toggles auction-specific fields based on document type
 */
function toggleAuctionFields() {
    const docType = document.getElementById('docType').value;
    const auctionField = document.getElementById('auction-price-field');
    const priceField = document.getElementById('price');
    const depositTypeField = document.getElementById('depositType');
    const quantityField = document.getElementById('quantity');
    
    // FIXED: Find the pricing fieldset by looking for the legend with "Pricing" text
    let pricingFieldsetElement = null;
    
    // Get all fieldset legends
    const legends = document.querySelectorAll('fieldset legend');
    legends.forEach(legend => {
        if (legend.textContent.includes('Pricing')) {
            pricingFieldsetElement = legend.closest('fieldset');
        }
    });
    
    if (docType === 'Auction Invoice') {
        auctionField.classList.remove('hidden');
        auctionField.style.animation = 'fade-in 0.3s ease-out';
        // Hide the regular pricing fieldset for auction invoices
        if (pricingFieldsetElement) {
            pricingFieldsetElement.classList.add('hidden');
        }
        document.getElementById('depositPercentage').value = "100"; // Auction invoices are 100% deposit
        if (depositTypeField) {
            depositTypeField.value = "percentage";
            depositTypeField.disabled = true;
            toggleDepositInput();
        }
        if (priceField) {
            priceField.value = ""; // Clear price field for auction invoices
            priceField.required = false; // Make it not required
        }
        if (quantityField) {
            quantityField.value = "1"; // Default to 1
            quantityField.disabled = true; // Disable quantity for auction invoices
        }
    } else {
        auctionField.classList.add('hidden');
        // Show the regular pricing fieldset for non-auction invoices
        if (pricingFieldsetElement) {
            pricingFieldsetElement.classList.remove('hidden');
            pricingFieldsetElement.style.animation = 'fade-in 0.3s ease-out';
        }
        if (priceField) {
            priceField.placeholder = "Unit Price (USD C&F MSA) - Whole number";
            priceField.required = true; // Make it required again for non-auction
        }
        document.getElementById('depositPercentage').value = "50";
        if (depositTypeField) {
            depositTypeField.disabled = false;
        }
        if (quantityField) {
            quantityField.disabled = false; // Enable quantity for non-auction
        }
    }
}

/**
 * Saves the invoice data to Firestore and optionally generates a PDF.
 * @param {boolean} onlySave - If true, only saves to Firestore without generating PDF.
 */
async function saveInvoice(onlySave) {
    const form = document.getElementById('invoice-form');
    
    // VALIDATE PRICE - ONLY FOR NON-AUCTION INVOICES
    const docType = document.getElementById('docType').value;
    const priceUSD = parseFloat(document.getElementById('price').value);
    
    // Only validate price for non-auction invoices
    if (docType !== 'Auction Invoice') {
        if (!priceUSD || priceUSD <= 0) {
            showErrorToast("Please enter a valid unit price.");
            document.getElementById('price').focus();
            return;
        }
    }
    
    // Then check form validity
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Show loading state
    const saveButton = onlySave ? document.getElementById('save-only-btn') : document.getElementById('save-invoice-btn');
    const spinner = onlySave ? document.getElementById('save-only-spinner') : document.getElementById('invoice-spinner');
    
    if (saveButton && spinner) {
        saveButton.disabled = true;
        spinner.classList.remove('hidden');
        const buttonText = onlySave ? 'Saving...' : 'Generating & Saving...';
        saveButton.innerHTML = `<span>${buttonText}</span>${spinner.outerHTML}`;
    }

    // 1. Collect Form Data
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
            showErrorToast("Please enter a valid fixed deposit amount.");
            resetInvoiceSaveButton(saveButton, spinner, onlySave);
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
    const mileage = document.getElementById('mileage').value; // Now optional
    const quantity = parseInt(document.getElementById('quantity').value);
    // priceUSD is already declared and validated above (only for non-auction)
    const goodsDescription = document.getElementById('goodsDescription').value;
    
    // Auction price for auction invoices with currency
    let auctionPrice = 0;
    let auctionPriceCurrency = 'USD';
    let auctionPriceUSD = 0;
    
    if (docType === 'Auction Invoice') {
        auctionPrice = parseFloat(document.getElementById('auctionPrice').value);
        auctionPriceCurrency = document.getElementById('auctionPriceCurrency').value;
        
        if (!auctionPrice || auctionPrice <= 0) {
            showErrorToast("Please enter a valid auction price.");
            resetInvoiceSaveButton(saveButton, spinner, onlySave);
            return;
        }
        
        // Convert to USD if in KSH
        if (auctionPriceCurrency === 'KSH') {
            auctionPriceUSD = Math.round(auctionPrice / exchangeRate);
        } else {
            auctionPriceUSD = Math.round(auctionPrice);
        }
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
        showErrorToast("Please select at least one bank account.");
        resetInvoiceSaveButton(saveButton, spinner, onlySave);
        return;
    }
    
    const buyerNameConfirmation = document.getElementById('buyerNameConfirmation').value;

    // 2. Calculate Pricing based on document type - FIXED PERCENTAGE CALCULATION
    let totalPriceUSD, depositUSD, balanceUSD;
    
    if (docType === 'Auction Invoice') {
        totalPriceUSD = auctionPriceUSD; // Use the converted USD amount
        depositUSD = auctionPriceUSD; // 100% deposit for auction invoices
        balanceUSD = 0;
    } else {
        totalPriceUSD = quantity * priceUSD;
        
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
        // Use backdated date if active
issueDate: getCurrentDateForDocument(),
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
            mileage: mileage || '', // Now optional
            quantity,
            priceUSD: docType === 'Auction Invoice' ? 0 : priceUSD, // Set to 0 for auction invoices
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
        auctionPriceCurrency: docType === 'Auction Invoice' ? auctionPriceCurrency : null,
        auctionPriceUSD: docType === 'Auction Invoice' ? auctionPriceUSD : null
    };

    // 5. Save to Firestore
    try {
        const docRef = await db.collection("invoices").add(invoiceData);
        
        // Reset button state
        resetInvoiceSaveButton(saveButton, spinner, onlySave);
        
        showSuccessToast(`${docType} ${generatedInvoiceId} saved successfully!`);

        // 6. Download PDF if requested
        if (!onlySave) {
            invoiceData.firestoreId = docRef.id;
            generateInvoicePDF(invoiceData);
        }
        
        // Reset form
        form.reset();
        
        // Re-populate bank dropdown
        populateBankDropdown('bankDetailsSelect', true);
        
    } catch (error) {
        console.error("Error saving invoice:", error);
        resetInvoiceSaveButton(saveButton, spinner, onlySave);
        showErrorToast("Failed to save invoice: " + error.message);
    }
}

// Helper function to reset invoice save button state
function resetInvoiceSaveButton(saveButton, spinner, onlySave) {
    if (saveButton && spinner) {
        saveButton.disabled = false;
        spinner.classList.add('hidden');
        const buttonText = onlySave ? 'Save Only (No PDF)' : 'Generate & Save Invoice';
        saveButton.innerHTML = `<span>${buttonText}</span>${spinner.outerHTML}`;
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
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg animate-fade-in">
            <h3 class="text-xl font-semibold mb-6 text-primary-blue">Previously Saved Invoices</h3>
            <div id="invoice-history-list">
                ${createShimmerLoader(3)}
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
            listElement.innerHTML = `
                <div class="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="text-gray-500">No recent invoices found.</p>
                </div>
            `;
            return;
        }
        
        html = `<ul class="space-y-3 divide-y divide-gray-200">`;
        snapshot.forEach((doc, index) => {
            const data = doc.data();
            const invoiceDataJson = JSON.stringify({
                ...data, 
                firestoreId: doc.id,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            });

            const isRevoked = data.revoked || false;
            const animationDelay = index * 50;
            
            html += `<li class="p-3 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center animate-fade-in ${isRevoked ? 'bg-red-50 border-l-4 border-red-500' : ''}" 
                         style="animation-delay: ${animationDelay}ms">
                        <div>
                            ${isRevoked ? `<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">REVOKED</span><br>` : ''}
                            <strong class="text-primary-blue">${data.docType} ${data.invoiceId}</strong><br>
                            <span class="text-sm text-gray-700">Client: ${data.clientName} | Vehicle: ${data.carDetails.make} ${data.carDetails.model}</span><br>
                            <span class="text-xs text-gray-600">Total: USD ${data.pricing.totalUSD.toFixed(2)}</span>
                            ${data.pricing.depositPaid ? `<br><span class="text-xs text-green-600 flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Deposit Paid</span>` : `<br><span class="text-xs text-secondary-red flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg> Deposit Pending</span>`}
                        </div>
                        <div class="mt-2 sm:mt-0 space-x-2">
                            <button onclick='reDownloadInvoice(${invoiceDataJson})' 
                                    class="bg-primary-blue hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                PDF
                            </button>
                            ${!isRevoked ? `
                                ${!data.pricing.depositPaid ? `
                                <button onclick='markInvoiceDepositPaid(${invoiceDataJson})' 
                                        class="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Deposit
                                </button>
                                ` : ''}
                                <button onclick='createReceiptFromInvoice(${invoiceDataJson})' 
                                        class="bg-secondary-red hover:bg-red-700 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Receipt
                                </button>
                                <button onclick='createAdditionalInvoice(${invoiceDataJson})' 
                                        class="bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                    Add
                                </button>
                                <button onclick='revokeInvoice(${invoiceDataJson})' 
                                        class="bg-red-600 hover:bg-red-800 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    REVOKE
                                </button>
                            ` : `
                                <button onclick='unrevokeInvoice(${invoiceDataJson})' 
                                        class="bg-gray-600 hover:bg-gray-800 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
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
        listElement.innerHTML = `
            <div class="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 font-semibold">Error loading invoice history</p>
                <p class="text-xs text-gray-600 mt-1">${error.message}</p>
            </div>
        `;
    }
}

// Add revoke function:
async function revokeInvoice(invoiceData) {
    if (!confirm(`Are you sure you want to REVOKE invoice ${invoiceData.invoiceId}?\n\nThis will mark it as invalid and disable creation of receipts/agreements.`)) {
        return;
    }
    
    const loadingOverlay = showLoadingOverlay("Revoking invoice...");
    
    try {
        await db.collection("invoices").doc(invoiceData.firestoreId).update({
            revoked: true,
            revokedAt: firebase.firestore.FieldValue.serverTimestamp(),
            revokedBy: currentUser.email
        });
        
        hideLoadingOverlay();
        showSuccessToast(`Invoice ${invoiceData.invoiceId} has been revoked.`);
        fetchInvoices(); // Refresh the list
    } catch (error) {
        console.error("Error revoking invoice:", error);
        hideLoadingOverlay();
        showErrorToast("Failed to revoke invoice: " + error.message);
    }
}

// Add unrevoke function:
async function unrevokeInvoice(invoiceData) {
    if (!confirm(`Are you sure you want to UNREVOKE invoice ${invoiceData.invoiceId}?`)) {
        return;
    }
    
    const loadingOverlay = showLoadingOverlay("Unrevoking invoice...");
    
    try {
        await db.collection("invoices").doc(invoiceData.firestoreId).update({
            revoked: false,
            unrevokedAt: firebase.firestore.FieldValue.serverTimestamp(),
            unrevokedBy: currentUser.email
        });
        
        hideLoadingOverlay();
        showSuccessToast(`Invoice ${invoiceData.invoiceId} has been unrevoked.`);
        fetchInvoices(); // Refresh the list
    } catch (error) {
        console.error("Error unrevoking invoice:", error);
        hideLoadingOverlay();
        showErrorToast("Failed to unrevoke invoice: " + error.message);
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md animate-fade-in" style="animation-delay: 100ms">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">New Car Sales Agreement</h3>
                <form id="agreement-form" onsubmit="event.preventDefault(); saveAgreement()">
                    
                    <fieldset class="border p-4 rounded-lg mb-4 bg-blue-50">
                        <legend class="text-base font-semibold text-primary-blue px-2">Agreement Parties & Date</legend>
                        
                        <label for="agreementDateInput" class="block text-sm font-medium text-gray-700 mb-2">Agreement Date:</label>
                        <input type="date" id="agreementDateInput" required value="${new Date().toISOString().slice(0, 10)}" class="mb-4 block w-full p-2 border rounded-md transition duration-200">
                        
                        <h4 class="font-bold text-sm mt-2 text-secondary-red">SELLER: WanBite Investments Company Limited</h4>
                        <div class="grid grid-cols-2 gap-3 mt-1 mb-4">
                            <input type="text" id="sellerAddress" value="Ngong Road, Kilimani, Nairobi" required placeholder="Seller Address" class="p-2 border rounded-md text-sm transition duration-200">
                            <input type="text" id="sellerPhone" value="0713147136" required placeholder="Seller Phone" class="p-2 border rounded-md text-sm transition duration-200">
                        </div>
                        
                        <h4 class="font-bold text-sm mt-2 text-primary-blue">BUYER:</h4>
                        <div class="grid grid-cols-2 gap-3 mt-1">
                            <input type="text" id="buyerName" required placeholder="Buyer Name" class="p-2 border rounded-md transition duration-200">
                            <input type="text" id="buyerPhone" required placeholder="Buyer Phone" class="p-2 border rounded-md transition duration-200">
                            <input type="text" id="buyerAddress" required placeholder="Buyer Address" class="p-2 border rounded-md col-span-2 transition duration-200">
                        </div>
                    </fieldset>
                    
                    <fieldset class="border p-4 rounded-lg mb-4">
                        <legend class="text-base font-semibold text-primary-blue px-2">Vehicle Details</legend>
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" id="carMakeModel" required placeholder="Make and Model (e.g., Toyota Vitz)" class="p-2 border rounded-md transition duration-200">
                            <input type="number" id="carYear" required placeholder="Year of Manufacture" class="p-2 border rounded-md transition duration-200">
                            <input type="text" id="carColor" required placeholder="Color" class="p-2 border rounded-md transition duration-200">
                            <input type="text" id="carVIN" required placeholder="VIN Number" class="p-2 border rounded-md transition duration-200">
                        </div>
                        <select id="carFuelType" required class="block w-full p-2 border rounded-md mt-3 transition duration-200">
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
                            <select id="currencySelect" required class="block w-full p-2 border rounded-md transition duration-200">
                                <option value="KES">KES - Kenya Shillings</option>
                                <option value="USD">USD - US Dollars</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="agreementBankDetailsSelect" class="block text-sm font-medium text-gray-700">Select Bank Account for Payment</label>
                            <select id="agreementBankDetailsSelect" required class="mt-1 block w-full p-2 border rounded-md transition duration-200"></select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="totalPrice" class="block text-sm font-medium text-gray-700">Total Price</label>
                            <input type="number" id="totalPrice" step="0.01" required placeholder="Total Price" class="w-full p-2 border rounded-md transition duration-200">
                        </div>
                    </fieldset>

                    <fieldset class="border p-4 rounded-lg mb-6">
                        <legend class="text-base font-semibold text-primary-blue px-2">Witnesses</legend>
                        <input type="text" id="sellerWitness" required placeholder="Seller Witness Name" class="mt-2 block w-full p-2 border rounded-md transition duration-200">
                        <input type="text" id="buyerWitness" required placeholder="Buyer Witness Name" class="mt-2 block w-full p-2 border rounded-md transition duration-200">
                    </fieldset>

                    <button type="submit" id="save-agreement-btn" class="w-full bg-primary-blue hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition duration-150 flex items-center justify-center gap-2">
                        <span>Generate & Save Agreement</span>
                        <svg id="agreement-spinner" class="hidden w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </button>
                </form>
            </div>
            <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-md animate-fade-in" style="animation-delay: 200ms">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Recent Sales Agreements</h3>
                <div id="recent-agreements">
                    ${createShimmerLoader(2)}
                </div>
            </div>
        </div>
    `; 
    
    // Populate the dropdown
    populateBankDropdown('agreementBankDetailsSelect'); 
    fetchAgreements();
    
    // Add event listener for total price input
    const totalPriceInput = document.getElementById('totalPrice');
    if (totalPriceInput) {
        totalPriceInput.addEventListener('input', function() {
            const currency = document.getElementById('currencySelect').value;
            const total = parseFloat(this.value) || 0;
            // You can update any display element here if needed
        });
    }
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

    // Show loading state
    const saveButton = document.getElementById('save-agreement-btn');
    const spinner = document.getElementById('agreement-spinner');
    if (saveButton && spinner) {
        saveButton.disabled = true;
        spinner.classList.remove('hidden');
        saveButton.innerHTML = `<span>Saving Agreement...</span>${spinner.outerHTML}`;
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
        showErrorToast("Please select a valid bank account.");
        resetAgreementSaveButton(saveButton, spinner);
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
        
        // Reset button state
        resetAgreementSaveButton(saveButton, spinner);
        
        showSuccessToast(`Sales Agreement for ${agreementData.buyer.name} saved successfully!`);

        // Use the parsed bank details object for immediate PDF generation
        agreementData.firestoreId = docRef.id;
        agreementData.bankDetails = bankDetails; // <<< Attach full details for PDF
        generateAgreementPDF(agreementData);

        form.reset();
        fetchAgreements(); // Refresh history
    } catch (error) {
        console.error("Error saving sales agreement:", error);
        resetAgreementSaveButton(saveButton, spinner);
        showErrorToast("Failed to save sales agreement: " + error.message);
    }
}

// Helper function to reset agreement save button
function resetAgreementSaveButton(saveButton, spinner) {
    if (saveButton && spinner) {
        saveButton.disabled = false;
        spinner.classList.add('hidden');
        saveButton.innerHTML = `<span>Generate & Save Agreement</span>${spinner.outerHTML}`;
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
            agreementList.innerHTML = `
                <div class="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="text-gray-500">No recent agreements found.</p>
                </div>
            `;
            return;
        }
        
        html = `<ul class="space-y-3">`;
        snapshot.forEach((doc, index) => {
            const data = doc.data();
            const agreementDataJson = JSON.stringify({
                ...data, 
                firestoreId: doc.id,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            });

            const animationDelay = index * 50;
            
            html += `<li class="p-3 border rounded-lg bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center animate-fade-in" style="animation-delay: ${animationDelay}ms">
                        <div>
                            <strong class="text-primary-blue">Agreement ID: ${doc.id.substring(0, 8)}...</strong><br>
                            <span class="text-sm text-gray-700">Buyer: ${data.buyer.name} | Vehicle: ${data.vehicle.makeModel}</span>
                            ${data.invoiceReference ? `<br><span class="text-xs text-green-600 flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5z" clip-rule="evenodd"/></svg> Invoice Ref: ${data.invoiceReference}</span>` : ''}
                            ${data.receiptReference ? `<br><span class="text-xs text-blue-600 flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" clip-rule="evenodd"/></svg> Receipt Ref: ${data.receiptReference}</span>` : ''}
                        </div>
                        <div class="mt-2 sm:mt-0 space-x-2">
                            <button onclick='reDownloadAgreement(${agreementDataJson})' 
                                    class="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                PDF
                            </button>
                        </div>
                    </li>`;
        });
        html += `</ul>`;
        agreementList.innerHTML = html;
    } catch (error) {
        console.error("Error fetching agreements:", error);
        agreementList.innerHTML = `
            <div class="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 font-semibold">Error loading agreements</p>
                <p class="text-xs text-gray-600 mt-1">${error.message}</p>
            </div>
        `;
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div class="md:col-span-1 p-6 border border-green-300 rounded-xl bg-green-50 shadow-md animate-fade-in" style="animation-delay: 100ms">
                <h3 class="text-xl font-semibold mb-4 text-green-700">Add New Bank Account</h3>
                <form id="add-bank-form" onsubmit="event.preventDefault(); addBankDetails()">
                    <input type="text" id="bankName" required placeholder="Bank Name (e.g., KCB Bank)" class="mt-2 block w-full p-2 border rounded-md transition duration-200">
                    <input type="text" id="bankBranch" required placeholder="Bank Branch (e.g., Kilimani Branch)" class="mt-2 block w-full p-2 border rounded-md transition duration-200">
                    <input type="text" id="accountName" required placeholder="Account Name" value="WANBITE INVESTMENTS CO. LTD" class="mt-2 block w-full p-2 border rounded-md transition duration-200">
                    <input type="text" id="accountNumber" required placeholder="Account Number" class="mt-2 block w-full p-2 border rounded-md transition duration-200">
                    <input type="text" id="paybillNumber" placeholder="Paybill Number (Optional)" class="mt-2 block w-full p-2 border rounded-md transition duration-200">
                    <input type="text" id="swiftCode" required placeholder="SWIFT/BIC Code" class="mt-2 block w-full p-2 border rounded-md transition duration-200">
                    <select id="currency" required class="mt-2 block w-full p-2 border rounded-md transition duration-200">
                        <option value="" disabled selected>Select Currency</option>
                        <option value="USD">USD</option>
                        <option value="KES">KES</option>
                    </select>
                    <button type="submit" id="save-bank-btn" class="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md transition duration-150 flex items-center justify-center gap-2">
                        <span>Save Bank Account</span>
                        <svg id="bank-spinner" class="hidden w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </button>
                </form>
            </div>

            <div class="md:col-span-2 p-6 border border-gray-300 rounded-xl bg-white shadow-md animate-fade-in" style="animation-delay: 200ms">
                <h3 class="text-xl font-semibold mb-4 text-primary-blue">Saved Bank Accounts</h3>
                <div id="saved-banks-list" class="space-y-3">
                    ${createShimmerLoader(3)}
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
    const form = document.getElementById('add-bank-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Show loading state
    const saveButton = document.getElementById('save-bank-btn');
    const spinner = document.getElementById('bank-spinner');
    if (saveButton && spinner) {
        saveButton.disabled = true;
        spinner.classList.remove('hidden');
        saveButton.innerHTML = `<span>Saving...</span>${spinner.outerHTML}`;
    }

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
        
        // Reset button state
        if (saveButton && spinner) {
            saveButton.disabled = false;
            spinner.classList.add('hidden');
            saveButton.innerHTML = `<span>Save Bank Account</span>${spinner.outerHTML}`;
        }
        
        showSuccessToast(`Bank account for ${bankName} (${bankBranch}) saved successfully!`);
        document.getElementById('add-bank-form').reset();
        fetchAndDisplayBankDetails(); // Refresh the list
    } catch (error) {
        console.error("Error saving bank details:", error);
        
        // Reset button state
        if (saveButton && spinner) {
            saveButton.disabled = false;
            spinner.classList.add('hidden');
            saveButton.innerHTML = `<span>Save Bank Account</span>${spinner.outerHTML}`;
        }
        
        showErrorToast("Failed to save bank details: " + error.message);
    }
}

/**
 * Fetches and displays all saved bank details in the list.
 */
async function fetchAndDisplayBankDetails() {
    const listElement = document.getElementById('saved-banks-list');
    if (!listElement) return;

    listElement.innerHTML = `${createShimmerLoader(3)}`;
    let html = ``;

    try {
        const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
        if (snapshot.empty) {
            listElement.innerHTML = `
                <div class="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    <p class="text-center text-gray-500">No bank accounts have been configured yet.</p>
                </div>
            `;
            return;
        }

        html = `<ul class="divide-y divide-gray-200">`;
        snapshot.forEach((doc, index) => {
            const data = doc.data();
            const animationDelay = index * 50;
            
            html += `
                <li class="p-4 flex flex-col animate-fade-in hover:bg-gray-50 transition duration-150" style="animation-delay: ${animationDelay}ms">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-blue to-blue-600 flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                </svg>
                            </div>
                            <strong class="text-lg text-primary-blue">${data.name} <span class="text-xs bg-${data.currency === 'USD' ? 'blue' : 'green'}-100 text-${data.currency === 'USD' ? 'blue' : 'green'}-800 px-2 py-1 rounded">${data.currency}</span></strong>
                        </div>
                        <button onclick="deleteBank('${doc.id}')" class="text-red-500 hover:text-red-700 text-sm transition duration-150 flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Delete
                        </button>
                    </div>
                    <p class="text-sm text-gray-700 mt-2">Branch: ${data.branch || 'N/A'}</p>
                    <p class="text-sm text-gray-700">Account: ${data.accountName}</p>
                    <p class="text-sm text-gray-600 mt-1">No: ${data.accountNumber} | SWIFT: ${data.swiftCode}</p>
                    ${data.paybillNumber ? `<p class="text-sm text-gray-600">Paybill: ${data.paybillNumber}</p>` : ''}
                </li>
            `;
        });
        html += `</ul>`;
        listElement.innerHTML = html;

    } catch (error) {
        console.error("Error fetching banks:", error);
        listElement.innerHTML = `
            <div class="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 font-semibold">Error loading bank accounts</p>
                <p class="text-xs text-gray-600 mt-1">${error.message}</p>
            </div>
        `;
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
    
    const loadingOverlay = showLoadingOverlay("Deleting bank account...");
    
    try {
        await db.collection("bankDetails").doc(bankId).delete();
        
        hideLoadingOverlay();
        showSuccessToast("Bank account deleted successfully!");
        fetchAndDisplayBankDetails(); // Refresh the list
    } catch (error) {
        console.error("Error deleting bank:", error);
        hideLoadingOverlay();
        showErrorToast("Failed to delete bank: " + error.message);
    }
}

// =================================================================
//                 PDF GENERATION FUNCTIONS (MOVED TO TOP)
// =================================================================

/**
 * Generates and downloads a custom PDF for the comprehensive receipt. (WITH PAYMENT HISTORY)
 */
function generateReceiptPDF(data) {
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

    // Helper to format amounts without decimals (with .00)
    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) return '0.00';
        const rounded = Math.round(amount);
        return rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

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

    // Calculate latest payment amount based on date
    const paymentHistory = data.paymentHistory || [];
    let latestPayment = null;
    let latestPaymentAmount = data.amountReceived;
    let latestPaymentCurrency = data.currency || 'KSH';
    let latestPaymentWords = data.amountWords || '';
    
    if (paymentHistory.length > 0) {
        // Sort payments by date to get the latest one
        const sortedPayments = [...paymentHistory].sort((a, b) => {
            const dateA = a.paymentDate ? new Date(a.paymentDate) : new Date(0);
            const dateB = b.paymentDate ? new Date(b.paymentDate) : new Date(0);
            return dateB - dateA;
        });
        
        latestPayment = sortedPayments[0];
        latestPaymentAmount = latestPayment.amount || data.amountReceived;
        latestPaymentCurrency = latestPayment.currency || data.currency || 'KSH';
        
        // Generate amount words for the latest payment
        if (latestPaymentAmount) {
            let words = numberToWords(latestPaymentAmount);
            if (latestPaymentCurrency === 'USD') {
                words = words.replace('only', 'US Dollars only.');
            } else { // KSH
                words = words.replace('only', 'Kenya Shillings only.');
            }
            latestPaymentWords = words;
        }
    }

    // The Sum of Money (Words) - UPDATED TO SHOW LATEST PAYMENT WITH REDUCED SPACING
    drawText('THE SUM OF:', margin, y + 3, 10, 'bold');
    doc.setFillColor(240, 240, 240); 
    const wordsBoxHeight = lineHeight * 3; // Reduced height from 3.5 to 3 for less spacing
    doc.rect(margin + 35, y, boxW - 35, wordsBoxHeight, 'F');
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(margin + 35, y, boxW - 35, wordsBoxHeight);
    
    doc.setTextColor(0);
    
    // Display the amount figure above the words - REDUCED SPACING
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const amountFigureText = `${latestPaymentCurrency} ${formatAmount(latestPaymentAmount)}`;
    const amountFigureWidth = doc.getStringUnitWidth(amountFigureText) * 14 / doc.internal.scaleFactor;
    const amountFigureX = margin + 35 + ((boxW - 35) - amountFigureWidth) / 2;
    doc.text(amountFigureText, amountFigureX, y + 7); // Changed from y + 8 to y + 7 (reduced by 1mm)
    
    // Display the amount in words below the figure - MOVED CLOSER TO FIGURE
    doc.setFontSize(11);
    const wrappedWords = doc.splitTextToSize(latestPaymentWords || '', boxW - 37);
    
    // Calculate vertical position for centered text (starting closer to the figure)
    const textHeight = wrappedWords.length * 4; // Approximate height in mm
    const verticalOffset = y + (wordsBoxHeight - textHeight) / 2 + 10; // Changed from +12 to +10 (reduced by 2mm)
    
    doc.text(wrappedWords, margin + 36, Math.max(verticalOffset, y + 14)); // Adjusted from y + 16
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
    
    // Calculate total paid amount - SHOW TOTAL SUM OF ALL PAYMENTS
    const totalPaidUSD = data.totalPaidUSD || (data.amountReceivedUSD || (data.currency === 'USD' ? data.amountReceived : data.amountReceived / (data.exchangeRate || 130)));
    const totalPaidKSH = data.totalPaidKSH || (data.amountReceivedKSH || (data.currency === 'KSH' ? data.amountReceived : data.amountReceived * (data.exchangeRate || 130)));
    
    // Determine which currency to display for the total sum
    const totalDisplayCurrency = data.currency || 'KSH';
    let totalAmountFigure;
    
    if (totalDisplayCurrency === 'USD') {
        totalAmountFigure = totalPaidUSD;
    } else {
        // Default to KSH if currency is KSH or unknown
        totalAmountFigure = totalPaidKSH;
    }
    
    // Total Amount Box - SHOW TOTAL SUM OF ALL PAYMENTS
    doc.setFillColor(secondaryColor);
    doc.rect(pageW - margin - 70, amountBoxY, 70, amountBoxH, 'F');
    
    doc.setTextColor(255);
    drawText('AMOUNT FIGURE', pageW - margin - 65, amountBoxY + 4, 8, 'bold', 255);
    drawText(`${totalDisplayCurrency} ${formatAmount(totalAmountFigure)}`, 
         pageW - margin - 5, amountBoxY + 11, 18, 'bold', 255, 'right');
    
    // Balance Details - FIXED: Use stored USD/KSH amounts
    doc.setTextColor(primaryColor);
    drawText('BALANCE DETAILS', margin, amountBoxY + 4, 10, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0);

    // Calculate proper balances
    const remainingUSD = data.balanceDetails?.balanceRemainingUSD || data.balanceDetails?.balanceRemaining || 0;
    const remainingKSH = data.balanceDetails?.balanceRemainingKSH || remainingUSD * (data.exchangeRate || 130);

    // Show balance in both USD and KSH - UPDATED
    drawText(`Balance Remaining (USD): ${formatAmount(remainingUSD)}`, margin, amountBoxY + 10, 10);
    drawText(`Balance Remaining (KES): ${formatAmount(remainingKSH)}`, margin, amountBoxY + 14, 10);
    drawText(`Due On/Before: ${data.balanceDetails?.balanceDueDate || 'N/A'}`, margin, amountBoxY + 18, 10);

    // Add paid amounts - UPDATED TO SHOW TOTAL PAID
    drawText(`Paid (USD): ${formatAmount(totalPaidUSD)}`, margin, amountBoxY + 22, 10);
    drawText(`Paid (KES): ${formatAmount(totalPaidKSH)}`, margin, amountBoxY + 26, 10);
    
    y = amountBoxY + amountBoxH + 10;

    // =================================================================
    // PAYMENT HISTORY SECTION (IF EXISTS) - ADJUSTED COLUMN WIDTHS
    // =================================================================
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
        
        // Table Header - ADJUSTED COLUMN POSITIONS
        doc.setFillColor(primaryColor);
        doc.rect(margin, y, boxW, 6, 'F');
        doc.setTextColor(255);
        drawText('#', margin + 2, y + 4, 8, 'bold', 255);
        drawText('Date', margin + 8, y + 4, 8, 'bold', 255); // Moved left from 10 to 8
        drawText('Amount', margin + 30, y + 4, 8, 'bold', 255); // Moved left from 40 to 30
        drawText('USD', margin + 60, y + 4, 8, 'bold', 255); // Moved left from 75 to 60
        drawText('KES', margin + 85, y + 4, 8, 'bold', 255); // Moved left from 105 to 85
        drawText('Method', margin + 110, y + 4, 8, 'bold', 255); // Moved left from 135 to 110
        drawText('Description', margin + 145, y + 4, 8, 'bold', 255); // Moved left from 170 to 145 (more space now)
        y += 6;
        
        // Payment Rows
        doc.setFontSize(8);
        doc.setTextColor(0);
        
        // Sort payments by date for display (newest first)
        const sortedDisplayPayments = [...paymentHistory].sort((a, b) => {
            const dateA = a.paymentDate ? new Date(a.paymentDate) : new Date(0);
            const dateB = b.paymentDate ? new Date(b.paymentDate) : new Date(0);
            return dateB - dateA;
        });
        
        sortedDisplayPayments.forEach((payment, index) => {
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
            drawText(payment.paymentDate || 'N/A', margin + 8, y + 3.5, 8); // Moved left from 10 to 8
            drawText(`${payment.currency} ${formatAmount(payment.amount)}`, margin + 30, y + 3.5, 8); // Moved left from 40 to 30
            drawText(`USD ${formatAmount(payment.amountUSD || (payment.currency === 'USD' ? payment.amount : (payment.amount / (payment.exchangeRate || 130))))}`, margin + 60, y + 3.5, 8); // Moved left from 75 to 60
            drawText(`KES ${formatAmount(payment.amountKSH || (payment.currency === 'KSH' ? payment.amount : (payment.amount * (payment.exchangeRate || 130))))}`, margin + 85, y + 3.5, 8); // Moved left from 105 to 85
            
            const method = payment.paymentMethod || 'N/A';
            const shortMethod = method.length > 15 ? method.substring(0, 12) + '...' : method;
            drawText(shortMethod, margin + 110, y + 3.5, 8); // Moved left from 135 to 110
            
            const description = payment.description || 'Payment';
            // Now we have more space (from 170 to 145 = 25mm more), so we can show longer descriptions
            const maxDescWidth = 35; // Increased from previous
            const shortDesc = description.length > 40 ? description.substring(0, 37) + '...' : description;
            drawText(shortDesc, margin + 145, y + 3.5, 8); // Moved left from 170 to 145
            
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
const stampDate = data.receiptDate || getCurrentDateForDocument();;
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

    // Helper to format amounts without decimals (with .00)
    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) return '0.00';
        const rounded = Math.round(amount);
        return rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // --- HELPER FUNCTIONS ---
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
    drawText(`${formatAmount(data.carDetails.priceUSD)}`, 185, y + 9, 10, 'normal', 0, "right");

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

        // Term 2: Auction Bid Security - NEW CLAUSE (UPDATED WITH CURRENCY)
        const term2 = `WanBite Investments Ltd will arrange the auction bid once the Buyer deposits ${auctionCurrency} ${formatAmount(auctionPrice)} as bid security. This deposit is refundable.`;
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

        // Term 2: Payment Schedule - UPDATED AS REQUESTED - REMOVED DUE DATE
        let depositText;
        if (data.depositType === 'percentage' && data.depositPercentage) {
            depositText = `A deposit of USD ${formatAmount(data.pricing.depositUSD)} (KES ${formatAmount(data.pricing.depositKSH)} equivalent) is required to secure the vehicle and begin shipping/clearing. The due date of the balance of USD ${formatAmount(data.pricing.balanceUSD)} will be promptly be communicated and notified by the seller for compliance.`;
        } else {
            depositText = `A deposit of ${data.fixedDepositCurrency} ${formatAmount(data.fixedDepositAmount)} (USD ${formatAmount(data.pricing.depositUSD)} / KES ${formatAmount(data.pricing.depositKSH)} equivalent) is required to secure the vehicle and begin shipping/clearing. The due date of the balance of USD ${formatAmount(data.pricing.balanceUSD)} will be promptly be communicated and notified by the seller for compliance.`;
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

// If backdate is active, ensure we use the backdated date
if (backdateMode && backdateDate) {
    stampDate = backdateDate.toLocaleDateString('en-US');
}

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

    // Helper to format amounts without decimals (with .00)
    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) return '0.00';
        const rounded = Math.round(amount);
        return rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

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

// If backdate is active, use backdated date
if (backdateMode && backdateDate) {
    stampDate = backdateDate.toLocaleDateString('en-US');
}

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
        showErrorToast("Cannot create receipt from a revoked invoice.");
        return;
    }
    
    // Navigate to receipt form with invoice reference
    renderReceiptForm(invoiceData.invoiceId);
    
    // Show loading indicator
    const loadingOverlay = showLoadingOverlay("Loading invoice data...");
    
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
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        // Trigger fetch invoice details
        setTimeout(() => {
            fetchInvoiceDetails();
            showSuccessToast("Invoice data loaded successfully");
        }, 300);
        
    }, 500);
}

/**
 * Creates a car sales agreement from invoice data
 */
function createAgreementFromInvoice(invoiceData) {
    // Check if invoice is revoked
    if (invoiceData.revoked) {
        showErrorToast("Cannot create agreement from a revoked invoice.");
        return;
    }
    
    // Navigate to agreement form
    renderAgreementForm();
    
    // Show loading indicator
    const loadingOverlay = showLoadingOverlay("Loading invoice data...");
    
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
        
        // Store the invoice reference in a hidden field or data attribute
        const agreementForm = document.getElementById('agreement-form');
        if (agreementForm) {
            agreementForm.dataset.invoiceReference = invoiceData.invoiceId;
            agreementForm.dataset.invoiceId = invoiceData.firestoreId;
        }
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        // Show notification
        setTimeout(() => {
            showSuccessToast(`Invoice ${invoiceData.invoiceId} data has been loaded into the agreement form.`);
        }, 300);
        
    }, 500);
}

/**
 * Creates an agreement from receipt data
 */
function createAgreementFromReceipt(receiptData) {
    // Navigate to agreement form
    renderAgreementForm();
    
    // Show loading indicator
    const loadingOverlay = showLoadingOverlay("Loading receipt data...");
    
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
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        // Show notification
        setTimeout(() => {
            showSuccessToast(`Receipt ${receiptData.receiptId} data has been loaded into the agreement form.`);
        }, 300);
        
    }, 500);
}

/**
 * Re-downloads the PDF for a selected receipt document from history.
 * @param {object} data - The receipt data object retrieved from Firestore.
 */
async function reDownloadReceipt(data) {
    // Show loading overlay
    const loadingOverlay = showLoadingOverlay("Preparing receipt PDF...");
    
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
    
    // Hide loading overlay
    hideLoadingOverlay();
    
    // Now generate the PDF with all the data
    generateReceiptPDF(data);
}

/**
 * View balances for a specific receipt
 */
function viewReceiptBalances(data) {
    const modalHtml = `
        <div id="balances-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white animate-fade-in">
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
                            class="bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md transition duration-150">
                        Add Payment
                    </button>
                    <button onclick="document.getElementById('balances-modal').remove()" 
                            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-150">
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
        showErrorToast("Cannot mark deposit as paid on a revoked invoice.");
        return;
    }
    
    const modalHtml = `
        <div id="deposit-paid-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white animate-fade-in">
                <h3 class="text-lg font-semibold text-primary-blue mb-4">Mark Deposit as Paid</h3>
                <p class="text-sm mb-3">
                    <strong>Invoice:</strong> ${invoiceData.invoiceId}<br>
                    <strong>Client:</strong> ${invoiceData.clientName}<br>
                    <strong>Deposit Required:</strong> USD ${invoiceData.pricing.depositUSD.toFixed(2)} (KES ${invoiceData.pricing.depositKSH})
                </p>
                <form id="deposit-paid-form" onsubmit="event.preventDefault(); saveDepositPayment('${invoiceData.firestoreId}', ${invoiceData.pricing.depositUSD}, ${invoiceData.exchangeRate})">
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Payment Date</label>
                        <input type="date" id="depositDate" required value="${new Date().toISOString().slice(0, 10)}" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Amount</label>
                        <div class="grid grid-cols-3 gap-2">
                            <select id="depositCurrency" required class="p-2 border rounded-md transition duration-200">
                                <option value="USD">USD</option>
                                <option value="KSH">KSH</option>
                            </select>
                            <input type="number" id="depositAmount" step="0.01" required placeholder="Amount" class="col-span-2 p-2 border rounded-md transition duration-200">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Exchange Rate (USD 1 = KES)</label>
                        <input type="number" id="depositExchangeRate" step="0.01" required value="${invoiceData.exchangeRate || 130}" class="w-full p-2 border rounded-md transition duration-200">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Bank Used</label>
                        <select id="depositBankUsed" required class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                            <option value="" disabled selected>Select Bank</option>
                            <option value="Cash">Cash</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Reference/Description</label>
                        <input type="text" id="depositDescription" required placeholder="e.g., Deposit Payment for Invoice ${invoiceData.invoiceId}" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                    </div>
                    <div class="mb-4 p-2 bg-yellow-50 rounded">
                        <p class="text-xs text-gray-600">
                            <strong>Note:</strong> This will create a receipt for the deposit payment.
                        </p>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="(() => { const modal = document.getElementById('deposit-paid-modal'); if (modal) modal.remove(); })()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-150">
                            Cancel
                        </button>
                        <button type="submit" id="save-deposit-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 flex items-center justify-center gap-2">
                            <span>Save Deposit Payment</span>
                            <svg id="deposit-spinner" class="hidden w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
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
    
    // Show loading state
    const saveButton = document.getElementById('save-deposit-btn');
    const spinner = document.getElementById('deposit-spinner');
    if (saveButton && spinner) {
        saveButton.disabled = true;
        spinner.classList.remove('hidden');
        saveButton.innerHTML = `<span>Saving...</span>${spinner.outerHTML}`;
    }
    
    const depositDate = document.getElementById('depositDate').value;
    const depositCurrency = document.getElementById('depositCurrency').value;
    const depositAmount = parseFloat(document.getElementById('depositAmount').value);
    const depositExchangeRate = parseFloat(document.getElementById('depositExchangeRate').value);
    const depositBankUsed = document.getElementById('depositBankUsed').value;
    const depositDescription = document.getElementById('depositDescription').value;
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
        showErrorToast("Please enter a valid deposit amount.");
        resetDepositSaveButton(saveButton, spinner);
        return;
    }
    
    // Get invoice data
    const invoiceDoc = await db.collection("invoices").doc(invoiceDocId).get();
    if (!invoiceDoc.exists) {
        showErrorToast("Invoice not found!");
        resetDepositSaveButton(saveButton, spinner);
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
        
        resetDepositSaveButton(saveButton, spinner);
        showSuccessToast(`Deposit payment of ${depositCurrency} ${depositAmount.toFixed(2)} saved successfully! Receipt ${receiptId} created.`);
        
        // Navigate to receipt form with the invoice reference
        renderReceiptForm(invoiceData.invoiceId);
        
    } catch (error) {
        console.error("Error saving deposit payment:", error);
        resetDepositSaveButton(saveButton, spinner);
        showErrorToast("Failed to save deposit payment: " + error.message);
    }
}

// Helper function to reset deposit save button
function resetDepositSaveButton(saveButton, spinner) {
    if (saveButton && spinner) {
        saveButton.disabled = false;
        spinner.classList.add('hidden');
        saveButton.innerHTML = `<span>Save Deposit Payment</span>${spinner.outerHTML}`;
    }
}

// =================================================================
//                 11. FLEET MANAGEMENT MODULE (SIMPLIFIED)
// =================================================================

function handleFleetManagement() {
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-8 text-primary-blue animate-fade-in">Fleet Management Dashboard</h2>
        <div class="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-400 animate-fade-in" style="animation-delay: 100ms">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center shadow-sm">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <p class="text-gray-800 font-semibold text-lg">Fleet Management Features:</p>
            </div>
            <ul class="list-disc pl-5 space-y-2 text-gray-700">
                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-yellow-500 rounded-full"></span> Track vehicles from shipment to delivery</li>
                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-yellow-500 rounded-full"></span> Monitor ETA (Estimated Time of Arrival)</li>
                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-yellow-500 rounded-full"></span> Update status and add comments for each stage</li>
                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-yellow-500 rounded-full"></span> View status history for each vehicle</li>
                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-yellow-500 rounded-full"></span> Real-time updates using Firestore</li>
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
        showErrorToast("Please enter at least 2 characters to search");
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
        showErrorToast("Error: Please try searching again.");
        return;
    }
    
    resultsList.innerHTML = createShimmerLoader(3);
    searchResultsDiv.classList.remove('hidden');
    searchResultsDiv.style.opacity = '1';
    searchResultsDiv.style.transition = 'opacity 0.3s ease-in';
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
            <div class="text-center p-8 bg-red-50 rounded-lg border border-red-200 animate-fade-in">
                <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <p class="text-red-600 font-semibold mb-2">Search Error</p>
                <p class="text-sm text-gray-600 mt-2">${error.message}</p>
                <button onclick="clearSearch()" class="mt-4 bg-primary-blue hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md transition duration-150">
                    Return to Document Generator
                </button>
            </div>
        `;
        showErrorToast("Error searching documents. Please try again.");
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

    // Show loading state in dropdown
    bankSelect.innerHTML = '<option value="" disabled selected>Loading banks...</option>';

    try {
        const snapshot = await db.collection("bankDetails").orderBy("createdAt", "desc").get();
        
        // Clear existing options
        bankSelect.innerHTML = '<option value="" disabled selected>Select Bank</option>';
        
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

        // Add cash option
        const cashOption = document.createElement('option');
        cashOption.value = "Cash";
        cashOption.textContent = "Cash";
        bankSelect.appendChild(cashOption);

    } catch (error) {
        console.error("Error loading banks for modal:", error);
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Error loading banks";
        option.disabled = true;
        bankSelect.innerHTML = '';
        bankSelect.appendChild(option);
    }
}

/**
 * Adds a payment to an existing receipt
 */
function addPaymentToExistingReceipt(receiptDocId, receiptNumber, clientName, exchangeRate = 130) {
    const modalHtml = `
        <div id="add-payment-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white animate-fade-in">
                <h3 class="text-lg font-semibold text-primary-blue mb-4">Add Payment to Receipt</h3>
                <p class="text-sm mb-3">
                    <strong>Receipt:</strong> ${receiptNumber}<br>
                    <strong>Client:</strong> ${clientName}<br>
                    <strong>Exchange Rate:</strong> USD 1 = KES ${exchangeRate}
                </p>
                <form id="add-payment-form" onsubmit="event.preventDefault(); saveAdditionalPayment('${receiptDocId}', '${receiptNumber}', ${exchangeRate})">
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Payment Date</label>
                        <input type="date" id="paymentDate" required value="${new Date().toISOString().slice(0, 10)}" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Amount</label>
                        <div class="grid grid-cols-3 gap-2">
                            <select id="paymentCurrency" required class="p-2 border rounded-md transition duration-200">
                                <option value="KSH">KSH</option>
                                <option value="USD">USD</option>
                            </select>
                            <input type="number" id="paymentAmount" step="0.01" required placeholder="Amount" class="col-span-2 p-2 border rounded-md transition duration-200">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Exchange Rate (USD 1 = KES)</label>
                        <input type="number" id="paymentExchangeRate" step="0.01" required value="${exchangeRate}" class="w-full p-2 border rounded-md transition duration-200">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Bank Used</label>
                        <select id="paymentBankUsed" required class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                            <option value="" disabled selected>Select Bank</option>
                            <option value="Cash">Cash</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Reference/Description</label>
                        <input type="text" id="paymentDescription" required placeholder="e.g., Balance Payment, Additional Payment" class="mt-1 block w-full p-2 border rounded-md transition duration-200">
                    </div>
                    <div class="mb-4 p-2 bg-yellow-50 rounded">
                        <p class="text-xs text-gray-600">
                            <strong>Note:</strong> Amount will be auto-converted using exchange rate: USD 1 = KES ${exchangeRate}
                        </p>
                    </div>
                    <div class="flex justify-end space-x-3">
                       <button type="button" onclick="(() => { const modal = document.getElementById('add-payment-modal'); if (modal) modal.remove(); })()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-150">
                            Cancel
                        </button>
                        <button type="submit" id="save-payment-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 flex items-center justify-center gap-2">
                            <span>Add Payment</span>
                            <svg id="payment-spinner" class="hidden w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
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
    
    // Show loading state
    const saveButton = document.getElementById('save-payment-btn');
    const spinner = document.getElementById('payment-spinner');
    if (saveButton && spinner) {
        saveButton.disabled = true;
        spinner.classList.remove('hidden');
        saveButton.innerHTML = `<span>Saving...</span>${spinner.outerHTML}`;
    }
    
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentCurrency = document.getElementById('paymentCurrency').value;
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentExchangeRate = parseFloat(document.getElementById('paymentExchangeRate').value);
    const paymentBankUsed = document.getElementById('paymentBankUsed').value;
    const paymentDescription = document.getElementById('paymentDescription').value;
    
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        showErrorToast("Please enter a valid payment amount.");
        resetPaymentSaveButton(saveButton, spinner);
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
        
        resetPaymentSaveButton(saveButton, spinner);
        showSuccessToast(`Additional payment of ${paymentCurrency} ${paymentAmount.toFixed(2)} added successfully!`);
        
        // Refresh the view
        if (document.getElementById('receipt-balances-list')) {
            fetchAllReceiptBalances();
        } else {
            fetchReceipts();
        }
        
    } catch (error) {
        console.error("Error saving additional payment:", error);
        resetPaymentSaveButton(saveButton, spinner);
        showErrorToast("Failed to save payment: " + error.message);
    }
}

// Helper function to reset payment save button
function resetPaymentSaveButton(saveButton, spinner) {
    if (saveButton && spinner) {
        saveButton.disabled = false;
        spinner.classList.add('hidden');
        saveButton.innerHTML = `<span>Add Payment</span>${spinner.outerHTML}`;
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
    
    const loadingOverlay = showLoadingOverlay("Revoking receipt...");
    
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
        
        hideLoadingOverlay();
        showSuccessToast(`Receipt ${receiptData.receiptId} has been revoked and associated payments deleted.`);
        
        // Refresh the view
        if (document.getElementById('recent-receipts')) {
            fetchReceipts();
        }
        
    } catch (error) {
        console.error("Error revoking receipt:", error);
        hideLoadingOverlay();
        showErrorToast("Failed to revoke receipt: " + error.message);
    }
}

/**
 * Creates an additional invoice based on an existing invoice
 */
function createAdditionalInvoice(invoiceData) {
    // Check if invoice is revoked
    if (invoiceData.revoked) {
        showErrorToast("Cannot create additional invoice from a revoked invoice.");
        return;
    }
    
    // Navigate to invoice form and pre-populate with existing data
    renderInvoiceForm();
    
    // Show loading indicator
    const loadingOverlay = showLoadingOverlay("Loading invoice data...");
    
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
            const auctionPriceCurrencyField = document.getElementById('auctionPriceCurrency');
            if (auctionPriceField) auctionPriceField.value = invoiceData.auctionPrice || invoiceData.pricing.totalUSD || '';
            if (auctionPriceCurrencyField) auctionPriceCurrencyField.value = invoiceData.auctionPriceCurrency || 'USD';
        }
        
        autoFillBuyerConfirmation();
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        // Show notification
        setTimeout(() => {
            showSuccessToast(`Invoice ${invoiceData.invoiceId} data has been loaded. You can now modify and save as a new invoice.`);
        }, 300);
        
    }, 500);
}

/**
 * Renders receipt balances view
 */
function renderReceiptBalancesView() {
    const formArea = document.getElementById('document-form-area');
    formArea.innerHTML = `
        <div class="p-6 border border-gray-300 rounded-xl bg-white shadow-lg animate-fade-in">
            <h3 class="text-xl font-semibold mb-6 text-primary-blue">Receipt Balances</h3>
            <div id="receipt-balances-list">
                ${createShimmerLoader(3)}
            </div>
        </div>
    `;
    fetchAllReceiptBalances();
}

/**
 * Fetches all receipt balances
 */
async function fetchAllReceiptBalances() {
    const listElement = document.getElementById('receipt-balances-list');
    let html = ``;
    try {
        const snapshot = await db.collection("receipts").orderBy("createdAt", "desc").get();
        if (snapshot.empty) {
            listElement.innerHTML = `
                <div class="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="text-gray-500">No receipts found.</p>
                </div>
            `;
            return;
        }
        
        html = `<div class="space-y-4">`;
        
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

            const remainingUSD = data.balanceDetails?.balanceRemainingUSD || 0;
            const remainingKSH = data.balanceDetails?.balanceRemainingKSH || remainingUSD * (data.exchangeRate || 130);
            const isFullyPaid = remainingUSD <= 0;
            const animationDelay = snapshot.docs.indexOf(doc) * 50;
            
            html += `<div class="p-4 border rounded-lg ${isFullyPaid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} animate-fade-in" style="animation-delay: ${animationDelay}ms">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800 text-lg mb-1">${data.receiptId}</h4>
                        <p class="text-sm text-gray-600 mb-2">Client: ${data.receivedFrom}</p>
                        ${data.invoiceReference ? `<p class="text-sm text-primary-blue mb-2">Invoice Ref: ${data.invoiceReference}</p>` : ''}
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p><strong>Total Paid (USD):</strong> ${totalPaidUSD.toFixed(2)}</p>
                                <p><strong>Total Paid (KES):</strong> ${totalPaidKSH.toFixed(2)}</p>
                            </div>
                            <div class="${isFullyPaid ? 'text-green-600' : 'text-red-600'}">
                                <p><strong>Remaining (USD):</strong> ${remainingUSD.toFixed(2)}</p>
                                <p><strong>Remaining (KES):</strong> ${remainingKSH.toFixed(2)}</p>
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">Payments: ${balances.paymentCount} | Last updated: ${data.receiptDate || 'N/A'}</p>
                    </div>
                    <div class="ml-4 flex flex-col gap-2">
                        <button onclick='addPaymentToReceipt(${receiptDataJson})' 
                                class="bg-primary-blue hover:bg-blue-700 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Add Payment
                        </button>
                        <button onclick='viewReceiptPaymentDetails("${doc.id}", "${data.receiptId}", "${data.receivedFrom}")' 
                                class="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-full transition duration-150 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            History
                        </button>
                    </div>
                </div>
            </div>`;
        }
        
        html += `</div>`;
        listElement.innerHTML = html;
    } catch (error) {
        console.error("Error fetching receipt balances:", error);
        listElement.innerHTML = `
            <div class="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 font-semibold">Error loading receipt balances</p>
                <p class="text-xs text-gray-600 mt-1">${error.message}</p>
            </div>
        `;
    }
}

// =================================================================
//                 GLOBAL FUNCTIONS FOR BACKDATING
// =================================================================

// Global function to toggle backdate panel
window.toggleBackdatePanel = toggleBackdatePanel;
window.hideBackdatePanel = hideBackdatePanel;
window.applyBackdate = applyBackdate;
window.clearBackdate = clearBackdate;
