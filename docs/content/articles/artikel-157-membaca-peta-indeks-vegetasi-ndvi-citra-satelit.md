---
title: "Membaca Peta Indeks Vegetasi NDVI Citra Satelit Pertanian"
metaTitle: "Membaca Peta Indeks Vegetasi NDVI Citra Satelit Lahan"
description: "Panduan membaca peta indeks vegetasi NDVI satelit Sentinel-2: interpretasi skala warna klorofil, deteksi kekeringan dini, dan pantau hama petak sawah."
slug: "membaca-peta-indeks-vegetasi-ndvi-citra-satelit"
pubDate: "2026-09-30"
author: "Arif Prabowo"
topic: "sains-tanaman"
commodities:
  - "padi"
tags:
  - "membaca peta citra satelit ndvi lahan"
  - "normalized difference vegetation index"
  - "interpretasi warna indeks vegetasi hijau"
  - "deteksi serangan hama skala luas satelit"
  - "pemantauan kekeringan lahan sentra padi"
draft: true
---

Pemantauan kondisi lahan pertanian kini tidak lagi terbatas pada pandangan mata di batas pematang sawah. Menggunakan data citra satelit penginderaan jauh (*remote sensing*) terbuka seperti satelit Sentinel-2 milik Badan Antariksa Eropa (ESA) atau Landsat-9 milik NASA, pengelola agribisnis dan dinas pertanian dapat memantau ribuan hektare hamparan tanaman secara berkala dari layar komputer.

Indikator visual paling populer yang digunakan dalam analisis citra satelit pertanian adalah **Normalized Difference Vegetation Index (NDVI)**. Memahami rumus matematika dasar dan cara menerjemahkan spektrum warna pada peta NDVI sangat penting agar petani dan praktisi lapangan mampu membaca pesan biologis tanaman dari luar angkasa.

### 1. Rumus Matematika NDVI dan Prinsip Pantulan Klorofil

Nilai NDVI dihitung berdasarkan perbedaan pantulan radiasi gelombang elektromagnetik matahari oleh tajuk daun tanaman:
$$\text{NDVI} = \frac{\text{NIR} - \text{RED}}{\text{NIR} + \text{RED}}$$

Klorofil pada daun tanaman yang sehat menyerap sebagian besar sinar merah tampak (*RED*, sekitar 660 nm) untuk melangsungkan proses fotosintesis, sementara jaringan sel mesofil daun memantulkan kembali sinar inframerah dekat (*NIR*, sekitar 840 nm) ke atmosfer:
* **Nilai Skala NDVI**: Selalu berada pada rentang matematis antara **-1,0 hingga +1,0**.
* **Nilai Negatif (-1,0 s.d. 0,0)**: Menunjukkan permukaan non-vegetasi seperti badan air danau, saluran primer irigasi, awan kabut tebal, atau atap bangunan perumahan.
* **Nilai Mendekati Nol (0,0 s.d. 0,2)**: Menunjukkan permukaan tanah gundul, lahan sawah yang baru dibajak traktor, jalan berbatu, atau hamparan pasir tandus.
* **Nilai Rendah (0,2 s.d. 0,4)**: Menunjukkan semak belukar jarang, vegetasi yang mengalami kekeringan ekstrem, atau bibit persemaian yang kanopinya belum menutup tanah.
* **Nilai Sedang (0,4 s.d. 0,6)**: Menunjukkan tanaman fase vegetatif awal yang sedang tumbuh aktif dengan tutupan kanopi sekitar separuh petak.
* **Nilai Tinggi (0,6 s.d. 0,9)**: Menunjukkan kanopi tanaman rapat, sehat bugar, dengan kandungan klorofil melimpah pada puncak fase vegetatif atau awal pembuahan.

### 2. Cara Menginterpretasikan Gradasi Warna pada Peta NDVI

Perangkat lunak Sistem Informasi Geografis (SIG) menerjemahkan angka NDVI ke dalam gradasi palet warna visual agar mudah dipahami:
1. **Warna Hijau Tua Gelap (NDVI > 0,7)**: Indikasi hamparan tanaman prima, pasokan air irigasi tercukupi, serapan nitrogen optimal, dan tajuk daun rapat menutup permukaan bedengan.
2. **Warna Kuning Jingga (NDVI 0,3 - 0,5)**: Tanda peringatan lapangan (*alert zone*). Tanaman mengalami penurunan laju fotosintesis akibat kekurangan air, tanah terlalu masam, atau defisiensi pupuk mikro.
3. **Warna Merah Menyala (NDVI < 0,25)**: Indikasi anomali kerusakan parah di lapangan. Jika petak tersebut seharusnya terisi tanaman jagung berumur 60 hari namun terbaca merah di peta satelit, dapat dipastikan petak tersebut hancur akibat serangan hama ulat grayak, rebah diterjang angin ribut, atau mati tergenang banjir.

### 3. Pemanfaatan Satelit Sentinel-2 untuk Petani Indonesia

Data satelit Sentinel-2 dapat diakses gratis oleh masyarakat umum melalui portal daring seperti Sentinel Hub EO Browser atau Google Earth Engine:
* Satelit Sentinel-2 memperbarui foto daratan Indonesia setiap 5 hari sekali dengan resolusi spasial 10 meter per piksel (setiap piksel mewakili petak 10x10 meter di sawah).
* Petani dapat membandingkan peta NDVI minggu ini dengan peta dua minggu lalu untuk melihat tren laju pertumbuhan tanaman pasca pemupukan kedua. Jika warna hijau tidak berkembang melebar, petani dapat segera melakukan audit lapangan ke lokasi petak bersangkutan.
