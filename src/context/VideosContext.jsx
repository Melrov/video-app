import React, { createContext, useCallback, useState } from "react";
import useFetch from "../hooks/useFetch";

export const VideosContext = createContext(null);

function VideosProvider({ children }) {
  const { homeVideos } = useFetch();
  const [videos, setVideos] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const res = await homeVideos();
    if (res.success) {
      setVideos(res.data);
      setError(null);
    } else {
      setVideos(null);
      setError(res.error);
    }
  }, [homeVideos]);

  return <VideosContext.Provider value={{videos, error, refresh}}>{children}</VideosContext.Provider>;
}

export default VideosProvider;
