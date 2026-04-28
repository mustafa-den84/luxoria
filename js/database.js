// Database Operations for Luxoria

class Database {
    constructor() {
        this.companiesCollection = db.collection('companies');
        this.estatesCollection = db.collection('estates');
        this.usersCollection = db.collection('users');
        this.githubRepo = 'mustafa-den84/luxoria';
        this.githubBranch = 'main';
    }

    // GitHub token management
    getGithubToken() {
        return localStorage.getItem('github_token') || '';
    }

    setGithubToken(token) {
        localStorage.setItem('github_token', token);
    }

    // Generic get document
    async getDoc(collection, docId) {
        try {
            const doc = await db.collection(collection).doc(docId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Get doc error:', error);
            throw error;
        }
    }

    // Company Operations

    async addCompany(companyData) {
        try {
            const companyRef = await this.companiesCollection.add({
                ...companyData,
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                updated_at: firebase.firestore.FieldValue.serverTimestamp(),
                created_by: auth.getCurrentUser()?.id || null
            });
            return companyRef.id;
        } catch (error) {
            console.error('Add company error:', error);
            throw error;
        }
    }

    async getCompanies(filters = {}) {
        try {
            let query = this.companiesCollection;

            if (filters.city_ar) {
                query = query.where('city_ar', '==', filters.city_ar);
            }

            if (filters.verified !== undefined) {
                query = query.where('verified', '==', filters.verified);
            }

            if (filters.featured !== undefined) {
                query = query.where('featured', '==', filters.featured);
            }

            const querySnapshot = await query.get();
            const companies = [];
            querySnapshot.forEach(doc => {
                companies.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return companies;
        } catch (error) {
            console.error('Get companies error:', error);
            throw error;
        }
    }

    async getCompanyById(companyId) {
        try {
            const doc = await this.companiesCollection.doc(companyId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Get company error:', error);
            throw error;
        }
    }

    async updateCompany(companyId, companyData) {
        try {
            await this.companiesCollection.doc(companyId).update({
                ...companyData,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Update company error:', error);
            throw error;
        }
    }

    async deleteCompany(companyId) {
        try {
            await this.companiesCollection.doc(companyId).delete();
        } catch (error) {
            console.error('Delete company error:', error);
            throw error;
        }
    }

    // Estate Operations

    async addEstate(estateData) {
        try {
            const estateRef = await this.estatesCollection.add({
                ...estateData,
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                updated_at: firebase.firestore.FieldValue.serverTimestamp(),
                created_by: auth.getCurrentUser()?.id || null
            });
            return estateRef.id;
        } catch (error) {
            console.error('Add estate error:', error);
            throw error;
        }
    }

    async getEstates(filters = {}) {
        try {
            let query = this.estatesCollection;

            if (filters.type) {
                query = query.where('type', '==', filters.type);
            }

            if (filters.purpose) {
                query = query.where('purpose', '==', filters.purpose);
            }

            if (filters.city_ar) {
                query = query.where('city_ar', '==', filters.city_ar);
            }

            if (filters.featured !== undefined) {
                query = query.where('featured', '==', filters.featured);
            }

            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }

            const querySnapshot = await query.get();
            const estates = [];
            querySnapshot.forEach(doc => {
                estates.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return estates;
        } catch (error) {
            console.error('Get estates error:', error);
            throw error;
        }
    }

    async getEstateById(estateId) {
        try {
            const doc = await this.estatesCollection.doc(estateId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Get estate error:', error);
            throw error;
        }
    }

    async updateEstate(estateId, estateData) {
        try {
            await this.estatesCollection.doc(estateId).update({
                ...estateData,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Update estate error:', error);
            throw error;
        }
    }

    async deleteEstate(estateId) {
        try {
            await this.estatesCollection.doc(estateId).delete();
        } catch (error) {
            console.error('Delete estate error:', error);
            throw error;
        }
    }

    // Search Operations

    async searchCompanies(searchTerm) {
        try {
            const companies = await this.getCompanies();
            return companies.filter(company => 
                company.name_ar.includes(searchTerm) ||
                company.description_ar?.includes(searchTerm) ||
                company.city_ar.includes(searchTerm)
            );
        } catch (error) {
            console.error('Search companies error:', error);
            throw error;
        }
    }

    async searchEstates(searchTerm) {
        try {
            const estates = await this.getEstates();
            return estates.filter(estate =>
                estate.title_ar.includes(searchTerm) ||
                estate.description_ar?.includes(searchTerm) ||
                estate.city_ar.includes(searchTerm) ||
                estate.region_ar?.includes(searchTerm)
            );
        } catch (error) {
            console.error('Search estates error:', error);
            throw error;
        }
    }

    // Statistics (Admin)

    async getStatistics() {
        try {
            const companiesSnapshot = await this.companiesCollection.get();
            const estatesSnapshot = await this.estatesCollection.get();
            const usersSnapshot = await this.usersCollection.where('active', '==', true).get();

            return {
                totalCompanies: companiesSnapshot.size,
                totalEstates: estatesSnapshot.size,
                totalUsers: usersSnapshot.size,
                featuredEstates: estatesSnapshot.docs.filter(doc => doc.data().featured).length
            };
        } catch (error) {
            console.error('Get statistics error:', error);
            throw error;
        }
    }

    // Image Upload (GitHub)
    async uploadImage(file, path) {
        const token = this.getGithubToken();
        
        // If no GitHub token, fall back to localStorage
        if (!token) {
            return this.uploadImageLocal(file, path);
        }

        try {
            // Compress image if needed (max ~900KB for GitHub API)
            const base64 = await this.fileToBase64(file);
            
            const githubPath = `uploads/${path}`;
            const url = `https://api.github.com/repos/${this.githubRepo}/contents/${githubPath}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Upload image: ${path}`,
                    content: base64,
                    branch: this.githubBranch
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    throw new Error('رمز GitHub غير صالح. يرجى تحديث الرمز من الإعدادات.');
                }
                if (response.status === 403) {
                    throw new Error('تجاوز حد GitHub API. حاول مرة أخرى لاحقاً.');
                }
                throw new Error(errorData.message || 'خطأ في رفع الصورة إلى GitHub');
            }

            const data = await response.json();
            // Return the raw GitHub URL for direct image access
            return data.content.download_url;
        } catch (error) {
            console.error('GitHub upload error:', error);
            throw error;
        }
    }

    // Convert file to base64 (without the data URL prefix)
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Fallback: upload to localStorage
    async uploadImageLocal(file, path) {
        try {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result;
                    const key = `image_${Date.now()}`;
                    try {
                        localStorage.setItem(key, base64);
                        resolve(key);
                    } catch (quotaError) {
                        if (quotaError.name === 'QuotaExceededError') {
                            reject(new Error('مساحة التخزين ممتلئة. يرجى إضافة رمز GitHub من الإعدادات لرفع الصور.'));
                        } else {
                            reject(quotaError);
                        }
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error('Local upload error:', error);
            throw error;
        }
    }

    // Get image from local storage
    getImageFromStorage(key) {
        return localStorage.getItem(key);
    }

    // Clear old images from localStorage
    clearOldImages() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('image_')) {
                keys.push(key);
            }
        }
        // Remove all image keys
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        return keys.length;
    }
}

// Initialize database
const database = new Database();
