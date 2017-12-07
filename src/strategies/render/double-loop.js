
/**
 * 
 * 
 * @export
 * @param {number[][]} waveform Sampled data for each pixel, max at 0, min at 1 
 * @param {number} height 
 * @param {number} width 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {CanvasRenderingContext2D} offScreenCtx 
 * @param {string} drawStyle 
 */
export function drawDoubleLoop(waveform, height, width, ctx, offScreenCtx, drawStyle) {
    const scale = height / 2;
    offScreenCtx.clearRect(0, 0, width, height);
    offScreenCtx.beginPath();

    for (let i = 0; i < waveform.length; i++) {
        const minHeight = (waveform[i][0] * scale) + scale;
        const maxHeight = (waveform[i][1] * scale) + scale;
        const height = maxHeight - minHeight;
        offScreenCtx.rect(i, minHeight, 1, height);
    }
    offScreenCtx.closePath();
    offScreenCtx.fill();
    
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(offScreenCtx.canvas, 0, 0);
    
    // ctx.moveTo(0, scale);
    // for (let i = 0; i < waveform.length; i++) {
    //     ctx.lineTo(i, (waveform[i][0] * scale) + scale);
    // }
    // ctx.lineTo(waveform.length - 1, scale);

    // ctx.moveTo(0, scale);
    // for (let i = 0; i < waveform.length; i++) {
    //     ctx.lineTo(i, (waveform[i][1] * scale) + scale);
    // }
    // ctx.lineTo(waveform.length - 1, scale);

    // ctx.closePath();
    // switch (drawStyle) { 
    //     case 'stroke':
    //         ctx.stroke();
    //         break;
    //     default:
    //         ctx.fill();
    // }
}