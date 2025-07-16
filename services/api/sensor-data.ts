import { fetcher } from "@/lib/utils";

interface SensorData {
  result: {
    id: number;
    timestamp: string;
    temperature: number;
    humidity: number;
  }[];
  total: number;
  currentPage: number;
  totalPage: number;
  hasNextPage: boolean;
}

// /api/sensor-data
export const getSensorData = async (page: number = 1, limit: number = 20) => {
  return fetcher<SensorData>(`/api/sensor-data?page=${page}&limit=${limit}`);
};
