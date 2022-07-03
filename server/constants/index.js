const VIDEO_FOLDER_PATH = "./server/assets/";
const VIDEO_FOLDER_PATH_TEST = "./server/assets-test/";
const TEST = process.env.TEST

module.exports = {
  VIDEO_FOLDER_PATH: TEST ? VIDEO_FOLDER_PATH_TEST : VIDEO_FOLDER_PATH,
};
