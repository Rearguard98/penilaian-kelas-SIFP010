import UbahPassword from './UbahPassword';

export default function DashboardMahasiswa({ daftarNilai, handleLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-700 p-6 sm:px-8 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Portal Nilai Mahasiswa</h2>
            <p className="text-blue-100 text-sm mt-1">Sistem Penilaian Akademik Terpadu</p>
          </div>
          <button onClick={handleLogout} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow">
            Logout
          </button>
        </div>

        <div className="p-4 sm:p-8">
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                <tr>
                  <th className="p-4 font-semibold border-b">Kategori Tugas</th>
                  <th className="p-4 font-semibold text-center border-b">Skor</th>
                  <th className="p-4 font-semibold border-b w-1/2">Catatan Dosen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {daftarNilai.map((nilai) => (
                  <tr key={nilai.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-700">{nilai.kategori}</td>
                    <td className="p-4 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${nilai.skor >= 90 ? 'bg-green-100 text-green-700' : nilai.skor >= 80 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {nilai.skor}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 text-sm min-w-62.5 leading-relaxed">
                      <div className="bg-gray-100 p-3 rounded border border-gray-200 whitespace-pre-wrap font-mono overflow-x-auto">
                        {nilai.catatan ? nilai.catatan : "-"}
                      </div>
                    </td>
                  </tr>
                ))}
                {daftarNilai.length === 0 && (
                   <tr><td colSpan="3" className="p-4 text-center text-gray-500">Belum ada nilai yang dimasukkan oleh Dosen.</td></tr>
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