/**
 * 
 * @param {*} videos array of videos to filter
 * @param {*} requesterId the id of the person making the request
 * @returns filtered list with only public videos unless the requester is the uploader
 */
function filterUserVideos(videos, requesterId){
    let filterVideos = [...videos]
    for(let i = 0; i < videos.length(); i++){
        if(filterVideos[i].visibility !== "public" && filterVideos[i].uploader_id !== requesterId){
            filterVideos = [...filterVideos.splice(0, i), ...filterVideos.splice(i+1)]
            i--
        }
    }
    return filterVideos
}

module.exports = {
    filterUserVideos,
}