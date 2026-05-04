import jwt from '@tsndr/cloudflare-worker-jwt';
import bcrypt from 'bcryptjs';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      // ==========================================
      // 1. ENDPOINT LOGIN
      // ==========================================
      if (url.pathname === "/login" && request.method === "POST") {
        const body = await request.json();
        const { nim, password } = body;
        
        const { results } = await env.DB.prepare("SELECT * FROM users WHERE nim = ?").bind(nim).all();

        // Jika NIM tidak ditemukan
        if (results.length === 0) {
          return new Response(JSON.stringify({ error: "NIM atau Password salah" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const user = results[0];

        // Membandingkan password yang diketik dengan hash bcrypt di database
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
          return new Response(JSON.stringify({ error: "NIM atau Password salah" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // Jika lolos, terbitkan token
        const token = await jwt.sign({ nim: user.nim, role: user.role }, "KUNCI_RAHASIA_KAMPUS_123");

        return new Response(JSON.stringify({ token: token, role: user.role }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ==========================================
      // 2. AMBIL DATA NILAI 
      // ==========================================
      if (url.pathname === "/nilai" && request.method === "GET") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response("Akses ditolak", { status: 401, headers: corsHeaders });
        
        const token = authHeader.split(" ")[1];
        if (!(await jwt.verify(token, "KUNCI_RAHASIA_KAMPUS_123"))) return new Response("Token tidak valid", { status: 401, headers: corsHeaders });
        
        const { payload } = jwt.decode(token);

        if (payload.role === 'dosen') {
          const kategori = url.searchParams.get("kategori");
          if (kategori) {
             const { results } = await env.DB.prepare("SELECT * FROM grades WHERE kategori = ?").bind(kategori).all();
             return new Response(JSON.stringify(results), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          } else {
             return new Response(JSON.stringify([]), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        } else {
          const { results } = await env.DB.prepare("SELECT * FROM grades WHERE nim_mahasiswa = ?").bind(payload.nim).all();
          return new Response(JSON.stringify(results), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      // ==========================================
      // 3. DOSEN MEMINTA DAFTAR MAHASISWA
      // ==========================================
      if (url.pathname === "/mahasiswa" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT nim, nama_lengkap FROM users WHERE role = 'mahasiswa'").all();
        return new Response(JSON.stringify(results), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ==========================================
      // 4. DOSEN MENYIMPAN NILAI
      // ==========================================
      if (url.pathname === "/nilai" && request.method === "POST") {
        const body = await request.json();
        const { kategori, dataNilai } = body; 

        await env.DB.prepare("DELETE FROM grades WHERE kategori = ?").bind(kategori).run();

        const stmts = dataNilai.map(mhs => 
          env.DB.prepare("INSERT INTO grades (nim_mahasiswa, kategori, skor, catatan) VALUES (?, ?, ?, ?)")
            .bind(mhs.nim, kategori, mhs.skor, mhs.catatan || "")
        );
        
        if(stmts.length > 0) {
          await env.DB.batch(stmts);
        }

        return new Response(JSON.stringify({ pesan: "Nilai berhasil disimpan!" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ==========================================
      // 5. MENGGANTI PASSWORD PENGGUNA
      // ==========================================
      if (url.pathname === "/ubah-password" && request.method === "POST") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response("Akses ditolak", { status: 401, headers: corsHeaders });
        
        const token = authHeader.split(" ")[1];
        if (!(await jwt.verify(token, "KUNCI_RAHASIA_KAMPUS_123"))) return new Response("Token tidak valid", { status: 401, headers: corsHeaders });
        
        const { payload } = jwt.decode(token);
        const body = await request.json();
        const { passwordLama, passwordBaru } = body;

        // 1. Cari data user berdasarkan token NIM yang sedang login
        const { results } = await env.DB.prepare("SELECT * FROM users WHERE nim = ?").bind(payload.nim).all();
        if (results.length === 0) return new Response(JSON.stringify({ error: "Pengguna tidak ditemukan" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        
        const user = results[0];

        // 2. Verifikasi apakah password lamanya benar
        const isPasswordValid = await bcrypt.compare(passwordLama, user.password_hash);
        if (!isPasswordValid) return new Response(JSON.stringify({ error: "Password lama salah!" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

        // 3. Hash password yang baru
        const hashBaru = await bcrypt.hash(passwordBaru, 10);

        // 4. Update data di database D1
        await env.DB.prepare("UPDATE users SET password_hash = ? WHERE nim = ?").bind(hashBaru, payload.nim).run();

        return new Response(JSON.stringify({ pesan: "Password berhasil diperbarui!" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ==========================================
      // 6. AMBIL DATA PROFIL PENGGUNA
      // ==========================================
      if (url.pathname === "/profil" && request.method === "GET") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response("Akses ditolak", { status: 401, headers: corsHeaders });
        
        const token = authHeader.split(" ")[1];
        if (!(await jwt.verify(token, "KUNCI_RAHASIA_KAMPUS_123"))) return new Response("Token tidak valid", { status: 401, headers: corsHeaders });
        
        const { payload } = jwt.decode(token);
        
        const { results } = await env.DB.prepare("SELECT nim, nama_lengkap, foto_profil FROM users WHERE nim = ?").bind(payload.nim).all();
        
        return new Response(JSON.stringify(results[0]), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ==========================================
      // 7. UPLOAD FOTO PROFIL (BASE64)
      // ==========================================
      if (url.pathname === "/profil/foto" && request.method === "POST") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response("Akses ditolak", { status: 401, headers: corsHeaders });
        
        const token = authHeader.split(" ")[1];
        if (!(await jwt.verify(token, "KUNCI_RAHASIA_KAMPUS_123"))) return new Response("Token tidak valid", { status: 401, headers: corsHeaders });
        
        const { payload } = jwt.decode(token);
        const body = await request.json();
        
        // Simpan teks Base64 gambar ke database
        await env.DB.prepare("UPDATE users SET foto_profil = ? WHERE nim = ?").bind(body.fotoBase64, payload.nim).run();

        return new Response(JSON.stringify({ pesan: "Foto berhasil diperbarui!" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};