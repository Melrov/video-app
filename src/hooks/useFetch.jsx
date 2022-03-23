import axios from "axios";
import React, { useCallback } from "react";

function useServerFetch() {
  const makeAPICall = useCallback(async (url, config) => {
    try {
      return (await axios(url, config)).data;
    } catch (error) {
      return { success: false, data: null, error: "Something went wrong." };
    }
  }, []);

  return {};
}

export default useServerFetch;
