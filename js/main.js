// Main Application Logic for Luxoria

// Global variables
let currentSection = 'home';
let adminCompanies = [];
let adminEstates = [];

// Filter values (multi-select arrays)
let cityFilterValues = [''];
let sortByValue = 'name';
let typeFilterValues = [''];
let purposeFilterValues = [''];
let priceSortValue = 'name';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    initializeApp();
    initAutoHideHeader();
});

// Auto-hide header on scroll
function initAutoHideHeader() {
    let lastScrollY = window.scrollY;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 80) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
}

// Toggle filter card dropdown
function toggleFilterCard(cardId) {
    const card = document.getElementById(cardId);
    card.classList.toggle('open');
}

// Select simple filter (colored card) - multi-select for filters, single-select for sorts
function selectSimpleFilter(event, filterId, value, title) {
    event.stopPropagation();

    const clickedCard = event.target.closest('.filter-card');
    const isSortGroup = (filterId === 'sortBy' || filterId === 'priceSort');

    if (isSortGroup) {
        // Single select for sort groups
        const allCards = clickedCard.parentElement.querySelectorAll('.filter-card[data-group="' + filterId + '"]');
        allCards.forEach(card => card.classList.remove('selected'));
        clickedCard.classList.add('selected');

        if (filterId === 'sortBy') {
            sortByValue = value;
        } else if (filterId === 'priceSort') {
            priceSortValue = value;
        }
    } else {
        // Multi-select for filter groups
        const isAllOption = (value === '');

        if (isAllOption) {
            // If "all" is clicked, deselect everything else and select only "all"
            const allCards = clickedCard.parentElement.querySelectorAll('.filter-card[data-group="' + filterId + '"]');
            allCards.forEach(card => card.classList.remove('selected'));
            clickedCard.classList.add('selected');

            if (filterId === 'cityFilter') {
                cityFilterValues = [''];
            } else if (filterId === 'typeFilter') {
                typeFilterValues = [''];
            } else if (filterId === 'purposeFilter') {
                purposeFilterValues = [''];
            }
        } else {
            // Deselect "all" option if a specific option is clicked
            const allCards = clickedCard.parentElement.querySelectorAll('.filter-card[data-group="' + filterId + '"]');
            allCards.forEach(card => {
                const onclickAttr = card.getAttribute('onclick') || '';
                if (onclickAttr.includes("''") || onclickAttr.includes(", '',")) {
                    card.classList.remove('selected');
                }
            });

            // Toggle the clicked card
            if (clickedCard.classList.contains('selected')) {
                clickedCard.classList.remove('selected');
                // Remove from values
                if (filterId === 'cityFilter') {
                    cityFilterValues = cityFilterValues.filter(v => v !== value);
                    if (cityFilterValues.length === 0) cityFilterValues = [''];
                } else if (filterId === 'typeFilter') {
                    typeFilterValues = typeFilterValues.filter(v => v !== value);
                    if (typeFilterValues.length === 0) typeFilterValues = [''];
                } else if (filterId === 'purposeFilter') {
                    purposeFilterValues = purposeFilterValues.filter(v => v !== value);
                    if (purposeFilterValues.length === 0) purposeFilterValues = [''];
                }
            } else {
                clickedCard.classList.add('selected');
                // Add to values
                if (filterId === 'cityFilter') {
                    cityFilterValues = cityFilterValues.filter(v => v !== '');
                    cityFilterValues.push(value);
                } else if (filterId === 'typeFilter') {
                    typeFilterValues = typeFilterValues.filter(v => v !== '');
                    typeFilterValues.push(value);
                } else if (filterId === 'purposeFilter') {
                    purposeFilterValues = purposeFilterValues.filter(v => v !== '');
                    purposeFilterValues.push(value);
                }
            }

            // If nothing selected, re-select "all"
            if (filterId === 'cityFilter' && cityFilterValues.length === 0) {
                cityFilterValues = [''];
                allCards.forEach(card => {
                    const onclickAttr = card.getAttribute('onclick') || '';
                    if (onclickAttr.includes("''") || onclickAttr.includes(", '',")) {
                        card.classList.add('selected');
                    }
                });
            } else if (filterId === 'typeFilter' && typeFilterValues.length === 0) {
                typeFilterValues = [''];
                allCards.forEach(card => {
                    const onclickAttr = card.getAttribute('onclick') || '';
                    if (onclickAttr.includes("''") || onclickAttr.includes(", '',")) {
                        card.classList.add('selected');
                    }
                });
            } else if (filterId === 'purposeFilter' && purposeFilterValues.length === 0) {
                purposeFilterValues = [''];
                allCards.forEach(card => {
                    const onclickAttr = card.getAttribute('onclick') || '';
                    if (onclickAttr.includes("''") || onclickAttr.includes(", '',")) {
                        card.classList.add('selected');
                    }
                });
            }
        }
    }

    // Trigger filter function
    if (filterId === 'cityFilter' || filterId === 'sortBy') {
        filterCompanies();
    } else if (filterId === 'typeFilter' || filterId === 'purposeFilter') {
        filterEstates();
    } else if (filterId === 'priceSort') {
        sortEstates();
    }
}

// Select filter option
function selectFilterOption(event, filterId, value, title) {
    event.stopPropagation();

    // Update title
    const titleElement = document.getElementById(filterId + 'Title');
    if (titleElement) {
        titleElement.textContent = title;
    }

    // Update filter value
    if (filterId === 'cityFilter') {
        cityFilterValue = value;
    } else if (filterId === 'sortBy') {
        sortByValue = value;
    } else if (filterId === 'typeFilter') {
        typeFilterValue = value;
    } else if (filterId === 'purposeFilter') {
        purposeFilterValue = value;
    } else if (filterId === 'priceSort') {
        priceSortValue = value;
    }

    // Update selected state
    const card = document.getElementById(filterId + 'Card');
    const options = card.querySelectorAll('.filter-option');
    options.forEach(option => option.classList.remove('selected'));
    event.target.classList.add('selected');

    // Close card
    card.classList.remove('open');

    // Trigger filter function
    if (filterId === 'cityFilter' || filterId === 'sortBy') {
        filterCompanies();
    } else if (filterId === 'typeFilter' || filterId === 'purposeFilter') {
        filterEstates();
    } else if (filterId === 'priceSort') {
        sortEstates();
    }
}

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
                <label>اسم الشركة (عربي)</label>
                <input type="text" id="companyName" placeholder="اسم الشركة" required>
                <label>وصف الشركة (عربي)</label>
                <textarea id="companyDescription" placeholder="وصف الشركة" rows="3"></textarea>
                <label>المدينة</label>
                <input type="text" id="companyCity" placeholder="المدينة" required>
                <label>الهاتف</label>
                <input type="tel" id="companyPhone" placeholder="رقم الهاتف">
                <label>الواتساب</label>
                <input type="tel" id="companyWhatsapp" placeholder="رقم الواتساب">
                <label>التقييم</label>
                <input type="number" id="companyRating" value="0" step="0.1" min="0" max="5">
                <label>مميزة</label>
                <select id="companyFeatured">
                    <option value="false">لا</option>
                    <option value="true">نعم</option>
                </select>
                <label>موثوقة</label>
                <select id="companyVerified">
                    <option value="false">لا</option>
                    <option value="true">نعم</option>
                </select>
                <label>رابط الموقع</label>
                <input type="url" id="companyLink" placeholder="https://example.com">
                <label>شعار الشركة</label>
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
        city_ar: document.getElementById('companyCity').value,
        phone: document.getElementById('companyPhone').value,
        whatsapp: document.getElementById('companyWhatsapp').value,
        rating: parseFloat(document.getElementById('companyRating').value) || 0,
        featured: document.getElementById('companyFeatured').value === 'true',
        verified: document.getElementById('companyVerified').value === 'true',
        link: document.getElementById('companyLink').value,
        logo_url: logo_url
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
                <label>عنوان العقار (عربي)</label>
                <input type="text" id="estateTitle" placeholder="عنوان العقار" required>
                <label>وصف العقار (عربي)</label>
                <textarea id="estateDescription" placeholder="وصف العقار" rows="3"></textarea>
                <label>النوع</label>
                <select id="estateType" required>
                    <option value="">نوع العقار</option>
                    <option value="apartment">شقة</option>
                    <option value="villa">فيلا</option>
                    <option value="house">منزل</option>
                    <option value="land">أرض</option>
                    <option value="commercial">تجاري</option>
                </select>
                <label>الغرض</label>
                <select id="estatePurpose" required>
                    <option value="">الغرض</option>
                    <option value="sale">للبيع</option>
                    <option value="rent">للإيجار</option>
                </select>
                <label>السعر</label>
                <input type="number" id="estatePrice" placeholder="السعر" required>
                <label>العملة</label>
                <select id="estateCurrency">
                    <option value="USD">دولار أمريكي</option>
                    <option value="SYP">ليرة سورية</option>
                </select>
                <label>المساحة (م²)</label>
                <input type="number" id="estateArea" placeholder="المساحة" required>
                <label>المدينة</label>
                <input type="text" id="estateCity" placeholder="المدينة" required>
                <label>الحالة</label>
                <select id="estateStatus">
                    <option value="available">متاح</option>
                    <option value="sold">مباع</option>
                    <option value="rented">مؤجر</option>
                </select>
                <label>مميز</label>
                <select id="estateFeatured">
                    <option value="false">لا</option>
                    <option value="true">نعم</option>
                </select>
                <label>رابط العقار</label>
                <input type="url" id="estateLink" placeholder="https://example.com">
                <label>صور العقار</label>
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
        currency: document.getElementById('estateCurrency').value || 'USD',
        area: parseFloat(document.getElementById('estateArea').value),
        city_ar: document.getElementById('estateCity').value,
        status: document.getElementById('estateStatus').value,
        featured: document.getElementById('estateFeatured').value === 'true',
        link: document.getElementById('estateLink').value,
        images: images
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
                    <button class="tab-btn" onclick="showAdminTab('settings')">الإعدادات</button>
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
                    <div class="search-container">
                        <input type="text" id="companySearchInput" placeholder="🔍 بحث عن شركة..." oninput="filterAdminCompanies()">
                    </div>
                    <div id="companiesList"></div>
                </div>
                <div id="estatesTab" class="admin-tab">
                    <h3>إدارة العقارات</h3>
                    <button onclick="showAddEstateModal()">إضافة عقار جديد</button>
                    <div class="search-container">
                        <input type="text" id="estateSearchInput" placeholder="🔍 بحث عن عقار..." oninput="filterAdminEstates()">
                    </div>
                    <div id="estatesList"></div>
                </div>
                <div id="statsTab" class="admin-tab">
                    <h3>إحصائيات</h3>
                    <div id="statistics"></div>
                </div>
                <div id="settingsTab" class="admin-tab">
                    <h3>إعدادات رفع الصور</h3>
                    <p style="color: #aaa; margin-bottom: 15px;">لرفع الصور إلى GitHub مجاناً، تحتاج رمز الوصول الشخصي (Personal Access Token)</p>
                    <div style="background: #16213e; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <p style="color: #8bc34a; font-weight: bold; margin-bottom: 8px;">كيفية الحصول على الرمز:</p>
                        <ol style="color: #ccc; padding-right: 20px; line-height: 2;">
                            <li>اذهب إلى GitHub.com → Settings</li>
                            <li>اختر Developer settings</li>
                            <li>اختر Personal access tokens → Tokens (classic)</li>
                            <li>اضغط Generate new token</li>
                            <li>اختر صلاحية <strong>repo</strong></li>
                            <li>انسخ الرمز وألصقه هنا</li>
                        </ol>
                    </div>
                    <form onsubmit="handleSaveGithubToken(event)">
                        <label>رمز GitHub الشخصي</label>
                        <input type="password" id="githubTokenInput" placeholder="ghp_xxxxxxxxxxxx" value="${database.getGithubToken()}">
                        <div style="display: flex; gap: 10px;">
                            <button type="submit">حفظ الرمز</button>
                            <button type="button" onclick="testGithubToken()" style="background: linear-gradient(135deg, #00bcd4, #0097a7);">اختبار الاتصال</button>
                        </div>
                    </form>
                    <div id="githubTokenStatus" style="margin-top: 10px;"></div>
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
        const companies = await database.getCompanies();
        const estates = await database.getEstates();
        
        // Store data globally for filtering
        adminCompanies = companies;
        adminEstates = estates;
        
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

        document.getElementById('companiesList').innerHTML = companies.length === 0
            ? '<p class="no-items">لا توجد شركات حالياً</p>'
            : companies.map(company => {
                let logoSrc = company.logo_url || 'assets/images/placeholder-company.svg';
                if (company.logo_url && company.logo_url.startsWith('image_')) {
                    const localImage = database.getImageFromStorage(company.logo_url);
                    if (localImage) logoSrc = localImage;
                }
                return `
            <div class="user-item company-item">
                <div class="item-thumbnail">
                    <img src="${logoSrc}" alt="${company.name_ar}" onerror="this.src='assets/images/placeholder-company.svg'">
                </div>
                <div class="item-info">
                    <p class="item-name"><strong>${company.name_ar}</strong></p>
                    <p class="item-details">المدينة: ${company.city_ar}</p>
                    <p class="item-details">الهاتف: ${company.phone}</p>
                    ${company.description_ar ? `<p class="item-desc">${company.description_ar.substring(0, 100)}...</p>` : ''}
                </div>
                <div class="user-actions">
                    <button class="edit-btn" onclick="editCompany('${company.id}')">✏️ تعديل</button>
                    <button class="delete-btn" onclick="deleteCompany('${company.id}')">🗑️ حذف</button>
                </div>
            </div>
        `}).join('');

        document.getElementById('estatesList').innerHTML = estates.length === 0
            ? '<p class="no-items">لا توجد عقارات حالياً</p>'
            : estates.map(estate => {
                let imageSrc = 'assets/images/placeholder-estate.svg';
                if (estate.images && estate.images.length > 0) {
                    imageSrc = estate.images[0];
                    if (imageSrc.startsWith('image_')) {
                        const localImage = database.getImageFromStorage(imageSrc);
                        if (localImage) imageSrc = localImage;
                    }
                }
                return `<div class="user-item estate-item">
                <div class="item-thumbnail">
                    <img src="${imageSrc}" alt="${estate.title_ar}" onerror="this.src='assets/images/placeholder-estate.svg'">
                </div>
                <div class="item-info">
                    <p class="item-name"><strong>${estate.title_ar}</strong></p>
                    <p class="item-details">السعر: ${estate.price?.toLocaleString()} USD</p>
                    <p class="item-details">المساحة: ${estate.area} م²</p>
                    <p class="item-details">المدينة: ${estate.city_ar}</p>
                    <p class="item-details">النوع: ${estate.type} | الغرض: ${estate.purpose}</p>
                    ${estate.description_ar ? `<p class="item-desc">${estate.description_ar.substring(0, 100)}...</p>` : ''}
                </div>
                <div class="user-actions">
                    <button class="edit-btn" onclick="editEstate('${estate.id}')">✏️ تعديل</button>
                    <button class="delete-btn" onclick="deleteEstate('${estate.id}')">🗑️ حذف</button>
                </div>
            </div>`;
            }).join('');

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

// Search filtering functions for admin panel
function filterAdminCompanies() {
    const searchTerm = document.getElementById('companySearchInput').value.toLowerCase();
    const filteredCompanies = adminCompanies.filter(company =>
        company.name_ar.toLowerCase().includes(searchTerm) ||
        company.city_ar.toLowerCase().includes(searchTerm) ||
        company.phone.includes(searchTerm) ||
        (company.description_ar && company.description_ar.toLowerCase().includes(searchTerm))
    );

    document.getElementById('companiesList').innerHTML = filteredCompanies.length === 0
        ? '<p class="no-items">لا توجد نتائج مطابقة</p>'
        : filteredCompanies.map(company => {
            let logoSrc = company.logo_url || 'assets/images/placeholder-company.svg';
            if (company.logo_url && company.logo_url.startsWith('image_')) {
                const localImage = database.getImageFromStorage(company.logo_url);
                if (localImage) logoSrc = localImage;
            }
            return `
            <div class="user-item company-item">
                <div class="item-thumbnail">
                    <img src="${logoSrc}" alt="${company.name_ar}" onerror="this.src='assets/images/placeholder-company.svg'">
                </div>
                <div class="item-info">
                    <p class="item-name"><strong>${company.name_ar}</strong></p>
                    <p class="item-details">المدينة: ${company.city_ar}</p>
                    <p class="item-details">الهاتف: ${company.phone}</p>
                    ${company.description_ar ? `<p class="item-desc">${company.description_ar.substring(0, 100)}...</p>` : ''}
                </div>
                <div class="user-actions">
                    <button class="edit-btn" onclick="editCompany('${company.id}')">✏️ تعديل</button>
                    <button class="delete-btn" onclick="deleteCompany('${company.id}')">🗑️ حذف</button>
                </div>
            </div>
        `}).join('');
}

function filterAdminEstates() {
    const searchTerm = document.getElementById('estateSearchInput').value.toLowerCase();
    const filteredEstates = adminEstates.filter(estate =>
        estate.title_ar.toLowerCase().includes(searchTerm) ||
        estate.city_ar.toLowerCase().includes(searchTerm) ||
        estate.type.toLowerCase().includes(searchTerm) ||
        estate.purpose.toLowerCase().includes(searchTerm) ||
        (estate.description_ar && estate.description_ar.toLowerCase().includes(searchTerm))
    );

    document.getElementById('estatesList').innerHTML = filteredEstates.length === 0
        ? '<p class="no-items">لا توجد نتائج مطابقة</p>'
        : filteredEstates.map(estate => {
            let imageSrc = 'assets/images/placeholder-estate.svg';
            if (estate.images && estate.images.length > 0) {
                imageSrc = estate.images[0];
                if (imageSrc.startsWith('image_')) {
                    const localImage = database.getImageFromStorage(imageSrc);
                    if (localImage) imageSrc = localImage;
                }
            }
            return `
            <div class="user-item estate-item">
                <div class="item-thumbnail">
                    <img src="${imageSrc}" alt="${estate.title_ar}" onerror="this.src='assets/images/placeholder-estate.svg'">
                </div>
                <div class="item-info">
                    <p class="item-name"><strong>${estate.title_ar}</strong></p>
                    <p class="item-details">السعر: ${estate.price?.toLocaleString()} USD</p>
                    <p class="item-details">المساحة: ${estate.area} م²</p>
                    <p class="item-details">المدينة: ${estate.city_ar}</p>
                    <p class="item-details">النوع: ${estate.type} | الغرض: ${estate.purpose}</p>
                    ${estate.description_ar ? `<p class="item-desc">${estate.description_ar.substring(0, 100)}...</p>` : ''}
                </div>
                <div class="user-actions">
                    <button class="edit-btn" onclick="editEstate('${estate.id}')">✏️ تعديل</button>
                    <button class="delete-btn" onclick="deleteEstate('${estate.id}')">🗑️ حذف</button>
                </div>
            </div>
        `}).join('');
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

async function handleSaveGithubToken(event) {
    event.preventDefault();
    const token = document.getElementById('githubTokenInput').value.trim();
    if (token) {
        database.setGithubToken(token);
        showSuccess('تم حفظ رمز GitHub بنجاح');
    } else {
        localStorage.removeItem('github_token');
        showSuccess('تم حذف رمز GitHub. سيتم استخدام التخزين المحلي.');
    }
}

async function testGithubToken() {
    const token = document.getElementById('githubTokenInput').value.trim();
    const statusEl = document.getElementById('githubTokenStatus');
    if (!token) {
        statusEl.innerHTML = '<p style="color: #ff7043;">الرجاء إدخال الرمز أولاً</p>';
        return;
    }
    statusEl.innerHTML = '<p style="color: #8bc34a;">جاري الاختبار...</p>';
    try {
        const response = await fetch(`https://api.github.com/repos/${database.githubRepo}`, {
            headers: { 'Authorization': `token ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            database.setGithubToken(token);
            statusEl.innerHTML = `<p style="color: #8bc34a;">✅ الاتصال ناجح! المستودع: ${data.full_name}</p>`;
        } else {
            statusEl.innerHTML = '<p style="color: #ff7043;">❌ الرمز غير صالح أو لا يملك صلاحية الوصول</p>';
        }
    } catch (error) {
        statusEl.innerHTML = '<p style="color: #ff7043;">❌ خطأ في الاتصال بـ GitHub</p>';
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
            let logoSrc = company.logo_url || 'assets/images/placeholder-company.svg';
            if (company.logo_url && company.logo_url.startsWith('image_')) {
                const localImage = database.getImageFromStorage(company.logo_url);
                if (localImage) logoSrc = localImage;
            }
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <h2>تعديل الشركة</h2>
                    <div class="current-image">
                        <p>الشعار الحالي:</p>
                        <img src="${logoSrc}" alt="شعار الشركة" style="max-width: 150px; border-radius: 10px; margin: 10px 0;">
                    </div>
                    <form onsubmit="handleEditCompany(event, '${companyId}')">
                        <label>اسم الشركة</label>
                        <input type="text" id="editCompanyName" value="${company.name_ar}" required>
                        <label>الوصف</label>
                        <textarea id="editCompanyDescription" rows="3">${company.description_ar || ''}</textarea>
                        <label>المدينة</label>
                        <input type="text" id="editCompanyCity" value="${company.city_ar}" required>
                        <label>الهاتف</label>
                        <input type="tel" id="editCompanyPhone" value="${company.phone || ''}">
                        <label>الواتساب</label>
                        <input type="tel" id="editCompanyWhatsapp" value="${company.whatsapp || ''}">
                        <label>التقييم</label>
                        <input type="number" id="editCompanyRating" value="${company.rating || 0}" step="0.1" min="0" max="5">
                        <label>مميزة</label>
                        <select id="editCompanyFeatured">
                            <option value="false" ${!company.featured ? 'selected' : ''}>لا</option>
                            <option value="true" ${company.featured ? 'selected' : ''}>نعم</option>
                        </select>
                        <label>موثوقة</label>
                        <select id="editCompanyVerified">
                            <option value="false" ${!company.verified ? 'selected' : ''}>لا</option>
                            <option value="true" ${company.verified ? 'selected' : ''}>نعم</option>
                        </select>
                        <label>رابط الموقع</label>
                        <input type="url" id="editCompanyLink" value="${company.link || ''}" placeholder="https://example.com">
                        <label>تغيير الشعار (اختياري)</label>
                        <input type="file" id="editCompanyLogoFile" accept="image/*">
                        <input type="text" id="editCompanyLogo" placeholder="أو رابط الشعار الجديد">
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

    const logoFile = document.getElementById('editCompanyLogoFile').files[0];
    const logoUrlInput = document.getElementById('editCompanyLogo').value;

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
        name_ar: document.getElementById('editCompanyName').value,
        description_ar: document.getElementById('editCompanyDescription').value,
        city_ar: document.getElementById('editCompanyCity').value,
        phone: document.getElementById('editCompanyPhone').value,
        whatsapp: document.getElementById('editCompanyWhatsapp').value,
        rating: parseFloat(document.getElementById('editCompanyRating').value) || 0,
        featured: document.getElementById('editCompanyFeatured').value === 'true',
        verified: document.getElementById('editCompanyVerified').value === 'true',
        link: document.getElementById('editCompanyLink').value
    };

    // Only update logo_url if a new one was provided
    if (logo_url) {
        companyData.logo_url = logo_url;
    }
    
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
            let imagesHtml = '';
            if (estate.images && estate.images.length > 0) {
                imagesHtml = estate.images.map((img, index) => {
                    let imgSrc = img;
                    if (img.startsWith('image_')) {
                        const localImage = database.getImageFromStorage(img);
                        if (localImage) imgSrc = localImage;
                    }
                    return `<img src="${imgSrc}" alt="صورة ${index + 1}" style="max-width: 150px; border-radius: 10px; margin: 5px;">`;
                }).join('');
            } else {
                imagesHtml = '<p style="color: #a0a0a0;">لا توجد صور حالياً</p>';
            }

            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <h2>تعديل العقار</h2>
                    <div class="current-image">
                        <p>الصور الحالية:</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0;">
                            ${imagesHtml}
                        </div>
                    </div>
                    <form onsubmit="handleEditEstate(event, '${estateId}')">
                        <label>العنوان</label>
                        <input type="text" id="editEstateTitle" value="${estate.title_ar}" required>
                        <label>الوصف</label>
                        <textarea id="editEstateDescription" rows="3">${estate.description_ar || ''}</textarea>
                        <label>النوع</label>
                        <select id="editEstateType" required>
                            <option value="apartment" ${estate.type === 'apartment' ? 'selected' : ''}>شقة</option>
                            <option value="villa" ${estate.type === 'villa' ? 'selected' : ''}>فيلا</option>
                            <option value="house" ${estate.type === 'house' ? 'selected' : ''}>منزل</option>
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
                        <label>العملة</label>
                        <select id="editEstateCurrency">
                            <option value="USD" ${estate.currency === 'USD' ? 'selected' : ''}>دولار أمريكي</option>
                            <option value="SYP" ${estate.currency === 'SYP' ? 'selected' : ''}>ليرة سورية</option>
                        </select>
                        <label>المساحة (م²)</label>
                        <input type="number" id="editEstateArea" value="${estate.area}" required>
                        <label>المدينة</label>
                        <input type="text" id="editEstateCity" value="${estate.city_ar}" required>
                        <label>الحالة</label>
                        <select id="editEstateStatus">
                            <option value="available" ${estate.status === 'available' ? 'selected' : ''}>متاح</option>
                            <option value="sold" ${estate.status === 'sold' ? 'selected' : ''}>مباع</option>
                            <option value="rented" ${estate.status === 'rented' ? 'selected' : ''}>مؤجر</option>
                        </select>
                        <label>مميز</label>
                        <select id="editEstateFeatured">
                            <option value="false" ${!estate.featured ? 'selected' : ''}>لا</option>
                            <option value="true" ${estate.featured ? 'selected' : ''}>نعم</option>
                        </select>
                        <label>رابط العقار</label>
                        <input type="url" id="editEstateLink" value="${estate.link || ''}" placeholder="https://example.com">
                        <label>إضافة صور جديدة (اختياري)</label>
                        <input type="file" id="editEstateImagesFile" accept="image/*" multiple>
                        <input type="text" id="editEstateImages" placeholder="أو روابط الصور الجديدة (مفصولة بفاصلة)">
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

    const imageFiles = document.getElementById('editEstateImagesFile').files;
    const imagesInput = document.getElementById('editEstateImages').value;

    // Get existing estate data to preserve current images
    const existingEstate = await database.getEstateById(estateId);
    let images = existingEstate ? existingEstate.images : [];

    // Add new images from URL input
    if (imagesInput) {
        const newImages = imagesInput.split(',').map(url => url.trim());
        images = [...images, ...newImages];
    }

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
        title_ar: document.getElementById('editEstateTitle').value,
        description_ar: document.getElementById('editEstateDescription').value,
        type: document.getElementById('editEstateType').value,
        purpose: document.getElementById('editEstatePurpose').value,
        price: parseFloat(document.getElementById('editEstatePrice').value),
        currency: document.getElementById('editEstateCurrency').value,
        area: parseFloat(document.getElementById('editEstateArea').value),
        city_ar: document.getElementById('editEstateCity').value,
        status: document.getElementById('editEstateStatus').value,
        featured: document.getElementById('editEstateFeatured').value === 'true',
        link: document.getElementById('editEstateLink').value,
        images: images
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
    const filters = {};
    if (cityFilterValues.length > 0 && !cityFilterValues.includes('')) {
        filters.cities = cityFilterValues;
    }
    companiesManager.loadCompanies(filters);
    if (sortByValue) {
        companiesManager.companies = searchManager.sortCompanies(companiesManager.companies, sortByValue);
        companiesManager.renderCompanies();
    }
}

function sortCompanies() {
    companiesManager.companies = searchManager.sortCompanies(companiesManager.companies, sortByValue);
    companiesManager.renderCompanies();
}

function filterEstates() {
    const filters = {};
    if (typeFilterValues.length > 0 && !typeFilterValues.includes('')) {
        filters.types = typeFilterValues;
    }
    if (purposeFilterValues.length > 0 && !purposeFilterValues.includes('')) {
        filters.purposes = purposeFilterValues;
    }
    estatesManager.loadEstates(filters);
    if (priceSortValue) {
        estatesManager.estates = searchManager.sortEstates(estatesManager.estates, priceSortValue);
        estatesManager.renderEstates();
    }
}

function sortEstates() {
    estatesManager.estates = searchManager.sortEstates(estatesManager.estates, priceSortValue);
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
            const logoLink = company.logo_url && company.logo_url.startsWith('http') ? company.logo_url : '';
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <h2>${company.name_ar}</h2>
                    ${logoLink ? `<a href="${logoLink}" target="_blank" rel="noopener"><img src="${imageSrc}" alt="${company.name_ar}" class="detail-image"></a>` : `<img src="${imageSrc}" alt="${company.name_ar}" class="detail-image">`}
                    <div class="detail-info">
                        <p>${company.description_ar || ''}</p>
                        <p><strong>الهاتف:</strong> <a href="tel:${company.phone}">${company.phone}</a></p>
                        <p><strong>الواتساب:</strong> ${company.whatsapp ? `<a href="https://wa.me/${company.whatsapp}" target="_blank" rel="noopener">${company.whatsapp}</a>` : 'غير متوفر'}</p>
                        <p><strong>المدينة:</strong> ${company.city_ar}</p>
                        <p><strong>التقييم:</strong> ★ ${company.rating || 0}</p>
                        ${company.link ? `<p><strong>الموقع:</strong> <a href="${company.link}" target="_blank" rel="noopener">${company.link}</a></p>` : ''}
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
            // Build images gallery
            let imagesHtml = '';
            if (estate.images && estate.images.length > 0) {
                imagesHtml = estate.images.map((img, index) => {
                    let imgSrc = img;
                    if (img.startsWith('image_')) {
                        const localImage = database.getImageFromStorage(img);
                        if (localImage) imgSrc = localImage;
                    }
                    const imgLink = img.startsWith('http') ? img : '';
                    return imgLink 
                        ? `<a href="${imgLink}" target="_blank" rel="noopener"><img src="${imgSrc}" alt="صورة ${index + 1}" class="detail-gallery-img" onerror="this.style.display='none'"></a>`
                        : `<img src="${imgSrc}" alt="صورة ${index + 1}" class="detail-gallery-img" onerror="this.style.display='none'">`;
                }).join('');
            }
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <h2>${estate.title_ar}</h2>
                    <img src="${imageSrc}" alt="${estate.title_ar}" class="detail-image" onerror="this.src='assets/images/placeholder-estate.svg'">
                    ${imagesHtml ? `<div class="detail-gallery">${imagesHtml}</div>` : ''}
                    <div class="detail-info">
                        <p>${estate.description_ar || ''}</p>
                        <p><strong>السعر:</strong> ${estate.price?.toLocaleString()} ${estate.currency === 'SYP' ? 'ليرة سورية' : 'دولار أمريكي'}</p>
                        <p><strong>المساحة:</strong> ${estate.area || 0} م²</p>
                        <p><strong>النوع:</strong> ${estate.type || ''}</p>
                        <p><strong>الغرض:</strong> ${estate.purpose === 'sale' ? 'للبيع' : estate.purpose === 'rent' ? 'للإيجار' : estate.purpose || ''}</p>
                        <p><strong>المدينة:</strong> ${estate.city_ar || ''}</p>
                        <p><strong>الحالة:</strong> ${estate.status === 'available' ? 'متاح' : estate.status === 'sold' ? 'مباع' : estate.status === 'rented' ? 'مؤجر' : estate.status || ''}</p>
                        ${estate.link ? `<p><strong>الرابط:</strong> <a href="${estate.link}" target="_blank" rel="noopener">${estate.link}</a></p>` : ''}
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    });
}
