export default function Login({ handleLogin, nim, setNim, password, setPassword, pesanError }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-50">
        
        {/* --- BAGIAN HEADER YANG DIUBAH --- */}
        <div className="bg-blue-700 p-6 text-center">
          {/* Memanggil gambar dari folder public */}
          <img 
            src="/logo-nilai-login-web-kelas.png" 
            alt="Logo Kelas" 
            className="mx-auto h-20 w-auto mb-4 drop-shadow-md rounded-full" 
          />
          <h2 className="text-2xl font-bold text-white tracking-wide">Login Akademik</h2>
          <p className="text-blue-100 text-sm mt-2">Dosen & Mahasiswa</p>
        </div>
        <div className="p-8">
          {pesanError && <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">{pesanError}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">NIM / NIDN Dosen</label>
              <input type="text" placeholder="Masukkan ID Pengguna" value={nim} onChange={(e) => setNim(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input type="password" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:-translate-y-0.5">
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}