---
title: "Perancangan Sistem Fertigasi Tetes Tomat Presisi Berbasis Radiasi"
metaTitle: "Sistem Fertigasi Tetes Tomat Presisi Berbasis Radiasi"
description: "Tata cara merancang fertigasi tetes tanaman tomat presisi berdasar akumulasi radiasi surya guna mengoptimalkan serapan nutrisi hara dan efisiensi air lahan."
slug: "perancangan-sistem-fertigasi-tetes-tomat"
pubDate: "2026-09-30"
author: "Arif Prabowo"
topic: "air-irigasi"
commodities:
  - "tomat"
tags:
  - "irigasi tetes"
  - "fertigasi tomat"
  - "radiasi matahari"
  - "efisiensi hara"
  - "sensor fertigasi"
draft: false
---

Efisiensi serapan air dan nutrisi pada budidaya tomat (*Solanum lycopersicum*), baik di dalam greenhouse maupun lahan terbuka, sangat bergantung pada laju transpirasi tajuk tanaman. Pemberian larutan hara berdasarkan jadwal timer kaku sering memicu over-watering saat kondisi cuaca mendung atau memicu defisit air parah ketika terik matahari ekstrem. Perancangan sistem fertigasi tetes presisi berbasis akumulasi radiasi matahari (*solar radiation sum*) menyelaraskan injeksi larutan hara dengan dinamika fisiologis stomata tanaman tomat secara riil.

### Arsitektur Jaringan Distribusi dan Pemilihan Emitter Presisi

Sistem fertigasi tetes terdiri dari unit kepala kontrol (*head unit*), pipa utama (*submain line*), dan pipa lateral berbahan *low-density polyethylene* (LDPE) yang dilengkapi emitter tetes:

1. **Emitter Pressure-Compensating (PC)**: Wajib digunakan pada lahan bergelombang atau deretan bedengan melebihi panjang 30 meter. Emitter PC mempertahankan debit konstan (misalnya 2,0 liter per jam) pada rentang tekanan kerja 0,8 hingga 3,5 bar, menjamin keseragaman emisi (*emission uniformity*, EU) di atas 92%.
2. **Pipa Lateral dan Stick Dripper**: Menggunakan pipa PE diameter luar 16 mm yang disambungkan ke mikrotubing 3x5 mm menuju stik penancap (*arrow dripper*) berlabirin di pangkal batang tomat.
3. **Sistem Dosing Injeksi Venturi**: Memanfaatkan injektor venturi atau pompa dosing proporsional elektrik untuk menyedot larutan stok pupuk A (kalsium, zat besi kelat) dan stok B (fosfat, sulfat, mikronutrien) dengan rasio pengenceran terkalibrasi secara presisi.

Tekanan dinamis pada manifold pembagi diatur memakai pengatur tekanan (*pressure regulator*) pada level 1,5 bar, didukung katup pelepasan udara (*air release valve*) di titik tertinggi jalur pipa guna mengeliminasi water hammer dan kantong udara.

### Logika Kontrol Berdasarkan Akumulasi Radiasi Surya (Joules/cm²)

Kebutuhan transpirasi tomat berkorelasi langsung dengan intensitas radiasi matahari global yang diterima daun. Sensor solarimeter (pyranometer) dipasang di atas tajuk tanaman untuk mengukur radiasi dalam satuan watt per meter persegi ($W/m^2$) dan diintegrasikan oleh mikrokontroler menjadi total akumulasi energi ($J/cm^2$):

- **Trigger Akumulasi**: Pembuat keputusan fertigasi diset untuk memicu satu siklus penyiraman setiap kali radiasi surya terakumulasi sebesar 100 hingga 130 $J/cm^2$. Pada siang hari terik (radiasi 800 $W/m^2$), fertigasi dapat aktif setiap 20–25 menit, sedangkan saat cuaca berawan tebal siklus melebar menjadi 60–90 menit.
- **Volume Dosis per Shot**: Dosis setiap siklus penyiraman dibatasi antara 80 hingga 150 ml per tanaman tergantung fase vegetatif atau generatif, dirancang untuk membasahi zona aktif perakaran tanpa melarutkan hara keluar dari polybag atau guludan.
- **Target Drainase**: Pada media substrat kokopit atau arang sekam, volume drainase (*drain percentage*) ditargetkan stabil pada kisaran 15% hingga 20% dari total input hara harian, berfungsi mencuci kelebihan garam natrium dan mencegah akumulasi electrical conductivity (EC) berlebih di rizosfer.

### Manajemen Electrical Conductivity (EC) dan pH Larutan Injeksi

Kualitas larutan hara yang diinjeksikan ke dalam jaringan irigasi tetes harus dipantau memakai sensor EC dan pH online otomatis:

$$\text{Tingkat Injeksi Pupuk} \implies \text{EC Target: } 2,2 - 2,8\ \text{mS/cm}, \quad \text{pH Target: } 5,8 - 6,2$$

Pada fase pematangan buah, peningkatan EC hingga 2,8 mS/cm membantu meningkatkan konsentrasi padatan terlarut (derajat Brix) dan rasa buah tomat. Nilai pH dijaga ketat pada kisaran 5,8–6,2 menggunakan injeksi asam nitrat ($HNO_3$) atau asam fosfat ($H_3PO_4$) encer agar seluruh kation ($Ca^{2+}, Mg^{2+}, K^+$) dan anion terlarut tetap berada dalam bentuk tersedia yang mudah diserap rambut akar.
