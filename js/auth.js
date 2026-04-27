// Authentication System for Luxoria
console.log('Auth.js loaded');

class Auth {
    constructor() {
        console.log('Auth constructor called');
        this.currentUser = null;
        this.usersCollection = db.collection('users');
        console.log('Users collection:', this.usersCollection);
        this.initializeDefaultAdmin();
    }

    // Initialize default admin user
    async initializeDefaultAdmin() {
        console.log('Initializing default admin...');
        try {
            if (!db) {
                console.error('Firestore db is not initialized');
                return;
            }
            const adminDoc = await this.usersCollection.doc('admin').get();
            if (!adminDoc.exists) {
                await this.usersCollection.doc('admin').set({
                    username: 'admin',
                    password: this.hashPassword('admin123'),
                    role: 'admin',
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    last_login: null,
                    active: true
                });
                console.log('Default admin user created');
            } else {
                console.log('Admin user already exists');
            }
        } catch (error) {
            console.error('Error initializing admin:', error);
        }
    }

    // Simple password hashing (for demonstration - use bcrypt in production)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    // Login user
    async login(username, password) {
        try {
            const querySnapshot = await this.usersCollection
                .where('username', '==', username)
                .where('active', '==', true)
                .get();

            if (querySnapshot.empty) {
                throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.password !== this.hashPassword(password)) {
                throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
            }

            // Update last login
            await this.usersCollection.doc(userDoc.id).update({
                last_login: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Set current user
            this.currentUser = {
                id: userDoc.id,
                ...userData
            };

            // Store in localStorage
            localStorage.setItem('luxoria_user', JSON.stringify(this.currentUser));

            return this.currentUser;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('luxoria_user');
        window.location.reload();
    }

    // Check if user is logged in
    isLoggedIn() {
        if (this.currentUser) {
            return true;
        }

        const storedUser = localStorage.getItem('luxoria_user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            return true;
        }

        return false;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Check if user is insertor
    isInsertor() {
        return this.currentUser && this.currentUser.role === 'insertor';
    }

    // Create new user (admin only)
    async createUser(username, password, role) {
        if (!this.isAdmin()) {
            throw new Error('غير مصرح لك بإنشاء مستخدمين جدد');
        }

        try {
            // Check if username already exists
            const querySnapshot = await this.usersCollection
                .where('username', '==', username)
                .get();

            if (!querySnapshot.empty) {
                throw new Error('اسم المستخدم موجود بالفعل');
            }

            const newUserRef = await this.usersCollection.add({
                username: username,
                password: this.hashPassword(password),
                role: role,
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                last_login: null,
                active: true
            });

            return newUserRef.id;
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    // Get all users (admin only)
    async getAllUsers() {
        if (!this.isAdmin()) {
            throw new Error('غير مصرح لك بعرض المستخدمين');
        }

        try {
            const querySnapshot = await this.usersCollection.get();
            const users = [];
            querySnapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data(),
                    password: undefined // Don't return password
                });
            });
            return users;
        } catch (error) {
            console.error('Get users error:', error);
            throw error;
        }
    }

    // Delete user (admin only)
    async deleteUser(userId) {
        if (!this.isAdmin()) {
            throw new Error('غير مصرح لك بحذف المستخدمين');
        }

        if (userId === this.currentUser.id) {
            throw new Error('لا يمكنك حذف حسابك');
        }

        try {
            await this.usersCollection.doc(userId).update({
                active: false
            });
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    }

    // Update current user profile
    async updateCurrentUser(newUsername, newPassword) {
        if (!this.currentUser) {
            throw new Error('لم يتم تسجيل الدخول');
        }

        try {
            const updateData = {
                username: newUsername
            };

            if (newPassword && newPassword.trim()) {
                updateData.password = this.hashPassword(newPassword);
            }

            await this.usersCollection.doc(this.currentUser.id).update(updateData);
            
            // Update current user object
            this.currentUser.username = newUsername;
            localStorage.setItem('luxoria_user', JSON.stringify(this.currentUser));
        } catch (error) {
            console.error('Update current user error:', error);
            throw error;
        }
    }

    // Update user (admin only)
    async updateUser(userId, newUsername, newPassword, newRole) {
        if (!this.isAdmin()) {
            throw new Error('غير مصرح لك بتعديل المستخدمين');
        }

        try {
            const updateData = {
                username: newUsername,
                role: newRole
            };

            if (newPassword && newPassword.trim()) {
                updateData.password = this.hashPassword(newPassword);
            }

            await this.usersCollection.doc(userId).update(updateData);
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    }
}

// Initialize auth
const auth = new Auth();
