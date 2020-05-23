import React, {useState, useEffect, useRef} from "../../web_modules/react.js";
import {useSelector} from "../../web_modules/react-redux.js";
import DrawingTools from '../DrawingTools.mjs';

export const GuessingCanvas = () => {
    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    const lines = latestTrial.lines || [];
    const linesRef = useRef(null);
    linesRef.current = lines;
    const [drawnLineCount, setDrawnLineCount] = useState(0);
    const guessingCanvas = useRef(null);
    const [drawingTools, setDrawingTools] = useState(null);
    const drawingToolsRef = useRef(null);
    drawingToolsRef.current = drawingTools;

    useEffect(() => {
        if (guessingCanvas.current) {
            const newDrawingTools = new DrawingTools(guessingCanvas.current);
            setDrawingTools(newDrawingTools);
            newDrawingTools.updateCanvasSiteToItsClientSize();
            newDrawingTools.clearCanvas();

            window.addEventListener('resize', _clearAndRedraw);
            return () => { window.removeEventListener('resize', _clearAndRedraw); };
        }
    }, [guessingCanvas.current]);

    useEffect(() => {
        if (drawingTools) {
            if (drawnLineCount < lines.length) {
                _drawLines(lines.slice(drawnLineCount));
                setDrawnLineCount(lines.length);
            } else if (drawnLineCount > lines.length) {
                drawingTools.clearCanvas();
                setDrawnLineCount(0);
            }
        }
    }, [drawingTools, lines.length]);

    return React.createElement('canvas', {id: 'guessingCanvas', ref: guessingCanvas});

    function _clearAndRedraw() {
        drawingToolsRef.current.updateCanvasSiteToItsClientSize();
        drawingToolsRef.current.clearCanvas();
        _drawLines(linesRef.current);
    }

    function _drawLines(lines) {
        lines.map(line => drawingToolsRef.current.drawLine(line));
    }
};