import axios from "axios";
import { useCallback } from "react";
import FormData from "form-data";

function useFetch() {
  const makeAPICall = useCallback(async (url, config) => {
    try {
      return (await axios(url, config)).data;
    } catch (error) {
      return { success: false, data: null, error: "Something went wrong." };
    }
  }, []);

  // ----- user routes -----

  /**
   * account login
   * @param {*} username
   * @param {*} password
   * @returns success, data{ username }, error
   */
  const login = useCallback(
    async (username, password) => {
      return await makeAPICall("/api/user/login", {
        method: "post",
        data: {
          username,
          password,
        },
      });
    },
    [makeAPICall]
  );

  /**
   * account signup
   * @param {string} username
   * @param {string} password
   * @returns success, data( null ), error
   */
  const signup = useCallback(
    async (username, password) => {
      return await makeAPICall("/api/user/signup", {
        method: "put",
        data: {
          username,
          password,
        },
      });
    },
    [makeAPICall]
  );

  /**
   * deletes users jwt
   * @returns success, data( null ), error
   */
  const logout = useCallback(async () => {
    return await makeAPICall("/api/user/logout", {
      method: "get",
    });
  }, [makeAPICall]);

  /**
   * verifies users jwt
   * @returns success, data, error
   */
  const verify = useCallback(async () => {
    return await makeAPICall("/api/user/verify", {
      method: "post",
    });
  }, [makeAPICall]);

  /**
   * gets user info for user page
   * @returns success, data{ ...userInfo, [ ...videoInfo ] }, error
   */
  const userInfo = useCallback(
    async (userId) => {
      return await makeAPICall(`/api/user/${userId}`, {
        method: "get",
      });
    },
    [makeAPICall]
  );

  // ----- video routes -----

  /**
   * gets list of videos for home page
   */
  const homeVideos = useCallback(async () => {
    return await makeAPICall("/api/video/home", {
      method: "get",
    });
  }, [makeAPICall]);

  /**
   * get video info
   * @param {string} contentId
   * @returns success, data{ ...videoInfo, (series ? [ ...episodeInfo ]) }, error
   */
  const videoInfo = useCallback(
    async (contentId) => {
      return await makeAPICall(`/api/video/${contentId}`, {
        method: "get",
      });
    },
    [makeAPICall]
  );

  /**
   * video creation
   * @param {string} title
   * @param {string} description
   * @param {string} type
   * @param {string} visibility
   * @param {string} videoFile
   * @returns success, data{ uuid }, error
   */
  const createVideo = useCallback(
    async (title, description, type, visibility, videoFile, thumbnailFile) => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);
      formData.append("visibility", visibility);
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnailFile)
      return await makeAPICall("/api/video/create", {
        method: "put",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });
    },
    [makeAPICall]
  );

  /**
   * series video creation
   * @param {string} contentId
   * @param {string} title
   * @param {string} description
   * @param {string} videoFile
   * @returns success, data{ contentId }, error
   */
  const createSeriesVideo = useCallback(
    async (contentId, title, description, videoFile) => {
      return await makeAPICall(`/api/video/create/${contentId}`, {
        method: "put",
        headers: {
          "Content-Type": "multipart/form-data; boundary=<calculated when request is sent>",
        },
        formData: {
          title,
          description,
          video: videoFile,
        },
      });
    },
    [makeAPICall]
  );

  /**
   * video deletion
   * @param {string} contentId
   * @returns success, data( null ), error
   */
  const deleteVideo = useCallback(
    async (contentId) => {
      return await makeAPICall("/api/video/delete", {
        method: "delete",
        data: {
          contentId,
        },
      });
    },
    [makeAPICall]
  );

  /**
   * editing of video info
   * @param {string} contentId
   * @param {string} title
   * @param {string} description
   * @param {string} type
   * @param {string} visibility
   * @returns success, data( null ), error
   */
  const editVideoInfo = useCallback(
    async (contentId, title, description, type, visibility) => {
      return await makeAPICall("/api/video/editVideoInfo", {
        method: "patch",
        data: {
          contentId,
          title,
          description,
          type,
          visibility,
        },
      });
    },
    [makeAPICall]
  );

  /**
   * editing of episode info
   * @param {string} contentId
   * @param {int} episode
   * @param {string} title
   * @param {string} description
   * @param {string} type
   * @param {string} visibility
   * @returns success, data( null ), error
   */
  const editEpisodeInfo = useCallback(
    async (contentId, episode, title, description, type, visibility) => {
      return await makeAPICall("/api/video/editEpisodeInfo", {
        method: "patch",
        data: {
          contentId,
          episode,
          title,
          description,
          type,
          visibility,
        },
      });
    },
    [makeAPICall]
  );

  return {
    login,
    signup,
    logout,
    verify,
    userInfo,
    videoInfo,
    createVideo,
    createSeriesVideo,
    deleteVideo,
    editVideoInfo,
    editEpisodeInfo,
    homeVideos,
  };
}

export default useFetch;
