import { DAFTAR_KATEGORI } from '../utils/constants';
import UbahPassword from './UbahPassword';
import FotoProfil from './FotoProfil';

export default function DashboardDosen({ 
  daftarMahasiswa, kategoriPilihan, setKategoriPilihan, 
  inputNilai, tanganiInputDosen, simpanNilaiKelas, 
  pesanSukses, handleLogout, dropdownBuka, setDropdownBuka 
}) {
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
                {daftarMahasiswa.map((mhs) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <UbahPassword/>
      </div>
    </div>
  );
}