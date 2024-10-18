import { intro, outro, select } from "@clack/prompts";
import { $, fs, os, path, tmpdir } from "zx";

$.verbose = true;

const qualities = [
  {
    value: 0,
    label: "0: best",
  },
  {
    value: 2,
    label: "2",
  },
  {
    value: 4,
    label: "4",
  },
  {
    value: 5,
    label: "5 normal",
  },
  {
    value: 8,
    label: "8",
  },
  {
    value: 10,
    label: "10 worst",
  },
];

const formats = [
  {
    value: 0,
    label: "best",
  },
  {
    value: 1,
    label: "mp3",
  },
  {
    value: 2,
    label: "aac",
  },
  {
    value: 3,
    label: "flac",
  },
  {
    value: 4,
    label: "alac",
  },
  {
    value: 5,
    label: "m4a",
  },
  {
    value: 6,
    label: "opus",
  },
  {
    value: 7,
    label: "vorbis",
  },
  {
    value: 8,
    label: "wav",
  },
];

export const downloader = async (link: string) => {
  const outputDir = tmpdir();
  intro(`yt-audio`);

  const audioQuality = await select({
    message: "Select audio quality.",
    initialValue: 0,
    options: qualities,
  });

  if (audioQuality === 0) {
    await $`yt-dlp -f bestaudio -P ${outputDir} ${link}`;
  } else {
    const audioFormat = await select({
      message: "Select audio format.",
      initialValue: 0,
      options: formats,
    });
    const af = formats.find((f) => f.value === audioFormat)?.label;
    const aq = qualities.find((f) => f.value === audioQuality)?.value;
    await $`yt-dlp --audio-format ${af} --audio-quality ${aq} -P ${outputDir} ${link}`;
  }

  await $`yt-dlp --write-thumbnail --skip-download --convert-thumbnails png -P ${outputDir} ${link}`;

  // check ffmpeg
  try {
    await $({
      quiet: true,
    })`ffmpeg -h`;
  } catch (error) {
    console.log("Please install ffmpeg.");
  }

  // check eyeD3
  try {
    await $({
      quiet: true,
    })`eyeD3 -h`;
  } catch (error) {
    console.log("Please install eyeD3.");
  }

  const cover = (
    await $({
      quiet: true,
    })`ls ${outputDir} | grep png`
  ).stdout.trim();
  const fileName = (
    await $({
      quiet: true,
    })`ls ${outputDir} | grep -v png`
  ).stdout.trim();
  await $`ffmpeg -i ${path.join(outputDir, fileName)} -vn ${path.join(
    outputDir,
    cover.replace(".png", ".mp3")
  )}`;
  await $`eyeD3 --add-image ${
    path.join(outputDir, cover) + ":FRONT_COVER"
  } ${path.join(outputDir, cover.replace(".png", ".mp3"))}`;

  const mp3File = (
    await $({
      quiet: true,
    })`ls ${outputDir} | grep mp3`
  ).stdout.trim();
  fs.moveSync(
    path.join(outputDir, mp3File),
    path.join(os.homedir(), "Downloads", mp3File)
  );

  fs.removeSync(outputDir);

  outro(`File Download to ${path.join(os.homedir(), "Downloads", mp3File)}`);
};
