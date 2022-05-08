/**
 *
 * @param {*} videos array of videos to filter
 * @param {*} requesterId the id of the person making the request
 * @returns filtered list with only public videos unless the requester is the uploader
 */
function filterUserVideos(videos, requesterId) {
  let filterVideos = [];
  for (let i = 0; i < videos.length; i++) {
    if (videos[i].visibility === "public") {
      filterVideos.push(videos[i]);
    } else if (videos[i].uploaderId === requesterId) {
      filterVideos.push(videos[i]);
    }
  }
  return filterVideos;
}

module.exports = {
  filterUserVideos,
};
