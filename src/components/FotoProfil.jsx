import { useState, useEffect, useRef } from 'react';

export default function FotoProfil() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Ambil data profil saat komponen dimuat
  useEffect(() => {
    const ambilProfil = async () => {
      const token = localStorage.getItem("token_mahasiswa");
      const respon = await fetch("https://api.kelas10sifp.my.id/profil", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (respon.ok) {
        setProfil(await respon.json());
      }
    };
    ambilProfil();
  }, []);

  // Fungsi untuk mengompres gambar sebelum dikirim
  const handleUploadFoto = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // --- TAMBAHAN BARU: Pengecekan Ukuran File ---
    const batasMaksimal = 5 * 1024 * 1024; // 5 MB dalam satuan Bytes
    if (file.size > batasMaksimal) {
      alert("🚨 Ukuran file terlalu besar! Maksimal ukuran gambar adalah 5 MB.");
      event.target.value = ''; // Reset input agar bisa pilih ulang
      return; // Hentikan proses
    }
    // ---------------------------------------------

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = async () => {
        // Kompres ukuran gambar maksimal 300x300 pixel
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Ubah menjadi format webp dengan kualitas 70% (Sangat hemat memori)
        const fotoTerkompresi = canvas.toDataURL('image/webp', 0.7);

        // Kirim ke Backend
        const token = localStorage.getItem("token_mahasiswa");
        const respon = await fetch("https://api.kelas10sifp.my.id/profil/foto", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ fotoBase64: fotoTerkompresi })
        });

        if (respon.ok) {
          setProfil(prev => ({ ...prev, foto_profil: fotoTerkompresi }));
        } else {
          alert("Gagal mengunggah foto.");
        }
        setLoading(false);
      };
    };
  };

  if (!profil) return <div className="animate-pulse h-16 w-16 bg-gray-200 rounded-full"></div>;

  return (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="relative">
        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-100 shrink-0">
          {profil.foto_profil ? (
            <img src={profil.foto_profil} alt="Profil" className="h-full w-full object-cover" />
          ) : (
            <svg className="h-full w-full text-gray-400 mt-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>
        
        {/* Tombol pensil untuk ganti foto */}
        <button 
          onClick={() => inputRef.current.click()}
          disabled={loading}
          className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full text-white hover:bg-blue-700 transition"
        >
          {loading ? (
             <span className="block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          )}
        </button>
        <input type="file" accept="image/*" ref={inputRef} onChange={handleUploadFoto} className="hidden" />
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-gray-800">{profil.nama_lengkap}</h2>
        
        {/* --- BAGIAN YANG DIUBAH: Pengecekan Role --- */}
        <p className="text-sm text-gray-500 mb-1">
          {localStorage.getItem("role_pengguna") === 'dosen' ? 'NIDN' : 'NIM'}: {profil.nim}
        </p>
        {/* ------------------------------------------- */}
        
        <p className="text-xs text-blue-500 bg-blue-50 inline-block px-2 py-1 rounded-md">
          Klik foto untuk mengubah (Maks: 5MB)
        </p>
      </div>
    </div>
  );
}