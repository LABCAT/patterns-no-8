import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import Hexagon from './classes/Hexagon.js';

import audio from "../audio/patterns-no-6.ogg";
import midi from "../audio/patterns-no-6.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[2].notes; // NN-XT 1 - DreamPiano
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(255);
            p.generateHexagonsArray(p.height / 32);
        }

        p.draw = () => {
            p.hexagons.forEach((hexagon) => {
                p.push();
                p.translate(hexagon.xPos, hexagon.yPos);
                hexagon.draw(0, 0);
                p.pop();
            });
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.executeCueSet1 = (note) => {
            p.background(p.random(255), p.random(255), p.random(255));
            p.fill(p.random(255), p.random(255), p.random(255));
            p.noStroke();
            p.ellipse(p.width / 2, p.height / 2, p.width / 4, p.width / 4);
        }

        p.hexagons = [];

        p.generateHexagonsArray = (radius) => {
            // const hexagonMask  = Hexagon.createHexagonMask(radius);
            const hexagonWidth = Math.sqrt(3)/2 * radius;
            let bgColor = '#fff';

            // if (random() > .3) {
            //     bgColor   = colorPalette[~~random(1, colorPalette.length)];
            // }

            for (let y = hexagonWidth; y <= p.height + hexagonWidth * 2; y += hexagonWidth * 2){
                for (let x = radius, col = 0; x <= p.width + radius*2; x += radius * 1.5, ++col){
                    // const sideNumsOrder = setSidesConnectionsOrder(patternSchema);
                    const startAngle    = p.radians(60 * ~~(p.random(6)));
                    const targetAngle   = p.random() < .08 ? startAngle + p.radians(60 * ~~(p.random(6))) : startAngle;

                    p.hexagons.push(
                        new Hexagon(
                            p,
                            x,
                            y + (col % 2 === 0 ? hexagonWidth : 0),
                            radius,
                            startAngle,
                            targetAngle,
                            bgColor
                        )
                    );
                }
            }
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
