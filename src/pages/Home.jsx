import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deauthUser, isAuthenticated } from "../utils/auth";
import { Button, Dropdown, Form, Input, Menu, Upload, message } from "antd";
import { sanityClient } from "../lib/sanity/getClient";
import { InboxOutlined } from '@ant-design/icons';
import axios from "axios";

const { TextArea } = Input;

function Home() {
  const navigate = useNavigate();
  const relawan_userData = JSON.parse(localStorage.getItem('relawan_userData'));
  const relawan_id = (localStorage.getItem('relawan_id'));
  console.log('cek user: ', relawan_userData)

  useEffect(() => {
    // Check if the user is authenticated when the component mounts
    if (!isAuthenticated()) {
      // If not authenticated, redirect to the sign-in page
      message.error("Kamu belum login. Silahkan login terlebir dahulu!");
      navigate("/");
    }
  }, [navigate]);

  const [loading, setLoading] = useState(false);
  const [geometry, setGeometry] = useState({ lng: '', lat: '' });
  const [namaLokasi, setNamaLokasi] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'h36o5eck'); // Ganti dengan upload preset Anda

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dnuyb460n/image/upload`, // Ganti dengan cloud name Anda
        formData
      );

      if (response.status === 200) {
        setImageUrl(response.data.secure_url);
        message.success('Gambar berhasil diunggah');
      } else {
        message.error('Gagal mengunggah gambar');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Gagal mengunggah gambar');
    } finally {
      // setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Kirim data ke Sanity
      await fetch(`https://ln9ujpru.api.sanity.io/v2021-03-25/data/mutate/production`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer skAdQo8vEzaH81Ah4n2X8QDNsgIfdWkJlLmbo3CbT6Nt3nW7iTLx2roYCOm9Rlp1mQV2nEEGCqf4aGSMaJx67iK5PZPe7CgmI9Lx9diRdq0ssoRzl1LhiUFXHQmKu0utxgBa1ttoKwat3KIFt2B5vskrT82ekR5B8sbSzE51VjZHy3T7Q62P`,
        },
        body: JSON.stringify({
          mutations: [
            {
              create: {
                _type: 'data-kunjungan',
                alamatTujuan: values.alamatTujuan,
                namaYangDikunjungi: values.namaYangDikunjungi,
                keteranganKunjungan: values.keteranganKunjungan,
                fotoEksternal: imageUrl,
                geometry: geometry,
                user: {
                  _type: 'reference',
                  _ref: relawan_id // Ganti dengan ID pengguna jika perlu
                }
              },
            },
          ],
        }),
      });

      message.success('Data kunjungan berhasil ditambahkan!');
      setLoading(false);
    } catch (error) {
      console.error('Error adding data:', error);
      message.error('Gagal menambahkan data kunjungan');
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const [alamat, setAlamat] = useState('');

  const fetchGeocode = async () => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(alamat)}`);
      if (response.data.length > 0) {
        const { lat, lon, display_name } = response.data[0];
        setGeometry({ lat, lng: lon });
        setNamaLokasi(display_name);
        message.success('Lokasi ditemukan');
      } else {
        setGeometry({ lat: '', lng: '' });
        setNamaLokasi('');
        message.error('Alamat tidak ditemukan');
      }
    } catch (error) {
      console.error('Error geocoding:', error);
      message.error('Gagal melakukan geocoding');
      setGeometry({ lat: '', lng: '' });
      setNamaLokasi('');
    }
  };

  const handleAlamatChange = (e) => {
    setAlamat(e.target.value);
  };

  const gradientStyle = {
    background: 'linear-gradient(to right, rgba(255, 255, 255, 0.95), transparent)',
    position: 'absolute',
    inset: '0'
  };

  const menu = (
    <Menu>
      <Menu.Item key="signout" onClick={deauthUser}>Logout</Menu.Item>
    </Menu>
  );
  return (
    <>
      <section id="hero" className="relative bg-[url(https://ik.imagekit.io/tvlk/blog/2021/03/Mandalika.jpg)] bg-cover bg-center bg-no-repeat">
        <div style={gradientStyle}></div>
        <div className="absolute right-0 p-6">
          <Dropdown overlay={menu} placement="bottomRight" arrow>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex justify-center items-center">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="12" r="8" fill="#333" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M42 44C42 34.0589 33.9411 26 24 26C14.0589 26 6 34.0589 6 44" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Dropdown>
        </div>

        <div className="relative mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8">
          <div className="max-w-xl text-center sm:text-left">
            <div className="flex justify-center items-center mb-6">
              <img width={200} src="https://berundang.com/wp-content/uploads/2024/06/logo-laskar-relawan.png" />
            </div>
            <h1 className="text-3xl font-extrabold sm:text-5xl text-gray-800">
              Selamat datang di
              <strong className="block font-extrabold text-rose-700"> PORTAL GIS RELAWAN. </strong>
            </h1>

            <p className="mt-4 max-w-lg sm:text-xl/relaxed text-gray-700">
              Ini adalah website untuk menambahkan titik lokasi kunjungan relawan.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-center">
              <a
                href="#input-kunjungan"
                className="flex justify-center items-center w-full rounded bg-rose-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-rose-700 focus:outline-none focus:ring active:bg-rose-500 sm:w-auto"
              >
                Input Kunjungan
              </a>

              <Link
                to="/data-kunjungan"
                className="flex py-2 justify-center w-full rounded bg-white px-12 items-center text-sm shadow focus:outline-none focus:ring active:text-rose-500 sm:w-auto"
              >
                <Button className="border-0 font-medium text-rose-600 hover:text-rose-700">
                  Data Kunjungan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section id="input-kunjungan" className="text-gray-600 py-10 lg:px-36 mb-10">
        <div className="lg:px-60 px-4">
          <Form
            name="addDataForm"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label="Alamat Tujuan"
              name="alamatTujuan"
              rules={[{ required: true, message: 'Alamat tujuan harus diisi' }]}
            >
              <div className="flex gap-2">
                <Input onChange={handleAlamatChange} value={alamat} />
                <Button className="bg-green-600 text-white px-6" onClick={fetchGeocode}>Cari</Button>
              </div>
            </Form.Item>
            <div className="text-gray-400 text-xs -mt-4 mb-6">
              {geometry.lat && geometry.lng && (
                <p>{namaLokasi} ({geometry.lat}, {geometry.lng})</p>
              )}
            </div>

            <Form.Item
              label="Nama yang Dikunjungi"
              name="namaYangDikunjungi"
              rules={[{ required: true, message: 'Nama yang dikunjungi harus diisi' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Keterangan Kunjungan"
              name="keteranganKunjungan"
              rules={[{ required: true, message: 'Keterangan kunjungan harus diisi' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
        label="Foto"
        name="foto"
        rules={[{ required: true, message: 'Foto harus diunggah' }]}
      >
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </Form.Item>

            <Form.Item
              label="Longitude"
              name="lng"
              initialValue={geometry.lng}
              hidden
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="Latitude"
              name="lat"
              initialValue={geometry.lat}
              hidden
            >
              <Input disabled />
            </Form.Item>

            <Form.Item>
              <Button className="bg-rose-700 text-white" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>
    </>
  )
}

export default Home