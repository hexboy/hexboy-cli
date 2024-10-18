import { program } from "../../app";
import { downloader } from "./downloader";

program
  .command("yt-audio")
  .description("Download audio from youtube")
  .argument("<string>", "Youtube video link")
  .action((link, options) => {
    console.log({ video: link });
    downloader(link);
  });
