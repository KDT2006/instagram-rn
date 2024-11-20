import React from "react";
import { useVideoPlayer, VideoView } from "expo-video";

const VideoWrapper = ({
  media,
  viewStyle,
  allowsPictureInPicture,
  allowsFullscreen,
}) => {
  const player = useVideoPlayer(media, (player) => {
    player.loop = false;
    player.play();
  });

  return (
    <VideoView
      style={viewStyle}
      player={player}
      allowsFullscreen={allowsFullscreen}
      allowsPictureInPicture={allowsPictureInPicture}
    />
  );
};

export default VideoWrapper;
