<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Storefront. Data is currently frontend-only mock data (see
// resources/js/data/products.js) — these routes just forward whatever the
// URL says so pages are reachable and shareable; once a real catalog exists
// behind these, swap the mock lookups in the React pages for real props.

Route::get('/', function () {
    return Inertia::render('Storefront/Home');
})->name('home');

Route::get('/shop', function (Request $request) {
    return Inertia::render('Storefront/Catalog', [
        'category' => $request->query('category', 'All'),
        'onlyNew' => $request->boolean('new'),
        'collection' => $request->query('collection'),
    ]);
})->name('shop');

Route::get('/products/{product}', function (string $product) {
    return Inertia::render('Storefront/Product', [
        'id' => $product,
    ]);
})->name('products.show');

Route::get('/contact', function () {
    return Inertia::render('Storefront/Contact');
})->name('contact');

Route::get('/wishlist', function () {
    return Inertia::render('Storefront/Wishlist');
})->name('wishlist');

Route::get('/sale', function () {
    return Inertia::render('Storefront/Sale');
})->name('sale');

Route::get('/returns', function () {
    return Inertia::render('Storefront/Returns');
})->name('returns');

Route::get('/faq', function () {
    return Inertia::render('Storefront/Faq');
})->name('faq');

Route::get('/lookbook', function () {
    return Inertia::render('Storefront/Lookbook');
})->name('lookbook');

Route::get('/lookbook/{collection}/all', function (string $collection) {
    return Inertia::render('Storefront/LookbookGallery', [
        'collection' => $collection,
    ]);
})->name('lookbook.all');

Route::get('/lookbook/{collection}', function (string $collection) {
    return Inertia::render('Storefront/LookbookDetail', [
        'collection' => $collection,
    ]);
})->name('lookbook.show');

Route::get('/checkout', function () {
    return Inertia::render('Storefront/Checkout');
})->name('checkout');

// Admin — a design-preview workspace (no auth yet; matches the discovery
// prototype's `appModeIsAdmin` mock). Dashboard, Orders, and Unified Inbox
// have real content; the rest render a placeholder so the full nav is
// navigable while those sections get built out.
Route::get('/admin', function () {
    return Inertia::render('Admin/Dashboard');
})->name('admin.dashboard');

Route::get('/admin/orders', function () {
    return Inertia::render('Admin/Orders');
})->name('admin.orders');

Route::get('/admin/inbox', function (Request $request) {
    return Inertia::render('Admin/Inbox', [
        'customer' => $request->query('customer'),
    ]);
})->name('admin.inbox');

Route::get('/admin/customers', function () {
    return Inertia::render('Admin/Customers');
})->name('admin.customers');

Route::get('/admin/returns', function () {
    return Inertia::render('Admin/Returns');
})->name('admin.returns');

Route::get('/admin/lookbook', function () {
    return Inertia::render('Admin/Lookbook');
})->name('admin.lookbook');

Route::get('/admin/collections', function () {
    return Inertia::render('Admin/Collections');
})->name('admin.collections');

Route::get('/admin/products', function () {
    return Inertia::render('Admin/Products');
})->name('admin.products');

Route::get('/admin/inventory', function () {
    return Inertia::render('Admin/Inventory');
})->name('admin.inventory');

Route::get('/admin/marketing', function () {
    return Inertia::render('Admin/Marketing');
})->name('admin.marketing');

Route::get('/admin/promotions', function () {
    return Inertia::render('Admin/Promotions');
})->name('admin.promotions');

Route::get('/admin/integrations', function () {
    return Inertia::render('Admin/Integrations');
})->name('admin.integrations');

Route::get('/admin/settings', function () {
    return Inertia::render('Admin/Settings');
})->name('admin.settings');

Route::get('/admin/home-page', function () {
    return Inertia::render('Admin/HomePage');
})->name('admin.home-page');

Route::get('/admin/{section}', function (string $section) {
    $titles = [
        'purchasing' => 'Purchasing',
        'expenses' => 'Expenses',
    ];
    abort_unless(isset($titles[$section]), 404);
    return Inertia::render('Admin/ComingSoon', [
        'title' => $titles[$section],
        'reason' => "Purchasing and expenses belong to the brand's accounting or ERP system (Odoo, QuickBooks, دفترة…) alongside the physical shop's own bookkeeping — rebuilding them here would just duplicate that, not replace it. Product cost price (already tracked per product) is what feeds the real profit math in Meta Ads & Attribution.",
    ]);
})->name('admin.section');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
