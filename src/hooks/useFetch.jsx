import axios from "axios";
import { useCallback } from "react";

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
      return await makeAPICall("/api/users/login", {
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
      return await makeAPICall("/api/users/signup", {
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
    return await makeAPICall("/api/users/logout", {
      method: "get",
    });
  }, [makeAPICall]);

  /**
   * verifies users jwt
   * @returns success, data, error
   */
  const verify = useCallback(async () => {
    return await makeAPICall("/api/users/verify", {
      method: "get",
    });
  }, [makeAPICall]);

  /**
   * gets user info for user page
   * @returns success, data{ ...userInfo, [ ...videoInfo ] }, error
   */
  const userInfo = useCallback(
    async (userId) => {
      return await makeAPICall(`/api/users/${userId}`, {
        method: "get",
      });
    },
    [makeAPICall]
  );

  // ----- video routes -----

  /**
   * get video info
   * @param {string} contentId
   * @returns success, data{ ...videoInfo, (series ? [ ...episodeInfo ]) }, error
   */
  const videoInfo = useCallback(
    async (contentId) => {
      return await makeAPICall(`/api/video/${contendId}`, {
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
    async (title, description, type, visibility, videoFile) => {
      return await makeAPICall("/api/video/create", {
        method: "put",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        formData: {
          title,
          description,
          type,
          visibility,
          video: videoFile,
        },
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
          "Content-Type": "multipart/form-data",
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
  };
}

export default useFetch;
