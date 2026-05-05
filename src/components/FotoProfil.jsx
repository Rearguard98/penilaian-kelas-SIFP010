import { useState, useEffect, useRef } from 'react';

export default function FotoProfil() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // --- STATE BARU UNTUK FITUR EDIT NAMA ---
  const [isEditingNama, setIsEditingNama] = useState(false);
  const [namaEdit, setNamaEdit] = useState('');

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

  const handleUploadFoto = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const batasMaksimal = 5 * 1024 * 1024; // 5 MB
    if (file.size > batasMaksimal) {
      alert("🚨 Ukuran file terlalu besar! Maksimal ukuran gambar adalah 5 MB.");
      event.target.value = ''; 
      return; 
    }

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const fotoTerkompresi = canvas.toDataURL('image/webp', 0.7);

        const token = localStorage.getItem("token_mahasiswa");
        const respon = await fetch("https://api.kelas10sifp.my.id/profil/foto", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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

  // --- FUNGSI BARU UNTUK MENYIMPAN NAMA ---
  const handleSimpanNama = async () => {
    // Jika tidak ada perubahan atau kosong, batalkan edit
    if (!namaEdit.trim() || namaEdit === profil.nama_lengkap) {
      setIsEditingNama(false);
      return;
    }

    const token = localStorage.getItem("token_mahasiswa");
    try {
      const respon = await fetch("https://api.kelas10sifp.my.id/ubah-nama", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ namaBaru: namaEdit })
      });

      if (respon.ok) {
        // Update tampilan layar secara instan agar terasa cepat
        setProfil(prev => ({ ...prev, nama_lengkap: namaEdit }));
      } else {
        alert("Gagal mengubah nama. Silakan coba lagi.");
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
    }
    
    setIsEditingNama(false); // Tutup kolom input
  };

  if (!profil) return <div className="animate-pulse h-16 w-16 bg-gray-200 rounded-full"></div>;

  return (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      
      {/* --- BAGIAN AVATAR FOTO --- */}
      <div className="relative">
        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-100 flex-shrink-0">
          {profil.foto_profil ? (
            <img src={profil.foto_profil} alt="Profil" className="h-full w-full object-cover" />
          ) : (
            <svg className="h-full w-full text-gray-400 mt-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>
        <button 
          onClick={() => inputRef.current.click()} disabled={loading}
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
      
      {/* --- BAGIAN TEKS DAN EDIT NAMA --- */}
      <div>
        <div className="flex items-center space-x-2">
          {isEditingNama ? (
            // Mode Edit: Menampilkan Kotak Input
            <input 
              type="text" 
              value={namaEdit} 
              onChange={(e) => setNamaEdit(e.target.value)}
              autoFocus
              className="border-b-2 border-blue-500 outline-none text-xl font-bold text-gray-800 bg-transparent px-1 w-full max-w-xs transition-all"
              onBlur={handleSimpanNama} // Otomatis simpan jika diklik di luar kotak
              onKeyDown={(e) => e.key === 'Enter' && handleSimpanNama()} // Simpan saat tekan tombol Enter
            />
          ) : (
            // Mode Normal: Menampilkan Nama dan Ikon Pensil
            <>
              <h2 className="text-xl font-bold text-gray-800">{profil.nama_lengkap}</h2>
              <button 
                onClick={() => { setNamaEdit(profil.nama_lengkap); setIsEditingNama(true); }} 
                className="text-gray-400 hover:text-blue-600 transition"
                title="Edit Nama"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-1 mt-1">
          {localStorage.getItem("role_pengguna") === 'dosen' ? 'NIDN' : 'NIM'}: {profil.nim}
        </p>
        <p className="text-xs text-blue-500 bg-blue-50 inline-block px-2 py-1 rounded-md">
          Klik foto untuk mengubah (Maks: 5MB)
        </p>
      </div>

    </div>
  );
}