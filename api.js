// API Configuration
const API_BASE_URL = (() => {
    try {
        const saved = localStorage.getItem('api_base_url');
        if (saved) return saved;
        const { protocol, hostname } = window.location || {};
        if (protocol && protocol.startsWith('http') && hostname) {
            return `${protocol}//${hostname}:3000/api`;
        }
    } catch (_) {}
    return 'http://localhost:3000/api';
})();

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('admin_token');
}

// Helper function to set auth token
function setAuthToken(token) {
    localStorage.setItem('admin_token', token);
}

// Helper function to remove auth token
function removeAuthToken() {
    localStorage.removeItem('admin_token');
}

// Helper function to check if user is authenticated
function isAuthenticated() {
    return getAuthToken() !== null;
}

// Helper function to get headers
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        ...options,
        mode: 'cors',
        credentials: 'omit',
        headers: {
            ...getHeaders(),
            ...(options.headers || {})
        }
    };

    if (endpoint === '/users/create' && (config.method || 'GET').toUpperCase() === 'POST') {
        try {
            const preview = typeof config.body === 'string' ? JSON.parse(config.body) : config.body;
            console.log('DEBUG /users/create payload:', preview);
        } catch (e) {
            console.log('DEBUG /users/create body (raw):', config.body);
        }
    }

    try {
        const response = await fetch(url, config);
        
        // Check if response is ok
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Lỗi kết nối server' }));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();

        if (data && typeof data === 'object') {
            const hasSuccess = Object.prototype.hasOwnProperty.call(data, 'success');
            if (hasSuccess && data.success === false) {
                throw new Error(data.message || 'Có lỗi xảy ra');
            }
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        
        // Handle network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            // Fallback thử với 127.0.0.1
            try {
                const fallbackBase = API_BASE_URL.replace('localhost', '127.0.0.1');
                const resp = await fetch(`${fallbackBase}${endpoint}`, config);
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({ message: 'Lỗi kết nối server' }));
                    throw new Error(err.message || `HTTP ${resp.status}: ${resp.statusText}`);
                }
                const data = await resp.json();
                return data;
            } catch (_) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend server đang chạy tại http://localhost:3000\n2. Không có firewall chặn kết nối\n3. CORS đã được cấu hình đúng');
            }
        }
        
        throw error;
    }
}

// ===== Auth API =====
const AuthAPI = {
    async login(email, password) {
        // Đăng nhập Admin qua API /api/admin/login
        return apiRequest('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async getCurrentUser() {
        return apiRequest('/users/me');
    }
};

// ===== Products API =====
const ProductsAPI = {
    async getAll(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.category_id || filters.category) {
            const categoryId = filters.category_id || filters.category;
            queryParams.append('category_id', categoryId);
        }
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);

        const query = queryParams.toString();
        return apiRequest(`/products${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/products/${id}`);
    },

    async search(keyword) {
        const query = new URLSearchParams();
        if (keyword) query.append('keyword', keyword);
        return apiRequest(`/products/search?${query.toString()}`);
    },

    async create(productData) {
        return apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    async update(id, productData) {
        return apiRequest(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    },

    async delete(id) {
        return apiRequest(`/products/${id}`, {
            method: 'DELETE'
        });
    },

    async softDelete(id) {
        return apiRequest(`/products/soft-delete/${id}`, {
            method: 'DELETE'
        });
    },

    async getTrash() {
        return apiRequest('/products/trash');
    },

    async restore(id) {
        return apiRequest(`/products/restore/${id}`, {
            method: 'PUT'
        });
    },

    async forceDelete(id) {
        return apiRequest(`/products/permanent/${id}`, {
            method: 'DELETE'
        });
    }
};

// ===== Orders API =====
const OrdersAPI = {
    async getAll(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);

        const query = queryParams.toString();
        return apiRequest(`/orders${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/orders/${id}`);
    },

    async getDetail(id) {
        return apiRequest(`/orders/detail/${id}`);
    },

    async getTopCustomers({ limit = 5, status = 'completed', start, end } = {}) {
        const queryParams = new URLSearchParams();
        if (limit) queryParams.append('limit', limit);
        if (status) queryParams.append('status', status);
        if (start) queryParams.append('start', start);
        if (end) queryParams.append('end', end);
        const query = queryParams.toString();
        return apiRequest(`/orders/top-customers${query ? '?' + query : ''}`);
    },

    async getTopProducts({ limit = 5, status = 'completed', start, end } = {}) {
        const queryParams = new URLSearchParams();
        if (limit) queryParams.append('limit', limit);
        if (status) queryParams.append('status', status);
        if (start) queryParams.append('start', start);
        if (end) queryParams.append('end', end);
        const query = queryParams.toString();
        return apiRequest(`/orders/top-products${query ? '?' + query : ''}`);
    },

    async updateStatus(id, status) {
        return apiRequest(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    async delete(id) {
        return apiRequest(`/orders/${id}`, {
            method: 'DELETE'
        });
    }
};

const PostsAPI = {
    async getAll(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.keyword) queryParams.append('keyword', filters.keyword);
        if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
            queryParams.append('status', filters.status);
        }
        const query = queryParams.toString();
        const basePath = filters.keyword ? '/admin/posts/search' : '/admin/posts';
        return apiRequest(`${basePath}${query ? '?' + query : ''}`);
    },

    async create(postData) {
        return apiRequest('/admin/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    },

    async update(id, postData) {
        return apiRequest(`/admin/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    },

    async toggleStatus(id, status) {
        return apiRequest(`/admin/posts/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }
};

// ===== Users API =====
const UsersAPI = {
    async getAll() {
        // Lấy danh sách user từ API admin
        return apiRequest('/admin/users');
    },

    async getById(id) {
        return apiRequest(`/users/${id}`);
    },

    async create(userData) {
        // Tạo user mới qua API admin
        return apiRequest('/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async update(id, userData) {
        return apiRequest(`/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    async updateStatus(id, status) {
        return apiRequest(`/admin/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    async delete(id) {
        return apiRequest(`/users/${id}`, {
            method: 'DELETE'
        });
    }
};

// ===== Categories API =====
const CategoriesAPI = {
    async getAll() {
        return apiRequest('/categories');
    },

    async getById(id) {
        return apiRequest(`/categories/${id}`);
    },

    async create(categoryData) {
        return apiRequest('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    },

    async update(id, categoryData) {
        return apiRequest(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
    },

    async softDelete(id) {
        return apiRequest(`/categories/soft-delete/${id}`, {
            method: 'DELETE'
        });
    },

    async getTrash() {
        return apiRequest('/categories/trash');
    },

    async restore(id) {
        return apiRequest(`/categories/restore/${id}`, {
            method: 'PUT'
        });
    },

    async forceDelete(id) {
        return apiRequest(`/categories/permanent/${id}`, {
            method: 'DELETE'
        });
    },

    async delete(id) {
        // Keeping this for backward compatibility or if standard delete is needed
        return apiRequest(`/categories/${id}`, {
            method: 'DELETE'
        });
    }
};

// Export APIs
window.AuthAPI = AuthAPI;
window.ProductsAPI = ProductsAPI;
window.OrdersAPI = OrdersAPI;
window.UsersAPI = UsersAPI;
window.CategoriesAPI = CategoriesAPI;
window.PostsAPI = PostsAPI;
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;
window.removeAuthToken = removeAuthToken;
window.isAuthenticated = isAuthenticated;
