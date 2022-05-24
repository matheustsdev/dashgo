import { Flex, Box, Text, Avatar } from "@chakra-ui/react";
import { useAuth } from "../../services/hooks/useAuth";

interface ProfileProps {
  showProfileData?: boolean;
}

export function Profile({ showProfileData = true }: ProfileProps) {
  const { user, signOut } = useAuth();

  return (
    <Flex align="center">
      {showProfileData && (
        <Box mr="4" textAlign="right">
          <Text>Matheus Teixeira</Text>
          <Text color="gray.300" fontSize="small">
            {user?.email}
          </Text>
        </Box>
      )}
      <Avatar
        size="md"
        name="Matheus Teixeira"
        src="https://github.com/matheustsdev.png"
        onClick={signOut}
        cursor="pointer"
      />
    </Flex>
  );
}
