import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deauthUser, isAuthenticated } from "../utils/auth";
import { Button, Dropdown, Form, Input, Menu, Popover, message } from "antd";
// import { sanityClient } from "../lib/sanity/getClient";
// import { InboxOutlined } from '@ant-design/icons';
import axios from "axios";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'antd/dist/reset.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Memperbaiki ikon marker
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
  // const [namaLokasi, setNamaLokasi] = useState('');
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
  // const [kordinat, setKordinat] = useState('');

  const handleAlamatChange = (e) => {
    setAlamat(e.target.value);
  };

  // const handleKordinatChange = (e) => {
  //   setKordinat(e.target.value);
  // };

  // const [latitude, setLatitude] = useState(null);
  // const [longitude, setLongitude] = useState(null);

  // const parseCoordinates = () => {
  //   try {
  //     // Coba mem-parsing input koordinat
  //     let coordinates = kordinat.replace(/[()]/g, ''); // Hilangkan tanda kurung jika ada
  //     coordinates = coordinates.split(',');

  //     if (coordinates.length === 2) {
  //       const lat = parseFloat(coordinates[0].trim());
  //       const lng = parseFloat(coordinates[1].trim());

  //       if (!isNaN(lat) && !isNaN(lng)) {
  //         return { lat, lng };
  //       }
  //     }

  //     return null;
  //   } catch (error) {
  //     console.error('Failed to parse coordinates:', error);
  //     return null;
  //   }
  // };

  // const onFinishX = (values) => {
  //   const { coordinates } = values;

  //   const parsedCoords = parseCoordinates(coordinates);

  //   if (parsedCoords) {
  //     setLatitude(parsedCoords.lat);
  //     setLongitude(parsedCoords.lng);
      
  //     setGeometry({ lat: parsedCoords.lat, lng: parsedCoords.lng });
  //     message.success(`Lokasi ditemukan`);
  //   } else {
  //     message.error('Invalid coordinates. Please enter coordinates in format "-8.665041, 116.194405" or "(-8.665041, 116.194405)".');
  //     setGeometry({ lat: '', lng: '' });
  //   }
  // };

  const [position, setPosition] = useState({ lat: -8.692290, lng: 116.183420 });

  const handleSave = () => {
    setGeometry({ lat: position.lat, lng: position.lng });
    message.success(`Berhasil menyimpan titik lokasi`);
  };

  console.log('cek geometry:', geometry)

  const gradientStyle = {
    background: 'linear-gradient(to right, rgba(255, 255, 255, 0.95), transparent)',
    position: 'absolute',
    inset: '0'
  };

  const menu = (
    <Menu>
      <Menu.Item key="webgis"><a href="https://relawangis.netlify.app/" target="_blank">Lihat Web GIS</a></Menu.Item>
      <Menu.Item key="signout" onClick={deauthUser}>Logout</Menu.Item>
    </Menu>
  );
  return (
    <>
      <section id="hero" className="relative bg-[url(https://ik.imagekit.io/tvlk/blog/2021/03/Mandalika.jpg)] bg-cover bg-center bg-no-repeat">
        <div style={gradientStyle}></div>
        <div className="absolute right-0 p-6 cursor-pointer">
          {/* <Dropdown overlay={menu} placement="bottomRight" arrow trigger={['click']}> */}
            <div onClick={deauthUser} className="w-10 h-10 rounded-full bg-gray-300 flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 1024 1024">
                <path fill="black" d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8c-7 8.5-14.5 16.7-22.4 24.5a353.8 353.8 0 0 1-112.7 75.9A352.8 352.8 0 0 1 512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.8 353.8 0 0 1-112.7-75.9a353.3 353.3 0 0 1-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8s94.3 9.3 137.9 27.8c42.2 17.8 80.1 43.4 112.7 75.9c7.9 7.9 15.3 16.1 22.4 24.5c3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C798 160.5 663.8 81.6 511.3 82C271.7 82.6 79.6 277.1 82 516.4C84.4 751.9 276.2 942 512.4 942c152.1 0 285.7-78.8 362.3-197.7c3.4-5.3-.4-12.3-6.7-12.3m88.9-226.3L815 393.7c-5.3-4.2-13-.4-13 6.3v76H488c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6" />
              </svg>
            </div>
          {/* </Dropdown> */}
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
                {/* <Button className="bg-green-600 text-white px-6" onClick={fetchGeocode}>Cari</Button> */}
              </div>
            </Form.Item>

            <Form.Item
              label="Input Kordinat"
              name="position"
              // rules={[{ required: true, message: 'Titik kordinat harus diisi' }]}
            >
              {/* <div className="flex gap-2">
                <Input onChange={handleKordinatChange} value={kordinat} placeholder="-8.665041, 116.194405 atau (-8.665041, 116.194405)" />
                <Button className="bg-green-600 text-white" onClick={onFinishX}>Tentukan Kordinat</Button>
              </div> */}
              <div>
                <MapContainer center={position} zoom={13} style={{ height: '60vh', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={position}
                    draggable={true}
                    eventHandlers={{
                      dragend(event) {
                        setPosition(event.target.getLatLng());
                      },
                    }}
                  >
                    <Popup>
                      <div>
                        <p>Latitude: {position.lat.toFixed(4)}</p>
                        <p>Longitude: {position.lng.toFixed(4)}</p>
                        <Button className="bg-green-600 text-white" onClick={handleSave}>Simpan Titik</Button>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </Form.Item>
            <div className="text-gray-400 text-xs -mt-4 mb-6">
              {position.lat && position.lng && (
                <p>({position.lat}, {position.lng})</p>
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
              <Button className="bg-rose-700 text-white" htmlType="submit" loading={loading} disabled={!imageUrl || !geometry}>
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