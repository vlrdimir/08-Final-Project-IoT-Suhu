import { getSensorData } from "@/services/api/sensor-data";
import { useQuery } from "@tanstack/react-query";

export function useSensorData() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["sensor-data", 1, 10],
    queryFn: async () => {
      const res = await getSensorData(1, 10);
      return res;
    },
    staleTime: 1000 * 60,
    refetchInterval: 10000, // 1 menit
  });

  return {
    sensorData: data?.result ?? [],
    total: data?.total ?? 0,
    currentPage: data?.currentPage ?? 1,
    totalPage: data?.totalPage ?? 1,
    hasNextPage: data?.hasNextPage ?? false,
    isLoading,
    isError,
    error,
  };
}
