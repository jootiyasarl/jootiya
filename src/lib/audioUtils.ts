import * as lamejs from "lamejs";

/**
 * Compresses raw PCM audio data into a high-quality, lightweight MP3 blob.
 * A 30s recording targets ~150-200KB.
 */
export async function encodeToMp3(audioBuffer: AudioBuffer): Promise<Blob> {
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const kbps = 128; // Standard balance between size and quality
    const encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);

    const mp3Data: Int8Array[] = [];

    // Get raw PCM data for 1 or 2 channels
    const left = audioBuffer.getChannelData(0);
    const right = channels > 1 ? audioBuffer.getChannelData(1) : new Float32Array(left.length);

    // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
    const floatToInt16 = (float32Array: Float32Array) => {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    };

    const leftInt16 = floatToInt16(left);
    const rightInt16 = floatToInt16(right);

    // Encode in chunks
    const chunkSize = 1152;
    for (let i = 0; i < leftInt16.length; i += chunkSize) {
        const leftChunk = leftInt16.subarray(i, i + chunkSize);
        const rightChunk = rightInt16.subarray(i, i + chunkSize);
        const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    // Flush remaining data
    const flushBuf = encoder.flush();
    if (flushBuf.length > 0) {
        mp3Data.push(flushBuf);
    }

    // Cast to any to bypass strict ArrayBuffer vs SharedArrayBuffer lint in modern TS
    return new Blob(mp3Data as any, { type: "audio/mpeg" });
}

/**
 * Helper to convert a MediaRecorder Blob to AudioBuffer for re-encoding.
 */
export async function blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
}
