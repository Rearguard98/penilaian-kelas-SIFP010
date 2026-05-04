-- Hapus tabel jika sudah ada (berguna saat kita ingin reset data)
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS users;

-- 1. Membuat Tabel Pengguna (Mahasiswa & Dosen)
CREATE TABLE users (
    nim TEXT PRIMARY KEY,
    nama_lengkap TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'mahasiswa'
);

-- 2. Membuat Tabel Nilai
CREATE TABLE grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nim_mahasiswa TEXT NOT NULL,
    kategori TEXT NOT NULL,
    skor INTEGER NOT NULL,
    catatan TEXT,
    -- Memastikan data nim_mahasiswa harus ada di tabel users
    FOREIGN KEY (nim_mahasiswa) REFERENCES users(nim) 
);

-- 3. Memasukkan Data Dosen Sebagai Contoh Awal
INSERT INTO users (nim, nama_lengkap, password_hash, role) 
VALUES ('dosen03140', 'Budianto, S.Kom., M.Kom.', '$2b$10$9SAaPRkSALCPXfk/WR8TEuOl6/RqsxSB3TzqmEb94li0CRTP7J6VK', 'dosen');

INSERT INTO users (nim, nama_lengkap, password_hash, role) 
VALUES ('251011700612', 'Arrosyid Al Ayubi', '$2b$10$Kzzg3bd32Qhwhw/yBsRFY.l58F7XV037uCnZdmC/UG1697RJFi0K2', 'mahasiswa');