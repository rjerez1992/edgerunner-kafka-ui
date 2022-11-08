const sound = require("sound-play");

exports.playTheme = () => {
    console.log("Sound-play: Playing cyberpunk theme");
    sound.play(`${__dirname}/../../theme.mp3`);
}