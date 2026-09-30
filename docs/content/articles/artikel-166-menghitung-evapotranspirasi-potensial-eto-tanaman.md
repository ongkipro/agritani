---
title: "Menghitung Evapotranspirasi Potensial ETo Neraca Air Tani"
metaTitle: "Hitung Evapotranspirasi ETo: Neraca Kebutuhan Air Tani"
description: "Rumus praktis menghitung evapotranspirasi potensial ETo tanaman: mengukur evaporasi tanah, transpirasi daun, dan hitung liter siraman harian kebun."
slug: "menghitung-evapotranspirasi-potensial-eto-tanaman"
pubDate: "2026-09-30"
author: "Arif Prabowo"
topic: "air-irigasi"
commodities: []
tags:
  - "evapotranspirasi potensial eto tanaman"
  - "rumus neraca air irigasi pertanian"
  - "kebutuhan air tanaman milimeter per hari"
  - "penguapan evaporasi transpirasi daun"
  - "koefisien tanaman kc jadwal siram"
draft: false
---

Berapa liter air sebenarnya yang diminum oleh tanaman cabai, melon, atau padi setiap harinya? Pertanyaan mendasar ini jarang diketahui secara presisi oleh sebagian besar petani di lapangan. Kebiasaan menyiram tanaman hanya berdasarkan kira-kira intuisi sering kali berujung pada pemborosan energi BBM pompa irigasi, pencucian hara pupuk keluar dari jangkauan akar (*leaching*), atau justru tanaman meranggas layu karena kekurangan asupan air saat cuaca terik.

Dalam ilmu hidrologi agronomi, acuan ilmiah baku untuk mengukur kebutuhan air tanaman adalah **Evapotranspirasi Potensial Tanaman Acuan (*Reference Evapotranspiration / ETo*)**. Dengan memahami cara menghitung ETo dan koefisien tanaman, petani mampu menyusun neraca irigasi presisi sesuai kebutuhan metabolisme riil tanaman.

### 1. Memahami Konsep Evapotranspirasi: Evaporasi vs Transpirasi

Air yang hilang dari hamparan lahan pertanian terbagi ke dalam dua jalur pelepasan utama:
1. **Evaporasi ($E$)**: Penguapan air cair secara langsung dari permukaan tanah, celah mulsa, genangan becek parit, atau tetesan air yang menempel di permukaan daun ke atmosfer tanpa melewati tubuh tanaman.
2. **Transpirasi ($T$)**: Air yang diserap oleh bulu-bulu akar tanaman dari dalam tanah, dialirkan ke atas melalui pembuluh kayu xilem batang, dan diuapkan ke udara melalui celah stomata daun untuk menjaga suhu internal tanaman agar tidak terbakar panas matahari.
3. Karena kedua proses penguapan ini berlangsung bersamaan dan saling berkaitan, ilmuwan menggabungkannya menjadi istilah **Evapotranspirasi**. Nilai ETo menyatakan laju penguapan (dalam satuan milimeter air per hari, mm/hari) dari hamparan tanaman rumput hijau acuan setinggi 12 sentimeter yang tumbuh subur dan terairi penuh.

### 2. Rumus Praktis Penentuan Kebutuhan Air Tanaman (ETc)

Kebutuhan air riil komoditas tanaman tertentu (*Crop Evapotranspiration / ETc*) dihitung dengan mengalikan nilai ETo lingkungan dengan angka **Koefisien Tanaman (*Crop Coefficient / Kc*)**:
$$\text{ETc} = \text{ETo} \times \text{Kc}$$

Nilai Kc mencerminkan karakteristik morfologi daun dan fase umur pertumbuhan tanaman:
* **Fase Awal Semaian (*Initial Stage*)**: Kanopi daun masih sangat kecil, nilai $\text{Kc} = 0{,}4 - 0{,}5$. Kebutuhan air sangat sedikit.
* **Fase Vegetatif Aktif (*Development Stage*)**: Kanopi daun mulai melebar menutup bedengan, nilai $\text{Kc}$ naik bertahap menuju $0{,}7 - 0{,}8$.
* **Fase Puncak Pembungaan dan Pembuahan (*Mid-Season Stage*)**: Kanopi daun menutup sempurna dengan aktivitas transpirasi maksimal, nilai $\text{Kc}$ mencapai puncak tertinggi yaitu **$1{,}05 - 1{,}20$**.
* **Fase Pematangan Menjelang Panen (*Late-Season Stage*)**: Daun mulai menguning senesen dan rontok, nilai $\text{Kc}$ menurun kembali ke angka $0{,}6 - 0{,}7$.

### 3. Contoh Simulasi Perhitungan Volume Siraman Harian Lahan

Di daerah dataran rendah tropis beriklim panas terik (seperti Pantura Jawa atau pesisir Sumatra), nilai ETo rata-rata berkisar **4,5 mm per hari**.

**Kasus**: Petani membudidayakan cabai merah seluas $1.000\text{ m}^2$ yang sedang berada di fase puncak pembungaan ($	ext{Kc} = 1{,}10$):
$$\text{ETc} = 4{,}5\text{ mm/hari} \times 1{,}10 = 4{,}95\text{ mm/hari}$$

Karena $1\text{ mm}$ air setara dengan $1\text{ liter per meter persegi}$ ($1\text{ L/m}^2$), maka kebutuhan air harian adalah:
$$\text{Volume Air} = 4{,}95\text{ L/m}^2 \times 1.000\text{ m}^2 = 4.950\text{ liter per hari}$$

Dengan mengetahui angka 4.950 liter per hari, petani cukup menjalankan pompa fertigasi berkapasitas debit 2.500 liter per jam selama tepat 2 jam setiap hari. Tanaman tercukupi airnya secara optimal tanpa ada tetes air yang terbuang sia-sia.
