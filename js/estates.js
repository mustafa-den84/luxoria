// Estates Management for Luxoria

class EstatesManager {
    constructor() {
        this.estates = [];
    }

    async loadEstates(filters = {}) {
        try {
            this.estates = await database.getEstates(filters);
            this.renderEstates();
        } catch (error) {
            console.error('Load estates error:', error);
            showError('خطأ في تحميل العقارات');
        }
    }

    renderEstates() {
        const container = document.getElementById('estates-list');
        if (!container) return;

        if (this.estates.length === 0) {
            container.innerHTML = '<p class="no-results">لا توجد عقارات</p>';
            return;
        }

        container.innerHTML = this.estates.map(estate => {
            const imageSrc = database.resolveFirstImage(estate.images) || 'assets/images/placeholder-estate.svg';
            return `
            <div class="card" onclick="showEstateDetails('${estate.id}')">
                <img src="${imageSrc}" 
                     alt="${estate.title_ar}" 
                     class="card-image"
                     onerror="if(!this.dataset.retried){this.dataset.retried='1';setTimeout(()=>{this.src=this.src;},2000);}else{this.src='assets/images/placeholder-estate.svg';}">
                <div class="card-content">
                    <h3 class="card-title">${estate.title_ar}</h3>
                    <p class="card-description">${estate.description_ar || ''}</p>
                    <div class="card-info">
                        <span class="card-price">${estate.price?.toLocaleString()} ${estate.currency === 'SYP' ? 'ل.س' : '$'}</span>
                        <span>${estate.area || 0} م²</span>
                    </div>
                    ${estate.link ? `<a href="${estate.link}" target="_blank" rel="noopener" class="card-link" onclick="event.stopPropagation()">🔗 الرابط</a>` : ''}
                </div>
            </div>
        `}).join('');
    }

    async addEstate(estateData) {
        try {
            const estateId = await database.addEstate(estateData);
            showSuccess('تمت إضافة العقار بنجاح');
            await this.loadEstates();
            return estateId;
        } catch (error) {
            console.error('Add estate error:', error);
            showError('خطأ في إضافة العقار');
            throw error;
        }
    }

    async loadFeaturedEstates() {
        try {
            const featured = await database.getEstates({ featured: true });
            this.renderFeatured(featured);
        } catch (error) {
            console.error('Load featured error:', error);
        }
    }

    renderFeatured(estates) {
        const container = document.getElementById('featured-list');
        if (!container) return;

        if (estates.length === 0) {
            container.innerHTML = '<p class="no-results">لا توجد عقارات مميزة</p>';
            return;
        }

        container.innerHTML = estates.map(estate => {
            const imageSrc = database.resolveFirstImage(estate.images) || 'assets/images/placeholder-estate.svg';
            return `
            <div class="card" onclick="showEstateDetails('${estate.id}')">
                <img src="${imageSrc}" 
                     alt="${estate.title_ar}" 
                     class="card-image"
                     onerror="if(!this.dataset.retried){this.dataset.retried='1';setTimeout(()=>{this.src=this.src;},2000);}else{this.src='assets/images/placeholder-estate.svg';}">
                <div class="card-content">
                    <h3 class="card-title">${estate.title_ar}</h3>
                    <p class="card-description">${estate.description_ar || ''}</p>
                    <div class="card-info">
                        <span class="card-price">${estate.price?.toLocaleString()} ${estate.currency === 'SYP' ? 'ل.س' : '$'}</span>
                        <span>${estate.city_ar || ''}</span>
                    </div>
                    ${estate.link ? `<a href="${estate.link}" target="_blank" rel="noopener" class="card-link" onclick="event.stopPropagation()">🔗 الرابط</a>` : ''}
                </div>
            </div>
        `}).join('');
    }
}

// Initialize estates manager
const estatesManager = new EstatesManager();
