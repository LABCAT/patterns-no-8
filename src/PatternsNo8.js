import { Midi } from '@tonejs/midi';

const audio = new URL("@audio/patterns-no-8.ogg", import.meta.url).href;
const midi = new URL("@audio/patterns-no-8.mid", import.meta.url).href;
const vertShader = new URL("@shaders/basic.vert", import.meta.url).href;
const fragShader1 = new URL("@shaders/pattern1.frag", import.meta.url).href;
const fragShader2 = new URL("@shaders/pattern2.frag", import.meta.url).href;
const fragShader3 = new URL("@shaders/pattern3.frag", import.meta.url).href;
const fragShader4 = new URL("@shaders/pattern4.frag", import.meta.url).href;
const fragShader5 = new URL("@shaders/pattern5.frag", import.meta.url).href;
const fragShader6 = new URL("@shaders/pattern6.frag", import.meta.url).href;
const fragShader7 = new URL("@shaders/pattern7.frag", import.meta.url).href;
const fragShader8 = new URL("@shaders/pattern8.frag", import.meta.url).href;

const PatternsNo8 = (p) => {
    p.song = null;
    p.audioLoaded = false;
    p.songHasFinished = false;

    p.shaders = [];
    p.currentShaderIndex = null;
    p.staticBuffer = null;

    p.preload = async() => {
        p.shaders.push(p.loadShader(vertShader, fragShader1));
        p.shaders.push(p.loadShader(vertShader, fragShader2));
        p.shaders.push(p.loadShader(vertShader, fragShader3));
        p.shaders.push(p.loadShader(vertShader, fragShader4));
        p.shaders.push(p.loadShader(vertShader, fragShader5));
        p.shaders.push(p.loadShader(vertShader, fragShader6));
        p.shaders.push(p.loadShader(vertShader, fragShader7));
        p.shaders.push(p.loadShader(vertShader, fragShader8));

        p.song = await p.loadSound(audio, async () => {
            await p.loadMidi();
            p.audioLoaded = true;
            p.song.onended(() => p.songHasFinished = true);
        });
    };

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

        p.shaders.slice(0, -1).forEach((s) => {
            p.shader(s);
            s.setUniform('uResolution', [p.width, p.height]);
            s.setUniform('uTime', 0);
            p.rect(0, 0, p.width, p.height);
        });
    };

    p.time = 0;

    p.draw = () => {
        p.background(0, 0, 0);
        if ((p.audioLoaded && p.song.isPlaying()) || p.songHasFinished) {
            if(p.song.isPlaying()) {
                p.time += p.deltaTime / 1000; 
            }

            if (Number.isInteger(p.currentShaderIndex)) {
                const s = p.shaders[p.currentShaderIndex];
                p.shader(s);
                s.setUniform('uResolution', [p.width, p.height]);
                s.setUniform('uTime', p.time / 1.5);
                p.rect(0, 0, p.width, p.height);
            } else if (p.staticBuffer) {
                p.resetShader();
                p.image(p.staticBuffer, -p.width / 2, -p.height / 2);
            }
        }
    };

    p.loadMidi = () => {
        Midi.fromUrl(midi).then((result) => {
            console.log('MIDI loaded:', result);
            const track2 = result.tracks[17].notes;
            p.scheduleCueSet(track2, 'executeTrack1');
            document.getElementById("loader").classList.add("loading--complete");
            document.getElementById('play-icon').classList.add('fade-in');
            p.audioLoaded = true;
        });
    };

    p.scheduleCueSet = (noteSet, callbackName, polyMode = false) => {
        let lastTicks = -1,
            currentCue = 1;
        for (let i = 0; i < noteSet.length; i++) {
            const note = noteSet[i],
                { ticks, time } = note;
            if (ticks !== lastTicks || polyMode) {
                note.currentCue = currentCue;
                p.song.addCue(time, p[callbackName], note);
                lastTicks = ticks;
                currentCue++;
            }
        }
    };

    p.executeTrack1 = (note) => {
        const { currentCue, midi } = note;

        if (midi === 84 || midi === 89) {
            p.currentShaderIndex = null;
            const g = p.staticBuffer ? p.staticBuffer : p.createGraphics(p.width, p.height, p.WEBGL);
            const shader = p.shaders[7];
            g.shader(shader);
            shader.setUniform('uResolution', [p.width, p.height]);
            shader.setUniform('uTime', p.random(12, 48));
            g.rect(0, 0, p.width, p.height);
            p.staticBuffer = g;
        } else {
            p.currentShaderIndex = null;

            if (currentCue % 8 === 1) {
                p.patternSet = [];
                for (let i = 0; i < p.shaders.length; i++) {
                    if (i !== 7) {
                        p.patternSet.push(i);
                    }
                }
                p.patternSet = p.shuffle(p.patternSet);
                p.patternSetIndex = 0;
            } else {
                p.patternSetIndex++;
            }

            p.currentShaderIndex = p.patternSet[p.patternSetIndex];
        }
    };

    p.mousePressed = () => {
        if (p.audioLoaded) {
            if (p.song.isPlaying()) {
                p.song.pause();
            } else {
                if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                    p.currentShaderIndex = 0;
                }
                document.getElementById("play-icon").classList.remove("fade-in");
                p.song.play();
            }
        }
    };
};

export default PatternsNo8;
