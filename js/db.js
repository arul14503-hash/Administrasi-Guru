/**
 * Database Helper using IndexedDB
 */
class SchoolDB {
    constructor() {
        this.dbName = 'SchoolDB_v1';
        this.version = 4;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                console.error("Database error:", event.target.error);
                reject("Could not open database");
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Database opened successfully");
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 1. Students
                if (!db.objectStoreNames.contains('students')) {
                    const store = db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('nis', 'nis', { unique: true });
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('class', 'class', { unique: false });
                }

                // 2. Teachers
                if (!db.objectStoreNames.contains('teachers')) {
                    const store = db.createObjectStore('teachers', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('nip', 'nip', { unique: true });
                    store.createIndex('name', 'name', { unique: false });
                }

                // 3. Grades (Data Induk Siswa & Nilai)
                if (!db.objectStoreNames.contains('grades')) {
                    const store = db.createObjectStore('grades', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('studentId', 'studentId', { unique: false });
                    // Structure: { studentId: 1, classLevel: "1", year: "2023", semester: "1", subjects: [...] }
                }

                // 4. Inventory
                if (!db.objectStoreNames.contains('inventory')) {
                    const store = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('code', 'code', { unique: true });
                    store.createIndex('name', 'name', { unique: false });
                }

                // 5. Mail In
                if (!db.objectStoreNames.contains('mail_in')) {
                    const store = db.createObjectStore('mail_in', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('date', 'date', { unique: false });
                }

                // 6. Mail Out
                if (!db.objectStoreNames.contains('mail_out')) {
                    const store = db.createObjectStore('mail_out', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('date', 'date', { unique: false });
                }

                // 7. Documents
                if (!db.objectStoreNames.contains('documents')) {
                    const store = db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('category', 'category', { unique: false });
                }

                // 8. Classes (New in v3)
                if (!db.objectStoreNames.contains('classes')) {
                    const store = db.createObjectStore('classes', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('name', 'name', { unique: true }); // e.g., "1", "1A", "1B"

                    // Seed initial data
                    const defaultClasses = ["1", "2", "3", "4", "5", "6"];
                    store.transaction.oncomplete = () => {
                        const classTransaction = db.transaction(['classes'], 'readwrite');
                        const classStore = classTransaction.objectStore('classes');
                        defaultClasses.forEach(c => classStore.add({ name: c }));
                    };
                }

                // 9. Subjects (New in v3)
                if (!db.objectStoreNames.contains('subjects')) {
                    const store = db.createObjectStore('subjects', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('name', 'name', { unique: true });

                    // Seed initial data
                    const defaultSubjects = [
                        "Pendidikan Agama", "PPKn", "Bahasa Indonesia", "Matematika",
                        "IPA", "IPS", "SBdP", "PJOK"
                    ];
                    // For simplicity, we add logic to seed if empty in app logic or here.
                    // Let's add here safely.
                    defaultSubjects.forEach(s => store.add({ name: s }));
                }

                // 10. Majors (New in v4)
                if (!db.objectStoreNames.contains('majors')) {
                    const store = db.createObjectStore('majors', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('name', 'name', { unique: true });

                    // Seed initial data
                    const defaultMajors = ["Umum"];
                    defaultMajors.forEach(m => store.add({ name: m }));
                }
            };
        });
    }

    // Generic Add
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Generic Get All
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Generic Get By ID
    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(Number(id));

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Generic Update
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Generic Delete
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(Number(id));

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Count
    async count(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Clear Store
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Global instance
window.db = new SchoolDB();
