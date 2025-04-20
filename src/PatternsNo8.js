import { Midi } from '@tonejs/midi';
// Audio imports
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
    // Core audio properties
    p.song = null;
    p.audioLoaded = false;
    p.songHasFinished = false;
   
    // Shader variables
    p.shaders = [];
    p.currentShaderIndex = null;
    p.graphicsBuffers = [];
    p.currentBuffer = null;
   
    p.preload = () => {
        // Load multiple shaders
        p.shaders.push(p.loadShader(vertShader, fragShader1));
        p.shaders.push(p.loadShader(vertShader, fragShader2));
        p.shaders.push(p.loadShader(vertShader, fragShader3));
        p.shaders.push(p.loadShader(vertShader, fragShader4));
        p.shaders.push(p.loadShader(vertShader, fragShader5));
        p.shaders.push(p.loadShader(vertShader, fragShader6));
        p.shaders.push(p.loadShader(vertShader, fragShader7));
        p.shaders.push(p.loadShader(vertShader, fragShader8));
       
        // Original audio loading code
        p.song = p.loadSound(audio, p.loadMidi);
        p.song.onended(() => p.songHasFinished = true);
    };
    
    p.setup = () => {
        // Create WEBGL canvas for shader support
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

        for (let i = 0; i < p.shaders.length; i++) {
            const g = p.createGraphics(p.width, p.height, p.WEBGL);
            const shader = p.shaders[i].copyToContext(g);
            g.shader(shader);
            shader.setUniform('uResolution', [p.width, p.height]);
            shader.setUniform('uTime', p.random(12, 48)); 
            g.rect(0, 0, p.width, p.height);
            p.graphicsBuffers.push(g);
        }
    };
    
    p.draw = () => {
        p.background(0, 0, 0);

        if ((p.audioLoaded && p.song.isPlaying()) || p.songHasFinished) {
            if (Number.isInteger(p.currentShaderIndex)) {
                const s = p.shaders[p.currentShaderIndex];
                p.shader(s);
                s.setUniform('uResolution', [p.width, p.height]);
                s.setUniform('uTime', p.millis() / 2000.0);
                p.rect(0, 0, p.width, p.height);
            } else if (p.currentBuffer) {
                p.resetShader();
                p.image(p.currentBuffer, -p.width / 2, -p.height / 2);
            }
        }
    }
    
    // The rest of the template remains unchanged
    p.loadMidi = () => {
        Midi.fromUrl(midi).then((result) => {
            console.log('MIDI loaded:', result);
            // const track1 = result.tracks[12].notes; // Chorus Reece Bass
            // p.scheduleCueSet(track1, 'executeTrack1');
            const track2 = result.tracks[17].notes; // Waves Layers Edition - HarpiSynth
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
            if(ticks !== lastTicks || polyMode){
                note.currentCue = currentCue;
                p.song.addCue(time, p[callbackName], note);
                lastTicks = ticks;
                currentCue++;
            }
        }
    }
    
    p.executeTrack1 = (note) => {
        console.log(note.midi);
        
        // Check if the note value is 84 or 89
        if (note.midi === 84 || note.midi === 89) {
            p.currentShaderIndex = null;
            p.currentBuffer = p.random([p.graphicsBuffers[4], p.graphicsBuffers[7]]);
        } 
        else {
            p.currentBuffer = null;
            // If this is first note of 8-note sequence, create a new pattern set
            if (note.currentCue % 8 === 1) {
                // Create array of patterns excluding index 4
                p.patternSet = [];
                for (let i = 0; i < p.shaders.length; i++) {
                    if (![4, 7].includes(i)) {
                        p.patternSet.push(i);
                    }
                }

                p.patternSet = p.shuffle(p.patternSet);
                
                // Initialize the pattern set index
                p.patternSetIndex = 0;
            } else {
                // Increment the pattern set index for each note
                p.patternSetIndex++;
            }
            
            // Set the current shader based on the pattern set index
            p.currentShaderIndex = p.patternSet[p.patternSetIndex];
        }
    }
    
    p.mousePressed = () => {
        if(p.audioLoaded){
            if (p.song.isPlaying()) {
                p.song.pause();
            } else {
                if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                    // Reset animation properties here
                    p.currentShaderIndex = 0;
                }
                document.getElementById("play-icon").classList.remove("fade-in");
                p.song.play();
            }
        }
    }
};

export default PatternsNo8;