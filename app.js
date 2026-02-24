// Main Application Logic
let currentPage = 'products';
let allProducts = [];
let allOrders = [];
let allUsers = [];
let allCategories = [];

const MOCK_ORDERS = [
    {
        _id: 'ORD001',
        userId: 'customer1',
        user: {
            name: 'Nguyễn Văn A',
            email: 'a@example.com'
        },
        items: [
            {
                product: {
                    name: 'Áo thun nam basic',
                    image: 'https://via.placeholder.com/60'
                },
                price: 150000,
                quantity: 2
            },
            {
                product: {
                    name: 'Quần jean xanh',
                    image: 'https://via.placeholder.com/60'
                },
                price: 350000,
                quantity: 1
            }
        ],
        totalAmount: 650000,
        status: 'pending',
        createdAt: '2024-01-10T09:15:00Z',
        shippingAddress: 'Số 1 Tràng Tiền, Hoàn Kiếm, Hà Nội'
    },
    {
        _id: 'ORD002',
        userId: 'customer2',
        user: {
            name: 'Trần Thị B',
            email: 'b@example.com'
        },
        items: [
            {
                product: {
                    name: 'Đầm nữ caro',
                    image: 'https://via.placeholder.com/60'
                },
                price: 420000,
                quantity: 1
            }
        ],
        totalAmount: 420000,
        status: 'shipping',
        createdAt: '2024-01-12T14:30:00Z',
        shippingAddress: '12 Lê Lợi, Quận 1, TP. Hồ Chí Minh'
    },
    {
        _id: 'ORD003',
        userId: 'customer3',
        user: {
            name: 'Lê Văn C',
            email: 'c@example.com'
        },
        items: [
            {
                product: {
                    name: 'Giày sneaker trắng',
                    image: 'https://via.placeholder.com/60'
                },
                price: 750000,
                quantity: 1
            },
            {
                product: {
                    name: 'Vớ cổ cao',
                    image: 'https://via.placeholder.com/60'
                },
                price: 50000,
                quantity: 2
            }
        ],
        totalAmount: 850000,
        status: 'delivered',
        createdAt: '2024-01-15T08:00:00Z',
        shippingAddress: '99 Điện Biên Phủ, Đà Nẵng'
    }
];

// Pagination
let currentProductPage = 1;
let currentOrderPage = 1;
let currentUserPage = 1;
const itemsPerPage = 10;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Load user info
    loadUserInfo();

    // Setup navigation
    setupNavigation();

    // Load initial data
    navigateToPage('products');
    loadCategories();

    // Setup modals
    setupModals();
});

// Load user info
function loadUserInfo() {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = user.name || 'Admin';
        }
    }
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
}

// Navigate to page
function navigateToPage(page) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = page;

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const titles = {
                products: 'Sản phẩm',
                orders: 'Đơn hàng',
                users: 'Người dùng',
                categories: 'Danh mục',
                posts: 'Bài viết'
            };
            pageTitle.textContent = titles[page] || 'Sản phẩm';
        }

        // Load page data
        switch(page) {
            case 'products':
                loadProducts();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'users':
                loadUsers();
                break;
            case 'categories':
                loadCategories();
                break;
            case 'posts':
                loadPosts();
                break;
        }
    }
}

// Toggle sidebar (mobile)
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Logout
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        removeAuthToken();
        localStorage.removeItem('admin_user');
        window.location.href = 'index.html';
    }
}

// ===== Dashboard =====
async function loadDashboard() {
    try {
        // Use Mock Data
        const products = MOCK_PRODUCTS;
        const orders = MOCK_ORDERS;
        const users = MOCK_USERS;
        
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalUsers').textContent = users.length;

        // Calculate revenue
        const revenue = orders.reduce((sum, order) => {
            return sum + (order.totalAmount || order.total || 0);
        }, 0);
        document.getElementById('totalRevenue').textContent = formatCurrency(revenue);

        // Load recent orders
        loadRecentOrders(orders.slice(0, 5));

        // Load top products
        loadTopProducts(products);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Không thể tải dữ liệu dashboard', 'error');
    }
}

function loadRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<p class="text-muted">Chưa có đơn hàng nào</p>';
        return;
    }

    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>#${order._id?.substring(0, 8) || 'N/A'}</td>
                        <td>${order.user?.name || order.userId || 'N/A'}</td>
                        <td>${formatCurrency(order.totalAmount || order.total || 0)}</td>
                        <td><span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status)}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

function loadTopProducts(products) {
    const container = document.getElementById('topProducts');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p class="text-muted">Chưa có sản phẩm nào</p>';
        return;
    }

    const topProducts = products.slice(0, 5);
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                </tr>
            </thead>
            <tbody>
                ${topProducts.map(product => `
                    <tr>
                        <td>${product.name || 'N/A'}</td>
                        <td>${formatCurrency(product.price || 0)}</td>
                        <td>${product.stock || 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

// ===== Products =====
let currentProductView = 'active'; // 'active' or 'deleted'

async function loadProducts() {
    try {
        currentProductPage = 1; // Reset to first page
        await loadProductTableData();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Không thể tải danh sách sản phẩm', 'error');
    }
}

function toggleProductView() {
    const viewSelect = document.getElementById('productViewFilter');
    if (viewSelect) {
        currentProductView = viewSelect.value;
        currentProductPage = 1;
        loadProductTableData();
    }
}

async function loadProductTableData() {
    try {
        let baseProducts = [];
        const searchInput = document.getElementById('productSearch');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        const categorySelect = document.getElementById('categoryFilter');
        const categoryId = categorySelect ? categorySelect.value : '';

        if (currentProductView === 'active') {
            const filters = {};
            if (categoryId) filters.category = categoryId;

            const res = await ProductsAPI.getAll(filters);
            const data = res && res.data ? res.data : res;
            if (data && Array.isArray(data.products)) {
                baseProducts = data.products;
            } else if (Array.isArray(data)) {
                baseProducts = data;
            }
        } else {
            const res = await ProductsAPI.getTrash();
            const data = res && res.data ? res.data : res;
            baseProducts = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);

            if (categoryId) {
                baseProducts = baseProducts.filter(p =>
                    p.category?._id === categoryId ||
                    p.category === categoryId ||
                    p.category_id === categoryId
                );
            }

            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                baseProducts = baseProducts.filter(p => p.name?.toLowerCase().includes(term));
            }
        }
        allProducts = baseProducts;
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error loading products table:', error);
        showNotification('Không thể tải danh sách sản phẩm: ' + error.message, 'error');
    }
}

function filterAndRenderProducts() {
    let filtered = Array.isArray(allProducts) ? [...allProducts] : [];
    
    // Then apply other filters if any (search, category)
    // We need to re-apply existing filters
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
    if (searchTerm) {
        filtered = filtered.filter(p => p.name?.toLowerCase().includes(searchTerm));
    }
    
    const categoryId = document.getElementById('categoryFilter')?.value;
    if (categoryId) {
        filtered = filtered.filter(p => 
            p.category?._id === categoryId || 
            p.category === categoryId ||
            p.category_id === categoryId
        );
    }
    
    renderProducts(filtered);
}

function renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Không có sản phẩm nào</td></tr>';
        renderPagination('products', 0);
        return;
    }

    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentProductPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedProducts.map(product => {
        let categoryName = product.category?.name || product.category_name || '';
        if (!categoryName) {
            const catId = product.category?._id || product.category || product.category_id;
            if (catId && Array.isArray(allCategories) && allCategories.length > 0) {
                const matched = allCategories.find(c => c._id === catId || c.id === catId);
                if (matched && matched.name) {
                    categoryName = matched.name;
                }
            }
            if (!categoryName && typeof product.category === 'string') {
                categoryName = product.category;
            }
            if (!categoryName && typeof product.category_id === 'string') {
                categoryName = product.category_id;
            }
        }
        if (!categoryName) categoryName = 'N/A';
        
        let actionButtons = '';
        if (currentProductView === 'active') {
            actionButtons = `
                <button class="action-btn action-btn-edit" onclick="editProduct('${product._id}')">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="action-btn action-btn-delete" onclick="softDeleteProduct('${product._id}')">
                    <i class="fas fa-trash"></i> Xóa tạm
                </button>
            `;
        } else {
            actionButtons = `
                <button class="action-btn action-btn-edit" onclick="restoreProduct('${product._id}')">
                    <i class="fas fa-undo"></i> Khôi phục
                </button>
                <button class="action-btn action-btn-delete" onclick="permanentDeleteProduct('${product._id}')">
                    <i class="fas fa-times"></i> Xóa vĩnh viễn
                </button>
            `;
        }
        
        return `
            <tr>
                <td>${product.name || 'N/A'}</td>
                <td>${categoryName}</td>
                <td>${formatCurrency(product.price || 0)}</td>
                <td>
                    <div class="action-buttons">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    renderPagination('products', totalPages, currentProductPage);
}

async function searchProducts() {
    const searchInput = document.getElementById('productSearch');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    currentProductPage = 1;

    const categorySelect = document.getElementById('categoryFilter');
    const categoryId = categorySelect ? categorySelect.value : '';

    if (!searchTerm) {
        await loadProductTableData();
        return;
    }

    if (currentProductView === 'active') {
        try {
            const res = await ProductsAPI.search(searchTerm);
            const data = res && res.data ? res.data : res;
            let products = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);

            if (categoryId) {
                products = products.filter(p =>
                    p.category?._id === categoryId ||
                    p.category === categoryId ||
                    p.category_id === categoryId
                );
            }

            allProducts = products;
            renderProducts(allProducts);
        } catch (error) {
            showNotification('Không thể tìm kiếm sản phẩm: ' + error.message, 'error');
        }
    } else {
        await loadProductTableData();
    }
}

async function filterProducts() {
    currentProductPage = 1;
    const searchInput = document.getElementById('productSearch');
    const searchTerm = searchInput ? searchInput.value.trim() : '';

    if (currentProductView === 'active' && searchTerm) {
        await searchProducts();
    } else {
        await loadProductTableData();
    }
}

function openAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Thêm sản phẩm mới';
    document.getElementById('productSubmitText').textContent = 'Thêm sản phẩm';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    clearImagePreview();
    openModal('productModal');
}

async function editProduct(id) {
    try {
        // Ưu tiên dữ liệu đã tải, nếu không có thì gọi API chi tiết
        let product = allProducts.find(p => p._id === id);
        if (!product) {
            const res = await ProductsAPI.getById(id);
            product = res && res.data ? res.data : res;
            if (!product) {
                showNotification('Không tìm thấy sản phẩm', 'error');
                return;
            }
        }
        
        document.getElementById('productModalTitle').textContent = 'Sửa sản phẩm';
        document.getElementById('productSubmitText').textContent = 'Cập nhật';
        document.getElementById('productId').value = product._id;
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price || 0;
        document.getElementById('productCategory').value = product.category?._id || product.category || '';
        document.getElementById('productImage').value = product.image || '';
        
        // Show image preview if exists
        if (product.image) {
            document.getElementById('previewImg').src = product.image;
            document.getElementById('imagePreview').style.display = 'block';
            uploadedImageUrl = product.image;
        } else {
            clearImagePreview();
        }
        
        openModal('productModal');
    } catch (error) {
        showNotification('Không thể tải thông tin sản phẩm', 'error');
    }
}

async function softDeleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa tạm thời sản phẩm này?')) return;
    try {
        await ProductsAPI.softDelete(id);
        showNotification('Đã chuyển sản phẩm vào thùng rác', 'success');
        const viewSelect = document.getElementById('productViewFilter');
        if (viewSelect) {
            viewSelect.value = 'deleted';
            currentProductView = 'deleted';
        }
        await loadProductTableData();
    } catch (error) {
        showNotification('Lỗi xóa tạm sản phẩm: ' + error.message, 'error');
    }
}

async function restoreProduct(id) {
    try {
        await ProductsAPI.restore(id);
        showNotification('Đã khôi phục sản phẩm', 'success');
        const viewSelect = document.getElementById('productViewFilter');
        if (viewSelect) {
            viewSelect.value = 'active';
            currentProductView = 'active';
        }
        await loadProductTableData();
    } catch (error) {
        showNotification('Lỗi khôi phục sản phẩm: ' + error.message, 'error');
    }
}

async function permanentDeleteProduct(id) {
    if (!confirm('Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa vĩnh viễn?')) return;
    try {
        await ProductsAPI.forceDelete(id);
        showNotification('Đã xóa vĩnh viễn sản phẩm', 'success');
        await loadProductTableData();
    } catch (error) {
        showNotification('Lỗi xóa vĩnh viễn sản phẩm: ' + error.message, 'error');
    }
}

// Remove old deleteProduct function
// async function deleteProduct(id) { ... }

// Product form submit
let uploadedImageUrl = null;

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('Vui lòng chọn file ảnh', 'warning');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
        showNotification('Kích thước ảnh không được vượt quá 5MB', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        showNotification('Đang upload ảnh...', 'info');
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload thất bại');
        }

        const data = await response.json();
        uploadedImageUrl = `http://localhost:3000${data.path}`;
        
        // Show preview
        document.getElementById('previewImg').src = uploadedImageUrl;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('productImage').value = uploadedImageUrl;
        
        showNotification('Upload ảnh thành công', 'success');
    } catch (error) {
        showNotification('Không thể upload ảnh: ' + error.message, 'error');
    }
}

function clearImagePreview() {
    uploadedImageUrl = null;
    document.getElementById('productImageFile').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('imagePreview').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const productId = document.getElementById('productId').value;
            const categoryId = document.getElementById('productCategory').value;
            const imageUrl = uploadedImageUrl || document.getElementById('productImage').value || '';
            const productData = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: parseFloat(document.getElementById('productPrice').value),
                category: categoryId,
                category_id: categoryId,
                image: imageUrl || undefined,
                image_url: imageUrl || undefined
            };

            try {
                if (productId) {
                    await ProductsAPI.update(productId, productData);
                    showNotification('Cập nhật sản phẩm thành công', 'success');
                } else {
                    await ProductsAPI.create(productData);
                    showNotification('Thêm sản phẩm thành công', 'success');
                }
                clearImagePreview();
                closeModal('productModal');
                loadProducts();
            } catch (error) {
                showNotification(error.message || 'Có lỗi xảy ra', 'error');
            }
        });
    }

    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const idEl = document.getElementById('postId');
            const titleInput = document.getElementById('postTitle');
            const contentInput = document.getElementById('postContent');
            const statusEl = document.getElementById('postStatus');
            const imageUrlEl = document.getElementById('postImageUrl');
            const imageLinkEl = document.getElementById('postImageLink');
            const imageUrlValue = imageLinkEl && imageLinkEl.value.trim()
                ? imageLinkEl.value.trim()
                : (imageUrlEl ? imageUrlEl.value : '');
            const payload = {
                title: titleInput ? titleInput.value.trim() : '',
                content: contentInput ? contentInput.value.trim() : '',
                status: statusEl ? Number(statusEl.value) : 1,
                image_url: imageUrlValue
            };
            try {
                if (idEl && idEl.value) {
                    await PostsAPI.update(idEl.value, payload);
                    showNotification('Cập nhật bài viết thành công', 'success');
                } else {
                    await PostsAPI.create(payload);
                    showNotification('Thêm bài viết thành công', 'success');
                }
                closeModal('postModal');
                loadPosts();
            } catch (error) {
                showNotification(error.message || 'Không thể lưu bài viết', 'error');
            }
        });
    }
});

// ===== Orders =====
async function loadOrders() {
    try {
        // Mock data
        allOrders = MOCK_ORDERS;
        currentOrderPage = 1; // Reset to first page
        renderOrders(allOrders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Không thể tải danh sách đơn hàng', 'error');
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không có đơn hàng nào</td></tr>';
        renderPagination('orders', 0);
        return;
    }

    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const startIndex = (currentOrderPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedOrders.map(order => {
        const orderId = order._id?.substring(0, 8) || 'N/A';
        const customerName = order.user?.name || order.userId || 'N/A';
        const itemCount = order.items?.length || 0;
        const total = order.totalAmount || order.total || 0;
        const status = order.status || 'pending';
        const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A';

        return `
            <tr>
                <td>#${orderId}</td>
                <td>${customerName}</td>
                <td>${itemCount} sản phẩm</td>
                <td>${formatCurrency(total)}</td>
                <td><span class="status-badge status-${status}">${getStatusText(status)}</span></td>
                <td>${createdAt}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-edit" onclick="viewOrder('${order._id}')">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                        <button class="action-btn action-btn-delete" onclick="deleteOrder('${order._id}')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    renderPagination('orders', totalPages, currentOrderPage);
}

function filterOrders() {
    const status = document.getElementById('orderStatusFilter').value;
    let filtered = allOrders;
    
    if (status) {
        filtered = allOrders.filter(o => o.status === status);
    }
    
    renderOrders(filtered);
}

async function viewOrder(id) {
    try {
        const response = await OrdersAPI.getDetail(id);
        const order = response.data?.data || response.data;
        
        const itemsHtml = order.items?.map(item => {
            const product = item.product || {};
            return `
                <div class="order-item">
                    <img src="${product.image || 'https://via.placeholder.com/60'}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/60'">
                    <div class="order-item-info">
                        <h4>${product.name || 'N/A'}</h4>
                        <p>Giá: ${formatCurrency(item.price || 0)} x ${item.quantity || 0}</p>
                    </div>
                    <div class="order-item-total">
                        ${formatCurrency((item.price || 0) * (item.quantity || 0))}
                    </div>
                </div>
            `;
        }).join('') || '<p class="text-muted">Không có sản phẩm</p>';
        
        const content = `
            <div class="order-detail">
                <div class="order-info-section">
                    <h4>Thông tin đơn hàng</h4>
                    <div class="info-row">
                        <span class="info-label">Mã đơn:</span>
                        <span class="info-value">#${order._id?.substring(0, 8) || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Khách hàng:</span>
                        <span class="info-value">${order.user?.name || order.userId || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${order.user?.email || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Ngày đặt:</span>
                        <span class="info-value">${order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Trạng thái:</span>
                        <span class="info-value">
                            <span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status)}</span>
                        </span>
                    </div>
                </div>

                <div class="order-info-section">
                    <h4>Địa chỉ giao hàng</h4>
                    <p>${order.shippingAddress || 'N/A'}</p>
                </div>

                <div class="order-info-section">
                    <h4>Sản phẩm</h4>
                    <div class="order-items-list">
                        ${itemsHtml}
                    </div>
                </div>

                <div class="order-info-section">
                    <div class="order-total">
                        <span class="total-label">Tổng tiền:</span>
                        <span class="total-amount">${formatCurrency(order.totalAmount || order.total || 0)}</span>
                    </div>
                </div>

                <div class="order-info-section">
                    <h4>Cập nhật trạng thái</h4>
                    <select id="orderStatusSelect" class="form-control" style="margin-bottom: 15px;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
                        <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>Đang giao</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Đã giao</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                    <button class="btn-primary" onclick="updateOrderStatus('${order._id}')">
                        <i class="fas fa-save"></i> Cập nhật trạng thái
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('orderDetailContent').innerHTML = content;
        openModal('orderDetailModal');
    } catch (error) {
        showNotification('Không thể tải chi tiết đơn hàng', 'error');
    }
}

async function updateOrderStatus(orderId) {
    const status = document.getElementById('orderStatusSelect').value;
    if (!status) {
        showNotification('Vui lòng chọn trạng thái', 'warning');
        return;
    }

    try {
        await OrdersAPI.updateStatus(orderId, status);
        showNotification('Cập nhật trạng thái đơn hàng thành công', 'success');
        closeModal('orderDetailModal');
        loadOrders();
    } catch (error) {
        showNotification('Không thể cập nhật trạng thái', 'error');
    }
}

async function deleteOrder(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;

    try {
        await OrdersAPI.delete(id);
        showNotification('Xóa đơn hàng thành công', 'success');
        loadOrders();
    } catch (error) {
        showNotification('Không thể xóa đơn hàng', 'error');
    }
}

// ===== Users =====
let currentUserView = 'active'; // 'active' or 'deleted'

async function loadUsers() {
    try {
        const res = await UsersAPI.getAll();
        let rawUsers = [];

        if (Array.isArray(res)) {
            rawUsers = res;
        } else if (Array.isArray(res.users)) {
            rawUsers = res.users;
        } else if (Array.isArray(res.data)) {
            rawUsers = res.data;
        } else if (res.data && Array.isArray(res.data.users)) {
            rawUsers = res.data.users;
        }

        allUsers = rawUsers.map(u => {
            const numericStatus = typeof u.status === 'number'
                ? u.status
                : (u.status === 'blocked' ? 0 : 1);
            const isLocked = u.isLocked
                || u.locked
                || u.status === 'blocked'
                || numericStatus === 0
                || false;
            return {
                _id: u._id || u.id || u.user_id || '',
                name: u.name || u.full_name || u.username || u.email || 'N/A',
                email: u.email || '',
                role: u.role || 'user',
                status: numericStatus,
                isLocked,
                isDeleted: u.isDeleted || u.deleted || false,
                createdAt: u.createdAt || u.created_at || null
            };
        });

        currentUserPage = 1; // Reset to first page
        filterAndRenderUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Không thể tải danh sách người dùng: ' + (error.message || ''), 'error');
    }
}

function toggleUserView() {
    const viewSelect = document.getElementById('userViewFilter');
    if (viewSelect) {
        currentUserView = viewSelect.value;
        currentUserPage = 1;
        filterAndRenderUsers();
    }
}

function filterAndRenderUsers() {
    let filtered = [];
    if (currentUserView === 'active') {
        filtered = allUsers.filter(u => !u.isDeleted);
    } else {
        filtered = allUsers.filter(u => u.isDeleted);
    }
    renderUsers(filtered);
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có người dùng nào</td></tr>';
        renderPagination('users', 0);
        return;
    }

    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentUserPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    let currentAdmin = null;
    let currentAdminId = null;
    let currentAdminEmail = null;
    let currentIsSuperAdmin = false;
    try {
        const adminStr = localStorage.getItem('admin_user');
        if (adminStr) {
            currentAdmin = JSON.parse(adminStr);
            currentAdminId = currentAdmin._id || currentAdmin.id || null;
            currentAdminEmail = currentAdmin.email || null;
            currentIsSuperAdmin = !!(currentAdmin.is_super_admin || currentAdmin.isSuperAdmin);
        }
    } catch (_) {}

    const paginatedUsers = users.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedUsers.map(user => {
        const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A';
        const role = user.role || 'user';
        const roleBadge = role === 'admin' ? '<span class="status-badge status-confirmed">Admin</span>' : '<span class="status-badge status-pending">User</span>';
        
        let statusBadge = '';
        if (user.isLocked) {
            statusBadge = '<span class="status-badge status-cancelled">Đã khóa</span>';
        } else {
            statusBadge = '<span class="status-badge status-delivered">Hoạt động</span>';
        }

        const isAdminUser = String(role).toLowerCase() === 'admin';
        const isSelf =
            (currentAdminId && (user._id === currentAdminId || user.id === currentAdminId)) ||
            (currentAdminEmail && user.email === currentAdminEmail);

        let actionButtons = '';
        if (currentUserView === 'active') {
            const lockIcon = user.isLocked ? 'fa-unlock' : 'fa-lock';
            const lockText = user.isLocked ? 'Mở khóa' : 'Khóa';
            const editBtn = `
                <button class="action-btn action-btn-edit" onclick="editUser('${user._id}')">
                    <i class="fas fa-edit"></i> Sửa
                </button>
            `;
            const manageBtns = `
                <button class="action-btn action-btn-warning" onclick="toggleLockUser('${user._id}')" title="${lockText}">
                    <i class="fas ${lockIcon}"></i>
                </button>
                <button class="action-btn action-btn-delete" onclick="softDeleteUser('${user._id}')">
                    <i class="fas fa-trash"></i> Xóa tạm
                </button>
            `;

            if (isSelf) {
                // Không được tự khóa/xóa chính mình
                actionButtons = editBtn;
            } else if (isAdminUser && !currentIsSuperAdmin) {
                // Admin thường: không được khóa/xóa admin khác
                actionButtons = editBtn;
            } else {
                // Super admin khóa/xóa admin khác, hoặc admin với user thường
                actionButtons = editBtn + manageBtns;
            }
        } else {
            actionButtons = `
                <button class="action-btn action-btn-edit" onclick="restoreUser('${user._id}')">
                    <i class="fas fa-undo"></i> Khôi phục
                </button>
                <button class="action-btn action-btn-delete" onclick="permanentDeleteUser('${user._id}')">
                    <i class="fas fa-times"></i> Xóa vĩnh viễn
                </button>
            `;
        }

        return `
            <tr>
                <td>${user.name || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>${createdAt}</td>
                <td>
                    <div class="action-buttons">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    renderPagination('users', totalPages, currentUserPage);
}

function openAddUserModal() {
    document.getElementById('userModalTitle').textContent = 'Thêm người dùng mới';
    document.getElementById('userSubmitText').textContent = 'Thêm người dùng';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('passwordHint').style.display = 'none';
    document.getElementById('userPassword').required = true;
    openModal('userModal');
}

async function editUser(id) {
    const user = allUsers.find(u => u._id === id);
    if (!user) return;
    
    document.getElementById('userModalTitle').textContent = 'Sửa người dùng';
    document.getElementById('userSubmitText').textContent = 'Cập nhật';
    document.getElementById('userId').value = user._id;
    document.getElementById('userNameInput').value = user.name || '';
    document.getElementById('userEmail').value = user.email || '';
    document.getElementById('userRole').value = user.role || 'user';
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').required = false;
    document.getElementById('passwordHint').style.display = 'block';
    
    openModal('userModal');
}

async function softDeleteUser(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa tạm thời người dùng này?')) return;
    const index = allUsers.findIndex(u => u._id === id);
    if (index !== -1) {
        allUsers[index].isDeleted = true;
        showNotification('Đã chuyển người dùng vào danh sách xóa', 'success');
        filterAndRenderUsers();
    }
}

async function restoreUser(id) {
    const index = allUsers.findIndex(u => u._id === id);
    if (index !== -1) {
        allUsers[index].isDeleted = false;
        showNotification('Đã khôi phục người dùng', 'success');
        filterAndRenderUsers();
    }
}

async function permanentDeleteUser(id) {
    if (!confirm('Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa vĩnh viễn?')) return;
    const index = allUsers.findIndex(u => u._id === id);
    if (index !== -1) {
        allUsers.splice(index, 1);
        showNotification('Đã xóa vĩnh viễn người dùng', 'success');
        filterAndRenderUsers();
    }
}

async function toggleLockUser(id) {
    const index = allUsers.findIndex(u => u._id === id);
    if (index !== -1) {
        const user = allUsers[index];
        const currentlyLocked = !!user.isLocked || user.status === 0;
        const nextStatus = currentlyLocked ? 1 : 0;
        try {
            await UsersAPI.updateStatus(id, nextStatus);
            user.status = nextStatus;
            user.isLocked = nextStatus === 0;
            const msg = nextStatus === 0 ? 'Đã khóa tài khoản người dùng' : 'Đã mở khóa tài khoản người dùng';
            showNotification(msg, 'success');
            filterAndRenderUsers();
        } catch (error) {
            showNotification(error.message || 'Không thể cập nhật trạng thái tài khoản', 'error');
        }
    }
}

// ===== Categories =====
let currentCategoryView = 'active'; // 'active' or 'deleted'

async function loadCategories() {
    try {
        // Fetch active categories for dropdowns (needed globally or for products)
        const res = await CategoriesAPI.getAll();
        const activeCategories = Array.isArray(res) ? res : (res.data || []);
        
        // Update global variable if used elsewhere
        allCategories = activeCategories;

        // Populate category select in product form
        const categorySelect = document.getElementById('productCategory');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Chọn danh mục</option>' +
                activeCategories.map(cat => 
                    `<option value="${cat._id}">${cat.name}</option>`
                ).join('');
        }
        
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>' +
                activeCategories.map(cat => 
                    `<option value="${cat._id}">${cat.name}</option>`
                ).join('');
        }
        
        // Render categories table if on categories page
        if (currentPage === 'categories') {
            await loadCategoryTableData();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Không thể tải danh mục: ' + error.message, 'error');
    }
}

async function toggleCategoryView() {
    const viewSelect = document.getElementById('categoryViewFilter');
    if (viewSelect) {
        currentCategoryView = viewSelect.value;
        await loadCategoryTableData();
    }
}

async function loadCategoryTableData() {
    try {
        let categories = [];
        if (currentCategoryView === 'active') {
             const res = await CategoriesAPI.getAll();
             categories = Array.isArray(res) ? res : (res.data || []);
        } else {
             const res = await CategoriesAPI.getTrash();
             categories = Array.isArray(res) ? res : (res.data || []);
        }
        renderCategories(categories);
    } catch(e) {
        showNotification('Lỗi tải dữ liệu bảng: ' + e.message, 'error');
    }
}

// Removed filterAndRenderCategories as it is replaced by loadCategoryTableData

function renderCategories(categories) {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    if (!categories || categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Không có danh mục nào</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(category => {
        const createdAtRaw = category.createdAt || category.created_at;
        const createdAt = createdAtRaw ? new Date(createdAtRaw).toLocaleDateString('vi-VN') : 'N/A';
        
        let actionButtons = '';
        if (currentCategoryView === 'active') {
            actionButtons = `
                <button class="action-btn action-btn-edit" onclick="editCategory('${category._id}')">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="action-btn action-btn-delete" onclick="softDeleteCategory('${category._id}')">
                    <i class="fas fa-trash"></i> Xóa tạm
                </button>
            `;
        } else {
            actionButtons = `
                <button class="action-btn action-btn-edit" onclick="restoreCategory('${category._id}')">
                    <i class="fas fa-undo"></i> Khôi phục
                </button>
                <button class="action-btn action-btn-delete" onclick="permanentDeleteCategory('${category._id}')">
                    <i class="fas fa-times"></i> Xóa vĩnh viễn
                </button>
            `;
        }

        return `
            <tr>
                <td>${category.name || 'N/A'}</td>
                <td>${category.description || category.slug || 'N/A'}</td>
                <td>${createdAt}</td>
                <td>
                    <div class="action-buttons">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddCategoryModal() {
    const form = document.getElementById('categoryForm');
    if (!form) return;
    form.reset();
    form.removeAttribute('data-category-id');
    const titleEl = document.getElementById('categoryModalTitle');
    const submitTextEl = document.getElementById('categorySubmitText');
    if (titleEl) titleEl.textContent = 'Thêm danh mục mới';
    if (submitTextEl) submitTextEl.textContent = 'Thêm danh mục';
    openModal('categoryModal');
}

async function editCategory(id) {
    try {
        const res = await CategoriesAPI.getById(id);
        const category = res && res.data ? res.data : res;
        if (!category || !category._id) {
            showNotification('Không tìm thấy danh mục', 'error');
            return;
        }
        
        document.getElementById('categoryName').value = category.name || '';
        document.getElementById('categoryDescription').value = category.description || '';
        
        const form = document.getElementById('categoryForm');
        if (form) {
            form.setAttribute('data-category-id', id);
        }
        const titleEl = document.getElementById('categoryModalTitle');
        const submitTextEl = document.getElementById('categorySubmitText');
        if (titleEl) titleEl.textContent = 'Sửa danh mục';
        if (submitTextEl) submitTextEl.textContent = 'Cập nhật danh mục';
        openModal('categoryModal');
    } catch (error) {
        showNotification('Lỗi khi tải thông tin danh mục: ' + error.message, 'error');
    }
}

async function softDeleteCategory(id) {
    if (!confirm('Bạn có chắc chắn muốn chuyển danh mục vào thùng rác?')) return;
    
    try {
        await CategoriesAPI.softDelete(id);
        showNotification('Đã chuyển danh mục vào thùng rác', 'success');
        const viewSelect = document.getElementById('categoryViewFilter');
        if (viewSelect) {
            viewSelect.value = 'deleted';
            currentCategoryView = 'deleted';
        }
        await loadCategoryTableData();
    } catch (error) {
        showNotification('Lỗi xóa danh mục: ' + error.message, 'error');
    }
}

async function restoreCategory(id) {
    try {
        await CategoriesAPI.restore(id);
        showNotification('Đã khôi phục danh mục', 'success');
        const viewSelect = document.getElementById('categoryViewFilter');
        if (viewSelect) {
            viewSelect.value = 'active';
            currentCategoryView = 'active';
        }
        await loadCategoryTableData();
    } catch (error) {
        showNotification('Lỗi khôi phục danh mục: ' + error.message, 'error');
    }
}

async function permanentDeleteCategory(id) {
    if (!confirm('Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa vĩnh viễn?')) return;
    
    try {
        await CategoriesAPI.forceDelete(id);
        showNotification('Đã xóa vĩnh viễn danh mục', 'success');
        await loadCategoryTableData();
    } catch (error) {
        showNotification('Lỗi xóa vĩnh viễn danh mục: ' + error.message, 'error');
    }
}

// Category form submit
document.addEventListener('DOMContentLoaded', function() {
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const categoryId = this.getAttribute('data-category-id');
            const categoryData = {
                name: document.getElementById('categoryName').value,
                description: document.getElementById('categoryDescription').value,
                // Add status if needed, default to 1 (active)
                status: 1 
            };

            try {
                if (categoryId) {
                    await CategoriesAPI.update(categoryId, categoryData);
                    showNotification('Cập nhật danh mục thành công', 'success');
                } else {
                    await CategoriesAPI.create(categoryData);
                    showNotification('Thêm danh mục thành công', 'success');
                }
                this.removeAttribute('data-category-id');
                closeModal('categoryModal');
                loadCategories(); // Reloads both dropdowns and table
            } catch (error) {
                showNotification(error.message || 'Có lỗi xảy ra', 'error');
            }
        });
    }


    // User form submit
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (this.dataset.submitting === 'true') return;
            this.dataset.submitting = 'true';
            
            const userId = document.getElementById('userId').value;
            const nameVal = (document.getElementById('userNameInput').value || '').trim();
            const emailVal = (document.getElementById('userEmail').value || '').trim();
            let roleVal = (document.getElementById('userRole').value || '').trim();
            const passwordVal = (document.getElementById('userPassword').value || '').trim();

            // Normalize role
            roleVal = roleVal ? roleVal.toLowerCase() : 'user';

            // Use native HTML validation first
            if (!this.checkValidity()) {
                showNotification('Vui lòng điền đúng thông tin bắt buộc', 'warning');
                this.dataset.submitting = 'false';
                return;
            }

            // Additional create-only check: require password
            if (!userId && !passwordVal) {
                showNotification('Mật khẩu là bắt buộc khi tạo mới', 'warning');
                this.dataset.submitting = 'false';
                return;
            }

            const baseData = {
                full_name: nameVal,
                email: emailVal,
                role: roleVal
            };

            try {
                if (userId) {
                    const updateData = { ...baseData };
                    if (passwordVal) {
                        if (passwordVal.length < 6) {
                            showNotification('Mật khẩu tối thiểu 6 ký tự', 'warning');
                            this.dataset.submitting = 'false';
                            return;
                        }
                        updateData.password = passwordVal;
                    }
                    await UsersAPI.update(userId, updateData);
                    showNotification('Cập nhật người dùng thành công', 'success');
                } else {
                    if (passwordVal.length < 6) {
                        showNotification('Mật khẩu tối thiểu 6 ký tự', 'warning');
                        this.dataset.submitting = 'false';
                        return;
                    }
                    const createData = {
                        username: emailVal.split('@')[0] || nameVal || emailVal,
                        password: passwordVal,
                        full_name: nameVal,
                        email: emailVal,
                        role: roleVal,
                        status: 1
                    };
                    await UsersAPI.create(createData);
                    showNotification('Thêm người dùng thành công', 'success');
                }
                closeModal('userModal');
                loadUsers();
            } catch (error) {
                showNotification(error.message || 'Có lỗi xảy ra', 'error');
            } finally {
                this.dataset.submitting = 'false';
            }
        });
    }
});

let allPosts = [];
let currentPostPage = 1;

async function loadPosts() {
    try {
        currentPostPage = 1;
        await loadPostTableData();
    } catch (error) {
        console.error('Error loading posts:', error);
        showNotification('Không thể tải danh sách bài viết', 'error');
    }
}

async function loadPostTableData() {
    try {
        const searchInput = document.getElementById('postSearch');
        const statusFilter = document.getElementById('postStatusFilter');
        const search = searchInput ? searchInput.value.trim() : '';
        const status = statusFilter ? statusFilter.value : '';
        const res = await PostsAPI.getAll({
            keyword: search || undefined,
            status
        });
        let items = [];
        if (Array.isArray(res)) items = res;
        else if (Array.isArray(res.data)) items = res.data;
        else if (Array.isArray(res.posts)) items = res.posts;
        else if (res.data && Array.isArray(res.data.posts)) items = res.data.posts;
        allPosts = items.map(p => ({
            _id: p._id || p.id || '',
            title: p.title || '',
            content: p.content || '',
            image: p.image || p.image_url || '',
            status: typeof p.status === 'number' ? p.status : (p.status === 'hidden' ? 0 : 1),
            createdAt: p.created_at || p.createdAt || null
        }));
        renderPosts(allPosts);
    } catch (error) {
        console.error('Error loading posts table:', error);
        showNotification('Không thể tải bài viết: ' + (error.message || ''), 'error');
    }
}

function searchPosts() {
    currentPostPage = 1;
    loadPostTableData();
}

function filterPosts() {
    currentPostPage = 1;
    loadPostTableData();
}

function renderPosts(posts) {
    const tbody = document.getElementById('postsTableBody');
    if (!tbody) return;
    if (!posts || posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Không có bài viết nào</td></tr>';
        renderPagination('posts', 0);
        return;
    }
    const totalPages = Math.ceil(posts.length / itemsPerPage);
    const startIndex = (currentPostPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = posts.slice(startIndex, endIndex);
    tbody.innerHTML = pageItems.map(p => {
        const createdAt = p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'N/A';
        const isActive = p.status === 1;
        const statusText = isActive ? 'Hoạt động' : 'Đã xóa tạm';
        const statusClass = isActive ? 'status-delivered' : 'status-cancelled';
        const toggleLabel = isActive ? 'Xóa tạm' : 'Khôi phục';
        const toggleIcon = isActive ? 'fa-trash' : 'fa-trash-restore';
        return `
            <tr>
                <td>${p.title || 'N/A'}</td>
                <td>${createdAt}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-edit" onclick="editPost('${p._id}')">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="action-btn action-btn-warning" onclick="togglePostStatus('${p._id}')" title="${toggleLabel}">
                            <i class="fas ${toggleIcon}"></i> ${toggleLabel}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    renderPagination('posts', totalPages, currentPostPage);
}

function openAddPostModal() {
    const titleEl = document.getElementById('postModalTitle');
    const submitTextEl = document.getElementById('postSubmitText');
    const form = document.getElementById('postForm');
    if (!form) return;
    if (titleEl) titleEl.textContent = 'Thêm bài viết mới';
    if (submitTextEl) submitTextEl.textContent = 'Thêm bài viết';
    form.reset();
    const idEl = document.getElementById('postId');
    if (idEl) idEl.value = '';
    const statusEl = document.getElementById('postStatus');
    if (statusEl) statusEl.value = '1';
    const imageUrlEl = document.getElementById('postImageUrl');
    if (imageUrlEl) imageUrlEl.value = '';
    const imageLinkEl = document.getElementById('postImageLink');
    if (imageLinkEl) imageLinkEl.value = '';
    clearPostImagePreview();
    openModal('postModal');
}

function clearPostImagePreview() {
    const preview = document.getElementById('postImagePreview');
    const img = document.getElementById('postImagePreviewImg');
    const fileInput = document.getElementById('postImageInput');
    const urlInput = document.getElementById('postImageUrl');
    const linkInput = document.getElementById('postImageLink');
    if (img) img.src = '';
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    if (linkInput) linkInput.value = '';
}

async function editPost(id) {
    const post = allPosts.find(p => p._id === id);
    if (!post) return;
    const titleEl = document.getElementById('postModalTitle');
    const submitTextEl = document.getElementById('postSubmitText');
    if (titleEl) titleEl.textContent = 'Sửa bài viết';
    if (submitTextEl) submitTextEl.textContent = 'Cập nhật';
    const idEl = document.getElementById('postId');
    if (idEl) idEl.value = post._id;
    const titleInput = document.getElementById('postTitle');
    const contentInput = document.getElementById('postContent');
    const statusEl = document.getElementById('postStatus');
    const urlInput = document.getElementById('postImageUrl');
    const linkInput = document.getElementById('postImageLink');
    if (titleInput) titleInput.value = post.title || '';
    if (contentInput) contentInput.value = post.content || '';
    if (statusEl) statusEl.value = String(post.status === 1 ? 1 : 0);
    if (urlInput) urlInput.value = post.image || '';
    if (linkInput) linkInput.value = post.image || '';
    if (post.image) {
        const preview = document.getElementById('postImagePreview');
        const img = document.getElementById('postImagePreviewImg');
        if (img) img.src = post.image;
        if (preview) preview.style.display = 'block';
    } else {
        clearPostImagePreview();
    }
    openModal('postModal');
}

async function togglePostStatus(id) {
    const post = allPosts.find(p => p._id === id);
    if (!post) return;
    const nextStatus = post.status === 1 ? 0 : 1;
    try {
        await PostsAPI.toggleStatus(id, nextStatus);
        post.status = nextStatus;
        renderPosts(allPosts);
        showNotification(
            nextStatus === 1 ? 'Đã khôi phục bài viết' : 'Đã xóa tạm bài viết',
            'success'
        );
    } catch (error) {
        showNotification(error.message || 'Không thể cập nhật trạng thái bài viết', 'error');
    }
}

// ===== Modals =====
function setupModals() {
    // Close modal on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ===== Utilities =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'shipping': 'Đang giao',
        'delivered': 'Đã giao',
        'completed': 'Đã hoàn tất',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function isOrderCompleted(status) {
    return status === 'delivered' || status === 'completed';
}

// ===== Pagination =====
function renderPagination(type, totalPages, currentPageNum) {
    if (totalPages <= 1) {
        // Remove existing pagination if exists
        const existingPagination = document.getElementById(`${type}Pagination`);
        if (existingPagination) {
            existingPagination.remove();
        }
        return;
    }

    let paginationContainer = document.getElementById(`${type}Pagination`);
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = `${type}Pagination`;
        paginationContainer.className = 'pagination-container';
        
        const table = document.querySelector(
            `#${type === 'products' ? 'products' : type === 'orders' ? 'orders' : type === 'users' ? 'users' : 'posts'}TableBody`
        )?.closest('.table-responsive')?.parentElement;
        if (table) {
            table.appendChild(paginationContainer);
        }
    }

    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    paginationHTML += `<button class="pagination-btn" onclick="changePage('${type}', ${currentPageNum - 1})" ${currentPageNum === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
    </button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPageNum - 1 && i <= currentPageNum + 1)) {
            paginationHTML += `<button class="pagination-btn ${i === currentPageNum ? 'active' : ''}" onclick="changePage('${type}', ${i})">${i}</button>`;
        } else if (i === currentPageNum - 2 || i === currentPageNum + 2) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }

    // Next button
    paginationHTML += `<button class="pagination-btn" onclick="changePage('${type}', ${currentPageNum + 1})" ${currentPageNum === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
    </button>`;

    paginationHTML += '</div>';
    paginationHTML += `<div class="pagination-info">Trang ${currentPageNum} / ${totalPages}</div>`;

    paginationContainer.innerHTML = paginationHTML;
}

function changePage(type, page) {
    if (type === 'products') {
        currentProductPage = page;
        renderProducts(allProducts);
    } else if (type === 'orders') {
        currentOrderPage = page;
        renderOrders(allOrders);
    } else if (type === 'users') {
        currentUserPage = page;
        renderUsers(allUsers);
    } else if (type === 'posts') {
        currentPostPage = page;
        renderPosts(allPosts);
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        // Fallback to alert if container doesn't exist
        alert(message);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type] || icons.info}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

