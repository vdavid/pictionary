import React, {useState, useEffect, useRef} from "../../web_modules/react.js";
import {useSelector, useDispatch} from "../../web_modules/react-redux.js";
import {trialResult} from '../../game/trial-result.mjs';
import {actionCreators as gameActionCreators} from '../../game/store.mjs';
import DrawingTools from '../DrawingTools.mjs';

/**
 * @typedef {Object} DrawnLine
 * @property {int} x1
 * @property {int} y1
 * @property {int} x2
 * @property {int} y2
 * @property {string} color
 */

export const DrawingCanvas = () => {
    const [drawnLineCount, setDrawnLineCount] = useState(0);
    /** @type {DrawnLine[]} */
    const [newlyDrawnLines, setNewlyDrawnLines] = useState([]);
    const newlyDrawnLinesRef = useRef(newlyDrawnLines);
    const setNewlyDrawnLinesWithRef = (value) => { setNewlyDrawnLines(value); newlyDrawnLinesRef.current = value; };
    /** @type {boolean} */
    const [isPenDown, setIsPenDown] = useState(false);
    /** @type {Number|undefined} */
    const [lastX, setLastX] = useState(undefined);
    /** @type {Number|undefined} */
    const [lastY, setLastY] = useState(undefined);
    const [timer, setTimer] = useState(null);
    const drawingCanvas = useRef(null);
    const [drawingTools, setDrawingTools] = useState(null);
    const dispatch = useDispatch();

    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    const lines = latestTrial.lines || [];
    const isRoundStarted = latestTrial.trialResult === trialResult.ongoing;
    const updateIntervalInMilliseconds = useSelector(state => state.app.config.checkForNewDrawnLinesIntervalInMilliseconds);

    useEffect(() => {
        window.addEventListener('resize', clearAndRedraw);

        return () => {
            window.removeEventListener('resize', clearAndRedraw);
        }
    }, []);

    useEffect(() => {
        if (drawingCanvas.current) {
            const newDrawingTools = new DrawingTools(drawingCanvas.current);
            setDrawingTools(newDrawingTools);

            newDrawingTools.updateCanvasSiteToItsClientSize();
            newDrawingTools.clearCanvas();
            lines.map(line => newDrawingTools.drawLine(line));

            setTimer(setInterval(sendNewlyDrawnLines, updateIntervalInMilliseconds));

            return () => {
                clearInterval(timer);
                setTimer(null);
            };
        }
    }, [drawingCanvas.current]);

    useEffect(() => {
        if (drawingTools) {
            if (drawnLineCount < lines.length) {
                lines.slice(drawnLineCount).map(line => drawingTools.drawLine(line));
                setDrawnLineCount(lines.length);
            } else if (drawnLineCount > lines.length) {
                drawingTools.clearCanvas();
                setDrawnLineCount(0);
            }
        }
    }, [drawingTools, lines.length]);

    // noinspection JSUnusedGlobalSymbols – onContextMenu is actually used.
    return React.createElement('canvas', {
        id: 'drawingCanvas',
        ref: drawingCanvas,
        onContextMenu: event => event.preventDefault(),
        onPointerDown: handleMouseDown,
        onPointerMove: handleMouseMoved,
        onPointerUp: liftPen,
        onPointerCancel: liftPen,
    });

    function sendNewlyDrawnLines() {
        if (newlyDrawnLinesRef.current.length) {
            dispatch(gameActionCreators.createSaveNewLinesRequest(newlyDrawnLinesRef.current));
            setNewlyDrawnLinesWithRef([]);
        }
    }

    function clearAndRedraw() {
        if (drawingTools) {
            drawingTools.updateCanvasSiteToItsClientSize();
            drawingTools.clearCanvas();
            lines.map(line => drawingTools.drawLine(line));
        }
    }

    function handleMouseDown(event) {
        if (isRoundStarted) {
            event.preventDefault();
            setIsPenDown(true);
            setLastX((event.clientX - drawingCanvas.current.getBoundingClientRect().left) / drawingCanvas.current.width);
            setLastY((event.clientY - drawingCanvas.current.getBoundingClientRect().top) / drawingCanvas.current.height);
            // drawingTools.drawDot(lastX, lastY);
        }
    }

    function handleMouseMoved(event) {
        if (isRoundStarted && isPenDown) {
            event.preventDefault();

            const newX = (event.clientX - drawingCanvas.current.getBoundingClientRect().left) / drawingCanvas.current.width;
            const newY = (event.clientY - drawingCanvas.current.getBoundingClientRect().top) / drawingCanvas.current.height;
            const newLine = {x1: lastX, y1: lastY, x2: newX, y2: newY, color: 'black'};

            drawingTools.drawLine(newLine);

            setLastX(newX);
            setLastY(newY);
            setNewlyDrawnLinesWithRef(newlyDrawnLinesRef.current.concat(newLine));
            setDrawnLineCount(a => a + 1);
        }
    }

    function liftPen() {
        setIsPenDown(false);
    }
};