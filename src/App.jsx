import { useState, useEffect } from 'react';
import { DAFTAR_KATEGORI } from './utils/constants';
import Login from './components/Login';
import DashboardMahasiswa from './components/DashboardMahasiswa';
import DashboardDosen from './components/DashboardDosen';

function App() {
  // STATE MENGINGAT LOGIN & ROLE
  const [token, setToken] = useState(localStorage.getItem("token_mahasiswa"));
  const [role, setRole] = useState(localStorage.getItem("role_pengguna"));

  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [pesanError, setPesanError] = useState('');

  // State Mahasiswa
  const [daftarNilai, setDaftarNilai] = useState([]);

  // State Dosen
  const [daftarMahasiswa, setDaftarMahasiswa] = useState([]);
  const [kategoriPilihan, setKategoriPilihan] = useState('Pertemuan 1');
  const [dropdownBuka, setDropdownBuka] = useState(false);
  const [inputNilai, setInputNilai] = useState({});
  const [pesanSukses, setPesanSukses] = useState('');

  // =================================================================
  // 1. FUNGSI PENGAMBILAN DATA (Dideklarasikan lebih dulu)
  // =================================================================
  const ambilNilaiKelas = async (kategori) => {
    try {
      const respon = await fetch(`https://api.kelas10sifp.my.id/nilai?kategori=${kategori}`, { headers: { "Authorization": `Bearer ${token}` }});
      const dataDariDatabase = await respon.json();
      const formatForm = {};
      dataDariDatabase.forEach((item) => { formatForm[item.nim_mahasiswa] = { skor: item.skor, catatan: item.catatan }; });
      setInputNilai(formatForm); 
    } catch (error) { 
      // Menggunakan variabel 'error' agar ESLint tidak protes
      console.error("Gagal memuat histori nilai kelas:", error); 
    }
  };

  const ambilDataNilaiMahasiswa = async () => {
    try {
      const respon = await fetch("https://api.kelas10sifp.my.id/nilai", { headers: { "Authorization": `Bearer ${token}` }});
      const dataMentah = await respon.json();
      const dataTerurut = dataMentah.sort((a, b) => DAFTAR_KATEGORI.indexOf(a.kategori) - DAFTAR_KATEGORI.indexOf(b.kategori));
      setDaftarNilai(dataTerurut);
    } catch (error) { 
      console.error("Gagal memuat nilai mahasiswa:", error); 
    }
  };

  const ambilDaftarMahasiswa = async () => {
    try {
      const respon = await fetch("https://api.kelas10sifp.my.id/mahasiswa");
      setDaftarMahasiswa(await respon.json());
    } catch (error) {
      console.error("Gagal memuat daftar mahasiswa:", error);
    }
  };

  // =================================================================
  // 2. LOGIKA API LAINNYA
  // =================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setPesanError('');
    try {
      const respon = await fetch("https://api.kelas10sifp.my.id/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, password })
      });
      const hasil = await respon.json();
      if (hasil.token) {
        localStorage.setItem("token_mahasiswa", hasil.token);
        localStorage.setItem("role_pengguna", hasil.role);
        setToken(hasil.token); setRole(hasil.role);
      } else { setPesanError("Login gagal, periksa NIM atau Password Anda."); }
    } catch (error) { 
      setPesanError("Gagal menghubungi server."); 
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token_mahasiswa"); localStorage.removeItem("role_pengguna");
    setToken(null); setRole(null); setNim(''); setPassword('');
  };

  const tanganiInputDosen = (nimMhs, field, value) => {
    setInputNilai(prev => ({ ...prev, [nimMhs]: { ...prev[nimMhs], [field]: value } }));
  };

  const simpanNilaiKelas = async () => {
    const dataYangAkanDikirim = daftarMahasiswa.map(mhs => ({
      nim: mhs.nim, skor: inputNilai[mhs.nim]?.skor || 0, catatan: inputNilai[mhs.nim]?.catatan || ""
    }));
    try {
      const respon = await fetch("https://api.kelas10sifp.my.id/nilai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kategori: kategoriPilihan, dataNilai: dataYangAkanDikirim })
      });
      if(respon.ok) {
        setPesanSukses(`Nilai ${kategoriPilihan} berhasil disimpan ke database!`);
        setTimeout(() => setPesanSukses(''), 4000);
      }
    } catch (error) { 
      alert("Gagal menyimpan nilai."); 
      console.error(error);
    }
  };

  // =================================================================
  // 3. ASISTEN EFEK (Ditaruh setelah fungsi dibuat)
  // =================================================================
  useEffect(() => {
    if (token && role === 'mahasiswa') ambilDataNilaiMahasiswa();
    else if (token && role === 'dosen') ambilDaftarMahasiswa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  useEffect(() => {
    if (token && role === 'dosen') ambilNilaiKelas(kategoriPilihan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kategoriPilihan, token, role]);


  // =================================================================
  // 4. RENDER UI 
  // =================================================================
  if (!token) {
    return <Login handleLogin={handleLogin} nim={nim} setNim={setNim} password={password} setPassword={setPassword} pesanError={pesanError} />;
  }

  if (role === 'dosen') {
    return <DashboardDosen 
      daftarMahasiswa={daftarMahasiswa} kategoriPilihan={kategoriPilihan} setKategoriPilihan={setKategoriPilihan}
      inputNilai={inputNilai} tanganiInputDosen={tanganiInputDosen} simpanNilaiKelas={simpanNilaiKelas}
      pesanSukses={pesanSukses} handleLogout={handleLogout} dropdownBuka={dropdownBuka} setDropdownBuka={setDropdownBuka}
    />;
  }

  return <DashboardMahasiswa daftarNilai={daftarNilai} handleLogout={handleLogout} />;
}

export default App;