import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StateCreator } from "zustand";

interface ToggleLightState {
  toggleLight: boolean;
  setToggleLight: (value: boolean) => void;
}

interface ToggleKipasState {
  toggleKipas: boolean;
  setToggleKipas: (value: boolean) => void;
}

interface ToggleLampuDalamRumahState {
  toggleLampuDalamRumah: boolean;
  // State visual terpisah untuk styling P3
  visualP3State: boolean;
  setToggleLampuDalamRumah: (value: boolean) => void;
  // Setter untuk visual state
  setVisualP3State: (value: boolean) => void;
  toggleLampuDalamRumahIndependent: (
    value: boolean,
    publishToMQTT?: (payload: {
      topic: string;
      qos: any;
      payload: string;
    }) => void
  ) => void;
}

interface ToggleSemuaRuanganState {
  toggleSemuaRuangan: boolean;
  setToggleSemuaRuangan: (value: boolean) => void;
  toggleSemuaRuanganWithP3: (
    value: boolean,
    publishToMQTT?: (payload: {
      topic: string;
      qos: any;
      payload: string;
    }) => void
  ) => void;
}

type TogglePersist = (
  config: StateCreator<ToggleLightState>,
  options: { name: string }
) => StateCreator<ToggleLightState>;

type ToggleKipasPersist = (
  config: StateCreator<ToggleKipasState>,
  options: { name: string }
) => StateCreator<ToggleKipasState>;

type ToggleLampuDalamRumahPersist = (
  config: StateCreator<ToggleLampuDalamRumahState>,
  options: { name: string }
) => StateCreator<ToggleLampuDalamRumahState>;

type ToggleSemuaRuanganPersist = (
  config: StateCreator<ToggleSemuaRuanganState>,
  options: { name: string }
) => StateCreator<ToggleSemuaRuanganState>;

export const useToggleSemuaRuanganStore = create<ToggleSemuaRuanganState>()(
  (persist as ToggleSemuaRuanganPersist)(
    (set) => ({
      // default value is false
      toggleSemuaRuangan: false,
      // setter action
      setToggleSemuaRuangan: (value: boolean) =>
        set({ toggleSemuaRuangan: value }),
      // new function to toggle all ports including P3
      toggleSemuaRuanganWithP3: (value: boolean, publishToMQTT) => {
        set({ toggleSemuaRuangan: value });

        // Mengakses store untuk lampu dalam rumah
        const lampuStore = useToggleLampuDalamRumahStore.getState();

        // Ketika toggleSemuaRuangan diaktifkan, nyalakan juga P3
        if (value) {
          // State aktual dinyalakan
          lampuStore.setToggleLampuDalamRumah(true);

          // Untuk saat ini, kita biarkan visual state tetap sesuai dengan yang diinginkan pengguna
          // dan tidak mengubahnya di sini. Perubahan visual state akan dilakukan di komponen.
        } else {
          // Ketika dimatikan, matikan juga P3
          lampuStore.setToggleLampuDalamRumah(false);

          // Pastikan visual state juga dimatikan (tapi biasanya ini akan ditangani di komponen)
          // lampuStore.setVisualP3State(false);
        }

        if (publishToMQTT) {
          publishToMQTT({
            topic: "toggle-semua-ruangan",
            qos: 0,
            payload: value ? "on" : "off",
          });

          // Kirim juga MQTT untuk P3 berdasarkan state P4
          // publishToMQTT({
          //   topic: "toggle-lampu-dalam-rumah",
          //   qos: 0,
          //   payload: value ? "on" : "off",
          // });
        }
      },
    }),
    {
      // storage key
      name: "toggle-semua-ruangan",
    }
  )
);

export const useToggleLampuDalamRumahStore =
  create<ToggleLampuDalamRumahState>()(
    (persist as ToggleLampuDalamRumahPersist)(
      (set) => ({
        // default value is false
        toggleLampuDalamRumah: false,
        // Default value untuk visual state
        visualP3State: false,
        // setter action
        setToggleLampuDalamRumah: (value: boolean) =>
          set({ toggleLampuDalamRumah: value }),
        // Setter untuk visual state
        setVisualP3State: (value: boolean) => set({ visualP3State: value }),
        // new independent toggle function that can work even when P4 is on
        toggleLampuDalamRumahIndependent: (value: boolean, publishToMQTT) => {
          set({
            toggleLampuDalamRumah: value,
            // Update juga visual state
            visualP3State: value,
          });
          if (publishToMQTT) {
            publishToMQTT({
              topic: "toggle-lampu-dalam-rumah",
              qos: 0,
              payload: value ? "on" : "off",
            });
          }
        },
      }),
      {
        // storage key
        name: "toggle-lampu-dalam-rumah",
      }
    )
  );

export const useToggleLightStore = create<ToggleLightState>()(
  (persist as TogglePersist)(
    (set) => ({
      // default value is false
      toggleLight: false,
      // setter action
      setToggleLight: (value: boolean) => set({ toggleLight: value }),
    }),
    {
      // storage key
      name: "toggle-light",
    }
  )
);

export const useToggleKipasStore = create<ToggleKipasState>()(
  (persist as ToggleKipasPersist)(
    (set) => ({
      // default value is false
      toggleKipas: false,
      // setter action
      setToggleKipas: (value: boolean) => set({ toggleKipas: value }),
    }),
    {
      // storage key
      name: "toggle-kipas",
    }
  )
);
