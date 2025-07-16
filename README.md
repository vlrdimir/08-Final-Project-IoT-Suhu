# Dokumentasi Proyek SUHU Berbasis IOT - Kelompok 8

## Persyaratan Sistem

- Node.js versi 20 atau lebih tinggi

## Konfigurasi Environment Variables

### GOOGLE_GENERATIVE_AI_API_KEY

API key untuk mengakses Google Generative AI.

**Cara mendapatkan:**

1. Kunjungi [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login dengan akun Google Anda
3. Buat API key baru
4. Salin API key dan tambahkan ke file `.env` Anda

### TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN

Kredensial untuk mengakses database Turso.

**Cara mendapatkan:**

1. Kunjungi [Turso](https://turso.tech/) dan buat akun
2. Buat database baru
3. Dapatkan Database URL dan Auth Token dari dashboard
4. Tambahkan kedua variabel tersebut ke file `.env` Anda

### MQTT Credentials

Kredensial untuk koneksi MQTT (Message Queuing Telemetry Transport).

**Cara mendapatkan:**

1. Kunjungi [EMQX Cloud](https://www.emqx.com/en/try?tab=cloud)
2. Daftar dan buat deployment serverless atau dedicated
3. Dapatkan informasi koneksi MQTT dari dashboard
4. Tambahkan variabel berikut ke file `.env` Anda:
   - NEXT_PUBLIC_MQTT_URL (broker URL)
   - NEXT_PUBLIC_MQTT_USER (username)
   - NEXT_PUBLIC_MQTT_PASSWORD (password)

## Format File .env

```
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key_here
TURSO_DATABASE_URL=your_turso_database_url_here
TURSO_AUTH_TOKEN=your_turso_auth_token_here

NEXT_PUBLIC_MQTT_URL=your_mqtt_broker_url_here
NEXT_PUBLIC_MQTT_USER=your_mqtt_username_here
NEXT_PUBLIC_MQTT_PASSWORD=your_mqtt_password_here
```

## Menjalankan Proyek

### Instalasi Dependency

```bash
npm install
```

### Migrasi Database

```bash
npm run migrate
```

### Menjalankan MQTT Receiver

```bash
npm run mqtt:receiver
```

### Menjalankan Aplikasi Frontend

```bash
npm run dev
```

Setelah menjalankan perintah `npm run dev`, aplikasi akan tersedia di `http://localhost:3000`.
