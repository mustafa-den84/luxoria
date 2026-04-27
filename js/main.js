// Main Application Logic for Luxoria

// Global variables
let currentSection = 'home';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    initializeApp();
});

async function initializeApp() {
    console.log('Luxoria app initializing...');
    
    // Check if user is logged in
    if (auth.isLoggedIn()) {
        updateUIForLoggedInUser();
    }
    
    // Load initial data
    await loadInitialData();
    
    // Setup real-time search
    setupRealTimeSearch();
}

async function loadInitialData() {
    try {
        await companiesManager.loadCompanies();
        await estatesManager.loadEstates();
        await estatesManager.loadFeaturedEstates();
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// Section Management
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.remove('hidden');
    }
    
    currentSection = sectionName;
}

// Login Modal
function showLogin() {
    console.log('showLogin called');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
        console.log('Login modal shown');
        console.log('Modal classes:', modal.className);
        console.log('Modal display style:', window.getComputedStyle(modal).display);
        console.log('Modal visibility:', window.getComputedStyle(modal).visibility);
    } else {
        console.error('Login modal not found');
    }
}

function closeLogin() {
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('loginError').classList.add('hidden');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        await auth.login(username, password);
        closeLogin();
        updateUIForLoggedInUser();
        showSuccess('تم تسجيل الدخول بنجاح');
    } catch (error) {
        document.getElementById('loginError').textContent = error.message;
        document.getElementById('loginError').classList.remove('hidden');
    }
}

// Dashboard Modal
function showDashboard() {
    if (!auth.isLoggedIn()) {
        showLogin();
        return;
    }
    
    document.getElementById('dashboardModal').classList.add('show');
    updateDashboardUI();
}

function closeDashboard() {
    document.getElementById('dashboardModal').classList.remove('show');
}

function updateUIForLoggedInUser() {
    const user = auth.getCurrentUser();
    if (user) {
        const loginBtn = document.querySelector('.nav-btn[onclick="showLogin()"]');
        if (loginBtn) {
            loginBtn.textContent = user.username;
            loginBtn.onclick = showDashboard;
        }
        
        // Show admin button if user is admin
        if (auth.isAdmin()) {
            document.getElementById('adminBtn').classList.remove('hidden');
        }
    }
}

function updateDashboardUI() {
    const user = auth.getCurrentUser();
    if (user) {
        document.getElementById('userInfo').innerHTML = `
            <p><strong>اسم المستخدم:</strong> ${user.username}</p>
            <p><strong>الدور:</strong> ${user.role === 'admin' ? 'مدير' : 'مدرج'}</p>
        `;
        
        // Profile edit is now available in the admin tab system, no need for duplicate button
    }
}

function showProfileEdit() {
    const currentUser = auth.getCurrentUser();
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>تعديل الملف الشخصي</h2>
            <form onsubmit="handleUpdateProfile(event)">
                <input type="text" id="editUsername" value="${currentUser.username}" placeholder="اسم المستخدم" required>
                <input type="password" id="editPassword" placeholder="كلمة المرور الجديدة">
                <input type="password" id="confirmPassword" placeholder="تأكيد كلمة المرور">
                <button type="submit">تحديث</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

// Logout
function logout() {
    auth.logout();
}

// Add Company
function showAddCompany() {
    if (!auth.isLoggedIn()) {
        showLogin();
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>إضافة شركة جديدة</h2>
            <form id="addCompanyForm" onsubmit="handleAddCompany(event)">
                <input type="text" id="companyName" placeholder="اسم الشركة (عربي)" required>
                <textarea id="companyDescription" placeholder="وصف الشركة (عربي)" rows="3"></textarea>
                <input type="text" id="companyPhone" placeholder="رقم الهاتف" required>
                <input type="text" id="companyWhatsapp" placeholder="رقم الواتساب">
                <input type="text" id="companyCity" placeholder="المدينة" required>
                <label>صورة الشعار:</label>
                <input type="file" id="companyLogoFile" accept="image/*">
                <input type="text" id="companyLogo" placeholder="أو رابط الشعار">
                <button type="submit">إضافة</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handleAddCompany(event) {
    event.preventDefault();
    
    const logoFile = document.getElementById('companyLogoFile').files[0];
    const logoUrlInput = document.getElementById('companyLogo').value;
    
    let logo_url = logoUrlInput;
    
    // Upload file if provided
    if (logoFile) {
        try {
            const timestamp = Date.now();
            const path = `companies/logos/${timestamp}_${logoFile.name}`;
            logo_url = await database.uploadImage(logoFile, path);
            showSuccess('تم رفع الصورة بنجاح');
        } catch (error) {
            console.error('Upload error:', error);
            if (error.message.includes('مساحة التخزين ممتلئة')) {
                const cleared = database.clearOldImages();
                showError(`مساحة التخزين ممتلئة. تم مسح ${cleared} صورة قديمة. حاول مرة أخرى.`);
            } else {
                showError('خطأ في رفع الصورة');
            }
            return;
        }
    }
    
    const companyData = {
        name_ar: document.getElementById('companyName').value,
        description_ar: document.getElementById('companyDescription').value,
        phone: document.getElementById('companyPhone').value,
        whatsapp: document.getElementById('companyWhatsapp').value,
        city_ar: document.getElementById('companyCity').value,
        logo_url: logo_url,
        rating: 0,
        verified: false,
        featured: false
    };
    
    try {
        await companiesManager.addCompany(companyData);
        event.target.closest('.modal').remove();
    } catch (error) {
        showError('خطأ في إضافة الشركة');
    }
}

// Add Estate
function showAddEstate() {
    if (!auth.isLoggedIn()) {
        showLogin();
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>إضافة عقار جديد</h2>
            <form id="addEstateForm" onsubmit="handleAddEstate(event)">
                <input type="text" id="estateTitle" placeholder="عنوان العقار (عربي)" required>
                <textarea id="estateDescription" placeholder="وصف العقار (عربي)" rows="3"></textarea>
                <select id="estateType" required>
                    <option value="">نوع العقار</option>
                    <option value="apartment">شقة</option>
                    <option value="villa">فيلا</option>
                    <option value="house">منزل</option>
                    <option value="land">أرض</option>
                    <option value="commercial">تجاري</option>
                </select>
                <select id="estatePurpose" required>
                    <option value="">الغرض</option>
                    <option value="sale">للبيع</option>
                    <option value="rent">للإيجار</option>
                </select>
                <input type="number" id="estatePrice" placeholder="السعر" required>
                <input type="number" id="estateArea" placeholder="المساحة (متر مربع)" required>
                <input type="text" id="estateCity" placeholder="المدينة" required>
                <label>صور العقار:</label>
                <input type="file" id="estateImagesFile" accept="image/*" multiple>
                <input type="text" id="estateImages" placeholder="أو روابط الصور (مفصولة بفاصلة)">
                <button type="submit">إضافة</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handleAddEstate(event) {
    event.preventDefault();
    
    const imageFiles = document.getElementById('estateImagesFile').files;
    const imagesInput = document.getElementById('estateImages').value;
    let images = imagesInput ? imagesInput.split(',').map(url => url.trim()) : [];
    
    // Upload files if provided
    if (imageFiles.length > 0) {
        try {
            for (let i = 0; i < imageFiles.length; i++) {
                const timestamp = Date.now();
                const path = `estates/images/${timestamp}_${i}_${imageFiles[i].name}`;
                const url = await database.uploadImage(imageFiles[i], path);
                images.push(url);
            }
            showSuccess('تم رفع الصور بنجاح');
        } catch (error) {
            console.error('Upload error:', error);
            if (error.message.includes('مساحة التخزين ممتلئة')) {
                const cleared = database.clearOldImages();
                showError(`مساحة التخزين ممتلئة. تم مسح ${cleared} صورة قديمة. حاول مرة أخرى.`);
            } else {
                showError('خطأ في رفع الصور');
            }
            return;
        }
    }
    
    const estateData = {
        title_ar: document.getElementById('estateTitle').value,
        description_ar: document.getElementById('estateDescription').value,
        type: document.getElementById('estateType').value,
        purpose: document.getElementById('estatePurpose').value,
        price: parseFloat(document.getElementById('estatePrice').value),
        currency: 'USD',
        area: parseFloat(document.getElementById('estateArea').value),
        city_ar: document.getElementById('estateCity').value,
        images: images,
        featured: false,
        status: 'available'
    };
    
    try {
        await estatesManager.addEstate(estateData);
        event.target.closest('.modal').remove();
    } catch (error) {
        showError('خطأ في إضافة العقار');
    }
}

// Admin Panel
function showAdminPanel() {
    if (!auth.isAdmin()) {
        showError('غير مصرح لك بالوصول إلى لوحة الإدارة');
        return;
    }
    
    // Close any existing admin panel
    const existingAdminPanel = document.querySelector('.modal-content.dashboard');
    if (existingAdminPanel) {
        existingAdminPanel.closest('.modal').remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content dashboard">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>لوحة الإدارة</h2>
            <div id="adminContent">
                <div class="admin-tabs">
                    <button class="tab-btn active" onclick="showAdminTab('users')">المستخدمين</button>
                    <button class="tab-btn" onclick="showAdminTab('companies')">الشركات</button>
                    <button class="tab-btn" onclick="showAdminTab('estates')">العقارات</button>
                    <button class="tab-btn" onclick="showAdminTab('stats')">الإحصائيات</button>
                    <button class="tab-btn" onclick="showAdminTab('profile')">الملف الشخصي</button>
                </div>
                <div id="usersTab" class="admin-tab active">
                    <h3>إدارة المستخدمين</h3>
                    <button onclick="showAddUserModal()">إضافة مستخدم جديد</button>
                    <div id="usersList"></div>
                </div>
                <div id="companiesTab" class="admin-tab">
                    <h3>إدارة الشركات</h3>
                    <button onclick="showAddCompanyModal()">إضافة شركة جديدة</button>
                    <div id="companiesList"></div>
                </div>
                <div id="estatesTab" class="admin-tab">
                    <h3>إدارة العقارات</h3>
                    <button onclick="showAddEstateModal()">إضافة عقار جديد</button>
                    <div id="estatesList"></div>
                </div>
                <div id="statsTab" class="admin-tab">
                    <h3>إحصائيات</h3>
                    <div id="statistics"></div>
                </div>
                <div id="profileTab" class="admin-tab">
                    <h3>تعديل الملف الشخصي</h3>
                    <form onsubmit="handleUpdateProfile(event)">
                        <input type="text" id="editUsername" placeholder="اسم المستخدم الحالي">
                        <input type="password" id="editPassword" placeholder="كلمة المرور الجديدة">
                        <input type="password" id="confirmPassword" placeholder="تأكيد كلمة المرور">
                        <button type="submit">تحديث</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    loadAdminData();
}

async function loadAdminData() {
    try {
        const stats = await database.getStatistics();
        const users = await auth.getAllUsers();
        const currentUser = auth.getCurrentUser();
        const companies = await database.getAllCompanies();
        const estates = await database.getAllEstates();
        
        document.getElementById('statistics').innerHTML = `
            <p>إجمالي الشركات: ${stats.totalCompanies}</p>
            <p>إجمالي العقارات: ${stats.totalEstates}</p>
            <p>إجمالي المستخدمين: ${stats.totalUsers}</p>
            <p>العقارات المميزة: ${stats.featuredEstates}</p>
        `;
        
        document.getElementById('usersList').innerHTML = users.map(user => `
            <div class="user-item">
                <p><strong>${user.username}</strong> - ${user.role === 'admin' ? 'مدير' : 'مدرج'}</p>
                <div class="user-actions">
                    <button onclick="editUser('${user.id}')">تعديل</button>
                    ${user.id !== currentUser.id ? `<button onclick="deleteUser('${user.id}')">حذف</button>` : ''}
                </div>
            </div>
        `).join('');

        document.getElementById('companiesList').innerHTML = companies.map(company => `
            <div class="user-item">
                <p><strong>${company.name_ar}</strong> - ${company.city_ar}</p>
                <div class="user-actions">
                    <button onclick="editCompany('${company.id}')">تعديل</button>
                    <button onclick="deleteCompany('${company.id}')">حذف</button>
                </div>
            </div>
        `).join('');

        document.getElementById('estatesList').innerHTML = estates.map(estate => `
            <div class="user-item">
                <p><strong>${estate.title_ar}</strong> - ${estate.price?.toLocaleString()} USD</p>
                <div class="user-actions">
                    <button onclick="editEstate('${estate.id}')">تعديل</button>
                    <button onclick="deleteEstate('${estate.id}')">حذف</button>
                </div>
            </div>
        `).join('');

        // Pre-fill profile form
        document.getElementById('editUsername').value = currentUser.username;
    } catch (error) {
        console.error('Load admin data error:', error);
    }
}

function showAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.add('active');
    event.target.classList.add('active');
}

function showAddUserModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>إضافة مستخدم جديد</h2>
            <form onsubmit="handleAddUser(event)">
                <input type="text" id="newUsername" placeholder="اسم المستخدم" required>
                <input type="password" id="newPassword" placeholder="كلمة المرور" required>
                <select id="newUserRole" required>
                    <option value="insertor">مدرج</option>
                    <option value="admin">مدير</option>
                </select>
                <button type="submit">إضافة</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handleAddUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newUserRole').value;
    
    try {
        await auth.createUser(username, password, role);
        showSuccess('تمت إضافة المستخدم بنجاح');
        event.target.closest('.modal').remove();
        loadAdminData();
    } catch (error) {
        showError(error.message);
    }
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    
    const newUsername = document.getElementById('editUsername').value;
    const newPassword = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword && newPassword !== confirmPassword) {
        showError('كلمات المرور غير متطابقة');
        return;
    }
    
    try {
        await auth.updateCurrentUser(newUsername, newPassword);
        showSuccess('تم تحديث الملف الشخصي بنجاح');
        event.target.reset();
        loadAdminData();
    } catch (error) {
        showError(error.message);
    }
}

function editUser(userId) {
    database.getDoc('users', userId).then(user => {
        if (user) {
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <h2>تعديل المستخدم</h2>
                    <form onsubmit="handleEditUser(event, '${userId}')">
                        <input type="text" id="editUserUsername" value="${user.username}" placeholder="اسم المستخدم" required>
                        <input type="password" id="editUserPassword" placeholder="كلمة المرور الجديدة">
                        <select id="editUserRole" required>
                            <option value="insertor" ${user.role === 'insertor' ? 'selected' : ''}>مدرج</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مدير</option>
                        </select>
                        <button type="submit">تحديث</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
        }
    });
}

async function handleEditUser(event, userId) {
    event.preventDefault();
    
    const newUsername = document.getElementById('editUserUsername').value;
    const newPassword = document.getElementById('editUserPassword').value;
    const newRole = document.getElementById('editUserRole').value;
    
    try {
        await auth.updateUser(userId, newUsername, newPassword, newRole);
        showSuccess('تم تحديث المستخدم بنجاح');
        event.target.closest('.modal').remove();
        loadAdminData();
    } catch (error) {
        showError(error.message);
    }
}

async function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        try {
            await auth.deleteUser(userId);
            showSuccess('تم حذف المستخدم بنجاح');
            loadAdminData();
        } catch (error) {
            showError(error.message);
        }
    }
}

function editCompany(companyId) {
    database.getCompanyById(companyId).then(company => {
        if (company) {
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <h2>تعديل الشركة</h2>
                    <form onsubmit="handleEditCompany(event, '${companyId}')">
                        <label>اسم الشركة</label>
                        <input type="text" id="editCompanyName" value="${company.name_ar}" required>
                        <label>الوصف</label>
                        <textarea id="editCompanyDescription" rows="3">${company.description_ar || ''}</textarea>
                        <label>الهاتف</label>
                        <input type="tel" id="editCompanyPhone" value="${company.phone}" required>
                        <label>الواتساب</label>
                        <input type="tel" id="editCompanyWhatsapp" value="${company.whatsapp || ''}">
                        <label>المدينة</label>
                        <input type="text" id="editCompanyCity" value="${company.city_ar}" required>
                        <button type="submit">تحديث</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
        }
    });
}

async function handleEditCompany(event, companyId) {
    event.preventDefault();
    
    const companyData = {
        name_ar: document.getElementById('editCompanyName').value,
        description_ar: document.getElementById('editCompanyDescription').value,
        phone: document.getElementById('editCompanyPhone').value,
        whatsapp: document.getElementById('editCompanyWhatsapp').value,
        city_ar: document.getElementById('editCompanyCity').value
    };
    
    try {
        await database.updateCompany(companyId, companyData);
        showSuccess('تم تحديث الشركة بنجاح');
        event.target.closest('.modal').remove();
        loadAdminData();
    } catch (error) {
        showError(error.message);
    }
}

async function deleteCompany(companyId) {
    if (confirm('هل أنت متأكد من حذف هذه الشركة؟')) {
        try {
            await database.deleteCompany(companyId);
            showSuccess('تم حذف الشركة بنجاح');
            loadAdminData();
        } catch (error) {
            showError(error.message);
        }
    }
}

function editEstate(estateId) {
    database.getEstateById(estateId).then(estate => {
        if (estate) {
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <h2>تعديل العقار</h2>
                    <form onsubmit="handleEditEstate(event, '${estateId}')">
                        <label>العنوان</label>
                        <input type="text" id="editEstateTitle" value="${estate.title_ar}" required>
                        <label>الوصف</label>
                        <textarea id="editEstateDescription" rows="3">${estate.description_ar || ''}</textarea>
                        <label>النوع</label>
                        <select id="editEstateType" required>
                            <option value="apartment" ${estate.type === 'apartment' ? 'selected' : ''}>شقة</option>
                            <option value="villa" ${estate.type === 'villa' ? 'selected' : ''}>فيلا</option>
                            <option value="land" ${estate.type === 'land' ? 'selected' : ''}>أرض</option>
                            <option value="commercial" ${estate.type === 'commercial' ? 'selected' : ''}>تجاري</option>
                        </select>
                        <label>الغرض</label>
                        <select id="editEstatePurpose" required>
                            <option value="sale" ${estate.purpose === 'sale' ? 'selected' : ''}>بيع</option>
                            <option value="rent" ${estate.purpose === 'rent' ? 'selected' : ''}>إيجار</option>
                        </select>
                        <label>السعر</label>
                        <input type="number" id="editEstatePrice" value="${estate.price}" required>
                        <label>المساحة</label>
                        <input type="number" id="editEstateArea" value="${estate.area}" required>
                        <label>المدينة</label>
                        <input type="text" id="editEstateCity" value="${estate.city_ar}" required>
                        <button type="submit">تحديث</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
        }
    });
}

async function handleEditEstate(event, estateId) {
    event.preventDefault();
    
    const estateData = {
        title_ar: document.getElementById('editEstateTitle').value,
        description_ar: document.getElementById('editEstateDescription').value,
        type: document.getElementById('editEstateType').value,
        purpose: document.getElementById('editEstatePurpose').value,
        price: parseFloat(document.getElementById('editEstatePrice').value),
        area: parseFloat(document.getElementById('editEstateArea').value),
        city_ar: document.getElementById('editEstateCity').value
    };
    
    try {
        await database.updateEstate(estateId, estateData);
        showSuccess('تم تحديث العقار بنجاح');
        event.target.closest('.modal').remove();
        loadAdminData();
    } catch (error) {
        showError(error.message);
    }
}

async function deleteEstate(estateId) {
    if (confirm('هل أنت متأكد من حذف هذا العقار؟')) {
        try {
            await database.deleteEstate(estateId);
            showSuccess('تم حذف العقار بنجاح');
            loadAdminData();
        } catch (error) {
            showError(error.message);
        }
    }
}

// Search
async function performSearch() {
    const searchTerm = document.getElementById('mainSearch').value;
    if (!searchTerm.trim()) {
        return;
    }
    
    try {
        const results = await searchManager.performSearch(searchTerm);
        if (results) {
            companiesManager.companies = results.companies;
            estatesManager.estates = results.estates;
            companiesManager.renderCompanies();
            estatesManager.renderEstates();
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Real-time search with debounce
let searchTimeout;
function setupRealTimeSearch() {
    const searchInput = document.getElementById('mainSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 300); // 300ms debounce
        });
    }
}

// Filters
function filterCompanies() {
    const cityFilter = document.getElementById('cityFilter').value;
    const filters = {};
    if (cityFilter) {
        filters.city_ar = cityFilter;
    }
    companiesManager.loadCompanies(filters);
}

function sortCompanies() {
    const sortBy = document.getElementById('sortBy').value;
    companiesManager.companies = searchManager.sortCompanies(companiesManager.companies, sortBy);
    companiesManager.renderCompanies();
}

function filterEstates() {
    const typeFilter = document.getElementById('typeFilter').value;
    const purposeFilter = document.getElementById('purposeFilter').value;
    const filters = {};
    if (typeFilter) filters.type = typeFilter;
    if (purposeFilter) filters.purpose = purposeFilter;
    estatesManager.loadEstates(filters);
}

function sortEstates() {
    const sortBy = document.getElementById('priceSort').value;
    estatesManager.estates = searchManager.sortEstates(estatesManager.estates, sortBy);
    estatesManager.renderEstates();
}

// Utility Functions
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'success';
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.padding = '15px 25px';
    alert.style.borderRadius = '8px';
    alert.style.backgroundColor = '#96CEB4';
    alert.style.color = '#2D3436';
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'error';
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.padding = '15px 25px';
    alert.style.borderRadius = '8px';
    alert.style.backgroundColor = '#FF6B6B';
    alert.style.color = '#FFFFFF';
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Show Details
function showCompanyDetails(companyId) {
    database.getCompanyById(companyId).then(company => {
        if (company) {
            let imageSrc = company.logo_url || 'assets/images/placeholder-company.svg';
            // Check if it's a local storage key
            if (company.logo_url && company.logo_url.startsWith('image_')) {
                const localImage = database.getImageFromStorage(company.logo_url);
                if (localImage) {
                    imageSrc = localImage;
                }
            }
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <h2>${company.name_ar}</h2>
                    <img src="${imageSrc}" alt="${company.name_ar}" class="detail-image">
                    <div class="detail-info">
                        <p>${company.description_ar || ''}</p>
                        <p><strong>الهاتف:</strong> ${company.phone}</p>
                        <p><strong>الواتساب:</strong> ${company.whatsapp || 'غير متوفر'}</p>
                        <p><strong>المدينة:</strong> ${company.city_ar}</p>
                        <p><strong>التقييم:</strong> ★ ${company.rating || 0}</p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    });
}

function showEstateDetails(estateId) {
    database.getEstateById(estateId).then(estate => {
        if (estate) {
            let imageSrc = estate.images?.[0] || 'assets/images/placeholder-estate.svg';
            // Check if it's a local storage key
            if (estate.images?.[0] && estate.images[0].startsWith('image_')) {
                const localImage = database.getImageFromStorage(estate.images[0]);
                if (localImage) {
                    imageSrc = localImage;
                }
            }
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <h2>${estate.title_ar}</h2>
                    <img src="${imageSrc}" alt="${estate.title_ar}" class="detail-image" onerror="this.src='assets/images/placeholder-estate.svg'">
                    <div class="detail-info">
                        <p>${estate.description_ar || ''}</p>
                        <p><strong>السعر:</strong> ${estate.price?.toLocaleString()} ${estate.currency || 'USD'}</p>
                        <p><strong>المساحة:</strong> ${estate.area || 0} م²</p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    });
}
