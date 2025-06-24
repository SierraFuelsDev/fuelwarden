import useSWR from "swr";
import { Account } from "appwrite";
import { client } from "../lib/appwrite";

const account = new Account(client);

async function fetchUser() {
  try {
    return await account.get();
  } catch (err) {
    // If not logged in, return null
    return null;
  }
}

export function useUser() {
  const { data: user, error, isLoading, mutate } = useSWR("appwrite-user", fetchUser, {
    revalidateOnFocus: true,
  });

  return {
    user,
    loading: isLoading,
    error,
    mutate, // for manual revalidation
  };
} 