import { Box, Flex, SimpleGrid, Text, theme } from "@chakra-ui/react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Can } from "../components/Can";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { setupAuthAPIClient } from "../services/api/authApi";
import { authApi } from "../services/api/authAPIClient";
import { useCan } from "../services/hooks/useCan";
import { withSSRAuth } from "../utils/withSSRAuth";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const options: ApexOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    foreColor: theme.colors.gray[500],
  },
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  xaxis: {
    type: "datetime",
    axisBorder: {
      color: theme.colors.gray[600],
    },
    axisTicks: {
      color: theme.colors.gray[600],
    },
    categories: [
      "2022-04-12T00:00:00.000Z",
      "2022-04-13T00:00:00.000Z",
      "2022-04-14T00:00:00.000Z",
      "2022-04-15T00:00:00.000Z",
      "2022-04-16T00:00:00.000Z",
      "2022-04-17T00:00:00.000Z",
      "2022-04-18T00:00:00.000Z",
    ],
  },
  fill: {
    opacity: 0.3,
    type: "gradient",
    gradient: {
      shade: "dark",
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
};

const series = [{ name: "series1", data: [31, 120, 10, 28, 51, 18, 109] }];

export default function Dashboard() {
  const userCanSeeMetrics = useCan({
    permissions: ["metrics.list"],
  });

  useEffect(() => {
    authApi
      .get("me")
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Flex direction="column" h="100vh">
      <Header />
      <Flex w="100%" my="6" maxW="1480" mx="auto" px="6">
        <Sidebar />

        <SimpleGrid
          flex="1"
          gap="4"
          minChildWidth="320px"
          alignContent="flex-start"
        >
          <Can permissions={["metrics.list"]}>
            <Box p={["6", "8"]} bg="gray.800" borderRadius="8" pb="4">
              <Text fontSize="lg" mb="4">
                Inscritos da semana
              </Text>
              <Chart
                type="area"
                height={160}
                options={options}
                series={series}
              />
            </Box>
            <Box p={["6", "8"]} bg="gray.800" borderRadius="8" pb="4">
              <Text fontSize="lg" mb="4">
                Taxa de abertura
              </Text>
              <Chart
                type="area"
                height={160}
                options={options}
                series={series}
              />
            </Box>
          </Can>
        </SimpleGrid>
      </Flex>
    </Flex>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAuthAPIClient(ctx);

  return {
    props: {},
  };
});
