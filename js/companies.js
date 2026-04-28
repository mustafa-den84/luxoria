// Companies Management for Luxoria

class CompaniesManager {
    constructor() {
        this.companies = [];
    }

    async loadCompanies(filters = {}) {
        try {
            this.companies = await database.getCompanies(filters);
            this.renderCompanies();
        } catch (error) {
            console.error('Load companies error:', error);
            showError('خطأ في تحميل الشركات');
        }
    }

    renderCompanies() {
        const container = document.getElementById('companies-list');
        if (!container) return;

        if (this.companies.length === 0) {
            container.innerHTML = '<p class="no-results">لا توجد شركات</p>';
            return;
        }

        container.innerHTML = this.companies.map(company => {
            let imageSrc = company.logo_url || 'assets/images/placeholder-company.svg';
            // Check if it's a local storage key
            if (company.logo_url && company.logo_url.startsWith('image_')) {
                const localImage = database.getImageFromStorage(company.logo_url);
                if (localImage) {
                    imageSrc = localImage;
                }
            }
            const logoLink = company.logo_url ? (company.logo_url.startsWith('http') ? company.logo_url : imageSrc) : '';
            return `
            <div class="card" onclick="showCompanyDetails('${company.id}')">
                <img src="${imageSrc}" 
                     alt="${company.name_ar}" 
                     class="card-image"
                     onerror="this.src='assets/images/placeholder-company.svg'">
                <div class="card-content">
                    <h3 class="card-title">${company.name_ar}</h3>
                    <p class="card-description">${company.description_ar || ''}</p>
                    <div class="card-info">
                        <span class="card-rating">★ ${company.rating || 0}</span>
                        <span>${company.city_ar || ''}</span>
                    </div>
                    ${company.link ? `<a href="${company.link}" target="_blank" rel="noopener" class="card-link" onclick="event.stopPropagation()">🔗 الموقع</a>` : ''}
                </div>
            </div>
        `}).join('');
    }

    async addCompany(companyData) {
        try {
            const companyId = await database.addCompany(companyData);
            showSuccess('تمت إضافة الشركة بنجاح');
            await this.loadCompanies();
            return companyId;
        } catch (error) {
            console.error('Add company error:', error);
            showError('خطأ في إضافة الشركة');
            throw error;
        }
    }
}

// Initialize companies manager
const companiesManager = new CompaniesManager();
