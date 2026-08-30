/**
 * Automated API Integration Test Suite for Marketplace MVP
 * 
 * Verifies:
 * - Role authentication & security (Buyer, Seller, Admin)
 * - Self-registration role guard (blocking admin creation)
 * - Listings CRUD & ownership permissions (403 on foreign edit)
 * - Atomic order placement & stock decrement
 * - Insufficient stock rejection
 * - Finite state machine enforcement (Illegal transitions rejected with 400)
 * - Role-gated transitions (403 when buyer tries to approve)
 * - Automatic inventory refund on order rejection
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

let testBuyerCookie = null;
let testSellerCookie = null;
let testSeller2Cookie = null;
let testAdminCookie = null;

let testListingId = null;
let testOrderId = null;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function apiRequest(endpoint, { method = 'GET', body = null, cookie = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers['Cookie'] = cookie;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie = res.headers.get('set-cookie');
  let data = {};
  try {
    data = await res.json();
  } catch (e) {}

  return {
    status: res.status,
    data,
    cookie: setCookie ? setCookie.split(';')[0] : cookie,
  };
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Marketplace MVP API Integration Tests`);
  console.log(`🎯 Target Server: ${BASE_URL}`);
  console.log(`======================================================\n`);

  try {
    // ----------------------------------------------------
    // TEST SUITE 1: Authentication & Role Registration Guards
    // ----------------------------------------------------
    console.log(`\n--- 1. Testing Registration & Login Security ---`);

    const timestamp = Date.now();
    const buyerEmail = `test_buyer_${timestamp}@marketplace.local`;
    const sellerEmail = `test_seller_${timestamp}@marketplace.local`;
    const seller2Email = `test_seller2_${timestamp}@marketplace.local`;

    // 1.1 Register Buyer
    const regBuyer = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Automated Buyer',
        email: buyerEmail,
        password: 'Password123!',
        role: 'buyer',
      },
    });
    assert(regBuyer.status === 201 && regBuyer.data.user.role === 'buyer', 'Buyer self-registration succeeds (201)');

    // 1.2 Register Seller
    const regSeller = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Automated Merchant',
        email: sellerEmail,
        password: 'Password123!',
        role: 'seller',
      },
    });
    assert(regSeller.status === 201 && regSeller.data.user.role === 'seller', 'Seller self-registration succeeds (201)');

    // 1.3 Register Second Seller (for ownership checks)
    const regSeller2 = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Another Merchant',
        email: seller2Email,
        password: 'Password123!',
        role: 'seller',
      },
    });
    assert(regSeller2.status === 201, 'Second seller registration succeeds (201)');

    // 1.4 Attempt Admin Self-Registration (MUST BE BLOCKED)
    const regAdminAttempt = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Malicious Admin',
        email: `hacker_${timestamp}@marketplace.local`,
        password: 'Password123!',
        role: 'admin',
      },
    });
    assert(regAdminAttempt.status === 400, 'Self-assigned Admin registration is strictly blocked (400)');

    // 1.5 Login Buyer
    const loginBuyer = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: buyerEmail, password: 'Password123!' },
    });
    assert(loginBuyer.status === 200 && loginBuyer.cookie, 'Buyer login succeeds with httpOnly cookie');
    testBuyerCookie = loginBuyer.cookie;

    // 1.6 Login Seller 1
    const loginSeller = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: sellerEmail, password: 'Password123!' },
    });
    testSellerCookie = loginSeller.cookie;

    // 1.7 Login Seller 2
    const loginSeller2 = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: seller2Email, password: 'Password123!' },
    });
    testSeller2Cookie = loginSeller2.cookie;

    // 1.8 Login Seeded Admin
    const loginAdmin = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@marketplace.local', password: 'AdminPassword123!' },
    });
    assert(loginAdmin.status === 200, 'Seeded Admin login succeeds');
    testAdminCookie = loginAdmin.cookie;

    // ----------------------------------------------------
    // TEST SUITE 2: Listings & Ownership Authorization
    // ----------------------------------------------------
    console.log(`\n--- 2. Testing Listings Management & Ownership Enforcement ---`);

    // 2.1 Seller creates a listing
    const createListing = await apiRequest('/api/listings', {
      method: 'POST',
      cookie: testSellerCookie,
      body: {
        title: 'Quantum Wireless Earbuds Test',
        description: 'High fidelity audio earbuds with active noise cancellation',
        price: 99.50,
        quantityAvailable: 10,
        isActive: true,
      },
    });
    assert(createListing.status === 201, 'Seller successfully creates a listing (201)');
    testListingId = createListing.data.listing?.id;

    // 2.2 Buyer attempts to create listing (MUST BE FORBIDDEN 403)
    const buyerCreateListing = await apiRequest('/api/listings', {
      method: 'POST',
      cookie: testBuyerCookie,
      body: {
        title: 'Illegal Buyer Listing',
        description: 'Should fail with 403',
        price: 20.00,
        quantityAvailable: 5,
      },
    });
    assert(buyerCreateListing.status === 403, 'Buyer cannot create listings (403 Forbidden)');

    // 2.3 Non-owner seller attempts to edit Seller 1's listing (MUST BE 403)
    const foreignEdit = await apiRequest(`/api/listings/${testListingId}`, {
      method: 'PUT',
      cookie: testSeller2Cookie,
      body: { title: 'Hacked Title' },
    });
    assert(foreignEdit.status === 403, 'Non-owner seller is rejected with 403 on updating foreign listing');

    // 2.4 Owner seller updates own listing
    const ownerEdit = await apiRequest(`/api/listings/${testListingId}`, {
      method: 'PUT',
      cookie: testSellerCookie,
      body: { title: 'Quantum Wireless Earbuds Pro (Updated)' },
    });
    assert(ownerEdit.status === 200, 'Owner seller successfully updates own listing (200)');

    // ----------------------------------------------------
    // TEST SUITE 3: Orders, Transactions & Stock Control
    // ----------------------------------------------------
    console.log(`\n--- 3. Testing Orders & Atomic Stock Management ---`);

    // 3.1 Buyer places order for 3 items
    const orderCreate = await apiRequest('/api/orders', {
      method: 'POST',
      cookie: testBuyerCookie,
      body: {
        listingId: testListingId,
        quantity: 3,
      },
    });
    assert(
      orderCreate.status === 201 && 
      orderCreate.data.order?.status === 'pending' &&
      parseFloat(orderCreate.data.order?.totalPrice) === 298.50,
      'Buyer creates order (201), status is pending, totalPrice computed server-side ($298.50)'
    );
    testOrderId = orderCreate.data.order?.id;

    // 3.2 Verify available stock decremented from 10 to 7
    const listingCheck = await apiRequest(`/api/listings/${testListingId}`);
    assert(
      listingCheck.data.listing?.quantityAvailable === 7,
      'Listing stock atomically decremented from 10 to 7 units'
    );

    // 3.3 Buyer attempts to order more than remaining stock (e.g. 50 units)
    const oversellOrder = await apiRequest('/api/orders', {
      method: 'POST',
      cookie: testBuyerCookie,
      body: {
        listingId: testListingId,
        quantity: 50,
      },
    });
    assert(oversellOrder.status === 400, 'Ordering quantity exceeding stock is rejected (400 Insufficient Stock)');

    // ----------------------------------------------------
    // TEST SUITE 4: Finite State Machine & Role Transitions
    // ----------------------------------------------------
    console.log(`\n--- 4. Testing Order Finite-State Machine & Role Transitions ---`);

    // 4.1 Buyer attempts to approve order (MUST BE 403)
    const buyerApprove = await apiRequest(`/api/orders/${testOrderId}/approve`, {
      method: 'PATCH',
      cookie: testBuyerCookie,
    });
    assert(buyerApprove.status === 403, 'Buyer is forbidden from approving orders (403)');

    // 4.2 Seller attempts to approve order (MUST BE 403 - Admin only)
    const sellerApprove = await apiRequest(`/api/orders/${testOrderId}/approve`, {
      method: 'PATCH',
      cookie: testSellerCookie,
    });
    assert(sellerApprove.status === 403, 'Seller is forbidden from approving orders (403)');

    // 4.3 Admin approves the order (pending -> approved)
    const adminApprove = await apiRequest(`/api/orders/${testOrderId}/approve`, {
      method: 'PATCH',
      cookie: testAdminCookie,
    });
    assert(
      adminApprove.status === 200 && adminApprove.data.order?.status === 'approved',
      'Admin approves order: pending -> approved (200)'
    );

    // 4.4 Illegal transition: Try to approve an already approved order (approved -> approved)
    const duplicateApprove = await apiRequest(`/api/orders/${testOrderId}/approve`, {
      method: 'PATCH',
      cookie: testAdminCookie,
    });
    assert(duplicateApprove.status === 400, 'State Machine rejects duplicate transition approved -> approved (400)');

    // 4.5 Owner Seller completes the approved order (approved -> completed)
    const sellerComplete = await apiRequest(`/api/orders/${testOrderId}/complete`, {
      method: 'PATCH',
      cookie: testSellerCookie,
    });
    assert(
      sellerComplete.status === 200 && sellerComplete.data.order?.status === 'completed',
      'Listing Owner Seller completes order: approved -> completed (200)'
    );

    // 4.6 Illegal transition: Try to reject a completed order (completed -> rejected)
    const illegalReject = await apiRequest(`/api/orders/${testOrderId}/reject`, {
      method: 'PATCH',
      cookie: testAdminCookie,
    });
    assert(illegalReject.status === 400, 'State Machine strictly rejects completed -> rejected (400)');

    // ----------------------------------------------------
    // TEST SUITE 5: Rejection & Stock Restoration
    // ----------------------------------------------------
    console.log(`\n--- 5. Testing Order Rejection & Automatic Stock Refund ---`);

    // 5.1 Place a new order for 4 units (Stock 7 -> 3)
    const secondOrder = await apiRequest('/api/orders', {
      method: 'POST',
      cookie: testBuyerCookie,
      body: {
        listingId: testListingId,
        quantity: 4,
      },
    });
    const secondOrderId = secondOrder.data.order?.id;
    assert(secondOrder.status === 201, 'Placed second test order for 4 units');

    // 5.2 Admin rejects the second order (pending -> rejected)
    const adminReject = await apiRequest(`/api/orders/${secondOrderId}/reject`, {
      method: 'PATCH',
      cookie: testAdminCookie,
    });
    assert(
      adminReject.status === 200 && adminReject.data.order?.status === 'rejected',
      'Admin rejects order: pending -> rejected (200)'
    );

    // 5.3 Verify stock was automatically restored back to 7
    const finalListingCheck = await apiRequest(`/api/listings/${testListingId}`);
    assert(
      finalListingCheck.data.listing?.quantityAvailable === 7,
      'Inventory stock automatically restored back to 7 after order rejection'
    );

  } catch (error) {
    console.error('💥 Unexpected test runner error:', error);
  }

  console.log(`\n======================================================`);
  console.log(`📊 Test Summary: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log(`======================================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
