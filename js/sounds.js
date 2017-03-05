/**
 * Created with JetBrains WebStorm.
 * User: qrrs
 * Date: 13-4-17
 * Time: 下午7:26
 * To change this template use File | Settings | File Templates.
 */

var sounds = {
    list: {
        "bullet": ["bullet1", "bullet2"],
        "heatseeker": ["heatseeker1", "heatseeker2"],
        "fireball": ["laser1", "laser2"],
        "cannon-ball": ["cannon1", "cannon2"],
        "message-received": ["message"],
        "acknowledge-attacking": ["engaging"],
        "acknowledge-moving": ["yup", "roger1", "roger2"]
    },
    loaded: {},
    init: function () {
        for (var soundName in this.list) {
            var sound = {};
            sound.audioObjects = [];
            for (var i = 0; i < this.list[soundName].length; i++) {
                sound.audioObjects.push(loader.loadSound('audio/' + this.list[soundName][i]));
            }
            this.loaded[soundName] = sound;
        }
    },
    play: function (soundName) {
        var sound = sounds.loaded[soundName];
        if (sound && sound.audioObjects && sound.audioObjects.length > 0) {
            if (!sound.counter || sound.counter >= sound.audioObjects.length) {
                sound.counter = 0;
            }
            var audioObject = sound.audioObjects[sound.counter];
            sound.counter++;
            audioObject.play();
        }
    }
}
