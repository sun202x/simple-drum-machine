import DrumCell from "./drumCell.js";
import { getAudioBufferByFileName } from "./util.js";

const buildDrumCellMap = async (ouputNode, directoryHandle) => {
    const drumCellMap = {};

    for await (const entry of directoryHandle.values()) {
        if (entry.name.startsWith('drum') && entry.name.endsWith('mp3')) {
            const audioBuffer = await getAudioBufferByFileName(audioContext, entry.name, directoryHandle);
            drumCellMap[entry.name] = new DrumCell(ouputNode, audioBuffer);
        }
    }

    return drumCellMap;
}

const bindKeyToDrumCellMap = (drumCellMap) => {
    const keys = 'qwerasdfzxcv'.split('');
    const drumCells = Object.values(drumCellMap);
    const keyToDrumCellMap = {};

    for (let i = 0; i < drumCells.length; ++i) {
        keyToDrumCellMap[keys[i]] = drumCells[i];
    }

    window.addEventListener('keydown', (event) => {
        if (event.key in keyToDrumCellMap) {
            keyToDrumCellMap[event.key].playSample();
        }
    });
}

const buildMainBus = async (audioContext, directoryHandle) => {
    const compressor = new DynamicsCompressorNode(audioContext);
    const irBuffer = await getAudioBufferByFileName(audioContext, 'ir-hall.mp3', directoryHandle);
    const convolver = new ConvolverNode(audioContext, { buffer: irBuffer });
    const reverbGain = new GainNode(audioContext, { gain: 0.25 });

    compressor.connect(audioContext.destination);
    convolver.connect(reverbGain).connect(audioContext.destination);
    compressor.connect(convolver);

    return compressor;
}

const initializerDrumMachine = async (audioContext) => {
    const directoryHandle = await window.showDirectoryPicker();
    const mainBus = await buildMainBus(audioContext, directoryHandle);
    const drumCellMap = await buildDrumCellMap(mainBus, directoryHandle);
    await bindKeyToDrumCellMap(drumCellMap);
}

// 모든 audio 기능의 모체이다. 오디오 기능을 시작하거나 멈출 수 있다.
const audioContext = new AudioContext();

const onLoad = async () => {
    const buttonEl = document.getElementById('start-audio');
    buttonEl.disabled = false;

    // 브라우저 탭이 소리를 재생할 수 있도록 버튼 클릭시 resume 함수를 호출해준다.
    buttonEl.addEventListener('click', async () => {
        await initializerDrumMachine(audioContext);
        audioContext.resume();
        buttonEl.disabled = true;
        buttonEl.textContent = '재생중...';
    }, false);
}

window.addEventListener('load', onLoad);