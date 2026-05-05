import { useState } from 'react';
import { DAFTAR_KATEGORI } from '../utils/constants';
import UbahPassword from './UbahPassword';
import FotoProfil from './FotoProfil';

export default function DashboardDosen({ 
  daftarMahasiswa, kategoriPilihan, setKategoriPilihan, 
  inputNilai, tanganiInputDosen, simpanNilaiKelas, 
  pesanSukses, handleLogout, dropdownBuka, setDropdownBuka 
}) {
  // ==========================================
  // FUNGSI EXPORT KE EXCEL / CSV
  // ==========================================
  const handleExportCSV = () => {
    // 1. Pastikan ada data yang bisa diekspor
    if (!daftarMahasiswa || daftarMahasiswa.length === 0) {
      alert("Belum ada data mahasiswa untuk diekspor!");
      return;
    }

    // 2. Buat Header (Baris pertama di Excel)
    // Gunakan koma (,) sebagai pemisah standar CSV
    let csvContent = "NIM,Nama Lengkap,Nilai Tugas,Nilai UTS,Nilai UAS,Nilai Akhir\n";

    // 3. Looping data mahasiswa dan masukkan ke baris-baris di bawahnya
    daftarMahasiswa.forEach((mhs) => {
      // Pastikan nama tidak mengandung koma agar format tidak rusak (ganti dengan spasi)
      const namaAman = mhs.nama_lengkap ? mhs.nama_lengkap.replace(/,/g, " ") : "-";
      const tugas = mhs.tugas || 0;
      const uts = mhs.uts || 0;
      const uas = mhs.uas || 0;
      const nilaiAkhir = mhs.nilai_akhir || 0;

      // Susun menjadi satu baris teks pemisah koma
      const baris = `${mhs.nim},${namaAman},${tugas},${uts},${uas},${nilaiAkhir}\n`;
      csvContent += baris;
    });

    // 4. Proses "Sihir" Blob: Mengubah teks menjadi file fisik
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // 5. Buat link rahasia dan paksa browser untuk mendownloadnya
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Rekap_Nilai_02SIFP010.csv`); // Nama file saat terunduh
    document.body.appendChild(link);
    link.click();
    
    // 6. Bersihkan memori setelah selesai
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ==========================================
   // STATE & LOGIKA PENCARIAN MAHASISWA
   // ==========================================
   const [kataKunci, setKataKunci] = useState('');

   // Kita tidak akan merender daftarMahasiswa mentah,
   // Melainkan kita merender data yang sudah difilter ini
   const mahasiswaTerfilter = daftarMahasiswa?.filter((mhs) => {
     // Ubah semua ke huruf kecil agar pencarian tidak sensitif huruf besar/kecil
     const namaCocok = mhs.nama_lengkap?.toLowerCase().includes(kataKunci.toLowerCase());
     const nimCocok = mhs.nim?.toLowerCase().includes(kataKunci.toLowerCase());
     
     // Data akan tampil jika Nama ATAU NIM-nya cocok dengan ketikan
     return namaCocok || nimCocok;
   }) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-800 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">Portal Dosen - Input Nilai</h2>
            <p className="text-indigo-200 text-sm mt-1">Sistem Evaluasi Kelas Terpadu</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow">
            Logout
          </button>
        </div>

        <FotoProfil/>

        <div className="p-6">
          {/* Filter Pemilihan Pertemuan */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-indigo-900 mb-2">Pilih Kategori Penilaian:</label>
              
              <div className="relative w-full sm:w-64">
                <button 
                  type="button"
                  onClick={() => setDropdownBuka(!dropdownBuka)}
                  onBlur={() => setTimeout(() => setDropdownBuka(false), 200)}
                  className="w-full text-left px-4 py-2.5 rounded border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none flex justify-between items-center shadow-sm"
                >
                  <span className="truncate font-medium text-gray-700">
                    {kategoriPilihan === 'UTS' ? 'Ujian Tengah Semester (UTS)' : kategoriPilihan === 'UAS' ? 'Ujian Akhir Semester (UAS)' : kategoriPilihan}
                  </span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownBuka ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                {dropdownBuka && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    {DAFTAR_KATEGORI.map((kategori) => (
                      <div 
                        key={kategori}
                        onClick={() => { setKategoriPilihan(kategori); setDropdownBuka(false); }}
                        className={`px-4 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors border-b border-gray-50 ${kategoriPilihan === kategori ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-700'}`}
                      >
                        {kategori === 'UTS' ? 'Ujian Tengah Semester (UTS)' : kategori === 'UAS' ? 'Ujian Akhir Semester (UAS)' : kategori}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={simpanNilaiKelas}
              className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-md transition-colors"
            >
              Simpan Nilai {kategoriPilihan}
            </button>
          </div>

          {pesanSukses && <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 font-medium">{pesanSukses}</div>}
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <h3 className="text-lg font-bold text-gray-800 w-full sm:w-auto">
              Data Penilaian Mahasiswa
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              
              <div className="relative w-full sm:w-64 text-gray-600">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari Nama atau NIM..."
                  value={kataKunci}
                  onChange={(e) => setKataKunci(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              
              <button
                onClick={handleExportCSV}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow-sm transition font-semibold text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Unduh Rekap (CSV)</span>
              </button>
              
            </div>
          </div>
          {/* ========================================== */}

          {/* Tabel Input Nilai Mahasiswa */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 border-b font-semibold">NIM</th>
                  <th className="p-4 border-b font-semibold">Nama Mahasiswa</th>
                  <th className="p-4 border-b font-semibold w-32">Skor (0-100)</th>
                  <th className="p-4 border-b font-semibold">Catatan Khusus (Opsional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {mahasiswaTerfilter.length > 0 ? (
                  mahasiswaTerfilter.map((mhs) => (
                    <tr key={mhs.nim} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-600 align-top">{mhs.nim}</td>
                      <td className="p-4 font-medium align-top">{mhs.nama_lengkap}</td>
                    <td className="p-4 align-top">
                      <input 
                        type="number" min="0" max="100" placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={inputNilai[mhs.nim]?.skor || ''}
                        onChange={(e) => tanganiInputDosen(mhs.nim, 'skor', e.target.value)}
                      />
                    </td>
                    <td className="p-4 align-top">
                      <textarea 
                        rows="3" 
                        placeholder="Tulis evaluasi atau sisipkan kode HTML/PHP di sini..."
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-20 font-mono text-sm"
                        value={inputNilai[mhs.nim]?.catatan || ''}
                        onChange={(e) => tanganiInputDosen(mhs.nim, 'catatan', e.target.value)}
                      ></textarea>
                    </td>
                  </tr>
                  ))
                ) : (
                  // Menampilkan pesan jika pencarian tidak ditemukan
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-lg font-medium">Mahasiswa tidak ditemukan</p>
                      <p className="text-sm">Coba gunakan kata kunci atau ejaan lain.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <UbahPassword/>
      </div>
    </div>
  );
}