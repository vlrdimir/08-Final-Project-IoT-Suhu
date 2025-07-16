import { db } from "@/db/db";
import { sensorData } from "@/db/schema";
import mqtt from "mqtt";

(async () => {
  const client = mqtt.connect(
    `mqtts://${process.env.NEXT_PUBLIC_MQTT_URL}:8883`,
    {
      username: process.env.NEXT_PUBLIC_MQTT_USER,
      password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
      reconnectPeriod: 1000,
    }
  );

  // Menunggu koneksi terbentuk
  client.on("connect", () => {
    console.log("MQTT Receiver terhubung ke broker");

    // Subscribe ke topic yang sama untuk melihat apakah pesan dikirim dengan benar
    client.subscribe("suhu", (err) => {
      if (!err) {
        console.log("Berhasil subscribe ke topik suhu");
      }
    });

    client.subscribe("kelembaban", (err) => {
      if (!err) {
        console.log("Berhasil subscribe ke topik kelembaban");
      }
    });

    // // Kirim data suhu secara periodik untuk simulasi
    // setInterval(() => {
    //   // Hasilkan suhu acak antara 20-35°C
    //   const randomTemp = (Math.random() * 15 + 20).toFixed(1);

    //   // Publish ke topic suhu
    //   client.publish("suhu", randomTemp);
    //   console.log(
    //     `[${new Date().toLocaleTimeString()}] Mengirim suhu: ${randomTemp}°C`
    //   );

    //   // Hasilkan kelembaban acak antara 30-90%
    //   const randomHumidity = Math.floor(Math.random() * 60 + 30).toString();

    //   // Publish ke topic kelembaban
    //   client.publish("kelembaban", randomHumidity);
    //   console.log(
    //     `[${new Date().toLocaleTimeString()}] Mengirim kelembaban: ${randomHumidity}%`
    //   );
    // }, 3000); // Kirim setiap 3 detik
  });

  // Simpan waktu terakhir insert ke database
  let lastInsertTime = 0;
  const THROTTLE_MS = 3000; // 3 detik

  // Flag untuk mencegah penyimpanan ganda
  let saveInProgress = false;

  // Variabel untuk menyimpan data sementara
  // eslint-disable-next-line prefer-const
  let pendingData: {
    temperature: number | null;
    humidity: number | null;
    lastTemperatureTime: number;
    lastHumidityTime: number;
  } = {
    temperature: null,
    humidity: null,
    lastTemperatureTime: 0,
    lastHumidityTime: 0,
  };

  // Waktu maksimum tunggu antara data suhu dan kelembaban (ms)
  const MAX_WAIT_TIME = 5000;

  // Fungsi untuk menyimpan data ke database
  const saveToDatabase = async () => {
    // Cek jika penyimpanan sedang berlangsung, keluar saja
    if (saveInProgress) {
      // console.log("Penyimpanan masih berlangsung, menghindari duplikasi");
      return;
    }

    const now = Date.now();

    // Throttling, cek waktu terakhir penyimpanan
    if (now - lastInsertTime < THROTTLE_MS) {
      // console.log(`Skip insert, baru ${now - lastInsertTime}ms sejak terakhir`);
      return;
    }

    // Pastikan data lengkap
    if (pendingData.temperature === null || pendingData.humidity === null) {
      // console.log("Data tidak lengkap, tidak dapat menyimpan ke database");
      return;
    }

    try {
      // Set flag sedang menyimpan
      saveInProgress = true;

      console.log(
        `Menyimpan data: Suhu ${pendingData.temperature}°C, Kelembaban ${pendingData.humidity}%`
      );

      await db.insert(sensorData).values({
        temperature: pendingData.temperature,
        humidity: pendingData.humidity,
        timestamp: new Date(now),
      });

      // Update waktu insert terakhir
      lastInsertTime = now;

      // Reset data setelah berhasil disimpan
      pendingData.temperature = null;
      pendingData.humidity = null;

      // console.log("Data berhasil disimpan ke database");
    } catch (error) {
      console.error("Error menyimpan data:", error);
    } finally {
      // Reset flag penyimpanan
      saveInProgress = false;
    }
  };

  client.on("message", async (topic, message) => {
    const now = Date.now();
    const value = parseFloat(message.toString());

    console.log(`Pesan diterima dari topic ${topic}: ${value}`);

    // Update data yang diterima
    if (topic === "suhu") {
      pendingData.temperature = value;
      pendingData.lastTemperatureTime = now;
    } else if (topic === "kelembaban") {
      pendingData.humidity = value;
      pendingData.lastHumidityTime = now;
    }

    // Cek apakah kedua data sudah diterima
    if (pendingData.temperature !== null && pendingData.humidity !== null) {
      // Gunakan setTimeout untuk menghindari race condition
      // ketika kedua pesan datang hampir bersamaan
      setTimeout(() => {
        saveToDatabase();
      }, 50);
    } else {
      // Jika salah satu nilai masih null, cek apakah waktu tunggu sudah terlalu lama
      const temperatureAge = now - pendingData.lastTemperatureTime;
      const humidityAge = now - pendingData.lastHumidityTime;

      // Jika sudah terlalu lama menunggu, gunakan nilai default untuk yang kosong
      if (
        (pendingData.temperature !== null && humidityAge > MAX_WAIT_TIME) ||
        (pendingData.humidity !== null && temperatureAge > MAX_WAIT_TIME)
      ) {
        console.log(
          "Waktu tunggu terlalu lama, menggunakan nilai terakhir atau default"
        );

        // Gunakan nilai default jika null
        if (pendingData.temperature === null) {
          pendingData.temperature = 25.0;
        }
        if (pendingData.humidity === null) {
          pendingData.humidity = 50.0;
        }

        // Gunakan setTimeout untuk menghindari race condition
        setTimeout(() => {
          saveToDatabase();
        }, 50);
      }
    }
  });

  // Menangani error
  client.on("error", (err) => {
    console.error("Error MQTT:", err);
  });

  // Untuk menutup koneksi jika program dihentikan
  process.on("SIGINT", () => {
    console.log("Menutup koneksi MQTT");
    client.end();
    process.exit();
  });
})();
