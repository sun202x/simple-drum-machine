
export default class DrumCell {

    constructor(outputNode, audioBuffer) {
        // 샘플을 실행하기 위해서는 context와 audioBuffer는 반드시 필요하다.
        this._context = outputNode.context;
        this._buffer = audioBuffer;
        this._outputNode = outputNode;
    }

    // Oscilator연결과 다른점은 audioBuffer를 받아서 설정하는 것 밖에 없다.
    playSample() {
        const bufferSource = new AudioBufferSourceNode(this._context, { buffer: this._buffer });
        const amp = new GainNode(this._context);
        bufferSource.connect(amp).connect(this._outputNode);
        bufferSource.start();
    }

}