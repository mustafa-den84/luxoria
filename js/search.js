// Search and Sorting for Luxoria

class SearchManager {
    constructor() {
        this.currentFilters = {};
    }

    async performSearch(searchTerm) {
        if (!searchTerm.trim()) {
            return;
        }

        try {
            const companies = await database.searchCompanies(searchTerm);
            const estates = await database.searchEstates(searchTerm);
            
            return {
                companies,
                estates
            };
        } catch (error) {
            console.error('Search error:', error);
            showError('خطأ في البحث');
            return null;
        }
    }

    sortCompanies(companies, sortBy) {
        switch (sortBy) {
            case 'name':
                return companies.sort((a, b) => a.name_ar.localeCompare(b.name_ar, 'ar'));
            case 'rating':
                return companies.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'newest':
                return companies.sort((a, b) => {
                    const dateA = a.created_at?.toMillis() || 0;
                    const dateB = b.created_at?.toMillis() || 0;
                    return dateB - dateA;
                });
            default:
                return companies;
        }
    }

    sortEstates(estates, sortBy) {
        switch (sortBy) {
            case 'name':
                return estates.sort((a, b) => a.title_ar.localeCompare(b.title_ar, 'ar'));
            case 'price-low':
                return estates.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-high':
                return estates.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'area':
                return estates.sort((a, b) => (a.area || 0) - (b.area || 0));
            case 'newest':
                return estates.sort((a, b) => {
                    const dateA = a.created_at?.toMillis() || 0;
                    const dateB = b.created_at?.toMillis() || 0;
                    return dateB - dateA;
                });
            default:
                return estates;
        }
    }

    applyFilters() {
        this.currentFilters = {
            city: document.getElementById('cityFilter')?.value || '',
            type: document.getElementById('typeFilter')?.value || '',
            purpose: document.getElementById('purposeFilter')?.value || ''
        };
    }
}

// Initialize search manager
const searchManager = new SearchManager();
