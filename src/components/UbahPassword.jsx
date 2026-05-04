import { useState } from 'react';

export default function UbahPassword() {
  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [pesan, setPesan] = useState(null);
  const [status, setStatus] = useState(''); // 'sukses' atau 'error'

  const handleUbahPassword = async (e) => {
    e.preventDefault();
    setPesan(null);

    // Validasi Dasar
    if (passwordBaru !== konfirmasi) {
      setStatus('error');
      return setPesan("Konfirmasi password tidak cocok!");
    }
    if (passwordBaru.length < 6) {
      setStatus('error');
      return setPesan("Password baru minimal 6 karakter!");
    }

    try {
      const token = localStorage.getItem("token_mahasiswa");
      const respon = await fetch("https://api.kelas10sifp.my.id/ubah-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ passwordLama, passwordBaru })
      });

      const hasil = await respon.json();

      if (respon.ok) {
        setStatus('sukses');
        setPesan(hasil.pesan);
        setPasswordLama(''); setPasswordBaru(''); setKonfirmasi('');
      } else {
        setStatus('error');
        setPesan(hasil.error);
      }
    } catch (error) {
      setStatus('error');
      setPesan("Gagal menghubungi server.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Pengaturan Keamanan</h3>
      
      {pesan && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${status === 'sukses' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {status === 'sukses' ? '✅ ' : '❌ '} {pesan}
        </div>
      )}

      <form onSubmit={handleUbahPassword} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Password Lama</label>
          <input type="password" required value={passwordLama} onChange={(e) => setPasswordLama(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password Baru</label>
            <input type="password" required value={passwordBaru} onChange={(e) => setPasswordBaru(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Konfirmasi Password Baru</label>
            <input type="password" required value={konfirmasi} onChange={(e) => setKonfirmasi(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition text-sm font-semibold">
          Simpan Password Baru
        </button>
      </form>
    </div>
  );
}