import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react";
import { loadStaticPaths } from "next/dist/server/dev/static-paths-worker";
import { cursorTo } from "readline";
import { number } from "yup";
import { PaginationItem } from "./PaginationItem";

interface PaginationProps {
  totalCountOfRegister: number;
  registerPerPage?: number;
  currentPage?: number;
  onPageChange(page: number): void;
}

const siblingCount = 1;

function generatePageArray(from: number, to: number) {
  return [...new Array(to - from)]
    .map((_, index) => {
      return from + index + 1;
    })
    .filter((page) => page > 0);
}

export function Pagination({
  totalCountOfRegister,
  currentPage = 1,
  onPageChange,
  registerPerPage = 10,
}: PaginationProps) {
  const lastPage = Math.ceil(totalCountOfRegister / registerPerPage);

  const previousPage =
    currentPage > 1
      ? generatePageArray(currentPage - 1 - siblingCount, currentPage - 1)
      : [];

  const nextPages =
    currentPage < lastPage
      ? generatePageArray(
          currentPage,
          Math.min(currentPage + siblingCount, lastPage)
        )
      : [];

  return (
    <Stack
      direction={["column", "row"]}
      mt="8"
      justifyContent="space-between"
      alignItems="center"
      spacing="6"
    >
      <Box>
        <strong>{(currentPage - 1) * 10 + 1}</strong> -{" "}
        <strong>{currentPage * 10}</strong> de{" "}
        <strong>{totalCountOfRegister}</strong>
      </Box>
      <HStack spacing="2">
        {currentPage > 1 + siblingCount && (
          <>
            <PaginationItem number={1} onPageChange={onPageChange} />
            {currentPage > 2 + siblingCount && (
              <Text color="gray.300" w="8" textAlign="center">
                ...
              </Text>
            )}
          </>
        )}
        {previousPage.length > 0 &&
          previousPage.map((page) => {
            return (
              <PaginationItem
                number={page}
                key={page}
                onPageChange={onPageChange}
              />
            );
          })}

        <PaginationItem
          number={currentPage}
          isCurrent
          onPageChange={onPageChange}
        />

        {nextPages.length > 0 &&
          nextPages.map((page) => {
            return (
              <PaginationItem
                number={page}
                key={page}
                onPageChange={onPageChange}
              />
            );
          })}

        {currentPage + siblingCount < lastPage && (
          <>
            {currentPage + 1 + siblingCount < lastPage && (
              <Text color="gray.300" w="8" textAlign="center">
                ...
              </Text>
            )}
            <PaginationItem number={lastPage} onPageChange={onPageChange} />
          </>
        )}
      </HStack>
    </Stack>
  );
}
