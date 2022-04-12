import { Flex, Box, Text, Avatar } from "@chakra-ui/react";

export function Profile() {
  return (
    <Flex align="center">
      <Box mr="4" textAlign="right">
        <Text>Matheus Teixeira</Text>
        <Text color="gray.300" fontSize="small">
          matheusts.dev@gmail.com
        </Text>
      </Box>
      <Avatar
        size="md"
        name="Matheus Teixeira"
        src="https://github.com/matheustsdev.png"
      />
    </Flex>
  );
}
